/**
 * BAEL - LORD OF ALL
 * AI Thinking Visualization
 * =========================
 * Beautiful animated visualization of AI reasoning processes
 */

class BaelThinkingViz {
  constructor() {
    this.isThinking = false;
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;

    this.init();
  }

  init() {
    this.createElements();
    this.bindEvents();
    console.log("🧠 Bael Thinking Visualization initialized");
  }

  createElements() {
    // Create thinking indicator
    const container = document.createElement("div");
    container.id = "bael-thinking";
    container.className = "bael-thinking hidden";
    container.innerHTML = `
            <canvas id="bael-thinking-canvas"></canvas>
            <div class="btv-content">
                <div class="btv-brain">🧠</div>
                <div class="btv-text">
                    <span class="btv-status">Reasoning</span>
                    <span class="btv-dots"><span>.</span><span>.</span><span>.</span></span>
                </div>
                <div class="btv-stage" id="btv-stage">Analyzing input</div>
                <div class="btv-metrics">
                    <div class="btv-metric">
                        <span class="btv-metric-label">Tokens</span>
                        <span class="btv-metric-value" id="btv-tokens">0</span>
                    </div>
                    <div class="btv-metric">
                        <span class="btv-metric-label">Time</span>
                        <span class="btv-metric-value" id="btv-time">0.0s</span>
                    </div>
                </div>
            </div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            .bael-thinking {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9990;
                transition: all 0.3s ease;
            }

            .bael-thinking.hidden {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
                pointer-events: none;
            }

            #bael-thinking-canvas {
                position: absolute;
                width: 300px;
                height: 120px;
                top: -20px;
                left: -50px;
                pointer-events: none;
            }

            .btv-content {
                background: var(--color-panel);
                border: 1px solid var(--color-primary);
                border-radius: var(--radius-xl);
                padding: 16px 24px;
                box-shadow: var(--shadow-lg), var(--shadow-glow);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                min-width: 200px;
            }

            .btv-brain {
                font-size: 32px;
                animation: btv-pulse 1.5s ease-in-out infinite;
            }

            @keyframes btv-pulse {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.1); filter: brightness(1.3); }
            }

            .btv-text {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .btv-status {
                font-weight: 600;
                color: var(--color-text);
                font-size: 14px;
            }

            .btv-dots span {
                color: var(--color-primary);
                animation: btv-dot 1.4s infinite;
                font-weight: bold;
            }

            .btv-dots span:nth-child(2) { animation-delay: 0.2s; }
            .btv-dots span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes btv-dot {
                0%, 60%, 100% { opacity: 0; }
                30% { opacity: 1; }
            }

            .btv-stage {
                font-size: 12px;
                color: var(--color-text-muted);
                text-align: center;
            }

            .btv-metrics {
                display: flex;
                gap: 24px;
                margin-top: 8px;
            }

            .btv-metric {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .btv-metric-label {
                font-size: 10px;
                color: var(--color-text-muted);
                text-transform: uppercase;
            }

            .btv-metric-value {
                font-family: var(--font-mono);
                font-size: 14px;
                color: var(--color-primary);
            }

            /* Particle styles */
            .btv-particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--color-primary);
                border-radius: 50%;
                pointer-events: none;
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    this.container = container;
    this.canvas = document.getElementById("bael-thinking-canvas");
    this.ctx = this.canvas.getContext("2d");

    // Set canvas size
    this.canvas.width = 300;
    this.canvas.height = 120;
  }

  bindEvents() {
    // Listen for thinking events
    window.addEventListener("bael-thinking-start", (e) => {
      this.start(e.detail);
    });

    window.addEventListener("bael-thinking-update", (e) => {
      this.update(e.detail);
    });

    window.addEventListener("bael-thinking-stop", () => {
      this.stop();
    });

    // Watch for agent activity
    this.observeAgentActivity();
  }

  observeAgentActivity() {
    // Observe typing indicators, loading states, etc.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (
                node.classList &&
                (node.classList.contains("typing-indicator") ||
                  node.classList.contains("agent-thinking") ||
                  node.classList.contains("loading"))
              ) {
                this.start();
              }
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (
                node.classList &&
                (node.classList.contains("typing-indicator") ||
                  node.classList.contains("agent-thinking") ||
                  node.classList.contains("loading"))
              ) {
                this.stop();
              }
            }
          });
        }
      });
    });

    // Start observing when body is ready
    observer.observe(document.body, { childList: true, subtree: true });
  }

  start(data = {}) {
    if (this.isThinking) return;

    this.isThinking = true;
    this.startTime = Date.now();
    this.tokenCount = 0;
    this.container.classList.remove("hidden");

    this.setStage(data.stage || "Processing request");
    this.initParticles();
    this.animate();
    this.startTimer();
  }

  update(data = {}) {
    if (data.stage) this.setStage(data.stage);
    if (data.tokens) this.tokenCount = data.tokens;

    document.getElementById("btv-tokens").textContent =
      this.tokenCount.toLocaleString();
  }

  stop() {
    if (!this.isThinking) return;

    this.isThinking = false;

    setTimeout(() => {
      this.container.classList.add("hidden");
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }, 300);
  }

  setStage(stage) {
    const stageEl = document.getElementById("btv-stage");
    if (stageEl) {
      stageEl.style.opacity = 0;
      setTimeout(() => {
        stageEl.textContent = stage;
        stageEl.style.opacity = 1;
      }, 150);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      document.getElementById("btv-time").textContent =
        elapsed.toFixed(1) + "s";
    }, 100);
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }
  }

  animate() {
    if (!this.isThinking) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Get primary color
    const style = getComputedStyle(document.documentElement);
    const primaryRGB =
      style.getPropertyValue("--color-primary-rgb").trim() || "220, 20, 60";

    // Update and draw particles
    this.particles.forEach((p) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Pulse alpha
      p.alpha = 0.3 + Math.sin(Date.now() * 0.005 + p.x) * 0.3;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${primaryRGB}, ${p.alpha})`;
      this.ctx.fill();
    });

    // Draw connections
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach((p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${primaryRGB}, ${0.3 * (1 - dist / 50)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  // Simulate thinking stages
  simulateThinking() {
    const stages = [
      "Analyzing input",
      "Processing context",
      "Searching memory",
      "Reasoning",
      "Generating response",
      "Optimizing output",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (!this.isThinking || i >= stages.length) {
        clearInterval(interval);
        return;
      }
      this.setStage(stages[i]);
      this.tokenCount += Math.floor(Math.random() * 500) + 100;
      document.getElementById("btv-tokens").textContent =
        this.tokenCount.toLocaleString();
      i++;
    }, 1500);
  }
}

// Initialize
let baelThinkingViz;
document.addEventListener("DOMContentLoaded", () => {
  baelThinkingViz = new BaelThinkingViz();
  window.baelThinkingViz = baelThinkingViz;
});
