/**
 * BAEL - LORD OF ALL
 * Bookmarks System - Favorite chats, messages, and code snippets
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelBookmarks {
    constructor() {
      this.container = null;
      this.isVisible = false;
      this.bookmarks = {
        chats: [],
        messages: [],
        snippets: [],
        links: [],
      };
      this.init();
    }

    init() {
      this.loadBookmarks();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      console.log("🔖 Bael Bookmarks initialized");
    }

    loadBookmarks() {
      try {
        this.bookmarks = JSON.parse(
          localStorage.getItem("bael_bookmarks") ||
            JSON.stringify(this.bookmarks),
        );
      } catch (e) {
        // Keep default structure
      }
    }

    saveBookmarks() {
      localStorage.setItem("bael_bookmarks", JSON.stringify(this.bookmarks));
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-bookmarks";
      container.className = "bael-bookmarks";
      container.innerHTML = `
                <div class="bookmarks-header">
                    <div class="bookmarks-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                        </svg>
                        <span>Bookmarks</span>
                        <span class="bookmarks-count" id="bookmarks-count">0</span>
                    </div>
                    <button class="bookmarks-close" id="bookmarks-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="bookmarks-search">
                    <input type="text" id="bookmarks-search" placeholder="Search bookmarks...">
                </div>

                <div class="bookmarks-categories">
                    <button class="bm-cat active" data-cat="all">
                        All
                        <span class="cat-count" data-count="all">0</span>
                    </button>
                    <button class="bm-cat" data-cat="chats">
                        <span>💬</span>
                        <span class="cat-count" data-count="chats">0</span>
                    </button>
                    <button class="bm-cat" data-cat="messages">
                        <span>📝</span>
                        <span class="cat-count" data-count="messages">0</span>
                    </button>
                    <button class="bm-cat" data-cat="snippets">
                        <span>💻</span>
                        <span class="cat-count" data-count="snippets">0</span>
                    </button>
                    <button class="bm-cat" data-cat="links">
                        <span>🔗</span>
                        <span class="cat-count" data-count="links">0</span>
                    </button>
                </div>

                <div class="bookmarks-content" id="bookmarks-content">
                    <!-- Bookmarks list -->
                </div>

                <div class="bookmarks-footer">
                    <button class="bm-footer-btn" id="bm-export">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Export
                    </button>
                    <button class="bm-footer-btn" id="bm-import">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Import
                    </button>
                    <button class="bm-footer-btn danger" id="bm-clear">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                        Clear All
                    </button>
                </div>

                <input type="file" id="bm-import-file" accept=".json" style="display: none;">
            `;
      document.body.appendChild(container);
      this.container = container;

      this.createTrigger();
      this.updateCounts();
    }

    createTrigger() {
      const trigger = document.createElement("button");
      trigger.id = "bael-bookmarks-trigger";
      trigger.className = "bael-bookmarks-trigger";
      trigger.title = "Bookmarks (Ctrl+Shift+B)";
      trigger.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                <span class="trigger-badge" id="bm-badge">0</span>
            `;
      document.body.appendChild(trigger);
      trigger.addEventListener("click", () => this.toggle());
    }

    addStyles() {
      if (document.getElementById("bael-bookmarks-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-bookmarks-styles";
      styles.textContent = `
                .bael-bookmarks {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    width: 380px;
                    max-height: calc(100vh - 100px);
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100023;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-bookmarks.visible {
                    display: flex;
                    animation: bmSlideIn 0.2s ease;
                }

                @keyframes bmSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .bookmarks-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bookmarks-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .bookmarks-title svg {
                    width: 18px;
                    height: 18px;
                    color: var(--bael-accent, #ff3366);
                }

                .bookmarks-count {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .bookmarks-close {
                    width: 30px;
                    height: 30px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bookmarks-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .bookmarks-close svg {
                    width: 16px;
                    height: 16px;
                }

                .bookmarks-search {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bookmarks-search input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .bookmarks-search input:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bookmarks-categories {
                    display: flex;
                    gap: 6px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bm-cat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bm-cat:hover {
                    border-color: var(--bael-text-muted, #666);
                    color: var(--bael-text-primary, #fff);
                }

                .bm-cat.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .cat-count {
                    font-size: 10px;
                    font-weight: 700;
                }

                .bookmarks-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    min-height: 200px;
                    max-height: 400px;
                }

                .bookmark-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bookmark-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bm-icon {
                    width: 32px;
                    height: 32px;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 8px;
                    flex-shrink: 0;
                }

                .bm-content {
                    flex: 1;
                    min-width: 0;
                }

                .bm-title {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bm-preview {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .bm-meta {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }

                .bm-tag {
                    padding: 2px 6px;
                    background: rgba(255, 51, 102, 0.2);
                    border-radius: 4px;
                    font-size: 9px;
                    color: var(--bael-accent, #ff3366);
                    text-transform: uppercase;
                }

                .bm-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .bm-delete {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .bookmark-item:hover .bm-delete {
                    opacity: 1;
                }

                .bm-delete:hover {
                    background: rgba(255, 0, 0, 0.2);
                    color: #f44336;
                }

                .bookmarks-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .bookmarks-empty svg {
                    width: 40px;
                    height: 40px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .bookmarks-footer {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bm-footer-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bm-footer-btn:hover {
                    border-color: var(--bael-text-muted, #666);
                    color: var(--bael-text-primary, #fff);
                }

                .bm-footer-btn.danger:hover {
                    border-color: #f44336;
                    color: #f44336;
                }

                /* Trigger button */
                .bael-bookmarks-trigger {
                    position: fixed;
                    bottom: 270px;
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
                    z-index: 9985;
                    transition: all 0.3s ease;
                }

                .bael-bookmarks-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-bookmarks-trigger svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-text-primary, #fff);
                }

                .trigger-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 9px;
                    font-weight: 700;
                    padding: 2px 5px;
                    border-radius: 8px;
                    min-width: 16px;
                    text-align: center;
                    display: none;
                }

                .trigger-badge.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#bookmarks-close")
        .addEventListener("click", () => this.close());

      // Categories
      this.container.querySelectorAll(".bm-cat").forEach((cat) => {
        cat.addEventListener("click", () => {
          this.container
            .querySelectorAll(".bm-cat")
            .forEach((c) => c.classList.remove("active"));
          cat.classList.add("active");
          this.renderBookmarks(cat.dataset.cat);
        });
      });

      // Search
      this.container
        .querySelector("#bookmarks-search")
        .addEventListener("input", (e) => {
          const activeCat =
            this.container.querySelector(".bm-cat.active").dataset.cat;
          this.renderBookmarks(activeCat, e.target.value);
        });

      // Footer actions
      this.container
        .querySelector("#bm-export")
        .addEventListener("click", () => this.exportBookmarks());
      this.container
        .querySelector("#bm-import")
        .addEventListener("click", () => {
          this.container.querySelector("#bm-import-file").click();
        });
      this.container
        .querySelector("#bm-import-file")
        .addEventListener("change", (e) => this.importBookmarks(e));
      this.container
        .querySelector("#bm-clear")
        .addEventListener("click", () => this.clearAll());

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "B") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });
    }

    updateCounts() {
      const total = Object.values(this.bookmarks).flat().length;
      this.container.querySelector("#bookmarks-count").textContent = total;
      this.container.querySelector('[data-count="all"]').textContent = total;
      this.container.querySelector('[data-count="chats"]').textContent =
        this.bookmarks.chats.length;
      this.container.querySelector('[data-count="messages"]').textContent =
        this.bookmarks.messages.length;
      this.container.querySelector('[data-count="snippets"]').textContent =
        this.bookmarks.snippets.length;
      this.container.querySelector('[data-count="links"]').textContent =
        this.bookmarks.links.length;

      const badge = document.querySelector("#bm-badge");
      if (badge) {
        badge.textContent = total;
        badge.classList.toggle("visible", total > 0);
      }
    }

    renderBookmarks(category = "all", search = "") {
      const content = this.container.querySelector("#bookmarks-content");

      let items = [];
      if (category === "all") {
        items = [
          ...this.bookmarks.chats.map((b) => ({ ...b, category: "chats" })),
          ...this.bookmarks.messages.map((b) => ({
            ...b,
            category: "messages",
          })),
          ...this.bookmarks.snippets.map((b) => ({
            ...b,
            category: "snippets",
          })),
          ...this.bookmarks.links.map((b) => ({ ...b, category: "links" })),
        ];
      } else {
        items = this.bookmarks[category].map((b) => ({ ...b, category }));
      }

      // Apply search
      if (search) {
        const query = search.toLowerCase();
        items = items.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            (b.preview && b.preview.toLowerCase().includes(query)),
        );
      }

      // Sort by timestamp
      items.sort((a, b) => b.timestamp - a.timestamp);

      if (items.length === 0) {
        content.innerHTML = `
                    <div class="bookmarks-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                        </svg>
                        <p>No bookmarks ${search ? "found" : "yet"}</p>
                        <p style="font-size: 11px">Right-click on messages to bookmark them</p>
                    </div>
                `;
        return;
      }

      const icons = {
        chats: "💬",
        messages: "📝",
        snippets: "💻",
        links: "🔗",
      };

      content.innerHTML = items
        .map(
          (item) => `
                <div class="bookmark-item" data-id="${item.id}" data-category="${item.category}">
                    <div class="bm-icon">${icons[item.category]}</div>
                    <div class="bm-content">
                        <div class="bm-title">${this.escapeHtml(item.title)}</div>
                        ${item.preview ? `<div class="bm-preview">${this.escapeHtml(item.preview)}</div>` : ""}
                        <div class="bm-meta">
                            <span class="bm-tag">${item.category}</span>
                            <span class="bm-time">${this.formatTime(item.timestamp)}</span>
                        </div>
                    </div>
                    <button class="bm-delete" title="Remove">×</button>
                </div>
            `,
        )
        .join("");

      // Bind events
      content.querySelectorAll(".bookmark-item").forEach((el) => {
        el.addEventListener("click", (e) => {
          if (e.target.classList.contains("bm-delete")) return;
          const id = el.dataset.id;
          const cat = el.dataset.category;
          this.openBookmark(cat, id);
        });

        el.querySelector(".bm-delete").addEventListener("click", (e) => {
          e.stopPropagation();
          const id = el.dataset.id;
          const cat = el.dataset.category;
          this.removeBookmark(cat, id);
        });
      });
    }

    openBookmark(category, id) {
      const item = this.bookmarks[category].find((b) => b.id === id);
      if (!item) return;

      if (category === "links" && item.url) {
        window.open(item.url, "_blank");
      } else if (category === "snippets" && window.BaelPlayground) {
        window.BaelPlayground.setCode(
          item.content || item.preview,
          item.language || "javascript",
        );
      } else if (item.content) {
        // Copy to clipboard
        navigator.clipboard.writeText(item.content || item.preview);
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Content copied to clipboard");
        }
      }

      this.close();
    }

    addBookmark(category, data) {
      const bookmark = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...data,
      };

      this.bookmarks[category].push(bookmark);
      this.saveBookmarks();
      this.updateCounts();
      this.renderBookmarks();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Bookmark added!");
      }

      return bookmark;
    }

    removeBookmark(category, id) {
      this.bookmarks[category] = this.bookmarks[category].filter(
        (b) => b.id !== id,
      );
      this.saveBookmarks();
      this.updateCounts();
      this.renderBookmarks();
    }

    exportBookmarks() {
      const data = JSON.stringify(this.bookmarks, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-bookmarks-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Bookmarks exported");
      }
    }

    importBookmarks(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.chats)
            this.bookmarks.chats = [...this.bookmarks.chats, ...data.chats];
          if (data.messages)
            this.bookmarks.messages = [
              ...this.bookmarks.messages,
              ...data.messages,
            ];
          if (data.snippets)
            this.bookmarks.snippets = [
              ...this.bookmarks.snippets,
              ...data.snippets,
            ];
          if (data.links)
            this.bookmarks.links = [...this.bookmarks.links, ...data.links];

          this.saveBookmarks();
          this.updateCounts();
          this.renderBookmarks();

          if (window.BaelNotifications) {
            window.BaelNotifications.success("Bookmarks imported");
          }
        } catch (err) {
          if (window.BaelNotifications) {
            window.BaelNotifications.error("Invalid bookmark file");
          }
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }

    clearAll() {
      if (!confirm("Delete all bookmarks? This cannot be undone.")) return;

      this.bookmarks = { chats: [], messages: [], snippets: [], links: [] };
      this.saveBookmarks();
      this.updateCounts();
      this.renderBookmarks();

      if (window.BaelNotifications) {
        window.BaelNotifications.info("All bookmarks cleared");
      }
    }

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.renderBookmarks();
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }

    // Utility methods for external use
    bookmarkChat(title, chatId) {
      return this.addBookmark("chats", { title, chatId });
    }

    bookmarkMessage(title, content) {
      return this.addBookmark("messages", {
        title,
        content,
        preview: content.substring(0, 100),
      });
    }

    bookmarkSnippet(title, code, language) {
      return this.addBookmark("snippets", {
        title,
        content: code,
        preview: code.substring(0, 100),
        language,
      });
    }

    bookmarkLink(title, url) {
      return this.addBookmark("links", { title, url, preview: url });
    }
  }

  // Initialize
  window.BaelBookmarks = new BaelBookmarks();
})();
