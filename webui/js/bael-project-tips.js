/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗  ██████╗      ██╗████████╗██╗██████╗ ███████╗          █
 * █   ██╔══██╗██╔══██╗██╔═══██╗     ██║╚══██╔══╝██║██╔══██╗██╔════╝          █
 * █   ██████╔╝██████╔╝██║   ██║     ██║   ██║   ██║██████╔╝███████╗          █
 * █   ██╔═══╝ ██╔══██╗██║   ██║██   ██║   ██║   ██║██╔═══╝ ╚════██║          █
 * █   ██║     ██║  ██║╚██████╔╝╚█████╔╝   ██║   ██║██║     ███████║          █
 * █   ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝    ╚═╝   ╚═╝╚═╝     ╚══════╝          █
 * █                                                                          █
 * █   BAEL PROJECT TIPS - Contextual Help & Smart Suggestions                █
 * █   AI-powered tips and guidance based on current context                  █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelProjectTips {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.currentTips = [];
      this.dismissed = new Set();

      // Tips database categorized by context
      this.tipsDatabase = {
        general: [
          {
            id: "tip-keyboard",
            title: "⌨️ Keyboard Shortcuts",
            content:
              "Press Ctrl+Shift+K to view all available keyboard shortcuts.",
            action: {
              label: "Open Shortcuts",
              fn: () => window.BaelKeyboardShortcuts?.show(),
            },
          },
          {
            id: "tip-favorites",
            title: "⭐ Save to Favorites",
            content:
              "Use Ctrl+Shift+F to open Favorites and save important chats, prompts, or URLs.",
            action: {
              label: "Open Favorites",
              fn: () => window.BaelFavorites?.show(),
            },
          },
          {
            id: "tip-themes",
            title: "🎨 Customize Theme",
            content: "Create your own custom theme with Ctrl+Shift+Y.",
            action: {
              label: "Customize",
              fn: () => window.BaelThemeCustomizer?.show(),
            },
          },
          {
            id: "tip-voice",
            title: "🎤 Voice Commands",
            content:
              "Enable voice control with Ctrl+Shift+M for hands-free operation.",
            action: {
              label: "Enable Voice",
              fn: () => window.BaelVoiceCommander?.show(),
            },
          },
        ],
        coding: [
          {
            id: "tip-snippets",
            title: "✂️ Code Snippets",
            content:
              "Save frequently used code in the Snippets Vault (Ctrl+Shift+V).",
            action: {
              label: "Open Snippets",
              fn: () => window.BaelSnippetsVault?.show(),
            },
          },
          {
            id: "tip-code-format",
            title: "📝 Better Code Output",
            content:
              "Ask the agent to format code with comments and type hints for clearer results.",
          },
        ],
        productivity: [
          {
            id: "tip-pomodoro",
            title: "⏱️ Pomodoro Timer",
            content:
              "Use the Pomodoro timer (Ctrl+Shift+P) to maintain focus and take regular breaks.",
          },
          {
            id: "tip-notes",
            title: "📝 Quick Notes",
            content: "Jot down ideas quickly with Quick Notes (Ctrl+Shift+N).",
          },
          {
            id: "tip-layouts",
            title: "🖼️ Workspace Layouts",
            content:
              "Save your workspace arrangement with Ctrl+Shift+L and switch between layouts.",
          },
        ],
        analysis: [
          {
            id: "tip-insights",
            title: "💡 Chat Insights",
            content:
              "View conversation analytics and patterns with Ctrl+Shift+I.",
            action: {
              label: "View Insights",
              fn: () => window.BaelChatInsights?.show(),
            },
          },
          {
            id: "tip-visualizer",
            title: "📊 Data Visualization",
            content:
              "Open the Data Visualizer (Ctrl+Shift+G) to see usage charts and statistics.",
            action: {
              label: "Open Charts",
              fn: () => window.BaelDataVisualizer?.show(),
            },
          },
        ],
        newUser: [
          {
            id: "tip-tutor",
            title: "📚 Interactive Tutorial",
            content:
              "New here? Start the AI Tutor (Ctrl+Shift+?) for a guided tour of Bael features.",
            action: {
              label: "Start Tutorial",
              fn: () => window.BaelAITutor?.show(),
            },
          },
          {
            id: "tip-help",
            title: "❓ Getting Help",
            content:
              'Click the ? button or ask the agent "help me get started" for assistance.',
          },
        ],
      };
    }

    async initialize() {
      console.log("💡 Bael Project Tips initializing...");

      this.loadDismissed();
      this.injectStyles();
      this.createContainer();
      this.detectContext();

      // Show tips after delay for non-intrusive experience
      setTimeout(() => this.showContextualTip(), 3000);

      this.initialized = true;
      console.log("✅ BAEL PROJECT TIPS READY");

      return this;
    }

    loadDismissed() {
      try {
        const saved = localStorage.getItem("bael-dismissed-tips");
        if (saved) {
          this.dismissed = new Set(JSON.parse(saved));
        }
      } catch (e) {}
    }

    saveDismissed() {
      try {
        localStorage.setItem(
          "bael-dismissed-tips",
          JSON.stringify([...this.dismissed]),
        );
      } catch (e) {}
    }

    detectContext() {
      // Detect user context for relevant tips
      const isNewUser = !localStorage.getItem("bael-returning-user");
      const chatHistory = localStorage.getItem("bael-chat-history");
      const hasCoded =
        chatHistory?.includes("code") || chatHistory?.includes("function");

      localStorage.setItem("bael-returning-user", "true");

      this.currentTips = [];

      if (isNewUser) {
        this.currentTips.push(...this.tipsDatabase.newUser);
      }

      this.currentTips.push(...this.tipsDatabase.general);

      if (hasCoded) {
        this.currentTips.push(...this.tipsDatabase.coding);
      }

      this.currentTips.push(...this.tipsDatabase.productivity);
      this.currentTips.push(...this.tipsDatabase.analysis);

      // Filter dismissed tips
      this.currentTips = this.currentTips.filter(
        (t) => !this.dismissed.has(t.id),
      );
    }

    injectStyles() {
      if (document.getElementById("bael-tips-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-tips-styles";
      styles.textContent = `
                .bael-tip-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 340px;
                    background: linear-gradient(135deg, #1a1a25, #12121a);
                    border-radius: 16px;
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
                                0 0 40px rgba(99, 102, 241, 0.1);
                    z-index: 9600;
                    overflow: hidden;
                    transform: translateX(400px);
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-tip-toast.visible {
                    transform: translateX(0);
                    opacity: 1;
                }

                .tip-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: rgba(99, 102, 241, 0.1);
                    border-bottom: 1px solid rgba(99, 102, 241, 0.2);
                }

                .tip-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #6366f1;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .tip-close {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .tip-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .tip-content {
                    padding: 16px;
                }

                .tip-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 8px;
                }

                .tip-text {
                    font-size: 13px;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.7);
                }

                .tip-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    background: rgba(0, 0, 0, 0.2);
                }

                .tip-action {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: #6366f1;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tip-action:hover {
                    background: #4f46e5;
                }

                .tip-dismiss {
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tip-dismiss:hover {
                    color: #fff;
                }

                .tip-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tip-nav-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }

                .tip-nav-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .tip-nav-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .tip-counter {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-project-tips";
      this.container.className = "bael-tip-toast";
      document.body.appendChild(this.container);
    }

    showContextualTip() {
      if (this.currentTips.length === 0) return;

      this.currentIndex = 0;
      this.render();
      this.visible = true;

      setTimeout(() => {
        this.container.classList.add("visible");
      }, 100);
    }

    showTip(tip) {
      this.currentTips = [tip];
      this.currentIndex = 0;
      this.render();
      this.visible = true;
      this.container.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    nextTip() {
      if (this.currentIndex < this.currentTips.length - 1) {
        this.currentIndex++;
        this.render();
      }
    }

    prevTip() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.render();
      }
    }

    dismissTip(tipId) {
      this.dismissed.add(tipId);
      this.saveDismissed();

      this.currentTips = this.currentTips.filter((t) => t.id !== tipId);

      if (this.currentTips.length === 0) {
        this.hide();
      } else {
        if (this.currentIndex >= this.currentTips.length) {
          this.currentIndex = this.currentTips.length - 1;
        }
        this.render();
      }
    }

    dismissAll() {
      this.currentTips.forEach((t) => this.dismissed.add(t.id));
      this.saveDismissed();
      this.currentTips = [];
      this.hide();
    }

    resetDismissed() {
      this.dismissed.clear();
      this.saveDismissed();
      this.detectContext();
    }

    render() {
      if (this.currentTips.length === 0) return;

      const tip = this.currentTips[this.currentIndex];

      this.container.innerHTML = `
                <div class="tip-header">
                    <div class="tip-label">
                        <span>💡</span> Pro Tip
                    </div>
                    <button class="tip-close" onclick="BaelProjectTips.hide()">✕</button>
                </div>
                <div class="tip-content">
                    <div class="tip-title">${tip.title}</div>
                    <div class="tip-text">${tip.content}</div>
                </div>
                <div class="tip-footer">
                    <div class="tip-nav">
                        <button class="tip-nav-btn" onclick="BaelProjectTips.prevTip()"
                                ${this.currentIndex === 0 ? "disabled" : ""}>◀</button>
                        <span class="tip-counter">${this.currentIndex + 1}/${this.currentTips.length}</span>
                        <button class="tip-nav-btn" onclick="BaelProjectTips.nextTip()"
                                ${this.currentIndex === this.currentTips.length - 1 ? "disabled" : ""}>▶</button>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="tip-dismiss" onclick="BaelProjectTips.dismissTip('${tip.id}')">
                            Don't show again
                        </button>
                        ${
                          tip.action
                            ? `
                            <button class="tip-action" id="tip-action-btn">
                                ${tip.action.label}
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;

      // Bind action
      if (tip.action) {
        document
          .getElementById("tip-action-btn")
          ?.addEventListener("click", () => {
            tip.action.fn();
            this.hide();
          });
      }
    }

    // Public API
    show() {
      this.detectContext();
      this.showContextualTip();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelProjectTips = new BaelProjectTips();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelProjectTips.initialize();
    });
  } else {
    window.BaelProjectTips.initialize();
  }

  console.log("💡 Bael Project Tips loaded");
})();
