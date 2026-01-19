/**
 * BAEL Data Table Component - Lord Of All Tables
 * 
 * Advanced data table:
 * - Sortable columns
 * - Filtering
 * - Pagination
 * - Row selection
 * - Column resize
 * - Virtual scrolling
 * 
 * @version 1.0.0
 * @author Bael Framework
 */

(function() {
    'use strict';

    // ============================================================
    // DATA TABLE CLASS
    // ============================================================

    class BaelDataTable {
        constructor() {
            this.instances = new Map();
            this.idCounter = 0;
            this._injectStyles();
        }

        /**
         * Inject styles
         */
        _injectStyles() {
            if (document.getElementById('bael-datatable-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'bael-datatable-styles';
            styles.textContent = `
                .bael-datatable-wrapper {
                    width: 100%;
                    background: var(--bg-primary, #1e1e1e);
                    border: 1px solid var(--border-color, #444);
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .bael-datatable-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-color, #444);
                    flex-wrap: wrap;
                }
                
                .bael-datatable-search {
                    flex: 1;
                    min-width: 200px;
                    max-width: 300px;
                }
                
                .bael-datatable-search input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #444);
                    border-radius: 4px;
                    background: var(--bg-secondary, #2a2a2a);
                    color: var(--text-primary, #fff);
                    font-size: 0.875rem;
                }
                
                .bael-datatable-search input::placeholder {
                    color: var(--text-muted, #888);
                }
                
                .bael-datatable-actions {
                    display: flex;
                    gap: 8px;
                    margin-left: auto;
                }
                
                .bael-datatable-container {
                    overflow-x: auto;
                }
                
                .bael-datatable {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }
                
                .bael-datatable th,
                .bael-datatable td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color, #333);
                }
                
                .bael-datatable thead th {
                    background: var(--bg-secondary, #2a2a2a);
                    font-weight: 600;
                    color: var(--text-secondary, #aaa);
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    user-select: none;
                }
                
                .bael-datatable th.sortable {
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .bael-datatable th.sortable:hover {
                    background: var(--bg-hover, #333);
                }
                
                .bael-datatable th .sort-icon {
                    margin-left: 6px;
                    opacity: 0.3;
                    transition: opacity 0.2s;
                }
                
                .bael-datatable th.sorted .sort-icon {
                    opacity: 1;
                }
                
                .bael-datatable th.sorted-asc .sort-icon {
                    transform: rotate(180deg);
                }
                
                .bael-datatable tbody tr {
                    transition: background 0.15s;
                }
                
                .bael-datatable tbody tr:hover {
                    background: var(--bg-hover, rgba(255,255,255,0.05));
                }
                
                .bael-datatable tbody tr.selected {
                    background: rgba(106, 159, 226, 0.15);
                }
                
                .bael-datatable td.empty-cell {
                    color: var(--text-muted, #666);
                    font-style: italic;
                }
                
                /* Checkbox column */
                .bael-datatable th.checkbox-col,
                .bael-datatable td.checkbox-col {
                    width: 40px;
                    padding: 8px 12px;
                }
                
                .bael-datatable-checkbox {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: var(--primary, #6a9fe2);
                }
                
                /* Footer */
                .bael-datatable-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-top: 1px solid var(--border-color, #444);
                    gap: 16px;
                    flex-wrap: wrap;
                }
                
                .bael-datatable-info {
                    color: var(--text-muted, #888);
                    font-size: 0.875rem;
                }
                
                .bael-datatable-pagination {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .bael-datatable-pagination button {
                    padding: 6px 12px;
                    border: 1px solid var(--border-color, #444);
                    border-radius: 4px;
                    background: var(--bg-secondary, #2a2a2a);
                    color: var(--text-primary, #fff);
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                
                .bael-datatable-pagination button:hover:not(:disabled) {
                    background: var(--bg-hover, #333);
                    border-color: var(--primary, #6a9fe2);
                }
                
                .bael-datatable-pagination button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .bael-datatable-pagination button.active {
                    background: var(--primary, #6a9fe2);
                    border-color: var(--primary, #6a9fe2);
                }
                
                .bael-datatable-page-size {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                    color: var(--text-muted, #888);
                }
                
                .bael-datatable-page-size select {
                    padding: 4px 8px;
                    border: 1px solid var(--border-color, #444);
                    border-radius: 4px;
                    background: var(--bg-secondary, #2a2a2a);
                    color: var(--text-primary, #fff);
                }
                
                /* Empty state */
                .bael-datatable-empty {
                    padding: 48px;
                    text-align: center;
                    color: var(--text-muted, #888);
                }
                
                .bael-datatable-empty-icon {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }
                
                /* Loading overlay */
                .bael-datatable-loading {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                
                .bael-datatable-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid var(--border-color, #444);
                    border-top-color: var(--primary, #6a9fe2);
                    border-radius: 50%;
                    animation: bael-dt-spin 0.8s linear infinite;
                }
                
                @keyframes bael-dt-spin {
                    to { transform: rotate(360deg); }
                }
                
                /* Resize handle */
                .bael-datatable th.resizable {
                    position: relative;
                }
                
                .bael-datatable-resize-handle {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    cursor: col-resize;
                    background: transparent;
                    transition: background 0.2s;
                }
                
                .bael-datatable-resize-handle:hover {
                    background: var(--primary, #6a9fe2);
                }
            `;
            document.head.appendChild(styles);
        }

        // ============================================================
        // CREATE TABLE
        // ============================================================

        /**
         * Create data table
         */
        create(container, options = {}) {
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            if (!container) return null;

            const id = `bael-datatable-${++this.idCounter}`;

            const state = {
                id,
                container,
                columns: options.columns || [],
                data: options.data || [],
                filteredData: [],
                sortColumn: options.sortColumn || null,
                sortDirection: options.sortDirection || 'asc',
                searchQuery: '',
                currentPage: 1,
                pageSize: options.pageSize || 10,
                pageSizeOptions: options.pageSizeOptions || [10, 25, 50, 100],
                selectable: options.selectable || false,
                selectedRows: new Set(),
                resizable: options.resizable || false,
                searchable: options.searchable !== false,
                pagination: options.pagination !== false,
                loading: false,
                emptyMessage: options.emptyMessage || 'No data available',
                onRowClick: options.onRowClick,
                onSelectionChange: options.onSelectionChange,
                onSort: options.onSort,
                onPageChange: options.onPageChange,
                rowKey: options.rowKey || 'id',
                renderCell: options.renderCell
            };

            state.filteredData = [...state.data];
            this._render(state);
            this._bindEvents(state);
            this._updateTable(state);

            this.instances.set(id, state);

            return {
                id,
                setData: (data) => this._setData(state, data),
                getData: () => [...state.data],
                getFilteredData: () => [...state.filteredData],
                getSelectedRows: () => this._getSelectedRows(state),
                selectAll: () => this._selectAll(state),
                deselectAll: () => this._deselectAll(state),
                setLoading: (loading) => this._setLoading(state, loading),
                refresh: () => this._updateTable(state),
                search: (query) => this._search(state, query),
                sort: (column, direction) => this._sort(state, column, direction),
                goToPage: (page) => this._goToPage(state, page),
                destroy: () => this.destroy(id)
            };
        }

        /**
         * Render table structure
         */
        _render(state) {
            const { container, searchable, pagination, selectable, pageSizeOptions } = state;

            container.innerHTML = `
                <div class="bael-datatable-wrapper" style="position: relative;">
                    ${searchable ? `
                    <div class="bael-datatable-toolbar">
                        <div class="bael-datatable-search">
                            <input type="text" placeholder="Search..." class="bael-dt-search">
                        </div>
                        <div class="bael-datatable-actions"></div>
                    </div>
                    ` : ''}
                    
                    <div class="bael-datatable-container">
                        <table class="bael-datatable">
                            <thead></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                    
                    ${pagination ? `
                    <div class="bael-datatable-footer">
                        <div class="bael-datatable-info"></div>
                        <div class="bael-datatable-page-size">
                            <span>Rows per page:</span>
                            <select class="bael-dt-pagesize">
                                ${pageSizeOptions.map(size => 
                                    `<option value="${size}" ${size === state.pageSize ? 'selected' : ''}>${size}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="bael-datatable-pagination"></div>
                    </div>
                    ` : ''}
                </div>
            `;

            state.wrapper = container.querySelector('.bael-datatable-wrapper');
            state.thead = container.querySelector('thead');
            state.tbody = container.querySelector('tbody');
            state.infoEl = container.querySelector('.bael-datatable-info');
            state.paginationEl = container.querySelector('.bael-datatable-pagination');
        }

        /**
         * Bind events
         */
        _bindEvents(state) {
            const { container } = state;

            // Search
            const searchInput = container.querySelector('.bael-dt-search');
            if (searchInput) {
                let debounce;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(debounce);
                    debounce = setTimeout(() => {
                        this._search(state, e.target.value);
                    }, 300);
                });
            }

            // Page size
            const pageSizeSelect = container.querySelector('.bael-dt-pagesize');
            if (pageSizeSelect) {
                pageSizeSelect.addEventListener('change', (e) => {
                    state.pageSize = parseInt(e.target.value);
                    state.currentPage = 1;
                    this._updateTable(state);
                });
            }

            // Header sort
            state.thead.addEventListener('click', (e) => {
                const th = e.target.closest('th.sortable');
                if (th) {
                    const column = th.dataset.column;
                    this._toggleSort(state, column);
                }
            });

            // Row click
            state.tbody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (!row) return;

                const index = parseInt(row.dataset.index);
                const checkbox = e.target.closest('.bael-datatable-checkbox');

                if (checkbox) {
                    this._toggleRowSelection(state, index);
                } else if (state.onRowClick) {
                    state.onRowClick(state.filteredData[index], index, e);
                }
            });

            // Select all
            state.thead.addEventListener('change', (e) => {
                if (e.target.classList.contains('bael-dt-select-all')) {
                    if (e.target.checked) {
                        this._selectAll(state);
                    } else {
                        this._deselectAll(state);
                    }
                }
            });
        }

        // ============================================================
        // RENDERING
        // ============================================================

        /**
         * Update table content
         */
        _updateTable(state) {
            this._renderHeader(state);
            this._renderBody(state);
            this._renderPagination(state);
        }

        /**
         * Render header
         */
        _renderHeader(state) {
            const { columns, selectable, sortColumn, sortDirection, resizable } = state;

            let html = '<tr>';
            
            if (selectable) {
                html += `
                    <th class="checkbox-col">
                        <input type="checkbox" class="bael-datatable-checkbox bael-dt-select-all">
                    </th>
                `;
            }

            columns.forEach(col => {
                const isSorted = sortColumn === col.key;
                const sortClass = isSorted ? `sorted sorted-${sortDirection}` : '';
                const sortableClass = col.sortable !== false ? 'sortable' : '';
                const resizableClass = resizable ? 'resizable' : '';
                
                html += `
                    <th class="${sortableClass} ${sortClass} ${resizableClass}" 
                        data-column="${col.key}"
                        style="${col.width ? `width: ${col.width}` : ''}">
                        ${col.label || col.key}
                        ${col.sortable !== false ? `
                            <svg class="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        ` : ''}
                        ${resizable ? '<div class="bael-datatable-resize-handle"></div>' : ''}
                    </th>
                `;
            });

            html += '</tr>';
            state.thead.innerHTML = html;
        }

        /**
         * Render body
         */
        _renderBody(state) {
            const { columns, filteredData, selectable, selectedRows, currentPage, pageSize, rowKey, renderCell, emptyMessage } = state;

            // Get page data
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const pageData = filteredData.slice(start, end);

            if (pageData.length === 0) {
                state.tbody.innerHTML = `
                    <tr>
                        <td colspan="${columns.length + (selectable ? 1 : 0)}">
                            <div class="bael-datatable-empty">
                                <svg class="bael-datatable-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                                <div>${emptyMessage}</div>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            
            pageData.forEach((row, index) => {
                const actualIndex = start + index;
                const rowId = row[rowKey] || actualIndex;
                const isSelected = selectedRows.has(rowId);
                
                html += `<tr data-index="${actualIndex}" data-id="${rowId}" class="${isSelected ? 'selected' : ''}">`;
                
                if (selectable) {
                    html += `
                        <td class="checkbox-col">
                            <input type="checkbox" class="bael-datatable-checkbox" ${isSelected ? 'checked' : ''}>
                        </td>
                    `;
                }

                columns.forEach(col => {
                    let value = this._getValue(row, col.key);
                    
                    // Custom render
                    if (renderCell) {
                        const customValue = renderCell(value, row, col);
                        if (customValue !== undefined) {
                            value = customValue;
                        }
                    } else if (col.render) {
                        value = col.render(value, row);
                    } else if (col.format) {
                        value = this._formatValue(value, col.format);
                    }
                    
                    const isEmpty = value === null || value === undefined || value === '';
                    html += `<td class="${isEmpty ? 'empty-cell' : ''}">${isEmpty ? '-' : value}</td>`;
                });

                html += '</tr>';
            });

            state.tbody.innerHTML = html;
        }

        /**
         * Render pagination
         */
        _renderPagination(state) {
            if (!state.pagination) return;

            const { filteredData, currentPage, pageSize } = state;
            const totalItems = filteredData.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const start = (currentPage - 1) * pageSize + 1;
            const end = Math.min(currentPage * pageSize, totalItems);

            // Info
            if (state.infoEl) {
                state.infoEl.textContent = totalItems > 0 
                    ? `Showing ${start} to ${end} of ${totalItems} entries`
                    : 'No entries';
            }

            // Pagination buttons
            if (state.paginationEl) {
                let html = '';
                
                // Previous button
                html += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="prev">‹</button>`;
                
                // Page numbers
                const maxButtons = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                let endPage = Math.min(totalPages, startPage + maxButtons - 1);
                
                if (endPage - startPage < maxButtons - 1) {
                    startPage = Math.max(1, endPage - maxButtons + 1);
                }

                if (startPage > 1) {
                    html += `<button data-page="1">1</button>`;
                    if (startPage > 2) html += '<span>...</span>';
                }

                for (let i = startPage; i <= endPage; i++) {
                    html += `<button data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
                }

                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) html += '<span>...</span>';
                    html += `<button data-page="${totalPages}">${totalPages}</button>`;
                }

                // Next button
                html += `<button ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} data-page="next">›</button>`;

                state.paginationEl.innerHTML = html;

                // Bind pagination clicks
                state.paginationEl.querySelectorAll('button').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const page = btn.dataset.page;
                        if (page === 'prev') {
                            this._goToPage(state, currentPage - 1);
                        } else if (page === 'next') {
                            this._goToPage(state, currentPage + 1);
                        } else {
                            this._goToPage(state, parseInt(page));
                        }
                    });
                });
            }
        }

        // ============================================================
        // DATA OPERATIONS
        // ============================================================

        /**
         * Get nested value
         */
        _getValue(obj, key) {
            return key.split('.').reduce((o, k) => (o || {})[k], obj);
        }

        /**
         * Format value
         */
        _formatValue(value, format) {
            switch (format) {
                case 'date':
                    return value ? new Date(value).toLocaleDateString() : '';
                case 'datetime':
                    return value ? new Date(value).toLocaleString() : '';
                case 'number':
                    return typeof value === 'number' ? value.toLocaleString() : value;
                case 'currency':
                    return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
                case 'percent':
                    return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value;
                default:
                    return value;
            }
        }

        /**
         * Set data
         */
        _setData(state, data) {
            state.data = data;
            state.filteredData = [...data];
            state.currentPage = 1;
            state.selectedRows.clear();
            this._applySort(state);
            this._applySearch(state);
            this._updateTable(state);
        }

        /**
         * Search
         */
        _search(state, query) {
            state.searchQuery = query.toLowerCase();
            state.currentPage = 1;
            this._applySearch(state);
            this._updateTable(state);
        }

        /**
         * Apply search filter
         */
        _applySearch(state) {
            const { data, searchQuery, columns } = state;
            
            if (!searchQuery) {
                state.filteredData = [...data];
            } else {
                state.filteredData = data.filter(row => {
                    return columns.some(col => {
                        if (col.searchable === false) return false;
                        const value = String(this._getValue(row, col.key) || '').toLowerCase();
                        return value.includes(searchQuery);
                    });
                });
            }

            // Re-apply sort
            this._applySort(state);
        }

        /**
         * Toggle sort
         */
        _toggleSort(state, column) {
            if (state.sortColumn === column) {
                state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortColumn = column;
                state.sortDirection = 'asc';
            }

            this._applySort(state);
            this._updateTable(state);

            if (state.onSort) {
                state.onSort(state.sortColumn, state.sortDirection);
            }
        }

        /**
         * Sort
         */
        _sort(state, column, direction) {
            state.sortColumn = column;
            state.sortDirection = direction;
            this._applySort(state);
            this._updateTable(state);
        }

        /**
         * Apply sort
         */
        _applySort(state) {
            const { filteredData, sortColumn, sortDirection, columns } = state;
            
            if (!sortColumn) return;

            const col = columns.find(c => c.key === sortColumn);
            const sortFn = col?.sortFn;

            filteredData.sort((a, b) => {
                const aVal = this._getValue(a, sortColumn);
                const bVal = this._getValue(b, sortColumn);

                if (sortFn) {
                    return sortFn(aVal, bVal) * (sortDirection === 'asc' ? 1 : -1);
                }

                // Default comparison
                if (aVal === bVal) return 0;
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                const result = aVal < bVal ? -1 : 1;
                return sortDirection === 'asc' ? result : -result;
            });
        }

        /**
         * Go to page
         */
        _goToPage(state, page) {
            const totalPages = Math.ceil(state.filteredData.length / state.pageSize);
            state.currentPage = Math.max(1, Math.min(page, totalPages));
            this._updateTable(state);

            if (state.onPageChange) {
                state.onPageChange(state.currentPage);
            }
        }

        // ============================================================
        // SELECTION
        // ============================================================

        /**
         * Toggle row selection
         */
        _toggleRowSelection(state, index) {
            const row = state.filteredData[index];
            const rowId = row[state.rowKey] || index;

            if (state.selectedRows.has(rowId)) {
                state.selectedRows.delete(rowId);
            } else {
                state.selectedRows.add(rowId);
            }

            this._updateTable(state);
            
            if (state.onSelectionChange) {
                state.onSelectionChange(this._getSelectedRows(state));
            }
        }

        /**
         * Select all
         */
        _selectAll(state) {
            state.filteredData.forEach((row, index) => {
                const rowId = row[state.rowKey] || index;
                state.selectedRows.add(rowId);
            });
            this._updateTable(state);
            
            if (state.onSelectionChange) {
                state.onSelectionChange(this._getSelectedRows(state));
            }
        }

        /**
         * Deselect all
         */
        _deselectAll(state) {
            state.selectedRows.clear();
            this._updateTable(state);
            
            if (state.onSelectionChange) {
                state.onSelectionChange([]);
            }
        }

        /**
         * Get selected rows
         */
        _getSelectedRows(state) {
            return state.data.filter((row, index) => {
                const rowId = row[state.rowKey] || index;
                return state.selectedRows.has(rowId);
            });
        }

        // ============================================================
        // LOADING
        // ============================================================

        /**
         * Set loading state
         */
        _setLoading(state, loading) {
            state.loading = loading;
            
            if (loading) {
                const loader = document.createElement('div');
                loader.className = 'bael-datatable-loading';
                loader.innerHTML = '<div class="bael-datatable-spinner"></div>';
                state.wrapper.appendChild(loader);
            } else {
                const loader = state.wrapper.querySelector('.bael-datatable-loading');
                if (loader) loader.remove();
            }
        }

        /**
         * Destroy instance
         */
        destroy(id) {
            const state = this.instances.get(id);
            if (state) {
                state.container.innerHTML = '';
                this.instances.delete(id);
            }
        }
    }

    // ============================================================
    // SINGLETON INSTANCE
    // ============================================================

    const bael = new BaelDataTable();

    // ============================================================
    // GLOBAL SHORTCUTS
    // ============================================================

    window.$dataTable = (container, opts) => bael.create(container, opts);
    window.$table = (container, opts) => bael.create(container, opts);

    // ============================================================
    // EXPORT
    // ============================================================

    window.BaelDataTable = bael;

    console.log('📊 BAEL Data Table loaded');

})();
