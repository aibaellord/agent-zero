/**
 * Bael Conversation Finder - Full-text search across all conversations
 * Keyboard: Ctrl+Shift+/ to toggle
 */
(function () {
  "use strict";

  class BaelConversationFinder {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-conversation-finder";
      this.searchHistory = [];
      this.results = [];
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.initialized = true;
      console.log("🔎 Bael Conversation Finder initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-finder-styles")) return;

      const css = `
                .bael-finder-fab {
                    position: fixed;
                    bottom: 600px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0ea5e9, #0284c7);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-finder-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
                }

                .bael-finder-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 700px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 10001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(14, 165, 233, 0.3);
                }

                .bael-finder-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-finder-header {
                    padding: 20px;
                    background: rgba(0,0,0,0.2);
                }

                .bael-finder-input-wrap {
                    display: flex;
                    gap: 12px;
                }

                .bael-finder-input {
                    flex: 1;
                    padding: 14px 20px;
                    background: rgba(255,255,255,0.08);
                    border: 2px solid rgba(14, 165, 233, 0.3);
                    border-radius: 12px;
                    color: white;
                    font-size: 15px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .bael-finder-input:focus {
                    border-color: #0ea5e9;
                }

                .bael-finder-input::placeholder {
                    color: #666;
                }

                .bael-finder-btn {
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #0ea5e9, #0284c7);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-finder-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
                }

                .bael-finder-options {
                    display: flex;
                    gap: 16px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }

                .bael-finder-option {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #888;
                    font-size: 12px;
                }

                .bael-finder-option input {
                    accent-color: #0ea5e9;
                }

                .bael-finder-stats {
                    padding: 12px 20px;
                    background: rgba(0,0,0,0.3);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: #888;
                    font-size: 13px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-finder-results {
                    max-height: calc(80vh - 200px);
                    overflow-y: auto;
                    padding: 16px;
                }

                .bael-finder-result {
                    padding: 16px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-finder-result:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(14, 165, 233, 0.3);
                    transform: translateX(4px);
                }

                .bael-finder-result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .bael-finder-result-sender {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-finder-result-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .bael-finder-result-avatar.user {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .bael-finder-result-avatar.agent {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                }

                .bael-finder-result-name {
                    color: white;
                    font-size: 13px;
                    font-weight: 500;
                }

                .bael-finder-result-time {
                    color: #666;
                    font-size: 11px;
                }

                .bael-finder-result-content {
                    color: #ccc;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .bael-finder-result-content mark {
                    background: rgba(14, 165, 233, 0.3);
                    color: #0ea5e9;
                    padding: 2px 4px;
                    border-radius: 3px;
                }

                .bael-finder-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                }

                .bael-finder-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .bael-finder-history {
                    padding: 12px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .bael-finder-history-title {
                    color: #666;
                    font-size: 11px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                .bael-finder-history-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .bael-finder-history-item {
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    color: #888;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-finder-history-item:hover {
                    background: rgba(14, 165, 233, 0.2);
                    color: #0ea5e9;
                    border-color: rgba(14, 165, 233, 0.3);
                }

                .bael-finder-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: #888;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                }

                .bael-finder-close:hover {
                    background: rgba(255,255,255,0.15);
                    color: white;
                }

                @keyframes highlight-flash {
                    0%, 100% { background-color: transparent; }
                    50% { background-color: rgba(14, 165, 233, 0.3); }
                }

                .bael-highlight-found {
                    animation: highlight-flash 0.5s ease 3;
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-finder-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB Button
      this.fab = document.createElement("button");
      this.fab.className = "bael-finder-fab";
      this.fab.innerHTML = "🔎";
      this.fab.title = "Conversation Finder (Ctrl+Shift+/)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-finder-panel";
      this.panel.innerHTML = `
                <button class="bael-finder-close">×</button>
                <div class="bael-finder-header">
                    <div class="bael-finder-input-wrap">
                        <input type="text" class="bael-finder-input" placeholder="Find in conversations..." id="bael-finder-query">
                        <button class="bael-finder-btn" id="bael-finder-go">🔎 Find</button>
                    </div>
                    <div class="bael-finder-options">
                        <label class="bael-finder-option">
                            <input type="checkbox" id="bael-finder-case" checked>
                            <span>Case insensitive</span>
                        </label>
                        <label class="bael-finder-option">
                            <input type="checkbox" id="bael-finder-user" checked>
                            <span>User messages</span>
                        </label>
                        <label class="bael-finder-option">
                            <input type="checkbox" id="bael-finder-agent" checked>
                            <span>Agent messages</span>
                        </label>
                        <label class="bael-finder-option">
                            <input type="checkbox" id="bael-finder-whole">
                            <span>Whole words</span>
                        </label>
                    </div>
                </div>
                <div class="bael-finder-history" id="bael-finder-history-container">
                    <div class="bael-finder-history-title">Recent Searches</div>
                    <div class="bael-finder-history-list" id="bael-finder-history-list"></div>
                </div>
                <div class="bael-finder-stats" id="bael-finder-stats" style="display: none;">
                    <span id="bael-finder-count">0 matches</span>
                    <span id="bael-finder-time">0ms</span>
                </div>
                <div class="bael-finder-results" id="bael-finder-results">
                    <div class="bael-finder-empty">
                        <div class="bael-finder-empty-icon">🔎</div>
                        <div>Enter a search term to find messages</div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Events
      this.panel
        .querySelector(".bael-finder-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#bael-finder-go")
        .addEventListener("click", () => this.search());
      this.panel
        .querySelector("#bael-finder-query")
        .addEventListener("keydown", (e) => {
          if (e.key === "Enter") this.search();
        });

      this.renderHistory();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "/") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    search() {
      const query = this.panel.querySelector("#bael-finder-query").value.trim();
      if (!query) return;

      const startTime = performance.now();

      const options = {
        caseInsensitive: this.panel.querySelector("#bael-finder-case").checked,
        includeUser: this.panel.querySelector("#bael-finder-user").checked,
        includeAgent: this.panel.querySelector("#bael-finder-agent").checked,
        wholeWord: this.panel.querySelector("#bael-finder-whole").checked,
      };

      // Add to history
      this.addToHistory(query);

      // Get all messages
      const messages = this.getAllMessages();

      // Build pattern
      let patternStr = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (options.wholeWord) {
        patternStr = `\\b${patternStr}\\b`;
      }
      const pattern = new RegExp(
        patternStr,
        options.caseInsensitive ? "gi" : "g",
      );

      this.results = messages.filter((msg) => {
        if (!options.includeUser && msg.type === "user") return false;
        if (!options.includeAgent && msg.type === "agent") return false;
        return pattern.test(msg.content);
      });

      const endTime = performance.now();

      // Show stats
      const stats = this.panel.querySelector("#bael-finder-stats");
      stats.style.display = "flex";
      this.panel.querySelector("#bael-finder-count").textContent =
        `${this.results.length} matches`;
      this.panel.querySelector("#bael-finder-time").textContent =
        `${Math.round(endTime - startTime)}ms`;

      // Render
      this.renderResults(pattern);
    }

    getAllMessages() {
      const messages = [];

      // Try various selectors
      const selectors = [
        ".message",
        '[class*="message"]',
        ".chat-message",
        ".msg",
        "[data-message]",
        ".bubble",
        ".chat-bubble",
      ];

      const seen = new Set();

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el, index) => {
          if (seen.has(el)) return;
          seen.add(el);

          const text = el.textContent || "";
          const isUser =
            el.classList.contains("user") ||
            el.classList.contains("user-message") ||
            el.classList.contains("from-user") ||
            el.getAttribute("data-sender") === "user" ||
            el.querySelector(".user-avatar, .user-icon");

          if (text.trim().length > 5) {
            messages.push({
              id: messages.length,
              type: isUser ? "user" : "agent",
              content: text,
              element: el,
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        });
      });

      return messages;
    }

    renderResults(pattern) {
      const container = this.panel.querySelector("#bael-finder-results");

      if (this.results.length === 0) {
        container.innerHTML = `
                    <div class="bael-finder-empty">
                        <div class="bael-finder-empty-icon">😕</div>
                        <div>No matches found</div>
                    </div>
                `;
        return;
      }

      container.innerHTML = this.results
        .map((msg) => {
          // Get snippet around the match
          const match = msg.content.match(pattern);
          const matchIndex = match ? msg.content.indexOf(match[0]) : 0;
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(msg.content.length, matchIndex + 200);
          let snippet = msg.content.substring(start, end);
          if (start > 0) snippet = "..." + snippet;
          if (end < msg.content.length) snippet = snippet + "...";

          const highlighted = snippet.replace(pattern, "<mark>$&</mark>");

          return `
                    <div class="bael-finder-result" data-id="${msg.id}">
                        <div class="bael-finder-result-header">
                            <div class="bael-finder-result-sender">
                                <div class="bael-finder-result-avatar ${msg.type}">
                                    ${msg.type === "user" ? "👤" : "🤖"}
                                </div>
                                <div class="bael-finder-result-name">
                                    ${msg.type === "user" ? "You" : "Agent"}
                                </div>
                            </div>
                            <div class="bael-finder-result-time">${msg.timestamp}</div>
                        </div>
                        <div class="bael-finder-result-content">${highlighted}</div>
                    </div>
                `;
        })
        .join("");

      // Click to scroll
      container.querySelectorAll(".bael-finder-result").forEach((el) => {
        el.addEventListener("click", () => {
          const id = parseInt(el.dataset.id);
          const msg = this.results.find((m) => m.id === id);
          if (msg && msg.element) {
            this.hide();
            msg.element.scrollIntoView({ behavior: "smooth", block: "center" });
            msg.element.classList.add("bael-highlight-found");
            setTimeout(
              () => msg.element.classList.remove("bael-highlight-found"),
              2000,
            );
          }
        });
      });
    }

    addToHistory(query) {
      this.searchHistory = this.searchHistory.filter((q) => q !== query);
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 10);
      this.saveToStorage();
      this.renderHistory();
    }

    renderHistory() {
      const container = this.panel.querySelector("#bael-finder-history-list");
      const historyContainer = this.panel.querySelector(
        "#bael-finder-history-container",
      );

      if (this.searchHistory.length === 0) {
        historyContainer.style.display = "none";
        return;
      }

      historyContainer.style.display = "block";
      container.innerHTML = this.searchHistory
        .map(
          (q) => `
                <div class="bael-finder-history-item">${q}</div>
            `,
        )
        .join("");

      container.querySelectorAll(".bael-finder-history-item").forEach((el) => {
        el.addEventListener("click", () => {
          this.panel.querySelector("#bael-finder-query").value = el.textContent;
          this.search();
        });
      });
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.panel.classList.add("visible");
      this.visible = true;
      setTimeout(() => {
        this.panel.querySelector("#bael-finder-query").focus();
      }, 100);
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.searchHistory = data.history || [];
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            history: this.searchHistory,
          }),
        );
      } catch (e) {}
    }
  }

  window.BaelConversationFinder = new BaelConversationFinder();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelConversationFinder.initialize();
    });
  } else {
    window.BaelConversationFinder.initialize();
  }
})();
