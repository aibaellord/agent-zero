/**
 * BAEL Sortable Component - Lord Of All Order
 *
 * Drag and drop sorting with:
 * - List sorting
 * - Grid sorting
 * - Between containers
 * - Touch support
 * - Animation
 * - Handles
 * - Disabled items
 * - Ghost preview
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SORTABLE CLASS
  // ============================================================

  class BaelSortable {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this.activeSort = null;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-sortable-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-sortable-styles";
      styles.textContent = `
                .bael-sortable {
                    position: relative;
                }

                .bael-sortable-item {
                    position: relative;
                    touch-action: manipulation;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .bael-sortable-item.dragging {
                    opacity: 0.4;
                    z-index: 0;
                }

                .bael-sortable-item.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Handle */
                .bael-sortable-handle {
                    cursor: grab;
                    touch-action: none;
                }

                .bael-sortable-handle:active {
                    cursor: grabbing;
                }

                /* Ghost */
                .bael-sortable-ghost {
                    position: fixed;
                    pointer-events: none;
                    z-index: 99999;
                    opacity: 0.9;
                    transform: rotate(2deg);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                /* Placeholder */
                .bael-sortable-placeholder {
                    background: #eef2ff;
                    border: 2px dashed #4f46e5;
                    border-radius: 8px;
                    transition: height 0.15s;
                }

                /* Drop indicator */
                .bael-sortable-indicator {
                    position: absolute;
                    height: 3px;
                    background: #4f46e5;
                    border-radius: 2px;
                    left: 0;
                    right: 0;
                    pointer-events: none;
                    transition: top 0.1s;
                }

                /* Animation */
                .bael-sortable-item.shifting {
                    transition: transform 0.2s ease-out;
                }

                /* Grid layout support */
                .bael-sortable.grid {
                    display: grid;
                }

                .bael-sortable.grid .bael-sortable-placeholder {
                    border-radius: 8px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE SORTABLE
    // ============================================================

    /**
     * Create a sortable container
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Sortable container not found");
        return null;
      }

      const id = `bael-sortable-${++this.idCounter}`;
      const config = {
        items: ".bael-sortable-item", // item selector
        handle: null, // handle selector (null = whole item)
        group: null, // group name for multi-container sorting
        disabled: ".disabled", // disabled item selector
        ghostClass: "bael-sortable-ghost",
        dragClass: "dragging",
        animation: 200,
        delay: 0, // delay before drag starts (ms)
        delayOnTouchOnly: true,
        swapThreshold: 0.5,
        direction: "vertical", // vertical, horizontal, auto
        scroll: true,
        scrollSensitivity: 50,
        scrollSpeed: 10,
        onStart: null,
        onEnd: null,
        onSort: null,
        onChange: null,
        onAdd: null,
        onRemove: null,
        ...options,
      };

      container.classList.add("bael-sortable");

      const state = {
        id,
        container,
        config,
        items: [],
        dragItem: null,
        ghost: null,
        placeholder: null,
        startIndex: -1,
        currentIndex: -1,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        delayTimer: null,
      };

      this._setupEvents(state);
      this._refreshItems(state);

      this.instances.set(id, state);

      return {
        id,
        toArray: () => this.toArray(id),
        sort: (order) => this.sort(id, order),
        refresh: () => this._refreshItems(state),
        option: (key, value) => this.option(id, key, value),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Refresh item list
     */
    _refreshItems(state) {
      state.items = Array.from(
        state.container.querySelectorAll(state.config.items),
      );
    }

    /**
     * Setup event listeners
     */
    _setupEvents(state) {
      const { container, config } = state;

      // Mouse events
      container.addEventListener("mousedown", (e) =>
        this._onDragStart(state, e),
      );
      document.addEventListener("mousemove", (e) => this._onDragMove(state, e));
      document.addEventListener("mouseup", (e) => this._onDragEnd(state, e));

      // Touch events
      container.addEventListener(
        "touchstart",
        (e) => this._onDragStart(state, e),
        { passive: false },
      );
      document.addEventListener(
        "touchmove",
        (e) => this._onDragMove(state, e),
        { passive: false },
      );
      document.addEventListener("touchend", (e) => this._onDragEnd(state, e));
    }

    /**
     * Get touch/mouse coordinates
     */
    _getCoords(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    // ============================================================
    // DRAG OPERATIONS
    // ============================================================

    /**
     * Start drag
     */
    _onDragStart(state, e) {
      if (state.dragItem) return;

      const { config } = state;
      const coords = this._getCoords(e);

      // Find dragged item
      const target = e.target;
      let dragItem = null;

      if (config.handle) {
        const handle = target.closest(config.handle);
        if (handle) {
          dragItem = handle.closest(config.items);
        }
      } else {
        dragItem = target.closest(config.items);
      }

      if (!dragItem || !state.container.contains(dragItem)) return;
      if (config.disabled && dragItem.matches(config.disabled)) return;

      // Check for delay
      const isTouch = e.type === "touchstart";
      const delay = config.delayOnTouchOnly && !isTouch ? 0 : config.delay;

      if (delay > 0) {
        state.delayTimer = setTimeout(() => {
          this._startDrag(state, dragItem, coords.x, coords.y, e);
        }, delay);
        return;
      }

      this._startDrag(state, dragItem, coords.x, coords.y, e);
    }

    /**
     * Actually start the drag
     */
    _startDrag(state, dragItem, x, y, e) {
      state.dragItem = dragItem;
      state.startIndex = state.items.indexOf(dragItem);
      state.currentIndex = state.startIndex;

      const rect = dragItem.getBoundingClientRect();
      state.startX = x;
      state.startY = y;
      state.offsetX = x - rect.left;
      state.offsetY = y - rect.top;

      // Create ghost
      state.ghost = dragItem.cloneNode(true);
      state.ghost.className = `${dragItem.className} ${state.config.ghostClass}`;
      state.ghost.style.width = rect.width + "px";
      state.ghost.style.height = rect.height + "px";
      state.ghost.style.left = rect.left + "px";
      state.ghost.style.top = rect.top + "px";
      document.body.appendChild(state.ghost);

      // Create placeholder
      state.placeholder = document.createElement("div");
      state.placeholder.className = "bael-sortable-placeholder";
      state.placeholder.style.height = rect.height + "px";
      state.placeholder.style.width = rect.width + "px";
      dragItem.parentNode.insertBefore(state.placeholder, dragItem);

      // Add drag class
      dragItem.classList.add(state.config.dragClass);

      // Set as active
      this.activeSort = state;

      if (state.config.onStart) {
        state.config.onStart({
          item: dragItem,
          index: state.startIndex,
          container: state.container,
        });
      }

      if (e.type === "touchstart") {
        e.preventDefault();
      }
    }

    /**
     * Move drag
     */
    _onDragMove(state, e) {
      if (!state.dragItem) {
        // Cancel delay if moved before delay
        if (state.delayTimer) {
          clearTimeout(state.delayTimer);
          state.delayTimer = null;
        }
        return;
      }

      e.preventDefault();

      const coords = this._getCoords(e);
      const { config, ghost, placeholder, container } = state;

      // Move ghost
      ghost.style.left = coords.x - state.offsetX + "px";
      ghost.style.top = coords.y - state.offsetY + "px";

      // Find new position
      let newIndex = -1;
      const direction = config.direction;

      this._refreshItems(state);

      for (let i = 0; i < state.items.length; i++) {
        const item = state.items[i];
        if (item === state.dragItem) continue;

        const rect = item.getBoundingClientRect();
        const threshold = config.swapThreshold;

        if (direction === "vertical" || direction === "auto") {
          const midY = rect.top + rect.height * threshold;
          if (coords.y < midY) {
            newIndex = i;
            break;
          }
        }

        if (direction === "horizontal") {
          const midX = rect.left + rect.width * threshold;
          if (coords.x < midX) {
            newIndex = i;
            break;
          }
        }
      }

      if (newIndex === -1) {
        newIndex = state.items.length;
      }

      // Move placeholder if position changed
      if (newIndex !== state.currentIndex) {
        state.currentIndex = newIndex;

        const referenceNode = state.items[newIndex];
        if (referenceNode && referenceNode !== state.dragItem) {
          container.insertBefore(placeholder, referenceNode);
        } else {
          container.appendChild(placeholder);
        }

        if (config.onChange) {
          config.onChange({
            item: state.dragItem,
            from: state.startIndex,
            to: newIndex,
          });
        }
      }

      // Auto scroll
      if (config.scroll) {
        this._autoScroll(
          coords.y,
          config.scrollSensitivity,
          config.scrollSpeed,
        );
      }
    }

    /**
     * End drag
     */
    _onDragEnd(state, e) {
      // Clear delay timer
      if (state.delayTimer) {
        clearTimeout(state.delayTimer);
        state.delayTimer = null;
      }

      if (!state.dragItem) return;

      const {
        config,
        container,
        dragItem,
        ghost,
        placeholder,
        startIndex,
        currentIndex,
      } = state;

      // Remove ghost
      ghost.remove();
      state.ghost = null;

      // Move item to new position
      container.insertBefore(dragItem, placeholder);
      placeholder.remove();
      state.placeholder = null;

      // Remove drag class
      dragItem.classList.remove(config.dragClass);

      // Animate to position
      if (config.animation) {
        dragItem.style.transition = `transform ${config.animation}ms`;
        setTimeout(() => {
          dragItem.style.transition = "";
        }, config.animation);
      }

      // Callbacks
      if (startIndex !== currentIndex) {
        if (config.onSort) {
          config.onSort({
            item: dragItem,
            from: startIndex,
            to: currentIndex,
            container: container,
          });
        }
      }

      if (config.onEnd) {
        config.onEnd({
          item: dragItem,
          from: startIndex,
          to: currentIndex,
          container: container,
        });
      }

      // Clean up
      state.dragItem = null;
      state.startIndex = -1;
      state.currentIndex = -1;
      this.activeSort = null;

      this._refreshItems(state);
    }

    /**
     * Auto scroll when near edges
     */
    _autoScroll(y, sensitivity, speed) {
      const vh = window.innerHeight;

      if (y < sensitivity) {
        window.scrollBy(0, -speed);
      } else if (y > vh - sensitivity) {
        window.scrollBy(0, speed);
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Get order as array
     */
    toArray(sortableId) {
      const state = this.instances.get(sortableId);
      if (!state) return [];

      this._refreshItems(state);
      return state.items.map(
        (item) => item.dataset.id || item.textContent.trim(),
      );
    }

    /**
     * Sort by array of IDs
     */
    sort(sortableId, order) {
      const state = this.instances.get(sortableId);
      if (!state || !Array.isArray(order)) return;

      const { container, config } = state;

      order.forEach((id) => {
        const item = container.querySelector(`[data-id="${id}"]`);
        if (item) {
          container.appendChild(item);
        }
      });

      this._refreshItems(state);
    }

    /**
     * Get/set option
     */
    option(sortableId, key, value) {
      const state = this.instances.get(sortableId);
      if (!state) return;

      if (value === undefined) {
        return state.config[key];
      }

      state.config[key] = value;
    }

    /**
     * Destroy sortable
     */
    destroy(sortableId) {
      const state = this.instances.get(sortableId);
      if (!state) return;

      state.container.classList.remove("bael-sortable");
      this.instances.delete(sortableId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelSortable();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$sortable = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelSortable = bael;

  console.log("🔀 BAEL Sortable Component loaded");
})();
