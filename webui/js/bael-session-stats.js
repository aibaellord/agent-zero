/**
 * BAEL - LORD OF ALL
 * Session Statistics Widget - Timer, Token Counter, Stats
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelSessionStats {
    constructor() {
      this.widget = null;
      this.isMinimized = false;
      this.sessionStart = Date.now();
      this.stats = {
        tokens: { input: 0, output: 0, total: 0 },
        messages: { user: 0, agent: 0, total: 0 },
        tools: { count: 0, list: [] },
        models: new Set(),
        cost: 0,
      };
      this.tokenRates = {
        "gpt-4": { input: 0.03, output: 0.06 },
        "gpt-4-turbo": { input: 0.01, output: 0.03 },
        "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
        "claude-3-opus": { input: 0.015, output: 0.075 },
        "claude-3-sonnet": { input: 0.003, output: 0.015 },
        "claude-3-haiku": { input: 0.00025, output: 0.00125 },
        default: { input: 0.001, output: 0.002 },
      };
      this.timerInterval = null;
      this.init();
    }

    init() {
      this.createWidget();
      this.bindEvents();
      this.startTimer();
      this.loadFromStorage();
      console.log("📊 Bael Session Stats initialized");
    }

    createWidget() {
      const widget = document.createElement("div");
      widget.id = "bael-session-stats";
      widget.className = "bael-session-stats";
      widget.innerHTML = `
                <div class="stats-header">
                    <div class="stats-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        <span>Session</span>
                    </div>
                    <div class="stats-controls">
                        <button class="stats-btn" id="stats-refresh" title="Refresh">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                        <button class="stats-btn" id="stats-minimize" title="Minimize">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="stats-body">
                    <div class="stats-row timer">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-content">
                            <div class="stat-value" id="session-timer">00:00:00</div>
                            <div class="stat-label">Session Time</div>
                        </div>
                    </div>
                    <div class="stats-divider"></div>
                    <div class="stats-row tokens">
                        <div class="stat-icon">🔢</div>
                        <div class="stat-content">
                            <div class="stat-value" id="token-count">0</div>
                            <div class="stat-label">Total Tokens</div>
                        </div>
                        <div class="stat-breakdown">
                            <span class="token-in" title="Input tokens">↑ <span id="tokens-in">0</span></span>
                            <span class="token-out" title="Output tokens">↓ <span id="tokens-out">0</span></span>
                        </div>
                    </div>
                    <div class="stats-row messages">
                        <div class="stat-icon">💬</div>
                        <div class="stat-content">
                            <div class="stat-value" id="message-count">0</div>
                            <div class="stat-label">Messages</div>
                        </div>
                        <div class="stat-breakdown">
                            <span class="msg-user" title="User messages">👤 <span id="msgs-user">0</span></span>
                            <span class="msg-agent" title="Agent messages">🤖 <span id="msgs-agent">0</span></span>
                        </div>
                    </div>
                    <div class="stats-row tools">
                        <div class="stat-icon">🔧</div>
                        <div class="stat-content">
                            <div class="stat-value" id="tool-count">0</div>
                            <div class="stat-label">Tool Calls</div>
                        </div>
                    </div>
                    <div class="stats-divider"></div>
                    <div class="stats-row cost">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value" id="cost-estimate">$0.00</div>
                            <div class="stat-label">Est. Cost</div>
                        </div>
                    </div>
                    <div class="stats-row model">
                        <div class="stat-icon">🧠</div>
                        <div class="stat-content">
                            <div class="stat-value model-name" id="model-name">-</div>
                            <div class="stat-label">Model</div>
                        </div>
                    </div>
                </div>
                <div class="stats-footer">
                    <button class="reset-btn" id="stats-reset">Reset Session</button>
                </div>
            `;
      document.body.appendChild(widget);
      this.widget = widget;
      this.addStyles();
    }

    addStyles() {
      if (document.getElementById("bael-session-stats-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-session-stats-styles";
      styles.textContent = `
                .bael-session-stats {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 260px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    z-index: 9990;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .bael-session-stats.minimized {
                    height: 48px;
                    width: 200px;
                }

                .bael-session-stats.minimized .stats-body,
                .bael-session-stats.minimized .stats-footer {
                    display: none;
                }

                .stats-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: rgba(255, 51, 102, 0.1);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .stats-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--bael-accent, #ff3366);
                    font-weight: 600;
                    font-size: 14px;
                }

                .stats-title svg {
                    width: 16px;
                    height: 16px;
                }

                .stats-controls {
                    display: flex;
                    gap: 4px;
                }

                .stats-btn {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .stats-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--bael-text-primary, #fff);
                }

                .stats-btn svg {
                    width: 14px;
                    height: 14px;
                }

                .stats-body {
                    padding: 12px;
                }

                .stats-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    border-radius: 10px;
                    transition: background 0.2s ease;
                }

                .stats-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .stat-icon {
                    font-size: 20px;
                    width: 32px;
                    text-align: center;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
                }

                .stat-value.model-name {
                    font-size: 12px;
                    font-weight: 500;
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .stat-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 11px;
                    font-family: monospace;
                }

                .token-in, .msg-user {
                    color: #4caf50;
                }

                .token-out, .msg-agent {
                    color: #2196f3;
                }

                .stats-divider {
                    height: 1px;
                    background: var(--bael-border, #2a2a3a);
                    margin: 8px 0;
                }

                .stats-row.timer .stat-value {
                    color: var(--bael-accent, #ff3366);
                }

                .stats-row.cost .stat-value {
                    color: #ffc107;
                }

                .stats-footer {
                    padding: 12px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .reset-btn {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 12px;
                    font-weight: 500;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .reset-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                /* Token animation */
                @keyframes tokenPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .stat-value.animating {
                    animation: tokenPulse 0.3s ease;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .bael-session-stats {
                        bottom: 70px;
                        right: 10px;
                        width: 220px;
                    }
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      const minimizeBtn = this.widget.querySelector("#stats-minimize");
      const refreshBtn = this.widget.querySelector("#stats-refresh");
      const resetBtn = this.widget.querySelector("#stats-reset");

      minimizeBtn.addEventListener("click", () => this.toggleMinimize());
      refreshBtn.addEventListener("click", () => this.refresh());
      resetBtn.addEventListener("click", () => this.reset());

      // Listen for token updates
      window.addEventListener("bael:tokens:update", (e) => {
        this.updateTokens(e.detail);
      });

      // Listen for message events
      window.addEventListener("bael:message:sent", () => {
        this.stats.messages.user++;
        this.stats.messages.total++;
        this.updateDisplay();
      });

      window.addEventListener("bael:message:received", (e) => {
        this.stats.messages.agent++;
        this.stats.messages.total++;
        if (e.detail?.tokens) {
          this.updateTokens(e.detail.tokens);
        }
        this.updateDisplay();
      });

      // Listen for tool calls
      window.addEventListener("bael:tool:called", (e) => {
        this.stats.tools.count++;
        if (e.detail?.name) {
          this.stats.tools.list.push(e.detail.name);
        }
        this.updateDisplay();
      });

      // Listen for model changes
      window.addEventListener("bael:model:changed", (e) => {
        if (e.detail?.model) {
          this.stats.models.add(e.detail.model);
          this.widget.querySelector("#model-name").textContent = e.detail.model;
        }
      });

      // Intercept fetch for token tracking
      this.interceptFetch();
    }

    interceptFetch() {
      const originalFetch = window.fetch;
      const self = this;

      window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        // Clone response to read body
        const clone = response.clone();

        try {
          const data = await clone.json();

          // Check for token usage in response
          if (data.usage) {
            self.updateTokens({
              input: data.usage.prompt_tokens || 0,
              output: data.usage.completion_tokens || 0,
            });
          }

          // Check for model info
          if (data.model) {
            self.stats.models.add(data.model);
            self.widget.querySelector("#model-name").textContent =
              self.truncateModel(data.model);
          }
        } catch (e) {
          // Not JSON or error, ignore
        }

        return response;
      };
    }

    truncateModel(model) {
      if (model.length > 20) {
        return model.substring(0, 18) + "...";
      }
      return model;
    }

    startTimer() {
      this.timerInterval = setInterval(() => {
        const elapsed = Date.now() - this.sessionStart;
        this.widget.querySelector("#session-timer").textContent =
          this.formatTime(elapsed);
      }, 1000);
    }

    formatTime(ms) {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor(ms / (1000 * 60 * 60));

      return [hours, minutes, seconds]
        .map((v) => v.toString().padStart(2, "0"))
        .join(":");
    }

    updateTokens(tokens) {
      if (tokens.input) {
        this.stats.tokens.input += tokens.input;
      }
      if (tokens.output) {
        this.stats.tokens.output += tokens.output;
      }
      this.stats.tokens.total =
        this.stats.tokens.input + this.stats.tokens.output;

      this.calculateCost();
      this.updateDisplay();
      this.saveToStorage();

      // Animate the update
      const tokenEl = this.widget.querySelector("#token-count");
      tokenEl.classList.add("animating");
      setTimeout(() => tokenEl.classList.remove("animating"), 300);
    }

    calculateCost() {
      // Get current model or use default
      const model = Array.from(this.stats.models).pop() || "default";
      let rates = this.tokenRates.default;

      // Find matching rate
      for (const [key, value] of Object.entries(this.tokenRates)) {
        if (model.toLowerCase().includes(key.toLowerCase())) {
          rates = value;
          break;
        }
      }

      // Calculate cost (rates are per 1K tokens)
      this.stats.cost =
        (this.stats.tokens.input / 1000) * rates.input +
        (this.stats.tokens.output / 1000) * rates.output;
    }

    updateDisplay() {
      this.widget.querySelector("#token-count").textContent = this.formatNumber(
        this.stats.tokens.total,
      );
      this.widget.querySelector("#tokens-in").textContent = this.formatNumber(
        this.stats.tokens.input,
      );
      this.widget.querySelector("#tokens-out").textContent = this.formatNumber(
        this.stats.tokens.output,
      );

      this.widget.querySelector("#message-count").textContent =
        this.stats.messages.total;
      this.widget.querySelector("#msgs-user").textContent =
        this.stats.messages.user;
      this.widget.querySelector("#msgs-agent").textContent =
        this.stats.messages.agent;

      this.widget.querySelector("#tool-count").textContent =
        this.stats.tools.count;
      this.widget.querySelector("#cost-estimate").textContent =
        "$" + this.stats.cost.toFixed(4);
    }

    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    }

    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
      this.widget.classList.toggle("minimized", this.isMinimized);

      const icon = this.widget.querySelector("#stats-minimize svg");
      if (this.isMinimized) {
        icon.innerHTML = '<polyline points="18 15 12 9 6 15"/>';
      } else {
        icon.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
      }
    }

    refresh() {
      // Re-calculate from current state
      this.scanCurrentSession();
      this.updateDisplay();
    }

    scanCurrentSession() {
      // Scan visible messages
      const messages = document.querySelectorAll(".message");
      let userCount = 0;
      let agentCount = 0;

      messages.forEach((msg) => {
        if (msg.classList.contains("user")) {
          userCount++;
        } else {
          agentCount++;
        }
      });

      this.stats.messages.user = userCount;
      this.stats.messages.agent = agentCount;
      this.stats.messages.total = userCount + agentCount;
    }

    reset() {
      if (!confirm("Reset session statistics?")) return;

      this.sessionStart = Date.now();
      this.stats = {
        tokens: { input: 0, output: 0, total: 0 },
        messages: { user: 0, agent: 0, total: 0 },
        tools: { count: 0, list: [] },
        models: new Set(),
        cost: 0,
      };

      this.updateDisplay();
      this.saveToStorage();
      this.widget.querySelector("#model-name").textContent = "-";
    }

    saveToStorage() {
      const data = {
        sessionStart: this.sessionStart,
        stats: {
          ...this.stats,
          models: Array.from(this.stats.models),
        },
      };
      localStorage.setItem("bael_session_stats", JSON.stringify(data));
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem("bael_session_stats");
        if (saved) {
          const data = JSON.parse(saved);

          // Check if this is from the same day
          const today = new Date().toDateString();
          const savedDay = new Date(data.sessionStart).toDateString();

          if (today === savedDay) {
            this.sessionStart = data.sessionStart;
            this.stats = {
              ...data.stats,
              models: new Set(data.stats.models || []),
            };

            if (data.stats.models?.length > 0) {
              const lastModel = data.stats.models[data.stats.models.length - 1];
              this.widget.querySelector("#model-name").textContent =
                this.truncateModel(lastModel);
            }

            this.updateDisplay();
          }
        }
      } catch (e) {
        console.warn("Could not load session stats:", e);
      }
    }

    // Public API
    show() {
      this.widget.style.display = "block";
    }

    hide() {
      this.widget.style.display = "none";
    }

    toggle() {
      if (this.widget.style.display === "none") {
        this.show();
      } else {
        this.hide();
      }
    }

    getStats() {
      return {
        ...this.stats,
        sessionDuration: Date.now() - this.sessionStart,
        models: Array.from(this.stats.models),
      };
    }
  }

  // Initialize
  window.BaelSessionStats = new BaelSessionStats();
})();
