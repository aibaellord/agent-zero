/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███████╗███████╗███████╗██╗ ██████╗ ███╗   ██╗                  █
 * █  ██╔════╝██╔════╝██╔════╝██╔════╝██║██╔═══██╗████╗  ██║                  █
 * █  ███████╗█████╗  ███████╗███████╗██║██║   ██║██╔██╗ ██║                  █
 * █  ╚════██║██╔══╝  ╚════██║╚════██║██║██║   ██║██║╚██╗██║                  █
 * █  ███████║███████╗███████║███████║██║╚██████╔╝██║ ╚████║                  █
 * █  ╚══════╝╚══════╝╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝                  █
 * █   ███╗   ██╗ ██████╗ ████████╗███████╗███████╗                           █
 * █   ████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝                           █
 * █   ██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗                           █
 * █   ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║                           █
 * █   ██║ ╚████║╚██████╔╝   ██║   ███████╗███████║                           █
 * █   ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝                           █
 * █                                                                          █
 * █   BAEL SESSION NOTES - Quick Notes & Annotations During Chat Sessions   █
 * █   Take notes, add bookmarks, and export session highlights              █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelSessionNotes {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.panelExpanded = false;
      this.notes = [];
      this.bookmarks = [];
      this.tags = ["important", "todo", "idea", "question", "solution", "bug"];
      this.activeTab = "notes";
      this.storageKey = "bael-session-notes";
    }

    async initialize() {
      console.log("📝 Bael Session Notes initializing...");

      this.loadFromStorage();
      this.injectStyles();
      this.createWidget();
      this.createPanel();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL SESSION NOTES READY (Ctrl+Shift+N)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-session-notes-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-session-notes-styles";
      styles.textContent = `
                /* Widget Button */
                .bael-notes-widget {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    border: none;
                    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
                    cursor: pointer;
                    z-index: 9500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    transition: all 0.3s;
                }

                .bael-notes-widget:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(245, 158, 11, 0.5);
                }

                .bael-notes-widget .badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #ef4444;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Notes Panel */
                .bael-notes-panel {
                    position: fixed;
                    bottom: 140px;
                    right: 20px;
                    width: 380px;
                    max-height: 500px;
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 9501;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-notes-panel.visible {
                    display: flex;
                    animation: notesSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes notesSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .notes-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .notes-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .notes-actions {
                    display: flex;
                    gap: 6px;
                }

                .notes-action-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 14px;
                }

                .notes-action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Tabs */
                .notes-tabs {
                    display: flex;
                    padding: 8px 12px;
                    gap: 6px;
                    background: rgba(255, 255, 255, 0.02);
                }

                .notes-tab {
                    flex: 1;
                    padding: 8px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .notes-tab.active {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }

                .notes-tab:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.05);
                }

                /* Quick Add */
                .notes-quick-add {
                    padding: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .quick-add-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                    margin-bottom: 8px;
                }

                .quick-add-input:focus {
                    border-color: rgba(245, 158, 11, 0.5);
                }

                .quick-add-tags {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .quick-tag {
                    padding: 4px 10px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: transparent;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quick-tag:hover, .quick-tag.selected {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: rgba(245, 158, 11, 0.5);
                    color: #f59e0b;
                }

                /* Notes List */
                .notes-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                    max-height: 280px;
                }

                .note-item {
                    display: flex;
                    gap: 10px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    margin-bottom: 6px;
                    transition: all 0.2s;
                }

                .note-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .note-color {
                    width: 4px;
                    border-radius: 2px;
                    flex-shrink: 0;
                }

                .note-content {
                    flex: 1;
                    min-width: 0;
                }

                .note-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.4;
                    margin-bottom: 6px;
                    word-wrap: break-word;
                }

                .note-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .note-tag {
                    padding: 2px 8px;
                    border-radius: 10px;
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }

                .note-delete {
                    margin-left: auto;
                    width: 22px;
                    height: 22px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.2s;
                }

                .note-item:hover .note-delete {
                    opacity: 1;
                }

                .note-delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                /* Empty State */
                .notes-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .notes-empty-icon {
                    font-size: 36px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                /* Bookmarks */
                .bookmark-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bookmark-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .bookmark-icon {
                    font-size: 16px;
                }

                .bookmark-info {
                    flex: 1;
                    min-width: 0;
                }

                .bookmark-title {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.9);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bookmark-time {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                /* Footer */
                .notes-footer {
                    display: flex;
                    gap: 8px;
                    padding: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .notes-footer-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .notes-footer-btn.primary {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: #fff;
                }

                .notes-footer-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .notes-footer-btn:hover {
                    opacity: 0.9;
                }

                /* Tag colors */
                .tag-important { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .tag-todo { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .tag-idea { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
                .tag-question { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
                .tag-solution { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .tag-bug { background: rgba(239, 68, 68, 0.15); color: #f87171; }

                .color-important { background: #ef4444; }
                .color-todo { background: #3b82f6; }
                .color-idea { background: #a855f7; }
                .color-question { background: #f59e0b; }
                .color-solution { background: #10b981; }
                .color-bug { background: #f87171; }
            `;
      document.head.appendChild(styles);
    }

    createWidget() {
      this.widget = document.createElement("button");
      this.widget.className = "bael-notes-widget";
      this.widget.innerHTML = "📝";
      this.widget.title = "Session Notes (Ctrl+Shift+N)";
      this.widget.onclick = () => this.toggle();

      this.updateBadge();
      document.body.appendChild(this.widget);
    }

    createPanel() {
      this.panel = document.createElement("div");
      this.panel.className = "bael-notes-panel";
      this.renderPanel();
      document.body.appendChild(this.panel);
    }

    renderPanel() {
      this.panel.innerHTML = `
                <div class="notes-header">
                    <div class="notes-title">
                        <span>📝</span>
                        Session Notes
                    </div>
                    <div class="notes-actions">
                        <button class="notes-action-btn" onclick="BaelSessionNotes.exportNotes()" title="Export">
                            📤
                        </button>
                        <button class="notes-action-btn" onclick="BaelSessionNotes.clearAll()" title="Clear All">
                            🗑️
                        </button>
                        <button class="notes-action-btn" onclick="BaelSessionNotes.hide()" title="Close">
                            ✕
                        </button>
                    </div>
                </div>

                <div class="notes-tabs">
                    <button class="notes-tab ${this.activeTab === "notes" ? "active" : ""}"
                            onclick="BaelSessionNotes.switchTab('notes')">
                        📝 Notes (${this.notes.length})
                    </button>
                    <button class="notes-tab ${this.activeTab === "bookmarks" ? "active" : ""}"
                            onclick="BaelSessionNotes.switchTab('bookmarks')">
                        🔖 Bookmarks (${this.bookmarks.length})
                    </button>
                </div>

                <div class="notes-quick-add">
                    <input type="text"
                           class="quick-add-input"
                           id="quick-note-input"
                           placeholder="Quick note... (Press Enter to add)">
                    <div class="quick-add-tags">
                        ${this.tags
                          .map(
                            (tag) => `
                            <button class="quick-tag"
                                    data-tag="${tag}"
                                    onclick="BaelSessionNotes.selectTag('${tag}')">
                                ${tag}
                            </button>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="notes-list" id="notes-list-container">
                    ${this.renderItems()}
                </div>

                <div class="notes-footer">
                    <button class="notes-footer-btn secondary" onclick="BaelSessionNotes.bookmarkCurrent()">
                        🔖 Bookmark Here
                    </button>
                    <button class="notes-footer-btn primary" onclick="BaelSessionNotes.addNote()">
                        ➕ Add Note
                    </button>
                </div>
            `;

      // Setup input listener
      setTimeout(() => {
        const input = document.getElementById("quick-note-input");
        if (input) {
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && input.value.trim()) {
              this.addNote();
            }
          });
        }
      }, 0);
    }

    renderItems() {
      if (this.activeTab === "notes") {
        return this.renderNotes();
      } else {
        return this.renderBookmarks();
      }
    }

    renderNotes() {
      if (this.notes.length === 0) {
        return `
                    <div class="notes-empty">
                        <div class="notes-empty-icon">📝</div>
                        <div>No notes yet</div>
                        <div style="font-size: 12px; margin-top: 4px;">Type above to add a note</div>
                    </div>
                `;
      }

      return this.notes
        .map(
          (note, index) => `
                <div class="note-item">
                    <div class="note-color color-${note.tag || "idea"}"></div>
                    <div class="note-content">
                        <div class="note-text">${this.escapeHtml(note.text)}</div>
                        <div class="note-meta">
                            <span class="note-tag tag-${note.tag || "idea"}">${note.tag || "note"}</span>
                            <span>${this.formatTime(note.timestamp)}</span>
                        </div>
                    </div>
                    <button class="note-delete" onclick="BaelSessionNotes.deleteNote(${index})">✕</button>
                </div>
            `,
        )
        .join("");
    }

    renderBookmarks() {
      if (this.bookmarks.length === 0) {
        return `
                    <div class="notes-empty">
                        <div class="notes-empty-icon">🔖</div>
                        <div>No bookmarks yet</div>
                        <div style="font-size: 12px; margin-top: 4px;">Click "Bookmark Here" to mark this spot</div>
                    </div>
                `;
      }

      return this.bookmarks
        .map(
          (bookmark, index) => `
                <div class="bookmark-item" onclick="BaelSessionNotes.scrollToBookmark(${index})">
                    <span class="bookmark-icon">🔖</span>
                    <div class="bookmark-info">
                        <div class="bookmark-title">${this.escapeHtml(bookmark.title)}</div>
                        <div class="bookmark-time">${this.formatTime(bookmark.timestamp)}</div>
                    </div>
                    <button class="note-delete" onclick="event.stopPropagation(); BaelSessionNotes.deleteBookmark(${index})">✕</button>
                </div>
            `,
        )
        .join("");
    }

    switchTab(tab) {
      this.activeTab = tab;
      this.renderPanel();
    }

    selectTag(tag) {
      this.selectedTag = this.selectedTag === tag ? null : tag;

      document.querySelectorAll(".quick-tag").forEach((btn) => {
        btn.classList.toggle("selected", btn.dataset.tag === this.selectedTag);
      });
    }

    addNote() {
      const input = document.getElementById("quick-note-input");
      const text = input?.value.trim();

      if (!text) return;

      this.notes.unshift({
        id: Date.now(),
        text: text,
        tag: this.selectedTag || "idea",
        timestamp: Date.now(),
      });

      input.value = "";
      this.selectedTag = null;
      this.saveToStorage();
      this.renderPanel();
      this.updateBadge();
    }

    deleteNote(index) {
      this.notes.splice(index, 1);
      this.saveToStorage();
      this.renderPanel();
      this.updateBadge();
    }

    bookmarkCurrent() {
      // Get last message or current scroll position context
      const messages = document.querySelectorAll(
        ".message-bubble, .chat-message",
      );
      const lastMsg = messages[messages.length - 1];

      const title =
        lastMsg?.textContent?.slice(0, 50) + "..." || "Bookmarked position";

      this.bookmarks.unshift({
        id: Date.now(),
        title: title,
        scrollPosition: window.scrollY,
        messageIndex: messages.length,
        timestamp: Date.now(),
      });

      this.saveToStorage();
      this.renderPanel();
      this.showToast("🔖 Bookmark added!");
    }

    deleteBookmark(index) {
      this.bookmarks.splice(index, 1);
      this.saveToStorage();
      this.renderPanel();
    }

    scrollToBookmark(index) {
      const bookmark = this.bookmarks[index];
      if (bookmark) {
        window.scrollTo({ top: bookmark.scrollPosition, behavior: "smooth" });
      }
    }

    exportNotes() {
      const data = {
        notes: this.notes,
        bookmarks: this.bookmarks,
        exportedAt: new Date().toISOString(),
      };

      // Create markdown export
      let md = `# Session Notes Export\n`;
      md += `Exported: ${new Date().toLocaleString()}\n\n`;

      if (this.notes.length > 0) {
        md += `## Notes\n\n`;
        this.notes.forEach((note) => {
          md += `- **[${note.tag}]** ${note.text} _(${this.formatTime(note.timestamp)})_\n`;
        });
      }

      if (this.bookmarks.length > 0) {
        md += `\n## Bookmarks\n\n`;
        this.bookmarks.forEach((bm) => {
          md += `- 🔖 ${bm.title} _(${this.formatTime(bm.timestamp)})_\n`;
        });
      }

      // Copy to clipboard
      navigator.clipboard.writeText(md);
      this.showToast("📤 Notes exported to clipboard!");
    }

    clearAll() {
      if (confirm("Clear all notes and bookmarks?")) {
        this.notes = [];
        this.bookmarks = [];
        this.saveToStorage();
        this.renderPanel();
        this.updateBadge();
      }
    }

    updateBadge() {
      const total = this.notes.length + this.bookmarks.length;
      const existingBadge = this.widget.querySelector(".badge");

      if (total > 0) {
        if (existingBadge) {
          existingBadge.textContent = total;
        } else {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = total;
          this.widget.appendChild(badge);
        }
      } else if (existingBadge) {
        existingBadge.remove();
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

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 200px;
                right: 20px;
                background: rgba(16, 185, 129, 0.9);
                color: #fff;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            notes: this.notes,
            bookmarks: this.bookmarks,
          }),
        );
      } catch (e) {
        console.error("Failed to save notes:", e);
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.notes = data.notes || [];
          this.bookmarks = data.bookmarks || [];
        }
      } catch (e) {
        console.error("Failed to load notes:", e);
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "N") {
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
      this.renderPanel();
      this.panel.classList.add("visible");

      setTimeout(() => {
        document.getElementById("quick-note-input")?.focus();
      }, 50);
    }

    hide() {
      this.visible = false;
      this.panel.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelSessionNotes = new BaelSessionNotes();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSessionNotes.initialize();
    });
  } else {
    window.BaelSessionNotes.initialize();
  }

  console.log("📝 Bael Session Notes loaded");
})();
