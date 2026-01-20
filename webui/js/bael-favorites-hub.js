/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ███████╗ █████╗ ██╗   ██╗ ██████╗ ██████╗ ██╗████████╗███████╗███████╗ █
 * █   ██╔════╝██╔══██╗██║   ██║██╔═══██╗██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝ █
 * █   █████╗  ███████║██║   ██║██║   ██║██████╔╝██║   ██║   █████╗  ███████╗ █
 * █   ██╔══╝  ██╔══██║╚██╗ ██╔╝██║   ██║██╔══██╗██║   ██║   ██╔══╝  ╚════██║ █
 * █   ██║     ██║  ██║ ╚████╔╝ ╚██████╔╝██║  ██║██║   ██║   ███████╗███████║ █
 * █   ╚═╝     ╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚══════╝ █
 * █                                                                          █
 * █   BAEL FAVORITES HUB - Unified Favorites Across All Systems             █
 * █   Bookmark chats, templates, files, commands - access everything fast   █
 * █   Keyboard Shortcut: Ctrl+Shift+B                                       █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelFavoritesHub {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // Favorites storage
      this.favorites = {
        chats: [],
        templates: [],
        files: [],
        commands: [],
        prompts: [],
        settings: [],
      };

      this.activeTab = "all";
    }

    async initialize() {
      console.log("⭐ Bael Favorites Hub initializing...");

      this.injectStyles();
      this.createContainer();
      this.loadFavorites();
      this.setupShortcuts();

      // Listen for favorite events
      window.addEventListener("bael:add-favorite", (e) =>
        this.addFavorite(e.detail),
      );
      window.addEventListener("bael:remove-favorite", (e) =>
        this.removeFavorite(e.detail),
      );

      this.initialized = true;
      console.log("✅ BAEL FAVORITES HUB READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-favorites-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-favorites-styles";
      styles.textContent = `
                .bael-favorites-hub {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10003;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    align-items: center;
                    justify-content: center;
                }

                .bael-favorites-hub.visible { display: flex; }

                .favorites-dialog {
                    width: 700px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    border: 1px solid #2a2a4a;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .favorites-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid #2a2a4a;
                }

                .favorites-header h2 {
                    margin: 0;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .favorites-count {
                    padding: 4px 10px;
                    background: #6366f1;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .favorites-close {
                    padding: 8px;
                    border: none;
                    background: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 18px;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .favorites-close:hover { background: #ef4444; color: #fff; }

                .favorites-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                    border-bottom: 1px solid #1a1a2e;
                    overflow-x: auto;
                }

                .fav-tab {
                    padding: 8px 16px;
                    border: none;
                    background: none;
                    color: #888;
                    cursor: pointer;
                    border-radius: 8px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.15s;
                    white-space: nowrap;
                }

                .fav-tab:hover { background: #1a1a2e; color: #ccc; }
                .fav-tab.active { background: #6366f1; color: #fff; }

                .fav-tab-count {
                    padding: 2px 6px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 8px;
                    font-size: 10px;
                }

                .favorites-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .favorites-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                }

                .favorite-card {
                    background: #1a1a2e;
                    border-radius: 10px;
                    padding: 14px 16px;
                    border: 1px solid #2a2a4a;
                    cursor: pointer;
                    transition: all 0.15s;
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }

                .favorite-card:hover {
                    border-color: #4a4a6a;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }

                .favorite-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .favorite-icon.chat { background: rgba(99, 102, 241, 0.2); }
                .favorite-icon.template { background: rgba(34, 197, 94, 0.2); }
                .favorite-icon.file { background: rgba(245, 158, 11, 0.2); }
                .favorite-icon.command { background: rgba(168, 85, 247, 0.2); }
                .favorite-icon.prompt { background: rgba(236, 72, 153, 0.2); }
                .favorite-icon.setting { background: rgba(14, 165, 233, 0.2); }

                .favorite-content {
                    flex: 1;
                    min-width: 0;
                }

                .favorite-title {
                    font-weight: 500;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .favorite-meta {
                    font-size: 12px;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .favorite-type {
                    padding: 2px 6px;
                    background: #2a2a4a;
                    border-radius: 4px;
                    font-size: 10px;
                    text-transform: uppercase;
                }

                .favorite-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .favorite-card:hover .favorite-actions { opacity: 1; }

                .fav-action-btn {
                    padding: 6px;
                    border: none;
                    background: none;
                    color: #888;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.15s;
                }

                .fav-action-btn:hover { background: #2a2a4a; color: #fff; }
                .fav-action-btn.remove:hover { background: #ef4444; }

                .empty-favorites {
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
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .empty-text {
                    margin-bottom: 16px;
                }

                .add-favorite-btn {
                    padding: 10px 20px;
                    background: #6366f1;
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.15s;
                }

                .add-favorite-btn:hover { background: #4f46e5; }

                .favorites-footer {
                    padding: 12px 24px;
                    border-top: 1px solid #2a2a4a;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #666;
                }

                .quick-add-section {
                    display: flex;
                    gap: 8px;
                }

                .quick-add-btn {
                    padding: 6px 12px;
                    background: #1a1a2e;
                    border: 1px solid #2a2a4a;
                    border-radius: 6px;
                    color: #888;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.15s;
                }

                .quick-add-btn:hover { background: #252538; color: #fff; }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-favorites-hub";
      this.container.className = "bael-favorites-hub";

      this.render();
      document.body.appendChild(this.container);
    }

    render() {
      const totalCount = this.getTotalCount();
      const filteredFavorites = this.getFilteredFavorites();

      this.container.innerHTML = `
                <div class="favorites-dialog">
                    <div class="favorites-header">
                        <h2>
                            ⭐ Favorites Hub
                            <span class="favorites-count">${totalCount}</span>
                        </h2>
                        <button class="favorites-close" id="favorites-close">✕</button>
                    </div>

                    <div class="favorites-tabs">
                        ${this.renderTabs()}
                    </div>

                    <div class="favorites-body">
                        ${
                          filteredFavorites.length > 0
                            ? `
                            <div class="favorites-grid">
                                ${filteredFavorites.map((fav) => this.renderFavoriteCard(fav)).join("")}
                            </div>
                        `
                            : `
                            <div class="empty-favorites">
                                <div class="empty-icon">⭐</div>
                                <div class="empty-text">No favorites yet in this category</div>
                                <button class="add-favorite-btn">Add Your First Favorite</button>
                            </div>
                        `
                        }
                    </div>

                    <div class="favorites-footer">
                        <div>
                            💡 Click any item to open, or use keyboard to navigate
                        </div>
                        <div class="quick-add-section">
                            <button class="quick-add-btn" data-action="add-chat">+ Chat</button>
                            <button class="quick-add-btn" data-action="add-template">+ Template</button>
                            <button class="quick-add-btn" data-action="add-file">+ File</button>
                        </div>
                    </div>
                </div>
            `;

      this.bindEvents();
    }

    renderTabs() {
      const tabs = [
        { key: "all", icon: "🌟", label: "All" },
        { key: "chats", icon: "💬", label: "Chats" },
        { key: "templates", icon: "📋", label: "Templates" },
        { key: "files", icon: "📁", label: "Files" },
        { key: "commands", icon: "⌨️", label: "Commands" },
        { key: "prompts", icon: "💡", label: "Prompts" },
      ];

      return tabs
        .map((tab) => {
          const count =
            tab.key === "all"
              ? this.getTotalCount()
              : this.favorites[tab.key]?.length || 0;
          return `
                    <button class="fav-tab ${this.activeTab === tab.key ? "active" : ""}" data-tab="${tab.key}">
                        ${tab.icon} ${tab.label}
                        <span class="fav-tab-count">${count}</span>
                    </button>
                `;
        })
        .join("");
    }

    renderFavoriteCard(fav) {
      const icons = {
        chat: "💬",
        template: "📋",
        file: "📁",
        command: "⌨️",
        prompt: "💡",
        setting: "⚙️",
      };

      return `
                <div class="favorite-card" data-id="${fav.id}" data-type="${fav.type}">
                    <div class="favorite-icon ${fav.type}">${icons[fav.type] || "⭐"}</div>
                    <div class="favorite-content">
                        <div class="favorite-title">${fav.title}</div>
                        <div class="favorite-meta">
                            <span class="favorite-type">${fav.type}</span>
                            <span>${this.formatDate(fav.addedAt)}</span>
                        </div>
                    </div>
                    <div class="favorite-actions">
                        <button class="fav-action-btn" title="Open">▶️</button>
                        <button class="fav-action-btn remove" data-id="${fav.id}" title="Remove">🗑️</button>
                    </div>
                </div>
            `;
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#favorites-close")
        ?.addEventListener("click", () => this.hide());
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) this.hide();
      });

      // Tabs
      this.container.querySelectorAll(".fav-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.activeTab = tab.dataset.tab;
          this.render();
        });
      });

      // Cards
      this.container.querySelectorAll(".favorite-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          // Check if remove button clicked
          if (e.target.classList.contains("remove")) {
            this.removeFavorite({ id: e.target.dataset.id });
            return;
          }

          this.openFavorite(card.dataset.id, card.dataset.type);
        });
      });

      // Quick add buttons
      this.container.querySelectorAll(".quick-add-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.quickAdd(btn.dataset.action);
        });
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+B for Bookmarks/Favorites
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "B") {
          e.preventDefault();
          this.toggle();
        }

        if (this.visible && e.key === "Escape") {
          this.hide();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DATA MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    loadFavorites() {
      try {
        const saved = localStorage.getItem("bael-favorites");
        if (saved) {
          this.favorites = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Failed to load favorites:", e);
      }
    }

    saveFavorites() {
      try {
        localStorage.setItem("bael-favorites", JSON.stringify(this.favorites));
      } catch (e) {
        console.warn("Failed to save favorites:", e);
      }
    }

    addFavorite(data) {
      const { type, id, title, meta } = data;

      if (!type || !this.favorites[type + "s"]) {
        console.warn("Invalid favorite type:", type);
        return;
      }

      const key = type + "s";

      // Check if already exists
      if (this.favorites[key].find((f) => f.id === id)) {
        return;
      }

      this.favorites[key].push({
        id: id || Date.now().toString(),
        type,
        title: title || "Untitled",
        meta: meta || {},
        addedAt: Date.now(),
      });

      this.saveFavorites();

      if (this.visible) this.render();

      window.BaelNotify?.success?.(`Added to favorites: ${title}`);
    }

    removeFavorite(data) {
      const { id } = data;

      for (const key in this.favorites) {
        const index = this.favorites[key].findIndex((f) => f.id === id);
        if (index > -1) {
          const removed = this.favorites[key].splice(index, 1)[0];
          this.saveFavorites();

          if (this.visible) this.render();

          window.BaelNotify?.info?.(`Removed from favorites: ${removed.title}`);
          return;
        }
      }
    }

    getFilteredFavorites() {
      if (this.activeTab === "all") {
        const all = [];
        for (const key in this.favorites) {
          all.push(...this.favorites[key]);
        }
        return all.sort((a, b) => b.addedAt - a.addedAt);
      }

      return (this.favorites[this.activeTab] || []).sort(
        (a, b) => b.addedAt - a.addedAt,
      );
    }

    getTotalCount() {
      let count = 0;
      for (const key in this.favorites) {
        count += this.favorites[key].length;
      }
      return count;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════

    openFavorite(id, type) {
      this.hide();

      switch (type) {
        case "chat":
          window.dispatchEvent(
            new CustomEvent("bael:open-chat", { detail: { id } }),
          );
          break;
        case "template":
          window.BaelTemplateLibrary?.show?.();
          break;
        case "file":
          window.dispatchEvent(
            new CustomEvent("bael:open-file", { detail: { id } }),
          );
          break;
        case "command":
          window.BaelCommandCenter?.show?.();
          break;
        case "prompt":
          window.dispatchEvent(
            new CustomEvent("bael:use-prompt", { detail: { id } }),
          );
          break;
        case "setting":
          window.dispatchEvent(new CustomEvent("bael:open-settings"));
          break;
      }
    }

    quickAdd(action) {
      switch (action) {
        case "add-chat":
          // Get current chat
          const chatId = window.Alpine?.store?.("chat")?.currentChatId;
          const chatName = window.Alpine?.store?.("chat")?.currentChat?.name;
          if (chatId) {
            this.addFavorite({
              type: "chat",
              id: chatId,
              title: chatName || "Current Chat",
            });
          } else {
            window.BaelNotify?.warning?.("No active chat to add");
          }
          break;

        case "add-template":
          window.BaelTemplateLibrary?.show?.();
          this.hide();
          break;

        case "add-file":
          // Could open file browser
          window.dispatchEvent(new CustomEvent("bael:open-file-browser"));
          this.hide();
          break;
      }
    }

    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

      return date.toLocaleDateString();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.render();
      this.container.classList.add("visible");
      this.visible = true;
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

  window.BaelFavoritesHub = new BaelFavoritesHub();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelFavoritesHub.initialize();
    });
  } else {
    window.BaelFavoritesHub.initialize();
  }

  console.log("⭐ Bael Favorites Hub loaded");
})();
