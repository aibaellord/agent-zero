/**
 * BAEL - LORD OF ALL
 * Prompt Library System
 * =====================
 * Save, organize, and quickly access prompt templates
 */

class BaelPromptLibrary {
  constructor() {
    this.prompts = JSON.parse(localStorage.getItem("bael_prompts") || "[]");
    this.categories = [
      "General",
      "Coding",
      "Analysis",
      "Creative",
      "System",
      "Custom",
    ];
    this.isOpen = false;

    this.init();
  }

  init() {
    this.createModal();
    this.createQuickAccess();
    this.loadDefaultPrompts();
    console.log("📚 Bael Prompt Library initialized");
  }

  createModal() {
    const modal = document.createElement("div");
    modal.id = "bael-prompt-library";
    modal.className = "bael-prompt-library hidden";
    modal.innerHTML = `
            <div class="bpl-overlay" onclick="baelPromptLibrary.close()"></div>
            <div class="bpl-modal">
                <div class="bpl-header">
                    <h2>📚 Prompt Library</h2>
                    <div class="bpl-header-actions">
                        <button class="bpl-btn-icon" onclick="baelPromptLibrary.addPrompt()">➕</button>
                        <button class="bpl-btn-icon" onclick="baelPromptLibrary.importPrompts()">📥</button>
                        <button class="bpl-btn-icon" onclick="baelPromptLibrary.exportPrompts()">📤</button>
                        <button class="bpl-btn-icon" onclick="baelPromptLibrary.close()">✕</button>
                    </div>
                </div>
                <div class="bpl-search">
                    <input type="text" id="bpl-search" placeholder="Search prompts..." oninput="baelPromptLibrary.filter()">
                </div>
                <div class="bpl-categories" id="bpl-categories"></div>
                <div class="bpl-content" id="bpl-content"></div>
            </div>

            <!-- Add/Edit Prompt Modal -->
            <div class="bpl-edit-modal hidden" id="bpl-edit-modal">
                <div class="bpl-edit-content">
                    <h3 id="bpl-edit-title">Add Prompt</h3>
                    <div class="bpl-form">
                        <label>Title</label>
                        <input type="text" id="bpl-prompt-title" placeholder="Prompt title...">

                        <label>Category</label>
                        <select id="bpl-prompt-category"></select>

                        <label>Description</label>
                        <input type="text" id="bpl-prompt-desc" placeholder="Brief description...">

                        <label>Prompt Template</label>
                        <textarea id="bpl-prompt-template" placeholder="Your prompt template...
Use {{variable}} for placeholders that will be filled in when using the prompt."></textarea>

                        <label>Variables (comma-separated)</label>
                        <input type="text" id="bpl-prompt-vars" placeholder="variable1, variable2...">

                        <div class="bpl-form-actions">
                            <button class="bpl-btn secondary" onclick="baelPromptLibrary.closeEdit()">Cancel</button>
                            <button class="bpl-btn primary" onclick="baelPromptLibrary.savePrompt()">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            .bael-prompt-library {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .bael-prompt-library.hidden {
                display: none;
            }

            .bpl-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
            }

            .bpl-modal {
                position: relative;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                background: var(--color-panel);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-lg);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .bpl-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--color-border);
            }

            .bpl-header h2 {
                margin: 0;
                color: var(--color-text);
            }

            .bpl-header-actions {
                display: flex;
                gap: 8px;
            }

            .bpl-btn-icon {
                width: 36px;
                height: 36px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
            }

            .bpl-btn-icon:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
            }

            .bpl-search {
                padding: 16px 20px;
            }

            .bpl-search input {
                width: 100%;
                padding: 12px 16px;
                background: var(--color-background);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                font-size: 14px;
                outline: none;
            }

            .bpl-search input:focus {
                border-color: var(--color-primary);
            }

            .bpl-categories {
                display: flex;
                gap: 8px;
                padding: 0 20px 16px;
                overflow-x: auto;
            }

            .bpl-cat-btn {
                padding: 8px 16px;
                background: transparent;
                border: 1px solid var(--color-border);
                color: var(--color-text-secondary);
                border-radius: var(--radius-full);
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }

            .bpl-cat-btn:hover, .bpl-cat-btn.active {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
            }

            .bpl-content {
                flex: 1;
                overflow-y: auto;
                padding: 0 20px 20px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 16px;
            }

            .bpl-prompt-card {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .bpl-prompt-card:hover {
                border-color: var(--color-primary);
                box-shadow: var(--shadow-md);
            }

            .bpl-prompt-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }

            .bpl-prompt-title {
                font-weight: 600;
                color: var(--color-text);
                font-size: 14px;
            }

            .bpl-prompt-cat {
                font-size: 10px;
                padding: 2px 8px;
                background: var(--color-primary);
                color: white;
                border-radius: var(--radius-full);
            }

            .bpl-prompt-desc {
                font-size: 12px;
                color: var(--color-text-muted);
                margin-bottom: 12px;
                line-height: 1.4;
            }

            .bpl-prompt-preview {
                font-size: 11px;
                color: var(--color-text-secondary);
                background: var(--color-background);
                padding: 8px;
                border-radius: var(--radius-sm);
                max-height: 60px;
                overflow: hidden;
                font-family: var(--font-mono);
            }

            .bpl-prompt-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 12px;
            }

            .bpl-prompt-btn {
                padding: 4px 10px;
                background: transparent;
                border: 1px solid var(--color-border);
                color: var(--color-text-secondary);
                border-radius: var(--radius-sm);
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            }

            .bpl-prompt-btn:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
            }

            .bpl-prompt-btn.danger:hover {
                background: var(--color-error);
                border-color: var(--color-error);
            }

            /* Edit Modal */
            .bpl-edit-modal {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1;
            }

            .bpl-edit-modal.hidden {
                display: none;
            }

            .bpl-edit-content {
                background: var(--color-panel);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: 24px;
                width: 90%;
                max-width: 500px;
            }

            .bpl-edit-content h3 {
                margin: 0 0 20px;
                color: var(--color-text);
            }

            .bpl-form label {
                display: block;
                font-size: 12px;
                color: var(--color-text-secondary);
                margin-bottom: 6px;
                margin-top: 12px;
            }

            .bpl-form label:first-child {
                margin-top: 0;
            }

            .bpl-form input, .bpl-form select, .bpl-form textarea {
                width: 100%;
                padding: 10px;
                background: var(--color-background);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                font-size: 14px;
                outline: none;
            }

            .bpl-form input:focus, .bpl-form select:focus, .bpl-form textarea:focus {
                border-color: var(--color-primary);
            }

            .bpl-form textarea {
                min-height: 120px;
                resize: vertical;
                font-family: var(--font-mono);
            }

            .bpl-form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 24px;
            }

            .bpl-btn {
                padding: 10px 20px;
                border-radius: var(--radius-md);
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
            }

            .bpl-btn.secondary {
                background: transparent;
                border: 1px solid var(--color-border);
                color: var(--color-text);
            }

            .bpl-btn.primary {
                background: var(--gradient-primary);
                border: none;
                color: white;
            }

            .bpl-btn:hover {
                transform: translateY(-2px);
            }

            /* Quick Access Button */
            .bael-prompt-quick {
                position: fixed;
                left: 20px;
                bottom: 20px;
                z-index: 9990;
            }

            .bpq-btn {
                width: 50px;
                height: 50px;
                background: var(--gradient-primary);
                border: none;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                box-shadow: var(--shadow-lg);
                transition: all 0.3s;
            }

            .bpq-btn:hover {
                transform: scale(1.1);
            }

            .bpl-empty {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: var(--color-text-muted);
            }

            .bpl-empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    this.modal = modal;
    this.renderCategories();
  }

  createQuickAccess() {
    const quick = document.createElement("div");
    quick.className = "bael-prompt-quick";
    quick.innerHTML = `
            <button class="bpq-btn" onclick="baelPromptLibrary.toggle()" title="Prompt Library (Ctrl+Shift+P)">📚</button>
        `;
    document.body.appendChild(quick);

    // Keyboard shortcut
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  loadDefaultPrompts() {
    if (this.prompts.length === 0) {
      this.prompts = [
        {
          id: 1,
          title: "Code Review",
          category: "Coding",
          description: "Review code for best practices and issues",
          template:
            "Please review the following code and provide feedback on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance considerations\n4. Suggestions for improvement\n\n```{{language}}\n{{code}}\n```",
          variables: ["language", "code"],
          isDefault: true,
        },
        {
          id: 2,
          title: "Explain Concept",
          category: "General",
          description: "Get a detailed explanation of any concept",
          template:
            "Explain {{concept}} in detail. Include:\n- A clear definition\n- Key principles and mechanisms\n- Real-world examples\n- Common misconceptions\n- Related topics to explore",
          variables: ["concept"],
          isDefault: true,
        },
        {
          id: 3,
          title: "Debug Helper",
          category: "Coding",
          description: "Help debug code issues",
          template:
            "I'm encountering an issue with my code:\n\n**Error/Problem:**\n{{error}}\n\n**Code:**\n```{{language}}\n{{code}}\n```\n\n**Expected behavior:**\n{{expected}}\n\n**Actual behavior:**\n{{actual}}\n\nPlease help me debug this issue.",
          variables: ["error", "language", "code", "expected", "actual"],
          isDefault: true,
        },
        {
          id: 4,
          title: "Data Analysis",
          category: "Analysis",
          description: "Analyze data and provide insights",
          template:
            "Analyze the following data and provide insights:\n\n{{data}}\n\nPlease include:\n1. Summary statistics\n2. Key patterns and trends\n3. Anomalies or outliers\n4. Actionable recommendations",
          variables: ["data"],
          isDefault: true,
        },
        {
          id: 5,
          title: "Write Documentation",
          category: "Coding",
          description: "Generate documentation for code",
          template:
            "Generate comprehensive documentation for the following {{type}}:\n\n```{{language}}\n{{code}}\n```\n\nInclude:\n- Overview/Purpose\n- Parameters/Arguments\n- Return values\n- Examples\n- Notes/Caveats",
          variables: ["type", "language", "code"],
          isDefault: true,
        },
        {
          id: 6,
          title: "System Design",
          category: "System",
          description: "Design a system architecture",
          template:
            "Design a system architecture for: {{system}}\n\nRequirements:\n{{requirements}}\n\nPlease provide:\n1. High-level architecture\n2. Component breakdown\n3. Data flow\n4. Technology recommendations\n5. Scalability considerations\n6. Potential challenges",
          variables: ["system", "requirements"],
          isDefault: true,
        },
      ];
      this.savePrompts();
    }
  }

  renderCategories() {
    const container = document.getElementById("bpl-categories");
    container.innerHTML = `
            <button class="bpl-cat-btn active" data-cat="all" onclick="baelPromptLibrary.filterCategory('all')">All</button>
            ${this.categories
              .map(
                (cat) => `
                <button class="bpl-cat-btn" data-cat="${cat}" onclick="baelPromptLibrary.filterCategory('${cat}')">${cat}</button>
            `,
              )
              .join("")}
        `;

    // Populate category dropdown
    const select = document.getElementById("bpl-prompt-category");
    if (select) {
      select.innerHTML = this.categories
        .map((cat) => `<option value="${cat}">${cat}</option>`)
        .join("");
    }
  }

  renderPrompts(prompts = this.prompts) {
    const container = document.getElementById("bpl-content");

    if (prompts.length === 0) {
      container.innerHTML = `
                <div class="bpl-empty">
                    <div class="bpl-empty-icon">📚</div>
                    <div>No prompts found</div>
                    <div style="margin-top: 8px; font-size: 12px;">Click + to add a new prompt</div>
                </div>
            `;
      return;
    }

    container.innerHTML = prompts
      .map(
        (prompt) => `
            <div class="bpl-prompt-card" onclick="baelPromptLibrary.usePrompt(${prompt.id})">
                <div class="bpl-prompt-header">
                    <div class="bpl-prompt-title">${this.escapeHtml(prompt.title)}</div>
                    <div class="bpl-prompt-cat">${prompt.category}</div>
                </div>
                <div class="bpl-prompt-desc">${this.escapeHtml(prompt.description)}</div>
                <div class="bpl-prompt-preview">${this.escapeHtml(prompt.template.substring(0, 100))}...</div>
                <div class="bpl-prompt-actions">
                    <button class="bpl-prompt-btn" onclick="event.stopPropagation(); baelPromptLibrary.editPrompt(${prompt.id})">✏️ Edit</button>
                    <button class="bpl-prompt-btn" onclick="event.stopPropagation(); baelPromptLibrary.copyPrompt(${prompt.id})">📋 Copy</button>
                    ${!prompt.isDefault ? `<button class="bpl-prompt-btn danger" onclick="event.stopPropagation(); baelPromptLibrary.deletePrompt(${prompt.id})">🗑️</button>` : ""}
                </div>
            </div>
        `,
      )
      .join("");
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.modal.classList.remove("hidden");
    this.currentCategory = "all";
    this.renderPrompts();
    document.getElementById("bpl-search").focus();
  }

  close() {
    this.isOpen = false;
    this.modal.classList.add("hidden");
  }

  filter() {
    const query = document.getElementById("bpl-search").value.toLowerCase();
    let filtered = this.prompts;

    if (this.currentCategory !== "all") {
      filtered = filtered.filter((p) => p.category === this.currentCategory);
    }

    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.template.toLowerCase().includes(query),
      );
    }

    this.renderPrompts(filtered);
  }

  filterCategory(category) {
    this.currentCategory = category;

    document.querySelectorAll(".bpl-cat-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.cat === category);
    });

    this.filter();
  }

  addPrompt() {
    this.editingId = null;
    document.getElementById("bpl-edit-title").textContent = "Add Prompt";
    document.getElementById("bpl-prompt-title").value = "";
    document.getElementById("bpl-prompt-category").value = "General";
    document.getElementById("bpl-prompt-desc").value = "";
    document.getElementById("bpl-prompt-template").value = "";
    document.getElementById("bpl-prompt-vars").value = "";
    document.getElementById("bpl-edit-modal").classList.remove("hidden");
  }

  editPrompt(id) {
    const prompt = this.prompts.find((p) => p.id === id);
    if (!prompt) return;

    this.editingId = id;
    document.getElementById("bpl-edit-title").textContent = "Edit Prompt";
    document.getElementById("bpl-prompt-title").value = prompt.title;
    document.getElementById("bpl-prompt-category").value = prompt.category;
    document.getElementById("bpl-prompt-desc").value = prompt.description;
    document.getElementById("bpl-prompt-template").value = prompt.template;
    document.getElementById("bpl-prompt-vars").value = (
      prompt.variables || []
    ).join(", ");
    document.getElementById("bpl-edit-modal").classList.remove("hidden");
  }

  closeEdit() {
    document.getElementById("bpl-edit-modal").classList.add("hidden");
    this.editingId = null;
  }

  savePrompt() {
    const title = document.getElementById("bpl-prompt-title").value.trim();
    const category = document.getElementById("bpl-prompt-category").value;
    const description = document.getElementById("bpl-prompt-desc").value.trim();
    const template = document
      .getElementById("bpl-prompt-template")
      .value.trim();
    const variables = document
      .getElementById("bpl-prompt-vars")
      .value.split(",")
      .map((v) => v.trim())
      .filter((v) => v);

    if (!title || !template) {
      alert("Title and template are required");
      return;
    }

    if (this.editingId) {
      const prompt = this.prompts.find((p) => p.id === this.editingId);
      if (prompt) {
        prompt.title = title;
        prompt.category = category;
        prompt.description = description;
        prompt.template = template;
        prompt.variables = variables;
      }
    } else {
      this.prompts.push({
        id: Date.now(),
        title,
        category,
        description,
        template,
        variables,
        isDefault: false,
      });
    }

    this.savePrompts();
    this.closeEdit();
    this.renderPrompts();
  }

  deletePrompt(id) {
    if (confirm("Delete this prompt?")) {
      this.prompts = this.prompts.filter((p) => p.id !== id);
      this.savePrompts();
      this.renderPrompts();
    }
  }

  copyPrompt(id) {
    const prompt = this.prompts.find((p) => p.id === id);
    if (prompt) {
      navigator.clipboard.writeText(prompt.template);
      this.showToast("Prompt copied to clipboard!");
    }
  }

  usePrompt(id) {
    const prompt = this.prompts.find((p) => p.id === id);
    if (!prompt) return;

    let template = prompt.template;

    // Check for variables
    if (prompt.variables && prompt.variables.length > 0) {
      // Show variable input dialog
      const values = {};
      for (const variable of prompt.variables) {
        const value = window.prompt(`Enter value for ${variable}:`, "");
        if (value === null) return; // Cancelled
        values[variable] = value;
      }

      // Replace variables
      for (const [key, value] of Object.entries(values)) {
        template = template.replace(new RegExp(`{{${key}}}`, "g"), value);
      }
    }

    // Insert into chat input
    const input =
      document.querySelector('textarea[x-model="input"]') ||
      document.querySelector(".chat-input textarea") ||
      document.querySelector("textarea");

    if (input) {
      input.value = template;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }

    this.close();
  }

  savePrompts() {
    localStorage.setItem("bael_prompts", JSON.stringify(this.prompts));
  }

  exportPrompts() {
    const data = JSON.stringify(
      this.prompts.filter((p) => !p.isDefault),
      null,
      2,
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bael-prompts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importPrompts() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          throw new Error("Invalid format");
        }

        // Add imported prompts with new IDs
        imported.forEach((p) => {
          p.id = Date.now() + Math.random();
          p.isDefault = false;
          this.prompts.push(p);
        });

        this.savePrompts();
        this.renderPrompts();
        this.showToast(`Imported ${imported.length} prompts!`);
      } catch (err) {
        alert("Failed to import prompts: " + err.message);
      }
    };
    input.click();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message) {
    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(message);
    } else {
      console.log("📚", message);
    }
  }
}

// Initialize
let baelPromptLibrary;
document.addEventListener("DOMContentLoaded", () => {
  baelPromptLibrary = new BaelPromptLibrary();
  window.baelPromptLibrary = baelPromptLibrary;
});
