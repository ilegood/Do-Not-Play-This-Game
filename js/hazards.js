/**
 * DO NOT PLAY THIS GAME — Continuous Bullet-Hell Engine (Beta v0.4 Refined)
 * Generates continuous, readable, fair, and event-adaptive projectile patterns.
 */

// ============================================================================
// 1. BASE BULLET / HAZARD CLASS
// ============================================================================
class BaseHazard {
  constructor(x, y, vx, vy, size = 10, damage = 20) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.damage = damage;
    this.isDead = false;
  }

  update(dt, arenaW, arenaH) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Despawn when out of arena bounds (with padding)
    const pad = 40;
    if (this.x < -pad || this.x > arenaW + pad || this.y < -pad || this.y > arenaH + pad) {
      this.isDead = true;
    }
  }

  getBounds() {
    const half = this.size / 2;
    return {
      x: this.x - half,
      y: this.y - half,
      width: this.size,
      height: this.size
    };
  }

  draw(ctx) {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const half = this.size / 2;

    ctx.save();
    ctx.translate(x, y);

    // Standard Projectile (Retro Glitch Pellet)
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(-half, -half, this.size, this.size);

    ctx.fillStyle = '#ffff66';
    ctx.fillRect(-half + 1, -half + 1, this.size - 2, this.size - 2);

    ctx.restore();
  }
}

// ============================================================================
// 2. SPECIALIZED HAZARDS
// ============================================================================

// A. Falling System File / Floppy Icon
class FallingFileHazard extends BaseHazard {
  constructor(x, y, vy, fileType = 'floppy') {
    super(x, y, 0, vy, 18, 20);
    this.fileType = fileType;
    this.rot = (Math.random() - 0.5) * 0.4;
  }

  draw(ctx) {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const half = this.size / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.rot);

    ctx.fillStyle = '#000080';
    ctx.fillRect(-half, -half, this.size, this.size);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-half + 0.5, -half + 0.5, this.size - 1, this.size - 1);

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.fileType === 'floppy' ? '💾' : '📁', 0, 0);

    ctx.restore();
  }
}

// B. Bouncing Win98 Error Box
class BouncingErrorHazard extends BaseHazard {
  constructor(x, y, speed = 140) {
    super(x, y, 0, 0, 24, 20);
    const angle = (Math.PI / 4) + (Math.PI / 2) * Math.floor(Math.random() * 4);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 12.0;
  }

  update(dt, arenaW, arenaH) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.isDead = true;

    const half = this.size / 2;
    if (this.x < half) { this.x = half; this.vx = Math.abs(this.vx); }
    if (this.x > arenaW - half) { this.x = arenaW - half; this.vx = -Math.abs(this.vx); }
    if (this.y < half) { this.y = half; this.vy = Math.abs(this.vy); }
    if (this.y > arenaH - half) { this.y = arenaH - half; this.vy = -Math.abs(this.vy); }
  }

  draw(ctx) {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const half = this.size / 2;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(-half, -half, this.size, this.size);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-half + 0.5, -half + 0.5, this.size - 1, this.size - 1);

    ctx.fillStyle = '#cc0000';
    ctx.fillRect(-half + 2, -half + 2, this.size - 4, 6);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('ERR', 0, half - 3);

    ctx.restore();
  }
}

// C. Warning Line Laser Hazard
class WarningLaserHazard {
  constructor(y, dir = 1, delay = 0.65) {
    this.y = y;
    this.dir = dir; // 1 from left, -1 from right
    this.delay = delay;
    this.timer = 0;
    this.hasFired = false;
    this.isDead = false;
    this.damage = 25;
  }

  update(dt, arenaW, arenaH, hazardManager) {
    this.timer += dt;
    if (this.timer >= this.delay && !this.hasFired) {
      this.hasFired = true;
      if (typeof audio !== 'undefined') audio.playLaserWarning();
      const startX = this.dir === 1 ? -20 : arenaW + 20;
      const vx = this.dir * 600;
      hazardManager.spawn(new BaseHazard(startX, this.y, vx, 0, 16, this.damage));
      this.isDead = true;
    }
  }

  draw(ctx, arenaW) {
    if (this.hasFired) return;
    ctx.save();
    ctx.strokeStyle = Math.floor(this.timer * 20) % 2 === 0 ? '#ff0000' : 'rgba(255, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);

    ctx.beginPath();
    ctx.moveTo(0, this.y);
    ctx.lineTo(arenaW, this.y);
    ctx.stroke();

    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('⚠️ WARNING: LASER RAIL', 20, this.y - 4);
    ctx.restore();
  }
}

// D. Retro Health Recovery Pickup (HP_FIX.EXE)
class HealthPickup {
  constructor(x, y, lifetime = 6.5) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.lifetime = lifetime;
    this.timer = 0;
    this.isDead = false;
    this.healAmount = 20;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.lifetime) {
      this.isDead = true;
    }
  }

  getBounds() {
    const half = this.size / 2;
    return {
      x: this.x - half,
      y: this.y - half,
      width: this.size,
      height: this.size
    };
  }

  draw(ctx) {
    const remaining = this.lifetime - this.timer;
    // Subtle blink in the final 2.5 seconds
    if (remaining < 2.5) {
      if (Math.floor(remaining * 6) % 2 === 0) return;
    }

    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const half = this.size / 2;

    ctx.save();
    ctx.translate(x, y);

    // Subtle pulsing animation
    const pulse = 1.0 + Math.sin(this.timer * 6) * 0.12;
    ctx.scale(pulse, pulse);

    // Retro File Box
    ctx.fillStyle = '#004d1a';
    ctx.fillRect(-half, -half, this.size, this.size);

    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-half + 0.5, -half + 0.5, this.size - 1, this.size - 1);

    // Green System Cross Icon (+)
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(-2, -6, 4, 12);
    ctx.fillRect(-6, -2, 12, 4);

    // Label tag
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#00ff66';
    ctx.textAlign = 'center';
    ctx.fillText('HP_FIX', 0, half + 9);

    ctx.restore();
  }
}

// ============================================================================
// 3. CENTRAL HAZARD MANAGER & PATTERN CONTROLLER
// ============================================================================
class HazardManager {
  constructor(arenaWidth, arenaHeight) {
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;
    this.hazards = [];
    this.warningLasers = [];
    this.healthPickups = [];

    // Pattern Timers
    this.streamTimer = 0;
    this.fanTimer = 0;
    this.sideTimer = 0;
    this.fallingTimer = 0;
    this.laserTimer = 0;
    this.bouncingTimer = 0;
    this.streamAngle = 0;
    this.sideIndex = 0;
    this.bulletDifficultyOverride = null; // 'OFF', 'EASY', 'NORMAL', 'HARD', 'CHAOS', or null
  }

  reset() {
    this.hazards = [];
    this.warningLasers = [];
    this.healthPickups = [];
    this.streamTimer = 0;
    this.fanTimer = 0;
    this.sideTimer = 0;
    this.fallingTimer = 0;
    this.laserTimer = 0;
    this.bouncingTimer = 0;
    this.streamAngle = 0;
    this.sideIndex = 0;
    this.bulletDifficultyOverride = null;
  }

  clearAllHazards() {
    this.hazards = [];
    this.warningLasers = [];
  }

  clearAllHealthPickups() {
    this.healthPickups = [];
  }

  spawn(hazard) {
    this.hazards.push(hazard);
  }

  spawnHealthPickup(x, y, lifetime = 6.5) {
    this.healthPickups.push(new HealthPickup(x, y, lifetime));
  }

  spawnBouncingError(x, y, speed = 140) {
    this.spawn(new BouncingErrorHazard(x, y, speed));
  }

  update(dt, gameTime, player, bulletModifier = {}) {
    // 1. Update active bullets & hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.update(dt, this.arenaWidth, this.arenaHeight);
      if (h.isDead) {
        this.hazards.splice(i, 1);
      }
    }

    // 2. Update Warning Lasers
    for (let i = this.warningLasers.length - 1; i >= 0; i--) {
      const wl = this.warningLasers[i];
      wl.update(dt, this.arenaWidth, this.arenaHeight, this);
      if (wl.isDead) {
        this.warningLasers.splice(i, 1);
      }
    }

    // 3. Update Health Pickups (HP_FIX.EXE)
    for (let i = this.healthPickups.length - 1; i >= 0; i--) {
      const p = this.healthPickups[i];
      p.update(dt);
      if (p.isDead) {
        this.healthPickups.splice(i, 1);
      }
    }

    // 4. Bullet-Hell Pattern Orchestrator (Difficulty Scaling & Event Adaptation)
    this.updatePatterns(dt, gameTime, player, bulletModifier);
  }

  updatePatterns(dt, gameTime, player, bulletModifier) {
    // Bullet difficulty override check
    if (this.bulletDifficultyOverride === 'OFF') {
      return; // Do not spawn bullets when turned OFF in debug toolkit
    }

    let effectiveTime = gameTime;
    if (this.bulletDifficultyOverride === 'EASY') effectiveTime = 10;
    else if (this.bulletDifficultyOverride === 'NORMAL') effectiveTime = 40;
    else if (this.bulletDifficultyOverride === 'HARD') effectiveTime = 70;
    else if (this.bulletDifficultyOverride === 'CHAOS') effectiveTime = 100;

    const speedMult = bulletModifier.speedMultiplier || 1.0;
    const densityMult = bulletModifier.densityMultiplier || 1.0;
    const suppressLasers = bulletModifier.suppressLasers || false;
    const bounds = bulletModifier.spawnBounds || { minX: 0, maxX: this.arenaWidth, minY: 0, maxY: this.arenaHeight };

    // Pattern 1: Basic Stream (Active in all phases)
    this.streamTimer += dt * densityMult;
    const streamInterval = effectiveTime < 30 ? 0.65 : (effectiveTime < 60 ? 0.45 : 0.32);
    if (this.streamTimer >= streamInterval) {
      this.streamTimer = 0;
      this.streamAngle += 0.25;
      const speed = (effectiveTime < 30 ? 140 : (effectiveTime < 60 ? 175 : 210)) * speedMult;
      const arenaSpan = (bounds.maxX - bounds.minX) * 0.4;
      const startX = ((bounds.minX + bounds.maxX) / 2) + Math.cos(this.streamAngle) * arenaSpan;
      const vx = Math.cos(this.streamAngle) * 40 * speedMult;
      this.spawn(new BaseHazard(startX, bounds.minY - 10, vx, speed, 10, 20));
    }

    // Pattern 2: Side Pressure (Starts at 5-10s)
    if (effectiveTime >= 5) {
      this.sideTimer += dt * densityMult;
      const sideInterval = effectiveTime < 30 ? 1.5 : (effectiveTime < 60 ? 1.0 : 0.7);
      if (this.sideTimer >= sideInterval) {
        this.sideTimer = 0;
        this.sideIndex = (this.sideIndex + 1) % 2;
        const fromLeft = this.sideIndex === 0;
        const startX = fromLeft ? bounds.minX - 10 : bounds.maxX + 10;
        const startY = bounds.minY + 40 + Math.random() * (bounds.maxY - bounds.minY - 80);
        const vx = (fromLeft ? (150 + Math.random() * 40) : (-150 - Math.random() * 40)) * speedMult;
        this.spawn(new BaseHazard(startX, startY, vx, 0, 11, 20));
      }
    }

    // Pattern 3: Fan Shot (Starts at 25s)
    if (effectiveTime >= 25) {
      this.fanTimer += dt * densityMult;
      const fanInterval = effectiveTime < 60 ? 3.6 : 2.5;
      if (this.fanTimer >= fanInterval) {
        this.fanTimer = 0;
        const count = effectiveTime < 60 ? 3 : 5;
        const originX = bounds.minX + 60 + Math.random() * (bounds.maxX - bounds.minX - 120);
        const baseAngle = Math.PI / 2; // downwards
        const spread = Math.PI / 4;
        const speed = (effectiveTime < 60 ? 160 : 190) * speedMult;

        for (let i = 0; i < count; i++) {
          const angle = baseAngle - (spread / 2) + (spread / (count - 1)) * i;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          this.spawn(new BaseHazard(originX, bounds.minY - 10, vx, vy, 10, 20));
        }
      }
    }

    // Pattern 4: Falling Files (Starts at 35s)
    if (effectiveTime >= 35) {
      this.fallingTimer += dt * densityMult;
      const fallInterval = effectiveTime < 60 ? 2.8 : 1.8;
      if (this.fallingTimer >= fallInterval) {
        this.fallingTimer = 0;
        const rx = bounds.minX + 40 + Math.random() * (bounds.maxX - bounds.minX - 80);
        const type = Math.random() > 0.5 ? 'floppy' : 'folder';
        const vy = (120 + Math.random() * 50) * speedMult;
        this.spawn(new FallingFileHazard(rx, bounds.minY - 15, vy, type));
      }
    }

    // Pattern 5: Warning Laser Rail (Starts at 55s)
    if (effectiveTime >= 55 && !suppressLasers) {
      this.laserTimer += dt * densityMult;
      const laserInterval = effectiveTime < 90 ? 5.5 : 3.8;
      if (this.laserTimer >= laserInterval) {
        this.laserTimer = 0;
        const targetY = player.y + (Math.random() - 0.5) * 80;
        const clampedY = Math.max(bounds.minY + 30, Math.min(bounds.maxY - 30, targetY));
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.warningLasers.push(new WarningLaserHazard(clampedY, dir, 0.65));
      }
    }

    // Pattern 6: Bouncing Error Hazard (Starts at 45s, max 1 active)
    if (effectiveTime >= 45) {
      this.bouncingTimer += dt;
      const hasBouncer = this.hazards.some(h => h instanceof BouncingErrorHazard);
      if (!hasBouncer && this.bouncingTimer > 10) {
        this.bouncingTimer = 0;
        const bx = player.x > 320 ? bounds.minX + 60 : bounds.maxX - 60;
        const by = player.y > 220 ? bounds.minY + 60 : bounds.maxY - 60;
        this.spawnBouncingError(bx, by, (effectiveTime > 80 ? 180 : 140) * speedMult);
      }
    }
  }

  checkCollisions(player) {
    if (player.hp <= 0) return;

    const pBounds = player.getBounds();

    // 1. Check Health Item Pickups
    for (let i = this.healthPickups.length - 1; i >= 0; i--) {
      const hpItem = this.healthPickups[i];
      if (this.rectIntersect(pBounds, hpItem.getBounds())) {
        player.heal(hpItem.healAmount);
        hpItem.isDead = true;
        this.healthPickups.splice(i, 1);
        if (typeof audio !== 'undefined') audio.playHeal();
        if (window.game) {
          window.game.onHealthItemCollected();
        }
      }
    }

    // 2. Check Bullet Collisions
    if (player.invulnerable) return;

    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      const hBounds = h.getBounds();

      if (this.rectIntersect(pBounds, hBounds)) {
        player.takeDamage(h.damage);
        if (!(h instanceof BouncingErrorHazard)) {
          h.isDead = true;
        }
        break;
      }
    }
  }

  rectIntersect(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }

  // Debug Lab Triggers
  triggerTestPattern(patternName) {
    if (patternName === 'stream') {
      this.spawn(new BaseHazard(this.arenaWidth / 2, -10, 0, 180, 10, 20));
    } else if (patternName === 'fan') {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI / 2) - (Math.PI / 8) + ((Math.PI / 4) / (count - 1)) * i;
        this.spawn(new BaseHazard(this.arenaWidth / 2, -10, Math.cos(angle) * 170, Math.sin(angle) * 170, 10, 20));
      }
    } else if (patternName === 'side') {
      this.spawn(new BaseHazard(-10, 200, 160, 0, 12, 20));
      this.spawn(new BaseHazard(this.arenaWidth + 10, 250, -160, 0, 12, 20));
    } else if (patternName === 'falling') {
      this.spawn(new FallingFileHazard(150, -15, 140, 'floppy'));
      this.spawn(new FallingFileHazard(450, -15, 140, 'folder'));
    } else if (patternName === 'laser') {
      this.warningLasers.push(new WarningLaserHazard(220, 1, 0.65));
    } else if (patternName === 'bouncer') {
      this.spawnBouncingError(320, 220, 160);
    }
  }

  draw(ctx) {
    // 1. Draw Health Pickups
    for (const hpItem of this.healthPickups) {
      hpItem.draw(ctx);
    }
    // 2. Draw Warning Lasers
    for (const wl of this.warningLasers) {
      wl.draw(ctx, this.arenaWidth);
    }
    // 3. Draw Hazards
    for (const h of this.hazards) {
      h.draw(ctx);
    }
  }
}
