/**
 * BAEL - LORD OF ALL
 * Code Playground - Interactive code editor with live execution
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelPlayground {
    constructor() {
      this.container = null;
      this.isVisible = false;
      this.editor = null;
      this.language = "javascript";
      this.snippets = [];
      this.history = [];
      this.historyIndex = -1;
      this.init();
    }

    init() {
      this.loadSnippets();
      this.loadHistory();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      console.log("🎮 Bael Playground initialized");
    }

    loadSnippets() {
      try {
        this.snippets = JSON.parse(
          localStorage.getItem("bael_snippets") || "[]",
        );
      } catch (e) {
        this.snippets = [];
      }
    }

    saveSnippets() {
      localStorage.setItem("bael_snippets", JSON.stringify(this.snippets));
    }

    loadHistory() {
      try {
        this.history = JSON.parse(
          sessionStorage.getItem("bael_playground_history") || "[]",
        );
      } catch (e) {
        this.history = [];
      }
    }

    saveHistory() {
      sessionStorage.setItem(
        "bael_playground_history",
        JSON.stringify(this.history.slice(-50)),
      );
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-playground";
      container.className = "bael-playground";
      container.innerHTML = `
                <div class="playground-header">
                    <div class="playground-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                        <span>Code Playground</span>
                    </div>
                    <div class="playground-tabs">
                        <button class="pg-tab active" data-tab="editor">Editor</button>
                        <button class="pg-tab" data-tab="snippets">Snippets</button>
                        <button class="pg-tab" data-tab="history">History</button>
                    </div>
                    <button class="playground-close" id="playground-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="playground-toolbar">
                    <select id="pg-language" class="pg-select">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="json">JSON</option>
                        <option value="markdown">Markdown</option>
                        <option value="shell">Shell</option>
                    </select>
                    <div class="toolbar-spacer"></div>
                    <button class="pg-btn" id="pg-format" title="Format Code (Ctrl+Shift+F)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="12" x2="15" y2="12"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                    <button class="pg-btn" id="pg-copy" title="Copy Code (Ctrl+C)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                    </button>
                    <button class="pg-btn" id="pg-clear" title="Clear">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                    <button class="pg-btn primary" id="pg-run" title="Run Code (Ctrl+Enter)">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Run
                    </button>
                    <button class="pg-btn success" id="pg-send" title="Send to Agent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Send
                    </button>
                </div>

                <div class="playground-panels">
                    <div class="pg-panel editor-panel active" data-panel="editor">
                        <div class="editor-container">
                            <div class="line-numbers" id="pg-line-numbers"></div>
                            <textarea id="pg-editor" spellcheck="false" placeholder="// Write your code here..."></textarea>
                        </div>
                    </div>

                    <div class="pg-panel snippets-panel" data-panel="snippets">
                        <div class="snippets-header">
                            <input type="text" id="pg-snippet-search" placeholder="Search snippets...">
                            <button class="pg-btn" id="pg-save-snippet">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                    <polyline points="17 21 17 13 7 13 7 21"/>
                                    <polyline points="7 3 7 8 15 8"/>
                                </svg>
                                Save Current
                            </button>
                        </div>
                        <div class="snippets-list" id="pg-snippets-list"></div>
                    </div>

                    <div class="pg-panel history-panel" data-panel="history">
                        <div class="history-list" id="pg-history-list"></div>
                    </div>
                </div>

                <div class="output-panel">
                    <div class="output-header">
                        <span>Output</span>
                        <div class="output-actions">
                            <span class="exec-time" id="pg-exec-time"></span>
                            <button class="pg-btn-sm" id="pg-clear-output">Clear</button>
                        </div>
                    </div>
                    <div class="output-content" id="pg-output"></div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;

      this.createTrigger();
      this.updateLineNumbers();
    }

    createTrigger() {
      const trigger = document.createElement("button");
      trigger.id = "bael-playground-trigger";
      trigger.className = "bael-playground-trigger";
      trigger.title = "Code Playground (Ctrl+Shift+E)";
      trigger.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                </svg>
            `;
      document.body.appendChild(trigger);
      trigger.addEventListener("click", () => this.toggle());
    }

    addStyles() {
      if (document.getElementById("bael-playground-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-playground-styles";
      styles.textContent = `
                .bael-playground {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 900px;
                    max-width: 95vw;
                    height: 700px;
                    max-height: 90vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100020;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .bael-playground.visible {
                    display: flex;
                    animation: playgroundZoom 0.3s ease;
                }

                @keyframes playgroundZoom {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .playground-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 14px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .playground-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .playground-title svg {
                    width: 20px;
                    height: 20px;
                    color: var(--bael-accent, #ff3366);
                }

                .playground-tabs {
                    display: flex;
                    gap: 4px;
                    margin-left: auto;
                }

                .pg-tab {
                    padding: 6px 14px;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pg-tab:hover {
                    color: var(--bael-text-primary, #fff);
                }

                .pg-tab.active {
                    background: rgba(255, 51, 102, 0.15);
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .playground-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 12px;
                }

                .playground-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .playground-close svg {
                    width: 18px;
                    height: 18px;
                }

                .playground-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pg-select {
                    padding: 8px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    outline: none;
                }

                .toolbar-spacer {
                    flex: 1;
                }

                .pg-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pg-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .pg-btn svg {
                    width: 14px;
                    height: 14px;
                }

                .pg-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .pg-btn.primary:hover {
                    background: #ff4477;
                }

                .pg-btn.success {
                    background: #2ecc71;
                    border-color: #2ecc71;
                }

                .pg-btn.success:hover {
                    background: #3ed884;
                }

                .playground-panels {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }

                .pg-panel {
                    position: absolute;
                    inset: 0;
                    display: none;
                    flex-direction: column;
                }

                .pg-panel.active {
                    display: flex;
                }

                .editor-container {
                    flex: 1;
                    display: flex;
                    position: relative;
                    overflow: hidden;
                }

                .line-numbers {
                    padding: 16px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    color: var(--bael-text-muted, #666);
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                    text-align: right;
                    user-select: none;
                    min-width: 50px;
                    overflow: hidden;
                }

                #pg-editor {
                    flex: 1;
                    padding: 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: none;
                    color: var(--bael-text-primary, #fff);
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                    resize: none;
                    outline: none;
                    tab-size: 2;
                }

                #pg-editor::placeholder {
                    color: var(--bael-text-muted, #666);
                }

                /* Snippets Panel */
                .snippets-header {
                    display: flex;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                #pg-snippet-search {
                    flex: 1;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                #pg-snippet-search:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .snippets-list, .history-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .snippet-item, .history-item {
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .snippet-item:hover, .history-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .snippet-name, .history-time {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 6px;
                }

                .snippet-lang, .history-lang {
                    display: inline-block;
                    padding: 2px 8px;
                    background: rgba(255, 51, 102, 0.2);
                    border-radius: 4px;
                    font-size: 10px;
                    color: var(--bael-accent, #ff3366);
                    text-transform: uppercase;
                }

                .snippet-preview, .history-preview {
                    margin-top: 8px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .snippet-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }

                .pg-btn-sm {
                    padding: 4px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                }

                .pg-btn-sm:hover {
                    color: var(--bael-text-primary, #fff);
                    border-color: var(--bael-text-muted, #666);
                }

                .pg-btn-sm.danger:hover {
                    color: #f44336;
                    border-color: #f44336;
                }

                /* Output Panel */
                .output-panel {
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    background: var(--bael-bg-secondary, #12121a);
                    height: 180px;
                    display: flex;
                    flex-direction: column;
                }

                .output-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .output-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .exec-time {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .output-content {
                    flex: 1;
                    padding: 12px 16px;
                    overflow: auto;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                }

                .output-content .log {
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .output-content .error {
                    color: #f44336;
                }

                .output-content .warn {
                    color: #ff9800;
                }

                .output-content .info {
                    color: #2196f3;
                }

                .output-content .success {
                    color: #4caf50;
                }

                /* Empty states */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: var(--bael-text-muted, #666);
                    text-align: center;
                }

                .empty-state svg {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                /* Trigger button */
                .bael-playground-trigger {
                    position: fixed;
                    bottom: 150px;
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
                    z-index: 9988;
                    transition: all 0.3s ease;
                }

                .bael-playground-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-playground-trigger svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-text-primary, #fff);
                }

                /* Backdrop */
                .bael-playground-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 100019;
                    display: none;
                }

                .bael-playground-backdrop.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);

      // Create backdrop
      const backdrop = document.createElement("div");
      backdrop.className = "bael-playground-backdrop";
      backdrop.addEventListener("click", () => this.close());
      document.body.appendChild(backdrop);
      this.backdrop = backdrop;
    }

    bindEvents() {
      const editor = this.container.querySelector("#pg-editor");
      const lineNumbers = this.container.querySelector("#pg-line-numbers");

      // Close
      this.container
        .querySelector("#playground-close")
        .addEventListener("click", () => this.close());

      // Tabs
      this.container.querySelectorAll(".pg-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.switchTab(tab.dataset.tab);
        });
      });

      // Language selector
      this.container
        .querySelector("#pg-language")
        .addEventListener("change", (e) => {
          this.language = e.target.value;
        });

      // Editor events
      editor.addEventListener("input", () => this.updateLineNumbers());
      editor.addEventListener("scroll", () => {
        lineNumbers.scrollTop = editor.scrollTop;
      });
      editor.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.value =
            editor.value.substring(0, start) +
            "  " +
            editor.value.substring(end);
          editor.selectionStart = editor.selectionEnd = start + 2;
          this.updateLineNumbers();
        }
        if (e.ctrlKey && e.key === "Enter") {
          e.preventDefault();
          this.runCode();
        }
      });

      // Toolbar buttons
      this.container
        .querySelector("#pg-run")
        .addEventListener("click", () => this.runCode());
      this.container
        .querySelector("#pg-send")
        .addEventListener("click", () => this.sendToAgent());
      this.container
        .querySelector("#pg-copy")
        .addEventListener("click", () => this.copyCode());
      this.container
        .querySelector("#pg-clear")
        .addEventListener("click", () => this.clearEditor());
      this.container
        .querySelector("#pg-format")
        .addEventListener("click", () => this.formatCode());
      this.container
        .querySelector("#pg-clear-output")
        .addEventListener("click", () => this.clearOutput());

      // Snippets
      this.container
        .querySelector("#pg-save-snippet")
        .addEventListener("click", () => this.saveSnippet());
      this.container
        .querySelector("#pg-snippet-search")
        .addEventListener("input", () => this.renderSnippets());

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "E") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });
    }

    updateLineNumbers() {
      const editor = this.container.querySelector("#pg-editor");
      const lineNumbers = this.container.querySelector("#pg-line-numbers");
      const lines = editor.value.split("\n").length;
      lineNumbers.innerHTML = Array.from(
        { length: lines },
        (_, i) => i + 1,
      ).join("<br>");
    }

    switchTab(tab) {
      this.container
        .querySelectorAll(".pg-tab")
        .forEach((t) => t.classList.remove("active"));
      this.container
        .querySelector(`.pg-tab[data-tab="${tab}"]`)
        .classList.add("active");

      this.container
        .querySelectorAll(".pg-panel")
        .forEach((p) => p.classList.remove("active"));
      this.container
        .querySelector(`.pg-panel[data-panel="${tab}"]`)
        .classList.add("active");

      if (tab === "snippets") this.renderSnippets();
      if (tab === "history") this.renderHistory();
    }

    runCode() {
      const code = this.container.querySelector("#pg-editor").value;
      const output = this.container.querySelector("#pg-output");
      const execTime = this.container.querySelector("#pg-exec-time");

      if (!code.trim()) return;

      // Add to history
      this.addToHistory(code);

      output.innerHTML = "";
      const start = performance.now();

      // Capture console output
      const logs = [];
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
      };

      console.log = (...args) =>
        logs.push({ type: "log", content: args.join(" ") });
      console.error = (...args) =>
        logs.push({ type: "error", content: args.join(" ") });
      console.warn = (...args) =>
        logs.push({ type: "warn", content: args.join(" ") });
      console.info = (...args) =>
        logs.push({ type: "info", content: args.join(" ") });

      try {
        let result;
        if (this.language === "javascript") {
          result = eval(code);
        } else if (this.language === "json") {
          result = JSON.stringify(JSON.parse(code), null, 2);
        } else {
          logs.push({
            type: "info",
            content: `Preview for ${this.language} - execute on agent for full support`,
          });
          result = code;
        }

        if (result !== undefined) {
          logs.push({
            type: "success",
            content:
              "→ " +
              (typeof result === "object"
                ? JSON.stringify(result, null, 2)
                : result),
          });
        }
      } catch (error) {
        logs.push({ type: "error", content: error.toString() });
      }

      // Restore console
      Object.assign(console, originalConsole);

      const end = performance.now();
      execTime.textContent = `${(end - start).toFixed(2)}ms`;

      output.innerHTML = logs
        .map(
          (log) =>
            `<div class="${log.type}">${this.escapeHtml(log.content)}</div>`,
        )
        .join("");
    }

    sendToAgent() {
      const code = this.container.querySelector("#pg-editor").value;
      if (!code.trim()) return;

      const message = `Please execute this ${this.language} code:\n\`\`\`${this.language}\n${code}\n\`\`\``;

      // Try to find chat input and populate it
      const chatInput = document.querySelector(
        '#msgInput, textarea[x-model="input"]',
      );
      if (chatInput) {
        chatInput.value = message;
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));

        // Try to trigger send
        const sendBtn = document.querySelector(
          '#sendBtn, button[type="submit"]',
        );
        if (sendBtn) {
          setTimeout(() => sendBtn.click(), 100);
        }
      }

      this.close();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Code sent to agent");
      }
    }

    copyCode() {
      const code = this.container.querySelector("#pg-editor").value;
      navigator.clipboard.writeText(code);
      if (window.BaelNotifications) {
        window.BaelNotifications.success("Code copied to clipboard");
      }
    }

    clearEditor() {
      this.container.querySelector("#pg-editor").value = "";
      this.updateLineNumbers();
    }

    clearOutput() {
      this.container.querySelector("#pg-output").innerHTML = "";
      this.container.querySelector("#pg-exec-time").textContent = "";
    }

    formatCode() {
      const editor = this.container.querySelector("#pg-editor");
      let code = editor.value;

      try {
        if (this.language === "json") {
          code = JSON.stringify(JSON.parse(code), null, 2);
        }
        // Basic JS formatting (very simple)
        if (this.language === "javascript") {
          code = code
            .replace(/\{/g, " {\n")
            .replace(/\}/g, "\n}\n")
            .replace(/;/g, ";\n");
        }
        editor.value = code;
        this.updateLineNumbers();
      } catch (e) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Format error: " + e.message);
        }
      }
    }

    addToHistory(code) {
      this.history.push({
        id: Date.now(),
        language: this.language,
        code: code,
        timestamp: new Date().toISOString(),
      });
      this.saveHistory();
    }

    saveSnippet() {
      const code = this.container.querySelector("#pg-editor").value;
      if (!code.trim()) return;

      const name = prompt("Snippet name:");
      if (!name) return;

      this.snippets.push({
        id: Date.now(),
        name: name,
        language: this.language,
        code: code,
        createdAt: new Date().toISOString(),
      });
      this.saveSnippets();
      this.renderSnippets();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Snippet saved");
      }
    }

    renderSnippets() {
      const list = this.container.querySelector("#pg-snippets-list");
      const search = this.container
        .querySelector("#pg-snippet-search")
        .value.toLowerCase();

      const filtered = this.snippets.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.language.toLowerCase().includes(search),
      );

      if (filtered.length === 0) {
        list.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <p>No snippets yet</p>
                        <p style="font-size: 12px;">Save your first snippet!</p>
                    </div>
                `;
        return;
      }

      list.innerHTML = filtered
        .map(
          (snippet) => `
                <div class="snippet-item" data-id="${snippet.id}">
                    <div class="snippet-name">${this.escapeHtml(snippet.name)}</div>
                    <span class="snippet-lang">${snippet.language}</span>
                    <div class="snippet-preview">${this.escapeHtml(snippet.code.split("\n")[0])}</div>
                    <div class="snippet-actions">
                        <button class="pg-btn-sm load-snippet">Load</button>
                        <button class="pg-btn-sm danger delete-snippet">Delete</button>
                    </div>
                </div>
            `,
        )
        .join("");

      // Bind actions
      list.querySelectorAll(".load-snippet").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(btn.closest(".snippet-item").dataset.id);
          const snippet = this.snippets.find((s) => s.id === id);
          if (snippet) {
            this.loadSnippet(snippet);
          }
        });
      });

      list.querySelectorAll(".delete-snippet").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(btn.closest(".snippet-item").dataset.id);
          this.deleteSnippet(id);
        });
      });
    }

    loadSnippet(snippet) {
      this.container.querySelector("#pg-editor").value = snippet.code;
      this.container.querySelector("#pg-language").value = snippet.language;
      this.language = snippet.language;
      this.updateLineNumbers();
      this.switchTab("editor");
    }

    deleteSnippet(id) {
      if (!confirm("Delete this snippet?")) return;
      this.snippets = this.snippets.filter((s) => s.id !== id);
      this.saveSnippets();
      this.renderSnippets();
    }

    renderHistory() {
      const list = this.container.querySelector("#pg-history-list");

      if (this.history.length === 0) {
        list.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p>No history yet</p>
                        <p style="font-size: 12px;">Run some code to see it here</p>
                    </div>
                `;
        return;
      }

      list.innerHTML = this.history
        .slice()
        .reverse()
        .map(
          (item) => `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
                    <span class="history-lang">${item.language}</span>
                    <div class="history-preview">${this.escapeHtml(item.code.split("\n")[0])}</div>
                </div>
            `,
        )
        .join("");

      list.querySelectorAll(".history-item").forEach((item) => {
        item.addEventListener("click", () => {
          const id = parseInt(item.dataset.id);
          const entry = this.history.find((h) => h.id === id);
          if (entry) {
            this.container.querySelector("#pg-editor").value = entry.code;
            this.container.querySelector("#pg-language").value = entry.language;
            this.language = entry.language;
            this.updateLineNumbers();
            this.switchTab("editor");
          }
        });
      });
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.backdrop.classList.add("visible");
      this.container.querySelector("#pg-editor").focus();
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
      this.backdrop.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }

    setCode(code, language = "javascript") {
      this.container.querySelector("#pg-editor").value = code;
      this.container.querySelector("#pg-language").value = language;
      this.language = language;
      this.updateLineNumbers();
      this.open();
    }
  }

  // Initialize
  window.BaelPlayground = new BaelPlayground();
})();
