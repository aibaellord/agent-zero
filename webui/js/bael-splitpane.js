/**
 * BAEL Split Pane Component - Lord Of All Panels
 *
 * Resizable split panels with:
 * - Horizontal/vertical split
 * - Multiple panes
 * - Nested splits
 * - Min/max sizes
 * - Collapsible
 * - Snap to positions
 * - Persistence
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SPLIT PANE CLASS
  // ============================================================

  class BaelSplitPane {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-splitpane-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-splitpane-styles";
      styles.textContent = `
                .bael-splitpane {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }

                .bael-splitpane.vertical {
                    flex-direction: column;
                }

                .bael-splitpane.horizontal {
                    flex-direction: row;
                }

                /* Pane */
                .bael-splitpane-pane {
                    position: relative;
                    overflow: auto;
                    flex-shrink: 0;
                }

                .bael-splitpane-pane.collapsed {
                    flex-basis: 0 !important;
                    min-width: 0 !important;
                    min-height: 0 !important;
                    overflow: hidden;
                }

                /* Gutter (resize handle) */
                .bael-splitpane-gutter {
                    flex-shrink: 0;
                    background: #e5e7eb;
                    position: relative;
                    z-index: 10;
                    transition: background 0.15s;
                }

                .bael-splitpane.horizontal .bael-splitpane-gutter {
                    width: 4px;
                    cursor: col-resize;
                }

                .bael-splitpane.vertical .bael-splitpane-gutter {
                    height: 4px;
                    cursor: row-resize;
                }

                .bael-splitpane-gutter:hover,
                .bael-splitpane-gutter.dragging {
                    background: #4f46e5;
                }

                /* Gutter handle line */
                .bael-splitpane-gutter::before {
                    content: '';
                    position: absolute;
                    background: #9ca3af;
                    border-radius: 2px;
                    transition: background 0.15s;
                }

                .bael-splitpane.horizontal .bael-splitpane-gutter::before {
                    width: 2px;
                    height: 24px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .bael-splitpane.vertical .bael-splitpane-gutter::before {
                    height: 2px;
                    width: 24px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .bael-splitpane-gutter:hover::before,
                .bael-splitpane-gutter.dragging::before {
                    background: white;
                }

                /* Collapse button */
                .bael-splitpane-collapse {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 1px solid #d1d5db;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 11;
                    transition: all 0.15s;
                }

                .bael-splitpane.horizontal .bael-splitpane-collapse {
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .bael-splitpane.vertical .bael-splitpane-collapse {
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .bael-splitpane-collapse:hover {
                    background: #4f46e5;
                    border-color: #4f46e5;
                    color: white;
                }

                .bael-splitpane-collapse svg {
                    width: 12px;
                    height: 12px;
                }

                /* Styled variant */
                .bael-splitpane.styled .bael-splitpane-gutter {
                    background: #f3f4f6;
                }

                .bael-splitpane.styled .bael-splitpane-pane {
                    background: white;
                    border-radius: 8px;
                    margin: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                /* Overlay during drag */
                .bael-splitpane-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    cursor: col-resize;
                }

                .bael-splitpane-overlay.vertical {
                    cursor: row-resize;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE SPLIT PANE
    // ============================================================

    /**
     * Create a split pane
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Split pane container not found");
        return null;
      }

      const id = `bael-splitpane-${++this.idCounter}`;
      const config = {
        direction: "horizontal", // horizontal, vertical
        sizes: [50, 50], // percentages
        minSize: 50, // min size in pixels
        maxSize: null, // max size in pixels
        gutterSize: 4,
        collapsible: false,
        snapPositions: null, // [25, 50, 75] - snap to these percentages
        snapThreshold: 5, // pixels to trigger snap
        persist: false, // persist sizes to localStorage
        persistKey: null,
        variant: "default", // default, styled
        onResize: null,
        onCollapse: null,
        ...options,
      };

      // Get child elements as panes
      const children = Array.from(container.children);
      if (children.length < 2) {
        console.error("Split pane requires at least 2 child elements");
        return null;
      }

      // Create wrapper
      const el = document.createElement("div");
      el.className = `bael-splitpane ${config.direction} ${config.variant}`;
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        panes: [],
        gutters: [],
        sizes: [...config.sizes],
        collapsed: [],
      };

      // Load persisted sizes
      if (config.persist && config.persistKey) {
        const saved = localStorage.getItem(
          `bael-splitpane-${config.persistKey}`,
        );
        if (saved) {
          try {
            state.sizes = JSON.parse(saved);
          } catch (e) {}
        }
      }

      // Create panes and gutters
      children.forEach((child, index) => {
        // Wrap child in pane
        const pane = document.createElement("div");
        pane.className = "bael-splitpane-pane";
        pane.appendChild(child);
        el.appendChild(pane);
        state.panes.push(pane);
        state.collapsed.push(false);

        // Add gutter between panes
        if (index < children.length - 1) {
          const gutter = this._createGutter(state, index);
          el.appendChild(gutter);
          state.gutters.push(gutter);
        }
      });

      // Replace container content
      container.innerHTML = "";
      container.appendChild(el);

      // Apply sizes
      this._applySizes(state);

      this.instances.set(id, state);

      return {
        id,
        getSizes: () => [...state.sizes],
        setSizes: (sizes) => this.setSizes(id, sizes),
        collapse: (index) => this.collapse(id, index),
        expand: (index) => this.expand(id, index),
        toggle: (index) => this.toggle(id, index),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create gutter
     */
    _createGutter(state, index) {
      const { config } = state;

      const gutter = document.createElement("div");
      gutter.className = "bael-splitpane-gutter";
      gutter.dataset.index = index;

      if (config.direction === "horizontal") {
        gutter.style.width = config.gutterSize + "px";
      } else {
        gutter.style.height = config.gutterSize + "px";
      }

      // Collapse button
      if (config.collapsible) {
        const collapse = document.createElement("button");
        collapse.className = "bael-splitpane-collapse";
        collapse.type = "button";
        collapse.innerHTML =
          config.direction === "horizontal"
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>`;
        collapse.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggle(state.id, index);
        });
        gutter.appendChild(collapse);
      }

      // Drag events
      let startPos = 0;
      let startSizes = [];

      const onMouseDown = (e) => {
        e.preventDefault();
        gutter.classList.add("dragging");

        startPos = config.direction === "horizontal" ? e.clientX : e.clientY;
        startSizes = [...state.sizes];

        // Create overlay to capture mouse events
        const overlay = document.createElement("div");
        overlay.className = `bael-splitpane-overlay ${config.direction === "vertical" ? "vertical" : ""}`;
        document.body.appendChild(overlay);

        const onMouseMove = (e) => {
          const currentPos =
            config.direction === "horizontal" ? e.clientX : e.clientY;
          const delta = currentPos - startPos;

          this._handleDrag(state, index, delta, startSizes);
        };

        const onMouseUp = () => {
          gutter.classList.remove("dragging");
          overlay.remove();
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);

          // Persist
          if (config.persist && config.persistKey) {
            localStorage.setItem(
              `bael-splitpane-${config.persistKey}`,
              JSON.stringify(state.sizes),
            );
          }
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      gutter.addEventListener("mousedown", onMouseDown);

      // Touch support
      gutter.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          onMouseDown({
            preventDefault: () => {},
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
          });
        }
      });

      return gutter;
    }

    /**
     * Handle drag
     */
    _handleDrag(state, gutterIndex, delta, startSizes) {
      const { element, config, panes } = state;
      const totalSize =
        config.direction === "horizontal"
          ? element.offsetWidth
          : element.offsetHeight;
      const gutterSize = config.gutterSize * (panes.length - 1);
      const availableSize = totalSize - gutterSize;

      const deltaPercent = (delta / availableSize) * 100;

      // Calculate new sizes
      let newSizes = [...startSizes];
      newSizes[gutterIndex] = Math.max(
        0,
        startSizes[gutterIndex] + deltaPercent,
      );
      newSizes[gutterIndex + 1] = Math.max(
        0,
        startSizes[gutterIndex + 1] - deltaPercent,
      );

      // Apply min/max constraints
      const minPercent = (config.minSize / availableSize) * 100;

      if (newSizes[gutterIndex] < minPercent) {
        newSizes[gutterIndex] = minPercent;
        newSizes[gutterIndex + 1] =
          startSizes[gutterIndex] + startSizes[gutterIndex + 1] - minPercent;
      }

      if (newSizes[gutterIndex + 1] < minPercent) {
        newSizes[gutterIndex + 1] = minPercent;
        newSizes[gutterIndex] =
          startSizes[gutterIndex] + startSizes[gutterIndex + 1] - minPercent;
      }

      // Snap positions
      if (config.snapPositions) {
        const snapThresholdPercent =
          (config.snapThreshold / availableSize) * 100;

        config.snapPositions.forEach((snapPos) => {
          if (
            Math.abs(newSizes[gutterIndex] - snapPos) < snapThresholdPercent
          ) {
            const diff = snapPos - newSizes[gutterIndex];
            newSizes[gutterIndex] = snapPos;
            newSizes[gutterIndex + 1] -= diff;
          }
        });
      }

      state.sizes = newSizes;
      this._applySizes(state);

      if (config.onResize) {
        config.onResize(newSizes);
      }
    }

    /**
     * Apply sizes to panes
     */
    _applySizes(state) {
      const { panes, sizes, collapsed, config } = state;

      panes.forEach((pane, index) => {
        if (collapsed[index]) {
          pane.classList.add("collapsed");
          pane.style.flexBasis = "0";
        } else {
          pane.classList.remove("collapsed");
          pane.style.flexBasis = `calc(${sizes[index]}% - ${(config.gutterSize * (panes.length - 1)) / panes.length}px)`;
        }
      });
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Set sizes
     */
    setSizes(splitId, sizes) {
      const state = this.instances.get(splitId);
      if (!state) return;

      state.sizes = sizes;
      this._applySizes(state);

      if (state.config.persist && state.config.persistKey) {
        localStorage.setItem(
          `bael-splitpane-${state.config.persistKey}`,
          JSON.stringify(sizes),
        );
      }
    }

    /**
     * Collapse pane
     */
    collapse(splitId, index) {
      const state = this.instances.get(splitId);
      if (!state || index >= state.panes.length) return;

      state.collapsed[index] = true;
      this._applySizes(state);

      if (state.config.onCollapse) {
        state.config.onCollapse(index, true);
      }
    }

    /**
     * Expand pane
     */
    expand(splitId, index) {
      const state = this.instances.get(splitId);
      if (!state || index >= state.panes.length) return;

      state.collapsed[index] = false;
      this._applySizes(state);

      if (state.config.onCollapse) {
        state.config.onCollapse(index, false);
      }
    }

    /**
     * Toggle collapse
     */
    toggle(splitId, index) {
      const state = this.instances.get(splitId);
      if (!state) return;

      if (state.collapsed[index]) {
        this.expand(splitId, index);
      } else {
        this.collapse(splitId, index);
      }
    }

    /**
     * Destroy split pane
     */
    destroy(splitId) {
      const state = this.instances.get(splitId);
      if (!state) return;

      // Unwrap panes
      const children = state.panes.map((pane) => pane.firstChild);
      state.container.innerHTML = "";
      children.forEach((child) => state.container.appendChild(child));

      this.instances.delete(splitId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelSplitPane();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$splitPane = (container, options) => bael.create(container, options);
  window.$split = window.$splitPane; // Alias

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelSplitPane = bael;

  console.log("📐 BAEL Split Pane Component loaded");
})();
