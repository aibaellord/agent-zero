/**
 * BAEL Popover Component - Lord Of All Popovers
 *
 * Rich popover component with:
 * - Smart positioning
 * - Multiple triggers
 * - Interactive content
 * - Arrow support
 * - Close on outside click
 * - Focus management
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // POPOVER CLASS
  // ============================================================

  class BaelPopover {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this.container = null;

      this._createContainer();
      this._setupGlobalListeners();
    }

    /**
     * Create global popover container
     */
    _createContainer() {
      this.container = document.createElement("div");
      this.container.className = "bael-popover-container";
      document.body.appendChild(this.container);
    }

    /**
     * Setup global event listeners
     */
    _setupGlobalListeners() {
      document.addEventListener("click", (e) => {
        this.instances.forEach((state, id) => {
          if (
            state.isOpen &&
            state.config.closeOnOutsideClick &&
            !state.popover.contains(e.target) &&
            !state.target.contains(e.target)
          ) {
            this.close(id);
          }
        });
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.instances.forEach((state, id) => {
            if (state.isOpen && state.config.closeOnEscape) {
              this.close(id);
            }
          });
        }
      });
    }

    // ============================================================
    // CREATE POPOVER
    // ============================================================

    /**
     * Create a popover
     */
    create(target, options = {}) {
      if (typeof target === "string") {
        target = document.querySelector(target);
      }

      if (!target) {
        console.error("Popover target not found");
        return null;
      }

      const id = `bael-popover-${++this.idCounter}`;
      const config = {
        title: "",
        content: "",
        html: true,
        position: "top",
        trigger: "click",
        delay: { show: 0, hide: 0 },
        offset: 10,
        arrow: true,
        animated: true,
        duration: 150,
        interactive: true,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        closeButton: false,
        maxWidth: 320,
        minWidth: 150,
        theme: "light",
        customClass: "",
        onOpen: null,
        onClose: null,
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
        popover: null,
        arrow: null,
        isOpen: false,
        showTimeout: null,
        hideTimeout: null,
      };

      // Create popover element
      this._createPopoverElement(state);

      // Setup triggers
      this._setupTriggers(state);

      // ARIA
      target.setAttribute("aria-describedby", id);

      this.instances.set(id, state);

      return {
        id,
        open: () => this.open(id),
        close: () => this.close(id),
        toggle: () => this.toggle(id),
        setContent: (content) => this.setContent(id, content),
        setTitle: (title) => this.setTitle(id, title),
        isOpen: () => state.isOpen,
        reposition: () => this._position(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create popover element
     */
    _createPopoverElement(state) {
      const { config } = state;

      const popover = document.createElement("div");
      popover.id = state.id;
      popover.className = `bael-popover bael-popover-${config.theme} bael-popover-${config.position} ${config.customClass}`;
      popover.setAttribute("role", "dialog");
      popover.style.maxWidth = `${config.maxWidth}px`;
      popover.style.minWidth = `${config.minWidth}px`;

      // Arrow
      if (config.arrow) {
        const arrow = document.createElement("div");
        arrow.className = "bael-popover-arrow";
        popover.appendChild(arrow);
        state.arrow = arrow;
      }

      // Header
      if (config.title || config.closeButton) {
        const header = document.createElement("div");
        header.className = "bael-popover-header";

        if (config.title) {
          const title = document.createElement("div");
          title.className = "bael-popover-title";
          title.textContent = config.title;
          header.appendChild(title);
          state.titleEl = title;
        }

        if (config.closeButton) {
          const closeBtn = document.createElement("button");
          closeBtn.className = "bael-popover-close";
          closeBtn.innerHTML = "×";
          closeBtn.setAttribute("aria-label", "Close");
          closeBtn.onclick = () => this.close(state.id);
          header.appendChild(closeBtn);
        }

        popover.appendChild(header);
      }

      // Content
      const content = document.createElement("div");
      content.className = "bael-popover-content";
      this._setContent(content, config.content, config.html);
      popover.appendChild(content);
      state.contentEl = content;

      popover.hidden = true;
      this.container.appendChild(popover);
      state.popover = popover;
    }

    /**
     * Set content
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
     * Setup triggers
     */
    _setupTriggers(state) {
      const { target, config, popover } = state;
      const triggers = config.trigger.split(" ");

      triggers.forEach((trigger) => {
        switch (trigger) {
          case "click":
            target.addEventListener("click", (e) => {
              e.stopPropagation();
              this.toggle(state.id);
            });
            break;

          case "hover":
            target.addEventListener("mouseenter", () =>
              this._scheduleShow(state),
            );
            target.addEventListener("mouseleave", () =>
              this._scheduleHide(state),
            );

            if (config.interactive) {
              popover.addEventListener("mouseenter", () =>
                this._cancelHide(state),
              );
              popover.addEventListener("mouseleave", () =>
                this._scheduleHide(state),
              );
            }
            break;

          case "focus":
            target.addEventListener("focus", () => this._scheduleShow(state));
            target.addEventListener("blur", () => this._scheduleHide(state));
            break;

          case "manual":
            break;
        }
      });
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
          this.open(state.id);
        }, state.config.delay.show);
      } else {
        this.open(state.id);
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
          this.close(state.id);
        }, state.config.delay.hide);
      } else {
        this.close(state.id);
      }
    }

    /**
     * Cancel show
     */
    _cancelShow(state) {
      if (state.showTimeout) {
        clearTimeout(state.showTimeout);
        state.showTimeout = null;
      }
    }

    /**
     * Cancel hide
     */
    _cancelHide(state) {
      if (state.hideTimeout) {
        clearTimeout(state.hideTimeout);
        state.hideTimeout = null;
      }
    }

    /**
     * Open popover
     */
    open(popoverId) {
      const state = this.instances.get(popoverId);
      if (!state || state.isOpen) return;

      const { popover, config } = state;

      // Position
      this._position(state);

      // Show
      popover.hidden = false;

      if (config.animated) {
        popover.style.opacity = "0";
        popover.style.transform = this._getTransformStart(config.position);
        popover.offsetHeight;

        popover.style.transition = `opacity ${config.duration}ms ease, transform ${config.duration}ms ease`;
        popover.style.opacity = "1";
        popover.style.transform = "translate(0, 0)";
      }

      state.isOpen = true;

      if (config.onOpen) {
        config.onOpen(state);
      }
    }

    /**
     * Close popover
     */
    close(popoverId) {
      const state = this.instances.get(popoverId);
      if (!state || !state.isOpen) return;

      const { popover, config } = state;

      if (config.animated) {
        popover.style.opacity = "0";
        popover.style.transform = this._getTransformStart(config.position);

        setTimeout(() => {
          popover.hidden = true;
          popover.style.transition = "";
        }, config.duration);
      } else {
        popover.hidden = true;
      }

      state.isOpen = false;

      if (config.onClose) {
        config.onClose(state);
      }
    }

    /**
     * Toggle popover
     */
    toggle(popoverId) {
      const state = this.instances.get(popoverId);
      if (!state) return;

      if (state.isOpen) {
        this.close(popoverId);
      } else {
        this.open(popoverId);
      }
    }

    /**
     * Get transform start
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
     * Position popover
     */
    _position(state) {
      const { target, popover, arrow, config } = state;
      const targetRect = target.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let position = config.position;
      let top, left;

      const positions = {
        top: () => ({
          top: targetRect.top - popoverRect.height - config.offset,
          left: targetRect.left + (targetRect.width - popoverRect.width) / 2,
        }),
        bottom: () => ({
          top: targetRect.bottom + config.offset,
          left: targetRect.left + (targetRect.width - popoverRect.width) / 2,
        }),
        left: () => ({
          top: targetRect.top + (targetRect.height - popoverRect.height) / 2,
          left: targetRect.left - popoverRect.width - config.offset,
        }),
        right: () => ({
          top: targetRect.top + (targetRect.height - popoverRect.height) / 2,
          left: targetRect.right + config.offset,
        }),
      };

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
        top + popoverRect.height > viewportHeight
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
        left + popoverRect.width > viewportWidth
      ) {
        position = "left";
        const flipped = positions.left();
        top = flipped.top;
        left = flipped.left;
      }

      // Constrain
      left = Math.max(
        config.offset,
        Math.min(left, viewportWidth - popoverRect.width - config.offset),
      );
      top = Math.max(
        config.offset,
        Math.min(top, viewportHeight - popoverRect.height - config.offset),
      );

      popover.style.position = "fixed";
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;

      // Update class
      popover.className = popover.className.replace(
        /bael-popover-(top|bottom|left|right)/,
        "",
      );
      popover.classList.add(`bael-popover-${position}`);

      // Position arrow
      if (arrow) {
        this._positionArrow(state, position, targetRect, popover, left, top);
      }
    }

    /**
     * Position arrow
     */
    _positionArrow(
      state,
      position,
      targetRect,
      popover,
      popoverLeft,
      popoverTop,
    ) {
      const { arrow } = state;

      if (position === "top" || position === "bottom") {
        const targetCenter = targetRect.left + targetRect.width / 2;
        const arrowLeft = targetCenter - popoverLeft;
        arrow.style.left = `${Math.max(10, Math.min(arrowLeft, popover.offsetWidth - 10))}px`;
        arrow.style.top = "";
      } else {
        const targetCenter = targetRect.top + targetRect.height / 2;
        const arrowTop = targetCenter - popoverTop;
        arrow.style.top = `${Math.max(10, Math.min(arrowTop, popover.offsetHeight - 10))}px`;
        arrow.style.left = "";
      }
    }

    // ============================================================
    // CONTENT UPDATES
    // ============================================================

    /**
     * Set content
     */
    setContent(popoverId, content) {
      const state = this.instances.get(popoverId);
      if (!state) return;

      this._setContent(state.contentEl, content, state.config.html);

      if (state.isOpen) {
        this._position(state);
      }
    }

    /**
     * Set title
     */
    setTitle(popoverId, title) {
      const state = this.instances.get(popoverId);
      if (!state || !state.titleEl) return;

      state.titleEl.textContent = title;
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy popover
     */
    destroy(popoverId) {
      const state = this.instances.get(popoverId);
      if (!state) return;

      this._cancelShow(state);
      this._cancelHide(state);

      state.popover.remove();
      state.target.removeAttribute("aria-describedby");

      this.instances.delete(popoverId);
    }

    /**
     * Close all popovers
     */
    closeAll() {
      this.instances.forEach((state, id) => {
        if (state.isOpen) {
          this.close(id);
        }
      });
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelPopover();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$popover = (target, options) => bael.create(target, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelPopover = bael;

  console.log("💭 BAEL Popover Component loaded");
})();
