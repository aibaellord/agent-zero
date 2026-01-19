/**
 * BAEL - LORD OF ALL
 * Quick Reply Templates - Predefined response shortcuts
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelQuickReply {
    constructor() {
      this.templates = [];
      this.panel = null;
      this.storageKey = "bael-quick-replies";
      this.init();
    }

    init() {
      this.addStyles();
      this.loadTemplates();
      this.createUI();
      this.bindEvents();
      console.log("⚡ Bael Quick Reply initialized");
    }

    loadTemplates() {
      try {
        this.templates = JSON.parse(
          localStorage.getItem(this.storageKey) || "null",
        );
      } catch {
        this.templates = null;
      }

      if (!this.templates) {
        this.templates = this.getDefaultTemplates();
        this.saveTemplates();
      }
    }

    getDefaultTemplates() {
      return [
        // Acknowledgments
        {
          id: 1,
          category: "acknowledge",
          emoji: "👍",
          text: "Got it, thanks!",
          shortcut: "gt",
        },
        {
          id: 2,
          category: "acknowledge",
          emoji: "✅",
          text: "Perfect, that works great!",
          shortcut: "pw",
        },
        {
          id: 3,
          category: "acknowledge",
          emoji: "🎯",
          text: "Exactly what I needed!",
          shortcut: "ex",
        },

        // Requests
        {
          id: 4,
          category: "request",
          emoji: "🔍",
          text: "Can you explain that in more detail?",
          shortcut: "em",
        },
        {
          id: 5,
          category: "request",
          emoji: "📝",
          text: "Can you provide an example?",
          shortcut: "pe",
        },
        {
          id: 6,
          category: "request",
          emoji: "🔄",
          text: "Can you try a different approach?",
          shortcut: "da",
        },
        {
          id: 7,
          category: "request",
          emoji: "📊",
          text: "Can you break this down step by step?",
          shortcut: "ss",
        },
        {
          id: 8,
          category: "request",
          emoji: "💡",
          text: "What are the alternatives?",
          shortcut: "alt",
        },

        // Code
        {
          id: 9,
          category: "code",
          emoji: "💻",
          text: "Can you add comments to the code?",
          shortcut: "ac",
        },
        {
          id: 10,
          category: "code",
          emoji: "🐛",
          text: "There's a bug, can you fix it?",
          shortcut: "fb",
        },
        {
          id: 11,
          category: "code",
          emoji: "⚡",
          text: "Can you optimize this code?",
          shortcut: "oc",
        },
        {
          id: 12,
          category: "code",
          emoji: "🧪",
          text: "Can you add tests for this?",
          shortcut: "at",
        },

        // Clarification
        {
          id: 13,
          category: "clarify",
          emoji: "❓",
          text: "I'm not sure I understand, can you clarify?",
          shortcut: "cl",
        },
        {
          id: 14,
          category: "clarify",
          emoji: "🤔",
          text: "Why did you choose this approach?",
          shortcut: "wa",
        },
        {
          id: 15,
          category: "clarify",
          emoji: "📌",
          text: "What are the trade-offs?",
          shortcut: "to",
        },

        // Follow-up
        {
          id: 16,
          category: "followup",
          emoji: "➡️",
          text: "Continue from where you left off",
          shortcut: "co",
        },
        {
          id: 17,
          category: "followup",
          emoji: "📄",
          text: "Show me the complete code",
          shortcut: "cc",
        },
        {
          id: 18,
          category: "followup",
          emoji: "🔧",
          text: "Now apply this to my specific case",
          shortcut: "am",
        },
      ];
    }

    saveTemplates() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.templates));
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-quick-reply-styles";
      styles.textContent = `
                /* Quick Reply Bar */
                .bael-quick-reply-bar {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: none;
                    gap: 6px;
                    padding: 8px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 25px;
                    z-index: 100015;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    max-width: 90%;
                    overflow-x: auto;
                }

                .bael-quick-reply-bar.visible {
                    display: flex;
                    animation: quickBarIn 0.2s ease;
                }

                @keyframes quickBarIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                .quick-reply-chip {
                    padding: 6px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    cursor: pointer;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .quick-reply-chip:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: translateY(-2px);
                }

                .quick-reply-more {
                    padding: 6px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                }

                .quick-reply-more:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Full Panel */
                .bael-quick-panel {
                    position: fixed;
                    bottom: 150px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 600px;
                    max-height: 400px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100025;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-quick-panel.visible {
                    display: flex;
                    animation: quickPanelIn 0.2s ease;
                }

                @keyframes quickPanelIn {
                    from { opacity: 0; transform: translateX(-50%) scale(0.95); }
                    to { opacity: 1; transform: translateX(-50%) scale(1); }
                }

                /* Panel Header */
                .quick-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .quick-panel-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .quick-panel-search {
                    flex: 1;
                    max-width: 200px;
                    margin: 0 16px;
                    padding: 6px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .quick-panel-search:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .quick-panel-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 16px;
                }

                .quick-panel-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Categories */
                .quick-categories {
                    display: flex;
                    gap: 6px;
                    padding: 10px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .quick-category {
                    padding: 5px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .quick-category:hover,
                .quick-category.active {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .quick-category.active {
                    background: rgba(255, 51, 102, 0.15);
                }

                /* Template Grid */
                .quick-templates {
                    flex: 1;
                    padding: 12px 16px;
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    align-content: start;
                }

                .quick-template {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .quick-template:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: translateY(-2px);
                }

                .quick-template-emoji {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .quick-template-content {
                    flex: 1;
                    min-width: 0;
                }

                .quick-template-text {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.4;
                }

                .quick-template-shortcut {
                    margin-top: 4px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .quick-template-shortcut kbd {
                    padding: 2px 5px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 3px;
                    font-family: monospace;
                }

                /* Create New */
                .quick-create {
                    padding: 12px 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    background: var(--bael-bg-secondary, #12121a);
                }

                .quick-create-btn {
                    width: 100%;
                    padding: 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px dashed var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .quick-create-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Floating Toggle */
                .bael-quick-toggle {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    width: 44px;
                    height: 44px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 100005;
                    transition: all 0.3s ease;
                }

                .bael-quick-toggle:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                /* Create Form */
                .quick-form {
                    padding: 16px;
                }

                .quick-form-group {
                    margin-bottom: 12px;
                }

                .quick-form-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 4px;
                }

                .quick-form-input {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .quick-form-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .quick-form-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }

                .quick-form-btn {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .quick-form-btn.cancel {
                    background: var(--bael-bg-tertiary, #181820);
                    color: var(--bael-text-muted, #666);
                }

                .quick-form-btn.save {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Quick bar (shown at bottom)
      const bar = document.createElement("div");
      bar.className = "bael-quick-reply-bar";
      bar.innerHTML = this.renderQuickBar();
      document.body.appendChild(bar);
      this.bar = bar;

      // Full panel
      const panel = document.createElement("div");
      panel.className = "bael-quick-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      // Toggle button
      const toggle = document.createElement("button");
      toggle.className = "bael-quick-toggle";
      toggle.innerHTML = "⚡";
      toggle.title = "Quick Replies (Ctrl+Shift+Q)";
      toggle.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(toggle);
      this.toggle = toggle;

      this.bindPanelEvents();
    }

    renderQuickBar() {
      // Show first 5 templates
      const quick = this.templates.slice(0, 5);
      return `
                ${quick
                  .map(
                    (t) => `
                    <button class="quick-reply-chip" data-id="${t.id}">
                        <span>${t.emoji}</span>
                        <span>${t.text.substring(0, 25)}${t.text.length > 25 ? "..." : ""}</span>
                    </button>
                `,
                  )
                  .join("")}
                <button class="quick-reply-more" id="show-all-replies">+${this.templates.length - 5} more</button>
            `;
    }

    renderPanel() {
      return `
                <div class="quick-panel-header">
                    <div class="quick-panel-title">
                        <span>⚡</span>
                        <span>Quick Replies</span>
                    </div>
                    <input type="text" class="quick-panel-search" placeholder="Search replies..." id="quick-search">
                    <button class="quick-panel-close">×</button>
                </div>

                <div class="quick-categories">
                    <button class="quick-category active" data-category="all">All</button>
                    <button class="quick-category" data-category="acknowledge">👍 Acknowledge</button>
                    <button class="quick-category" data-category="request">🔍 Request</button>
                    <button class="quick-category" data-category="code">💻 Code</button>
                    <button class="quick-category" data-category="clarify">❓ Clarify</button>
                    <button class="quick-category" data-category="followup">➡️ Follow-up</button>
                </div>

                <div class="quick-templates" id="quick-templates">
                    ${this.renderTemplates()}
                </div>

                <div class="quick-create">
                    <button class="quick-create-btn" id="create-reply">
                        <span>+</span> Create Custom Reply
                    </button>
                </div>
            `;
    }

    renderTemplates(category = "all", search = "") {
      let filtered = this.templates;

      if (category !== "all") {
        filtered = filtered.filter((t) => t.category === category);
      }

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.text.toLowerCase().includes(q) ||
            t.shortcut.toLowerCase().includes(q),
        );
      }

      if (filtered.length === 0) {
        return '<div style="text-align:center;padding:20px;color:var(--bael-text-muted)">No matching replies</div>';
      }

      return filtered
        .map(
          (t) => `
                <div class="quick-template" data-id="${t.id}">
                    <span class="quick-template-emoji">${t.emoji}</span>
                    <div class="quick-template-content">
                        <div class="quick-template-text">${this.escapeHtml(t.text)}</div>
                        <div class="quick-template-shortcut">Type <kbd>/${t.shortcut}</kbd> in chat</div>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    bindPanelEvents() {
      // Close panel
      this.panel
        .querySelector(".quick-panel-close")
        .addEventListener("click", () => this.closePanel());

      // Categories
      this.panel.querySelectorAll(".quick-category").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".quick-category")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.refreshTemplates(btn.dataset.category);
        });
      });

      // Search
      this.panel
        .querySelector("#quick-search")
        .addEventListener("input", (e) => {
          const activeCategory = this.panel.querySelector(
            ".quick-category.active",
          ).dataset.category;
          this.refreshTemplates(activeCategory, e.target.value);
        });

      // Template clicks
      this.panel
        .querySelector("#quick-templates")
        .addEventListener("click", (e) => {
          const template = e.target.closest(".quick-template");
          if (template) {
            this.useTemplate(parseInt(template.dataset.id));
          }
        });

      // Create new
      this.panel
        .querySelector("#create-reply")
        .addEventListener("click", () => {
          this.showCreateForm();
        });

      // Bar clicks
      this.bar.addEventListener("click", (e) => {
        const chip = e.target.closest(".quick-reply-chip");
        const more = e.target.closest(".quick-reply-more");

        if (chip) {
          this.useTemplate(parseInt(chip.dataset.id));
        } else if (more) {
          this.togglePanel();
        }
      });
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "Q") {
          e.preventDefault();
          this.togglePanel();
        }
      });

      // Watch for assistant messages to show bar
      this.observeMessages();
    }

    observeMessages() {
      const observer = new MutationObserver(() => {
        // Check if there's a recent assistant message
        const messages = document.querySelectorAll(
          '.message, [class*="message"]',
        );
        const lastMessage = messages[messages.length - 1];

        if (lastMessage && lastMessage.classList.contains("assistant")) {
          this.showBar();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    useTemplate(id) {
      const template = this.templates.find((t) => t.id === id);
      if (!template) return;

      // Find input and insert text
      const input = document.querySelector('textarea, input[type="text"]');
      if (input) {
        input.value = template.text;
        input.focus();
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      this.closePanel();
      this.hideBar();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Quick reply inserted!");
      }
    }

    showCreateForm() {
      const templates = this.panel.querySelector("#quick-templates");
      templates.innerHTML = `
                <div class="quick-form" style="grid-column: 1/-1;">
                    <div class="quick-form-group">
                        <label class="quick-form-label">Reply Text</label>
                        <input type="text" class="quick-form-input" id="new-reply-text" placeholder="Enter your quick reply...">
                    </div>
                    <div class="quick-form-group">
                        <label class="quick-form-label">Shortcut</label>
                        <input type="text" class="quick-form-input" id="new-reply-shortcut" placeholder="e.g., ty (for /ty)">
                    </div>
                    <div class="quick-form-group">
                        <label class="quick-form-label">Emoji</label>
                        <input type="text" class="quick-form-input" id="new-reply-emoji" placeholder="e.g., 👍" maxlength="2">
                    </div>
                    <div class="quick-form-actions">
                        <button class="quick-form-btn cancel" id="cancel-create">Cancel</button>
                        <button class="quick-form-btn save" id="save-create">Save Reply</button>
                    </div>
                </div>
            `;

      templates
        .querySelector("#cancel-create")
        .addEventListener("click", () => {
          this.refreshTemplates();
        });

      templates.querySelector("#save-create").addEventListener("click", () => {
        const text = templates.querySelector("#new-reply-text").value;
        const shortcut = templates.querySelector("#new-reply-shortcut").value;
        const emoji = templates.querySelector("#new-reply-emoji").value || "💬";

        if (text && shortcut) {
          this.addTemplate(text, shortcut, emoji);
          this.refreshTemplates();
        }
      });
    }

    addTemplate(text, shortcut, emoji, category = "custom") {
      const newId = Math.max(...this.templates.map((t) => t.id), 0) + 1;
      this.templates.push({
        id: newId,
        category,
        emoji,
        text,
        shortcut,
      });
      this.saveTemplates();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Quick reply created!");
      }
    }

    refreshTemplates(category = "all", search = "") {
      this.panel.querySelector("#quick-templates").innerHTML =
        this.renderTemplates(category, search);
    }

    showBar() {
      this.bar.classList.add("visible");
    }

    hideBar() {
      this.bar.classList.remove("visible");
    }

    togglePanel() {
      if (this.panel.classList.contains("visible")) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    openPanel() {
      this.panel.classList.add("visible");
      this.hideBar();
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelQuickReply = new BaelQuickReply();
})();
