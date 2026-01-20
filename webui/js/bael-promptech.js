/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗  ██████╗ ███╗   ███╗██████╗ ████████╗ ██████╗██╗  ██╗ █
 * █   ██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝██╔════╝██║  ██║ █
 * █   ██████╔╝██████╔╝██║   ██║██╔████╔██║██████╔╝   ██║   ██║     ███████║ █
 * █   ██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔═══╝    ██║   ██║     ██╔══██║ █
 * █   ██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║        ██║   ╚██████╗██║  ██║ █
 * █   ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝        ╚═╝    ╚═════╝╚═╝  ╚═╝ █
 * █                                                                          █
 * █   BAEL PROMPTECH - Advanced Prompt Engineering Toolkit                  █
 * █   Prompt building, optimization, templates and variable substitution    █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelPromptech {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      this.templates = this.loadTemplates();
      this.variables = this.loadVariables();
      this.history = this.loadHistory();
    }

    async initialize() {
      console.log("✨ Bael Promptech initializing...");

      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL PROMPTECH READY (Ctrl+Shift+E)");

      return this;
    }

    getDefaultTemplates() {
      return [
        {
          id: "explain",
          name: "Explain Code",
          icon: "📖",
          category: "Code",
          template:
            "Please explain the following code in detail, including what each section does:\n\n```{language}\n{code}\n```\n\nProvide:\n1. Overview of functionality\n2. Step-by-step breakdown\n3. Any potential issues or improvements",
        },
        {
          id: "debug",
          name: "Debug Issue",
          icon: "🐛",
          category: "Code",
          template:
            "I'm encountering an issue with this code:\n\n```{language}\n{code}\n```\n\nError message: {error}\n\nPlease help me:\n1. Identify the root cause\n2. Explain why it's happening\n3. Provide a fix",
        },
        {
          id: "optimize",
          name: "Optimize Code",
          icon: "⚡",
          category: "Code",
          template:
            "Please optimize the following code for {goal} (e.g., performance, readability, memory usage):\n\n```{language}\n{code}\n```\n\nProvide the optimized version with explanations of changes made.",
        },
        {
          id: "test",
          name: "Write Tests",
          icon: "🧪",
          category: "Code",
          template:
            "Please write comprehensive unit tests for the following code:\n\n```{language}\n{code}\n```\n\nUse {framework} testing framework. Include:\n- Happy path tests\n- Edge cases\n- Error handling tests",
        },
        {
          id: "document",
          name: "Generate Documentation",
          icon: "📚",
          category: "Code",
          template:
            "Please generate documentation for the following code:\n\n```{language}\n{code}\n```\n\nInclude:\n- Function/class descriptions\n- Parameter documentation\n- Return value documentation\n- Usage examples",
        },
        {
          id: "summarize",
          name: "Summarize Text",
          icon: "📝",
          category: "Writing",
          template:
            "Please summarize the following text in {length} (short/medium/detailed):\n\n{text}\n\nProvide key points and main takeaways.",
        },
        {
          id: "rewrite",
          name: "Rewrite Text",
          icon: "✍️",
          category: "Writing",
          template:
            "Please rewrite the following text to be more {style} (professional/casual/technical/simple):\n\n{text}",
        },
        {
          id: "translate",
          name: "Translate",
          icon: "🌐",
          category: "Writing",
          template:
            "Please translate the following text from {from_language} to {to_language}:\n\n{text}\n\nMaintain the original tone and meaning.",
        },
        {
          id: "analyze",
          name: "Analyze Data",
          icon: "📊",
          category: "Analysis",
          template:
            "Please analyze the following data:\n\n{data}\n\nProvide:\n1. Key insights\n2. Patterns or trends\n3. Recommendations\n4. Visualizations if applicable",
        },
        {
          id: "compare",
          name: "Compare Options",
          icon: "⚖️",
          category: "Analysis",
          template:
            "Please compare the following options:\n\nOption A: {option_a}\nOption B: {option_b}\n\nProvide a detailed comparison including:\n- Pros and cons of each\n- Key differences\n- Recommendation based on {criteria}",
        },
        {
          id: "brainstorm",
          name: "Brainstorm Ideas",
          icon: "💡",
          category: "Creative",
          template:
            "Please brainstorm {count} ideas for {topic}.\n\nContext: {context}\n\nRequirements: {requirements}\n\nProvide creative and diverse suggestions.",
        },
        {
          id: "roleplay",
          name: "Act As Expert",
          icon: "🎭",
          category: "Creative",
          template:
            "Act as a {role} expert. I need your help with {task}.\n\nBackground: {background}\n\nPlease provide your expert perspective and recommendations.",
        },
      ];
    }

    injectStyles() {
      if (document.getElementById("bael-promptech-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-promptech-styles";
      styles.textContent = `
                .bael-promptech-panel {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    width: 480px;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                    z-index: 9750;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-promptech-panel.visible {
                    display: flex;
                    animation: promptechIn 0.3s ease;
                }

                @keyframes promptechIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .promptech-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .promptech-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .promptech-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                }

                .promptech-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .promptech-tabs {
                    display: flex;
                    padding: 0 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .promptech-tab {
                    padding: 12px 16px;
                    border: none;
                    background: none;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 13px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .promptech-tab:hover {
                    color: rgba(255, 255, 255, 0.8);
                }

                .promptech-tab.active {
                    color: #818cf8;
                    border-bottom-color: #818cf8;
                }

                .promptech-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                /* Template cards */
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }

                .template-card {
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .template-card:hover {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .template-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .template-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: #fff;
                    margin-bottom: 4px;
                }

                .template-category {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                /* Builder form */
                .builder-form {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.6);
                }

                .form-input,
                .form-textarea {
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                    font-family: inherit;
                }

                .form-input:focus,
                .form-textarea:focus {
                    border-color: rgba(99, 102, 241, 0.5);
                }

                .form-textarea {
                    min-height: 150px;
                    resize: vertical;
                    font-family: 'SF Mono', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                }

                /* Variables section */
                .variables-section {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .variables-title {
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 10px;
                }

                .variable-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: rgba(99, 102, 241, 0.15);
                    border-radius: 6px;
                    font-size: 11px;
                    color: #a5b4fc;
                    margin: 0 4px 4px 0;
                    cursor: pointer;
                }

                .variable-tag:hover {
                    background: rgba(99, 102, 241, 0.25);
                }

                /* Preview */
                .preview-section {
                    margin-top: 14px;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    font-family: 'SF Mono', monospace;
                    font-size: 11px;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.7);
                    max-height: 200px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                }

                .preview-section .variable {
                    background: rgba(250, 204, 21, 0.2);
                    color: #facc15;
                    padding: 1px 4px;
                    border-radius: 3px;
                }

                /* Actions */
                .promptech-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .promptech-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .promptech-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }

                .promptech-btn.primary:hover {
                    opacity: 0.9;
                }

                .promptech-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .promptech-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                /* History */
                .history-item {
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    margin-bottom: 8px;
                    cursor: pointer;
                }

                .history-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .history-preview {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.4;
                    max-height: 60px;
                    overflow: hidden;
                }

                .history-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 6px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-promptech-panel";
      this.container.className = "bael-promptech-panel";

      this.render("templates");
      document.body.appendChild(this.container);
    }

    render(tab = "templates") {
      this.currentTab = tab;

      this.container.innerHTML = `
                <div class="promptech-header">
                    <div class="promptech-title">
                        <span>✨</span>
                        Promptech
                    </div>
                    <button class="promptech-close" onclick="BaelPromptech.hide()">✕</button>
                </div>

                <div class="promptech-tabs">
                    <button class="promptech-tab ${tab === "templates" ? "active" : ""}"
                            onclick="BaelPromptech.render('templates')">
                        Templates
                    </button>
                    <button class="promptech-tab ${tab === "builder" ? "active" : ""}"
                            onclick="BaelPromptech.render('builder')">
                        Builder
                    </button>
                    <button class="promptech-tab ${tab === "history" ? "active" : ""}"
                            onclick="BaelPromptech.render('history')">
                        History
                    </button>
                </div>

                <div class="promptech-content">
                    ${this.renderTabContent(tab)}
                </div>

                ${tab === "builder" ? this.renderBuilderActions() : ""}
            `;
    }

    renderTabContent(tab) {
      switch (tab) {
        case "templates":
          return this.renderTemplates();
        case "builder":
          return this.renderBuilder();
        case "history":
          return this.renderHistory();
        default:
          return "";
      }
    }

    renderTemplates() {
      const templates = [...this.getDefaultTemplates(), ...this.templates];
      const categories = [...new Set(templates.map((t) => t.category))];

      return categories
        .map(
          (category) => `
                <div style="margin-bottom:16px">
                    <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:8px">
                        ${category}
                    </div>
                    <div class="template-grid">
                        ${templates
                          .filter((t) => t.category === category)
                          .map(
                            (t) => `
                            <div class="template-card" onclick="BaelPromptech.useTemplate('${t.id}')">
                                <div class="template-icon">${t.icon}</div>
                                <div class="template-name">${t.name}</div>
                                <div class="template-category">${t.category}</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderBuilder() {
      return `
                <div class="builder-form">
                    <div class="form-group">
                        <label class="form-label">Prompt Template</label>
                        <textarea class="form-textarea"
                                  id="prompt-template"
                                  placeholder="Enter your prompt template here...&#10;&#10;Use {variable_name} for dynamic values."
                                  oninput="BaelPromptech.updatePreview()">${this.currentTemplate || ""}</textarea>
                    </div>

                    <div class="variables-section">
                        <div class="variables-title">Detected Variables (click to fill)</div>
                        <div id="detected-variables"></div>
                    </div>

                    <div id="variable-inputs"></div>

                    <div class="form-group">
                        <label class="form-label">Preview</label>
                        <div class="preview-section" id="prompt-preview">
                            Enter a template above to see preview...
                        </div>
                    </div>
                </div>
            `;
    }

    renderBuilderActions() {
      return `
                <div class="promptech-actions">
                    <button class="promptech-btn secondary" onclick="BaelPromptech.copyPrompt()">
                        📋 Copy
                    </button>
                    <button class="promptech-btn secondary" onclick="BaelPromptech.saveAsTemplate()">
                        💾 Save
                    </button>
                    <button class="promptech-btn primary" onclick="BaelPromptech.insertPrompt()">
                        ✨ Insert
                    </button>
                </div>
            `;
    }

    renderHistory() {
      if (this.history.length === 0) {
        return `
                    <div style="text-align:center;padding:40px;color:rgba(255,255,255,0.4)">
                        <div style="font-size:40px;margin-bottom:12px">📜</div>
                        <div>No prompt history yet</div>
                    </div>
                `;
      }

      return this.history
        .slice(0, 20)
        .map(
          (item, i) => `
                <div class="history-item" onclick="BaelPromptech.loadFromHistory(${i})">
                    <div class="history-preview">${this.truncate(item.prompt, 150)}</div>
                    <div class="history-meta">${this.timeAgo(item.timestamp)}</div>
                </div>
            `,
        )
        .join("");
    }

    useTemplate(id) {
      const templates = [...this.getDefaultTemplates(), ...this.templates];
      const template = templates.find((t) => t.id === id);

      if (template) {
        this.currentTemplate = template.template;
        this.render("builder");
        setTimeout(() => this.updatePreview(), 0);
      }
    }

    updatePreview() {
      const textarea = document.getElementById("prompt-template");
      const variablesContainer = document.getElementById("detected-variables");
      const inputsContainer = document.getElementById("variable-inputs");
      const preview = document.getElementById("prompt-preview");

      if (!textarea) return;

      const template = textarea.value;
      const variables = this.extractVariables(template);

      // Show detected variables
      variablesContainer.innerHTML =
        variables.length > 0
          ? variables
              .map(
                (v) =>
                  `<span class="variable-tag" onclick="BaelPromptech.focusVariable('${v}')">{${v}}</span>`,
              )
              .join("")
          : '<span style="color:rgba(255,255,255,0.3);font-size:11px">No variables detected</span>';

      // Generate input fields for variables
      inputsContainer.innerHTML = variables
        .map(
          (v) => `
                <div class="form-group">
                    <label class="form-label">{${v}}</label>
                    <input class="form-input"
                           id="var-${v}"
                           placeholder="Enter value for ${v}"
                           oninput="BaelPromptech.updatePreview()">
                </div>
            `,
        )
        .join("");

      // Generate preview
      let previewText = template;
      variables.forEach((v) => {
        const input = document.getElementById(`var-${v}`);
        const value = input?.value || `<span class="variable">{${v}}</span>`;
        previewText = previewText.replace(new RegExp(`\\{${v}\\}`, "g"), value);
      });

      preview.innerHTML =
        previewText || "Enter a template above to see preview...";
    }

    extractVariables(template) {
      const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
      const variables = [];
      let match;

      while ((match = regex.exec(template)) !== null) {
        if (!variables.includes(match[1])) {
          variables.push(match[1]);
        }
      }

      return variables;
    }

    focusVariable(name) {
      const input = document.getElementById(`var-${name}`);
      if (input) input.focus();
    }

    getFilledPrompt() {
      const textarea = document.getElementById("prompt-template");
      if (!textarea) return "";

      let prompt = textarea.value;
      const variables = this.extractVariables(prompt);

      variables.forEach((v) => {
        const input = document.getElementById(`var-${v}`);
        const value = input?.value || `{${v}}`;
        prompt = prompt.replace(new RegExp(`\\{${v}\\}`, "g"), value);
      });

      return prompt;
    }

    copyPrompt() {
      const prompt = this.getFilledPrompt();
      navigator.clipboard.writeText(prompt);
      this.showToast("Prompt copied!");
    }

    insertPrompt() {
      const prompt = this.getFilledPrompt();

      // Try to insert into chat input
      const chatInput = document.querySelector(
        'textarea, [contenteditable="true"], #chat-input',
      );
      if (chatInput) {
        if (chatInput.tagName === "TEXTAREA" || chatInput.tagName === "INPUT") {
          chatInput.value = prompt;
        } else {
          chatInput.textContent = prompt;
        }
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        chatInput.focus();
      }

      // Add to history
      this.addToHistory(prompt);

      this.hide();
      this.showToast("Prompt inserted!");
    }

    saveAsTemplate() {
      const template = document.getElementById("prompt-template")?.value;
      if (!template) return;

      const name = prompt("Enter template name:");
      if (!name) return;

      const category = prompt("Enter category:", "Custom");

      this.templates.push({
        id: "custom_" + Date.now(),
        name,
        icon: "📝",
        category: category || "Custom",
        template,
      });

      this.saveTemplates();
      this.showToast("Template saved!");
    }

    loadFromHistory(index) {
      const item = this.history[index];
      if (item) {
        this.currentTemplate = item.prompt;
        this.render("builder");
      }
    }

    addToHistory(prompt) {
      this.history.unshift({
        prompt,
        timestamp: Date.now(),
      });

      if (this.history.length > 50) {
        this.history = this.history.slice(0, 50);
      }

      this.saveHistory();
    }

    truncate(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    }

    timeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return "just now";
      if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
      if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
      return Math.floor(seconds / 86400) + "d ago";
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(16, 185, 129, 0.9);
                color: #fff;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 9999;
                animation: toastIn 0.3s ease;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => toast.remove(), 2000);
    }

    loadTemplates() {
      try {
        return JSON.parse(
          localStorage.getItem("bael_promptech_templates") || "[]",
        );
      } catch {
        return [];
      }
    }

    saveTemplates() {
      localStorage.setItem(
        "bael_promptech_templates",
        JSON.stringify(this.templates),
      );
    }

    loadHistory() {
      try {
        return JSON.parse(
          localStorage.getItem("bael_promptech_history") || "[]",
        );
      } catch {
        return [];
      }
    }

    saveHistory() {
      localStorage.setItem(
        "bael_promptech_history",
        JSON.stringify(this.history),
      );
    }

    loadVariables() {
      try {
        return JSON.parse(
          localStorage.getItem("bael_promptech_variables") || "{}",
        );
      } catch {
        return {};
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "E") {
          e.preventDefault();
          this.toggle();
        }

        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.visible = true;
      this.container.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelPromptech = new BaelPromptech();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelPromptech.initialize();
    });
  } else {
    window.BaelPromptech.initialize();
  }

  console.log("✨ Bael Promptech loaded");
})();
