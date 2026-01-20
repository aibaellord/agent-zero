/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███╗   ███╗ ██████╗ ██████╗ ███████╗    ███████╗██╗    ██╗██╗██████╗    █
 * █  ████╗ ████║██╔═══██╗██╔══██╗██╔════╝    ██╔════╝██║    ██║██║██╔══██╗   █
 * █  ██╔████╔██║██║   ██║██║  ██║█████╗      ███████╗██║ █╗ ██║██║██████╔╝   █
 * █  ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝      ╚════██║██║███╗██║██║██╔═══╝    █
 * █  ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗    ███████║╚███╔███╔╝██║██║        █
 * █  ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝        █
 * █                                                                          █
 * █   BAEL MODE SWIPE - Quick Model & Mode Switching with Gesture Support   █
 * █   Swipe or use shortcuts to switch between AI models and modes          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelModeSwipe {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.currentModeIndex = 0;
      this.currentModelIndex = 0;
      this.storageKey = "bael-mode-swipe";

      // Define modes
      this.modes = [
        {
          id: "default",
          name: "Default",
          icon: "🤖",
          color: "#6366f1",
          description: "Balanced general assistant",
        },
        {
          id: "coder",
          name: "Coder",
          icon: "💻",
          color: "#10b981",
          description: "Programming focused mode",
        },
        {
          id: "researcher",
          name: "Researcher",
          icon: "🔬",
          color: "#3b82f6",
          description: "Deep research & analysis",
        },
        {
          id: "creative",
          name: "Creative",
          icon: "🎨",
          color: "#f59e0b",
          description: "Creative writing & ideas",
        },
        {
          id: "analyst",
          name: "Analyst",
          icon: "📊",
          color: "#8b5cf6",
          description: "Data analysis & insights",
        },
        {
          id: "teacher",
          name: "Teacher",
          icon: "📚",
          color: "#ec4899",
          description: "Educational explanations",
        },
      ];

      // Define models
      this.models = [
        {
          id: "gpt-4",
          name: "GPT-4",
          icon: "🧠",
          provider: "OpenAI",
          context: "8K",
        },
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          icon: "⚡",
          provider: "OpenAI",
          context: "128K",
        },
        {
          id: "claude-3-opus",
          name: "Claude 3 Opus",
          icon: "🎭",
          provider: "Anthropic",
          context: "200K",
        },
        {
          id: "claude-3-sonnet",
          name: "Claude 3 Sonnet",
          icon: "📜",
          provider: "Anthropic",
          context: "200K",
        },
        {
          id: "gemini-1.5-pro",
          name: "Gemini 1.5 Pro",
          icon: "💎",
          provider: "Google",
          context: "1M",
        },
        {
          id: "local-llama",
          name: "Local LLaMA",
          icon: "🦙",
          provider: "Local",
          context: "4K",
        },
      ];
    }

    async initialize() {
      console.log("🔄 Bael Mode Swipe initializing...");

      this.loadFromStorage();
      this.injectStyles();
      this.createIndicator();
      this.createPanel();
      this.setupShortcuts();
      this.setupSwipeGestures();

      this.initialized = true;
      console.log("✅ BAEL MODE SWIPE READY (Ctrl+Shift+M / Swipe)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-modeswipe-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-modeswipe-styles";
      styles.textContent = `
                /* Current Mode Indicator */
                .bael-mode-indicator {
                    position: fixed;
                    top: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    background: rgba(18, 18, 26, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    cursor: pointer;
                    z-index: 9400;
                    transition: all 0.3s;
                }

                .bael-mode-indicator:hover {
                    background: rgba(30, 30, 45, 0.95);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .mode-indicator-icon {
                    font-size: 16px;
                }

                .mode-indicator-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: #fff;
                }

                .mode-indicator-model {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    padding-left: 8px;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                }

                /* Swipe Panel */
                .bael-swipe-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 500px;
                    max-width: 90vw;
                    background: #12121a;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
                    z-index: 9700;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-swipe-panel.visible {
                    display: flex;
                    animation: swipePanelIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes swipePanelIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .swipe-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .swipe-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .swipe-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                }

                .swipe-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Sections */
                .swipe-section {
                    padding: 16px 20px;
                }

                .swipe-section-title {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 12px;
                }

                /* Mode Cards */
                .mode-carousel {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    scroll-snap-type: x mandatory;
                }

                .mode-carousel::-webkit-scrollbar {
                    height: 4px;
                }

                .mode-carousel::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 2px;
                }

                .mode-carousel::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                }

                .mode-card {
                    flex-shrink: 0;
                    width: 130px;
                    padding: 16px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 2px solid transparent;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    scroll-snap-align: center;
                    text-align: center;
                }

                .mode-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                }

                .mode-card.active {
                    border-color: var(--mode-color, #6366f1);
                    background: rgba(99, 102, 241, 0.1);
                }

                .mode-card-icon {
                    font-size: 28px;
                    margin-bottom: 8px;
                }

                .mode-card-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 4px;
                }

                .mode-card-desc {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    line-height: 1.3;
                }

                /* Model List */
                .model-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .model-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .model-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .model-item.active {
                    border-color: #6366f1;
                    background: rgba(99, 102, 241, 0.08);
                }

                .model-icon {
                    font-size: 22px;
                    width: 36px;
                    text-align: center;
                }

                .model-info {
                    flex: 1;
                }

                .model-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                }

                .model-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .model-context {
                    padding: 4px 10px;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 10px;
                    font-size: 11px;
                    color: #a5b4fc;
                    font-weight: 500;
                }

                /* Quick Switch Bar */
                .quick-switch-bar {
                    display: flex;
                    gap: 6px;
                    padding: 16px 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.02);
                }

                .quick-switch-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: transparent;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .quick-switch-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .quick-switch-btn span {
                    font-size: 16px;
                }

                /* Overlay */
                .swipe-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 9699;
                    display: none;
                }

                .swipe-overlay.visible {
                    display: block;
                }

                /* Swipe Hint */
                .swipe-hint {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 20px 40px;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 16px;
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    z-index: 9999;
                }

                .swipe-hint.visible {
                    display: flex;
                    animation: fadeIn 0.2s;
                }

                .swipe-hint-icon {
                    font-size: 48px;
                }

                .swipe-hint-text {
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }
            `;
      document.head.appendChild(styles);
    }

    createIndicator() {
      this.indicator = document.createElement("div");
      this.indicator.className = "bael-mode-indicator";
      this.indicator.onclick = () => this.toggle();
      this.updateIndicator();
      document.body.appendChild(this.indicator);
    }

    updateIndicator() {
      const mode = this.modes[this.currentModeIndex];
      const model = this.models[this.currentModelIndex];

      this.indicator.innerHTML = `
                <span class="mode-indicator-icon">${mode.icon}</span>
                <span class="mode-indicator-name">${mode.name}</span>
                <span class="mode-indicator-model">${model.name}</span>
            `;

      this.indicator.style.borderColor = mode.color;
    }

    createPanel() {
      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "swipe-overlay";
      this.overlay.onclick = () => this.hide();
      document.body.appendChild(this.overlay);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-swipe-panel";
      this.renderPanel();
      document.body.appendChild(this.panel);

      // Swipe hint
      this.swipeHint = document.createElement("div");
      this.swipeHint.className = "swipe-hint";
      document.body.appendChild(this.swipeHint);
    }

    renderPanel() {
      this.panel.innerHTML = `
                <div class="swipe-header">
                    <div class="swipe-title">
                        <span>🔄</span>
                        Mode & Model Switcher
                    </div>
                    <button class="swipe-close" onclick="BaelModeSwipe.hide()">✕</button>
                </div>

                <div class="swipe-section">
                    <div class="swipe-section-title">Agent Mode (Swipe or ←/→)</div>
                    <div class="mode-carousel" id="mode-carousel">
                        ${this.modes
                          .map(
                            (mode, i) => `
                            <div class="mode-card ${i === this.currentModeIndex ? "active" : ""}"
                                 style="--mode-color: ${mode.color}"
                                 onclick="BaelModeSwipe.selectMode(${i})">
                                <div class="mode-card-icon">${mode.icon}</div>
                                <div class="mode-card-name">${mode.name}</div>
                                <div class="mode-card-desc">${mode.description}</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="swipe-section">
                    <div class="swipe-section-title">AI Model (↑/↓ to switch)</div>
                    <div class="model-list">
                        ${this.models
                          .map(
                            (model, i) => `
                            <div class="model-item ${i === this.currentModelIndex ? "active" : ""}"
                                 onclick="BaelModeSwipe.selectModel(${i})">
                                <span class="model-icon">${model.icon}</span>
                                <div class="model-info">
                                    <div class="model-name">${model.name}</div>
                                    <div class="model-meta">${model.provider}</div>
                                </div>
                                <span class="model-context">${model.context}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="quick-switch-bar">
                    <button class="quick-switch-btn" onclick="BaelModeSwipe.quickSwitch('fast')">
                        <span>⚡</span>
                        Fast Mode
                    </button>
                    <button class="quick-switch-btn" onclick="BaelModeSwipe.quickSwitch('quality')">
                        <span>🎯</span>
                        Quality Mode
                    </button>
                    <button class="quick-switch-btn" onclick="BaelModeSwipe.quickSwitch('local')">
                        <span>🏠</span>
                        Local Only
                    </button>
                    <button class="quick-switch-btn" onclick="BaelModeSwipe.quickSwitch('reset')">
                        <span>↩️</span>
                        Reset
                    </button>
                </div>
            `;
    }

    selectMode(index) {
      this.currentModeIndex = index;
      this.saveToStorage();
      this.updateIndicator();
      this.renderPanel();
      this.showSwipeHint(this.modes[index].icon, this.modes[index].name);

      // Emit mode change event
      window.dispatchEvent(
        new CustomEvent("bael:modeChanged", {
          detail: { mode: this.modes[index] },
        }),
      );
    }

    selectModel(index) {
      this.currentModelIndex = index;
      this.saveToStorage();
      this.updateIndicator();
      this.renderPanel();

      // Emit model change event
      window.dispatchEvent(
        new CustomEvent("bael:modelChanged", {
          detail: { model: this.models[index] },
        }),
      );
    }

    quickSwitch(preset) {
      switch (preset) {
        case "fast":
          this.currentModeIndex = 0; // Default
          this.currentModelIndex = 1; // GPT-4 Turbo
          break;
        case "quality":
          this.currentModeIndex = 2; // Researcher
          this.currentModelIndex = 2; // Claude 3 Opus
          break;
        case "local":
          this.currentModeIndex = 0;
          this.currentModelIndex = 5; // Local
          break;
        case "reset":
          this.currentModeIndex = 0;
          this.currentModelIndex = 0;
          break;
      }

      this.saveToStorage();
      this.updateIndicator();
      this.renderPanel();
      this.showToast(`Switched to ${preset} preset`);
    }

    showSwipeHint(icon, text) {
      this.swipeHint.innerHTML = `
                <div class="swipe-hint-icon">${icon}</div>
                <div class="swipe-hint-text">${text}</div>
            `;
      this.swipeHint.classList.add("visible");

      setTimeout(() => {
        this.swipeHint.classList.remove("visible");
      }, 800);
    }

    setupSwipeGestures() {
      let startX = 0;
      let startY = 0;

      document.addEventListener(
        "touchstart",
        (e) => {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        },
        { passive: true },
      );

      document.addEventListener(
        "touchend",
        (e) => {
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;

          const diffX = endX - startX;
          const diffY = endY - startY;

          // Horizontal swipe (mode change)
          if (Math.abs(diffX) > 100 && Math.abs(diffY) < 50) {
            if (diffX > 0) {
              // Swipe right - previous mode
              this.prevMode();
            } else {
              // Swipe left - next mode
              this.nextMode();
            }
          }

          // Vertical swipe (model change)
          if (Math.abs(diffY) > 100 && Math.abs(diffX) < 50) {
            if (diffY > 0) {
              // Swipe down - previous model
              this.prevModel();
            } else {
              // Swipe up - next model
              this.nextModel();
            }
          }
        },
        { passive: true },
      );
    }

    prevMode() {
      const newIndex =
        (this.currentModeIndex - 1 + this.modes.length) % this.modes.length;
      this.selectMode(newIndex);
    }

    nextMode() {
      const newIndex = (this.currentModeIndex + 1) % this.modes.length;
      this.selectMode(newIndex);
    }

    prevModel() {
      const newIndex =
        (this.currentModelIndex - 1 + this.models.length) % this.models.length;
      this.selectModel(newIndex);
    }

    nextModel() {
      const newIndex = (this.currentModelIndex + 1) % this.models.length;
      this.selectModel(newIndex);
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Open panel
        if (e.ctrlKey && e.shiftKey && e.key === "M") {
          e.preventDefault();
          this.toggle();
        }

        // When panel is open
        if (this.visible) {
          if (e.key === "Escape") {
            this.hide();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            this.prevMode();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            this.nextMode();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            this.prevModel();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            this.nextModel();
          }
        }
      });
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
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            modeIndex: this.currentModeIndex,
            modelIndex: this.currentModelIndex,
          }),
        );
      } catch (e) {
        console.error("Failed to save mode:", e);
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.currentModeIndex = data.modeIndex || 0;
          this.currentModelIndex = data.modelIndex || 0;
        }
      } catch (e) {
        console.error("Failed to load mode:", e);
      }
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.visible = true;
      this.overlay.classList.add("visible");
      this.panel.classList.add("visible");
      this.renderPanel();
    }

    hide() {
      this.visible = false;
      this.overlay.classList.remove("visible");
      this.panel.classList.remove("visible");
    }

    // API Methods
    getCurrentMode() {
      return this.modes[this.currentModeIndex];
    }

    getCurrentModel() {
      return this.models[this.currentModelIndex];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelModeSwipe = new BaelModeSwipe();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelModeSwipe.initialize();
    });
  } else {
    window.BaelModeSwipe.initialize();
  }

  console.log("🔄 Bael Mode Swipe loaded");
})();
