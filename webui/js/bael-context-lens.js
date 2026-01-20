/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗           █
 * █  ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝           █
 * █  ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║              █
 * █  ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║              █
 * █  ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║              █
 * █   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝              █
 * █                                                                          █
 * █   BAEL CONTEXT LENS - Visual Context Window Analysis                    █
 * █   See how much context is used, token distribution, and optimization    █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelContextLens {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.maxTokens = 128000; // Default GPT-4 context
      this.usedTokens = 0;
    }

    async initialize() {
      console.log("🔍 Bael Context Lens initializing...");

      this.injectStyles();
      this.createIndicator();
      this.createPanel();
      this.setupShortcuts();
      this.startMonitoring();

      this.initialized = true;
      console.log("✅ BAEL CONTEXT LENS READY (Ctrl+Shift+L)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-contextlens-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-contextlens-styles";
      styles.textContent = `
                /* Bottom Bar Indicator */
                .bael-context-indicator {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    z-index: 9200;
                    cursor: pointer;
                    transition: height 0.3s;
                }

                .bael-context-indicator:hover {
                    height: 8px;
                }

                .bael-context-bar {
                    height: 100%;
                    transition: width 0.5s ease-out;
                    background: linear-gradient(90deg, #10b981, #3b82f6, #f59e0b, #ef4444);
                    background-size: 200% 100%;
                }

                .bael-context-bar.low {
                    background: #10b981;
                }

                .bael-context-bar.medium {
                    background: linear-gradient(90deg, #10b981, #3b82f6);
                }

                .bael-context-bar.high {
                    background: linear-gradient(90deg, #3b82f6, #f59e0b);
                }

                .bael-context-bar.critical {
                    background: linear-gradient(90deg, #f59e0b, #ef4444);
                    animation: contextPulse 1s ease-in-out infinite;
                }

                @keyframes contextPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                /* Mini Tooltip */
                .bael-context-tooltip {
                    position: fixed;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 8px 14px;
                    color: #fff;
                    font-size: 12px;
                    z-index: 9201;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    display: flex;
                    gap: 12px;
                }

                .bael-context-indicator:hover + .bael-context-tooltip,
                .bael-context-tooltip:hover {
                    opacity: 1;
                    pointer-events: auto;
                }

                .tooltip-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .tooltip-value {
                    font-weight: 700;
                    font-size: 14px;
                }

                .tooltip-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Full Panel */
                .bael-contextlens-panel {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 360px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    z-index: 9400;
                    display: none;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }

                .bael-contextlens-panel.visible {
                    display: block;
                    animation: lensIn 0.25s ease-out;
                }

                @keyframes lensIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .lens-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .lens-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .lens-close {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                }

                .lens-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Main Display */
                .lens-main {
                    padding: 20px;
                    text-align: center;
                }

                .lens-ring-container {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    margin: 0 auto 20px;
                }

                .lens-ring {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }

                .lens-ring-bg {
                    fill: none;
                    stroke: rgba(255, 255, 255, 0.08);
                    stroke-width: 10;
                }

                .lens-ring-progress {
                    fill: none;
                    stroke-width: 10;
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.5s ease-out;
                }

                .lens-ring-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .lens-percentage {
                    font-size: 28px;
                    font-weight: 700;
                    color: #fff;
                }

                .lens-percentage-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Stats Grid */
                .lens-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-top: 16px;
                }

                .lens-stat {
                    text-align: center;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                }

                .lens-stat-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                }

                .lens-stat-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 2px;
                }

                /* Breakdown */
                .lens-breakdown {
                    padding: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .lens-breakdown-title {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 12px;
                }

                .lens-breakdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .breakdown-color {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .breakdown-info {
                    flex: 1;
                }

                .breakdown-name {
                    font-size: 12px;
                    color: #fff;
                }

                .breakdown-bar {
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    margin-top: 4px;
                    overflow: hidden;
                }

                .breakdown-bar-fill {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.3s;
                }

                .breakdown-value {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    min-width: 50px;
                    text-align: right;
                }

                /* Model Selector */
                .lens-model {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .lens-model-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .lens-model-select {
                    flex: 1;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 12px;
                    outline: none;
                }
            `;
      document.head.appendChild(styles);
    }

    createIndicator() {
      this.indicator = document.createElement("div");
      this.indicator.className = "bael-context-indicator";
      this.indicator.onclick = () => this.toggle();
      this.indicator.innerHTML =
        '<div class="bael-context-bar low" id="context-bar"></div>';
      document.body.appendChild(this.indicator);

      this.tooltip = document.createElement("div");
      this.tooltip.className = "bael-context-tooltip";
      this.tooltip.innerHTML = `
                <div class="tooltip-stat">
                    <div class="tooltip-value" id="tooltip-used">0</div>
                    <div class="tooltip-label">Used</div>
                </div>
                <div class="tooltip-stat">
                    <div class="tooltip-value" id="tooltip-max">128K</div>
                    <div class="tooltip-label">Max</div>
                </div>
                <div class="tooltip-stat">
                    <div class="tooltip-value" id="tooltip-pct">0%</div>
                    <div class="tooltip-label">Usage</div>
                </div>
            `;
      document.body.appendChild(this.tooltip);
    }

    createPanel() {
      this.panel = document.createElement("div");
      this.panel.className = "bael-contextlens-panel";
      document.body.appendChild(this.panel);
    }

    renderPanel() {
      const percentage = Math.round((this.usedTokens / this.maxTokens) * 100);
      const circumference = 2 * Math.PI * 55;
      const offset = circumference - (percentage / 100) * circumference;

      const color =
        percentage < 30
          ? "#10b981"
          : percentage < 60
            ? "#3b82f6"
            : percentage < 85
              ? "#f59e0b"
              : "#ef4444";

      // Simulated breakdown
      const breakdown = [
        {
          name: "System Prompt",
          color: "#8b5cf6",
          tokens: Math.round(this.usedTokens * 0.15),
          pct: 15,
        },
        {
          name: "Conversation",
          color: "#3b82f6",
          tokens: Math.round(this.usedTokens * 0.55),
          pct: 55,
        },
        {
          name: "Memory/RAG",
          color: "#10b981",
          tokens: Math.round(this.usedTokens * 0.2),
          pct: 20,
        },
        {
          name: "Tools/Context",
          color: "#f59e0b",
          tokens: Math.round(this.usedTokens * 0.1),
          pct: 10,
        },
      ];

      this.panel.innerHTML = `
                <div class="lens-header">
                    <div class="lens-title">
                        <span>🔍</span>
                        Context Lens
                    </div>
                    <button class="lens-close" onclick="BaelContextLens.hide()">✕</button>
                </div>

                <div class="lens-main">
                    <div class="lens-ring-container">
                        <svg class="lens-ring" viewBox="0 0 120 120">
                            <circle class="lens-ring-bg" cx="60" cy="60" r="55"/>
                            <circle class="lens-ring-progress" cx="60" cy="60" r="55"
                                    stroke="${color}"
                                    stroke-dasharray="${circumference}"
                                    stroke-dashoffset="${offset}"/>
                        </svg>
                        <div class="lens-ring-center">
                            <div class="lens-percentage" style="color: ${color}">${percentage}%</div>
                            <div class="lens-percentage-label">context used</div>
                        </div>
                    </div>

                    <div class="lens-stats">
                        <div class="lens-stat">
                            <div class="lens-stat-value">${this.formatTokens(this.usedTokens)}</div>
                            <div class="lens-stat-label">Used</div>
                        </div>
                        <div class="lens-stat">
                            <div class="lens-stat-value">${this.formatTokens(this.maxTokens - this.usedTokens)}</div>
                            <div class="lens-stat-label">Available</div>
                        </div>
                        <div class="lens-stat">
                            <div class="lens-stat-value">${this.formatTokens(this.maxTokens)}</div>
                            <div class="lens-stat-label">Max</div>
                        </div>
                    </div>
                </div>

                <div class="lens-breakdown">
                    <div class="lens-breakdown-title">Token Distribution</div>
                    ${breakdown
                      .map(
                        (item) => `
                        <div class="lens-breakdown-item">
                            <div class="breakdown-color" style="background: ${item.color}"></div>
                            <div class="breakdown-info">
                                <div class="breakdown-name">${item.name}</div>
                                <div class="breakdown-bar">
                                    <div class="breakdown-bar-fill" style="width: ${item.pct}%; background: ${item.color}"></div>
                                </div>
                            </div>
                            <div class="breakdown-value">${this.formatTokens(item.tokens)}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>

                <div class="lens-model">
                    <div class="lens-model-label">Model:</div>
                    <select class="lens-model-select" onchange="BaelContextLens.setModel(this.value)">
                        <option value="128000" ${this.maxTokens === 128000 ? "selected" : ""}>GPT-4 (128K)</option>
                        <option value="200000" ${this.maxTokens === 200000 ? "selected" : ""}>Claude 3 (200K)</option>
                        <option value="32000" ${this.maxTokens === 32000 ? "selected" : ""}>GPT-4-32K</option>
                        <option value="16000" ${this.maxTokens === 16000 ? "selected" : ""}>GPT-3.5 (16K)</option>
                        <option value="8000" ${this.maxTokens === 8000 ? "selected" : ""}>GPT-4-8K</option>
                        <option value="1000000" ${this.maxTokens === 1000000 ? "selected" : ""}>Gemini 1.5 (1M)</option>
                    </select>
                </div>
            `;
    }

    setModel(maxTokens) {
      this.maxTokens = parseInt(maxTokens);
      this.updateDisplay();
    }

    formatTokens(tokens) {
      if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + "M";
      if (tokens >= 1000) return (tokens / 1000).toFixed(1) + "K";
      return tokens.toString();
    }

    startMonitoring() {
      // Monitor chat container for changes
      const observer = new MutationObserver(() => {
        this.estimateTokens();
        this.updateDisplay();
      });

      // Look for chat containers
      setTimeout(() => {
        const chatContainer = document.querySelector(
          '[class*="chat"], [class*="messages"], #messages',
        );
        if (chatContainer) {
          observer.observe(chatContainer, { childList: true, subtree: true });
        }
      }, 1000);

      // Initial estimate
      this.estimateTokens();
      this.updateDisplay();

      // Periodic updates
      setInterval(() => {
        this.estimateTokens();
        this.updateDisplay();
      }, 5000);
    }

    estimateTokens() {
      // Estimate based on visible text content
      let totalChars = 0;

      // Chat messages
      document
        .querySelectorAll('[class*="message"], .message, [role="article"]')
        .forEach((msg) => {
          totalChars += (msg.textContent || "").length;
        });

      // Rough estimation: ~4 characters per token
      this.usedTokens = Math.round(totalChars / 4);

      // Add baseline for system prompt (~2000 tokens)
      this.usedTokens += 2000;
    }

    updateDisplay() {
      const percentage = Math.round((this.usedTokens / this.maxTokens) * 100);
      const bar = document.getElementById("context-bar");

      if (bar) {
        bar.style.width = `${Math.min(percentage, 100)}%`;

        // Update class based on percentage
        bar.className = "bael-context-bar";
        if (percentage < 30) bar.classList.add("low");
        else if (percentage < 60) bar.classList.add("medium");
        else if (percentage < 85) bar.classList.add("high");
        else bar.classList.add("critical");
      }

      // Update tooltip
      const tooltipUsed = document.getElementById("tooltip-used");
      const tooltipMax = document.getElementById("tooltip-max");
      const tooltipPct = document.getElementById("tooltip-pct");

      if (tooltipUsed)
        tooltipUsed.textContent = this.formatTokens(this.usedTokens);
      if (tooltipMax)
        tooltipMax.textContent = this.formatTokens(this.maxTokens);
      if (tooltipPct) tooltipPct.textContent = `${percentage}%`;

      // Update panel if visible
      if (this.visible) {
        this.renderPanel();
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "L") {
          e.preventDefault();
          this.toggle();
        }

        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.visible = true;
      this.renderPanel();
      this.panel.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.panel.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelContextLens = new BaelContextLens();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelContextLens.initialize();
    });
  } else {
    window.BaelContextLens.initialize();
  }

  console.log("🔍 Bael Context Lens loaded");
})();
