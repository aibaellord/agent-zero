/**
 * BAEL Virtual List - Virtualized Scrolling System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete virtual list system:
 * - Windowing for large datasets
 * - Dynamic row heights
 * - Infinite scrolling
 * - Grid virtualization
 * - Scroll restoration
 */

(function () {
  "use strict";

  class BaelVirtualList {
    constructor() {
      this.instances = new Map();
      console.log("📜 Bael Virtual List initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // INSTANCE CREATION
    // ═══════════════════════════════════════════════════════════

    create(container, options = {}) {
      const instance = new VirtualScroller(container, options);
      this.instances.set(container, instance);
      return instance;
    }

    get(container) {
      return this.instances.get(container);
    }

    destroy(container) {
      const instance = this.instances.get(container);
      if (instance) {
        instance.destroy();
        this.instances.delete(container);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // GRID
    // ═══════════════════════════════════════════════════════════

    createGrid(container, options = {}) {
      const instance = new VirtualGrid(container, options);
      this.instances.set(container, instance);
      return instance;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // VIRTUAL SCROLLER
  // ═══════════════════════════════════════════════════════════════════

  class VirtualScroller {
    constructor(container, options) {
      this.container =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      this.options = {
        itemHeight: options.itemHeight || 50,
        overscan: options.overscan || 5,
        renderItem:
          options.renderItem ||
          ((item, index) => {
            const div = document.createElement("div");
            div.textContent = String(item);
            return div;
          }),
        getItemHeight: options.getItemHeight || null,
        threshold: options.threshold || 0.8,
        onLoadMore: options.onLoadMore || null,
        ...options,
      };

      this.items = [];
      this.renderedRange = { start: 0, end: 0 };
      this.scrollTop = 0;
      this.containerHeight = 0;
      this.totalHeight = 0;
      this.itemHeights = new Map();
      this.itemPositions = [];

      this._init();
    }

    _init() {
      // Setup container
      this.container.style.overflow = "auto";
      this.container.style.position = "relative";

      // Create spacer for scroll height
      this.spacer = document.createElement("div");
      this.spacer.style.position = "absolute";
      this.spacer.style.top = "0";
      this.spacer.style.left = "0";
      this.spacer.style.width = "100%";
      this.spacer.style.pointerEvents = "none";
      this.container.appendChild(this.spacer);

      // Create content wrapper
      this.content = document.createElement("div");
      this.content.style.position = "absolute";
      this.content.style.top = "0";
      this.content.style.left = "0";
      this.content.style.width = "100%";
      this.container.appendChild(this.content);

      // Bind events
      this._onScroll = this._handleScroll.bind(this);
      this._onResize = this._handleResize.bind(this);

      this.container.addEventListener("scroll", this._onScroll, {
        passive: true,
      });
      window.addEventListener("resize", this._onResize);

      // Initial measurements
      this._measureContainer();
    }

    _measureContainer() {
      this.containerHeight = this.container.clientHeight;
    }

    setItems(items) {
      this.items = items;
      this._calculatePositions();
      this._updateSpacerHeight();
      this._render();
      return this;
    }

    addItems(items) {
      this.items = [...this.items, ...items];
      this._calculatePositions();
      this._updateSpacerHeight();
      this._render();
      return this;
    }

    updateItem(index, item) {
      this.items[index] = item;

      // Recalculate if variable heights
      if (this.options.getItemHeight) {
        this._calculatePositions();
        this._updateSpacerHeight();
      }

      this._render();
      return this;
    }

    removeItem(index) {
      this.items.splice(index, 1);
      this._calculatePositions();
      this._updateSpacerHeight();
      this._render();
      return this;
    }

    _calculatePositions() {
      this.itemPositions = [];
      let position = 0;

      for (let i = 0; i < this.items.length; i++) {
        const height = this._getItemHeight(i);
        this.itemPositions.push({ top: position, height });
        position += height;
      }

      this.totalHeight = position;
    }

    _getItemHeight(index) {
      // Check cached height
      if (this.itemHeights.has(index)) {
        return this.itemHeights.get(index);
      }

      // Get dynamic height
      if (this.options.getItemHeight) {
        return this.options.getItemHeight(this.items[index], index);
      }

      // Default height
      return this.options.itemHeight;
    }

    _updateSpacerHeight() {
      this.spacer.style.height = `${this.totalHeight}px`;
    }

    _handleScroll() {
      this.scrollTop = this.container.scrollTop;
      this._render();

      // Check for infinite scroll
      if (this.options.onLoadMore) {
        const scrollPercent =
          this.scrollTop / (this.totalHeight - this.containerHeight);
        if (scrollPercent >= this.options.threshold) {
          this.options.onLoadMore();
        }
      }
    }

    _handleResize() {
      this._measureContainer();
      this._render();
    }

    _render() {
      const { start, end } = this._calculateVisibleRange();

      // Skip if range hasn't changed
      if (
        start === this.renderedRange.start &&
        end === this.renderedRange.end
      ) {
        return;
      }

      this.renderedRange = { start, end };

      // Clear content
      this.content.innerHTML = "";

      // Get offset for first visible item
      const startOffset =
        start < this.itemPositions.length ? this.itemPositions[start].top : 0;

      this.content.style.transform = `translateY(${startOffset}px)`;

      // Render visible items
      for (let i = start; i < end && i < this.items.length; i++) {
        const item = this.items[i];
        const element = this.options.renderItem(item, i);

        element.style.height = `${this._getItemHeight(i)}px`;
        element.dataset.index = i;

        this.content.appendChild(element);

        // Measure actual height for variable heights
        if (this.options.getItemHeight && !this.itemHeights.has(i)) {
          const actualHeight = element.getBoundingClientRect().height;
          if (actualHeight !== this._getItemHeight(i)) {
            this.itemHeights.set(i, actualHeight);
            // Recalculate positions
            this._calculatePositions();
            this._updateSpacerHeight();
          }
        }
      }
    }

    _calculateVisibleRange() {
      const overscan = this.options.overscan;

      // Binary search for start index
      let start = this._binarySearchStart(this.scrollTop);
      start = Math.max(0, start - overscan);

      // Find end index
      const endOffset = this.scrollTop + this.containerHeight;
      let end = this._binarySearchEnd(endOffset);
      end = Math.min(this.items.length, end + overscan);

      return { start, end };
    }

    _binarySearchStart(scrollTop) {
      let low = 0;
      let high = this.itemPositions.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const pos = this.itemPositions[mid];

        if (pos.top + pos.height < scrollTop) {
          low = mid + 1;
        } else if (pos.top > scrollTop) {
          high = mid - 1;
        } else {
          return mid;
        }
      }

      return low;
    }

    _binarySearchEnd(offset) {
      let low = 0;
      let high = this.itemPositions.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const pos = this.itemPositions[mid];

        if (pos.top < offset) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      return low;
    }

    scrollTo(offset) {
      this.container.scrollTop = offset;
      return this;
    }

    scrollToIndex(index) {
      if (index < 0 || index >= this.items.length) return this;

      const position = this.itemPositions[index];
      if (position) {
        this.container.scrollTop = position.top;
      }

      return this;
    }

    scrollToItem(predicate) {
      const index = this.items.findIndex(predicate);
      if (index !== -1) {
        this.scrollToIndex(index);
      }
      return this;
    }

    refresh() {
      this._calculatePositions();
      this._updateSpacerHeight();
      this._render();
      return this;
    }

    getVisibleItems() {
      const { start, end } = this._calculateVisibleRange();
      return this.items.slice(start, end);
    }

    getScrollState() {
      return {
        scrollTop: this.scrollTop,
        containerHeight: this.containerHeight,
        totalHeight: this.totalHeight,
        visibleRange: this.renderedRange,
        itemCount: this.items.length,
      };
    }

    destroy() {
      this.container.removeEventListener("scroll", this._onScroll);
      window.removeEventListener("resize", this._onResize);
      this.container.innerHTML = "";
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // VIRTUAL GRID
  // ═══════════════════════════════════════════════════════════════════

  class VirtualGrid {
    constructor(container, options) {
      this.container =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      this.options = {
        itemWidth: options.itemWidth || 200,
        itemHeight: options.itemHeight || 200,
        gap: options.gap || 10,
        overscan: options.overscan || 2,
        renderItem:
          options.renderItem ||
          ((item, index) => {
            const div = document.createElement("div");
            div.textContent = String(item);
            return div;
          }),
        ...options,
      };

      this.items = [];
      this.columns = 1;
      this.rows = 0;
      this.containerWidth = 0;
      this.containerHeight = 0;
      this.scrollTop = 0;
      this.renderedRange = { startRow: 0, endRow: 0 };

      this._init();
    }

    _init() {
      // Setup container
      this.container.style.overflow = "auto";
      this.container.style.position = "relative";

      // Create spacer
      this.spacer = document.createElement("div");
      this.spacer.style.position = "absolute";
      this.spacer.style.top = "0";
      this.spacer.style.left = "0";
      this.spacer.style.width = "100%";
      this.container.appendChild(this.spacer);

      // Create content
      this.content = document.createElement("div");
      this.content.style.position = "absolute";
      this.content.style.top = "0";
      this.content.style.left = "0";
      this.content.style.width = "100%";
      this.content.style.display = "grid";
      this.container.appendChild(this.content);

      // Bind events
      this._onScroll = this._handleScroll.bind(this);
      this._onResize = this._handleResize.bind(this);

      this.container.addEventListener("scroll", this._onScroll, {
        passive: true,
      });
      window.addEventListener("resize", this._onResize);

      // Initial measurements
      this._measure();
    }

    _measure() {
      this.containerWidth = this.container.clientWidth;
      this.containerHeight = this.container.clientHeight;

      const { itemWidth, gap } = this.options;
      this.columns = Math.max(
        1,
        Math.floor((this.containerWidth + gap) / (itemWidth + gap)),
      );
      this.rows = Math.ceil(this.items.length / this.columns);

      this._updateLayout();
    }

    _updateLayout() {
      const { itemWidth, itemHeight, gap } = this.options;
      const totalHeight = this.rows * (itemHeight + gap);

      this.spacer.style.height = `${totalHeight}px`;

      this.content.style.gridTemplateColumns = `repeat(${this.columns}, ${itemWidth}px)`;
      this.content.style.gap = `${gap}px`;
    }

    setItems(items) {
      this.items = items;
      this._measure();
      this._render();
      return this;
    }

    _handleScroll() {
      this.scrollTop = this.container.scrollTop;
      this._render();
    }

    _handleResize() {
      this._measure();
      this._render();
    }

    _render() {
      const { itemHeight, gap, overscan } = this.options;
      const rowHeight = itemHeight + gap;

      let startRow = Math.floor(this.scrollTop / rowHeight);
      startRow = Math.max(0, startRow - overscan);

      let endRow = Math.ceil(
        (this.scrollTop + this.containerHeight) / rowHeight,
      );
      endRow = Math.min(this.rows, endRow + overscan);

      if (
        startRow === this.renderedRange.startRow &&
        endRow === this.renderedRange.endRow
      ) {
        return;
      }

      this.renderedRange = { startRow, endRow };

      // Clear content
      this.content.innerHTML = "";

      // Position content
      this.content.style.transform = `translateY(${startRow * rowHeight}px)`;

      // Render visible items
      const startIndex = startRow * this.columns;
      const endIndex = Math.min(endRow * this.columns, this.items.length);

      for (let i = startIndex; i < endIndex; i++) {
        const item = this.items[i];
        const element = this.options.renderItem(item, i);

        element.style.width = `${this.options.itemWidth}px`;
        element.style.height = `${this.options.itemHeight}px`;
        element.dataset.index = i;

        this.content.appendChild(element);
      }
    }

    scrollToIndex(index) {
      const { itemHeight, gap } = this.options;
      const row = Math.floor(index / this.columns);
      this.container.scrollTop = row * (itemHeight + gap);
      return this;
    }

    refresh() {
      this._measure();
      this._render();
      return this;
    }

    destroy() {
      this.container.removeEventListener("scroll", this._onScroll);
      window.removeEventListener("resize", this._onResize);
      this.container.innerHTML = "";
    }
  }

  // Initialize
  window.BaelVirtualList = new BaelVirtualList();
  window.VirtualScroller = VirtualScroller;
  window.VirtualGrid = VirtualGrid;

  // Global shortcuts
  window.$virtualList = window.BaelVirtualList;
  window.$vList = (container, opts) =>
    window.BaelVirtualList.create(container, opts);
  window.$vGrid = (container, opts) =>
    window.BaelVirtualList.createGrid(container, opts);

  console.log("📜 Bael Virtual List ready");
})();
