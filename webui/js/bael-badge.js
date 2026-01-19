/**
 * BAEL Badge Component - Lord Of All Badges
 *
 * Versatile badge/tag component with:
 * - Multiple variants
 * - Sizes
 * - Colors
 * - Dot indicators
 * - Removable badges
 * - Notification counts
 * - Pulse animations
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // BADGE CLASS
  // ============================================================

  class BaelBadge {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-badge-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-badge-styles";
      styles.textContent = `
                .bael-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 500;
                    line-height: 1;
                    padding: 4px 8px;
                    border-radius: 9999px;
                    white-space: nowrap;
                    gap: 4px;
                }

                /* Variants */
                .bael-badge-solid { background: #4f46e5; color: white; }
                .bael-badge-outline { background: transparent; border: 1px solid #4f46e5; color: #4f46e5; }
                .bael-badge-soft { background: #eef2ff; color: #4f46e5; }

                /* Colors - Solid */
                .bael-badge-solid.bael-badge-primary { background: #4f46e5; color: white; }
                .bael-badge-solid.bael-badge-success { background: #10b981; color: white; }
                .bael-badge-solid.bael-badge-warning { background: #f59e0b; color: white; }
                .bael-badge-solid.bael-badge-danger { background: #ef4444; color: white; }
                .bael-badge-solid.bael-badge-info { background: #06b6d4; color: white; }
                .bael-badge-solid.bael-badge-dark { background: #1f2937; color: white; }
                .bael-badge-solid.bael-badge-light { background: #f3f4f6; color: #374151; }

                /* Colors - Outline */
                .bael-badge-outline.bael-badge-primary { border-color: #4f46e5; color: #4f46e5; }
                .bael-badge-outline.bael-badge-success { border-color: #10b981; color: #10b981; }
                .bael-badge-outline.bael-badge-warning { border-color: #f59e0b; color: #f59e0b; }
                .bael-badge-outline.bael-badge-danger { border-color: #ef4444; color: #ef4444; }
                .bael-badge-outline.bael-badge-info { border-color: #06b6d4; color: #06b6d4; }
                .bael-badge-outline.bael-badge-dark { border-color: #1f2937; color: #1f2937; }
                .bael-badge-outline.bael-badge-light { border-color: #d1d5db; color: #6b7280; }

                /* Colors - Soft */
                .bael-badge-soft.bael-badge-primary { background: #eef2ff; color: #4f46e5; }
                .bael-badge-soft.bael-badge-success { background: #d1fae5; color: #059669; }
                .bael-badge-soft.bael-badge-warning { background: #fef3c7; color: #d97706; }
                .bael-badge-soft.bael-badge-danger { background: #fee2e2; color: #dc2626; }
                .bael-badge-soft.bael-badge-info { background: #cffafe; color: #0891b2; }
                .bael-badge-soft.bael-badge-dark { background: #e5e7eb; color: #374151; }
                .bael-badge-soft.bael-badge-light { background: #f9fafb; color: #6b7280; }

                /* Sizes */
                .bael-badge-xs { font-size: 0.625rem; padding: 2px 6px; }
                .bael-badge-sm { font-size: 0.7rem; padding: 3px 7px; }
                .bael-badge-md { font-size: 0.75rem; padding: 4px 8px; }
                .bael-badge-lg { font-size: 0.875rem; padding: 5px 10px; }
                .bael-badge-xl { font-size: 1rem; padding: 6px 12px; }

                /* Rounded */
                .bael-badge-rounded { border-radius: 9999px; }
                .bael-badge-square { border-radius: 4px; }

                /* Dot */
                .bael-badge-dot {
                    width: 8px;
                    height: 8px;
                    min-width: 8px;
                    padding: 0;
                    border-radius: 50%;
                }

                .bael-badge-dot.bael-badge-sm { width: 6px; height: 6px; min-width: 6px; }
                .bael-badge-dot.bael-badge-lg { width: 10px; height: 10px; min-width: 10px; }
                .bael-badge-dot.bael-badge-xl { width: 12px; height: 12px; min-width: 12px; }

                /* Removable */
                .bael-badge-remove {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 14px;
                    height: 14px;
                    margin-left: 2px;
                    margin-right: -4px;
                    border-radius: 50%;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.15s, background 0.15s;
                    font-size: 0.75rem;
                    line-height: 1;
                }

                .bael-badge-remove:hover {
                    opacity: 1;
                    background: rgba(0,0,0,0.1);
                }

                /* Positioned badge */
                .bael-badge-wrapper {
                    position: relative;
                    display: inline-flex;
                }

                .bael-badge-positioned {
                    position: absolute;
                }

                .bael-badge-top-right { top: 0; right: 0; transform: translate(50%, -50%); }
                .bael-badge-top-left { top: 0; left: 0; transform: translate(-50%, -50%); }
                .bael-badge-bottom-right { bottom: 0; right: 0; transform: translate(50%, 50%); }
                .bael-badge-bottom-left { bottom: 0; left: 0; transform: translate(-50%, 50%); }

                /* Pulse animation */
                .bael-badge-pulse::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    animation: bael-badge-pulse 1.5s ease-out infinite;
                }

                .bael-badge-pulse {
                    position: relative;
                }

                @keyframes bael-badge-pulse {
                    0% { box-shadow: 0 0 0 0 currentColor; opacity: 0.4; }
                    100% { box-shadow: 0 0 0 8px currentColor; opacity: 0; }
                }

                /* Notification counter */
                .bael-badge-counter {
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    font-size: 0.7rem;
                }

                /* Icon support */
                .bael-badge-icon {
                    width: 14px;
                    height: 14px;
                    margin-right: 2px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE BADGE
    // ============================================================

    /**
     * Create a badge element
     */
    create(options = {}) {
      const id = `bael-badge-${++this.idCounter}`;
      const config = {
        text: "",
        variant: "solid",
        color: "primary",
        size: "md",
        rounded: true,
        removable: false,
        dot: false,
        pulse: false,
        icon: null,
        customClass: "",
        onRemove: null,
        ...options,
      };

      const badge = document.createElement("span");
      badge.id = id;
      badge.className = this._buildClassName(config);

      // Icon
      if (config.icon && !config.dot) {
        const iconEl = document.createElement("span");
        iconEl.className = "bael-badge-icon";
        iconEl.innerHTML = config.icon;
        badge.appendChild(iconEl);
      }

      // Text
      if (config.text && !config.dot) {
        const textNode = document.createTextNode(config.text);
        badge.appendChild(textNode);
      }

      // Remove button
      if (config.removable && !config.dot) {
        const removeBtn = document.createElement("span");
        removeBtn.className = "bael-badge-remove";
        removeBtn.innerHTML = "×";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          if (config.onRemove) {
            config.onRemove(id);
          }
          badge.remove();
        };
        badge.appendChild(removeBtn);
      }

      const state = { id, badge, config };
      this.instances.set(id, state);

      return {
        id,
        element: badge,
        setText: (text) => this.setText(id, text),
        setColor: (color) => this.setColor(id, color),
        show: () => (badge.hidden = false),
        hide: () => (badge.hidden = true),
        remove: () => this.destroy(id),
      };
    }

    /**
     * Build class name
     */
    _buildClassName(config) {
      const classes = ["bael-badge"];

      classes.push(`bael-badge-${config.variant}`);
      classes.push(`bael-badge-${config.color}`);
      classes.push(`bael-badge-${config.size}`);

      if (config.rounded) {
        classes.push("bael-badge-rounded");
      } else {
        classes.push("bael-badge-square");
      }

      if (config.dot) classes.push("bael-badge-dot");
      if (config.pulse) classes.push("bael-badge-pulse");
      if (config.customClass) classes.push(config.customClass);

      return classes.join(" ");
    }

    // ============================================================
    // NOTIFICATION COUNTER
    // ============================================================

    /**
     * Create a notification counter badge
     */
    createCounter(count, options = {}) {
      const config = {
        max: 99,
        showZero: false,
        variant: "solid",
        color: "danger",
        size: "sm",
        ...options,
      };

      if (count === 0 && !config.showZero) {
        return null;
      }

      const displayCount =
        count > config.max ? `${config.max}+` : String(count);

      return this.create({
        text: displayCount,
        variant: config.variant,
        color: config.color,
        size: config.size,
        customClass: "bael-badge-counter",
      });
    }

    // ============================================================
    // POSITIONED BADGE
    // ============================================================

    /**
     * Attach badge to an element
     */
    attach(target, badgeConfig = {}, position = "top-right") {
      if (typeof target === "string") {
        target = document.querySelector(target);
      }

      if (!target) return null;

      // Wrap target if needed
      let wrapper = target.parentElement;
      if (!wrapper?.classList.contains("bael-badge-wrapper")) {
        wrapper = document.createElement("span");
        wrapper.className = "bael-badge-wrapper";
        target.parentNode.insertBefore(wrapper, target);
        wrapper.appendChild(target);
      }

      // Create badge
      const badge = this.create(badgeConfig);
      badge.element.classList.add("bael-badge-positioned");
      badge.element.classList.add(`bael-badge-${position}`);

      wrapper.appendChild(badge.element);

      return badge;
    }

    // ============================================================
    // TAG GROUP
    // ============================================================

    /**
     * Create a tag group (multiple badges)
     */
    createGroup(container, tags = [], options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) return null;

      const id = `bael-badge-group-${++this.idCounter}`;
      const config = {
        variant: "soft",
        color: "primary",
        size: "md",
        removable: true,
        gap: "8px",
        onRemove: null,
        onAdd: null,
        ...options,
      };

      const wrapper = document.createElement("div");
      wrapper.id = id;
      wrapper.style.display = "flex";
      wrapper.style.flexWrap = "wrap";
      wrapper.style.gap = config.gap;

      const badgeInstances = [];

      const addTag = (text, tagOptions = {}) => {
        const badge = this.create({
          text,
          variant: tagOptions.variant || config.variant,
          color: tagOptions.color || config.color,
          size: tagOptions.size || config.size,
          removable: tagOptions.removable ?? config.removable,
          icon: tagOptions.icon,
          onRemove: (badgeId) => {
            const index = badgeInstances.findIndex((b) => b.id === badgeId);
            if (index > -1) {
              badgeInstances.splice(index, 1);
            }
            if (config.onRemove) {
              config.onRemove(text, badgeId);
            }
          },
        });

        wrapper.appendChild(badge.element);
        badgeInstances.push(badge);

        if (config.onAdd) {
          config.onAdd(text, badge);
        }

        return badge;
      };

      // Add initial tags
      tags.forEach((tag) => {
        if (typeof tag === "string") {
          addTag(tag);
        } else {
          addTag(tag.text, tag);
        }
      });

      container.appendChild(wrapper);

      return {
        id,
        element: wrapper,
        addTag,
        removeTag: (text) => {
          const badge = badgeInstances.find((b) =>
            b.element.textContent.includes(text),
          );
          if (badge) {
            badge.remove();
          }
        },
        getTags: () =>
          badgeInstances.map((b) =>
            b.element.textContent.replace("×", "").trim(),
          ),
        clear: () => {
          badgeInstances.forEach((b) => b.remove());
          badgeInstances.length = 0;
        },
      };
    }

    // ============================================================
    // UPDATES
    // ============================================================

    /**
     * Set text
     */
    setText(badgeId, text) {
      const state = this.instances.get(badgeId);
      if (!state) return;

      const { badge, config } = state;

      // Find text node
      for (let node of badge.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = text;
          break;
        }
      }

      config.text = text;
    }

    /**
     * Set color
     */
    setColor(badgeId, color) {
      const state = this.instances.get(badgeId);
      if (!state) return;

      const { badge, config } = state;

      // Remove old color
      badge.classList.remove(`bael-badge-${config.color}`);
      // Add new color
      badge.classList.add(`bael-badge-${color}`);

      config.color = color;
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy badge
     */
    destroy(badgeId) {
      const state = this.instances.get(badgeId);
      if (!state) return;

      state.badge.remove();
      this.instances.delete(badgeId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelBadge();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$badge = (options) => bael.create(options);
  window.$tag = (text, options) =>
    bael.create({ text, variant: "soft", removable: true, ...options });
  window.$counter = (count, options) => bael.createCounter(count, options);
  window.$tagGroup = (container, tags, options) =>
    bael.createGroup(container, tags, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelBadge = bael;

  console.log("🏷️ BAEL Badge Component loaded");
})();
