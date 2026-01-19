/**
 * BAEL - LORD OF ALL
 * Quick Templates - Pre-built conversation starters and templates
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelTemplates {
    constructor() {
      this.container = null;
      this.isVisible = false;
      this.templates = [];
      this.customTemplates = [];
      this.categories = [];
      this.init();
    }

    init() {
      this.loadCustomTemplates();
      this.registerDefaultTemplates();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      console.log("📋 Bael Templates initialized");
    }

    loadCustomTemplates() {
      try {
        this.customTemplates = JSON.parse(
          localStorage.getItem("bael_templates") || "[]",
        );
      } catch (e) {
        this.customTemplates = [];
      }
    }

    saveCustomTemplates() {
      localStorage.setItem(
        "bael_templates",
        JSON.stringify(this.customTemplates),
      );
    }

    registerDefaultTemplates() {
      this.templates = [
        // Coding
        {
          id: "code-review",
          category: "coding",
          icon: "🔍",
          name: "Code Review",
          description: "Get feedback on your code",
          template:
            "Please review the following code for bugs, performance issues, and best practices:\n\n```{{language}}\n{{code}}\n```",
        },
        {
          id: "debug-help",
          category: "coding",
          icon: "🐛",
          name: "Debug Help",
          description: "Get help fixing a bug",
          template:
            "I'm encountering this error:\n\n```\n{{error}}\n```\n\nHere's my code:\n\n```{{language}}\n{{code}}\n```\n\nPlease help me understand and fix this issue.",
        },
        {
          id: "convert-code",
          category: "coding",
          icon: "🔄",
          name: "Convert Code",
          description: "Convert code between languages",
          template:
            "Please convert this {{from_language}} code to {{to_language}}:\n\n```{{from_language}}\n{{code}}\n```",
        },
        {
          id: "explain-code",
          category: "coding",
          icon: "📖",
          name: "Explain Code",
          description: "Get code explanation",
          template:
            "Please explain what this code does, step by step:\n\n```{{language}}\n{{code}}\n```",
        },
        {
          id: "write-tests",
          category: "coding",
          icon: "✅",
          name: "Write Tests",
          description: "Generate unit tests",
          template:
            "Please write comprehensive unit tests for this {{language}} code using {{test_framework}}:\n\n```{{language}}\n{{code}}\n```",
        },

        // Writing
        {
          id: "email-draft",
          category: "writing",
          icon: "📧",
          name: "Email Draft",
          description: "Draft a professional email",
          template:
            "Please draft a professional email with the following details:\n\nTo: {{recipient}}\nSubject: {{subject}}\nTone: {{tone}}\n\nKey points to cover:\n{{points}}",
        },
        {
          id: "blog-post",
          category: "writing",
          icon: "📝",
          name: "Blog Post",
          description: "Create a blog post outline",
          template:
            'Please create a blog post about "{{topic}}" with:\n\n- Target audience: {{audience}}\n- Tone: {{tone}}\n- Word count: approximately {{word_count}} words\n- Include: introduction, main points, conclusion, and call to action',
        },
        {
          id: "summarize",
          category: "writing",
          icon: "📋",
          name: "Summarize",
          description: "Summarize long content",
          template:
            "Please summarize the following text in {{length}} (short/medium/detailed):\n\n{{text}}",
        },

        // Analysis
        {
          id: "data-analysis",
          category: "analysis",
          icon: "📊",
          name: "Data Analysis",
          description: "Analyze data patterns",
          template:
            "Please analyze this data and provide insights:\n\n```\n{{data}}\n```\n\nFocus on: {{focus_areas}}",
        },
        {
          id: "compare",
          category: "analysis",
          icon: "⚖️",
          name: "Compare Options",
          description: "Compare multiple options",
          template:
            "Please compare the following options:\n\nOption 1: {{option1}}\nOption 2: {{option2}}\n{{#option3}}Option 3: {{option3}}{{/option3}}\n\nCriteria: {{criteria}}\n\nProvide a pros/cons analysis and recommendation.",
        },
        {
          id: "research",
          category: "analysis",
          icon: "🔬",
          name: "Research Topic",
          description: "Deep dive into a topic",
          template:
            'Please research and explain "{{topic}}" covering:\n\n1. Overview and definition\n2. Key concepts\n3. Current state/trends\n4. Pros and cons\n5. Future outlook\n\nTarget expertise level: {{level}}',
        },

        // Creative
        {
          id: "brainstorm",
          category: "creative",
          icon: "💡",
          name: "Brainstorm Ideas",
          description: "Generate creative ideas",
          template:
            "Please brainstorm {{count}} creative ideas for:\n\n{{topic}}\n\nConstraints: {{constraints}}\nTarget: {{target}}",
        },
        {
          id: "story-prompt",
          category: "creative",
          icon: "📚",
          name: "Story Prompt",
          description: "Create a story starter",
          template:
            "Please create a {{genre}} story with:\n\nSetting: {{setting}}\nMain character: {{character}}\nConflict: {{conflict}}\nTone: {{tone}}",
        },

        // Productivity
        {
          id: "meeting-notes",
          category: "productivity",
          icon: "📝",
          name: "Meeting Notes",
          description: "Organize meeting notes",
          template:
            "Please organize these meeting notes into a clear format with action items:\n\n{{notes}}",
        },
        {
          id: "task-breakdown",
          category: "productivity",
          icon: "📋",
          name: "Task Breakdown",
          description: "Break down a project",
          template:
            "Please break down this project into actionable tasks:\n\nProject: {{project}}\nDeadline: {{deadline}}\nResources: {{resources}}\n\nInclude time estimates and dependencies.",
        },

        // Learning
        {
          id: "explain-like-5",
          category: "learning",
          icon: "👶",
          name: "Explain Simply",
          description: "Simple explanation",
          template:
            'Please explain "{{concept}}" in simple terms, like I\'m 5 years old. Use analogies and examples.',
        },
        {
          id: "quiz-me",
          category: "learning",
          icon: "❓",
          name: "Quiz Me",
          description: "Generate quiz questions",
          template:
            'Please create {{count}} quiz questions about "{{topic}}" at {{difficulty}} level. Include answers.',
        },
      ];

      this.categories = [
        { id: "coding", name: "Coding", icon: "💻" },
        { id: "writing", name: "Writing", icon: "✍️" },
        { id: "analysis", name: "Analysis", icon: "📊" },
        { id: "creative", name: "Creative", icon: "🎨" },
        { id: "productivity", name: "Productivity", icon: "⚡" },
        { id: "learning", name: "Learning", icon: "📚" },
        { id: "custom", name: "Custom", icon: "⭐" },
      ];
    }

    getAllTemplates() {
      return [
        ...this.templates,
        ...this.customTemplates.map((t) => ({ ...t, category: "custom" })),
      ];
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-templates";
      container.className = "bael-templates";
      container.innerHTML = `
                <div class="templates-header">
                    <div class="templates-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="3" y1="9" x2="21" y2="9"/>
                            <line x1="9" y1="21" x2="9" y2="9"/>
                        </svg>
                        <span>Quick Templates</span>
                    </div>
                    <button class="templates-close" id="templates-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="templates-search">
                    <input type="text" id="templates-search" placeholder="Search templates...">
                </div>

                <div class="templates-categories" id="templates-categories">
                    <button class="tpl-cat active" data-cat="all">All</button>
                </div>

                <div class="templates-content" id="templates-content">
                    <!-- Templates list -->
                </div>

                <div class="template-preview" id="template-preview">
                    <div class="preview-header">
                        <span class="preview-title"></span>
                        <button class="preview-close">×</button>
                    </div>
                    <div class="preview-desc"></div>
                    <div class="preview-fields" id="preview-fields"></div>
                    <div class="preview-actions">
                        <button class="preview-btn secondary" id="preview-copy">Copy Template</button>
                        <button class="preview-btn primary" id="preview-use">Use Template</button>
                    </div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;

      this.createTrigger();
      this.renderCategories();
      this.renderTemplates();
    }

    createTrigger() {
      const trigger = document.createElement("button");
      trigger.id = "bael-templates-trigger";
      trigger.className = "bael-templates-trigger";
      trigger.title = "Quick Templates (Ctrl+T)";
      trigger.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
            `;
      document.body.appendChild(trigger);
      trigger.addEventListener("click", () => this.toggle());
    }

    addStyles() {
      if (document.getElementById("bael-templates-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-templates-styles";
      styles.textContent = `
                .bael-templates {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 700px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100024;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .bael-templates.visible {
                    display: flex;
                    animation: tplZoom 0.2s ease;
                }

                @keyframes tplZoom {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .templates-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .templates-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .templates-title svg {
                    width: 20px;
                    height: 20px;
                    color: var(--bael-accent, #ff3366);
                }

                .templates-close {
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
                }

                .templates-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .templates-close svg {
                    width: 18px;
                    height: 18px;
                }

                .templates-search {
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .templates-search input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    outline: none;
                }

                .templates-search input:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .templates-categories {
                    display: flex;
                    gap: 6px;
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    overflow-x: auto;
                }

                .tpl-cat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .tpl-cat:hover {
                    border-color: var(--bael-text-muted, #666);
                    color: var(--bael-text-primary, #fff);
                }

                .tpl-cat.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .templates-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    align-content: start;
                }

                .template-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .template-card:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: translateY(-2px);
                }

                .tpl-icon {
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 10px;
                    flex-shrink: 0;
                }

                .tpl-info {
                    flex: 1;
                    min-width: 0;
                }

                .tpl-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .tpl-desc {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    line-height: 1.4;
                }

                .templates-empty {
                    grid-column: span 2;
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-muted, #666);
                }

                /* Preview Panel */
                .template-preview {
                    position: absolute;
                    inset: 0;
                    background: var(--bael-bg-primary, #0a0a0f);
                    display: none;
                    flex-direction: column;
                }

                .template-preview.visible {
                    display: flex;
                }

                .preview-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .preview-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .preview-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    font-size: 20px;
                    cursor: pointer;
                    border-radius: 6px;
                }

                .preview-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .preview-desc {
                    padding: 12px 20px;
                    font-size: 13px;
                    color: var(--bael-text-muted, #666);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                #preview-fields {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .preview-field {
                    margin-bottom: 16px;
                }

                .preview-field label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-secondary, #aaa);
                    margin-bottom: 6px;
                    text-transform: capitalize;
                }

                .preview-field input,
                .preview-field textarea {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    font-family: inherit;
                    outline: none;
                }

                .preview-field input:focus,
                .preview-field textarea:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .preview-field textarea {
                    min-height: 100px;
                    resize: vertical;
                }

                .preview-actions {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .preview-btn {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .preview-btn.secondary {
                    background: var(--bael-bg-tertiary, #181820);
                    color: var(--bael-text-primary, #fff);
                }

                .preview-btn.secondary:hover {
                    background: var(--bael-border, #2a2a3a);
                }

                .preview-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .preview-btn.primary:hover {
                    background: #ff4477;
                }

                /* Trigger button */
                .bael-templates-trigger {
                    position: fixed;
                    bottom: 330px;
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
                    z-index: 9984;
                    transition: all 0.3s ease;
                }

                .bael-templates-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-templates-trigger svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-text-primary, #fff);
                }

                /* Backdrop */
                .bael-templates-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 100023;
                    display: none;
                }

                .bael-templates-backdrop.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);

      // Create backdrop
      const backdrop = document.createElement("div");
      backdrop.className = "bael-templates-backdrop";
      backdrop.addEventListener("click", () => this.close());
      document.body.appendChild(backdrop);
      this.backdrop = backdrop;
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#templates-close")
        .addEventListener("click", () => this.close());

      // Search
      this.container
        .querySelector("#templates-search")
        .addEventListener("input", (e) => {
          const activeCat =
            this.container.querySelector(".tpl-cat.active").dataset.cat;
          this.renderTemplates(activeCat, e.target.value);
        });

      // Preview close
      this.container
        .querySelector(".preview-close")
        .addEventListener("click", () => {
          this.container
            .querySelector("#template-preview")
            .classList.remove("visible");
        });

      // Preview actions
      this.container
        .querySelector("#preview-copy")
        .addEventListener("click", () => this.copyTemplate());
      this.container
        .querySelector("#preview-use")
        .addEventListener("click", () => this.useTemplate());

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && !e.shiftKey && e.key === "t") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          const preview = this.container.querySelector("#template-preview");
          if (preview.classList.contains("visible")) {
            preview.classList.remove("visible");
          } else {
            this.close();
          }
        }
      });
    }

    renderCategories() {
      const container = this.container.querySelector("#templates-categories");
      container.innerHTML = `
                <button class="tpl-cat active" data-cat="all">All</button>
                ${this.categories
                  .map(
                    (cat) => `
                    <button class="tpl-cat" data-cat="${cat.id}">
                        <span>${cat.icon}</span>
                        <span>${cat.name}</span>
                    </button>
                `,
                  )
                  .join("")}
            `;

      container.querySelectorAll(".tpl-cat").forEach((btn) => {
        btn.addEventListener("click", () => {
          container
            .querySelectorAll(".tpl-cat")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.renderTemplates(btn.dataset.cat);
        });
      });
    }

    renderTemplates(category = "all", search = "") {
      const content = this.container.querySelector("#templates-content");

      let templates = this.getAllTemplates();

      if (category !== "all") {
        templates = templates.filter((t) => t.category === category);
      }

      if (search) {
        const query = search.toLowerCase();
        templates = templates.filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query),
        );
      }

      if (templates.length === 0) {
        content.innerHTML = `
                    <div class="templates-empty">
                        <p>No templates found</p>
                    </div>
                `;
        return;
      }

      content.innerHTML = templates
        .map(
          (t) => `
                <div class="template-card" data-id="${t.id}">
                    <div class="tpl-icon">${t.icon}</div>
                    <div class="tpl-info">
                        <div class="tpl-name">${t.name}</div>
                        <div class="tpl-desc">${t.description}</div>
                    </div>
                </div>
            `,
        )
        .join("");

      content.querySelectorAll(".template-card").forEach((card) => {
        card.addEventListener("click", () => {
          const template = this.getAllTemplates().find(
            (t) => t.id === card.dataset.id,
          );
          if (template) this.showPreview(template);
        });
      });
    }

    showPreview(template) {
      this.currentTemplate = template;

      const preview = this.container.querySelector("#template-preview");
      preview.querySelector(".preview-title").textContent = template.name;
      preview.querySelector(".preview-desc").textContent = template.description;

      // Extract variables from template
      const variables = this.extractVariables(template.template);
      const fields = preview.querySelector("#preview-fields");

      if (variables.length === 0) {
        fields.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: var(--bael-text-muted);">
                        This template has no variables to fill in.
                    </div>
                `;
      } else {
        fields.innerHTML = variables
          .map(
            (v) => `
                    <div class="preview-field">
                        <label>${v.replace(/_/g, " ")}</label>
                        ${
                          v.includes("code") ||
                          v.includes("text") ||
                          v.includes("notes") ||
                          v.includes("points")
                            ? `<textarea data-var="${v}" placeholder="Enter ${v.replace(/_/g, " ")}..."></textarea>`
                            : `<input type="text" data-var="${v}" placeholder="Enter ${v.replace(/_/g, " ")}...">`
                        }
                    </div>
                `,
          )
          .join("");
      }

      preview.classList.add("visible");
    }

    extractVariables(template) {
      const regex = /\{\{([^}]+)\}\}/g;
      const variables = new Set();
      let match;
      while ((match = regex.exec(template)) !== null) {
        // Skip conditional syntax like #option3
        if (!match[1].startsWith("#") && !match[1].startsWith("/")) {
          variables.add(match[1]);
        }
      }
      return Array.from(variables);
    }

    getFilledTemplate() {
      if (!this.currentTemplate) return "";

      let template = this.currentTemplate.template;
      const fields = this.container.querySelectorAll(
        "#preview-fields [data-var]",
      );

      fields.forEach((field) => {
        const varName = field.dataset.var;
        const value = field.value || `[${varName}]`;
        template = template.replace(
          new RegExp(`\\{\\{${varName}\\}\\}`, "g"),
          value,
        );
      });

      // Remove unfilled conditional blocks
      template = template.replace(/\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g, "");

      return template;
    }

    copyTemplate() {
      const text = this.getFilledTemplate();
      navigator.clipboard.writeText(text);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Template copied to clipboard");
      }
    }

    useTemplate() {
      const text = this.getFilledTemplate();

      // Try to find chat input
      const chatInput = document.querySelector(
        '#msgInput, textarea[x-model="input"]',
      );
      if (chatInput) {
        chatInput.value = text;
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        chatInput.focus();
      }

      this.close();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Template applied");
      }
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.backdrop.classList.add("visible");
      this.container.querySelector("#templates-search").focus();
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
      this.backdrop.classList.remove("visible");
      this.container
        .querySelector("#template-preview")
        .classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }

    addTemplate(template) {
      this.customTemplates.push({
        id: "custom-" + Date.now(),
        ...template,
      });
      this.saveCustomTemplates();
      this.renderTemplates();
    }
  }

  // Initialize
  window.BaelTemplates = new BaelTemplates();
})();
