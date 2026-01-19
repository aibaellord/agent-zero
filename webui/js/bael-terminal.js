/**
 * BAEL - LORD OF ALL
 * Terminal Emulator - In-browser terminal widget for quick commands
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelTerminal {
    constructor() {
      this.panel = null;
      this.trigger = null;
      this.history = [];
      this.historyIndex = -1;
      this.maxHistory = 100;
      this.init();
    }

    init() {
      this.loadHistory();
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("💻 Bael Terminal initialized");
    }

    loadHistory() {
      try {
        this.history = JSON.parse(
          localStorage.getItem("bael_terminal_history") || "[]",
        );
      } catch (e) {
        this.history = [];
      }
    }

    saveHistory() {
      localStorage.setItem(
        "bael_terminal_history",
        JSON.stringify(this.history.slice(-this.maxHistory)),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-terminal-styles";
      styles.textContent = `
                /* Terminal Trigger */
                .bael-terminal-trigger {
                    position: fixed;
                    bottom: 510px;
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
                    z-index: 9981;
                    transition: all 0.3s ease;
                    font-size: 20px;
                }

                .bael-terminal-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                /* Terminal Panel */
                .bael-terminal-panel {
                    position: fixed;
                    bottom: 80px;
                    right: 80px;
                    width: 700px;
                    height: 450px;
                    background: #0d0d0d;
                    border: 1px solid #333;
                    border-radius: 12px;
                    z-index: 100028;
                    display: none;
                    flex-direction: column;
                    font-family: 'SF Mono', Monaco, 'Fira Code', 'Courier New', monospace;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .bael-terminal-panel.visible {
                    display: flex;
                    animation: terminalAppear 0.2s ease;
                }

                @keyframes terminalAppear {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                /* Terminal Header (macOS style) */
                .terminal-header {
                    display: flex;
                    align-items: center;
                    padding: 10px 14px;
                    background: linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%);
                    border-bottom: 1px solid #1a1a1a;
                    border-radius: 12px 12px 0 0;
                    cursor: move;
                }

                .terminal-buttons {
                    display: flex;
                    gap: 8px;
                }

                .terminal-btn {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                }

                .terminal-btn-close {
                    background: #ff5f57;
                }

                .terminal-btn-minimize {
                    background: #febc2e;
                }

                .terminal-btn-maximize {
                    background: #28c840;
                }

                .terminal-title {
                    flex: 1;
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                    font-weight: 500;
                }

                /* Terminal Content */
                .terminal-content {
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
                    background: #0d0d0d;
                }

                .terminal-output {
                    color: #f0f0f0;
                    font-size: 13px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .terminal-line {
                    margin-bottom: 2px;
                }

                .terminal-prompt {
                    color: #4ade80;
                }

                .terminal-command {
                    color: #f0f0f0;
                }

                .terminal-output-text {
                    color: #a0a0a0;
                }

                .terminal-error {
                    color: #f87171;
                }

                .terminal-info {
                    color: #60a5fa;
                }

                .terminal-success {
                    color: #4ade80;
                }

                .terminal-warning {
                    color: #fbbf24;
                }

                /* Input Line */
                .terminal-input-line {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: #0d0d0d;
                    border-top: 1px solid #222;
                }

                .terminal-prompt-symbol {
                    color: #4ade80;
                    margin-right: 8px;
                    font-size: 13px;
                }

                .terminal-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #f0f0f0;
                    font-family: inherit;
                    font-size: 13px;
                }

                .terminal-input::placeholder {
                    color: #555;
                }

                /* Status Bar */
                .terminal-status {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 14px;
                    background: #1a1a1a;
                    border-top: 1px solid #333;
                    font-size: 11px;
                    color: #666;
                }

                /* Suggestions */
                .terminal-suggestions {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    right: 0;
                    max-height: 200px;
                    overflow-y: auto;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-bottom: none;
                    display: none;
                }

                .terminal-suggestions.visible {
                    display: block;
                }

                .suggestion-item {
                    padding: 8px 14px;
                    cursor: pointer;
                    font-size: 12px;
                    color: #ccc;
                }

                .suggestion-item:hover,
                .suggestion-item.active {
                    background: #2a2a2a;
                    color: #fff;
                }

                .suggestion-hint {
                    color: #666;
                    margin-left: 12px;
                    font-size: 11px;
                }

                /* ASCII Art */
                .terminal-ascii {
                    color: var(--bael-accent, #ff3366);
                    font-size: 10px;
                    line-height: 1.2;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Trigger
      const trigger = document.createElement("button");
      trigger.className = "bael-terminal-trigger";
      trigger.title = "Terminal (Ctrl+`)";
      trigger.innerHTML = ">_";
      document.body.appendChild(trigger);
      this.trigger = trigger;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-terminal-panel";
      panel.innerHTML = `
                <div class="terminal-header">
                    <div class="terminal-buttons">
                        <button class="terminal-btn terminal-btn-close" title="Close"></button>
                        <button class="terminal-btn terminal-btn-minimize" title="Minimize"></button>
                        <button class="terminal-btn terminal-btn-maximize" title="Maximize"></button>
                    </div>
                    <div class="terminal-title">Bael Terminal — zsh</div>
                </div>
                <div class="terminal-content">
                    <div class="terminal-output" id="terminal-output"></div>
                </div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt-symbol">❯</span>
                    <input type="text" class="terminal-input" id="terminal-input" placeholder="Type a command..." autocomplete="off" spellcheck="false">
                </div>
                <div class="terminal-status">
                    <span>Bael Terminal v1.0</span>
                    <span id="terminal-status">Ready</span>
                </div>
            `;
      document.body.appendChild(panel);
      this.panel = panel;

      this.outputEl = panel.querySelector("#terminal-output");
      this.inputEl = panel.querySelector("#terminal-input");

      this.bindPanelEvents();
      this.printWelcome();
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());

      document.addEventListener("keydown", (e) => {
        // Ctrl+` to toggle terminal
        if (e.ctrlKey && e.key === "`") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      // Close button
      this.panel
        .querySelector(".terminal-btn-close")
        .addEventListener("click", () => this.close());

      // Input handling
      this.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.executeCommand(this.inputEl.value);
          this.inputEl.value = "";
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateHistory(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateHistory(1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autocomplete();
        } else if (e.key === "c" && e.ctrlKey) {
          this.print("^C", "error");
          this.inputEl.value = "";
        } else if (e.key === "l" && e.ctrlKey) {
          e.preventDefault();
          this.clearScreen();
        }
      });

      // Drag support
      this.makeDraggable();
    }

    makeDraggable() {
      const header = this.panel.querySelector(".terminal-header");
      let isDragging = false;
      let startX, startY, initialX, initialY;

      header.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("terminal-btn")) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = this.panel.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        this.panel.style.left = initialX + dx + "px";
        this.panel.style.top = initialY + dy + "px";
        this.panel.style.right = "auto";
        this.panel.style.bottom = "auto";
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.panel.classList.add("visible");
      this.inputEl.focus();
    }

    close() {
      this.panel.classList.remove("visible");
    }

    printWelcome() {
      const ascii = `
 ██████╗  █████╗ ███████╗██╗
 ██╔══██╗██╔══██╗██╔════╝██║
 ██████╔╝███████║█████╗  ██║
 ██╔══██╗██╔══██║██╔══╝  ██║
 ██████╔╝██║  ██║███████╗███████╗
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
            `;
      this.print(ascii, "ascii");
      this.print("Welcome to Bael Terminal v1.0", "info");
      this.print('Type "help" for available commands.', "output");
      this.print("", "output");
    }

    print(text, type = "output") {
      const line = document.createElement("div");
      line.className = "terminal-line";

      if (type === "command") {
        line.innerHTML = `<span class="terminal-prompt">❯ </span><span class="terminal-command">${this.escapeHtml(text)}</span>`;
      } else if (type === "ascii") {
        line.innerHTML = `<span class="terminal-ascii">${this.escapeHtml(text)}</span>`;
      } else {
        line.innerHTML = `<span class="terminal-${type}">${this.escapeHtml(text)}</span>`;
      }

      this.outputEl.appendChild(line);
      this.scrollToBottom();
    }

    scrollToBottom() {
      const content = this.panel.querySelector(".terminal-content");
      content.scrollTop = content.scrollHeight;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    navigateHistory(direction) {
      if (this.history.length === 0) return;

      this.historyIndex += direction;
      if (this.historyIndex < 0) this.historyIndex = 0;
      if (this.historyIndex >= this.history.length) {
        this.historyIndex = this.history.length;
        this.inputEl.value = "";
        return;
      }

      this.inputEl.value = this.history[this.historyIndex];
    }

    async executeCommand(cmd) {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      // Add to history
      this.history.push(trimmed);
      this.historyIndex = this.history.length;
      this.saveHistory();

      // Print command
      this.print(trimmed, "command");

      // Parse command
      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Built-in commands
      const builtins = {
        help: () => this.showHelp(),
        clear: () => this.clearScreen(),
        cls: () => this.clearScreen(),
        history: () => this.showHistory(),
        date: () => this.print(new Date().toString(), "success"),
        time: () => this.print(new Date().toLocaleTimeString(), "success"),
        echo: () => this.print(args.join(" "), "output"),
        whoami: () => this.print("bael", "success"),
        pwd: () => this.print("/home/bael", "success"),
        hostname: () => this.print("bael-system", "success"),
        uname: () => this.print("Bael OS 1.0.0", "success"),
        uptime: () =>
          this.print(
            `System uptime: ${Math.floor(performance.now() / 1000)}s`,
            "success",
          ),
        version: () => this.print("Bael Terminal v1.0", "info"),
        agent: () => this.sendToAgent(args.join(" ")),
        ask: () => this.sendToAgent(args.join(" ")),
        theme: () => this.changeTheme(args[0]),
        calc: () => this.calculate(args.join(" ")),
        json: () => this.formatJson(args.join(" ")),
        base64: () => this.base64(args[0], args.slice(1).join(" ")),
        uuid: () => this.print(crypto.randomUUID(), "success"),
        random: () => this.print(Math.random().toString(), "success"),
        exit: () => this.close(),
        quit: () => this.close(),
      };

      if (builtins[command]) {
        builtins[command]();
      } else {
        // Try to send to agent for execution
        this.print(`Sending to Bael agent: ${trimmed}`, "info");
        await this.sendToAgent(trimmed);
      }

      this.updateStatus("Ready");
    }

    showHelp() {
      const help = `
Available Commands:
───────────────────
  help        Show this help message
  clear/cls   Clear the terminal screen
  history     Show command history
  date        Show current date
  time        Show current time
  echo <text> Print text
  whoami      Show current user
  pwd         Show current directory
  uptime      Show system uptime
  version     Show terminal version

Agent Commands:
───────────────
  agent <msg> Send message to Bael agent
  ask <msg>   Ask Bael a question

Utilities:
──────────
  calc <expr> Calculate expression
  json <str>  Format JSON string
  base64 enc/dec <text>  Encode/decode base64
  uuid        Generate UUID
  random      Generate random number
  theme <name> Change theme (cyberpunk, ocean, forest, sunset, midnight, vanilla)

Shortcuts:
──────────
  Ctrl+C      Cancel current input
  Ctrl+L      Clear screen
  Up/Down     Navigate history
  Tab         Autocomplete
  Ctrl+\`      Toggle terminal
`;
      this.print(help, "output");
    }

    showHistory() {
      if (this.history.length === 0) {
        this.print("No command history", "info");
        return;
      }
      this.history.forEach((cmd, i) => {
        this.print(`${i + 1}  ${cmd}`, "output");
      });
    }

    clearScreen() {
      this.outputEl.innerHTML = "";
    }

    async sendToAgent(message) {
      if (!message) {
        this.print("Usage: agent <message>", "warning");
        return;
      }

      this.updateStatus("Processing...");

      // Find chat input and simulate sending
      const chatInput = document.querySelector('textarea, input[type="text"]');
      if (chatInput) {
        this.print(`→ "${message}"`, "info");

        // Try to use Alpine.js $dispatch or direct API
        try {
          // Dispatch event for the chat system to pick up
          window.dispatchEvent(
            new CustomEvent("bael-terminal-command", {
              detail: { message },
            }),
          );

          this.print("Command sent to agent", "success");
        } catch (e) {
          this.print("Could not send to agent: " + e.message, "error");
        }
      } else {
        this.print("Chat interface not found", "error");
      }
    }

    changeTheme(theme) {
      if (!theme) {
        this.print(
          "Available themes: cyberpunk, ocean, forest, sunset, midnight, vanilla",
          "info",
        );
        return;
      }

      if (
        window.BaelThemeEditor &&
        typeof window.BaelThemeEditor.applyTheme === "function"
      ) {
        window.BaelThemeEditor.applyTheme(theme);
        this.print(`Theme changed to: ${theme}`, "success");
      } else {
        this.print("Theme system not available", "warning");
      }
    }

    calculate(expr) {
      if (!expr) {
        this.print("Usage: calc <expression>", "warning");
        return;
      }
      try {
        // Safe math evaluation
        const result = Function('"use strict"; return (' + expr + ")")();
        this.print(`= ${result}`, "success");
      } catch (e) {
        this.print("Error: " + e.message, "error");
      }
    }

    formatJson(str) {
      if (!str) {
        this.print("Usage: json <json-string>", "warning");
        return;
      }
      try {
        const obj = JSON.parse(str);
        this.print(JSON.stringify(obj, null, 2), "success");
      } catch (e) {
        this.print("Invalid JSON: " + e.message, "error");
      }
    }

    base64(action, text) {
      if (!action || !text) {
        this.print("Usage: base64 enc|dec <text>", "warning");
        return;
      }
      try {
        if (action === "enc" || action === "encode") {
          this.print(btoa(text), "success");
        } else if (action === "dec" || action === "decode") {
          this.print(atob(text), "success");
        } else {
          this.print('Unknown action. Use "enc" or "dec"', "warning");
        }
      } catch (e) {
        this.print("Error: " + e.message, "error");
      }
    }

    autocomplete() {
      const input = this.inputEl.value.toLowerCase();
      const commands = [
        "help",
        "clear",
        "cls",
        "history",
        "date",
        "time",
        "echo",
        "whoami",
        "pwd",
        "hostname",
        "uname",
        "uptime",
        "version",
        "agent",
        "ask",
        "theme",
        "calc",
        "json",
        "base64",
        "uuid",
        "random",
        "exit",
        "quit",
      ];

      const matches = commands.filter((c) => c.startsWith(input));
      if (matches.length === 1) {
        this.inputEl.value = matches[0] + " ";
      } else if (matches.length > 1) {
        this.print(matches.join("  "), "info");
      }
    }

    updateStatus(status) {
      const statusEl = this.panel.querySelector("#terminal-status");
      if (statusEl) statusEl.textContent = status;
    }
  }

  // Initialize
  window.BaelTerminal = new BaelTerminal();
})();
