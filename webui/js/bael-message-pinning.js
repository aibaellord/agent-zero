/**
 * BAEL - LORD OF ALL
 * Message Pinning - Pin important messages for quick reference
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMessagePinning {
    constructor() {
      this.pinnedMessages = [];
      this.panel = null;
      this.storageKey = "bael-pinned-messages";
      this.init();
    }

    init() {
      this.addStyles();
      this.loadPinned();
      this.createUI();
      this.observeMessages();
      this.bindEvents();
      console.log("📌 Bael Message Pinning initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-pinning-styles";
      styles.textContent = `
                /* Pin Button on Messages */
                .bael-pin-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 28px;
                    height: 28px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    opacity: 0;
                    transition: all 0.2s ease;
                    z-index: 10;
                }

                .message:hover .bael-pin-btn,
                [class*="message"]:hover .bael-pin-btn {
                    opacity: 1;
                }

                .bael-pin-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-pin-btn.pinned {
                    opacity: 1;
                    background: rgba(255, 51, 102, 0.2);
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Pinned Message Indicator */
                .bael-pinned-indicator {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--bael-accent, #ff3366), #ff6b99);
                    border-radius: 3px 3px 0 0;
                }

                /* Pinned Panel */
                .bael-pinned-panel {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    width: 380px;
                    max-height: 70vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    z-index: 100020;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                }

                .bael-pinned-panel.visible {
                    display: flex;
                    animation: pinnedSlide 0.2s ease;
                }

                @keyframes pinnedSlide {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Panel Header */
                .pinned-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pinned-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .pinned-count {
                    padding: 2px 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 10px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .pinned-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 16px;
                }

                .pinned-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Pinned List */
                .pinned-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .pinned-item {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 10px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                .pinned-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .pinned-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pinned-item-role {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .pinned-item-role.user {
                    color: #6366f1;
                }

                .pinned-item-role.assistant {
                    color: #4ade80;
                }

                .pinned-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pinned-item-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #555);
                }

                .pinned-item-actions {
                    display: flex;
                    gap: 4px;
                }

                .pinned-item-btn {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 12px;
                }

                .pinned-item-btn:hover {
                    background: var(--bael-bg-secondary, #12121a);
                    color: var(--bael-text-primary, #fff);
                }

                .pinned-item-btn.delete:hover {
                    color: #ef4444;
                }

                .pinned-item-content {
                    padding: 12px;
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.5;
                    max-height: 150px;
                    overflow: hidden;
                    position: relative;
                }

                .pinned-item-content.collapsed::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 40px;
                    background: linear-gradient(transparent, var(--bael-bg-secondary, #12121a));
                }

                .pinned-item-note {
                    padding: 8px 12px;
                    background: rgba(255, 51, 102, 0.1);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .pinned-item-note input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    font-size: 11px;
                    color: var(--bael-accent, #ff3366);
                    outline: none;
                }

                .pinned-item-note input::placeholder {
                    color: rgba(255, 51, 102, 0.5);
                }

                /* Empty State */
                .pinned-empty {
                    text-align: center;
                    padding: 40px 20px;
                }

                .pinned-empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .pinned-empty-text {
                    font-size: 13px;
                    color: var(--bael-text-muted, #666);
                }

                /* Floating Toggle */
                .bael-pinned-toggle {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    padding: 8px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    z-index: 100005;
                    transition: all 0.3s ease;
                }

                .bael-pinned-toggle:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-pinned-toggle .badge {
                    padding: 2px 6px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                }

                /* Collections */
                .pinned-collections {
                    display: flex;
                    gap: 6px;
                    padding: 10px 12px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    overflow-x: auto;
                }

                .collection-tag {
                    padding: 4px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .collection-tag:hover,
                .collection-tag.active {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .collection-tag.active {
                    background: rgba(255, 51, 102, 0.15);
                }

                /* Code in pinned */
                .pinned-item-content pre {
                    background: var(--bael-bg-primary, #0a0a0f);
                    padding: 8px;
                    border-radius: 6px;
                    overflow-x: auto;
                    font-size: 11px;
                }

                .pinned-item-content code {
                    font-family: 'SF Mono', Menlo, monospace;
                }
            `;
      document.head.appendChild(styles);
    }

    loadPinned() {
      try {
        this.pinnedMessages = JSON.parse(
          localStorage.getItem(this.storageKey) || "[]",
        );
      } catch {
        this.pinnedMessages = [];
      }
    }

    savePinned() {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.pinnedMessages),
      );
      this.updateToggleBadge();
    }

    createUI() {
      // Toggle button
      const toggle = document.createElement("button");
      toggle.className = "bael-pinned-toggle";
      toggle.innerHTML = `
                <span>📌</span>
                <span>Pinned</span>
                <span class="badge">${this.pinnedMessages.length}</span>
            `;
      toggle.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(toggle);
      this.toggle = toggle;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-pinned-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="pinned-header">
                    <div class="pinned-title">
                        <span>📌</span>
                        <span>Pinned Messages</span>
                        <span class="pinned-count">${this.pinnedMessages.length}</span>
                    </div>
                    <button class="pinned-close">×</button>
                </div>

                <div class="pinned-collections">
                    <span class="collection-tag active" data-collection="all">All</span>
                    <span class="collection-tag" data-collection="code">💻 Code</span>
                    <span class="collection-tag" data-collection="important">⭐ Important</span>
                    <span class="collection-tag" data-collection="todo">✅ Todo</span>
                    <span class="collection-tag" data-collection="reference">📚 Reference</span>
                </div>

                <div class="pinned-list" id="pinned-list">
                    ${this.renderPinnedList()}
                </div>
            `;
    }

    renderPinnedList(collection = "all") {
      const filtered =
        collection === "all"
          ? this.pinnedMessages
          : this.pinnedMessages.filter((p) => p.collection === collection);

      if (filtered.length === 0) {
        return `
                    <div class="pinned-empty">
                        <div class="pinned-empty-icon">📌</div>
                        <div class="pinned-empty-text">No pinned messages yet<br>Hover over a message and click 📌 to pin</div>
                    </div>
                `;
      }

      return filtered.map((pin, i) => this.renderPinnedItem(pin, i)).join("");
    }

    renderPinnedItem(pin, index) {
      const isLong = pin.content.length > 300;
      const time = new Date(pin.pinnedAt).toLocaleString();

      return `
                <div class="pinned-item" data-index="${index}" data-id="${pin.id}">
                    <div class="pinned-item-header">
                        <span class="pinned-item-role ${pin.role}">${pin.role}</span>
                        <div class="pinned-item-meta">
                            <span class="pinned-item-time">${time}</span>
                            <div class="pinned-item-actions">
                                <button class="pinned-item-btn" title="Go to message" data-action="goto">📍</button>
                                <button class="pinned-item-btn" title="Copy" data-action="copy">📋</button>
                                <button class="pinned-item-btn delete" title="Unpin" data-action="unpin">🗑️</button>
                            </div>
                        </div>
                    </div>
                    <div class="pinned-item-content ${isLong ? "collapsed" : ""}">
                        ${this.formatContent(pin.content)}
                    </div>
                    <div class="pinned-item-note">
                        <input type="text" placeholder="Add a note..."
                               value="${this.escapeHtml(pin.note || "")}"
                               data-action="note">
                    </div>
                </div>
            `;
    }

    formatContent(content) {
      // Basic formatting for code blocks
      let formatted = this.escapeHtml(content);

      // Simple code block detection
      formatted = formatted.replace(
        /```(\w*)\n?([\s\S]*?)```/g,
        "<pre><code>$2</code></pre>",
      );
      formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

      return formatted;
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".pinned-close")
        .addEventListener("click", () => this.closePanel());

      // Collection tabs
      this.panel.querySelectorAll(".collection-tag").forEach((tag) => {
        tag.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".collection-tag")
            .forEach((t) => t.classList.remove("active"));
          tag.classList.add("active");
          this.refreshList(tag.dataset.collection);
        });
      });

      // Item actions
      this.panel
        .querySelector("#pinned-list")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".pinned-item-btn");
          const item = e.target.closest(".pinned-item");

          if (btn && item) {
            const id = item.dataset.id;
            const action = btn.dataset.action;
            this.handleAction(action, id);
          }
        });

      // Notes
      this.panel
        .querySelector("#pinned-list")
        .addEventListener("input", (e) => {
          if (e.target.dataset.action === "note") {
            const item = e.target.closest(".pinned-item");
            const id = item.dataset.id;
            this.updateNote(id, e.target.value);
          }
        });
    }

    handleAction(action, id) {
      switch (action) {
        case "goto":
          this.goToMessage(id);
          break;
        case "copy":
          this.copyMessage(id);
          break;
        case "unpin":
          this.unpinMessage(id);
          break;
      }
    }

    goToMessage(id) {
      // In production, scroll to the actual message
      if (window.BaelNotifications) {
        window.BaelNotifications.info("Navigating to message...");
      }
      this.closePanel();
    }

    copyMessage(id) {
      const pin = this.pinnedMessages.find((p) => p.id === id);
      if (pin) {
        navigator.clipboard.writeText(pin.content);
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Copied to clipboard!");
        }
      }
    }

    updateNote(id, note) {
      const pin = this.pinnedMessages.find((p) => p.id === id);
      if (pin) {
        pin.note = note;
        this.savePinned();
      }
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    observeMessages() {
      // Watch for new messages and add pin buttons
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              this.addPinButtonsToMessages(node);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Initial scan
      setTimeout(() => this.addPinButtonsToMessages(document.body), 1000);
    }

    addPinButtonsToMessages(container) {
      const messages = container.querySelectorAll(
        '.message, [class*="message-content"], [x-show*="message"]',
      );

      messages.forEach((msg) => {
        if (msg.querySelector(".bael-pin-btn")) return;
        if (!msg.textContent.trim()) return;

        // Make message relative positioned if not already
        const style = getComputedStyle(msg);
        if (style.position === "static") {
          msg.style.position = "relative";
        }

        const btn = document.createElement("button");
        btn.className = "bael-pin-btn";

        // Check if already pinned
        const msgId = this.getMessageId(msg);
        const isPinned = this.pinnedMessages.some((p) => p.id === msgId);
        if (isPinned) {
          btn.classList.add("pinned");
          btn.innerHTML = "📍";
        } else {
          btn.innerHTML = "📌";
        }

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.togglePin(msg);
        });

        msg.appendChild(btn);
      });
    }

    getMessageId(el) {
      // Generate unique ID based on content
      const content = el.textContent.substring(0, 100);
      return btoa(content)
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 20);
    }

    togglePin(messageEl) {
      const id = this.getMessageId(messageEl);
      const existingIndex = this.pinnedMessages.findIndex((p) => p.id === id);

      if (existingIndex >= 0) {
        // Unpin
        this.pinnedMessages.splice(existingIndex, 1);
        const btn = messageEl.querySelector(".bael-pin-btn");
        if (btn) {
          btn.classList.remove("pinned");
          btn.innerHTML = "📌";
        }
        messageEl.querySelector(".bael-pinned-indicator")?.remove();

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Message unpinned");
        }
      } else {
        // Pin
        const role = messageEl.classList.contains("user")
          ? "user"
          : "assistant";
        const content = messageEl.textContent.trim();

        this.pinnedMessages.unshift({
          id,
          role,
          content,
          pinnedAt: new Date().toISOString(),
          collection: null,
          note: "",
        });

        const btn = messageEl.querySelector(".bael-pin-btn");
        if (btn) {
          btn.classList.add("pinned");
          btn.innerHTML = "📍";
        }

        // Add indicator
        const indicator = document.createElement("div");
        indicator.className = "bael-pinned-indicator";
        messageEl.appendChild(indicator);

        if (window.BaelNotifications) {
          window.BaelNotifications.success("Message pinned!");
        }
      }

      this.savePinned();
      this.refreshList();
    }

    unpinMessage(id) {
      const index = this.pinnedMessages.findIndex((p) => p.id === id);
      if (index >= 0) {
        this.pinnedMessages.splice(index, 1);
        this.savePinned();
        this.refreshList();

        // Update message button
        document.querySelectorAll(".bael-pin-btn.pinned").forEach((btn) => {
          const msg = btn.closest('.message, [class*="message"]');
          if (msg && this.getMessageId(msg) === id) {
            btn.classList.remove("pinned");
            btn.innerHTML = "📌";
            msg.querySelector(".bael-pinned-indicator")?.remove();
          }
        });

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Message unpinned");
        }
      }
    }

    refreshList(collection = "all") {
      const list = this.panel.querySelector("#pinned-list");
      list.innerHTML = this.renderPinnedList(collection);
      this.panel.querySelector(".pinned-count").textContent =
        this.pinnedMessages.length;
    }

    updateToggleBadge() {
      this.toggle.querySelector(".badge").textContent =
        this.pinnedMessages.length;
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.refreshList();
      }
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
  window.BaelMessagePinning = new BaelMessagePinning();
})();
