/**
 * BAEL - LORD OF ALL
 * Floating Action Button (FAB) - Quick access radial menu
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelFloatingAction {
    constructor() {
      this.isExpanded = false;
      this.isDragging = false;
      this.position = this.loadPosition() || { x: "right", y: "bottom" };
      this.customPosition = null;
      this.fab = null;
      this.actions = this.getDefaultActions();
      this.init();
    }

    getDefaultActions() {
      return [
        {
          id: "new-chat",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        <line x1="12" y1="8" x2="12" y2="14"/>
                        <line x1="9" y1="11" x2="15" y2="11"/>
                    </svg>`,
          label: "New Chat",
          color: "#ff3366",
          handler: () => this.newChat(),
        },
        {
          id: "command-palette",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                    </svg>`,
          label: "Commands",
          color: "#00ffcc",
          handler: () => window.BaelCommandPalette?.toggle(),
        },
        {
          id: "focus-mode",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2"/>
                    </svg>`,
          label: "Focus Mode",
          color: "#9966ff",
          handler: () => window.BaelFocusMode?.toggle(),
        },
        {
          id: "notes",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>`,
          label: "Quick Notes",
          color: "#ffcc00",
          handler: () => window.BaelNotesPanel?.toggle(),
        },
        {
          id: "split-view",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="18" rx="1"/>
                        <rect x="14" y="3" width="7" height="18" rx="1"/>
                    </svg>`,
          label: "Split View",
          color: "#00ccff",
          handler: () => window.BaelSplitView?.toggle(),
        },
        {
          id: "performance",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>`,
          label: "Performance",
          color: "#66ff66",
          handler: () => window.BaelPerformance?.toggle(),
        },
        {
          id: "prompts",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>`,
          label: "Prompt Library",
          color: "#ff9966",
          handler: () => window.BaelPromptLibrary?.toggle(),
        },
        {
          id: "theme",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>`,
          label: "Theme Editor",
          color: "#ff66cc",
          handler: () => window.BaelThemeEditor?.toggle(),
        },
      ];
    }

    init() {
      this.createFAB();
      this.addStyles();
      this.setupDrag();
      console.log("⚡ Bael Floating Action Button initialized");
    }

    createFAB() {
      const fab = document.createElement("div");
      fab.id = "bael-fab";
      fab.className = "bael-fab";
      fab.innerHTML = `
                <button class="fab-main" title="Quick Actions">
                    <svg class="fab-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    <svg class="fab-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="fab-actions">
                    ${this.actions
                      .map(
                        (action, index) => `
                        <button class="fab-action"
                                data-action="${action.id}"
                                data-index="${index}"
                                style="--action-color: ${action.color}; --action-index: ${index};"
                                title="${action.label}">
                            ${action.icon}
                            <span class="fab-action-label">${action.label}</span>
                        </button>
                    `,
                      )
                      .join("")}
                </div>
                <div class="fab-backdrop"></div>
            `;

      document.body.appendChild(fab);
      this.fab = fab;

      // Event listeners
      fab.querySelector(".fab-main").addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });

      fab.querySelectorAll(".fab-action").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const actionId = btn.dataset.action;
          const action = this.actions.find((a) => a.id === actionId);
          if (action?.handler) {
            action.handler();
            this.collapse();
          }
        });
      });

      fab.querySelector(".fab-backdrop").addEventListener("click", () => {
        this.collapse();
      });

      // Apply saved position
      this.applyPosition();
    }

    addStyles() {
      if (document.getElementById("bael-fab-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-fab-styles";
      styles.textContent = `
                .bael-fab {
                    position: fixed;
                    z-index: 9999;
                    pointer-events: none;
                }

                .bael-fab.position-right {
                    right: 24px;
                }

                .bael-fab.position-left {
                    left: 24px;
                }

                .bael-fab.position-bottom {
                    bottom: 100px;
                }

                .bael-fab.position-top {
                    top: 100px;
                }

                .fab-main {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(135deg, var(--bael-accent, #ff3366), var(--bael-accent-dark, #cc2952));
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(255, 51, 102, 0.4),
                                0 0 40px rgba(255, 51, 102, 0.2);
                    pointer-events: auto;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    position: relative;
                    z-index: 3;
                }

                .fab-main:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(255, 51, 102, 0.5),
                                0 0 60px rgba(255, 51, 102, 0.3);
                }

                .fab-main svg {
                    width: 24px;
                    height: 24px;
                    transition: all 0.3s ease;
                }

                .fab-icon-open {
                    position: absolute;
                }

                .fab-icon-close {
                    position: absolute;
                    opacity: 0;
                    transform: rotate(-90deg) scale(0.5);
                }

                .bael-fab.expanded .fab-icon-open {
                    opacity: 0;
                    transform: rotate(90deg) scale(0.5);
                }

                .bael-fab.expanded .fab-icon-close {
                    opacity: 1;
                    transform: rotate(0) scale(1);
                }

                .fab-actions {
                    position: absolute;
                    bottom: 70px;
                    right: 0;
                    display: flex;
                    flex-direction: column-reverse;
                    gap: 12px;
                    pointer-events: none;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                }

                .bael-fab.position-left .fab-actions {
                    right: auto;
                    left: 0;
                }

                .bael-fab.position-top .fab-actions {
                    bottom: auto;
                    top: 70px;
                    flex-direction: column;
                }

                .bael-fab.expanded .fab-actions {
                    pointer-events: auto;
                    opacity: 1;
                    transform: translateY(0);
                }

                .fab-action {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px 10px 10px;
                    border: none;
                    border-radius: 28px;
                    background: var(--bael-bg-secondary, #12121a);
                    color: var(--bael-text-primary, #fff);
                    cursor: pointer;
                    white-space: nowrap;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateX(20px) scale(0.8);
                    transition-delay: calc(var(--action-index) * 0.05s);
                }

                .bael-fab.position-left .fab-action {
                    flex-direction: row-reverse;
                    padding: 10px 10px 10px 16px;
                    transform: translateX(-20px) scale(0.8);
                }

                .bael-fab.expanded .fab-action {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }

                .fab-action:hover {
                    background: var(--action-color, var(--bael-accent, #ff3366));
                    transform: translateX(-4px) scale(1.05);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4),
                                0 0 20px color-mix(in srgb, var(--action-color) 30%, transparent);
                }

                .bael-fab.position-left .fab-action:hover {
                    transform: translateX(4px) scale(1.05);
                }

                .fab-action svg {
                    width: 20px;
                    height: 20px;
                    flex-shrink: 0;
                    color: var(--action-color, var(--bael-accent, #ff3366));
                    transition: color 0.2s ease;
                }

                .fab-action:hover svg {
                    color: #fff;
                }

                .fab-action-label {
                    font-size: 13px;
                    font-weight: 500;
                }

                .fab-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(2px);
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: -1;
                }

                .bael-fab.expanded .fab-backdrop {
                    pointer-events: auto;
                    opacity: 1;
                }

                .bael-fab.dragging .fab-main {
                    cursor: grabbing;
                    transform: scale(1.15);
                }

                /* Radial layout option */
                .bael-fab.radial .fab-actions {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    flex-direction: row;
                    gap: 0;
                }

                .bael-fab.radial .fab-action {
                    position: absolute;
                    padding: 12px;
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                }

                .bael-fab.radial .fab-action-label {
                    display: none;
                }

                .bael-fab.radial.expanded .fab-action {
                    --angle: calc(var(--action-index) * 45deg - 180deg);
                    --radius: 80px;
                    transform: translate(
                        calc(cos(var(--angle)) * var(--radius)),
                        calc(sin(var(--angle)) * var(--radius))
                    ) scale(1);
                }

                /* Pulse animation */
                @keyframes fabPulse {
                    0%, 100% {
                        box-shadow: 0 4px 20px rgba(255, 51, 102, 0.4),
                                    0 0 40px rgba(255, 51, 102, 0.2);
                    }
                    50% {
                        box-shadow: 0 4px 30px rgba(255, 51, 102, 0.6),
                                    0 0 60px rgba(255, 51, 102, 0.4);
                    }
                }

                .fab-main {
                    animation: fabPulse 3s ease-in-out infinite;
                }

                .bael-fab.expanded .fab-main {
                    animation: none;
                }

                /* Mobile adjustments */
                @media (max-width: 768px) {
                    .bael-fab {
                        right: 16px;
                        bottom: 80px;
                    }

                    .fab-main {
                        width: 48px;
                        height: 48px;
                    }

                    .fab-main svg {
                        width: 20px;
                        height: 20px;
                    }

                    .fab-action {
                        padding: 8px 12px 8px 8px;
                    }

                    .fab-action svg {
                        width: 18px;
                        height: 18px;
                    }

                    .fab-action-label {
                        font-size: 12px;
                    }
                }
            `;
      document.head.appendChild(styles);
    }

    toggle() {
      if (this.isExpanded) {
        this.collapse();
      } else {
        this.expand();
      }
    }

    expand() {
      this.isExpanded = true;
      this.fab.classList.add("expanded");
      window.dispatchEvent(new CustomEvent("bael:fab:expanded"));
    }

    collapse() {
      this.isExpanded = false;
      this.fab.classList.remove("expanded");
      window.dispatchEvent(new CustomEvent("bael:fab:collapsed"));
    }

    setupDrag() {
      const main = this.fab.querySelector(".fab-main");
      let startX, startY, startLeft, startTop;
      let dragStarted = false;

      const startDrag = (e) => {
        if (this.isExpanded) return;

        startX = e.clientX || e.touches?.[0]?.clientX;
        startY = e.clientY || e.touches?.[0]?.clientY;

        const rect = this.fab.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;

        dragStarted = false;

        document.addEventListener("mousemove", doDrag);
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchmove", doDrag);
        document.addEventListener("touchend", stopDrag);
      };

      const doDrag = (e) => {
        const currentX = e.clientX || e.touches?.[0]?.clientX;
        const currentY = e.clientY || e.touches?.[0]?.clientY;

        const deltaX = Math.abs(currentX - startX);
        const deltaY = Math.abs(currentY - startY);

        if (deltaX > 10 || deltaY > 10) {
          dragStarted = true;
          this.isDragging = true;
          this.fab.classList.add("dragging");
        }

        if (!this.isDragging) return;

        const newLeft = startLeft + (currentX - startX);
        const newTop = startTop + (currentY - startY);

        // Constrain to viewport
        const maxX = window.innerWidth - 70;
        const maxY = window.innerHeight - 70;
        const constrainedX = Math.max(10, Math.min(maxX, newLeft));
        const constrainedY = Math.max(10, Math.min(maxY, newTop));

        this.fab.style.left = constrainedX + "px";
        this.fab.style.top = constrainedY + "px";
        this.fab.style.right = "auto";
        this.fab.style.bottom = "auto";
      };

      const stopDrag = () => {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", doDrag);
        document.removeEventListener("touchend", stopDrag);

        if (this.isDragging) {
          this.isDragging = false;
          this.fab.classList.remove("dragging");
          this.snapToEdge();
          this.savePosition();
        }
      };

      main.addEventListener("mousedown", startDrag);
      main.addEventListener("touchstart", startDrag);
    }

    snapToEdge() {
      const rect = this.fab.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Determine which edge is closest
      const distToLeft = centerX;
      const distToRight = window.innerWidth - centerX;
      const distToTop = centerY;
      const distToBottom = window.innerHeight - centerY;

      // Reset styles
      this.fab.style.left = "";
      this.fab.style.right = "";
      this.fab.style.top = "";
      this.fab.style.bottom = "";
      this.fab.classList.remove(
        "position-left",
        "position-right",
        "position-top",
        "position-bottom",
      );

      // Snap horizontally
      if (distToLeft < distToRight) {
        this.fab.classList.add("position-left");
        this.position.x = "left";
      } else {
        this.fab.classList.add("position-right");
        this.position.x = "right";
      }

      // Snap vertically
      if (distToTop < distToBottom) {
        this.fab.style.top = Math.max(80, rect.top) + "px";
        this.fab.classList.add("position-top");
        this.position.y = "top";
      } else {
        this.fab.style.bottom =
          Math.max(80, window.innerHeight - rect.bottom) + "px";
        this.fab.classList.add("position-bottom");
        this.position.y = "bottom";
      }

      // Store custom vertical position
      this.customPosition = {
        top: this.fab.style.top,
        bottom: this.fab.style.bottom,
      };
    }

    applyPosition() {
      this.fab.classList.add(
        `position-${this.position.x}`,
        `position-${this.position.y}`,
      );

      if (this.customPosition) {
        if (this.customPosition.top) {
          this.fab.style.top = this.customPosition.top;
        }
        if (this.customPosition.bottom) {
          this.fab.style.bottom = this.customPosition.bottom;
        }
      }
    }

    savePosition() {
      try {
        localStorage.setItem(
          "bael-fab-position",
          JSON.stringify({
            position: this.position,
            custom: this.customPosition,
          }),
        );
      } catch (e) {}
    }

    loadPosition() {
      try {
        const saved = localStorage.getItem("bael-fab-position");
        if (saved) {
          const data = JSON.parse(saved);
          this.customPosition = data.custom;
          return data.position;
        }
      } catch (e) {}
      return null;
    }

    addAction(action) {
      this.actions.push(action);
      this.refreshActions();
    }

    removeAction(actionId) {
      this.actions = this.actions.filter((a) => a.id !== actionId);
      this.refreshActions();
    }

    refreshActions() {
      const actionsContainer = this.fab.querySelector(".fab-actions");
      actionsContainer.innerHTML = this.actions
        .map(
          (action, index) => `
                <button class="fab-action"
                        data-action="${action.id}"
                        data-index="${index}"
                        style="--action-color: ${action.color}; --action-index: ${index};"
                        title="${action.label}">
                    ${action.icon}
                    <span class="fab-action-label">${action.label}</span>
                </button>
            `,
        )
        .join("");

      // Rebind events
      actionsContainer.querySelectorAll(".fab-action").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const actionId = btn.dataset.action;
          const action = this.actions.find((a) => a.id === actionId);
          if (action?.handler) {
            action.handler();
            this.collapse();
          }
        });
      });
    }

    newChat() {
      try {
        if (window.Alpine?.store("chats")?.create) {
          window.Alpine.store("chats").create();
        }
      } catch (e) {
        console.error("Could not create new chat:", e);
      }
    }

    setRadialLayout(radial) {
      this.fab.classList.toggle("radial", radial);
    }
  }

  // Initialize
  window.BaelFloatingAction = new BaelFloatingAction();
})();
