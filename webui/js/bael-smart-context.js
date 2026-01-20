/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗     ██████╗████████╗██╗  ██╗█
 * █  ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝    ██╔════╝╚══██╔══╝╚██╗██╔╝█
 * █  ███████╗██╔████╔██║███████║██████╔╝   ██║       ██║        ██║    ╚███╔╝ █
 * █  ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║       ██║        ██║    ██╔██╗ █
 * █  ███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║       ╚██████╗   ██║   ██╔╝ ██╗█
 * █  ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝        ╚═════╝   ╚═╝   ╚═╝  ╚═╝█
 * █                                                                          █
 * █   BAEL SMART CONTEXT - Intelligent Context Window Management            █
 * █   Track, visualize and optimize context usage for better AI responses   █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelSmartContext {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // Context tracking
      this.contextData = {
        totalTokens: 0,
        maxTokens: 128000, // Default, can be adjusted per model
        systemPromptTokens: 0,
        historyTokens: 0,
        userInputTokens: 0,
        estimatedResponseTokens: 4000,
      };

      // Model token limits
      this.modelLimits = {
        "gpt-4": 8192,
        "gpt-4-32k": 32768,
        "gpt-4-turbo": 128000,
        "gpt-4o": 128000,
        "claude-3-opus": 200000,
        "claude-3-sonnet": 200000,
        "claude-3-haiku": 200000,
        "claude-3.5-sonnet": 200000,
        "gemini-pro": 32000,
        "gemini-1.5-pro": 1000000,
        "llama-3": 8192,
        "mistral-large": 32000,
      };

      this.history = [];
    }

    async initialize() {
      console.log("🧠 Bael Smart Context initializing...");

      this.injectStyles();
      this.createMiniWidget();
      this.createContainer();
      this.setupShortcuts();
      this.observeMessages();
      this.startTracking();

      this.initialized = true;
      console.log("✅ BAEL SMART CONTEXT READY (Ctrl+Shift+C)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-smartcontext-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-smartcontext-styles";
      styles.textContent = `
                /* Mini widget */
                .bael-context-widget {
                    position: fixed;
                    bottom: 80px;
                    right: 80px;
                    background: rgba(18, 18, 26, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 10px 14px;
                    z-index: 8500;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .bael-context-widget:hover {
                    transform: scale(1.02);
                    border-color: rgba(99, 102, 241, 0.4);
                }

                .context-mini-bar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .context-mini-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .context-mini-progress {
                    width: 100px;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .context-mini-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #34d399);
                    border-radius: 3px;
                    transition: width 0.3s, background 0.3s;
                }

                .context-mini-fill.warning {
                    background: linear-gradient(90deg, #f59e0b, #fbbf24);
                }

                .context-mini-fill.danger {
                    background: linear-gradient(90deg, #ef4444, #f87171);
                }

                .context-mini-percent {
                    font-size: 12px;
                    font-weight: 600;
                    font-family: 'SF Mono', monospace;
                    color: #10b981;
                    min-width: 36px;
                }

                .context-mini-percent.warning {
                    color: #f59e0b;
                }

                .context-mini-percent.danger {
                    color: #ef4444;
                }

                /* Full panel */
                .bael-smartcontext-panel {
                    position: fixed;
                    bottom: 140px;
                    right: 20px;
                    width: 380px;
                    max-height: 70vh;
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                    z-index: 9650;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-smartcontext-panel.visible {
                    display: flex;
                    animation: contextPanelIn 0.3s ease;
                }

                @keyframes contextPanelIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .context-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .context-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .context-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                }

                .context-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .context-content {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }

                /* Main gauge */
                .context-gauge {
                    position: relative;
                    width: 160px;
                    height: 160px;
                    margin: 0 auto 20px;
                }

                .gauge-background {
                    fill: none;
                    stroke: rgba(255, 255, 255, 0.1);
                    stroke-width: 12;
                }

                .gauge-fill {
                    fill: none;
                    stroke: #10b981;
                    stroke-width: 12;
                    stroke-linecap: round;
                    transform: rotate(-90deg);
                    transform-origin: center;
                    transition: stroke-dashoffset 0.5s ease, stroke 0.3s;
                }

                .gauge-fill.warning {
                    stroke: #f59e0b;
                }

                .gauge-fill.danger {
                    stroke: #ef4444;
                }

                .gauge-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .gauge-percent {
                    font-size: 32px;
                    font-weight: 700;
                    color: #fff;
                    font-family: 'SF Mono', monospace;
                }

                .gauge-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Breakdown */
                .context-breakdown {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                }

                .breakdown-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 12px;
                }

                .breakdown-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .breakdown-item:last-child {
                    border-bottom: none;
                }

                .breakdown-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                }

                .breakdown-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .breakdown-value {
                    font-size: 12px;
                    font-family: 'SF Mono', monospace;
                    color: rgba(255, 255, 255, 0.6);
                }

                /* Model selector */
                .model-selector {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                }

                .model-select {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                    cursor: pointer;
                }

                .model-select option {
                    background: #12121a;
                }

                /* Tips */
                .context-tips {
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 10px;
                    padding: 12px;
                }

                .tip-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #a5b4fc;
                    margin-bottom: 8px;
                }

                .tip-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                }

                /* Actions */
                .context-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .context-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .context-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }

                .context-btn.primary:hover {
                    opacity: 0.9;
                }

                .context-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .context-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `;
      document.head.appendChild(styles);
    }

    createMiniWidget() {
      this.widget = document.createElement("div");
      this.widget.id = "bael-context-widget";
      this.widget.className = "bael-context-widget";
      this.widget.onclick = () => this.toggle();
      this.widget.innerHTML = `
                <div class="context-mini-bar">
                    <span class="context-mini-label">Context</span>
                    <div class="context-mini-progress">
                        <div class="context-mini-fill" id="context-mini-fill" style="width: 0%"></div>
                    </div>
                    <span class="context-mini-percent" id="context-mini-percent">0%</span>
                </div>
            `;
      document.body.appendChild(this.widget);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-smartcontext-panel";
      this.container.className = "bael-smartcontext-panel";

      this.render();
      document.body.appendChild(this.container);
    }

    render() {
      const percent = this.getUsagePercent();
      const circumference = 2 * Math.PI * 60;
      const offset = circumference - (percent / 100) * circumference;
      const colorClass =
        percent > 80 ? "danger" : percent > 60 ? "warning" : "";

      this.container.innerHTML = `
                <div class="context-header">
                    <div class="context-title">
                        <span>🧠</span>
                        Smart Context
                    </div>
                    <button class="context-close" onclick="BaelSmartContext.hide()">✕</button>
                </div>

                <div class="context-content">
                    <div class="context-gauge">
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle class="gauge-background" cx="80" cy="80" r="60"/>
                            <circle class="gauge-fill ${colorClass}"
                                    cx="80" cy="80" r="60"
                                    stroke-dasharray="${circumference}"
                                    stroke-dashoffset="${offset}"/>
                        </svg>
                        <div class="gauge-center">
                            <div class="gauge-percent">${percent}%</div>
                            <div class="gauge-label">Context Used</div>
                        </div>
                    </div>

                    <div class="context-breakdown">
                        <div class="breakdown-title">Token Breakdown</div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">
                                <span class="breakdown-dot" style="background:#6366f1"></span>
                                System Prompt
                            </span>
                            <span class="breakdown-value">${this.formatNumber(this.contextData.systemPromptTokens)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">
                                <span class="breakdown-dot" style="background:#10b981"></span>
                                Conversation History
                            </span>
                            <span class="breakdown-value">${this.formatNumber(this.contextData.historyTokens)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">
                                <span class="breakdown-dot" style="background:#f59e0b"></span>
                                Current Input
                            </span>
                            <span class="breakdown-value">${this.formatNumber(this.contextData.userInputTokens)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">
                                <span class="breakdown-dot" style="background:#8b5cf6"></span>
                                Reserved for Response
                            </span>
                            <span class="breakdown-value">${this.formatNumber(this.contextData.estimatedResponseTokens)}</span>
                        </div>
                        <div class="breakdown-item" style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;margin-top:4px">
                            <span class="breakdown-label" style="font-weight:600">Total / Max</span>
                            <span class="breakdown-value" style="color:#fff">
                                ${this.formatNumber(this.contextData.totalTokens)} / ${this.formatNumber(this.contextData.maxTokens)}
                            </span>
                        </div>
                    </div>

                    <div class="model-selector">
                        <div class="breakdown-title">Model Context Limit</div>
                        <select class="model-select" onchange="BaelSmartContext.setModel(this.value)">
                            ${Object.entries(this.modelLimits)
                              .map(
                                ([model, limit]) => `
                                <option value="${model}" ${this.contextData.maxTokens === limit ? "selected" : ""}>
                                    ${model} (${this.formatNumber(limit)} tokens)
                                </option>
                            `,
                              )
                              .join("")}
                        </select>
                    </div>

                    <div class="context-tips">
                        <div class="tip-title">💡 Optimization Tip</div>
                        <div class="tip-text">${this.getOptimizationTip()}</div>
                    </div>
                </div>

                <div class="context-actions">
                    <button class="context-btn secondary" onclick="BaelSmartContext.summarizeHistory()">
                        📝 Summarize
                    </button>
                    <button class="context-btn primary" onclick="BaelSmartContext.optimize()">
                        ⚡ Optimize
                    </button>
                </div>
            `;
    }

    getUsagePercent() {
      return Math.round(
        (this.contextData.totalTokens / this.contextData.maxTokens) * 100,
      );
    }

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    getOptimizationTip() {
      const percent = this.getUsagePercent();

      if (percent > 80) {
        return "Context is nearly full! Consider summarizing the conversation or starting a new chat to maintain response quality.";
      } else if (percent > 60) {
        return "Context usage is moderate. Long code blocks or verbose responses may push you over the limit soon.";
      } else if (percent > 40) {
        return "Healthy context usage. You have plenty of room for detailed discussions and code examples.";
      } else {
        return "Excellent! Low context usage means maximum flexibility for complex, multi-turn conversations.";
      }
    }

    observeMessages() {
      // Watch for new messages
      const observer = new MutationObserver(() => {
        this.updateTokenCounts();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    startTracking() {
      // Initial count
      this.updateTokenCounts();

      // Periodic update
      setInterval(() => {
        this.updateTokenCounts();
      }, 5000);
    }

    updateTokenCounts() {
      // Estimate tokens from visible content
      const messages = document.querySelectorAll(
        '[class*="message"], .chat-message, .msg',
      );
      let historyText = "";

      messages.forEach((msg) => {
        historyText += msg.textContent || "";
      });

      // Rough token estimation (1 token ≈ 4 chars for English)
      this.contextData.historyTokens = Math.ceil(historyText.length / 4);

      // Estimate system prompt (typical size)
      this.contextData.systemPromptTokens = 2000;

      // Get current input
      const input = document.querySelector("textarea, #chat-input");
      this.contextData.userInputTokens = input
        ? Math.ceil((input.value || "").length / 4)
        : 0;

      // Calculate total
      this.contextData.totalTokens =
        this.contextData.systemPromptTokens +
        this.contextData.historyTokens +
        this.contextData.userInputTokens +
        this.contextData.estimatedResponseTokens;

      this.updateWidget();

      if (this.visible) {
        this.render();
      }
    }

    updateWidget() {
      const percent = this.getUsagePercent();
      const colorClass =
        percent > 80 ? "danger" : percent > 60 ? "warning" : "";

      const fill = document.getElementById("context-mini-fill");
      const percentEl = document.getElementById("context-mini-percent");

      if (fill) {
        fill.style.width = `${Math.min(percent, 100)}%`;
        fill.className = "context-mini-fill " + colorClass;
      }

      if (percentEl) {
        percentEl.textContent = `${percent}%`;
        percentEl.className = "context-mini-percent " + colorClass;
      }
    }

    setModel(model) {
      if (this.modelLimits[model]) {
        this.contextData.maxTokens = this.modelLimits[model];
        this.updateWidget();
        this.render();
      }
    }

    summarizeHistory() {
      // Trigger summarization suggestion
      const chatInput = document.querySelector("textarea, #chat-input");
      if (chatInput) {
        chatInput.value =
          "Please summarize our conversation so far in a concise format, preserving key decisions and context.";
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        chatInput.focus();
      }
      this.hide();
    }

    optimize() {
      // Show optimization suggestions
      alert(`Context Optimization Suggestions:

1. Remove redundant conversation turns
2. Summarize long code blocks
3. Clear conversation history if topic changed
4. Use shorter, more concise prompts

Current Usage: ${this.getUsagePercent()}% of ${this.formatNumber(this.contextData.maxTokens)} tokens`);
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "C") {
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
      this.updateTokenCounts();
      this.container.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelSmartContext = new BaelSmartContext();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSmartContext.initialize();
    });
  } else {
    window.BaelSmartContext.initialize();
  }

  console.log("🧠 Bael Smart Context loaded");
})();
