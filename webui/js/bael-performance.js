/**
 * BAEL - LORD OF ALL
 * Performance Dashboard
 * =====================
 * Real-time system performance monitoring and analytics
 */

class BaelPerformanceDashboard {
  constructor() {
    this.metrics = {
      fps: [],
      memory: [],
      network: [],
      cpu: [],
    };
    this.maxDataPoints = 60;
    this.isVisible = false;

    this.init();
  }

  init() {
    this.createDashboard();
    this.startMonitoring();
    console.log("📈 Bael Performance Dashboard initialized");
  }

  createDashboard() {
    const dashboard = document.createElement("div");
    dashboard.id = "bael-perf-dashboard";
    dashboard.className = "bael-perf-dashboard hidden";
    dashboard.innerHTML = `
            <div class="bpd-header" onclick="baelPerf.toggleMinimize()">
                <span class="bpd-title">📈 Performance Monitor</span>
                <div class="bpd-controls">
                    <button class="bpd-btn" onclick="event.stopPropagation(); baelPerf.export()">📥</button>
                    <button class="bpd-btn" onclick="event.stopPropagation(); baelPerf.hide()">✕</button>
                </div>
            </div>
            <div class="bpd-content">
                <div class="bpd-grid">
                    <!-- FPS Chart -->
                    <div class="bpd-card">
                        <div class="bpd-card-header">
                            <span>Frame Rate</span>
                            <span class="bpd-value" id="bpd-fps">--</span>
                        </div>
                        <canvas id="bpd-fps-chart" width="200" height="60"></canvas>
                    </div>

                    <!-- Memory Chart -->
                    <div class="bpd-card">
                        <div class="bpd-card-header">
                            <span>Memory</span>
                            <span class="bpd-value" id="bpd-memory">--</span>
                        </div>
                        <canvas id="bpd-memory-chart" width="200" height="60"></canvas>
                    </div>

                    <!-- Network Stats -->
                    <div class="bpd-card">
                        <div class="bpd-card-header">
                            <span>Network</span>
                            <span class="bpd-value" id="bpd-network">--</span>
                        </div>
                        <div class="bpd-stats">
                            <div class="bpd-stat-item">
                                <span class="bpd-stat-label">Requests</span>
                                <span class="bpd-stat-value" id="bpd-requests">0</span>
                            </div>
                            <div class="bpd-stat-item">
                                <span class="bpd-stat-label">Latency</span>
                                <span class="bpd-stat-value" id="bpd-latency">--</span>
                            </div>
                        </div>
                    </div>

                    <!-- DOM Stats -->
                    <div class="bpd-card">
                        <div class="bpd-card-header">
                            <span>DOM</span>
                            <span class="bpd-value" id="bpd-dom">--</span>
                        </div>
                        <div class="bpd-stats">
                            <div class="bpd-stat-item">
                                <span class="bpd-stat-label">Elements</span>
                                <span class="bpd-stat-value" id="bpd-elements">0</span>
                            </div>
                            <div class="bpd-stat-item">
                                <span class="bpd-stat-label">Listeners</span>
                                <span class="bpd-stat-value" id="bpd-listeners">~</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Heisenberg Integration -->
                <div class="bpd-heisenberg">
                    <h4>🧠 Heisenberg Singularity Status</h4>
                    <div class="bpd-h-grid" id="bpd-heisenberg-stats">
                        <div class="bpd-h-stat">
                            <span class="bpd-h-label">Coherence</span>
                            <div class="bpd-h-bar">
                                <div class="bpd-h-fill" id="bpd-h-coherence" style="width: 0%"></div>
                            </div>
                            <span class="bpd-h-value" id="bpd-h-coherence-val">--%</span>
                        </div>
                        <div class="bpd-h-stat">
                            <span class="bpd-h-label">Entanglement</span>
                            <div class="bpd-h-bar">
                                <div class="bpd-h-fill" id="bpd-h-entanglement" style="width: 0%"></div>
                            </div>
                            <span class="bpd-h-value" id="bpd-h-entanglement-val">--%</span>
                        </div>
                        <div class="bpd-h-stat">
                            <span class="bpd-h-label">Stability</span>
                            <div class="bpd-h-bar">
                                <div class="bpd-h-fill" id="bpd-h-stability" style="width: 0%"></div>
                            </div>
                            <span class="bpd-h-value" id="bpd-h-stability-val">--%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            .bael-perf-dashboard {
                position: fixed;
                bottom: 20px;
                left: 80px;
                width: 450px;
                background: var(--color-panel);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 9996;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .bael-perf-dashboard.hidden {
                display: none;
            }

            .bael-perf-dashboard.minimized .bpd-content {
                display: none;
            }

            .bpd-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: var(--color-surface);
                cursor: pointer;
            }

            .bpd-title {
                font-weight: 600;
                color: var(--color-text);
                font-size: 14px;
            }

            .bpd-controls {
                display: flex;
                gap: 8px;
            }

            .bpd-btn {
                width: 28px;
                height: 28px;
                background: transparent;
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: all 0.2s;
            }

            .bpd-btn:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
            }

            .bpd-content {
                padding: 16px;
            }

            .bpd-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }

            .bpd-card {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                padding: 12px;
            }

            .bpd-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 12px;
                color: var(--color-text-secondary);
            }

            .bpd-value {
                font-family: var(--font-mono);
                font-size: 14px;
                font-weight: 600;
                color: var(--color-primary);
            }

            .bpd-card canvas {
                width: 100%;
                height: 60px;
            }

            .bpd-stats {
                display: flex;
                gap: 16px;
            }

            .bpd-stat-item {
                flex: 1;
            }

            .bpd-stat-label {
                display: block;
                font-size: 10px;
                color: var(--color-text-muted);
                margin-bottom: 4px;
            }

            .bpd-stat-value {
                font-family: var(--font-mono);
                font-size: 16px;
                color: var(--color-text);
            }

            /* Heisenberg Section */
            .bpd-heisenberg {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--color-border);
            }

            .bpd-heisenberg h4 {
                margin: 0 0 12px;
                font-size: 13px;
                color: var(--color-text);
            }

            .bpd-h-grid {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .bpd-h-stat {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .bpd-h-label {
                font-size: 11px;
                color: var(--color-text-secondary);
                width: 80px;
            }

            .bpd-h-bar {
                flex: 1;
                height: 6px;
                background: var(--color-background);
                border-radius: var(--radius-full);
                overflow: hidden;
            }

            .bpd-h-fill {
                height: 100%;
                background: var(--gradient-primary);
                border-radius: var(--radius-full);
                transition: width 0.5s ease;
            }

            .bpd-h-value {
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--color-primary);
                width: 40px;
                text-align: right;
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(dashboard);

    this.dashboard = dashboard;
    this.fpsCanvas = document.getElementById("bpd-fps-chart");
    this.memoryCanvas = document.getElementById("bpd-memory-chart");
    this.fpsCtx = this.fpsCanvas.getContext("2d");
    this.memoryCtx = this.memoryCanvas.getContext("2d");
  }

  startMonitoring() {
    // FPS monitoring
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const now = performance.now();

      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        this.metrics.fps.push(fps);
        if (this.metrics.fps.length > this.maxDataPoints) {
          this.metrics.fps.shift();
        }

        frames = 0;
        lastTime = now;

        if (this.isVisible) {
          this.updateDisplay();
        }
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Memory monitoring (if available)
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory.usedJSHeapSize / (1024 * 1024);
        this.metrics.memory.push(memory);
        if (this.metrics.memory.length > this.maxDataPoints) {
          this.metrics.memory.shift();
        }
      }, 1000);
    }

    // Network monitoring
    this.requestCount = 0;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.requestCount++;
      const start = performance.now();
      const response = await originalFetch(...args);
      const latency = performance.now() - start;
      this.lastLatency = latency;
      return response;
    };

    // Update Heisenberg stats periodically
    setInterval(() => this.updateHeisenbergStats(), 2000);
  }

  updateDisplay() {
    // FPS
    const currentFPS = this.metrics.fps[this.metrics.fps.length - 1] || 0;
    document.getElementById("bpd-fps").textContent = currentFPS + " fps";
    document.getElementById("bpd-fps").style.color =
      currentFPS < 30
        ? "var(--color-error)"
        : currentFPS < 50
          ? "var(--color-warning)"
          : "var(--color-success)";
    this.drawChart(this.fpsCtx, this.metrics.fps, 60, "var(--color-success)");

    // Memory
    if (performance.memory) {
      const currentMem =
        this.metrics.memory[this.metrics.memory.length - 1] || 0;
      document.getElementById("bpd-memory").textContent =
        currentMem.toFixed(1) + " MB";
      this.drawChart(
        this.memoryCtx,
        this.metrics.memory,
        performance.memory.jsHeapSizeLimit / (1024 * 1024),
        "var(--color-primary)",
      );
    } else {
      document.getElementById("bpd-memory").textContent = "N/A";
    }

    // Network
    document.getElementById("bpd-requests").textContent = this.requestCount;
    document.getElementById("bpd-latency").textContent = this.lastLatency
      ? Math.round(this.lastLatency) + "ms"
      : "--";

    // DOM
    const elements = document.querySelectorAll("*").length;
    document.getElementById("bpd-elements").textContent =
      elements.toLocaleString();
    document.getElementById("bpd-dom").textContent =
      elements < 1000 ? "Good" : elements < 3000 ? "OK" : "Heavy";
  }

  drawChart(ctx, data, maxVal, color) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    // Get color from CSS variable
    const style = getComputedStyle(document.documentElement);
    const primaryRGB =
      style.getPropertyValue("--color-primary-rgb").trim() || "220, 20, 60";

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `rgba(${primaryRGB}, 0.2)`);
    gradient.addColorStop(1, `rgba(${primaryRGB}, 0)`);

    ctx.beginPath();
    ctx.moveTo(0, height);

    data.forEach((val, i) => {
      const x = (i / (this.maxDataPoints - 1)) * width;
      const y = height - (val / maxVal) * height;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = (i / (this.maxDataPoints - 1)) * width;
      const y = height - (val / maxVal) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgb(${primaryRGB})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  async updateHeisenbergStats() {
    try {
      const response = await fetch("/heisenberg/status");
      if (response.ok) {
        const data = await response.json();

        const coherence = (data.quantum_coherence || 0) * 100;
        const entanglement = (data.entanglement_density || 0) * 100;
        const stability = (data.stability_index || 0) * 100;

        document.getElementById("bpd-h-coherence").style.width =
          coherence + "%";
        document.getElementById("bpd-h-coherence-val").textContent =
          coherence.toFixed(0) + "%";

        document.getElementById("bpd-h-entanglement").style.width =
          entanglement + "%";
        document.getElementById("bpd-h-entanglement-val").textContent =
          entanglement.toFixed(0) + "%";

        document.getElementById("bpd-h-stability").style.width =
          stability + "%";
        document.getElementById("bpd-h-stability-val").textContent =
          stability.toFixed(0) + "%";
      }
    } catch (e) {
      // Heisenberg not available, show placeholder values
      ["coherence", "entanglement", "stability"].forEach((metric) => {
        document.getElementById(`bpd-h-${metric}`).style.width = "0%";
        document.getElementById(`bpd-h-${metric}-val`).textContent = "--%";
      });
    }
  }

  show() {
    this.isVisible = true;
    this.dashboard.classList.remove("hidden");
    this.updateDisplay();
  }

  hide() {
    this.isVisible = false;
    this.dashboard.classList.add("hidden");
  }

  toggle() {
    this.isVisible ? this.hide() : this.show();
  }

  toggleMinimize() {
    this.dashboard.classList.toggle("minimized");
  }

  export() {
    const data = {
      timestamp: new Date().toISOString(),
      fps: this.metrics.fps,
      memory: this.metrics.memory,
      requestCount: this.requestCount,
      domElements: document.querySelectorAll("*").length,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bael-perf-${new Date().toISOString().slice(0, 16)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize
let baelPerf;
document.addEventListener("DOMContentLoaded", () => {
  baelPerf = new BaelPerformanceDashboard();
  window.baelPerf = baelPerf;

  // Register with command palette
  if (window.baelPalette) {
    window.baelPalette.register({
      id: "perf.toggle",
      title: "Toggle Performance Monitor",
      description: "Show/hide performance dashboard",
      icon: "📈",
      category: "actions",
      action: () => baelPerf.toggle(),
    });
  }
});
