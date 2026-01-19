/**
 * BAEL - LORD OF ALL
 * Message Bookmarks - Bookmark and organize messages
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMessageBookmarks {
    constructor() {
      this.bookmarks = [];
      this.folders = [];
      this.panel = null;
      this.storageKey = "bael-bookmarks";
      this.init();
    }

    init() {
      this.addStyles();
      this.loadBookmarks();
      this.createUI();
      this.bindEvents();
      this.observeMessages();
      console.log("🔖 Bael Message Bookmarks initialized");
    }

    loadBookmarks() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        this.bookmarks = saved.bookmarks || [];
        this.folders = saved.folders || [
          { id: "important", name: "Important", icon: "⭐", color: "#fbbf24" },
          { id: "code", name: "Code Snippets", icon: "💻", color: "#6366f1" },
          { id: "reference", name: "Reference", icon: "📚", color: "#4ade80" },
        ];
      } catch {
        this.bookmarks = [];
        this.folders = [];
      }
    }

    saveBookmarks() {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          bookmarks: this.bookmarks,
          folders: this.folders,
        }),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-bookmarks-styles";
      styles.textContent = `
                /* Bookmark Button on Messages */
                .bael-bookmark-btn {
                    position: absolute;
                    right: 45px;
                    top: 10px;
                    width: 28px;
                    height: 28px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    opacity: 0;
                    transition: all 0.2s ease;
                    z-index: 10;
                }

                .bael-message-wrapper:hover .bael-bookmark-btn {
                    opacity: 1;
                }

                .bael-bookmark-btn:hover {
                    border-color: #fbbf24;
                    color: #fbbf24;
                }

                .bael-bookmark-btn.bookmarked {
                    opacity: 1;
                    color: #fbbf24;
                    border-color: #fbbf24;
                }

                /* Toggle Button */
                .bael-bookmarks-toggle {
                    position: fixed;
                    bottom: 260px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 100020;
                    box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);
                    transition: all 0.3s ease;
                }

                .bael-bookmarks-toggle:hover {
                    transform: scale(1.1);
                }

                .bael-bookmarks-toggle .bookmark-count {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    min-width: 20px;
                    height: 20px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: bold;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 5px;
                }

                /* Bookmarks Panel */
                .bael-bookmarks-panel {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    width: 380px;
                    max-height: 500px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    z-index: 100030;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-bookmarks-panel.visible {
                    display: flex;
                    animation: bookmarksPanelIn 0.2s ease;
                }

                @keyframes bookmarksPanelIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Panel Header */
                .bm-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bm-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .bm-header-actions {
                    display: flex;
                    gap: 6px;
                }

                .bm-header-btn {
                    width: 30px;
                    height: 30px;
                    background: var(--bael-bg-tertiary, #181820);
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

                .bm-header-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Search */
                .bm-search {
                    padding: 10px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bm-search input {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .bm-search input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Folders */
                .bm-folders {
                    display: flex;
                    gap: 6px;
                    padding: 10px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    overflow-x: auto;
                }

                .bm-folder {
                    padding: 6px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 15px;
                    font-size: 11px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--bael-text-muted, #666);
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .bm-folder:hover {
                    border-color: var(--folder-color, #fbbf24);
                    color: var(--folder-color, #fbbf24);
                }

                .bm-folder.active {
                    background: var(--folder-color, #fbbf24);
                    border-color: var(--folder-color, #fbbf24);
                    color: #000;
                }

                /* Bookmarks List */
                .bm-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }

                .bm-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bm-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bm-item-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .bm-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .bm-item-preview {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .bm-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 6px;
                }

                .bm-item-date {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .bm-item-folder {
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: var(--folder-color, #fbbf24);
                    color: #000;
                }

                .bm-item-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .bm-item:hover .bm-item-actions {
                    opacity: 1;
                }

                .bm-item-btn {
                    width: 26px;
                    height: 26px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    transition: all 0.2s ease;
                }

                .bm-item-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bm-item-btn.delete:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* Empty State */
                .bm-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .bm-empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                /* Folder Select Popup */
                .bm-folder-select {
                    position: absolute;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    padding: 8px;
                    display: none;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 150px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    z-index: 100040;
                }

                .bm-folder-select.visible {
                    display: flex;
                }

                .bm-folder-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bm-folder-option:hover {
                    border-color: var(--bael-accent, #ff3366);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Toggle button
      const toggle = document.createElement("button");
      toggle.className = "bael-bookmarks-toggle";
      toggle.innerHTML = `🔖<span class="bookmark-count">${this.bookmarks.length}</span>`;
      toggle.title = "Bookmarks (Ctrl+Shift+K)";
      toggle.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(toggle);
      this.toggleBtn = toggle;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-bookmarks-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      // Folder select popup
      const folderSelect = document.createElement("div");
      folderSelect.className = "bm-folder-select";
      folderSelect.innerHTML = this.folders
        .map(
          (f) => `
                <button class="bm-folder-option" data-folder="${f.id}">
                    <span>${f.icon}</span>
                    <span>${f.name}</span>
                </button>
            `,
        )
        .join("");
      document.body.appendChild(folderSelect);
      this.folderSelect = folderSelect;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="bm-header">
                    <div class="bm-title">
                        <span>🔖</span>
                        <span>Bookmarks</span>
                    </div>
                    <div class="bm-header-actions">
                        <button class="bm-header-btn" id="bm-export" title="Export">📤</button>
                        <button class="bm-header-btn" id="bm-close" title="Close">✕</button>
                    </div>
                </div>

                <div class="bm-search">
                    <input type="text" placeholder="Search bookmarks..." id="bm-search">
                </div>

                <div class="bm-folders">
                    <button class="bm-folder active" data-folder="all" style="--folder-color: #888">
                        All
                    </button>
                    ${this.folders
                      .map(
                        (f) => `
                        <button class="bm-folder" data-folder="${f.id}" style="--folder-color: ${f.color}">
                            ${f.icon} ${f.name}
                        </button>
                    `,
                      )
                      .join("")}
                </div>

                <div class="bm-list" id="bm-list">
                    ${this.renderBookmarkList()}
                </div>
            `;
    }

    renderBookmarkList(filter = "all", search = "") {
      let filtered = this.bookmarks;

      if (filter !== "all") {
        filtered = filtered.filter((b) => b.folder === filter);
      }

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((b) => b.content.toLowerCase().includes(q));
      }

      if (filtered.length === 0) {
        return `
                    <div class="bm-empty">
                        <div class="bm-empty-icon">🔖</div>
                        <div>No bookmarks yet</div>
                    </div>
                `;
      }

      return filtered
        .map((b) => {
          const folder = this.folders.find((f) => f.id === b.folder) || {
            icon: "📌",
            color: "#888",
          };
          return `
                    <div class="bm-item" data-id="${b.id}">
                        <div class="bm-item-icon" style="background: ${folder.color}20; color: ${folder.color}">
                            ${folder.icon}
                        </div>
                        <div class="bm-item-content">
                            <div class="bm-item-preview">${this.escapeHtml(b.content)}</div>
                            <div class="bm-item-meta">
                                <span class="bm-item-date">${new Date(b.createdAt).toLocaleDateString()}</span>
                                <span class="bm-item-folder" style="background: ${folder.color}">${folder.name || "General"}</span>
                            </div>
                        </div>
                        <div class="bm-item-actions">
                            <button class="bm-item-btn" data-action="copy" title="Copy">📋</button>
                            <button class="bm-item-btn delete" data-action="delete" title="Delete">🗑️</button>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    bindPanelEvents() {
      // Close
      this.panel
        .querySelector("#bm-close")
        .addEventListener("click", () => this.closePanel());

      // Export
      this.panel
        .querySelector("#bm-export")
        .addEventListener("click", () => this.exportBookmarks());

      // Search
      this.panel.querySelector("#bm-search").addEventListener("input", (e) => {
        const activeFolder =
          this.panel.querySelector(".bm-folder.active")?.dataset.folder ||
          "all";
        this.refreshList(activeFolder, e.target.value);
      });

      // Folders
      this.panel.querySelector(".bm-folders").addEventListener("click", (e) => {
        const folder = e.target.closest(".bm-folder");
        if (!folder) return;

        this.panel
          .querySelectorAll(".bm-folder")
          .forEach((f) => f.classList.remove("active"));
        folder.classList.add("active");

        const search = this.panel.querySelector("#bm-search").value;
        this.refreshList(folder.dataset.folder, search);
      });

      // Bookmark items
      this.panel.querySelector("#bm-list").addEventListener("click", (e) => {
        const btn = e.target.closest(".bm-item-btn");
        const item = e.target.closest(".bm-item");

        if (btn && item) {
          const action = btn.dataset.action;
          const id = item.dataset.id;

          if (action === "copy") this.copyBookmark(id);
          else if (action === "delete") this.deleteBookmark(id);

          e.stopPropagation();
        }
      });

      // Folder select
      this.folderSelect.addEventListener("click", (e) => {
        const option = e.target.closest(".bm-folder-option");
        if (option) {
          const folderId = option.dataset.folder;
          this.addBookmarkToFolder(folderId);
          this.folderSelect.classList.remove("visible");
        }
      });
    }

    observeMessages() {
      // Add bookmark buttons to existing messages
      this.processMessages();

      // Watch for new messages
      const observer = new MutationObserver(() => {
        this.processMessages();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    processMessages() {
      const messages = document.querySelectorAll(
        '[x-ref="msgcont"] > div, .message, .chat-message',
      );

      messages.forEach((msg) => {
        if (msg.querySelector(".bael-bookmark-btn")) return;
        if (!msg.textContent.trim()) return;

        msg.classList.add("bael-message-wrapper");
        const msgId = this.getMessageId(msg);

        const btn = document.createElement("button");
        btn.className = "bael-bookmark-btn";
        btn.innerHTML = "🔖";
        btn.title = "Bookmark";

        // Check if already bookmarked
        if (this.bookmarks.some((b) => b.msgId === msgId)) {
          btn.classList.add("bookmarked");
        }

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.pendingBookmark = {
            msgId,
            content: msg.textContent.trim().substring(0, 500),
            element: msg,
          };

          // Show folder select
          const rect = btn.getBoundingClientRect();
          this.folderSelect.style.top = `${rect.bottom + 5}px`;
          this.folderSelect.style.left = `${rect.left - 100}px`;
          this.folderSelect.classList.toggle("visible");
        });

        msg.style.position = "relative";
        msg.appendChild(btn);
      });
    }

    getMessageId(msg) {
      const content = msg.textContent.trim().substring(0, 100);
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        hash = (hash << 5) - hash + content.charCodeAt(i);
        hash = hash & hash;
      }
      return "bm-" + Math.abs(hash).toString(36);
    }

    addBookmarkToFolder(folderId) {
      if (!this.pendingBookmark) return;

      const existing = this.bookmarks.find(
        (b) => b.msgId === this.pendingBookmark.msgId,
      );
      if (existing) {
        // Update folder
        existing.folder = folderId;
      } else {
        // Add new
        this.bookmarks.push({
          id: Date.now().toString(36),
          msgId: this.pendingBookmark.msgId,
          content: this.pendingBookmark.content,
          folder: folderId,
          createdAt: new Date().toISOString(),
        });

        // Update button
        const btn =
          this.pendingBookmark.element.querySelector(".bael-bookmark-btn");
        if (btn) btn.classList.add("bookmarked");
      }

      this.saveBookmarks();
      this.updateBadge();
      this.refreshList();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Message bookmarked!");
      }

      this.pendingBookmark = null;
    }

    copyBookmark(id) {
      const bookmark = this.bookmarks.find((b) => b.id === id);
      if (bookmark) {
        navigator.clipboard.writeText(bookmark.content);
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Copied to clipboard!");
        }
      }
    }

    deleteBookmark(id) {
      this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
      this.saveBookmarks();
      this.updateBadge();
      this.refreshList();
    }

    exportBookmarks() {
      const data = {
        bookmarks: this.bookmarks,
        folders: this.folders,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-bookmarks-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    updateBadge() {
      this.toggleBtn.querySelector(".bookmark-count").textContent =
        this.bookmarks.length;
    }

    refreshList(filter = "all", search = "") {
      this.panel.querySelector("#bm-list").innerHTML = this.renderBookmarkList(
        filter,
        search,
      );
    }

    bindEvents() {
      // Click outside
      document.addEventListener("click", (e) => {
        if (
          !this.panel.contains(e.target) &&
          !this.toggleBtn.contains(e.target)
        ) {
          this.closePanel();
        }
        if (
          !this.folderSelect.contains(e.target) &&
          !e.target.closest(".bael-bookmark-btn")
        ) {
          this.folderSelect.classList.remove("visible");
        }
      });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "K") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelMessageBookmarks = new BaelMessageBookmarks();
})();
