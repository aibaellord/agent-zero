/**
 * Bael Smart Prompt - AI-powered prompt enhancement & templates
 * Keyboard: Ctrl+Shift+T for templates, Ctrl+Enter to enhance
 */
(function () {
  "use strict";

  class BaelSmartPrompt {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-smart-prompt";
      this.templates = [];
      this.history = [];
      this.defaultTemplates = [
        {
          id: "code-review",
          name: "Code Review",
          icon: "🔍",
          category: "Development",
          template:
            "Please review the following code for:\n- Bugs and errors\n- Performance issues\n- Security vulnerabilities\n- Code style and best practices\n\n```\n{{code}}\n```",
        },
        {
          id: "explain-code",
          name: "Explain Code",
          icon: "📖",
          category: "Development",
          template:
            "Please explain the following code in detail:\n- What it does step by step\n- Key concepts used\n- Potential improvements\n\n```\n{{code}}\n```",
        },
        {
          id: "write-tests",
          name: "Write Tests",
          icon: "🧪",
          category: "Development",
          template:
            "Please write comprehensive unit tests for:\n\n```\n{{code}}\n```\n\nInclude edge cases and error scenarios.",
        },
        {
          id: "debug-help",
          name: "Debug Help",
          icon: "🐛",
          category: "Development",
          template:
            "I'm getting this error:\n\n```\n{{error}}\n```\n\nIn this code:\n\n```\n{{code}}\n```\n\nPlease help me debug and fix it.",
        },
        {
          id: "refactor",
          name: "Refactor Code",
          icon: "♻️",
          category: "Development",
          template:
            "Please refactor this code to be more:\n- Clean and readable\n- Efficient\n- Maintainable\n\n```\n{{code}}\n```",
        },
        {
          id: "summarize",
          name: "Summarize",
          icon: "📝",
          category: "Writing",
          template:
            "Please summarize the following text:\n\n{{text}}\n\nProvide a concise summary with key points.",
        },
        {
          id: "expand",
          name: "Expand Text",
          icon: "📈",
          category: "Writing",
          template:
            "Please expand on this text with more detail and examples:\n\n{{text}}",
        },
        {
          id: "proofread",
          name: "Proofread",
          icon: "✏️",
          category: "Writing",
          template:
            "Please proofread and improve this text:\n\n{{text}}\n\nFix grammar, spelling, and improve clarity.",
        },
        {
          id: "translate",
          name: "Translate",
          icon: "🌐",
          category: "Writing",
          template:
            "Please translate the following to {{language}}:\n\n{{text}}",
        },
        {
          id: "step-by-step",
          name: "Step by Step",
          icon: "📋",
          category: "General",
          template:
            "Please explain step by step how to:\n\n{{task}}\n\nProvide clear, numbered instructions.",
        },
        {
          id: "pros-cons",
          name: "Pros & Cons",
          icon: "⚖️",
          category: "General",
          template:
            "Please analyze the pros and cons of:\n\n{{topic}}\n\nProvide a balanced analysis.",
        },
        {
          id: "compare",
          name: "Compare",
          icon: "🔄",
          category: "General",
          template:
            "Please compare and contrast:\n\n{{item1}}\n\nvs\n\n{{item2}}\n\nHighlight key differences and similarities.",
        },
      ];
    }

    async initialize() {
      this.loadFromStorage();
      if (this.templates.length === 0) {
        this.templates = [...this.defaultTemplates];
      }
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.setupInputEnhancements();
      this.initialized = true;
      console.log("✨ Bael Smart Prompt initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-smart-prompt-styles")) return;

      const css = `
                .bael-prompt-fab {
                    position: fixed;
                    bottom: 300px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-prompt-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
                }

                .bael-prompt-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 750px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 10001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }

                .bael-prompt-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-prompt-header {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    padding: 18px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-prompt-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-prompt-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    transition: background 0.2s;
                }

                .bael-prompt-close:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-prompt-tabs {
                    display: flex;
                    background: rgba(0,0,0,0.2);
                    padding: 8px;
                    gap: 8px;
                }

                .bael-prompt-tab {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    background: transparent;
                    color: #888;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .bael-prompt-tab.active {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }

                .bael-prompt-tab:hover:not(.active) {
                    background: rgba(255,255,255,0.05);
                    color: #ccc;
                }

                .bael-prompt-body {
                    padding: 20px;
                    max-height: calc(85vh - 140px);
                    overflow-y: auto;
                }

                .bael-prompt-search {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    background: rgba(0,0,0,0.2);
                    color: white;
                    font-size: 14px;
                    margin-bottom: 16px;
                }

                .bael-prompt-search::placeholder {
                    color: #666;
                }

                .bael-prompt-categories {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }

                .bael-prompt-cat {
                    padding: 6px 14px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: transparent;
                    color: #888;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-prompt-cat.active {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: rgba(245, 158, 11, 0.4);
                    color: #f59e0b;
                }

                .bael-prompt-cat:hover:not(.active) {
                    border-color: rgba(255,255,255,0.2);
                    color: #ccc;
                }

                .bael-prompt-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .bael-template-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-template-card:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(245, 158, 11, 0.3);
                    transform: translateY(-2px);
                }

                .bael-template-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .bael-template-icon {
                    font-size: 24px;
                }

                .bael-template-name {
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                }

                .bael-template-cat {
                    font-size: 11px;
                    color: #666;
                    background: rgba(255,255,255,0.05);
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: auto;
                }

                .bael-template-preview {
                    color: #888;
                    font-size: 12px;
                    line-height: 1.4;
                    max-height: 40px;
                    overflow: hidden;
                }

                .bael-prompt-view-create {
                    display: none;
                }

                .bael-prompt-view-create.active {
                    display: block;
                }

                .bael-create-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .bael-form-row {
                    display: flex;
                    gap: 12px;
                }

                .bael-form-group {
                    flex: 1;
                }

                .bael-form-label {
                    display: block;
                    color: #888;
                    font-size: 12px;
                    margin-bottom: 6px;
                }

                .bael-form-input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    background: rgba(0,0,0,0.2);
                    color: white;
                    font-size: 13px;
                }

                .bael-form-textarea {
                    width: 100%;
                    min-height: 150px;
                    padding: 12px 14px;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    background: rgba(0,0,0,0.2);
                    color: white;
                    font-size: 13px;
                    font-family: monospace;
                    resize: vertical;
                }

                .bael-form-hint {
                    color: #666;
                    font-size: 11px;
                    margin-top: 4px;
                }

                .bael-prompt-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }

                .bael-prompt-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 10px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-prompt-btn.primary {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                }

                .bael-prompt-btn.secondary {
                    background: rgba(255,255,255,0.1);
                    color: #ccc;
                }

                .bael-prompt-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .bael-prompt-view-history {
                    display: none;
                }

                .bael-prompt-view-history.active {
                    display: block;
                }

                .bael-history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-history-item {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-history-item:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(245, 158, 11, 0.3);
                }

                .bael-history-text {
                    color: #ccc;
                    font-size: 13px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-history-time {
                    color: #666;
                    font-size: 11px;
                    margin-top: 4px;
                }

                .bael-enhance-indicator {
                    position: fixed;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                    z-index: 10000;
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                }

                .bael-enhance-indicator.visible {
                    opacity: 1;
                    visibility: visible;
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-smart-prompt-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB Button
      this.fab = document.createElement("button");
      this.fab.className = "bael-prompt-fab";
      this.fab.innerHTML = "✨";
      this.fab.title = "Smart Prompts (Ctrl+Shift+T)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-prompt-panel";
      this.panel.innerHTML = `
                <div class="bael-prompt-header">
                    <div class="bael-prompt-title">
                        <span>✨</span>
                        <span>Smart Prompts</span>
                    </div>
                    <button class="bael-prompt-close">×</button>
                </div>
                <div class="bael-prompt-tabs">
                    <button class="bael-prompt-tab active" data-view="templates">📋 Templates</button>
                    <button class="bael-prompt-tab" data-view="create">➕ Create</button>
                    <button class="bael-prompt-tab" data-view="history">🕐 History</button>
                </div>
                <div class="bael-prompt-body">
                    <div class="bael-prompt-view-templates active">
                        <input type="text" class="bael-prompt-search" placeholder="Search templates...">
                        <div class="bael-prompt-categories">
                            <button class="bael-prompt-cat active" data-cat="all">All</button>
                            <button class="bael-prompt-cat" data-cat="Development">Development</button>
                            <button class="bael-prompt-cat" data-cat="Writing">Writing</button>
                            <button class="bael-prompt-cat" data-cat="General">General</button>
                            <button class="bael-prompt-cat" data-cat="Custom">Custom</button>
                        </div>
                        <div class="bael-prompt-grid" id="bael-templates-grid"></div>
                    </div>

                    <div class="bael-prompt-view-create">
                        <div class="bael-create-form">
                            <div class="bael-form-row">
                                <div class="bael-form-group">
                                    <label class="bael-form-label">Template Name</label>
                                    <input type="text" class="bael-form-input" id="bael-create-name" placeholder="My Template">
                                </div>
                                <div class="bael-form-group" style="flex: 0.4">
                                    <label class="bael-form-label">Icon</label>
                                    <input type="text" class="bael-form-input" id="bael-create-icon" placeholder="🎯" maxlength="2">
                                </div>
                            </div>
                            <div class="bael-form-group">
                                <label class="bael-form-label">Category</label>
                                <select class="bael-form-input" id="bael-create-category">
                                    <option value="Custom">Custom</option>
                                    <option value="Development">Development</option>
                                    <option value="Writing">Writing</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div class="bael-form-group">
                                <label class="bael-form-label">Template Content</label>
                                <textarea class="bael-form-textarea" id="bael-create-template" placeholder="Write your template here...&#10;Use {{variable}} for placeholders"></textarea>
                                <div class="bael-form-hint">Use {{variableName}} for user inputs. Example: {{code}}, {{text}}</div>
                            </div>
                            <div class="bael-prompt-actions">
                                <button class="bael-prompt-btn secondary" id="bael-create-clear">Clear</button>
                                <button class="bael-prompt-btn primary" id="bael-create-save">💾 Save Template</button>
                            </div>
                        </div>
                    </div>

                    <div class="bael-prompt-view-history">
                        <div class="bael-history-list" id="bael-history-list">
                            <div style="color: #666; text-align: center; padding: 40px;">No prompt history yet</div>
                        </div>
                        <div class="bael-prompt-actions" style="margin-top: 20px;">
                            <button class="bael-prompt-btn secondary" id="bael-clear-history">🗑️ Clear History</button>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Enhance indicator
      this.indicator = document.createElement("div");
      this.indicator.className = "bael-enhance-indicator";
      this.indicator.textContent = "Press Ctrl+Enter to enhance prompt";
      document.body.appendChild(this.indicator);

      // Event listeners
      this.panel
        .querySelector(".bael-prompt-close")
        .addEventListener("click", () => this.hide());

      // Tabs
      this.panel.querySelectorAll(".bael-prompt-tab").forEach((tab) => {
        tab.addEventListener("click", () => this.switchView(tab.dataset.view));
      });

      // Categories
      this.panel.querySelectorAll(".bael-prompt-cat").forEach((cat) => {
        cat.addEventListener("click", () =>
          this.filterCategory(cat.dataset.cat),
        );
      });

      // Search
      this.panel
        .querySelector(".bael-prompt-search")
        .addEventListener("input", (e) => {
          this.filterTemplates(e.target.value);
        });

      // Create form
      this.panel
        .querySelector("#bael-create-save")
        .addEventListener("click", () => this.saveTemplate());
      this.panel
        .querySelector("#bael-create-clear")
        .addEventListener("click", () => this.clearCreateForm());
      this.panel
        .querySelector("#bael-clear-history")
        .addEventListener("click", () => this.clearHistory());

      this.renderTemplates();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "T") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    setupInputEnhancements() {
      // Find chat input
      const findInput = () => {
        return document.querySelector(
          '#chat-input, textarea[class*="chat"], [contenteditable="true"]',
        );
      };

      // Show enhancement hint on focus
      document.addEventListener("focusin", (e) => {
        const input = findInput();
        if (e.target === input) {
          setTimeout(() => {
            this.indicator.classList.add("visible");
          }, 1000);
        }
      });

      document.addEventListener("focusout", (e) => {
        const input = findInput();
        if (e.target === input) {
          this.indicator.classList.remove("visible");
        }
      });

      // Ctrl+Enter to enhance
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "Enter") {
          const input = findInput();
          if (document.activeElement === input) {
            e.preventDefault();
            this.enhanceCurrentPrompt(input);
          }
        }
      });
    }

    switchView(view) {
      this.panel.querySelectorAll(".bael-prompt-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.view === view);
      });

      this.panel
        .querySelector(".bael-prompt-view-templates")
        .classList.toggle("active", view === "templates");
      this.panel
        .querySelector(".bael-prompt-view-create")
        .classList.toggle("active", view === "create");
      this.panel
        .querySelector(".bael-prompt-view-history")
        .classList.toggle("active", view === "history");

      if (view === "history") {
        this.renderHistory();
      }
    }

    filterCategory(category) {
      this.panel.querySelectorAll(".bael-prompt-cat").forEach((cat) => {
        cat.classList.toggle("active", cat.dataset.cat === category);
      });
      this.renderTemplates(category === "all" ? null : category);
    }

    filterTemplates(query) {
      const templates = this.templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.template.toLowerCase().includes(query.toLowerCase()),
      );
      this.renderTemplateList(templates);
    }

    renderTemplates(category = null) {
      let templates = this.templates;
      if (category) {
        templates = templates.filter((t) => t.category === category);
      }
      this.renderTemplateList(templates);
    }

    renderTemplateList(templates) {
      const grid = this.panel.querySelector("#bael-templates-grid");

      if (templates.length === 0) {
        grid.innerHTML =
          '<div style="grid-column: 1/-1; color: #666; text-align: center; padding: 40px;">No templates found</div>';
        return;
      }

      grid.innerHTML = templates
        .map(
          (t) => `
                <div class="bael-template-card" data-id="${t.id}">
                    <div class="bael-template-header">
                        <span class="bael-template-icon">${t.icon}</span>
                        <span class="bael-template-name">${t.name}</span>
                        <span class="bael-template-cat">${t.category}</span>
                    </div>
                    <div class="bael-template-preview">${t.template.substring(0, 80)}...</div>
                </div>
            `,
        )
        .join("");

      grid.querySelectorAll(".bael-template-card").forEach((card) => {
        card.addEventListener("click", () => this.useTemplate(card.dataset.id));
      });
    }

    useTemplate(id) {
      const template = this.templates.find((t) => t.id === id);
      if (!template) return;

      // Find variables in template
      const variables = [...template.template.matchAll(/\{\{(\w+)\}\}/g)].map(
        (m) => m[1],
      );

      if (variables.length > 0) {
        // Prompt for variable values
        let result = template.template;
        for (const variable of variables) {
          const value = prompt(`Enter value for {{${variable}}}:`, "");
          if (value === null) return; // Cancelled
          result = result.replace(
            new RegExp(`\\{\\{${variable}\\}\\}`, "g"),
            value,
          );
        }
        this.insertPrompt(result);
      } else {
        this.insertPrompt(template.template);
      }

      this.hide();
    }

    insertPrompt(text) {
      const input = document.querySelector(
        '#chat-input, textarea[class*="chat"], [contenteditable="true"]',
      );
      if (!input) return;

      if (input.value !== undefined) {
        input.value = text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        input.textContent = text;
      }

      input.focus();

      // Add to history
      this.addToHistory(text);
    }

    enhanceCurrentPrompt(input) {
      const text = input.value || input.textContent || "";
      if (!text.trim()) return;

      // Simple enhancement rules
      let enhanced = text;

      // Add clarity
      if (!enhanced.includes("please") && !enhanced.includes("Please")) {
        enhanced =
          "Please " + enhanced.charAt(0).toLowerCase() + enhanced.slice(1);
      }

      // Add specificity request
      if (!enhanced.includes("detail") && !enhanced.includes("specific")) {
        enhanced +=
          "\n\nPlease be specific and provide clear examples where applicable.";
      }

      // Insert enhanced text
      if (input.value !== undefined) {
        input.value = enhanced;
      } else {
        input.textContent = enhanced;
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
      this.addToHistory(enhanced);
    }

    saveTemplate() {
      const name = this.panel.querySelector("#bael-create-name").value.trim();
      const icon =
        this.panel.querySelector("#bael-create-icon").value.trim() || "📝";
      const category = this.panel.querySelector("#bael-create-category").value;
      const template = this.panel
        .querySelector("#bael-create-template")
        .value.trim();

      if (!name || !template) {
        alert("Please fill in name and template content");
        return;
      }

      const newTemplate = {
        id: "custom-" + Date.now(),
        name,
        icon,
        category,
        template,
      };

      this.templates.push(newTemplate);
      this.saveToStorage();
      this.clearCreateForm();
      this.switchView("templates");
      this.renderTemplates();
    }

    clearCreateForm() {
      this.panel.querySelector("#bael-create-name").value = "";
      this.panel.querySelector("#bael-create-icon").value = "";
      this.panel.querySelector("#bael-create-template").value = "";
    }

    addToHistory(text) {
      this.history.unshift({
        text,
        timestamp: Date.now(),
      });

      // Keep last 50
      if (this.history.length > 50) {
        this.history.pop();
      }

      this.saveToStorage();
    }

    renderHistory() {
      const list = this.panel.querySelector("#bael-history-list");

      if (this.history.length === 0) {
        list.innerHTML =
          '<div style="color: #666; text-align: center; padding: 40px;">No prompt history yet</div>';
        return;
      }

      list.innerHTML = this.history
        .map(
          (item, i) => `
                <div class="bael-history-item" data-index="${i}">
                    <div class="bael-history-text">${item.text.substring(0, 100)}...</div>
                    <div class="bael-history-time">${new Date(item.timestamp).toLocaleString()}</div>
                </div>
            `,
        )
        .join("");

      list.querySelectorAll(".bael-history-item").forEach((item) => {
        item.addEventListener("click", () => {
          const index = parseInt(item.dataset.index);
          this.insertPrompt(this.history[index].text);
          this.hide();
        });
      });
    }

    clearHistory() {
      if (confirm("Clear all prompt history?")) {
        this.history = [];
        this.saveToStorage();
        this.renderHistory();
      }
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.renderTemplates();
      this.panel.classList.add("visible");
      this.visible = true;
      this.panel.querySelector(".bael-prompt-search").focus();
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.templates = data.templates || [];
          this.history = data.history || [];
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            templates: this.templates,
            history: this.history,
          }),
        );
      } catch (e) {}
    }
  }

  window.BaelSmartPrompt = new BaelSmartPrompt();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSmartPrompt.initialize();
    });
  } else {
    window.BaelSmartPrompt.initialize();
  }
})();
