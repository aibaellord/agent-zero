/**
 * BAEL Tabs Component - Lord Of All Tab Panels
 *
 * Full-featured tabs component with:
 * - Horizontal/vertical layouts
 * - Closable tabs
 * - Draggable reordering
 * - Lazy loading
 * - Keyboard navigation
 * - ARIA accessibility
 * - Tab overflow handling
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TABS CLASS
  // ============================================================

  class BaelTabs {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
    }

    // ============================================================
    // CREATE TABS
    // ============================================================

    /**
     * Create a tabs component
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Tabs container not found");
        return null;
      }

      const id = `bael-tabs-${++this.idCounter}`;
      const config = {
        orientation: "horizontal",
        animated: true,
        duration: 200,
        closable: false,
        addable: false,
        draggable: false,
        lazy: false,
        cache: true,
        defaultTab: 0,
        tabPosition: "top",
        overflow: "scroll",
        onSelect: null,
        onClose: null,
        onAdd: null,
        onReorder: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        tabs: [],
        activeIndex: -1,
        loadedTabs: new Set(),
      };

      // Setup container
      this._setupContainer(state);

      // Initialize tabs
      this._initTabs(state);

      // Select default tab
      if (state.tabs.length > 0) {
        this._selectTab(state, config.defaultTab, false);
      }

      this.instances.set(id, state);

      return {
        id,
        select: (index) => this.select(id, index),
        selectById: (tabId) => this.selectById(id, tabId),
        getActiveIndex: () => state.activeIndex,
        getActiveTab: () => state.tabs[state.activeIndex],
        addTab: (options) => this.addTab(id, options),
        removeTab: (index) => this.removeTab(id, index),
        updateTab: (index, options) => this.updateTab(id, index, options),
        getTabs: () => [...state.tabs],
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Setup container structure
     */
    _setupContainer(state) {
      const { container, config } = state;

      container.classList.add("bael-tabs");
      container.classList.add(`bael-tabs-${config.orientation}`);
      container.classList.add(`bael-tabs-${config.tabPosition}`);

      // Create tab list
      let tabList = container.querySelector(".tab-list, [data-tab-list]");
      if (!tabList) {
        tabList = document.createElement("div");
        container.insertBefore(tabList, container.firstChild);
      }
      tabList.classList.add("bael-tab-list");
      tabList.setAttribute("role", "tablist");
      tabList.setAttribute("aria-orientation", config.orientation);
      state.tabList = tabList;

      // Create tab panels container
      let panelContainer = container.querySelector(
        ".tab-panels, [data-tab-panels]",
      );
      if (!panelContainer) {
        panelContainer = document.createElement("div");
        container.appendChild(panelContainer);
      }
      panelContainer.classList.add("bael-tab-panels");
      state.panelContainer = panelContainer;

      // Add button if addable
      if (config.addable) {
        const addBtn = document.createElement("button");
        addBtn.className = "bael-tab-add";
        addBtn.innerHTML = "+";
        addBtn.setAttribute("aria-label", "Add tab");
        addBtn.onclick = () => {
          if (config.onAdd) {
            const newTab = config.onAdd();
            if (newTab) {
              this.addTab(state.id, newTab);
            }
          } else {
            this.addTab(state.id, { label: "New Tab" });
          }
        };
        tabList.appendChild(addBtn);
        state.addBtn = addBtn;
      }

      // Overflow handling
      if (config.overflow === "scroll") {
        tabList.classList.add("scrollable");
      } else if (config.overflow === "dropdown") {
        this._setupOverflowDropdown(state);
      }
    }

    /**
     * Initialize tabs from HTML
     */
    _initTabs(state) {
      const { container } = state;

      // Find existing tabs
      const tabButtons = container.querySelectorAll(".tab-button, [data-tab]");
      const tabPanels = container.querySelectorAll(
        ".tab-panel, [data-tab-panel]",
      );

      tabButtons.forEach((button, index) => {
        const panel = tabPanels[index];
        if (panel) {
          this._setupTab(state, button, panel, index);
        }
      });

      // If no tabs found, look for combined structure
      if (state.tabs.length === 0) {
        const items = container.querySelectorAll(".tab-item, [data-tab-item]");
        items.forEach((item, index) => {
          const label =
            item.dataset.label ||
            item.querySelector("[data-tab-label]")?.textContent ||
            `Tab ${index + 1}`;
          const content = item.innerHTML;

          const button = document.createElement("button");
          button.textContent = label;

          const panel = document.createElement("div");
          panel.innerHTML = content;

          state.tabList.insertBefore(button, state.addBtn || null);
          state.panelContainer.appendChild(panel);

          this._setupTab(state, button, panel, index);

          // Remove original item
          item.remove();
        });
      }
    }

    /**
     * Setup a single tab
     */
    _setupTab(state, button, panel, index) {
      const { config } = state;
      const tabId = `${state.id}-tab-${index}`;
      const panelId = `${state.id}-panel-${index}`;

      // Setup button
      button.classList.add("bael-tab");
      button.setAttribute("role", "tab");
      button.setAttribute("id", tabId);
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-selected", "false");
      button.setAttribute("tabindex", "-1");

      // Setup panel
      panel.classList.add("bael-tab-panel");
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("id", panelId);
      panel.setAttribute("aria-labelledby", tabId);
      panel.hidden = true;

      // Add close button if closable
      if (config.closable) {
        const closeBtn = document.createElement("span");
        closeBtn.className = "bael-tab-close";
        closeBtn.innerHTML = "×";
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          this.removeTab(state.id, index);
        };
        button.appendChild(closeBtn);
      }

      // Event listeners
      button.addEventListener("click", () => {
        this.select(state.id, index);
      });

      button.addEventListener("keydown", (e) => {
        this._handleKeydown(state, index, e);
      });

      // Drag support
      if (config.draggable) {
        this._setupDrag(state, button, index);
      }

      // Store tab reference
      state.tabs.push({
        index,
        button,
        panel,
        tabId,
        panelId,
        label: button.textContent.replace("×", "").trim(),
        disabled: button.disabled,
      });
    }

    /**
     * Setup drag and drop
     */
    _setupDrag(state, button, index) {
      button.draggable = true;

      button.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", index.toString());
        button.classList.add("dragging");
      });

      button.addEventListener("dragend", () => {
        button.classList.remove("dragging");
      });

      button.addEventListener("dragover", (e) => {
        e.preventDefault();
        button.classList.add("drag-over");
      });

      button.addEventListener("dragleave", () => {
        button.classList.remove("drag-over");
      });

      button.addEventListener("drop", (e) => {
        e.preventDefault();
        button.classList.remove("drag-over");

        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
        const toIndex = this._getTabIndex(state, button);

        if (fromIndex !== toIndex) {
          this._reorderTabs(state, fromIndex, toIndex);
        }
      });
    }

    /**
     * Get current index of a tab button
     */
    _getTabIndex(state, button) {
      return state.tabs.findIndex((t) => t.button === button);
    }

    // ============================================================
    // TAB SELECTION
    // ============================================================

    /**
     * Select a tab by index
     */
    select(tabsId, index) {
      const state = this.instances.get(tabsId);
      if (!state) return;

      this._selectTab(state, index, true);
    }

    /**
     * Select a tab by ID
     */
    selectById(tabsId, tabId) {
      const state = this.instances.get(tabsId);
      if (!state) return;

      const index = state.tabs.findIndex((t) => t.tabId === tabId);
      if (index !== -1) {
        this._selectTab(state, index, true);
      }
    }

    /**
     * Internal select tab
     */
    _selectTab(state, index, animate = true) {
      const { config, tabs, activeIndex } = state;

      if (index < 0 || index >= tabs.length) return;
      if (tabs[index].disabled) return;
      if (index === activeIndex) return;

      // Deselect current
      if (activeIndex !== -1) {
        const current = tabs[activeIndex];
        current.button.setAttribute("aria-selected", "false");
        current.button.setAttribute("tabindex", "-1");
        current.button.classList.remove("active");
        current.panel.hidden = true;
      }

      // Select new
      const newTab = tabs[index];
      newTab.button.setAttribute("aria-selected", "true");
      newTab.button.setAttribute("tabindex", "0");
      newTab.button.classList.add("active");
      newTab.panel.hidden = false;

      // Handle lazy loading
      if (config.lazy && !state.loadedTabs.has(index)) {
        const loader = newTab.panel.querySelector("[data-lazy-content]");
        if (loader) {
          const content = loader.dataset.lazyContent;
          if (content.startsWith("http") || content.startsWith("/")) {
            fetch(content)
              .then((r) => r.text())
              .then((html) => {
                newTab.panel.innerHTML = html;
              });
          } else {
            newTab.panel.innerHTML = content;
          }
        }
        state.loadedTabs.add(index);
      }

      // Animate
      if (animate && config.animated) {
        newTab.panel.style.opacity = "0";
        newTab.panel.offsetHeight;
        newTab.panel.style.transition = `opacity ${config.duration}ms ease`;
        newTab.panel.style.opacity = "1";

        setTimeout(() => {
          newTab.panel.style.transition = "";
        }, config.duration);
      }

      // Update state
      state.activeIndex = index;

      // Callback
      if (config.onSelect) {
        config.onSelect(index, newTab);
      }

      // Scroll tab into view
      this._scrollTabIntoView(state, newTab.button);
    }

    /**
     * Scroll tab into view
     */
    _scrollTabIntoView(state, button) {
      const { tabList, config } = state;

      if (config.overflow === "scroll") {
        button.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
          block: "nearest",
        });
      }
    }

    // ============================================================
    // TAB MANAGEMENT
    // ============================================================

    /**
     * Add a new tab
     */
    addTab(tabsId, options = {}) {
      const state = this.instances.get(tabsId);
      if (!state) return -1;

      const {
        label = "New Tab",
        content = "",
        closable = state.config.closable,
        disabled = false,
        select = true,
      } = options;

      const index = state.tabs.length;

      // Create button
      const button = document.createElement("button");
      button.textContent = label;
      if (disabled) button.disabled = true;

      // Create panel
      const panel = document.createElement("div");
      if (typeof content === "string") {
        panel.innerHTML = content;
      } else {
        panel.appendChild(content);
      }

      // Insert before add button
      state.tabList.insertBefore(button, state.addBtn || null);
      state.panelContainer.appendChild(panel);

      // Setup
      this._setupTab(state, button, panel, index);

      // Override closable if specified
      if (closable && !state.config.closable) {
        const closeBtn = document.createElement("span");
        closeBtn.className = "bael-tab-close";
        closeBtn.innerHTML = "×";
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          this.removeTab(state.id, index);
        };
        button.appendChild(closeBtn);
      }

      // Select new tab
      if (select) {
        this._selectTab(state, index, true);
      }

      return index;
    }

    /**
     * Remove a tab
     */
    removeTab(tabsId, index) {
      const state = this.instances.get(tabsId);
      if (!state) return false;

      const tab = state.tabs[index];
      if (!tab) return false;

      // Callback check
      if (state.config.onClose) {
        const canClose = state.config.onClose(index, tab);
        if (canClose === false) return false;
      }

      // Remove from DOM
      tab.button.remove();
      tab.panel.remove();

      // Remove from array
      state.tabs.splice(index, 1);

      // Re-index tabs
      state.tabs.forEach((t, i) => {
        t.index = i;
      });

      // Select adjacent tab if needed
      if (state.activeIndex === index) {
        const newIndex = Math.min(index, state.tabs.length - 1);
        state.activeIndex = -1;
        if (newIndex >= 0) {
          this._selectTab(state, newIndex, false);
        }
      } else if (state.activeIndex > index) {
        state.activeIndex--;
      }

      return true;
    }

    /**
     * Update a tab
     */
    updateTab(tabsId, index, options) {
      const state = this.instances.get(tabsId);
      if (!state) return false;

      const tab = state.tabs[index];
      if (!tab) return false;

      if (options.label !== undefined) {
        // Update text but preserve close button
        const closeBtn = tab.button.querySelector(".bael-tab-close");
        tab.button.textContent = options.label;
        if (closeBtn) tab.button.appendChild(closeBtn);
        tab.label = options.label;
      }

      if (options.content !== undefined) {
        if (typeof options.content === "string") {
          tab.panel.innerHTML = options.content;
        } else {
          tab.panel.innerHTML = "";
          tab.panel.appendChild(options.content);
        }
      }

      if (options.disabled !== undefined) {
        tab.button.disabled = options.disabled;
        tab.disabled = options.disabled;
      }

      return true;
    }

    /**
     * Reorder tabs
     */
    _reorderTabs(state, fromIndex, toIndex) {
      const { tabs, tabList, config } = state;

      // Get tab data
      const tab = tabs[fromIndex];

      // Reorder array
      tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, tab);

      // Reorder DOM
      const referenceButton = tabs[toIndex + 1]?.button || state.addBtn;
      tabList.insertBefore(tab.button, referenceButton);

      // Re-index
      tabs.forEach((t, i) => {
        t.index = i;
      });

      // Update active index
      if (state.activeIndex === fromIndex) {
        state.activeIndex = toIndex;
      } else if (
        fromIndex < state.activeIndex &&
        toIndex >= state.activeIndex
      ) {
        state.activeIndex--;
      } else if (
        fromIndex > state.activeIndex &&
        toIndex <= state.activeIndex
      ) {
        state.activeIndex++;
      }

      // Callback
      if (config.onReorder) {
        config.onReorder(fromIndex, toIndex, tabs);
      }
    }

    // ============================================================
    // KEYBOARD NAVIGATION
    // ============================================================

    /**
     * Handle keyboard navigation
     */
    _handleKeydown(state, index, e) {
      const { tabs, config } = state;
      const isHorizontal = config.orientation === "horizontal";
      let newIndex = index;

      switch (e.key) {
        case isHorizontal ? "ArrowRight" : "ArrowDown":
          e.preventDefault();
          newIndex = this._findNextEnabled(state, index, 1);
          break;

        case isHorizontal ? "ArrowLeft" : "ArrowUp":
          e.preventDefault();
          newIndex = this._findNextEnabled(state, index, -1);
          break;

        case "Home":
          e.preventDefault();
          newIndex = this._findNextEnabled(state, -1, 1);
          break;

        case "End":
          e.preventDefault();
          newIndex = this._findNextEnabled(state, tabs.length, -1);
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          this._selectTab(state, index, true);
          return;

        case "Delete":
          if (config.closable) {
            e.preventDefault();
            this.removeTab(state.id, index);
          }
          return;
      }

      if (newIndex !== index && newIndex !== -1) {
        tabs[newIndex].button.focus();
        this._selectTab(state, newIndex, true);
      }
    }

    /**
     * Find next enabled tab
     */
    _findNextEnabled(state, startIndex, direction) {
      const { tabs } = state;
      let index = startIndex + direction;

      while (index >= 0 && index < tabs.length) {
        if (!tabs[index].disabled) {
          return index;
        }
        index += direction;
      }

      return -1;
    }

    // ============================================================
    // OVERFLOW DROPDOWN
    // ============================================================

    /**
     * Setup overflow dropdown
     */
    _setupOverflowDropdown(state) {
      // TODO: Implement overflow dropdown for many tabs
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy tabs instance
     */
    destroy(tabsId) {
      const state = this.instances.get(tabsId);
      if (!state) return;

      const { container, tabs } = state;

      // Remove classes
      container.classList.remove(
        "bael-tabs",
        "bael-tabs-horizontal",
        "bael-tabs-vertical",
      );
      container.classList.remove(
        "bael-tabs-top",
        "bael-tabs-bottom",
        "bael-tabs-left",
        "bael-tabs-right",
      );

      // Clean up tabs
      tabs.forEach((tab) => {
        tab.button.classList.remove("bael-tab", "active");
        tab.button.removeAttribute("role");
        tab.button.removeAttribute("aria-controls");
        tab.button.removeAttribute("aria-selected");
        tab.button.removeAttribute("tabindex");

        tab.panel.classList.remove("bael-tab-panel");
        tab.panel.removeAttribute("role");
        tab.panel.removeAttribute("aria-labelledby");
        tab.panel.hidden = false;

        // Remove close buttons
        const closeBtn = tab.button.querySelector(".bael-tab-close");
        if (closeBtn) closeBtn.remove();
      });

      // Clean up containers
      state.tabList.classList.remove("bael-tab-list", "scrollable");
      state.tabList.removeAttribute("role");
      state.tabList.removeAttribute("aria-orientation");

      state.panelContainer.classList.remove("bael-tab-panels");

      // Remove add button
      if (state.addBtn) {
        state.addBtn.remove();
      }

      this.instances.delete(tabsId);
    }

    // ============================================================
    // AUTO-INIT
    // ============================================================

    /**
     * Auto-initialize tabs with data attributes
     */
    autoInit() {
      const containers = document.querySelectorAll("[data-tabs]");

      containers.forEach((container) => {
        const options = {};

        if (container.dataset.tabsOrientation) {
          options.orientation = container.dataset.tabsOrientation;
        }

        if (container.dataset.tabsClosable !== undefined) {
          options.closable = container.dataset.tabsClosable !== "false";
        }

        if (container.dataset.tabsDraggable !== undefined) {
          options.draggable = container.dataset.tabsDraggable !== "false";
        }

        if (container.dataset.tabsDefault) {
          options.defaultTab = parseInt(container.dataset.tabsDefault);
        }

        this.create(container, options);
      });
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelTabs();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$tabs = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTabs = bael;

  // Auto-init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bael.autoInit());
  } else {
    bael.autoInit();
  }

  console.log("📑 BAEL Tabs Component loaded");
})();
