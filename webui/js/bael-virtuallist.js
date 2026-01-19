/**
 * BAEL Virtual List Component - Lord Of All Scrolling
 *
 * Virtualized list rendering:
 * - Render only visible items
 * - Infinite scrolling
 * - Dynamic heights
 * - Smooth scrolling
 * - Load more
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // VIRTUAL LIST CLASS
  // ============================================================

  class BaelVirtualList {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject styles
     */
    _injectStyles() {
      if (document.getElementById("bael-virtuallist-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-virtuallist-styles";
      styles.textContent = `
                .bael-virtual-list {
                    position: relative;
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .bael-virtual-list-spacer {
                    position: relative;
                }

                .bael-virtual-list-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                }

                .bael-virtual-list-item {
                    width: 100%;
                }

                /* Loading indicator */
                .bael-virtual-list-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    color: var(--text-muted, #888);
                }

                .bael-virtual-list-loader-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--border-color, #444);
                    border-top-color: var(--primary, #6a9fe2);
                    border-radius: 50%;
                    animation: bael-vlist-spin 0.8s linear infinite;
                }

                @keyframes bael-vlist-spin {
                    to { transform: rotate(360deg); }
                }

                /* End message */
                .bael-virtual-list-end {
                    padding: 16px;
                    text-align: center;
                    color: var(--text-muted, #888);
                    font-size: 0.875rem;
                }

                /* Scroll to top button */
                .bael-virtual-list-top {
                    position: absolute;
                    bottom: 16px;
                    right: 16px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary, #6a9fe2);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    opacity: 0;
                    transform: scale(0.8);
                    transition: opacity 0.2s, transform 0.2s;
                    z-index: 10;
                }

                .bael-virtual-list-top.visible {
                    opacity: 1;
                    transform: scale(1);
                }

                .bael-virtual-list-top:hover {
                    transform: scale(1.1);
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE VIRTUAL LIST
    // ============================================================

    /**
     * Create virtual list
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }
      if (!container) return null;

      const id = `bael-vlist-${++this.idCounter}`;

      const state = {
        id,
        container,
        items: options.items || [],
        itemHeight: options.itemHeight || 50,
        overscan: options.overscan || 5,
        renderItem: options.renderItem || ((item) => `<div>${item}</div>`),
        dynamicHeight: options.dynamicHeight || false,
        heightCache: new Map(),
        scrollTop: 0,
        visibleStart: 0,
        visibleEnd: 0,
        totalHeight: 0,
        loading: false,
        hasMore: options.hasMore !== false,
        loadMore: options.loadMore || null,
        loadThreshold: options.loadThreshold || 200,
        showScrollToTop: options.showScrollToTop !== false,
        scrollToTopThreshold: options.scrollToTopThreshold || 500,
        onScroll: options.onScroll || null,
        onItemClick: options.onItemClick || null,
        endMessage: options.endMessage || "No more items",
      };

      this._render(state);
      this._bindEvents(state);
      this._updateVisibleItems(state);

      this.instances.set(id, state);

      return {
        id,
        setItems: (items, hasMore) => this._setItems(state, items, hasMore),
        appendItems: (items, hasMore) =>
          this._appendItems(state, items, hasMore),
        prependItems: (items) => this._prependItems(state, items),
        updateItem: (index, item) => this._updateItem(state, index, item),
        removeItem: (index) => this._removeItem(state, index),
        scrollToIndex: (index, behavior) =>
          this._scrollToIndex(state, index, behavior),
        scrollToTop: (behavior) => this._scrollToTop(state, behavior),
        refresh: () => this._refresh(state),
        getVisibleRange: () => ({
          start: state.visibleStart,
          end: state.visibleEnd,
        }),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render container structure
     */
    _render(state) {
      const { container } = state;

      container.className = "bael-virtual-list";
      container.innerHTML = `
                <div class="bael-virtual-list-spacer">
                    <div class="bael-virtual-list-content"></div>
                </div>
            `;

      state.spacer = container.querySelector(".bael-virtual-list-spacer");
      state.content = container.querySelector(".bael-virtual-list-content");

      // Scroll to top button
      if (state.showScrollToTop) {
        const topBtn = document.createElement("button");
        topBtn.className = "bael-virtual-list-top";
        topBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>`;
        topBtn.addEventListener("click", () =>
          this._scrollToTop(state, "smooth"),
        );
        container.appendChild(topBtn);
        state.topBtn = topBtn;
      }
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { container } = state;

      let ticking = false;

      container.addEventListener("scroll", () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            state.scrollTop = container.scrollTop;
            this._updateVisibleItems(state);
            this._checkLoadMore(state);
            this._updateScrollToTop(state);

            if (state.onScroll) {
              state.onScroll({
                scrollTop: state.scrollTop,
                visibleStart: state.visibleStart,
                visibleEnd: state.visibleEnd,
              });
            }

            ticking = false;
          });
          ticking = true;
        }
      });

      // Item click delegation
      state.content.addEventListener("click", (e) => {
        const item = e.target.closest(".bael-virtual-list-item");
        if (item && state.onItemClick) {
          const index = parseInt(item.dataset.index);
          state.onItemClick(state.items[index], index, e);
        }
      });
    }

    // ============================================================
    // RENDERING
    // ============================================================

    /**
     * Update visible items
     */
    _updateVisibleItems(state) {
      const { container, items, itemHeight, overscan, dynamicHeight } = state;

      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Calculate visible range
      let startIndex, endIndex;

      if (dynamicHeight) {
        // For dynamic heights, we need to calculate based on cached heights
        startIndex = this._findStartIndex(state, scrollTop);
        endIndex = this._findEndIndex(
          state,
          scrollTop + containerHeight,
          startIndex,
        );
      } else {
        // For fixed heights
        startIndex = Math.floor(scrollTop / itemHeight);
        endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
      }

      // Apply overscan
      startIndex = Math.max(0, startIndex - overscan);
      endIndex = Math.min(items.length - 1, endIndex + overscan);

      state.visibleStart = startIndex;
      state.visibleEnd = endIndex;

      // Update total height
      if (dynamicHeight) {
        state.totalHeight = this._calculateTotalHeight(state);
      } else {
        state.totalHeight = items.length * itemHeight;
      }

      state.spacer.style.height = state.totalHeight + "px";

      // Render visible items
      this._renderItems(state, startIndex, endIndex);
    }

    /**
     * Render items in range
     */
    _renderItems(state, start, end) {
      const { items, itemHeight, renderItem, dynamicHeight, content } = state;

      const fragments = [];
      let offsetY = dynamicHeight
        ? this._getOffsetForIndex(state, start)
        : start * itemHeight;

      for (let i = start; i <= end && i < items.length; i++) {
        const item = items[i];
        const height = dynamicHeight
          ? state.heightCache.get(i) || itemHeight
          : itemHeight;

        const html = renderItem(item, i);

        fragments.push(`
                    <div class="bael-virtual-list-item"
                         data-index="${i}"
                         style="position: absolute; top: ${offsetY}px; height: ${dynamicHeight ? "auto" : height + "px"};">
                        ${html}
                    </div>
                `);

        offsetY += height;
      }

      content.innerHTML = fragments.join("");

      // Update height cache for dynamic heights
      if (dynamicHeight) {
        const renderedItems = content.querySelectorAll(
          ".bael-virtual-list-item",
        );
        renderedItems.forEach((el) => {
          const index = parseInt(el.dataset.index);
          const actualHeight = el.offsetHeight;
          if (state.heightCache.get(index) !== actualHeight) {
            state.heightCache.set(index, actualHeight);
          }
        });
      }
    }

    /**
     * Find start index for scroll position (dynamic heights)
     */
    _findStartIndex(state, scrollTop) {
      const { items, itemHeight, heightCache } = state;
      let offset = 0;

      for (let i = 0; i < items.length; i++) {
        const height = heightCache.get(i) || itemHeight;
        if (offset + height > scrollTop) {
          return i;
        }
        offset += height;
      }

      return items.length - 1;
    }

    /**
     * Find end index for scroll position (dynamic heights)
     */
    _findEndIndex(state, scrollBottom, startIndex) {
      const { items, itemHeight, heightCache } = state;
      let offset = this._getOffsetForIndex(state, startIndex);

      for (let i = startIndex; i < items.length; i++) {
        if (offset > scrollBottom) {
          return i;
        }
        offset += heightCache.get(i) || itemHeight;
      }

      return items.length - 1;
    }

    /**
     * Get offset for index
     */
    _getOffsetForIndex(state, index) {
      const { itemHeight, heightCache } = state;
      let offset = 0;

      for (let i = 0; i < index; i++) {
        offset += heightCache.get(i) || itemHeight;
      }

      return offset;
    }

    /**
     * Calculate total height
     */
    _calculateTotalHeight(state) {
      const { items, itemHeight, heightCache } = state;
      let total = 0;

      for (let i = 0; i < items.length; i++) {
        total += heightCache.get(i) || itemHeight;
      }

      return total;
    }

    // ============================================================
    // INFINITE SCROLL
    // ============================================================

    /**
     * Check if should load more
     */
    _checkLoadMore(state) {
      if (!state.loadMore || state.loading || !state.hasMore) return;

      const { container, loadThreshold } = state;
      const scrollBottom = container.scrollTop + container.clientHeight;
      const remaining = state.totalHeight - scrollBottom;

      if (remaining < loadThreshold) {
        this._loadMore(state);
      }
    }

    /**
     * Load more items
     */
    async _loadMore(state) {
      state.loading = true;
      this._showLoader(state);

      try {
        const result = await state.loadMore();

        if (result && result.items) {
          this._appendItems(state, result.items, result.hasMore !== false);
        }
      } catch (error) {
        console.error("Load more failed:", error);
      }

      state.loading = false;
      this._hideLoader(state);
    }

    /**
     * Show loading indicator
     */
    _showLoader(state) {
      if (!state.loader) {
        state.loader = document.createElement("div");
        state.loader.className = "bael-virtual-list-loader";
        state.loader.innerHTML =
          '<div class="bael-virtual-list-loader-spinner"></div>';
      }
      state.spacer.appendChild(state.loader);
    }

    /**
     * Hide loading indicator
     */
    _hideLoader(state) {
      if (state.loader && state.loader.parentNode) {
        state.loader.remove();
      }

      // Show end message if no more items
      if (!state.hasMore) {
        const endEl = document.createElement("div");
        endEl.className = "bael-virtual-list-end";
        endEl.textContent = state.endMessage;
        state.spacer.appendChild(endEl);
      }
    }

    // ============================================================
    // SCROLL TO TOP
    // ============================================================

    /**
     * Update scroll to top button visibility
     */
    _updateScrollToTop(state) {
      if (!state.topBtn) return;

      const visible = state.scrollTop > state.scrollToTopThreshold;
      state.topBtn.classList.toggle("visible", visible);
    }

    /**
     * Scroll to top
     */
    _scrollToTop(state, behavior = "smooth") {
      state.container.scrollTo({
        top: 0,
        behavior,
      });
    }

    /**
     * Scroll to specific index
     */
    _scrollToIndex(state, index, behavior = "smooth") {
      const offset = state.dynamicHeight
        ? this._getOffsetForIndex(state, index)
        : index * state.itemHeight;

      state.container.scrollTo({
        top: offset,
        behavior,
      });
    }

    // ============================================================
    // DATA MANAGEMENT
    // ============================================================

    /**
     * Set items (replace all)
     */
    _setItems(state, items, hasMore = true) {
      state.items = items;
      state.hasMore = hasMore;
      state.heightCache.clear();
      this._updateVisibleItems(state);
    }

    /**
     * Append items
     */
    _appendItems(state, items, hasMore = true) {
      state.items = [...state.items, ...items];
      state.hasMore = hasMore;
      this._updateVisibleItems(state);
    }

    /**
     * Prepend items
     */
    _prependItems(state, items) {
      // Adjust scroll position to maintain current view
      const oldHeight = state.totalHeight;

      state.items = [...items, ...state.items];

      // Shift height cache indices
      const newCache = new Map();
      for (const [index, height] of state.heightCache) {
        newCache.set(index + items.length, height);
      }
      state.heightCache = newCache;

      this._updateVisibleItems(state);

      // Adjust scroll
      const heightDiff = state.totalHeight - oldHeight;
      state.container.scrollTop += heightDiff;
    }

    /**
     * Update single item
     */
    _updateItem(state, index, item) {
      if (index >= 0 && index < state.items.length) {
        state.items[index] = item;
        state.heightCache.delete(index);
        this._updateVisibleItems(state);
      }
    }

    /**
     * Remove item
     */
    _removeItem(state, index) {
      if (index >= 0 && index < state.items.length) {
        state.items.splice(index, 1);

        // Shift height cache
        const newCache = new Map();
        for (const [i, height] of state.heightCache) {
          if (i < index) {
            newCache.set(i, height);
          } else if (i > index) {
            newCache.set(i - 1, height);
          }
        }
        state.heightCache = newCache;

        this._updateVisibleItems(state);
      }
    }

    /**
     * Refresh list
     */
    _refresh(state) {
      state.heightCache.clear();
      this._updateVisibleItems(state);
    }

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (state) {
        state.container.innerHTML = "";
        state.container.className = "";
        this.instances.delete(id);
      }
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelVirtualList();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$virtualList = (container, opts) => bael.create(container, opts);
  window.$infiniteList = (container, opts) =>
    bael.create(container, {
      ...opts,
      hasMore: true,
    });

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelVirtualList = bael;

  console.log("📜 BAEL Virtual List loaded");
})();
