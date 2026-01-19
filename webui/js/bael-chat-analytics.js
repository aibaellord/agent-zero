/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * CHAT ANALYTICS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive conversation analytics:
 * - Message statistics
 * - Usage patterns
 * - Response times
 * - Topic analysis
 * - Sentiment tracking
 * - Export capabilities
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelChatAnalytics {
    constructor() {
      // Analytics data
      this.analytics = {
        messages: [],
        sessions: [],
        daily: {},
        topics: {},
        sentiment: {},
        models: {},
        responseTimes: [],
      };

      // Current session
      this.currentSession = {
        id: null,
        startTime: null,
        messageCount: 0,
        tokenCount: 0,
      };

      // UI
      this.panel = null;
      this.isVisible = false;
      this.activeTab = "overview";

      this.init();
    }

    init() {
      this.loadAnalytics();
      this.startSession();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.observeMessages();
      console.log("📊 Bael Chat Analytics initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // SESSION TRACKING
    // ═════════════════════════════════════════════════════════════════

    startSession() {
      this.currentSession = {
        id: "session_" + Date.now().toString(36),
        startTime: new Date(),
        messageCount: 0,
        tokenCount: 0,
        userMessages: 0,
        aiMessages: 0,
      };
    }

    endSession() {
      if (!this.currentSession.id) return;

      const session = {
        ...this.currentSession,
        endTime: new Date(),
        duration:
          Date.now() - new Date(this.currentSession.startTime).getTime(),
      };

      this.analytics.sessions.push(session);
      this.saveAnalytics();
      this.startSession();
    }

    // ═════════════════════════════════════════════════════════════════
    // MESSAGE TRACKING
    // ═════════════════════════════════════════════════════════════════

    trackMessage(data) {
      const message = {
        id: "msg_" + Date.now().toString(36),
        timestamp: new Date(),
        role: data.role, // 'user' or 'assistant'
        content: data.content,
        tokenCount: this.estimateTokens(data.content),
        responseTime: data.responseTime || null,
        model: data.model || "unknown",
        sessionId: this.currentSession.id,
      };

      this.analytics.messages.push(message);
      this.currentSession.messageCount++;
      this.currentSession.tokenCount += message.tokenCount;

      if (data.role === "user") {
        this.currentSession.userMessages++;
      } else {
        this.currentSession.aiMessages++;
      }

      // Track daily
      const date = new Date().toISOString().split("T")[0];
      if (!this.analytics.daily[date]) {
        this.analytics.daily[date] = {
          messages: 0,
          tokens: 0,
          sessions: 0,
          userMessages: 0,
          aiMessages: 0,
        };
      }
      this.analytics.daily[date].messages++;
      this.analytics.daily[date].tokens += message.tokenCount;
      if (data.role === "user") {
        this.analytics.daily[date].userMessages++;
      } else {
        this.analytics.daily[date].aiMessages++;
      }

      // Track response times
      if (data.responseTime) {
        this.analytics.responseTimes.push({
          time: data.responseTime,
          timestamp: new Date(),
          model: data.model,
        });
      }

      // Track models
      if (data.model) {
        if (!this.analytics.models[data.model]) {
          this.analytics.models[data.model] = { count: 0, tokens: 0 };
        }
        this.analytics.models[data.model].count++;
        this.analytics.models[data.model].tokens += message.tokenCount;
      }

      // Simple topic extraction
      if (data.role === "user") {
        this.extractTopics(data.content);
      }

      // Simple sentiment tracking
      if (data.role === "assistant") {
        this.trackSentiment(data.content);
      }

      this.saveAnalytics();

      // Keep only last 1000 messages
      if (this.analytics.messages.length > 1000) {
        this.analytics.messages = this.analytics.messages.slice(-1000);
      }
    }

    extractTopics(content) {
      // Simple keyword extraction
      const keywords = content
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 4);

      const stopwords = new Set([
        "about",
        "above",
        "after",
        "again",
        "would",
        "could",
        "should",
        "there",
        "their",
        "these",
        "those",
        "where",
        "which",
        "while",
        "being",
        "other",
      ]);

      keywords.forEach((word) => {
        if (!stopwords.has(word)) {
          this.analytics.topics[word] = (this.analytics.topics[word] || 0) + 1;
        }
      });
    }

    trackSentiment(content) {
      const positive = [
        "great",
        "thanks",
        "helpful",
        "perfect",
        "excellent",
        "amazing",
        "awesome",
      ];
      const negative = [
        "error",
        "wrong",
        "failed",
        "sorry",
        "unfortunately",
        "issue",
        "problem",
      ];

      const lower = content.toLowerCase();
      const date = new Date().toISOString().split("T")[0];

      if (!this.analytics.sentiment[date]) {
        this.analytics.sentiment[date] = {
          positive: 0,
          neutral: 0,
          negative: 0,
        };
      }

      if (positive.some((w) => lower.includes(w))) {
        this.analytics.sentiment[date].positive++;
      } else if (negative.some((w) => lower.includes(w))) {
        this.analytics.sentiment[date].negative++;
      } else {
        this.analytics.sentiment[date].neutral++;
      }
    }

    estimateTokens(text) {
      if (!text) return 0;
      return Math.ceil(text.length / 4);
    }

    // ═════════════════════════════════════════════════════════════════
    // STATISTICS
    // ═════════════════════════════════════════════════════════════════

    getStats() {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const todayData = this.analytics.daily[today] || {
        messages: 0,
        tokens: 0,
      };

      // Calculate week stats
      let weekMessages = 0,
        weekTokens = 0;
      Object.entries(this.analytics.daily).forEach(([date, data]) => {
        if (date >= weekAgo) {
          weekMessages += data.messages;
          weekTokens += data.tokens;
        }
      });

      // Average response time
      const recentTimes = this.analytics.responseTimes.slice(-50);
      const avgResponseTime =
        recentTimes.length > 0
          ? recentTimes.reduce((sum, r) => sum + r.time, 0) / recentTimes.length
          : 0;

      // Top topics
      const topTopics = Object.entries(this.analytics.topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      // Model usage
      const modelUsage = Object.entries(this.analytics.models)
        .map(([model, data]) => ({ model, ...data }))
        .sort((a, b) => b.count - a.count);

      return {
        totalMessages: this.analytics.messages.length,
        totalSessions: this.analytics.sessions.length,
        todayMessages: todayData.messages,
        todayTokens: todayData.tokens,
        weekMessages,
        weekTokens,
        avgResponseTime: Math.round(avgResponseTime),
        topTopics,
        modelUsage,
        currentSession: this.currentSession,
      };
    }

    getDailyStats(days = 7) {
      const result = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const data = this.analytics.daily[dateStr] || {
          messages: 0,
          tokens: 0,
        };

        result.push({
          date: dateStr,
          label: date.toLocaleDateString("en-US", { weekday: "short" }),
          ...data,
        });
      }

      return result;
    }

    getHourlyDistribution() {
      const hours = Array(24).fill(0);

      this.analytics.messages.forEach((msg) => {
        const hour = new Date(msg.timestamp).getHours();
        hours[hour]++;
      });

      return hours.map((count, hour) => ({
        hour,
        count,
        label: `${hour}:00`,
      }));
    }

    // ═════════════════════════════════════════════════════════════════
    // MESSAGE OBSERVATION
    // ═════════════════════════════════════════════════════════════════

    observeMessages() {
      // Try to find and observe message container
      setTimeout(() => {
        const container = document.querySelector(
          ".messages, #messages, .chat-messages",
        );
        if (!container) {
          setTimeout(() => this.observeMessages(), 2000);
          return;
        }

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.handleNewMessage(node);
              }
            });
          });
        });

        observer.observe(container, { childList: true, subtree: true });
      }, 1000);
    }

    handleNewMessage(node) {
      const isUser =
        node.classList?.contains("user") || node.dataset?.role === "user";
      const isAI =
        node.classList?.contains("ai") ||
        node.classList?.contains("assistant") ||
        node.dataset?.role === "assistant";

      if (isUser || isAI) {
        this.trackMessage({
          role: isUser ? "user" : "assistant",
          content: node.textContent,
          model: window.BaelModelRouter?.getCurrentModel?.()?.id || "unknown",
        });
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-analytics-panel";
      panel.className = "bael-analytics-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const stats = this.getStats();
      const dailyStats = this.getDailyStats(7);
      const hourlyDist = this.getHourlyDistribution();
      const maxHourly = Math.max(...hourlyDist.map((h) => h.count), 1);
      const maxDaily = Math.max(...dailyStats.map((d) => d.messages), 1);

      return `
                <div class="analytics-header">
                    <div class="analytics-title">
                        <span class="analytics-icon">📊</span>
                        <span>Chat Analytics</span>
                    </div>
                    <button class="analytics-close" id="analytics-close">×</button>
                </div>

                <div class="analytics-tabs">
                    <button class="analytics-tab ${this.activeTab === "overview" ? "active" : ""}"
                            data-tab="overview">Overview</button>
                    <button class="analytics-tab ${this.activeTab === "activity" ? "active" : ""}"
                            data-tab="activity">Activity</button>
                    <button class="analytics-tab ${this.activeTab === "topics" ? "active" : ""}"
                            data-tab="topics">Topics</button>
                    <button class="analytics-tab ${this.activeTab === "models" ? "active" : ""}"
                            data-tab="models">Models</button>
                </div>

                <div class="analytics-content">
                    ${
                      this.activeTab === "overview"
                        ? `
                        <div class="stats-grid">
                            <div class="stat-card">
                                <span class="stat-value">${stats.totalMessages}</span>
                                <span class="stat-label">Total Messages</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value">${stats.todayMessages}</span>
                                <span class="stat-label">Today's Messages</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value">${this.formatNumber(stats.todayTokens)}</span>
                                <span class="stat-label">Today's Tokens</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value">${stats.avgResponseTime}ms</span>
                                <span class="stat-label">Avg Response</span>
                            </div>
                        </div>

                        <div class="chart-section">
                            <h4>Last 7 Days</h4>
                            <div class="bar-chart">
                                ${dailyStats
                                  .map(
                                    (d) => `
                                    <div class="bar-item">
                                        <div class="bar" style="height: ${(d.messages / maxDaily) * 100}%">
                                            <span class="bar-value">${d.messages}</span>
                                        </div>
                                        <span class="bar-label">${d.label}</span>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <div class="current-session">
                            <h4>Current Session</h4>
                            <div class="session-stats">
                                <span>Messages: ${stats.currentSession.messageCount}</span>
                                <span>Tokens: ${this.formatNumber(stats.currentSession.tokenCount)}</span>
                                <span>Duration: ${this.formatDuration(Date.now() - new Date(stats.currentSession.startTime).getTime())}</span>
                            </div>
                        </div>
                    `
                        : ""
                    }

                    ${
                      this.activeTab === "activity"
                        ? `
                        <div class="chart-section">
                            <h4>Hourly Activity Distribution</h4>
                            <div class="hourly-chart">
                                ${hourlyDist
                                  .map(
                                    (h) => `
                                    <div class="hour-bar" style="height: ${(h.count / maxHourly) * 100}%"
                                         title="${h.label}: ${h.count} messages"></div>
                                `,
                                  )
                                  .join("")}
                            </div>
                            <div class="hour-labels">
                                <span>0h</span>
                                <span>6h</span>
                                <span>12h</span>
                                <span>18h</span>
                                <span>24h</span>
                            </div>
                        </div>

                        <div class="chart-section">
                            <h4>Weekly Token Usage</h4>
                            <div class="bar-chart">
                                ${dailyStats
                                  .map(
                                    (d) => `
                                    <div class="bar-item">
                                        <div class="bar tokens" style="height: ${(d.tokens / Math.max(...dailyStats.map((x) => x.tokens), 1)) * 100}%">
                                            <span class="bar-value">${this.formatNumber(d.tokens)}</span>
                                        </div>
                                        <span class="bar-label">${d.label}</span>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    ${
                      this.activeTab === "topics"
                        ? `
                        <div class="topics-section">
                            <h4>Top Topics</h4>
                            <div class="topics-list">
                                ${stats.topTopics
                                  .map(
                                    ([topic, count]) => `
                                    <div class="topic-item">
                                        <span class="topic-name">${topic}</span>
                                        <div class="topic-bar">
                                            <div class="topic-fill" style="width: ${(count / stats.topTopics[0][1]) * 100}%"></div>
                                        </div>
                                        <span class="topic-count">${count}</span>
                                    </div>
                                `,
                                  )
                                  .join("")}
                                ${stats.topTopics.length === 0 ? '<p class="no-data">No topics tracked yet</p>' : ""}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    ${
                      this.activeTab === "models"
                        ? `
                        <div class="models-section">
                            <h4>Model Usage</h4>
                            <div class="models-list">
                                ${stats.modelUsage
                                  .map(
                                    (m) => `
                                    <div class="model-item">
                                        <div class="model-info">
                                            <span class="model-name">${m.model}</span>
                                            <span class="model-stats">${m.count} messages • ${this.formatNumber(m.tokens)} tokens</span>
                                        </div>
                                        <div class="model-bar">
                                            <div class="model-fill" style="width: ${(m.count / stats.modelUsage[0].count) * 100}%"></div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                                ${stats.modelUsage.length === 0 ? '<p class="no-data">No model data yet</p>' : ""}
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>

                <div class="analytics-footer">
                    <button class="analytics-btn" id="analytics-export">📤 Export Data</button>
                    <button class="analytics-btn danger" id="analytics-clear">🗑️ Clear Data</button>
                </div>
            `;
    }

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m`;
      return `${seconds}s`;
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    addStyles() {
      if (document.getElementById("bael-analytics-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-analytics-styles";
      styles.textContent = `
                .bael-analytics-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 700px;
                    max-height: 85vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100085;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 50px 150px rgba(0,0,0,0.8);
                }

                .bael-analytics-panel.visible {
                    display: flex;
                    animation: analyticsIn 0.3s ease;
                }

                @keyframes analyticsIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .analytics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .analytics-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .analytics-icon { font-size: 24px; }

                .analytics-close {
                    padding: 8px 16px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 20px;
                    cursor: pointer;
                }

                .analytics-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 12px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .analytics-tab {
                    padding: 10px 20px;
                    background: transparent;
                    border: none;
                    border-radius: 10px;
                    color: var(--color-text-muted, #888);
                    font-size: 13px;
                    cursor: pointer;
                }

                .analytics-tab:hover { background: rgba(255,255,255,0.05); }
                .analytics-tab.active {
                    background: rgba(255,51,102,0.1);
                    color: var(--color-primary, #ff3366);
                }

                .analytics-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    padding: 20px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 14px;
                    text-align: center;
                }

                .stat-value {
                    display: block;
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--color-primary, #ff3366);
                    margin-bottom: 6px;
                }

                .stat-label {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    text-transform: uppercase;
                }

                .chart-section {
                    margin-bottom: 24px;
                }

                .chart-section h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    margin-bottom: 16px;
                }

                .bar-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                    height: 150px;
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 14px;
                }

                .bar-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }

                .bar {
                    width: 100%;
                    background: var(--color-primary, #ff3366);
                    border-radius: 6px 6px 0 0;
                    min-height: 4px;
                    position: relative;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                }

                .bar.tokens { background: #6366f1; }

                .bar-value {
                    position: absolute;
                    top: -20px;
                    font-size: 10px;
                    color: var(--color-text-muted, #888);
                    white-space: nowrap;
                }

                .bar-label {
                    margin-top: 8px;
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .hourly-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    height: 100px;
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 14px;
                }

                .hour-bar {
                    flex: 1;
                    background: linear-gradient(to top, var(--color-primary, #ff3366), rgba(255,51,102,0.3));
                    border-radius: 2px;
                    min-height: 2px;
                }

                .hour-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                }

                .current-session {
                    padding: 16px;
                    background: rgba(255,51,102,0.05);
                    border: 1px solid rgba(255,51,102,0.2);
                    border-radius: 14px;
                }

                .current-session h4 {
                    font-size: 13px;
                    color: var(--color-text, #fff);
                    margin-bottom: 12px;
                }

                .session-stats {
                    display: flex;
                    gap: 20px;
                    font-size: 13px;
                    color: var(--color-text-muted, #888);
                }

                .topics-list, .models-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .topic-item, .model-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .topic-name {
                    width: 100px;
                    font-size: 13px;
                    color: var(--color-text, #fff);
                    text-transform: capitalize;
                }

                .topic-bar, .model-bar {
                    flex: 1;
                    height: 8px;
                    background: var(--color-surface, #181820);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .topic-fill, .model-fill {
                    height: 100%;
                    background: var(--color-primary, #ff3366);
                    border-radius: 4px;
                }

                .topic-count {
                    width: 40px;
                    text-align: right;
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                }

                .model-info { flex-shrink: 0; width: 200px; }

                .model-name {
                    display: block;
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .model-stats {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    color: var(--color-text-muted, #666);
                }

                .analytics-footer {
                    display: flex;
                    gap: 12px;
                    padding: 16px 24px;
                    border-top: 1px solid var(--color-border, #252535);
                }

                .analytics-btn {
                    padding: 10px 20px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                }

                .analytics-btn.danger {
                    margin-left: auto;
                    background: rgba(239,68,68,0.1);
                    border-color: rgba(239,68,68,0.3);
                    color: #ef4444;
                }

                @media (max-width: 640px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .stat-value { font-size: 22px; }
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EXPORT
    // ═════════════════════════════════════════════════════════════════

    exportData() {
      const data = {
        exportedAt: new Date().toISOString(),
        stats: this.getStats(),
        analytics: this.analytics,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-analytics-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      window.BaelNotifications?.show("Analytics exported", "success");
    }

    clearData() {
      if (!confirm("Clear all analytics data? This cannot be undone.")) return;

      this.analytics = {
        messages: [],
        sessions: [],
        daily: {},
        topics: {},
        sentiment: {},
        models: {},
        responseTimes: [],
      };

      this.saveAnalytics();
      this.updateUI();
      window.BaelNotifications?.show("Analytics cleared", "success");
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadAnalytics() {
      try {
        const saved = localStorage.getItem("bael_chat_analytics");
        if (saved) {
          this.analytics = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Failed to load analytics:", e);
      }
    }

    saveAnalytics() {
      localStorage.setItem(
        "bael_chat_analytics",
        JSON.stringify(this.analytics),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "Y") {
          e.preventDefault();
          this.toggle();
        }
      });

      // End session on page unload
      window.addEventListener("beforeunload", () => {
        this.endSession();
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      // Close
      this.panel
        .querySelector("#analytics-close")
        ?.addEventListener("click", () => this.close());

      // Tabs
      this.panel.querySelectorAll(".analytics-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.activeTab = tab.dataset.tab;
          this.updateUI();
        });
      });

      // Export
      this.panel
        .querySelector("#analytics-export")
        ?.addEventListener("click", () => this.exportData());

      // Clear
      this.panel
        .querySelector("#analytics-clear")
        ?.addEventListener("click", () => this.clearData());
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    open() {
      this.isVisible = true;
      this.updateUI();
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelChatAnalytics = new BaelChatAnalytics();
})();
