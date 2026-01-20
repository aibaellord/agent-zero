/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ████████╗███████╗███╗   ███╗██████╗ ██╗      █████╗ ████████╗███████╗   █
 * █  ╚══██╔══╝██╔════╝████╗ ████║██╔══██╗██║     ██╔══██╗╚══██╔══╝██╔════╝   █
 * █     ██║   █████╗  ██╔████╔██║██████╔╝██║     ███████║   ██║   █████╗     █
 * █     ██║   ██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██╔══██║   ██║   ██╔══╝     █
 * █     ██║   ███████╗██║ ╚═╝ ██║██║     ███████╗██║  ██║   ██║   ███████╗   █
 * █     ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝   █
 * █                                                                          █
 * █   BAEL TEMPLATE LIBRARY - Prompt Templates with Variables & Categories  █
 * █   Reusable prompt templates for maximum efficiency                      █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelTemplateLibrary {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // Template storage
      this.templates = [];
      this.favorites = [];
      this.usage = {};

      // State
      this.selectedCategory = "all";
      this.searchQuery = "";
      this.selectedTemplate = null;

      // Categories
      this.categories = {
        all: { icon: "📚", label: "All Templates" },
        coding: { icon: "💻", label: "Coding" },
        writing: { icon: "✍️", label: "Writing" },
        analysis: { icon: "📊", label: "Analysis" },
        creative: { icon: "🎨", label: "Creative" },
        business: { icon: "💼", label: "Business" },
        research: { icon: "🔬", label: "Research" },
        automation: { icon: "🤖", label: "Automation" },
        custom: { icon: "⭐", label: "Custom" },
      };
    }

    async initialize() {
      console.log("📋 Bael Template Library initializing...");

      this.injectStyles();
      this.createContainer();
      this.loadDefaultTemplates();
      this.loadUserData();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL TEMPLATE LIBRARY READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-template-library-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-template-library-styles";
      styles.textContent = `
                .bael-template-library {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    align-items: center;
                    justify-content: center;
                }

                .bael-template-library.visible { display: flex; }

                .template-dialog {
                    width: 900px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    border: 1px solid #2a2a4a;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .template-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #2a2a4a;
                }

                .template-header h2 {
                    margin: 0;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .template-actions {
                    display: flex;
                    gap: 8px;
                }

                .tpl-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    background: #1a1a2e;
                    color: #e0e0e0;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .tpl-btn:hover { background: #252538; }
                .tpl-btn-primary { background: #6366f1; }
                .tpl-btn-primary:hover { background: #4f46e5; }
                .tpl-btn-close:hover { background: #ef4444; }

                .template-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .template-sidebar {
                    width: 200px;
                    border-right: 1px solid #2a2a4a;
                    padding: 12px;
                    overflow-y: auto;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    margin-bottom: 4px;
                }

                .category-item:hover { background: #1a1a2e; }
                .category-item.active { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }

                .category-icon { font-size: 16px; }
                .category-label { font-size: 13px; }

                .category-count {
                    margin-left: auto;
                    padding: 2px 8px;
                    background: #2a2a4a;
                    border-radius: 10px;
                    font-size: 11px;
                }

                .template-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .template-search {
                    padding: 12px 16px;
                    border-bottom: 1px solid #2a2a4a;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 16px;
                    padding-left: 40px;
                    border: 1px solid #2a2a4a;
                    border-radius: 8px;
                    background: #0a0a0f;
                    color: #e0e0e0;
                    font-size: 14px;
                }

                .search-input::placeholder { color: #666; }

                .search-wrapper {
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0.5;
                }

                .template-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 16px;
                }

                .template-card {
                    padding: 16px;
                    background: #1a1a2e;
                    border-radius: 10px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.15s;
                }

                .template-card:hover { border-color: #3a3a5a; }
                .template-card.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.1); }

                .template-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .template-name {
                    font-weight: 600;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .template-favorite {
                    cursor: pointer;
                    font-size: 16px;
                    opacity: 0.3;
                    transition: all 0.15s;
                }

                .template-favorite.active,
                .template-favorite:hover { opacity: 1; }

                .template-desc {
                    font-size: 13px;
                    color: #888;
                    margin-bottom: 10px;
                    line-height: 1.4;
                }

                .template-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 11px;
                }

                .template-tag {
                    padding: 3px 8px;
                    background: rgba(99, 102, 241, 0.15);
                    color: #a5b4fc;
                    border-radius: 4px;
                }

                .template-usage {
                    color: #666;
                }

                .template-detail {
                    width: 350px;
                    border-left: 1px solid #2a2a4a;
                    display: flex;
                    flex-direction: column;
                }

                .detail-header {
                    padding: 16px;
                    border-bottom: 1px solid #2a2a4a;
                }

                .detail-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .detail-category {
                    font-size: 12px;
                    color: #888;
                }

                .detail-content {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }

                .detail-section {
                    margin-bottom: 20px;
                }

                .detail-section-title {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #666;
                    margin-bottom: 8px;
                }

                .template-preview {
                    background: #0a0a0f;
                    border-radius: 8px;
                    padding: 12px;
                    font-family: 'Monaco', 'Consolas', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                    color: #a5b4fc;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .template-variable {
                    background: rgba(234, 179, 8, 0.2);
                    color: #fbbf24;
                    padding: 1px 4px;
                    border-radius: 3px;
                }

                .variable-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .variable-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .variable-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: #fbbf24;
                }

                .variable-input {
                    padding: 8px 12px;
                    border: 1px solid #2a2a4a;
                    border-radius: 6px;
                    background: #0a0a0f;
                    color: #e0e0e0;
                    font-size: 13px;
                }

                .detail-actions {
                    padding: 16px;
                    border-top: 1px solid #2a2a4a;
                    display: flex;
                    gap: 8px;
                }

                .detail-actions .tpl-btn { flex: 1; justify-content: center; }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: #666;
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-template-library";
      this.container.className = "bael-template-library";

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);

      this.bindEvents();
    }

    getTemplate() {
      return `
                <div class="template-dialog">
                    <div class="template-header">
                        <h2>📋 Template Library</h2>
                        <div class="template-actions">
                            <button class="tpl-btn" id="tpl-new">➕ New Template</button>
                            <button class="tpl-btn" id="tpl-import">📥 Import</button>
                            <button class="tpl-btn" id="tpl-export">📤 Export</button>
                            <button class="tpl-btn tpl-btn-close" id="tpl-close">✕</button>
                        </div>
                    </div>

                    <div class="template-body">
                        <div class="template-sidebar" id="category-list">
                            <!-- Dynamic categories -->
                        </div>

                        <div class="template-main">
                            <div class="template-search">
                                <div class="search-wrapper">
                                    <span class="search-icon">🔍</span>
                                    <input type="text"
                                           class="search-input"
                                           id="template-search"
                                           placeholder="Search templates...">
                                </div>
                            </div>
                            <div class="template-list" id="template-list">
                                <!-- Dynamic templates -->
                            </div>
                        </div>

                        <div class="template-detail" id="template-detail">
                            <div class="empty-state">
                                <span class="empty-icon">📋</span>
                                <span>Select a template to view details</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#tpl-close")
        .addEventListener("click", () => this.hide());
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) this.hide();
      });

      // Actions
      this.container
        .querySelector("#tpl-new")
        .addEventListener("click", () => this.createTemplate());
      this.container
        .querySelector("#tpl-import")
        .addEventListener("click", () => this.importTemplates());
      this.container
        .querySelector("#tpl-export")
        .addEventListener("click", () => this.exportTemplates());

      // Search
      this.container
        .querySelector("#template-search")
        .addEventListener("input", (e) => {
          this.searchQuery = e.target.value;
          this.renderTemplates();
        });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
          e.preventDefault();
          this.toggle();
        }

        if (this.visible && e.key === "Escape") {
          this.hide();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DEFAULT TEMPLATES
    // ═══════════════════════════════════════════════════════════════════════

    loadDefaultTemplates() {
      this.templates = [
        // Coding
        {
          id: "code-review",
          name: "Code Review",
          description:
            "Analyze code for bugs, security issues, and improvements",
          category: "coding",
          prompt: `Please review the following code and provide:
1. Potential bugs or issues
2. Security vulnerabilities
3. Performance improvements
4. Code style suggestions
5. Best practice recommendations

Code:
{{code}}

Language: {{language}}`,
          variables: ["code", "language"],
          tags: ["review", "quality"],
        },
        {
          id: "refactor",
          name: "Refactor Code",
          description: "Refactor code for better readability and performance",
          category: "coding",
          prompt: `Refactor the following {{language}} code to:
- Improve readability
- Follow best practices
- Optimize performance
- Add proper error handling

{{code}}`,
          variables: ["code", "language"],
          tags: ["refactor", "optimize"],
        },
        {
          id: "explain-code",
          name: "Explain Code",
          description: "Get a detailed explanation of how code works",
          category: "coding",
          prompt: `Please explain the following code in detail:

\`\`\`{{language}}
{{code}}
\`\`\`

Explain:
1. What the code does overall
2. How each part works
3. Any algorithms or patterns used
4. Potential edge cases`,
          variables: ["code", "language"],
          tags: ["explain", "learn"],
        },

        // Writing
        {
          id: "blog-post",
          name: "Blog Post",
          description: "Generate a structured blog post outline",
          category: "writing",
          prompt: `Write a blog post about "{{topic}}"

Target audience: {{audience}}
Tone: {{tone}}
Length: {{length}} words

Include:
- Engaging introduction
- Clear sections with headers
- Practical examples
- Call to action`,
          variables: ["topic", "audience", "tone", "length"],
          tags: ["blog", "content"],
        },
        {
          id: "email-draft",
          name: "Professional Email",
          description: "Draft a professional email",
          category: "writing",
          prompt: `Draft a professional email:

To: {{recipient}}
Subject: {{subject}}
Purpose: {{purpose}}
Tone: {{tone}}

Key points to include:
{{key_points}}`,
          variables: ["recipient", "subject", "purpose", "tone", "key_points"],
          tags: ["email", "professional"],
        },

        // Analysis
        {
          id: "data-analysis",
          name: "Data Analysis",
          description: "Analyze data and provide insights",
          category: "analysis",
          prompt: `Analyze the following data and provide:
1. Key patterns and trends
2. Statistical insights
3. Anomalies or outliers
4. Actionable recommendations

Data:
{{data}}

Focus area: {{focus}}`,
          variables: ["data", "focus"],
          tags: ["data", "insights"],
        },
        {
          id: "competitive-analysis",
          name: "Competitive Analysis",
          description: "Analyze competitors in a market",
          category: "analysis",
          prompt: `Perform a competitive analysis for {{company}} in the {{industry}} industry.

Competitors to analyze: {{competitors}}

Analyze:
1. Strengths and weaknesses
2. Market positioning
3. Product/service comparison
4. Pricing strategies
5. Opportunities and threats`,
          variables: ["company", "industry", "competitors"],
          tags: ["business", "competition"],
        },

        // Creative
        {
          id: "story-prompt",
          name: "Creative Story",
          description: "Generate a creative story based on prompts",
          category: "creative",
          prompt: `Write a {{genre}} story with the following elements:

Setting: {{setting}}
Main character: {{character}}
Theme: {{theme}}
Mood: {{mood}}
Length: {{length}}`,
          variables: [
            "genre",
            "setting",
            "character",
            "theme",
            "mood",
            "length",
          ],
          tags: ["story", "fiction"],
        },

        // Automation
        {
          id: "daily-summary",
          name: "Daily Summary",
          description: "Generate a daily summary prompt",
          category: "automation",
          prompt: `Please provide a daily summary for {{date}}:

1. Review completed tasks
2. Summarize key accomplishments
3. Identify pending items
4. List tomorrow's priorities
5. Any blockers or concerns`,
          variables: ["date"],
          tags: ["daily", "summary"],
        },
        {
          id: "research-brief",
          name: "Research Brief",
          description: "Create a research brief on any topic",
          category: "research",
          prompt: `Research and provide a comprehensive brief on: {{topic}}

Include:
1. Overview and background
2. Current state/trends
3. Key players/stakeholders
4. Challenges and opportunities
5. Future outlook
6. Sources and references

Depth: {{depth}}
Focus: {{focus_area}}`,
          variables: ["topic", "depth", "focus_area"],
          tags: ["research", "brief"],
        },
      ];
    }

    loadUserData() {
      try {
        // Load custom templates
        const custom = localStorage.getItem("bael-custom-templates");
        if (custom) {
          const parsed = JSON.parse(custom);
          this.templates.push(...parsed);
        }

        // Load favorites
        const favorites = localStorage.getItem("bael-template-favorites");
        if (favorites) {
          this.favorites = JSON.parse(favorites);
        }

        // Load usage stats
        const usage = localStorage.getItem("bael-template-usage");
        if (usage) {
          this.usage = JSON.parse(usage);
        }
      } catch (e) {
        console.warn("Failed to load template data:", e);
      }
    }

    saveUserData() {
      try {
        const custom = this.templates.filter((t) => t.category === "custom");
        localStorage.setItem("bael-custom-templates", JSON.stringify(custom));
        localStorage.setItem(
          "bael-template-favorites",
          JSON.stringify(this.favorites),
        );
        localStorage.setItem("bael-template-usage", JSON.stringify(this.usage));
      } catch (e) {
        console.warn("Failed to save template data:", e);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════

    render() {
      this.renderCategories();
      this.renderTemplates();
    }

    renderCategories() {
      const list = this.container.querySelector("#category-list");

      // Count templates per category
      const counts = {};
      this.templates.forEach((t) => {
        counts[t.category] = (counts[t.category] || 0) + 1;
      });
      counts.all = this.templates.length;

      list.innerHTML = Object.entries(this.categories)
        .map(
          ([key, cat]) => `
                <div class="category-item ${this.selectedCategory === key ? "active" : ""}"
                     data-category="${key}">
                    <span class="category-icon">${cat.icon}</span>
                    <span class="category-label">${cat.label}</span>
                    <span class="category-count">${counts[key] || 0}</span>
                </div>
            `,
        )
        .join("");

      list.querySelectorAll(".category-item").forEach((item) => {
        item.addEventListener("click", () => {
          this.selectedCategory = item.dataset.category;
          this.renderCategories();
          this.renderTemplates();
        });
      });
    }

    renderTemplates() {
      const list = this.container.querySelector("#template-list");

      let filtered = this.templates;

      // Filter by category
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter((t) => t.category === this.selectedCategory);
      }

      // Filter by search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.tags?.some((tag) => tag.includes(query)),
        );
      }

      // Sort by usage
      filtered.sort((a, b) => {
        const aFav = this.favorites.includes(a.id) ? 1000 : 0;
        const bFav = this.favorites.includes(b.id) ? 1000 : 0;
        const aUsage = this.usage[a.id] || 0;
        const bUsage = this.usage[b.id] || 0;
        return bFav + bUsage - (aFav + aUsage);
      });

      if (filtered.length === 0) {
        list.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">📋</span>
                        <span>No templates found</span>
                    </div>
                `;
        return;
      }

      list.innerHTML = filtered
        .map(
          (t) => `
                <div class="template-card ${this.selectedTemplate?.id === t.id ? "selected" : ""}"
                     data-id="${t.id}">
                    <div class="template-card-header">
                        <span class="template-name">
                            ${this.categories[t.category]?.icon || "📋"} ${t.name}
                        </span>
                        <span class="template-favorite ${this.favorites.includes(t.id) ? "active" : ""}"
                              data-fav="${t.id}">⭐</span>
                    </div>
                    <div class="template-desc">${t.description}</div>
                    <div class="template-meta">
                        ${t.tags?.map((tag) => `<span class="template-tag">${tag}</span>`).join("") || ""}
                        <span class="template-usage">${this.usage[t.id] || 0} uses</span>
                    </div>
                </div>
            `,
        )
        .join("");

      // Bind events
      list.querySelectorAll(".template-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.classList.contains("template-favorite")) {
            this.toggleFavorite(e.target.dataset.fav);
          } else {
            this.selectTemplate(card.dataset.id);
          }
        });
      });
    }

    renderDetail() {
      const detail = this.container.querySelector("#template-detail");
      const t = this.selectedTemplate;

      if (!t) {
        detail.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">📋</span>
                        <span>Select a template to view details</span>
                    </div>
                `;
        return;
      }

      const variables = t.variables || [];
      const highlightedPrompt = t.prompt.replace(
        /\{\{(\w+)\}\}/g,
        '<span class="template-variable">{{$1}}</span>',
      );

      detail.innerHTML = `
                <div class="detail-header">
                    <div class="detail-title">${t.name}</div>
                    <div class="detail-category">${this.categories[t.category]?.label || t.category}</div>
                </div>
                <div class="detail-content">
                    <div class="detail-section">
                        <div class="detail-section-title">Preview</div>
                        <div class="template-preview">${highlightedPrompt}</div>
                    </div>

                    ${
                      variables.length > 0
                        ? `
                        <div class="detail-section">
                            <div class="detail-section-title">Variables</div>
                            <div class="variable-list">
                                ${variables
                                  .map(
                                    (v) => `
                                    <div class="variable-item">
                                        <span class="variable-name">{{${v}}}</span>
                                        <input type="text" class="variable-input"
                                               data-var="${v}" placeholder="Enter ${v}...">
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="detail-actions">
                    <button class="tpl-btn" id="tpl-copy">📋 Copy</button>
                    <button class="tpl-btn tpl-btn-primary" id="tpl-use">🚀 Use Template</button>
                </div>
            `;

      // Bind action buttons
      detail
        .querySelector("#tpl-copy")
        ?.addEventListener("click", () => this.copyTemplate());
      detail
        .querySelector("#tpl-use")
        ?.addEventListener("click", () => this.useTemplate());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    selectTemplate(id) {
      this.selectedTemplate = this.templates.find((t) => t.id === id);
      this.renderTemplates();
      this.renderDetail();
    }

    toggleFavorite(id) {
      const index = this.favorites.indexOf(id);
      if (index > -1) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(id);
      }
      this.saveUserData();
      this.renderTemplates();
    }

    getFilledPrompt() {
      if (!this.selectedTemplate) return "";

      let prompt = this.selectedTemplate.prompt;
      const inputs = this.container.querySelectorAll(".variable-input");

      inputs.forEach((input) => {
        const varName = input.dataset.var;
        const value = input.value || `[${varName}]`;
        prompt = prompt.replace(
          new RegExp(`\\{\\{${varName}\\}\\}`, "g"),
          value,
        );
      });

      return prompt;
    }

    copyTemplate() {
      const prompt = this.getFilledPrompt();
      navigator.clipboard.writeText(prompt).then(() => {
        window.BaelNotify?.success?.("Template copied to clipboard");
      });
    }

    useTemplate() {
      const prompt = this.getFilledPrompt();

      // Track usage
      this.usage[this.selectedTemplate.id] =
        (this.usage[this.selectedTemplate.id] || 0) + 1;
      this.saveUserData();

      // Insert into chat input
      const input = document.querySelector(
        '#chat-input, [data-chat-input], textarea[x-model*="input"]',
      );
      if (input) {
        input.value = prompt;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Also emit event
      window.dispatchEvent(
        new CustomEvent("bael:template-used", {
          detail: { template: this.selectedTemplate, prompt },
        }),
      );

      this.hide();
      window.BaelNotify?.success?.("Template applied");
    }

    createTemplate() {
      const name = prompt("Template name:");
      if (!name) return;

      const description = prompt("Description:");
      const promptText = prompt(
        "Template prompt (use {{variable}} for placeholders):",
      );

      if (!promptText) return;

      const variables = [];
      const matches = promptText.matchAll(/\{\{(\w+)\}\}/g);
      for (const match of matches) {
        if (!variables.includes(match[1])) {
          variables.push(match[1]);
        }
      }

      const template = {
        id: "custom-" + Date.now(),
        name,
        description: description || "",
        category: "custom",
        prompt: promptText,
        variables,
        tags: ["custom"],
      };

      this.templates.push(template);
      this.saveUserData();
      this.render();

      window.BaelNotify?.success?.("Template created");
    }

    importTemplates() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const imported = JSON.parse(text);

          if (Array.isArray(imported)) {
            imported.forEach((t) => {
              t.id =
                "imported-" +
                Date.now() +
                "-" +
                Math.random().toString(36).substr(2, 5);
              t.category = "custom";
            });
            this.templates.push(...imported);
          }

          this.saveUserData();
          this.render();
          window.BaelNotify?.success?.(`Imported ${imported.length} templates`);
        } catch (error) {
          window.BaelNotify?.error?.("Failed to import templates");
        }
      };

      input.click();
    }

    exportTemplates() {
      const toExport =
        this.selectedCategory === "all"
          ? this.templates
          : this.templates.filter((t) => t.category === this.selectedCategory);

      const blob = new Blob([JSON.stringify(toExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-templates-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      window.BaelNotify?.success?.(`Exported ${toExport.length} templates`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.container.classList.add("visible");
      this.visible = true;
      this.render();

      this.container.querySelector("#template-search")?.focus();
    }

    hide() {
      this.container.classList.remove("visible");
      this.visible = false;
    }

    toggle() {
      if (this.visible) this.hide();
      else this.show();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelTemplateLibrary = new BaelTemplateLibrary();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelTemplateLibrary.initialize();
    });
  } else {
    window.BaelTemplateLibrary.initialize();
  }

  console.log("📋 Bael Template Library loaded");
})();
