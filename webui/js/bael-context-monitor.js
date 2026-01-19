/**
 * BAEL - LORD OF ALL
 * Context Window Monitor - Real-time context tracking and visualization
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelContextMonitor {
    constructor() {
      this.contextData = {
        systemPrompt: 0,
        conversation: 0,
        tools: 0,
        memory: 0,
        total: 0,
      };
      this.maxTokens = 128000;
      this.history = [];
      this.widget = null;
      this.init();
    }

    init() {
      this.addStyles();
      this.createWidget();
      this.startMonitoring();
      console.log("📊 Bael Context Monitor initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-context-monitor-styles";
      styles.textContent = `
                /* Context Monitor Widget */
                .bael-context-monitor {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 14px 18px;
                    z-index: 100010;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    min-width: 220px;
                    transition: all 0.3s ease;
                }

                .bael-context-monitor:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Header */
                .ctx-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .ctx-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .ctx-status {
                    font-size: 10px;
                    padding: 3px 8px;
                    border-radius: 10px;
                    font-weight: 600;
                }

                .ctx-status.healthy {
                    background: rgba(74, 222, 128, 0.2);
                    color: #4ade80;
                }

                .ctx-status.warning {
                    background: rgba(251, 191, 36, 0.2);
                    color: #fbbf24;
                }

                .ctx-status.danger {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                /* Ring Chart */
                .ctx-ring-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 14px;
                }

                .ctx-ring {
                    position: relative;
                    width: 80px;
                    height: 80px;
                }

                .ctx-ring svg {
                    transform: rotate(-90deg);
                }

                .ctx-ring-bg {
                    fill: none;
                    stroke: var(--bael-bg-secondary, #12121a);
                    stroke-width: 8;
                }

                .ctx-ring-fill {
                    fill: none;
                    stroke: var(--bael-accent, #ff3366);
                    stroke-width: 8;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.5s ease, stroke 0.3s ease;
                }

                .ctx-ring-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .ctx-ring-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .ctx-ring-label {
                    font-size: 9px;
                    color: var(--bael-text-muted, #666);
                }

                /* Stats */
                .ctx-stats {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .ctx-stat-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 11px;
                }

                .ctx-stat-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--bael-text-muted, #888);
                }

                .ctx-stat-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }

                .ctx-stat-value {
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                /* Breakdown Bars */
                .ctx-breakdown {
                    display: flex;
                    gap: 2px;
                    height: 6px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .ctx-breakdown-segment {
                    height: 100%;
                    transition: width 0.5s ease;
                }

                /* Footer */
                .ctx-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 10px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .ctx-footer-info {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .ctx-refresh-btn {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    padding: 4px 8px;
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ctx-refresh-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }
            `;
      document.head.appendChild(styles);
    }

    createWidget() {
      const widget = document.createElement("div");
      widget.className = "bael-context-monitor";
      widget.innerHTML = this.renderWidget();
      document.body.appendChild(widget);
      this.widget = widget;

      widget.querySelector(".ctx-refresh-btn").addEventListener("click", () => {
        this.scanContext();
      });
    }

    renderWidget() {
      const percentage = Math.min(
        100,
        (this.contextData.total / this.maxTokens) * 100,
      );
      const status = this.getStatus(percentage);
      const circumference = 2 * Math.PI * 32;
      const dasharray = `${(percentage / 100) * circumference} ${circumference}`;

      const colors = {
        systemPrompt: "#6366f1",
        conversation: "#4ade80",
        tools: "#fbbf24",
        memory: "#f472b6",
      };

      return `
                <div class="ctx-header">
                    <div class="ctx-title">
                        📊 Context Monitor
                    </div>
                    <span class="ctx-status ${status.class}">${status.text}</span>
                </div>

                <div class="ctx-ring-container">
                    <div class="ctx-ring">
                        <svg width="80" height="80" viewBox="0 0 80 80">
                            <circle class="ctx-ring-bg" cx="40" cy="40" r="32"/>
                            <circle class="ctx-ring-fill" cx="40" cy="40" r="32"
                                    stroke="${status.color}"
                                    stroke-dasharray="${dasharray}"/>
                        </svg>
                        <div class="ctx-ring-center">
                            <div class="ctx-ring-value">${percentage.toFixed(0)}%</div>
                            <div class="ctx-ring-label">Used</div>
                        </div>
                    </div>

                    <div class="ctx-stats">
                        <div class="ctx-stat-row">
                            <span class="ctx-stat-label">
                                <span class="ctx-stat-dot" style="background: ${colors.systemPrompt}"></span>
                                System
                            </span>
                            <span class="ctx-stat-value">${this.formatNumber(this.contextData.systemPrompt)}</span>
                        </div>
                        <div class="ctx-stat-row">
                            <span class="ctx-stat-label">
                                <span class="ctx-stat-dot" style="background: ${colors.conversation}"></span>
                                Chat
                            </span>
                            <span class="ctx-stat-value">${this.formatNumber(this.contextData.conversation)}</span>
                        </div>
                        <div class="ctx-stat-row">
                            <span class="ctx-stat-label">
                                <span class="ctx-stat-dot" style="background: ${colors.tools}"></span>
                                Tools
                            </span>
                            <span class="ctx-stat-value">${this.formatNumber(this.contextData.tools)}</span>
                        </div>
                        <div class="ctx-stat-row">
                            <span class="ctx-stat-label">
                                <span class="ctx-stat-dot" style="background: ${colors.memory}"></span>
                                Memory
                            </span>
                            <span class="ctx-stat-value">${this.formatNumber(this.contextData.memory)}</span>
                        </div>
                    </div>
                </div>

                <div class="ctx-breakdown">
                    <div class="ctx-breakdown-segment" style="width: ${this.getPercent("systemPrompt")}%; background: ${colors.systemPrompt}"></div>
                    <div class="ctx-breakdown-segment" style="width: ${this.getPercent("conversation")}%; background: ${colors.conversation}"></div>
                    <div class="ctx-breakdown-segment" style="width: ${this.getPercent("tools")}%; background: ${colors.tools}"></div>
                    <div class="ctx-breakdown-segment" style="width: ${this.getPercent("memory")}%; background: ${colors.memory}"></div>
                </div>

                <div class="ctx-footer">
                    <div class="ctx-footer-info">
                        <span>${this.formatNumber(this.contextData.total)} / ${this.formatNumber(this.maxTokens)}</span>
                    </div>
                    <button class="ctx-refresh-btn">⟳ Refresh</button>
                </div>
            `;
    }

    getPercent(key) {
      if (this.contextData.total === 0) return 0;
      return ((this.contextData[key] / this.contextData.total) * 100).toFixed(
        1,
      );
    }

    getStatus(percentage) {
      if (percentage < 50)
        return { class: "healthy", text: "Healthy", color: "#4ade80" };
      if (percentage < 75)
        return { class: "warning", text: "Moderate", color: "#fbbf24" };
      return { class: "danger", text: "High", color: "#ef4444" };
    }

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    estimateTokens(text) {
      if (!text) return 0;
      return Math.ceil(text.length / 4);
    }

    startMonitoring() {
      // Initial scan
      setTimeout(() => this.scanContext(), 1000);

      // Periodic updates
      setInterval(() => this.scanContext(), 10000);
    }

    scanContext() {
      // Scan messages
      const messages = document.querySelectorAll(
        '[x-ref="msgcont"] > div, .message, .chat-message',
      );
      let conversationTokens = 0;
      messages.forEach((msg) => {
        conversationTokens += this.estimateTokens(msg.textContent);
      });

      // Estimate other components
      const systemPromptTokens = 2500; // Approximate system prompt
      const toolsTokens = Math.floor(conversationTokens * 0.1);
      const memoryTokens = Math.floor(conversationTokens * 0.05);

      this.contextData = {
        systemPrompt: systemPromptTokens,
        conversation: conversationTokens,
        tools: toolsTokens,
        memory: memoryTokens,
        total:
          systemPromptTokens + conversationTokens + toolsTokens + memoryTokens,
      };

      this.refresh();
    }

    refresh() {
      this.widget.innerHTML = this.renderWidget();
      this.widget
        .querySelector(".ctx-refresh-btn")
        .addEventListener("click", () => {
          this.scanContext();
        });
    }
  }

  // Initialize
  window.BaelContextMonitor = new BaelContextMonitor();
})();
