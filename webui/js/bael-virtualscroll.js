/**
 * BAEL Virtual Scroll Component - Lord Of All Lists
 *
 * Virtualized scrolling for large lists:
 * - Only renders visible items
 * - Fixed or dynamic item heights
 * - Smooth scrolling
 * - Buffer zones
 * - Scroll position restoration
 * - Load more callback
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // VIRTUAL SCROLL CLASS
  // ============================================================

  class BaelVirtualScroll {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-virtualscroll-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-virtualscroll-styles";
      styles.textContent = `
                .bael-virtualscroll {
                    position: relative;
                    overflow-y: auto;
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .bael-virtualscroll-content {
                    position: relative;
                }

                .bael-virtualscroll-item {
                    position: absolute;
                    left: 0;
                    right: 0;
                }

                .bael-virtualscroll-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    color: #9ca3af;
                }

                .bael-virtualscroll-loading-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: baelVirtualScrollSpin 0.8s linear infinite;
                }

                @keyframes baelVirtualScrollSpin {
                    to { transform: rotate(360deg); }
                }

                .bael-virtualscroll-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    color: #9ca3af;
                    text-align: center;
                }

                .bael-virtualscroll-empty-icon {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 16px;
                    color: #d1d5db;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE VIRTUAL SCROLL
    // ============================================================

    /**
     * Create a virtual scroll container
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Virtual scroll container not found");
        return null;
      }

      const id = `bael-virtualscroll-${++this.idCounter}`;
      const config = {
        items: [],
        itemHeight: 50, // fixed item height (or estimatedItemHeight if dynamic)
        dynamicHeight: false, // allow variable item heights
        buffer: 5, // extra items to render above/below viewport
        renderItem: null, // (item, index) => HTMLElement or string
        keyField: "id", // unique key field
        emptyMessage: "No items to display",
        emptyIcon: null,
        loadMore: null, // callback when scrolled near bottom
        loadMoreThreshold: 200, // pixels from bottom to trigger loadMore
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-virtualscroll";
      el.id = id;
      el.style.height = container.style.height || "400px";

      const content = document.createElement("div");
      content.className = "bael-virtualscroll-content";
      el.appendChild(content);

      const state = {
        id,
        element: el,
        content,
        container,
        config,
        items: [...config.items],
        itemHeights: new Map(), // cache for dynamic heights
        startIndex: 0,
        endIndex: 0,
        scrollTop: 0,
        isLoading: false,
        renderedItems: new Map(),
      };

      // Calculate total height
      this._calculateTotalHeight(state);

      // Scroll handler
      el.addEventListener("scroll", () => this._onScroll(state));

      // Initial render
      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        setItems: (items) => this.setItems(id, items),
        addItems: (items) => this.addItems(id, items),
        updateItem: (index, item) => this.updateItem(id, index, item),
        removeItem: (index) => this.removeItem(id, index),
        scrollTo: (index) => this.scrollTo(id, index),
        scrollToTop: () => this.scrollToTop(id),
        scrollToBottom: () => this.scrollToBottom(id),
        getScrollPosition: () => state.scrollTop,
        setLoading: (loading) => this.setLoading(id, loading),
        refresh: () => this._render(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Calculate total content height
     */
    _calculateTotalHeight(state) {
      const { config, items, itemHeights } = state;

      if (config.dynamicHeight) {
        // Sum all known heights, use estimate for unknown
        let total = 0;
        for (let i = 0; i < items.length; i++) {
          total += itemHeights.get(i) || config.itemHeight;
        }
        state.totalHeight = total;
      } else {
        state.totalHeight = items.length * config.itemHeight;
      }

      state.content.style.height = `${state.totalHeight}px`;
    }

    /**
     * Get item offset
     */
    _getItemOffset(state, index) {
      const { config, itemHeights } = state;

      if (config.dynamicHeight) {
        let offset = 0;
        for (let i = 0; i < index; i++) {
          offset += itemHeights.get(i) || config.itemHeight;
        }
        return offset;
      }

      return index * config.itemHeight;
    }

    /**
     * Get item at offset
     */
    _getItemAtOffset(state, offset) {
      const { config, items, itemHeights } = state;

      if (config.dynamicHeight) {
        let cumulative = 0;
        for (let i = 0; i < items.length; i++) {
          const height = itemHeights.get(i) || config.itemHeight;
          if (cumulative + height > offset) {
            return i;
          }
          cumulative += height;
        }
        return items.length - 1;
      }

      return Math.floor(offset / config.itemHeight);
    }

    /**
     * Handle scroll event
     */
    _onScroll(state) {
      const { element, config, items } = state;
      state.scrollTop = element.scrollTop;

      // Check for load more
      if (config.loadMore && !state.isLoading) {
        const scrollBottom =
          element.scrollHeight - element.scrollTop - element.clientHeight;
        if (scrollBottom < config.loadMoreThreshold) {
          config.loadMore();
        }
      }

      // Re-render visible items
      this._renderItems(state);
    }

    /**
     * Render container
     */
    _render(state) {
      const { items, config } = state;

      // Check if empty
      if (items.length === 0) {
        this._renderEmpty(state);
        return;
      }

      // Calculate total height
      this._calculateTotalHeight(state);

      // Render visible items
      this._renderItems(state);
    }

    /**
     * Render visible items
     */
    _renderItems(state) {
      const { element, content, config, items, renderedItems } = state;
      const viewportHeight = element.clientHeight;
      const scrollTop = element.scrollTop;

      // Calculate visible range
      const startIndex = Math.max(
        0,
        this._getItemAtOffset(state, scrollTop) - config.buffer,
      );
      const endOffset = scrollTop + viewportHeight;
      const endIndex = Math.min(
        items.length - 1,
        this._getItemAtOffset(state, endOffset) + config.buffer,
      );

      state.startIndex = startIndex;
      state.endIndex = endIndex;

      // Remove items outside range
      renderedItems.forEach((el, index) => {
        if (index < startIndex || index > endIndex) {
          el.remove();
          renderedItems.delete(index);
        }
      });

      // Render items in range
      for (let i = startIndex; i <= endIndex; i++) {
        if (!renderedItems.has(i)) {
          const itemEl = this._renderItem(state, items[i], i);
          content.appendChild(itemEl);
          renderedItems.set(i, itemEl);

          // Measure height for dynamic items
          if (config.dynamicHeight) {
            const height = itemEl.offsetHeight;
            if (state.itemHeights.get(i) !== height) {
              state.itemHeights.set(i, height);
              // Recalculate positions if height changed
              this._calculateTotalHeight(state);
            }
          }
        }
      }
    }

    /**
     * Render single item
     */
    _renderItem(state, item, index) {
      const { config } = state;

      const wrapper = document.createElement("div");
      wrapper.className = "bael-virtualscroll-item";
      wrapper.dataset.index = index;

      // Position
      const offset = this._getItemOffset(state, index);
      wrapper.style.transform = `translateY(${offset}px)`;

      if (!config.dynamicHeight) {
        wrapper.style.height = `${config.itemHeight}px`;
      }

      // Render content
      if (config.renderItem) {
        const content = config.renderItem(item, index);
        if (typeof content === "string") {
          wrapper.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          wrapper.appendChild(content);
        }
      } else {
        // Default rendering
        wrapper.textContent = JSON.stringify(item);
      }

      return wrapper;
    }

    /**
     * Render empty state
     */
    _renderEmpty(state) {
      const { content, config } = state;

      content.innerHTML = "";
      content.style.height = "auto";

      const empty = document.createElement("div");
      empty.className = "bael-virtualscroll-empty";

      if (config.emptyIcon) {
        const icon = document.createElement("div");
        icon.className = "bael-virtualscroll-empty-icon";
        icon.innerHTML = config.emptyIcon;
        empty.appendChild(icon);
      }

      const message = document.createElement("div");
      message.textContent = config.emptyMessage;
      empty.appendChild(message);

      content.appendChild(empty);
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Set items
     */
    setItems(scrollId, items) {
      const state = this.instances.get(scrollId);
      if (!state) return;

      state.items = [...items];
      state.itemHeights.clear();
      state.renderedItems.forEach((el) => el.remove());
      state.renderedItems.clear();

      this._render(state);
    }

    /**
     * Add items (for infinite scroll)
     */
    addItems(scrollId, items) {
      const state = this.instances.get(scrollId);
      if (!state) return;

      state.items = [...state.items, ...items];
      this._calculateTotalHeight(state);
      this._renderItems(state);
    }

    /**
     * Update single item
     */
    updateItem(scrollId, index, item) {
      const state = this.instances.get(scrollId);
      if (!state || index < 0 || index >= state.items.length) return;

      state.items[index] = item;

      // Re-render if visible
      if (state.renderedItems.has(index)) {
        const oldEl = state.renderedItems.get(index);
        const newEl = this._renderItem(state, item, index);
        oldEl.replaceWith(newEl);
        state.renderedItems.set(index, newEl);

        // Update height cache
        if (state.config.dynamicHeight) {
          state.itemHeights.set(index, newEl.offsetHeight);
          this._calculateTotalHeight(state);
        }
      }
    }

    /**
     * Remove item
     */
    removeItem(scrollId, index) {
      const state = this.instances.get(scrollId);
      if (!state || index < 0 || index >= state.items.length) return;

      state.items.splice(index, 1);
      state.itemHeights.delete(index);

      // Clear and re-render
      state.renderedItems.forEach((el) => el.remove());
      state.renderedItems.clear();
      this._render(state);
    }

    /**
     * Scroll to item index
     */
    scrollTo(scrollId, index) {
      const state = this.instances.get(scrollId);
      if (!state) return;

      const offset = this._getItemOffset(state, index);
      state.element.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }

    /**
     * Scroll to top
     */
    scrollToTop(scrollId) {
      const state = this.instances.get(scrollId);
      if (!state) return;

      state.element.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom(scrollId) {
      const state = this.instances.get(scrollId);
      if (!state) return;

      state.element.scrollTo({
        top: state.totalHeight,
        behavior: "smooth",
      });
    }

    /**
     * Set loading state
     */
    setLoading(scrollId, loading) {
      const state = this.instances.get(scrollId);
      if (!state) return;

      state.isLoading = loading;

      // Remove existing loading indicator
      const existingLoader = state.content.querySelector(
        ".bael-virtualscroll-loading",
      );
      if (existingLoader) {
        existingLoader.remove();
      }

      if (loading) {
        const loader = document.createElement("div");
        loader.className = "bael-virtualscroll-loading";
        loader.style.position = "absolute";
        loader.style.bottom = "0";
        loader.style.left = "0";
        loader.style.right = "0";
        loader.innerHTML =
          '<div class="bael-virtualscroll-loading-spinner"></div>';
        state.content.appendChild(loader);
      }
    }

    /**
     * Destroy virtual scroll
     */
    destroy(scrollId) {
      const state = this.instances.get(scrollId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(scrollId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelVirtualScroll();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$virtualScroll = (container, options) =>
    bael.create(container, options);
  window.$vscroll = window.$virtualScroll;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelVirtualScroll = bael;

  console.log("📜 BAEL Virtual Scroll Component loaded");
})();
