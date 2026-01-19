/**
 * BAEL Dropdown Component - Lord Of All Menus
 *
 * Full-featured dropdown component with:
 * - Nested menus
 * - Search/filter
 * - Keyboard navigation
 * - Multiple selection
 * - Custom positioning
 * - ARIA accessibility
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // DROPDOWN CLASS
  // ============================================================

  class BaelDropdown {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this.activeDropdown = null;

      // Global click handler to close dropdowns
      document.addEventListener("click", (e) => {
        if (this.activeDropdown) {
          const state = this.instances.get(this.activeDropdown);
          if (state && !state.container.contains(e.target)) {
            this.close(this.activeDropdown);
          }
        }
      });

      // Global escape handler
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.activeDropdown) {
          this.close(this.activeDropdown);
        }
      });
    }

    // ============================================================
    // CREATE DROPDOWN
    // ============================================================

    /**
     * Create a dropdown
     */
    create(trigger, options = {}) {
      if (typeof trigger === "string") {
        trigger = document.querySelector(trigger);
      }

      if (!trigger) {
        console.error("Dropdown trigger not found");
        return null;
      }

      const id = `bael-dropdown-${++this.idCounter}`;
      const config = {
        items: [],
        position: "bottom-start",
        offset: 4,
        animated: true,
        duration: 150,
        closeOnSelect: true,
        closeOnOutsideClick: true,
        searchable: false,
        searchPlaceholder: "Search...",
        multiple: false,
        hover: false,
        hoverDelay: 200,
        maxHeight: 300,
        minWidth: null,
        matchTriggerWidth: false,
        nested: false,
        onOpen: null,
        onClose: null,
        onSelect: null,
        ...options,
      };

      const state = {
        id,
        trigger,
        config,
        menu: null,
        isOpen: false,
        selectedValues: new Set(),
        focusedIndex: -1,
        hoverTimeout: null,
        items: [],
      };

      // Create menu element
      this._createMenu(state);

      // Setup trigger
      this._setupTrigger(state);

      this.instances.set(id, state);

      return {
        id,
        open: () => this.open(id),
        close: () => this.close(id),
        toggle: () => this.toggle(id),
        isOpen: () => state.isOpen,
        select: (value) => this.select(id, value),
        deselect: (value) => this.deselect(id, value),
        getSelected: () => [...state.selectedValues],
        setItems: (items) => this.setItems(id, items),
        addItem: (item) => this.addItem(id, item),
        removeItem: (value) => this.removeItem(id, value),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create menu element
     */
    _createMenu(state) {
      const { config } = state;

      const menu = document.createElement("div");
      menu.className = "bael-dropdown-menu";
      menu.id = `${state.id}-menu`;
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-hidden", "true");
      menu.hidden = true;

      if (config.maxHeight) {
        menu.style.maxHeight = `${config.maxHeight}px`;
        menu.style.overflowY = "auto";
      }

      // Search box
      if (config.searchable) {
        const searchBox = document.createElement("div");
        searchBox.className = "bael-dropdown-search";

        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = config.searchPlaceholder;
        searchInput.className = "bael-dropdown-search-input";
        searchInput.addEventListener("input", () => {
          this._filterItems(state, searchInput.value);
        });
        searchInput.addEventListener("keydown", (e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            this._focusItem(state, 0);
          }
        });

        searchBox.appendChild(searchInput);
        menu.appendChild(searchBox);
        state.searchInput = searchInput;
      }

      // Items container
      const itemsContainer = document.createElement("div");
      itemsContainer.className = "bael-dropdown-items";
      itemsContainer.setAttribute("role", "group");
      menu.appendChild(itemsContainer);
      state.itemsContainer = itemsContainer;

      // Render items
      this._renderItems(state, config.items);

      document.body.appendChild(menu);
      state.menu = menu;
    }

    /**
     * Render menu items
     */
    _renderItems(state, items) {
      const { config, itemsContainer } = state;
      itemsContainer.innerHTML = "";
      state.items = [];

      items.forEach((item, index) => {
        const element = this._createItem(state, item, index);
        itemsContainer.appendChild(element);
        state.items.push({ item, element, index });
      });
    }

    /**
     * Create a single menu item
     */
    _createItem(state, item, index) {
      const { config } = state;

      // Separator
      if (item.separator || item.type === "separator") {
        const separator = document.createElement("div");
        separator.className = "bael-dropdown-separator";
        separator.setAttribute("role", "separator");
        return separator;
      }

      // Group header
      if (item.header || item.type === "header") {
        const header = document.createElement("div");
        header.className = "bael-dropdown-header";
        header.textContent = item.header || item.label;
        return header;
      }

      // Regular item
      const element = document.createElement("div");
      element.className = "bael-dropdown-item";
      element.setAttribute("role", "menuitem");
      element.setAttribute("tabindex", "-1");
      element.dataset.value = item.value ?? item.label;
      element.dataset.index = index;

      if (item.disabled) {
        element.classList.add("disabled");
        element.setAttribute("aria-disabled", "true");
      }

      // Icon
      if (item.icon) {
        const icon = document.createElement("span");
        icon.className = "bael-dropdown-icon";
        icon.innerHTML = item.icon;
        element.appendChild(icon);
      }

      // Label
      const label = document.createElement("span");
      label.className = "bael-dropdown-label";
      label.textContent = item.label;
      element.appendChild(label);

      // Description
      if (item.description) {
        const desc = document.createElement("span");
        desc.className = "bael-dropdown-description";
        desc.textContent = item.description;
        element.appendChild(desc);
      }

      // Shortcut
      if (item.shortcut) {
        const shortcut = document.createElement("span");
        shortcut.className = "bael-dropdown-shortcut";
        shortcut.textContent = item.shortcut;
        element.appendChild(shortcut);
      }

      // Checkbox for multiple
      if (config.multiple) {
        const checkbox = document.createElement("span");
        checkbox.className = "bael-dropdown-checkbox";
        checkbox.innerHTML = "☐";
        element.insertBefore(checkbox, element.firstChild);
      }

      // Submenu indicator
      if (item.children && item.children.length > 0) {
        const arrow = document.createElement("span");
        arrow.className = "bael-dropdown-arrow";
        arrow.innerHTML = "▶";
        element.appendChild(arrow);
        element.classList.add("has-submenu");

        // Create submenu
        const submenu = document.createElement("div");
        submenu.className = "bael-dropdown-submenu";
        submenu.setAttribute("role", "menu");

        item.children.forEach((child, childIndex) => {
          const childElement = this._createItem(
            state,
            child,
            `${index}-${childIndex}`,
          );
          submenu.appendChild(childElement);
        });

        element.appendChild(submenu);
      }

      // Event listeners
      if (!item.disabled) {
        element.addEventListener("click", (e) => {
          e.stopPropagation();

          if (item.children && item.children.length > 0) {
            // Toggle submenu
            element.classList.toggle("submenu-open");
          } else if (item.action) {
            item.action(item);
            if (config.closeOnSelect && !config.multiple) {
              this.close(state.id);
            }
          } else {
            this._handleSelect(state, item.value ?? item.label);
          }
        });

        element.addEventListener("mouseenter", () => {
          this._focusItem(state, parseInt(element.dataset.index));
        });
      }

      return element;
    }

    /**
     * Setup trigger element
     */
    _setupTrigger(state) {
      const { trigger, config, menu } = state;

      trigger.classList.add("bael-dropdown-trigger");
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", menu.id);

      // Click toggle
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle(state.id);
      });

      // Hover mode
      if (config.hover) {
        trigger.addEventListener("mouseenter", () => {
          clearTimeout(state.hoverTimeout);
          state.hoverTimeout = setTimeout(() => {
            this.open(state.id);
          }, config.hoverDelay);
        });

        trigger.addEventListener("mouseleave", () => {
          clearTimeout(state.hoverTimeout);
          state.hoverTimeout = setTimeout(() => {
            this.close(state.id);
          }, config.hoverDelay);
        });

        menu.addEventListener("mouseenter", () => {
          clearTimeout(state.hoverTimeout);
        });

        menu.addEventListener("mouseleave", () => {
          state.hoverTimeout = setTimeout(() => {
            this.close(state.id);
          }, config.hoverDelay);
        });
      }

      // Keyboard navigation
      trigger.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "Enter":
          case " ":
          case "ArrowDown":
            e.preventDefault();
            this.open(state.id);
            this._focusItem(state, 0);
            break;
          case "ArrowUp":
            e.preventDefault();
            this.open(state.id);
            this._focusItem(state, state.items.length - 1);
            break;
        }
      });

      menu.addEventListener("keydown", (e) => {
        this._handleMenuKeydown(state, e);
      });
    }

    // ============================================================
    // OPEN/CLOSE
    // ============================================================

    /**
     * Open dropdown
     */
    open(dropdownId) {
      const state = this.instances.get(dropdownId);
      if (!state || state.isOpen) return;

      // Close any other open dropdown
      if (this.activeDropdown && this.activeDropdown !== dropdownId) {
        this.close(this.activeDropdown);
      }

      const { trigger, menu, config } = state;

      // Position menu
      this._positionMenu(state);

      // Show menu
      menu.hidden = false;
      menu.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");

      // Animate
      if (config.animated) {
        menu.style.opacity = "0";
        menu.style.transform = "translateY(-10px)";
        menu.offsetHeight;
        menu.style.transition = `opacity ${config.duration}ms ease, transform ${config.duration}ms ease`;
        menu.style.opacity = "1";
        menu.style.transform = "translateY(0)";
      }

      state.isOpen = true;
      this.activeDropdown = dropdownId;

      // Focus search or first item
      if (config.searchable && state.searchInput) {
        state.searchInput.focus();
      }

      // Callback
      if (config.onOpen) {
        config.onOpen(state);
      }
    }

    /**
     * Close dropdown
     */
    close(dropdownId) {
      const state = this.instances.get(dropdownId);
      if (!state || !state.isOpen) return;

      const { trigger, menu, config } = state;

      // Animate
      if (config.animated) {
        menu.style.opacity = "0";
        menu.style.transform = "translateY(-10px)";

        setTimeout(() => {
          menu.hidden = true;
          menu.style.transition = "";
        }, config.duration);
      } else {
        menu.hidden = true;
      }

      menu.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");

      state.isOpen = false;
      state.focusedIndex = -1;
      this.activeDropdown = null;

      // Clear search
      if (state.searchInput) {
        state.searchInput.value = "";
        this._filterItems(state, "");
      }

      // Callback
      if (config.onClose) {
        config.onClose(state);
      }
    }

    /**
     * Toggle dropdown
     */
    toggle(dropdownId) {
      const state = this.instances.get(dropdownId);
      if (!state) return;

      if (state.isOpen) {
        this.close(dropdownId);
      } else {
        this.open(dropdownId);
      }
    }

    // ============================================================
    // POSITIONING
    // ============================================================

    /**
     * Position menu relative to trigger
     */
    _positionMenu(state) {
      const { trigger, menu, config } = state;
      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Width handling
      if (config.matchTriggerWidth) {
        menu.style.width = `${triggerRect.width}px`;
      } else if (config.minWidth) {
        menu.style.minWidth = `${config.minWidth}px`;
      }

      // Parse position
      let [vertical, horizontal] = config.position.split("-");

      // Calculate position
      let top, left;

      // Vertical
      if (vertical === "bottom") {
        top = triggerRect.bottom + config.offset;
        // Check if overflows bottom
        if (top + menuRect.height > viewportHeight) {
          top = triggerRect.top - menuRect.height - config.offset;
          vertical = "top";
        }
      } else {
        top = triggerRect.top - menuRect.height - config.offset;
        // Check if overflows top
        if (top < 0) {
          top = triggerRect.bottom + config.offset;
          vertical = "bottom";
        }
      }

      // Horizontal
      if (horizontal === "start") {
        left = triggerRect.left;
      } else if (horizontal === "end") {
        left = triggerRect.right - menuRect.width;
      } else {
        left = triggerRect.left + (triggerRect.width - menuRect.width) / 2;
      }

      // Check horizontal overflow
      if (left < 0) {
        left = config.offset;
      } else if (left + menuRect.width > viewportWidth) {
        left = viewportWidth - menuRect.width - config.offset;
      }

      // Apply position
      menu.style.position = "fixed";
      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
      menu.dataset.placement = `${vertical}-${horizontal}`;
    }

    // ============================================================
    // SELECTION
    // ============================================================

    /**
     * Handle item selection
     */
    _handleSelect(state, value) {
      const { config, selectedValues } = state;

      if (config.multiple) {
        if (selectedValues.has(value)) {
          selectedValues.delete(value);
        } else {
          selectedValues.add(value);
        }
        this._updateCheckboxes(state);
      } else {
        selectedValues.clear();
        selectedValues.add(value);
        if (config.closeOnSelect) {
          this.close(state.id);
        }
      }

      // Update trigger text if needed
      this._updateTriggerText(state);

      // Callback
      if (config.onSelect) {
        config.onSelect(value, [...selectedValues], state);
      }
    }

    /**
     * Select a value programmatically
     */
    select(dropdownId, value) {
      const state = this.instances.get(dropdownId);
      if (!state) return;

      state.selectedValues.add(value);
      this._updateCheckboxes(state);
      this._updateTriggerText(state);
    }

    /**
     * Deselect a value
     */
    deselect(dropdownId, value) {
      const state = this.instances.get(dropdownId);
      if (!state) return;

      state.selectedValues.delete(value);
      this._updateCheckboxes(state);
      this._updateTriggerText(state);
    }

    /**
     * Update checkboxes for multiple selection
     */
    _updateCheckboxes(state) {
      const { items, selectedValues } = state;

      items.forEach(({ item, element }) => {
        const value = item.value ?? item.label;
        const checkbox = element.querySelector(".bael-dropdown-checkbox");
        if (checkbox) {
          checkbox.innerHTML = selectedValues.has(value) ? "☑" : "☐";
        }
        element.classList.toggle("selected", selectedValues.has(value));
      });
    }

    /**
     * Update trigger text based on selection
     */
    _updateTriggerText(state) {
      // Override in extended implementations
    }

    // ============================================================
    // KEYBOARD NAVIGATION
    // ============================================================

    /**
     * Focus an item
     */
    _focusItem(state, index) {
      const { items } = state;

      // Remove focus from current
      if (state.focusedIndex >= 0 && items[state.focusedIndex]) {
        items[state.focusedIndex].element.classList.remove("focused");
      }

      // Skip non-focusable items
      while (index >= 0 && index < items.length) {
        const { item, element } = items[index];
        if (!item.separator && !item.header && !item.disabled) {
          element.classList.add("focused");
          element.focus();
          state.focusedIndex = index;
          return;
        }
        index++;
      }
    }

    /**
     * Handle menu keyboard navigation
     */
    _handleMenuKeydown(state, e) {
      const { items, focusedIndex } = state;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this._focusItem(state, focusedIndex + 1);
          break;

        case "ArrowUp":
          e.preventDefault();
          if (focusedIndex > 0) {
            this._focusItem(state, focusedIndex - 1);
          }
          break;

        case "Home":
          e.preventDefault();
          this._focusItem(state, 0);
          break;

        case "End":
          e.preventDefault();
          this._focusItem(state, items.length - 1);
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0) {
            const { item } = items[focusedIndex];
            if (item.action) {
              item.action(item);
            } else {
              this._handleSelect(state, item.value ?? item.label);
            }
          }
          break;

        case "Tab":
          this.close(state.id);
          break;
      }
    }

    // ============================================================
    // SEARCH/FILTER
    // ============================================================

    /**
     * Filter items by search query
     */
    _filterItems(state, query) {
      const { items } = state;
      const lowerQuery = query.toLowerCase();

      items.forEach(({ item, element }) => {
        if (item.separator || item.header) {
          return;
        }

        const label = (item.label || "").toLowerCase();
        const matches = label.includes(lowerQuery);
        element.style.display = matches ? "" : "none";
      });
    }

    // ============================================================
    // ITEM MANAGEMENT
    // ============================================================

    /**
     * Set items
     */
    setItems(dropdownId, items) {
      const state = this.instances.get(dropdownId);
      if (!state) return;

      state.config.items = items;
      this._renderItems(state, items);
    }

    /**
     * Add item
     */
    addItem(dropdownId, item) {
      const state = this.instances.get(dropdownId);
      if (!state) return;

      state.config.items.push(item);
      const element = this._createItem(state, item, state.items.length);
      state.itemsContainer.appendChild(element);
      state.items.push({ item, element, index: state.items.length });
    }

    /**
     * Remove item
     */
    removeItem(dropdownId, value) {
      const state = this.instances.get(dropdownId);
      if (!state) return;

      const index = state.items.findIndex(
        (i) => (i.item.value ?? i.item.label) === value,
      );
      if (index !== -1) {
        state.items[index].element.remove();
        state.items.splice(index, 1);
        state.config.items.splice(index, 1);
      }
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy dropdown
     */
    destroy(dropdownId) {
      const state = this.instances.get(dropdownId);
      if (!state) return;

      // Remove menu from DOM
      state.menu.remove();

      // Clean trigger
      state.trigger.classList.remove("bael-dropdown-trigger");
      state.trigger.removeAttribute("aria-haspopup");
      state.trigger.removeAttribute("aria-expanded");
      state.trigger.removeAttribute("aria-controls");

      this.instances.delete(dropdownId);
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Create a context menu
     */
    contextMenu(items, options = {}) {
      const trigger = document.createElement("div");
      trigger.style.display = "none";
      document.body.appendChild(trigger);

      const dropdown = this.create(trigger, {
        items,
        position: "bottom-start",
        closeOnOutsideClick: true,
        ...options,
      });

      const show = (x, y) => {
        trigger.style.position = "fixed";
        trigger.style.left = `${x}px`;
        trigger.style.top = `${y}px`;
        trigger.style.width = "1px";
        trigger.style.height = "1px";
        trigger.style.display = "block";
        dropdown.open();
      };

      return { ...dropdown, show };
    }

    /**
     * Create a select dropdown
     */
    select(inputOrContainer, options = {}) {
      const dropdown = this.create(inputOrContainer, {
        matchTriggerWidth: true,
        closeOnSelect: true,
        ...options,
      });

      // Additional select behavior
      return dropdown;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelDropdown();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$dropdown = (trigger, options) => bael.create(trigger, options);
  window.$contextMenu = (items, options) => bael.contextMenu(items, options);
  window.$select = (input, options) => bael.select(input, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelDropdown = bael;

  console.log("📋 BAEL Dropdown Component loaded");
})();
