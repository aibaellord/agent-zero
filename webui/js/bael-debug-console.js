/**
 * BAEL - LORD OF ALL
 * Debug Console - Advanced debugging and inspection tools
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelDebugConsole {
    constructor() {
      this.isVisible = false;
      this.logs = [];
      this.maxLogs = 500;
      this.filters = {
        log: true,
        warn: true,
        error: true,
        info: true,
        debug: false,
      };
      this.searchQuery = "";
      this.isPaused = false;
      this.init();
    }

    init() {
      this.interceptConsole();
      this.createUI();
      this.bindEvents();
      console.log("🐛 Bael Debug Console initialized");
    }

    interceptConsole() {
      const self = this;
      const methods = ["log", "warn", "error", "info", "debug"];

      methods.forEach((method) => {
        const original = console[method];
        console[method] = function (...args) {
          if (!self.isPaused) {
            self.addLog(method, args);
          }
          original.apply(console, args);
        };
      });

      // Capture unhandled errors
      window.addEventListener("error", (event) => {
        if (!this.isPaused) {
          this.addLog("error", [
            `Uncaught Error: ${event.message}`,
            `at ${event.filename}:${event.lineno}`,
          ]);
        }
      });

      // Capture unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        if (!this.isPaused) {
          this.addLog("error", ["Unhandled Promise Rejection:", event.reason]);
        }
      });
    }

    addLog(type, args) {
      const log = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: Date.now(),
        message: this.formatArgs(args),
        stack: new Error().stack,
      };

      this.logs.push(log);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      if (this.isVisible) {
        this.appendLog(log);
      }
    }

    formatArgs(args) {
      return args
        .map((arg) => {
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-debug-styles";
      styles.textContent = `
                .bael-debug-panel {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 350px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    z-index: 9500;
                    display: flex;
                    flex-direction: column;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }

                .bael-debug-panel.visible {
                    transform: translateY(0);
                }

                .bael-debug-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-debug-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-debug-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-debug-btn {
                    padding: 5px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .bael-debug-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-debug-btn.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-debug-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .bael-debug-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-debug-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-debug-filters {
                    display: flex;
                    gap: 4px;
                }

                .bael-debug-filter {
                    padding: 4px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    color: var(--bael-text-muted, #888);
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-debug-filter.active {
                    border-color: currentColor;
                }

                .bael-debug-filter[data-type="log"].active { color: #888; background: rgba(136, 136, 136, 0.1); }
                .bael-debug-filter[data-type="info"].active { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
                .bael-debug-filter[data-type="warn"].active { color: #eab308; background: rgba(234, 179, 8, 0.1); }
                .bael-debug-filter[data-type="error"].active { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                .bael-debug-filter[data-type="debug"].active { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }

                .bael-debug-search {
                    flex: 1;
                    padding: 6px 12px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .bael-debug-search:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-debug-count {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-debug-logs {
                    flex: 1;
                    overflow-y: auto;
                    font-family: 'Fira Code', 'Monaco', monospace;
                    font-size: 12px;
                }

                .bael-debug-log {
                    display: flex;
                    align-items: flex-start;
                    padding: 6px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    transition: background 0.2s ease;
                }

                .bael-debug-log:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .bael-debug-log-type {
                    width: 50px;
                    flex-shrink: 0;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    border-radius: 4px;
                    text-align: center;
                }

                .bael-debug-log-type.log { background: rgba(136, 136, 136, 0.2); color: #888; }
                .bael-debug-log-type.info { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .bael-debug-log-type.warn { background: rgba(234, 179, 8, 0.2); color: #eab308; }
                .bael-debug-log-type.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .bael-debug-log-type.debug { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }

                .bael-debug-log-time {
                    width: 80px;
                    flex-shrink: 0;
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    padding: 0 10px;
                }

                .bael-debug-log-message {
                    flex: 1;
                    color: var(--bael-text-primary, #fff);
                    white-space: pre-wrap;
                    word-break: break-word;
                    line-height: 1.5;
                }

                .bael-debug-log.error .bael-debug-log-message {
                    color: #ef4444;
                }

                .bael-debug-log.warn .bael-debug-log-message {
                    color: #eab308;
                }

                .bael-debug-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-debug-trigger {
                    position: fixed;
                    bottom: 300px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
                    z-index: 7999;
                    transition: all 0.3s ease;
                }

                .bael-debug-trigger:hover {
                    transform: scale(1.08);
                }

                .bael-debug-trigger .error-count {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #fff;
                    color: #ef4444;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 16px;
                    text-align: center;
                    display: none;
                }

                .bael-debug-trigger .error-count.visible {
                    display: block;
                }

                /* Command input */
                .bael-debug-command {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-debug-command-prompt {
                    color: var(--bael-accent, #ff3366);
                    font-family: 'Fira Code', monospace;
                    font-weight: 600;
                }

                .bael-debug-command-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-primary, #fff);
                    font-family: 'Fira Code', monospace;
                    font-size: 12px;
                    outline: none;
                }
            `;
      document.head.appendChild(styles);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-debug-panel";
      this.panel.innerHTML = this.renderPanel();
      document.body.appendChild(this.panel);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-debug-trigger";
      this.trigger.innerHTML = '🐛<span class="error-count">0</span>';
      this.trigger.title = "Debug Console (F12)";
      document.body.appendChild(this.trigger);
    }

    renderPanel() {
      return `
                <div class="bael-debug-header">
                    <div class="bael-debug-title">
                        <span>🐛</span>
                        <span>Debug Console</span>
                    </div>
                    <div class="bael-debug-actions">
                        <button class="bael-debug-btn" id="debug-pause" title="Pause logging">
                            <span>⏸️</span> Pause
                        </button>
                        <button class="bael-debug-btn" id="debug-clear" title="Clear logs">
                            <span>🗑️</span> Clear
                        </button>
                        <button class="bael-debug-close" id="debug-close">✕</button>
                    </div>
                </div>
                <div class="bael-debug-toolbar">
                    <div class="bael-debug-filters">
                        <button class="bael-debug-filter active" data-type="log">Log</button>
                        <button class="bael-debug-filter active" data-type="info">Info</button>
                        <button class="bael-debug-filter active" data-type="warn">Warn</button>
                        <button class="bael-debug-filter active" data-type="error">Error</button>
                        <button class="bael-debug-filter" data-type="debug">Debug</button>
                    </div>
                    <input type="text" class="bael-debug-search" placeholder="Filter logs..." id="debug-search">
                    <span class="bael-debug-count" id="debug-count">0 logs</span>
                </div>
                <div class="bael-debug-logs" id="debug-logs">
                    ${this.renderLogs()}
                </div>
                <div class="bael-debug-command">
                    <span class="bael-debug-command-prompt">></span>
                    <input type="text" class="bael-debug-command-input" id="debug-command" placeholder="Execute JavaScript...">
                </div>
            `;
    }

    renderLogs() {
      const filtered = this.getFilteredLogs();

      if (filtered.length === 0) {
        return `
                    <div class="bael-debug-empty">
                        <div style="font-size: 40px; margin-bottom: 10px; opacity: 0.5;">🐛</div>
                        <div>No logs to display</div>
                    </div>
                `;
      }

      return filtered.map((log) => this.renderLog(log)).join("");
    }

    renderLog(log) {
      return `
                <div class="bael-debug-log ${log.type}" data-id="${log.id}">
                    <span class="bael-debug-log-type ${log.type}">${log.type}</span>
                    <span class="bael-debug-log-time">${this.formatTime(log.timestamp)}</span>
                    <span class="bael-debug-log-message">${this.escapeHtml(log.message)}</span>
                </div>
            `;
    }

    appendLog(log) {
      if (!this.shouldShowLog(log)) return;

      const container = this.panel.querySelector("#debug-logs");
      const empty = container.querySelector(".bael-debug-empty");
      if (empty) empty.remove();

      const div = document.createElement("div");
      div.innerHTML = this.renderLog(log);
      container.appendChild(div.firstElementChild);

      // Auto scroll to bottom
      container.scrollTop = container.scrollHeight;

      this.updateCount();
      this.updateErrorBadge();
    }

    getFilteredLogs() {
      return this.logs.filter((log) => this.shouldShowLog(log));
    }

    shouldShowLog(log) {
      if (!this.filters[log.type]) return false;
      if (
        this.searchQuery &&
        !log.message.toLowerCase().includes(this.searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());

      // Close
      this.panel
        .querySelector("#debug-close")
        .addEventListener("click", () => this.hide());

      // Pause
      this.panel
        .querySelector("#debug-pause")
        .addEventListener("click", (e) => {
          this.isPaused = !this.isPaused;
          e.target.classList.toggle("active", this.isPaused);
          e.target.innerHTML = this.isPaused
            ? "<span>▶️</span> Resume"
            : "<span>⏸️</span> Pause";
        });

      // Clear
      this.panel.querySelector("#debug-clear").addEventListener("click", () => {
        this.logs = [];
        this.panel.querySelector("#debug-logs").innerHTML = this.renderLogs();
        this.updateCount();
        this.updateErrorBadge();
      });

      // Filters
      this.panel
        .querySelector(".bael-debug-filters")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-debug-filter")) {
            const type = e.target.dataset.type;
            this.filters[type] = !this.filters[type];
            e.target.classList.toggle("active", this.filters[type]);
            this.refreshLogs();
          }
        });

      // Search
      this.panel
        .querySelector("#debug-search")
        .addEventListener("input", (e) => {
          this.searchQuery = e.target.value;
          this.refreshLogs();
        });

      // Command execution
      this.panel
        .querySelector("#debug-command")
        .addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            const command = e.target.value.trim();
            if (command) {
              this.executeCommand(command);
              e.target.value = "";
            }
          }
        });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.key === "F12" && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      });
    }

    executeCommand(command) {
      console.log(`> ${command}`);
      try {
        const result = eval(command);
        if (result !== undefined) {
          console.log(result);
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    refreshLogs() {
      this.panel.querySelector("#debug-logs").innerHTML = this.renderLogs();
      this.updateCount();
    }

    updateCount() {
      const filtered = this.getFilteredLogs();
      this.panel.querySelector("#debug-count").textContent =
        `${filtered.length} logs`;
    }

    updateErrorBadge() {
      const errorCount = this.logs.filter((l) => l.type === "error").length;
      const badge = this.trigger.querySelector(".error-count");
      badge.textContent = errorCount;
      badge.classList.toggle("visible", errorCount > 0);
    }

    toggle() {
      if (this.isVisible) this.hide();
      else this.show();
    }

    show() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.refreshLogs();
    }

    hide() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    formatTime(timestamp) {
      const d = new Date(timestamp);
      return (
        d.toLocaleTimeString("en-US", { hour12: false }) +
        "." +
        String(d.getMilliseconds()).padStart(3, "0")
      );
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  window.BaelDebugConsole = new BaelDebugConsole();
})();
