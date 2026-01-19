/**
 * BAEL - LORD OF ALL
 * Code Playground - Interactive code editor with execution
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelCodePlayground {
    constructor() {
      this.panel = null;
      this.editor = null;
      this.language = "python";
      this.history = [];
      this.storageKey = "bael-code-playground";
      this.init();
    }

    init() {
      this.addStyles();
      this.loadHistory();
      this.createUI();
      this.bindEvents();
      console.log("🎮 Bael Code Playground initialized");
    }

    loadHistory() {
      try {
        this.history = JSON.parse(
          localStorage.getItem(this.storageKey) || "[]",
        );
      } catch {
        this.history = [];
      }
    }

    saveHistory() {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.history.slice(-50)),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-playground-styles";
      styles.textContent = `
                /* Toggle Button */
                .bael-playground-toggle {
                    position: fixed;
                    bottom: 140px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 100020;
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
                    transition: all 0.3s ease;
                }

                .bael-playground-toggle:hover {
                    transform: scale(1.1);
                }

                /* Main Panel */
                .bael-playground-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 900px;
                    height: 600px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100050;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .bael-playground-panel.visible {
                    display: flex;
                    animation: playgroundIn 0.3s ease;
                }

                @keyframes playgroundIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                /* Panel Header */
                .pg-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 18px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pg-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .pg-title-icon {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .pg-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pg-language-select {
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                }

                .pg-run-btn {
                    padding: 8px 18px;
                    background: linear-gradient(135deg, #4ade80, #22c55e);
                    border: none;
                    border-radius: 8px;
                    color: #000;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .pg-run-btn:hover {
                    transform: scale(1.05);
                }

                .pg-close-btn {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                .pg-close-btn:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* Main Content */
                .pg-main {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                /* Sidebar */
                .pg-sidebar {
                    width: 200px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    flex-direction: column;
                }

                .pg-sidebar-title {
                    padding: 12px 14px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pg-templates {
                    padding: 8px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    max-height: 200px;
                    overflow-y: auto;
                }

                .pg-template-btn {
                    width: 100%;
                    padding: 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    text-align: left;
                    cursor: pointer;
                    margin-bottom: 6px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pg-template-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .pg-history-list {
                    flex: 1;
                    padding: 8px;
                    overflow-y: auto;
                }

                .pg-history-item {
                    padding: 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pg-history-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .pg-history-lang {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                    margin-bottom: 4px;
                }

                .pg-history-code {
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Editor Area */
                .pg-editor-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                /* Tabs */
                .pg-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pg-tab {
                    padding: 8px 14px;
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
                    background: var(--bael-bg-tertiary, #181820);
                    border-color: var(--bael-border, #2a2a3a);
                    color: var(--bael-text-primary, #fff);
                }

                /* Code Editor */
                .pg-code-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .pg-code-area.hidden {
                    display: none;
                }

                .pg-editor {
                    flex: 1;
                    display: flex;
                    background: var(--bael-bg-primary, #0a0a0f);
                }

                .pg-line-numbers {
                    padding: 12px 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    line-height: 1.6;
                    color: var(--bael-text-muted, #555);
                    text-align: right;
                    user-select: none;
                    min-width: 40px;
                }

                .pg-code-input {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-primary, #fff);
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    line-height: 1.6;
                    resize: none;
                    outline: none;
                    tab-size: 4;
                }

                /* Output Area */
                .pg-output-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .pg-output-area.hidden {
                    display: none;
                }

                .pg-output-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pg-output-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }

                .pg-status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #666;
                }

                .pg-status-indicator.success {
                    background: #4ade80;
                }

                .pg-status-indicator.error {
                    background: #ef4444;
                }

                .pg-status-indicator.running {
                    background: #fbbf24;
                    animation: statusPulse 1s infinite;
                }

                @keyframes statusPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                .pg-output-content {
                    flex: 1;
                    padding: 12px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    line-height: 1.6;
                    color: var(--bael-text-primary, #fff);
                    background: var(--bael-bg-primary, #0a0a0f);
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .pg-output-error {
                    color: #ef4444;
                }

                /* Footer */
                .pg-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .pg-shortcuts {
                    display: flex;
                    gap: 12px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .pg-shortcut kbd {
                    padding: 2px 6px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    font-family: inherit;
                    font-size: 10px;
                    margin-right: 4px;
                }

                .pg-actions {
                    display: flex;
                    gap: 8px;
                }

                .pg-action-btn {
                    padding: 6px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pg-action-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Toggle button
      const toggle = document.createElement("button");
      toggle.className = "bael-playground-toggle";
      toggle.innerHTML = "🎮";
      toggle.title = "Code Playground (Ctrl+Shift+P)";
      toggle.addEventListener("click", () => this.toggle());
      document.body.appendChild(toggle);
      this.toggleBtn = toggle;

      // Main panel
      const panel = document.createElement("div");
      panel.className = "bael-playground-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.editor = panel.querySelector("#pg-code-input");
      this.lineNumbers = panel.querySelector("#pg-line-numbers");
      this.output = panel.querySelector("#pg-output-content");

      this.bindPanelEvents();
      this.updateLineNumbers();
    }

    renderPanel() {
      return `
                <div class="pg-header">
                    <div class="pg-title">
                        <div class="pg-title-icon">🎮</div>
                        <span>Code Playground</span>
                    </div>
                    <div class="pg-controls">
                        <select class="pg-language-select" id="pg-language">
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="bash">Bash/Shell</option>
                            <option value="nodejs">Node.js</option>
                        </select>
                        <button class="pg-run-btn" id="pg-run">
                            ▶ Run
                        </button>
                        <button class="pg-close-btn" id="pg-close">✕</button>
                    </div>
                </div>

                <div class="pg-main">
                    <div class="pg-sidebar">
                        <div class="pg-sidebar-title">Templates</div>
                        <div class="pg-templates" id="pg-templates">
                            ${this.renderTemplates()}
                        </div>
                        <div class="pg-sidebar-title">History</div>
                        <div class="pg-history-list" id="pg-history">
                            ${this.renderHistory()}
                        </div>
                    </div>

                    <div class="pg-editor-container">
                        <div class="pg-tabs">
                            <button class="pg-tab active" data-tab="code">Code</button>
                            <button class="pg-tab" data-tab="output">Output</button>
                        </div>

                        <div class="pg-code-area" id="pg-code-area">
                            <div class="pg-editor">
                                <div class="pg-line-numbers" id="pg-line-numbers">1</div>
                                <textarea class="pg-code-input" id="pg-code-input"
                                          placeholder="Enter your code here..."
                                          spellcheck="false"></textarea>
                            </div>
                        </div>

                        <div class="pg-output-area hidden" id="pg-output-area">
                            <div class="pg-output-header">
                                <div class="pg-output-status">
                                    <div class="pg-status-indicator" id="pg-status"></div>
                                    <span id="pg-status-text">Ready</span>
                                </div>
                                <button class="pg-action-btn" id="pg-clear-output">Clear</button>
                            </div>
                            <div class="pg-output-content" id="pg-output-content">
                                Output will appear here...
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pg-footer">
                    <div class="pg-shortcuts">
                        <span class="pg-shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Run</span>
                        <span class="pg-shortcut"><kbd>Ctrl</kbd>+<kbd>S</kbd> Save</span>
                        <span class="pg-shortcut"><kbd>Esc</kbd> Close</span>
                    </div>
                    <div class="pg-actions">
                        <button class="pg-action-btn" id="pg-copy">Copy Code</button>
                        <button class="pg-action-btn" id="pg-send-agent">Send to Agent</button>
                    </div>
                </div>
            `;
    }

    renderTemplates() {
      const templates = {
        python: [
          { name: "🐍 Hello World", code: 'print("Hello, World!")' },
          {
            name: "📁 File Read",
            code: 'with open("file.txt", "r") as f:\n    content = f.read()\n    print(content)',
          },
          {
            name: "🌐 HTTP Request",
            code: 'import requests\n\nresponse = requests.get("https://api.example.com")\nprint(response.json())',
          },
        ],
        javascript: [
          { name: "👋 Hello World", code: 'console.log("Hello, World!");' },
          {
            name: "⏰ Async/Await",
            code: 'async function fetchData() {\n    const res = await fetch("https://api.example.com");\n    const data = await res.json();\n    console.log(data);\n}\nfetchData();',
          },
          {
            name: "📦 Array Map",
            code: "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled);",
          },
        ],
        bash: [
          { name: "📂 List Files", code: "ls -la" },
          { name: "🔍 Find Files", code: 'find . -name "*.txt" -type f' },
          { name: "💾 Disk Usage", code: "df -h" },
        ],
        nodejs: [
          {
            name: "📁 Read File",
            code: 'const fs = require("fs");\nconst content = fs.readFileSync("file.txt", "utf-8");\nconsole.log(content);',
          },
          {
            name: "🌐 HTTP Server",
            code: 'const http = require("http");\nconst server = http.createServer((req, res) => {\n    res.end("Hello World!");\n});\nserver.listen(3000);',
          },
        ],
      };

      return (
        templates[this.language]
          ?.map(
            (t) => `
                <button class="pg-template-btn" data-code="${this.escapeAttr(t.code)}">
                    ${t.name}
                </button>
            `,
          )
          .join("") || ""
      );
    }

    renderHistory() {
      return (
        this.history
          .slice(-10)
          .reverse()
          .map(
            (h) => `
                <div class="pg-history-item" data-code="${this.escapeAttr(h.code)}" data-lang="${h.language}">
                    <div class="pg-history-lang">${h.language}</div>
                    <div class="pg-history-code">${this.escapeHtml(h.code.substring(0, 50))}</div>
                </div>
            `,
          )
          .join("") ||
        '<div style="font-size: 11px; color: #666; padding: 10px;">No history yet</div>'
      );
    }

    bindPanelEvents() {
      // Close
      this.panel
        .querySelector("#pg-close")
        .addEventListener("click", () => this.close());

      // Run
      this.panel
        .querySelector("#pg-run")
        .addEventListener("click", () => this.run());

      // Language select
      this.panel
        .querySelector("#pg-language")
        .addEventListener("change", (e) => {
          this.language = e.target.value;
          this.updateTemplates();
        });

      // Tabs
      this.panel.querySelectorAll(".pg-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".pg-tab")
            .forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");

          const tabName = tab.dataset.tab;
          this.panel
            .querySelector("#pg-code-area")
            .classList.toggle("hidden", tabName !== "code");
          this.panel
            .querySelector("#pg-output-area")
            .classList.toggle("hidden", tabName !== "output");
        });
      });

      // Editor
      this.editor.addEventListener("input", () => this.updateLineNumbers());
      this.editor.addEventListener("keydown", (e) => this.handleEditorKey(e));

      // Templates
      this.panel
        .querySelector("#pg-templates")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".pg-template-btn");
          if (btn) {
            this.editor.value = btn.dataset.code;
            this.updateLineNumbers();
          }
        });

      // History
      this.panel.querySelector("#pg-history").addEventListener("click", (e) => {
        const item = e.target.closest(".pg-history-item");
        if (item) {
          this.editor.value = item.dataset.code;
          this.panel.querySelector("#pg-language").value = item.dataset.lang;
          this.language = item.dataset.lang;
          this.updateLineNumbers();
          this.updateTemplates();
        }
      });

      // Clear output
      this.panel
        .querySelector("#pg-clear-output")
        .addEventListener("click", () => {
          this.output.textContent = "Output will appear here...";
          this.setStatus("ready", "Ready");
        });

      // Copy
      this.panel.querySelector("#pg-copy").addEventListener("click", () => {
        navigator.clipboard.writeText(this.editor.value);
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Code copied!");
        }
      });

      // Send to agent
      this.panel
        .querySelector("#pg-send-agent")
        .addEventListener("click", () => this.sendToAgent());
    }

    handleEditorKey(e) {
      // Run with Ctrl+Enter
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        this.run();
        return;
      }

      // Tab to insert spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        this.editor.value =
          this.editor.value.substring(0, start) +
          "    " +
          this.editor.value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + 4;
        this.updateLineNumbers();
      }

      // Escape to close
      if (e.key === "Escape") {
        this.close();
      }
    }

    updateLineNumbers() {
      const lines = this.editor.value.split("\n").length;
      this.lineNumbers.textContent = Array.from(
        { length: lines },
        (_, i) => i + 1,
      ).join("\n");
    }

    updateTemplates() {
      this.panel.querySelector("#pg-templates").innerHTML =
        this.renderTemplates();
    }

    updateHistory() {
      this.panel.querySelector("#pg-history").innerHTML = this.renderHistory();
    }

    setStatus(state, text) {
      const indicator = this.panel.querySelector("#pg-status");
      const statusText = this.panel.querySelector("#pg-status-text");

      indicator.className =
        "pg-status-indicator " + (state === "ready" ? "" : state);
      statusText.textContent = text;
    }

    async run() {
      const code = this.editor.value.trim();
      if (!code) return;

      // Switch to output tab
      this.panel
        .querySelectorAll(".pg-tab")
        .forEach((t) => t.classList.remove("active"));
      this.panel
        .querySelector('.pg-tab[data-tab="output"]')
        .classList.add("active");
      this.panel.querySelector("#pg-code-area").classList.add("hidden");
      this.panel.querySelector("#pg-output-area").classList.remove("hidden");

      this.setStatus("running", "Running...");
      this.output.textContent = "Executing...";

      // Add to history
      this.history.push({
        code,
        language: this.language,
        timestamp: Date.now(),
      });
      this.saveHistory();
      this.updateHistory();

      // Try to execute through Bael agent
      try {
        const wrapper = this.wrapCode(code);

        // Dispatch to agent
        const input = document.querySelector('textarea, input[type="text"]');
        if (input && window.Alpine) {
          const message = `Execute this ${this.language} code:\n\`\`\`${this.language}\n${wrapper}\n\`\`\``;

          // Simulate sending to agent
          this.output.textContent = `Sent to agent for execution:\n\n${code}`;
          this.setStatus("success", "Sent to Agent");

          if (window.BaelNotifications) {
            window.BaelNotifications.info("Code sent to agent for execution");
          }
        } else {
          this.output.textContent =
            "Agent connection not available.\n\nCode:\n" + code;
          this.setStatus("error", "No Agent");
        }
      } catch (error) {
        this.output.innerHTML = `<span class="pg-output-error">Error: ${error.message}</span>`;
        this.setStatus("error", "Error");
      }
    }

    wrapCode(code) {
      return code;
    }

    sendToAgent() {
      const code = this.editor.value.trim();
      if (!code) return;

      const message = `Please analyze and explain this ${this.language} code:\n\n\`\`\`${this.language}\n${code}\n\`\`\``;

      // Try to find input and send
      const inputs = document.querySelectorAll("textarea");
      for (const input of inputs) {
        if (input.closest(".bael-") || input === this.editor) continue;
        input.value = message;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        this.close();

        if (window.BaelNotifications) {
          window.BaelNotifications.success("Code sent to agent");
        }
        return;
      }
    }

    bindEvents() {
      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "p") {
          e.preventDefault();
          this.toggle();
        }
      });

      // Click outside
      document.addEventListener("click", (e) => {
        if (
          this.panel.classList.contains("visible") &&
          !this.panel.contains(e.target) &&
          !this.toggleBtn.contains(e.target)
        ) {
          this.close();
        }
      });
    }

    toggle() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.editor.focus();
      }
    }

    close() {
      this.panel.classList.remove("visible");
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    escapeAttr(text) {
      return text.replace(/"/g, "&quot;").replace(/\n/g, "&#10;");
    }
  }

  // Initialize
  window.BaelCodePlayground = new BaelCodePlayground();
})();
