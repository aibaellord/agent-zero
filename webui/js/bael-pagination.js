/**
 * BAEL Pagination Component - Lord Of All Pages
 *
 * Pagination controls:
 * - Page numbers
 * - Previous/Next
 * - First/Last
 * - Page size selector
 * - Total count display
 * - Keyboard navigation
 * - Various styles
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // PAGINATION CLASS
  // ============================================================

  class BaelPagination {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-pagination-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-pagination-styles";
      styles.textContent = `
                .bael-pagination {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                }

                .bael-pagination-info {
                    color: #6b7280;
                    margin-right: 16px;
                }

                .bael-pagination-pages {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .bael-pagination-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 36px;
                    height: 36px;
                    padding: 0 12px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #374151;
                    transition: all 0.15s;
                }

                .bael-pagination-btn:hover:not(.disabled):not(.active) {
                    border-color: #4f46e5;
                    color: #4f46e5;
                    background: #eef2ff;
                }

                .bael-pagination-btn.active {
                    background: #4f46e5;
                    border-color: #4f46e5;
                    color: white;
                    font-weight: 500;
                }

                .bael-pagination-btn.disabled {
                    color: #d1d5db;
                    cursor: not-allowed;
                    background: #f9fafb;
                }

                .bael-pagination-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-pagination-ellipsis {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    color: #9ca3af;
                }

                .bael-pagination-size {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: 16px;
                }

                .bael-pagination-size-label {
                    color: #6b7280;
                }

                .bael-pagination-size-select {
                    padding: 6px 28px 6px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #374151;
                    background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 8px center;
                    cursor: pointer;
                    appearance: none;
                }

                .bael-pagination-size-select:focus {
                    outline: none;
                    border-color: #4f46e5;
                }

                /* Variants */
                .bael-pagination.minimal .bael-pagination-btn {
                    border: none;
                    background: none;
                    min-width: 32px;
                    height: 32px;
                    padding: 0 8px;
                }

                .bael-pagination.minimal .bael-pagination-btn.active {
                    background: #4f46e5;
                }

                .bael-pagination.rounded .bael-pagination-btn {
                    border-radius: 50%;
                    min-width: 36px;
                    padding: 0;
                }

                .bael-pagination.compact {
                    gap: 4px;
                    font-size: 12px;
                }

                .bael-pagination.compact .bael-pagination-btn {
                    min-width: 28px;
                    height: 28px;
                    padding: 0 8px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE PAGINATION
    // ============================================================

    /**
     * Create pagination
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Pagination container not found");
        return null;
      }

      const id = `bael-pagination-${++this.idCounter}`;
      const config = {
        totalItems: 0,
        pageSize: 10,
        currentPage: 1,
        maxPages: 7, // max visible page buttons
        showInfo: true,
        showFirst: true,
        showLast: true,
        showPrevNext: true,
        showPageSize: false,
        pageSizes: [10, 25, 50, 100],
        variant: "default", // default, minimal, rounded, compact
        onChange: null,
        onPageSizeChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-pagination${config.variant !== "default" ? " " + config.variant : ""}`;
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        currentPage: config.currentPage,
        pageSize: config.pageSize,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getCurrentPage: () => state.currentPage,
        getPageSize: () => state.pageSize,
        setPage: (page) => this.setPage(id, page),
        setTotalItems: (total) => this.setTotalItems(id, total),
        setPageSize: (size) => this.setPageSize(id, size),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Calculate total pages
     */
    _getTotalPages(state) {
      return Math.ceil(state.config.totalItems / state.pageSize);
    }

    /**
     * Generate page range
     */
    _getPageRange(state) {
      const total = this._getTotalPages(state);
      const current = state.currentPage;
      const max = state.config.maxPages;

      if (total <= max) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const pages = [];
      const half = Math.floor((max - 3) / 2);
      let start = Math.max(2, current - half);
      let end = Math.min(total - 1, current + half);

      // Adjust if near start or end
      if (current <= half + 2) {
        end = max - 2;
      } else if (current >= total - half - 1) {
        start = total - max + 3;
      }

      // First page
      pages.push(1);

      // Ellipsis before
      if (start > 2) {
        pages.push("...");
      }

      // Middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Ellipsis after
      if (end < total - 1) {
        pages.push("...");
      }

      // Last page
      if (total > 1) {
        pages.push(total);
      }

      return pages;
    }

    /**
     * Render pagination
     */
    _render(state) {
      const { element, config } = state;
      const totalPages = this._getTotalPages(state);

      element.innerHTML = "";

      // Info
      if (config.showInfo && config.totalItems > 0) {
        const start = (state.currentPage - 1) * state.pageSize + 1;
        const end = Math.min(
          state.currentPage * state.pageSize,
          config.totalItems,
        );

        const info = document.createElement("span");
        info.className = "bael-pagination-info";
        info.textContent = `${start}-${end} of ${config.totalItems}`;
        element.appendChild(info);
      }

      // Pages container
      const pages = document.createElement("div");
      pages.className = "bael-pagination-pages";

      // First button
      if (config.showFirst) {
        const firstBtn = this._createButton(
          state,
          "⟨⟨",
          1,
          state.currentPage === 1,
        );
        firstBtn.title = "First page";
        pages.appendChild(firstBtn);
      }

      // Previous button
      if (config.showPrevNext) {
        const prevBtn = this._createButton(
          state,
          "⟨",
          state.currentPage - 1,
          state.currentPage === 1,
        );
        prevBtn.title = "Previous page";
        pages.appendChild(prevBtn);
      }

      // Page numbers
      const pageRange = this._getPageRange(state);
      pageRange.forEach((page) => {
        if (page === "...") {
          const ellipsis = document.createElement("span");
          ellipsis.className = "bael-pagination-ellipsis";
          ellipsis.textContent = "...";
          pages.appendChild(ellipsis);
        } else {
          const pageBtn = this._createButton(
            state,
            page,
            page,
            false,
            page === state.currentPage,
          );
          pages.appendChild(pageBtn);
        }
      });

      // Next button
      if (config.showPrevNext) {
        const nextBtn = this._createButton(
          state,
          "⟩",
          state.currentPage + 1,
          state.currentPage === totalPages,
        );
        nextBtn.title = "Next page";
        pages.appendChild(nextBtn);
      }

      // Last button
      if (config.showLast) {
        const lastBtn = this._createButton(
          state,
          "⟩⟩",
          totalPages,
          state.currentPage === totalPages,
        );
        lastBtn.title = "Last page";
        pages.appendChild(lastBtn);
      }

      element.appendChild(pages);

      // Page size selector
      if (config.showPageSize) {
        const sizeContainer = document.createElement("div");
        sizeContainer.className = "bael-pagination-size";

        const label = document.createElement("span");
        label.className = "bael-pagination-size-label";
        label.textContent = "per page";
        sizeContainer.appendChild(label);

        const select = document.createElement("select");
        select.className = "bael-pagination-size-select";

        config.pageSizes.forEach((size) => {
          const option = document.createElement("option");
          option.value = size;
          option.textContent = size;
          option.selected = size === state.pageSize;
          select.appendChild(option);
        });

        select.addEventListener("change", () => {
          this.setPageSize(state.id, parseInt(select.value, 10));
        });

        sizeContainer.appendChild(select);
        element.appendChild(sizeContainer);
      }
    }

    /**
     * Create button
     */
    _createButton(
      state,
      content,
      targetPage,
      disabled = false,
      active = false,
    ) {
      const btn = document.createElement("button");
      btn.className = "bael-pagination-btn";
      btn.type = "button";
      btn.textContent = content;

      if (disabled) btn.classList.add("disabled");
      if (active) btn.classList.add("active");

      if (!disabled && !active) {
        btn.addEventListener("click", () => {
          this.setPage(state.id, targetPage);
        });
      }

      return btn;
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Set current page
     */
    setPage(paginationId, page) {
      const state = this.instances.get(paginationId);
      if (!state) return;

      const totalPages = this._getTotalPages(state);
      const newPage = Math.max(1, Math.min(page, totalPages));

      if (newPage !== state.currentPage) {
        state.currentPage = newPage;
        this._render(state);

        if (state.config.onChange) {
          state.config.onChange(newPage, state.pageSize);
        }
      }
    }

    /**
     * Set total items
     */
    setTotalItems(paginationId, total) {
      const state = this.instances.get(paginationId);
      if (!state) return;

      state.config.totalItems = total;

      // Adjust current page if needed
      const totalPages = this._getTotalPages(state);
      if (state.currentPage > totalPages) {
        state.currentPage = Math.max(1, totalPages);
      }

      this._render(state);
    }

    /**
     * Set page size
     */
    setPageSize(paginationId, size) {
      const state = this.instances.get(paginationId);
      if (!state) return;

      if (size !== state.pageSize) {
        state.pageSize = size;
        state.currentPage = 1; // Reset to first page
        this._render(state);

        if (state.config.onPageSizeChange) {
          state.config.onPageSizeChange(size);
        }
        if (state.config.onChange) {
          state.config.onChange(state.currentPage, size);
        }
      }
    }

    /**
     * Destroy pagination
     */
    destroy(paginationId) {
      const state = this.instances.get(paginationId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(paginationId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelPagination();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$pagination = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelPagination = bael;

  console.log("📄 BAEL Pagination Component loaded");
})();
