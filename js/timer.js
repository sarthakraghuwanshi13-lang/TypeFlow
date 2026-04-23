/* ============================================
   TypeFlow — Timer Module
   ============================================ */

/**
 * Creates a countdown timer for time-based tests.
 * Uses requestAnimationFrame for smooth, non-drifting updates.
 */
export class CountdownTimer {
  constructor(durationSeconds, onTick, onEnd) {
    this.duration = durationSeconds;
    this.onTick = onTick;
    this.onEnd = onEnd;
    this.startTime = null;
    this.rafId = null;
    this.running = false;
    this.remaining = durationSeconds;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now();
    this._tick();
  }

  _tick() {
    if (!this.running) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    this.remaining = Math.max(0, this.duration - elapsed);

    this.onTick(Math.ceil(this.remaining), elapsed);

    if (this.remaining <= 0) {
      this.running = false;
      this.onEnd();
      return;
    }

    this.rafId = requestAnimationFrame(() => this._tick());
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getElapsed() {
    if (!this.startTime) return 0;
    return (performance.now() - this.startTime) / 1000;
  }

  reset(newDuration) {
    this.stop();
    this.duration = newDuration || this.duration;
    this.remaining = this.duration;
    this.startTime = null;
  }
}

/**
 * Creates a stopwatch for word-based tests (counts up).
 */
export class Stopwatch {
  constructor(onTick) {
    this.onTick = onTick;
    this.startTime = null;
    this.rafId = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now();
    this._tick();
  }

  _tick() {
    if (!this.running) return;
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.onTick(elapsed);
    this.rafId = requestAnimationFrame(() => this._tick());
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getElapsed() {
    if (!this.startTime) return 0;
    return (performance.now() - this.startTime) / 1000;
  }

  reset() {
    this.stop();
    this.startTime = null;
  }
}
