/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   █████╗ ██╗   ██╗████████╗ ██████╗      ██████╗ ██╗   ██╗██╗██████╗     █
 * █  ██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗    ██╔════╝ ██║   ██║██║██╔══██╗    █
 * █  ███████║██║   ██║   ██║   ██║   ██║    ██║  ███╗██║   ██║██║██║  ██║    █
 * █  ██╔══██║██║   ██║   ██║   ██║   ██║    ██║   ██║██║   ██║██║██║  ██║    █
 * █  ██║  ██║╚██████╔╝   ██║   ╚██████╔╝    ╚██████╔╝╚██████╔╝██║██████╔╝    █
 * █  ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝      ╚═════╝  ╚═════╝ ╚═╝╚═════╝     █
 * █                                                                          █
 * █   BAEL AUTO GUIDE - Intelligent Onboarding & Feature Discovery System   █
 * █   Contextual hints, guided tours, and smart feature suggestions         █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelAutoGuide {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.isFirstVisit = false;
      this.tourActive = false;
      this.currentStep = 0;
      this.storageKey = "bael-auto-guide";
      this.seenHints = new Set();

      // Define feature hints
      this.hints = [
        {
          id: "chat-input",
          target: "#chat-input, textarea",
          title: "Type Your Message",
          text: "Enter your message here. Tip: Use Shift+Enter for new lines!",
          position: "top",
        },
        {
          id: "settings",
          target: "#settings-btn, .settings-button",
          title: "Settings",
          text: "Configure models, API keys, and preferences",
          position: "left",
        },
        {
          id: "keyboard",
          target: "body",
          title: "Keyboard Shortcuts",
          text: "Press Ctrl+/ to open command palette with all available shortcuts",
          position: "center",
        },
        {
          id: "mode-switch",
          target: ".bael-mode-indicator",
          title: "Switch Modes",
          text: "Click to change between Coder, Researcher, Creative and more!",
          position: "bottom",
        },
        {
          id: "notes",
          target: ".bael-notes-widget",
          title: "Session Notes",
          text: "Take notes and bookmarks during your chat session",
          position: "left",
        },
      ];

      // Define full tour steps
      this.tourSteps = [
        {
          title: "Welcome to Bael! 🔥",
          text: "The most powerful AI agent framework with 300+ enhancement modules. Let me give you a quick tour!",
          icon: "👋",
        },
        {
          title: "The Chat Interface",
          text: "Type your messages here. Agent Zero will break down complex tasks and solve them step by step.",
          icon: "💬",
          highlight: "#chat-input, textarea",
        },
        {
          title: "Mode Switching",
          text: "Click the mode indicator at top to switch between Coder, Researcher, Creative, and other specialized modes.",
          icon: "🔄",
          highlight: ".bael-mode-indicator",
        },
        {
          title: "Command Palette",
          text: "Press Ctrl+/ to access all Bael features, search modules, and execute quick actions.",
          icon: "⌨️",
        },
        {
          title: "Prompt Templates",
          text: "Press Ctrl+Shift+E to access prompt engineering templates for better results.",
          icon: "📝",
        },
        {
          title: "Session Notes",
          text: "The notes widget lets you take notes and bookmark important parts of your conversation.",
          icon: "📌",
          highlight: ".bael-notes-widget",
        },
        {
          title: "Quick Data Tools",
          text: "Press Ctrl+Shift+D to extract and transform data from AI responses instantly.",
          icon: "📊",
        },
        {
          title: "Context Manager",
          text: "Press Ctrl+Shift+C to monitor your context window usage and optimize prompts.",
          icon: "🎯",
        },
        {
          title: "You're All Set! 🚀",
          text: "Explore and dominate with Bael. Remember: Maximum power, zero constraints!",
          icon: "✨",
        },
      ];
    }

    async initialize() {
      console.log("🎓 Bael Auto Guide initializing...");

      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupTriggers();

      // Check if first visit
      if (this.isFirstVisit) {
        setTimeout(() => this.showWelcome(), 1500);
      }

      this.initialized = true;
      console.log("✅ BAEL AUTO GUIDE READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-autoguide-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-autoguide-styles";
      styles.textContent = `
                /* Spotlight Overlay */
                .bael-spotlight {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9900;
                    pointer-events: none;
                    display: none;
                }

                .bael-spotlight.active {
                    display: block;
                }

                .spotlight-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    pointer-events: auto;
                }

                .spotlight-hole {
                    position: absolute;
                    border-radius: 8px;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
                    transition: all 0.3s ease;
                }

                /* Hint Tooltip */
                .bael-hint {
                    position: fixed;
                    max-width: 280px;
                    background: linear-gradient(135deg, #1e1e2e, #2d2d44);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 14px;
                    padding: 16px;
                    z-index: 9910;
                    display: none;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2);
                }

                .bael-hint.visible {
                    display: block;
                    animation: hintIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes hintIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .hint-arrow {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: #1e1e2e;
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    transform: rotate(45deg);
                }

                .hint-arrow.top { bottom: -7px; left: calc(50% - 6px); border-top: none; border-left: none; }
                .hint-arrow.bottom { top: -7px; left: calc(50% - 6px); border-bottom: none; border-right: none; }
                .hint-arrow.left { right: -7px; top: calc(50% - 6px); border-left: none; border-bottom: none; }
                .hint-arrow.right { left: -7px; top: calc(50% - 6px); border-right: none; border-top: none; }

                .hint-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hint-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                    margin-bottom: 12px;
                }

                .hint-actions {
                    display: flex;
                    gap: 8px;
                }

                .hint-btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .hint-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }

                .hint-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.8);
                }

                .hint-btn:hover {
                    opacity: 0.9;
                }

                /* Tour Modal */
                .bael-tour-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 420px;
                    max-width: 90vw;
                    background: linear-gradient(135deg, #12121a, #1a1a2e);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 20px;
                    padding: 30px;
                    z-index: 9920;
                    display: none;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6), 0 0 50px rgba(99, 102, 241, 0.15);
                }

                .bael-tour-modal.visible {
                    display: block;
                    animation: tourIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes tourIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .tour-icon {
                    font-size: 56px;
                    margin-bottom: 20px;
                }

                .tour-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 12px;
                }

                .tour-text {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .tour-progress {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    margin-bottom: 20px;
                }

                .tour-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    transition: all 0.3s;
                }

                .tour-dot.active {
                    background: #6366f1;
                    width: 24px;
                    border-radius: 4px;
                }

                .tour-dot.complete {
                    background: #10b981;
                }

                .tour-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .tour-btn {
                    padding: 12px 28px;
                    border-radius: 10px;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tour-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }

                .tour-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                }

                .tour-btn:hover {
                    transform: translateY(-2px);
                }

                /* Help Button */
                .bael-help-btn {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 9300;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                    transition: all 0.3s;
                }

                .bael-help-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
                }

                /* Welcome Dialog */
                .welcome-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(5px);
                    z-index: 9919;
                    display: none;
                }

                .welcome-backdrop.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);
    }

    createElements() {
      // Spotlight
      this.spotlight = document.createElement("div");
      this.spotlight.className = "bael-spotlight";
      this.spotlight.innerHTML = `<div class="spotlight-backdrop"></div>`;
      document.body.appendChild(this.spotlight);

      // Hint tooltip
      this.hint = document.createElement("div");
      this.hint.className = "bael-hint";
      document.body.appendChild(this.hint);

      // Tour modal backdrop
      this.tourBackdrop = document.createElement("div");
      this.tourBackdrop.className = "welcome-backdrop";
      document.body.appendChild(this.tourBackdrop);

      // Tour modal
      this.tourModal = document.createElement("div");
      this.tourModal.className = "bael-tour-modal";
      document.body.appendChild(this.tourModal);

      // Help button
      this.helpBtn = document.createElement("button");
      this.helpBtn.className = "bael-help-btn";
      this.helpBtn.innerHTML = "❓";
      this.helpBtn.title = "Start Tour / Help";
      this.helpBtn.onclick = () => this.startTour();
      document.body.appendChild(this.helpBtn);
    }

    showWelcome() {
      this.startTour();
    }

    startTour() {
      this.tourActive = true;
      this.currentStep = 0;
      this.tourBackdrop.classList.add("visible");
      this.tourModal.classList.add("visible");
      this.renderTourStep();
    }

    renderTourStep() {
      const step = this.tourSteps[this.currentStep];

      this.tourModal.innerHTML = `
                <div class="tour-icon">${step.icon}</div>
                <div class="tour-title">${step.title}</div>
                <div class="tour-text">${step.text}</div>
                <div class="tour-progress">
                    ${this.tourSteps
                      .map(
                        (_, i) => `
                        <div class="tour-dot ${i < this.currentStep ? "complete" : ""} ${i === this.currentStep ? "active" : ""}"></div>
                    `,
                      )
                      .join("")}
                </div>
                <div class="tour-actions">
                    ${
                      this.currentStep > 0
                        ? `
                        <button class="tour-btn secondary" onclick="BaelAutoGuide.prevStep()">← Back</button>
                    `
                        : `
                        <button class="tour-btn secondary" onclick="BaelAutoGuide.skipTour()">Skip Tour</button>
                    `
                    }
                    <button class="tour-btn primary" onclick="BaelAutoGuide.nextStep()">
                        ${this.currentStep < this.tourSteps.length - 1 ? "Next →" : "Get Started!"}
                    </button>
                </div>
            `;

      // Highlight element if specified
      if (step.highlight) {
        this.highlightElement(step.highlight);
      } else {
        this.clearHighlight();
      }
    }

    highlightElement(selector) {
      const el = document.querySelector(selector);
      if (!el) {
        this.clearHighlight();
        return;
      }

      const rect = el.getBoundingClientRect();
      const padding = 8;

      // Create hole in spotlight
      let hole = this.spotlight.querySelector(".spotlight-hole");
      if (!hole) {
        hole = document.createElement("div");
        hole.className = "spotlight-hole";
        this.spotlight.appendChild(hole);
      }

      hole.style.left = rect.left - padding + "px";
      hole.style.top = rect.top - padding + "px";
      hole.style.width = rect.width + padding * 2 + "px";
      hole.style.height = rect.height + padding * 2 + "px";

      this.spotlight.classList.add("active");
    }

    clearHighlight() {
      this.spotlight.classList.remove("active");
    }

    nextStep() {
      if (this.currentStep < this.tourSteps.length - 1) {
        this.currentStep++;
        this.renderTourStep();
      } else {
        this.endTour();
      }
    }

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.renderTourStep();
      }
    }

    skipTour() {
      this.endTour();
    }

    endTour() {
      this.tourActive = false;
      this.tourBackdrop.classList.remove("visible");
      this.tourModal.classList.remove("visible");
      this.clearHighlight();
      this.isFirstVisit = false;
      this.saveToStorage();
      this.showToast("🎉 Tour complete! Press ❓ anytime for help.");
    }

    showHint(hintId) {
      const hintData = this.hints.find((h) => h.id === hintId);
      if (!hintData || this.seenHints.has(hintId)) return;

      const target = document.querySelector(hintData.target);
      if (!target) return;

      const rect = target.getBoundingClientRect();

      this.hint.innerHTML = `
                <div class="hint-arrow ${hintData.position}"></div>
                <div class="hint-title">💡 ${hintData.title}</div>
                <div class="hint-text">${hintData.text}</div>
                <div class="hint-actions">
                    <button class="hint-btn secondary" onclick="BaelAutoGuide.dismissHint('${hintId}')">Got it</button>
                </div>
            `;

      // Position hint
      let top, left;
      switch (hintData.position) {
        case "top":
          top = rect.top - 120;
          left = rect.left + rect.width / 2 - 140;
          break;
        case "bottom":
          top = rect.bottom + 15;
          left = rect.left + rect.width / 2 - 140;
          break;
        case "left":
          top = rect.top + rect.height / 2 - 50;
          left = rect.left - 300;
          break;
        case "right":
          top = rect.top + rect.height / 2 - 50;
          left = rect.right + 15;
          break;
        default:
          top = window.innerHeight / 2 - 50;
          left = window.innerWidth / 2 - 140;
      }

      this.hint.style.top = Math.max(10, top) + "px";
      this.hint.style.left = Math.max(10, left) + "px";
      this.hint.classList.add("visible");
    }

    dismissHint(hintId) {
      this.seenHints.add(hintId);
      this.hint.classList.remove("visible");
      this.saveToStorage();
    }

    hideHint() {
      this.hint.classList.remove("visible");
    }

    setupTriggers() {
      // Show keyboard hint after a few seconds of inactivity
      let inactivityTimer;
      const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          if (!this.seenHints.has("keyboard") && !this.tourActive) {
            this.showHint("keyboard");
          }
        }, 30000);
      };

      document.addEventListener("mousemove", resetTimer);
      document.addEventListener("keydown", resetTimer);
      resetTimer();
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(99, 102, 241, 0.9);
                color: #fff;
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 14px;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            isFirstVisit: this.isFirstVisit,
            seenHints: [...this.seenHints],
          }),
        );
      } catch (e) {
        console.error("Failed to save guide state:", e);
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.isFirstVisit = data.isFirstVisit ?? false;
          this.seenHints = new Set(data.seenHints || []);
        } else {
          this.isFirstVisit = true;
        }
      } catch (e) {
        this.isFirstVisit = true;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelAutoGuide = new BaelAutoGuide();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelAutoGuide.initialize();
    });
  } else {
    window.BaelAutoGuide.initialize();
  }

  console.log("🎓 Bael Auto Guide loaded");
})();
