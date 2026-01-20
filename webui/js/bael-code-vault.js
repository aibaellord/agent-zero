/**
 * Bael Code Vault - Save and organize code snippets from conversations
 * Keyboard: Ctrl+Shift+K to toggle
 */
(function () {
  "use strict";

  class BaelCodeVault {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-code-vault";
      this.snippets = [];
      this.selectedLanguage = "all";
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.setupAutoDetect();
      this.initialized = true;
      console.log("💾 Bael Code Vault initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-code-vault-styles")) return;

      const css = `
                .bael-vault-fab {
                    position: fixed;
                    bottom: 540px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-vault-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
                }

                .bael-vault-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                }

                .bael-vault-badge:empty {
                    display: none;
                }

                .bael-vault-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 800px;
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
                    border: 1px solid rgba(124, 58, 237, 0.3);
                }

                .bael-vault-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-vault-header {
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    padding: 18px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-vault-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-vault-close {
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

                .bael-vault-close:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-vault-toolbar {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    background: rgba(0,0,0,0.2);
                    align-items: center;
                }

                .bael-vault-search {
                    flex: 1;
                    padding: 10px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                }

                .bael-vault-search::placeholder {
                    color: #666;
                }

                .bael-vault-filter {
                    padding: 10px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                }

                .bael-vault-add-btn {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-vault-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
                }

                .bael-vault-body {
                    padding: 20px;
                    max-height: calc(85vh - 140px);
                    overflow-y: auto;
                }

                .bael-vault-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 16px;
                }

                .bael-snippet-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .bael-snippet-card:hover {
                    border-color: rgba(124, 58, 237, 0.3);
                    transform: translateY(-2px);
                }

                .bael-snippet-header {
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(0,0,0,0.2);
                }

                .bael-snippet-title {
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                }

                .bael-snippet-lang {
                    padding: 4px 10px;
                    background: rgba(124, 58, 237, 0.2);
                    color: #a78bfa;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                }

                .bael-snippet-code {
                    padding: 12px 16px;
                    background: rgba(0,0,0,0.3);
                    color: #e0e0e0;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    max-height: 150px;
                    overflow: hidden;
                    white-space: pre;
                }

                .bael-snippet-footer {
                    padding: 10px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-snippet-date {
                    color: #666;
                    font-size: 11px;
                }

                .bael-snippet-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-snippet-action {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: #888;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-snippet-action:hover {
                    background: rgba(255,255,255,0.15);
                    color: #ccc;
                }

                .bael-snippet-action.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .bael-vault-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                }

                .bael-vault-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .bael-vault-modal {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    z-index: 10002;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                }

                .bael-vault-modal.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .bael-vault-modal-content {
                    background: #1e1e2e;
                    border-radius: 16px;
                    width: 500px;
                    max-width: 95vw;
                    padding: 24px;
                    transform: scale(0.9);
                    transition: transform 0.3s;
                }

                .bael-vault-modal.visible .bael-vault-modal-content {
                    transform: scale(1);
                }

                .bael-vault-modal-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }

                .bael-vault-form-group {
                    margin-bottom: 16px;
                }

                .bael-vault-label {
                    display: block;
                    color: #888;
                    font-size: 12px;
                    margin-bottom: 6px;
                }

                .bael-vault-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                }

                .bael-vault-textarea {
                    width: 100%;
                    min-height: 150px;
                    padding: 12px 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-family: 'Consolas', 'Monaco', monospace;
                    resize: vertical;
                }

                .bael-vault-modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .bael-vault-modal-btn {
                    flex: 1;
                    padding: 12px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-vault-modal-btn.primary {
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    color: white;
                }

                .bael-vault-modal-btn.secondary {
                    background: rgba(255,255,255,0.1);
                    color: #ccc;
                }

                .bael-vault-modal-btn:hover {
                    transform: translateY(-2px);
                }

                .bael-code-save-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(124, 58, 237, 0.8);
                    border: none;
                    color: white;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.2s;
                    z-index: 10;
                }

                pre:hover .bael-code-save-btn,
                code:hover .bael-code-save-btn {
                    opacity: 1;
                }

                .bael-code-save-btn:hover {
                    background: rgba(124, 58, 237, 1);
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-code-vault-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB Button
      this.fab = document.createElement("button");
      this.fab.className = "bael-vault-fab";
      this.fab.innerHTML = `💾<span class="bael-vault-badge">${this.snippets.length || ""}</span>`;
      this.fab.title = "Code Vault (Ctrl+Shift+K)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-vault-panel";
      this.panel.innerHTML = `
                <div class="bael-vault-header">
                    <div class="bael-vault-title">
                        <span>💾</span>
                        <span>Code Vault</span>
                        <span style="font-size: 12px; opacity: 0.7;">(${this.snippets.length} snippets)</span>
                    </div>
                    <button class="bael-vault-close">×</button>
                </div>
                <div class="bael-vault-toolbar">
                    <input type="text" class="bael-vault-search" placeholder="Search snippets...">
                    <select class="bael-vault-filter" id="bael-vault-lang-filter">
                        <option value="all">All Languages</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="bash">Bash</option>
                        <option value="sql">SQL</option>
                        <option value="json">JSON</option>
                        <option value="other">Other</option>
                    </select>
                    <button class="bael-vault-add-btn" id="bael-vault-add">+ Add Snippet</button>
                </div>
                <div class="bael-vault-body">
                    <div class="bael-vault-grid" id="bael-vault-grid"></div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Modal
      this.modal = document.createElement("div");
      this.modal.className = "bael-vault-modal";
      this.modal.innerHTML = `
                <div class="bael-vault-modal-content">
                    <div class="bael-vault-modal-title">Add Code Snippet</div>
                    <div class="bael-vault-form-group">
                        <label class="bael-vault-label">Title</label>
                        <input type="text" class="bael-vault-input" id="bael-vault-title" placeholder="Snippet title">
                    </div>
                    <div class="bael-vault-form-group">
                        <label class="bael-vault-label">Language</label>
                        <select class="bael-vault-input" id="bael-vault-language">
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="bash">Bash</option>
                            <option value="sql">SQL</option>
                            <option value="json">JSON</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="bael-vault-form-group">
                        <label class="bael-vault-label">Code</label>
                        <textarea class="bael-vault-textarea" id="bael-vault-code" placeholder="Paste your code here..."></textarea>
                    </div>
                    <div class="bael-vault-modal-actions">
                        <button class="bael-vault-modal-btn secondary" id="bael-vault-cancel">Cancel</button>
                        <button class="bael-vault-modal-btn primary" id="bael-vault-save">💾 Save</button>
                    </div>
                </div>
            `;
      document.body.appendChild(this.modal);

      // Events
      this.panel
        .querySelector(".bael-vault-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#bael-vault-add")
        .addEventListener("click", () => this.showModal());
      this.panel
        .querySelector(".bael-vault-search")
        .addEventListener("input", (e) => this.filterSnippets(e.target.value));
      this.panel
        .querySelector("#bael-vault-lang-filter")
        .addEventListener("change", (e) => {
          this.selectedLanguage = e.target.value;
          this.renderSnippets();
        });

      this.modal
        .querySelector("#bael-vault-cancel")
        .addEventListener("click", () => this.hideModal());
      this.modal
        .querySelector("#bael-vault-save")
        .addEventListener("click", () => this.saveSnippet());
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.hideModal();
      });

      this.renderSnippets();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "K") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape") {
          if (this.modal.classList.contains("visible")) {
            this.hideModal();
          } else if (this.visible) {
            this.hide();
          }
        }
      });
    }

    setupAutoDetect() {
      // Add save buttons to code blocks
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              this.addSaveButtons(node);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Initial scan
      this.addSaveButtons(document.body);
    }

    addSaveButtons(container) {
      const codeBlocks = container.querySelectorAll(
        "pre:not([data-vault-processed])",
      );
      codeBlocks.forEach((pre) => {
        pre.setAttribute("data-vault-processed", "true");
        pre.style.position = "relative";

        const btn = document.createElement("button");
        btn.className = "bael-code-save-btn";
        btn.textContent = "💾 Save";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const code = pre.textContent || "";
          this.quickSave(code, this.detectLanguage(code));
        });

        pre.appendChild(btn);
      });
    }

    detectLanguage(code) {
      if (
        code.includes("function") ||
        code.includes("const ") ||
        code.includes("let ") ||
        code.includes("=>")
      )
        return "javascript";
      if (
        code.includes("def ") ||
        code.includes("import ") ||
        (code.includes("class ") && code.includes(":"))
      )
        return "python";
      if (
        code.includes("<html") ||
        code.includes("<div") ||
        code.includes("</")
      )
        return "html";
      if (
        code.includes("{") &&
        (code.includes("color:") || code.includes("margin:"))
      )
        return "css";
      if (
        code.includes("SELECT") ||
        code.includes("INSERT") ||
        code.includes("FROM")
      )
        return "sql";
      if (code.startsWith("{") || code.startsWith("[")) return "json";
      if (
        code.includes("#!/") ||
        code.includes("echo ") ||
        code.includes("cd ")
      )
        return "bash";
      return "other";
    }

    quickSave(code, language) {
      const snippet = {
        id: Date.now().toString(),
        title: "Snippet " + (this.snippets.length + 1),
        language,
        code,
        created: Date.now(),
      };

      this.snippets.push(snippet);
      this.saveToStorage();
      this.updateBadge();
      this.renderSnippets();

      // Show notification
      this.showNotification("Code saved to vault!");
    }

    showNotification(message) {
      const notif = document.createElement("div");
      notif.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #7c3aed, #6d28d9);
                color: white;
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 14px;
                z-index: 100000;
                animation: slideUp 0.3s ease;
            `;
      notif.textContent = message;
      document.body.appendChild(notif);

      setTimeout(() => notif.remove(), 2000);
    }

    showModal(snippet = null) {
      if (snippet) {
        this.modal.querySelector("#bael-vault-title").value = snippet.title;
        this.modal.querySelector("#bael-vault-language").value =
          snippet.language;
        this.modal.querySelector("#bael-vault-code").value = snippet.code;
        this.editingId = snippet.id;
      } else {
        this.modal.querySelector("#bael-vault-title").value = "";
        this.modal.querySelector("#bael-vault-code").value = "";
        this.editingId = null;
      }
      this.modal.classList.add("visible");
    }

    hideModal() {
      this.modal.classList.remove("visible");
      this.editingId = null;
    }

    saveSnippet() {
      const title =
        this.modal.querySelector("#bael-vault-title").value.trim() ||
        "Untitled";
      const language = this.modal.querySelector("#bael-vault-language").value;
      const code = this.modal.querySelector("#bael-vault-code").value;

      if (!code.trim()) {
        alert("Please enter some code");
        return;
      }

      if (this.editingId) {
        const snippet = this.snippets.find((s) => s.id === this.editingId);
        if (snippet) {
          snippet.title = title;
          snippet.language = language;
          snippet.code = code;
        }
      } else {
        this.snippets.push({
          id: Date.now().toString(),
          title,
          language,
          code,
          created: Date.now(),
        });
      }

      this.saveToStorage();
      this.hideModal();
      this.renderSnippets();
      this.updateBadge();
    }

    deleteSnippet(id) {
      if (!confirm("Delete this snippet?")) return;

      this.snippets = this.snippets.filter((s) => s.id !== id);
      this.saveToStorage();
      this.renderSnippets();
      this.updateBadge();
    }

    copySnippet(id) {
      const snippet = this.snippets.find((s) => s.id === id);
      if (snippet) {
        navigator.clipboard.writeText(snippet.code);
        this.showNotification("Copied to clipboard!");
      }
    }

    filterSnippets(query) {
      this.searchQuery = query;
      this.renderSnippets();
    }

    renderSnippets() {
      const grid = this.panel.querySelector("#bael-vault-grid");

      let filtered = this.snippets;

      if (this.selectedLanguage !== "all") {
        filtered = filtered.filter((s) => s.language === this.selectedLanguage);
      }

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q),
        );
      }

      if (filtered.length === 0) {
        grid.innerHTML = `
                    <div class="bael-vault-empty" style="grid-column: 1/-1;">
                        <div class="bael-vault-empty-icon">💾</div>
                        <div>No snippets found</div>
                    </div>
                `;
        return;
      }

      grid.innerHTML = filtered
        .map(
          (s) => `
                <div class="bael-snippet-card">
                    <div class="bael-snippet-header">
                        <div class="bael-snippet-title">${s.title}</div>
                        <div class="bael-snippet-lang">${s.language}</div>
                    </div>
                    <div class="bael-snippet-code">${this.escapeHtml(s.code.substring(0, 300))}${s.code.length > 300 ? "..." : ""}</div>
                    <div class="bael-snippet-footer">
                        <div class="bael-snippet-date">${new Date(s.created).toLocaleDateString()}</div>
                        <div class="bael-snippet-actions">
                            <button class="bael-snippet-action" data-id="${s.id}" data-action="copy">📋 Copy</button>
                            <button class="bael-snippet-action" data-id="${s.id}" data-action="edit">✏️ Edit</button>
                            <button class="bael-snippet-action delete" data-id="${s.id}" data-action="delete">🗑️</button>
                        </div>
                    </div>
                </div>
            `,
        )
        .join("");

      grid.querySelectorAll(".bael-snippet-action").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const action = btn.dataset.action;

          if (action === "copy") this.copySnippet(id);
          else if (action === "edit")
            this.showModal(this.snippets.find((s) => s.id === id));
          else if (action === "delete") this.deleteSnippet(id);
        });
      });
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    updateBadge() {
      const badge = this.fab.querySelector(".bael-vault-badge");
      badge.textContent = this.snippets.length || "";
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.renderSnippets();
      this.panel.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.snippets = JSON.parse(saved);
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.snippets));
      } catch (e) {}
    }
  }

  window.BaelCodeVault = new BaelCodeVault();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelCodeVault.initialize();
    });
  } else {
    window.BaelCodeVault.initialize();
  }
})();
