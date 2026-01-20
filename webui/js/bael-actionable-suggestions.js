/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗ █████╗ ██████╗ ██╗     █
 * █  ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔══██╗██╔══██╗██║     █
 * █  ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████║██████╔╝██║     █
 * █  ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║██╔══██║██╔══██╗██║     █
 * █  ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║██║  ██║██████╔╝███████╗█
 * █  ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═════╝ ╚══════╝█
 * █                                                                          █
 * █   BAEL ACTIONABLE SUGGESTIONS - Smart Contextual Action Suggestions     █
 * █   AI-powered quick actions based on current context                     █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelActionableSuggestions {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.suggestions = [];

      // Action templates
      this.actionTemplates = {
        code: [
          {
            icon: "📝",
            text: "Explain this code",
            prompt: "Please explain what this code does:",
          },
          {
            icon: "🐛",
            text: "Debug this",
            prompt: "Please help me debug this code:",
          },
          {
            icon: "⚡",
            text: "Optimize",
            prompt: "Please optimize this code for better performance:",
          },
          {
            icon: "📚",
            text: "Add documentation",
            prompt: "Please add detailed documentation to this code:",
          },
          {
            icon: "🧪",
            text: "Write tests",
            prompt: "Please write unit tests for this code:",
          },
          {
            icon: "🔄",
            text: "Refactor",
            prompt: "Please refactor this code to improve readability:",
          },
        ],
        text: [
          {
            icon: "📖",
            text: "Summarize",
            prompt: "Please summarize the following text:",
          },
          {
            icon: "✍️",
            text: "Rewrite",
            prompt: "Please rewrite this text more clearly:",
          },
          {
            icon: "🌐",
            text: "Translate",
            prompt: "Please translate this to English:",
          },
          {
            icon: "✨",
            text: "Improve",
            prompt: "Please improve the writing quality of:",
          },
          {
            icon: "📋",
            text: "Extract key points",
            prompt: "Please extract the key points from:",
          },
        ],
        error: [
          {
            icon: "🔧",
            text: "Fix this error",
            prompt: "Please help me fix this error:",
          },
          {
            icon: "❓",
            text: "Explain error",
            prompt: "Please explain what this error means:",
          },
          {
            icon: "🔍",
            text: "Find cause",
            prompt: "Please help me find the root cause of:",
          },
        ],
        file: [
          {
            icon: "📂",
            text: "Analyze file",
            prompt: "Please analyze this file:",
          },
          {
            icon: "📊",
            text: "Extract data",
            prompt: "Please extract and summarize data from:",
          },
          {
            icon: "🔄",
            text: "Convert format",
            prompt: "Please help me convert this file:",
          },
        ],
        general: [
          {
            icon: "💡",
            text: "Brainstorm",
            prompt: "Let's brainstorm ideas about",
          },
          {
            icon: "📋",
            text: "Create plan",
            prompt: "Please create a step-by-step plan for",
          },
          {
            icon: "🤔",
            text: "Pros & Cons",
            prompt: "Please analyze the pros and cons of",
          },
          {
            icon: "📚",
            text: "Learn more",
            prompt: "Please explain more about",
          },
          { icon: "🎯", text: "Quick task", prompt: "Please help me with" },
        ],
      };
    }

    async initialize() {
      console.log("🎯 Bael Actionable Suggestions initializing...");

      this.injectStyles();
      this.createContainer();
      this.observeSelection();
      this.observeInput();

      this.initialized = true;
      console.log("✅ BAEL ACTIONABLE SUGGESTIONS READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-suggestions-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-suggestions-styles";
      styles.textContent = `
                .bael-suggestions-bar {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    display: flex;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(18, 18, 26, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    z-index: 9600;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-suggestions-bar.visible {
                    opacity: 1;
                    pointer-events: auto;
                    transform: translateX(-50%) translateY(0);
                }

                .suggestion-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .suggestion-btn:hover {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: rgba(99, 102, 241, 0.4);
                    transform: translateY(-2px);
                }

                .suggestion-btn:active {
                    transform: translateY(0);
                }

                .suggestion-icon {
                    font-size: 14px;
                }

                .suggestion-more {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-color: transparent;
                }

                .suggestion-more:hover {
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                }

                /* Suggestion popup */
                .suggestions-popup {
                    position: fixed;
                    bottom: 140px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                    padding: 16px;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 9650;
                    display: none;
                }

                .suggestions-popup.visible {
                    display: block;
                    animation: popupIn 0.2s ease;
                }

                @keyframes popupIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                .popup-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .popup-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                }

                .popup-close {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                }

                .popup-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .popup-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .popup-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .popup-action:hover {
                    background: rgba(99, 102, 241, 0.15);
                    border-color: rgba(99, 102, 241, 0.3);
                    color: #fff;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Main suggestion bar
      this.container = document.createElement("div");
      this.container.id = "bael-suggestions-bar";
      this.container.className = "bael-suggestions-bar";
      document.body.appendChild(this.container);

      // Popup for more actions
      this.popup = document.createElement("div");
      this.popup.id = "bael-suggestions-popup";
      this.popup.className = "suggestions-popup";
      document.body.appendChild(this.popup);
    }

    observeSelection() {
      document.addEventListener("mouseup", () => {
        setTimeout(() => {
          const selection = window.getSelection();
          const text = selection?.toString().trim();

          if (text && text.length > 10) {
            this.showForSelection(text);
          } else {
            this.hideBar();
          }
        }, 100);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.hideBar();
          this.hidePopup();
        }
      });
    }

    observeInput() {
      // Watch input fields for contextual suggestions
      document.addEventListener("input", (e) => {
        const target = e.target;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
          const text = target.value;
          if (text.endsWith(" ")) {
            this.detectContext(text);
          }
        }
      });
    }

    detectContext(text) {
      // Detect if user is writing code, dealing with error, etc.
      const lowerText = text.toLowerCase();

      if (
        lowerText.includes("error") ||
        lowerText.includes("exception") ||
        lowerText.includes("failed")
      ) {
        this.contextType = "error";
      } else if (
        text.includes("function") ||
        text.includes("{") ||
        text.includes("const ") ||
        text.includes("let ")
      ) {
        this.contextType = "code";
      } else if (
        lowerText.includes(".json") ||
        lowerText.includes(".csv") ||
        lowerText.includes(".txt")
      ) {
        this.contextType = "file";
      } else {
        this.contextType = "general";
      }
    }

    showForSelection(selectedText) {
      this.selectedText = selectedText;

      // Detect what kind of content is selected
      const isCode = this.looksLikeCode(selectedText);
      const isError = this.looksLikeError(selectedText);

      let actions;
      if (isError) {
        actions = this.actionTemplates.error.slice(0, 3);
      } else if (isCode) {
        actions = this.actionTemplates.code.slice(0, 4);
      } else {
        actions = this.actionTemplates.text.slice(0, 3);
      }

      this.renderBar(actions, true);
    }

    looksLikeCode(text) {
      const codePatterns = [
        /function\s*\(/,
        /const\s+\w+/,
        /let\s+\w+/,
        /var\s+\w+/,
        /=>/,
        /\{\s*\n/,
        /\)\s*\{/,
        /class\s+\w+/,
        /import\s+/,
        /export\s+/,
        /def\s+\w+/,
        /return\s+/,
      ];

      return codePatterns.some((pattern) => pattern.test(text));
    }

    looksLikeError(text) {
      const errorPatterns = [
        /error/i,
        /exception/i,
        /failed/i,
        /cannot\s+/i,
        /undefined/i,
        /null\s+reference/i,
        /traceback/i,
        /line\s+\d+/i,
      ];

      return errorPatterns.some((pattern) => pattern.test(text));
    }

    renderBar(actions, showMore = false) {
      this.container.innerHTML =
        actions
          .map(
            (action) => `
                <button class="suggestion-btn" onclick="BaelActionableSuggestions.executeAction('${action.prompt}')">
                    <span class="suggestion-icon">${action.icon}</span>
                    ${action.text}
                </button>
            `,
          )
          .join("") +
        (showMore
          ? `
                <button class="suggestion-btn suggestion-more" onclick="BaelActionableSuggestions.showMoreActions()">
                    <span class="suggestion-icon">⚡</span>
                    More...
                </button>
            `
          : "");

      this.showBar();
    }

    showBar() {
      this.visible = true;
      this.container.classList.add("visible");
    }

    hideBar() {
      this.visible = false;
      this.container.classList.remove("visible");
      this.selectedText = "";
    }

    showMoreActions() {
      const allActions = [
        ...this.actionTemplates.code,
        ...this.actionTemplates.text,
        ...this.actionTemplates.general,
      ];

      this.popup.innerHTML = `
                <div class="popup-header">
                    <div class="popup-title">Quick Actions</div>
                    <button class="popup-close" onclick="BaelActionableSuggestions.hidePopup()">✕</button>
                </div>
                <div class="popup-grid">
                    ${allActions
                      .map(
                        (action) => `
                        <div class="popup-action" onclick="BaelActionableSuggestions.executeAction('${action.prompt}')">
                            <span>${action.icon}</span>
                            ${action.text}
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `;

      this.popup.classList.add("visible");
    }

    hidePopup() {
      this.popup.classList.remove("visible");
    }

    executeAction(prompt) {
      const fullPrompt = this.selectedText
        ? `${prompt}\n\n\`\`\`\n${this.selectedText}\n\`\`\``
        : prompt;

      // Try to find and fill the chat input
      const chatInput = document.querySelector(
        'textarea, [contenteditable="true"], #chat-input, .chat-input',
      );
      if (chatInput) {
        if (chatInput.tagName === "TEXTAREA" || chatInput.tagName === "INPUT") {
          chatInput.value = fullPrompt;
        } else {
          chatInput.textContent = fullPrompt;
        }
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        chatInput.focus();
      }

      // Copy to clipboard as backup
      navigator.clipboard.writeText(fullPrompt);

      this.hideBar();
      this.hidePopup();
    }

    // Public API
    showSuggestions(context) {
      const actions =
        this.actionTemplates[context] || this.actionTemplates.general;
      this.renderBar(actions.slice(0, 4), true);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelActionableSuggestions = new BaelActionableSuggestions();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelActionableSuggestions.initialize();
    });
  } else {
    window.BaelActionableSuggestions.initialize();
  }

  console.log("🎯 Bael Actionable Suggestions loaded");
})();
