/**
 * BAEL Tooltip Component - Lord Of All Hints
 *
 * Full-featured tooltip component with:
 * - Smart positioning
 * - Multiple trigger modes
 * - Rich content support
 * - Animation effects
 * - Themes
 * - Accessibility
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TOOLTIP CLASS
  // ============================================================

  class BaelTooltip {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this.container = null;

      this._createContainer();
    }

    /**
     * Create global tooltip container
     */
    _createContainer() {
      this.container = document.createElement("div");
      this.container.className = "bael-tooltip-container";
      this.container.setAttribute("aria-hidden", "true");
      document.body.appendChild(this.container);
    }

    // ============================================================
    // CREATE TOOLTIP
    // ============================================================

    /**
     * Create a tooltip
     */
    create(target, options = {}) {
      if (typeof target === "string") {
        target = document.querySelector(target);
      }

      if (!target) {
        console.error("Tooltip target not found");
        return null;
      }

      const id = `bael-tooltip-${++this.idCounter}`;
      const config = {
        content: "",
        html: false,
        position: "top",
        trigger: "hover",
        delay: { show: 0, hide: 0 },
        duration: 150,
        offset: 8,
        arrow: true,
        theme: "dark",
        maxWidth: 250,
        interactive: false,
        followCursor: false,
        hideOnClick: true,
        zIndex: 9999,
        appendTo: this.container,
        onCreate: null,
        onShow: null,
        onHide: null,
        ...options,
      };

      // Normalize delay
      if (typeof config.delay === "number") {
        config.delay = { show: config.delay, hide: config.delay };
      }

      const state = {
        id,
        target,
        config,
        tooltip: null,
        arrow: null,
        isVisible: false,
        showTimeout: null,
        hideTimeout: null,
      };

      // Create tooltip element
      this._createTooltipElement(state);

      // Setup triggers
      this._setupTriggers(state);

      // ARIA
      target.setAttribute("aria-describedby", id);

      this.instances.set(id, state);

      // onCreate callback
      if (config.onCreate) {
        config.onCreate(state);
      }

      return {
        id,
        show: () => this.show(id),
        hide: () => this.hide(id),
        toggle: () => this.toggle(id),
        setContent: (content) => this.setContent(id, content),
        setPosition: (position) => this.setPosition(id, position),
        isVisible: () => state.isVisible,
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create tooltip element
     */
    _createTooltipElement(state) {
      const { config } = state;

      const tooltip = document.createElement("div");
      tooltip.id = state.id;
      tooltip.className = `bael-tooltip bael-tooltip-${config.theme} bael-tooltip-${config.position}`;
      tooltip.setAttribute("role", "tooltip");
      tooltip.style.maxWidth = `${config.maxWidth}px`;
      tooltip.style.zIndex = config.zIndex;

      // Content
      const content = document.createElement("div");
      content.className = "bael-tooltip-content";
      this._setContent(content, config.content, config.html);
      tooltip.appendChild(content);
      state.contentEl = content;

      // Arrow
      if (config.arrow) {
        const arrow = document.createElement("div");
        arrow.className = "bael-tooltip-arrow";
        tooltip.appendChild(arrow);
        state.arrow = arrow;
      }

      tooltip.hidden = true;
      config.appendTo.appendChild(tooltip);
      state.tooltip = tooltip;
    }

    /**
     * Set tooltip content
     */
    _setContent(element, content, isHtml) {
      if (typeof content === "function") {
        content = content();
      }

      if (content instanceof Element) {
        element.innerHTML = "";
        element.appendChild(content);
      } else if (isHtml) {
        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
    }

    /**
     * Setup event triggers
     */
    _setupTriggers(state) {
      const { target, config } = state;
      const triggers = config.trigger.split(" ");

      triggers.forEach((trigger) => {
        switch (trigger) {
          case "hover":
            target.addEventListener("mouseenter", () =>
              this._scheduleShow(state),
            );
            target.addEventListener("mouseleave", () =>
              this._scheduleHide(state),
            );

            if (config.interactive) {
              state.tooltip.addEventListener("mouseenter", () =>
                this._cancelHide(state),
              );
              state.tooltip.addEventListener("mouseleave", () =>
                this._scheduleHide(state),
              );
            }
            break;

          case "focus":
            target.addEventListener("focus", () => this._scheduleShow(state));
            target.addEventListener("blur", () => this._scheduleHide(state));
            break;

          case "click":
            target.addEventListener("click", (e) => {
              e.stopPropagation();
              this.toggle(state.id);
            });

            if (config.hideOnClick) {
              document.addEventListener("click", (e) => {
                if (state.isVisible && !state.tooltip.contains(e.target)) {
                  this.hide(state.id);
                }
              });
            }
            break;

          case "manual":
            // No automatic triggers
            break;
        }
      });

      // Follow cursor
      if (config.followCursor) {
        target.addEventListener("mousemove", (e) => {
          if (state.isVisible) {
            this._positionAtCursor(state, e.clientX, e.clientY);
          }
        });
      }
    }

    // ============================================================
    // SHOW/HIDE
    // ============================================================

    /**
     * Schedule show
     */
    _scheduleShow(state) {
      this._cancelHide(state);
      this._cancelShow(state);

      if (state.config.delay.show > 0) {
        state.showTimeout = setTimeout(() => {
          this.show(state.id);
        }, state.config.delay.show);
      } else {
        this.show(state.id);
      }
    }

    /**
     * Schedule hide
     */
    _scheduleHide(state) {
      this._cancelShow(state);
      this._cancelHide(state);

      if (state.config.delay.hide > 0) {
        state.hideTimeout = setTimeout(() => {
          this.hide(state.id);
        }, state.config.delay.hide);
      } else {
        this.hide(state.id);
      }
    }

    /**
     * Cancel show timeout
     */
    _cancelShow(state) {
      if (state.showTimeout) {
        clearTimeout(state.showTimeout);
        state.showTimeout = null;
      }
    }

    /**
     * Cancel hide timeout
     */
    _cancelHide(state) {
      if (state.hideTimeout) {
        clearTimeout(state.hideTimeout);
        state.hideTimeout = null;
      }
    }

    /**
     * Show tooltip
     */
    show(tooltipId) {
      const state = this.instances.get(tooltipId);
      if (!state || state.isVisible) return;

      const { tooltip, config } = state;

      // Position
      if (!config.followCursor) {
        this._position(state);
      }

      // Show
      tooltip.hidden = false;
      tooltip.style.opacity = "0";
      tooltip.style.transform = this._getTransformStart(config.position);
      tooltip.offsetHeight; // Force reflow

      tooltip.style.transition = `opacity ${config.duration}ms ease, transform ${config.duration}ms ease`;
      tooltip.style.opacity = "1";
      tooltip.style.transform = "translate(0, 0)";

      state.isVisible = true;

      // Callback
      if (config.onShow) {
        config.onShow(state);
      }
    }

    /**
     * Hide tooltip
     */
    hide(tooltipId) {
      const state = this.instances.get(tooltipId);
      if (!state || !state.isVisible) return;

      const { tooltip, config } = state;

      tooltip.style.opacity = "0";
      tooltip.style.transform = this._getTransformStart(config.position);

      setTimeout(() => {
        tooltip.hidden = true;
        tooltip.style.transition = "";
      }, config.duration);

      state.isVisible = false;

      // Callback
      if (config.onHide) {
        config.onHide(state);
      }
    }

    /**
     * Toggle tooltip
     */
    toggle(tooltipId) {
      const state = this.instances.get(tooltipId);
      if (!state) return;

      if (state.isVisible) {
        this.hide(tooltipId);
      } else {
        this.show(tooltipId);
      }
    }

    /**
     * Get transform start based on position
     */
    _getTransformStart(position) {
      switch (position) {
        case "top":
          return "translateY(10px)";
        case "bottom":
          return "translateY(-10px)";
        case "left":
          return "translateX(10px)";
        case "right":
          return "translateX(-10px)";
        default:
          return "translateY(10px)";
      }
    }

    // ============================================================
    // POSITIONING
    // ============================================================

    /**
     * Position tooltip
     */
    _position(state) {
      const { target, tooltip, arrow, config } = state;
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let position = config.position;
      let top, left;

      // Calculate position
      const positions = {
        top: () => ({
          top: targetRect.top - tooltipRect.height - config.offset,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        }),
        bottom: () => ({
          top: targetRect.bottom + config.offset,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        }),
        left: () => ({
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.left - tooltipRect.width - config.offset,
        }),
        right: () => ({
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.right + config.offset,
        }),
      };

      // Try preferred position first
      const preferred = positions[position]();
      top = preferred.top;
      left = preferred.left;

      // Flip if needed
      if (position === "top" && top < 0) {
        position = "bottom";
        const flipped = positions.bottom();
        top = flipped.top;
        left = flipped.left;
      } else if (
        position === "bottom" &&
        top + tooltipRect.height > viewportHeight
      ) {
        position = "top";
        const flipped = positions.top();
        top = flipped.top;
        left = flipped.left;
      } else if (position === "left" && left < 0) {
        position = "right";
        const flipped = positions.right();
        top = flipped.top;
        left = flipped.left;
      } else if (
        position === "right" &&
        left + tooltipRect.width > viewportWidth
      ) {
        position = "left";
        const flipped = positions.left();
        top = flipped.top;
        left = flipped.left;
      }

      // Constrain to viewport
      left = Math.max(
        config.offset,
        Math.min(left, viewportWidth - tooltipRect.width - config.offset),
      );
      top = Math.max(
        config.offset,
        Math.min(top, viewportHeight - tooltipRect.height - config.offset),
      );

      // Apply position
      tooltip.style.position = "fixed";
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      // Update class for arrow
      tooltip.className = tooltip.className.replace(
        /bael-tooltip-(top|bottom|left|right)/,
        "",
      );
      tooltip.classList.add(`bael-tooltip-${position}`);

      // Position arrow
      if (arrow) {
        this._positionArrow(state, position, targetRect, tooltip, left);
      }
    }

    /**
     * Position arrow
     */
    _positionArrow(state, position, targetRect, tooltip, tooltipLeft) {
      const { arrow } = state;

      if (position === "top" || position === "bottom") {
        const targetCenter = targetRect.left + targetRect.width / 2;
        const arrowLeft = targetCenter - tooltipLeft;
        arrow.style.left = `${arrowLeft}px`;
        arrow.style.top = "";
      } else {
        const targetCenter = targetRect.top + targetRect.height / 2;
        const tooltipTop = parseFloat(tooltip.style.top);
        const arrowTop = targetCenter - tooltipTop;
        arrow.style.top = `${arrowTop}px`;
        arrow.style.left = "";
      }
    }

    /**
     * Position at cursor
     */
    _positionAtCursor(state, x, y) {
      const { tooltip, config } = state;
      const tooltipRect = tooltip.getBoundingClientRect();

      let top = y + config.offset;
      let left = x + config.offset;

      // Keep in viewport
      if (left + tooltipRect.width > window.innerWidth) {
        left = x - tooltipRect.width - config.offset;
      }
      if (top + tooltipRect.height > window.innerHeight) {
        top = y - tooltipRect.height - config.offset;
      }

      tooltip.style.position = "fixed";
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }

    // ============================================================
    // CONTENT/POSITION UPDATES
    // ============================================================

    /**
     * Set content
     */
    setContent(tooltipId, content) {
      const state = this.instances.get(tooltipId);
      if (!state) return;

      state.config.content = content;
      this._setContent(state.contentEl, content, state.config.html);

      if (state.isVisible) {
        this._position(state);
      }
    }

    /**
     * Set position
     */
    setPosition(tooltipId, position) {
      const state = this.instances.get(tooltipId);
      if (!state) return;

      state.config.position = position;

      if (state.isVisible) {
        this._position(state);
      }
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy tooltip
     */
    destroy(tooltipId) {
      const state = this.instances.get(tooltipId);
      if (!state) return;

      this._cancelShow(state);
      this._cancelHide(state);

      state.tooltip.remove();
      state.target.removeAttribute("aria-describedby");

      this.instances.delete(tooltipId);
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Initialize tooltips from data attributes
     */
    autoInit() {
      document.querySelectorAll("[data-tooltip]").forEach((target) => {
        const content = target.dataset.tooltip;
        const position = target.dataset.tooltipPosition || "top";
        const trigger = target.dataset.tooltipTrigger || "hover";

        this.create(target, {
          content,
          position,
          trigger,
        });
      });

      document.querySelectorAll("[title]").forEach((target) => {
        if (target.dataset.tooltip === undefined) {
          const content = target.title;
          target.removeAttribute("title");
          target.dataset.tooltip = content;

          this.create(target, {
            content,
            position: "top",
            trigger: "hover",
          });
        }
      });
    }

    /**
     * Quick tooltip
     */
    tip(target, content, options = {}) {
      return this.create(target, { content, ...options });
    }

    /**
     * Error tooltip
     */
    error(target, content, options = {}) {
      return this.create(target, {
        content,
        theme: "error",
        trigger: "manual",
        ...options,
      });
    }

    /**
     * Success tooltip
     */
    success(target, content, options = {}) {
      return this.create(target, {
        content,
        theme: "success",
        trigger: "manual",
        ...options,
      });
    }

    /**
     * Warning tooltip
     */
    warning(target, content, options = {}) {
      return this.create(target, {
        content,
        theme: "warning",
        trigger: "manual",
        ...options,
      });
    }

    /**
     * Info tooltip
     */
    info(target, content, options = {}) {
      return this.create(target, {
        content,
        theme: "info",
        trigger: "manual",
        ...options,
      });
    }

    /**
     * Show temporary tooltip
     */
    flash(target, content, duration = 2000, options = {}) {
      const tooltip = this.create(target, {
        content,
        trigger: "manual",
        ...options,
      });

      tooltip.show();

      setTimeout(() => {
        tooltip.hide();
        setTimeout(() => tooltip.destroy(), 200);
      }, duration);

      return tooltip;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelTooltip();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$tooltip = (target, options) => bael.create(target, options);
  window.$tip = (target, content, options) =>
    bael.tip(target, content, options);
  window.$flash = (target, content, duration, options) =>
    bael.flash(target, content, duration, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTooltip = bael;

  // Auto-init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bael.autoInit());
  } else {
    bael.autoInit();
  }

  console.log("💬 BAEL Tooltip Component loaded");
})();
