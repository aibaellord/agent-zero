/**
 * BAEL Portal - DOM Portal System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete portal system:
 * - Teleport elements
 * - Modal management
 * - Overlay system
 * - Slot-like distribution
 * - Z-index management
 */

(function () {
  "use strict";

  class BaelPortal {
    constructor() {
      this.portals = new Map();
      this.containers = new Map();
      this.zIndexBase = 1000;
      this.zIndexCounter = 0;

      this._createDefaultContainers();
      console.log("🌀 Bael Portal initialized");
    }

    _createDefaultContainers() {
      // Create default portal containers
      const containers = ["modals", "overlays", "tooltips", "notifications"];

      for (const name of containers) {
        this.createContainer(name);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // CONTAINER MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    createContainer(name, options = {}) {
      if (this.containers.has(name)) {
        return this.containers.get(name);
      }

      const container = document.createElement("div");
      container.id = `bael-portal-${name}`;
      container.className = `bael-portal-container ${options.className || ""}`;

      container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0;
                height: 0;
                pointer-events: none;
                z-index: ${options.zIndex || this.zIndexBase + this.containers.size * 100};
            `;

      const target = options.target
        ? document.querySelector(options.target)
        : document.body;

      target.appendChild(container);
      this.containers.set(name, container);

      return container;
    }

    getContainer(name) {
      return this.containers.get(name);
    }

    removeContainer(name) {
      const container = this.containers.get(name);
      if (container) {
        container.remove();
        this.containers.delete(name);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PORTAL OPERATIONS
    // ═══════════════════════════════════════════════════════════

    teleport(element, target, options = {}) {
      const el = this._getElement(element);
      const targetEl =
        typeof target === "string"
          ? this.containers.get(target) || document.querySelector(target)
          : target;

      if (!el || !targetEl) {
        console.warn("Portal: Element or target not found");
        return null;
      }

      // Store original position
      const original = {
        parent: el.parentElement,
        nextSibling: el.nextSibling,
        position: el.style.position,
        pointerEvents: el.style.pointerEvents,
      };

      // Move element
      if (options.clone) {
        const clone = el.cloneNode(true);
        targetEl.appendChild(clone);

        const portalId = this._generateId();
        this.portals.set(portalId, { element: clone, original: null, options });

        return {
          id: portalId,
          element: clone,
          destroy: () => this.close(portalId),
        };
      }

      // Enable pointer events for portal content
      el.style.pointerEvents = "auto";

      targetEl.appendChild(el);

      const portalId = this._generateId();
      this.portals.set(portalId, { element: el, original, options });

      return {
        id: portalId,
        element: el,
        destroy: () => this.close(portalId),
      };
    }

    close(portalId) {
      const portal = this.portals.get(portalId);
      if (!portal) return false;

      const { element, original, options } = portal;

      if (original && !options.clone) {
        // Restore original position
        element.style.position = original.position;
        element.style.pointerEvents = original.pointerEvents;

        if (original.nextSibling) {
          original.parent.insertBefore(element, original.nextSibling);
        } else if (original.parent) {
          original.parent.appendChild(element);
        }
      } else {
        element.remove();
      }

      this.portals.delete(portalId);
      return true;
    }

    closeAll(containerName) {
      for (const [id, portal] of this.portals) {
        if (
          !containerName ||
          portal.element.parentElement === this.containers.get(containerName)
        ) {
          this.close(id);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // MODAL MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    modal(content, options = {}) {
      // Create modal wrapper
      const wrapper = document.createElement("div");
      wrapper.className = `bael-modal-wrapper ${options.wrapperClass || ""}`;
      wrapper.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                z-index: ${this._getNextZIndex()};
            `;

      // Create backdrop
      const backdrop = document.createElement("div");
      backdrop.className = `bael-modal-backdrop ${options.backdropClass || ""}`;
      backdrop.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${options.backdropColor || "rgba(0, 0, 0, 0.5)"};
            `;

      // Create modal content
      const modal = document.createElement("div");
      modal.className = `bael-modal ${options.modalClass || ""}`;
      modal.style.cssText = `
                position: relative;
                pointer-events: auto;
                background: ${options.background || "white"};
                border-radius: ${options.borderRadius || "8px"};
                max-width: ${options.maxWidth || "90vw"};
                max-height: ${options.maxHeight || "90vh"};
                overflow: auto;
                ${options.style || ""}
            `;

      // Add content
      if (typeof content === "string") {
        modal.innerHTML = content;
      } else {
        modal.appendChild(content);
      }

      wrapper.appendChild(backdrop);
      wrapper.appendChild(modal);

      // Teleport to modals container
      const portal = this.teleport(wrapper, "modals");

      // Close on backdrop click
      if (options.closeOnBackdrop !== false) {
        backdrop.addEventListener("click", () => {
          if (options.onClose) options.onClose();
          this.close(portal.id);
        });
      }

      // Close on escape
      if (options.closeOnEscape !== false) {
        const escHandler = (e) => {
          if (e.key === "Escape") {
            if (options.onClose) options.onClose();
            this.close(portal.id);
            document.removeEventListener("keydown", escHandler);
          }
        };
        document.addEventListener("keydown", escHandler);
      }

      // Animation
      if (options.animate !== false) {
        wrapper.style.opacity = "0";
        modal.style.transform = "scale(0.9)";

        requestAnimationFrame(() => {
          wrapper.style.transition = "opacity 0.2s ease-out";
          modal.style.transition = "transform 0.2s ease-out";
          wrapper.style.opacity = "1";
          modal.style.transform = "scale(1)";
        });
      }

      return {
        ...portal,
        modal,
        backdrop,
        close: () => {
          if (options.onClose) options.onClose();
          this.close(portal.id);
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // OVERLAY SYSTEM
    // ═══════════════════════════════════════════════════════════

    overlay(options = {}) {
      const overlay = document.createElement("div");
      overlay.className = `bael-overlay ${options.className || ""}`;
      overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${options.background || "rgba(0, 0, 0, 0.5)"};
                pointer-events: auto;
                z-index: ${this._getNextZIndex()};
                ${options.style || ""}
            `;

      if (options.content) {
        if (typeof options.content === "string") {
          overlay.innerHTML = options.content;
        } else {
          overlay.appendChild(options.content);
        }
      }

      const portal = this.teleport(overlay, "overlays");

      if (options.closeOnClick !== false) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            if (options.onClose) options.onClose();
            this.close(portal.id);
          }
        });
      }

      return {
        ...portal,
        overlay,
        close: () => {
          if (options.onClose) options.onClose();
          this.close(portal.id);
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // TOOLTIP POSITIONING
    // ═══════════════════════════════════════════════════════════

    positionTooltip(tooltip, anchor, options = {}) {
      const tooltipEl = this._getElement(tooltip);
      const anchorEl = this._getElement(anchor);

      const placement = options.placement || "top";
      const offset = options.offset || 8;

      const anchorRect = anchorEl.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();

      let top, left;

      switch (placement) {
        case "top":
          top = anchorRect.top - tooltipRect.height - offset;
          left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = anchorRect.bottom + offset;
          left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top = anchorRect.top + (anchorRect.height - tooltipRect.height) / 2;
          left = anchorRect.left - tooltipRect.width - offset;
          break;
        case "right":
          top = anchorRect.top + (anchorRect.height - tooltipRect.height) / 2;
          left = anchorRect.right + offset;
          break;
      }

      // Boundary checks
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Flip if outside viewport
      if (options.flip !== false) {
        if (top < 0 && placement === "top") {
          top = anchorRect.bottom + offset;
        }
        if (
          top + tooltipRect.height > viewport.height &&
          placement === "bottom"
        ) {
          top = anchorRect.top - tooltipRect.height - offset;
        }
        if (left < 0) {
          left = offset;
        }
        if (left + tooltipRect.width > viewport.width) {
          left = viewport.width - tooltipRect.width - offset;
        }
      }

      tooltipEl.style.position = "fixed";
      tooltipEl.style.top = `${top}px`;
      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.pointerEvents = "auto";

      return { top, left };
    }

    // ═══════════════════════════════════════════════════════════
    // SLOT DISTRIBUTION
    // ═══════════════════════════════════════════════════════════

    slot(name) {
      // Create a slot marker
      const slot = document.createElement("div");
      slot.className = "bael-slot";
      slot.dataset.slotName = name;
      slot.style.display = "contents";

      return slot;
    }

    fill(slotName, content) {
      const slots = document.querySelectorAll(`[data-slot-name="${slotName}"]`);

      for (const slot of slots) {
        slot.innerHTML = "";

        if (typeof content === "string") {
          slot.innerHTML = content;
        } else if (content instanceof Node) {
          slot.appendChild(content.cloneNode(true));
        } else if (typeof content === "function") {
          const result = content();
          if (typeof result === "string") {
            slot.innerHTML = result;
          } else {
            slot.appendChild(result);
          }
        }
      }

      return slots.length;
    }

    clearSlot(slotName) {
      const slots = document.querySelectorAll(`[data-slot-name="${slotName}"]`);
      for (const slot of slots) {
        slot.innerHTML = "";
      }
    }

    // ═══════════════════════════════════════════════════════════
    // Z-INDEX MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    _getNextZIndex() {
      return this.zIndexBase + ++this.zIndexCounter;
    }

    setZIndexBase(base) {
      this.zIndexBase = base;
    }

    bringToFront(element) {
      const el = this._getElement(element);
      el.style.zIndex = this._getNextZIndex();
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    _generateId() {
      return `portal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getOpenCount(containerName) {
      if (containerName) {
        const container = this.containers.get(containerName);
        return container ? container.children.length : 0;
      }
      return this.portals.size;
    }

    hasOpenPortals(containerName) {
      return this.getOpenCount(containerName) > 0;
    }

    destroyAll() {
      for (const [id] of this.portals) {
        this.close(id);
      }

      for (const [name, container] of this.containers) {
        container.remove();
      }

      this.containers.clear();
      this.portals.clear();
    }
  }

  // Initialize
  window.BaelPortal = new BaelPortal();

  // Global shortcuts
  window.$portal = window.BaelPortal;
  window.$teleport = (el, target, opts) =>
    window.BaelPortal.teleport(el, target, opts);
  window.$modal = (content, opts) => window.BaelPortal.modal(content, opts);

  console.log("🌀 Bael Portal ready");
})();
