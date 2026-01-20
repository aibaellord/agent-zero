/**
 * Bael Live Stats - Real-time performance metrics & analytics dashboard
 * Keyboard: Ctrl+Shift+M
 */
(function () {
  "use strict";

  class BaelLiveStats {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-live-stats";
      this.stats = {
        messagesTotal: 0,
        messagesUser: 0,
        messagesAgent: 0,
        tokensEstimated: 0,
        sessionStart: Date.now(),
        responseTimesMs: [],
        toolCalls: {},
        wordsTyped: 0,
        codeBlocks: 0,
        errors: 0,
      };
      this.updateInterval = null;
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.startTracking();
      this.initialized = true;
      console.log("📊 Bael Live Stats initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-live-stats-styles")) return;

      const css = `
                .bael-stats-fab {
                    position: fixed;
                    bottom: 240px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-stats-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
                }

                .bael-stats-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 700px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 10001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }

                .bael-stats-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-stats-header {
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    padding: 18px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-stats-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-stats-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    transition: background 0.2s;
                }

                .bael-stats-close:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-stats-body {
                    padding: 24px;
                    max-height: calc(85vh - 70px);
                    overflow-y: auto;
                }

                .bael-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .bael-stat-card {
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.2s;
                }

                .bael-stat-card:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(139, 92, 246, 0.3);
                }

                .bael-stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #8b5cf6;
                    margin-bottom: 4px;
                }

                .bael-stat-label {
                    font-size: 12px;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .bael-stats-section {
                    margin-bottom: 24px;
                }

                .bael-stats-section-title {
                    color: #ccc;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-chart-container {
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    padding: 16px;
                    height: 150px;
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                }

                .bael-chart-bar {
                    flex: 1;
                    background: linear-gradient(to top, #8b5cf6, #a78bfa);
                    border-radius: 4px 4px 0 0;
                    min-height: 10px;
                    transition: height 0.3s ease;
                    position: relative;
                }

                .bael-chart-bar:hover {
                    opacity: 0.8;
                }

                .bael-chart-bar::after {
                    content: attr(data-value);
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    color: #888;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .bael-chart-bar:hover::after {
                    opacity: 1;
                }

                .bael-tool-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .bael-tool-badge {
                    background: rgba(139, 92, 246, 0.2);
                    color: #a78bfa;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bael-tool-count {
                    background: rgba(139, 92, 246, 0.3);
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-weight: 600;
                }

                .bael-session-info {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    padding: 16px;
                }

                .bael-session-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-session-label {
                    color: #888;
                    font-size: 13px;
                }

                .bael-session-value {
                    color: #fff;
                    font-size: 13px;
                    font-weight: 500;
                }

                .bael-stats-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .bael-stats-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 10px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-stats-btn.primary {
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    color: white;
                }

                .bael-stats-btn.secondary {
                    background: rgba(255,255,255,0.1);
                    color: #ccc;
                }

                .bael-stats-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .bael-stats-live {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: bael-pulse 1.5s infinite;
                }

                @keyframes bael-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-live-stats-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB Button
      this.fab = document.createElement("button");
      this.fab.className = "bael-stats-fab";
      this.fab.innerHTML = "📊";
      this.fab.title = "Live Stats (Ctrl+Shift+M)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-stats-panel";
      this.panel.innerHTML = `
                <div class="bael-stats-header">
                    <div class="bael-stats-title">
                        <span>📊</span>
                        <span>Live Stats</span>
                        <span class="bael-stats-live"></span>
                    </div>
                    <button class="bael-stats-close">×</button>
                </div>
                <div class="bael-stats-body">
                    <div class="bael-stats-grid">
                        <div class="bael-stat-card">
                            <div class="bael-stat-value" id="bael-stat-messages">0</div>
                            <div class="bael-stat-label">Total Messages</div>
                        </div>
                        <div class="bael-stat-card">
                            <div class="bael-stat-value" id="bael-stat-tokens">0</div>
                            <div class="bael-stat-label">Est. Tokens</div>
                        </div>
                        <div class="bael-stat-card">
                            <div class="bael-stat-value" id="bael-stat-time">00:00</div>
                            <div class="bael-stat-label">Session Time</div>
                        </div>
                        <div class="bael-stat-card">
                            <div class="bael-stat-value" id="bael-stat-user">0</div>
                            <div class="bael-stat-label">User Messages</div>
                        </div>
                        <div class="bael-stat-card">
                            <div class="bael-stat-value" id="bael-stat-agent">0</div>
                            <div class="bael-stat-label">Agent Messages</div>
                        </div>
                        <div class="bael-stat-card">
                            <div class="bael-stat-value" id="bael-stat-avg">0ms</div>
                            <div class="bael-stat-label">Avg Response</div>
                        </div>
                    </div>

                    <div class="bael-stats-section">
                        <div class="bael-stats-section-title">
                            <span>📈</span> Response Times (Last 20)
                        </div>
                        <div class="bael-chart-container" id="bael-response-chart"></div>
                    </div>

                    <div class="bael-stats-section">
                        <div class="bael-stats-section-title">
                            <span>🔧</span> Tool Usage
                        </div>
                        <div class="bael-tool-list" id="bael-tool-list">
                            <div style="color: #666; font-size: 13px;">No tools used yet</div>
                        </div>
                    </div>

                    <div class="bael-stats-section">
                        <div class="bael-stats-section-title">
                            <span>ℹ️</span> Session Details
                        </div>
                        <div class="bael-session-info">
                            <div class="bael-session-item">
                                <span class="bael-session-label">Started</span>
                                <span class="bael-session-value" id="bael-session-start">-</span>
                            </div>
                            <div class="bael-session-item">
                                <span class="bael-session-label">Words Typed</span>
                                <span class="bael-session-value" id="bael-session-words">0</span>
                            </div>
                            <div class="bael-session-item">
                                <span class="bael-session-label">Code Blocks</span>
                                <span class="bael-session-value" id="bael-session-code">0</span>
                            </div>
                            <div class="bael-session-item">
                                <span class="bael-session-label">Errors</span>
                                <span class="bael-session-value" id="bael-session-errors">0</span>
                            </div>
                        </div>
                    </div>

                    <div class="bael-stats-actions">
                        <button class="bael-stats-btn secondary" id="bael-stats-reset">🔄 Reset Stats</button>
                        <button class="bael-stats-btn primary" id="bael-stats-export">📥 Export Report</button>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Event listeners
      this.panel
        .querySelector(".bael-stats-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#bael-stats-reset")
        .addEventListener("click", () => this.resetStats());
      this.panel
        .querySelector("#bael-stats-export")
        .addEventListener("click", () => this.exportReport());
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "M") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    startTracking() {
      // Track messages
      this.observeMessages();

      // Update stats periodically
      this.updateInterval = setInterval(() => {
        this.updateDisplay();
      }, 1000);

      // Track input
      const input = document.querySelector(
        '#chat-input, textarea, [contenteditable="true"]',
      );
      if (input) {
        input.addEventListener("input", (e) => {
          const text = e.target.value || e.target.textContent || "";
          this.stats.wordsTyped = text.split(/\s+/).filter((w) => w).length;
        });
      }
    }

    observeMessages() {
      const container = document.querySelector(
        '#messages, .messages, .chat-messages, [class*="message"]',
      );
      if (!container) return;

      const observer = new MutationObserver((mutations) => {
        this.collectStats();
      });

      observer.observe(container, { childList: true, subtree: true });

      // Initial collection
      this.collectStats();
    }

    collectStats() {
      const messages = document.querySelectorAll(
        '[class*="message"], .message, .chat-message',
      );
      let userCount = 0;
      let agentCount = 0;
      let totalTokens = 0;
      let codeBlocks = 0;

      messages.forEach((msg) => {
        const text = msg.textContent || "";
        const isUser =
          msg.classList.contains("user") ||
          msg.querySelector('[class*="user"]') ||
          msg.getAttribute("data-role") === "user";

        if (isUser) userCount++;
        else agentCount++;

        // Estimate tokens (rough: 1 token ≈ 4 chars)
        totalTokens += Math.ceil(text.length / 4);

        // Count code blocks
        codeBlocks += msg.querySelectorAll("pre, code").length;
      });

      this.stats.messagesTotal = messages.length;
      this.stats.messagesUser = userCount;
      this.stats.messagesAgent = agentCount;
      this.stats.tokensEstimated = totalTokens;
      this.stats.codeBlocks = codeBlocks;

      this.saveToStorage();
    }

    updateDisplay() {
      if (!this.visible) return;

      // Update stat cards
      document.getElementById("bael-stat-messages").textContent =
        this.stats.messagesTotal;
      document.getElementById("bael-stat-tokens").textContent =
        this.formatNumber(this.stats.tokensEstimated);
      document.getElementById("bael-stat-user").textContent =
        this.stats.messagesUser;
      document.getElementById("bael-stat-agent").textContent =
        this.stats.messagesAgent;

      // Session time
      const elapsed = Date.now() - this.stats.sessionStart;
      document.getElementById("bael-stat-time").textContent =
        this.formatDuration(elapsed);

      // Average response time
      const avgTime =
        this.stats.responseTimesMs.length > 0
          ? Math.round(
              this.stats.responseTimesMs.reduce((a, b) => a + b, 0) /
                this.stats.responseTimesMs.length,
            )
          : 0;
      document.getElementById("bael-stat-avg").textContent = avgTime + "ms";

      // Response time chart
      this.updateChart();

      // Tool usage
      this.updateToolList();

      // Session details
      document.getElementById("bael-session-start").textContent = new Date(
        this.stats.sessionStart,
      ).toLocaleTimeString();
      document.getElementById("bael-session-words").textContent =
        this.stats.wordsTyped;
      document.getElementById("bael-session-code").textContent =
        this.stats.codeBlocks;
      document.getElementById("bael-session-errors").textContent =
        this.stats.errors;
    }

    updateChart() {
      const container = document.getElementById("bael-response-chart");
      if (!container) return;

      const times = this.stats.responseTimesMs.slice(-20);
      if (times.length === 0) {
        container.innerHTML =
          '<div style="color: #666; margin: auto; font-size: 13px;">No response data yet</div>';
        return;
      }

      const maxTime = Math.max(...times, 1000);

      container.innerHTML = times
        .map((time, i) => {
          const height = Math.max(10, (time / maxTime) * 120);
          return `<div class="bael-chart-bar" style="height: ${height}px" data-value="${time}ms"></div>`;
        })
        .join("");
    }

    updateToolList() {
      const container = document.getElementById("bael-tool-list");
      if (!container) return;

      const tools = Object.entries(this.stats.toolCalls);
      if (tools.length === 0) {
        container.innerHTML =
          '<div style="color: #666; font-size: 13px;">No tools used yet</div>';
        return;
      }

      container.innerHTML = tools
        .map(
          ([name, count]) => `
                <div class="bael-tool-badge">
                    ${name}
                    <span class="bael-tool-count">${count}</span>
                </div>
            `,
        )
        .join("");
    }

    recordResponseTime(ms) {
      this.stats.responseTimesMs.push(ms);
      if (this.stats.responseTimesMs.length > 100) {
        this.stats.responseTimesMs.shift();
      }
      this.saveToStorage();
    }

    recordToolCall(toolName) {
      this.stats.toolCalls[toolName] =
        (this.stats.toolCalls[toolName] || 0) + 1;
      this.saveToStorage();
    }

    resetStats() {
      this.stats = {
        messagesTotal: 0,
        messagesUser: 0,
        messagesAgent: 0,
        tokensEstimated: 0,
        sessionStart: Date.now(),
        responseTimesMs: [],
        toolCalls: {},
        wordsTyped: 0,
        codeBlocks: 0,
        errors: 0,
      };
      this.saveToStorage();
      this.updateDisplay();
    }

    exportReport() {
      const report = {
        title: "Bael Live Stats Report",
        generated: new Date().toISOString(),
        sessionDuration: this.formatDuration(
          Date.now() - this.stats.sessionStart,
        ),
        stats: this.stats,
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-stats-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
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

      if (hours > 0) {
        return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
      }
      return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.collectStats();
      this.updateDisplay();
      this.panel.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.stats = { ...this.stats, ...data };
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
      } catch (e) {}
    }
  }

  window.BaelLiveStats = new BaelLiveStats();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelLiveStats.initialize();
    });
  } else {
    window.BaelLiveStats.initialize();
  }
})();
