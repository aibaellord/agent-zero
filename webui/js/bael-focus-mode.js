/**
 * BAEL - LORD OF ALL
 * Focus Mode System
 * =================
 * Distraction-free interface for maximum productivity
 */

class BaelFocusMode {
  constructor() {
    this.isActive = false;
    this.hiddenElements = [];
    this.init();
  }

  init() {
    this.createToggleButton();
    this.createFocusOverlay();
    this.bindEvents();
    console.log("🎯 Bael Focus Mode initialized");
  }

  createToggleButton() {
    const btn = document.createElement("button");
    btn.id = "bael-focus-toggle";
    btn.className = "bael-focus-toggle";
    btn.innerHTML = "🎯";
    btn.title = "Toggle Focus Mode (Ctrl+Shift+F)";
    btn.onclick = () => this.toggle();

    const style = document.createElement("style");
    style.textContent = `
            .bael-focus-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--gradient-primary);
                border: none;
                font-size: 24px;
                cursor: pointer;
                z-index: 9999;
                box-shadow: var(--shadow-lg), var(--shadow-glow);
                transition: all 0.3s ease;
            }

            .bael-focus-toggle:hover {
                transform: scale(1.1);
            }

            .bael-focus-toggle.active {
                background: var(--color-success);
                animation: focus-pulse 2s infinite;
            }

            @keyframes focus-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                50% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
            }

            /* Focus Mode Styles */
            body.focus-mode .left-sidebar,
            body.focus-mode .right-sidebar,
            body.focus-mode .top-bar,
            body.focus-mode .chat-tabs,
            body.focus-mode .action-buttons:not(.focus-keep),
            body.focus-mode .heisenberg-widget,
            body.focus-mode .bael-token-counter,
            body.focus-mode .bael-notes-panel {
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }

            body.focus-mode .main-content,
            body.focus-mode .chat-container {
                max-width: 900px;
                margin: 0 auto;
            }

            body.focus-mode .chat-messages {
                padding: 40px;
            }

            body.focus-mode .input-container {
                max-width: 800px;
                margin: 0 auto;
            }

            /* Focus mode indicator */
            .focus-mode-indicator {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--color-success-bg);
                border: 1px solid var(--color-success);
                color: var(--color-success);
                padding: 8px 20px;
                border-radius: var(--radius-full);
                font-size: 14px;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            body.focus-mode .focus-mode-indicator {
                opacity: 1;
            }

            /* Hover reveal in focus mode */
            body.focus-mode:hover .left-sidebar,
            body.focus-mode:hover .right-sidebar {
                opacity: 0.3;
            }

            body.focus-mode .left-sidebar:hover,
            body.focus-mode .right-sidebar:hover {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(btn);

    // Create indicator
    const indicator = document.createElement("div");
    indicator.className = "focus-mode-indicator";
    indicator.innerHTML =
      "🎯 Focus Mode Active • Press ESC or Ctrl+Shift+F to exit";
    document.body.appendChild(indicator);

    this.toggleBtn = btn;
  }

  createFocusOverlay() {
    // Zen mode breathing overlay
    const overlay = document.createElement("div");
    overlay.id = "focus-zen-overlay";
    overlay.className = "focus-zen-overlay";
    overlay.innerHTML = `
            <div class="zen-circle"></div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            .focus-zen-overlay {
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 1;
                opacity: 0;
                transition: opacity 1s ease;
            }

            body.focus-mode .focus-zen-overlay {
                opacity: 1;
            }

            .zen-circle {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100vmax;
                height: 100vmax;
                border-radius: 50%;
                background: radial-gradient(
                    circle,
                    transparent 0%,
                    transparent 40%,
                    rgba(var(--color-primary-rgb), 0.02) 60%,
                    rgba(var(--color-primary-rgb), 0.05) 100%
                );
                animation: zen-breathe 8s ease-in-out infinite;
            }

            @keyframes zen-breathe {
                0%, 100% { transform: translate(-50%, -50%) scale(0.9); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  bindEvents() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+F to toggle
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        this.toggle();
      }

      // ESC to exit focus mode
      if (e.key === "Escape" && this.isActive) {
        this.deactivate();
      }
    });
  }

  toggle() {
    this.isActive ? this.deactivate() : this.activate();
  }

  activate() {
    this.isActive = true;
    document.body.classList.add("focus-mode");
    this.toggleBtn.classList.add("active");
    this.toggleBtn.innerHTML = "✨";

    // Store scroll position
    this.scrollPos = window.scrollY;

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("bael-focus-mode", { detail: { active: true } }),
    );

    console.log("🎯 Focus Mode activated");
  }

  deactivate() {
    this.isActive = false;
    document.body.classList.remove("focus-mode");
    this.toggleBtn.classList.remove("active");
    this.toggleBtn.innerHTML = "🎯";

    // Restore scroll position
    window.scrollTo(0, this.scrollPos);

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("bael-focus-mode", { detail: { active: false } }),
    );

    console.log("🎯 Focus Mode deactivated");
  }
}

// Initialize
let baelFocusMode;
document.addEventListener("DOMContentLoaded", () => {
  baelFocusMode = new BaelFocusMode();
  window.baelFocusMode = baelFocusMode;
});
