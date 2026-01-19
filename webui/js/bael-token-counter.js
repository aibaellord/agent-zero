/**
 * BAEL - LORD OF ALL
 * Token Counter & Session Timer
 * =============================
 * Real-time token usage and session tracking
 */

class BaelTokenCounter {
  constructor() {
    this.totalTokens = 0;
    this.inputTokens = 0;
    this.outputTokens = 0;
    this.sessionStart = Date.now();
    this.messageCount = 0;
    this.tokenHistory = [];

    this.init();
  }

  init() {
    this.createWidget();
    this.bindEvents();
    this.startTimer();
    console.log("📊 Bael Token Counter initialized");
  }

  createWidget() {
    const widget = document.createElement("div");
    widget.id = "bael-token-counter";
    widget.className = "bael-token-counter";
    widget.innerHTML = `
            <div class="btc-header" onclick="baelTokenCounter.toggleExpand()">
                <span class="btc-icon">📊</span>
                <span class="btc-title">Session Stats</span>
                <span class="btc-expand">▼</span>
            </div>
            <div class="btc-content">
                <div class="btc-timer">
                    <span class="btc-label">Session</span>
                    <span class="btc-value" id="btc-timer">00:00:00</span>
                </div>
                <div class="btc-divider"></div>
                <div class="btc-stat">
                    <span class="btc-label">Messages</span>
                    <span class="btc-value" id="btc-messages">0</span>
                </div>
                <div class="btc-stat">
                    <span class="btc-label">Total Tokens</span>
                    <span class="btc-value btc-highlight" id="btc-total">0</span>
                </div>
                <div class="btc-stat btc-sub">
                    <span class="btc-label">↳ Input</span>
                    <span class="btc-value" id="btc-input">0</span>
                </div>
                <div class="btc-stat btc-sub">
                    <span class="btc-label">↳ Output</span>
                    <span class="btc-value" id="btc-output">0</span>
                </div>
                <div class="btc-divider"></div>
                <div class="btc-stat">
                    <span class="btc-label">Tokens/min</span>
                    <span class="btc-value" id="btc-rate">0</span>
                </div>
                <div class="btc-progress">
                    <div class="btc-progress-label">Context Usage</div>
                    <div class="btc-progress-bar">
                        <div class="btc-progress-fill" id="btc-context"></div>
                    </div>
                    <div class="btc-progress-text"><span id="btc-context-pct">0</span>%</div>
                </div>
                <button class="btc-reset" onclick="baelTokenCounter.reset()">
                    🔄 Reset Session
                </button>
            </div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            .bael-token-counter {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 200px;
                background: var(--color-panel);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 9998;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .bael-token-counter.collapsed .btc-content {
                display: none;
            }

            .bael-token-counter.collapsed {
                width: auto;
            }

            .btc-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background: var(--color-surface);
                cursor: pointer;
                user-select: none;
            }

            .btc-header:hover {
                background: var(--color-surface-elevated);
            }

            .btc-icon {
                font-size: 16px;
            }

            .btc-title {
                flex: 1;
                font-weight: 600;
                color: var(--color-text);
                font-size: 13px;
            }

            .btc-expand {
                color: var(--color-text-muted);
                font-size: 10px;
                transition: transform 0.3s;
            }

            .bael-token-counter.collapsed .btc-expand {
                transform: rotate(-90deg);
            }

            .btc-content {
                padding: 12px;
            }

            .btc-timer {
                text-align: center;
                padding: 8px;
                background: var(--color-background);
                border-radius: var(--radius-md);
                margin-bottom: 12px;
            }

            .btc-timer .btc-value {
                font-size: 24px;
                font-family: var(--font-mono);
                color: var(--color-primary);
            }

            .btc-divider {
                height: 1px;
                background: var(--color-border);
                margin: 10px 0;
            }

            .btc-stat {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 0;
            }

            .btc-stat.btc-sub {
                padding-left: 12px;
                opacity: 0.8;
            }

            .btc-label {
                font-size: 12px;
                color: var(--color-text-secondary);
            }

            .btc-value {
                font-family: var(--font-mono);
                font-size: 14px;
                color: var(--color-text);
            }

            .btc-value.btc-highlight {
                color: var(--color-primary);
                font-weight: 600;
            }

            .btc-progress {
                margin-top: 12px;
            }

            .btc-progress-label {
                font-size: 11px;
                color: var(--color-text-muted);
                margin-bottom: 6px;
            }

            .btc-progress-bar {
                height: 8px;
                background: var(--color-background);
                border-radius: var(--radius-full);
                overflow: hidden;
            }

            .btc-progress-fill {
                height: 100%;
                width: 0%;
                background: var(--gradient-primary);
                border-radius: var(--radius-full);
                transition: width 0.5s ease;
            }

            .btc-progress-text {
                font-size: 11px;
                color: var(--color-text-muted);
                text-align: right;
                margin-top: 4px;
            }

            .btc-reset {
                width: 100%;
                margin-top: 12px;
                padding: 8px;
                background: transparent;
                border: 1px solid var(--color-border);
                color: var(--color-text-secondary);
                border-radius: var(--radius-md);
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .btc-reset:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .bael-token-counter {
                    top: auto;
                    bottom: 80px;
                    right: 10px;
                    width: 160px;
                }
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(widget);

    this.widget = widget;
  }

  bindEvents() {
    // Listen for message events
    window.addEventListener("bael-message-sent", (e) => {
      if (e.detail && e.detail.tokens) {
        this.addInputTokens(e.detail.tokens);
      }
      this.messageCount++;
      this.updateDisplay();
    });

    window.addEventListener("bael-message-received", (e) => {
      if (e.detail && e.detail.tokens) {
        this.addOutputTokens(e.detail.tokens);
      }
      this.updateDisplay();
    });

    // Observe DOM for message additions
    this.observeMessages();
  }

  observeMessages() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            node.classList &&
            (node.classList.contains("message") ||
              node.classList.contains("chat-message"))
          ) {
            this.estimateTokens(node);
          }
        });
      });
    });

    // Start observing when chat container is available
    const startObserving = () => {
      const chatContainer = document.querySelector(
        ".chat-messages, .messages-container",
      );
      if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
      } else {
        setTimeout(startObserving, 1000);
      }
    };

    startObserving();
  }

  estimateTokens(messageNode) {
    const text = messageNode.textContent || "";
    // Rough estimation: ~4 characters per token
    const tokens = Math.ceil(text.length / 4);

    if (
      messageNode.classList.contains("user") ||
      messageNode.classList.contains("user-message")
    ) {
      this.addInputTokens(tokens);
    } else {
      this.addOutputTokens(tokens);
    }

    this.messageCount++;
    this.updateDisplay();
  }

  addInputTokens(count) {
    this.inputTokens += count;
    this.totalTokens += count;
    this.tokenHistory.push({ time: Date.now(), type: "input", count });
  }

  addOutputTokens(count) {
    this.outputTokens += count;
    this.totalTokens += count;
    this.tokenHistory.push({ time: Date.now(), type: "output", count });
  }

  startTimer() {
    setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    const elapsed = Date.now() - this.sessionStart;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    const timerEl = document.getElementById("btc-timer");
    if (timerEl) {
      timerEl.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // Update tokens per minute
    this.updateRate();
  }

  updateRate() {
    const elapsed = (Date.now() - this.sessionStart) / 60000; // minutes
    const rate = elapsed > 0 ? Math.round(this.totalTokens / elapsed) : 0;

    const rateEl = document.getElementById("btc-rate");
    if (rateEl) {
      rateEl.textContent = rate.toLocaleString();
    }
  }

  updateDisplay() {
    document.getElementById("btc-messages").textContent =
      this.messageCount.toLocaleString();
    document.getElementById("btc-total").textContent =
      this.totalTokens.toLocaleString();
    document.getElementById("btc-input").textContent =
      this.inputTokens.toLocaleString();
    document.getElementById("btc-output").textContent =
      this.outputTokens.toLocaleString();

    // Context usage (assuming 128k context window)
    const contextLimit = 128000;
    const usagePercent = Math.min(100, (this.totalTokens / contextLimit) * 100);

    document.getElementById("btc-context").style.width = `${usagePercent}%`;
    document.getElementById("btc-context-pct").textContent =
      usagePercent.toFixed(1);
  }

  toggleExpand() {
    this.widget.classList.toggle("collapsed");
  }

  reset() {
    this.totalTokens = 0;
    this.inputTokens = 0;
    this.outputTokens = 0;
    this.sessionStart = Date.now();
    this.messageCount = 0;
    this.tokenHistory = [];
    this.updateDisplay();
    console.log("📊 Session stats reset");
  }

  getStats() {
    const elapsed = (Date.now() - this.sessionStart) / 1000;
    return {
      totalTokens: this.totalTokens,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      messageCount: this.messageCount,
      sessionDuration: elapsed,
      tokensPerMinute: elapsed > 0 ? this.totalTokens / (elapsed / 60) : 0,
    };
  }
}

// Initialize
let baelTokenCounter;
document.addEventListener("DOMContentLoaded", () => {
  baelTokenCounter = new BaelTokenCounter();
  window.baelTokenCounter = baelTokenCounter;
});
