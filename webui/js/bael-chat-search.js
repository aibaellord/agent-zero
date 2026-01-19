/**
 * BAEL - LORD OF ALL
 * Chat Search & Favorites - Advanced search and bookmark system
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelChatSearch {
    constructor() {
      this.isOpen = false;
      this.container = null;
      this.searchResults = [];
      this.favorites = this.loadFavorites();
      this.searchHistory = this.loadSearchHistory();
      this.activeTab = "search"; // search, favorites, history
      this.init();
    }

    init() {
      this.createSearchPanel();
      this.registerShortcuts();
      console.log("⚡ Bael Chat Search & Favorites initialized");
    }

    createSearchPanel() {
      const panel = document.createElement("div");
      panel.id = "bael-chat-search";
      panel.className = "bael-chat-search";
      panel.innerHTML = `
                <div class="chat-search-overlay"></div>
                <div class="chat-search-modal">
                    <div class="chat-search-header">
                        <div class="chat-search-tabs">
                            <button class="search-tab active" data-tab="search">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                Search
                            </button>
                            <button class="search-tab" data-tab="favorites">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                Favorites
                            </button>
                            <button class="search-tab" data-tab="history">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                History
                            </button>
                        </div>
                        <button class="chat-search-close" title="Close (Escape)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>

                    <div class="chat-search-input-container">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text"
                               class="chat-search-input"
                               placeholder="Search messages, chats, or content..."
                               autocomplete="off"
                               spellcheck="false">
                        <div class="search-filters">
                            <button class="filter-btn active" data-filter="all" title="All">All</button>
                            <button class="filter-btn" data-filter="user" title="My Messages">Me</button>
                            <button class="filter-btn" data-filter="assistant" title="AI Messages">AI</button>
                        </div>
                    </div>

                    <div class="chat-search-body">
                        <!-- Search Tab -->
                        <div class="search-content" data-content="search">
                            <div class="search-results-info"></div>
                            <div class="search-results"></div>
                            <div class="search-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <span>Enter a search term to find messages</span>
                            </div>
                        </div>

                        <!-- Favorites Tab -->
                        <div class="search-content hidden" data-content="favorites">
                            <div class="favorites-list"></div>
                            <div class="favorites-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                <span>No favorite messages yet</span>
                                <p>Click the star icon on any message to add it to favorites</p>
                            </div>
                        </div>

                        <!-- History Tab -->
                        <div class="search-content hidden" data-content="history">
                            <div class="history-list"></div>
                            <div class="history-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <span>No search history yet</span>
                            </div>
                        </div>
                    </div>

                    <div class="chat-search-footer">
                        <div class="search-shortcuts">
                            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                            <span><kbd>Enter</kbd> Open</span>
                            <span><kbd>Ctrl+F</kbd> Toggle</span>
                        </div>
                        <div class="search-stats"></div>
                    </div>
                </div>
            `;

      document.body.appendChild(panel);
      this.container = panel;

      this.bindEvents();
      this.addStyles();
    }

    addStyles() {
      if (document.getElementById("bael-chat-search-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-chat-search-styles";
      styles.textContent = `
                .bael-chat-search {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    display: none;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 10vh;
                }

                .bael-chat-search.open {
                    display: flex;
                }

                .chat-search-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.2s ease;
                }

                .chat-search-modal {
                    position: relative;
                    width: 90%;
                    max-width: 700px;
                    max-height: 70vh;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 16px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .chat-search-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .chat-search-tabs {
                    display: flex;
                    gap: 4px;
                }

                .search-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .search-tab:hover {
                    background: var(--bael-bg-tertiary, #1a1a25);
                    color: var(--bael-text-primary, #fff);
                }

                .search-tab.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .chat-search-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .chat-search-close:hover {
                    background: #ff4444;
                    color: #fff;
                }

                .chat-search-input-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .chat-search-input-container svg {
                    color: var(--bael-text-muted, #666);
                    flex-shrink: 0;
                }

                .chat-search-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-primary, #fff);
                    font-size: 16px;
                    outline: none;
                }

                .chat-search-input::placeholder {
                    color: var(--bael-text-muted, #666);
                }

                .search-filters {
                    display: flex;
                    gap: 4px;
                }

                .filter-btn {
                    padding: 4px 10px;
                    border: none;
                    border-radius: 4px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    color: var(--bael-text-secondary, #888);
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .filter-btn:hover {
                    color: var(--bael-text-primary, #fff);
                }

                .filter-btn.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .chat-search-body {
                    flex: 1;
                    overflow-y: auto;
                    min-height: 300px;
                }

                .search-content {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .search-content.hidden {
                    display: none;
                }

                .search-results-info {
                    padding: 8px 16px;
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    border-bottom: 1px solid var(--bael-border-dim, #1a1a25);
                }

                .search-results,
                .favorites-list,
                .history-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .search-empty,
                .favorites-empty,
                .history-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 12px;
                    color: var(--bael-text-muted, #666);
                    text-align: center;
                    padding: 40px;
                }

                .search-empty svg,
                .favorites-empty svg,
                .history-empty svg {
                    opacity: 0.5;
                }

                .search-empty span,
                .favorites-empty span,
                .history-empty span {
                    font-size: 14px;
                }

                .search-empty p,
                .favorites-empty p {
                    font-size: 12px;
                    max-width: 280px;
                }

                .search-result-item,
                .favorite-item,
                .history-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border-dim, #1a1a25);
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .search-result-item:hover,
                .favorite-item:hover,
                .history-item:hover {
                    background: var(--bael-bg-tertiary, #1a1a25);
                }

                .search-result-item.selected {
                    background: var(--bael-accent-dim, rgba(255, 51, 102, 0.1));
                    border-left: 3px solid var(--bael-accent, #ff3366);
                }

                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .result-chat-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                }

                .result-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .result-role {
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .result-role.user {
                    background: var(--bael-accent-dim, rgba(255, 51, 102, 0.1));
                    color: var(--bael-accent, #ff3366);
                }

                .result-role.assistant {
                    background: rgba(0, 255, 204, 0.1);
                    color: var(--bael-secondary, #00ffcc);
                }

                .result-content {
                    font-size: 13px;
                    line-height: 1.5;
                    color: var(--bael-text-primary, #fff);
                }

                .result-content mark {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    padding: 0 2px;
                    border-radius: 2px;
                }

                .result-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }

                .result-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border: none;
                    border-radius: 4px;
                    background: var(--bael-bg-secondary, #12121a);
                    color: var(--bael-text-secondary, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .result-action-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .result-action-btn.favorited {
                    color: #ffcc00;
                }

                .chat-search-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .search-shortcuts {
                    display: flex;
                    gap: 16px;
                }

                .search-shortcuts span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .search-shortcuts kbd {
                    padding: 2px 5px;
                    border-radius: 4px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 10px;
                    font-family: inherit;
                }

                .history-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .history-query {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .history-query svg {
                    color: var(--bael-text-muted, #666);
                }

                .history-time {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .history-delete {
                    width: 24px;
                    height: 24px;
                    border: none;
                    border-radius: 4px;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.2s ease;
                }

                .history-item:hover .history-delete {
                    opacity: 1;
                }

                .history-delete:hover {
                    background: #ff4444;
                    color: #fff;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close button
      this.container
        .querySelector(".chat-search-close")
        .addEventListener("click", () => this.close());

      // Overlay click
      this.container
        .querySelector(".chat-search-overlay")
        .addEventListener("click", () => this.close());

      // Tab switching
      this.container.querySelectorAll(".search-tab").forEach((tab) => {
        tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
      });

      // Search input
      const input = this.container.querySelector(".chat-search-input");
      let debounceTimer;
      input.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.search(e.target.value);
        }, 200);
      });

      // Filter buttons
      this.container.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.container
            .querySelectorAll(".filter-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.search(input.value);
        });
      });

      // Keyboard navigation
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.close();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateResults(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateResults(-1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.openSelectedResult();
        }
      });

      // Escape to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.container.classList.add("open");

      // Focus input
      setTimeout(() => {
        this.container.querySelector(".chat-search-input").focus();
      }, 100);

      // Load current tab content
      this.refreshTabContent();

      window.dispatchEvent(new CustomEvent("bael:search:opened"));
    }

    close() {
      this.isOpen = false;
      this.container.classList.remove("open");
      this.container.querySelector(".chat-search-input").value = "";
      window.dispatchEvent(new CustomEvent("bael:search:closed"));
    }

    switchTab(tab) {
      this.activeTab = tab;

      // Update tab buttons
      this.container.querySelectorAll(".search-tab").forEach((t) => {
        t.classList.toggle("active", t.dataset.tab === tab);
      });

      // Update content visibility
      this.container.querySelectorAll(".search-content").forEach((c) => {
        c.classList.toggle("hidden", c.dataset.content !== tab);
      });

      // Refresh tab content
      this.refreshTabContent();
    }

    refreshTabContent() {
      switch (this.activeTab) {
        case "favorites":
          this.renderFavorites();
          break;
        case "history":
          this.renderHistory();
          break;
        default:
          // Search tab - show empty state
          break;
      }
    }

    async search(query) {
      if (!query.trim()) {
        this.showEmptyState();
        return;
      }

      const filter =
        this.container.querySelector(".filter-btn.active")?.dataset.filter ||
        "all";

      // Add to search history
      this.addToHistory(query);

      try {
        // Search through chats
        const results = await this.performSearch(query, filter);
        this.renderResults(results, query);
      } catch (e) {
        console.error("Search error:", e);
        this.showEmptyState();
      }
    }

    async performSearch(query, filter) {
      const results = [];
      const queryLower = query.toLowerCase();

      try {
        // Try to get chats from Alpine store
        const chats = Alpine.store("chats")?.all || [];

        for (const chat of chats) {
          try {
            // Fetch messages for each chat
            const response = await fetch(
              `/get_chat_messages?chat_id=${chat.id}`,
            );
            if (!response.ok) continue;

            const data = await response.json();
            const messages = data.messages || [];

            for (const msg of messages) {
              // Apply role filter
              if (filter !== "all" && msg.role !== filter) continue;

              // Search in content
              if (msg.content?.toLowerCase().includes(queryLower)) {
                results.push({
                  chatId: chat.id,
                  chatTitle: chat.title || `Chat ${chat.id}`,
                  messageId: msg.id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: msg.timestamp,
                });
              }
            }
          } catch (e) {
            // Skip this chat if error
          }
        }
      } catch (e) {
        console.error("Error searching chats:", e);
      }

      return results;
    }

    renderResults(results, query) {
      const container = this.container.querySelector(".search-results");
      const infoEl = this.container.querySelector(".search-results-info");
      const emptyEl = this.container.querySelector(".search-empty");

      if (results.length === 0) {
        container.innerHTML = "";
        infoEl.textContent = "";
        emptyEl.style.display = "flex";
        emptyEl.querySelector("span").textContent =
          `No results found for "${query}"`;
        return;
      }

      emptyEl.style.display = "none";
      infoEl.textContent = `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`;

      container.innerHTML = results
        .map(
          (result, index) => `
                <div class="search-result-item" data-index="${index}" data-chat-id="${result.chatId}">
                    <div class="result-header">
                        <span class="result-chat-title">${this.escapeHtml(result.chatTitle)}</span>
                        <div class="result-meta">
                            <span class="result-role ${result.role}">${result.role}</span>
                            ${result.timestamp ? `<span>${this.formatTime(result.timestamp)}</span>` : ""}
                        </div>
                    </div>
                    <div class="result-content">
                        ${this.highlightQuery(this.truncate(result.content, 200), query)}
                    </div>
                    <div class="result-actions">
                        <button class="result-action-btn" data-action="favorite" data-result='${JSON.stringify(result).replace(/'/g, "&#39;")}'>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Favorite
                        </button>
                        <button class="result-action-btn" data-action="copy" data-content="${this.escapeHtml(result.content)}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            Copy
                        </button>
                    </div>
                </div>
            `,
        )
        .join("");

      this.searchResults = results;

      // Bind result actions
      container.querySelectorAll(".result-action-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          if (action === "favorite") {
            const result = JSON.parse(btn.dataset.result);
            this.addToFavorites(result);
          } else if (action === "copy") {
            navigator.clipboard.writeText(btn.dataset.content);
            if (window.Bael?.notifications) {
              window.Bael.notifications.success("Copied to clipboard");
            }
          }
        });
      });

      // Bind result click
      container.querySelectorAll(".search-result-item").forEach((item) => {
        item.addEventListener("click", () => {
          const chatId = item.dataset.chatId;
          this.openChat(chatId);
        });
      });
    }

    showEmptyState() {
      const container = this.container.querySelector(".search-results");
      const infoEl = this.container.querySelector(".search-results-info");
      const emptyEl = this.container.querySelector(".search-empty");

      container.innerHTML = "";
      infoEl.textContent = "";
      emptyEl.style.display = "flex";
      emptyEl.querySelector("span").textContent =
        "Enter a search term to find messages";
    }

    navigateResults(direction) {
      const items = this.container.querySelectorAll(".search-result-item");
      if (items.length === 0) return;

      const selected = this.container.querySelector(
        ".search-result-item.selected",
      );
      let newIndex = 0;

      if (selected) {
        const currentIndex = parseInt(selected.dataset.index);
        newIndex = currentIndex + direction;
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
        selected.classList.remove("selected");
      }

      items[newIndex].classList.add("selected");
      items[newIndex].scrollIntoView({ block: "nearest" });
    }

    openSelectedResult() {
      const selected = this.container.querySelector(
        ".search-result-item.selected",
      );
      if (selected) {
        const chatId = selected.dataset.chatId;
        this.openChat(chatId);
      }
    }

    openChat(chatId) {
      try {
        // Try to navigate to chat
        if (Alpine.store("chats")?.select) {
          Alpine.store("chats").select(chatId);
        }
      } catch (e) {
        console.error("Could not open chat:", e);
      }
      this.close();
    }

    // Favorites management
    addToFavorites(result) {
      const key = `${result.chatId}-${result.messageId}`;
      if (!this.favorites.find((f) => `${f.chatId}-${f.messageId}` === key)) {
        result.favoritedAt = Date.now();
        this.favorites.unshift(result);
        this.saveFavorites();

        if (window.Bael?.notifications) {
          window.Bael.notifications.success("Added to favorites");
        }
      }
    }

    removeFromFavorites(chatId, messageId) {
      const key = `${chatId}-${messageId}`;
      this.favorites = this.favorites.filter(
        (f) => `${f.chatId}-${f.messageId}` !== key,
      );
      this.saveFavorites();
      this.renderFavorites();
    }

    renderFavorites() {
      const container = this.container.querySelector(".favorites-list");
      const emptyEl = this.container.querySelector(".favorites-empty");

      if (this.favorites.length === 0) {
        container.innerHTML = "";
        emptyEl.style.display = "flex";
        return;
      }

      emptyEl.style.display = "none";

      container.innerHTML = this.favorites
        .map(
          (fav) => `
                <div class="favorite-item" data-chat-id="${fav.chatId}">
                    <div class="result-header">
                        <span class="result-chat-title">${this.escapeHtml(fav.chatTitle)}</span>
                        <div class="result-meta">
                            <span class="result-role ${fav.role}">${fav.role}</span>
                            <span>${this.formatTime(fav.favoritedAt)}</span>
                            <button class="history-delete" data-chat-id="${fav.chatId}" data-message-id="${fav.messageId}">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="result-content">${this.escapeHtml(this.truncate(fav.content, 200))}</div>
                </div>
            `,
        )
        .join("");

      // Bind events
      container.querySelectorAll(".favorite-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (!e.target.closest(".history-delete")) {
            this.openChat(item.dataset.chatId);
          }
        });
      });

      container.querySelectorAll(".history-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.removeFromFavorites(btn.dataset.chatId, btn.dataset.messageId);
        });
      });
    }

    saveFavorites() {
      try {
        localStorage.setItem("bael-favorites", JSON.stringify(this.favorites));
      } catch (e) {}
    }

    loadFavorites() {
      try {
        return JSON.parse(localStorage.getItem("bael-favorites")) || [];
      } catch (e) {
        return [];
      }
    }

    // Search history
    addToHistory(query) {
      const trimmed = query.trim();
      if (!trimmed) return;

      // Remove duplicate
      this.searchHistory = this.searchHistory.filter(
        (h) => h.query !== trimmed,
      );

      // Add to front
      this.searchHistory.unshift({
        query: trimmed,
        timestamp: Date.now(),
      });

      // Keep only last 20
      this.searchHistory = this.searchHistory.slice(0, 20);
      this.saveSearchHistory();
    }

    renderHistory() {
      const container = this.container.querySelector(".history-list");
      const emptyEl = this.container.querySelector(".history-empty");

      if (this.searchHistory.length === 0) {
        container.innerHTML = "";
        emptyEl.style.display = "flex";
        return;
      }

      emptyEl.style.display = "none";

      container.innerHTML = this.searchHistory
        .map(
          (item, index) => `
                <div class="history-item" data-query="${this.escapeHtml(item.query)}">
                    <div class="history-query">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <span>${this.escapeHtml(item.query)}</span>
                    </div>
                    <span class="history-time">${this.formatTime(item.timestamp)}</span>
                    <button class="history-delete" data-index="${index}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            `,
        )
        .join("");

      // Bind events
      container.querySelectorAll(".history-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (!e.target.closest(".history-delete")) {
            const query = item.dataset.query;
            this.container.querySelector(".chat-search-input").value = query;
            this.switchTab("search");
            this.search(query);
          }
        });
      });

      container.querySelectorAll(".history-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.searchHistory.splice(parseInt(btn.dataset.index), 1);
          this.saveSearchHistory();
          this.renderHistory();
        });
      });
    }

    saveSearchHistory() {
      try {
        localStorage.setItem(
          "bael-search-history",
          JSON.stringify(this.searchHistory),
        );
      } catch (e) {}
    }

    loadSearchHistory() {
      try {
        return JSON.parse(localStorage.getItem("bael-search-history")) || [];
      } catch (e) {
        return [];
      }
    }

    // Utilities
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }

    truncate(text, maxLength) {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    }

    highlightQuery(text, query) {
      if (!query) return text;
      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      return text.replace(regex, "<mark>$1</mark>");
    }

    formatTime(timestamp) {
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

    registerShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl/Cmd + F = Toggle search
        if (
          (e.ctrlKey || e.metaKey) &&
          e.key.toLowerCase() === "f" &&
          !e.shiftKey
        ) {
          // Only intercept if not in input/textarea
          if (
            !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
          ) {
            e.preventDefault();
            this.toggle();
          }
        }
      });

      // Register with command palette
      if (window.BaelCommandPalette) {
        window.BaelCommandPalette.registerCommand({
          id: "search:toggle",
          title: "Search Messages",
          category: "Search",
          shortcut: "Ctrl+F",
          handler: () => this.toggle(),
        });

        window.BaelCommandPalette.registerCommand({
          id: "search:favorites",
          title: "View Favorites",
          category: "Search",
          handler: () => {
            this.open();
            this.switchTab("favorites");
          },
        });
      }
    }
  }

  // Initialize
  window.BaelChatSearch = new BaelChatSearch();
})();
