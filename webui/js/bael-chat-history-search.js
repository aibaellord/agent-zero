/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██╗  ██╗██╗███████╗████████╗ ██████╗ ██████╗ ██╗   ██╗                  █
 * █  ██║  ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝                  █
 * █  ███████║██║███████╗   ██║   ██║   ██║██████╔╝ ╚████╔╝                   █
 * █  ██╔══██║██║╚════██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝                    █
 * █  ██║  ██║██║███████║   ██║   ╚██████╔╝██║  ██║   ██║                     █
 * █  ╚═╝  ╚═╝╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝                     █
 * █                                                                          █
 * █   BAEL CHAT HISTORY SEARCH - Full-Text Search Through Chat History      █
 * █   Find any conversation from the past (Ctrl+Shift+H)                    █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelChatHistorySearch {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.searchQuery = "";
      this.results = [];
      this.selectedIndex = 0;

      this.chatHistory = [];
    }

    async initialize() {
      console.log("🔍 Bael Chat History Search initializing...");

      this.loadHistory();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.observeChats();

      this.initialized = true;
      console.log("✅ BAEL CHAT HISTORY SEARCH READY");

      return this;
    }

    loadHistory() {
      try {
        const saved = localStorage.getItem("bael-chat-history-index");
        if (saved) {
          this.chatHistory = JSON.parse(saved);
        }
      } catch (e) {}
    }

    saveHistory() {
      try {
        // Keep last 1000 messages
        if (this.chatHistory.length > 1000) {
          this.chatHistory = this.chatHistory.slice(-1000);
        }
        localStorage.setItem(
          "bael-chat-history-index",
          JSON.stringify(this.chatHistory),
        );
      } catch (e) {}
    }

    observeChats() {
      // Watch for new messages to index
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const text = node.textContent?.trim();
              if (text && text.length > 10) {
                this.indexMessage(text, node.classList.contains("user"));
              }
            }
          });
        });
      });

      const findAndObserve = () => {
        const chatContainer = document.querySelector(
          '#chat-messages, .chat-container, .messages, [class*="message"]',
        );
        if (chatContainer) {
          observer.observe(chatContainer, { childList: true, subtree: true });
        } else {
          setTimeout(findAndObserve, 2000);
        }
      };

      findAndObserve();
    }

    indexMessage(text, isUser) {
      const entry = {
        id: Date.now() + Math.random(),
        text: text.substring(0, 500),
        isUser,
        timestamp: new Date().toISOString(),
        chatId: this.getCurrentChatId(),
      };

      this.chatHistory.push(entry);
      this.saveHistory();
    }

    getCurrentChatId() {
      // Try to get current chat ID from URL or context
      const urlMatch = window.location.hash.match(/chat\/(\w+)/);
      return urlMatch ? urlMatch[1] : "default";
    }

    injectStyles() {
      if (document.getElementById("bael-history-search-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-history-search-styles";
      styles.textContent = `
                .bael-history-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(20px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    pointer-events: none;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 10vh;
                }

                .bael-history-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-history-modal {
                    width: 90vw;
                    max-width: 700px;
                    max-height: 70vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.95) translateY(-20px);
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-history-overlay.visible .bael-history-modal {
                    transform: scale(1) translateY(0);
                }

                .history-search-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .history-search-icon {
                    font-size: 24px;
                    color: #6366f1;
                }

                .history-search-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #fff;
                    font-size: 18px;
                    font-weight: 300;
                }

                .history-search-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .history-search-shortcut {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                    padding: 4px 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .history-results {
                    flex: 1;
                    overflow-y: auto;
                    max-height: 400px;
                }

                .history-result {
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .history-result:hover,
                .history-result.selected {
                    background: rgba(99, 102, 241, 0.1);
                }

                .history-result-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .history-result-role {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 3px 8px;
                    border-radius: 4px;
                }

                .history-result-role.user {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .history-result-role.agent {
                    background: rgba(99, 102, 241, 0.2);
                    color: #a5b4fc;
                }

                .history-result-time {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .history-result-text {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .history-result-text mark {
                    background: rgba(99, 102, 241, 0.4);
                    color: #fff;
                    padding: 1px 4px;
                    border-radius: 3px;
                }

                .history-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .history-empty span {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 12px;
                }

                .history-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 24px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .history-footer kbd {
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font-family: monospace;
                }

                .history-stats {
                    display: flex;
                    gap: 16px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-history-search";
      this.container.className = "bael-history-overlay";
      document.body.appendChild(this.container);

      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.hide();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+H for history search
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "H") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Navigation when visible
        if (this.visible) {
          if (e.key === "Escape") {
            this.hide();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            this.selectNext();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            this.selectPrev();
          } else if (e.key === "Enter" && this.results.length > 0) {
            this.openResult(this.results[this.selectedIndex]);
          }
        }
      });
    }

    show() {
      this.visible = true;
      this.searchQuery = "";
      this.results = [];
      this.selectedIndex = 0;
      this.render();
      this.container.classList.add("visible");

      setTimeout(() => {
        const input = this.container.querySelector(".history-search-input");
        if (input) input.focus();
      }, 100);
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    search(query) {
      this.searchQuery = query;

      if (!query.trim()) {
        this.results = this.chatHistory.slice(-20).reverse();
      } else {
        const terms = query.toLowerCase().split(/\s+/);
        this.results = this.chatHistory
          .filter((entry) => {
            const text = entry.text.toLowerCase();
            return terms.every((term) => text.includes(term));
          })
          .slice(-50)
          .reverse();
      }

      this.selectedIndex = 0;
      this.renderResults();
    }

    selectNext() {
      if (this.selectedIndex < this.results.length - 1) {
        this.selectedIndex++;
        this.updateSelection();
      }
    }

    selectPrev() {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.updateSelection();
      }
    }

    updateSelection() {
      this.container.querySelectorAll(".history-result").forEach((el, i) => {
        el.classList.toggle("selected", i === this.selectedIndex);
      });

      // Scroll into view
      const selected = this.container.querySelector(".history-result.selected");
      selected?.scrollIntoView({ block: "nearest" });
    }

    openResult(result) {
      // Copy to clipboard or navigate to chat
      navigator.clipboard.writeText(result.text);

      // Dispatch event for other modules
      window.dispatchEvent(
        new CustomEvent("bael:history-selected", {
          detail: result,
        }),
      );

      this.hide();
    }

    highlightText(text, query) {
      if (!query.trim()) return this.escapeHtml(text);

      const terms = query.toLowerCase().split(/\s+/);
      let result = text;

      terms.forEach((term) => {
        const regex = new RegExp(`(${this.escapeRegex(term)})`, "gi");
        result = result.replace(regex, "<mark>$1</mark>");
      });

      return result;
    }

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    formatTime(isoString) {
      const date = new Date(isoString);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return "Just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
      if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
      if (diff < 604800000) return Math.floor(diff / 86400000) + "d ago";

      return date.toLocaleDateString();
    }

    render() {
      this.container.innerHTML = `
                <div class="bael-history-modal">
                    <div class="history-search-box">
                        <span class="history-search-icon">🔍</span>
                        <input type="text"
                               class="history-search-input"
                               placeholder="Search chat history..."
                               value="${this.searchQuery}"
                               oninput="BaelChatHistorySearch.search(this.value)">
                        <span class="history-search-shortcut">ESC to close</span>
                    </div>
                    <div class="history-results" id="history-results">
                        ${this.renderResultsContent()}
                    </div>
                    <div class="history-footer">
                        <div class="history-stats">
                            <span>${this.chatHistory.length} messages indexed</span>
                            <span>${this.results.length} results</span>
                        </div>
                        <div>
                            <kbd>↑↓</kbd> Navigate &nbsp;
                            <kbd>Enter</kbd> Copy &nbsp;
                            <kbd>Esc</kbd> Close
                        </div>
                    </div>
                </div>
            `;

      // Show recent by default
      this.search("");
    }

    renderResults() {
      const container = document.getElementById("history-results");
      if (container) {
        container.innerHTML = this.renderResultsContent();
      }
    }

    renderResultsContent() {
      if (this.results.length === 0) {
        return `
                    <div class="history-empty">
                        <span>🔍</span>
                        ${this.searchQuery ? "No results found" : "Start typing to search..."}
                    </div>
                `;
      }

      return this.results
        .map(
          (result, i) => `
                <div class="history-result ${i === this.selectedIndex ? "selected" : ""}"
                     onclick="BaelChatHistorySearch.openResult(BaelChatHistorySearch.results[${i}])">
                    <div class="history-result-header">
                        <span class="history-result-role ${result.isUser ? "user" : "agent"}">
                            ${result.isUser ? "You" : "Agent"}
                        </span>
                        <span class="history-result-time">${this.formatTime(result.timestamp)}</span>
                    </div>
                    <div class="history-result-text">
                        ${this.highlightText(result.text, this.searchQuery)}
                    </div>
                </div>
            `,
        )
        .join("");
    }

    // Public API
    clearHistory() {
      if (confirm("Clear all chat history index?")) {
        this.chatHistory = [];
        this.saveHistory();
        this.render();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelChatHistorySearch = new BaelChatHistorySearch();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelChatHistorySearch.initialize();
    });
  } else {
    window.BaelChatHistorySearch.initialize();
  }

  console.log("🔍 Bael Chat History Search loaded");
})();
