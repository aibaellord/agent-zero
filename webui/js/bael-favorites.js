/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗ █████╗ ██╗   ██╗ ██████╗ ██████╗ ██╗████████╗███████╗███████╗  █
 * █  ██╔════╝██╔══██╗██║   ██║██╔═══██╗██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝  █
 * █  █████╗  ███████║██║   ██║██║   ██║██████╔╝██║   ██║   █████╗  ███████╗  █
 * █  ██╔══╝  ██╔══██║╚██╗ ██╔╝██║   ██║██╔══██╗██║   ██║   ██╔══╝  ╚════██║  █
 * █  ██║     ██║  ██║ ╚████╔╝ ╚██████╔╝██║  ██║██║   ██║   ███████╗███████║  █
 * █  ╚═╝     ╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚══════╝  █
 * █                                                                          █
 * █   BAEL FAVORITES SYSTEM - Bookmark Chats, Files & Resources              █
 * █   Quick access to your most important items (Ctrl+Shift+F)               █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelFavorites {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.searchQuery = "";
      this.selectedCategory = "all";

      this.favorites = {
        chats: [], // { id, title, timestamp, preview }
        files: [], // { path, name, type, timestamp }
        prompts: [], // { id, title, content, timestamp }
        urls: [], // { url, title, description, timestamp }
        custom: [], // { id, title, data, category, timestamp }
      };

      this.categories = [
        { id: "all", name: "All", icon: "⭐" },
        { id: "chats", name: "Chats", icon: "💬" },
        { id: "files", name: "Files", icon: "📁" },
        { id: "prompts", name: "Prompts", icon: "📝" },
        { id: "urls", name: "URLs", icon: "🔗" },
        { id: "custom", name: "Custom", icon: "🎯" },
      ];
    }

    async initialize() {
      console.log("⭐ Bael Favorites initializing...");

      this.loadFavorites();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.addFavButton();

      this.initialized = true;
      console.log("✅ BAEL FAVORITES READY");

      return this;
    }

    loadFavorites() {
      try {
        const saved = localStorage.getItem("bael-favorites");
        if (saved) {
          this.favorites = JSON.parse(saved);
        }
      } catch (e) {}
    }

    saveFavorites() {
      try {
        localStorage.setItem("bael-favorites", JSON.stringify(this.favorites));
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-favorites-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-favorites-styles";
      styles.textContent = `
                .bael-favorites-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(12px);
                    z-index: 9800;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .bael-favorites-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-favorites-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90vw;
                    max-width: 900px;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 40px 120px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 9801;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-favorites-overlay.visible .bael-favorites-modal {
                    transform: translate(-50%, -50%) scale(1);
                }

                .fav-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 28px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .fav-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .fav-title h2 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 600;
                    color: #fff;
                }

                .fav-count {
                    background: #6366f1;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 20px;
                }

                .fav-header-actions {
                    display: flex;
                    gap: 10px;
                }

                .fav-btn {
                    padding: 10px 16px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .fav-btn:hover {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: rgba(99, 102, 241, 0.4);
                    color: #fff;
                }

                .fav-close {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.2s;
                }

                .fav-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .fav-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 28px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .fav-search {
                    flex: 1;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                }

                .fav-search:focus {
                    border-color: #6366f1;
                }

                .fav-search::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .fav-categories {
                    display: flex;
                    gap: 6px;
                }

                .fav-cat-btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .fav-cat-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                }

                .fav-cat-btn.active {
                    background: #6366f1;
                    color: #fff;
                }

                .fav-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px 28px;
                }

                .fav-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .fav-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .fav-card:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .fav-card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                }

                .fav-card-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(99, 102, 241, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .fav-card-info {
                    flex: 1;
                    min-width: 0;
                }

                .fav-card-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .fav-card-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 2px;
                }

                .fav-card-actions {
                    display: flex;
                    gap: 4px;
                }

                .fav-card-action {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .fav-card-action:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .fav-card-action.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .fav-card-body {
                    padding: 16px;
                }

                .fav-card-preview {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .fav-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .fav-empty span {
                    font-size: 56px;
                    display: block;
                    margin-bottom: 16px;
                }

                /* Quick add FAB */
                .fav-fab {
                    position: fixed;
                    bottom: 100px;
                    right: 24px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
                    transition: all 0.3s;
                    z-index: 9700;
                }

                .fav-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
                }

                /* Add Modal */
                .fav-add-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 500px;
                    background: #1a1a25;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 24px;
                    z-index: 9900;
                }

                .fav-add-field {
                    margin-bottom: 16px;
                }

                .fav-add-label {
                    display: block;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 6px;
                }

                .fav-add-input {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                }

                .fav-add-input:focus {
                    border-color: #6366f1;
                }

                .fav-add-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-favorites";
      this.container.className = "bael-favorites-overlay";
      document.body.appendChild(this.container);

      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.hide();
        }
      });
    }

    addFavButton() {
      // Add FAB button
      this.fab = document.createElement("button");
      this.fab.className = "fav-fab";
      this.fab.innerHTML = "⭐";
      this.fab.title = "Favorites (Ctrl+Shift+F)";
      this.fab.onclick = () => this.show();
      document.body.appendChild(this.fab);
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+F for favorites
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
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
      this.searchQuery = "";
      this.selectedCategory = "all";
      this.render();
      this.container.classList.add("visible");

      setTimeout(() => {
        const search = this.container.querySelector(".fav-search");
        if (search) search.focus();
      }, 100);
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    setCategory(category) {
      this.selectedCategory = category;
      this.render();
    }

    search(query) {
      this.searchQuery = query.toLowerCase();
      this.render();
    }

    getTotalCount() {
      return Object.values(this.favorites).reduce(
        (sum, arr) => sum + arr.length,
        0,
      );
    }

    getFilteredFavorites() {
      let items = [];

      if (this.selectedCategory === "all") {
        // Combine all
        items = [
          ...this.favorites.chats.map((f) => ({ ...f, type: "chats" })),
          ...this.favorites.files.map((f) => ({ ...f, type: "files" })),
          ...this.favorites.prompts.map((f) => ({ ...f, type: "prompts" })),
          ...this.favorites.urls.map((f) => ({ ...f, type: "urls" })),
          ...this.favorites.custom.map((f) => ({ ...f, type: "custom" })),
        ];
      } else {
        items = this.favorites[this.selectedCategory].map((f) => ({
          ...f,
          type: this.selectedCategory,
        }));
      }

      // Filter by search
      if (this.searchQuery) {
        items = items.filter((item) => {
          const searchable = [
            item.title,
            item.name,
            item.url,
            item.preview,
            item.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return searchable.includes(this.searchQuery);
        });
      }

      // Sort by timestamp
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return items;
    }

    getIconForType(type) {
      const icons = {
        chats: "💬",
        files: "📁",
        prompts: "📝",
        urls: "🔗",
        custom: "🎯",
      };
      return icons[type] || "⭐";
    }

    render() {
      const items = this.getFilteredFavorites();

      this.container.innerHTML = `
                <div class="bael-favorites-modal">
                    <div class="fav-header">
                        <div class="fav-title">
                            <span style="font-size: 28px;">⭐</span>
                            <h2>Favorites</h2>
                            <span class="fav-count">${this.getTotalCount()}</span>
                        </div>
                        <div class="fav-header-actions">
                            <button class="fav-btn" onclick="BaelFavorites.showAddModal()">
                                ➕ Add New
                            </button>
                            <button class="fav-btn" onclick="BaelFavorites.exportFavorites()">
                                📤 Export
                            </button>
                            <button class="fav-close" onclick="BaelFavorites.hide()">✕</button>
                        </div>
                    </div>

                    <div class="fav-toolbar">
                        <input type="text"
                               class="fav-search"
                               placeholder="Search favorites..."
                               value="${this.searchQuery}"
                               oninput="BaelFavorites.search(this.value)">
                        <div class="fav-categories">
                            ${this.categories
                              .map(
                                (cat) => `
                                <button class="fav-cat-btn ${this.selectedCategory === cat.id ? "active" : ""}"
                                        onclick="BaelFavorites.setCategory('${cat.id}')">
                                    ${cat.icon} ${cat.name}
                                </button>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>

                    <div class="fav-content">
                        ${
                          items.length > 0
                            ? `
                            <div class="fav-grid">
                                ${items.map((item) => this.renderCard(item)).join("")}
                            </div>
                        `
                            : `
                            <div class="fav-empty">
                                <span>⭐</span>
                                <p>${this.searchQuery ? "No favorites match your search" : "No favorites yet"}</p>
                                <p style="font-size: 13px; margin-top: 8px;">
                                    Click "Add New" to start building your collection
                                </p>
                            </div>
                        `
                        }
                    </div>
                </div>
            `;
    }

    renderCard(item) {
      const title = item.title || item.name || item.url || "Untitled";
      const preview =
        item.preview || item.description || item.content || item.path || "";
      const date = item.timestamp
        ? new Date(item.timestamp).toLocaleDateString()
        : "";

      return `
                <div class="fav-card" data-id="${item.id || ""}" data-type="${item.type}">
                    <div class="fav-card-header">
                        <div class="fav-card-icon">${this.getIconForType(item.type)}</div>
                        <div class="fav-card-info">
                            <div class="fav-card-title">${this.escapeHtml(title)}</div>
                            <div class="fav-card-meta">${item.type} • ${date}</div>
                        </div>
                        <div class="fav-card-actions">
                            <button class="fav-card-action" onclick="BaelFavorites.openItem('${item.type}', '${item.id || item.path || item.url}')" title="Open">
                                📂
                            </button>
                            <button class="fav-card-action delete" onclick="BaelFavorites.removeItem('${item.type}', '${item.id || ""}')" title="Remove">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="fav-card-body">
                        <div class="fav-card-preview">${this.escapeHtml(preview.substring(0, 200))}</div>
                    </div>
                </div>
            `;
    }

    showAddModal() {
      const modal = document.createElement("div");
      modal.className = "fav-add-modal";
      modal.id = "fav-add-modal";
      modal.innerHTML = `
                <h3 style="margin: 0 0 20px; color: #fff;">Add to Favorites</h3>
                <div class="fav-add-field">
                    <label class="fav-add-label">Category</label>
                    <select class="fav-add-input" id="fav-add-type">
                        <option value="custom">Custom</option>
                        <option value="urls">URL</option>
                        <option value="prompts">Prompt</option>
                    </select>
                </div>
                <div class="fav-add-field">
                    <label class="fav-add-label">Title</label>
                    <input type="text" class="fav-add-input" id="fav-add-title" placeholder="Enter title...">
                </div>
                <div class="fav-add-field">
                    <label class="fav-add-label">Content / URL</label>
                    <input type="text" class="fav-add-input" id="fav-add-content" placeholder="Enter content or URL...">
                </div>
                <div class="fav-add-actions">
                    <button class="fav-btn" onclick="document.getElementById('fav-add-modal').remove()">Cancel</button>
                    <button class="fav-btn" style="background: #6366f1;" onclick="BaelFavorites.saveNewItem()">Save</button>
                </div>
            `;
      this.container.appendChild(modal);
    }

    saveNewItem() {
      const type = document.getElementById("fav-add-type").value;
      const title = document.getElementById("fav-add-title").value.trim();
      const content = document.getElementById("fav-add-content").value.trim();

      if (!title) {
        alert("Please enter a title");
        return;
      }

      const item = {
        id: Date.now().toString(),
        title,
        timestamp: new Date().toISOString(),
      };

      if (type === "urls") {
        item.url = content;
        item.description = title;
      } else if (type === "prompts") {
        item.content = content;
      } else {
        item.data = content;
      }

      this.favorites[type].push(item);
      this.saveFavorites();

      document.getElementById("fav-add-modal").remove();
      this.render();
    }

    removeItem(type, id) {
      if (!confirm("Remove this favorite?")) return;

      this.favorites[type] = this.favorites[type].filter(
        (item) => item.id !== id && item.path !== id && item.url !== id,
      );
      this.saveFavorites();
      this.render();
    }

    openItem(type, id) {
      const item = this.favorites[type].find(
        (i) => i.id === id || i.path === id || i.url === id,
      );
      if (!item) return;

      if (type === "urls" && item.url) {
        window.open(item.url, "_blank");
      } else if (type === "prompts" && item.content) {
        // Copy to clipboard
        navigator.clipboard.writeText(item.content);
        alert("Prompt copied to clipboard!");
      }
    }

    exportFavorites() {
      const blob = new Blob([JSON.stringify(this.favorites, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-favorites-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Public API
    addFavorite(type, item) {
      if (!this.favorites[type]) this.favorites[type] = [];
      item.id = item.id || Date.now().toString();
      item.timestamp = new Date().toISOString();
      this.favorites[type].push(item);
      this.saveFavorites();
    }

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelFavorites = new BaelFavorites();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelFavorites.initialize();
    });
  } else {
    window.BaelFavorites.initialize();
  }

  console.log("⭐ Bael Favorites loaded");
})();
