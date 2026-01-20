/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███╗   ██╗██╗██████╗ ██████╗ ███████╗████████╗███████╗          █
 * █  ██╔════╝████╗  ██║██║██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝          █
 * █  ███████╗██╔██╗ ██║██║██████╔╝██████╔╝█████╗     ██║   ███████╗          █
 * █  ╚════██║██║╚██╗██║██║██╔═══╝ ██╔═══╝ ██╔══╝     ██║   ╚════██║          █
 * █  ███████║██║ ╚████║██║██║     ██║     ███████╗   ██║   ███████║          █
 * █  ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝     ╚══════╝   ╚═╝   ╚══════╝          █
 * █                                                                          █
 * █   BAEL SNIPPETS MANAGER - Code Snippets Storage & Management             █
 * █   Save, organize, and quickly access reusable code snippets              █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelSnippetsManager {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      this.snippets = [];
      this.categories = [
        "General",
        "JavaScript",
        "Python",
        "Shell",
        "SQL",
        "HTML/CSS",
        "Other",
      ];
      this.currentCategory = "All";
      this.searchQuery = "";
    }

    async initialize() {
      console.log("📋 Bael Snippets Manager initializing...");

      this.loadSnippets();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL SNIPPETS MANAGER READY");

      return this;
    }

    loadSnippets() {
      try {
        const saved = localStorage.getItem("bael-snippets");
        if (saved) {
          this.snippets = JSON.parse(saved);
        } else {
          // Default snippets
          this.snippets = [
            {
              id: 1,
              name: "Console Log Object",
              category: "JavaScript",
              language: "javascript",
              code: "console.log(JSON.stringify(obj, null, 2));",
              tags: ["debug", "logging"],
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              name: "Fetch API Template",
              category: "JavaScript",
              language: "javascript",
              code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP error');
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}`,
              tags: ["api", "http", "async"],
              createdAt: new Date().toISOString(),
            },
            {
              id: 3,
              name: "Python List Comprehension",
              category: "Python",
              language: "python",
              code: "result = [x for x in items if condition(x)]",
              tags: ["list", "filter"],
              createdAt: new Date().toISOString(),
            },
          ];
        }
      } catch (e) {}
    }

    saveSnippets() {
      try {
        localStorage.setItem("bael-snippets", JSON.stringify(this.snippets));
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-snippets-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-snippets-styles";
      styles.textContent = `
                .bael-snippets-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 750px;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9870;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .bael-snippets-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }

                .bael-snippets-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9869;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .bael-snippets-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .snippets-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .snippets-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 600;
                    color: #fff;
                }

                .snippets-actions {
                    display: flex;
                    gap: 8px;
                }

                .snippets-btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .snippets-btn.primary {
                    background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
                    color: #fff;
                }

                .snippets-btn.primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
                }

                .snippets-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 15px;
                    transition: all 0.2s;
                }

                .snippets-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .snippets-toolbar {
                    display: flex;
                    padding: 16px 24px;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .snippets-search {
                    flex: 1;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                    transition: all 0.2s;
                }

                .snippets-search:focus {
                    border-color: #f59e0b;
                    background: rgba(245, 158, 11, 0.05);
                }

                .snippets-search::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .category-select {
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 13px;
                    cursor: pointer;
                }

                .snippets-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 24px;
                }

                .snippets-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .snippet-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .snippet-card:hover {
                    border-color: rgba(245, 158, 11, 0.3);
                    background: rgba(245, 158, 11, 0.03);
                }

                .snippet-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                }

                .snippet-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .snippet-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                }

                .snippet-category {
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 6px;
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }

                .snippet-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .snippet-card:hover .snippet-actions {
                    opacity: 1;
                }

                .snippet-action {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }

                .snippet-action:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }

                .snippet-action.danger:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .snippet-code {
                    padding: 12px 16px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #e2e8f0;
                    max-height: 150px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .snippet-tags {
                    display: flex;
                    gap: 6px;
                    padding: 8px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.04);
                }

                .snippet-tag {
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.4);
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }

                .snippet-form {
                    width: 500px;
                    background: #1a1a2e;
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .form-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 6px;
                }

                .form-input, .form-select, .form-textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    border-color: #f59e0b;
                }

                .form-textarea {
                    min-height: 120px;
                    font-family: 'JetBrains Mono', monospace;
                    resize: vertical;
                }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Create backdrop
      this.backdrop = document.createElement("div");
      this.backdrop.className = "bael-snippets-backdrop";
      this.backdrop.onclick = () => this.hide();
      document.body.appendChild(this.backdrop);

      // Create main container
      this.container = document.createElement("div");
      this.container.id = "bael-snippets-manager";
      this.container.className = "bael-snippets-container";

      this.renderContainer();

      document.body.appendChild(this.container);
    }

    renderContainer() {
      this.container.innerHTML = `
                <div class="snippets-header">
                    <div class="snippets-title">
                        <span>📋</span> Snippets Manager
                    </div>
                    <div class="snippets-actions">
                        <button class="snippets-btn primary" onclick="BaelSnippetsManager.showCreateModal()">
                            ➕ New Snippet
                        </button>
                        <button class="snippets-close" onclick="BaelSnippetsManager.hide()">✕</button>
                    </div>
                </div>
                <div class="snippets-toolbar">
                    <input type="text" class="snippets-search"
                           placeholder="Search snippets..."
                           value="${this.searchQuery}"
                           oninput="BaelSnippetsManager.search(this.value)">
                    <select class="category-select" onchange="BaelSnippetsManager.filterCategory(this.value)">
                        <option value="All">All Categories</option>
                        ${this.categories
                          .map(
                            (cat) =>
                              `<option value="${cat}" ${this.currentCategory === cat ? "selected" : ""}>${cat}</option>`,
                          )
                          .join("")}
                    </select>
                </div>
                <div class="snippets-content">
                    ${this.renderSnippets()}
                </div>
            `;
    }

    renderSnippets() {
      let filtered = this.snippets;

      // Filter by category
      if (this.currentCategory !== "All") {
        filtered = filtered.filter((s) => s.category === this.currentCategory);
      }

      // Filter by search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.code.toLowerCase().includes(query) ||
            s.tags?.some((t) => t.toLowerCase().includes(query)),
        );
      }

      if (filtered.length === 0) {
        return `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <div>No snippets found</div>
                    </div>
                `;
      }

      return `
                <div class="snippets-grid">
                    ${filtered
                      .map(
                        (snippet) => `
                        <div class="snippet-card">
                            <div class="snippet-header">
                                <div class="snippet-info">
                                    <span class="snippet-name">${this.escapeHtml(snippet.name)}</span>
                                    <span class="snippet-category">${snippet.category}</span>
                                </div>
                                <div class="snippet-actions">
                                    <button class="snippet-action" onclick="BaelSnippetsManager.copySnippet(${snippet.id})" title="Copy">📋</button>
                                    <button class="snippet-action" onclick="BaelSnippetsManager.editSnippet(${snippet.id})" title="Edit">✏️</button>
                                    <button class="snippet-action danger" onclick="BaelSnippetsManager.deleteSnippet(${snippet.id})" title="Delete">🗑️</button>
                                </div>
                            </div>
                            <div class="snippet-code">${this.escapeHtml(snippet.code)}</div>
                            ${
                              snippet.tags?.length
                                ? `
                                <div class="snippet-tags">
                                    ${snippet.tags.map((tag) => `<span class="snippet-tag">#${tag}</span>`).join("")}
                                </div>
                            `
                                : ""
                            }
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `;
    }

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+S for snippets
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Escape to close
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    show() {
      this.visible = true;
      this.backdrop.classList.add("visible");
      this.container.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.backdrop.classList.remove("visible");
      this.container.classList.remove("visible");
      this.closeModal();
    }

    search(query) {
      this.searchQuery = query;
      const content = this.container.querySelector(".snippets-content");
      if (content) {
        content.innerHTML = this.renderSnippets();
      }
    }

    filterCategory(category) {
      this.currentCategory = category;
      const content = this.container.querySelector(".snippets-content");
      if (content) {
        content.innerHTML = this.renderSnippets();
      }
    }

    copySnippet(id) {
      const snippet = this.snippets.find((s) => s.id === id);
      if (snippet) {
        navigator.clipboard.writeText(snippet.code);
        window.dispatchEvent(
          new CustomEvent("bael:toast", {
            detail: { message: "Snippet copied!", type: "success" },
          }),
        );
      }
    }

    showCreateModal() {
      this.showModal({
        title: "New Snippet",
        snippet: { name: "", category: "General", code: "", tags: [] },
      });
    }

    editSnippet(id) {
      const snippet = this.snippets.find((s) => s.id === id);
      if (snippet) {
        this.showModal({
          title: "Edit Snippet",
          snippet,
          isEdit: true,
        });
      }
    }

    showModal(config) {
      const modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.id = "snippet-modal";
      modal.innerHTML = `
                <div class="snippet-form">
                    <div class="form-title">${config.title}</div>
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="snippet-name" value="${config.snippet.name}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" id="snippet-category">
                            ${this.categories
                              .map(
                                (cat) =>
                                  `<option value="${cat}" ${config.snippet.category === cat ? "selected" : ""}>${cat}</option>`,
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Code</label>
                        <textarea class="form-textarea" id="snippet-code">${config.snippet.code}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tags (comma separated)</label>
                        <input type="text" class="form-input" id="snippet-tags"
                               value="${config.snippet.tags?.join(", ") || ""}">
                    </div>
                    <div class="form-actions">
                        <button class="snippets-btn" style="background: rgba(255,255,255,0.1); color: #fff;"
                                onclick="BaelSnippetsManager.closeModal()">Cancel</button>
                        <button class="snippets-btn primary"
                                onclick="BaelSnippetsManager.saveModal(${config.isEdit ? config.snippet.id : "null"})">
                            ${config.isEdit ? "Save Changes" : "Create Snippet"}
                        </button>
                    </div>
                </div>
            `;

      modal.onclick = (e) => {
        if (e.target === modal) this.closeModal();
      };

      document.body.appendChild(modal);
    }

    closeModal() {
      const modal = document.getElementById("snippet-modal");
      if (modal) modal.remove();
    }

    saveModal(editId) {
      const name = document.getElementById("snippet-name")?.value;
      const category = document.getElementById("snippet-category")?.value;
      const code = document.getElementById("snippet-code")?.value;
      const tagsStr = document.getElementById("snippet-tags")?.value;

      if (!name || !code) {
        window.dispatchEvent(
          new CustomEvent("bael:toast", {
            detail: { message: "Name and code are required", type: "error" },
          }),
        );
        return;
      }

      const tags = tagsStr
        ? tagsStr
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      if (editId) {
        // Edit existing
        const snippet = this.snippets.find((s) => s.id === editId);
        if (snippet) {
          snippet.name = name;
          snippet.category = category;
          snippet.code = code;
          snippet.tags = tags;
          snippet.updatedAt = new Date().toISOString();
        }
      } else {
        // Create new
        this.snippets.push({
          id: Date.now(),
          name,
          category,
          code,
          tags,
          createdAt: new Date().toISOString(),
        });
      }

      this.saveSnippets();
      this.closeModal();
      this.renderContainer();

      window.dispatchEvent(
        new CustomEvent("bael:toast", {
          detail: {
            message: editId ? "Snippet updated!" : "Snippet created!",
            type: "success",
          },
        }),
      );
    }

    deleteSnippet(id) {
      if (confirm("Delete this snippet?")) {
        this.snippets = this.snippets.filter((s) => s.id !== id);
        this.saveSnippets();
        this.renderContainer();

        window.dispatchEvent(
          new CustomEvent("bael:toast", {
            detail: { message: "Snippet deleted", type: "info" },
          }),
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelSnippetsManager = new BaelSnippetsManager();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSnippetsManager.initialize();
    });
  } else {
    window.BaelSnippetsManager.initialize();
  }

  console.log("📋 Bael Snippets Manager loaded");
})();
