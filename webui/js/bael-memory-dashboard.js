/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███╗   ███╗███████╗███╗   ███╗ ██████╗ ██████╗ ██╗   ██╗                █
 * █  ████╗ ████║██╔════╝████╗ ████║██╔═══██╗██╔══██╗╚██╗ ██╔╝                █
 * █  ██╔████╔██║█████╗  ██╔████╔██║██║   ██║██████╔╝ ╚████╔╝                 █
 * █  ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██║   ██║██╔══██╗  ╚██╔╝                  █
 * █  ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║╚██████╔╝██║  ██║   ██║                   █
 * █  ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝                   █
 * █                                                                          █
 * █   BAEL MEMORY DASHBOARD - Visual Knowledge Graph & Memory Management    █
 * █   Search, visualize, manage, and optimize your knowledge base           █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // BAEL MEMORY DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  class BaelMemoryDashboard {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // State
      this.memories = [];
      this.searchResults = [];
      this.selectedIds = new Set();
      this.filters = {
        type: "all",
        dateRange: "all",
        query: "",
      };
      this.stats = {
        total: 0,
        fragments: 0,
        solutions: 0,
        knowledge: 0,
        sizeBytes: 0,
      };

      // Graph visualization
      this.graphNodes = [];
      this.graphEdges = [];
      this.graphLayout = "force";

      // Pagination
      this.page = 1;
      this.pageSize = 50;
      this.totalPages = 1;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    async initialize() {
      console.log("🧠 Bael Memory Dashboard initializing...");

      // Create container
      this.createContainer();

      // Load initial data
      await this.loadStats();

      // Setup keyboard shortcuts
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL MEMORY DASHBOARD READY");

      return this;
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-memory-dashboard";
      this.container.className = "bael-dashboard bael-memory-dashboard";
      this.container.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                background: var(--bg-primary, #0a0a0f);
                color: var(--text-primary, #e0e0e0);
                font-family: var(--font-family, system-ui, -apple-system, sans-serif);
                overflow: hidden;
            `;

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);

      // Bind events
      this.bindEvents();
    }

    getTemplate() {
      return `
                <div class="dashboard-header">
                    <div class="header-left">
                        <h1>🧠 Memory Dashboard</h1>
                        <div class="stats-bar">
                            <span class="stat" data-stat="total">
                                <span class="stat-value">0</span>
                                <span class="stat-label">Total</span>
                            </span>
                            <span class="stat" data-stat="fragments">
                                <span class="stat-value">0</span>
                                <span class="stat-label">Fragments</span>
                            </span>
                            <span class="stat" data-stat="solutions">
                                <span class="stat-value">0</span>
                                <span class="stat-label">Solutions</span>
                            </span>
                            <span class="stat" data-stat="knowledge">
                                <span class="stat-value">0</span>
                                <span class="stat-label">Knowledge</span>
                            </span>
                            <span class="stat" data-stat="size">
                                <span class="stat-value">0 KB</span>
                                <span class="stat-label">Size</span>
                            </span>
                        </div>
                    </div>
                    <div class="header-right">
                        <button class="btn btn-icon" id="memory-refresh" title="Refresh">
                            🔄
                        </button>
                        <button class="btn btn-icon" id="memory-import" title="Import Knowledge">
                            📥
                        </button>
                        <button class="btn btn-icon" id="memory-reindex" title="Reindex">
                            ⚡
                        </button>
                        <button class="btn btn-icon btn-close" id="memory-close" title="Close">
                            ✕
                        </button>
                    </div>
                </div>

                <div class="dashboard-toolbar">
                    <div class="search-box">
                        <input type="text" id="memory-search" placeholder="Search memories..." />
                        <button class="btn btn-search" id="memory-search-btn">🔍</button>
                    </div>
                    <div class="filters">
                        <select id="memory-type-filter">
                            <option value="all">All Types</option>
                            <option value="fragment">Fragments</option>
                            <option value="solution">Solutions</option>
                            <option value="knowledge">Knowledge</option>
                        </select>
                        <select id="memory-date-filter">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    <div class="view-toggle">
                        <button class="btn btn-view active" data-view="list" title="List View">
                            📋
                        </button>
                        <button class="btn btn-view" data-view="graph" title="Graph View">
                            🕸️
                        </button>
                        <button class="btn btn-view" data-view="timeline" title="Timeline View">
                            📅
                        </button>
                    </div>
                    <div class="bulk-actions" style="display: none;">
                        <span class="selected-count">0 selected</span>
                        <button class="btn btn-danger" id="memory-delete-selected">
                            🗑️ Delete Selected
                        </button>
                        <button class="btn" id="memory-export-selected">
                            📤 Export
                        </button>
                    </div>
                </div>

                <div class="dashboard-content">
                    <div class="view-container active" data-view="list">
                        <div class="memory-list" id="memory-list">
                            <!-- Memory items will be inserted here -->
                        </div>
                        <div class="pagination" id="memory-pagination">
                            <button class="btn" id="page-prev">← Prev</button>
                            <span class="page-info">Page 1 of 1</span>
                            <button class="btn" id="page-next">Next →</button>
                        </div>
                    </div>

                    <div class="view-container" data-view="graph">
                        <div class="graph-container" id="memory-graph">
                            <canvas id="graph-canvas"></canvas>
                        </div>
                        <div class="graph-controls">
                            <button class="btn" id="graph-zoom-in">+</button>
                            <button class="btn" id="graph-zoom-out">-</button>
                            <button class="btn" id="graph-reset">⟲</button>
                            <select id="graph-layout">
                                <option value="force">Force Layout</option>
                                <option value="radial">Radial Layout</option>
                                <option value="tree">Tree Layout</option>
                            </select>
                        </div>
                    </div>

                    <div class="view-container" data-view="timeline">
                        <div class="timeline-container" id="memory-timeline">
                            <!-- Timeline will be rendered here -->
                        </div>
                    </div>
                </div>

                <div class="detail-panel" id="memory-detail" style="display: none;">
                    <div class="detail-header">
                        <h3>Memory Details</h3>
                        <button class="btn btn-icon" id="detail-close">✕</button>
                    </div>
                    <div class="detail-content">
                        <!-- Detail content will be inserted here -->
                    </div>
                </div>

                <style>
                    .bael-memory-dashboard {
                        display: flex;
                        flex-direction: column;
                    }

                    .dashboard-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px 24px;
                        background: var(--bg-secondary, #12121a);
                        border-bottom: 1px solid var(--border-color, #2a2a3a);
                    }

                    .dashboard-header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }

                    .stats-bar {
                        display: flex;
                        gap: 24px;
                        margin-left: 32px;
                    }

                    .stat {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .stat-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: var(--accent-color, #6366f1);
                    }

                    .stat-label {
                        font-size: 11px;
                        text-transform: uppercase;
                        opacity: 0.7;
                    }

                    .header-right {
                        display: flex;
                        gap: 8px;
                    }

                    .btn {
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        background: var(--bg-tertiary, #1a1a2e);
                        color: var(--text-primary, #e0e0e0);
                        transition: all 0.2s;
                    }

                    .btn:hover {
                        background: var(--bg-hover, #252538);
                    }

                    .btn-icon {
                        padding: 8px;
                        font-size: 18px;
                    }

                    .btn-close:hover {
                        background: var(--danger-color, #ef4444);
                    }

                    .btn-danger {
                        background: var(--danger-color, #ef4444);
                    }

                    .btn-danger:hover {
                        background: #dc2626;
                    }

                    .dashboard-toolbar {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        padding: 12px 24px;
                        background: var(--bg-secondary, #12121a);
                        border-bottom: 1px solid var(--border-color, #2a2a3a);
                    }

                    .search-box {
                        display: flex;
                        flex: 1;
                        max-width: 400px;
                    }

                    .search-box input {
                        flex: 1;
                        padding: 10px 16px;
                        border: 1px solid var(--border-color, #2a2a3a);
                        border-radius: 6px 0 0 6px;
                        background: var(--bg-primary, #0a0a0f);
                        color: var(--text-primary, #e0e0e0);
                        font-size: 14px;
                    }

                    .search-box input:focus {
                        outline: none;
                        border-color: var(--accent-color, #6366f1);
                    }

                    .btn-search {
                        border-radius: 0 6px 6px 0;
                    }

                    .filters {
                        display: flex;
                        gap: 8px;
                    }

                    .filters select {
                        padding: 10px 12px;
                        border: 1px solid var(--border-color, #2a2a3a);
                        border-radius: 6px;
                        background: var(--bg-primary, #0a0a0f);
                        color: var(--text-primary, #e0e0e0);
                        font-size: 14px;
                        cursor: pointer;
                    }

                    .view-toggle {
                        display: flex;
                        gap: 4px;
                        margin-left: auto;
                    }

                    .btn-view {
                        padding: 8px 12px;
                        opacity: 0.6;
                    }

                    .btn-view.active {
                        opacity: 1;
                        background: var(--accent-color, #6366f1);
                    }

                    .bulk-actions {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-left: 16px;
                        padding-left: 16px;
                        border-left: 1px solid var(--border-color, #2a2a3a);
                    }

                    .selected-count {
                        font-size: 13px;
                        opacity: 0.8;
                    }

                    .dashboard-content {
                        flex: 1;
                        overflow: hidden;
                        position: relative;
                    }

                    .view-container {
                        display: none;
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        overflow: auto;
                    }

                    .view-container.active {
                        display: flex;
                        flex-direction: column;
                    }

                    .memory-list {
                        flex: 1;
                        padding: 16px 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        overflow-y: auto;
                    }

                    .memory-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                        padding: 16px;
                        background: var(--bg-secondary, #12121a);
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .memory-item:hover {
                        background: var(--bg-tertiary, #1a1a2e);
                    }

                    .memory-item.selected {
                        border: 1px solid var(--accent-color, #6366f1);
                    }

                    .memory-checkbox {
                        margin-top: 4px;
                    }

                    .memory-icon {
                        font-size: 24px;
                        margin-top: 2px;
                    }

                    .memory-content {
                        flex: 1;
                        min-width: 0;
                    }

                    .memory-title {
                        font-weight: 600;
                        margin-bottom: 4px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .memory-preview {
                        font-size: 13px;
                        opacity: 0.7;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .memory-meta {
                        display: flex;
                        gap: 16px;
                        margin-top: 8px;
                        font-size: 12px;
                        opacity: 0.5;
                    }

                    .memory-type {
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        text-transform: uppercase;
                        background: var(--bg-tertiary, #1a1a2e);
                    }

                    .memory-type.fragment { color: #60a5fa; }
                    .memory-type.solution { color: #34d399; }
                    .memory-type.knowledge { color: #fbbf24; }

                    .pagination {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 16px;
                        padding: 16px;
                        border-top: 1px solid var(--border-color, #2a2a3a);
                    }

                    .page-info {
                        font-size: 14px;
                        opacity: 0.7;
                    }

                    .graph-container {
                        flex: 1;
                        position: relative;
                    }

                    #graph-canvas {
                        width: 100%;
                        height: 100%;
                    }

                    .graph-controls {
                        position: absolute;
                        bottom: 16px;
                        right: 16px;
                        display: flex;
                        gap: 8px;
                    }

                    .timeline-container {
                        flex: 1;
                        padding: 24px;
                        overflow-y: auto;
                    }

                    .timeline-day {
                        margin-bottom: 24px;
                    }

                    .timeline-date {
                        font-size: 14px;
                        font-weight: 600;
                        margin-bottom: 12px;
                        color: var(--accent-color, #6366f1);
                    }

                    .timeline-items {
                        border-left: 2px solid var(--border-color, #2a2a3a);
                        padding-left: 24px;
                        margin-left: 8px;
                    }

                    .timeline-item {
                        position: relative;
                        padding: 12px 16px;
                        background: var(--bg-secondary, #12121a);
                        border-radius: 8px;
                        margin-bottom: 8px;
                    }

                    .timeline-item::before {
                        content: '';
                        position: absolute;
                        left: -29px;
                        top: 16px;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: var(--accent-color, #6366f1);
                    }

                    .detail-panel {
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 400px;
                        height: 100%;
                        background: var(--bg-secondary, #12121a);
                        border-left: 1px solid var(--border-color, #2a2a3a);
                        display: flex;
                        flex-direction: column;
                        z-index: 10;
                    }

                    .detail-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px;
                        border-bottom: 1px solid var(--border-color, #2a2a3a);
                    }

                    .detail-header h3 {
                        margin: 0;
                    }

                    .detail-content {
                        flex: 1;
                        padding: 16px;
                        overflow-y: auto;
                    }

                    .empty-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        opacity: 0.5;
                    }

                    .empty-state-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                </style>
            `;
    }

    bindEvents() {
      // Close button
      this.container
        .querySelector("#memory-close")
        .addEventListener("click", () => this.hide());

      // Refresh
      this.container
        .querySelector("#memory-refresh")
        .addEventListener("click", () => this.refresh());

      // Import
      this.container
        .querySelector("#memory-import")
        .addEventListener("click", () => this.openImportDialog());

      // Reindex
      this.container
        .querySelector("#memory-reindex")
        .addEventListener("click", () => this.reindex());

      // Search
      const searchInput = this.container.querySelector("#memory-search");
      const searchBtn = this.container.querySelector("#memory-search-btn");

      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.search(searchInput.value);
      });
      searchBtn.addEventListener("click", () => this.search(searchInput.value));

      // Filters
      this.container
        .querySelector("#memory-type-filter")
        .addEventListener("change", (e) => {
          this.filters.type = e.target.value;
          this.refresh();
        });

      this.container
        .querySelector("#memory-date-filter")
        .addEventListener("change", (e) => {
          this.filters.dateRange = e.target.value;
          this.refresh();
        });

      // View toggle
      this.container.querySelectorAll(".btn-view").forEach((btn) => {
        btn.addEventListener("click", () => this.switchView(btn.dataset.view));
      });

      // Pagination
      this.container
        .querySelector("#page-prev")
        .addEventListener("click", () => this.prevPage());
      this.container
        .querySelector("#page-next")
        .addEventListener("click", () => this.nextPage());

      // Delete selected
      this.container
        .querySelector("#memory-delete-selected")
        .addEventListener("click", () => this.deleteSelected());

      // Detail panel close
      this.container
        .querySelector("#detail-close")
        .addEventListener("click", () => this.closeDetail());
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (!this.visible) return;

        if (e.key === "Escape") {
          this.hide();
        } else if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.container.querySelector("#memory-search").focus();
        } else if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.selectAll();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DATA LOADING
    // ═══════════════════════════════════════════════════════════════════════

    async loadStats() {
      if (!window.BaelMemory) return;

      try {
        const result = await window.BaelMemory.dashboard();
        if (result && !result.error) {
          this.stats = {
            total: result.total || 0,
            fragments: result.fragments || 0,
            solutions: result.solutions || 0,
            knowledge: result.knowledge || 0,
            sizeBytes: result.size_bytes || 0,
          };
          this.updateStatsUI();
        }
      } catch (error) {
        console.error("Failed to load memory stats:", error);
      }
    }

    async search(query) {
      if (!window.BaelMemory) return;

      this.filters.query = query;

      try {
        const result = await window.BaelMemory.search(query, {
          type: this.filters.type !== "all" ? this.filters.type : undefined,
          limit: this.pageSize,
          offset: (this.page - 1) * this.pageSize,
        });

        if (result && !result.error) {
          this.memories = result.results || [];
          this.totalPages = Math.ceil((result.total || 0) / this.pageSize);
          this.renderList();
        }
      } catch (error) {
        console.error("Search failed:", error);
      }
    }

    async refresh() {
      await this.loadStats();
      await this.search(this.filters.query);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UI UPDATES
    // ═══════════════════════════════════════════════════════════════════════

    updateStatsUI() {
      const updateStat = (name, value) => {
        const el = this.container.querySelector(
          `[data-stat="${name}"] .stat-value`,
        );
        if (el) el.textContent = value;
      };

      updateStat("total", this.stats.total.toLocaleString());
      updateStat("fragments", this.stats.fragments.toLocaleString());
      updateStat("solutions", this.stats.solutions.toLocaleString());
      updateStat("knowledge", this.stats.knowledge.toLocaleString());
      updateStat("size", this.formatBytes(this.stats.sizeBytes));
    }

    formatBytes(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    renderList() {
      const listEl = this.container.querySelector("#memory-list");

      if (this.memories.length === 0) {
        listEl.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🧠</div>
                        <div>No memories found</div>
                    </div>
                `;
        return;
      }

      listEl.innerHTML = this.memories
        .map(
          (memory) => `
                <div class="memory-item ${this.selectedIds.has(memory.id) ? "selected" : ""}"
                     data-id="${memory.id}">
                    <input type="checkbox" class="memory-checkbox"
                           ${this.selectedIds.has(memory.id) ? "checked" : ""}>
                    <div class="memory-icon">${this.getTypeIcon(memory.type)}</div>
                    <div class="memory-content">
                        <div class="memory-title">${this.escapeHtml(memory.title || memory.id)}</div>
                        <div class="memory-preview">${this.escapeHtml(memory.content?.substring(0, 200) || "")}</div>
                        <div class="memory-meta">
                            <span class="memory-type ${memory.type}">${memory.type}</span>
                            <span>${this.formatDate(memory.timestamp)}</span>
                            ${memory.similarity ? `<span>Similarity: ${(memory.similarity * 100).toFixed(1)}%</span>` : ""}
                        </div>
                    </div>
                </div>
            `,
        )
        .join("");

      // Bind click events
      listEl.querySelectorAll(".memory-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (e.target.classList.contains("memory-checkbox")) {
            this.toggleSelection(item.dataset.id);
          } else {
            this.showDetail(item.dataset.id);
          }
        });
      });

      // Update pagination
      const pageInfo = this.container.querySelector(".page-info");
      pageInfo.textContent = `Page ${this.page} of ${this.totalPages}`;
    }

    getTypeIcon(type) {
      const icons = {
        fragment: "🧩",
        solution: "💡",
        knowledge: "📚",
      };
      return icons[type] || "📝";
    }

    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SELECTION & ACTIONS
    // ═══════════════════════════════════════════════════════════════════════

    toggleSelection(id) {
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
      this.updateBulkActions();
      this.renderList();
    }

    selectAll() {
      if (this.selectedIds.size === this.memories.length) {
        this.selectedIds.clear();
      } else {
        this.memories.forEach((m) => this.selectedIds.add(m.id));
      }
      this.updateBulkActions();
      this.renderList();
    }

    updateBulkActions() {
      const bulkActions = this.container.querySelector(".bulk-actions");
      const countEl = this.container.querySelector(".selected-count");

      if (this.selectedIds.size > 0) {
        bulkActions.style.display = "flex";
        countEl.textContent = `${this.selectedIds.size} selected`;
      } else {
        bulkActions.style.display = "none";
      }
    }

    async deleteSelected() {
      if (this.selectedIds.size === 0) return;

      const confirmed = confirm(
        `Delete ${this.selectedIds.size} selected memories?`,
      );
      if (!confirmed) return;

      try {
        await window.BaelMemory?.delete(Array.from(this.selectedIds));
        this.selectedIds.clear();
        await this.refresh();
        window.BaelNotify?.success("Memories deleted successfully");
      } catch (error) {
        console.error("Delete failed:", error);
        window.BaelNotify?.error("Failed to delete memories");
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════════════════

    switchView(view) {
      // Update buttons
      this.container.querySelectorAll(".btn-view").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === view);
      });

      // Update containers
      this.container
        .querySelectorAll(".view-container")
        .forEach((container) => {
          container.classList.toggle("active", container.dataset.view === view);
        });

      // Initialize view-specific content
      if (view === "graph") {
        this.renderGraph();
      } else if (view === "timeline") {
        this.renderTimeline();
      }
    }

    renderGraph() {
      // Integrate with BaelOmniscient if available
      if (window.BaelOmniscient?.graphEngine) {
        const graphData = window.BaelOmniscient.graphEngine.getGraphData?.();
        if (graphData) {
          this.graphNodes = graphData.nodes || [];
          this.graphEdges = graphData.edges || [];
        }
      }

      // Simple canvas-based graph rendering
      const canvas = this.container.querySelector("#graph-canvas");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw placeholder if no data
      if (this.graphNodes.length === 0) {
        ctx.fillStyle = "#666";
        ctx.font = "16px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(
          "Knowledge graph visualization",
          canvas.width / 2,
          canvas.height / 2,
        );
        ctx.fillText(
          "Connect memories to build relationships",
          canvas.width / 2,
          canvas.height / 2 + 24,
        );
        return;
      }

      // Draw edges
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 1;
      this.graphEdges.forEach((edge) => {
        const from = this.graphNodes.find((n) => n.id === edge.from);
        const to = this.graphNodes.find((n) => n.id === edge.to);
        if (from && to) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      this.graphNodes.forEach((node) => {
        ctx.fillStyle = "#6366f1";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e0e0e0";
        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(node.label || node.id, node.x, node.y + 20);
      });
    }

    renderTimeline() {
      const container = this.container.querySelector("#memory-timeline");

      // Group memories by date
      const grouped = {};
      this.memories.forEach((memory) => {
        const date = new Date(memory.timestamp).toLocaleDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(memory);
      });

      if (Object.keys(grouped).length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📅</div>
                        <div>No timeline data available</div>
                    </div>
                `;
        return;
      }

      container.innerHTML = Object.entries(grouped)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(
          ([date, memories]) => `
                    <div class="timeline-day">
                        <div class="timeline-date">${date}</div>
                        <div class="timeline-items">
                            ${memories
                              .map(
                                (memory) => `
                                <div class="timeline-item" data-id="${memory.id}">
                                    <div class="memory-title">
                                        ${this.getTypeIcon(memory.type)}
                                        ${this.escapeHtml(memory.title || memory.id)}
                                    </div>
                                    <div class="memory-preview">${this.escapeHtml(memory.content?.substring(0, 100) || "")}</div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `,
        )
        .join("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DETAIL PANEL
    // ═══════════════════════════════════════════════════════════════════════

    showDetail(id) {
      const memory = this.memories.find((m) => m.id === id);
      if (!memory) return;

      const panel = this.container.querySelector("#memory-detail");
      const content = panel.querySelector(".detail-content");

      content.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <span class="memory-type ${memory.type}">${memory.type}</span>
                </div>
                <h4 style="margin-bottom: 12px;">${this.escapeHtml(memory.title || memory.id)}</h4>
                <div style="font-size: 13px; opacity: 0.7; margin-bottom: 16px;">
                    Created: ${this.formatDate(memory.timestamp)}
                </div>
                <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
                    ${this.escapeHtml(memory.content || "")}
                </div>
                ${
                  memory.metadata
                    ? `
                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color, #2a2a3a);">
                        <h5 style="margin-bottom: 8px;">Metadata</h5>
                        <pre style="font-size: 12px; opacity: 0.7;">${JSON.stringify(memory.metadata, null, 2)}</pre>
                    </div>
                `
                    : ""
                }
                <div style="margin-top: 24px; display: flex; gap: 8px;">
                    <button class="btn btn-danger" onclick="window.BaelMemoryDashboard.deleteMemory('${id}')">
                        🗑️ Delete
                    </button>
                    <button class="btn" onclick="window.BaelMemoryDashboard.copyMemory('${id}')">
                        📋 Copy
                    </button>
                </div>
            `;

      panel.style.display = "flex";
    }

    closeDetail() {
      this.container.querySelector("#memory-detail").style.display = "none";
    }

    async deleteMemory(id) {
      const confirmed = confirm("Delete this memory?");
      if (!confirmed) return;

      try {
        await window.BaelMemory?.delete([id]);
        this.closeDetail();
        await this.refresh();
        window.BaelNotify?.success("Memory deleted");
      } catch (error) {
        window.BaelNotify?.error("Failed to delete memory");
      }
    }

    copyMemory(id) {
      const memory = this.memories.find((m) => m.id === id);
      if (memory) {
        navigator.clipboard.writeText(memory.content || "");
        window.BaelNotify?.success("Copied to clipboard");
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IMPORT & REINDEX
    // ═══════════════════════════════════════════════════════════════════════

    openImportDialog() {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".txt,.pdf,.csv,.html,.json,.md";

      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
          await window.BaelMemory?.importKnowledge(files);
          await this.refresh();
          window.BaelNotify?.success(`Imported ${files.length} file(s)`);
        } catch (error) {
          window.BaelNotify?.error("Import failed");
        }
      };

      input.click();
    }

    async reindex() {
      try {
        window.BaelNotify?.info("Reindexing knowledge base...");
        await window.BaelMemory?.reindex();
        await this.refresh();
        window.BaelNotify?.success("Reindex complete");
      } catch (error) {
        window.BaelNotify?.error("Reindex failed");
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PAGINATION
    // ═══════════════════════════════════════════════════════════════════════

    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.search(this.filters.query);
      }
    }

    nextPage() {
      if (this.page < this.totalPages) {
        this.page++;
        this.search(this.filters.query);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.container.style.display = "flex";
      this.visible = true;
      this.refresh();
    }

    hide() {
      this.container.style.display = "none";
      this.visible = false;
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelMemoryDashboard = new BaelMemoryDashboard();

  // Auto-initialize after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelMemoryDashboard.initialize();
    });
  } else {
    window.BaelMemoryDashboard.initialize();
  }

  console.log("🧠 Bael Memory Dashboard loaded");
})();
