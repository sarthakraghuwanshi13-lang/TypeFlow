/* ============================================
   TypeFlow — Background Animation Module
   Subtle floating particles with pink/yellow glow
   ============================================ */

export class BackgroundAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.rafId = null;
    this.running = false;
    this.mouse = { x: -1000, y: -1000 };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this._resize = this._resize.bind(this);
    this._animate = this._animate.bind(this);

    window.addEventListener('resize', this._resize);
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  /**
   * Start the animation.
   */
  start() {
    if (!this.canvas || this.running) return;
    this.running = true;
    this._resize();
    this._createParticles();
    this._animate();
  }

  /**
   * Stop the animation.
   */
  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Resize canvas to fill window.
   */
  _resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * Create particles with varied sizes and colors.
   */
  _createParticles() {
    // Use fewer particles on lower-end devices
    const count = Math.min(60, Math.floor((this.width * this.height) / 25000));
    this.particles = [];

    const colors = [
      { r: 232, g: 185, b: 49 },   // golden yellow
      { r: 244, g: 114, b: 182 },   // pink
      { r: 200, g: 160, b: 60 },    // warm gold
      { r: 220, g: 100, b: 160 },   // deeper pink
      { r: 180, g: 140, b: 220 },   // soft lavender
    ];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2 - 0.1,
        opacity: Math.random() * 0.3 + 0.05,
        maxOpacity: Math.random() * 0.35 + 0.08,
        color,
        pulseSpeed: Math.random() * 0.008 + 0.003,
        pulseOffset: Math.random() * Math.PI * 2,
        glowSize: Math.random() * 20 + 10,
      });
    }
  }

  /**
   * Main animation loop.
   */
  _animate() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const time = performance.now() * 0.001;

    for (const p of this.particles) {
      // Movement
      p.x += p.speedX;
      p.y += p.speedY;

      // Subtle mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150 * 0.3;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      // Wrap around edges
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;
      if (p.y < -20) p.y = this.height + 20;
      if (p.y > this.height + 20) p.y = -20;

      // Pulsing opacity
      const pulse = Math.sin(time * p.pulseSpeed * 10 + p.pulseOffset);
      p.opacity = p.maxOpacity * (0.5 + pulse * 0.5);

      // Draw glow
      const { r, g, b } = p.color;
      const gradient = this.ctx.createRadialGradient(
        p.x, p.y, 0, p.x, p.y, p.glowSize
      );
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.6})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.15})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      this.ctx.beginPath();
      this.ctx.fillStyle = gradient;
      this.ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw core dot
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw subtle connection lines between nearby particles
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.08;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(232, 185, 49, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    this.rafId = requestAnimationFrame(this._animate);
  }

  /**
   * Clean up resources.
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._resize);
  }
}
