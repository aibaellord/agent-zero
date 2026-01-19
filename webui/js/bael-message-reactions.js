/**
 * BAEL - LORD OF ALL
 * Message Reactions - React to messages with emojis
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMessageReactions {
    constructor() {
      this.reactions = new Map();
      this.storageKey = "bael-reactions";
      this.defaultEmojis = [
        "👍",
        "👎",
        "❤️",
        "😂",
        "🤔",
        "🔥",
        "👏",
        "💡",
        "✅",
        "❌",
      ];
      this.init();
    }

    init() {
      this.addStyles();
      this.loadReactions();
      this.observeMessages();
      console.log("😊 Bael Message Reactions initialized");
    }

    loadReactions() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        this.reactions = new Map(Object.entries(saved));
      } catch {
        this.reactions = new Map();
      }
    }

    saveReactions() {
      const obj = Object.fromEntries(this.reactions);
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-reactions-styles";
      styles.textContent = `
                /* Reaction Bar */
                .bael-reaction-bar {
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    display: flex;
                    gap: 2px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    z-index: 10;
                }

                .bael-message-wrapper:hover .bael-reaction-bar {
                    opacity: 1;
                }

                .bael-add-reaction {
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
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .bael-add-reaction:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                    transform: scale(1.1);
                }

                /* Reaction Picker */
                .bael-reaction-picker {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 4px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 8px;
                    display: none;
                    flex-wrap: wrap;
                    gap: 4px;
                    width: 180px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    z-index: 100;
                    animation: reactionPickerIn 0.15s ease;
                }

                .bael-reaction-picker.visible {
                    display: flex;
                }

                @keyframes reactionPickerIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .bael-reaction-option {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all 0.15s ease;
                }

                .bael-reaction-option:hover {
                    background: var(--bael-bg-secondary, #12121a);
                    border-color: var(--bael-border, #2a2a3a);
                    transform: scale(1.2);
                }

                /* Display Reactions */
                .bael-reactions-display {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-reaction-chip {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-reaction-chip:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-reaction-chip.active {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .bael-reaction-emoji {
                    font-size: 14px;
                }

                .bael-reaction-count {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #888);
                }

                .bael-reaction-chip.active .bael-reaction-count {
                    color: var(--bael-accent, #ff3366);
                }

                /* Message wrapper adjustments */
                .bael-message-wrapper {
                    position: relative;
                }
            `;
      document.head.appendChild(styles);
    }

    observeMessages() {
      // Add reactions to existing messages
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
      // Find all message containers
      const messages = document.querySelectorAll(
        '[x-ref="msgcont"] > div, .message, .chat-message',
      );

      messages.forEach((msg) => {
        if (msg.querySelector(".bael-reaction-bar")) return;
        if (!msg.textContent.trim()) return;

        // Add wrapper class
        msg.classList.add("bael-message-wrapper");

        const msgId = this.getMessageId(msg);

        // Add reaction bar
        const bar = document.createElement("div");
        bar.className = "bael-reaction-bar";
        bar.innerHTML = `
                    <button class="bael-add-reaction" title="Add Reaction">😊</button>
                    <div class="bael-reaction-picker" id="picker-${msgId}">
                        ${this.defaultEmojis.map((e) => `<button class="bael-reaction-option" data-emoji="${e}">${e}</button>`).join("")}
                    </div>
                `;

        // Events
        const addBtn = bar.querySelector(".bael-add-reaction");
        const picker = bar.querySelector(".bael-reaction-picker");

        addBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.closeAllPickers();
          picker.classList.toggle("visible");
        });

        picker.addEventListener("click", (e) => {
          e.stopPropagation();
          const option = e.target.closest(".bael-reaction-option");
          if (option) {
            const emoji = option.dataset.emoji;
            this.toggleReaction(msgId, emoji);
            picker.classList.remove("visible");
            this.renderReactionsForMessage(msg, msgId);
          }
        });

        msg.style.position = "relative";
        msg.appendChild(bar);

        // Render existing reactions
        this.renderReactionsForMessage(msg, msgId);
      });
    }

    getMessageId(msg) {
      // Generate stable ID from content
      const content = msg.textContent.trim().substring(0, 100);
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        hash = (hash << 5) - hash + content.charCodeAt(i);
        hash = hash & hash;
      }
      return "msg-" + Math.abs(hash).toString(36);
    }

    toggleReaction(msgId, emoji) {
      const msgReactions = this.reactions.get(msgId) || {};

      if (!msgReactions[emoji]) {
        msgReactions[emoji] = { count: 0, users: [] };
      }

      const myId = "user";
      const idx = msgReactions[emoji].users.indexOf(myId);

      if (idx >= 0) {
        msgReactions[emoji].users.splice(idx, 1);
        msgReactions[emoji].count--;
        if (msgReactions[emoji].count <= 0) {
          delete msgReactions[emoji];
        }
      } else {
        msgReactions[emoji].users.push(myId);
        msgReactions[emoji].count++;
      }

      if (Object.keys(msgReactions).length === 0) {
        this.reactions.delete(msgId);
      } else {
        this.reactions.set(msgId, msgReactions);
      }

      this.saveReactions();
    }

    renderReactionsForMessage(msg, msgId) {
      // Remove old display
      const oldDisplay = msg.querySelector(".bael-reactions-display");
      if (oldDisplay) oldDisplay.remove();

      const msgReactions = this.reactions.get(msgId);
      if (!msgReactions || Object.keys(msgReactions).length === 0) return;

      const display = document.createElement("div");
      display.className = "bael-reactions-display";

      Object.entries(msgReactions).forEach(([emoji, data]) => {
        const isActive = data.users.includes("user");
        const chip = document.createElement("button");
        chip.className = `bael-reaction-chip ${isActive ? "active" : ""}`;
        chip.innerHTML = `
                    <span class="bael-reaction-emoji">${emoji}</span>
                    <span class="bael-reaction-count">${data.count}</span>
                `;
        chip.addEventListener("click", () => {
          this.toggleReaction(msgId, emoji);
          this.renderReactionsForMessage(msg, msgId);
        });
        display.appendChild(chip);
      });

      msg.appendChild(display);
    }

    closeAllPickers() {
      document
        .querySelectorAll(".bael-reaction-picker.visible")
        .forEach((p) => {
          p.classList.remove("visible");
        });
    }
  }

  // Close pickers on click outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".bael-reaction-picker.visible").forEach((p) => {
      p.classList.remove("visible");
    });
  });

  // Initialize
  window.BaelMessageReactions = new BaelMessageReactions();
})();
