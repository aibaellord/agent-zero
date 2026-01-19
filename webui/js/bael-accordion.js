/**
 * BAEL Accordion Component - Lord Of All Collapsibles
 *
 * Full-featured accordion component with:
 * - Single/multiple open panels
 * - Animation support
 * - Nested accordions
 * - Keyboard navigation
 * - ARIA accessibility
 * - Custom icons
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // ACCORDION CLASS
  // ============================================================

  class BaelAccordion {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
    }

    // ============================================================
    // CREATE ACCORDION
    // ============================================================

    /**
     * Create an accordion
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Accordion container not found");
        return null;
      }

      const id = `bael-accordion-${++this.idCounter}`;
      const config = {
        multiple: false,
        collapsible: true,
        animated: true,
        duration: 300,
        easing: "ease-out",
        icon: "chevron",
        iconPosition: "right",
        nested: false,
        defaultOpen: [],
        onOpen: null,
        onClose: null,
        onChange: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        panels: [],
        activeIndices: new Set(),
      };

      // Setup container
      container.classList.add("bael-accordion");
      container.setAttribute("role", "tablist");
      if (config.multiple) {
        container.setAttribute("aria-multiselectable", "true");
      }

      // Initialize panels
      this._initPanels(state);

      // Open default panels
      config.defaultOpen.forEach((index) => {
        this._openPanel(state, index, false);
      });

      this.instances.set(id, state);

      return {
        id,
        open: (index) => this.open(id, index),
        close: (index) => this.close(id, index),
        toggle: (index) => this.toggle(id, index),
        openAll: () => this.openAll(id),
        closeAll: () => this.closeAll(id),
        isOpen: (index) => state.activeIndices.has(index),
        getOpenIndices: () => [...state.activeIndices],
        addPanel: (header, content) => this.addPanel(id, header, content),
        removePanel: (index) => this.removePanel(id, index),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Initialize panels from existing HTML
     */
    _initPanels(state) {
      const items = state.container.querySelectorAll(
        ":scope > .accordion-item, :scope > [data-accordion-item]",
      );

      items.forEach((item, index) => {
        const header = item.querySelector(
          ".accordion-header, [data-accordion-header]",
        );
        const content = item.querySelector(
          ".accordion-content, [data-accordion-content]",
        );

        if (header && content) {
          this._setupPanel(state, item, header, content, index);
        }
      });
    }

    /**
     * Setup a single panel
     */
    _setupPanel(state, item, header, content, index) {
      const { config } = state;
      const panelId = `${state.id}-panel-${index}`;
      const contentId = `${state.id}-content-${index}`;

      // Setup classes
      item.classList.add("bael-accordion-item");
      header.classList.add("bael-accordion-header");
      content.classList.add("bael-accordion-content");

      // ARIA attributes
      header.setAttribute("role", "tab");
      header.setAttribute("id", panelId);
      header.setAttribute("aria-controls", contentId);
      header.setAttribute("aria-expanded", "false");
      header.setAttribute("tabindex", "0");

      content.setAttribute("role", "tabpanel");
      content.setAttribute("id", contentId);
      content.setAttribute("aria-labelledby", panelId);
      content.setAttribute("aria-hidden", "true");

      // Add icon
      if (config.icon) {
        const icon = this._createIcon(config.icon, config.iconPosition);
        if (config.iconPosition === "left") {
          header.insertBefore(icon, header.firstChild);
        } else {
          header.appendChild(icon);
        }
      }

      // Initial state (closed)
      content.style.display = "none";
      content.style.overflow = "hidden";

      // Event listeners
      header.addEventListener("click", () => {
        this.toggle(state.id, index);
      });

      header.addEventListener("keydown", (e) => {
        this._handleKeydown(state, index, e);
      });

      // Store panel reference
      state.panels.push({
        index,
        item,
        header,
        content,
        panelId,
        contentId,
      });
    }

    /**
     * Create accordion icon
     */
    _createIcon(type, position) {
      const icon = document.createElement("span");
      icon.className = `bael-accordion-icon icon-${position}`;

      const icons = {
        chevron: "▼",
        plus: "+",
        arrow: "→",
        caret: "▶",
      };

      icon.textContent = icons[type] || type;
      return icon;
    }

    // ============================================================
    // PANEL OPERATIONS
    // ============================================================

    /**
     * Open a panel
     */
    open(accordionId, index) {
      const state = this.instances.get(accordionId);
      if (!state) return;

      this._openPanel(state, index, true);
    }

    /**
     * Internal open panel
     */
    _openPanel(state, index, animate = true) {
      const { config, panels, activeIndices } = state;
      const panel = panels[index];
      if (!panel || activeIndices.has(index)) return;

      // Close others if not multiple
      if (!config.multiple) {
        activeIndices.forEach((i) => {
          this._closePanel(state, i, animate);
        });
      }

      // Callback
      if (config.onOpen) {
        config.onOpen(index, panel);
      }

      // Update state
      activeIndices.add(index);

      // Update ARIA
      panel.header.setAttribute("aria-expanded", "true");
      panel.content.setAttribute("aria-hidden", "false");

      // Add active class
      panel.item.classList.add("active");
      panel.header.classList.add("active");

      // Animate open
      if (animate && config.animated) {
        this._animateOpen(panel.content, config.duration, config.easing);
      } else {
        panel.content.style.display = "block";
        panel.content.style.height = "auto";
      }

      // Rotate icon
      const icon = panel.header.querySelector(".bael-accordion-icon");
      if (icon) {
        icon.classList.add("open");
      }

      // onChange callback
      if (config.onChange) {
        config.onChange([...activeIndices], "open", index);
      }
    }

    /**
     * Close a panel
     */
    close(accordionId, index) {
      const state = this.instances.get(accordionId);
      if (!state) return;

      this._closePanel(state, index, true);
    }

    /**
     * Internal close panel
     */
    _closePanel(state, index, animate = true) {
      const { config, panels, activeIndices } = state;
      const panel = panels[index];
      if (!panel || !activeIndices.has(index)) return;

      // Check if collapsible
      if (!config.collapsible && activeIndices.size === 1) return;

      // Callback
      if (config.onClose) {
        config.onClose(index, panel);
      }

      // Update state
      activeIndices.delete(index);

      // Update ARIA
      panel.header.setAttribute("aria-expanded", "false");
      panel.content.setAttribute("aria-hidden", "true");

      // Remove active class
      panel.item.classList.remove("active");
      panel.header.classList.remove("active");

      // Animate close
      if (animate && config.animated) {
        this._animateClose(panel.content, config.duration, config.easing);
      } else {
        panel.content.style.display = "none";
      }

      // Rotate icon
      const icon = panel.header.querySelector(".bael-accordion-icon");
      if (icon) {
        icon.classList.remove("open");
      }

      // onChange callback
      if (config.onChange) {
        config.onChange([...activeIndices], "close", index);
      }
    }

    /**
     * Toggle a panel
     */
    toggle(accordionId, index) {
      const state = this.instances.get(accordionId);
      if (!state) return;

      if (state.activeIndices.has(index)) {
        this._closePanel(state, index, true);
      } else {
        this._openPanel(state, index, true);
      }
    }

    /**
     * Open all panels
     */
    openAll(accordionId) {
      const state = this.instances.get(accordionId);
      if (!state || !state.config.multiple) return;

      state.panels.forEach((_, index) => {
        this._openPanel(state, index, false);
      });
    }

    /**
     * Close all panels
     */
    closeAll(accordionId) {
      const state = this.instances.get(accordionId);
      if (!state) return;

      [...state.activeIndices].forEach((index) => {
        this._closePanel(state, index, false);
      });
    }

    // ============================================================
    // ANIMATIONS
    // ============================================================

    /**
     * Animate panel open
     */
    _animateOpen(content, duration, easing) {
      content.style.display = "block";
      const height = content.scrollHeight;

      content.style.height = "0px";
      content.offsetHeight; // Force reflow

      content.style.transition = `height ${duration}ms ${easing}`;
      content.style.height = `${height}px`;

      setTimeout(() => {
        content.style.height = "auto";
        content.style.transition = "";
      }, duration);
    }

    /**
     * Animate panel close
     */
    _animateClose(content, duration, easing) {
      const height = content.scrollHeight;
      content.style.height = `${height}px`;
      content.offsetHeight; // Force reflow

      content.style.transition = `height ${duration}ms ${easing}`;
      content.style.height = "0px";

      setTimeout(() => {
        content.style.display = "none";
        content.style.transition = "";
      }, duration);
    }

    // ============================================================
    // KEYBOARD NAVIGATION
    // ============================================================

    /**
     * Handle keyboard navigation
     */
    _handleKeydown(state, index, e) {
      const { panels } = state;
      let newIndex = index;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          newIndex = (index + 1) % panels.length;
          panels[newIndex].header.focus();
          break;

        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          newIndex = (index - 1 + panels.length) % panels.length;
          panels[newIndex].header.focus();
          break;

        case "Home":
          e.preventDefault();
          panels[0].header.focus();
          break;

        case "End":
          e.preventDefault();
          panels[panels.length - 1].header.focus();
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          this.toggle(state.id, index);
          break;
      }
    }

    // ============================================================
    // DYNAMIC PANELS
    // ============================================================

    /**
     * Add a new panel
     */
    addPanel(accordionId, headerContent, bodyContent) {
      const state = this.instances.get(accordionId);
      if (!state) return -1;

      const index = state.panels.length;

      // Create elements
      const item = document.createElement("div");
      item.className = "accordion-item";

      const header = document.createElement("div");
      header.className = "accordion-header";
      if (typeof headerContent === "string") {
        header.innerHTML = headerContent;
      } else {
        header.appendChild(headerContent);
      }

      const content = document.createElement("div");
      content.className = "accordion-content";
      if (typeof bodyContent === "string") {
        content.innerHTML = bodyContent;
      } else {
        content.appendChild(bodyContent);
      }

      item.appendChild(header);
      item.appendChild(content);
      state.container.appendChild(item);

      // Setup the new panel
      this._setupPanel(state, item, header, content, index);

      return index;
    }

    /**
     * Remove a panel
     */
    removePanel(accordionId, index) {
      const state = this.instances.get(accordionId);
      if (!state) return false;

      const panel = state.panels[index];
      if (!panel) return false;

      // Close if open
      if (state.activeIndices.has(index)) {
        state.activeIndices.delete(index);
      }

      // Remove from DOM
      panel.item.remove();

      // Update panels array
      state.panels.splice(index, 1);

      // Re-index remaining panels
      state.panels.forEach((p, i) => {
        p.index = i;
      });

      return true;
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy accordion instance
     */
    destroy(accordionId) {
      const state = this.instances.get(accordionId);
      if (!state) return;

      // Remove classes and attributes
      state.container.classList.remove("bael-accordion");
      state.container.removeAttribute("role");
      state.container.removeAttribute("aria-multiselectable");

      // Clean up panels
      state.panels.forEach((panel) => {
        panel.item.classList.remove("bael-accordion-item", "active");
        panel.header.classList.remove("bael-accordion-header", "active");
        panel.content.classList.remove("bael-accordion-content");

        panel.header.removeAttribute("role");
        panel.header.removeAttribute("aria-controls");
        panel.header.removeAttribute("aria-expanded");
        panel.header.removeAttribute("tabindex");

        panel.content.removeAttribute("role");
        panel.content.removeAttribute("aria-labelledby");
        panel.content.removeAttribute("aria-hidden");
        panel.content.style.display = "";
        panel.content.style.height = "";
        panel.content.style.overflow = "";

        // Remove icon
        const icon = panel.header.querySelector(".bael-accordion-icon");
        if (icon) icon.remove();
      });

      this.instances.delete(accordionId);
    }

    // ============================================================
    // AUTO-INIT
    // ============================================================

    /**
     * Auto-initialize accordions with data attributes
     */
    autoInit() {
      const accordions = document.querySelectorAll("[data-accordion]");

      accordions.forEach((container) => {
        const options = {};

        if (container.dataset.accordionMultiple !== undefined) {
          options.multiple = container.dataset.accordionMultiple !== "false";
        }

        if (container.dataset.accordionCollapsible !== undefined) {
          options.collapsible =
            container.dataset.accordionCollapsible !== "false";
        }

        if (container.dataset.accordionAnimated !== undefined) {
          options.animated = container.dataset.accordionAnimated !== "false";
        }

        if (container.dataset.accordionDuration) {
          options.duration = parseInt(container.dataset.accordionDuration);
        }

        if (container.dataset.accordionIcon) {
          options.icon = container.dataset.accordionIcon;
        }

        if (container.dataset.accordionDefaultOpen) {
          options.defaultOpen = container.dataset.accordionDefaultOpen
            .split(",")
            .map((n) => parseInt(n.trim()));
        }

        this.create(container, options);
      });
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelAccordion();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$accordion = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelAccordion = bael;

  // Auto-init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bael.autoInit());
  } else {
    bael.autoInit();
  }

  console.log("📂 BAEL Accordion Component loaded");
})();
