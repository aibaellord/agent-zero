/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗                            █
 * █  ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝                            █
 * █  ███████╗██╔████╔██║███████║██████╔╝   ██║                               █
 * █  ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║                               █
 * █  ███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║                               █
 * █  ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝                               █
 * █                                                                          █
 * █   BAEL SMART SUGGEST - AI-Powered Input Suggestions                     █
 * █   Intelligent autocomplete and command suggestions                       █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelSmartSuggest {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.targetInput = null;
      this.suggestions = [];
      this.selectedIndex = -1;
      this.history = [];
      this.templates = [];

      // Prebuilt command patterns
      this.commandPatterns = [
        {
          prefix: "/",
          commands: [
            "help",
            "clear",
            "new",
            "save",
            "export",
            "settings",
            "agents",
            "memory",
            "search",
          ],
        },
        { prefix: "@", commands: ["agent", "file", "url", "code", "image"] },
        {
          prefix: "#",
          commands: ["important", "todo", "question", "bug", "feature", "idea"],
        },
      ];

      // Prompt templates
      this.promptTemplates = [
        {
          label: "Explain",
          template: "Explain {concept} in simple terms",
          icon: "📖",
        },
        {
          label: "Debug",
          template: "Help me debug this code: {code}",
          icon: "🐛",
        },
        {
          label: "Write Code",
          template: "Write a {language} function that {description}",
          icon: "💻",
        },
        {
          label: "Summarize",
          template: "Summarize the following: {content}",
          icon: "📝",
        },
        {
          label: "Compare",
          template: "Compare {item1} vs {item2}",
          icon: "⚖️",
        },
        {
          label: "Improve",
          template: "Improve this code for {criteria}: {code}",
          icon: "✨",
        },
        {
          label: "Create Test",
          template: "Write unit tests for: {code}",
          icon: "🧪",
        },
        {
          label: "Document",
          template: "Add documentation/comments to: {code}",
          icon: "📚",
        },
        {
          label: "Refactor",
          template: "Refactor this code: {code}",
          icon: "🔄",
        },
        {
          label: "Translate",
          template: "Translate to {language}: {text}",
          icon: "🌐",
        },
      ];
    }

    async initialize() {
      console.log("💡 Bael Smart Suggest initializing...");

      this.loadHistory();
      this.loadTemplates();
      this.injectStyles();
      this.createContainer();
      this.attachToInputs();

      this.initialized = true;
      console.log("✅ BAEL SMART SUGGEST READY");

      return this;
    }

    loadHistory() {
      try {
        const saved = localStorage.getItem("bael-suggest-history");
        if (saved) {
          this.history = JSON.parse(saved).slice(0, 50);
        }
      } catch (e) {
        this.history = [];
      }
    }

    loadTemplates() {
      try {
        const saved = localStorage.getItem("bael-suggest-templates");
        if (saved) {
          this.templates = [...this.promptTemplates, ...JSON.parse(saved)];
        } else {
          this.templates = [...this.promptTemplates];
        }
      } catch (e) {
        this.templates = [...this.promptTemplates];
      }
    }

    saveHistory() {
      try {
        localStorage.setItem(
          "bael-suggest-history",
          JSON.stringify(this.history.slice(0, 50)),
        );
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-suggest-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-suggest-styles";
      styles.textContent = `
                .bael-suggest-container {
                    position: absolute;
                    width: 400px;
                    max-height: 350px;
                    background: #12121a;
                    border-radius: 14px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9900;
                    opacity: 0;
                    transform: translateY(-8px);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .bael-suggest-container.visible {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }

                .suggest-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .suggest-title {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .suggest-hint {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .suggest-hint kbd {
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                    font-size: 9px;
                    margin: 0 2px;
                }

                .suggest-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .suggest-section {
                    margin-bottom: 12px;
                }

                .suggest-section:last-child {
                    margin-bottom: 0;
                }

                .suggest-section-title {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 6px 10px;
                    margin-bottom: 4px;
                }

                .suggest-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .suggest-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .suggest-item:hover,
                .suggest-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                }

                .suggest-item.selected {
                    background: rgba(99, 102, 241, 0.2);
                    border-left: 3px solid #6366f1;
                }

                .suggest-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(99, 102, 241, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .suggest-icon.command {
                    background: rgba(245, 158, 11, 0.15);
                }

                .suggest-icon.history {
                    background: rgba(139, 92, 246, 0.15);
                }

                .suggest-info {
                    flex: 1;
                    min-width: 0;
                }

                .suggest-label {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.85);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .suggest-desc {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .suggest-kbd {
                    padding: 4px 8px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 6px;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    font-family: monospace;
                }

                .suggest-empty {
                    text-align: center;
                    padding: 24px;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 13px;
                }

                .suggest-footer {
                    padding: 10px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .suggest-footer-hint {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .suggest-footer-hint kbd {
                    padding: 2px 5px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 3px;
                    margin: 0 3px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-smart-suggest";
      this.container.className = "bael-suggest-container";

      document.body.appendChild(this.container);
    }

    attachToInputs() {
      // Observe for new input elements
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              this.findAndAttach(node);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Attach to existing inputs
      this.findAndAttach(document.body);
    }

    findAndAttach(root) {
      // Find chat input areas
      const inputs = root.querySelectorAll(
        'textarea, input[type="text"], [contenteditable="true"]',
      );
      inputs.forEach((input) => {
        if (input.dataset.baelSuggest) return;
        input.dataset.baelSuggest = "true";

        input.addEventListener("input", (e) => this.onInput(e));
        input.addEventListener("keydown", (e) => this.onKeydown(e));
        input.addEventListener("blur", () =>
          setTimeout(() => this.hide(), 200),
        );
        input.addEventListener("focus", (e) => this.onFocus(e));
      });
    }

    onFocus(e) {
      this.targetInput = e.target;
      const value = this.getValue();

      if (!value) {
        // Show templates on empty focus
        this.showTemplates();
      }
    }

    onInput(e) {
      this.targetInput = e.target;
      const value = this.getValue();

      if (!value) {
        this.showTemplates();
        return;
      }

      // Check for command patterns
      for (const pattern of this.commandPatterns) {
        if (value.startsWith(pattern.prefix)) {
          const query = value.substring(pattern.prefix.length).toLowerCase();
          this.showCommands(
            pattern.prefix,
            pattern.commands.filter((c) => c.includes(query)),
          );
          return;
        }
      }

      // Show history matches
      const matches = this.history
        .filter((h) => h.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);

      // Also show template matches
      const templateMatches = this.templates
        .filter(
          (t) =>
            t.label.toLowerCase().includes(value.toLowerCase()) ||
            t.template.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 3);

      if (matches.length > 0 || templateMatches.length > 0) {
        this.showMixed(matches, templateMatches);
      } else {
        this.hide();
      }
    }

    onKeydown(e) {
      if (!this.visible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.selectNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.selectPrev();
          break;
        case "Tab":
        case "Enter":
          if (this.selectedIndex >= 0 && this.suggestions.length > 0) {
            e.preventDefault();
            this.applySuggestion(this.suggestions[this.selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          this.hide();
          break;
      }
    }

    getValue() {
      if (!this.targetInput) return "";

      if (this.targetInput.value !== undefined) {
        return this.targetInput.value;
      }
      return this.targetInput.textContent || "";
    }

    setValue(value) {
      if (!this.targetInput) return;

      if (this.targetInput.value !== undefined) {
        this.targetInput.value = value;
      } else {
        this.targetInput.textContent = value;
      }

      // Trigger input event
      this.targetInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    showTemplates() {
      this.suggestions = this.templates.map((t) => ({
        type: "template",
        ...t,
      }));
      this.selectedIndex = -1;
      this.render("templates");
    }

    showCommands(prefix, commands) {
      this.suggestions = commands.map((c) => ({
        type: "command",
        prefix,
        label: prefix + c,
        template: prefix + c,
      }));
      this.selectedIndex = 0;
      this.render("commands");
    }

    showMixed(history, templates) {
      this.suggestions = [
        ...history.map((h) => ({ type: "history", label: h, template: h })),
        ...templates.map((t) => ({ type: "template", ...t })),
      ];
      this.selectedIndex = 0;
      this.render("mixed");
    }

    render(mode) {
      if (this.suggestions.length === 0) {
        this.hide();
        return;
      }

      let sectionsHtml = "";

      if (mode === "templates") {
        sectionsHtml = `
                    <div class="suggest-section">
                        <div class="suggest-section-title">Quick Templates</div>
                        <div class="suggest-list">
                            ${this.suggestions.map((s, i) => this.renderItem(s, i)).join("")}
                        </div>
                    </div>
                `;
      } else if (mode === "commands") {
        sectionsHtml = `
                    <div class="suggest-section">
                        <div class="suggest-section-title">Commands</div>
                        <div class="suggest-list">
                            ${this.suggestions.map((s, i) => this.renderItem(s, i)).join("")}
                        </div>
                    </div>
                `;
      } else {
        const historyItems = this.suggestions.filter(
          (s) => s.type === "history",
        );
        const templateItems = this.suggestions.filter(
          (s) => s.type === "template",
        );

        if (historyItems.length > 0) {
          sectionsHtml += `
                        <div class="suggest-section">
                            <div class="suggest-section-title">Recent</div>
                            <div class="suggest-list">
                                ${historyItems.map((s, i) => this.renderItem(s, i)).join("")}
                            </div>
                        </div>
                    `;
        }

        if (templateItems.length > 0) {
          const offset = historyItems.length;
          sectionsHtml += `
                        <div class="suggest-section">
                            <div class="suggest-section-title">Templates</div>
                            <div class="suggest-list">
                                ${templateItems.map((s, i) => this.renderItem(s, offset + i)).join("")}
                            </div>
                        </div>
                    `;
        }
      }

      this.container.innerHTML = `
                <div class="suggest-header">
                    <span class="suggest-title">💡 Smart Suggest</span>
                    <span class="suggest-hint"><kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>Tab</kbd> select</span>
                </div>
                <div class="suggest-content">
                    ${sectionsHtml}
                </div>
                <div class="suggest-footer">
                    <span class="suggest-footer-hint"><kbd>Esc</kbd> to dismiss</span>
                    <span class="suggest-footer-hint">${this.suggestions.length} suggestions</span>
                </div>
            `;

      this.positionContainer();
      this.show();
    }

    renderItem(suggestion, index) {
      const iconClass =
        suggestion.type === "command"
          ? "command"
          : suggestion.type === "history"
            ? "history"
            : "";
      const icon =
        suggestion.icon ||
        (suggestion.type === "command"
          ? "⚡"
          : suggestion.type === "history"
            ? "🕐"
            : "📝");

      return `
                <div class="suggest-item ${index === this.selectedIndex ? "selected" : ""}"
                     onmouseenter="BaelSmartSuggest.selectIndex(${index})"
                     onclick="BaelSmartSuggest.applyByIndex(${index})">
                    <div class="suggest-icon ${iconClass}">${icon}</div>
                    <div class="suggest-info">
                        <div class="suggest-label">${suggestion.label}</div>
                        ${
                          suggestion.template !== suggestion.label
                            ? `<div class="suggest-desc">${suggestion.template}</div>`
                            : ""
                        }
                    </div>
                </div>
            `;
    }

    positionContainer() {
      if (!this.targetInput) return;

      const rect = this.targetInput.getBoundingClientRect();
      const containerHeight = Math.min(350, this.container.scrollHeight);

      // Position above or below input
      if (rect.top > containerHeight + 20) {
        // Above
        this.container.style.bottom = window.innerHeight - rect.top + 8 + "px";
        this.container.style.top = "auto";
      } else {
        // Below
        this.container.style.top = rect.bottom + 8 + "px";
        this.container.style.bottom = "auto";
      }

      this.container.style.left = Math.max(16, rect.left) + "px";
      this.container.style.width = Math.min(400, rect.width) + "px";
    }

    show() {
      this.visible = true;
      this.container.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
      this.selectedIndex = -1;
    }

    selectNext() {
      if (this.suggestions.length === 0) return;
      this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
      this.updateSelection();
    }

    selectPrev() {
      if (this.suggestions.length === 0) return;
      this.selectedIndex =
        (this.selectedIndex - 1 + this.suggestions.length) %
        this.suggestions.length;
      this.updateSelection();
    }

    selectIndex(index) {
      this.selectedIndex = index;
      this.updateSelection();
    }

    updateSelection() {
      this.container.querySelectorAll(".suggest-item").forEach((item, i) => {
        item.classList.toggle("selected", i === this.selectedIndex);
      });
    }

    applyByIndex(index) {
      if (this.suggestions[index]) {
        this.applySuggestion(this.suggestions[index]);
      }
    }

    applySuggestion(suggestion) {
      this.setValue(suggestion.template);
      this.hide();

      // Focus back to input
      this.targetInput?.focus();

      // Move cursor to placeholder if exists
      if (suggestion.template.includes("{")) {
        // Select first placeholder
        const match = suggestion.template.match(/\{([^}]+)\}/);
        if (match && this.targetInput) {
          const start = suggestion.template.indexOf(match[0]);
          const end = start + match[0].length;
          this.targetInput.setSelectionRange?.(start, end);
        }
      }
    }

    addToHistory(text) {
      if (!text || text.length < 5) return;

      // Remove duplicates
      this.history = this.history.filter((h) => h !== text);

      // Add to front
      this.history.unshift(text);

      // Keep only 50
      this.history = this.history.slice(0, 50);

      this.saveHistory();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelSmartSuggest = new BaelSmartSuggest();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSmartSuggest.initialize();
    });
  } else {
    window.BaelSmartSuggest.initialize();
  }

  console.log("💡 Bael Smart Suggest loaded");
})();
