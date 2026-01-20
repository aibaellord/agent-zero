/**
 * Bael Context Mapper - Visualize and manage conversation context
 * Keyboard: Ctrl+Alt+C to toggle
 */
(function () {
  "use strict";

  class BaelContextMapper {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-context-mapper";
      this.contextItems = [];
      this.categories = ["topic", "entity", "action", "fact"];
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.setupObserver();
      this.initialized = true;
      console.log("🗺️ Bael Context Mapper initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-context-mapper-styles")) return;

      const css = `
                .bael-mapper-fab {
                    position: fixed;
                    bottom: 780px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-mapper-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
                }

                .bael-mapper-count {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-mapper-count:empty {
                    display: none;
                }

                .bael-mapper-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 750px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: linear-gradient(135deg, #1a1a2e, #252540);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 10001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(99, 102, 241, 0.3);
                }

                .bael-mapper-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-mapper-header {
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-mapper-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-mapper-actions {
                    display: flex;
                    gap: 10px;
                }

                .bael-mapper-btn {
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-mapper-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-mapper-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                }

                .bael-mapper-content {
                    display: flex;
                    height: calc(85vh - 60px);
                }

                .bael-mapper-sidebar {
                    width: 180px;
                    background: rgba(0,0,0,0.25);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    padding: 16px;
                }

                .bael-mapper-category {
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }

                .bael-mapper-category:hover,
                .bael-mapper-category.active {
                    background: rgba(99, 102, 241, 0.15);
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .bael-mapper-category-icon {
                    font-size: 16px;
                }

                .bael-mapper-category-name {
                    color: #ccc;
                    font-size: 13px;
                    flex: 1;
                }

                .bael-mapper-category-count {
                    background: rgba(255,255,255,0.1);
                    color: #888;
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 10px;
                }

                .bael-mapper-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-mapper-toolbar {
                    padding: 12px 20px;
                    background: rgba(0,0,0,0.15);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    gap: 12px;
                }

                .bael-mapper-search {
                    flex: 1;
                    padding: 10px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                }

                .bael-mapper-search::placeholder {
                    color: #555;
                }

                .bael-mapper-add {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-mapper-add:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }

                .bael-mapper-items {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                }

                .bael-mapper-item {
                    padding: 14px 18px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    margin-bottom: 10px;
                    transition: all 0.2s;
                    position: relative;
                }

                .bael-mapper-item:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(99, 102, 241, 0.2);
                }

                .bael-mapper-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .bael-mapper-item-title {
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                }

                .bael-mapper-item-badge {
                    padding: 3px 10px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .bael-mapper-item-badge.topic { background: rgba(236, 72, 153, 0.2); color: #ec4899; }
                .bael-mapper-item-badge.entity { background: rgba(14, 165, 233, 0.2); color: #0ea5e9; }
                .bael-mapper-item-badge.action { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .bael-mapper-item-badge.fact { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

                .bael-mapper-item-content {
                    color: #999;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .bael-mapper-item-meta {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }

                .bael-mapper-item-time {
                    color: #555;
                    font-size: 11px;
                }

                .bael-mapper-item-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-mapper-item-action {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: #888;
                    padding: 4px 10px;
                    border-radius: 5px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-mapper-item-action:hover {
                    background: rgba(255,255,255,0.15);
                    color: #ccc;
                }

                .bael-mapper-item-action.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .bael-mapper-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #555;
                    text-align: center;
                }

                .bael-mapper-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .bael-mapper-modal {
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

                .bael-mapper-modal.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .bael-mapper-modal-content {
                    background: #1e1e2e;
                    border-radius: 16px;
                    width: 450px;
                    max-width: 95vw;
                    padding: 24px;
                }

                .bael-mapper-modal-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }

                .bael-mapper-form-group {
                    margin-bottom: 16px;
                }

                .bael-mapper-label {
                    display: block;
                    color: #888;
                    font-size: 12px;
                    margin-bottom: 6px;
                }

                .bael-mapper-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                }

                .bael-mapper-textarea {
                    width: 100%;
                    min-height: 100px;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    resize: vertical;
                }

                .bael-mapper-modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .bael-mapper-modal-btn {
                    flex: 1;
                    padding: 12px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .bael-mapper-modal-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                }

                .bael-mapper-modal-btn.secondary {
                    background: rgba(255,255,255,0.1);
                    color: #ccc;
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-context-mapper-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB
      this.fab = document.createElement("button");
      this.fab.className = "bael-mapper-fab";
      this.fab.innerHTML = `🗺️<span class="bael-mapper-count">${this.contextItems.length || ""}</span>`;
      this.fab.title = "Context Mapper (Ctrl+Alt+C)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-mapper-panel";
      this.panel.innerHTML = `
                <div class="bael-mapper-header">
                    <div class="bael-mapper-title">
                        <span>🗺️</span>
                        <span>Context Mapper</span>
                    </div>
                    <div class="bael-mapper-actions">
                        <button class="bael-mapper-btn" id="bael-mapper-extract">🔍 Extract</button>
                        <button class="bael-mapper-btn" id="bael-mapper-clear">🗑️ Clear</button>
                        <button class="bael-mapper-close">×</button>
                    </div>
                </div>
                <div class="bael-mapper-content">
                    <div class="bael-mapper-sidebar" id="bael-mapper-categories"></div>
                    <div class="bael-mapper-main">
                        <div class="bael-mapper-toolbar">
                            <input type="text" class="bael-mapper-search" placeholder="Search context items...">
                            <button class="bael-mapper-add">+ Add Item</button>
                        </div>
                        <div class="bael-mapper-items" id="bael-mapper-items"></div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Modal
      this.modal = document.createElement("div");
      this.modal.className = "bael-mapper-modal";
      this.modal.innerHTML = `
                <div class="bael-mapper-modal-content">
                    <div class="bael-mapper-modal-title">Add Context Item</div>
                    <div class="bael-mapper-form-group">
                        <label class="bael-mapper-label">Title</label>
                        <input type="text" class="bael-mapper-input" id="bael-mapper-item-title" placeholder="Context item title">
                    </div>
                    <div class="bael-mapper-form-group">
                        <label class="bael-mapper-label">Category</label>
                        <select class="bael-mapper-input" id="bael-mapper-item-category">
                            <option value="topic">📌 Topic</option>
                            <option value="entity">🔷 Entity</option>
                            <option value="action">⚡ Action</option>
                            <option value="fact">✅ Fact</option>
                        </select>
                    </div>
                    <div class="bael-mapper-form-group">
                        <label class="bael-mapper-label">Content</label>
                        <textarea class="bael-mapper-textarea" id="bael-mapper-item-content" placeholder="Description or details..."></textarea>
                    </div>
                    <div class="bael-mapper-modal-actions">
                        <button class="bael-mapper-modal-btn secondary" id="bael-mapper-cancel">Cancel</button>
                        <button class="bael-mapper-modal-btn primary" id="bael-mapper-save">💾 Save</button>
                    </div>
                </div>
            `;
      document.body.appendChild(this.modal);

      // Events
      this.panel
        .querySelector(".bael-mapper-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector(".bael-mapper-add")
        .addEventListener("click", () => this.showModal());
      this.panel
        .querySelector("#bael-mapper-extract")
        .addEventListener("click", () => this.extractFromChat());
      this.panel
        .querySelector("#bael-mapper-clear")
        .addEventListener("click", () => this.clearAll());
      this.panel
        .querySelector(".bael-mapper-search")
        .addEventListener("input", (e) => this.filterItems(e.target.value));

      this.modal
        .querySelector("#bael-mapper-cancel")
        .addEventListener("click", () => this.hideModal());
      this.modal
        .querySelector("#bael-mapper-save")
        .addEventListener("click", () => this.saveItem());
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.hideModal();
      });

      this.selectedCategory = "all";
      this.renderCategories();
      this.renderItems();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.key === "c") {
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

    setupObserver() {
      // Optional: Auto-extract entities from new messages
    }

    extractFromChat() {
      const messages = document.querySelectorAll(
        '.message, [class*="message"]',
      );
      const text = Array.from(messages)
        .map((m) => m.textContent)
        .join(" ");

      // Simple extraction patterns
      const patterns = [
        {
          type: "entity",
          regex: /(?:using|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
        },
        {
          type: "action",
          regex:
            /(?:create|build|make|implement|add|fix|update|delete|remove)\s+(?:a\s+)?([a-z]+(?:\s+[a-z]+)?)/gi,
        },
        {
          type: "topic",
          regex: /(?:about|regarding|concerning)\s+([a-z]+(?:\s+[a-z]+)?)/gi,
        },
      ];

      let extracted = 0;

      patterns.forEach(({ type, regex }) => {
        let match;
        while ((match = regex.exec(text)) !== null) {
          const title = match[1].trim();
          if (
            title.length > 2 &&
            !this.contextItems.find(
              (i) => i.title.toLowerCase() === title.toLowerCase(),
            )
          ) {
            this.contextItems.push({
              id: Date.now() + Math.random(),
              title,
              category: type,
              content: `Extracted from conversation`,
              timestamp: Date.now(),
            });
            extracted++;
          }
        }
      });

      if (extracted > 0) {
        this.saveToStorage();
        this.renderCategories();
        this.renderItems();
        this.updateBadge();
        this.showToast(`Extracted ${extracted} items`);
      } else {
        this.showToast("No new items found");
      }
    }

    showModal(item = null) {
      if (item) {
        this.modal.querySelector("#bael-mapper-item-title").value = item.title;
        this.modal.querySelector("#bael-mapper-item-category").value =
          item.category;
        this.modal.querySelector("#bael-mapper-item-content").value =
          item.content;
        this.editingId = item.id;
      } else {
        this.modal.querySelector("#bael-mapper-item-title").value = "";
        this.modal.querySelector("#bael-mapper-item-content").value = "";
        this.editingId = null;
      }
      this.modal.classList.add("visible");
    }

    hideModal() {
      this.modal.classList.remove("visible");
      this.editingId = null;
    }

    saveItem() {
      const title = this.modal
        .querySelector("#bael-mapper-item-title")
        .value.trim();
      const category = this.modal.querySelector(
        "#bael-mapper-item-category",
      ).value;
      const content = this.modal
        .querySelector("#bael-mapper-item-content")
        .value.trim();

      if (!title) {
        alert("Please enter a title");
        return;
      }

      if (this.editingId) {
        const item = this.contextItems.find((i) => i.id === this.editingId);
        if (item) {
          item.title = title;
          item.category = category;
          item.content = content;
        }
      } else {
        this.contextItems.push({
          id: Date.now(),
          title,
          category,
          content,
          timestamp: Date.now(),
        });
      }

      this.saveToStorage();
      this.hideModal();
      this.renderCategories();
      this.renderItems();
      this.updateBadge();
    }

    deleteItem(id) {
      if (!confirm("Delete this item?")) return;
      this.contextItems = this.contextItems.filter((i) => i.id !== id);
      this.saveToStorage();
      this.renderCategories();
      this.renderItems();
      this.updateBadge();
    }

    clearAll() {
      if (!confirm("Clear all context items?")) return;
      this.contextItems = [];
      this.saveToStorage();
      this.renderCategories();
      this.renderItems();
      this.updateBadge();
    }

    filterItems(query) {
      this.searchQuery = query;
      this.renderItems();
    }

    renderCategories() {
      const container = this.panel.querySelector("#bael-mapper-categories");

      const icons = { topic: "📌", entity: "🔷", action: "⚡", fact: "✅" };
      const counts = { all: this.contextItems.length };

      this.categories.forEach((cat) => {
        counts[cat] = this.contextItems.filter(
          (i) => i.category === cat,
        ).length;
      });

      container.innerHTML = `
                <div class="bael-mapper-category ${this.selectedCategory === "all" ? "active" : ""}" data-cat="all">
                    <span class="bael-mapper-category-icon">🗂️</span>
                    <span class="bael-mapper-category-name">All</span>
                    <span class="bael-mapper-category-count">${counts.all}</span>
                </div>
                ${this.categories
                  .map(
                    (cat) => `
                    <div class="bael-mapper-category ${this.selectedCategory === cat ? "active" : ""}" data-cat="${cat}">
                        <span class="bael-mapper-category-icon">${icons[cat]}</span>
                        <span class="bael-mapper-category-name">${cat.charAt(0).toUpperCase() + cat.slice(1)}s</span>
                        <span class="bael-mapper-category-count">${counts[cat]}</span>
                    </div>
                `,
                  )
                  .join("")}
            `;

      container.querySelectorAll(".bael-mapper-category").forEach((el) => {
        el.addEventListener("click", () => {
          this.selectedCategory = el.dataset.cat;
          this.renderCategories();
          this.renderItems();
        });
      });
    }

    renderItems() {
      const container = this.panel.querySelector("#bael-mapper-items");

      let items = this.contextItems;

      if (this.selectedCategory !== "all") {
        items = items.filter((i) => i.category === this.selectedCategory);
      }

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.content.toLowerCase().includes(q),
        );
      }

      if (items.length === 0) {
        container.innerHTML = `
                    <div class="bael-mapper-empty">
                        <div class="bael-mapper-empty-icon">🗺️</div>
                        <div>No context items yet</div>
                    </div>
                `;
        return;
      }

      container.innerHTML = items
        .map(
          (item) => `
                <div class="bael-mapper-item" data-id="${item.id}">
                    <div class="bael-mapper-item-header">
                        <div class="bael-mapper-item-title">${item.title}</div>
                        <span class="bael-mapper-item-badge ${item.category}">${item.category}</span>
                    </div>
                    <div class="bael-mapper-item-content">${item.content || "No description"}</div>
                    <div class="bael-mapper-item-meta">
                        <span class="bael-mapper-item-time">${new Date(item.timestamp).toLocaleString()}</span>
                        <div class="bael-mapper-item-actions">
                            <button class="bael-mapper-item-action" data-action="copy">📋</button>
                            <button class="bael-mapper-item-action" data-action="edit">✏️</button>
                            <button class="bael-mapper-item-action delete" data-action="delete">🗑️</button>
                        </div>
                    </div>
                </div>
            `,
        )
        .join("");

      container.querySelectorAll(".bael-mapper-item-action").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.closest(".bael-mapper-item").dataset.id);
          const action = btn.dataset.action;

          if (action === "copy") {
            const item = this.contextItems.find((i) => i.id === id);
            navigator.clipboard.writeText(`${item.title}: ${item.content}`);
            this.showToast("Copied!");
          } else if (action === "edit") {
            this.showModal(this.contextItems.find((i) => i.id === id));
          } else if (action === "delete") {
            this.deleteItem(id);
          }
        });
      });
    }

    updateBadge() {
      this.fab.querySelector(".bael-mapper-count").textContent =
        this.contextItems.length || "";
    }

    showToast(message) {
      const t = document.createElement("div");
      t.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;padding:12px 24px;border-radius:10px;font-size:14px;z-index:100000;`;
      t.textContent = message;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2000);
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.renderCategories();
      this.renderItems();
      this.panel.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        this.contextItems = data.items || [];
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({ items: this.contextItems }),
        );
      } catch (e) {}
    }
  }

  window.BaelContextMapper = new BaelContextMapper();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      window.BaelContextMapper.initialize(),
    );
  } else {
    window.BaelContextMapper.initialize();
  }
})();
