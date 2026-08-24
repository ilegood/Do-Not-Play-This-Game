/**
 * DO NOT PLAY THIS GAME — Player Controller & Character Logic (Beta v0.4)
 * Precision 12x12 bullet-hell collision box with visible center core pixel.
 */

class Player {
  constructor(arenaWidth, arenaHeight) {
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;

    // Sprite & Collision Dimensions
    this.visualSize = 24;  // 24x24 px retro CRT character
    this.hitboxSize = 12;  // 12x12 px precision collision core

    this.x = arenaWidth / 2;
    this.y = arenaHeight / 2;
    this.speed = 260;

    // Health & i-Frames
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 1.0; // 1 second i-frames on hit
    this.flashTimer = 0;

    // Event Modifiers
    this.controlsReversed = false;
    this.disabledKey = null; // 'W', 'A', 'S', 'D'
    this.hasFakeLag = false;
    this.fakeLagDelay = 0.08; // 80ms subtle lag
    this.inputLagQueue = [];
    this.customBounds = null; // { xMin, xMax, yMin, yMax }

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.facing = 1;
    this.isMoving = false;
    this.blinkTimer = 0;
    this.isBlinking = false;
  }

  get isAlive() {
    return this.hp > 0;
  }

  get isInvulnerable() {
    return this.invulnerable;
  }

  get radius() {
    return this.hitboxSize / 2;
  }

  reset() {
    this.x = this.arenaWidth / 2;
    this.y = this.arenaHeight / 2;
    this.hp = this.maxHp;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.flashTimer = 0;

    this.controlsReversed = false;
    this.disabledKey = null;
    this.hasFakeLag = false;
    this.inputLagQueue = [];
    this.customBounds = null;
    this.isMoving = false;

    this.keys = { up: false, down: false, left: false, right: false };
  }

  handleKeyDown(key) {
    const k = key.toLowerCase();
    if (k === 'w' || k === 'arrowup') this.keys.up = true;
    if (k === 's' || k === 'arrowdown') this.keys.down = true;
    if (k === 'a' || k === 'arrowleft') this.keys.left = true;
    if (k === 'd' || k === 'arrowright') this.keys.right = true;
  }

  handleKeyUp(key) {
    const k = key.toLowerCase();
    if (k === 'w' || k === 'arrowup') this.keys.up = false;
    if (k === 's' || k === 'arrowdown') this.keys.down = false;
    if (k === 'a' || k === 'arrowleft') this.keys.left = false;
    if (k === 'd' || k === 'arrowright') this.keys.right = false;
  }

  resetKeys() {
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
    this.isMoving = false;
    this.inputLagQueue = [];
  }

  takeDamage(amount = 20) {
    if (window.game && window.game.isInvincible) return false;
    if (this.invulnerable || this.hp <= 0) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnerable = true;
    this.invulnerableTimer = this.invulnerableDuration;
    this.flashTimer = 0;

    if (typeof audio !== 'undefined') {
      audio.playHurt();
    }

    if (window.game) {
      window.game.onPlayerHit();
    }
    return true;
  }

  heal(amount = 20) {
    if (this.hp <= 0) return 0;
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - oldHp;
  }

  update(dt) {
    // 1. Filter out disabled key (Event 07: Sticky Key)
    let up = this.keys.up;
    let down = this.keys.down;
    let left = this.keys.left;
    let right = this.keys.right;

    if (this.disabledKey) {
      const dk = this.disabledKey.toLowerCase();
      if (dk === 'w' || dk === 'up') up = false;
      if (dk === 's' || dk === 'down') down = false;
      if (dk === 'a' || dk === 'left') left = false;
      if (dk === 'd' || dk === 'right') right = false;
    }

    // 2. Reversed Controls (Event 02)
    if (this.controlsReversed) {
      const tempUp = up;
      const tempDown = down;
      const tempLeft = left;
      const tempRight = right;

      up = tempDown;
      down = tempUp;
      left = tempRight;
      right = tempLeft;
    }

    let dx = 0;
    let dy = 0;
    if (up) dy -= 1;
    if (down) dy += 1;
    if (left) { dy === 0 && (this.facing = -1); dx -= 1; }
    if (right) { dy === 0 && (this.facing = 1); dx += 1; }

    this.isMoving = (dx !== 0 || dy !== 0);

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const invLen = 1 / Math.SQRT2;
      dx *= invLen;
      dy *= invLen;
    }

    // 3. Fake Lag (Event 11)
    if (this.hasFakeLag) {
      this.inputLagQueue.push({ dx, dy, time: performance.now() });
      const cutoff = performance.now() - (this.fakeLagDelay * 1000);
      let appliedDx = 0;
      let appliedDy = 0;

      while (this.inputLagQueue.length > 0 && this.inputLagQueue[0].time <= cutoff) {
        const item = this.inputLagQueue.shift();
        appliedDx = item.dx;
        appliedDy = item.dy;
      }
      this.x += appliedDx * this.speed * dt;
      this.y += appliedDy * this.speed * dt;
    } else {
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
    }

    // 4. Arena Boundary Clamping
    const half = this.visualSize / 2;
    let minX = half;
    let maxX = this.arenaWidth - half;
    let minY = half;
    let maxY = this.arenaHeight - half;

    if (this.customBounds) {
      minX = Math.max(minX, this.customBounds.xMin + half);
      maxX = Math.min(maxX, this.customBounds.xMax - half);
      minY = Math.max(minY, this.customBounds.yMin + half);
      maxY = Math.min(maxY, this.customBounds.yMax - half);
    }

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));

    // 5. Invulnerability Timer
    if (this.invulnerable) {
      this.invulnerableTimer -= dt;
      this.flashTimer += dt;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
        this.invulnerableTimer = 0;
      }
    }

    // 6. Natural Eye Blinking
    this.blinkTimer += dt;
    if (this.isBlinking) {
      if (this.blinkTimer > 0.12) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    } else {
      if (this.blinkTimer > 2.8 + Math.random() * 1.5) {
        this.isBlinking = true;
        this.blinkTimer = 0;
      }
    }
  }

  getBounds() {
    // Tight 12x12 precision hitbox
    const half = this.hitboxSize / 2;
    return {
      x: this.x - half,
      y: this.y - half,
      width: this.hitboxSize,
      height: this.hitboxSize
    };
  }

  draw(ctx) {
    // Flash while invulnerable
    if (this.invulnerable && Math.floor(this.flashTimer * 16) % 2 === 0) {
      return;
    }

    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const half = this.visualSize / 2;

    ctx.save();
    ctx.translate(x, y);

    // Monitor Outer Casing (Retro Beige)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(-half, -half, this.visualSize, this.visualSize);

    // Bevel edges
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-half, -half, this.visualSize, 1);
    ctx.fillRect(-half, -half, 1, this.visualSize);

    ctx.fillStyle = '#808080';
    ctx.fillRect(-half, half - 1, this.visualSize, 1);
    ctx.fillRect(half - 1, -half, 1, this.visualSize);

    // CRT Screen Inset
    const screenPadding = 3;
    const sw = this.visualSize - screenPadding * 2;
    const sh = this.visualSize - screenPadding * 2;

    ctx.fillStyle = '#001122';
    ctx.fillRect(-half + screenPadding, -half + screenPadding, sw, sh);

    // Character Face on CRT Screen
    const faceColor = this.invulnerable ? '#ffffff' : '#00ff66';
    ctx.fillStyle = faceColor;

    if (this.isBlinking) {
      ctx.fillRect(-4, -2, 3, 1);
      ctx.fillRect(2, -2, 3, 1);
    } else {
      const eyeOffset = this.facing === 1 ? 1 : -1;
      ctx.fillRect(-4 + eyeOffset, -3, 2, 3);
      ctx.fillRect(2 + eyeOffset, -3, 2, 3);
    }

    // Mouth
    if (this.invulnerable || this.controlsReversed) {
      ctx.fillRect(-1, 2, 3, 2); // Startled
    } else {
      ctx.fillRect(-3, 2, 1, 1);
      ctx.fillRect(-2, 3, 4, 1);
      ctx.fillRect(2, 2, 1, 1);
    }

    // Glowing Precision Hitbox Center Dot
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-1, -1, 2, 2);

    ctx.restore();
  }
}
