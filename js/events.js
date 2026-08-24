/**
 * DO NOT PLAY THIS GAME — Event Director & 15 Interference Events (Beta v0.4 Refined)
 * Strictly single-event model with bullet-safety modifiers and exact 30s tutorial curve.
 */

// ============================================================================
// 1. BASE INTERFERENCE EVENT CLASS
// ============================================================================
class BaseInterferenceEvent {
  constructor(options = {}) {
    this.id = options.id || 'base_event';
    this.name = options.name || 'Interference Event';
    this.category = options.category || 'VISION';
    this.warningType = options.warningType || 'SYSTEM ERROR';
    this.duration = options.duration || 5.0;
    this.instruction = options.instruction || 'KEEP DODGING!';
    this.difficulty = options.difficulty || 'NORMAL';
    this.reward = options.reward || 100;
    this.timer = 0;
    this.isCompleted = false;
    this.director = null;
    this.player = null;
    this.hazards = null;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    if (diff === 'EASY') {
      this.reward = 50;
    } else if (diff === 'HARD') {
      this.reward = 200;
    } else {
      this.reward = 100;
    }
  }

  start(director, player, hazards) {
    this.director = director;
    this.player = player;
    this.hazards = hazards;
    this.timer = 0;
    this.isCompleted = false;
  }

  getBulletModifier() {
    return {
      speedMultiplier: 1.0,
      densityMultiplier: 1.0,
      suppressLasers: false,
      spawnBounds: null
    };
  }

  update(dt, player, hazards) {
    this.timer += dt;
    if (this.timer >= this.duration && !this.isCompleted) {
      this.complete();
    }
  }

  complete() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    this.onEnd();
    if (this.director) {
      this.director.handleEventFinished(this);
    }
  }

  onEnd() {}

  drawBackground(ctx) {}

  drawFloor(ctx) {}

  draw(ctx) {}

  reset() {
    this.isCompleted = true;
    this.onEnd();
  }
}

// ============================================================================
// 2. THE 15 INTERFERENCE EVENTS
// ============================================================================

// -------------------------------------------------------------
// EVENT 01: POP-UP HELL (VISION)
// -------------------------------------------------------------
class PopupHellEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'popup_hell',
      name: 'Pop-up Hell',
      category: 'VISION',
      warningType: 'DISPLAY FAILURE',
      duration: 6.0,
      instruction: 'REDUCED VISIBILITY: POP-UPS ACTIVE!'
    });
    this.container = document.getElementById('popup-hell-container');
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    if (!this.container) return;
    this.container.innerHTML = '';

    let numPopups = 1;
    if (this.difficulty === 'NORMAL') numPopups = 2;
    if (this.difficulty === 'HARD') numPopups = 3;

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    for (let i = 0; i < numPopups; i++) {
      const el = document.createElement('div');
      el.className = 'popup-hell-dialog win98-box-outset';
      const rx = 50 + (i * 140) + Math.random() * 60;
      const ry = 60 + (i * 80) + Math.random() * 50;
      el.style.left = `${rx}px`;
      el.style.top = `${ry}px`;
      el.style.zIndex = 50 + i;

      const title = isKo ? `⚠️ 경고_${i + 1}.DLL` : `⚠️ WARNING_${i + 1}.DLL`;
      const body = isKo ? `메모리 블록 예외 0x00${i}F 발생.` : `Memory block exception 0x00${i}F.`;

      el.innerHTML = `
        <div class="popup-titlebar">
          <span>${title}</span>
          <button class="popup-close-btn btn-x">✕</button>
        </div>
        <div class="popup-body">
          <p>${body}</p>
        </div>
      `;

      const closeBtn = el.querySelector('.btn-x');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof audio !== 'undefined') audio.playClick();
        el.remove();
      });

      this.container.appendChild(el);
    }
  }

  onEnd() {
    if (this.container) this.container.innerHTML = '';
  }
}

// -------------------------------------------------------------
// EVENT 02: REVERSED CONTROLS (INPUT)
// Bullet safety: relaxes bullet speed and density
// -------------------------------------------------------------
class ReversedControlsEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'reversed',
      name: 'Reversed Controls',
      category: 'INPUT',
      warningType: 'INPUT ERROR',
      duration: 4.8,
      instruction: 'CONTROLS REVERSED! W↔S, A↔D'
    });
  }

  getBulletModifier() {
    return {
      speedMultiplier: 0.78,
      densityMultiplier: 0.75,
      suppressLasers: true
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    if (this.difficulty === 'EASY') this.duration = 4.0;
    if (this.difficulty === 'HARD') this.duration = 5.5;

    player.controlsReversed = true;
    if (typeof audio !== 'undefined') audio.playGlitch();
  }

  onEnd() {
    if (this.player) this.player.controlsReversed = false;
  }
}

// -------------------------------------------------------------
// EVENT 03: CURSOR.EXE (SPACE)
// -------------------------------------------------------------
class CursorEnemyEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'cursor',
      name: 'Cursor.exe',
      category: 'SPACE',
      warningType: 'SYSTEM ERROR',
      duration: 6.0,
      instruction: 'HOSTILE CURSOR INCOMING!'
    });
    this.cursorX = 40;
    this.cursorY = 40;
    this.speed = 135;
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.cursorX = player.x > 320 ? 40 : 600;
    this.cursorY = player.y > 220 ? 40 : 400;

    if (this.difficulty === 'EASY') this.speed = 110;
    if (this.difficulty === 'NORMAL') this.speed = 135;
    if (this.difficulty === 'HARD') this.speed = 165;
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const angle = Math.atan2(player.y - this.cursorY, player.x - this.cursorX);
    this.cursorX += Math.cos(angle) * this.speed * dt;
    this.cursorY += Math.sin(angle) * this.speed * dt;

    const pBounds = player.getBounds();
    const cBounds = { x: this.cursorX - 7, y: this.cursorY - 9, width: 14, height: 18 };

    if (!player.invulnerable && this.rectIntersect(pBounds, cBounds)) {
      player.takeDamage(20);
    }
  }

  rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y);
  }

  draw(ctx) {
    if (this.isCompleted) return;
    const x = Math.floor(this.cursorX);
    const y = Math.floor(this.cursorY);

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 20);
    ctx.lineTo(6, 15);
    ctx.lineTo(11, 23);
    ctx.lineTo(15, 21);
    ctx.lineTo(10, 13);
    ctx.lineTo(17, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// -------------------------------------------------------------
// EVENT 04: WINDOW SHRINK (SPACE)
// Bullet safety: adjusts container scale with fair bullet density
// -------------------------------------------------------------
class WindowShrinkEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'window_shrink',
      name: 'Window Shrink',
      category: 'SPACE',
      warningType: 'WINDOW ERROR',
      duration: 5.5,
      instruction: 'PLAYABLE AREA CONTRACTING!'
    });
    this.canvasContainer = document.getElementById('game-canvas-container');
    this.scale = 0.72;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);

    this.scale = 0.72; // Normal: ~70% area
    if (this.difficulty === 'EASY') this.scale = 0.85; // Easy: ~85% area
    if (this.difficulty === 'HARD') this.scale = 0.60; // Hard: ~60% area

    if (this.canvasContainer) {
      this.canvasContainer.style.transform = `scale(${this.scale})`;
      this.canvasContainer.style.border = '3px dashed var(--win-yellow, #ffff00)';
      this.canvasContainer.style.transition = 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    }

    // Visible canvas matches 100% of playable area — no invisible inner walls
    player.customBounds = null;
  }

  onEnd() {
    if (this.canvasContainer) {
      this.canvasContainer.style.transform = '';
      this.canvasContainer.style.border = '';
      this.canvasContainer.style.transition = 'transform 0.3s ease';
      this.canvasContainer.classList.remove('malfunction-shrunk');
    }
    if (this.player) this.player.customBounds = null;
  }
}

// -------------------------------------------------------------
// EVENT 05: FAKE UPDATE (VISION)
// -------------------------------------------------------------
class FakeUpdateEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'fake_update',
      name: 'Fake Update',
      category: 'VISION',
      warningType: 'DISPLAY FAILURE',
      duration: 5.5,
      instruction: 'INSTALLING SYSTEM UPDATE...'
    });
    this.dialog = document.getElementById('fake-update-dialog');
    this.progressFill = document.getElementById('update-progress-fill');
    this.pctText = document.getElementById('update-pct-text');
    this.statusMsg = document.getElementById('update-status-msg');
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    if (this.dialog) this.dialog.style.display = 'block';
    if (this.statusMsg) this.statusMsg.textContent = isKo ? '중요 시스템 업데이트 설치 중...' : 'Installing important system update...';
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    const progress = this.timer / this.duration;
    let pct = Math.floor(progress * 100);

    if (progress > 0.65 && progress < 0.8) {
      pct = 43;
    } else if (progress >= 0.8 && progress < 0.95) {
      pct = 99;
    } else if (progress >= 0.95) {
      pct = 100;
      if (this.statusMsg) this.statusMsg.textContent = isKo ? '업데이트 실패 성공.' : 'Update failed successfully.';
    }

    if (this.progressFill) this.progressFill.style.width = `${pct}%`;
    if (this.pctText) this.pctText.textContent = `${pct}%`;
  }

  onEnd() {
    if (this.dialog) this.dialog.style.display = 'none';
  }
}

// -------------------------------------------------------------
// EVENT 06: NO SIGNAL (VISION)
// Bullet safety: suppresses lasers to guarantee reaction time
// -------------------------------------------------------------
class NoSignalEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'no_signal',
      name: 'No Signal',
      category: 'VISION',
      warningType: 'DISPLAY FAILURE',
      duration: 5.0,
      instruction: 'SIGNAL LOSS: CRT NOISE DETECTED'
    });
    this.overlay = document.getElementById('no-signal-overlay');
  }

  getBulletModifier() {
    return {
      suppressLasers: true,
      densityMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    if (this.overlay) this.overlay.style.display = 'flex';
  }

  onEnd() {
    if (this.overlay) this.overlay.style.display = 'none';
  }
}

// -------------------------------------------------------------
// EVENT 07: STICKY KEY (INPUT)
// Bullet safety: relaxes bullet speed and density significantly
// -------------------------------------------------------------
class StickyKeyEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'sticky_key',
      name: 'Sticky Key',
      category: 'INPUT',
      warningType: 'INPUT ERROR',
      duration: 4.8,
      instruction: 'KEY JAMMED: '
    });
    this.disabledKeyName = 'D';
  }

  getBulletModifier() {
    return {
      speedMultiplier: 0.72,
      densityMultiplier: 0.70,
      suppressLasers: true
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    const keys = ['W', 'A', 'S', 'D'];
    this.disabledKeyName = keys[Math.floor(Math.random() * keys.length)];
    this.instruction = `KEY JAMMED: [${this.disabledKeyName}] DISABLED!`;
    player.disabledKey = this.disabledKeyName;

    if (director && director.instructionText) {
      director.instructionText.textContent = this.instruction;
    }
  }

  onEnd() {
    if (this.player) this.player.disabledKey = null;
  }
}

// -------------------------------------------------------------
// EVENT 08: MOVING WINDOW (WINDOW)
// -------------------------------------------------------------
class MovingWindowEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'moving_window',
      name: 'Moving Window',
      category: 'WINDOW',
      warningType: 'WINDOW ERROR',
      duration: 6.0,
      instruction: 'VIEWPORT DRIFTING!'
    });
    this.windowEl = document.getElementById('main-game-window');
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted || !this.windowEl) return;

    const mult = this.difficulty === 'HARD' ? 1.4 : 1.0;
    const offsetX = Math.sin(this.timer * 2.8 * mult) * 60 * mult;
    const offsetY = Math.cos(this.timer * 2.2 * mult) * 40 * mult;
    this.windowEl.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% - 14px + ${offsetY}px))`;
  }

  onEnd() {
    if (this.windowEl) this.windowEl.style.transform = 'translate(-50%, calc(-50% - 14px))';
  }
}

// -------------------------------------------------------------
// EVENT 09: SCREEN OFFSET (VISUAL)
// -------------------------------------------------------------
class ScreenOffsetEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'screen_offset',
      name: 'Screen Offset',
      category: 'VISUAL',
      warningType: 'VISUAL GLITCH',
      duration: 5.0,
      instruction: 'VIDEO SIGNAL MISALIGNED'
    });
    this.canvas = document.getElementById('gameCanvas');
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    if (this.canvas) {
      const offset = this.difficulty === 'HARD' ? 30 : 18;
      this.canvas.style.transform = `translate(${offset}px, -${offset}px)`;
    }
  }

  onEnd() {
    if (this.canvas) this.canvas.style.transform = 'none';
  }
}

// -------------------------------------------------------------
// EVENT 10: UI INVASION (SPACE)
// -------------------------------------------------------------
class UIInvasionEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'ui_invasion',
      name: 'UI Invasion',
      category: 'SPACE',
      warningType: 'SPACE CORRUPTION',
      duration: 6.0,
      instruction: 'SYSTEM OBJECTS ENTERING ARENA!'
    });
    this.boxes = [];
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    const count = this.difficulty === 'HARD' ? 3 : (this.difficulty === 'EASY' ? 1 : 2);
    this.boxes = [];

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    for (let i = 0; i < count; i++) {
      const bx = 120 + (i * 180);
      const by = 100 + (i * 90);
      this.boxes.push({ x: bx, y: by, w: 90, h: 60, title: isKo ? `대화상자_${i + 1}.EXE` : `DIALOG_${i + 1}.EXE` });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    for (const b of this.boxes) {
      if (player.x > b.x && player.x < b.x + b.w && player.y > b.y && player.y < b.y + b.h) {
        const dl = Math.abs(player.x - b.x);
        const dr = Math.abs(player.x - (b.x + b.w));
        const dt = Math.abs(player.y - b.y);
        const db = Math.abs(player.y - (b.y + b.h));
        const minD = Math.min(dl, dr, dt, db);

        if (minD === dl) player.x = b.x - player.visualSize / 2;
        else if (minD === dr) player.x = b.x + b.w + player.visualSize / 2;
        else if (minD === dt) player.y = b.y - player.visualSize / 2;
        else player.y = b.y + b.h + player.visualSize / 2;
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    for (const b of this.boxes) {
      ctx.save();
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(b.x, b.y, b.w, b.h);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      ctx.fillStyle = '#000080';
      ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 14);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.title, b.x + 4, b.y + 12);

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️', b.x + b.w / 2, b.y + 40);

      ctx.restore();
    }
  }
}

// -------------------------------------------------------------
// EVENT 11: FAKE LAG (INPUT)
// -------------------------------------------------------------
class FakeLagEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'fake_lag',
      name: 'Fake Lag',
      category: 'INPUT',
      warningType: 'INPUT ERROR',
      duration: 5.0,
      instruction: 'PACKET LOSS: INPUT DELAY DETECTED'
    });
  }

  getBulletModifier() {
    return {
      speedMultiplier: 0.82
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    player.hasFakeLag = true;
    player.fakeLagDelay = this.difficulty === 'HARD' ? 0.11 : (this.difficulty === 'EASY' ? 0.06 : 0.08);
  }

  onEnd() {
    if (this.player) {
      this.player.hasFakeLag = false;
      this.player.inputLagQueue = [];
    }
  }
}

// -------------------------------------------------------------
// EVENT 12: WINDOW SHAKE (VISUAL)
// -------------------------------------------------------------
class WindowShakeEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'window_shake',
      name: 'Window Shake',
      category: 'VISUAL',
      warningType: 'WINDOW ERROR',
      duration: 4.5,
      instruction: 'SEISMIC SYSTEM INSTABILITY'
    });
    this.windowEl = document.getElementById('main-game-window');
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted || !this.windowEl) return;

    const shakeX = (Math.random() - 0.5) * 8;
    const shakeY = (Math.random() - 0.5) * 8;
    this.windowEl.style.transform = `translate(calc(-50% + ${shakeX}px), calc(-50% - 14px + ${shakeY}px))`;
  }

  onEnd() {
    if (this.windowEl) this.windowEl.style.transform = 'translate(-50%, calc(-50% - 14px))';
  }
}

// -------------------------------------------------------------
// EVENT 13: COLOR ERROR (VISUAL)
// -------------------------------------------------------------
class ColorErrorEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'color_error',
      name: 'Color Error',
      category: 'VISUAL',
      warningType: 'VISUAL GLITCH',
      duration: 5.0,
      instruction: 'PALETTE CORRUPTION: 16-COLOR MODE'
    });
    this.canvas = document.getElementById('gameCanvas');
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    if (this.canvas) this.canvas.style.filter = 'invert(1) hue-rotate(180deg)';
  }

  onEnd() {
    if (this.canvas) this.canvas.style.filter = 'none';
  }
}

// -------------------------------------------------------------
// EVENT 08: TASKBAR OVERFLOW / MALFUNCTION (SPACE)
// Corrupted Windows 98 Taskbars multiply and stack upward like a buffer overflow,
// shrinking playable arena space and shocking players submerged in the glitch stack!
// -------------------------------------------------------------
class TaskbarMalfunctionEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'taskbar_malfunction',
      name: 'Taskbar Overflow',
      category: 'SPACE',
      warningType: 'SPACE CORRUPTION',
      duration: 6.5,
      instruction: 'TASKBAR OVERFLOW: EVACUATE UPWARD'
    });
    this.currentRise = 0;
    this.maxRise = 190;
    this.glitchParticles = [];
    this.submergedDamageTimer = 0;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.70,
      speedMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.currentRise = 0;
    this.maxRise = this.difficulty === 'HARD' ? 220 : (this.difficulty === 'EASY' ? 140 : 185);
    this.glitchParticles = [];
    this.submergedDamageTimer = 0;

    // Digital matrix data particles rising through the taskbar stack
    for (let i = 0; i < 28; i++) {
      this.glitchParticles.push({
        x: 10 + Math.random() * 620,
        y: 440 + Math.random() * 60,
        speed: 50 + Math.random() * 70,
        char: ['0x00', '0xFF', 'ERR', '01', 'SYS', 'STACK', '404', 'DLL', 'RAM'][Math.floor(Math.random() * 9)],
        size: 8 + Math.floor(Math.random() * 4),
        alpha: 0.3 + Math.random() * 0.5
      });
    }

    if (typeof audio !== 'undefined') audio.playLaserWarning();
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    // Smooth rising taskbar curve:
    // 0.0s - 3.0s: Rise up to maxRise
    // 3.0s - 4.8s: Hold peak overflow
    // 4.8s - 6.5s: Drain back down to 0
    if (this.timer <= 3.0) {
      const progress = this.timer / 3.0;
      this.currentRise = this.maxRise * (1 - Math.pow(1 - progress, 3));
    } else if (this.timer <= 4.8) {
      this.currentRise = this.maxRise;
    } else {
      const drainProgress = (this.timer - 4.8) / 1.7;
      this.currentRise = this.maxRise * Math.max(0, 1 - drainProgress);
    }

    const overflowTopY = 440 - this.currentRise;

    // Player submerged inside taskbar stack
    if (player && player.isAlive) {
      if (player.y + player.radius > overflowTopY + 4) {
        // Upward mechanical pushback
        player.y -= 130 * dt;

        this.submergedDamageTimer += dt;
        if (this.submergedDamageTimer >= 0.45 && !player.isInvulnerable) {
          this.submergedDamageTimer = 0;
          player.takeDamage(12);
          if (typeof audio !== 'undefined') audio.playHurt();
          if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
        }
      }
    }

    // Update digital data particles
    for (const p of this.glitchParticles) {
      p.y -= p.speed * dt;
      if (p.y < overflowTopY - 10) {
        p.y = 440 + Math.random() * 30;
        p.x = 10 + Math.random() * 620;
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted || this.currentRise <= 0) return;
    ctx.save();

    const overflowTopY = 440 - this.currentRise;
    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    const barHeight = 28;
    const totalBars = Math.ceil(this.currentRise / barHeight) + 1;

    // 1. Stacked Cascading Windows 98 Taskbars
    for (let i = 0; i < totalBars; i++) {
      const barY = 440 - ((i + 1) * barHeight);
      if (barY + barHeight < overflowTopY) continue;

      const drawTop = Math.max(barY, overflowTopY);
      const drawHeight = Math.min(barHeight, (barY + barHeight) - drawTop);
      if (drawHeight <= 0) continue;

      // Win98 Taskbar Base Gray Fill
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(0, drawTop, 640, drawHeight);

      // 3D Bevel: Top Light Edge
      if (barY >= overflowTopY) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, barY, 640, 1.5);
      }

      // 3D Bevel: Bottom Dark Edge
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, barY + barHeight - 1.5, 640, 1.5);

      // Start Button (Windows 98 Style)
      const btnW = 54;
      const btnH = 20;
      const btnY = barY + 4;
      if (btnY >= overflowTopY && btnY + btnH <= barY + barHeight) {
        // Button 3D outset
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(4, btnY, btnW, btnH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, btnY, btnW, 1.5);
        ctx.fillRect(4, btnY, 1.5, btnH);
        ctx.fillStyle = '#404040';
        ctx.fillRect(4, btnY + btnH - 1.5, btnW, 1.5);
        ctx.fillRect(4 + btnW - 1.5, btnY, 1.5, btnH);

        // Windows Logo / Start text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px "Segoe UI", Tahoma, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(isKo ? '🪟 시작' : '🪟 Start', 10, btnY + btnH / 2 + 1);
      }

      // Corrupted Application Tabs in Taskbar
      const appTitles = isKo
        ? ['⚠️ 시스템오류.exe', '💀 DANGER.DLL', '💥 STACK_OVERFLOW', '🛑 FATAL_0x99', '💾 BUFFER_ERROR']
        : ['⚠️ SYSTEM_ERR.EXE', '💀 DANGER.DLL', '💥 STACK_OVERFLOW', '🛑 FATAL_0x99', '💾 BUFFER_ERROR'];
      const appTabW = 100;
      const appTabX = 64 + ((i * 35) % 120);

      if (btnY >= overflowTopY && btnY + btnH <= barY + barHeight) {
        // Sunken pressed button
        ctx.fillStyle = '#b0b0b0';
        ctx.fillRect(appTabX, btnY, appTabW, btnH);
        ctx.fillStyle = '#404040';
        ctx.fillRect(appTabX, btnY, appTabW, 1);
        ctx.fillRect(appTabX, btnY, 1, btnH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(appTabX, btnY + btnH - 1, appTabW, 1);
        ctx.fillRect(appTabX + appTabW - 1, btnY, 1, btnH);

        ctx.fillStyle = '#111111';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(appTitles[(i + 1) % appTitles.length], appTabX + 4, btnY + btnH / 2 + 1);
      }

      // System Tray Area (Clock & Error Icons)
      const trayW = 75;
      const trayX = 640 - trayW - 4;
      if (btnY >= overflowTopY && btnY + btnH <= barY + barHeight) {
        // Sunken 3D Tray Inset
        ctx.fillStyle = '#b5b5b5';
        ctx.fillRect(trayX, btnY, trayW, btnH);
        ctx.fillStyle = '#404040';
        ctx.fillRect(trayX, btnY, trayW, 1);
        ctx.fillRect(trayX, btnY, 1, btnH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(trayX, btnY + btnH - 1, trayW, 1);
        ctx.fillRect(trayX + trayW - 1, btnY, 1, btnH);

        // Blinking Tray Error Icon & Digital Clock
        const flashIcon = (Math.floor(this.timer * 6 + i) % 2 === 0) ? '⚠️' : '⚡';
        ctx.fillStyle = '#000000';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(flashIcon, trayX + 4, btnY + btnH / 2 + 1);

        const clockText = `12:${(30 + i * 7) % 60 < 10 ? '0' : ''}${(30 + i * 7) % 60}`;
        ctx.fillText(clockText, trayX + 24, btnY + btnH / 2 + 1);
      }
    }

    // 2. Digital Glitch Scanlines & Matrix Particle Streams
    for (const p of this.glitchParticles) {
      if (p.y >= overflowTopY && p.y <= 440) {
        ctx.fillStyle = `rgba(0, 80, 180, ${p.alpha * 0.75})`;
        ctx.font = `bold ${p.size}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(p.char, p.x, p.y);
      }
    }

    // 3. Top Hazard Boundary Barrier (Retro Hazard Stripe Tape & Neon Glitch Line)
    const stripeW = 16;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, overflowTopY - 4, 640, 8);
    ctx.clip();

    for (let sx = -32; sx < 640 + 32; sx += stripeW) {
      const offset = (this.timer * 25) % stripeW;
      ctx.fillStyle = (Math.floor((sx + offset) / stripeW) % 2 === 0) ? '#ffcc00' : '#111111';
      ctx.beginPath();
      ctx.moveTo(sx + offset, overflowTopY + 4);
      ctx.lineTo(sx + offset + 8, overflowTopY - 4);
      ctx.lineTo(sx + offset + stripeW + 8, overflowTopY - 4);
      ctx.lineTo(sx + offset + stripeW, overflowTopY + 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Neon Glitch Laser Border Line
    ctx.strokeStyle = (Math.floor(this.timer * 15) % 2 === 0) ? '#ff0033' : '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, overflowTopY);
    ctx.lineTo(640, overflowTopY);
    ctx.stroke();

    // 4. Concise In-Game Warning Tag
    const warningAlpha = (Math.floor(this.timer * 10) % 2 === 0) ? 0.95 : 0.45;
    ctx.fillStyle = `rgba(255, 230, 0, ${warningAlpha})`;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      isKo ? '▲ [ 작업표시줄 범람: 상단 대피 ] ▲' : '▲ [ TASKBAR OVERFLOW: EVACUATE UPWARD ] ▲',
      320,
      Math.max(18, overflowTopY - 10)
    );

    ctx.restore();
  }

  onEnd() {
    this.currentRise = 0;
    this.glitchParticles = [];
  }
}

// -------------------------------------------------------------
// EVENT 12: SCREEN TEARING (VISION)
// Horizontal display splitting into gentle, authentic desynced strips
// -------------------------------------------------------------
class ScreenTearingEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'screen_tearing',
      name: 'Screen Tearing',
      category: 'VISION',
      warningType: 'DISPLAY DESYNC',
      duration: 5.5,
      instruction: 'DISPLAY DESYNC: HORIZONTAL TEARING DETECTED'
    });
    this.slicesCount = 3;
    this.sliceOffsets = [];
    this.sliceBounds = [];
    this.tearLineY = 120;
    this.tearSpeed = 50;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
  }

  getBulletModifier() {
    return {
      speedMultiplier: 0.75,
      densityMultiplier: 0.70
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    // 2-3 clean horizontal bands for authentic V-Sync tearing without violent shaking
    this.slicesCount = this.difficulty === 'HARD' ? 3 : (this.difficulty === 'EASY' ? 2 : 3);
    this.tearLineY = 80;
    this.tearSpeed = this.difficulty === 'HARD' ? 70 : 50;
    
    // Stable, fair slice heights across the 440px canvas
    this.sliceBounds = [];
    const totalH = 440;
    let currentY = 0;
    const baseH = Math.floor(totalH / this.slicesCount);
    
    for (let i = 0; i < this.slicesCount; i++) {
      const h = (i === this.slicesCount - 1) ? (totalH - currentY) : baseH;
      this.sliceBounds.push({ y: currentY, h: h });
      currentY += h;
    }
    
    this.sliceOffsets = new Array(this.slicesCount).fill(0);

    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = 640;
      this.offscreenCanvas.height = 440;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    // Moderate, readable displacement (8px ~ 15px max) instead of jarring extreme shifts
    const maxShift = this.difficulty === 'HARD' ? 15 : (this.difficulty === 'EASY' ? 8 : 12);

    // Slowly roll a tearing seam downward for authentic retro V-Sync drift
    this.tearLineY = (this.tearLineY + this.tearSpeed * dt) % 440;

    // Slow, gentle sinusoidal wave (0.8 ~ 1.4 Hz) so player easily tracks bullets and hitbox
    for (let i = 0; i < this.slicesCount; i++) {
      const slowFreq = 1.0 + i * 0.4;
      const phase = i * 1.5;
      const baseOffset = Math.sin(this.timer * slowFreq * Math.PI + phase) * maxShift;
      
      // Dynamic shift when the rolling tear seam passes this slice
      const sliceMid = this.sliceBounds[i].y + this.sliceBounds[i].h / 2;
      const distToSeam = Math.abs(this.tearLineY - sliceMid);
      const seamKick = distToSeam < 60 ? (1 - distToSeam / 60) * (i % 2 === 0 ? maxShift * 0.5 : -maxShift * 0.5) : 0;

      this.sliceOffsets[i] = baseOffset + seamKick;
    }
  }

  draw(ctx) {
    if (this.isCompleted || this.sliceBounds.length === 0 || !this.offscreenCtx) return;

    // 1. Copy the current rendered frame (background + hazards + player) to offscreen buffer
    this.offscreenCtx.clearRect(0, 0, 640, 440);
    this.offscreenCtx.drawImage(ctx.canvas, 0, 0);

    // 2. Clear canvas to redraw with torn horizontal slices
    ctx.fillStyle = '#0a0c12';
    ctx.fillRect(0, 0, 640, 440);

    // 3. Draw each displaced slice
    for (let i = 0; i < this.sliceBounds.length; i++) {
      const slice = this.sliceBounds[i];
      const offset = Math.round(this.sliceOffsets[i] || 0);

      // Draw shifted slice
      ctx.drawImage(
        this.offscreenCanvas,
        0, slice.y, 640, slice.h,          // source rect
        offset, slice.y, 640, slice.h       // dest rect shifted horizontally
      );

      // If shifted, fill the empty margin with retro dark background
      if (offset > 0) {
        ctx.fillStyle = '#06080d';
        ctx.fillRect(0, slice.y, offset, slice.h);
      } else if (offset < 0) {
        ctx.fillStyle = '#06080d';
        ctx.fillRect(640 + offset, slice.y, -offset, slice.h);
      }

      // Clean, stylish RGB Desync line at tear boundary
      if (i > 0 && Math.abs(offset) >= 2) {
        ctx.save();
        ctx.strokeStyle = offset > 0 ? 'rgba(0, 255, 255, 0.7)' : 'rgba(255, 40, 90, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, slice.y);
        ctx.lineTo(640, slice.y);
        ctx.stroke();

        // Very subtle atmospheric chromatic glow on torn strip
        ctx.fillStyle = offset > 0 ? 'rgba(0, 255, 255, 0.03)' : 'rgba(255, 0, 80, 0.03)';
        ctx.fillRect(0, slice.y, 640, slice.h);
        ctx.restore();
      }
    }
  }

  onEnd() {
    this.sliceOffsets = [];
    this.sliceBounds = [];
  }
}

// -------------------------------------------------------------
// EVENT 13: NOTIFICATION SPAM (UI / VISION)
// Sarcastic retro Win98 notification toast popups around the screen edges
// -------------------------------------------------------------
class NotificationSpamEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'notification_spam',
      name: 'Notification Spam',
      category: 'UI',
      warningType: 'NEW NOTIFICATIONS',
      duration: 5.5,
      instruction: 'SYSTEM NOTIFICATIONS INCOMING!'
    });
    this.container = document.getElementById('notification-spam-container');
    this.spawnInterval = 0.7;
    this.spawnTimer = 0.2;
    this.totalToSpawn = 5;
    this.spawnedCount = 0;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.totalToSpawn = this.difficulty === 'HARD' ? 7 : (this.difficulty === 'EASY' ? 3 : 5);
    this.spawnInterval = this.duration / (this.totalToSpawn + 1);
    this.spawnTimer = 0.2;
    this.spawnedCount = 0;
    if (this.container) this.container.innerHTML = '';
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.spawnedCount < this.totalToSpawn) {
      this.spawnNotification();
      this.spawnedCount++;
      this.spawnTimer = this.spawnInterval;
    }
  }

  spawnNotification() {
    if (!this.container) return;

    const messagesEN = [
      { title: "Important Message", msg: "Click here immediately!" },
      { title: "System Warning", msg: "Your computer is probably fine." },
      { title: "Hardware Alert", msg: "1 problem detected. (Good luck)" },
      { title: "Memory Manager", msg: "Unused RAM available for disposal." },
      { title: "Antivirus 98", msg: "No threats found. Except you." }
    ];

    const messagesKO = [
      { title: "중요한 메시지", msg: "여기를 즉시 클릭하세요!" },
      { title: "시스템 경고", msg: "컴퓨터는 아마 괜찮을 겁니다." },
      { title: "하드웨어 알림", msg: "1개의 문제 감지됨. (수고)" },
      { title: "메모리 관리자", msg: "사용 가능한 상식이 감지되지 않음." },
      { title: "바이러스 백신 98", msg: "위험 요소 없음. 당신 제외." }
    ];

    const pool = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko') ? messagesKO : messagesEN;
    const item = pool[this.spawnedCount % pool.length];

    const positions = [
      { left: '12px', top: '16px' },
      { right: '12px', top: '16px' },
      { left: '12px', bottom: '18px' },
      { right: '12px', bottom: '18px' },
      { left: '12px', top: '160px' },
      { right: '12px', top: '160px' },
      { left: '230px', top: '12px' }
    ];
    const pos = positions[this.spawnedCount % positions.length];

    const el = document.createElement('div');
    el.className = 'notification-spam-toast';
    Object.keys(pos).forEach(k => { el.style[k] = pos[k]; });

    el.innerHTML = `
      <div class="notification-spam-title">💬 <strong>${item.title}</strong></div>
      <div class="notification-spam-msg">${item.msg}</div>
    `;

    this.container.appendChild(el);
    if (typeof audio !== 'undefined') audio.playBootChirp();
  }

  onEnd() {
    if (this.container) this.container.innerHTML = '';
  }
}

// -------------------------------------------------------------
// EVENT 14: MOUSE TRAIL (VISUAL)
// Harmless retro cursor afterimage ghosts drifting across the arena
// -------------------------------------------------------------
class MouseTrailEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'mouse_trail',
      name: 'Mouse Trail',
      category: 'VISUAL',
      warningType: 'POINTER ERROR',
      duration: 5.0,
      instruction: 'GHOST CURSOR TRAILS ACTIVE!'
    });
    this.ghosts = [];
    this.ghostCount = 5;
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.ghostCount = this.difficulty === 'HARD' ? 7 : (this.difficulty === 'EASY' ? 3 : 5);
    this.ghosts = [];

    for (let i = 0; i < this.ghostCount; i++) {
      this.ghosts.push({
        baseX: 120 + Math.random() * 400,
        baseY: 80 + Math.random() * 280,
        freqX: 1.5 + (i * 0.4),
        freqY: 2.0 + (i * 0.3),
        phase: i * (Math.PI / 3),
        trailHistory: []
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    for (const g of this.ghosts) {
      const curX = g.baseX + Math.sin(this.timer * g.freqX + g.phase) * 140;
      const curY = g.baseY + Math.cos(this.timer * g.freqY + g.phase) * 90;

      g.trailHistory.unshift({ x: curX, y: curY });
      const maxNodes = this.difficulty === 'HARD' ? 8 : (this.difficulty === 'EASY' ? 4 : 6);
      if (g.trailHistory.length > maxNodes) {
        g.trailHistory.pop();
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    for (const g of this.ghosts) {
      for (let i = 0; i < g.trailHistory.length; i++) {
        const node = g.trailHistory[i];
        const alpha = Math.max(0.15, (1 - i / g.trailHistory.length) * 0.75);

        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.globalAlpha = alpha;

        // Draw classic Win98 pointer cursor shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 15);
        ctx.lineTo(4, 12);
        ctx.lineTo(8, 18);
        ctx.lineTo(11, 16);
        ctx.lineTo(7, 10);
        ctx.lineTo(12, 10);
        ctx.closePath();

        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        ctx.restore();
      }
    }

    ctx.restore();
  }

  onEnd() {
    this.ghosts = [];
  }
}



// -------------------------------------------------------------
// EVENT 17: ZIP BOMB (ATTACK / AREA BURST)
// Compressed retro file icon unrolls and bursts into mini-file projectiles
// -------------------------------------------------------------
class ZipBombEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'zipBomb',
      name: 'Zip Bomb',
      category: 'ATTACK',
      warningType: 'COMPRESSED THREAT',
      duration: 6.0,
      instruction: 'COMPRESSED FILE DETECTED! UNPACKING...'
    });
    this.zipFiles = [];
    this.shards = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.75,
      speedMultiplier: 0.90
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.zipFiles = [];
    this.shards = [];

    const playerX = player ? player.x : 320;
    const playerY = player ? player.y : 220;

    const count = (this.difficulty === 'EASY') ? 1 : 2;
    
    for (let i = 0; i < count; i++) {
      let zx = 120 + Math.random() * (640 - 240);
      let zy = 100 + Math.random() * (440 - 200);
      if (Math.hypot(zx - playerX, zy - playerY) < 90) {
        zx = (zx + 200) % (640 - 160) + 80;
        zy = (zy + 160) % (440 - 140) + 70;
      }

      const burstTime = (i === 0) ? (this.difficulty === 'HARD' ? 1.0 : 1.2) : (this.difficulty === 'HARD' ? 2.3 : 2.8);
      const labels = ['archive.zip', 'virus_pack.zip', 'huge_payload.zip', 'payload.zip'];

      this.zipFiles.push({
        x: zx,
        y: zy,
        label: labels[Math.floor(Math.random() * labels.length)],
        burstTime: burstTime,
        burstDone: false
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const playerX = player ? player.x : 320;
    const playerY = player ? player.y : 220;

    for (const zip of this.zipFiles) {
      if (!zip.burstDone) {
        const timeRemaining = zip.burstTime - this.timer;
        if (timeRemaining <= 0) {
          zip.burstDone = true;
          if (typeof audio !== 'undefined') audio.playZipBurst();

          const shardCount = (this.difficulty === 'HARD') ? 16 : (this.difficulty === 'NORMAL' ? 14 : 12);
          const baseSpeed = (this.difficulty === 'HARD') ? 180 : 150;
          const extensions = ['.TXT', '.DLL', '.EXE', '.BMP', '.WAV', '.SYS', '.INI'];

          for (let s = 0; s < shardCount; s++) {
            const angle = (s / shardCount) * Math.PI * 2 + (Math.random() * 0.2);
            const speed = baseSpeed + (Math.random() * 40 - 20);
            this.shards.push({
              x: zip.x,
              y: zip.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              ext: extensions[s % extensions.length],
              radius: 7,
              life: 3.2
            });
          }
        }
      }
    }

    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;

      if (player && player.isAlive && !player.isInvulnerable) {
        const dist = Math.hypot(s.x - playerX, s.y - playerY);
        if (dist < s.radius + player.radius) {
          player.takeDamage(15);
          if (typeof audio !== 'undefined') audio.playHurt();
          if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
          this.shards.splice(i, 1);
          continue;
        }
      }

      if (s.life <= 0 || s.x < -40 || s.x > 680 || s.y < -40 || s.y > 480) {
        this.shards.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;

    for (const zip of this.zipFiles) {
      if (!zip.burstDone) {
        const timeLeft = Math.max(0, zip.burstTime - this.timer);
        const pulse = 1.0 + Math.sin(this.timer * 15) * 0.15 * (1 - Math.min(1, timeLeft));
        
        ctx.save();
        ctx.translate(zip.x, zip.y);
        ctx.scale(pulse, pulse);

        ctx.strokeStyle = (Math.floor(this.timer * 10) % 2 === 0) ? '#ff3333' : '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 24 + (1.2 - Math.min(1.2, timeLeft)) * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#d4d0c8';
        ctx.fillRect(-18, -14, 36, 28);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-18, -14, 36, 28);

        ctx.fillStyle = '#e6a817';
        ctx.fillRect(-18, -20, 16, 6);
        ctx.strokeRect(-18, -20, 16, 6);

        ctx.fillStyle = '#444444';
        for (let zy = -10; zy < 10; zy += 4) {
          ctx.fillRect(-3, zy, 6, 2);
        }
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-4, 6, 8, 5);

        const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? '압축파일.zip' : zip.label, 0, 24);
        
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${Math.max(0.1, timeLeft).toFixed(1)}s`, 0, -24);

        ctx.restore();
      }
    }

    for (const s of this.shards) {
      ctx.save();
      ctx.translate(s.x, s.y);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -8, 12, 16);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(-6, -8, 12, 16);

      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.moveTo(2, -8);
      ctx.lineTo(6, -4);
      ctx.lineTo(2, -4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff2222';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.ext, 0, 4);

      ctx.restore();
    }
  }

  onEnd() {
    this.zipFiles = [];
    this.shards = [];
  }
}

// -------------------------------------------------------------
// EVENT 18: ERROR LASER (ATTACK / LINE STRIKE)
// Weaponized error turret dialog charges and fires a high-intensity laser
// -------------------------------------------------------------
// -------------------------------------------------------------
// EVENT 18: ERROR LASER (ATTACK / LINE STRIKE)
// Weaponized error turret dialogs charge and fire multi-beam crossfire barrages
// -------------------------------------------------------------
class ErrorLaserEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'errorLaser',
      name: 'Error Laser',
      category: 'ATTACK',
      warningType: 'CRITICAL ERROR',
      duration: 6.0,
      instruction: 'ERROR TURRETS DETECTED! DODGE THE CROSSFIRE'
    });
    this.strikes = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.70,
      suppressLasers: true
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.strikes = [];

    const isEasy = (this.difficulty === 'EASY');
    const isHard = (this.difficulty === 'HARD');

    if (isEasy) {
      // 2 Sequential Strikes
      this.strikes.push({
        x: 0, y: 120 + Math.random() * 200, angle: 0,
        startTime: 0.5, aimDuration: 0.85, fireDuration: 0.65, beamWidth: 26,
        fired: false, warned: false, label: 'ERROR_1.DLL'
      });
      this.strikes.push({
        x: 140 + Math.random() * 360, y: 0, angle: Math.PI / 2,
        startTime: 3.0, aimDuration: 0.85, fireDuration: 0.65, beamWidth: 26,
        fired: false, warned: false, label: 'ERROR_2.DLL'
      });
    } else if (!isHard) {
      // NORMAL: 2 Crossfire Salvos (4 Turrets total)
      // Salvo 1: Crossfire at 0.4s
      const crossY1 = 120 + Math.random() * 200;
      const crossX1 = 160 + Math.random() * 320;
      this.strikes.push({
        x: 0, y: crossY1, angle: 0,
        startTime: 0.4, aimDuration: 0.80, fireDuration: 0.65, beamWidth: 28,
        fired: false, warned: false, label: 'ERROR_01.EXE'
      });
      this.strikes.push({
        x: crossX1, y: 0, angle: Math.PI / 2,
        startTime: 0.4, aimDuration: 0.80, fireDuration: 0.65, beamWidth: 28,
        fired: false, warned: false, label: 'ERROR_02.EXE'
      });

      // Salvo 2: Dual Crossfire at 2.9s
      const crossY2 = (crossY1 > 220) ? crossY1 - 110 : crossY1 + 110;
      const crossX2 = (crossX1 > 320) ? crossX1 - 150 : crossX1 + 150;
      this.strikes.push({
        x: 0, y: crossY2, angle: 0,
        startTime: 2.9, aimDuration: 0.80, fireDuration: 0.65, beamWidth: 28,
        fired: false, warned: false, label: 'FATAL_03.DLL'
      });
      this.strikes.push({
        x: crossX2, y: 0, angle: Math.PI / 2,
        startTime: 2.9, aimDuration: 0.80, fireDuration: 0.65, beamWidth: 28,
        fired: false, warned: false, label: 'FATAL_04.DLL'
      });
    } else {
      // HARD: 4 Rapid Intense Salvos with Multi-Turret Barrages! (9 Turrets total)
      // Salvo 1 (0.3s): Dual Crossfire
      this.strikes.push({
        x: 0, y: 140, angle: 0,
        startTime: 0.3, aimDuration: 0.65, fireDuration: 0.55, beamWidth: 30,
        fired: false, warned: false, label: 'SYS_01.EXE'
      });
      this.strikes.push({
        x: 460, y: 0, angle: Math.PI / 2,
        startTime: 0.3, aimDuration: 0.65, fireDuration: 0.55, beamWidth: 30,
        fired: false, warned: false, label: 'SYS_02.EXE'
      });

      // Salvo 2 (1.6s): Dual Vertical Grid Squeeze
      this.strikes.push({
        x: 180, y: 0, angle: Math.PI / 2,
        startTime: 1.6, aimDuration: 0.60, fireDuration: 0.55, beamWidth: 30,
        fired: false, warned: false, label: 'PINCH_A.DLL'
      });
      this.strikes.push({
        x: 0, y: 300, angle: 0,
        startTime: 1.6, aimDuration: 0.60, fireDuration: 0.55, beamWidth: 30,
        fired: false, warned: false, label: 'PINCH_B.DLL'
      });

      // Salvo 3 (2.9s): Triple Barrage! (2 Vertical + 1 Horizontal)
      this.strikes.push({
        x: 0, y: 220, angle: 0,
        startTime: 2.9, aimDuration: 0.60, fireDuration: 0.55, beamWidth: 32,
        fired: false, warned: false, label: 'TURRET_C.EXE'
      });
      this.strikes.push({
        x: 130, y: 0, angle: Math.PI / 2,
        startTime: 2.9, aimDuration: 0.60, fireDuration: 0.55, beamWidth: 32,
        fired: false, warned: false, label: 'TURRET_D.EXE'
      });
      this.strikes.push({
        x: 510, y: 0, angle: Math.PI / 2,
        startTime: 2.9, aimDuration: 0.60, fireDuration: 0.55, beamWidth: 32,
        fired: false, warned: false, label: 'TURRET_E.EXE'
      });

      // Salvo 4 (4.3s): Final Rapid Crossing Snap
      this.strikes.push({
        x: 0, y: 100 + Math.random() * 240, angle: 0,
        startTime: 4.3, aimDuration: 0.55, fireDuration: 0.55, beamWidth: 30,
        fired: false, warned: false, label: 'FINAL_X.DLL'
      });
      this.strikes.push({
        x: 160 + Math.random() * 320, y: 0, angle: Math.PI / 2,
        startTime: 4.3, aimDuration: 0.55, fireDuration: 0.55, beamWidth: 30,
        fired: false, warned: false, label: 'FINAL_Y.DLL'
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const playerX = player ? player.x : 320;
    const playerY = player ? player.y : 220;

    for (const strike of this.strikes) {
      if (this.timer >= strike.startTime) {
        const elapsed = this.timer - strike.startTime;
        if (elapsed < strike.aimDuration) {
          strike.state = 'AIMING';
          if (!strike.warned) {
            strike.warned = true;
            if (typeof audio !== 'undefined') audio.playLaserWarning();
          }
        } else if (elapsed < strike.aimDuration + strike.fireDuration) {
          strike.state = 'FIRING';
          if (!strike.fired) {
            strike.fired = true;
            if (typeof audio !== 'undefined') audio.playLaserBeam();
          }

          if (player && player.isAlive && !player.isInvulnerable) {
            const dx = Math.cos(strike.angle);
            const dy = Math.sin(strike.angle);
            const px = playerX - strike.x;
            const py = playerY - strike.y;
            const proj = px * dx + py * dy;
            if (proj >= 0) {
              const perpDist = Math.abs(px * dy - py * dx);
              if (perpDist < strike.beamWidth / 2 + player.radius) {
                player.takeDamage(20);
                if (typeof audio !== 'undefined') audio.playHurt();
                if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
              }
            }
          }
        } else {
          strike.state = 'DONE';
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;

    for (const strike of this.strikes) {
      if (!strike.state || strike.state === 'DONE') continue;

      const cosA = Math.cos(strike.angle);
      const sinA = Math.sin(strike.angle);
      const lineLen = 1000;
      const endX = strike.x + cosA * lineLen;
      const endY = strike.y + sinA * lineLen;

      if (strike.state === 'AIMING') {
        ctx.save();
        ctx.strokeStyle = (Math.floor(this.timer * 20) % 2 === 0) ? '#ff0033' : '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Win98 Error Turret Dialogue Box at Border
        const tw = 68;
        const th = 22;
        const tx = (strike.angle === 0) ? strike.x + tw / 2 : strike.x;
        const ty = (strike.angle === 0) ? strike.y : strike.y + th / 2;

        ctx.fillStyle = '#d4d0c8';
        ctx.fillRect(tx - tw / 2, ty - th / 2, tw, th);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx - tw / 2, ty - th / 2, tw, th);

        // Red X Warning Icon
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('❌', tx - tw / 2 + 3, ty + 3);

        // Label
        const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(isKo ? '오류.EXE' : (strike.label || 'ERROR'), tx - tw / 2 + 18, ty + 3);

        ctx.restore();
      } else if (strike.state === 'FIRING') {
        ctx.save();

        // Outer glow
        ctx.strokeStyle = 'rgba(255, 0, 80, 0.45)';
        ctx.lineWidth = strike.beamWidth + 18;
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Main electric beam
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = strike.beamWidth;
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Inner electric core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(5, strike.beamWidth / 3);
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Turret firing flare
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(strike.x, strike.y, 18 + Math.sin(this.timer * 30) * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  }

  onEnd() {
    this.strikes = [];
  }
}

// -------------------------------------------------------------
// EVENT 19: ANTIVIRUS SCAN (ATTACK / MOTION DETECTOR SWEEP)
// Sweeping radar scanline searches for movement: FREEZE INSIDE THE BEAM!
// -------------------------------------------------------------
class AntivirusScanEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'antivirusScan',
      name: 'Antivirus Scan',
      category: 'ATTACK',
      warningType: 'SCAN IN PROGRESS',
      duration: 6.0,
      instruction: 'ANTIVIRUS SCAN: STOP MOVING INSIDE THE BEAM!'
    });
    this.scanX = -100;
    this.scanDirection = 1;
    this.passCount = 0;
    this.sweepSpeed = 150;
    this.beamWidth = 52;
    this.isPlayerDetected = false;
    this.detectedTimer = 0;
    this.hitCooldown = 0;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.70,
      speedMultiplier: 0.80
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.scanX = -50;
    this.scanDirection = 1;
    this.passCount = 0;
    this.sweepSpeed = (this.difficulty === 'HARD') ? 190 : ((this.difficulty === 'NORMAL') ? 150 : 120);
    this.beamWidth = (this.difficulty === 'HARD') ? 60 : 50;
    this.isPlayerDetected = false;
    this.detectedTimer = 0;
    this.hitCooldown = 0;
    if (typeof audio !== 'undefined') audio.playScanSweep();
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    this.scanX += this.scanDirection * this.sweepSpeed * dt;
    if (this.hitCooldown > 0) this.hitCooldown -= dt;
    if (this.detectedTimer > 0) this.detectedTimer -= dt;
    else this.isPlayerDetected = false;

    // Bounce sweep
    if (this.scanDirection === 1 && this.scanX > 640 + 50) {
      if (this.difficulty !== 'EASY' && this.passCount === 0) {
        this.scanDirection = -1;
        this.passCount++;
        if (typeof audio !== 'undefined') audio.playScanSweep();
      }
    } else if (this.scanDirection === -1 && this.scanX < -50) {
      if (this.difficulty === 'HARD' && this.passCount === 1) {
        this.scanDirection = 1;
        this.passCount++;
        if (typeof audio !== 'undefined') audio.playScanSweep();
      }
    }

    const playerX = player ? player.x : 320;
    const playerY = player ? player.y : 220;
    const pRadius = (player && player.radius) ? player.radius : 8;

    // Check if player is currently INSIDE the scan beam
    const isInsideBeam = Math.abs(playerX - this.scanX) < (this.beamWidth / 2 + pRadius);

    if (isInsideBeam && player && player.hp > 0) {
      // Check if player is MOVING (player.isMoving or movement keys pressed)
      const isMoving = player.isMoving || (player.keys && (player.keys.up || player.keys.down || player.keys.left || player.keys.right));

      if (isMoving) {
        // TRIGGER VIRUS DETECTION!
        this.isPlayerDetected = true;
        this.detectedTimer = 0.55;

        if (this.hitCooldown <= 0 && !player.invulnerable) {
          this.hitCooldown = 0.35;
          player.takeDamage(15);
          if (typeof audio !== 'undefined') audio.playHurt();
          if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;

    ctx.save();
    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    // 1. Scan Area Light (Holographic radar gradient)
    const trailDir = this.scanDirection === 1 ? -1 : 1;
    const grad = ctx.createLinearGradient(this.scanX, 0, this.scanX + trailDir * 140, 0);

    if (this.isPlayerDetected) {
      grad.addColorStop(0, 'rgba(255, 0, 50, 0.45)');
      grad.addColorStop(1, 'rgba(255, 0, 50, 0.0)');
    } else {
      grad.addColorStop(0, 'rgba(0, 255, 120, 0.25)');
      grad.addColorStop(1, 'rgba(0, 255, 120, 0.0)');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(Math.min(this.scanX, this.scanX + trailDir * 140), 0, 140, 440);

    // 2. Scan Beam Line
    const beamColor = this.isPlayerDetected ? '#ff0033' : '#00ff66';
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = this.beamWidth;
    ctx.beginPath();
    ctx.moveTo(this.scanX, 0);
    ctx.lineTo(this.scanX, 440);
    ctx.stroke();

    // Inner bright laser line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.scanX, 0);
    ctx.lineTo(this.scanX, 440);
    ctx.stroke();

    // 3. Scanhead Sensor Node
    ctx.fillStyle = this.isPlayerDetected ? '#ff0000' : '#00ff88';
    ctx.beginPath();
    ctx.arc(this.scanX, 10, 8, 0, Math.PI * 2);
    ctx.arc(this.scanX, 430, 8, 0, Math.PI * 2);
    ctx.fill();

    // 4. Player Visual Feedback
    if (this.player && this.player.isAlive) {
      const px = this.player.x;
      const py = this.player.y;
      const isInside = Math.abs(px - this.scanX) < (this.beamWidth / 2 + this.player.radius);

      if (this.isPlayerDetected) {
        // Red Flashing Detection Bracket
        ctx.strokeStyle = (Math.floor(this.timer * 20) % 2 === 0) ? '#ff0000' : '#ffff00';
        ctx.lineWidth = 2;
        const boxSize = 28;
        ctx.strokeRect(px - boxSize / 2, py - boxSize / 2, boxSize, boxSize);

        ctx.fillStyle = '#ff0033';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? '🚨 위협 감지 (-15 HP)' : '🚨 DETECTED (-15 HP)', px, py - 18);
      } else if (isInside) {
        // Green Safe Scan Verification Ring (Standing Still!)
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? '🟢 정지 유지 (안전)' : '🟢 FREEZE (SAFE)', px, py - 18);
      }
    }

    // 5. Top Dynamic HUD Alert Banner
    ctx.save();
    let bannerBg = this.isPlayerDetected ? '#cc0000' : (Math.abs(this.player ? this.player.x - this.scanX : 999) < this.beamWidth / 2 + 15 ? '#007733' : '#003366');
    let bannerText = '';

    if (this.isPlayerDetected) {
      bannerText = isKo ? '🚨 [ 위협 포착: 이동 감지 (-15 HP) ]' : '🚨 [ THREAT DETECTED: MOVED (-15 HP) ]';
    } else if (this.player && Math.abs(this.player.x - this.scanX) < this.beamWidth / 2 + 15) {
      bannerText = isKo ? '🟢 [ 백신 검사 중: 이동 정지 (안전) ]' : '🟢 [ SCANNING: FREEZE MOVEMENT (SAFE) ]';
    } else {
      bannerText = isKo ? '🛡️ [ 백신 스캔 진행 중: 광선 내 정지 ]' : '🛡️ [ SCAN IN PROGRESS: FREEZE IN BEAM ]';
    }

    ctx.fillStyle = bannerBg;
    ctx.fillRect(120, 8, 400, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 8, 400, 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(bannerText, 320, 22);

    ctx.restore();
    ctx.restore();
  }

  onEnd() {
    this.scanX = -100;
    this.isPlayerDetected = false;
  }
}

// -------------------------------------------------------------
// EVENT 20: DELETE KEY (ATTACK / TARGET STRIKE)
// Giant retro 3D keyboard keycap drops from above and slams player position
// -------------------------------------------------------------
class DeleteKeyEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'deleteKey',
      name: 'Delete Key',
      category: 'ATTACK',
      warningType: 'DELETE COMMAND',
      duration: 6.0,
      instruction: 'SYSTEM EXECUTING DELETE COMMAND!'
    });
    this.slams = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.80
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.slams = [];

    const isEasy = (this.difficulty === 'EASY');
    const isHard = (this.difficulty === 'HARD');
    const slamCount = isHard ? 3 : (isEasy ? 1 : 2);
    const delayStep = isHard ? 1.6 : 2.2;

    for (let i = 0; i < slamCount; i++) {
      this.slams.push({
        targetX: player ? player.x : 320,
        targetY: player ? player.y : 220,
        startTime: 0.5 + i * delayStep,
        delay: isHard ? 0.60 : 0.75,
        state: 'WAITING',
        landed: false,
        lockedTarget: false
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const playerX = player ? player.x : 320;
    const playerY = player ? player.y : 220;

    for (const slam of this.slams) {
      if (this.timer >= slam.startTime) {
        const elapsed = this.timer - slam.startTime;
        if (elapsed < slam.delay) {
          slam.state = 'TARGETING';
          if (!slam.lockedTarget && elapsed < 0.25) {
            slam.targetX = playerX;
            slam.targetY = playerY;
          } else {
            slam.lockedTarget = true;
          }
        } else if (elapsed < slam.delay + 0.4) {
          slam.state = 'SLAMMING';
          if (!slam.landed) {
            slam.landed = true;
            if (typeof audio !== 'undefined') audio.playKeySlam();

            const kw = 90;
            const kh = 60;
            if (player && player.isAlive && !player.isInvulnerable) {
              if (
                playerX >= slam.targetX - kw / 2 - player.radius &&
                playerX <= slam.targetX + kw / 2 + player.radius &&
                playerY >= slam.targetY - kh / 2 - player.radius &&
                playerY <= slam.targetY + kh / 2 + player.radius
              ) {
                player.takeDamage(20);
                if (typeof audio !== 'undefined') audio.playHurt();
                if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
              }
            }
          }
        } else {
          slam.state = 'DONE';
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;

    const kw = 90;
    const kh = 60;

    for (const slam of this.slams) {
      if (slam.state === 'TARGETING') {
        const elapsed = this.timer - slam.startTime;
        const progress = elapsed / slam.delay;

        ctx.save();
        ctx.translate(slam.targetX, slam.targetY);

        ctx.strokeStyle = (Math.floor(this.timer * 15) % 2 === 0) ? '#ff0033' : '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-kw / 2, -kh / 2, kw, kh);
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
        ctx.moveTo(0, -15); ctx.lineTo(0, 15);
        ctx.stroke();

        const shadowScale = 0.5 + progress * 0.5;
        ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + progress * 0.35})`;
        ctx.fillRect((-kw / 2) * shadowScale, (-kh / 2) * shadowScale, kw * shadowScale, kh * shadowScale);

        ctx.restore();
      } else if (slam.state === 'SLAMMING') {
        const elapsed = (this.timer - slam.startTime) - slam.delay;
        const slamAlpha = Math.max(0, 1.0 - elapsed / 0.4);

        ctx.save();
        ctx.translate(slam.targetX, slam.targetY);
        ctx.globalAlpha = slamAlpha;

        ctx.fillStyle = '#404040';
        ctx.fillRect(-kw / 2, -kh / 2 + 6, kw, kh);

        ctx.fillStyle = '#d4d0c8';
        ctx.fillRect(-kw / 2 + 3, -kh / 2 + 3, kw - 6, kh - 6);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-kw / 2 + 3, -kh / 2 + 3, kw - 6, 3);
        ctx.fillRect(-kw / 2 + 3, -kh / 2 + 3, 3, kh - 6);

        ctx.fillStyle = '#808080';
        ctx.fillRect(-kw / 2 + 3, kh / 2 - 6, kw - 6, 3);
        ctx.fillRect(kw / 2 - 6, -kh / 2 + 3, 3, kh - 6);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DELETE', 0, 0);

        ctx.restore();
      }
    }
  }

  onEnd() {
    this.slams = [];
  }
}

// -------------------------------------------------------------
// EVENT 21: FIREWALL (ATTACK / SPACE PRESSURE)
// Moving firewall hazard barrier sweeps across arena with safe pass-through gaps
// -------------------------------------------------------------
class FirewallEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'firewall',
      name: 'Firewall',
      category: 'ATTACK',
      warningType: 'FIREWALL ACTIVE',
      duration: 6.0,
      instruction: 'FIREWALL MOVING! FIND THE SECURITY GAP'
    });
    this.walls = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.65,
      speedMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.walls = [];

    const isEasy = (this.difficulty === 'EASY');
    const isHard = (this.difficulty === 'HARD');
    const gapW = isHard ? 95 : (isEasy ? 135 : 115);

    const gap1 = 60 + Math.random() * (640 - 120 - gapW);
    this.walls.push({
      axis: 'Y',
      pos: -40,
      gapStart: gap1,
      gapWidth: gapW,
      thickness: 34,
      speed: isHard ? 110 : 90,
      startTime: 0.4
    });

    if (!isEasy) {
      const gap2 = 60 + Math.random() * (440 - 120 - gapW);
      this.walls.push({
        axis: 'X',
        pos: -40,
        gapStart: gap2,
        gapWidth: gapW,
        thickness: 34,
        speed: isHard ? 110 : 90,
        startTime: 2.8
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const playerX = player ? player.x : 320;
    const playerY = player ? player.y : 220;

    for (const wall of this.walls) {
      if (this.timer >= wall.startTime) {
        wall.pos += wall.speed * dt;

        if (player && player.isAlive && !player.isInvulnerable) {
          if (wall.axis === 'Y') {
            const inY = (playerY >= wall.pos - player.radius && playerY <= wall.pos + wall.thickness + player.radius);
            const inGap = (playerX >= wall.gapStart && playerX <= wall.gapStart + wall.gapWidth);
            if (inY && !inGap) {
              player.takeDamage(15);
              if (typeof audio !== 'undefined') audio.playHurt();
              if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
            }
          } else if (wall.axis === 'X') {
            const inX = (playerX >= wall.pos - player.radius && playerX <= wall.pos + wall.thickness + player.radius);
            const inGap = (playerY >= wall.gapStart && playerY <= wall.gapStart + wall.gapWidth);
            if (inX && !inGap) {
              player.takeDamage(15);
              if (typeof audio !== 'undefined') audio.playHurt();
              if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
            }
          }
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    for (const wall of this.walls) {
      if (this.timer < wall.startTime) continue;

      ctx.save();
      const isY = (wall.axis === 'Y');

      if (isY) {
        this.drawWallSegment(ctx, 0, wall.pos, wall.gapStart, wall.thickness);
        this.drawWallSegment(ctx, wall.gapStart + wall.gapWidth, wall.pos, 640 - (wall.gapStart + wall.gapWidth), wall.thickness);

        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? '▼ 안전 포트 ▼' : '▼ SAFE PORT ▼', wall.gapStart + wall.gapWidth / 2, wall.pos - 6);
      } else {
        this.drawWallSegment(ctx, wall.pos, 0, wall.thickness, wall.gapStart);
        this.drawWallSegment(ctx, wall.pos, wall.gapStart + wall.gapWidth, wall.thickness, 440 - (wall.gapStart + wall.gapWidth));

        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? '▶ 안전 포트 ▶' : '▶ SAFE PORT ▶', wall.pos - 6, wall.gapStart + wall.gapWidth / 2);
      }

      ctx.restore();
    }
  }

  drawWallSegment(ctx, x, y, w, h) {
    if (w <= 0 || h <= 0) return;
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.strokeStyle = '#661100';
    ctx.lineWidth = 1;
    for (let bx = x; bx < x + w; bx += 20) {
      ctx.beginPath();
      ctx.moveTo(bx, y);
      ctx.lineTo(bx, y + h);
      ctx.stroke();
    }
  }

  onEnd() {
    this.walls = [];
  }
}

// -------------------------------------------------------------
// EVENT 22: BLUE SCREEN BACKGROUND (BACKGROUND / VISUAL / LOW INTENSITY)
// Non-damaging comedic parody fatal crash background effect
// -------------------------------------------------------------
class BlueScreenBgEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'blueScreenBg',
      name: 'Blue Screen',
      category: 'VISUAL',
      warningType: 'SYSTEM FAILURE',
      duration: 5.5,
      instruction: 'FATAL SYSTEM ERROR... BUT GAME CONTINUES'
    });
    this.fadeAlpha = 0;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 1.0
    };
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    if (this.timer < 0.4) {
      this.fadeAlpha = this.timer / 0.4;
    } else if (this.timer > this.duration - 0.5) {
      this.fadeAlpha = Math.max(0, (this.duration - this.timer) / 0.5);
    } else {
      this.fadeAlpha = 1.0;
    }
  }

  drawBackground(ctx) {
    if (this.isCompleted || this.fadeAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.fadeAlpha * 0.95;

    ctx.fillStyle = '#0000aa';
    ctx.fillRect(0, 0, 640, 440);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < 440; y += 4) {
      ctx.fillRect(0, y, 640, 2);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    if (isKo) {
      ctx.fillText('*** 정지: 0x000000D0 (0x00000002, 0x00000000, 0x00000000)', 30, 60);
      ctx.fillText('*** DO_NOT_PLAY.SYS - 주소 F86B5A89 기준 F86B5000', 30, 80);

      ctx.font = 'bold 13px monospace';
      ctx.fillText('치명적인 문제가 발생했습니다.', 30, 130);
      ctx.fillText('안타깝게도 게임은 계속됩니다.', 30, 150);

      ctx.font = '11px monospace';
      ctx.fillText('* 아무 키나 눌러도 아무 일도 일어나지 않습니다.', 30, 200);
      ctx.fillText('* 탄막은 계속 날아옵니다. 제발 계속 피하세요.', 30, 225);
      ctx.fillText('* 시스템 재부팅 실패: 컴퓨터가 플레이를 거부함.', 30, 250);

      ctx.font = 'bold 11px monospace';
      ctx.fillText('기술 정보:', 30, 310);
      ctx.font = '10px monospace';
      ctx.fillText('*** 0x0000001E (0xC0000005, 0xF86B5A89, 0x00000000)', 30, 330);
    } else {
      ctx.fillText('*** STOP: 0x000000D0 (0x00000002, 0x00000000, 0x00000000)', 30, 60);
      ctx.fillText('*** DO_NOT_PLAY.SYS - Address F86B5A89 base at F86B5000', 30, 80);

      ctx.font = 'bold 13px monospace';
      ctx.fillText('A critical problem has occurred.', 30, 130);
      ctx.fillText('Unfortunately, the game will continue.', 30, 150);

      ctx.font = '11px monospace';
      ctx.fillText('* Press ANY KEY to do absolutely nothing.', 30, 200);
      ctx.fillText('* Bullets are still active. Please keep dodging.', 30, 225);
      ctx.fillText('* System reboot failed: The computer refuses to stop.', 30, 250);

      ctx.font = 'bold 11px monospace';
      ctx.fillText('Technical Information:', 30, 310);
      ctx.font = '10px monospace';
      ctx.fillText('*** 0x0000001E (0xC0000005, 0xF86B5A89, 0x00000000)', 30, 330);
    }

    ctx.restore();
  }

  onEnd() {
    this.fadeAlpha = 0;
  }
}

// -------------------------------------------------------------
// EVENT 23: START MENU BARRAGE (ATTACK / MISSILE BARRAGE)
// Start menu pops open and fires cascade buttons like missiles!
// -------------------------------------------------------------
class StartMenuBarrageEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'startMenuBarrage',
      name: 'Start Menu Barrage',
      category: 'ATTACK',
      warningType: 'START MENU MALFUNCTION',
      duration: 6.5,
      instruction: 'START MENU POPPING UP! DODGE THE LAUNCHED ITEMS'
    });
    this.buttons = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.70,
      speedMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.buttons = [];

    const isEasy = (this.difficulty === 'EASY');
    const isHard = (this.difficulty === 'HARD');
    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    const labels = isKo ? [
      { name: '📁 프로그램', icon: '📁' },
      { name: '📄 내 문서', icon: '📄' },
      { name: '⚙️ 제어판', icon: '⚙️' },
      { name: '🔍 파일 찾기', icon: '🔍' },
      { name: '💻 실행.exe', icon: '💻' },
      { name: '🔴 시스템 종료', icon: '🔴' }
    ] : [
      { name: '📁 Programs', icon: '📁' },
      { name: '📄 Documents', icon: '📄' },
      { name: '⚙️ Settings', icon: '⚙️' },
      { name: '🔍 Find Files', icon: '🔍' },
      { name: '💻 Run.exe', icon: '💻' },
      { name: '🔴 Shut Down', icon: '🔴' }
    ];

    const count = isHard ? 6 : (isEasy ? 3 : 5);
    const launchInterval = isHard ? 0.60 : 0.75;

    for (let i = 0; i < count; i++) {
      this.buttons.push({
        label: labels[i % labels.length].name,
        origX: 55,
        origY: 380 - (i * 24),
        w: 95,
        h: 22,
        x: 55,
        y: 380 - (i * 24),
        vx: 0,
        vy: 0,
        angle: 0,
        launchTime: 2.0 + (i * launchInterval),
        state: 'DOCKED',
        targetX: 320,
        targetY: 220
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const px = player ? player.x : 320;
    const py = player ? player.y : 220;

    for (const btn of this.buttons) {
      if (btn.state === 'DONE') continue;

      if (btn.state === 'DOCKED') {
        if (this.timer >= btn.launchTime - 0.7) {
          btn.state = 'AIMING';
          btn.targetX = px;
          btn.targetY = py;
          btn.angle = Math.atan2(py - btn.origY, px - btn.origX);
          if (typeof audio !== 'undefined') audio.playLaserWarning();
        }
      } else if (btn.state === 'AIMING') {
        if (this.timer < btn.launchTime - 0.15) {
          btn.targetX = px;
          btn.targetY = py;
          btn.angle = Math.atan2(py - btn.origY, px - btn.origX);
        }

        if (this.timer >= btn.launchTime) {
          btn.state = 'LAUNCHED';
          const speed = (this.difficulty === 'HARD') ? 340 : 280;
          btn.vx = Math.cos(btn.angle) * speed;
          btn.vy = Math.sin(btn.angle) * speed;
          if (typeof audio !== 'undefined') audio.playKeySlam();
        }
      } else if (btn.state === 'LAUNCHED') {
        btn.x += btn.vx * dt;
        btn.y += btn.vy * dt;

        if (player && player.isAlive && !player.isInvulnerable) {
          const halfW = btn.w / 2;
          const halfH = btn.h / 2;
          const insideX = (px >= btn.x - halfW - player.radius && px <= btn.x + halfW + player.radius);
          const insideY = (py >= btn.y - halfH - player.radius && py <= btn.y + halfH + player.radius);

          if (insideX && insideY) {
            player.takeDamage(15);
            btn.state = 'DONE';
            if (typeof audio !== 'undefined') audio.playHurt();
            if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
          }
        }

        if (btn.x < -100 || btn.x > 740 || btn.y < -100 || btn.y > 540) {
          btn.state = 'DONE';
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    // 0. Pre-activation Telegraph Hazard Zone (timer < 1.0s)
    if (this.timer < 1.0) {
      const remain = Math.max(0, 1.0 - this.timer).toFixed(1);
      ctx.fillStyle = (Math.floor(this.timer * 15) % 2 === 0) ? 'rgba(255, 200, 0, 0.35)' : 'rgba(255, 0, 50, 0.35)';
      ctx.fillRect(6, 250, 130, 190);

      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(6, 250, 130, 190);
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isKo ? '⚠️ [ 시작 메뉴: 즉시 대피 ]' : '⚠️ [ START POPUP: EVACUATE ]', 71, 330);
      ctx.fillText(`[ ${remain}s ]`, 71, 350);
      ctx.restore();
      return;
    }

    // 1. Draw Windows 98 Start Menu Container Shell at bottom-left
    const menuW = 120;
    const menuElapsed = this.timer - 1.0;
    const menuH = Math.min(190, menuElapsed * 320);
    const menuY = 440 - menuH;

    ctx.fillStyle = '#d4d0c8';
    ctx.fillRect(6, menuY, menuW, menuH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, menuY, menuW, menuH);

    ctx.fillStyle = '#000080';
    ctx.fillRect(6, menuY, 20, menuH);

    ctx.save();
    ctx.translate(20, 430);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Windows 98', 0, 0);
    ctx.restore();

    for (const btn of this.buttons) {
      if (btn.state === 'DONE') continue;

      if (btn.state === 'AIMING') {
        ctx.save();
        ctx.strokeStyle = (Math.floor(this.timer * 20) % 2 === 0) ? '#ff0033' : '#ffaa00';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(btn.origX, btn.origY);
        ctx.lineTo(btn.origX + Math.cos(btn.angle) * 800, btn.origY + Math.sin(btn.angle) * 800);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(btn.x, btn.y);

      if (btn.state === 'LAUNCHED') {
        ctx.rotate(btn.angle);
        ctx.fillStyle = '#cc0000';
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
      } else if (btn.state === 'AIMING') {
        ctx.fillStyle = '#ff3333';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
      } else {
        ctx.fillStyle = '#d4d0c8';
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
      }

      ctx.fillRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h);
      ctx.strokeRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h);

      ctx.fillStyle = (btn.state === 'LAUNCHED' || btn.state === 'AIMING') ? '#ffffff' : '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(btn.label, 0, 3);

      ctx.restore();
    }

    ctx.restore();
  }

  onEnd() {
    this.buttons = [];
  }
}

// -------------------------------------------------------------
// EVENT 24: RECYCLE BIN VORTEX (SPACE / GRAVITY CORRUPTION)
// Giant Recycle Bin opens with high-intensity suction vortex!
// -------------------------------------------------------------
class RecycleBinVortexEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'recycleBinVortex',
      name: 'Recycle Bin Vortex',
      category: 'SPACE',
      warningType: 'GRAVITY CORRUPTION',
      duration: 6.0,
      instruction: 'RECYCLE BIN VORTEX ACTIVE! RESIST THE GRAVITY PULL'
    });
    this.centerX = 320;
    this.centerY = 220;
    this.vortexTimer = 0;
    this.swirlParticles = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.75,
      speedMultiplier: 0.80
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.centerX = 320;
    this.centerY = 220;
    this.swirlParticles = [];

    for (let i = 0; i < 30; i++) {
      this.swirlParticles.push({
        radius: 40 + Math.random() * 240,
        angle: Math.random() * Math.PI * 2,
        speed: 2.0 + Math.random() * 3.0,
        size: 2 + Math.random() * 3,
        color: Math.random() < 0.5 ? '#00ffff' : '#ff00ff'
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    // Telegraph phase during first 0.9s: 0 gravity force
    const rampFactor = Math.max(0, Math.min(1, (this.timer - 0.9) / 0.8));

    if (rampFactor > 0) {
      this.vortexTimer += dt;
      if (this.vortexTimer > 0.35) {
        this.vortexTimer = 0;
        if (typeof audio !== 'undefined') audio.playVortexHum();
      }
    }

    const basePull = (this.difficulty === 'HARD') ? 85 : ((this.difficulty === 'NORMAL') ? 65 : 45);
    const pullStrength = basePull * rampFactor;

    if (player && player.isAlive && rampFactor > 0) {
      const dx = this.centerX - player.x;
      const dy = this.centerY - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 10) {
        const force = (pullStrength / Math.max(80, dist)) * 260 * dt;
        player.x += (dx / dist) * force;
        player.y += (dy / dist) * force;
      }

      // Center damage active only after full summoning
      if (dist < 28 && !player.isInvulnerable && rampFactor >= 0.8) {
        player.takeDamage(15);
        if (typeof audio !== 'undefined') audio.playHurt();
        if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
      }
    }

    for (const p of this.swirlParticles) {
      p.angle += p.speed * dt * (0.3 + rampFactor * 0.7);
      p.radius -= (20 + 35 * rampFactor) * dt;
      if (p.radius < 20) {
        p.radius = 220 + Math.random() * 60;
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    // 0. Pre-activation Telegraph Summoning Reticle (timer < 0.9s)
    if (this.timer < 0.9) {
      const remain = Math.max(0, 0.9 - this.timer).toFixed(1);
      ctx.save();
      ctx.translate(this.centerX, this.centerY);

      ctx.strokeStyle = (Math.floor(this.timer * 15) % 2 === 0) ? '#ff00ff' : '#00ffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 80 + Math.sin(this.timer * 15) * 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isKo ? '⚠️ [ 소환 중: 중심 이탈 ]' : '⚠️ [ SUMMONING: CLEAR CENTER ]', 0, -20);
      ctx.fillText(`[ ${remain}s ]`, 0, 0);

      ctx.restore();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(this.centerX, this.centerY);

    const pulseR = 30 + Math.sin(this.timer * 8) * 6;
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 240);
    grad.addColorStop(0, 'rgba(150, 0, 255, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 200, 255, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    for (let a = 0; a < 3; a++) {
      ctx.beginPath();
      const baseA = this.timer * 3 + (a * Math.PI * 2 / 3);
      for (let r = 20; r < 200; r += 10) {
        const theta = baseA + (r * 0.03);
        const sx = Math.cos(theta) * r;
        const sy = Math.sin(theta) * r;
        if (r === 20) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    for (const p of this.swirlParticles) {
      const sx = Math.cos(p.angle) * p.radius;
      const sy = Math.sin(p.angle) * p.radius;
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
    }

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#d4d0c8';
    ctx.fillRect(-18, -12, 36, 26);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-18, -12, 36, 26);

    ctx.save();
    ctx.translate(-18, -14);
    ctx.rotate(-0.35 + Math.sin(this.timer * 12) * 0.1);
    ctx.fillStyle = '#0066aa';
    ctx.fillRect(0, -6, 38, 6);
    ctx.restore();

    ctx.fillStyle = '#00aa00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('♻️', 0, 6);

    ctx.restore();
    ctx.restore();
  }

  onEnd() {
    this.swirlParticles = [];
  }
}

// -------------------------------------------------------------
// EVENT 25: CMD.EXE HACK ATTACK (ATTACK / CODE RAIN)
// Command prompt opens at top, raining destructive code matrix missiles
// -------------------------------------------------------------
class CmdHackAttackEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'cmdHackAttack',
      name: 'CMD.EXE Hack Attack',
      category: 'ATTACK',
      warningType: 'TERMINAL BREACH',
      duration: 6.0,
      instruction: 'COMMAND PROMPT ACTIVE: DODGE RAINING CODE MATRICES'
    });
    this.codeBlocks = [];
    this.cmdTextLines = [
      'C:\\WINDOWS> format c: /q /y',
      'Executing purge_player.bat ...',
      'KILL -9 ALL_SAFE_THREADS'
    ];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.70,
      speedMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.codeBlocks = [];

    const isEasy = (this.difficulty === 'EASY');
    const isHard = (this.difficulty === 'HARD');
    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    this.cmdTextLines = isKo ? [
      'C:\\WINDOWS> format c: /q /y',
      'purge_player.bat 실행 중...',
      '치명적 프로세스 강제 종료'
    ] : [
      'C:\\WINDOWS> format c: /q /y',
      'Executing purge_player.bat ...',
      'KILL -9 ALL_SAFE_THREADS'
    ];

    const count = isHard ? 12 : (isEasy ? 5 : 8);
    const tokens = isKo 
      ? ['오류_404', '널_포인터', '메모리_오류', '강제_종료', '포맷_C', '제거.EXE', '손상됨']
      : ['ERR_404', 'NULL_PTR', 'SEG_FAULT', 'KILL_-9', 'FORMAT_C', 'PURGE.EXE', 'CORRUPT'];

    for (let i = 0; i < count; i++) {
      this.codeBlocks.push({
        text: tokens[i % tokens.length],
        x: 60 + Math.random() * 520,
        y: 70,
        w: 64,
        h: 20,
        fallSpeed: 180 + Math.random() * 120,
        startTime: 0.8 + (i * (isHard ? 0.35 : 0.55)),
        state: 'WAITING',
        telegraphTime: 0.5,
        warned: false
      });
    }

    if (typeof audio !== 'undefined') audio.playTerminalClack();
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const px = player ? player.x : 320;
    const py = player ? player.y : 220;

    for (const block of this.codeBlocks) {
      if (block.state === 'DONE') continue;

      if (this.timer >= block.startTime) {
        const elapsed = this.timer - block.startTime;
        if (elapsed < block.telegraphTime) {
          block.state = 'TELEGRAPH';
          if (!block.warned) {
            block.warned = true;
            if (typeof audio !== 'undefined') audio.playTerminalClack();
          }
        } else {
          block.state = 'FALLING';
          block.y += block.fallSpeed * dt;

          if (player && player.isAlive && !player.isInvulnerable) {
            const inX = (px >= block.x - block.w / 2 - player.radius && px <= block.x + block.w / 2 + player.radius);
            const inY = (py >= block.y - block.h / 2 - player.radius && py <= block.y + block.h / 2 + player.radius);
            if (inX && inY) {
              player.takeDamage(15);
              block.state = 'DONE';
              if (typeof audio !== 'undefined') audio.playHurt();
              if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
            }
          }

          if (block.y > 470) {
            block.state = 'DONE';
          }
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    const termW = 440;
    const termH = 60;
    const termX = 100;
    const termY = 6;

    ctx.fillStyle = '#000000';
    ctx.fillRect(termX, termY, termW, termH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(termX, termY, termW, termH);

    ctx.fillStyle = '#000080';
    ctx.fillRect(termX, termY, termW, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(isKo ? 'MS-DOS 프롬프트 — [cmd.exe]' : 'MS-DOS Prompt — [cmd.exe]', termX + 6, termY + 10);

    ctx.fillStyle = '#00ff66';
    ctx.font = '9px monospace';
    const lineIndex = Math.min(2, Math.floor(this.timer * 1.5));
    for (let i = 0; i <= lineIndex; i++) {
      ctx.fillText(`> ${this.cmdTextLines[i]}`, termX + 8, termY + 26 + (i * 12));
    }

    for (const block of this.codeBlocks) {
      if (block.state === 'DONE' || block.state === 'WAITING') continue;

      if (block.state === 'TELEGRAPH') {
        ctx.save();
        ctx.strokeStyle = (Math.floor(this.timer * 20) % 2 === 0) ? '#00ff66' : '#ff0033';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(block.x, 70);
        ctx.lineTo(block.x, 440);
        ctx.stroke();

        ctx.fillStyle = '#ff0033';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? '⚠️ 낙하 주의' : '⚠️ DROP', block.x, 82);
        ctx.restore();
      } else if (block.state === 'FALLING') {
        ctx.save();
        ctx.translate(block.x, block.y);

        ctx.fillStyle = '#002200';
        ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);

        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(block.text, 0, 3);

        ctx.restore();
      }
    }

    ctx.restore();
  }

  onEnd() {
    this.codeBlocks = [];
  }
}

// -------------------------------------------------------------
// EVENT 26: HOSTILE CLIPPY (ATTACK / ASSISTANT BETRAYAL)
// Retro paperclip assistant throws speech bubble bombs & charges zap tethers
// -------------------------------------------------------------
class HostileClippyEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'hostileClippy',
      name: 'Hostile Clippy',
      category: 'ATTACK',
      warningType: 'OFFICE ASSISTANT',
      duration: 6.0,
      instruction: "CLIPPY DETECTED! DODGE THE ASSISTANT'S POPUPS & WIRES"
    });
    this.clippyX = 520;
    this.clippyY = 140;
    this.bombs = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.70,
      speedMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.clippyX = 520;
    this.clippyY = 140;
    this.bombs = [];

    const isEasy = (this.difficulty === 'EASY');
    const isHard = (this.difficulty === 'HARD');
    const bombCount = isHard ? 4 : (isEasy ? 2 : 3);

    for (let i = 0; i < bombCount; i++) {
      this.bombs.push({
        throwTime: 1.0 + (i * (isHard ? 1.1 : 1.4)),
        x: 520,
        y: 140,
        targetX: 140 + Math.random() * 360,
        targetY: 120 + Math.random() * 240,
        progress: 0,
        exploded: false,
        shards: []
      });
    }

    if (typeof audio !== 'undefined') audio.playBootChirp();
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    this.clippyX = 480 + Math.sin(this.timer * 2.0) * 80;
    this.clippyY = 140 + Math.cos(this.timer * 1.5) * 50;

    const px = player ? player.x : 320;
    const py = player ? player.y : 220;

    for (const bomb of this.bombs) {
      if (this.timer >= bomb.throwTime && !bomb.exploded) {
        bomb.progress += dt * 1.4;
        bomb.x = this.clippyX + (bomb.targetX - this.clippyX) * Math.min(1, bomb.progress);
        bomb.y = this.clippyY + (bomb.targetY - this.clippyY) * Math.min(1, bomb.progress) - Math.sin(bomb.progress * Math.PI) * 50;

        if (bomb.progress >= 1.0) {
          bomb.exploded = true;
          if (typeof audio !== 'undefined') audio.playZipBurst();

          const shardCount = (this.difficulty === 'HARD') ? 8 : 6;
          for (let s = 0; s < shardCount; s++) {
            const angle = (s * Math.PI * 2) / shardCount;
            bomb.shards.push({
              x: bomb.targetX,
              y: bomb.targetY,
              vx: Math.cos(angle) * 190,
              vy: Math.sin(angle) * 190,
              life: 1.2
            });
          }
        }
      }

      for (const shard of bomb.shards) {
        if (shard.life <= 0) continue;
        shard.life -= dt;
        shard.x += shard.vx * dt;
        shard.y += shard.vy * dt;

        if (player && player.isAlive && !player.isInvulnerable) {
          if (Math.hypot(px - shard.x, py - shard.y) < player.radius + 6) {
            player.takeDamage(15);
            shard.life = 0;
            if (typeof audio !== 'undefined') audio.playHurt();
            if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
          }
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    ctx.save();
    ctx.translate(this.clippyX, this.clippyY);

    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, 18);
    ctx.lineTo(-12, -14);
    ctx.arc(0, -14, 12, Math.PI, 0, false);
    ctx.lineTo(12, 14);
    ctx.arc(4, 14, 8, 0, Math.PI, false);
    ctx.lineTo(-4, -6);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -10, 6, 0, Math.PI * 2);
    ctx.arc(5, -10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    const lookX = this.player ? (this.player.x < this.clippyX ? -2 : 2) : 0;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-5 + lookX, -10, 2.5, 0, Math.PI * 2);
    ctx.arc(5 + lookX, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    const bubbleW = 160;
    const bubbleH = 44;
    ctx.fillStyle = '#ffffe1';
    ctx.fillRect(-bubbleW - 15, -30, bubbleW, bubbleH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(-bubbleW - 15, -30, bubbleW, bubbleH);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'left';
    if (isKo) {
      ctx.fillText('살아남으려 하시는군요!', -bubbleW - 8, -16);
      ctx.fillText('죽는 것을 도와드릴까요?', -bubbleW - 8, -4);
    } else {
      ctx.fillText('Trying to survive?', -bubbleW - 8, -16);
      ctx.fillText('Would you like help dying?', -bubbleW - 8, -4);
    }

    ctx.restore();

    for (const bomb of this.bombs) {
      if (this.timer >= bomb.throwTime && !bomb.exploded) {
        ctx.save();
        ctx.translate(bomb.x, bomb.y);

        ctx.fillStyle = '#ff3333';
        ctx.fillRect(-14, -10, 28, 20);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-14, -10, 28, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? '💥 확인' : '💥 OK', 0, 3);

        ctx.restore();
      }

      for (const shard of bomb.shards) {
        if (shard.life <= 0) continue;
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(shard.x, shard.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  onEnd() {
    this.bombs = [];
  }
}

// -------------------------------------------------------------
// EVENT 27: BOUNCING SCREENSAVER (SPACE / BOUNCING HAZARD)
// Retro DVD-style error screensaver bouncing off arena walls with spark bursts!
// -------------------------------------------------------------
class BouncingScreensaverEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'bouncingScreensaver',
      name: 'Bouncing Screensaver',
      category: 'SPACE',
      warningType: 'SCREENSAVER ACTIVE',
      duration: 6.0,
      instruction: 'SCREENSAVER BOUNCING! DODGE WALL-IMPACT SPARKS'
    });
    this.boxes = [];
    this.sparks = [];
    this.colorPalette = ['#00ffff', '#ff00ff', '#ffff00', '#00ff66', '#ff6600'];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.75,
      speedMultiplier: 0.80
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.boxes = [];
    this.sparks = [];

    const isHard = (this.difficulty === 'HARD');
    const count = isHard ? 2 : 1;

    for (let i = 0; i < count; i++) {
      this.boxes.push({
        x: 120 + i * 200,
        y: 100 + i * 100,
        vx: (i === 0 ? 1 : -1) * (isHard ? 260 : 210),
        vy: 180 + Math.random() * 50,
        w: 90,
        h: 44,
        colorIdx: i,
        hitCooldown: 0
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const px = player ? player.x : 320;
    const py = player ? player.y : 220;

    for (const box of this.boxes) {
      if (box.hitCooldown > 0) box.hitCooldown -= dt;

      box.x += box.vx * dt;
      box.y += box.vy * dt;

      let bounced = false;

      if (box.x - box.w / 2 <= 0) {
        box.x = box.w / 2;
        box.vx = Math.abs(box.vx) * 1.02;
        bounced = true;
      } else if (box.x + box.w / 2 >= 640) {
        box.x = 640 - box.w / 2;
        box.vx = -Math.abs(box.vx) * 1.02;
        bounced = true;
      }

      if (box.y - box.h / 2 <= 0) {
        box.y = box.h / 2;
        box.vy = Math.abs(box.vy) * 1.02;
        bounced = true;
      } else if (box.y + box.h / 2 >= 440) {
        box.y = 440 - box.h / 2;
        box.vy = -Math.abs(box.vy) * 1.02;
        bounced = true;
      }

      if (bounced) {
        box.colorIdx = (box.colorIdx + 1) % this.colorPalette.length;
        if (typeof audio !== 'undefined') audio.playBouncePop();

        for (let s = 0; s < 6; s++) {
          const a = Math.random() * Math.PI * 2;
          this.sparks.push({
            x: box.x,
            y: box.y,
            vx: Math.cos(a) * (120 + Math.random() * 80),
            vy: Math.sin(a) * (120 + Math.random() * 80),
            life: 0.8,
            color: this.colorPalette[box.colorIdx]
          });
        }
      }

      if (player && player.isAlive && !player.isInvulnerable && box.hitCooldown <= 0) {
        const inX = (px >= box.x - box.w / 2 - player.radius && px <= box.x + box.w / 2 + player.radius);
        const inY = (py >= box.y - box.h / 2 - player.radius && py <= box.y + box.h / 2 + player.radius);
        if (inX && inY) {
          box.hitCooldown = 0.6;
          player.takeDamage(20);
          if (typeof audio !== 'undefined') audio.playHurt();
          if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
        }
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.life -= dt;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;

      if (player && player.isAlive && !player.isInvulnerable) {
        if (Math.hypot(px - sp.x, py - sp.y) < player.radius + 4) {
          player.takeDamage(10);
          sp.life = 0;
          if (typeof audio !== 'undefined') audio.playHurt();
          if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
        }
      }

      if (sp.life <= 0) this.sparks.splice(i, 1);
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    for (const box of this.boxes) {
      const color = this.colorPalette[box.colorIdx];
      ctx.save();
      ctx.translate(box.x, box.y);

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(-box.w / 2, -box.h / 2, box.w, box.h);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
      ctx.fillStyle = color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isKo ? '💿 화면보호기' : '💿 SAVER', 0, 4);

      ctx.restore();
    }

    for (const sp of this.sparks) {
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  onEnd() {
    this.boxes = [];
    this.sparks = [];
  }
}

// -------------------------------------------------------------
// EVENT 28: SHADOW CLONE EXE (INPUT / MIRROR THREAT)
// Glitch shadow duplicate copies player movement, trailing danger flames!
// -------------------------------------------------------------
class ShadowCloneEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'shadowClone',
      name: 'Shadow Clone EXE',
      category: 'INPUT',
      warningType: 'MIRROR PROCESS',
      duration: 5.5,
      instruction: 'SHADOW_PLAYER.EXE COPIES YOU! AVOID CROSSING ITS PATH'
    });
    this.cloneX = 320;
    this.cloneY = 220;
    this.trailNodes = [];
    this.trailInterval = 0;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.75,
      speedMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    const px = player ? player.x : 320;
    const py = player ? player.y : 220;
    this.cloneX = 640 - px;
    this.cloneY = 440 - py;
    this.trailNodes = [];
    this.trailInterval = 0;
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const px = player ? player.x : 320;
    const py = player ? player.y : 220;

    this.cloneX = 640 - px;
    this.cloneY = 440 - py;

    this.trailInterval += dt;
    if (this.trailInterval > 0.12) {
      this.trailInterval = 0;
      this.trailNodes.push({
        x: this.cloneX,
        y: this.cloneY,
        life: 1.4
      });
    }

    for (let i = this.trailNodes.length - 1; i >= 0; i--) {
      const node = this.trailNodes[i];
      node.life -= dt;

      if (player && player.isAlive && !player.isInvulnerable) {
        if (Math.hypot(px - node.x, py - node.y) < player.radius + 8) {
          player.takeDamage(15);
          node.life = 0;
          if (typeof audio !== 'undefined') audio.playHurt();
          if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
        }
      }

      if (node.life <= 0) this.trailNodes.splice(i, 1);
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    for (const node of this.trailNodes) {
      const alpha = Math.max(0, node.life / 1.4);
      ctx.fillStyle = `rgba(255, 30, 0, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(this.cloneX, this.cloneY);

    ctx.fillStyle = '#ff0033';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    ctx.fillStyle = '#ff0033';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isKo ? '그림자.EXE' : 'SHADOW.EXE', 0, -14);

    ctx.restore();
    ctx.restore();
  }

  onEnd() {
    this.trailNodes = [];
  }
}

// -------------------------------------------------------------
// EVENT 29: SELECTION BOX DRAG (SPACE / PURGE ZONE)
// Blue desktop selection box drags out, electrifying the selected area!
// -------------------------------------------------------------
class SelectionBoxDragEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'selectionBoxDrag',
      name: 'Selection Box Drag',
      category: 'SPACE',
      warningType: 'SELECTION BOX',
      duration: 6.0,
      instruction: 'SELECTION BOX DRAGGING! ESCAPE THE PURGE AREA'
    });
    this.boxes = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.65,
      speedMultiplier: 0.80
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.boxes = [];

    const isHard = (this.difficulty === 'HARD');
    const count = isHard ? 3 : 2;
    const interval = isHard ? 1.8 : 2.5;

    for (let i = 0; i < count; i++) {
      const w = 260 + Math.random() * 140;
      const h = 180 + Math.random() * 100;
      const x = 50 + Math.random() * (590 - w);
      const y = 40 + Math.random() * (400 - h);

      this.boxes.push({
        x: x,
        y: y,
        w: w,
        h: h,
        startTime: 0.4 + (i * interval),
        countdownDuration: isHard ? 1.0 : 1.3,
        purgeDuration: 0.6,
        state: 'WAITING',
        purged: false
      });
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const px = player ? player.x : 320;
    const py = player ? player.y : 220;

    for (const b of this.boxes) {
      if (b.state === 'DONE') continue;

      if (this.timer >= b.startTime) {
        const elapsed = this.timer - b.startTime;
        if (elapsed < b.countdownDuration) {
          b.state = 'DRAGGING';
        } else if (elapsed < b.countdownDuration + b.purgeDuration) {
          b.state = 'PURGING';
          if (!b.purged) {
            b.purged = true;
            if (typeof audio !== 'undefined') audio.playSelectionPurge();
          }

          if (player && player.isAlive && !player.isInvulnerable) {
            if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
              player.takeDamage(20);
              if (typeof audio !== 'undefined') audio.playHurt();
              if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
            }
          }
        } else {
          b.state = 'DONE';
        }
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;
    ctx.save();

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');

    for (const b of this.boxes) {
      if (b.state === 'WAITING' || b.state === 'DONE') continue;

      if (b.state === 'DRAGGING') {
        const elapsed = this.timer - b.startTime;
        const remain = Math.max(0, b.countdownDuration - elapsed).toFixed(1);

        ctx.fillStyle = 'rgba(0, 102, 204, 0.30)';
        ctx.fillRect(b.x, b.y, b.w, b.h);

        ctx.strokeStyle = '#0055ff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isKo ? `⚠️ [ 삭제 ${remain}s: 영역 이탈 ]` : `⚠️ [ PURGE ${remain}s: ESCAPE BOX ]`, b.x + b.w / 2, b.y + b.h / 2);
      } else if (b.state === 'PURGING') {
        ctx.fillStyle = (Math.floor(this.timer * 25) % 2 === 0) ? 'rgba(255, 0, 50, 0.65)' : 'rgba(255, 255, 255, 0.65)';
        ctx.fillRect(b.x, b.y, b.w, b.h);

        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      }
    }

    ctx.restore();
  }

  onEnd() {
    this.boxes = [];
  }
}

// ============================================================================
// 3. CENTRAL EVENT DIRECTOR (BETA v0.4 REFINED)
// ============================================================================
class EventDirector {
  constructor(arenaWidth, arenaHeight) {
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;

    this.state = 'NORMAL_BULLETS'; // NORMAL_BULLETS, EVENT_WARNING, EVENT_ACTIVE, EVENT_CLEAR
    this.activeEvent = null;
    this.pendingEvent = null;
    this.gameTime = 0;
    this.stateTimer = 10.0; // Section 39: first warning at exactly 10s
    this.survivedEventsCount = 0;

    // Anti-repetition & Category Memory
    this.historyQueue = [];
    this.lastCategory = null;

    // UI Cache
    this.warningBanner = document.getElementById('event-warning-banner');
    this.warningText = document.getElementById('event-warning-text');
    this.instructionBanner = document.getElementById('event-instruction-banner');
    this.instructionText = document.getElementById('event-instruction-text');
    this.timerBar = document.getElementById('event-timer-bar');
    this.feedbackBanner = document.getElementById('event-feedback-banner');
    this.feedbackText = document.getElementById('event-feedback-text');

    this.runCount = 0;
    this.autoEventsEnabled = true;
    this.lastEventId = null;

    // Complete Event Registry (26 Curated & Polished Events)
    this.eventRegistry = [
      PopupHellEvent,
      ReversedControlsEvent,
      CursorEnemyEvent,
      WindowShrinkEvent,
      FakeUpdateEvent,
      NoSignalEvent,
      MovingWindowEvent,
      TaskbarMalfunctionEvent,
      UIInvasionEvent,
      ColorErrorEvent,
      ScreenTearingEvent,
      NotificationSpamEvent,
      MouseTrailEvent,
      ZipBombEvent,
      ErrorLaserEvent,
      AntivirusScanEvent,
      DeleteKeyEvent,
      FirewallEvent,
      BlueScreenBgEvent,
      StartMenuBarrageEvent,
      RecycleBinVortexEvent,
      CmdHackAttackEvent,
      HostileClippyEvent,
      BouncingScreensaverEvent,
      ShadowCloneEvent,
      SelectionBoxDragEvent
    ];
  }

  reset() {
    if (this.activeEvent) {
      try {
        this.activeEvent.reset();
      } catch (e) {
        console.error("Event cleanup error:", e);
      }
      this.activeEvent = null;
    }
    this.pendingEvent = null;

    this.state = 'NORMAL_BULLETS';
    this.gameTime = 0;
    this.stateTimer = 10.0; // Exact first warning at 10.0s
    this.survivedEventsCount = 0;
    this.historyQueue = [];
    this.lastCategory = null;

    if (this.warningBanner) this.warningBanner.style.display = 'none';
    if (this.instructionBanner) this.instructionBanner.style.display = 'none';
    if (this.feedbackBanner) this.feedbackBanner.style.display = 'none';

    // Teardown DOM overlays
    const canvasContainer = document.getElementById('game-canvas-container');
    if (canvasContainer) {
      canvasContainer.classList.remove('malfunction-shrunk');
      canvasContainer.style.transform = '';
      canvasContainer.style.border = '';
    }

    const mainWin = document.getElementById('main-game-window');
    if (mainWin) mainWin.style.transform = 'translate(-50%, calc(-50% - 14px))';

    const popupsContainer = document.getElementById('popup-hell-container');
    if (popupsContainer) popupsContainer.innerHTML = '';

    const notifContainer = document.getElementById('notification-spam-container');
    if (notifContainer) notifContainer.innerHTML = '';

    const sbV = document.getElementById('fake-scrollbar-v');
    if (sbV) sbV.style.display = 'none';

    const sbH = document.getElementById('fake-scrollbar-h');
    if (sbH) sbH.style.display = 'none';

    document.querySelectorAll('.window-ghost-clone').forEach(el => el.remove());

    const updateDialog = document.getElementById('fake-update-dialog');
    if (updateDialog) updateDialog.style.display = 'none';

    const noSignal = document.getElementById('no-signal-overlay');
    if (noSignal) noSignal.style.display = 'none';

    const titleDrop = document.getElementById('title-drop-obstacle');
    if (titleDrop) titleDrop.style.display = 'none';

    const taskbarRise = document.getElementById('taskbar-rise-overlay');
    if (taskbarRise) taskbarRise.style.display = 'none';

    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.style.transform = 'none';
      canvas.style.filter = 'none';
    }
  }

  getRecoveryDuration() {
    // 0-30s: 4-6s, 30-60s: 3-4s, 60s+: 2-3s
    if (this.gameTime < 30) return 5.0;
    if (this.gameTime < 60) return 3.8;
    return 2.6;
  }

  getActiveBulletModifier() {
    if (this.activeEvent && typeof this.activeEvent.getBulletModifier === 'function') {
      try {
        return this.activeEvent.getBulletModifier();
      } catch (e) {
        console.error("Bullet modifier error:", e);
      }
    }
    return {
      speedMultiplier: 1.0,
      densityMultiplier: 1.0,
      suppressLasers: false,
      spawnBounds: null
    };
  }

  getCurrentEventInfo() {
    if (!this.activeEvent) {
      return {
        hasActive: false,
        id: '-',
        name: 'None',
        category: '-',
        difficulty: '-',
        elapsed: '0.0s',
        duration: '0.0s',
        status: 'INACTIVE',
        phase: this.state
      };
    }

    return {
      hasActive: true,
      id: this.activeEvent.id,
      name: this.activeEvent.name,
      category: this.activeEvent.category,
      difficulty: this.activeEvent.difficulty,
      elapsed: `${this.activeEvent.timer.toFixed(1)}s`,
      duration: `${this.activeEvent.duration.toFixed(1)}s`,
      status: this.activeEvent.isCompleted ? 'ENDING' : 'ACTIVE',
      phase: this.state
    };
  }

  update(dt, gameTime, player, hazards) {
    this.gameTime = gameTime;

    // 1. Update active event if present
    if (this.activeEvent) {
      const currentEv = this.activeEvent;
      try {
        currentEv.update(dt, player, hazards);
      } catch (err) {
        console.error("Active event update error:", err);
        const eventName = currentEv ? currentEv.name : 'Unknown Event';
        if (window.game && window.game.debugLog) {
          window.game.debugLog(`ERROR: ${eventName} update failed: ${err.message}`, 'error');
        }
        if (this.activeEvent) {
          this.activeEvent.hasError = true;
          this.handleEventFinished(this.activeEvent, player, hazards);
        }
      }

      // Guard against null activeEvent after completion
      if (this.activeEvent && this.timerBar) {
        const remainingPct = Math.max(0, 1 - (this.activeEvent.timer / this.activeEvent.duration)) * 100;
        this.timerBar.style.width = `${remainingPct}%`;
      }
    }

    // 2. Pacing State Machine (Skip auto-spawning if developer disabled auto events)
    if (!this.autoEventsEnabled && this.state === 'NORMAL_BULLETS') {
      return;
    }

    if (this.state === 'NORMAL_BULLETS') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.prepareNextEvent();
      }
    } else if (this.state === 'EVENT_WARNING') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.startPendingEvent(player, hazards);
      }
    } else if (this.state === 'EVENT_CLEAR') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.feedbackBanner) this.feedbackBanner.style.display = 'none';
        this.state = 'NORMAL_BULLETS';
        this.stateTimer = this.getRecoveryDuration();
        if (window.game && window.game.hudStatusMsg) {
          window.game.hudStatusMsg.textContent = getLoc('hud', 'normalPeriod');
        }
      }
    }
  }

  prepareNextEvent() {
    let SelectedClass = null;

    // Section 12: First-Run Event Curation
    if (this.runCount === 0) {
      if (this.survivedEventsCount === 0) {
        SelectedClass = PopupHellEvent;
      } else if (this.survivedEventsCount === 1) {
        SelectedClass = CursorEnemyEvent;
      } else if (this.survivedEventsCount === 2) {
        SelectedClass = WindowShrinkEvent;
      }
    }

    if (!SelectedClass) {
      // Select candidate avoiding last 3 events and same category
      const candidates = this.eventRegistry.filter(EC => {
        const temp = new EC();
        if (this.historyQueue.includes(temp.id)) return false;
        if (temp.category === this.lastCategory) return false;
        return true;
      });

      if (candidates.length > 0) {
        SelectedClass = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        this.historyQueue = [];
        SelectedClass = this.eventRegistry[Math.floor(Math.random() * this.eventRegistry.length)];
      }
    }

    this.pendingEvent = new SelectedClass();

    // Assign difficulty
    if (this.gameTime < 30) this.pendingEvent.setDifficulty('EASY');
    else if (this.gameTime < 65) this.pendingEvent.setDifficulty(Math.random() < 0.65 ? 'NORMAL' : 'EASY');
    else this.pendingEvent.setDifficulty(Math.random() < 0.6 ? 'HARD' : 'NORMAL');

    // 0.8s Warning Telegraph
    this.state = 'EVENT_WARNING';
    this.stateTimer = 0.8;

    if (this.warningBanner && this.warningText) {
      const locWarning = (typeof getLocalizedWarning === 'function') 
        ? getLocalizedWarning(this.pendingEvent.warningType) 
        : this.pendingEvent.warningType;
      this.warningText.textContent = `⚠️ ${locWarning}`;
      this.warningBanner.style.display = 'block';
    }
    if (typeof audio !== 'undefined') audio.playWarningTelegraph();
  }

  startPendingEvent(player, hazards) {
    if (this.warningBanner) this.warningBanner.style.display = 'none';

    this.activeEvent = this.pendingEvent;
    this.pendingEvent = null;

    if (!this.activeEvent) return;

    // Track history
    this.historyQueue.push(this.activeEvent.id);
    if (this.historyQueue.length > 3) this.historyQueue.shift();
    this.lastCategory = this.activeEvent.category;
    this.lastEventId = this.activeEvent.id;

    try {
      this.activeEvent.start(this, player, hazards);
      this.state = 'EVENT_ACTIVE';
      if (window.game && window.game.debugLog) {
        window.game.debugLog(`EVENT START — ${this.activeEvent.id.toUpperCase()} [${this.activeEvent.difficulty}]`, 'start');
      }
    } catch (e) {
      console.error("Event start error:", e);
      if (window.game && window.game.debugLog) {
        window.game.debugLog(`ERROR: ${this.activeEvent ? this.activeEvent.name : 'Event'} start failed: ${e.message}`, 'error');
      }
      if (this.activeEvent) {
        this.activeEvent.hasError = true;
        this.handleEventFinished(this.activeEvent, player, hazards);
      }
      return;
    }

    if (this.instructionBanner && this.instructionText) {
      const locInst = (typeof getLoc === 'function') 
        ? (getLoc('events', this.activeEvent.id, 'instruction') || this.activeEvent.instruction)
        : this.activeEvent.instruction;
      this.instructionText.textContent = locInst;
      this.instructionBanner.style.display = 'flex';
    }
    if (typeof audio !== 'undefined') audio.playAlert();
  }

  handleEventFinished(eventInstance, player, hazards) {
    const finishedId = eventInstance ? eventInstance.id : (this.activeEvent ? this.activeEvent.id : 'unknown');
    this.activeEvent = null;
    this.survivedEventsCount++;

    if (this.instructionBanner) this.instructionBanner.style.display = 'none';
    if (this.feedbackBanner) this.feedbackBanner.style.display = 'none';

    // Award score & combo
    if (window.game) {
      window.game.onEventSurvive(eventInstance ? eventInstance.reward : 100);
      window.game.triggerClearFeedback();
      if (window.game.debugLog) {
        window.game.debugLog(`EVENT END — ${finishedId.toUpperCase()} (CLEANUP OK)`, 'end');
      }
    }

    if (typeof audio !== 'undefined') audio.playClear();

    // Roll for Section 36 HP_FIX.EXE Health Drop
    // Clean survival (took 0 damage during event): 65% drop chance
    // Default survival: 40% drop chance
    const isClean = (window.game && typeof window.game.wasCleanEventSurvival === 'function')
      ? window.game.wasCleanEventSurvival()
      : (window.game ? window.game.streak > 0 : false);
    const dropRate = isClean ? 0.65 : 0.40;

    const currentHazards = hazards || this.hazards || (window.game ? window.game.hazards : null);
    const currentPlayer = player || this.player || (window.game ? window.game.player : null);

    if (Math.random() < dropRate && currentHazards) {
      const playerX = currentPlayer ? currentPlayer.x : 320;
      const playerY = currentPlayer ? currentPlayer.y : 220;

      let spawnX = 60 + Math.random() * (this.arenaWidth - 120);
      let spawnY = 60 + Math.random() * (this.arenaHeight - 120);

      // Keep minimum 80px distance from player so it requires deliberate collection
      const dist = Math.hypot(spawnX - playerX, spawnY - playerY);
      if (dist < 80) {
        spawnX = playerX < 320 ? spawnX + 100 : spawnX - 100;
        spawnY = playerY < 220 ? spawnY + 80 : spawnY - 80;
        spawnX = Math.max(50, Math.min(this.arenaWidth - 50, spawnX));
        spawnY = Math.max(50, Math.min(this.arenaHeight - 50, spawnY));
      }

      currentHazards.spawnHealthPickup(spawnX, spawnY, 6.5);
    }

    this.state = 'EVENT_CLEAR';
    this.stateTimer = 0.4;
  }

  forceEndCurrentEvent() {
    if (this.activeEvent) {
      try {
        this.activeEvent.complete();
      } catch (e) {
        console.error("Force end error:", e);
        this.reset();
      }
    }
  }

  triggerManualEvent(eventId, diff = 'NORMAL', player, hazards) {
    if (this.activeEvent) {
      try {
        this.activeEvent.reset();
      } catch (e) {
        console.error("Reset error during manual trigger:", e);
      }
      this.activeEvent = null;
    }

    const TargetClass = this.eventRegistry.find(EC => (new EC()).id === eventId);
    if (!TargetClass) return false;

    this.activeEvent = new TargetClass();
    this.activeEvent.setDifficulty(diff);
    this.lastEventId = this.activeEvent.id;

    try {
      this.activeEvent.start(this, player, hazards);
      this.state = 'EVENT_ACTIVE';
      if (window.game && window.game.debugLog) {
        window.game.debugLog(`MANUAL TEST — ${this.activeEvent.id.toUpperCase()} [${diff}]`, 'start');
      }
    } catch (err) {
      console.error("Manual event start error:", err);
      if (window.game && window.game.debugLog) {
        window.game.debugLog(`ERROR: Manual test of ${eventId} failed: ${err.message}`, 'error');
      }
      this.activeEvent.hasError = true;
      this.handleEventFinished(this.activeEvent);
      return false;
    }

    if (this.instructionBanner && this.instructionText) {
      const locInst = (typeof getLoc === 'function') 
        ? (getLoc('events', this.activeEvent.id, 'instruction') || this.activeEvent.instruction)
        : this.activeEvent.instruction;
      this.instructionText.textContent = locInst;
      this.instructionBanner.style.display = 'flex';
    }
    return true;
  }

  drawBackground(ctx) {
    if (this.activeEvent && typeof this.activeEvent.drawBackground === 'function') {
      try {
        this.activeEvent.drawBackground(ctx);
      } catch (e) {
        console.error("Event drawBackground error:", e);
      }
    }
  }

  drawFloor(ctx) {
    if (this.activeEvent && typeof this.activeEvent.drawFloor === 'function') {
      try {
        this.activeEvent.drawFloor(ctx);
      } catch (e) {
        console.error("Event drawFloor error:", e);
      }
    }
  }

  draw(ctx) {
    if (this.activeEvent && typeof this.activeEvent.draw === 'function') {
      try {
        this.activeEvent.draw(ctx);
      } catch (e) {
        console.error("Event draw error:", e);
      }
    }
  }
}
