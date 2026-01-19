/**
 * BAEL - LORD OF ALL
 * Smart Suggestions - AI-powered autocomplete and contextual suggestions
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelSmartSuggestions {
    constructor() {
      this.suggestionBox = null;
      this.inputTarget = null;
      this.currentSuggestions = [];
      this.selectedIndex = -1;
      this.isEnabled = true;
      this.debounceTimer = null;
      this.triggerPatterns = {
        slash: /^\/(\w*)$/,
        mention: /@(\w*)$/,
        hashtag: /#(\w*)$/,
        arrow: /=>(\w*)$/,
      };
      this.commandRegistry = this.buildCommandRegistry();
      this.recentPrompts = this.loadRecentPrompts();
      this.init();
    }

    init() {
      this.addStyles();
      this.createSuggestionBox();
      this.bindEvents();
      console.log("💡 Bael Smart Suggestions initialized");
    }

    buildCommandRegistry() {
      return [
        // Slash commands
        {
          type: "command",
          trigger: "/",
          name: "/help",
          description: "Show available commands",
          icon: "❓",
        },
        {
          type: "command",
          trigger: "/",
          name: "/clear",
          description: "Clear conversation history",
          icon: "🗑️",
        },
        {
          type: "command",
          trigger: "/",
          name: "/new",
          description: "Start a new conversation",
          icon: "✨",
        },
        {
          type: "command",
          trigger: "/",
          name: "/export",
          description: "Export conversation",
          icon: "📤",
        },
        {
          type: "command",
          trigger: "/",
          name: "/settings",
          description: "Open settings",
          icon: "⚙️",
        },
        {
          type: "command",
          trigger: "/",
          name: "/persona",
          description: "Change AI persona",
          icon: "🎭",
        },
        {
          type: "command",
          trigger: "/",
          name: "/model",
          description: "Select AI model",
          icon: "🤖",
        },
        {
          type: "command",
          trigger: "/",
          name: "/template",
          description: "Load prompt template",
          icon: "📋",
        },
        {
          type: "command",
          trigger: "/",
          name: "/code",
          description: "Insert code block",
          icon: "💻",
        },
        {
          type: "command",
          trigger: "/",
          name: "/image",
          description: "Attach an image",
          icon: "🖼️",
        },
        {
          type: "command",
          trigger: "/",
          name: "/voice",
          description: "Start voice input",
          icon: "🎤",
        },
        {
          type: "command",
          trigger: "/",
          name: "/focus",
          description: "Toggle focus mode",
          icon: "🎯",
        },
        {
          type: "command",
          trigger: "/",
          name: "/branch",
          description: "Create conversation branch",
          icon: "🌿",
        },
        {
          type: "command",
          trigger: "/",
          name: "/undo",
          description: "Undo last message",
          icon: "↩️",
        },
        {
          type: "command",
          trigger: "/",
          name: "/regenerate",
          description: "Regenerate last response",
          icon: "🔄",
        },
        {
          type: "command",
          trigger: "/",
          name: "/continue",
          description: "Continue from last response",
          icon: "➡️",
        },
        {
          type: "command",
          trigger: "/",
          name: "/summarize",
          description: "Summarize conversation",
          icon: "📝",
        },
        {
          type: "command",
          trigger: "/",
          name: "/translate",
          description: "Translate text",
          icon: "🌐",
        },
        {
          type: "command",
          trigger: "/",
          name: "/debug",
          description: "Show debug info",
          icon: "🐛",
        },

        // Mention suggestions
        {
          type: "mention",
          trigger: "@",
          name: "@code_assistant",
          description: "Coding expert persona",
          icon: "👨‍💻",
        },
        {
          type: "mention",
          trigger: "@",
          name: "@writer",
          description: "Writing assistant persona",
          icon: "✍️",
        },
        {
          type: "mention",
          trigger: "@",
          name: "@analyst",
          description: "Data analyst persona",
          icon: "📊",
        },
        {
          type: "mention",
          trigger: "@",
          name: "@teacher",
          description: "Patient teacher persona",
          icon: "👩‍🏫",
        },
        {
          type: "mention",
          trigger: "@",
          name: "@researcher",
          description: "Research assistant",
          icon: "🔬",
        },

        // Hashtag/context suggestions
        {
          type: "hashtag",
          trigger: "#",
          name: "#python",
          description: "Python programming context",
          icon: "🐍",
        },
        {
          type: "hashtag",
          trigger: "#",
          name: "#javascript",
          description: "JavaScript context",
          icon: "📜",
        },
        {
          type: "hashtag",
          trigger: "#",
          name: "#sql",
          description: "SQL database context",
          icon: "🗄️",
        },
        {
          type: "hashtag",
          trigger: "#",
          name: "#markdown",
          description: "Markdown formatting",
          icon: "📑",
        },
        {
          type: "hashtag",
          trigger: "#",
          name: "#creative",
          description: "Creative writing mode",
          icon: "🎨",
        },
        {
          type: "hashtag",
          trigger: "#",
          name: "#concise",
          description: "Brief responses",
          icon: "📏",
        },
        {
          type: "hashtag",
          trigger: "#",
          name: "#detailed",
          description: "Detailed responses",
          icon: "📖",
        },
        {
          type: "hashtag",
          trigger: "#",
          name: "#step-by-step",
          description: "Step-by-step explanation",
          icon: "👣",
        },
      ];
    }

    loadRecentPrompts() {
      try {
        return JSON.parse(localStorage.getItem("bael-recent-prompts") || "[]");
      } catch {
        return [];
      }
    }

    saveRecentPrompt(prompt) {
      if (!prompt || prompt.startsWith("/") || prompt.length < 10) return;

      // Remove if already exists
      this.recentPrompts = this.recentPrompts.filter((p) => p !== prompt);

      // Add to beginning
      this.recentPrompts.unshift(prompt);

      // Keep only last 20
      this.recentPrompts = this.recentPrompts.slice(0, 20);

      localStorage.setItem(
        "bael-recent-prompts",
        JSON.stringify(this.recentPrompts),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-suggestions-styles";
      styles.textContent = `
                /* Suggestion Box */
                .bael-suggestion-box {
                    position: fixed;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    min-width: 300px;
                    max-width: 450px;
                    max-height: 350px;
                    overflow-y: auto;
                    z-index: 100050;
                    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
                    display: none;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .bael-suggestion-box.visible {
                    display: block;
                    animation: suggestionSlide 0.15s ease;
                }

                @keyframes suggestionSlide {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Suggestion Header */
                .suggestion-header {
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .suggestion-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .suggestion-hint {
                    font-size: 10px;
                    color: var(--bael-text-muted, #555);
                }

                .suggestion-hint kbd {
                    background: var(--bael-bg-tertiary, #181820);
                    padding: 2px 5px;
                    border-radius: 3px;
                    font-family: inherit;
                    margin: 0 2px;
                }

                /* Suggestion Items */
                .suggestion-list {
                    padding: 6px;
                }

                .suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .suggestion-item:hover,
                .suggestion-item.selected {
                    background: var(--bael-bg-tertiary, #181820);
                }

                .suggestion-item.selected {
                    background: rgba(255, 51, 102, 0.15);
                    border-left: 3px solid var(--bael-accent, #ff3366);
                    margin-left: -3px;
                }

                .suggestion-icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 8px;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .suggestion-content {
                    flex: 1;
                    min-width: 0;
                }

                .suggestion-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 2px;
                }

                .suggestion-name mark {
                    background: rgba(255, 51, 102, 0.3);
                    color: var(--bael-accent, #ff3366);
                    border-radius: 2px;
                    padding: 0 2px;
                }

                .suggestion-desc {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .suggestion-type {
                    font-size: 9px;
                    font-weight: 600;
                    text-transform: uppercase;
                    padding: 3px 6px;
                    border-radius: 4px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    color: var(--bael-text-muted, #666);
                }

                .suggestion-type.command { color: #6366f1; }
                .suggestion-type.mention { color: #4ade80; }
                .suggestion-type.hashtag { color: #fbbf24; }
                .suggestion-type.recent { color: #f472b6; }
                .suggestion-type.ai { color: var(--bael-accent, #ff3366); }

                /* Empty State */
                .suggestion-empty {
                    padding: 24px;
                    text-align: center;
                }

                .suggestion-empty-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                    opacity: 0.5;
                }

                .suggestion-empty-text {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                /* AI Suggestion Loading */
                .suggestion-loading {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                }

                .suggestion-loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-top-color: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                .suggestion-loading-text {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Divider */
                .suggestion-divider {
                    height: 1px;
                    background: var(--bael-border, #2a2a3a);
                    margin: 6px 12px;
                }

                /* Category Label */
                .suggestion-category {
                    padding: 8px 12px 4px;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #555);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Toggle indicator */
                .bael-suggestion-indicator {
                    position: fixed;
                    bottom: 160px;
                    right: 74px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #555);
                    background: var(--bael-bg-secondary, #12121a);
                    padding: 4px 8px;
                    border-radius: 4px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 100000;
                    pointer-events: none;
                }

                .bael-suggestion-indicator.show {
                    opacity: 1;
                }
            `;
      document.head.appendChild(styles);
    }

    createSuggestionBox() {
      const box = document.createElement("div");
      box.className = "bael-suggestion-box";
      box.innerHTML = `
                <div class="suggestion-header">
                    <span class="suggestion-title">Suggestions</span>
                    <span class="suggestion-hint"><kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>Tab</kbd> select</span>
                </div>
                <div class="suggestion-list"></div>
            `;
      document.body.appendChild(box);
      this.suggestionBox = box;

      // Click handler for items
      box.addEventListener("click", (e) => {
        const item = e.target.closest(".suggestion-item");
        if (item) {
          const index = parseInt(item.dataset.index);
          this.acceptSuggestion(index);
        }
      });
    }

    bindEvents() {
      // Find input element
      this.findInputElement();

      // Global keyboard listener
      document.addEventListener("keydown", (e) => {
        if (!this.suggestionBox.classList.contains("visible")) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.moveSelection(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.moveSelection(-1);
        } else if (e.key === "Tab" || e.key === "Enter") {
          if (this.selectedIndex >= 0) {
            e.preventDefault();
            this.acceptSuggestion(this.selectedIndex);
          }
        } else if (e.key === "Escape") {
          this.hideSuggestions();
        }
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (
          !this.suggestionBox.contains(e.target) &&
          e.target !== this.inputTarget
        ) {
          this.hideSuggestions();
        }
      });

      // Observe DOM for input changes
      const observer = new MutationObserver(() => this.findInputElement());
      observer.observe(document.body, { childList: true, subtree: true });
    }

    findInputElement() {
      // Look for common chat input selectors
      const selectors = [
        'textarea[x-model*="message"]',
        "textarea.chat-input",
        "#chat-input",
        'textarea[placeholder*="message"]',
        "textarea",
      ];

      for (const selector of selectors) {
        const input = document.querySelector(selector);
        if (input && input !== this.inputTarget) {
          this.attachToInput(input);
          break;
        }
      }
    }

    attachToInput(input) {
      if (this.inputTarget) {
        this.inputTarget.removeEventListener("input", this.handleInput);
        this.inputTarget.removeEventListener("focus", this.handleFocus);
        this.inputTarget.removeEventListener("blur", this.handleBlur);
      }

      this.inputTarget = input;

      this.handleInput = (e) => this.onInput(e);
      this.handleFocus = () => this.onFocus();
      this.handleBlur = () => this.onBlur();

      input.addEventListener("input", this.handleInput);
      input.addEventListener("focus", this.handleFocus);
      input.addEventListener("blur", this.handleBlur);
    }

    onInput(e) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.processSuggestions();
      }, 100);
    }

    onFocus() {
      // Show recent prompts when empty
      if (!this.inputTarget.value) {
        this.showRecentPrompts();
      }
    }

    onBlur() {
      // Delay hide to allow click on suggestions
      setTimeout(() => {
        if (!this.suggestionBox.matches(":hover")) {
          this.hideSuggestions();
        }
      }, 200);
    }

    processSuggestions() {
      const value = this.inputTarget.value;
      const cursorPos = this.inputTarget.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPos);

      // Check for triggers
      let match = null;
      let triggerType = null;

      for (const [type, pattern] of Object.entries(this.triggerPatterns)) {
        match = textBeforeCursor.match(pattern);
        if (match) {
          triggerType = type;
          break;
        }
      }

      if (match && triggerType) {
        const query = match[1] || "";
        this.showCommandSuggestions(triggerType, query);
      } else if (value.length >= 3 && !value.startsWith("/")) {
        this.showSmartSuggestions(value);
      } else {
        this.hideSuggestions();
      }
    }

    showCommandSuggestions(type, query) {
      const triggerMap = {
        slash: "/",
        mention: "@",
        hashtag: "#",
        arrow: "=>",
      };
      const trigger = triggerMap[type];

      let suggestions = this.commandRegistry.filter(
        (cmd) =>
          cmd.trigger === trigger &&
          cmd.name.toLowerCase().includes(query.toLowerCase()),
      );

      if (suggestions.length === 0) {
        this.hideSuggestions();
        return;
      }

      this.currentSuggestions = suggestions;
      this.selectedIndex = 0;
      this.renderSuggestions(`${trigger} Commands`, suggestions, query);
    }

    showSmartSuggestions(query) {
      // Combine recent prompts and AI suggestions
      const suggestions = [];

      // Add matching recent prompts
      const matchingRecent = this.recentPrompts
        .filter((p) => p.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map((p) => ({
          type: "recent",
          name: p.substring(0, 60) + (p.length > 60 ? "..." : ""),
          description: "Recent prompt",
          icon: "🕐",
          fullText: p,
        }));

      suggestions.push(...matchingRecent);

      // Add AI-suggested continuations
      const aiSuggestions = this.generateAISuggestions(query);
      suggestions.push(...aiSuggestions);

      if (suggestions.length === 0) {
        this.hideSuggestions();
        return;
      }

      this.currentSuggestions = suggestions;
      this.selectedIndex = 0;
      this.renderSuggestions("Smart Suggestions", suggestions, query);
    }

    generateAISuggestions(query) {
      // Pattern-based intelligent suggestions
      const suggestions = [];

      if (query.match(/how (do|can|to)/i)) {
        suggestions.push({
          type: "ai",
          name: `${query} step by step?`,
          description: "Request detailed steps",
          icon: "📝",
        });
      }

      if (query.match(/what (is|are|does)/i)) {
        suggestions.push({
          type: "ai",
          name: `${query} with examples?`,
          description: "Request with examples",
          icon: "💡",
        });
      }

      if (query.match(/write|create|make|build/i)) {
        suggestions.push({
          type: "ai",
          name: `${query} with comments`,
          description: "Include explanations",
          icon: "📖",
        });
      }

      if (query.match(/explain|understand/i)) {
        suggestions.push({
          type: "ai",
          name: `${query} like I'm a beginner`,
          description: "Simplified explanation",
          icon: "🎓",
        });
      }

      if (query.match(/code|function|script|program/i)) {
        suggestions.push({
          type: "ai",
          name: `${query} in Python`,
          description: "Python implementation",
          icon: "🐍",
        });
        suggestions.push({
          type: "ai",
          name: `${query} in JavaScript`,
          description: "JavaScript implementation",
          icon: "📜",
        });
      }

      return suggestions.slice(0, 4);
    }

    showRecentPrompts() {
      if (this.recentPrompts.length === 0) return;

      const suggestions = this.recentPrompts.slice(0, 5).map((p) => ({
        type: "recent",
        name: p.substring(0, 60) + (p.length > 60 ? "..." : ""),
        description: "Recent prompt",
        icon: "🕐",
        fullText: p,
      }));

      this.currentSuggestions = suggestions;
      this.selectedIndex = -1;
      this.renderSuggestions("Recent Prompts", suggestions, "");
    }

    renderSuggestions(title, suggestions, query) {
      const list = this.suggestionBox.querySelector(".suggestion-list");
      const titleEl = this.suggestionBox.querySelector(".suggestion-title");

      titleEl.textContent = title;

      list.innerHTML = suggestions
        .map(
          (s, i) => `
                <div class="suggestion-item ${i === this.selectedIndex ? "selected" : ""}" data-index="${i}">
                    <div class="suggestion-icon">${s.icon}</div>
                    <div class="suggestion-content">
                        <div class="suggestion-name">${this.highlightMatch(s.name, query)}</div>
                        <div class="suggestion-desc">${s.description}</div>
                    </div>
                    <span class="suggestion-type ${s.type}">${s.type}</span>
                </div>
            `,
        )
        .join("");

      this.positionSuggestionBox();
      this.suggestionBox.classList.add("visible");
    }

    highlightMatch(text, query) {
      if (!query) return text;
      const regex = new RegExp(`(${this.escapeRegex(query)})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    }

    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    positionSuggestionBox() {
      if (!this.inputTarget) return;

      const rect = this.inputTarget.getBoundingClientRect();
      const boxHeight = this.suggestionBox.offsetHeight;

      // Position above the input
      this.suggestionBox.style.left = `${rect.left}px`;
      this.suggestionBox.style.bottom = `${window.innerHeight - rect.top + 10}px`;
      this.suggestionBox.style.top = "auto";
      this.suggestionBox.style.width = `${Math.max(rect.width, 350)}px`;
    }

    moveSelection(delta) {
      this.selectedIndex = Math.max(
        0,
        Math.min(
          this.currentSuggestions.length - 1,
          this.selectedIndex + delta,
        ),
      );

      const items = this.suggestionBox.querySelectorAll(".suggestion-item");
      items.forEach((item, i) => {
        item.classList.toggle("selected", i === this.selectedIndex);
      });

      // Scroll into view
      items[this.selectedIndex]?.scrollIntoView({ block: "nearest" });
    }

    acceptSuggestion(index) {
      const suggestion = this.currentSuggestions[index];
      if (!suggestion) return;

      let insertText = "";
      let replaceFrom = 0;

      if (
        suggestion.type === "command" ||
        suggestion.type === "mention" ||
        suggestion.type === "hashtag"
      ) {
        // Find the trigger position
        const value = this.inputTarget.value;
        const cursorPos = this.inputTarget.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);

        const triggerMatch = textBeforeCursor.match(/[/@#][\w]*$/);
        if (triggerMatch) {
          replaceFrom = cursorPos - triggerMatch[0].length;
        }

        insertText = suggestion.name + " ";
      } else if (suggestion.type === "recent") {
        insertText = suggestion.fullText || suggestion.name;
        replaceFrom = 0;
      } else if (suggestion.type === "ai") {
        insertText = suggestion.name;
        replaceFrom = 0;
      }

      // Insert the text
      const value = this.inputTarget.value;
      const newValue =
        value.substring(0, replaceFrom) +
        insertText +
        value.substring(this.inputTarget.selectionStart);
      this.inputTarget.value = newValue;
      this.inputTarget.selectionStart = this.inputTarget.selectionEnd =
        replaceFrom + insertText.length;

      // Trigger input event
      this.inputTarget.dispatchEvent(new Event("input", { bubbles: true }));

      this.hideSuggestions();

      // Execute command if applicable
      if (suggestion.type === "command") {
        this.executeCommand(suggestion.name);
      }
    }

    executeCommand(command) {
      const commandMap = {
        "/clear": () => window.BaelUI?.clearChat?.(),
        "/new": () => window.BaelUI?.newChat?.(),
        "/export": () => window.BaelExport?.show?.(),
        "/settings": () =>
          document.querySelector('[x-on\\:click*="settings"]')?.click(),
        "/persona": () => window.BaelPersonas?.showPanel?.(),
        "/model": () => window.BaelModelCompare?.toggle?.(),
        "/template": () => window.BaelTemplates?.showPanel?.(),
        "/focus": () => window.BaelFocusMode?.toggle?.(),
        "/branch": () => window.BaelBranching?.showPanel?.(),
        "/undo": () => window.BaelHistory?.undo?.(),
        "/voice": () => window.BaelVoice?.startListening?.(),
        "/debug": () => window.BaelAgentMonitor?.showPanel?.(),
      };

      const handler = commandMap[command];
      if (handler) {
        // Clear the input and execute
        this.inputTarget.value = "";
        this.inputTarget.dispatchEvent(new Event("input", { bubbles: true }));
        setTimeout(handler, 100);
      }
    }

    hideSuggestions() {
      this.suggestionBox.classList.remove("visible");
      this.selectedIndex = -1;
    }

    // Public API
    enable() {
      this.isEnabled = true;
    }

    disable() {
      this.isEnabled = false;
      this.hideSuggestions();
    }

    addCommand(command) {
      this.commandRegistry.push(command);
    }

    recordPrompt(prompt) {
      this.saveRecentPrompt(prompt);
    }
  }

  // Initialize
  window.BaelSmartSuggestions = new BaelSmartSuggestions();
})();
