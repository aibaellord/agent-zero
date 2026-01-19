/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * ANALYTICS DASHBOARD COMPLETE - Full Usage Insights System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive analytics dashboard:
 * - Real-time usage metrics
 * - Historical trends & charts
 * - Model performance comparison
 * - Session tracking
 * - Export & reporting
 *
 * @version 2.0.0
 */

(function () {
  "use strict";

  class BaelAnalyticsDashboard {
    constructor() {
      // Data stores
      this.sessions = [];
      this.interactions = [];
      this.performanceData = [];
      this.errorLog = [];

      // Real-time metrics
      this.metrics = {
        messageCount: 0,
        tokenCount: 0,
        avgResponseTime: 0,
        errorRate: 0,
        activeTime: 0,
        modelCalls: new Map(),
      };

      // Session info
      this.sessionStart = Date.now();
      this.isTracking = true;

      // UI
      this.dashboard = null;
      this.isOpen = false;

      this.init();
    }

    init() {
      this.loadStoredData();
      this.setupTracking();
      this.buildDashboard();
      this.applyStyles();
      this.attachHandlers();
      console.log("📊 Bael Analytics Dashboard v2 initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // TRACKING SYSTEM
    // ═════════════════════════════════════════════════════════════════

    setupTracking() {
      // Active time tracking
      this.activeInterval = setInterval(() => {
        if (!document.hidden && this.isTracking) {
          this.metrics.activeTime++;
        }
      }, 1000);

      // Event listeners
      window.addEventListener("bael:message:sent", (e) =>
        this.logInteraction("sent", e.detail),
      );
      window.addEventListener("bael:message:received", (e) =>
        this.logInteraction("received", e.detail),
      );
      window.addEventListener("bael:router:usage-update", (e) =>
        this.trackModelUsage(e.detail),
      );

      // Error tracking
      window.addEventListener("error", (e) => {
        this.errorLog.push({
          message: e.message,
          file: e.filename,
          line: e.lineno,
          timestamp: new Date(),
        });
      });

      // Save on page unload
      window.addEventListener("beforeunload", () => this.saveData());

      // Auto-save every 3 minutes
      setInterval(() => this.saveData(), 180000);
    }

    logInteraction(type, data) {
      const interaction = {
        id: this.uid(),
        type,
        timestamp: new Date(),
        data: data || {},
      };

      this.interactions.push(interaction);
      this.metrics.messageCount++;

      if (this.interactions.length > 2000) {
        this.interactions = this.interactions.slice(-1500);
      }

      this.emit("interaction", interaction);
    }

    trackModelUsage(data) {
      const { modelFullId, inputTokens = 0, outputTokens = 0, latency } = data;
      const model = modelFullId ? modelFullId.split("/").pop() : "unknown";

      this.metrics.tokenCount += inputTokens + outputTokens;

      const modelStats = this.metrics.modelCalls.get(model) || {
        calls: 0,
        tokens: 0,
        avgLatency: 0,
      };
      modelStats.calls++;
      modelStats.tokens += inputTokens + outputTokens;
      if (latency) {
        modelStats.avgLatency =
          (modelStats.avgLatency * (modelStats.calls - 1) + latency) /
          modelStats.calls;
      }
      this.metrics.modelCalls.set(model, modelStats);

      // Update global avg response time
      if (latency) {
        const received = this.interactions.filter(
          (i) => i.type === "received",
        ).length;
        this.metrics.avgResponseTime =
          (this.metrics.avgResponseTime * (received - 1) + latency) / received;
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // ANALYTICS CALCULATIONS
    // ═════════════════════════════════════════════════════════════════

    getCurrentSession() {
      return {
        duration: Date.now() - this.sessionStart,
        messages: this.metrics.messageCount,
        tokens: this.metrics.tokenCount,
        avgResponse: Math.round(this.metrics.avgResponseTime),
        activeTime: this.metrics.activeTime,
        errors: this.errorLog.length,
      };
    }

    getDailyData(days = 7) {
      const result = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];

        const dayData = this.interactions.filter((int) => {
          return (
            new Date(int.timestamp).toISOString().split("T")[0] === dateKey
          );
        });

        result.push({
          date: dateKey,
          sent: dayData.filter((d) => d.type === "sent").length,
          received: dayData.filter((d) => d.type === "received").length,
        });
      }

      return result;
    }

    getHourlyData() {
      const hours = Array(24).fill(0);
      const recentWeek = this.interactions.filter(
        (i) =>
          Date.now() - new Date(i.timestamp).getTime() <
          7 * 24 * 60 * 60 * 1000,
      );

      recentWeek.forEach((int) => {
        hours[new Date(int.timestamp).getHours()]++;
      });

      return hours;
    }

    getModelBreakdown() {
      return Array.from(this.metrics.modelCalls.entries()).map(
        ([model, stats]) => ({
          model,
          ...stats,
        }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadStoredData() {
      try {
        const stored = localStorage.getItem("bael_analytics_dashboard");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.sessions) this.sessions = parsed.sessions;
          if (parsed.interactions) {
            this.interactions = parsed.interactions.map((i) => ({
              ...i,
              timestamp: new Date(i.timestamp),
            }));
          }
        }
      } catch (e) {
        console.warn("Analytics data load error:", e);
      }
    }

    saveData() {
      const currentSession = {
        id: this.uid(),
        start: this.sessionStart,
        end: Date.now(),
        metrics: {
          messages: this.metrics.messageCount,
          tokens: this.metrics.tokenCount,
          activeTime: this.metrics.activeTime,
        },
      };

      // Update sessions
      this.sessions = [...this.sessions.slice(-29), currentSession];

      const data = {
        sessions: this.sessions,
        interactions: this.interactions.slice(-1000),
      };

      localStorage.setItem("bael_analytics_dashboard", JSON.stringify(data));
    }

    // ═════════════════════════════════════════════════════════════════
    // UI CONSTRUCTION
    // ═════════════════════════════════════════════════════════════════

    buildDashboard() {
      const dash = document.createElement("div");
      dash.id = "bael-analytics-dashboard";
      dash.className = "bael-dash";
      dash.innerHTML = this.renderContent();
      document.body.appendChild(dash);
      this.dashboard = dash;
    }

    renderContent() {
      const session = this.getCurrentSession();
      const daily = this.getDailyData(7);
      const hourly = this.getHourlyData();
      const models = this.getModelBreakdown();
      const maxDaily = Math.max(...daily.map((d) => d.sent + d.received), 1);
      const maxHourly = Math.max(...hourly, 1);

      return `
                <div class="dash-header">
                    <div class="dash-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18M9 21V9"/>
                        </svg>
                        <span>Analytics Dashboard</span>
                    </div>
                    <div class="dash-actions">
                        <button class="dash-btn" id="dash-refresh">🔄</button>
                        <button class="dash-btn" id="dash-close">×</button>
                    </div>
                </div>

                <div class="dash-body">
                    <!-- Session Overview -->
                    <section class="dash-section">
                        <h3>Current Session</h3>
                        <div class="metric-cards">
                            <div class="metric-card">
                                <div class="metric-icon">💬</div>
                                <div class="metric-data">
                                    <span class="metric-value">${session.messages}</span>
                                    <span class="metric-label">Messages</span>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">🔤</div>
                                <div class="metric-data">
                                    <span class="metric-value">${this.formatNum(session.tokens)}</span>
                                    <span class="metric-label">Tokens</span>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">⚡</div>
                                <div class="metric-data">
                                    <span class="metric-value">${session.avgResponse}ms</span>
                                    <span class="metric-label">Avg Response</span>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">⏱️</div>
                                <div class="metric-data">
                                    <span class="metric-value">${this.formatTime(session.activeTime)}</span>
                                    <span class="metric-label">Active Time</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Weekly Chart -->
                    <section class="dash-section">
                        <h3>Last 7 Days</h3>
                        <div class="bar-chart">
                            ${daily
                              .map(
                                (d) => `
                                <div class="bar-col">
                                    <div class="bar-wrapper">
                                        <div class="bar-inner" style="height: ${((d.sent + d.received) / maxDaily) * 100}%">
                                            <span class="bar-val">${d.sent + d.received}</span>
                                        </div>
                                    </div>
                                    <span class="bar-lbl">${d.date.slice(-5)}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </section>

                    <!-- Hourly Distribution -->
                    <section class="dash-section">
                        <h3>Hourly Activity</h3>
                        <div class="hourly-grid">
                            ${hourly
                              .map(
                                (cnt, h) => `
                                <div class="hour-cell" title="${h}:00 - ${cnt} events">
                                    <div class="hour-bar" style="height: ${(cnt / maxHourly) * 100}%"></div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        <div class="hour-axis">
                            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
                        </div>
                    </section>

                    <!-- Model Stats -->
                    <section class="dash-section">
                        <h3>Model Usage</h3>
                        <div class="model-table">
                            ${
                              models.length === 0
                                ? '<p class="no-data">No model usage recorded yet</p>'
                                : models
                                    .map(
                                      (m) => `
                                    <div class="model-row">
                                        <span class="model-name">${m.model}</span>
                                        <span class="model-stat">${m.calls} calls</span>
                                        <span class="model-stat">${this.formatNum(m.tokens)} tokens</span>
                                        <span class="model-stat">${Math.round(m.avgLatency)}ms</span>
                                    </div>
                                `,
                                    )
                                    .join("")
                            }
                        </div>
                    </section>

                    <!-- Export Section -->
                    <section class="dash-section export-section">
                        <button class="export-btn" id="export-csv">📊 Export CSV</button>
                        <button class="export-btn" id="export-json">📋 Export JSON</button>
                        <button class="clear-btn" id="clear-data">🗑️ Clear All</button>
                    </section>
                </div>
            `;
    }

    refresh() {
      this.dashboard.innerHTML = this.renderContent();
      this.attachHandlers();
    }

    // ═════════════════════════════════════════════════════════════════
    // STYLES
    // ═════════════════════════════════════════════════════════════════

    applyStyles() {
      if (document.getElementById("bael-dash-styles")) return;

      const css = document.createElement("style");
      css.id = "bael-dash-styles";
      css.textContent = `
                .bael-dash {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 640px;
                    max-width: 95vw;
                    max-height: 90vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100075;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-dash.open {
                    display: flex;
                    animation: dashOpen 0.35s ease;
                }

                @keyframes dashOpen {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .dash-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                    background: rgba(0,0,0,0.3);
                }

                .dash-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .dash-title svg {
                    width: 24px;
                    height: 24px;
                    color: var(--color-primary, #ff3366);
                }

                .dash-actions {
                    display: flex;
                    gap: 8px;
                }

                .dash-btn {
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    border-radius: 8px;
                    color: var(--color-text-muted, #666);
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                }

                .dash-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: var(--color-text, #fff);
                }

                .dash-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .dash-section {
                    margin-bottom: 32px;
                }

                .dash-section h3 {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 16px;
                }

                .metric-cards {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 14px;
                }

                .metric-card {
                    background: linear-gradient(135deg, rgba(255,51,102,0.1), rgba(139,92,246,0.1));
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 14px;
                    padding: 18px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .metric-icon {
                    font-size: 28px;
                }

                .metric-data {
                    text-align: center;
                }

                .metric-value {
                    display: block;
                    font-size: 26px;
                    font-weight: 800;
                    color: var(--color-text, #fff);
                }

                .metric-label {
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                    text-transform: uppercase;
                }

                .bar-chart {
                    display: flex;
                    gap: 10px;
                    height: 140px;
                }

                .bar-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .bar-wrapper {
                    flex: 1;
                    width: 100%;
                    display: flex;
                    align-items: flex-end;
                }

                .bar-inner {
                    width: 100%;
                    background: linear-gradient(180deg, var(--color-primary, #ff3366), #8b5cf6);
                    border-radius: 6px 6px 0 0;
                    min-height: 8px;
                    position: relative;
                    transition: height 0.3s ease;
                }

                .bar-val {
                    position: absolute;
                    top: -22px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .bar-col:hover .bar-val {
                    opacity: 1;
                }

                .bar-lbl {
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                    margin-top: 10px;
                }

                .hourly-grid {
                    display: flex;
                    gap: 3px;
                    height: 70px;
                    align-items: flex-end;
                }

                .hour-cell {
                    flex: 1;
                    height: 100%;
                    display: flex;
                    align-items: flex-end;
                }

                .hour-bar {
                    width: 100%;
                    background: var(--color-primary, #ff3366);
                    border-radius: 3px 3px 0 0;
                    min-height: 4px;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                }

                .hour-cell:hover .hour-bar {
                    opacity: 1;
                }

                .hour-axis {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 9px;
                    color: var(--color-text-muted, #555);
                }

                .model-table {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .model-row {
                    display: flex;
                    align-items: center;
                    padding: 14px 18px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 12px;
                }

                .model-name {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .model-stat {
                    font-size: 12px;
                    color: var(--color-text-muted, #666);
                    padding: 0 16px;
                }

                .no-data {
                    text-align: center;
                    color: var(--color-text-muted, #555);
                    font-size: 13px;
                    padding: 20px;
                }

                .export-section {
                    display: flex;
                    gap: 12px;
                    padding-top: 20px;
                    border-top: 1px solid var(--color-border, #252535);
                }

                .export-btn, .clear-btn {
                    flex: 1;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .export-btn:hover {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255,51,102,0.1);
                }

                .clear-btn:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                @media (max-width: 640px) {
                    .metric-cards {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `;
      document.head.appendChild(css);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═════════════════════════════════════════════════════════════════

    attachHandlers() {
      this.dashboard
        .querySelector("#dash-close")
        ?.addEventListener("click", () => this.close());
      this.dashboard
        .querySelector("#dash-refresh")
        ?.addEventListener("click", () => this.refresh());
      this.dashboard
        .querySelector("#export-csv")
        ?.addEventListener("click", () => this.exportCSV());
      this.dashboard
        .querySelector("#export-json")
        ?.addEventListener("click", () => this.exportJSON());
      this.dashboard
        .querySelector("#clear-data")
        ?.addEventListener("click", () => this.clearAllData());

      // Global keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // EXPORT FUNCTIONS
    // ═════════════════════════════════════════════════════════════════

    exportCSV() {
      const daily = this.getDailyData(30);
      let csv = "Date,Sent,Received,Total\n";
      daily.forEach((d) => {
        csv += `${d.date},${d.sent},${d.received},${d.sent + d.received}\n`;
      });
      this.downloadFile("bael-analytics.csv", csv, "text/csv");
    }

    exportJSON() {
      const data = {
        exported: new Date().toISOString(),
        session: this.getCurrentSession(),
        daily: this.getDailyData(30),
        hourly: this.getHourlyData(),
        models: this.getModelBreakdown(),
      };
      this.downloadFile(
        "bael-analytics.json",
        JSON.stringify(data, null, 2),
        "application/json",
      );
    }

    downloadFile(name, content, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    }

    clearAllData() {
      if (confirm("Clear all analytics data? This cannot be undone.")) {
        this.sessions = [];
        this.interactions = [];
        this.metrics.messageCount = 0;
        this.metrics.tokenCount = 0;
        this.metrics.modelCalls.clear();
        localStorage.removeItem("bael_analytics_dashboard");
        this.refresh();
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    uid() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatNum(n) {
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
      return n.toString();
    }

    formatTime(sec) {
      if (sec < 60) return sec + "s";
      if (sec < 3600) return Math.floor(sec / 60) + "m";
      return (
        Math.floor(sec / 3600) + "h " + Math.floor((sec % 3600) / 60) + "m"
      );
    }

    emit(evt, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:dashboard:${evt}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    open() {
      this.isOpen = true;
      this.refresh();
      this.dashboard.classList.add("open");
    }

    close() {
      this.isOpen = false;
      this.dashboard.classList.remove("open");
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    track(event, data = {}) {
      this.logInteraction(event, data);
    }

    getMetrics() {
      return this.getCurrentSession();
    }
  }

  // Initialize
  window.BaelAnalyticsDashboard = new BaelAnalyticsDashboard();
})();
