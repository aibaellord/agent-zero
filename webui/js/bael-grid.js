/**
 * BAEL Grid Component - Lord Of All Layouts
 *
 * Flexible grid layout system:
 * - CSS Grid based
 * - Responsive breakpoints
 * - Gap control
 * - Auto-fit / Auto-fill
 * - Masonry layout
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // GRID CLASS
  // ============================================================

  class BaelGrid {
    constructor() {
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-grid-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-grid-styles";
      styles.textContent = `
                /* Grid Container */
                .bael-grid {
                    display: grid;
                    width: 100%;
                }

                /* Column counts */
                .bael-grid.cols-1 { grid-template-columns: repeat(1, 1fr); }
                .bael-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
                .bael-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
                .bael-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
                .bael-grid.cols-5 { grid-template-columns: repeat(5, 1fr); }
                .bael-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
                .bael-grid.cols-12 { grid-template-columns: repeat(12, 1fr); }

                /* Auto-fit for responsive cards */
                .bael-grid.auto-fit { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
                .bael-grid.auto-fill { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }

                .bael-grid.auto-fit-sm { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
                .bael-grid.auto-fit-md { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
                .bael-grid.auto-fit-lg { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
                .bael-grid.auto-fit-xl { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }

                /* Gaps */
                .bael-grid.gap-0 { gap: 0; }
                .bael-grid.gap-xs { gap: 4px; }
                .bael-grid.gap-sm { gap: 8px; }
                .bael-grid.gap-md { gap: 16px; }
                .bael-grid.gap-lg { gap: 24px; }
                .bael-grid.gap-xl { gap: 32px; }
                .bael-grid.gap-2xl { gap: 48px; }

                /* Row gaps only */
                .bael-grid.row-gap-xs { row-gap: 4px; }
                .bael-grid.row-gap-sm { row-gap: 8px; }
                .bael-grid.row-gap-md { row-gap: 16px; }
                .bael-grid.row-gap-lg { row-gap: 24px; }

                /* Column gaps only */
                .bael-grid.col-gap-xs { column-gap: 4px; }
                .bael-grid.col-gap-sm { column-gap: 8px; }
                .bael-grid.col-gap-md { column-gap: 16px; }
                .bael-grid.col-gap-lg { column-gap: 24px; }

                /* Alignment */
                .bael-grid.items-start { align-items: start; }
                .bael-grid.items-center { align-items: center; }
                .bael-grid.items-end { align-items: end; }
                .bael-grid.items-stretch { align-items: stretch; }

                .bael-grid.justify-start { justify-items: start; }
                .bael-grid.justify-center { justify-items: center; }
                .bael-grid.justify-end { justify-items: end; }
                .bael-grid.justify-stretch { justify-items: stretch; }

                .bael-grid.content-start { align-content: start; }
                .bael-grid.content-center { align-content: center; }
                .bael-grid.content-end { align-content: end; }
                .bael-grid.content-between { align-content: space-between; }
                .bael-grid.content-around { align-content: space-around; }

                /* Grid items */
                .bael-grid-item { min-width: 0; }

                /* Span columns */
                .bael-grid-item.span-2 { grid-column: span 2; }
                .bael-grid-item.span-3 { grid-column: span 3; }
                .bael-grid-item.span-4 { grid-column: span 4; }
                .bael-grid-item.span-6 { grid-column: span 6; }
                .bael-grid-item.span-full { grid-column: 1 / -1; }

                /* Span rows */
                .bael-grid-item.row-span-2 { grid-row: span 2; }
                .bael-grid-item.row-span-3 { grid-row: span 3; }
                .bael-grid-item.row-span-4 { grid-row: span 4; }

                /* Responsive breakpoints */
                @media (max-width: 1200px) {
                    .bael-grid.lg\\:cols-1 { grid-template-columns: repeat(1, 1fr); }
                    .bael-grid.lg\\:cols-2 { grid-template-columns: repeat(2, 1fr); }
                    .bael-grid.lg\\:cols-3 { grid-template-columns: repeat(3, 1fr); }
                    .bael-grid.lg\\:cols-4 { grid-template-columns: repeat(4, 1fr); }
                }

                @media (max-width: 992px) {
                    .bael-grid.md\\:cols-1 { grid-template-columns: repeat(1, 1fr); }
                    .bael-grid.md\\:cols-2 { grid-template-columns: repeat(2, 1fr); }
                    .bael-grid.md\\:cols-3 { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 768px) {
                    .bael-grid.sm\\:cols-1 { grid-template-columns: repeat(1, 1fr); }
                    .bael-grid.sm\\:cols-2 { grid-template-columns: repeat(2, 1fr); }
                    .bael-grid.sm\\:gap-sm { gap: 8px; }
                }

                @media (max-width: 576px) {
                    .bael-grid.xs\\:cols-1 { grid-template-columns: repeat(1, 1fr); }
                    .bael-grid.xs\\:gap-xs { gap: 4px; }
                }

                /* Masonry layout */
                .bael-masonry {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    grid-auto-rows: 10px;
                }

                .bael-masonry-item {
                    margin-bottom: 16px;
                }

                /* Flex grid fallback */
                .bael-flexgrid {
                    display: flex;
                    flex-wrap: wrap;
                    margin: -8px;
                }

                .bael-flexgrid > * {
                    padding: 8px;
                    box-sizing: border-box;
                }

                .bael-flexgrid.cols-2 > * { width: 50%; }
                .bael-flexgrid.cols-3 > * { width: 33.333%; }
                .bael-flexgrid.cols-4 > * { width: 25%; }

                /* Stack layout (vertical flex) */
                .bael-stack {
                    display: flex;
                    flex-direction: column;
                }

                .bael-stack.gap-xs { gap: 4px; }
                .bael-stack.gap-sm { gap: 8px; }
                .bael-stack.gap-md { gap: 16px; }
                .bael-stack.gap-lg { gap: 24px; }
                .bael-stack.gap-xl { gap: 32px; }

                /* Row layout (horizontal flex) */
                .bael-row {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }

                .bael-row.wrap { flex-wrap: wrap; }
                .bael-row.gap-xs { gap: 4px; }
                .bael-row.gap-sm { gap: 8px; }
                .bael-row.gap-md { gap: 16px; }
                .bael-row.gap-lg { gap: 24px; }

                .bael-row.justify-start { justify-content: flex-start; }
                .bael-row.justify-center { justify-content: center; }
                .bael-row.justify-end { justify-content: flex-end; }
                .bael-row.justify-between { justify-content: space-between; }
                .bael-row.justify-around { justify-content: space-around; }
                .bael-row.justify-evenly { justify-content: space-evenly; }

                .bael-row.items-start { align-items: flex-start; }
                .bael-row.items-center { align-items: center; }
                .bael-row.items-end { align-items: flex-end; }
                .bael-row.items-stretch { align-items: stretch; }

                /* Spacer */
                .bael-spacer {
                    flex: 1;
                }

                /* Container with max-width */
                .bael-container {
                    width: 100%;
                    margin: 0 auto;
                    padding: 0 16px;
                }

                .bael-container.sm { max-width: 640px; }
                .bael-container.md { max-width: 768px; }
                .bael-container.lg { max-width: 1024px; }
                .bael-container.xl { max-width: 1280px; }
                .bael-container.2xl { max-width: 1536px; }
                .bael-container.fluid { max-width: none; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE GRID
    // ============================================================

    /**
     * Create grid container
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Grid container not found");
        return null;
      }

      const id = `bael-grid-${++this.idCounter}`;
      const config = {
        cols: null, // 1-12, 'auto-fit', 'auto-fill'
        minWidth: 250, // For auto-fit/auto-fill
        gap: "md", // xs, sm, md, lg, xl, 2xl
        rowGap: null,
        colGap: null,
        alignItems: null, // start, center, end, stretch
        justifyItems: null,
        alignContent: null,
        responsive: {}, // { md: 2, sm: 1 }
        type: "grid", // grid, stack, row, masonry, container
        ...options,
      };

      const el = document.createElement("div");
      el.id = id;

      // Apply classes based on type
      if (config.type === "stack") {
        el.className = "bael-stack";
      } else if (config.type === "row") {
        el.className = "bael-row";
      } else if (config.type === "masonry") {
        el.className = "bael-masonry";
      } else if (config.type === "container") {
        el.className = "bael-container";
      } else {
        el.className = "bael-grid";

        // Columns
        if (typeof config.cols === "number") {
          el.classList.add(`cols-${config.cols}`);
        } else if (config.cols === "auto-fit") {
          el.classList.add("auto-fit");
        } else if (config.cols === "auto-fill") {
          el.classList.add("auto-fill");
        }
      }

      // Gap
      if (config.gap) {
        el.classList.add(`gap-${config.gap}`);
      }
      if (config.rowGap) {
        el.classList.add(`row-gap-${config.rowGap}`);
      }
      if (config.colGap) {
        el.classList.add(`col-gap-${config.colGap}`);
      }

      // Alignment
      if (config.alignItems) {
        el.classList.add(`items-${config.alignItems}`);
      }
      if (config.justifyItems) {
        el.classList.add(`justify-${config.justifyItems}`);
      }
      if (config.alignContent) {
        el.classList.add(`content-${config.alignContent}`);
      }

      // Responsive
      Object.entries(config.responsive).forEach(([bp, cols]) => {
        el.classList.add(`${bp}\\:cols-${cols}`);
      });

      // Custom min-width for auto-fit/auto-fill
      if (
        (config.cols === "auto-fit" || config.cols === "auto-fill") &&
        config.minWidth !== 250
      ) {
        el.style.gridTemplateColumns = `repeat(${config.cols}, minmax(${config.minWidth}px, 1fr))`;
      }

      container.appendChild(el);

      return {
        id,
        element: el,
        addItem: (content, span) => this._addItem(el, content, span),
        destroy: () => el.remove(),
      };
    }

    /**
     * Add item to grid
     */
    _addItem(grid, content, options = {}) {
      const item = document.createElement("div");
      item.className = "bael-grid-item";

      if (options.colSpan) {
        item.classList.add(`span-${options.colSpan}`);
      }
      if (options.rowSpan) {
        item.classList.add(`row-span-${options.rowSpan}`);
      }

      if (typeof content === "string") {
        item.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        item.appendChild(content);
      }

      grid.appendChild(item);
      return item;
    }

    /**
     * Create stack (vertical flex)
     */
    stack(container, gap = "md") {
      return this.create(container, { type: "stack", gap });
    }

    /**
     * Create row (horizontal flex)
     */
    row(container, options = {}) {
      const el = this.create(container, { type: "row", ...options });
      if (options.wrap) el.element.classList.add("wrap");
      if (options.justify)
        el.element.classList.add(`justify-${options.justify}`);
      if (options.items) el.element.classList.add(`items-${options.items}`);
      return el;
    }

    /**
     * Create container with max-width
     */
    container(container, size = "lg") {
      const el = this.create(container, { type: "container" });
      if (size) el.element.classList.add(size);
      return el;
    }

    /**
     * Create spacer element
     */
    spacer() {
      const el = document.createElement("div");
      el.className = "bael-spacer";
      return el;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelGrid();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$grid = (container, options) => bael.create(container, options);
  window.$stack = (container, gap) => bael.stack(container, gap);
  window.$row = (container, options) => bael.row(container, options);
  window.$container = (container, size) => bael.container(container, size);
  window.$spacer = () => bael.spacer();

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelGrid = bael;

  console.log("📐 BAEL Grid loaded");
})();
