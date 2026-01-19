/**
 * BAEL Table Component - Lord Of All Tables
 *
 * Advanced data table with:
 * - Sorting
 * - Filtering
 * - Pagination
 * - Row selection
 * - Column resizing
 * - Fixed headers
 * - Virtual scrolling
 * - Export capabilities
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TABLE CLASS
  // ============================================================

  class BaelTable {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-table-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-table-styles";
      styles.textContent = `
                .bael-table-wrapper {
                    overflow: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                }

                .bael-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }

                .bael-table th,
                .bael-table td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-table th {
                    background: #f9fafb;
                    font-weight: 600;
                    color: #374151;
                    white-space: nowrap;
                    position: relative;
                }

                .bael-table td {
                    color: #4b5563;
                }

                .bael-table tbody tr:hover {
                    background: #f9fafb;
                }

                .bael-table tbody tr:last-child td {
                    border-bottom: none;
                }

                /* Sortable */
                .bael-table-sortable {
                    cursor: pointer;
                    user-select: none;
                }

                .bael-table-sortable:hover {
                    background: #f3f4f6;
                }

                .bael-table-sort-icon {
                    margin-left: 8px;
                    opacity: 0.4;
                }

                .bael-table-sortable:hover .bael-table-sort-icon {
                    opacity: 0.7;
                }

                .bael-table-sorted .bael-table-sort-icon {
                    opacity: 1;
                    color: #4f46e5;
                }

                /* Selectable */
                .bael-table-selectable tbody tr {
                    cursor: pointer;
                }

                .bael-table-row-selected {
                    background: #eef2ff !important;
                }

                .bael-table-checkbox {
                    width: 40px;
                    text-align: center;
                }

                /* Fixed header */
                .bael-table-fixed-header {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .bael-table-fixed-header thead th {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                /* Striped */
                .bael-table-striped tbody tr:nth-child(even) {
                    background: #f9fafb;
                }

                /* Compact */
                .bael-table-compact th,
                .bael-table-compact td {
                    padding: 8px 12px;
                }

                /* Bordered */
                .bael-table-bordered th,
                .bael-table-bordered td {
                    border: 1px solid #e5e7eb;
                }

                /* Responsive */
                .bael-table-responsive {
                    overflow-x: auto;
                }

                /* Toolbar */
                .bael-table-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    gap: 16px;
                }

                .bael-table-search {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    width: 250px;
                }

                .bael-table-search:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
                }

                .bael-table-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-table-btn {
                    padding: 8px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-table-btn:hover {
                    background: #f3f4f6;
                }

                /* Pagination */
                .bael-table-pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    font-size: 0.875rem;
                }

                .bael-table-page-info {
                    color: #6b7280;
                }

                .bael-table-page-controls {
                    display: flex;
                    gap: 4px;
                }

                .bael-table-page-btn {
                    padding: 6px 12px;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-table-page-btn:hover:not(:disabled) {
                    background: #f3f4f6;
                }

                .bael-table-page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bael-table-page-btn.active {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                }

                /* Empty state */
                .bael-table-empty {
                    text-align: center;
                    padding: 48px 16px;
                    color: #6b7280;
                }

                /* Loading */
                .bael-table-loading {
                    opacity: 0.6;
                    pointer-events: none;
                }

                /* Resize handle */
                .bael-table-resize-handle {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    cursor: col-resize;
                    background: transparent;
                }

                .bael-table-resize-handle:hover {
                    background: #4f46e5;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE TABLE
    // ============================================================

    /**
     * Create a data table
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Table container not found");
        return null;
      }

      const id = `bael-table-${++this.idCounter}`;
      const config = {
        columns: [],
        data: [],
        sortable: true,
        filterable: true,
        selectable: false,
        multiSelect: true,
        pagination: true,
        pageSize: 10,
        pageSizes: [10, 25, 50, 100],
        fixedHeader: false,
        maxHeight: 400,
        striped: true,
        compact: false,
        bordered: false,
        resizable: false,
        showToolbar: true,
        showPagination: true,
        emptyText: "No data available",
        searchPlaceholder: "Search...",
        onSelect: null,
        onSort: null,
        onFilter: null,
        onPageChange: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        currentPage: 1,
        sortColumn: null,
        sortDirection: "asc",
        searchTerm: "",
        selectedRows: new Set(),
        filteredData: [...config.data],
      };

      // Create structure
      this._createStructure(state);
      this._setupEvents(state);
      this._render(state);

      this.instances.set(id, state);

      return {
        id,
        setData: (data) => this.setData(id, data),
        getData: () => this.getData(id),
        getSelectedRows: () => this.getSelectedRows(id),
        selectAll: () => this.selectAll(id),
        deselectAll: () => this.deselectAll(id),
        sort: (column, direction) => this.sort(id, column, direction),
        filter: (term) => this.filter(id, term),
        goToPage: (page) => this.goToPage(id, page),
        refresh: () => this._render(state),
        exportCSV: () => this.exportCSV(id),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create table structure
     */
    _createStructure(state) {
      const { config, container } = state;

      const wrapper = document.createElement("div");
      wrapper.className = "bael-table-wrapper";
      wrapper.id = state.id;

      // Toolbar
      if (config.showToolbar && config.filterable) {
        const toolbar = document.createElement("div");
        toolbar.className = "bael-table-toolbar";

        if (config.filterable) {
          const search = document.createElement("input");
          search.type = "text";
          search.className = "bael-table-search";
          search.placeholder = config.searchPlaceholder;
          toolbar.appendChild(search);
          state.searchInput = search;
        }

        const actions = document.createElement("div");
        actions.className = "bael-table-actions";

        const exportBtn = document.createElement("button");
        exportBtn.className = "bael-table-btn";
        exportBtn.textContent = "Export CSV";
        exportBtn.onclick = () => this.exportCSV(state.id);
        actions.appendChild(exportBtn);

        toolbar.appendChild(actions);
        wrapper.appendChild(toolbar);
      }

      // Table container
      const tableContainer = document.createElement("div");
      tableContainer.className = "bael-table-container";

      if (config.fixedHeader) {
        tableContainer.classList.add("bael-table-fixed-header");
        tableContainer.style.maxHeight = `${config.maxHeight}px`;
      }

      const table = document.createElement("table");
      table.className = "bael-table";

      if (config.striped) table.classList.add("bael-table-striped");
      if (config.compact) table.classList.add("bael-table-compact");
      if (config.bordered) table.classList.add("bael-table-bordered");
      if (config.selectable) table.classList.add("bael-table-selectable");

      // Header
      const thead = document.createElement("thead");
      table.appendChild(thead);
      state.thead = thead;

      // Body
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      state.tbody = tbody;

      tableContainer.appendChild(table);
      wrapper.appendChild(tableContainer);
      state.table = table;

      // Pagination
      if (config.showPagination && config.pagination) {
        const pagination = document.createElement("div");
        pagination.className = "bael-table-pagination";
        wrapper.appendChild(pagination);
        state.pagination = pagination;
      }

      container.appendChild(wrapper);
      state.wrapper = wrapper;
    }

    /**
     * Setup events
     */
    _setupEvents(state) {
      const { config } = state;

      // Search
      if (state.searchInput) {
        let debounceTimer;
        state.searchInput.addEventListener("input", (e) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.filter(state.id, e.target.value);
          }, 300);
        });
      }
    }

    // ============================================================
    // RENDER
    // ============================================================

    /**
     * Render table
     */
    _render(state) {
      this._renderHeader(state);
      this._renderBody(state);
      this._renderPagination(state);
    }

    /**
     * Render header
     */
    _renderHeader(state) {
      const { config, thead } = state;
      thead.innerHTML = "";

      const tr = document.createElement("tr");

      // Selection checkbox
      if (config.selectable && config.multiSelect) {
        const th = document.createElement("th");
        th.className = "bael-table-checkbox";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.onchange = (e) => {
          if (e.target.checked) {
            this.selectAll(state.id);
          } else {
            this.deselectAll(state.id);
          }
        };

        th.appendChild(checkbox);
        tr.appendChild(th);
        state.selectAllCheckbox = checkbox;
      }

      // Columns
      config.columns.forEach((column) => {
        const th = document.createElement("th");
        th.textContent = column.label || column.key;

        if (config.sortable && column.sortable !== false) {
          th.classList.add("bael-table-sortable");

          const sortIcon = document.createElement("span");
          sortIcon.className = "bael-table-sort-icon";
          sortIcon.textContent = "↕";
          th.appendChild(sortIcon);

          if (state.sortColumn === column.key) {
            th.classList.add("bael-table-sorted");
            sortIcon.textContent = state.sortDirection === "asc" ? "↑" : "↓";
          }

          th.onclick = () => {
            const direction =
              state.sortColumn === column.key && state.sortDirection === "asc"
                ? "desc"
                : "asc";
            this.sort(state.id, column.key, direction);
          };
        }

        if (config.resizable) {
          const handle = document.createElement("div");
          handle.className = "bael-table-resize-handle";
          th.appendChild(handle);
        }

        if (column.width) {
          th.style.width = column.width;
        }

        tr.appendChild(th);
      });

      thead.appendChild(tr);
    }

    /**
     * Render body
     */
    _renderBody(state) {
      const { config, tbody, filteredData } = state;
      tbody.innerHTML = "";

      // Get page data
      const pageData = config.pagination
        ? this._getPageData(state)
        : filteredData;

      if (pageData.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = config.columns.length + (config.selectable ? 1 : 0);
        td.className = "bael-table-empty";
        td.textContent = config.emptyText;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }

      pageData.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        const actualIndex = config.pagination
          ? (state.currentPage - 1) * config.pageSize + rowIndex
          : rowIndex;

        // Selection checkbox
        if (config.selectable) {
          const td = document.createElement("td");
          td.className = "bael-table-checkbox";

          if (config.multiSelect) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = state.selectedRows.has(actualIndex);
            checkbox.onclick = (e) => e.stopPropagation();
            checkbox.onchange = () => {
              this._toggleRowSelection(state, actualIndex);
            };
            td.appendChild(checkbox);
          }

          tr.appendChild(td);
        }

        // Row selection
        if (config.selectable) {
          if (state.selectedRows.has(actualIndex)) {
            tr.classList.add("bael-table-row-selected");
          }

          tr.onclick = () => {
            if (!config.multiSelect) {
              state.selectedRows.clear();
            }
            this._toggleRowSelection(state, actualIndex);
          };
        }

        // Cells
        config.columns.forEach((column) => {
          const td = document.createElement("td");
          const value = row[column.key];

          if (column.render) {
            const rendered = column.render(value, row, actualIndex);
            if (rendered instanceof Element) {
              td.appendChild(rendered);
            } else {
              td.innerHTML = rendered;
            }
          } else {
            td.textContent = value ?? "";
          }

          if (column.align) {
            td.style.textAlign = column.align;
          }

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    /**
     * Render pagination
     */
    _renderPagination(state) {
      if (!state.pagination) return;

      const { config, filteredData, currentPage } = state;
      const totalPages = Math.ceil(filteredData.length / config.pageSize);
      const start = (currentPage - 1) * config.pageSize + 1;
      const end = Math.min(currentPage * config.pageSize, filteredData.length);

      state.pagination.innerHTML = "";

      // Info
      const info = document.createElement("div");
      info.className = "bael-table-page-info";
      info.textContent =
        filteredData.length > 0
          ? `Showing ${start} to ${end} of ${filteredData.length} entries`
          : "No entries";
      state.pagination.appendChild(info);

      // Controls
      const controls = document.createElement("div");
      controls.className = "bael-table-page-controls";

      // Previous
      const prevBtn = document.createElement("button");
      prevBtn.className = "bael-table-page-btn";
      prevBtn.textContent = "←";
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => this.goToPage(state.id, currentPage - 1);
      controls.appendChild(prevBtn);

      // Page buttons
      const maxButtons = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);

      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "bael-table-page-btn";
        pageBtn.textContent = i;
        if (i === currentPage) {
          pageBtn.classList.add("active");
        }
        pageBtn.onclick = () => this.goToPage(state.id, i);
        controls.appendChild(pageBtn);
      }

      // Next
      const nextBtn = document.createElement("button");
      nextBtn.className = "bael-table-page-btn";
      nextBtn.textContent = "→";
      nextBtn.disabled = currentPage === totalPages || totalPages === 0;
      nextBtn.onclick = () => this.goToPage(state.id, currentPage + 1);
      controls.appendChild(nextBtn);

      state.pagination.appendChild(controls);
    }

    /**
     * Get page data
     */
    _getPageData(state) {
      const { config, filteredData, currentPage } = state;
      const start = (currentPage - 1) * config.pageSize;
      const end = start + config.pageSize;
      return filteredData.slice(start, end);
    }

    // ============================================================
    // SORTING
    // ============================================================

    /**
     * Sort by column
     */
    sort(tableId, column, direction = "asc") {
      const state = this.instances.get(tableId);
      if (!state) return;

      state.sortColumn = column;
      state.sortDirection = direction;

      state.filteredData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });

      state.currentPage = 1;
      this._render(state);

      if (state.config.onSort) {
        state.config.onSort(column, direction);
      }
    }

    // ============================================================
    // FILTERING
    // ============================================================

    /**
     * Filter data
     */
    filter(tableId, term) {
      const state = this.instances.get(tableId);
      if (!state) return;

      state.searchTerm = term.toLowerCase();

      if (!term) {
        state.filteredData = [...state.config.data];
      } else {
        state.filteredData = state.config.data.filter((row) => {
          return state.config.columns.some((column) => {
            const value = row[column.key];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(state.searchTerm);
          });
        });
      }

      // Re-apply sorting
      if (state.sortColumn) {
        this.sort(tableId, state.sortColumn, state.sortDirection);
      } else {
        state.currentPage = 1;
        this._render(state);
      }

      if (state.config.onFilter) {
        state.config.onFilter(term, state.filteredData);
      }
    }

    // ============================================================
    // SELECTION
    // ============================================================

    /**
     * Toggle row selection
     */
    _toggleRowSelection(state, index) {
      if (state.selectedRows.has(index)) {
        state.selectedRows.delete(index);
      } else {
        state.selectedRows.add(index);
      }

      this._render(state);

      if (state.config.onSelect) {
        state.config.onSelect(this.getSelectedRows(state.id));
      }
    }

    /**
     * Select all rows
     */
    selectAll(tableId) {
      const state = this.instances.get(tableId);
      if (!state) return;

      state.filteredData.forEach((_, index) => {
        state.selectedRows.add(index);
      });

      this._render(state);

      if (state.config.onSelect) {
        state.config.onSelect(this.getSelectedRows(tableId));
      }
    }

    /**
     * Deselect all rows
     */
    deselectAll(tableId) {
      const state = this.instances.get(tableId);
      if (!state) return;

      state.selectedRows.clear();
      this._render(state);

      if (state.config.onSelect) {
        state.config.onSelect([]);
      }
    }

    /**
     * Get selected rows
     */
    getSelectedRows(tableId) {
      const state = this.instances.get(tableId);
      if (!state) return [];

      return Array.from(state.selectedRows).map(
        (index) => state.config.data[index],
      );
    }

    // ============================================================
    // PAGINATION
    // ============================================================

    /**
     * Go to page
     */
    goToPage(tableId, page) {
      const state = this.instances.get(tableId);
      if (!state) return;

      const totalPages = Math.ceil(
        state.filteredData.length / state.config.pageSize,
      );
      page = Math.max(1, Math.min(page, totalPages));

      state.currentPage = page;
      this._render(state);

      if (state.config.onPageChange) {
        state.config.onPageChange(page);
      }
    }

    // ============================================================
    // DATA
    // ============================================================

    /**
     * Set data
     */
    setData(tableId, data) {
      const state = this.instances.get(tableId);
      if (!state) return;

      state.config.data = data;
      state.filteredData = [...data];
      state.selectedRows.clear();
      state.currentPage = 1;

      if (state.sortColumn) {
        this.sort(tableId, state.sortColumn, state.sortDirection);
      } else {
        this._render(state);
      }
    }

    /**
     * Get data
     */
    getData(tableId) {
      const state = this.instances.get(tableId);
      return state ? state.config.data : [];
    }

    // ============================================================
    // EXPORT
    // ============================================================

    /**
     * Export to CSV
     */
    exportCSV(tableId, filename = "data.csv") {
      const state = this.instances.get(tableId);
      if (!state) return;

      const { config, filteredData } = state;

      // Headers
      const headers = config.columns.map((c) => c.label || c.key);
      const rows = [headers.join(",")];

      // Data rows
      filteredData.forEach((row) => {
        const values = config.columns.map((column) => {
          let value = row[column.key];
          if (value === null || value === undefined) value = "";
          // Escape quotes and wrap in quotes if contains comma
          value = String(value).replace(/"/g, '""');
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            value = `"${value}"`;
          }
          return value;
        });
        rows.push(values.join(","));
      });

      // Download
      const csv = rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy table
     */
    destroy(tableId) {
      const state = this.instances.get(tableId);
      if (!state) return;

      state.wrapper.remove();
      this.instances.delete(tableId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelTable();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$table = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTable = bael;

  console.log("📋 BAEL Table Component loaded");
})();
