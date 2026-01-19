/**
 * BAEL - LORD OF ALL
 * Context Window Visualizer - See what the AI sees
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelContextViz {
    constructor() {
      this.panel = null;
      this.contextData = {
        maxTokens: 128000,
        usedTokens: 0,
        segments: [],
      };
      this.init();
    }

    init() {
      this.addStyles();
      this.createUI();
      this.bindEvents();
      this.monitorContext();
      console.log("📊 Bael Context Visualizer initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-context-viz-styles";
      styles.textContent = `
                /* Context Panel */
                .bael-context-viz-panel {
                    position: fixed;
                    bottom: 80px;
                    left: 20px;
                    width: 350px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100020;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-context-viz-panel.visible {
                    display: flex;
                    animation: contextAppear 0.2s ease;
                }

                @keyframes contextAppear {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Header */
                .context-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .context-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .context-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 16px;
                }

                .context-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Content */
                .context-content {
                    padding: 16px;
                }

                /* Main meter */
                .context-meter {
                    margin-bottom: 16px;
                }

                .meter-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .meter-label {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .meter-value {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .meter-bar-container {
                    height: 24px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                }

                .meter-bar {
                    height: 100%;
                    border-radius: 12px;
                    transition: width 0.3s ease;
                    display: flex;
                    overflow: hidden;
                }

                .meter-segment {
                    height: 100%;
                    transition: width 0.3s ease;
                }

                .meter-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 11px;
                    font-weight: 600;
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                }

                /* Breakdown */
                .context-breakdown {
                    margin-top: 16px;
                }

                .breakdown-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 10px;
                }

                .breakdown-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .breakdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 10px;
                }

                .breakdown-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }

                .breakdown-info {
                    flex: 1;
                    min-width: 0;
                }

                .breakdown-name {
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 2px;
                }

                .breakdown-tokens {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .breakdown-percent {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                /* Stats */
                .context-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 16px;
                }

                .stat-box {
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 10px;
                    text-align: center;
                }

                .stat-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .stat-label {
                    font-size: 9px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 4px;
                    text-transform: uppercase;
                }

                /* Warning */
                .context-warning {
                    margin-top: 16px;
                    padding: 12px;
                    background: rgba(251, 191, 36, 0.1);
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    border-radius: 10px;
                    display: none;
                }

                .context-warning.visible {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .warning-icon {
                    font-size: 18px;
                }

                .warning-text {
                    font-size: 11px;
                    color: #fbbf24;
                    line-height: 1.4;
                }

                /* Floating indicator */
                .bael-context-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 25px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 100007;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-context-indicator:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .context-mini-bar {
                    width: 60px;
                    height: 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .context-mini-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .context-mini-fill.safe {
                    background: #4ade80;
                }

                .context-mini-fill.moderate {
                    background: #fbbf24;
                }

                .context-mini-fill.high {
                    background: #f87171;
                }

                .context-mini-text {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Floating indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-context-indicator";
      indicator.innerHTML = `
                <span>📊</span>
                <div class="context-mini-bar">
                    <div class="context-mini-fill safe" style="width: 0%;"></div>
                </div>
                <span class="context-mini-text">0%</span>
            `;
      document.body.appendChild(indicator);
      this.indicator = indicator;

      // Main panel
      const panel = document.createElement("div");
      panel.className = "bael-context-viz-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindIndicatorEvents();
      this.bindPanelEvents();
    }

    renderPanel() {
      const usedPercent = Math.round(
        (this.contextData.usedTokens / this.contextData.maxTokens) * 100,
      );
      const remaining =
        this.contextData.maxTokens - this.contextData.usedTokens;

      return `
                <div class="context-header">
                    <div class="context-title">
                        <span>📊</span>
                        <span>Context Window</span>
                    </div>
                    <button class="context-close">×</button>
                </div>

                <div class="context-content">
                    <div class="context-meter">
                        <div class="meter-header">
                            <span class="meter-label">Context Usage</span>
                            <span class="meter-value">${this.formatNumber(this.contextData.usedTokens)} / ${this.formatNumber(this.contextData.maxTokens)} tokens</span>
                        </div>
                        <div class="meter-bar-container">
                            <div class="meter-bar">
                                ${this.renderSegments()}
                            </div>
                            <span class="meter-text">${usedPercent}%</span>
                        </div>
                    </div>

                    <div class="context-breakdown">
                        <div class="breakdown-title">Token Breakdown</div>
                        <div class="breakdown-list">
                            ${this.renderBreakdown()}
                        </div>
                    </div>

                    <div class="context-stats">
                        <div class="stat-box">
                            <div class="stat-value">${this.formatNumber(remaining)}</div>
                            <div class="stat-label">Remaining</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${this.contextData.segments.length}</div>
                            <div class="stat-label">Segments</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${usedPercent}%</div>
                            <div class="stat-label">Used</div>
                        </div>
                    </div>

                    <div class="context-warning ${usedPercent > 80 ? "visible" : ""}">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text">
                            ${
                              usedPercent > 90
                                ? "Critical: Context window nearly full. Consider starting a new conversation."
                                : usedPercent > 80
                                  ? "Warning: Context window is getting full. Older messages may be summarized."
                                  : ""
                            }
                        </span>
                    </div>
                </div>
            `;
    }

    renderSegments() {
      if (this.contextData.segments.length === 0) {
        return `<div class="meter-segment" style="width: 0%; background: #4ade80;"></div>`;
      }

      return this.contextData.segments
        .map((segment) => {
          const width = (segment.tokens / this.contextData.maxTokens) * 100;
          return `<div class="meter-segment" style="width: ${width}%; background: ${segment.color};"></div>`;
        })
        .join("");
    }

    renderBreakdown() {
      const segments =
        this.contextData.segments.length > 0
          ? this.contextData.segments
          : [
              { name: "System Prompt", tokens: 2500, color: "#ff3366" },
              { name: "Chat History", tokens: 8000, color: "#6366f1" },
              { name: "Recent Messages", tokens: 3500, color: "#4ade80" },
              { name: "Memory/Context", tokens: 1500, color: "#fbbf24" },
            ];

      return segments
        .map((segment) => {
          const percent = Math.round(
            (segment.tokens / this.contextData.maxTokens) * 100,
          );
          return `
                    <div class="breakdown-item">
                        <div class="breakdown-color" style="background: ${segment.color};"></div>
                        <div class="breakdown-info">
                            <div class="breakdown-name">${segment.name}</div>
                            <div class="breakdown-tokens">${this.formatNumber(segment.tokens)} tokens</div>
                        </div>
                        <div class="breakdown-percent">${percent}%</div>
                    </div>
                `;
        })
        .join("");
    }

    bindIndicatorEvents() {
      this.indicator.addEventListener("click", () => this.togglePanel());
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".context-close")
        .addEventListener("click", () => this.closePanel());
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "X") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    monitorContext() {
      // Simulate monitoring (in production, this would hook into the actual API)
      setInterval(() => {
        this.updateContext();
      }, 5000);

      // Initial update
      this.updateContext();
    }

    updateContext() {
      // Simulate context data (in production, get from actual API)
      const systemTokens = 2500 + Math.floor(Math.random() * 500);
      const historyTokens = Math.floor(Math.random() * 12000);
      const recentTokens = Math.floor(Math.random() * 5000);
      const memoryTokens = Math.floor(Math.random() * 3000);

      this.contextData = {
        maxTokens: 128000,
        usedTokens: systemTokens + historyTokens + recentTokens + memoryTokens,
        segments: [
          { name: "System Prompt", tokens: systemTokens, color: "#ff3366" },
          { name: "Chat History", tokens: historyTokens, color: "#6366f1" },
          { name: "Recent Messages", tokens: recentTokens, color: "#4ade80" },
          { name: "Memory/Context", tokens: memoryTokens, color: "#fbbf24" },
        ],
      };

      this.updateIndicator();
      if (this.panel.classList.contains("visible")) {
        this.panel.innerHTML = this.renderPanel();
        this.bindPanelEvents();
      }
    }

    updateIndicator() {
      const percent = Math.round(
        (this.contextData.usedTokens / this.contextData.maxTokens) * 100,
      );
      const fill = this.indicator.querySelector(".context-mini-fill");
      const text = this.indicator.querySelector(".context-mini-text");

      fill.style.width = `${percent}%`;
      fill.className =
        "context-mini-fill " +
        (percent > 80 ? "high" : percent > 50 ? "moderate" : "safe");
      text.textContent = `${percent}%`;
    }

    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + "k";
      }
      return num.toString();
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.panel.innerHTML = this.renderPanel();
        this.bindPanelEvents();
      }
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    // Public API to update context from external sources
    setContext(data) {
      this.contextData = { ...this.contextData, ...data };
      this.updateIndicator();
      if (this.panel.classList.contains("visible")) {
        this.panel.innerHTML = this.renderPanel();
        this.bindPanelEvents();
      }
    }
  }

  // Initialize
  window.BaelContextViz = new BaelContextViz();
})();
