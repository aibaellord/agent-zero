/**
 * BAEL Tree Component - Lord Of All Trees
 *
 * Hierarchical tree view with:
 * - Expandable/collapsible nodes
 * - Node selection (single/multi)
 * - Checkboxes
 * - Drag and drop
 * - Lazy loading
 * - Context menu
 * - Search/filter
 * - Icons
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TREE CLASS
  // ============================================================

  class BaelTree {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-tree-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-tree-styles";
      styles.textContent = `
                .bael-tree {
                    --tree-indent: 24px;
                    --tree-line-color: #e5e7eb;
                    --tree-hover-bg: #f3f4f6;
                    --tree-selected-bg: #eef2ff;
                    --tree-selected-color: #4f46e5;

                    font-size: 0.875rem;
                    user-select: none;
                }

                .bael-tree-node {
                    position: relative;
                }

                .bael-tree-node-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .bael-tree-node-content:hover {
                    background: var(--tree-hover-bg);
                }

                .bael-tree-node.selected > .bael-tree-node-content {
                    background: var(--tree-selected-bg);
                    color: var(--tree-selected-color);
                }

                .bael-tree-toggle {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: transform 0.2s, background 0.15s;
                    flex-shrink: 0;
                }

                .bael-tree-toggle:hover {
                    background: rgba(0,0,0,0.1);
                }

                .bael-tree-toggle-icon {
                    transition: transform 0.2s;
                }

                .bael-tree-node.expanded > .bael-tree-node-content .bael-tree-toggle-icon {
                    transform: rotate(90deg);
                }

                .bael-tree-toggle-placeholder {
                    width: 20px;
                    flex-shrink: 0;
                }

                .bael-tree-checkbox {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--tree-selected-color);
                    flex-shrink: 0;
                }

                .bael-tree-icon {
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-tree-label {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-tree-badge {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    background: #e5e7eb;
                    border-radius: 9999px;
                    color: #374151;
                }

                .bael-tree-children {
                    padding-left: var(--tree-indent);
                    overflow: hidden;
                }

                .bael-tree-node.collapsed > .bael-tree-children {
                    display: none;
                }

                /* Lines */
                .bael-tree-lines .bael-tree-children {
                    position: relative;
                }

                .bael-tree-lines .bael-tree-children::before {
                    content: '';
                    position: absolute;
                    left: 10px;
                    top: 0;
                    bottom: 12px;
                    width: 1px;
                    background: var(--tree-line-color);
                }

                .bael-tree-lines .bael-tree-node::before {
                    content: '';
                    position: absolute;
                    left: -14px;
                    top: 16px;
                    width: 14px;
                    height: 1px;
                    background: var(--tree-line-color);
                }

                .bael-tree-lines > .bael-tree-node::before {
                    display: none;
                }

                /* Loading */
                .bael-tree-loading {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px;
                    color: #6b7280;
                    font-style: italic;
                }

                .bael-tree-loading-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: bael-tree-spin 0.8s linear infinite;
                }

                @keyframes bael-tree-spin {
                    to { transform: rotate(360deg); }
                }

                /* Dragging */
                .bael-tree-node.dragging {
                    opacity: 0.5;
                }

                .bael-tree-node.drop-target > .bael-tree-node-content {
                    background: #ddd6fe;
                    border: 2px dashed #4f46e5;
                }

                .bael-tree-drop-indicator {
                    height: 2px;
                    background: #4f46e5;
                    margin-left: var(--tree-indent);
                }

                /* Search */
                .bael-tree-search {
                    margin-bottom: 12px;
                }

                .bael-tree-search input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 0.875rem;
                }

                .bael-tree-search input:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
                }

                .bael-tree-no-results {
                    padding: 16px;
                    text-align: center;
                    color: #6b7280;
                }

                /* Highlighted match */
                .bael-tree-highlight {
                    background: #fef08a;
                    border-radius: 2px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE TREE
    // ============================================================

    /**
     * Create a tree
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Tree container not found");
        return null;
      }

      const id = `bael-tree-${++this.idCounter}`;
      const config = {
        data: [],
        selectable: true,
        multiSelect: false,
        checkboxes: false,
        showLines: false,
        draggable: false,
        searchable: false,
        searchPlaceholder: "Search...",
        expandOnSelect: false,
        icons: true,
        defaultIcon: "📄",
        folderIcon: "📁",
        folderOpenIcon: "📂",
        onSelect: null,
        onCheck: null,
        onExpand: null,
        onCollapse: null,
        onDrop: null,
        loadChildren: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        selectedNodes: new Set(),
        checkedNodes: new Set(),
        expandedNodes: new Set(),
        nodeMap: new Map(),
      };

      // Create structure
      this._createStructure(state);
      this._render(state);

      this.instances.set(id, state);

      return {
        id,
        getSelected: () => this.getSelected(id),
        getChecked: () => this.getChecked(id),
        select: (nodeId) => this.select(id, nodeId),
        deselect: (nodeId) => this.deselect(id, nodeId),
        check: (nodeId) => this.check(id, nodeId),
        uncheck: (nodeId) => this.uncheck(id, nodeId),
        expand: (nodeId) => this.expand(id, nodeId),
        collapse: (nodeId) => this.collapse(id, nodeId),
        expandAll: () => this.expandAll(id),
        collapseAll: () => this.collapseAll(id),
        addNode: (parentId, node) => this.addNode(id, parentId, node),
        removeNode: (nodeId) => this.removeNode(id, nodeId),
        updateNode: (nodeId, data) => this.updateNode(id, nodeId, data),
        filter: (term) => this.filter(id, term),
        getData: () => config.data,
        refresh: () => this._render(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create tree structure
     */
    _createStructure(state) {
      const { config, container } = state;

      const wrapper = document.createElement("div");
      wrapper.className = "bael-tree-wrapper";
      wrapper.id = state.id;

      // Search
      if (config.searchable) {
        const search = document.createElement("div");
        search.className = "bael-tree-search";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = config.searchPlaceholder;
        input.addEventListener("input", (e) => {
          this.filter(state.id, e.target.value);
        });

        search.appendChild(input);
        wrapper.appendChild(search);
        state.searchInput = input;
      }

      // Tree container
      const tree = document.createElement("div");
      tree.className = "bael-tree";
      if (config.showLines) tree.classList.add("bael-tree-lines");

      wrapper.appendChild(tree);
      container.appendChild(wrapper);

      state.wrapper = wrapper;
      state.tree = tree;
    }

    // ============================================================
    // RENDER
    // ============================================================

    /**
     * Render tree
     */
    _render(state) {
      const { config, tree } = state;
      tree.innerHTML = "";
      state.nodeMap.clear();

      if (config.data.length === 0) {
        const empty = document.createElement("div");
        empty.className = "bael-tree-no-results";
        empty.textContent = "No data";
        tree.appendChild(empty);
        return;
      }

      config.data.forEach((node) => {
        const nodeEl = this._renderNode(state, node);
        tree.appendChild(nodeEl);
      });
    }

    /**
     * Render a node
     */
    _renderNode(state, node, parent = null) {
      const { config } = state;
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = state.expandedNodes.has(node.id);
      const isSelected = state.selectedNodes.has(node.id);
      const isChecked = state.checkedNodes.has(node.id);

      // Node container
      const nodeEl = document.createElement("div");
      nodeEl.className = "bael-tree-node";
      nodeEl.dataset.id = node.id;

      if (isExpanded) nodeEl.classList.add("expanded");
      else if (hasChildren) nodeEl.classList.add("collapsed");
      if (isSelected) nodeEl.classList.add("selected");

      // Content
      const content = document.createElement("div");
      content.className = "bael-tree-node-content";

      // Toggle
      if (hasChildren || node.lazy) {
        const toggle = document.createElement("span");
        toggle.className = "bael-tree-toggle";
        toggle.innerHTML = '<span class="bael-tree-toggle-icon">▶</span>';
        toggle.onclick = (e) => {
          e.stopPropagation();
          this._toggleExpand(state, node.id);
        };
        content.appendChild(toggle);
      } else {
        const placeholder = document.createElement("span");
        placeholder.className = "bael-tree-toggle-placeholder";
        content.appendChild(placeholder);
      }

      // Checkbox
      if (config.checkboxes) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "bael-tree-checkbox";
        checkbox.checked = isChecked;
        checkbox.onclick = (e) => {
          e.stopPropagation();
          this._toggleCheck(state, node.id);
        };
        content.appendChild(checkbox);
      }

      // Icon
      if (config.icons) {
        const icon = document.createElement("span");
        icon.className = "bael-tree-icon";

        if (node.icon) {
          icon.innerHTML = node.icon;
        } else if (hasChildren || node.lazy) {
          icon.innerHTML = isExpanded
            ? config.folderOpenIcon
            : config.folderIcon;
        } else {
          icon.innerHTML = config.defaultIcon;
        }

        content.appendChild(icon);
      }

      // Label
      const label = document.createElement("span");
      label.className = "bael-tree-label";
      label.textContent = node.label || node.name || node.id;
      content.appendChild(label);

      // Badge
      if (node.badge !== undefined) {
        const badge = document.createElement("span");
        badge.className = "bael-tree-badge";
        badge.textContent = node.badge;
        content.appendChild(badge);
      }

      // Selection
      if (config.selectable) {
        content.onclick = () => {
          this._handleSelect(state, node.id);
        };
      }

      nodeEl.appendChild(content);

      // Draggable
      if (config.draggable) {
        content.draggable = true;
        this._setupDrag(state, content, node);
      }

      // Children
      if (hasChildren) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "bael-tree-children";

        node.children.forEach((child) => {
          const childEl = this._renderNode(state, child, node);
          childrenContainer.appendChild(childEl);
        });

        nodeEl.appendChild(childrenContainer);
      }

      // Store reference
      state.nodeMap.set(node.id, { element: nodeEl, node, parent });

      return nodeEl;
    }

    // ============================================================
    // EXPAND/COLLAPSE
    // ============================================================

    /**
     * Toggle expand
     */
    async _toggleExpand(state, nodeId) {
      if (state.expandedNodes.has(nodeId)) {
        this.collapse(state.id, nodeId);
      } else {
        await this.expand(state.id, nodeId);
      }
    }

    /**
     * Expand node
     */
    async expand(treeId, nodeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      const nodeData = state.nodeMap.get(nodeId);
      if (!nodeData) return;

      const { element, node } = nodeData;

      // Lazy load
      if (node.lazy && !node.children && state.config.loadChildren) {
        // Show loading
        let childrenContainer = element.querySelector(".bael-tree-children");
        if (!childrenContainer) {
          childrenContainer = document.createElement("div");
          childrenContainer.className = "bael-tree-children";
          element.appendChild(childrenContainer);
        }

        childrenContainer.innerHTML = `
                    <div class="bael-tree-loading">
                        <div class="bael-tree-loading-spinner"></div>
                        Loading...
                    </div>
                `;

        element.classList.add("expanded");
        element.classList.remove("collapsed");

        try {
          const children = await state.config.loadChildren(node);
          node.children = children;
          node.lazy = false;

          // Re-render children
          childrenContainer.innerHTML = "";
          children.forEach((child) => {
            const childEl = this._renderNode(state, child, node);
            childrenContainer.appendChild(childEl);
          });
        } catch (error) {
          console.error("Error loading children:", error);
          childrenContainer.innerHTML =
            '<div class="bael-tree-loading">Error loading</div>';
        }
      }

      state.expandedNodes.add(nodeId);
      element.classList.add("expanded");
      element.classList.remove("collapsed");

      // Update folder icon
      if (state.config.icons) {
        const icon = element.querySelector(".bael-tree-icon");
        if (icon && (node.children || node.lazy)) {
          icon.innerHTML = state.config.folderOpenIcon;
        }
      }

      if (state.config.onExpand) {
        state.config.onExpand(nodeId, node);
      }
    }

    /**
     * Collapse node
     */
    collapse(treeId, nodeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      const nodeData = state.nodeMap.get(nodeId);
      if (!nodeData) return;

      const { element, node } = nodeData;

      state.expandedNodes.delete(nodeId);
      element.classList.remove("expanded");
      element.classList.add("collapsed");

      // Update folder icon
      if (state.config.icons) {
        const icon = element.querySelector(".bael-tree-icon");
        if (icon && node.children) {
          icon.innerHTML = state.config.folderIcon;
        }
      }

      if (state.config.onCollapse) {
        state.config.onCollapse(nodeId, node);
      }
    }

    /**
     * Expand all
     */
    expandAll(treeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      state.nodeMap.forEach((data, nodeId) => {
        if (data.node.children && data.node.children.length > 0) {
          this.expand(treeId, nodeId);
        }
      });
    }

    /**
     * Collapse all
     */
    collapseAll(treeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      state.expandedNodes.forEach((nodeId) => {
        this.collapse(treeId, nodeId);
      });
    }

    // ============================================================
    // SELECTION
    // ============================================================

    /**
     * Handle select
     */
    _handleSelect(state, nodeId) {
      const { config } = state;

      if (state.selectedNodes.has(nodeId)) {
        if (config.multiSelect) {
          this.deselect(state.id, nodeId);
        }
      } else {
        if (!config.multiSelect) {
          state.selectedNodes.forEach((id) => {
            this.deselect(state.id, id);
          });
        }
        this.select(state.id, nodeId);
      }

      if (config.expandOnSelect) {
        this.expand(state.id, nodeId);
      }
    }

    /**
     * Select node
     */
    select(treeId, nodeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      state.selectedNodes.add(nodeId);

      const nodeData = state.nodeMap.get(nodeId);
      if (nodeData) {
        nodeData.element.classList.add("selected");
      }

      if (state.config.onSelect) {
        state.config.onSelect(this.getSelected(treeId));
      }
    }

    /**
     * Deselect node
     */
    deselect(treeId, nodeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      state.selectedNodes.delete(nodeId);

      const nodeData = state.nodeMap.get(nodeId);
      if (nodeData) {
        nodeData.element.classList.remove("selected");
      }

      if (state.config.onSelect) {
        state.config.onSelect(this.getSelected(treeId));
      }
    }

    /**
     * Get selected nodes
     */
    getSelected(treeId) {
      const state = this.instances.get(treeId);
      if (!state) return [];

      return Array.from(state.selectedNodes)
        .map((id) => {
          const data = state.nodeMap.get(id);
          return data ? data.node : null;
        })
        .filter(Boolean);
    }

    // ============================================================
    // CHECKBOXES
    // ============================================================

    /**
     * Toggle check
     */
    _toggleCheck(state, nodeId) {
      if (state.checkedNodes.has(nodeId)) {
        this.uncheck(state.id, nodeId);
      } else {
        this.check(state.id, nodeId);
      }
    }

    /**
     * Check node
     */
    check(treeId, nodeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      state.checkedNodes.add(nodeId);

      const nodeData = state.nodeMap.get(nodeId);
      if (nodeData) {
        const checkbox = nodeData.element.querySelector(".bael-tree-checkbox");
        if (checkbox) checkbox.checked = true;
      }

      if (state.config.onCheck) {
        state.config.onCheck(this.getChecked(treeId));
      }
    }

    /**
     * Uncheck node
     */
    uncheck(treeId, nodeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      state.checkedNodes.delete(nodeId);

      const nodeData = state.nodeMap.get(nodeId);
      if (nodeData) {
        const checkbox = nodeData.element.querySelector(".bael-tree-checkbox");
        if (checkbox) checkbox.checked = false;
      }

      if (state.config.onCheck) {
        state.config.onCheck(this.getChecked(treeId));
      }
    }

    /**
     * Get checked nodes
     */
    getChecked(treeId) {
      const state = this.instances.get(treeId);
      if (!state) return [];

      return Array.from(state.checkedNodes)
        .map((id) => {
          const data = state.nodeMap.get(id);
          return data ? data.node : null;
        })
        .filter(Boolean);
    }

    // ============================================================
    // FILTER
    // ============================================================

    /**
     * Filter tree
     */
    filter(treeId, term) {
      const state = this.instances.get(treeId);
      if (!state) return;

      term = term.toLowerCase().trim();

      if (!term) {
        // Show all
        state.nodeMap.forEach((data) => {
          data.element.style.display = "";
          const label = data.element.querySelector(".bael-tree-label");
          if (label) {
            label.innerHTML = data.node.label || data.node.name || data.node.id;
          }
        });
        return;
      }

      const matchingNodes = new Set();

      // Find matches and their parents
      const findMatches = (nodes, parents = []) => {
        nodes.forEach((node) => {
          const label = (node.label || node.name || node.id).toLowerCase();
          const matches = label.includes(term);

          if (matches) {
            matchingNodes.add(node.id);
            parents.forEach((p) => matchingNodes.add(p.id));
          }

          if (node.children) {
            findMatches(node.children, [...parents, node]);
          }
        });
      };

      findMatches(state.config.data);

      // Update visibility
      state.nodeMap.forEach((data, nodeId) => {
        if (matchingNodes.has(nodeId)) {
          data.element.style.display = "";

          // Highlight match
          const label = data.element.querySelector(".bael-tree-label");
          if (label) {
            const text = data.node.label || data.node.name || data.node.id;
            const regex = new RegExp(`(${term})`, "gi");
            label.innerHTML = text.replace(
              regex,
              '<span class="bael-tree-highlight">$1</span>',
            );
          }

          // Expand parents
          this.expand(treeId, nodeId);
        } else {
          data.element.style.display = "none";
        }
      });
    }

    // ============================================================
    // DRAG AND DROP
    // ============================================================

    /**
     * Setup drag events
     */
    _setupDrag(state, element, node) {
      element.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", node.id);
        element.parentElement.classList.add("dragging");
      });

      element.addEventListener("dragend", () => {
        element.parentElement.classList.remove("dragging");
        state.tree.querySelectorAll(".drop-target").forEach((el) => {
          el.classList.remove("drop-target");
        });
      });

      element.addEventListener("dragover", (e) => {
        e.preventDefault();
        element.parentElement.classList.add("drop-target");
      });

      element.addEventListener("dragleave", () => {
        element.parentElement.classList.remove("drop-target");
      });

      element.addEventListener("drop", (e) => {
        e.preventDefault();
        element.parentElement.classList.remove("drop-target");

        const sourceId = e.dataTransfer.getData("text/plain");
        const targetId = node.id;

        if (sourceId !== targetId && state.config.onDrop) {
          const sourceData = state.nodeMap.get(sourceId);
          const targetData = state.nodeMap.get(targetId);

          if (sourceData && targetData) {
            state.config.onDrop(sourceData.node, targetData.node);
          }
        }
      });
    }

    // ============================================================
    // NODE MANAGEMENT
    // ============================================================

    /**
     * Add node
     */
    addNode(treeId, parentId, node) {
      const state = this.instances.get(treeId);
      if (!state) return;

      if (parentId) {
        const parentData = state.nodeMap.get(parentId);
        if (parentData) {
          if (!parentData.node.children) {
            parentData.node.children = [];
          }
          parentData.node.children.push(node);
        }
      } else {
        state.config.data.push(node);
      }

      this._render(state);
    }

    /**
     * Remove node
     */
    removeNode(treeId, nodeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      const removeFromArray = (nodes) => {
        const index = nodes.findIndex((n) => n.id === nodeId);
        if (index > -1) {
          nodes.splice(index, 1);
          return true;
        }

        for (const node of nodes) {
          if (node.children && removeFromArray(node.children)) {
            return true;
          }
        }

        return false;
      };

      removeFromArray(state.config.data);
      state.selectedNodes.delete(nodeId);
      state.checkedNodes.delete(nodeId);
      state.expandedNodes.delete(nodeId);

      this._render(state);
    }

    /**
     * Update node
     */
    updateNode(treeId, nodeId, data) {
      const state = this.instances.get(treeId);
      if (!state) return;

      const nodeData = state.nodeMap.get(nodeId);
      if (nodeData) {
        Object.assign(nodeData.node, data);
        this._render(state);
      }
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy tree
     */
    destroy(treeId) {
      const state = this.instances.get(treeId);
      if (!state) return;

      state.wrapper.remove();
      this.instances.delete(treeId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelTree();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$tree = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTree = bael;

  console.log("🌳 BAEL Tree Component loaded");
})();
