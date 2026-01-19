/**
 * BAEL - LORD OF ALL
 * Chat Analytics - Insights, statistics, and usage patterns
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelAnalytics {
    constructor() {
      this.data = {
        sessions: [],
        messages: [],
        tokens: { input: 0, output: 0 },
        tools: {},
        models: {},
        responseTimeHistory: [],
        dailyUsage: {},
        hourlyPatterns: Array(24).fill(0),
      };
      this.panel = null;
      this.init();
    }

    init() {
      this.loadData();
      this.addStyles();
      this.createUI();
      this.bindEvents();
      this.startTracking();
      console.log("📈 Bael Analytics initialized");
    }

    loadData() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_analytics") || "{}",
        );
        this.data = { ...this.data, ...saved };
      } catch (e) {}
    }

    saveData() {
      localStorage.setItem("bael_analytics", JSON.stringify(this.data));
    }

    startTracking() {
      // Track page session
      const session = {
        start: Date.now(),
        messages: 0,
        tokens: { input: 0, output: 0 },
      };
      this.data.sessions.push(session);
      this.currentSession = session;

      // Hook into fetch for API tracking
      this.hookFetch();
    }

    hookFetch() {
      const originalFetch = window.fetch;
      const self = this;

      window.fetch = async function (...args) {
        const startTime = performance.now();
        const response = await originalFetch.apply(this, args);

        // Clone response for analysis
        try {
          const url = args[0];
          if (typeof url === "string") {
            if (url.includes("/message") || url.includes("/chat")) {
              const endTime = performance.now();
              const responseTime = endTime - startTime;
              self.trackMessage(responseTime, url);
            }
          }
        } catch (e) {}

        return response;
      };
    }

    trackMessage(responseTime, url) {
      const now = new Date();
      const hour = now.getHours();
      const dateKey = now.toISOString().split("T")[0];

      // Update hourly patterns
      this.data.hourlyPatterns[hour]++;

      // Update daily usage
      if (!this.data.dailyUsage[dateKey]) {
        this.data.dailyUsage[dateKey] = { messages: 0, tokens: 0 };
      }
      this.data.dailyUsage[dateKey].messages++;

      // Track response time
      this.data.responseTimeHistory.push({
        time: Date.now(),
        duration: responseTime,
      });

      // Keep only last 100 response times
      if (this.data.responseTimeHistory.length > 100) {
        this.data.responseTimeHistory.shift();
      }

      // Update current session
      if (this.currentSession) {
        this.currentSession.messages++;
      }

      this.saveData();
    }

    trackTokens(input, output) {
      this.data.tokens.input += input;
      this.data.tokens.output += output;

      const dateKey = new Date().toISOString().split("T")[0];
      if (this.data.dailyUsage[dateKey]) {
        this.data.dailyUsage[dateKey].tokens += input + output;
      }

      if (this.currentSession) {
        this.currentSession.tokens.input += input;
        this.currentSession.tokens.output += output;
      }

      this.saveData();
    }

    trackTool(toolName) {
      if (!this.data.tools[toolName]) {
        this.data.tools[toolName] = 0;
      }
      this.data.tools[toolName]++;
      this.saveData();
    }

    trackModel(modelName) {
      if (!this.data.models[modelName]) {
        this.data.models[modelName] = 0;
      }
      this.data.models[modelName]++;
      this.saveData();
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-analytics-styles";
      styles.textContent = `
                /* Analytics Trigger */
                .bael-analytics-trigger {
                    position: fixed;
                    bottom: 570px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9980;
                    transition: all 0.3s ease;
                    font-size: 20px;
                }

                .bael-analytics-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                /* Analytics Panel */
                .bael-analytics-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 1200px;
                    height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100027;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
                    overflow: hidden;
                }

                .bael-analytics-panel.visible {
                    display: flex;
                    animation: analyticsAppear 0.25s ease;
                }

                @keyframes analyticsAppear {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .bael-analytics-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 100026;
                    display: none;
                }

                .bael-analytics-overlay.visible {
                    display: block;
                }

                /* Header */
                .analytics-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .analytics-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .analytics-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .analytics-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Content */
                .analytics-content {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 20px;
                }

                .stat-label {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--bael-accent, #ff3366);
                }

                .stat-change {
                    font-size: 12px;
                    margin-top: 8px;
                }

                .stat-change.positive {
                    color: #4ade80;
                }

                .stat-change.negative {
                    color: #f87171;
                }

                /* Charts Section */
                .charts-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                @media (max-width: 900px) {
                    .charts-section {
                        grid-template-columns: 1fr;
                    }
                }

                .chart-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 20px;
                }

                .chart-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 16px;
                }

                .chart-container {
                    height: 200px;
                    position: relative;
                }

                /* Bar Chart */
                .bar-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 100%;
                    gap: 4px;
                }

                .bar {
                    flex: 1;
                    background: linear-gradient(180deg, var(--bael-accent, #ff3366), #8b5cf6);
                    border-radius: 4px 4px 0 0;
                    min-height: 4px;
                    transition: height 0.3s ease;
                    position: relative;
                }

                .bar:hover {
                    filter: brightness(1.2);
                }

                .bar-label {
                    position: absolute;
                    bottom: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 9px;
                    color: var(--bael-text-muted, #666);
                }

                /* Pie Chart */
                .pie-chart {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    height: 100%;
                }

                .pie-visual {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    position: relative;
                }

                .pie-legend {
                    flex: 1;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 12px;
                }

                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }

                .legend-label {
                    color: var(--bael-text-primary, #fff);
                }

                .legend-value {
                    color: var(--bael-text-muted, #666);
                    margin-left: auto;
                }

                /* Line Chart */
                .line-chart {
                    position: relative;
                    height: 100%;
                }

                .line-chart svg {
                    width: 100%;
                    height: 100%;
                }

                .chart-line {
                    fill: none;
                    stroke: var(--bael-accent, #ff3366);
                    stroke-width: 2;
                }

                .chart-area {
                    fill: url(#areaGradient);
                }

                /* Usage Table */
                .usage-table {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                    padding: 12px 16px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                }

                .table-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                }

                .table-row:last-child {
                    border-bottom: none;
                }

                .table-row:hover {
                    background: var(--bael-bg-tertiary, #181820);
                }

                /* Footer */
                .analytics-footer {
                    padding: 12px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .export-btn {
                    padding: 8px 16px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .export-btn:hover {
                    filter: brightness(1.1);
                }

                .reset-btn {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                }

                .reset-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Trigger
      const trigger = document.createElement("button");
      trigger.className = "bael-analytics-trigger";
      trigger.title = "Analytics (Ctrl+Shift+A)";
      trigger.innerHTML = "📈";
      document.body.appendChild(trigger);
      this.trigger = trigger;

      // Overlay
      const overlay = document.createElement("div");
      overlay.className = "bael-analytics-overlay";
      document.body.appendChild(overlay);
      this.overlay = overlay;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-analytics-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      const totalMessages = Object.values(this.data.dailyUsage).reduce(
        (sum, d) => sum + d.messages,
        0,
      );
      const totalTokens = this.data.tokens.input + this.data.tokens.output;
      const avgResponseTime =
        this.data.responseTimeHistory.length > 0
          ? Math.round(
              this.data.responseTimeHistory.reduce(
                (s, r) => s + r.duration,
                0,
              ) / this.data.responseTimeHistory.length,
            )
          : 0;
      const totalSessions = this.data.sessions.length;

      return `
                <div class="analytics-header">
                    <div class="analytics-title">
                        <span>📈</span>
                        <span>Chat Analytics</span>
                    </div>
                    <button class="analytics-close">×</button>
                </div>

                <div class="analytics-content">
                    <!-- Stats Grid -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Total Messages</div>
                            <div class="stat-value">${this.formatNumber(totalMessages)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Tokens</div>
                            <div class="stat-value">${this.formatNumber(totalTokens)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Avg Response Time</div>
                            <div class="stat-value">${avgResponseTime}ms</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Sessions</div>
                            <div class="stat-value">${totalSessions}</div>
                        </div>
                    </div>

                    <!-- Charts -->
                    <div class="charts-section">
                        <div class="chart-card">
                            <div class="chart-title">Activity by Hour</div>
                            <div class="chart-container">
                                ${this.renderHourlyChart()}
                            </div>
                        </div>
                        <div class="chart-card">
                            <div class="chart-title">Token Distribution</div>
                            <div class="chart-container">
                                ${this.renderTokenPie()}
                            </div>
                        </div>
                    </div>

                    <!-- Tool Usage -->
                    <div class="chart-card">
                        <div class="chart-title">Tool Usage</div>
                        <div class="usage-table">
                            <div class="table-header">
                                <div>Tool</div>
                                <div>Usage Count</div>
                                <div>Percentage</div>
                                <div>Last Used</div>
                            </div>
                            ${this.renderToolTable()}
                        </div>
                    </div>
                </div>

                <div class="analytics-footer">
                    <button class="reset-btn" id="reset-analytics">Reset Data</button>
                    <button class="export-btn" id="export-analytics">
                        <span>📤</span> Export Report
                    </button>
                </div>
            `;
    }

    renderHourlyChart() {
      const max = Math.max(...this.data.hourlyPatterns, 1);
      const bars = this.data.hourlyPatterns
        .map((count, hour) => {
          const height = Math.max((count / max) * 100, 2);
          return `<div class="bar" style="height: ${height}%"><span class="bar-label">${hour}</span></div>`;
        })
        .join("");

      return `<div class="bar-chart">${bars}</div>`;
    }

    renderTokenPie() {
      const input = this.data.tokens.input || 1;
      const output = this.data.tokens.output || 1;
      const total = input + output;
      const inputPct = Math.round((input / total) * 100);
      const outputPct = 100 - inputPct;

      return `
                <div class="pie-chart">
                    <div class="pie-visual" style="background: conic-gradient(#ff3366 0% ${inputPct}%, #8b5cf6 ${inputPct}% 100%)"></div>
                    <div class="pie-legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #ff3366"></div>
                            <span class="legend-label">Input Tokens</span>
                            <span class="legend-value">${this.formatNumber(input)} (${inputPct}%)</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #8b5cf6"></div>
                            <span class="legend-label">Output Tokens</span>
                            <span class="legend-value">${this.formatNumber(output)} (${outputPct}%)</span>
                        </div>
                    </div>
                </div>
            `;
    }

    renderToolTable() {
      const tools = Object.entries(this.data.tools);
      if (tools.length === 0) {
        return '<div class="table-row"><div colspan="4" style="grid-column: span 4; text-align: center; color: var(--bael-text-muted);">No tool usage recorded</div></div>';
      }

      const total = tools.reduce((sum, [, count]) => sum + count, 0);
      return tools
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => {
          const pct = Math.round((count / total) * 100);
          return `
                        <div class="table-row">
                            <div>${name}</div>
                            <div>${count}</div>
                            <div>${pct}%</div>
                            <div>-</div>
                        </div>
                    `;
        })
        .join("");
    }

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());
      this.overlay.addEventListener("click", () => this.close());

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "A") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.panel.classList.contains("visible")) {
          this.close();
        }
      });
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".analytics-close")
        .addEventListener("click", () => this.close());

      this.panel
        .querySelector("#export-analytics")
        .addEventListener("click", () => this.exportReport());
      this.panel
        .querySelector("#reset-analytics")
        .addEventListener("click", () => this.resetData());
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      // Refresh data
      this.panel.querySelector(".analytics-content").innerHTML =
        this.renderPanel().match(
          /<div class="analytics-content">([\s\S]*?)<\/div>\s*<div class="analytics-footer">/,
        )[1];
      this.panel.classList.add("visible");
      this.overlay.classList.add("visible");
    }

    close() {
      this.panel.classList.remove("visible");
      this.overlay.classList.remove("visible");
    }

    exportReport() {
      const report = {
        generated: new Date().toISOString(),
        summary: {
          totalSessions: this.data.sessions.length,
          totalTokens: this.data.tokens,
          hourlyPatterns: this.data.hourlyPatterns,
          dailyUsage: this.data.dailyUsage,
          tools: this.data.tools,
          models: this.data.models,
        },
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-analytics-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Analytics report exported");
      }
    }

    resetData() {
      if (confirm("Reset all analytics data? This cannot be undone.")) {
        this.data = {
          sessions: [],
          messages: [],
          tokens: { input: 0, output: 0 },
          tools: {},
          models: {},
          responseTimeHistory: [],
          dailyUsage: {},
          hourlyPatterns: Array(24).fill(0),
        };
        this.saveData();
        this.open(); // Refresh panel

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Analytics data reset");
        }
      }
    }
  }

  // Initialize
  window.BaelAnalytics = new BaelAnalytics();
})();
