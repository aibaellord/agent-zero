/**
 * BAEL - LORD OF ALL
 * Memory Browser - Visual interface for agent memory exploration
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMemoryBrowser {
    constructor() {
      this.isVisible = false;
      this.memories = [];
      this.selectedMemory = null;
      this.searchQuery = "";
      this.filterType = "all";
      this.sortBy = "recent";
      this.viewMode = "grid";
      this.init();
    }

    init() {
      this.createUI();
      this.bindEvents();
      console.log("🧠 Bael Memory Browser initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-memory-browser-styles";
      styles.textContent = `
                .bael-memory-browser {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90%;
                    max-width: 900px;
                    height: 80%;
                    max-height: 700px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .bael-memory-browser.visible {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    pointer-events: all;
                }

                .bael-memory-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-memory-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-memory-title-icon {
                    font-size: 24px;
                }

                .bael-memory-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                .bael-memory-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-memory-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-memory-search {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    padding: 8px 12px;
                }

                .bael-memory-search input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .bael-memory-search-icon {
                    color: var(--bael-text-muted, #666);
                }

                .bael-memory-filters {
                    display: flex;
                    gap: 6px;
                }

                .bael-memory-filter {
                    padding: 6px 12px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    color: var(--bael-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-memory-filter.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-memory-view-toggle {
                    display: flex;
                    gap: 4px;
                    padding: 4px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-radius: 8px;
                }

                .bael-memory-view-btn {
                    width: 30px;
                    height: 30px;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .bael-memory-view-btn.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-memory-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                .bael-memory-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .bael-memory-list.grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 12px;
                    align-content: start;
                }

                .bael-memory-list.list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-memory-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-memory-card:hover {
                    border-color: rgba(255, 51, 102, 0.4);
                    transform: translateY(-2px);
                }

                .bael-memory-card.selected {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.05);
                }

                .bael-memory-card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                }

                .bael-memory-card-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .bael-memory-card-icon.conversation { background: rgba(59, 130, 246, 0.2); }
                .bael-memory-card-icon.solution { background: rgba(34, 197, 94, 0.2); }
                .bael-memory-card-icon.fact { background: rgba(234, 179, 8, 0.2); }
                .bael-memory-card-icon.knowledge { background: rgba(139, 92, 246, 0.2); }

                .bael-memory-card-type {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-memory-card-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 6px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .bael-memory-card-preview {
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                    line-height: 1.4;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                }

                .bael-memory-card-meta {
                    display: flex;
                    gap: 12px;
                    margin-top: 10px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-memory-detail {
                    width: 350px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-left: 1px solid var(--bael-border, #2a2a3a);
                    overflow-y: auto;
                    display: none;
                }

                .bael-memory-detail.visible {
                    display: block;
                }

                .bael-memory-detail-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-memory-detail-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 8px;
                }

                .bael-memory-detail-type {
                    display: inline-block;
                    padding: 3px 10px;
                    background: rgba(255, 51, 102, 0.2);
                    border-radius: 12px;
                    font-size: 11px;
                    color: var(--bael-accent, #ff3366);
                }

                .bael-memory-detail-content {
                    padding: 16px;
                }

                .bael-memory-detail-section {
                    margin-bottom: 16px;
                }

                .bael-memory-detail-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 6px;
                }

                .bael-memory-detail-text {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.6;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .bael-memory-detail-actions {
                    padding: 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    gap: 8px;
                }

                .bael-memory-action-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-memory-action-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    color: #fff;
                }

                .bael-memory-action-btn.secondary {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-memory-action-btn.danger {
                    background: transparent;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                }

                .bael-memory-action-btn:hover {
                    transform: translateY(-1px);
                }

                .bael-memory-trigger {
                    position: fixed;
                    bottom: 240px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
                    z-index: 7999;
                    transition: all 0.3s ease;
                }

                .bael-memory-trigger:hover {
                    transform: scale(1.08);
                }

                .bael-memory-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-memory-empty-icon {
                    font-size: 50px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .bael-memory-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 9999;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .bael-memory-overlay.visible {
                    opacity: 1;
                    pointer-events: all;
                }

                /* Stats bar */
                .bael-memory-stats {
                    display: flex;
                    gap: 20px;
                    padding: 12px 20px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                }

                .bael-memory-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bael-memory-stat-value {
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }
            `;
      document.head.appendChild(styles);

      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-memory-overlay";
      document.body.appendChild(this.overlay);

      // Browser
      this.browser = document.createElement("div");
      this.browser.className = "bael-memory-browser";
      this.browser.innerHTML = this.renderBrowser();
      document.body.appendChild(this.browser);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-memory-trigger";
      this.trigger.innerHTML = "🧠";
      this.trigger.title = "Memory Browser (Ctrl+Shift+M)";
      document.body.appendChild(this.trigger);

      // Load demo memories
      this.loadDemoMemories();
    }

    renderBrowser() {
      return `
                <div class="bael-memory-header">
                    <div class="bael-memory-title">
                        <span class="bael-memory-title-icon">🧠</span>
                        <span>Memory Browser</span>
                    </div>
                    <button class="bael-memory-close">✕</button>
                </div>
                <div class="bael-memory-toolbar">
                    <div class="bael-memory-search">
                        <span class="bael-memory-search-icon">🔍</span>
                        <input type="text" placeholder="Search memories..." id="memory-search">
                    </div>
                    <div class="bael-memory-filters">
                        <button class="bael-memory-filter active" data-type="all">All</button>
                        <button class="bael-memory-filter" data-type="conversation">💬 Chats</button>
                        <button class="bael-memory-filter" data-type="solution">✅ Solutions</button>
                        <button class="bael-memory-filter" data-type="fact">📝 Facts</button>
                        <button class="bael-memory-filter" data-type="knowledge">📚 Knowledge</button>
                    </div>
                    <div class="bael-memory-view-toggle">
                        <button class="bael-memory-view-btn active" data-view="grid" title="Grid View">⊞</button>
                        <button class="bael-memory-view-btn" data-view="list" title="List View">☰</button>
                    </div>
                </div>
                <div class="bael-memory-content">
                    <div class="bael-memory-list grid" id="memory-list">
                        ${this.renderMemoryList()}
                    </div>
                    <div class="bael-memory-detail" id="memory-detail">
                        <!-- Detail view populated dynamically -->
                    </div>
                </div>
                <div class="bael-memory-stats">
                    <div class="bael-memory-stat">
                        <span>Total:</span>
                        <span class="bael-memory-stat-value" id="stat-total">0</span>
                    </div>
                    <div class="bael-memory-stat">
                        <span>Conversations:</span>
                        <span class="bael-memory-stat-value" id="stat-conversations">0</span>
                    </div>
                    <div class="bael-memory-stat">
                        <span>Solutions:</span>
                        <span class="bael-memory-stat-value" id="stat-solutions">0</span>
                    </div>
                    <div class="bael-memory-stat">
                        <span>Facts:</span>
                        <span class="bael-memory-stat-value" id="stat-facts">0</span>
                    </div>
                </div>
            `;
    }

    loadDemoMemories() {
      this.memories = [
        {
          id: "m1",
          type: "conversation",
          title: "Python debugging session",
          content:
            "User asked about debugging Python async code. Discussed using breakpoints, asyncio.run(), and proper exception handling in coroutines.",
          timestamp: Date.now() - 3600000,
          tokens: 450,
          tags: ["python", "debugging", "async"],
        },
        {
          id: "m2",
          type: "solution",
          title: "Fix for database connection timeout",
          content:
            "Implemented connection pooling with retry logic. Set max_connections=10, timeout=30s, and added exponential backoff for reconnection attempts.",
          timestamp: Date.now() - 7200000,
          tokens: 280,
          tags: ["database", "postgresql", "connection"],
        },
        {
          id: "m3",
          type: "fact",
          title: "User prefers dark mode",
          content:
            "User explicitly mentioned they prefer dark mode interfaces and find bright colors harsh on their eyes.",
          timestamp: Date.now() - 86400000,
          tokens: 45,
          tags: ["preference", "ui"],
        },
        {
          id: "m4",
          type: "knowledge",
          title: "React hooks best practices",
          content:
            "Comprehensive guide on using useState, useEffect, useCallback, and useMemo. Includes performance optimization tips and common pitfalls to avoid.",
          timestamp: Date.now() - 172800000,
          tokens: 890,
          tags: ["react", "hooks", "javascript"],
        },
        {
          id: "m5",
          type: "solution",
          title: "CSS Grid responsive layout",
          content:
            "Created responsive dashboard layout using CSS Grid with auto-fill and minmax(). Works seamlessly from mobile to 4K displays.",
          timestamp: Date.now() - 259200000,
          tokens: 320,
          tags: ["css", "grid", "responsive"],
        },
        {
          id: "m6",
          type: "conversation",
          title: "API design discussion",
          content:
            "Discussed RESTful API design principles, versioning strategies, and authentication methods. User decided on JWT with refresh tokens.",
          timestamp: Date.now() - 345600000,
          tokens: 560,
          tags: ["api", "rest", "jwt"],
        },
      ];

      this.refreshList();
      this.updateStats();
    }

    renderMemoryList() {
      let filtered = this.memories.filter((mem) => {
        if (this.filterType !== "all" && mem.type !== this.filterType)
          return false;
        if (
          this.searchQuery &&
          !mem.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          !mem.content.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
          return false;
        return true;
      });

      if (filtered.length === 0) {
        return `
                    <div class="bael-memory-empty">
                        <div class="bael-memory-empty-icon">🧠</div>
                        <div>No memories found</div>
                        <div style="font-size: 12px; margin-top: 8px;">Try adjusting your filters or search</div>
                    </div>
                `;
      }

      return filtered
        .map(
          (mem) => `
                <div class="bael-memory-card ${this.selectedMemory?.id === mem.id ? "selected" : ""}" data-id="${mem.id}">
                    <div class="bael-memory-card-header">
                        <div class="bael-memory-card-icon ${mem.type}">
                            ${this.getTypeIcon(mem.type)}
                        </div>
                        <span class="bael-memory-card-type">${mem.type}</span>
                    </div>
                    <div class="bael-memory-card-title">${mem.title}</div>
                    <div class="bael-memory-card-preview">${mem.content}</div>
                    <div class="bael-memory-card-meta">
                        <span>🕐 ${this.formatTime(mem.timestamp)}</span>
                        <span>📊 ${mem.tokens} tokens</span>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderDetail(memory) {
      return `
                <div class="bael-memory-detail-header">
                    <div class="bael-memory-detail-title">${memory.title}</div>
                    <span class="bael-memory-detail-type">${memory.type}</span>
                </div>
                <div class="bael-memory-detail-content">
                    <div class="bael-memory-detail-section">
                        <div class="bael-memory-detail-label">Content</div>
                        <div class="bael-memory-detail-text">${memory.content}</div>
                    </div>
                    <div class="bael-memory-detail-section">
                        <div class="bael-memory-detail-label">Tags</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            ${memory.tags.map((tag) => `<span style="padding: 3px 8px; background: rgba(255,51,102,0.1); border-radius: 10px; font-size: 11px; color: var(--bael-accent);">#${tag}</span>`).join("")}
                        </div>
                    </div>
                    <div class="bael-memory-detail-section">
                        <div class="bael-memory-detail-label">Metadata</div>
                        <div class="bael-memory-detail-text">
ID: ${memory.id}
Created: ${new Date(memory.timestamp).toLocaleString()}
Tokens: ${memory.tokens}
                        </div>
                    </div>
                </div>
                <div class="bael-memory-detail-actions">
                    <button class="bael-memory-action-btn secondary" data-action="copy">📋 Copy</button>
                    <button class="bael-memory-action-btn primary" data-action="use">💬 Use in Chat</button>
                    <button class="bael-memory-action-btn danger" data-action="delete">🗑️</button>
                </div>
            `;
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());
      this.overlay.addEventListener("click", () => this.hide());

      // Close
      this.browser
        .querySelector(".bael-memory-close")
        .addEventListener("click", () => this.hide());

      // Search
      this.browser
        .querySelector("#memory-search")
        .addEventListener("input", (e) => {
          this.searchQuery = e.target.value;
          this.refreshList();
        });

      // Filter
      this.browser
        .querySelector(".bael-memory-filters")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-memory-filter")) {
            this.browser
              .querySelectorAll(".bael-memory-filter")
              .forEach((f) => f.classList.remove("active"));
            e.target.classList.add("active");
            this.filterType = e.target.dataset.type;
            this.refreshList();
          }
        });

      // View toggle
      this.browser
        .querySelector(".bael-memory-view-toggle")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-memory-view-btn")) {
            this.browser
              .querySelectorAll(".bael-memory-view-btn")
              .forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");
            this.viewMode = e.target.dataset.view;
            const list = this.browser.querySelector("#memory-list");
            list.classList.remove("grid", "list");
            list.classList.add(this.viewMode);
          }
        });

      // Card click
      this.browser
        .querySelector("#memory-list")
        .addEventListener("click", (e) => {
          const card = e.target.closest(".bael-memory-card");
          if (card) {
            const memory = this.memories.find((m) => m.id === card.dataset.id);
            this.selectMemory(memory);
          }
        });

      // Detail actions
      this.browser
        .querySelector("#memory-detail")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".bael-memory-action-btn");
          if (!btn || !this.selectedMemory) return;

          const action = btn.dataset.action;
          if (action === "copy") {
            navigator.clipboard.writeText(this.selectedMemory.content);
            if (window.BaelNotifications)
              window.BaelNotifications.success("Copied to clipboard!");
          } else if (action === "use") {
            // Insert into chat
            document.dispatchEvent(
              new CustomEvent("bael-insert-text", {
                detail: { text: this.selectedMemory.content },
              }),
            );
            this.hide();
          } else if (action === "delete") {
            this.deleteMemory(this.selectedMemory.id);
          }
        });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "M") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      });
    }

    selectMemory(memory) {
      this.selectedMemory = memory;
      this.refreshList();

      const detail = this.browser.querySelector("#memory-detail");
      detail.innerHTML = this.renderDetail(memory);
      detail.classList.add("visible");
    }

    deleteMemory(id) {
      if (confirm("Delete this memory?")) {
        this.memories = this.memories.filter((m) => m.id !== id);
        this.selectedMemory = null;
        this.browser
          .querySelector("#memory-detail")
          .classList.remove("visible");
        this.refreshList();
        this.updateStats();
        if (window.BaelNotifications)
          window.BaelNotifications.info("Memory deleted");
      }
    }

    refreshList() {
      this.browser.querySelector("#memory-list").innerHTML =
        this.renderMemoryList();
    }

    updateStats() {
      const stats = {
        total: this.memories.length,
        conversations: this.memories.filter((m) => m.type === "conversation")
          .length,
        solutions: this.memories.filter((m) => m.type === "solution").length,
        facts: this.memories.filter((m) => m.type === "fact").length,
      };

      this.browser.querySelector("#stat-total").textContent = stats.total;
      this.browser.querySelector("#stat-conversations").textContent =
        stats.conversations;
      this.browser.querySelector("#stat-solutions").textContent =
        stats.solutions;
      this.browser.querySelector("#stat-facts").textContent = stats.facts;
    }

    toggle() {
      if (this.isVisible) this.hide();
      else this.show();
    }

    show() {
      this.isVisible = true;
      this.browser.classList.add("visible");
      this.overlay.classList.add("visible");
      this.browser.querySelector("#memory-search").focus();
    }

    hide() {
      this.isVisible = false;
      this.browser.classList.remove("visible");
      this.overlay.classList.remove("visible");
    }

    getTypeIcon(type) {
      const icons = {
        conversation: "💬",
        solution: "✅",
        fact: "📝",
        knowledge: "📚",
      };
      return icons[type] || "📄";
    }

    formatTime(timestamp) {
      const diff = Date.now() - timestamp;
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }
  }

  window.BaelMemoryBrowser = new BaelMemoryBrowser();
})();
