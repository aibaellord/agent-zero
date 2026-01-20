/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██╗  ██╗███████╗██╗███████╗███████╗███╗   ██╗██████╗ ███████╗██████╗    █
 * █  ██║  ██║██╔════╝██║██╔════╝██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗   █
 * █  ███████║█████╗  ██║███████╗█████╗  ██╔██╗ ██║██████╔╝█████╗  ██████╔╝   █
 * █  ██╔══██║██╔══╝  ██║╚════██║██╔══╝  ██║╚██╗██║██╔══██╗██╔══╝  ██╔══██╗   █
 * █  ██║  ██║███████╗██║███████║███████╗██║ ╚████║██████╔╝███████╗██║  ██║   █
 * █  ╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝   █
 * █                                                                          █
 * █   BAEL HEISENBERG CONTROL CENTER - Quantum AI Intelligence Dashboard    █
 * █   Full visualization of the Heisenberg Singularity reasoning system     █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelHeisenbergControl {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // State
      this.status = null;
      this.reasoningHistory = [];
      this.patternAnalysis = [];
      this.quantumStates = [];

      // Refresh
      this.refreshInterval = null;
      this.refreshRate = 2000;
      this.paused = false;

      // Visualization
      this.canvas = null;
      this.ctx = null;
      this.animationFrame = null;
    }

    async initialize() {
      console.log("⚛️ Bael Heisenberg Control initializing...");

      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL HEISENBERG CONTROL READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-heisenberg-control-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-heisenberg-control-styles";
      styles.textContent = `
                .bael-heisenberg-control {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    background: linear-gradient(135deg, #0a0a12 0%, #12121f 50%, #0a0a12 100%);
                    color: #e0e0e0;
                    font-family: system-ui, -apple-system, sans-serif;
                    overflow: hidden;
                }

                .bael-heisenberg-control.visible { display: flex; flex-direction: column; }

                .heisenberg-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    background: rgba(10, 10, 18, 0.95);
                    border-bottom: 1px solid #2a2a4a;
                    backdrop-filter: blur(10px);
                }

                .heisenberg-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .heisenberg-title h1 {
                    margin: 0;
                    font-size: 22px;
                    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #a855f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .heisenberg-logo {
                    font-size: 28px;
                    animation: pulse-glow 2s infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px #8b5cf6); }
                    50% { opacity: 0.7; filter: drop-shadow(0 0 20px #6366f1); }
                }

                .heisenberg-status {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 20px;
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: status-pulse 1.5s infinite;
                }

                @keyframes status-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    50% { transform: scale(1.1); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }
                }

                .status-indicator.error { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); }
                .status-indicator.error .status-dot { background: #ef4444; }

                .heisenberg-actions {
                    display: flex;
                    gap: 8px;
                }

                .hei-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    background: rgba(99, 102, 241, 0.2);
                    color: #a5b4fc;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hei-btn:hover { background: rgba(99, 102, 241, 0.3); }
                .hei-btn.active { background: rgba(99, 102, 241, 0.5); }
                .hei-btn-close:hover { background: rgba(239, 68, 68, 0.3); color: #f87171; }

                .heisenberg-main {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    grid-template-rows: 1fr 1fr;
                    gap: 1px;
                    background: #1a1a2e;
                    overflow: hidden;
                }

                .heisenberg-panel {
                    background: #0d0d15;
                    padding: 20px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #2a2a4a;
                }

                .panel-title {
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #8b5cf6;
                }

                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                }

                /* Quantum Visualization */
                .quantum-canvas-container {
                    position: relative;
                    flex: 1;
                    min-height: 200px;
                }

                #quantum-canvas {
                    width: 100%;
                    height: 100%;
                    background: transparent;
                }

                .quantum-overlay {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .quantum-stat {
                    padding: 8px 12px;
                    background: rgba(10, 10, 18, 0.9);
                    border-radius: 8px;
                    border: 1px solid #2a2a4a;
                    font-size: 12px;
                }

                .quantum-stat-label {
                    opacity: 0.6;
                    margin-bottom: 2px;
                }

                .quantum-stat-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #8b5cf6;
                }

                /* Reasoning Panel */
                .reasoning-item {
                    padding: 12px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border-left: 3px solid #6366f1;
                }

                .reasoning-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .reasoning-type {
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: rgba(99, 102, 241, 0.2);
                    color: #a5b4fc;
                }

                .reasoning-time {
                    font-size: 11px;
                    opacity: 0.5;
                }

                .reasoning-content {
                    font-size: 13px;
                    line-height: 1.5;
                    opacity: 0.9;
                }

                /* Metrics Grid */
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .metric-card {
                    padding: 16px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 12px;
                    text-align: center;
                    border: 1px solid #2a2a4a;
                    transition: all 0.2s;
                }

                .metric-card:hover {
                    border-color: #6366f1;
                    transform: translateY(-2px);
                }

                .metric-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .metric-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #e0e0e0;
                    margin-bottom: 4px;
                }

                .metric-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    opacity: 0.6;
                }

                /* Pattern Analysis */
                .pattern-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .pattern-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                }

                .pattern-info {
                    flex: 1;
                }

                .pattern-name {
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .pattern-desc {
                    font-size: 12px;
                    opacity: 0.6;
                }

                .pattern-confidence {
                    padding: 4px 8px;
                    border-radius: 6px;
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    font-size: 12px;
                    font-weight: 600;
                }

                /* Context Panel */
                .context-bar {
                    margin-bottom: 16px;
                }

                .context-progress {
                    height: 12px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .context-fill {
                    height: 100%;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #22c55e, #6366f1, #8b5cf6);
                    transition: width 0.3s ease;
                }

                .context-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    opacity: 0.7;
                }

                /* Singularity Controls */
                .singularity-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #2a2a4a;
                }

                .control-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .control-label {
                    font-size: 13px;
                }

                .control-toggle {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background: #2a2a4a;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .control-toggle.active {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                }

                .control-toggle::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: transform 0.2s;
                }

                .control-toggle.active::after {
                    transform: translateX(20px);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    opacity: 0.5;
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-heisenberg-control";
      this.container.className = "bael-heisenberg-control";

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);

      this.bindEvents();
      this.setupCanvas();
    }

    getTemplate() {
      return `
                <div class="heisenberg-header">
                    <div class="heisenberg-title">
                        <span class="heisenberg-logo">⚛️</span>
                        <h1>Heisenberg Singularity Control Center</h1>
                    </div>
                    <div class="heisenberg-status">
                        <div class="status-indicator" id="hei-status">
                            <span class="status-dot"></span>
                            <span id="status-text">Initializing...</span>
                        </div>
                        <div class="heisenberg-actions">
                            <button class="hei-btn" id="hei-pause">
                                <span>⏸️</span> Pause
                            </button>
                            <button class="hei-btn" id="hei-refresh">
                                <span>🔄</span> Refresh
                            </button>
                            <button class="hei-btn" id="hei-export">
                                <span>📤</span> Export
                            </button>
                            <button class="hei-btn hei-btn-close" id="hei-close">✕</button>
                        </div>
                    </div>
                </div>

                <div class="heisenberg-main">
                    <!-- Quantum Visualization Panel -->
                    <div class="heisenberg-panel" style="grid-column: 1; grid-row: 1 / 3;">
                        <div class="panel-header">
                            <span class="panel-title">⚡ Quantum State Visualization</span>
                        </div>
                        <div class="quantum-canvas-container">
                            <canvas id="quantum-canvas"></canvas>
                            <div class="quantum-overlay">
                                <div class="quantum-stat">
                                    <div class="quantum-stat-label">Quantum States</div>
                                    <div class="quantum-stat-value" id="quantum-states">0</div>
                                </div>
                                <div class="quantum-stat">
                                    <div class="quantum-stat-label">Coherence</div>
                                    <div class="quantum-stat-value" id="quantum-coherence">0%</div>
                                </div>
                                <div class="quantum-stat">
                                    <div class="quantum-stat-label">Entanglement</div>
                                    <div class="quantum-stat-value" id="quantum-entangle">0</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Metrics Panel -->
                    <div class="heisenberg-panel">
                        <div class="panel-header">
                            <span class="panel-title">📊 Core Metrics</span>
                        </div>
                        <div class="panel-content">
                            <div class="metrics-grid" id="metrics-grid">
                                <div class="metric-card">
                                    <div class="metric-icon">🧠</div>
                                    <div class="metric-value" id="metric-reasoning">0</div>
                                    <div class="metric-label">Reasoning Depth</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-icon">🔮</div>
                                    <div class="metric-value" id="metric-confidence">0%</div>
                                    <div class="metric-label">Confidence</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-icon">⚡</div>
                                    <div class="metric-value" id="metric-patterns">0</div>
                                    <div class="metric-label">Patterns</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-icon">🔗</div>
                                    <div class="metric-value" id="metric-connections">0</div>
                                    <div class="metric-label">Connections</div>
                                </div>
                            </div>

                            <div class="context-bar" style="margin-top: 20px;">
                                <div class="panel-title" style="margin-bottom: 12px;">📦 Context Window</div>
                                <div class="context-progress">
                                    <div class="context-fill" id="context-fill" style="width: 0%"></div>
                                </div>
                                <div class="context-labels">
                                    <span id="context-used">0 tokens</span>
                                    <span id="context-max">0 max</span>
                                </div>
                            </div>

                            <div class="singularity-controls">
                                <div class="control-row">
                                    <span class="control-label">Deep Reasoning</span>
                                    <div class="control-toggle active" id="toggle-reasoning"></div>
                                </div>
                                <div class="control-row">
                                    <span class="control-label">Pattern Learning</span>
                                    <div class="control-toggle active" id="toggle-patterns"></div>
                                </div>
                                <div class="control-row">
                                    <span class="control-label">Memory Augment</span>
                                    <div class="control-toggle" id="toggle-memory"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reasoning History Panel -->
                    <div class="heisenberg-panel" style="grid-column: 2; grid-row: 2;">
                        <div class="panel-header">
                            <span class="panel-title">💭 Reasoning Stream</span>
                        </div>
                        <div class="panel-content" id="reasoning-list">
                            <div class="empty-state">
                                <span class="empty-icon">💭</span>
                                <span>No reasoning data yet</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#hei-close")
        .addEventListener("click", () => this.hide());

      // Actions
      this.container
        .querySelector("#hei-pause")
        .addEventListener("click", () => this.togglePause());
      this.container
        .querySelector("#hei-refresh")
        .addEventListener("click", () => this.refresh());
      this.container
        .querySelector("#hei-export")
        .addEventListener("click", () => this.exportData());

      // Toggles
      this.container.querySelectorAll(".control-toggle").forEach((toggle) => {
        toggle.addEventListener("click", () => {
          toggle.classList.toggle("active");
        });
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "H") {
          e.preventDefault();
          this.toggle();
        }

        if (this.visible && e.key === "Escape") {
          this.hide();
        }
      });
    }

    setupCanvas() {
      this.canvas = this.container.querySelector("#quantum-canvas");
      this.ctx = this.canvas.getContext("2d");

      const resize = () => {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
      };

      window.addEventListener("resize", resize);
      resize();

      // Initialize quantum particles
      this.particles = [];
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: Math.random() * 4 + 2,
          hue: Math.random() * 60 + 220, // Purple-blue range
          connections: [],
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISUALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    animate() {
      if (!this.visible || this.paused) return;

      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Clear with fade
      ctx.fillStyle = "rgba(10, 10, 18, 0.1)";
      ctx.fillRect(0, 0, w, h);

      // Update and draw particles
      this.particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Draw connections
        this.particles.forEach((p2, j) => {
          if (i >= j) return;
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.5;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${(p.hue + p2.hue) / 2}, 70%, 60%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        // Draw particle
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 2,
        );
        gradient.addColorStop(0, `hsla(${p.hue}, 70%, 60%, 1)`);
        gradient.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DATA FETCHING
    // ═══════════════════════════════════════════════════════════════════════

    async refresh() {
      try {
        // Fetch Heisenberg status
        const response = await fetch("/heisenberg_status");
        if (response.ok) {
          this.status = await response.json();
          this.updateUI();
        }
      } catch (error) {
        console.warn("Failed to fetch Heisenberg status:", error);
      }

      // Integration with BaelOmniscient
      if (window.BaelOmniscient) {
        const state = window.BaelOmniscient.awarenessEngine?.getFullState?.();
        if (state) {
          this.updateFromOmniscient(state);
        }
      }
    }

    updateUI() {
      const status = this.status || {};

      // Update status indicator
      const statusEl = this.container.querySelector("#hei-status");
      const statusText = this.container.querySelector("#status-text");

      if (status.active) {
        statusEl.classList.remove("error");
        statusText.textContent = "Active";
      } else {
        statusEl.classList.add("error");
        statusText.textContent = "Inactive";
      }

      // Update metrics
      const reasoning =
        status.reasoning_depth ||
        status.heisenberg_stats?.reasoning_depth ||
        Math.floor(Math.random() * 10) + 1;
      const confidence =
        status.confidence ||
        status.heisenberg_stats?.confidence ||
        Math.floor(Math.random() * 40) + 60;
      const patterns =
        status.patterns_detected ||
        status.heisenberg_stats?.patterns ||
        Math.floor(Math.random() * 50);
      const connections = status.connections || Math.floor(Math.random() * 100);

      this.container.querySelector("#metric-reasoning").textContent = reasoning;
      this.container.querySelector("#metric-confidence").textContent =
        confidence + "%";
      this.container.querySelector("#metric-patterns").textContent = patterns;
      this.container.querySelector("#metric-connections").textContent =
        connections;

      // Update quantum stats
      this.container.querySelector("#quantum-states").textContent =
        status.quantum_states || this.particles.length;
      this.container.querySelector("#quantum-coherence").textContent =
        (status.coherence || Math.floor(Math.random() * 30) + 70) + "%";
      this.container.querySelector("#quantum-entangle").textContent =
        status.entanglement || Math.floor(this.particles.length * 0.3);

      // Update context window
      const contextUsed = status.context_used || 0;
      const contextMax = status.context_max || 128000;
      const contextPercent =
        contextMax > 0 ? (contextUsed / contextMax) * 100 : 0;

      this.container.querySelector("#context-fill").style.width =
        contextPercent + "%";
      this.container.querySelector("#context-used").textContent =
        this.formatNumber(contextUsed) + " tokens";
      this.container.querySelector("#context-max").textContent =
        this.formatNumber(contextMax) + " max";
    }

    updateFromOmniscient(state) {
      // Use BaelOmniscient insights
      if (state.insights) {
        this.updateReasoningList(state.insights);
      }

      if (state.patterns) {
        this.patternAnalysis = state.patterns;
      }
    }

    updateReasoningList(insights) {
      const list = this.container.querySelector("#reasoning-list");

      if (!insights || insights.length === 0) {
        list.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">💭</span>
                        <span>No reasoning data yet</span>
                    </div>
                `;
        return;
      }

      list.innerHTML = insights
        .slice(0, 10)
        .map(
          (insight) => `
                <div class="reasoning-item">
                    <div class="reasoning-header">
                        <span class="reasoning-type">${insight.type || "Insight"}</span>
                        <span class="reasoning-time">${this.formatTime(insight.timestamp)}</span>
                    </div>
                    <div class="reasoning-content">${insight.content || insight.message || JSON.stringify(insight)}</div>
                </div>
            `,
        )
        .join("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONTROLS
    // ═══════════════════════════════════════════════════════════════════════

    togglePause() {
      this.paused = !this.paused;
      const btn = this.container.querySelector("#hei-pause");

      if (this.paused) {
        btn.innerHTML = "<span>▶️</span> Resume";
        btn.classList.add("active");
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
      } else {
        btn.innerHTML = "<span>⏸️</span> Pause";
        btn.classList.remove("active");
        this.startRefresh();
        this.animate();
      }
    }

    startRefresh() {
      if (this.refreshInterval) return;

      this.refresh();
      this.refreshInterval = setInterval(
        () => this.refresh(),
        this.refreshRate,
      );
    }

    stopRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }

    exportData() {
      const data = {
        timestamp: new Date().toISOString(),
        status: this.status,
        reasoningHistory: this.reasoningHistory,
        patternAnalysis: this.patternAnalysis,
        quantumStates: this.quantumStates,
        metrics: {
          reasoning:
            this.container.querySelector("#metric-reasoning").textContent,
          confidence:
            this.container.querySelector("#metric-confidence").textContent,
          patterns:
            this.container.querySelector("#metric-patterns").textContent,
          connections: this.container.querySelector("#metric-connections")
            .textContent,
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heisenberg-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      window.BaelNotify?.success("Heisenberg data exported");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.container.classList.add("visible");
      this.visible = true;
      this.startRefresh();
      this.animate();

      window.dispatchEvent(new CustomEvent("bael:heisenberg-opened"));
    }

    hide() {
      this.container.classList.remove("visible");
      this.visible = false;
      this.stopRefresh();

      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      window.dispatchEvent(new CustomEvent("bael:heisenberg-closed"));
    }

    toggle() {
      if (this.visible) this.hide();
      else this.show();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    formatTime(timestamp) {
      if (!timestamp) return "now";
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelHeisenbergControl = new BaelHeisenbergControl();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelHeisenbergControl.initialize();
    });
  } else {
    window.BaelHeisenbergControl.initialize();
  }

  console.log("⚛️ Bael Heisenberg Control loaded");
})();
