/**
 * BAEL FAB (Floating Action Button) Component - Lord Of All Actions
 *
 * Floating action buttons:
 * - Fixed position
 * - Speed dial menu
 * - Ripple effect
 * - Tooltip labels
 * - Extended variant
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // FAB CLASS
  // ============================================================

  class BaelFab {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-fab-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-fab-styles";
      styles.textContent = `
                .bael-fab-container {
                    position: fixed;
                    z-index: 1000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-fab-container.bottom-right { bottom: 24px; right: 24px; }
                .bael-fab-container.bottom-left { bottom: 24px; left: 24px; }
                .bael-fab-container.top-right { top: 24px; right: 24px; }
                .bael-fab-container.top-left { top: 24px; left: 24px; }
                .bael-fab-container.bottom-center { bottom: 24px; left: 50%; transform: translateX(-50%); }
                .bael-fab-container.top-center { top: 24px; left: 50%; transform: translateX(-50%); }

                /* Main FAB button */
                .bael-fab {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 56px;
                    height: 56px;
                    background: #3b82f6;
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.2);
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }

                .bael-fab:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 3px 6px rgba(0,0,0,0.3);
                }

                .bael-fab:active {
                    transform: scale(0.98);
                }

                .bael-fab svg {
                    width: 24px;
                    height: 24px;
                    transition: transform 0.25s;
                }

                .bael-fab.open svg {
                    transform: rotate(45deg);
                }

                /* Size variants */
                .bael-fab.small {
                    width: 40px;
                    height: 40px;
                }

                .bael-fab.small svg {
                    width: 18px;
                    height: 18px;
                }

                .bael-fab.large {
                    width: 72px;
                    height: 72px;
                }

                .bael-fab.large svg {
                    width: 32px;
                    height: 32px;
                }

                /* Extended variant */
                .bael-fab.extended {
                    width: auto;
                    border-radius: 28px;
                    padding: 0 24px;
                    gap: 8px;
                }

                .bael-fab.extended span {
                    font-size: 14px;
                    font-weight: 500;
                }

                /* Colors */
                .bael-fab.green { background: #22c55e; box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
                .bael-fab.purple { background: #8b5cf6; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
                .bael-fab.orange { background: #f97316; box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
                .bael-fab.red { background: #ef4444; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
                .bael-fab.pink { background: #ec4899; box-shadow: 0 4px 16px rgba(236, 72, 153, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
                .bael-fab.teal { background: #14b8a6; box-shadow: 0 4px 16px rgba(20, 184, 166, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
                .bael-fab.dark { background: #333; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }

                /* Ripple effect */
                .bael-fab-ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    transform: scale(0);
                    animation: bael-fab-ripple 0.5s ease-out;
                    pointer-events: none;
                }

                @keyframes bael-fab-ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                /* Speed dial */
                .bael-fab-dial {
                    position: absolute;
                    display: flex;
                    flex-direction: column-reverse;
                    gap: 12px;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    padding-bottom: 16px;
                    pointer-events: none;
                }

                .bael-fab-container.top-right .bael-fab-dial,
                .bael-fab-container.top-left .bael-fab-dial,
                .bael-fab-container.top-center .bael-fab-dial {
                    bottom: auto;
                    top: 100%;
                    flex-direction: column;
                    padding-bottom: 0;
                    padding-top: 16px;
                }

                .bael-fab-dial-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0;
                    transform: translateY(20px) scale(0.8);
                    transition: all 0.2s;
                }

                .bael-fab-container.top-right .bael-fab-dial-item,
                .bael-fab-container.top-left .bael-fab-dial-item,
                .bael-fab-container.top-center .bael-fab-dial-item {
                    transform: translateY(-20px) scale(0.8);
                }

                .bael-fab-container.open .bael-fab-dial {
                    pointer-events: auto;
                }

                .bael-fab-container.open .bael-fab-dial-item {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                .bael-fab-dial-item:nth-child(1) { transition-delay: 0.05s; }
                .bael-fab-dial-item:nth-child(2) { transition-delay: 0.1s; }
                .bael-fab-dial-item:nth-child(3) { transition-delay: 0.15s; }
                .bael-fab-dial-item:nth-child(4) { transition-delay: 0.2s; }
                .bael-fab-dial-item:nth-child(5) { transition-delay: 0.25s; }

                .bael-fab-dial-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: #fff;
                    border: none;
                    border-radius: 50%;
                    color: #333;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    transition: all 0.15s;
                }

                .bael-fab-dial-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .bael-fab-dial-btn svg {
                    width: 18px;
                    height: 18px;
                }

                .bael-fab-dial-label {
                    padding: 6px 12px;
                    background: rgba(0,0,0,0.8);
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                }

                /* Label position for different corners */
                .bael-fab-container.bottom-right .bael-fab-dial-item,
                .bael-fab-container.top-right .bael-fab-dial-item {
                    flex-direction: row-reverse;
                }

                /* Backdrop */
                .bael-fab-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.3);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s;
                    z-index: 999;
                }

                .bael-fab-backdrop.open {
                    opacity: 1;
                    visibility: visible;
                }

                /* Disabled state */
                .bael-fab.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Pulse animation for attention */
                .bael-fab.pulse::before {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    background: inherit;
                    opacity: 0.4;
                    animation: bael-fab-pulse 2s ease-in-out infinite;
                    z-index: -1;
                }

                @keyframes bael-fab-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.15); opacity: 0; }
                }

                .bael-fab.extended.pulse::before {
                    border-radius: 28px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _plusIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

    // ============================================================
    // CREATE FAB
    // ============================================================

    /**
     * Create FAB
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      // Default to body for fixed positioning
      container = container || document.body;

      const id = `bael-fab-${++this.idCounter}`;
      const config = {
        icon: this._plusIcon,
        label: "", // Extended label text
        position: "bottom-right", // bottom-right, bottom-left, top-right, top-left, bottom-center, top-center
        size: "default", // small, default, large
        color: "blue", // blue, green, purple, orange, red, pink, teal, dark
        extended: false,
        pulse: false, // Attention animation
        disabled: false,
        speedDial: null, // [{ icon, label, onClick }]
        showBackdrop: true,
        onClick: null,
        ...options,
      };

      // Create backdrop for speed dial
      let backdrop = null;
      if (config.speedDial && config.showBackdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "bael-fab-backdrop";
        container.appendChild(backdrop);
      }

      // Container
      const el = document.createElement("div");
      el.className = `bael-fab-container ${config.position}`;
      el.id = id;

      // Main button
      const button = document.createElement("button");
      button.className = "bael-fab";
      if (config.size !== "default") button.classList.add(config.size);
      if (config.color !== "blue") button.classList.add(config.color);
      if (config.extended && config.label) button.classList.add("extended");
      if (config.pulse) button.classList.add("pulse");
      if (config.disabled) button.classList.add("disabled");

      button.innerHTML = config.icon;
      if (config.extended && config.label) {
        button.innerHTML += `<span>${config.label}</span>`;
      }

      el.appendChild(button);

      const state = {
        id,
        element: el,
        button,
        backdrop,
        container,
        config,
        isOpen: false,
      };

      // Speed dial
      if (config.speedDial && config.speedDial.length > 0) {
        this._createSpeedDial(state);
      }

      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        open: () => this._open(state),
        close: () => this._close(state),
        toggle: () => this._toggle(state),
        setDisabled: (d) => this._setDisabled(state, d),
        setPulse: (p) => this._setPulse(state, p),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create speed dial menu
     */
    _createSpeedDial(state) {
      const { element, config } = state;

      const dial = document.createElement("div");
      dial.className = "bael-fab-dial";

      config.speedDial.forEach((item, index) => {
        const dialItem = document.createElement("div");
        dialItem.className = "bael-fab-dial-item";

        // Button
        const btn = document.createElement("button");
        btn.className = "bael-fab-dial-btn";
        btn.innerHTML = item.icon;
        btn.addEventListener("click", () => {
          if (item.onClick) item.onClick();
          this._close(state);
        });
        dialItem.appendChild(btn);

        // Label
        if (item.label) {
          const label = document.createElement("span");
          label.className = "bael-fab-dial-label";
          label.textContent = item.label;
          dialItem.appendChild(label);
        }

        dial.appendChild(dialItem);
      });

      element.appendChild(dial);
      state.dial = dial;
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { button, backdrop, config } = state;

      // Ripple effect
      button.addEventListener("click", (e) => {
        this._createRipple(e, button);

        if (config.speedDial) {
          this._toggle(state);
        } else if (config.onClick) {
          config.onClick();
        }
      });

      // Backdrop click
      if (backdrop) {
        backdrop.addEventListener("click", () => {
          this._close(state);
        });
      }

      // Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && state.isOpen) {
          this._close(state);
        }
      });
    }

    /**
     * Create ripple effect
     */
    _createRipple(e, button) {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "bael-fab-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 500);
    }

    /**
     * Open speed dial
     */
    _open(state) {
      if (!state.config.speedDial || state.isOpen) return;

      state.isOpen = true;
      state.element.classList.add("open");
      state.button.classList.add("open");
      if (state.backdrop) state.backdrop.classList.add("open");
    }

    /**
     * Close speed dial
     */
    _close(state) {
      if (!state.isOpen) return;

      state.isOpen = false;
      state.element.classList.remove("open");
      state.button.classList.remove("open");
      if (state.backdrop) state.backdrop.classList.remove("open");
    }

    /**
     * Toggle speed dial
     */
    _toggle(state) {
      if (state.isOpen) {
        this._close(state);
      } else {
        this._open(state);
      }
    }

    /**
     * Set disabled
     */
    _setDisabled(state, disabled) {
      state.config.disabled = disabled;
      state.button.classList.toggle("disabled", disabled);
    }

    /**
     * Set pulse
     */
    _setPulse(state, pulse) {
      state.config.pulse = pulse;
      state.button.classList.toggle("pulse", pulse);
    }

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      if (state.backdrop) state.backdrop.remove();
      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelFab();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$fab = (container, options) => bael.create(container, options);
  window.$floatingButton = (container, options) =>
    bael.create(container, options);
  window.$speedDial = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelFab = bael;

  console.log("🎯 BAEL FAB loaded");
})();
