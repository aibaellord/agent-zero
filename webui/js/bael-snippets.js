/**
 * BAEL - LORD OF ALL
 * Snippet Library - Code snippet manager with categories and tags
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelSnippets {
    constructor() {
      this.snippets = [];
      this.categories = [
        "General",
        "Python",
        "JavaScript",
        "Shell",
        "SQL",
        "API",
        "Config",
        "Custom",
      ];
      this.panel = null;
      this.trigger = null;
      this.init();
    }

    init() {
      this.loadSnippets();
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("📝 Bael Snippets initialized");
    }

    loadSnippets() {
      try {
        this.snippets = JSON.parse(
          localStorage.getItem("bael_snippets") || "[]",
        );
      } catch (e) {
        this.snippets = [];
      }

      // Add default snippets if empty
      if (this.snippets.length === 0) {
        this.snippets = this.getDefaultSnippets();
        this.saveSnippets();
      }
    }

    saveSnippets() {
      localStorage.setItem("bael_snippets", JSON.stringify(this.snippets));
    }

    getDefaultSnippets() {
      return [
        {
          id: Date.now() + 1,
          title: "Python Hello World",
          code: 'print("Hello, World!")',
          language: "python",
          category: "Python",
          tags: ["basic", "example"],
          description: "Simple Python print statement",
        },
        {
          id: Date.now() + 2,
          title: "Python HTTP Request",
          code: `import requests

response = requests.get('https://api.example.com/data')
if response.status_code == 200:
    data = response.json()
    print(data)`,
          language: "python",
          category: "Python",
          tags: ["http", "api", "requests"],
          description: "Make HTTP GET request with requests library",
        },
        {
          id: Date.now() + 3,
          title: "JavaScript Fetch API",
          code: `fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
          language: "javascript",
          category: "JavaScript",
          tags: ["fetch", "api", "async"],
          description: "Fetch API example with error handling",
        },
        {
          id: Date.now() + 4,
          title: "Shell Find Files",
          code: 'find . -name "*.py" -type f | xargs grep -l "pattern"',
          language: "shell",
          category: "Shell",
          tags: ["find", "grep", "search"],
          description: "Find files containing a pattern",
        },
        {
          id: Date.now() + 5,
          title: "Docker Compose Template",
          code: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data`,
          language: "yaml",
          category: "Config",
          tags: ["docker", "compose", "devops"],
          description: "Basic Docker Compose configuration",
        },
        {
          id: Date.now() + 6,
          title: "SQL Select with Join",
          code: `SELECT
    u.name,
    o.order_date,
    o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.order_date DESC;`,
          language: "sql",
          category: "SQL",
          tags: ["join", "select", "query"],
          description: "SQL query with INNER JOIN",
        },
      ];
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-snippets-styles";
      styles.textContent = `
                /* Snippets Trigger */
                .bael-snippets-trigger {
                    position: fixed;
                    bottom: 630px;
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
                    z-index: 9979;
                    transition: all 0.3s ease;
                    font-size: 20px;
                }

                .bael-snippets-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                /* Snippets Panel */
                .bael-snippets-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 1000px;
                    height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100025;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
                    overflow: hidden;
                }

                .bael-snippets-panel.visible {
                    display: flex;
                    animation: snippetsAppear 0.25s ease;
                }

                @keyframes snippetsAppear {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .bael-snippets-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 100024;
                    display: none;
                }

                .bael-snippets-overlay.visible {
                    display: block;
                }

                /* Header */
                .snippets-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .snippets-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .snippets-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .snippet-btn {
                    padding: 8px 16px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .snippet-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .snippet-btn-primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .snippets-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    font-size: 20px;
                }

                .snippets-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Toolbar */
                .snippets-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .snippets-search {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    padding: 0 12px;
                }

                .snippets-search input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 10px 0;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                }

                .snippets-filter {
                    padding: 10px 14px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                }

                /* Content Layout */
                .snippets-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                /* Sidebar */
                .snippets-sidebar {
                    width: 200px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                    padding: 12px;
                    overflow-y: auto;
                }

                .sidebar-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    padding: 0 8px;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    transition: background 0.2s ease;
                }

                .category-item:hover {
                    background: var(--bael-bg-tertiary, #181820);
                }

                .category-item.active {
                    background: var(--bael-accent, #ff3366);
                }

                .category-count {
                    background: var(--bael-bg-tertiary, #181820);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .category-item.active .category-count {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                /* Main List */
                .snippets-list {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }

                .snippet-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    margin-bottom: 12px;
                    overflow: hidden;
                    transition: border-color 0.2s ease;
                }

                .snippet-card:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .snippet-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .snippet-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .snippet-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .snippet-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .snippet-lang {
                    background: var(--bael-accent, #ff3366);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    text-transform: uppercase;
                }

                .snippet-actions {
                    display: flex;
                    gap: 6px;
                }

                .snippet-action {
                    width: 32px;
                    height: 32px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .snippet-action:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                .snippet-body {
                    padding: 16px;
                }

                .snippet-desc {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 12px;
                }

                .snippet-code {
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    padding: 12px;
                    font-family: 'SF Mono', Monaco, 'Fira Code', monospace;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    overflow-x: auto;
                    white-space: pre;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .snippet-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 12px;
                }

                .snippet-tag {
                    background: var(--bael-bg-tertiary, #181820);
                    color: var(--bael-text-muted, #666);
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                }

                /* Create/Edit Modal */
                .snippet-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    max-width: 90vw;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100027;
                    display: none;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                }

                .snippet-modal.visible {
                    display: flex;
                }

                .modal-header {
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .modal-body {
                    padding: 20px;
                    max-height: 60vh;
                    overflow-y: auto;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 6px;
                }

                .form-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .form-input:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .form-textarea {
                    min-height: 150px;
                    font-family: 'SF Mono', Monaco, 'Fira Code', monospace;
                    resize: vertical;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .modal-footer {
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }

                .modal-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .modal-btn-cancel {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-muted, #666);
                }

                .modal-btn-cancel:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .modal-btn-save {
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    color: white;
                }

                .modal-btn-save:hover {
                    filter: brightness(1.1);
                }

                /* Empty State */
                .snippets-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--bael-text-muted, #666);
                }

                .snippets-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .snippets-empty-text {
                    font-size: 14px;
                    margin-bottom: 16px;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Trigger
      const trigger = document.createElement("button");
      trigger.className = "bael-snippets-trigger";
      trigger.title = "Snippets (Ctrl+Shift+S)";
      trigger.innerHTML = "📝";
      document.body.appendChild(trigger);
      this.trigger = trigger;

      // Overlay
      const overlay = document.createElement("div");
      overlay.className = "bael-snippets-overlay";
      document.body.appendChild(overlay);
      this.overlay = overlay;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-snippets-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      // Modal
      const modal = document.createElement("div");
      modal.className = "snippet-modal";
      modal.innerHTML = this.renderModal();
      document.body.appendChild(modal);
      this.modal = modal;

      this.bindPanelEvents();
    }

    renderPanel() {
      const categoryCounts = {};
      this.categories.forEach((c) => (categoryCounts[c] = 0));
      this.snippets.forEach((s) => {
        if (categoryCounts[s.category] !== undefined) {
          categoryCounts[s.category]++;
        }
      });

      return `
                <div class="snippets-header">
                    <div class="snippets-title">
                        <span>📝</span>
                        <span>Snippet Library</span>
                    </div>
                    <div class="snippets-actions">
                        <button class="snippet-btn snippet-btn-primary" id="create-snippet">
                            <span>+</span> New Snippet
                        </button>
                        <button class="snippets-close">×</button>
                    </div>
                </div>

                <div class="snippets-toolbar">
                    <div class="snippets-search">
                        <span>🔍</span>
                        <input type="text" id="snippet-search" placeholder="Search snippets...">
                    </div>
                </div>

                <div class="snippets-content">
                    <div class="snippets-sidebar">
                        <div class="sidebar-title">Categories</div>
                        <div class="category-item active" data-category="all">
                            <span>All Snippets</span>
                            <span class="category-count">${this.snippets.length}</span>
                        </div>
                        ${this.categories
                          .map(
                            (cat) => `
                            <div class="category-item" data-category="${cat}">
                                <span>${cat}</span>
                                <span class="category-count">${categoryCounts[cat]}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>

                    <div class="snippets-list" id="snippets-list">
                        ${this.renderSnippets()}
                    </div>
                </div>
            `;
    }

    renderSnippets(filter = null, category = "all") {
      let filtered = this.snippets;

      if (category !== "all") {
        filtered = filtered.filter((s) => s.category === category);
      }

      if (filter) {
        const term = filter.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(term) ||
            s.code.toLowerCase().includes(term) ||
            (s.tags && s.tags.some((t) => t.toLowerCase().includes(term))),
        );
      }

      if (filtered.length === 0) {
        return `
                    <div class="snippets-empty">
                        <div class="snippets-empty-icon">📝</div>
                        <div class="snippets-empty-text">No snippets found</div>
                        <button class="snippet-btn snippet-btn-primary" onclick="window.BaelSnippets.showCreateModal()">Create Snippet</button>
                    </div>
                `;
      }

      return filtered
        .map(
          (snippet) => `
                <div class="snippet-card" data-id="${snippet.id}">
                    <div class="snippet-header">
                        <div class="snippet-info">
                            <div class="snippet-name">${this.escapeHtml(snippet.title)}</div>
                            <div class="snippet-meta">
                                <span class="snippet-lang">${snippet.language}</span>
                                <span>${snippet.category}</span>
                            </div>
                        </div>
                        <div class="snippet-actions">
                            <button class="snippet-action" title="Copy" onclick="window.BaelSnippets.copySnippet(${snippet.id})">📋</button>
                            <button class="snippet-action" title="Send to Chat" onclick="window.BaelSnippets.sendToChat(${snippet.id})">💬</button>
                            <button class="snippet-action" title="Edit" onclick="window.BaelSnippets.showEditModal(${snippet.id})">✏️</button>
                            <button class="snippet-action" title="Delete" onclick="window.BaelSnippets.deleteSnippet(${snippet.id})">🗑️</button>
                        </div>
                    </div>
                    <div class="snippet-body">
                        ${snippet.description ? `<div class="snippet-desc">${this.escapeHtml(snippet.description)}</div>` : ""}
                        <pre class="snippet-code">${this.escapeHtml(snippet.code)}</pre>
                        ${
                          snippet.tags && snippet.tags.length > 0
                            ? `
                            <div class="snippet-tags">
                                ${snippet.tags.map((t) => `<span class="snippet-tag">#${t}</span>`).join("")}
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderModal(snippet = null) {
      const isEdit = snippet !== null;
      return `
                <div class="modal-header">
                    <div class="modal-title">${isEdit ? "Edit Snippet" : "Create Snippet"}</div>
                    <button class="snippets-close" onclick="window.BaelSnippets.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-input" id="snippet-title" placeholder="Snippet title" value="${snippet?.title || ""}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Language</label>
                            <select class="form-input" id="snippet-language">
                                <option value="python" ${snippet?.language === "python" ? "selected" : ""}>Python</option>
                                <option value="javascript" ${snippet?.language === "javascript" ? "selected" : ""}>JavaScript</option>
                                <option value="shell" ${snippet?.language === "shell" ? "selected" : ""}>Shell</option>
                                <option value="sql" ${snippet?.language === "sql" ? "selected" : ""}>SQL</option>
                                <option value="yaml" ${snippet?.language === "yaml" ? "selected" : ""}>YAML</option>
                                <option value="json" ${snippet?.language === "json" ? "selected" : ""}>JSON</option>
                                <option value="html" ${snippet?.language === "html" ? "selected" : ""}>HTML</option>
                                <option value="css" ${snippet?.language === "css" ? "selected" : ""}>CSS</option>
                                <option value="other" ${snippet?.language === "other" ? "selected" : ""}>Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select class="form-input" id="snippet-category">
                                ${this.categories.map((c) => `<option value="${c}" ${snippet?.category === c ? "selected" : ""}>${c}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <input type="text" class="form-input" id="snippet-desc" placeholder="Brief description" value="${snippet?.description || ""}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Code *</label>
                        <textarea class="form-input form-textarea" id="snippet-code" placeholder="Paste your code here...">${snippet?.code || ""}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tags (comma-separated)</label>
                        <input type="text" class="form-input" id="snippet-tags" placeholder="e.g., api, http, async" value="${snippet?.tags?.join(", ") || ""}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-cancel" onclick="window.BaelSnippets.closeModal()">Cancel</button>
                    <button class="modal-btn modal-btn-save" onclick="window.BaelSnippets.saveSnippet(${snippet?.id || "null"})">${isEdit ? "Update" : "Create"}</button>
                </div>
            `;
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());
      this.overlay.addEventListener("click", () => this.close());

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "S") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape") {
          if (this.modal.classList.contains("visible")) {
            this.closeModal();
          } else if (this.panel.classList.contains("visible")) {
            this.close();
          }
        }
      });
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".snippets-close")
        .addEventListener("click", () => this.close());
      this.panel
        .querySelector("#create-snippet")
        .addEventListener("click", () => this.showCreateModal());

      // Search
      this.panel
        .querySelector("#snippet-search")
        .addEventListener("input", (e) => {
          const activeCategory =
            this.panel.querySelector(".category-item.active")?.dataset
              .category || "all";
          this.panel.querySelector("#snippets-list").innerHTML =
            this.renderSnippets(e.target.value, activeCategory);
        });

      // Categories
      this.panel.querySelectorAll(".category-item").forEach((item) => {
        item.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".category-item")
            .forEach((i) => i.classList.remove("active"));
          item.classList.add("active");
          const search = this.panel.querySelector("#snippet-search").value;
          this.panel.querySelector("#snippets-list").innerHTML =
            this.renderSnippets(search, item.dataset.category);
        });
      });
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
      this.panel.classList.add("visible");
      this.overlay.classList.add("visible");
    }

    close() {
      this.panel.classList.remove("visible");
      this.overlay.classList.remove("visible");
    }

    showCreateModal() {
      this.editingId = null;
      this.modal.innerHTML = this.renderModal();
      this.modal.classList.add("visible");
    }

    showEditModal(id) {
      const snippet = this.snippets.find((s) => s.id === id);
      if (!snippet) return;
      this.editingId = id;
      this.modal.innerHTML = this.renderModal(snippet);
      this.modal.classList.add("visible");
    }

    closeModal() {
      this.modal.classList.remove("visible");
      this.editingId = null;
    }

    saveSnippet(existingId) {
      const title = this.modal.querySelector("#snippet-title").value.trim();
      const code = this.modal.querySelector("#snippet-code").value.trim();

      if (!title || !code) {
        if (window.BaelNotifications) {
          window.BaelNotifications.warning("Title and code are required");
        }
        return;
      }

      const snippet = {
        id: existingId || Date.now(),
        title,
        code,
        language: this.modal.querySelector("#snippet-language").value,
        category: this.modal.querySelector("#snippet-category").value,
        description: this.modal.querySelector("#snippet-desc").value.trim(),
        tags: this.modal
          .querySelector("#snippet-tags")
          .value.split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };

      if (existingId) {
        const idx = this.snippets.findIndex((s) => s.id === existingId);
        if (idx !== -1) this.snippets[idx] = snippet;
      } else {
        this.snippets.push(snippet);
      }

      this.saveSnippets();
      this.closeModal();
      this.open(); // Refresh

      if (window.BaelNotifications) {
        window.BaelNotifications.success(
          existingId ? "Snippet updated" : "Snippet created",
        );
      }
    }

    deleteSnippet(id) {
      if (!confirm("Delete this snippet?")) return;
      this.snippets = this.snippets.filter((s) => s.id !== id);
      this.saveSnippets();
      this.open(); // Refresh

      if (window.BaelNotifications) {
        window.BaelNotifications.info("Snippet deleted");
      }
    }

    copySnippet(id) {
      const snippet = this.snippets.find((s) => s.id === id);
      if (!snippet) return;

      navigator.clipboard.writeText(snippet.code).then(() => {
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Copied to clipboard");
        }
      });
    }

    sendToChat(id) {
      const snippet = this.snippets.find((s) => s.id === id);
      if (!snippet) return;

      // Format as code block
      const message = `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``;

      // Try to insert into chat
      const chatInput = document.querySelector('textarea, input[type="text"]');
      if (chatInput) {
        chatInput.value = message;
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        this.close();

        if (window.BaelNotifications) {
          window.BaelNotifications.success("Snippet added to chat");
        }
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelSnippets = new BaelSnippets();
})();
