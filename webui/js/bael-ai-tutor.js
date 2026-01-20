/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   █████╗ ██╗    ████████╗██╗   ██╗████████╗ ██████╗ ██████╗             █
 * █  ██╔══██╗██║    ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗            █
 * █  ███████║██║       ██║   ██║   ██║   ██║   ██║   ██║██████╔╝            █
 * █  ██╔══██║██║       ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗            █
 * █  ██║  ██║██║       ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║            █
 * █  ╚═╝  ╚═╝╚═╝       ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝            █
 * █                                                                          █
 * █   BAEL AI TUTOR - Interactive Tutorial & Contextual Help System         █
 * █   Smart guided tutorials with step-by-step walkthroughs (Ctrl+Shift+?)  █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelAITutor {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.currentTutorial = null;
      this.currentStep = 0;
      this.container = null;
      this.spotlight = null;

      this.tutorials = [];
      this.completedTutorials = new Set();
    }

    async initialize() {
      console.log("🎓 Bael AI Tutor initializing...");

      this.loadProgress();
      this.registerTutorials();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      // Check for first-time users
      if (!localStorage.getItem("bael-tutor-welcomed")) {
        setTimeout(() => this.showWelcome(), 2000);
      }

      this.initialized = true;
      console.log("✅ BAEL AI TUTOR READY");

      return this;
    }

    loadProgress() {
      try {
        const saved = localStorage.getItem("bael-tutor-completed");
        if (saved) {
          this.completedTutorials = new Set(JSON.parse(saved));
        }
      } catch (e) {}
    }

    saveProgress() {
      try {
        localStorage.setItem(
          "bael-tutor-completed",
          JSON.stringify([...this.completedTutorials]),
        );
      } catch (e) {}
    }

    registerTutorials() {
      this.tutorials = [
        {
          id: "getting-started",
          title: "🚀 Getting Started with Bael",
          description: "Learn the basics of the Bael AI assistant",
          steps: [
            {
              title: "Welcome to Bael!",
              content:
                "Bael is a powerful AI assistant framework with 300+ productivity modules. Let's take a quick tour of the main features.",
              target: null,
              position: "center",
            },
            {
              title: "The Chat Interface",
              content:
                "This is where you communicate with the AI. Type your message and press Enter or click Send.",
              target: '#msg-input, textarea[name="message"], .chat-input',
              position: "top",
            },
            {
              title: "Quick Actions",
              content:
                "Use the action bar for quick access to common features like file attachments and voice input.",
              target: ".action-bar, .chat-actions, .input-actions",
              position: "top",
            },
            {
              title: "Sidebar Navigation",
              content:
                "The sidebar provides access to chat history, settings, and other tools.",
              target: '.sidebar, nav, [x-data*="sidebar"]',
              position: "right",
            },
            {
              title: "Keyboard Shortcuts",
              content:
                "Press Ctrl+Shift+? to see all available keyboard shortcuts. Master them to become a power user!",
              target: null,
              position: "center",
            },
          ],
        },
        {
          id: "power-features",
          title: "⚡ Power User Features",
          description: "Unlock advanced productivity tools",
          steps: [
            {
              title: "Command Palette",
              content:
                "Press Ctrl+K to open the command palette. Search for any action or feature instantly.",
              target: null,
              position: "center",
            },
            {
              title: "Quick Launcher",
              content:
                "Press Ctrl+Space for the quick launcher - your shortcut to every Bael module.",
              target: null,
              position: "center",
            },
            {
              title: "Code Snippets",
              content:
                "Press Ctrl+Shift+S to access your code snippets vault. Store and reuse code effortlessly.",
              target: null,
              position: "center",
            },
            {
              title: "Voice Commands",
              content:
                "Press Ctrl+Shift+M to activate voice control. Speak naturally to command Bael.",
              target: null,
              position: "center",
            },
            {
              title: "Theme Customization",
              content:
                "Press Ctrl+Shift+Y to open the theme customizer. Create your perfect workspace.",
              target: null,
              position: "center",
            },
          ],
        },
        {
          id: "productivity",
          title: "📊 Productivity Tools",
          description: "Maximize your efficiency with built-in tools",
          steps: [
            {
              title: "Pomodoro Timer",
              content:
                "Press Ctrl+Shift+P for the Pomodoro timer. Work in focused 25-minute intervals.",
              target: null,
              position: "center",
            },
            {
              title: "Progress Tracker",
              content:
                "Press Ctrl+Shift+T to track your tasks and projects with visual progress bars.",
              target: null,
              position: "center",
            },
            {
              title: "Quick Notes",
              content:
                "Press Ctrl+Shift+N for quick notes. Jot down ideas without leaving your workflow.",
              target: null,
              position: "center",
            },
            {
              title: "Chat Archives",
              content:
                "Press Ctrl+Shift+A to archive and tag important conversations for later reference.",
              target: null,
              position: "center",
            },
            {
              title: "Metrics Dashboard",
              content:
                "Press Ctrl+Shift+D to view your usage analytics and productivity insights.",
              target: null,
              position: "center",
            },
          ],
        },
        {
          id: "workspace",
          title: "🎨 Workspace Customization",
          description: "Configure your ideal working environment",
          steps: [
            {
              title: "Workspace Layouts",
              content:
                "Press Ctrl+Shift+L to manage workspace layouts. Save and restore your preferred UI configurations.",
              target: null,
              position: "center",
            },
            {
              title: "Quick Layout Switch",
              content:
                "Use Ctrl+Alt+1 through Ctrl+Alt+5 to instantly switch between preset layouts.",
              target: null,
              position: "center",
            },
            {
              title: "Focus Mode",
              content:
                "Enable Focus Mode for distraction-free work. Hide all UI elements except the chat.",
              target: null,
              position: "center",
            },
            {
              title: "Status Bar",
              content:
                "The status bar at the bottom shows system info, module count, and quick actions.",
              target: ".bael-statusbar",
              position: "top",
            },
          ],
        },
      ];
    }

    injectStyles() {
      if (document.getElementById("bael-tutor-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-tutor-styles";
      styles.textContent = `
                .bael-tutor-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .bael-tutor-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-tutor-spotlight {
                    position: fixed;
                    border: 3px solid #6366f1;
                    border-radius: 12px;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75),
                                0 0 30px rgba(99, 102, 241, 0.5);
                    z-index: 10001;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                }

                .bael-tutor-popup {
                    position: fixed;
                    width: 400px;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 10002;
                    transform: scale(0.9);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-tutor-popup.visible {
                    transform: scale(1);
                    opacity: 1;
                }

                .tutor-header {
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px 16px 0 0;
                }

                .tutor-step-indicator {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 12px;
                }

                .step-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }

                .step-dot.active {
                    background: #6366f1;
                    width: 24px;
                    border-radius: 4px;
                }

                .step-dot.completed {
                    background: #22c55e;
                }

                .tutor-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                    margin: 0;
                }

                .tutor-content {
                    padding: 24px;
                }

                .tutor-text {
                    font-size: 14px;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0;
                }

                .tutor-actions {
                    display: flex;
                    gap: 10px;
                    padding: 16px 24px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }

                .tutor-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 10px;
                    border: none;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tutor-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                }

                .tutor-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }

                .tutor-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                }

                .tutor-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                }

                /* Tutorial Menu */
                .bael-tutor-menu {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 550px;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 10003;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                }

                .bael-tutor-menu.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }

                .menu-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .menu-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }

                .menu-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .menu-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .menu-content {
                    padding: 20px 24px;
                    overflow-y: auto;
                    max-height: 60vh;
                }

                .tutorial-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tutorial-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tutorial-card:hover {
                    background: rgba(99, 102, 241, 0.08);
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateX(4px);
                }

                .tutorial-card.completed {
                    opacity: 0.6;
                }

                .tutorial-icon {
                    font-size: 28px;
                }

                .tutorial-info {
                    flex: 1;
                }

                .tutorial-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 4px;
                }

                .tutorial-desc {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .tutorial-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tutorial-steps {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .tutorial-check {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #22c55e;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                /* Contextual Help Button */
                .bael-help-fab {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border: none;
                    color: #fff;
                    font-size: 22px;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                    z-index: 9900;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-help-fab:hover {
                    transform: scale(1.1) rotate(10deg);
                    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Create overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-tutor-overlay";
      this.overlay.onclick = () => this.endTutorial();
      document.body.appendChild(this.overlay);

      // Create spotlight
      this.spotlight = document.createElement("div");
      this.spotlight.className = "bael-tutor-spotlight";
      this.spotlight.style.display = "none";
      document.body.appendChild(this.spotlight);

      // Create popup
      this.popup = document.createElement("div");
      this.popup.className = "bael-tutor-popup";
      document.body.appendChild(this.popup);

      // Create tutorial menu
      this.menu = document.createElement("div");
      this.menu.className = "bael-tutor-menu";
      document.body.appendChild(this.menu);

      // Create help FAB
      this.helpBtn = document.createElement("button");
      this.helpBtn.className = "bael-help-fab";
      this.helpBtn.innerHTML = "❓";
      this.helpBtn.title = "Help & Tutorials (Ctrl+Shift+?)";
      this.helpBtn.onclick = () => this.showMenu();
      document.body.appendChild(this.helpBtn);
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+? for help menu
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === "?" || e.key === "/")
        ) {
          e.preventDefault();
          this.showMenu();
        }

        // Escape to close
        if (e.key === "Escape") {
          if (this.currentTutorial) {
            this.endTutorial();
          } else if (this.menu.classList.contains("visible")) {
            this.hideMenu();
          }
        }

        // Arrow keys for navigation during tutorial
        if (this.currentTutorial) {
          if (e.key === "ArrowRight" || e.key === "Enter") {
            e.preventDefault();
            this.nextStep();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            this.prevStep();
          }
        }
      });
    }

    showWelcome() {
      localStorage.setItem("bael-tutor-welcomed", "true");
      this.startTutorial("getting-started");
    }

    showMenu() {
      this.renderMenu();
      this.menu.classList.add("visible");
    }

    hideMenu() {
      this.menu.classList.remove("visible");
    }

    renderMenu() {
      this.menu.innerHTML = `
                <div class="menu-header">
                    <div class="menu-title">
                        <span>🎓</span> Tutorials & Help
                    </div>
                    <button class="menu-close" onclick="BaelAITutor.hideMenu()">✕</button>
                </div>
                <div class="menu-content">
                    <div class="tutorial-list">
                        ${this.tutorials
                          .map(
                            (tutorial) => `
                            <div class="tutorial-card ${this.completedTutorials.has(tutorial.id) ? "completed" : ""}"
                                 onclick="BaelAITutor.startTutorial('${tutorial.id}')">
                                <span class="tutorial-icon">${tutorial.title.split(" ")[0]}</span>
                                <div class="tutorial-info">
                                    <div class="tutorial-name">${tutorial.title.slice(3)}</div>
                                    <div class="tutorial-desc">${tutorial.description}</div>
                                </div>
                                <div class="tutorial-status">
                                    <span class="tutorial-steps">${tutorial.steps.length} steps</span>
                                    ${
                                      this.completedTutorials.has(tutorial.id)
                                        ? '<div class="tutorial-check">✓</div>'
                                        : ""
                                    }
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `;
    }

    startTutorial(tutorialId) {
      const tutorial = this.tutorials.find((t) => t.id === tutorialId);
      if (!tutorial) return;

      this.hideMenu();
      this.currentTutorial = tutorial;
      this.currentStep = 0;

      this.overlay.classList.add("visible");
      this.showStep();
    }

    showStep() {
      if (!this.currentTutorial) return;

      const step = this.currentTutorial.steps[this.currentStep];
      if (!step) {
        this.completeTutorial();
        return;
      }

      // Position spotlight on target
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          this.spotlight.style.display = "block";
          this.spotlight.style.top = rect.top - 10 + "px";
          this.spotlight.style.left = rect.left - 10 + "px";
          this.spotlight.style.width = rect.width + 20 + "px";
          this.spotlight.style.height = rect.height + 20 + "px";

          // Position popup relative to element
          this.positionPopup(rect, step.position);
        } else {
          this.spotlight.style.display = "none";
          this.centerPopup();
        }
      } else {
        this.spotlight.style.display = "none";
        this.centerPopup();
      }

      // Render popup content
      this.renderPopup(step);
    }

    positionPopup(targetRect, position) {
      const popup = this.popup;
      const popupWidth = 400;
      const padding = 20;

      let top, left;

      switch (position) {
        case "top":
          top = targetRect.top - popup.offsetHeight - padding;
          left = targetRect.left + targetRect.width / 2 - popupWidth / 2;
          break;
        case "bottom":
          top = targetRect.bottom + padding;
          left = targetRect.left + targetRect.width / 2 - popupWidth / 2;
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - popup.offsetHeight / 2;
          left = targetRect.left - popupWidth - padding;
          break;
        case "right":
          top = targetRect.top + targetRect.height / 2 - popup.offsetHeight / 2;
          left = targetRect.right + padding;
          break;
        default:
          this.centerPopup();
          return;
      }

      // Bounds checking
      left = Math.max(
        padding,
        Math.min(left, window.innerWidth - popupWidth - padding),
      );
      top = Math.max(
        padding,
        Math.min(top, window.innerHeight - popup.offsetHeight - padding),
      );

      popup.style.top = top + "px";
      popup.style.left = left + "px";
    }

    centerPopup() {
      this.popup.style.top = "50%";
      this.popup.style.left = "50%";
      this.popup.style.transform = "translate(-50%, -50%)";
    }

    renderPopup(step) {
      const totalSteps = this.currentTutorial.steps.length;

      this.popup.innerHTML = `
                <div class="tutor-header">
                    <div class="tutor-step-indicator">
                        ${this.currentTutorial.steps
                          .map(
                            (_, i) => `
                            <div class="step-dot ${i === this.currentStep ? "active" : ""} ${i < this.currentStep ? "completed" : ""}"></div>
                        `,
                          )
                          .join("")}
                    </div>
                    <h3 class="tutor-title">${step.title}</h3>
                </div>
                <div class="tutor-content">
                    <p class="tutor-text">${step.content}</p>
                </div>
                <div class="tutor-actions">
                    ${
                      this.currentStep > 0
                        ? `
                        <button class="tutor-btn secondary" onclick="BaelAITutor.prevStep()">
                            ← Previous
                        </button>
                    `
                        : `
                        <button class="tutor-btn secondary" onclick="BaelAITutor.endTutorial()">
                            Skip
                        </button>
                    `
                    }
                    <button class="tutor-btn primary" onclick="BaelAITutor.nextStep()">
                        ${this.currentStep < totalSteps - 1 ? "Next →" : "Finish ✓"}
                    </button>
                </div>
            `;

      // Reset transform for positioned popups
      if (this.popup.style.transform === "translate(-50%, -50%)") {
        // Keep centered
      } else {
        this.popup.style.transform = "none";
      }

      this.popup.classList.add("visible");
    }

    nextStep() {
      this.currentStep++;
      if (this.currentStep >= this.currentTutorial.steps.length) {
        this.completeTutorial();
      } else {
        this.showStep();
      }
    }

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.showStep();
      }
    }

    completeTutorial() {
      this.completedTutorials.add(this.currentTutorial.id);
      this.saveProgress();

      this.toast(`Completed: ${this.currentTutorial.title}`, "success");
      this.endTutorial();
    }

    endTutorial() {
      this.currentTutorial = null;
      this.currentStep = 0;

      this.overlay.classList.remove("visible");
      this.popup.classList.remove("visible");
      this.spotlight.style.display = "none";
    }

    // Contextual help - show relevant tip for element
    showContextualHelp(element) {
      const tips = {
        "#msg-input":
          "Type your message here and press Enter to send. Use / for commands.",
        'textarea[name="message"]':
          "Type your message here and press Enter to send.",
        ".sidebar":
          "Use the sidebar to navigate between chats and access settings.",
        ".settings": "Configure Bael's behavior and appearance here.",
      };

      for (const [selector, tip] of Object.entries(tips)) {
        if (element.matches(selector)) {
          this.toast(tip, "info");
          return;
        }
      }
    }

    toast(message, type = "info") {
      window.dispatchEvent(
        new CustomEvent("bael:toast", {
          detail: { message, type },
        }),
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelAITutor = new BaelAITutor();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelAITutor.initialize();
    });
  } else {
    window.BaelAITutor.initialize();
  }

  console.log("🎓 Bael AI Tutor loaded");
})();
