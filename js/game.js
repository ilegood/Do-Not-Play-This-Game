/**
 * DO NOT PLAY THIS GAME — Game Coordinator & Main Loop (Demo v0.5)
 * Coordinates Retro Boot Sequence, Countdown Start, Event-Adaptive Bullet Engine,
 * Fatal Error Death Flow, Rank Calculation, Fullscreen, and Presentation Mode.
 */

class GameManager {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.arenaWidth = this.canvas.width;
    this.arenaHeight = this.canvas.height;

    // Subsystems
    this.player = new Player(this.arenaWidth, this.arenaHeight);
    this.hazards = new HazardManager(this.arenaWidth, this.arenaHeight);
    this.director = new EventDirector(this.arenaWidth, this.arenaHeight);

    // State & Metrics
    this.state = 'BOOT'; // BOOT, TITLE, COUNTDOWN, PLAYING, PAUSED, DYING, GAMEOVER
    this.gameTime = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lastTimestamp = 0;
    this.streakToastTimer = 0;
    this.clearFeedbackTimer = 0;
    this.clearFeedbackDuration = 1.0;
    this.totalRunsCount = 0;

    // Developer Debug Toolkit States (F2)
    this.isInvincible = false;
    this.isDebugRun = false;
    this.debugLogEntries = [];
    this.sequenceQueue = [];
    this.isSequenceRunning = false;
    this.sequenceCurrentIndex = -1;
    this.sequenceGapTimer = 0;
    this.eventFilterCategory = 'ALL';
    this.eventSearchQuery = '';

    // Language Preference from LocalStorage (safely wrapped)
    try {
      const savedLang = localStorage.getItem('dnp_lang');
      if (savedLang === 'ko' || savedLang === 'en') {
        setLanguage(savedLang);
      }
    } catch (e) {}

    // Local Storage Records (safely wrapped)
    try {
      this.bestScore = parseInt(localStorage.getItem('dnp_best_score') || '0', 10);
      this.bestRank = localStorage.getItem('dnp_best_rank') || '-';
      this.bestStreak = parseInt(localStorage.getItem('dnp_best_streak') || localStorage.getItem('dnp_best_combo') || '0', 10);
      this.bestTime = parseFloat(localStorage.getItem('dnp_best_time') || '0');
    } catch (e) {
      this.bestScore = 0;
      this.bestRank = '-';
      this.bestStreak = 0;
      this.bestTime = 0;
    }

    // UI Elements
    this.bootScreen = document.getElementById('boot-screen');
    this.titleScreen = document.getElementById('title-screen');
    this.gameOverScreen = document.getElementById('gameover-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.countdownOverlay = document.getElementById('countdown-overlay');
    this.countdownText = document.getElementById('countdown-text');
    this.countdownSubtext = document.getElementById('countdown-subtext');
    this.fatalErrorDialog = document.getElementById('fatal-error-dialog');
    this.sRankDialog = document.getElementById('s-rank-dialog');
    this.exitDialog = document.getElementById('exit-refusal-dialog');
    this.debugWindow = document.getElementById('debug-window');
    this.windowTitleText = document.getElementById('window-title-text');
    this.mainGameWindow = document.getElementById('main-game-window');
    this.streakMilestoneToast = document.getElementById('combo-milestone-toast');
    this.streakMilestoneText = document.getElementById('combo-milestone-text');

    // Buttons
    this.btnPlay = document.getElementById('btn-play-game');
    this.btnExit = document.getElementById('btn-exit-game');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnResume = document.getElementById('btn-resume');

    // HUD
    this.hudTime = document.getElementById('hud-time');
    this.hudScore = document.getElementById('hud-score');
    this.hudStreakPanel = document.getElementById('hud-streak-panel');
    this.hudHpFill = document.getElementById('hud-hp-fill');
    this.hudHpText = document.getElementById('hud-hp-text');
    this.hudStatusMsg = document.getElementById('hud-status-msg');

    // Game Over Stats
    this.goScoreVal = document.getElementById('go-score-val');
    this.goBestScoreVal = document.getElementById('go-best-score-val');
    this.goTimeVal = document.getElementById('go-time-val');
    this.goEventsVal = document.getElementById('go-events-val');
    this.goMaxStreakVal = document.getElementById('go-max-streak-val');
    this.goRankBadge = document.getElementById('go-rank-badge');
    this.goRankComment = document.getElementById('go-rank-comment');

    this.bootTimers = [];
    this.initEventListeners();
    this.initDesktopModals();
    this.initDebugPanel();
    this.updateLanguageStrings();
    this.startClock();
    this.bindWindowControls();

    // Start Boot Sequence on first launch
    this.runBootSequence();

    // Render loop
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // ==========================================================================
  // 1. RETRO BOOT SEQUENCE (2.5s or Skip)
  // ==========================================================================
  runBootSequence() {
    this.state = 'BOOT';
    const lines = [
      { id: 'boot-l1', text: getLoc('boot', 'line1'), delay: 100 },
      { id: 'boot-l2', text: getLoc('boot', 'line2'), delay: 600 },
      { id: 'boot-l3', text: getLoc('boot', 'line3'), delay: 1200 },
      { id: 'boot-l4', text: getLoc('boot', 'line4'), delay: 1800 },
      { id: 'boot-l5', text: getLoc('boot', 'line5'), delay: 2400 }
    ];

    if (this.bootScreen) {
      this.bootScreen.style.display = 'flex';
      const skipHint = document.getElementById('boot-skip-hint');
      if (skipHint) skipHint.textContent = getLoc('boot', 'skip');
    }

    lines.forEach(item => {
      const t = setTimeout(() => {
        const el = document.getElementById(item.id);
        if (el) {
          el.textContent = item.text;
          if (typeof audio !== 'undefined') audio.playBootChirp();
        }
      }, item.delay);
      this.bootTimers.push(t);
    });

    const endT = setTimeout(() => {
      this.skipBootSequence();
    }, 3100);
    this.bootTimers.push(endT);
  }

  skipBootSequence() {
    if (this.state !== 'BOOT') return;
    this.bootTimers.forEach(t => clearTimeout(t));
    this.bootTimers = [];

    if (this.bootScreen) {
      this.bootScreen.style.opacity = '0';
      this.bootScreen.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        if (this.bootScreen) this.bootScreen.style.display = 'none';
      }, 300);
    }
    this.state = 'TITLE';
  }

  // ==========================================================================
  // 2. INPUT & EVENT LISTENERS
  // ==========================================================================
  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (this.state === 'BOOT') {
        this.skipBootSequence();
        return;
      }
      // Toggle Developer Debug Toolkit with F2, ~, or Ctrl+Shift+D
      if (e.key === 'F2' || e.key === '`' || e.key === '~' || (e.ctrlKey && e.shiftKey && e.key === 'D')) {
        e.preventDefault();
        this.toggleDebugPanel();
        return;
      }
      if (e.key === 'Escape') {
        this.togglePause();
        return;
      }
      if (this.state === 'PLAYING') {
        this.player.handleKeyDown(e.key);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.state === 'PLAYING') {
        this.player.handleKeyUp(e.key);
      }
    });

    if (this.bootScreen) {
      this.bootScreen.addEventListener('click', () => this.skipBootSequence());
    }

    // Window focus / blur safety: immediately clear keys when focus is lost
    window.addEventListener('blur', () => {
      if (this.player) {
        this.player.resetKeys();
      }
    });

    window.addEventListener('focus', () => {
      if (this.player) {
        this.player.resetKeys();
      }
    });

    // Title Play Button
    if (this.btnPlay) {
      this.btnPlay.addEventListener('mouseenter', () => {
        this.btnPlay.textContent = getLoc('title', 'playHover');
      });
      this.btnPlay.addEventListener('mouseleave', () => {
        this.btnPlay.textContent = getLoc('title', 'play');
      });
      this.btnPlay.addEventListener('click', () => {
        audio.playClick();
        if (this.player) this.player.resetKeys();
        this.btnPlay.textContent = getLoc('title', 'playClick');
        setTimeout(() => {
          this.startCountdown();
        }, 360);
      });
    }

    // Title Exit Button
    if (this.btnExit) {
      this.btnExit.addEventListener('click', () => {
        audio.playAlert();
        if (this.player) this.player.resetKeys();
        if (this.exitDialog) this.exitDialog.style.display = 'block';
      });
    }

    // Game Over Replay Button
    if (this.btnReplay) {
      this.btnReplay.addEventListener('mouseenter', () => {
        this.btnReplay.textContent = getLoc('gameover', 'replayHover');
      });
      this.btnReplay.addEventListener('mouseleave', () => {
        this.btnReplay.textContent = getLoc('gameover', 'replay');
      });
      this.btnReplay.addEventListener('click', () => {
        audio.playClick();
        if (this.player) this.player.resetKeys();
        this.startCountdown();
      });
    }

    // Resume button
    if (this.btnResume) {
      this.btnResume.addEventListener('click', () => {
        audio.playClick();
        if (this.player) this.player.resetKeys();
        this.togglePause();
      });
    }

    // Sound toggle in taskbar
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        audio.toggleMute();
      });
    }

    // Fullscreen toggle in taskbar
    const fsBtn = document.getElementById('btn-fullscreen-toggle');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Language buttons
    const langBtnEn = document.getElementById('lang-btn-en');
    const langBtnKo = document.getElementById('lang-btn-ko');
    if (langBtnEn) {
      langBtnEn.addEventListener('click', () => {
        audio.playClick();
        setLanguage('en');
        if (langBtnEn) langBtnEn.classList.add('lang-active');
        if (langBtnKo) langBtnKo.classList.remove('lang-active');
        this.updateLanguageStrings();
      });
    }
    if (langBtnKo) {
      langBtnKo.addEventListener('click', () => {
        audio.playClick();
        setLanguage('ko');
        if (langBtnKo) langBtnKo.classList.add('lang-active');
        if (langBtnEn) langBtnEn.classList.remove('lang-active');
        this.updateLanguageStrings();
      });
    }
  }

  toggleFullscreen() {
    audio.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  showRetroDialog(title, text, icon = 'ℹ️') {
    if (this.player) this.player.resetKeys();
    const infoDialog = document.getElementById('desktop-info-dialog');
    const titleEl = document.getElementById('info-dialog-title');
    const textEl = document.getElementById('info-dialog-text');
    const iconEl = document.getElementById('info-dialog-icon');

    if (infoDialog) {
      if (titleEl) titleEl.textContent = title;
      if (textEl) textEl.innerHTML = text.replace(/\n/g, '<br>');
      if (iconEl) iconEl.textContent = icon;
      infoDialog.style.display = 'block';
    }
    if (typeof audio !== 'undefined') audio.playAlert();
  }

  initDesktopModals() {
    const exitOk = document.getElementById('exit-dialog-ok');
    const exitClose = document.getElementById('exit-dialog-close');
    const closeExit = () => {
      audio.playClick();
      if (this.player) this.player.resetKeys();
      if (this.exitDialog) this.exitDialog.style.display = 'none';
    };
    if (exitOk) exitOk.addEventListener('click', closeExit);
    if (exitClose) exitClose.addEventListener('click', closeExit);

    const infoOk = document.getElementById('info-dialog-ok');
    const infoClose = document.getElementById('info-dialog-close');
    const closeInfo = () => {
      audio.playClick();
      if (this.player) this.player.resetKeys();
      const infoDialog = document.getElementById('desktop-info-dialog');
      if (infoDialog) infoDialog.style.display = 'none';
    };
    if (infoOk) infoOk.addEventListener('click', closeInfo);
    if (infoClose) infoClose.addEventListener('click', closeInfo);

    const fatalOk = document.getElementById('fatal-error-ok');
    if (fatalOk) {
      fatalOk.addEventListener('click', () => {
        audio.playClick();
        if (this.fatalErrorDialog) this.fatalErrorDialog.style.display = 'none';
        this.showResultScreen();
      });
    }

    const sRankOk = document.getElementById('s-rank-ok-btn');
    if (sRankOk) {
      sRankOk.addEventListener('click', () => {
        audio.playClick();
        if (this.player) this.player.resetKeys();
        if (this.sRankDialog) this.sRankDialog.style.display = 'none';
      });
    }

    // Desktop icons (using non-blocking showRetroDialog)
    const iconGame = document.getElementById('icon-game');
    if (iconGame) {
      iconGame.addEventListener('dblclick', () => {
        if (this.player) this.player.resetKeys();
        if (this.state === 'GAMEOVER' || this.state === 'TITLE') this.startCountdown();
      });
      iconGame.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }

    const iconReadme = document.getElementById('icon-readme');
    if (iconReadme) {
      iconReadme.addEventListener('dblclick', () => {
        this.showRetroDialog(
          "DO_NOT_OPEN.TXT",
          "1. Do NOT play this game.<br>2. Continuous bullet-hell survival: Keep dodging bullets!<br>3. When interference events occur, adapt and keep moving.<br>4. Build your combo and survive as long as possible.<br>5. Good luck.",
          "📄"
        );
      });
      iconReadme.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }

    const iconComp = document.getElementById('icon-my-computer');
    if (iconComp) {
      iconComp.addEventListener('dblclick', () => {
        this.showRetroDialog(
          "My Computer",
          "C:\\DO_NOT_PLAY.EXE (640 KB)<br>Memory: 640 KB (Available: 0 KB)<br>Status: Running in background.",
          "🖥️"
        );
      });
      iconComp.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }

    const iconTrash = document.getElementById('icon-recycle-bin');
    if (iconTrash) {
      iconTrash.addEventListener('dblclick', () => {
        this.showRetroDialog(
          "Recycle Bin",
          "Recycle Bin is empty.<br>You cannot delete this game.",
          "🗑️"
        );
      });
      iconTrash.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }
  }

  // ==========================================================================
  // 2B. DEVELOPER DEBUG TOOLKIT (F2 SPECIFICATION)
  // ==========================================================================
  debugLog(msg, type = 'info') {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const entry = { time: timeStr, text: msg, type: type };
    this.debugLogEntries.push(entry);
    if (this.debugLogEntries.length > 30) {
      this.debugLogEntries.shift();
    }
    this.renderDebugLog();
  }

  renderDebugLog() {
    const consoleEl = document.getElementById('dbg-log-console');
    if (!consoleEl) return;
    consoleEl.innerHTML = '';
    this.debugLogEntries.forEach(entry => {
      const div = document.createElement('div');
      div.className = `dbg-log-entry dbg-log-${entry.type}`;
      div.textContent = `[${entry.time}] ${entry.text}`;
      consoleEl.appendChild(div);
    });
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  initDebugPanel() {
    // 1. Close & Dock Controls
    const closeBtn = document.getElementById('debug-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.toggleDebugPanel());

    const dockBtn = document.getElementById('dbg-dock-btn');
    if (dockBtn) {
      dockBtn.addEventListener('click', () => {
        if (this.debugWindow) this.debugWindow.classList.toggle('dock-compact');
      });
    }

    // Dragging Support for Debug Toolkit (Direct Pixel Offset)
    const titlebar = document.getElementById('debug-titlebar');
    if (titlebar && this.debugWindow) {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      titlebar.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        const rect = this.debugWindow.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        this.debugWindow.style.right = 'auto';
        this.debugWindow.style.left = `${rect.left}px`;
        this.debugWindow.style.top = `${rect.top}px`;
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging || !this.debugWindow) return;
        const newLeft = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - offsetX));
        const newTop = Math.max(0, Math.min(window.innerHeight - 30, e.clientY - offsetY));
        this.debugWindow.style.left = `${newLeft}px`;
        this.debugWindow.style.top = `${newTop}px`;
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }

    // Opacity Mode Toggle (100% -> 70% -> 40% -> 100%)
    const opacityBtn = document.getElementById('dbg-opacity-btn');
    if (opacityBtn && this.debugWindow) {
      let opacityStep = 0;
      opacityBtn.addEventListener('click', () => {
        opacityStep = (opacityStep + 1) % 3;
        this.debugWindow.classList.remove('opacity-70', 'opacity-40');
        if (opacityStep === 1) {
          this.debugWindow.classList.add('opacity-70');
          opacityBtn.textContent = '👁️ 70%';
        } else if (opacityStep === 2) {
          this.debugWindow.classList.add('opacity-40');
          opacityBtn.textContent = '👁️ 40%';
        } else {
          opacityBtn.textContent = '👁️ 100%';
        }
      });
    }

    // Minimize Toggle
    const minBtn = document.getElementById('dbg-min-btn');
    if (minBtn && this.debugWindow) {
      minBtn.addEventListener('click', () => {
        this.debugWindow.classList.toggle('is-minimized');
        minBtn.textContent = this.debugWindow.classList.contains('is-minimized') ? '🗖' : '_';
      });
    }

    // 2. Global Actions Bar
    const resetAllBtn = document.getElementById('dbg-reset-all-btn');
    if (resetAllBtn) resetAllBtn.addEventListener('click', () => this.resetAllDebugState());

    const endEventBtn = document.getElementById('dbg-end-event-btn');
    if (endEventBtn) {
      endEventBtn.addEventListener('click', () => {
        this.director.forceEndCurrentEvent();
        this.debugLog("MANUAL: Force ended current event", "warn");
      });
    }

    const pauseToggleBtn = document.getElementById('dbg-pause-toggle-btn');
    if (pauseToggleBtn) pauseToggleBtn.addEventListener('click', () => this.togglePause());

    const healBtn = document.getElementById('dbg-heal-btn');
    if (healBtn) healBtn.addEventListener('click', () => {
      this.player.hp = this.player.maxHp;
      this.updateHUD();
      this.debugLog("PLAYER: Full HP restored (100)", "info");
    });

    const damageBtn = document.getElementById('dbg-damage-btn');
    if (damageBtn) damageBtn.addEventListener('click', () => {
      this.player.takeDamage(20);
      this.updateHUD();
      this.debugLog("PLAYER: Applied 20 damage", "warn");
    });

    const invincibleToggleBtn = document.getElementById('dbg-invincible-toggle-btn');
    if (invincibleToggleBtn) {
      invincibleToggleBtn.addEventListener('click', () => this.toggleInvincibility());
    }

    const presModeBtn = document.getElementById('dbg-pres-mode-btn');
    if (presModeBtn) presModeBtn.addEventListener('click', () => this.resetPresentationMode());

    // 3. Auto Events Toggle
    const autoEventsBtn = document.getElementById('dbg-auto-events-btn');
    if (autoEventsBtn) {
      autoEventsBtn.addEventListener('click', () => this.toggleAutoEvents());
    }

    // 4. Dynamic Event Lab Filters
    const searchInput = document.getElementById('dbg-event-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.eventSearchQuery = e.target.value.toLowerCase().trim();
        this.populateDebugEventList();
      });
    }

    const catFilter = document.getElementById('dbg-category-filter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.eventFilterCategory = e.target.value;
        this.populateDebugEventList();
      });
    }

    // 5. Automated Sequence Runner Buttons
    const runAllBtn = document.getElementById('dbg-run-all-events-btn');
    if (runAllBtn) runAllBtn.addEventListener('click', () => this.startSequenceAll());

    const runVariantsBtn = document.getElementById('dbg-run-all-variants-btn');
    if (runVariantsBtn) runVariantsBtn.addEventListener('click', () => this.startSequenceVariants());

    const stopSeqBtn = document.getElementById('dbg-stop-sequence-btn');
    if (stopSeqBtn) stopSeqBtn.addEventListener('click', () => this.stopSequence());

    // 6. Bullet Testing & Simulation
    const bulletDiffSelect = document.getElementById('dbg-bullet-diff-select');
    if (bulletDiffSelect) {
      bulletDiffSelect.addEventListener('change', (e) => {
        this.hazards.bulletDifficultyOverride = e.target.value === 'AUTO' ? null : e.target.value;
        this.debugLog(`BULLETS: Difficulty set to ${e.target.value}`, "info");
      });
    }

    const bulletPatTestBtn = document.getElementById('dbg-bullet-pat-test-btn');
    const bulletPatSelect = document.getElementById('dbg-bullet-pat-select');
    if (bulletPatTestBtn && bulletPatSelect) {
      bulletPatTestBtn.addEventListener('click', () => {
        if (this.state !== 'PLAYING') this.startCountdown();
        this.hazards.triggerTestPattern(bulletPatSelect.value);
        this.debugLog(`BULLETS: Spawned pattern '${bulletPatSelect.value}'`, "info");
      });
    }

    const clearHazardsBtn = document.getElementById('dbg-clear-hazards-btn');
    if (clearHazardsBtn) {
      clearHazardsBtn.addEventListener('click', () => {
        this.hazards.clearAllHazards();
        this.debugLog("BULLETS: Cleared all hazards from screen", "info");
      });
    }

    // 7. Health Items & Visual Feedback
    const spawnHpBtn = document.getElementById('dbg-spawn-hp-btn');
    if (spawnHpBtn) {
      spawnHpBtn.addEventListener('click', () => {
        if (this.state !== 'PLAYING') this.startCountdown();
        this.hazards.spawnHealthPickup(320, 220, 8.0);
        this.debugLog("HEALTH: Spawned HP_FIX.EXE pickup", "start");
      });
    }

    const clearHpBtn = document.getElementById('dbg-clear-hp-btn');
    if (clearHpBtn) {
      clearHpBtn.addEventListener('click', () => {
        this.hazards.clearAllHealthPickups();
        this.debugLog("HEALTH: Removed all health pickups", "info");
      });
    }

    const testClearEffectBtn = document.getElementById('dbg-test-clear-effect-btn');
    if (testClearEffectBtn) {
      testClearEffectBtn.addEventListener('click', () => {
        this.triggerClearFeedback();
        if (typeof audio !== 'undefined') audio.playClear();
        this.debugLog("FEEDBACK: Tested background CLEAR effect", "info");
      });
    }

    const combo5Btn = document.getElementById('dbg-combo5-btn');
    if (combo5Btn) {
      combo5Btn.addEventListener('click', () => {
        this.streak += 5;
        if (this.streak > this.maxStreak) this.maxStreak = this.streak;
        this.checkStreakMilestone();
        this.updateHUD();
        this.debugLog(`STREAK: Added +5 (now x${this.streak})`, "info");
      });
    }

    // 8. Localization buttons
    const langEnBtn = document.getElementById('dbg-lang-en-btn');
    const langKoBtn = document.getElementById('dbg-lang-ko-btn');
    const testAllTextBtn = document.getElementById('dbg-test-all-text-btn');

    if (langEnBtn) {
      langEnBtn.addEventListener('click', () => {
        setLanguage('en');
        this.updateLanguageStrings();
        this.populateDebugEventList();
        this.debugLog("LOC: Language set to English", "info");
      });
    }

    if (langKoBtn) {
      langKoBtn.addEventListener('click', () => {
        setLanguage('ko');
        this.updateLanguageStrings();
        this.populateDebugEventList();
        this.debugLog("LOC: Language set to Korean", "info");
      });
    }

    if (testAllTextBtn) {
      testAllTextBtn.addEventListener('click', () => this.showTextVerificationModal());
    }

    // 9. Clear Log
    const clearLogBtn = document.getElementById('dbg-clear-log-btn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => {
        this.debugLogEntries = [];
        this.renderDebugLog();
      });
    }

    // Initial dynamic event list generation
    this.populateDebugEventList();
  }

  populateDebugEventList() {
    const tbody = document.getElementById('dbg-event-tbody');
    if (!tbody || !this.director.eventRegistry) return;

    tbody.innerHTML = '';
    const diffSelect = document.getElementById('dbg-event-diff-select');

    const catMap = {
      'ATTACK': currentLanguage === 'ko' ? '공격' : 'ATTACK',
      'VISION': currentLanguage === 'ko' ? '시야' : 'VISION',
      'INPUT': currentLanguage === 'ko' ? '조작' : 'INPUT',
      'SPACE': currentLanguage === 'ko' ? '공간' : 'SPACE',
      'WINDOW': currentLanguage === 'ko' ? '창' : 'WINDOW',
      'VISUAL': currentLanguage === 'ko' ? '시각' : 'VISUAL',
      'UI': currentLanguage === 'ko' ? 'UI' : 'UI'
    };

    const statusMap = {
      'READY': currentLanguage === 'ko' ? '대기' : 'READY',
      'ACTIVE': currentLanguage === 'ko' ? '실행 중' : 'ACTIVE',
      'ENDING': currentLanguage === 'ko' ? '종료 중' : 'ENDING',
      'ERROR': currentLanguage === 'ko' ? '오류' : 'ERROR'
    };

    this.director.eventRegistry.forEach((EC) => {
      const tempInst = new EC();
      const localizedName = getLoc('events', tempInst.id, 'name') || tempInst.name;
      const category = tempInst.category || 'SYSTEM';
      const localizedCat = catMap[category] || category;
      const id = tempInst.id;

      // Filter check
      if (this.eventFilterCategory !== 'ALL' && category !== this.eventFilterCategory) {
        return;
      }
      if (this.eventSearchQuery && !localizedName.toLowerCase().includes(this.eventSearchQuery) && !id.toLowerCase().includes(this.eventSearchQuery)) {
        return;
      }

      const tr = document.createElement('tr');
      tr.id = `dbg-row-${id}`;

      // Status check
      let rawStatus = 'READY';
      let badgeClass = 'badge-ready';
      if (this.director.activeEvent && this.director.activeEvent.id === id) {
        rawStatus = this.director.activeEvent.hasError ? 'ERROR' : (this.director.activeEvent.isCompleted ? 'ENDING' : 'ACTIVE');
        badgeClass = this.director.activeEvent.hasError ? 'badge-error' : (this.director.activeEvent.isCompleted ? 'badge-ending' : 'badge-active');
        tr.className = this.director.activeEvent.hasError ? 'row-error' : 'row-active';
      }

      const displayStatus = statusMap[rawStatus] || rawStatus;
      const btnActionText = getLoc('debug', 'btnTest') || 'TEST';
      const catBadgeClass = `badge-cat-${category.toLowerCase()}`;

      tr.innerHTML = `
        <td><strong>${localizedName}</strong></td>
        <td><span class="dbg-cat-badge ${catBadgeClass}">${localizedCat}</span></td>
        <td><span class="dbg-status-badge ${badgeClass}" id="dbg-status-${id}">${displayStatus}</span></td>
        <td><button class="win98-btn btn-xs" id="dbg-test-btn-${id}">${btnActionText}</button></td>
      `;

      const testBtn = tr.querySelector(`#dbg-test-btn-${id}`);
      if (testBtn) {
        testBtn.addEventListener('click', () => {
          const diff = diffSelect ? diffSelect.value : 'NORMAL';
          this.isDebugRun = true;
          if (this.state !== 'PLAYING') this.startCountdown();
          this.director.triggerManualEvent(id, diff, this.player, this.hazards);
          this.populateDebugEventList();
        });
      }

      tbody.appendChild(tr);
    });
  }

  toggleInvincibility() {
    this.isInvincible = !this.isInvincible;
    this.isDebugRun = true;
    const btn = document.getElementById('dbg-invincible-toggle-btn');
    if (btn) {
      btn.textContent = this.isInvincible ? '🛡️ INVINCIBLE: ON' : '🛡️ INVINCIBLE: OFF';
      btn.style.color = this.isInvincible ? '#008800' : '#666';
      btn.style.fontWeight = this.isInvincible ? 'bold' : 'normal';
    }
    this.debugLog(`INVINCIBILITY: ${this.isInvincible ? 'ENABLED (Damage prevented)' : 'DISABLED'}`, this.isInvincible ? 'start' : 'info');
  }

  toggleAutoEvents() {
    this.director.autoEventsEnabled = !this.director.autoEventsEnabled;
    const btn = document.getElementById('dbg-auto-events-btn');
    if (btn) {
      btn.textContent = this.director.autoEventsEnabled ? 'AUTO EVENTS: ON' : 'AUTO EVENTS: OFF';
      btn.style.color = this.director.autoEventsEnabled ? '#008800' : '#cc0000';
    }
    this.debugLog(`AUTO EVENTS: ${this.director.autoEventsEnabled ? 'ON' : 'PAUSED'}`, "info");
  }

  resetAllDebugState() {
    if (this.countdownTimers) {
      this.countdownTimers.forEach(t => clearTimeout(t));
      this.countdownTimers = [];
    }
    this.director.reset();
    this.player.reset();
    this.hazards.reset();
    this.clearFeedbackTimer = 0;
    this.stopSequence();
    this.isInvincible = false;
    this.hazards.bulletDifficultyOverride = null;

    const bulletDiffSelect = document.getElementById('dbg-bullet-diff-select');
    if (bulletDiffSelect) bulletDiffSelect.value = 'AUTO';

    const invBtn = document.getElementById('dbg-invincible-toggle-btn');
    if (invBtn) {
      invBtn.textContent = '🛡️ INVINCIBLE: OFF';
      invBtn.style.color = '#666';
      invBtn.style.fontWeight = 'normal';
    }

    this.populateDebugEventList();
    this.debugLog("RESET ALL: Gameplay test environment cleanly restored", "warn");
  }

  // Automated Sequence Runner
  startSequenceAll() {
    const diffSelect = document.getElementById('dbg-event-diff-select');
    const diff = diffSelect ? diffSelect.value : 'NORMAL';

    this.sequenceQueue = this.director.eventRegistry.map(EC => {
      const inst = new EC();
      return { eventId: inst.id, name: inst.name, diff: diff, status: 'waiting' };
    });

    this.isSequenceRunning = true;
    this.sequenceCurrentIndex = -1;
    this.sequenceGapTimer = 0;
    this.isDebugRun = true;

    if (this.state !== 'PLAYING') this.startCountdown();
    this.renderSequenceQueue();
    this.debugLog(`SEQUENCE: Started testing all ${this.sequenceQueue.length} events [${diff}]`, "start");
  }

  startSequenceVariants() {
    const variants = ['EASY', 'NORMAL', 'HARD'];
    this.sequenceQueue = [];

    this.director.eventRegistry.forEach(EC => {
      const inst = new EC();
      variants.forEach(diff => {
        this.sequenceQueue.push({ eventId: inst.id, name: `${inst.name} (${diff})`, diff: diff, status: 'waiting' });
      });
    });

    this.isSequenceRunning = true;
    this.sequenceCurrentIndex = -1;
    this.sequenceGapTimer = 0;
    this.isDebugRun = true;

    if (this.state !== 'PLAYING') this.startCountdown();
    this.renderSequenceQueue();
    this.debugLog(`SEQUENCE: Started variant testing (${this.sequenceQueue.length} total)`, "start");
  }

  stopSequence() {
    this.isSequenceRunning = false;
    this.sequenceQueue = [];
    this.sequenceCurrentIndex = -1;
    const queueEl = document.getElementById('dbg-sequence-queue');
    if (queueEl) queueEl.innerHTML = '<span style="color: #888;">Sequence idle. Click [RUN ALL EVENTS] or [TEST ALL VARIANTS] to execute.</span>';
    this.debugLog("SEQUENCE: Stopped", "warn");
  }

  updateSequenceRunner(dt) {
    if (!this.isSequenceRunning) return;

    // If an event is currently active, wait for it to complete
    if (this.director.activeEvent) return;

    if (this.sequenceGapTimer > 0) {
      this.sequenceGapTimer -= dt;
      return;
    }

    // Advance to next item
    this.sequenceCurrentIndex++;
    if (this.sequenceCurrentIndex < this.sequenceQueue.length) {
      if (this.sequenceCurrentIndex > 0) {
        this.sequenceQueue[this.sequenceCurrentIndex - 1].status = 'done';
      }
      const current = this.sequenceQueue[this.sequenceCurrentIndex];
      current.status = 'running';
      this.renderSequenceQueue();

      const ok = this.director.triggerManualEvent(current.eventId, current.diff, this.player, this.hazards);
      if (!ok) {
        current.status = 'error';
      }
      this.sequenceGapTimer = 2.0; // 2.0s test recovery gap per specification
      this.populateDebugEventList();
    } else {
      // Sequence completed
      if (this.sequenceCurrentIndex > 0 && this.sequenceQueue[this.sequenceCurrentIndex - 1]) {
        this.sequenceQueue[this.sequenceCurrentIndex - 1].status = 'done';
      }
      this.isSequenceRunning = false;
      this.renderSequenceQueue();
      this.debugLog("SEQUENCE: All queue items executed successfully!", "end");
    }
  }

  renderSequenceQueue() {
    const queueEl = document.getElementById('dbg-sequence-queue');
    if (!queueEl) return;

    if (this.sequenceQueue.length === 0) {
      queueEl.innerHTML = '<span style="color: #888;">Sequence idle.</span>';
      return;
    }

    const lines = this.sequenceQueue.map(item => {
      let icon = '○';
      if (item.status === 'done') icon = '✓';
      else if (item.status === 'running') icon = '▶';
      else if (item.status === 'error') icon = '✕';
      return `${icon} ${item.name}`;
    });

    queueEl.textContent = lines.join('\n');
    const runningIdx = this.sequenceQueue.findIndex(q => q.status === 'running');
    if (runningIdx >= 0) {
      queueEl.scrollTop = runningIdx * 14;
    }
  }

  showTextVerificationModal() {
    const sampleText = `
[LANGUAGE: ${currentLanguage.toUpperCase()}]
Title Main: ${getLoc('title', 'main')}
Title Sub: ${getLoc('title', 'sub')}
HUD Playing: ${getLoc('hud', 'playing')}
HUD Normal: ${getLoc('hud', 'normalPeriod')}
HUD Restored: ${getLoc('hud', 'hpRestored')}
Countdown 3-2-1: ${getLoc('countdown', 'three')}, ${getLoc('countdown', 'two')}, ${getLoc('countdown', 'one')}, ${getLoc('countdown', 'survive')}
Fatal Msg: ${getLoc('gameover', 'fatalMsg')}
Rank S Comment: ${getLoc('ranks', 'S')}
    `.trim();

    this.showRetroDialog("LOCALIZATION VERIFICATION", sampleText.replace(/\n/g, '<br>'), "🌐");
  }

  updateDebugToolkit() {
    if (!this.debugWindow || this.debugWindow.style.display === 'none') return;

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    const stateMap = {
      'NORMAL_BULLETS': isKo ? '일반 탄막 구간' : 'NORMAL_BULLETS',
      'EVENT_WARNING': isKo ? '이벤트 경고 중' : 'EVENT_WARNING',
      'EVENT_ACTIVE': isKo ? '이벤트 진행 중' : 'EVENT_ACTIVE',
      'EVENT_CLEAR': isKo ? '이벤트 돌파 완료' : 'EVENT_CLEAR'
    };

    const diffMap = {
      'EASY': isKo ? '쉬움' : 'EASY',
      'NORMAL': isKo ? '보통' : 'NORMAL',
      'HARD': isKo ? '어려움' : 'HARD'
    };

    const statusMap = {
      'READY': isKo ? '대기' : 'READY',
      'ACTIVE': isKo ? '실행 중' : 'ACTIVE',
      'ENDING': isKo ? '종료 중' : 'ENDING',
      'ERROR': isKo ? '오류' : 'ERROR',
      'INACTIVE': isKo ? '없음' : 'INACTIVE'
    };

    // Director Status
    const dState = document.getElementById('dbg-director-state');
    const dNext = document.getElementById('dbg-director-next');
    const dSurvived = document.getElementById('dbg-director-survived');

    if (dState) dState.textContent = stateMap[this.director.state] || this.director.state;
    if (dNext) dNext.textContent = `${Math.max(0, this.director.stateTimer).toFixed(1)}s`;
    if (dSurvived) dSurvived.textContent = `${this.director.survivedEventsCount}`;

    // Active Event Status
    const info = this.director.getCurrentEventInfo();
    const eName = document.getElementById('dbg-active-event-name');
    const eTime = document.getElementById('dbg-active-event-time');
    const eDiff = document.getElementById('dbg-active-event-diff');

    if (eName) {
      if (info.hasActive) {
        const localizedActiveName = getLoc('events', info.id, 'name') || info.name;
        eName.textContent = localizedActiveName;
      } else {
        eName.textContent = isKo ? '없음' : 'None';
      }
    }
    if (eTime) eTime.textContent = `${info.elapsed} / ${info.duration}`;
    if (eDiff) eDiff.textContent = diffMap[info.difficulty] || info.difficulty;

    // Table rows active status
    if (this.director.lastEventId) {
      const badge = document.getElementById(`dbg-status-${this.director.lastEventId}`);
      if (badge) {
        badge.textContent = statusMap[info.status] || info.status;
        badge.className = `dbg-status-badge ${info.status === 'ACTIVE' ? 'badge-active' : (info.status === 'ENDING' ? 'badge-ending' : (info.status === 'ERROR' ? 'badge-error' : 'badge-ready'))}`;
      }
    }
  }

  toggleDebugPanel() {
    if (!this.debugWindow) return;
    const isHidden = this.debugWindow.style.display === 'none' || !this.debugWindow.style.display;
    this.debugWindow.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      this.populateDebugEventList();
      this.renderDebugLog();
    }
  }

  resetPresentationMode() {
    if (this.countdownTimers) {
      this.countdownTimers.forEach(t => clearTimeout(t));
      this.countdownTimers = [];
    }
    this.director.runCount = 0;
    this.totalRunsCount = 0;
    this.player.reset();
    this.hazards.reset();
    this.director.reset();
    this.state = 'TITLE';

    if (this.titleScreen) this.titleScreen.style.display = 'flex';
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
    if (this.pauseScreen) this.pauseScreen.style.display = 'none';
    if (this.fatalErrorDialog) this.fatalErrorDialog.style.display = 'none';
    if (this.countdownOverlay) this.countdownOverlay.style.display = 'none';
    if (this.sRankDialog) this.sRankDialog.style.display = 'none';
    if (this.exitDialog) this.exitDialog.style.display = 'none';
    if (this.debugWindow) this.debugWindow.style.display = 'none';

    audio.muted = false;
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) soundBtn.textContent = '🔊';

    this.showRetroDialog("DEMO READY", "Reset to fresh spectator state.<br>First run curation active.", "🎪");
  }

  bindWindowControls() {
    const btnClose = document.getElementById('btn-close');
    const btnMin = document.getElementById('btn-minimize');
    const btnMax = document.getElementById('btn-maximize');
    const windowEl = document.getElementById('main-game-window');

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        const isKo = currentLanguage === 'ko';
        this.showRetroDialog(
          isKo ? "접근 거부" : "ACCESS DENIED",
          isKo ? "탄막 프로세스가 활성화된 상태에서는 프로그램을 종료할 수 없습니다." : "You cannot close this program while bullets are active.",
          "🛑"
        );
      });
    }

    if (btnMin && windowEl) {
      btnMin.addEventListener('click', () => {
        audio.playClick();
        windowEl.style.transform = 'translate(-50%, 80vh) scale(0.1)';
        windowEl.style.opacity = '0';
        setTimeout(() => {
          windowEl.style.transform = 'translate(-50%, calc(-50% - 14px)) scale(1)';
          windowEl.style.opacity = '1';
        }, 1000);
      });
    }

    if (btnMax) {
      btnMax.addEventListener('click', () => audio.playClick());
    }
  }

  startClock() {
    const clockEl = document.getElementById('tray-clock');
    const updateTime = () => {
      if (this.gameTime >= 90 && Math.random() < 0.25) {
        if (clockEl) clockEl.textContent = '99:99 ??';
        return;
      }

      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      if (clockEl) {
        clockEl.textContent = `${hours}:${minutes} ${ampm}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  updateLanguageStrings() {
    this.updateTitleRecordsDisplay();

    // Title Screen Text & Subtitle
    const titleSub = document.querySelector('.game-subtitle');
    if (titleSub) titleSub.innerHTML = getLoc('title', 'sub').replace(/\n/g, '<br>');

    const titleInst = document.getElementById('title-instruction-text');
    if (titleInst) titleInst.textContent = `${getLoc('title', 'instructions')} | ESC to Pause`;

    const titleLangLbl = document.getElementById('title-lang-label');
    if (titleLangLbl) titleLangLbl.textContent = getLoc('title', 'langLabel');

    if (this.btnPlay) this.btnPlay.textContent = getLoc('title', 'play');
    if (this.btnExit) this.btnExit.textContent = getLoc('title', 'exit');
    if (this.btnReplay) this.btnReplay.textContent = getLoc('gameover', 'replay');

    // Game Over Labels
    const goDied = document.getElementById('go-text-died');
    if (goDied) goDied.textContent = getLoc('gameover', 'died');

    const goTold = document.getElementById('go-text-told');
    if (goTold) goTold.textContent = getLoc('gameover', 'toldYou');

    const goLblScore = document.getElementById('go-lbl-score');
    if (goLblScore) goLblScore.textContent = getLoc('gameover', 'score');

    const goLblBest = document.getElementById('go-lbl-best');
    if (goLblBest) goLblBest.textContent = getLoc('gameover', 'bestScore');

    const goLblTime = document.getElementById('go-lbl-time');
    if (goLblTime) goLblTime.textContent = getLoc('gameover', 'time');

    const goLblSurvived = document.getElementById('go-lbl-survived');
    if (goLblSurvived) goLblSurvived.textContent = getLoc('gameover', 'eventsSurvived');

    const goLblStreak = document.getElementById('go-lbl-streak');
    if (goLblStreak) goLblStreak.textContent = getLoc('gameover', 'bestStreak');

    const goLblRank = document.getElementById('go-lbl-rank');
    if (goLblRank) goLblRank.textContent = getLoc('gameover', 'rank');

    // Title Language Active Buttons
    const langBtnEn = document.getElementById('lang-btn-en');
    const langBtnKo = document.getElementById('lang-btn-ko');
    if (currentLanguage === 'ko') {
      if (langBtnKo) langBtnKo.classList.add('lang-active');
      if (langBtnEn) langBtnEn.classList.remove('lang-active');
    } else {
      if (langBtnEn) langBtnEn.classList.add('lang-active');
      if (langBtnKo) langBtnKo.classList.remove('lang-active');
    }

    if (this.windowTitleText && (this.state === 'BOOT' || this.state === 'TITLE')) {
      this.windowTitleText.textContent = getLoc('titleBarStates', 'normal');
    }

    // Debug Window Localized Elements
    const dbgTitle = document.getElementById('dbg-lbl-title');
    if (dbgTitle) dbgTitle.textContent = getLoc('debug', 'title');

    const dbgResetAll = document.getElementById('dbg-reset-all-btn');
    if (dbgResetAll) dbgResetAll.textContent = getLoc('debug', 'resetAll');

    const dbgEndEvent = document.getElementById('dbg-end-event-btn');
    if (dbgEndEvent) dbgEndEvent.textContent = getLoc('debug', 'endEvent');

    const dbgPause = document.getElementById('dbg-pause-toggle-btn');
    if (dbgPause) dbgPause.textContent = this.state === 'PAUSED' ? getLoc('debug', 'resume') : getLoc('debug', 'pause');

    const dbgHeal = document.getElementById('dbg-heal-btn');
    if (dbgHeal) dbgHeal.textContent = getLoc('debug', 'heal');

    const dbgDamage = document.getElementById('dbg-damage-btn');
    if (dbgDamage) dbgDamage.textContent = getLoc('debug', 'damage');

    const dbgInvincible = document.getElementById('dbg-invincible-toggle-btn');
    if (dbgInvincible) dbgInvincible.textContent = this.isInvincible ? getLoc('debug', 'invincibleOn') : getLoc('debug', 'invincibleOff');

    const dbgPresMode = document.getElementById('dbg-pres-mode-btn');
    if (dbgPresMode) dbgPresMode.textContent = getLoc('debug', 'demoReset');

    const dbgHdrDirector = document.getElementById('dbg-hdr-director');
    if (dbgHdrDirector) dbgHdrDirector.textContent = getLoc('debug', 'headerDirector');

    const dbgAutoEvents = document.getElementById('dbg-auto-events-btn');
    if (dbgAutoEvents) dbgAutoEvents.textContent = this.director.autoEventsEnabled ? getLoc('debug', 'autoEventsOn') : getLoc('debug', 'autoEventsOff');

    const dbgLblDir = document.getElementById('dbg-lbl-director');
    if (dbgLblDir) dbgLblDir.textContent = getLoc('debug', 'lblDirector');

    const dbgLblNext = document.getElementById('dbg-lbl-next');
    if (dbgLblNext) dbgLblNext.textContent = getLoc('debug', 'lblNext');

    const dbgLblActive = document.getElementById('dbg-lbl-active');
    if (dbgLblActive) dbgLblActive.textContent = getLoc('debug', 'lblActive');

    const dbgLblTime = document.getElementById('dbg-lbl-time');
    if (dbgLblTime) dbgLblTime.textContent = getLoc('debug', 'lblTime');

    const dbgLblDiff = document.getElementById('dbg-lbl-diff');
    if (dbgLblDiff) dbgLblDiff.textContent = getLoc('debug', 'lblDiff');

    const dbgLblSurv = document.getElementById('dbg-lbl-survived');
    if (dbgLblSurv) dbgLblSurv.textContent = getLoc('debug', 'lblSurvived');

    const dbgHdrLab = document.getElementById('dbg-hdr-lab');
    if (dbgHdrLab) dbgHdrLab.textContent = getLoc('debug', 'headerLab');

    const dbgSearch = document.getElementById('dbg-event-search');
    if (dbgSearch) dbgSearch.placeholder = getLoc('debug', 'searchPlaceholder');

    const dbgThName = document.getElementById('dbg-th-name');
    if (dbgThName) dbgThName.textContent = getLoc('debug', 'thName');

    const dbgThCat = document.getElementById('dbg-th-cat');
    if (dbgThCat) dbgThCat.textContent = getLoc('debug', 'thCategory');

    const dbgThStatus = document.getElementById('dbg-th-status');
    if (dbgThStatus) dbgThStatus.textContent = getLoc('debug', 'thStatus');

    const dbgThAction = document.getElementById('dbg-th-action');
    if (dbgThAction) dbgThAction.textContent = getLoc('debug', 'thAction');

    const dbgHdrSeq = document.getElementById('dbg-hdr-seq');
    if (dbgHdrSeq) dbgHdrSeq.textContent = getLoc('debug', 'headerSequence');

    const dbgRunAll = document.getElementById('dbg-run-all-events-btn');
    if (dbgRunAll) dbgRunAll.textContent = getLoc('debug', 'btnRunAll');

    const dbgRunVariants = document.getElementById('dbg-run-all-variants-btn');
    if (dbgRunVariants) dbgRunVariants.textContent = getLoc('debug', 'btnRunVariants');

    const dbgStopSeq = document.getElementById('dbg-stop-sequence-btn');
    if (dbgStopSeq) dbgStopSeq.textContent = getLoc('debug', 'btnStop');

    const dbgSeqIdle = document.getElementById('dbg-seq-idle');
    if (dbgSeqIdle) dbgSeqIdle.textContent = getLoc('debug', 'seqIdle');

    const dbgHdrBullet = document.getElementById('dbg-hdr-bullet');
    if (dbgHdrBullet) dbgHdrBullet.textContent = getLoc('debug', 'headerBullet');

    const dbgLblBulletSpawn = document.getElementById('dbg-lbl-bullet-spawn');
    if (dbgLblBulletSpawn) dbgLblBulletSpawn.textContent = getLoc('debug', 'lblBulletSpawning');

    const dbgLblBulletPat = document.getElementById('dbg-lbl-bullet-pat');
    if (dbgLblBulletPat) dbgLblBulletPat.textContent = getLoc('debug', 'lblPattern');

    const dbgBtnPatTest = document.getElementById('dbg-bullet-pat-test-btn');
    if (dbgBtnPatTest) dbgBtnPatTest.textContent = getLoc('debug', 'btnTestPattern');

    const dbgBtnClearHaz = document.getElementById('dbg-clear-hazards-btn');
    if (dbgBtnClearHaz) dbgBtnClearHaz.textContent = getLoc('debug', 'btnClearBullets');

    const dbgHdrHealth = document.getElementById('dbg-hdr-health');
    if (dbgHdrHealth) dbgHdrHealth.textContent = getLoc('debug', 'headerHealth');

    const dbgLblDropRate = document.getElementById('dbg-lbl-drop-rate');
    if (dbgLblDropRate) dbgLblDropRate.textContent = getLoc('debug', 'lblDropRate');

    const dbgSpawnHp = document.getElementById('dbg-spawn-hp-btn');
    if (dbgSpawnHp) dbgSpawnHp.textContent = getLoc('debug', 'btnSpawnHp');

    const dbgClearHp = document.getElementById('dbg-clear-hp-btn');
    if (dbgClearHp) dbgClearHp.textContent = getLoc('debug', 'btnClearHp');

    const dbgTestClear = document.getElementById('dbg-test-clear-effect-btn');
    if (dbgTestClear) dbgTestClear.textContent = getLoc('debug', 'btnTestClear');

    const dbgCombo5 = document.getElementById('dbg-combo5-btn');
    if (dbgCombo5) dbgCombo5.textContent = getLoc('debug', 'btnStreak5');

    const dbgHdrLoc = document.getElementById('dbg-hdr-loc');
    if (dbgHdrLoc) dbgHdrLoc.textContent = getLoc('debug', 'headerLoc');

    const dbgTestAllText = document.getElementById('dbg-test-all-text-btn');
    if (dbgTestAllText) dbgTestAllText.textContent = getLoc('debug', 'btnTestAllText');

    const dbgHdrLog = document.getElementById('dbg-hdr-log');
    if (dbgHdrLog) dbgHdrLog.textContent = getLoc('debug', 'headerLog');

    const dbgClearLog = document.getElementById('dbg-clear-log-btn');
    if (dbgClearLog) dbgClearLog.textContent = getLoc('debug', 'btnClearLog');

    // Select Dropdown Translations
    const catSelect = document.getElementById('dbg-category-filter');
    if (catSelect) {
      const isKo = currentLanguage === 'ko';
      if (catSelect.options[0]) catSelect.options[0].text = isKo ? '전체 카테고리' : 'ALL';
      if (catSelect.options[1]) catSelect.options[1].text = isKo ? '직접 공격' : 'ATTACK';
      if (catSelect.options[2]) catSelect.options[2].text = isKo ? '시야 방해' : 'VISION';
      if (catSelect.options[3]) catSelect.options[3].text = isKo ? '조작 교란' : 'INPUT';
      if (catSelect.options[4]) catSelect.options[4].text = isKo ? '공간 압박' : 'SPACE';
      if (catSelect.options[5]) catSelect.options[5].text = isKo ? '창 왜곡' : 'WINDOW';
      if (catSelect.options[6]) catSelect.options[6].text = isKo ? '시각 글리치' : 'VISUAL';
    }

    const bulletDiffSelect = document.getElementById('dbg-bullet-diff-select');
    if (bulletDiffSelect) {
      const isKo = currentLanguage === 'ko';
      if (bulletDiffSelect.options[0]) bulletDiffSelect.options[0].text = isKo ? '자동 (시간 비례)' : 'AUTO (Time-based)';
      if (bulletDiffSelect.options[1]) bulletDiffSelect.options[1].text = isKo ? '끄기 (탄막 없음)' : 'OFF (No Bullets)';
      if (bulletDiffSelect.options[2]) bulletDiffSelect.options[2].text = isKo ? '쉬움 (낮음)' : 'EASY (Low)';
      if (bulletDiffSelect.options[3]) bulletDiffSelect.options[3].text = isKo ? '보통 (중간)' : 'NORMAL (Med)';
      if (bulletDiffSelect.options[4]) bulletDiffSelect.options[4].text = isKo ? '어려움 (높음)' : 'HARD (High)';
      if (bulletDiffSelect.options[5]) bulletDiffSelect.options[5].text = isKo ? '혼돈 (최대)' : 'CHAOS (Max)';
    }

    const bulletPatSelect = document.getElementById('dbg-bullet-pat-select');
    if (bulletPatSelect) {
      const isKo = currentLanguage === 'ko';
      if (bulletPatSelect.options[0]) bulletPatSelect.options[0].text = isKo ? '기본 스트림' : 'Basic Stream';
      if (bulletPatSelect.options[1]) bulletPatSelect.options[1].text = isKo ? '부채꼴 확산탄' : 'Fan Shot';
      if (bulletPatSelect.options[2]) bulletPatSelect.options[2].text = isKo ? '측면 압박탄' : 'Side Pressure';
      if (bulletPatSelect.options[3]) bulletPatSelect.options[3].text = isKo ? '낙하하는 파일' : 'Falling Files';
      if (bulletPatSelect.options[4]) bulletPatSelect.options[4].text = isKo ? '경고 레이저' : 'Warning Laser';
      if (bulletPatSelect.options[5]) bulletPatSelect.options[5].text = isKo ? '바운딩 오류창' : 'Bouncing Error';
    }

    // Event Diff Select Dropdown
    const eventDiffSelect = document.getElementById('dbg-event-diff-select');
    if (eventDiffSelect) {
      const isKo = currentLanguage === 'ko';
      if (eventDiffSelect.options[0]) eventDiffSelect.options[0].text = isKo ? '쉬움 (EASY)' : 'EASY';
      if (eventDiffSelect.options[1]) eventDiffSelect.options[1].text = isKo ? '보통 (NORMAL)' : 'NORMAL';
      if (eventDiffSelect.options[2]) eventDiffSelect.options[2].text = isKo ? '어려움 (HARD)' : 'HARD';
    }

    // Window Menubar Items
    const menuFile = document.getElementById('menu-file');
    if (menuFile) menuFile.innerHTML = currentLanguage === 'ko' ? '파일(<u>F</u>)' : '<u>F</u>ile';

    const menuOptions = document.getElementById('menu-options');
    if (menuOptions) menuOptions.innerHTML = currentLanguage === 'ko' ? '옵션(<u>O</u>)' : '<u>O</u>ptions';

    const menuHelp = document.getElementById('menu-help');
    if (menuHelp) menuHelp.innerHTML = currentLanguage === 'ko' ? '도움말(<u>H</u>)' : '<u>H</u>elp';

    // Boot Skip Hint
    const bootSkip = document.getElementById('boot-skip-hint');
    if (bootSkip) bootSkip.textContent = getLoc('boot', 'skip');

    // Countdown Subtext
    const countSub = document.getElementById('countdown-subtext');
    if (countSub) countSub.textContent = currentLanguage === 'ko' ? 'WASD: 이동' : 'WASD: MOVE';

    // Desktop Icons & Taskbar
    const iconTrash = document.getElementById('icon-label-trash');
    if (iconTrash) iconTrash.textContent = getLoc('desktop', 'recycleBin');

    const iconComp = document.getElementById('icon-label-comp');
    if (iconComp) iconComp.textContent = getLoc('desktop', 'myComputer');

    const btnStartText = document.getElementById('btn-start-text');
    if (btnStartText) btnStartText.textContent = getLoc('desktop', 'startBtn');

    // Pause Screen
    const pauseTitle = document.getElementById('pause-title');
    if (pauseTitle) pauseTitle.textContent = getLoc('pause', 'title');

    const pauseHeading = document.getElementById('pause-heading');
    if (pauseHeading) pauseHeading.textContent = getLoc('pause', 'heading');

    const pauseDesc = document.getElementById('pause-desc');
    if (pauseDesc) pauseDesc.innerHTML = getLoc('pause', 'desc');

    const btnResume = document.getElementById('btn-resume');
    if (btnResume) btnResume.textContent = getLoc('pause', 'resumeBtn');

    // Exit Dialog
    const exitTitle = document.getElementById('exit-dialog-title');
    if (exitTitle) exitTitle.textContent = getLoc('dialogs', 'exitTitle');

    const exitBold = document.getElementById('exit-dialog-bold');
    if (exitBold) exitBold.textContent = getLoc('dialogs', 'exitHead');

    const exitDesc = document.getElementById('exit-dialog-desc');
    if (exitDesc) exitDesc.textContent = getLoc('dialogs', 'exitBody');

    // S-Rank Victory Dialog
    const sRankTitle = document.getElementById('s-rank-title');
    if (sRankTitle) sRankTitle.textContent = `🏆 ${getLoc('sRankModal', 'title')}!`;

    const sRankBold = document.getElementById('s-rank-bold');
    if (sRankBold) sRankBold.textContent = getLoc('sRankModal', 'title');

    const sRankDesc = document.getElementById('s-rank-desc');
    if (sRankDesc) sRankDesc.innerHTML = getLoc('sRankModal', 'msg').replace(/\n/g, '<br>');

    const sRankBtn = document.getElementById('s-rank-ok-btn');
    if (sRankBtn) sRankBtn.textContent = getLoc('sRankModal', 'btn');

    // Fatal Error Dialog
    const fatalTitle = document.getElementById('fatal-dialog-title');
    if (fatalTitle) fatalTitle.textContent = `💥 ${getLoc('gameover', 'fatalTitle')}`;

    const fatalBold = document.getElementById('fatal-dialog-bold');
    if (fatalBold) fatalBold.textContent = getLoc('gameover', 'fatalTitle');

    const fatalDesc = document.getElementById('fatal-dialog-desc');
    if (fatalDesc) fatalDesc.textContent = getLoc('gameover', 'fatalMsg');

    // Event Overlays Static Text
    const updateTitle = document.getElementById('update-dialog-title');
    if (updateTitle) updateTitle.textContent = currentLanguage === 'ko' ? '⚙️ Windows 시스템 업데이트' : '⚙️ Windows System Update';

    const updateSubnote = document.getElementById('update-subnote');
    if (updateSubnote) updateSubnote.textContent = currentLanguage === 'ko' ? '컴퓨터를 끄지 마십시오' : 'Please do not turn off your computer';

    const noSignalTag = document.getElementById('no-signal-tag');
    if (noSignalTag) noSignalTag.textContent = currentLanguage === 'ko' ? '신호 없음 [채널 03]' : 'NO SIGNAL [CHANNEL 03]';

    const titleDropText = document.getElementById('title-drop-text');
    if (titleDropText) titleDropText.textContent = currentLanguage === 'ko' ? '제목_표시줄_분리됨.EXE' : 'TITLE_BAR_DETACHED.EXE';

    const taskbarRiseText = document.getElementById('taskbar-rise-text');
    if (taskbarRiseText) taskbarRiseText.textContent = currentLanguage === 'ko' ? '⚠️ 작업 표시줄 오버플로 오류' : '⚠️ TASKBAR OVERFLOW ERROR';

    // Active Warning / Instruction Banner if currently showing
    if (this.director && this.director.activeEvent) {
      const locInst = getLoc('events', this.director.activeEvent.id, 'instruction') || this.director.activeEvent.instruction;
      if (this.director.instructionText) this.director.instructionText.textContent = locInst;
    }
    if (this.director && this.director.pendingEvent) {
      const locWarn = (typeof getLocalizedWarning === 'function') ? getLocalizedWarning(this.director.pendingEvent.warningType) : this.director.pendingEvent.warningType;
      if (this.director.warningText) this.director.warningText.textContent = `⚠️ ${locWarn}`;
    }

    // HUD Status Message if in normal recovery period
    if (this.hudStatusMsg) {
      if (this.state === 'PLAYING') {
        if (this.director && this.director.state === 'NORMAL_BULLETS') {
          this.hudStatusMsg.textContent = getLoc('hud', 'normalPeriod');
        } else {
          this.hudStatusMsg.textContent = getLoc('hud', 'playing');
        }
      } else if (this.state === 'PAUSED') {
        this.hudStatusMsg.textContent = getLoc('hud', 'paused');
      }
    }
  }

  updateTitleRecordsDisplay() {
    const lblScore = document.getElementById('title-lbl-best-score');
    const lblRank = document.getElementById('title-lbl-best-rank');
    const lblStreak = document.getElementById('title-lbl-best-streak');
    if (lblScore) lblScore.textContent = getLoc('title', 'bestScore');
    if (lblRank) lblRank.textContent = getLoc('title', 'bestRank');
    if (lblStreak) lblStreak.textContent = getLoc('title', 'bestStreak');

    const scoreEl = document.getElementById('title-best-score');
    const rankEl = document.getElementById('title-best-rank');
    const streakEl = document.getElementById('title-best-streak');
    if (scoreEl) scoreEl.textContent = this.bestScore.toLocaleString();
    if (rankEl) rankEl.textContent = this.bestRank;
    if (streakEl) streakEl.textContent = `×${this.bestStreak}`;
  }

  toggleFullscreen() {
    audio.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  showRetroDialog(title, text, icon = 'ℹ️') {
    if (this.player) this.player.resetKeys();
    const infoDialog = document.getElementById('desktop-info-dialog');
    const titleEl = document.getElementById('info-dialog-title');
    const textEl = document.getElementById('info-dialog-text');
    const iconEl = document.getElementById('info-dialog-icon');

    if (infoDialog) {
      if (titleEl) titleEl.textContent = title;
      if (textEl) textEl.innerHTML = text.replace(/\n/g, '<br>');
      if (iconEl) iconEl.textContent = icon;
      infoDialog.style.display = 'block';
    }
    if (typeof audio !== 'undefined') audio.playAlert();
  }

  initDesktopModals() {
    const exitOk = document.getElementById('exit-dialog-ok');
    const exitClose = document.getElementById('exit-dialog-close');
    const closeExit = () => {
      audio.playClick();
      if (this.player) this.player.resetKeys();
      if (this.exitDialog) this.exitDialog.style.display = 'none';
    };
    if (exitOk) exitOk.addEventListener('click', closeExit);
    if (exitClose) exitClose.addEventListener('click', closeExit);

    const infoOk = document.getElementById('info-dialog-ok');
    const infoClose = document.getElementById('info-dialog-close');
    const closeInfo = () => {
      audio.playClick();
      if (this.player) this.player.resetKeys();
      const infoDialog = document.getElementById('desktop-info-dialog');
      if (infoDialog) infoDialog.style.display = 'none';
    };
    if (infoOk) infoOk.addEventListener('click', closeInfo);
    if (infoClose) infoClose.addEventListener('click', closeInfo);

    const fatalOk = document.getElementById('fatal-error-ok');
    if (fatalOk) {
      fatalOk.addEventListener('click', () => {
        audio.playClick();
        if (this.fatalErrorDialog) this.fatalErrorDialog.style.display = 'none';
        this.showResultScreen();
      });
    }

    const sRankOk = document.getElementById('s-rank-ok-btn');
    if (sRankOk) {
      sRankOk.addEventListener('click', () => {
        audio.playClick();
        if (this.player) this.player.resetKeys();
        if (this.sRankDialog) this.sRankDialog.style.display = 'none';
      });
    }

    // Desktop icons (using non-blocking showRetroDialog)
    const iconGame = document.getElementById('icon-game');
    if (iconGame) {
      iconGame.addEventListener('dblclick', () => {
        if (this.player) this.player.resetKeys();
        if (this.state === 'GAMEOVER' || this.state === 'TITLE') this.startCountdown();
      });
      iconGame.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }

    const iconReadme = document.getElementById('icon-readme');
    if (iconReadme) {
      iconReadme.addEventListener('dblclick', () => {
        const readmeText = currentLanguage === 'ko'
          ? "1. 이 프로그램을 실행하지 마십시오.<br>2. 지속 탄막 생존: 끊임없이 날아오는 탄막을 회피하십시오.<br>3. 시스템 방해 공작 발생 시 침착하게 상황을 파악하고 대피하십시오.<br>4. 연속 돌파 기록을 수립하며 가능한 오래 버티십시오.<br>5. 당신의 건투를 빌지 않습니다."
          : "1. Do NOT play this game.<br>2. Continuous bullet-hell survival: Keep dodging bullets!<br>3. When interference events occur, adapt and keep moving.<br>4. Build your streak and survive as long as possible.<br>5. Good luck.";
        this.showRetroDialog(
          "DO_NOT_OPEN.TXT",
          readmeText,
          "📄"
        );
      });
      iconReadme.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }

    const iconComp = document.getElementById('icon-my-computer');
    if (iconComp) {
      iconComp.addEventListener('dblclick', () => {
        this.showRetroDialog(
          getLoc('dialogs', 'sysPropTitle'),
          getLoc('dialogs', 'sysPropBody'),
          "💻"
        );
      });
      iconComp.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }

    const iconRecycle = document.getElementById('icon-recycle-bin');
    if (iconRecycle) {
      iconRecycle.addEventListener('dblclick', () => {
        this.showRetroDialog(
          getLoc('dialogs', 'recycleTitle'),
          getLoc('dialogs', 'recycleBody'),
          "🗑️"
        );
      });
      iconRecycle.addEventListener('click', () => {
        if (this.player) this.player.resetKeys();
      });
    }
  }

  // ==========================================================================
  // 3. IMMEDIATE COUNTDOWN & GAMEPLAY LAUNCH (Section 9)
  // ==========================================================================
  startCountdown() {
    this.player.reset();
    this.hazards.reset();
    this.director.reset();

    this.gameTime = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.streakToastTimer = 0;
    this.state = 'COUNTDOWN';

    // Normal game start resets cheats/debug state per Section 29
    if (!this.isSequenceRunning) {
      this.isInvincible = false;
      this.hazards.bulletDifficultyOverride = null;
      const invBtn = document.getElementById('dbg-invincible-toggle-btn');
      if (invBtn) {
        invBtn.textContent = '🛡️ INVINCIBLE: OFF';
        invBtn.style.color = '#666';
        invBtn.style.fontWeight = 'normal';
      }
      this.isDebugRun = false;
    }

    if (this.titleScreen) this.titleScreen.style.display = 'none';
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
    if (this.pauseScreen) this.pauseScreen.style.display = 'none';
    if (this.fatalErrorDialog) this.fatalErrorDialog.style.display = 'none';
    if (this.sRankDialog) this.sRankDialog.style.display = 'none';
    if (this.exitDialog) this.exitDialog.style.display = 'none';
    if (this.streakMilestoneToast) this.streakMilestoneToast.style.display = 'none';

    if (this.countdownTimers) {
      this.countdownTimers.forEach(t => clearTimeout(t));
    }
    this.countdownTimers = [];

    if (this.countdownOverlay && this.countdownText) {
      this.countdownOverlay.style.display = 'flex';
      this.countdownText.style.color = '#ffff00';

      const countSub = document.getElementById('countdown-subtext');
      if (countSub) {
        countSub.textContent = currentLanguage === 'ko' ? "WASD로 이동 | 맞지 마" : "WASD TO MOVE | DON'T GET HIT";
      }

      const showStep = (text, isFinal = false) => {
        if (this.state !== 'COUNTDOWN' || !this.countdownText) return;
        this.countdownText.textContent = text;
        this.countdownText.style.color = isFinal ? '#00ff66' : '#ffff00';
        this.countdownText.style.animation = 'none';
        this.countdownText.offsetHeight; /* trigger reflow */
        this.countdownText.style.animation = 'countdown-pulse 0.35s ease-out';
        audio.playCountdownBeep(isFinal);
      };

      // 1. Step '3' (0ms)
      showStep(getLoc('countdown', 'three'), false);

      // 2. Step '2' (700ms)
      this.countdownTimers.push(setTimeout(() => {
        showStep(getLoc('countdown', 'two'), false);
      }, 700));

      // 3. Step '1' (1400ms)
      this.countdownTimers.push(setTimeout(() => {
        showStep(getLoc('countdown', 'one'), false);
      }, 1400));

      // 4. Step 'SURVIVE.' (2100ms)
      this.countdownTimers.push(setTimeout(() => {
        showStep(getLoc('countdown', 'survive'), true);
      }, 2100));

      // 5. Game Start (2800ms)
      this.countdownTimers.push(setTimeout(() => {
        if (this.state === 'COUNTDOWN') {
          this.countdownOverlay.style.display = 'none';
          this.startGame();
        }
      }, 2800));
    } else {
      this.startGame();
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.lastTimestamp = performance.now();

    if (this.btnPlay) this.btnPlay.textContent = getLoc('title', 'play');
    if (this.btnReplay) this.btnReplay.textContent = getLoc('gameover', 'replay');

    if (this.hudStatusMsg) {
      this.hudStatusMsg.textContent = getLoc('hud', 'playing');
    }

    this.updateHUD();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      if (this.pauseScreen) this.pauseScreen.style.display = 'flex';
      if (this.hudStatusMsg) this.hudStatusMsg.textContent = getLoc('hud', 'paused');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.pauseScreen) this.pauseScreen.style.display = 'none';
      if (this.hudStatusMsg) this.hudStatusMsg.textContent = getLoc('hud', 'playing');
      this.lastTimestamp = performance.now();
    }
  }

  onPlayerHit() {
    this.streak = 0;
    if (this.hudStatusMsg) {
      this.hudStatusMsg.textContent = currentLanguage === 'ko' ? '피격되었습니다. 연속 기록 초기화' : 'HIT! STREAK RESET';
    }
    this.updateHUD();
  }

  checkStreakMilestone() {
    const milestones = [5, 10, 20];
    if (milestones.includes(this.streak)) {
      const msg = getLoc('streakMilestones', this.streak.toString());
      if (msg && this.streakMilestoneToast && this.streakMilestoneText) {
        const streakLabel = currentLanguage === 'ko' ? '연속' : 'STREAK';
        this.streakMilestoneText.textContent = `★ ×${this.streak} ${streakLabel}: ${msg}`;
        this.streakMilestoneToast.style.display = 'block';
        this.streakToastTimer = 1.2;
      }
    }
  }

  onEventSurvive(reward = 100) {
    this.streak++;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
    }

    this.checkStreakMilestone();

    // Spec Section 9: Straightforward Streak Score Bonus
    let streakBonus = 0;
    if (this.streak >= 20) {
      streakBonus = 100;
    } else if (this.streak >= 10) {
      streakBonus = 50;
    } else if (this.streak >= 5) {
      streakBonus = 25;
    }

    const totalReward = reward + streakBonus;
    this.score += totalReward;

    if (this.hudStatusMsg) {
      const isKo = currentLanguage === 'ko';
      const clearLabel = isKo ? '이벤트 돌파!' : 'EVENT CLEAR!';
      const bonusLabel = isKo ? ' (연속 보너스!)' : ' (STREAK BONUS!)';
      this.hudStatusMsg.textContent = `${clearLabel} +${totalReward} PTS${streakBonus > 0 ? bonusLabel : ''}`;
    }
    this.updateHUD();
  }

  calculateRank(score) {
    // Demo v0.5 Balanced Thresholds:
    // F: 0–999
    // D: 1000–1999
    // C: 2000–3499
    // B: 3500–4999
    // A: 5000–6999
    // S: 7000+
    if (score >= 7000) return 'S';
    if (score >= 5000) return 'A';
    if (score >= 3500) return 'B';
    if (score >= 2000) return 'C';
    if (score >= 1000) return 'D';
    return 'F';
  }

  isBetterRank(newRank, oldRank) {
    const order = ['-', 'F', 'D', 'C', 'B', 'A', 'S'];
    return order.indexOf(newRank) > order.indexOf(oldRank);
  }

  // ==========================================================================
  // 4. FATAL ERROR DEATH SEQUENCE & RESULT SCREEN (Section 29)
  // ==========================================================================
  handlePlayerDeath() {
    this.state = 'DYING';
    this.director.runCount++;
    this.totalRunsCount++;
    audio.playFatalError();

    // Show Fatal Error Dialog
    if (this.fatalErrorDialog) {
      this.fatalErrorDialog.style.display = 'block';
    }

    // Auto-advance after 1.2s if user doesn't click OK
    setTimeout(() => {
      if (this.state === 'DYING') {
        if (this.fatalErrorDialog) this.fatalErrorDialog.style.display = 'none';
        this.showResultScreen();
      }
    }, 1200);
  }

  showResultScreen() {
    this.state = 'GAMEOVER';
    audio.playGameOver();

    const finalScore = Math.floor(this.score);
    const rank = this.calculateRank(finalScore);
    const comment = getLoc('ranks', rank);

    // Save Best Records to Local Storage ONLY if NOT a Debug Run (Section 29)
    if (!this.isDebugRun) {
      try {
        if (finalScore > this.bestScore) {
          this.bestScore = finalScore;
          localStorage.setItem('dnp_best_score', this.bestScore.toString());
        }
        if (this.isBetterRank(rank, this.bestRank)) {
          this.bestRank = rank;
          localStorage.setItem('dnp_best_rank', this.bestRank);
        }
        if (this.maxStreak > this.bestStreak) {
          this.bestStreak = this.maxStreak;
          localStorage.setItem('dnp_best_streak', this.bestStreak.toString());
        }
        if (this.gameTime > this.bestTime) {
          this.bestTime = this.gameTime;
          localStorage.setItem('dnp_best_time', this.bestTime.toString());
        }
      } catch (e) {}
    } else {
      if (this.debugLog) this.debugLog("GAME OVER: Debug run active — records NOT saved to permanent storage", "warn");
    }

    this.updateTitleRecordsDisplay();

    // Populate Game Over Statistics
    if (this.goScoreVal) {
      this.goScoreVal.textContent = finalScore.toLocaleString() + (this.isDebugRun ? ' [DEBUG]' : '');
    }
    if (this.goBestScoreVal) this.goBestScoreVal.textContent = this.bestScore.toLocaleString();
    if (this.goTimeVal) this.goTimeVal.textContent = this.formatTime(this.gameTime);
    if (this.goEventsVal) this.goEventsVal.textContent = `${this.director.survivedEventsCount}`;
    if (this.goMaxStreakVal) this.goMaxStreakVal.textContent = `×${this.maxStreak}`;

    // Suspenseful Rank Reveal
    if (this.goRankBadge) this.goRankBadge.textContent = '...';
    if (this.goRankComment) this.goRankComment.textContent = currentLanguage === 'ko' ? '생존 성적 분석 중...' : 'Analyzing performance rating...';

    if (this.gameOverScreen) {
      this.gameOverScreen.style.display = 'flex';
    }

    if (typeof audio !== 'undefined') audio.playRankSuspense();

    setTimeout(() => {
      if (this.state === 'GAMEOVER') {
        if (typeof audio !== 'undefined') audio.playRankSlam();
        if (this.goRankBadge) this.goRankBadge.textContent = rank;
        if (this.goRankComment) this.goRankComment.textContent = `"${comment}"`;

        if (rank === 'S') {
          audio.playFanfare();
          if (this.sRankDialog) this.sRankDialog.style.display = 'block';
        }
      }
    }, 900);
  }

  updateProgressiveVisuals() {
    if (!this.windowTitleText) return;

    if (this.gameTime >= 90) {
      this.windowTitleText.textContent = getLoc('titleBarStates', 'danger');
    } else if (this.gameTime >= 60) {
      this.windowTitleText.textContent = getLoc('titleBarStates', 'notResponding');
    } else if (this.gameTime >= 30) {
      this.windowTitleText.textContent = getLoc('titleBarStates', 'whyHere');
    } else {
      this.windowTitleText.textContent = getLoc('titleBarStates', 'normal');
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateHUD() {
    const isKo = currentLanguage === 'ko';
    const timeLabel = isKo ? '시간' : 'TIME';
    const scoreLabel = isKo ? '점수' : 'SCORE';
    const streakLabel = isKo ? '연속' : 'STREAK';
    if (this.hudTime) this.hudTime.textContent = `${timeLabel}: ${this.formatTime(this.gameTime)}`;
    if (this.hudScore) this.hudScore.textContent = `${scoreLabel}: ${Math.floor(this.score)}`;
    if (this.hudStreakPanel) this.hudStreakPanel.textContent = `${streakLabel}: ×${this.streak}`;

    if (this.hudHpFill) {
      const pct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
      this.hudHpFill.style.width = `${pct}%`;
      this.hudHpFill.classList.remove('hp-warning', 'hp-danger');
      if (this.player.hp <= 20) this.hudHpFill.classList.add('hp-danger');
      else if (this.player.hp <= 60) this.hudHpFill.classList.add('hp-warning');
    }

    if (this.hudHpText) {
      this.hudHpText.textContent = `${Math.max(0, this.player.hp)}`;
    }
  }

  triggerClearFeedback() {
    this.clearFeedbackTimer = this.clearFeedbackDuration;
  }

  wasCleanEventSurvival() {
    return this.streak > 0;
  }

  onHealthItemCollected() {
    if (this.hudStatusMsg) {
      this.hudStatusMsg.textContent = getLoc('hud', 'hpRestored');
    }
    this.updateHUD();
  }

  // ==========================================================================
  // 5. MAIN GAME LOOP
  // ==========================================================================
  gameLoop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    if (this.state === 'PLAYING') {
      this.gameTime += dt;
      this.score += 5 * dt; // Passive survival score

      // 1. Get active bullet modifier from director
      const bulletModifier = this.director.getActiveBulletModifier();

      // 2. Update Subsystems
      this.player.update(dt);
      this.hazards.update(dt, this.gameTime, this.player, bulletModifier);
      this.director.update(dt, this.gameTime, this.player, this.hazards);

      // 3. Collision Check
      this.hazards.checkCollisions(this.player);

      // 4. Sequence Runner & Debug Toolkit Update
      this.updateSequenceRunner(dt);
      this.updateDebugToolkit();

      // 5. Combo Toast Timer & Clear Feedback Timer
      if (this.comboToastTimer > 0) {
        this.comboToastTimer -= dt;
        if (this.comboToastTimer <= 0 && this.comboMilestoneToast) {
          this.comboMilestoneToast.style.display = 'none';
        }
      }

      if (this.clearFeedbackTimer > 0) {
        this.clearFeedbackTimer -= dt;
      }

      // 6. Death Check
      if (this.player.hp <= 0) {
        this.handlePlayerDeath();
      }

      this.updateProgressiveVisuals();
      this.updateHUD();
    } else {
      this.updateDebugToolkit();
    }

    this.draw();
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.arenaWidth, this.arenaHeight);

    // 1. Grid Background
    this.ctx.fillStyle = '#0a0c12';
    this.ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);

    this.ctx.strokeStyle = '#141824';
    this.ctx.lineWidth = 1;
    const gridSize = 32;

    for (let x = 0; x < this.arenaWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.arenaHeight);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.arenaHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.arenaWidth, y);
      this.ctx.stroke();
    }

    // 2. Scanlines
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < this.arenaHeight; y += 4) {
      this.ctx.fillRect(0, y, this.arenaWidth, 2);
    }

    // 3. Large Transparent Background Pixel-Art CLEAR Feedback (20-30% Opacity)
    if (this.clearFeedbackTimer > 0) {
      const progress = 1 - (this.clearFeedbackTimer / this.clearFeedbackDuration); // 0 to 1
      let alpha = 0.28;
      if (progress < 0.2) {
        alpha = (progress / 0.2) * 0.28; // Quick fade in
      } else {
        alpha = (1 - (progress - 0.2) / 0.8) * 0.28; // Smooth fade out
      }

      this.ctx.save();
      this.drawPixelText('CLEAR', this.arenaWidth / 2, this.arenaHeight / 2, 9, `rgba(0, 255, 102, ${Math.max(0, alpha)})`);
      this.ctx.restore();
    }

    // 4. Draw Event Background (e.g. Blue Screen background effect)
    if (this.director && typeof this.director.drawBackground === 'function') {
      this.director.drawBackground(this.ctx);
    }

    // 5. Draw Subsystems (Floor Layer, Hazards, Items, Player, Director Post-effects)
    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'DYING' || this.state === 'GAMEOVER') {
      if (this.director && typeof this.director.drawFloor === 'function') {
        this.director.drawFloor(this.ctx);
      }
      this.hazards.draw(this.ctx);
      this.player.draw(this.ctx);
      this.director.draw(this.ctx);
    }
  }

  drawPixelText(text, cx, cy, pixelSize = 9, color = 'rgba(0, 255, 102, 0.28)') {
    const chars = {
      'C': [
        " XXXX",
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        " XXXX"
      ],
      'L': [
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        "XXXXX"
      ],
      'E': [
        "XXXXX",
        "X    ",
        "X    ",
        "XXXX ",
        "X    ",
        "X    ",
        "XXXXX"
      ],
      'A': [
        " XXX ",
        "X   X",
        "X   X",
        "XXXXX",
        "X   X",
        "X   X",
        "X   X"
      ],
      'R': [
        "XXXX ",
        "X   X",
        "X   X",
        "XXXX ",
        "X  X ",
        "X   X",
        "X   X"
      ],
      ' ': [
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "     "
      ]
    };

    const charW = 5;
    const charH = 7;
    const spacing = 2;
    const totalW = text.length * (charW + spacing) * pixelSize - spacing * pixelSize;
    const totalH = charH * pixelSize;

    const startX = Math.floor(cx - totalW / 2);
    const startY = Math.floor(cy - totalH / 2);

    this.ctx.fillStyle = color;

    for (let cIdx = 0; cIdx < text.length; cIdx++) {
      const ch = text[cIdx].toUpperCase();
      const bitmap = chars[ch] || chars[' '];
      const ox = startX + cIdx * (charW + spacing) * pixelSize;

      for (let r = 0; r < charH; r++) {
        const row = bitmap[r];
        for (let col = 0; col < charW; col++) {
          if (row && row[col] === 'X') {
            this.ctx.fillRect(ox + col * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
          }
        }
      }
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameManager();
});
