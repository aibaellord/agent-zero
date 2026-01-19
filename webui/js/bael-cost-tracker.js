/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * COST TRACKER - Comprehensive Usage & Spending Analytics
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Advanced cost tracking with:
 * - Real-time token & API cost monitoring
 * - Budget alerts and limits
 * - Historical spending analysis
 * - Projected cost estimation
 * - Export reports
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelCostTracker {
    constructor() {
      // Cost database
      this.costs = {
        daily: new Map(),
        weekly: new Map(),
        monthly: new Map(),
        sessions: [],
      };

      // Current session
      this.currentSession = {
        id: Date.now(),
        startTime: new Date(),
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        models: new Map(),
      };

      // Budget settings
      this.budget = {
        daily: 5.0,
        weekly: 25.0,
        monthly: 100.0,
        alertThreshold: 0.8, // 80%
      };

      // Model pricing (per 1M tokens)
      this.pricing = new Map([
        ["gpt-4o", { input: 5, output: 15 }],
        ["gpt-4-turbo", { input: 10, output: 30 }],
        ["gpt-4", { input: 30, output: 60 }],
        ["gpt-3.5-turbo", { input: 0.5, output: 1.5 }],
        ["claude-3-opus", { input: 15, output: 75 }],
        ["claude-3-sonnet", { input: 3, output: 15 }],
        ["claude-3-haiku", { input: 0.25, output: 1.25 }],
        ["gemini-pro", { input: 0.5, output: 1.5 }],
        ["llama-3.1-70b", { input: 0.59, output: 0.79 }],
        ["local", { input: 0, output: 0 }],
      ]);

      // UI elements
      this.widget = null;
      this.panel = null;
      this.isExpanded = false;

      this.init();
    }

    init() {
      this.loadData();
      this.createWidget();
      this.createPanel();
      this.addStyles();
      this.bindEvents();
      this.startTracking();
      this.checkBudgetAlerts();
      console.log("💰 Bael Cost Tracker initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // DATA MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    loadData() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_cost_data") || "{}",
        );
        if (saved.budget) this.budget = { ...this.budget, ...saved.budget };
        if (saved.sessions) this.costs.sessions = saved.sessions;
        if (saved.daily) {
          Object.entries(saved.daily).forEach(([k, v]) =>
            this.costs.daily.set(k, v),
          );
        }
      } catch (e) {
        console.warn("Cost data load failed:", e);
      }
    }

    saveData() {
      const data = {
        budget: this.budget,
        sessions: this.costs.sessions.slice(-100), // Keep last 100 sessions
        daily: Object.fromEntries(this.costs.daily),
      };
      localStorage.setItem("bael_cost_data", JSON.stringify(data));
    }

    // ═════════════════════════════════════════════════════════════════
    // COST TRACKING
    // ═════════════════════════════════════════════════════════════════

    trackRequest(model, inputTokens, outputTokens) {
      const pricing = this.pricing.get(model) || this.pricing.get("gpt-4");
      const inputCost = (inputTokens / 1000000) * pricing.input;
      const outputCost = (outputTokens / 1000000) * pricing.output;
      const totalCost = inputCost + outputCost;

      // Update session
      this.currentSession.requests++;
      this.currentSession.inputTokens += inputTokens;
      this.currentSession.outputTokens += outputTokens;
      this.currentSession.cost += totalCost;

      const modelUsage = this.currentSession.models.get(model) || {
        tokens: 0,
        cost: 0,
      };
      modelUsage.tokens += inputTokens + outputTokens;
      modelUsage.cost += totalCost;
      this.currentSession.models.set(model, modelUsage);

      // Update daily
      const today = this.getDateKey(new Date());
      const dailyData = this.costs.daily.get(today) || {
        requests: 0,
        tokens: 0,
        cost: 0,
      };
      dailyData.requests++;
      dailyData.tokens += inputTokens + outputTokens;
      dailyData.cost += totalCost;
      this.costs.daily.set(today, dailyData);

      // Save and update
      this.saveData();
      this.updateWidget();
      this.checkBudgetAlerts();
      this.emit("cost-update", {
        model,
        inputTokens,
        outputTokens,
        cost: totalCost,
      });

      return { inputCost, outputCost, totalCost };
    }

    startTracking() {
      // Monitor API responses
      this.interceptResponses();

      // Auto-save session every 5 minutes
      setInterval(() => this.saveSession(), 5 * 60 * 1000);
    }

    interceptResponses() {
      // Listen for usage events from router
      window.addEventListener("bael:router:usage-update", (e) => {
        const { modelFullId, inputTokens, outputTokens } = e.detail;
        const model = modelFullId.split("/")[1] || modelFullId;
        this.trackRequest(model, inputTokens, outputTokens);
      });
    }

    saveSession() {
      if (this.currentSession.requests === 0) return;

      const sessionSummary = {
        id: this.currentSession.id,
        startTime: this.currentSession.startTime,
        endTime: new Date(),
        requests: this.currentSession.requests,
        inputTokens: this.currentSession.inputTokens,
        outputTokens: this.currentSession.outputTokens,
        cost: this.currentSession.cost,
      };

      this.costs.sessions.push(sessionSummary);
      this.saveData();
    }

    // ═════════════════════════════════════════════════════════════════
    // BUDGET MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    checkBudgetAlerts() {
      const today = this.getDateKey(new Date());
      const dailyData = this.costs.daily.get(today) || { cost: 0 };

      const dailyUsage = dailyData.cost / this.budget.daily;
      const weeklyUsage = this.getWeeklyCost() / this.budget.weekly;
      const monthlyUsage = this.getMonthlyCost() / this.budget.monthly;

      // Daily alert
      if (dailyUsage >= this.budget.alertThreshold && dailyUsage < 1) {
        this.showBudgetAlert("daily", dailyUsage);
      }
      if (dailyUsage >= 1) {
        this.showBudgetExceeded("daily");
      }

      // Weekly alert
      if (weeklyUsage >= this.budget.alertThreshold && weeklyUsage < 1) {
        this.showBudgetAlert("weekly", weeklyUsage);
      }

      // Monthly alert
      if (monthlyUsage >= this.budget.alertThreshold && monthlyUsage < 1) {
        this.showBudgetAlert("monthly", monthlyUsage);
      }
    }

    showBudgetAlert(period, usage) {
      const pct = Math.round(usage * 100);
      this.widget.classList.add("warning");
      this.emit("budget-warning", { period, usage: pct });
    }

    showBudgetExceeded(period) {
      this.widget.classList.add("exceeded");
      this.emit("budget-exceeded", { period });
    }

    setBudget(period, amount) {
      if (this.budget.hasOwnProperty(period)) {
        this.budget[period] = amount;
        this.saveData();
        this.checkBudgetAlerts();
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // ANALYTICS
    // ═════════════════════════════════════════════════════════════════

    getTodayCost() {
      const today = this.getDateKey(new Date());
      const data = this.costs.daily.get(today) || { cost: 0 };
      return data.cost;
    }

    getWeeklyCost() {
      const now = new Date();
      let total = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = this.getDateKey(date);
        const data = this.costs.daily.get(key) || { cost: 0 };
        total += data.cost;
      }
      return total;
    }

    getMonthlyCost() {
      const now = new Date();
      let total = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = this.getDateKey(date);
        const data = this.costs.daily.get(key) || { cost: 0 };
        total += data.cost;
      }
      return total;
    }

    getDailyBreakdown(days = 7) {
      const breakdown = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = this.getDateKey(date);
        const data = this.costs.daily.get(key) || {
          requests: 0,
          tokens: 0,
          cost: 0,
        };
        breakdown.push({
          date: key,
          ...data,
        });
      }
      return breakdown;
    }

    getProjectedMonthlyCost() {
      const today = new Date().getDate();
      const currentMonth = this.getMonthlyCost();
      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();
      return (currentMonth / today) * daysInMonth;
    }

    // ═════════════════════════════════════════════════════════════════
    // UI - WIDGET
    // ═════════════════════════════════════════════════════════════════

    createWidget() {
      const widget = document.createElement("div");
      widget.id = "bael-cost-widget";
      widget.className = "bael-cost-widget";
      widget.innerHTML = this.renderWidget();
      document.body.appendChild(widget);
      this.widget = widget;
    }

    renderWidget() {
      const todayCost = this.getTodayCost();
      const dailyBudget = this.budget.daily;
      const pct = Math.min(100, (todayCost / dailyBudget) * 100);
      const sessionCost = this.currentSession.cost;

      return `
                <div class="cost-widget-inner">
                    <div class="cost-icon">💰</div>
                    <div class="cost-info">
                        <div class="cost-session">Session: $${sessionCost.toFixed(4)}</div>
                        <div class="cost-today">Today: $${todayCost.toFixed(2)} / $${dailyBudget.toFixed(2)}</div>
                    </div>
                    <div class="cost-bar">
                        <div class="cost-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <button class="cost-expand" id="cost-expand-btn">▲</button>
                </div>
            `;
    }

    updateWidget() {
      if (!this.widget) return;
      this.widget.innerHTML = this.renderWidget();
      // Re-bind expand button
      this.widget
        .querySelector("#cost-expand-btn")
        .addEventListener("click", () => this.togglePanel());
    }

    // ═════════════════════════════════════════════════════════════════
    // UI - PANEL
    // ═════════════════════════════════════════════════════════════════

    createPanel() {
      const panel = document.createElement("div");
      panel.id = "bael-cost-panel";
      panel.className = "bael-cost-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const todayCost = this.getTodayCost();
      const weeklyCost = this.getWeeklyCost();
      const monthlyCost = this.getMonthlyCost();
      const projectedCost = this.getProjectedMonthlyCost();
      const breakdown = this.getDailyBreakdown(7);
      const maxCost = Math.max(...breakdown.map((d) => d.cost), 0.01);

      return `
                <div class="cost-panel-header">
                    <h3>Cost Analytics</h3>
                    <button class="cost-panel-close" id="cost-panel-close">×</button>
                </div>

                <div class="cost-panel-content">
                    <!-- Summary Cards -->
                    <div class="cost-cards">
                        <div class="cost-card">
                            <div class="cost-card-label">Today</div>
                            <div class="cost-card-value">$${todayCost.toFixed(2)}</div>
                            <div class="cost-card-budget">of $${this.budget.daily} budget</div>
                            <div class="cost-card-bar">
                                <div style="width: ${Math.min(100, (todayCost / this.budget.daily) * 100)}%"></div>
                            </div>
                        </div>
                        <div class="cost-card">
                            <div class="cost-card-label">This Week</div>
                            <div class="cost-card-value">$${weeklyCost.toFixed(2)}</div>
                            <div class="cost-card-budget">of $${this.budget.weekly} budget</div>
                            <div class="cost-card-bar">
                                <div style="width: ${Math.min(100, (weeklyCost / this.budget.weekly) * 100)}%"></div>
                            </div>
                        </div>
                        <div class="cost-card">
                            <div class="cost-card-label">This Month</div>
                            <div class="cost-card-value">$${monthlyCost.toFixed(2)}</div>
                            <div class="cost-card-budget">of $${this.budget.monthly} budget</div>
                            <div class="cost-card-bar">
                                <div style="width: ${Math.min(100, (monthlyCost / this.budget.monthly) * 100)}%"></div>
                            </div>
                        </div>
                        <div class="cost-card projected">
                            <div class="cost-card-label">Projected</div>
                            <div class="cost-card-value">$${projectedCost.toFixed(2)}</div>
                            <div class="cost-card-budget">end of month</div>
                        </div>
                    </div>

                    <!-- Chart -->
                    <div class="cost-chart">
                        <h4>Last 7 Days</h4>
                        <div class="cost-bars">
                            ${breakdown
                              .map(
                                (d) => `
                                <div class="cost-chart-bar">
                                    <div class="bar-fill" style="height: ${(d.cost / maxCost) * 100}%"></div>
                                    <div class="bar-label">${d.date.slice(-5)}</div>
                                    <div class="bar-value">$${d.cost.toFixed(2)}</div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>

                    <!-- Current Session -->
                    <div class="cost-session-details">
                        <h4>Current Session</h4>
                        <div class="session-stats">
                            <div class="session-stat">
                                <span class="stat-label">Requests</span>
                                <span class="stat-value">${this.currentSession.requests}</span>
                            </div>
                            <div class="session-stat">
                                <span class="stat-label">Input Tokens</span>
                                <span class="stat-value">${this.formatNumber(this.currentSession.inputTokens)}</span>
                            </div>
                            <div class="session-stat">
                                <span class="stat-label">Output Tokens</span>
                                <span class="stat-value">${this.formatNumber(this.currentSession.outputTokens)}</span>
                            </div>
                            <div class="session-stat highlight">
                                <span class="stat-label">Session Cost</span>
                                <span class="stat-value">$${this.currentSession.cost.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Budget Settings -->
                    <div class="cost-budget-settings">
                        <h4>Budget Settings</h4>
                        <div class="budget-inputs">
                            <div class="budget-input-group">
                                <label>Daily Budget</label>
                                <input type="number" id="budget-daily" value="${this.budget.daily}" step="0.5" min="0">
                            </div>
                            <div class="budget-input-group">
                                <label>Weekly Budget</label>
                                <input type="number" id="budget-weekly" value="${this.budget.weekly}" step="1" min="0">
                            </div>
                            <div class="budget-input-group">
                                <label>Monthly Budget</label>
                                <input type="number" id="budget-monthly" value="${this.budget.monthly}" step="5" min="0">
                            </div>
                            <div class="budget-input-group">
                                <label>Alert at %</label>
                                <input type="number" id="budget-alert" value="${this.budget.alertThreshold * 100}" step="5" min="50" max="100">
                            </div>
                        </div>
                        <button class="budget-save-btn" id="budget-save">Save Budget Settings</button>
                    </div>

                    <!-- Export -->
                    <div class="cost-export">
                        <button class="export-btn" id="export-csv">📊 Export CSV</button>
                        <button class="export-btn" id="export-json">📋 Export JSON</button>
                    </div>
                </div>
            `;
    }

    updatePanel() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    // ═════════════════════════════════════════════════════════════════
    // STYLES
    // ═════════════════════════════════════════════════════════════════

    addStyles() {
      if (document.getElementById("bael-cost-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-cost-styles";
      styles.textContent = `
                .bael-cost-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 12px 16px;
                    z-index: 100030;
                    min-width: 200px;
                    transition: all 0.3s;
                }

                .bael-cost-widget.warning {
                    border-color: #f59e0b;
                    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
                }

                .bael-cost-widget.exceeded {
                    border-color: #ef4444;
                    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
                    animation: pulse-red 2s infinite;
                }

                @keyframes pulse-red {
                    0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
                    50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
                }

                .cost-widget-inner {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .cost-icon {
                    font-size: 24px;
                }

                .cost-info {
                    flex: 1;
                }

                .cost-session {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .cost-today {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .cost-bar {
                    width: 60px;
                    height: 6px;
                    background: var(--color-surface, #181820);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .cost-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #3b82f6);
                    border-radius: 3px;
                    transition: width 0.3s;
                }

                .cost-expand {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .cost-expand:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-text, #fff);
                }

                /* Panel */
                .bael-cost-panel {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    width: 420px;
                    max-height: 80vh;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100040;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .bael-cost-panel.visible {
                    display: flex;
                    animation: panelSlideUp 0.3s ease;
                }

                @keyframes panelSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .cost-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--color-border, #2a2a3a);
                }

                .cost-panel-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    margin: 0;
                }

                .cost-panel-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 20px;
                    cursor: pointer;
                    border-radius: 6px;
                }

                .cost-panel-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-text, #fff);
                }

                .cost-panel-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                /* Cards */
                .cost-cards {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .cost-card {
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 10px;
                    padding: 14px;
                }

                .cost-card.projected {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .cost-card-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 4px;
                }

                .cost-card-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .cost-card-budget {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    margin-top: 2px;
                }

                .cost-card-bar {
                    height: 4px;
                    background: var(--color-border, #2a2a3a);
                    border-radius: 2px;
                    margin-top: 8px;
                    overflow: hidden;
                }

                .cost-card-bar > div {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #3b82f6);
                    border-radius: 2px;
                }

                /* Chart */
                .cost-chart {
                    margin-bottom: 24px;
                }

                .cost-chart h4 {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 12px;
                }

                .cost-bars {
                    display: flex;
                    gap: 8px;
                    height: 120px;
                    align-items: flex-end;
                }

                .cost-chart-bar {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }

                .bar-fill {
                    width: 100%;
                    background: linear-gradient(180deg, var(--color-primary, #ff3366), #8b5cf6);
                    border-radius: 4px 4px 0 0;
                    min-height: 4px;
                }

                .bar-label {
                    font-size: 9px;
                    color: var(--color-text-muted, #666);
                    margin-top: 6px;
                }

                .bar-value {
                    font-size: 9px;
                    color: var(--color-text-secondary, #aaa);
                    position: absolute;
                    display: none;
                }

                .cost-chart-bar:hover .bar-value {
                    display: block;
                }

                /* Session */
                .cost-session-details {
                    margin-bottom: 24px;
                }

                .cost-session-details h4 {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 12px;
                }

                .session-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .session-stat {
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 8px;
                    padding: 10px 12px;
                    display: flex;
                    justify-content: space-between;
                }

                .session-stat.highlight {
                    grid-column: 1 / -1;
                    background: rgba(16, 185, 129, 0.1);
                    border-color: #10b981;
                }

                .stat-label {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .stat-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                /* Budget */
                .cost-budget-settings h4 {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 12px;
                }

                .budget-inputs {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .budget-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .budget-input-group label {
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                }

                .budget-input-group input {
                    padding: 8px 10px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                }

                .budget-input-group input:focus {
                    outline: none;
                    border-color: var(--color-primary, #ff3366);
                }

                .budget-save-btn {
                    width: 100%;
                    padding: 10px;
                    background: var(--color-primary, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .budget-save-btn:hover {
                    background: var(--color-primary-hover, #ff4477);
                }

                /* Export */
                .cost-export {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid var(--color-border, #2a2a3a);
                }

                .export-btn {
                    flex: 1;
                    padding: 10px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .export-btn:hover {
                    border-color: var(--color-primary, #ff3366);
                }

                /* Mobile */
                @media (max-width: 480px) {
                    .bael-cost-panel {
                        width: calc(100% - 20px);
                        left: 10px;
                        right: 10px;
                    }
                    .cost-cards {
                        grid-template-columns: 1fr;
                    }
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      // Widget expand button
      this.widget
        .querySelector("#cost-expand-btn")
        .addEventListener("click", () => this.togglePanel());

      // Initial panel bindings
      this.bindPanelEvents();

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "$") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    bindPanelEvents() {
      const panel = this.panel;
      if (!panel) return;

      // Close button
      const closeBtn = panel.querySelector("#cost-panel-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closePanel());
      }

      // Budget save
      const saveBtn = panel.querySelector("#budget-save");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => {
          this.budget.daily =
            parseFloat(panel.querySelector("#budget-daily").value) || 5;
          this.budget.weekly =
            parseFloat(panel.querySelector("#budget-weekly").value) || 25;
          this.budget.monthly =
            parseFloat(panel.querySelector("#budget-monthly").value) || 100;
          this.budget.alertThreshold =
            (parseFloat(panel.querySelector("#budget-alert").value) || 80) /
            100;
          this.saveData();
          this.checkBudgetAlerts();
          this.showNotification("Budget settings saved!");
        });
      }

      // Export buttons
      const exportCsv = panel.querySelector("#export-csv");
      if (exportCsv) {
        exportCsv.addEventListener("click", () => this.exportCSV());
      }

      const exportJson = panel.querySelector("#export-json");
      if (exportJson) {
        exportJson.addEventListener("click", () => this.exportJSON());
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // EXPORT
    // ═════════════════════════════════════════════════════════════════

    exportCSV() {
      const breakdown = this.getDailyBreakdown(30);
      let csv = "Date,Requests,Tokens,Cost\n";
      breakdown.forEach((d) => {
        csv += `${d.date},${d.requests},${d.tokens},$${d.cost.toFixed(4)}\n`;
      });

      this.download("bael-costs.csv", csv, "text/csv");
    }

    exportJSON() {
      const data = {
        exported: new Date().toISOString(),
        budget: this.budget,
        currentSession: {
          ...this.currentSession,
          models: Object.fromEntries(this.currentSession.models),
        },
        dailyBreakdown: this.getDailyBreakdown(30),
        totals: {
          today: this.getTodayCost(),
          week: this.getWeeklyCost(),
          month: this.getMonthlyCost(),
        },
      };

      this.download(
        "bael-costs.json",
        JSON.stringify(data, null, 2),
        "application/json",
      );
    }

    download(filename, content, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    getDateKey(date) {
      return date.toISOString().split("T")[0];
    }

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:cost:${event}`, { detail: data }),
      );
    }

    showNotification(message) {
      // Use existing notification system if available
      if (window.BaelNotifications) {
        window.BaelNotifications.show(message, "success");
      } else {
        console.log("💰 " + message);
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    togglePanel() {
      if (this.isExpanded) this.closePanel();
      else this.openPanel();
    }

    openPanel() {
      this.isExpanded = true;
      this.updatePanel();
      this.panel.classList.add("visible");
    }

    closePanel() {
      this.isExpanded = false;
      this.panel.classList.remove("visible");
    }

    getReport() {
      return {
        today: this.getTodayCost(),
        week: this.getWeeklyCost(),
        month: this.getMonthlyCost(),
        projected: this.getProjectedMonthlyCost(),
        session: this.currentSession,
        budget: this.budget,
      };
    }
  }

  // Initialize
  window.BaelCostTracker = new BaelCostTracker();
})();
