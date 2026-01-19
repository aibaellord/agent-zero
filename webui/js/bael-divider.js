/**
 * BAEL Divider Component - Lord Of All Separators
 *
 * Content dividers and separators:
 * - Horizontal/Vertical
 * - Label support
 * - Various styles
 * - Icon dividers
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // DIVIDER CLASS
  // ============================================================

  class BaelDivider {
    constructor() {
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-divider-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-divider-styles";
      styles.textContent = `
                .bael-divider {
                    display: flex;
                    align-items: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                /* Horizontal */
                .bael-divider.horizontal {
                    width: 100%;
                    flex-direction: row;
                }

                .bael-divider.horizontal::before,
                .bael-divider.horizontal::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                }

                .bael-divider.horizontal.no-label::after {
                    display: none;
                }

                .bael-divider.horizontal.no-label::before {
                    flex: unset;
                    width: 100%;
                }

                /* Vertical */
                .bael-divider.vertical {
                    flex-direction: column;
                    height: 100%;
                    width: auto;
                }

                .bael-divider.vertical::before,
                .bael-divider.vertical::after {
                    content: '';
                    flex: 1;
                    width: 1px;
                    background: rgba(255,255,255,0.1);
                }

                .bael-divider.vertical.no-label::after {
                    display: none;
                }

                .bael-divider.vertical.no-label::before {
                    flex: unset;
                    height: 100%;
                }

                /* Label */
                .bael-divider-label {
                    padding: 0 16px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .bael-divider.vertical .bael-divider-label {
                    padding: 12px 0;
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }

                /* Icon */
                .bael-divider-icon {
                    padding: 0 12px;
                    color: #555;
                }

                .bael-divider-icon svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-divider.vertical .bael-divider-icon {
                    padding: 8px 0;
                }

                /* Styles */
                .bael-divider.dashed::before,
                .bael-divider.dashed::after {
                    background: none;
                    border-bottom: 1px dashed rgba(255,255,255,0.15);
                    height: 0;
                }

                .bael-divider.vertical.dashed::before,
                .bael-divider.vertical.dashed::after {
                    border-bottom: none;
                    border-right: 1px dashed rgba(255,255,255,0.15);
                    width: 0;
                }

                .bael-divider.dotted::before,
                .bael-divider.dotted::after {
                    background: none;
                    border-bottom: 1px dotted rgba(255,255,255,0.2);
                    height: 0;
                }

                .bael-divider.vertical.dotted::before,
                .bael-divider.vertical.dotted::after {
                    border-bottom: none;
                    border-right: 1px dotted rgba(255,255,255,0.2);
                    width: 0;
                }

                .bael-divider.thick::before,
                .bael-divider.thick::after {
                    height: 2px;
                }

                .bael-divider.vertical.thick::before,
                .bael-divider.vertical.thick::after {
                    height: auto;
                    width: 2px;
                }

                /* Gradient */
                .bael-divider.gradient::before {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15));
                }

                .bael-divider.gradient::after {
                    background: linear-gradient(90deg, rgba(255,255,255,0.15), transparent);
                }

                .bael-divider.vertical.gradient::before {
                    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.15));
                }

                .bael-divider.vertical.gradient::after {
                    background: linear-gradient(180deg, rgba(255,255,255,0.15), transparent);
                }

                /* Colors */
                .bael-divider.blue::before,
                .bael-divider.blue::after { background: rgba(59, 130, 246, 0.3); }
                .bael-divider.green::before,
                .bael-divider.green::after { background: rgba(34, 197, 94, 0.3); }
                .bael-divider.purple::before,
                .bael-divider.purple::after { background: rgba(139, 92, 246, 0.3); }
                .bael-divider.orange::before,
                .bael-divider.orange::after { background: rgba(249, 115, 22, 0.3); }
                .bael-divider.red::before,
                .bael-divider.red::after { background: rgba(239, 68, 68, 0.3); }

                .bael-divider.blue .bael-divider-label { color: #3b82f6; }
                .bael-divider.green .bael-divider-label { color: #22c55e; }
                .bael-divider.purple .bael-divider-label { color: #8b5cf6; }
                .bael-divider.orange .bael-divider-label { color: #f97316; }
                .bael-divider.red .bael-divider-label { color: #ef4444; }

                /* Spacing */
                .bael-divider.spacing-sm {
                    margin: 8px 0;
                }

                .bael-divider.spacing-md {
                    margin: 16px 0;
                }

                .bael-divider.spacing-lg {
                    margin: 24px 0;
                }

                .bael-divider.spacing-xl {
                    margin: 32px 0;
                }

                .bael-divider.vertical.spacing-sm {
                    margin: 0 8px;
                }

                .bael-divider.vertical.spacing-md {
                    margin: 0 16px;
                }

                .bael-divider.vertical.spacing-lg {
                    margin: 0 24px;
                }

                .bael-divider.vertical.spacing-xl {
                    margin: 0 32px;
                }

                /* Label position */
                .bael-divider.label-left::before {
                    flex: 0;
                    width: 32px;
                }

                .bael-divider.label-left::after {
                    flex: 1;
                }

                .bael-divider.label-right::before {
                    flex: 1;
                }

                .bael-divider.label-right::after {
                    flex: 0;
                    width: 32px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE DIVIDER
    // ============================================================

    /**
     * Create divider
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Divider container not found");
        return null;
      }

      const id = `bael-divider-${++this.idCounter}`;
      const config = {
        orientation: "horizontal", // horizontal, vertical
        label: "",
        icon: null, // SVG icon
        style: "solid", // solid, dashed, dotted, gradient
        thickness: "default", // default, thick
        color: null, // blue, green, purple, orange, red
        spacing: null, // sm, md, lg, xl
        labelPosition: "center", // left, center, right
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-divider";
      el.classList.add(config.orientation);
      if (config.style !== "solid") el.classList.add(config.style);
      if (config.thickness !== "default") el.classList.add(config.thickness);
      if (config.color) el.classList.add(config.color);
      if (config.spacing) el.classList.add(`spacing-${config.spacing}`);
      if (!config.label && !config.icon) el.classList.add("no-label");
      if (config.labelPosition !== "center")
        el.classList.add(`label-${config.labelPosition}`);
      el.id = id;
      el.role = "separator";
      el.setAttribute("aria-orientation", config.orientation);

      // Icon
      if (config.icon) {
        const icon = document.createElement("span");
        icon.className = "bael-divider-icon";
        icon.innerHTML = config.icon;
        el.appendChild(icon);
      }
      // Label
      else if (config.label) {
        const label = document.createElement("span");
        label.className = "bael-divider-label";
        label.textContent = config.label;
        el.appendChild(label);
      }

      container.appendChild(el);

      return {
        id,
        element: el,
        destroy: () => el.remove(),
      };
    }

    /**
     * Quick horizontal divider
     */
    hr(container, label = "", options = {}) {
      return this.create(container, {
        label,
        orientation: "horizontal",
        ...options,
      });
    }

    /**
     * Quick vertical divider
     */
    vr(container, label = "", options = {}) {
      return this.create(container, {
        label,
        orientation: "vertical",
        ...options,
      });
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelDivider();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$divider = (container, options) => bael.create(container, options);
  window.$hr = (container, label, options) =>
    bael.hr(container, label, options);
  window.$vr = (container, label, options) =>
    bael.vr(container, label, options);
  window.$separator = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelDivider = bael;

  console.log("➖ BAEL Divider loaded");
})();
