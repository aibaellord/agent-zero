/**
 * BAEL Keyboard Shortcuts Manager
 * Phase 7: Testing, Documentation & Performance
 *
 * Centralized keyboard shortcut management with:
 * - Shortcut registration
 * - Conflict detection
 * - Context-aware shortcuts
 * - Shortcut discovery UI
 * - Custom keybindings
 */

(function () {
  "use strict";

  class BaelKeyboardManager {
    constructor() {
      this.shortcuts = new Map();
      this.contexts = new Map();
      this.activeContexts = new Set(["global"]);
      this.enabled = true;
      this.recording = false;
      this.recordCallback = null;
      this.history = [];
      this.maxHistory = 50;
      this.init();
    }

    init() {
      this.registerDefaultShortcuts();
      this.bindEvents();
      this.createUI();
      this.addStyles();
      console.log("⌨️ Bael Keyboard Manager initialized");
    }

    // Register default shortcuts
    registerDefaultShortcuts() {
      // Global shortcuts
      this.register("?", {
        description: "Show keyboard shortcuts",
        context: "global",
        handler: () => this.toggle(),
      });

      this.register("Escape", {
        description: "Close dialogs/panels",
        context: "global",
        handler: () => this.closeActivePanel(),
      });

      this.register("Ctrl+K", {
        description: "Open command palette",
        context: "global",
        handler: () => window.BaelCommandPalette?.toggle(),
      });

      this.register("Ctrl+/", {
        description: "Focus chat input",
        context: "global",
        handler: () => document.getElementById("input")?.focus(),
      });

      // Navigation
      this.register("g h", {
        description: "Go to home/chat",
        context: "global",
        handler: () => window.BaelRouter?.navigate("/"),
      });

      this.register("g s", {
        description: "Go to settings",
        context: "global",
        handler: () => window.BaelRouter?.navigate("/settings"),
      });

      // Chat shortcuts
      this.register("Ctrl+Enter", {
        description: "Send message",
        context: "chat",
        handler: () =>
          document.querySelector('[x-on\\:click*="sendMessage"]')?.click(),
      });

      this.register("Ctrl+Shift+N", {
        description: "New chat",
        context: "chat",
        handler: () => window.dispatchEvent(new CustomEvent("bael-new-chat")),
      });

      // Dev shortcuts
      this.register("Ctrl+Shift+D", {
        description: "Toggle debug console",
        context: "global",
        handler: () => window.BaelDebugConsole?.toggle(),
      });

      this.register("Ctrl+Shift+P", {
        description: "Performance monitor",
        context: "global",
        handler: () => window.BaelPerformanceMonitor?.toggle(),
      });

      this.register("F1", {
        description: "Documentation",
        context: "global",
        handler: () => window.BaelDocs?.toggle(),
      });

      this.register("Ctrl+Shift+T", {
        description: "Test suite",
        context: "global",
        handler: () => window.BaelTestSuite?.toggle(),
      });

      this.register("Ctrl+Shift+E", {
        description: "Error boundary",
        context: "global",
        handler: () => window.BaelErrorBoundary?.toggle(),
      });

      this.register("Ctrl+Shift+M", {
        description: "State machine",
        context: "global",
        handler: () => window.BaelStateMachine?.toggle(),
      });

      this.register("Ctrl+Shift+B", {
        description: "Event bus",
        context: "global",
        handler: () => window.BaelEventBus?.toggle(),
      });

      this.register("Ctrl+Shift+F", {
        description: "Feature flags",
        context: "global",
        handler: () => window.BaelFeatureFlags?.toggle(),
      });

      this.register("Ctrl+Alt+A", {
        description: "Accessibility",
        context: "global",
        handler: () => window.BaelAccessibility?.toggle(),
      });

      this.register("Ctrl+,", {
        description: "Configuration",
        context: "global",
        handler: () => window.BaelConfig?.toggle(),
      });
    }

    // Parse key combination
    parseKey(keyString) {
      const parts = keyString.split("+").map((p) => p.trim().toLowerCase());
      return {
        key: parts[parts.length - 1],
        ctrl: parts.includes("ctrl") || parts.includes("control"),
        alt: parts.includes("alt"),
        shift: parts.includes("shift"),
        meta:
          parts.includes("meta") ||
          parts.includes("cmd") ||
          parts.includes("command"),
        sequence: keyString.includes(" ")
          ? keyString.split(" ").map((k) => this.parseKey(k))
          : null,
      };
    }

    // Match key event
    matchEvent(event, parsed) {
      const key = event.key.toLowerCase();
      const code = event.code.toLowerCase();

      return (
        (key === parsed.key ||
          code === parsed.key ||
          code === `key${parsed.key}`) &&
        event.ctrlKey === parsed.ctrl &&
        event.altKey === parsed.alt &&
        event.shiftKey === parsed.shift &&
        event.metaKey === parsed.meta
      );
    }

    // Register shortcut
    register(keyString, options) {
      const id = options.id || keyString;
      const parsed = this.parseKey(keyString);

      const shortcut = {
        id,
        keyString,
        parsed,
        description: options.description || "",
        context: options.context || "global",
        handler: options.handler,
        enabled: options.enabled !== false,
        preventDefault: options.preventDefault !== false,
      };

      // Check for conflicts
      const existing = this.findByKey(keyString, options.context);
      if (existing && existing.id !== id) {
        console.warn(
          `Shortcut conflict: ${keyString} already registered as "${existing.description}"`,
        );
      }

      this.shortcuts.set(id, shortcut);

      // Add to context
      if (!this.contexts.has(shortcut.context)) {
        this.contexts.set(shortcut.context, new Set());
      }
      this.contexts.get(shortcut.context).add(id);

      return this;
    }

    // Unregister shortcut
    unregister(id) {
      const shortcut = this.shortcuts.get(id);
      if (shortcut) {
        const contextSet = this.contexts.get(shortcut.context);
        if (contextSet) {
          contextSet.delete(id);
        }
        this.shortcuts.delete(id);
      }
      return this;
    }

    // Find shortcut by key
    findByKey(keyString, context = "global") {
      for (const shortcut of this.shortcuts.values()) {
        if (
          shortcut.keyString === keyString &&
          (shortcut.context === context || shortcut.context === "global")
        ) {
          return shortcut;
        }
      }
      return null;
    }

    // Set active context
    setContext(context, active = true) {
      if (active) {
        this.activeContexts.add(context);
      } else {
        this.activeContexts.delete(context);
      }
      return this;
    }

    // Sequence tracking
    sequenceBuffer = [];
    sequenceTimeout = null;

    // Handle key event
    handleKeyEvent(event) {
      if (!this.enabled) return;

      // Don't trigger in input fields (except for specific shortcuts)
      if (
        this.isInputFocused() &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        return;
      }

      // Recording mode
      if (this.recording) {
        event.preventDefault();
        this.recordCallback?.(this.eventToString(event));
        return;
      }

      // Check for sequence shortcuts
      this.sequenceBuffer.push(this.eventToString(event));
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = setTimeout(() => {
        this.sequenceBuffer = [];
      }, 1000);

      const sequenceString = this.sequenceBuffer.join(" ");

      // Find matching shortcut
      for (const shortcut of this.shortcuts.values()) {
        if (!shortcut.enabled) continue;
        if (
          !this.activeContexts.has(shortcut.context) &&
          shortcut.context !== "global"
        )
          continue;

        const matches = shortcut.parsed.sequence
          ? shortcut.keyString === sequenceString
          : this.matchEvent(event, shortcut.parsed);

        if (matches) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }

          // Record in history
          this.history.unshift({
            shortcut: shortcut.keyString,
            description: shortcut.description,
            timestamp: new Date(),
          });
          while (this.history.length > this.maxHistory) {
            this.history.pop();
          }

          // Execute handler
          try {
            shortcut.handler(event);
          } catch (error) {
            console.error("Shortcut handler error:", error);
          }

          // Clear sequence buffer on match
          if (shortcut.parsed.sequence) {
            this.sequenceBuffer = [];
          }

          return;
        }
      }
    }

    // Convert event to string
    eventToString(event) {
      const parts = [];
      if (event.ctrlKey) parts.push("Ctrl");
      if (event.altKey) parts.push("Alt");
      if (event.shiftKey) parts.push("Shift");
      if (event.metaKey) parts.push("Meta");

      let key = event.key;
      if (key === " ") key = "Space";
      if (key.length === 1) key = key.toUpperCase();

      parts.push(key);
      return parts.join("+");
    }

    // Check if input is focused
    isInputFocused() {
      const active = document.activeElement;
      if (!active) return false;

      const tag = active.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || active.isContentEditable;
    }

    // Close active panel
    closeActivePanel() {
      // Close in priority order
      const panels = [
        window.BaelCommandPalette,
        window.BaelConfig,
        window.BaelDocs,
        window.BaelDebugConsole,
        window.BaelTestSuite,
        window.BaelPerformanceMonitor,
        window.BaelErrorBoundary,
        window.BaelEventBus,
        window.BaelFeatureFlags,
        window.BaelStateMachine,
        window.BaelAccessibility,
      ];

      for (const panel of panels) {
        if (panel?.isVisible) {
          panel.close?.();
          return true;
        }
      }

      // Close this panel
      if (this.isVisible) {
        this.close();
        return true;
      }

      return false;
    }

    // Record shortcut
    record(callback) {
      this.recording = true;
      this.recordCallback = (keyString) => {
        this.recording = false;
        this.recordCallback = null;
        callback(keyString);
      };
    }

    // Bind events
    bindEvents() {
      document.addEventListener("keydown", (e) => this.handleKeyEvent(e));

      // Context detection
      document.addEventListener("focusin", (e) => {
        if (e.target.closest("#chat-container")) {
          this.setContext("chat", true);
        }
      });

      document.addEventListener("focusout", (e) => {
        if (e.target.closest("#chat-container")) {
          this.setContext("chat", false);
        }
      });
    }

    // Create UI
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-keyboard-panel";
      this.panel.innerHTML = `
                <div class="keyboard-header">
                    <h3>⌨️ Keyboard Shortcuts</h3>
                    <button class="close-btn">✕</button>
                </div>
                <div class="keyboard-search">
                    <input type="text" id="keyboard-search" placeholder="Search shortcuts...">
                </div>
                <div class="keyboard-content" id="keyboard-content"></div>
            `;
      document.body.appendChild(this.panel);

      // Close button
      this.panel
        .querySelector(".close-btn")
        .addEventListener("click", () => this.close());

      // Search
      this.panel
        .querySelector("#keyboard-search")
        .addEventListener("input", (e) => {
          this.updateUI(e.target.value);
        });
    }

    updateUI(filter = "") {
      const container = this.panel.querySelector("#keyboard-content");
      if (!container) return;

      const grouped = {};
      const lowerFilter = filter.toLowerCase();

      for (const shortcut of this.shortcuts.values()) {
        if (
          filter &&
          !shortcut.keyString.toLowerCase().includes(lowerFilter) &&
          !shortcut.description.toLowerCase().includes(lowerFilter)
        ) {
          continue;
        }

        if (!grouped[shortcut.context]) {
          grouped[shortcut.context] = [];
        }
        grouped[shortcut.context].push(shortcut);
      }

      let html = "";
      for (const [context, shortcuts] of Object.entries(grouped)) {
        html += `
                    <div class="keyboard-group">
                        <h4>${this.formatContext(context)}</h4>
                        ${shortcuts
                          .map(
                            (s) => `
                            <div class="keyboard-item">
                                <span class="keyboard-keys">${this.formatKeys(s.keyString)}</span>
                                <span class="keyboard-desc">${s.description}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `;
      }

      container.innerHTML =
        html || '<div class="no-results">No shortcuts found</div>';
    }

    formatContext(context) {
      return context.charAt(0).toUpperCase() + context.slice(1);
    }

    formatKeys(keyString) {
      return keyString
        .split(" ")
        .map((part) =>
          part
            .split("+")
            .map((key) => `<kbd>${key}</kbd>`)
            .join(" + "),
        )
        .join(" then ");
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-keyboard-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 500px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: var(--bael-surface, #1e1e1e);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    z-index: 100001;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                }

                #bael-keyboard-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .keyboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .keyboard-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .keyboard-header .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    cursor: pointer;
                    font-size: 18px;
                }

                .keyboard-search {
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .keyboard-search input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    border-radius: 6px;
                    font-size: 13px;
                }

                .keyboard-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                }

                .keyboard-group {
                    margin-bottom: 20px;
                }

                .keyboard-group h4 {
                    margin: 0 0 12px;
                    font-size: 12px;
                    color: var(--bael-accent, #00d4ff);
                    text-transform: uppercase;
                }

                .keyboard-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    margin-bottom: 4px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                }

                .keyboard-keys {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .keyboard-keys kbd {
                    display: inline-block;
                    padding: 4px 8px;
                    font-family: monospace;
                    font-size: 12px;
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #444);
                    border-radius: 4px;
                    color: var(--bael-text, #fff);
                }

                .keyboard-desc {
                    color: var(--bael-text-dim, #888);
                    font-size: 13px;
                }

                .no-results {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-dim, #888);
                }
            `;
      document.head.appendChild(style);
    }

    open() {
      this.panel.classList.add("visible");
      this.updateUI();
      this.panel.querySelector("#keyboard-search")?.focus();
    }

    close() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    get isVisible() {
      return this.panel.classList.contains("visible");
    }

    // Get all shortcuts
    getAll() {
      return Array.from(this.shortcuts.values());
    }

    // Enable/disable all shortcuts
    enable() {
      this.enabled = true;
      return this;
    }

    disable() {
      this.enabled = false;
      return this;
    }
  }

  // Initialize
  window.BaelKeyboard = new BaelKeyboardManager();
})();
