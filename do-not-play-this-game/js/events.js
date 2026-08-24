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

    for (let i = 0; i < count; i++) {
      const bx = 120 + (i * 180);
      const by = 100 + (i * 90);
      this.boxes.push({ x: bx, y: by, w: 90, h: 60, title: `DIALOG_${i + 1}.EXE` });
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
// EVENT 14: TITLE BAR DROP (SPACE)
// -------------------------------------------------------------
class TitleBarDropEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'title_bar_drop',
      name: 'Title Bar Drop',
      category: 'SPACE',
      warningType: 'SPACE CORRUPTION',
      duration: 5.5,
      instruction: 'TITLE BAR DETACHED!'
    });
    this.barEl = document.getElementById('title-drop-obstacle');
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    if (this.barEl) {
      this.barEl.style.display = 'block';
      this.barEl.style.top = this.difficulty === 'HARD' ? '180px' : '120px';
    }
  }

  onEnd() {
    if (this.barEl) this.barEl.style.display = 'none';
  }
}

// -------------------------------------------------------------
// EVENT 15: TASKBAR MALFUNCTION (SPACE)
// Bullet safety: constrains bullet bounds to above taskbar
// -------------------------------------------------------------
class TaskbarMalfunctionEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'taskbar_malfunction',
      name: 'Taskbar Malfunction',
      category: 'SPACE',
      warningType: 'SPACE CORRUPTION',
      duration: 5.5,
      instruction: 'TASKBAR EXPANDING UPWARD!'
    });
    this.taskbarEl = document.getElementById('taskbar-rise-overlay');
    this.riseHeight = 70;
  }

  getBulletModifier() {
    return {
      spawnBounds: {
        minX: 0,
        maxX: 640,
        minY: 0,
        maxY: 440 - this.riseHeight
      }
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.riseHeight = this.difficulty === 'HARD' ? 100 : (this.difficulty === 'EASY' ? 45 : 70);
    if (this.taskbarEl) {
      this.taskbarEl.style.display = 'block';
      this.taskbarEl.style.height = `${this.riseHeight}px`;
    }

    player.customBounds = {
      xMin: 0,
      xMax: 640,
      yMin: 0,
      yMax: 440 - this.riseHeight
    };
  }

  onEnd() {
    if (this.taskbarEl) this.taskbarEl.style.display = 'none';
    if (this.player) this.player.customBounds = null;
  }
}

// -------------------------------------------------------------
// EVENT 12: SCREEN TEARING (VISION)
// Horizontal display splitting into desynced staggered strips
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
    this.slicesCount = 5;
    this.sliceOffsets = [];
    this.sliceBounds = [];
    this.glitchTimer = 0;
    this.glitchOffset = 0;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
  }

  getBulletModifier() {
    return {
      speedMultiplier: 0.85,
      densityMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.slicesCount = this.difficulty === 'HARD' ? 6 : (this.difficulty === 'EASY' ? 3 : 5);
    
    // Dynamic organic slice heights across the 440px canvas
    this.sliceBounds = [];
    const totalH = 440;
    let currentY = 0;
    const baseH = totalH / this.slicesCount;
    
    for (let i = 0; i < this.slicesCount; i++) {
      let h;
      if (i === this.slicesCount - 1) {
        h = totalH - currentY;
      } else {
        const variance = (Math.random() - 0.5) * (baseH * 0.4);
        h = Math.round(Math.max(30, Math.min(baseH * 1.5, baseH + variance)));
      }
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

    const maxShift = this.difficulty === 'HARD' ? 32 : (this.difficulty === 'EASY' ? 14 : 22);

    this.glitchTimer += dt;
    if (this.glitchTimer > 0.45) {
      this.glitchTimer = 0;
      this.glitchOffset = (Math.random() - 0.5) * maxShift * 1.6;
    } else {
      this.glitchOffset *= 0.85;
    }

    for (let i = 0; i < this.slicesCount; i++) {
      const freq = 3.2 + i * 1.8;
      const phase = i * 2.3;
      const isGlitchedSlice = (i % 2 === 0);
      const extraGlitch = isGlitchedSlice ? this.glitchOffset : -this.glitchOffset * 0.5;
      this.sliceOffsets[i] = Math.sin(this.timer * freq + phase) * maxShift + extraGlitch;
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
        offset, slice.y, 640, slice.h       // dest rect shifted horizontally!
      );

      // If shifted, fill the empty margin with retro dark background
      if (offset > 0) {
        ctx.fillStyle = '#06080d';
        ctx.fillRect(0, slice.y, offset, slice.h);
      } else if (offset < 0) {
        ctx.fillStyle = '#06080d';
        ctx.fillRect(640 + offset, slice.y, -offset, slice.h);
      }

      // RGB Desync Glow Line at Tear Boundary
      if (i > 0 && Math.abs(offset) > 3) {
        ctx.save();
        ctx.strokeStyle = offset > 0 ? 'rgba(0, 255, 255, 0.85)' : 'rgba(255, 20, 80, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, slice.y);
        ctx.lineTo(640, slice.y);
        ctx.stroke();

        // Subtle chromatic tint on torn strip
        ctx.fillStyle = offset > 0 ? 'rgba(0, 255, 255, 0.06)' : 'rgba(255, 0, 80, 0.06)';
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
// EVENT 15: WINDOW GHOST (WINDOW / VISION)
// Translucent duplicate ghost frames offset behind the main game window
// -------------------------------------------------------------
class WindowGhostEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'window_ghost',
      name: 'Window Ghost',
      category: 'WINDOW',
      warningType: 'DUPLICATE WINDOW DETECTED',
      duration: 5.0,
      instruction: 'DUPLICATE WINDOW DETECTED!'
    });
    this.windowEl = document.getElementById('main-game-window');
    this.clones = [];
  }

  getBulletModifier() {
    return {
      speedMultiplier: 0.85,
      densityMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.removeClones();

    const cloneCount = this.difficulty === 'HARD' ? 2 : 1;
    const desktop = document.getElementById('desktop');
    if (!desktop || !this.windowEl) return;

    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    for (let i = 0; i < cloneCount; i++) {
      const clone = document.createElement('div');
      clone.className = 'win98-window win98-box-outset window-ghost-clone';
      const title = isKo ? `👻 유령_창_${i + 1}.EXE` : `👻 GHOST_FRAME_${i + 1}.EXE`;
      const body = isKo ? `[ 복제된 뷰포트 감지됨 ]` : `[ GHOST VIEWPORT DETECTED ]`;
      clone.innerHTML = `
        <div class="win98-titlebar" style="background: linear-gradient(90deg, #505080, #7070b0);">
          <div class="titlebar-left"><span>${title}</span></div>
        </div>
        <div style="width: 648px; height: 476px; background-color: #000000; display: flex; align-items: center; justify-content: center; color: #00ff66; font-family: monospace; font-size: 11px;">
          ${body}
        </div>
      `;
      desktop.appendChild(clone);
      this.clones.push(clone);
    }
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const baseOffset = this.difficulty === 'HARD' ? 45 : (this.difficulty === 'EASY' ? 22 : 32);

    for (let i = 0; i < this.clones.length; i++) {
      const clone = this.clones[i];
      const dir = (i === 0) ? 1 : -1;
      const offsetX = Math.sin(this.timer * 2.5 + i) * baseOffset * dir;
      const offsetY = Math.cos(this.timer * 2.0 + i) * (baseOffset * 0.7) * dir;

      clone.style.left = '50%';
      clone.style.top = '50%';
      clone.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% - 14px + ${offsetY}px))`;
    }
  }

  removeClones() {
    for (const c of this.clones) {
      if (c && c.parentNode) c.parentNode.removeChild(c);
    }
    this.clones = [];
  }

  onEnd() {
    this.removeClones();
  }
}

// -------------------------------------------------------------
// EVENT 16: SCROLLBAR MALFUNCTION (SPACE / UI)
// Fake retro scrollbars expand inward and constrict playable space
// -------------------------------------------------------------
class ScrollbarMalfunctionEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'scrollbar_malfunction',
      name: 'Scrollbar Malfunction',
      category: 'SPACE',
      warningType: 'WINDOW SIZE ERROR',
      duration: 5.5,
      instruction: 'SCROLLBARS SQUEEZING PLAYABLE SPACE!'
    });
    this.sbV = document.getElementById('fake-scrollbar-v');
    this.sbH = document.getElementById('fake-scrollbar-h');
    this.vWidth = 38;
    this.hHeight = 32;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.80,
      spawnBounds: {
        minX: 0,
        maxX: 640 - this.vWidth,
        minY: 0,
        maxY: 440 - this.hHeight
      }
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);

    if (this.difficulty === 'EASY') {
      this.vWidth = 32;
      this.hHeight = 0;
    } else if (this.difficulty === 'HARD') {
      this.vWidth = 60;
      this.hHeight = 50;
    } else {
      this.vWidth = 40;
      this.hHeight = 34;
    }

    if (this.sbV) {
      this.sbV.style.display = 'flex';
      this.sbV.style.width = `${this.vWidth}px`;
    }
    if (this.sbH && this.hHeight > 0) {
      this.sbH.style.display = 'flex';
      this.sbH.style.height = `${this.hHeight}px`;
      this.sbH.style.right = `${this.vWidth}px`;
    }

    player.customBounds = {
      xMin: 0,
      xMax: 640 - this.vWidth,
      yMin: 0,
      yMax: 440 - this.hHeight
    };
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    const thumbV = document.getElementById('sb-thumb-v');
    const thumbH = document.getElementById('sb-thumb-h');
    if (thumbV) {
      const topPct = 20 + Math.sin(this.timer * 3) * 20;
      thumbV.style.top = `${topPct}%`;
    }
    if (thumbH) {
      const leftPct = 20 + Math.cos(this.timer * 2.5) * 20;
      thumbH.style.left = `${leftPct}%`;
    }
  }

  onEnd() {
    if (this.sbV) this.sbV.style.display = 'none';
    if (this.sbH) this.sbH.style.display = 'none';
    if (this.player) this.player.customBounds = null;
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

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(zip.label, 0, 24);
        
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
class ErrorLaserEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'errorLaser',
      name: 'Error Laser',
      category: 'ATTACK',
      warningType: 'CRITICAL ERROR',
      duration: 6.0,
      instruction: 'ERROR TURRET ACTIVATED! DODGE THE BEAM'
    });
    this.strikes = [];
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.80,
      suppressLasers: true
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.strikes = [];

    const isEasy = (this.difficulty === 'EASY');
    const isHard = (this.difficulty === 'HARD');

    const strike1 = {
      x: 0,
      y: 120 + Math.random() * 200,
      angle: 0,
      startTime: 0.4,
      aimDuration: isHard ? 0.65 : 0.85,
      fireDuration: 0.65,
      beamWidth: isHard ? 34 : (isEasy ? 24 : 28),
      fired: false,
      warned: false
    };
    this.strikes.push(strike1);

    if (!isEasy) {
      const strike2 = {
        x: 160 + Math.random() * 320,
        y: 0,
        angle: Math.PI / 2,
        startTime: 2.4,
        aimDuration: isHard ? 0.65 : 0.85,
        fireDuration: 0.65,
        beamWidth: isHard ? 34 : 28,
        fired: false,
        warned: false
      };
      this.strikes.push(strike2);
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

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(strike.x - 16, strike.y - 12, 32, 24);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(strike.x - 16, strike.y - 12, 32, 24);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('❌', strike.x, strike.y + 4);

        ctx.restore();
      } else if (strike.state === 'FIRING') {
        ctx.save();

        ctx.strokeStyle = 'rgba(255, 0, 60, 0.4)';
        ctx.lineWidth = strike.beamWidth + 16;
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = strike.beamWidth;
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(4, strike.beamWidth / 3);
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(strike.x, strike.y, 16 + Math.sin(this.timer * 30) * 4, 0, Math.PI * 2);
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
// EVENT 19: ANTIVIRUS SCAN (ATTACK / SWEEP)
// Sweeping radar scan field searches for the player with threat zone
// -------------------------------------------------------------
class AntivirusScanEvent extends BaseInterferenceEvent {
  constructor() {
    super({
      id: 'antivirusScan',
      name: 'Antivirus Scan',
      category: 'ATTACK',
      warningType: 'SCAN IN PROGRESS',
      duration: 6.0,
      instruction: 'THREAT DETECTED: PLAYER! AVOID SCAN FIELD'
    });
    this.scanX = -100;
    this.scanDirection = 1;
    this.passCount = 0;
    this.sweepSpeed = 160;
  }

  getBulletModifier() {
    return {
      densityMultiplier: 0.75,
      speedMultiplier: 0.85
    };
  }

  start(director, player, hazards) {
    super.start(director, player, hazards);
    this.scanX = -40;
    this.scanDirection = 1;
    this.passCount = 0;
    this.sweepSpeed = (this.difficulty === 'HARD') ? 220 : ((this.difficulty === 'NORMAL') ? 170 : 130);
    if (typeof audio !== 'undefined') audio.playScanSweep();
  }

  update(dt, player, hazards) {
    super.update(dt, player, hazards);
    if (this.isCompleted) return;

    this.scanX += this.scanDirection * this.sweepSpeed * dt;

    if (this.scanDirection === 1 && this.scanX > 640 + 40) {
      if (this.difficulty !== 'EASY' && this.passCount === 0) {
        this.scanDirection = -1;
        this.passCount++;
        if (typeof audio !== 'undefined') audio.playScanSweep();
      }
    } else if (this.scanDirection === -1 && this.scanX < -40) {
      if (this.difficulty === 'HARD' && this.passCount === 1) {
        this.scanDirection = 1;
        this.passCount++;
        if (typeof audio !== 'undefined') audio.playScanSweep();
      }
    }

    const playerX = player ? player.x : 320;
    const beamWidth = 32;

    if (player && player.isAlive && !player.isInvulnerable) {
      if (Math.abs(playerX - this.scanX) < beamWidth / 2 + player.radius) {
        player.takeDamage(15);
        if (typeof audio !== 'undefined') audio.playHurt();
        if (window.game && window.game.onPlayerHit) window.game.onPlayerHit();
      }
    }
  }

  draw(ctx) {
    if (this.isCompleted) return;

    ctx.save();
    const beamWidth = 32;

    const trailDir = this.scanDirection === 1 ? -1 : 1;
    const grad = ctx.createLinearGradient(this.scanX, 0, this.scanX + trailDir * 120, 0);
    grad.addColorStop(0, 'rgba(255, 0, 50, 0.28)');
    grad.addColorStop(1, 'rgba(255, 0, 50, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(Math.min(this.scanX, this.scanX + trailDir * 120), 0, 120, 440);

    ctx.strokeStyle = '#ff0033';
    ctx.lineWidth = beamWidth;
    ctx.beginPath();
    ctx.moveTo(this.scanX, 0);
    ctx.lineTo(this.scanX, 440);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.scanX, 0);
    ctx.lineTo(this.scanX, 440);
    ctx.stroke();

    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    const isKo = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ko');
    const label = isKo ? '⚠️ 위협 요소 감지: PLAYER.EXE' : '⚠️ THREAT DETECTED: PLAYER.EXE';
    ctx.fillText(label, 320, 24);

    ctx.restore();
  }

  onEnd() {
    this.scanX = -100;
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
        ctx.fillText('▼ PORT OPEN ▼', wall.gapStart + wall.gapWidth / 2, wall.pos - 6);
      } else {
        this.drawWallSegment(ctx, wall.pos, 0, wall.thickness, wall.gapStart);
        this.drawWallSegment(ctx, wall.pos, wall.gapStart + wall.gapWidth, wall.thickness, 440 - (wall.gapStart + wall.gapWidth));

        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▶ PORT ▶', wall.pos - 6, wall.gapStart + wall.gapWidth / 2);
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

    // Complete Event Registry (22 Curated & Polished Events)
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
      TitleBarDropEvent,
      ScreenTearingEvent,
      NotificationSpamEvent,
      MouseTrailEvent,
      WindowGhostEvent,
      ScrollbarMalfunctionEvent,
      ZipBombEvent,
      ErrorLaserEvent,
      AntivirusScanEvent,
      DeleteKeyEvent,
      FirewallEvent,
      BlueScreenBgEvent
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
