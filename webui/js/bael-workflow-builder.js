/**
 * BAEL - LORD OF ALL
 * Workflow Builder - Visual task and pipeline builder
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelWorkflowBuilder {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.nodes = [];
      this.connections = [];
      this.isVisible = false;
      this.selectedNode = null;
      this.draggingNode = null;
      this.connectingFrom = null;
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.isPanning = false;
      this.lastMouse = { x: 0, y: 0 };
      this.gridSize = 20;
      this.nodeIdCounter = 0;
      this.workflows = [];
      this.currentWorkflow = null;

      this.nodeTypes = {
        start: {
          label: "Start",
          color: "#4caf50",
          icon: "▶",
          inputs: 0,
          outputs: 1,
        },
        prompt: {
          label: "Prompt",
          color: "#2196f3",
          icon: "💬",
          inputs: 1,
          outputs: 1,
          config: ["text"],
        },
        condition: {
          label: "Condition",
          color: "#ff9800",
          icon: "❓",
          inputs: 1,
          outputs: 2,
          config: ["condition"],
        },
        action: {
          label: "Action",
          color: "#9c27b0",
          icon: "⚡",
          inputs: 1,
          outputs: 1,
          config: ["action", "params"],
        },
        loop: {
          label: "Loop",
          color: "#00bcd4",
          icon: "🔄",
          inputs: 1,
          outputs: 2,
          config: ["count", "variable"],
        },
        delay: {
          label: "Delay",
          color: "#607d8b",
          icon: "⏱️",
          inputs: 1,
          outputs: 1,
          config: ["seconds"],
        },
        memory: {
          label: "Memory",
          color: "#e91e63",
          icon: "🧠",
          inputs: 1,
          outputs: 1,
          config: ["operation", "key"],
        },
        code: {
          label: "Code",
          color: "#795548",
          icon: "📝",
          inputs: 1,
          outputs: 1,
          config: ["language", "code"],
        },
        end: {
          label: "End",
          color: "#f44336",
          icon: "⏹️",
          inputs: 1,
          outputs: 0,
        },
      };

      this.init();
    }

    init() {
      this.loadWorkflows();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      console.log("🔧 Bael Workflow Builder initialized");
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-workflow-builder";
      container.className = "bael-workflow-builder";
      container.innerHTML = `
                <div class="workflow-header">
                    <div class="workflow-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        <span>Workflow Builder</span>
                    </div>
                    <div class="workflow-name-container">
                        <input type="text" id="workflow-name" placeholder="Untitled Workflow" value="Untitled Workflow">
                    </div>
                    <div class="workflow-actions">
                        <button class="workflow-btn" id="workflow-new" title="New Workflow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        </button>
                        <button class="workflow-btn" id="workflow-save" title="Save Workflow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                        </button>
                        <button class="workflow-btn" id="workflow-load" title="Load Workflow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                            </svg>
                        </button>
                        <button class="workflow-btn primary" id="workflow-run" title="Run Workflow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            Run
                        </button>
                    </div>
                    <button class="workflow-close" id="workflow-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="workflow-sidebar">
                    <div class="sidebar-section">
                        <h4>Nodes</h4>
                        <div class="node-palette" id="node-palette"></div>
                    </div>
                    <div class="sidebar-section">
                        <h4>Properties</h4>
                        <div class="node-properties" id="node-properties">
                            <p class="no-selection">Select a node to edit its properties</p>
                        </div>
                    </div>
                </div>

                <div class="workflow-canvas-container">
                    <canvas id="workflow-canvas"></canvas>
                    <div class="canvas-controls">
                        <button class="canvas-ctrl-btn" id="canvas-zoom-in">+</button>
                        <span class="zoom-level" id="zoom-level">100%</span>
                        <button class="canvas-ctrl-btn" id="canvas-zoom-out">−</button>
                        <button class="canvas-ctrl-btn" id="canvas-reset">⌂</button>
                    </div>
                </div>

                <div class="workflow-load-modal" id="workflow-load-modal">
                    <div class="load-modal-content">
                        <h3>Load Workflow</h3>
                        <div class="workflow-list" id="workflow-list"></div>
                        <div class="modal-actions">
                            <button class="modal-btn" id="modal-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;
      this.canvas = container.querySelector("#workflow-canvas");
      this.ctx = this.canvas.getContext("2d");

      this.populateNodePalette();
    }

    populateNodePalette() {
      const palette = this.container.querySelector("#node-palette");
      palette.innerHTML = "";

      Object.entries(this.nodeTypes).forEach(([type, config]) => {
        const item = document.createElement("div");
        item.className = "palette-node";
        item.dataset.type = type;
        item.innerHTML = `
                    <span class="palette-icon" style="background: ${config.color}">${config.icon}</span>
                    <span class="palette-label">${config.label}</span>
                `;
        item.draggable = true;
        palette.appendChild(item);
      });
    }

    addStyles() {
      if (document.getElementById("bael-workflow-builder-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-workflow-builder-styles";
      styles.textContent = `
                .bael-workflow-builder {
                    position: fixed;
                    inset: 0;
                    background: var(--bael-bg-primary, #0a0a0f);
                    z-index: 100012;
                    display: none;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .bael-workflow-builder.visible {
                    display: block;
                    animation: wfFadeIn 0.3s ease;
                }

                @keyframes wfFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .workflow-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 56px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 0 20px;
                    z-index: 10;
                }

                .workflow-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .workflow-title svg {
                    width: 24px;
                    height: 24px;
                    color: var(--bael-accent, #ff3366);
                }

                .workflow-name-container {
                    flex: 1;
                }

                #workflow-name {
                    padding: 8px 12px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    width: 250px;
                    outline: none;
                }

                #workflow-name:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .workflow-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .workflow-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .workflow-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .workflow-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .workflow-btn.primary:hover {
                    background: var(--bael-accent-hover, #ff4d7a);
                }

                .workflow-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .workflow-close {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .workflow-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .workflow-close svg {
                    width: 20px;
                    height: 20px;
                }

                .workflow-sidebar {
                    position: absolute;
                    top: 56px;
                    left: 0;
                    width: 280px;
                    bottom: 0;
                    background: var(--bael-bg-secondary, #12121a);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                    overflow-y: auto;
                }

                .sidebar-section {
                    padding: 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .sidebar-section h4 {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--bael-text-muted, #666);
                    margin: 0 0 12px 0;
                }

                .node-palette {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .palette-node {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    cursor: grab;
                    transition: all 0.2s ease;
                }

                .palette-node:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: translateY(-2px);
                }

                .palette-node:active {
                    cursor: grabbing;
                }

                .palette-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .palette-label {
                    font-size: 12px;
                    color: var(--bael-text-secondary, #aaa);
                }

                .node-properties {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .no-selection {
                    font-size: 13px;
                    color: var(--bael-text-muted, #666);
                    text-align: center;
                    padding: 20px;
                }

                .prop-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .prop-group label {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                }

                .prop-group input,
                .prop-group textarea,
                .prop-group select {
                    padding: 8px 10px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .prop-group textarea {
                    min-height: 100px;
                    resize: vertical;
                    font-family: 'Monaco', 'Menlo', monospace;
                }

                .prop-group input:focus,
                .prop-group textarea:focus,
                .prop-group select:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .prop-delete-btn {
                    margin-top: 12px;
                    padding: 10px;
                    background: rgba(244, 67, 54, 0.1);
                    border: 1px solid rgba(244, 67, 54, 0.3);
                    border-radius: 6px;
                    color: #f44336;
                    cursor: pointer;
                    font-size: 13px;
                }

                .prop-delete-btn:hover {
                    background: rgba(244, 67, 54, 0.2);
                }

                .workflow-canvas-container {
                    position: absolute;
                    top: 56px;
                    left: 280px;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    background: var(--bael-bg-primary, #0a0a0f);
                }

                #workflow-canvas {
                    width: 100%;
                    height: 100%;
                    cursor: crosshair;
                }

                .canvas-controls {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                }

                .canvas-ctrl-btn {
                    width: 28px;
                    height: 28px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: var(--bael-bg-primary, #0a0a0f);
                    color: var(--bael-text-primary, #fff);
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }

                .canvas-ctrl-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .zoom-level {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    min-width: 50px;
                    text-align: center;
                }

                .workflow-load-modal {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                }

                .workflow-load-modal.visible {
                    display: flex;
                }

                .load-modal-content {
                    width: 400px;
                    max-height: 500px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .load-modal-content h3 {
                    padding: 16px 20px;
                    margin: 0;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 16px;
                    color: var(--bael-text-primary, #fff);
                }

                .workflow-list {
                    max-height: 350px;
                    overflow-y: auto;
                    padding: 12px;
                }

                .workflow-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .workflow-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .workflow-item-name {
                    font-size: 14px;
                    color: var(--bael-text-primary, #fff);
                }

                .workflow-item-date {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .modal-actions {
                    padding: 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: flex-end;
                }

                .modal-btn {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    cursor: pointer;
                }

                .modal-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#workflow-close")
        .addEventListener("click", () => this.close());

      // Toolbar buttons
      this.container
        .querySelector("#workflow-new")
        .addEventListener("click", () => this.newWorkflow());
      this.container
        .querySelector("#workflow-save")
        .addEventListener("click", () => this.saveWorkflow());
      this.container
        .querySelector("#workflow-load")
        .addEventListener("click", () => this.showLoadModal());
      this.container
        .querySelector("#workflow-run")
        .addEventListener("click", () => this.runWorkflow());

      // Canvas controls
      this.container
        .querySelector("#canvas-zoom-in")
        .addEventListener("click", () => this.zoomIn());
      this.container
        .querySelector("#canvas-zoom-out")
        .addEventListener("click", () => this.zoomOut());
      this.container
        .querySelector("#canvas-reset")
        .addEventListener("click", () => this.resetView());

      // Modal
      this.container
        .querySelector("#modal-cancel")
        .addEventListener("click", () => {
          this.container
            .querySelector("#workflow-load-modal")
            .classList.remove("visible");
        });

      // Palette drag and drop
      const palette = this.container.querySelector("#node-palette");
      palette.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("palette-node")) {
          e.dataTransfer.setData("nodeType", e.target.dataset.type);
        }
      });

      this.canvas.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      this.canvas.addEventListener("drop", (e) => {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData("nodeType");
        if (nodeType) {
          const rect = this.canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left - this.pan.x) / this.zoom;
          const y = (e.clientY - rect.top - this.pan.y) / this.zoom;
          this.addNode(nodeType, x, y);
        }
      });

      // Canvas interactions
      this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
      this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
      this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
      this.canvas.addEventListener("wheel", (e) => this.handleWheel(e));
      this.canvas.addEventListener("dblclick", (e) =>
        this.handleDoubleClick(e),
      );

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (!this.isVisible) return;

        if (e.key === "Delete" && this.selectedNode) {
          this.deleteNode(this.selectedNode.id);
        }

        if (e.key === "Escape") {
          if (this.connectingFrom) {
            this.connectingFrom = null;
            this.draw();
          } else {
            this.close();
          }
        }
      });

      // Resize
      window.addEventListener("resize", () => {
        if (this.isVisible) this.resizeCanvas();
      });
    }

    resizeCanvas() {
      const container = this.canvas.parentElement;
      this.canvas.width = container.offsetWidth * window.devicePixelRatio;
      this.canvas.height = container.offsetHeight * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.draw();
    }

    addNode(type, x, y) {
      const config = this.nodeTypes[type];
      if (!config) return;

      const node = {
        id: ++this.nodeIdCounter,
        type,
        x: Math.round(x / this.gridSize) * this.gridSize,
        y: Math.round(y / this.gridSize) * this.gridSize,
        width: 160,
        height: 60,
        config: {},
        ...config,
      };

      this.nodes.push(node);
      this.selectNode(node);
      this.draw();
    }

    deleteNode(id) {
      this.nodes = this.nodes.filter((n) => n.id !== id);
      this.connections = this.connections.filter(
        (c) => c.from !== id && c.to !== id,
      );
      if (this.selectedNode?.id === id) {
        this.selectedNode = null;
        this.updateProperties();
      }
      this.draw();
    }

    selectNode(node) {
      this.selectedNode = node;
      this.updateProperties();
      this.draw();
    }

    updateProperties() {
      const propsContainer = this.container.querySelector("#node-properties");

      if (!this.selectedNode) {
        propsContainer.innerHTML =
          '<p class="no-selection">Select a node to edit its properties</p>';
        return;
      }

      const node = this.selectedNode;
      const type = this.nodeTypes[node.type];

      let html = `
                <div class="prop-group">
                    <label>Type</label>
                    <input type="text" value="${type.label}" disabled>
                </div>
            `;

      // Add config fields based on node type
      if (type.config) {
        type.config.forEach((field) => {
          const value = node.config[field] || "";
          if (field === "code" || field === "text") {
            html += `
                            <div class="prop-group">
                                <label>${field}</label>
                                <textarea data-field="${field}" placeholder="Enter ${field}...">${value}</textarea>
                            </div>
                        `;
          } else if (field === "operation") {
            html += `
                            <div class="prop-group">
                                <label>${field}</label>
                                <select data-field="${field}">
                                    <option value="save" ${value === "save" ? "selected" : ""}>Save</option>
                                    <option value="load" ${value === "load" ? "selected" : ""}>Load</option>
                                    <option value="delete" ${value === "delete" ? "selected" : ""}>Delete</option>
                                </select>
                            </div>
                        `;
          } else if (field === "language") {
            html += `
                            <div class="prop-group">
                                <label>${field}</label>
                                <select data-field="${field}">
                                    <option value="python" ${value === "python" ? "selected" : ""}>Python</option>
                                    <option value="javascript" ${value === "javascript" ? "selected" : ""}>JavaScript</option>
                                    <option value="shell" ${value === "shell" ? "selected" : ""}>Shell</option>
                                </select>
                            </div>
                        `;
          } else if (field === "action") {
            html += `
                            <div class="prop-group">
                                <label>${field}</label>
                                <select data-field="${field}">
                                    <option value="search" ${value === "search" ? "selected" : ""}>Web Search</option>
                                    <option value="query" ${value === "query" ? "selected" : ""}>Query Documents</option>
                                    <option value="execute" ${value === "execute" ? "selected" : ""}>Execute Code</option>
                                    <option value="notify" ${value === "notify" ? "selected" : ""}>Notify User</option>
                                </select>
                            </div>
                        `;
          } else {
            html += `
                            <div class="prop-group">
                                <label>${field}</label>
                                <input type="text" data-field="${field}" value="${value}" placeholder="Enter ${field}...">
                            </div>
                        `;
          }
        });
      }

      html += `<button class="prop-delete-btn">Delete Node</button>`;

      propsContainer.innerHTML = html;

      // Bind change handlers
      propsContainer.querySelectorAll("[data-field]").forEach((input) => {
        input.addEventListener("change", (e) => {
          node.config[e.target.dataset.field] = e.target.value;
        });
        input.addEventListener("input", (e) => {
          node.config[e.target.dataset.field] = e.target.value;
        });
      });

      propsContainer
        .querySelector(".prop-delete-btn")
        .addEventListener("click", () => {
          this.deleteNode(node.id);
        });
    }

    draw() {
      const ctx = this.ctx;
      const width = this.canvas.width / window.devicePixelRatio;
      const height = this.canvas.height / window.devicePixelRatio;

      // Clear
      ctx.fillStyle =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--bael-bg-primary",
        ) || "#0a0a0f";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(this.pan.x, this.pan.y);
      ctx.scale(this.zoom, this.zoom);

      // Grid
      this.drawGrid(ctx, width, height);

      // Connections
      this.connections.forEach((conn) => {
        const fromNode = this.nodes.find((n) => n.id === conn.from);
        const toNode = this.nodes.find((n) => n.id === conn.to);
        if (fromNode && toNode) {
          this.drawConnection(ctx, fromNode, toNode, conn.fromOutput);
        }
      });

      // Connecting line
      if (this.connectingFrom && this.lastMouse) {
        const node = this.nodes.find(
          (n) => n.id === this.connectingFrom.nodeId,
        );
        if (node) {
          const startX = node.x + node.width;
          const startY = node.y + node.height / 2;
          const endX = (this.lastMouse.x - this.pan.x) / this.zoom;
          const endY = (this.lastMouse.y - this.pan.y) / this.zoom;

          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = "var(--bael-accent, #ff3366)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Nodes
      this.nodes.forEach((node) => {
        this.drawNode(ctx, node);
      });

      ctx.restore();
    }

    drawGrid(ctx, width, height) {
      const gridSize = this.gridSize;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;

      const startX = Math.floor(-this.pan.x / this.zoom / gridSize) * gridSize;
      const startY = Math.floor(-this.pan.y / this.zoom / gridSize) * gridSize;
      const endX = startX + width / this.zoom + gridSize * 2;
      const endY = startY + height / this.zoom + gridSize * 2;

      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }

      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    drawNode(ctx, node) {
      const isSelected = this.selectedNode?.id === node.id;
      const config = this.nodeTypes[node.type];

      // Shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Background
      ctx.fillStyle = "var(--bael-bg-secondary, #12121a)";
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, node.width, node.height, 8);
      ctx.fill();

      ctx.shadowColor = "transparent";

      // Border
      ctx.strokeStyle = isSelected
        ? config.color
        : "var(--bael-border, #2a2a3a)";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Color strip
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, 6, node.height, [8, 0, 0, 8]);
      ctx.fill();

      // Icon
      ctx.font = "20px sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(config.icon, node.x + 28, node.y + node.height / 2);

      // Label
      ctx.font = "13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "var(--bael-text-primary, #fff)";
      ctx.fillText(config.label, node.x + 48, node.y + node.height / 2);

      // Input connector
      if (config.inputs > 0) {
        ctx.fillStyle = "var(--bael-bg-secondary, #12121a)";
        ctx.strokeStyle = "var(--bael-border, #2a2a3a)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y + node.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Output connector(s)
      if (config.outputs > 0) {
        const spacing = node.height / (config.outputs + 1);
        for (let i = 0; i < config.outputs; i++) {
          const y = node.y + spacing * (i + 1);
          ctx.fillStyle = config.color;
          ctx.beginPath();
          ctx.arc(node.x + node.width, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    drawConnection(ctx, from, to, outputIndex = 0) {
      const fromConfig = this.nodeTypes[from.type];
      const spacing = from.height / (fromConfig.outputs + 1);
      const startX = from.x + from.width;
      const startY = from.y + spacing * (outputIndex + 1);
      const endX = to.x;
      const endY = to.y + to.height / 2;

      // Bezier curve
      const midX = (startX + endX) / 2;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(midX, startY, midX, endY, endX, endY);
      ctx.strokeStyle = "var(--bael-accent, #ff3366)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(endY - startY, endX - midX);
      ctx.beginPath();
      ctx.moveTo(endX - 8, endY - 4);
      ctx.lineTo(endX, endY);
      ctx.lineTo(endX - 8, endY + 4);
      ctx.stroke();
    }

    getNodeAt(x, y) {
      const tx = (x - this.pan.x) / this.zoom;
      const ty = (y - this.pan.y) / this.zoom;

      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const node = this.nodes[i];
        if (
          tx >= node.x &&
          tx <= node.x + node.width &&
          ty >= node.y &&
          ty <= node.y + node.height
        ) {
          return node;
        }
      }
      return null;
    }

    getConnectorAt(x, y) {
      const tx = (x - this.pan.x) / this.zoom;
      const ty = (y - this.pan.y) / this.zoom;

      for (const node of this.nodes) {
        const config = this.nodeTypes[node.type];

        // Check output connectors
        if (config.outputs > 0) {
          const spacing = node.height / (config.outputs + 1);
          for (let i = 0; i < config.outputs; i++) {
            const cx = node.x + node.width;
            const cy = node.y + spacing * (i + 1);
            const dist = Math.sqrt((tx - cx) ** 2 + (ty - cy) ** 2);
            if (dist <= 8) {
              return { nodeId: node.id, type: "output", index: i };
            }
          }
        }

        // Check input connector
        if (config.inputs > 0) {
          const cx = node.x;
          const cy = node.y + node.height / 2;
          const dist = Math.sqrt((tx - cx) ** 2 + (ty - cy) ** 2);
          if (dist <= 8) {
            return { nodeId: node.id, type: "input", index: 0 };
          }
        }
      }
      return null;
    }

    handleMouseDown(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check for connector click
      const connector = this.getConnectorAt(x, y);
      if (connector && connector.type === "output") {
        this.connectingFrom = connector;
        return;
      }

      // Check for node click
      const node = this.getNodeAt(x, y);
      if (node) {
        this.draggingNode = node;
        this.selectNode(node);
      } else {
        this.isPanning = true;
        this.selectedNode = null;
        this.updateProperties();
      }

      this.lastMouse = { x, y };
    }

    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.draggingNode) {
        const dx = (x - this.lastMouse.x) / this.zoom;
        const dy = (y - this.lastMouse.y) / this.zoom;
        this.draggingNode.x =
          Math.round((this.draggingNode.x + dx) / this.gridSize) *
          this.gridSize;
        this.draggingNode.y =
          Math.round((this.draggingNode.y + dy) / this.gridSize) *
          this.gridSize;
        this.draw();
      } else if (this.isPanning) {
        this.pan.x += x - this.lastMouse.x;
        this.pan.y += y - this.lastMouse.y;
        this.draw();
      } else if (this.connectingFrom) {
        this.draw();
      }

      this.lastMouse = { x, y };
    }

    handleMouseUp(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.connectingFrom) {
        const connector = this.getConnectorAt(x, y);
        if (
          connector &&
          connector.type === "input" &&
          connector.nodeId !== this.connectingFrom.nodeId
        ) {
          // Create connection
          this.connections.push({
            from: this.connectingFrom.nodeId,
            to: connector.nodeId,
            fromOutput: this.connectingFrom.index,
          });
        }
        this.connectingFrom = null;
        this.draw();
      }

      this.draggingNode = null;
      this.isPanning = false;
    }

    handleWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.min(3, Math.max(0.3, this.zoom * delta));
      this.container.querySelector("#zoom-level").textContent =
        Math.round(this.zoom * 100) + "%";
      this.draw();
    }

    handleDoubleClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = this.getNodeAt(x, y);

      if (!node) {
        // Add prompt node at click position
        this.addNode(
          "prompt",
          (x - this.pan.x) / this.zoom,
          (y - this.pan.y) / this.zoom,
        );
      }
    }

    zoomIn() {
      this.zoom = Math.min(3, this.zoom * 1.2);
      this.container.querySelector("#zoom-level").textContent =
        Math.round(this.zoom * 100) + "%";
      this.draw();
    }

    zoomOut() {
      this.zoom = Math.max(0.3, this.zoom / 1.2);
      this.container.querySelector("#zoom-level").textContent =
        Math.round(this.zoom * 100) + "%";
      this.draw();
    }

    resetView() {
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.container.querySelector("#zoom-level").textContent = "100%";
      this.draw();
    }

    newWorkflow() {
      this.nodes = [];
      this.connections = [];
      this.selectedNode = null;
      this.nodeIdCounter = 0;
      this.currentWorkflow = null;
      this.container.querySelector("#workflow-name").value =
        "Untitled Workflow";
      this.updateProperties();
      this.resetView();

      // Add default start node
      this.addNode("start", 100, 200);
    }

    saveWorkflow() {
      const name =
        this.container.querySelector("#workflow-name").value ||
        "Untitled Workflow";
      const workflow = {
        id: this.currentWorkflow?.id || Date.now(),
        name,
        nodes: this.nodes,
        connections: this.connections,
        nodeIdCounter: this.nodeIdCounter,
        savedAt: new Date().toISOString(),
      };

      // Update or add
      const existingIndex = this.workflows.findIndex(
        (w) => w.id === workflow.id,
      );
      if (existingIndex >= 0) {
        this.workflows[existingIndex] = workflow;
      } else {
        this.workflows.push(workflow);
      }

      this.currentWorkflow = workflow;
      localStorage.setItem("bael_workflows", JSON.stringify(this.workflows));

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Workflow "${name}" saved`);
      }
    }

    loadWorkflows() {
      try {
        this.workflows =
          JSON.parse(localStorage.getItem("bael_workflows")) || [];
      } catch (e) {
        this.workflows = [];
      }
    }

    showLoadModal() {
      const list = this.container.querySelector("#workflow-list");

      if (this.workflows.length === 0) {
        list.innerHTML = '<p class="no-selection">No saved workflows</p>';
      } else {
        list.innerHTML = this.workflows
          .map(
            (wf) => `
                    <div class="workflow-item" data-id="${wf.id}">
                        <span class="workflow-item-name">${wf.name}</span>
                        <span class="workflow-item-date">${new Date(wf.savedAt).toLocaleDateString()}</span>
                    </div>
                `,
          )
          .join("");

        list.querySelectorAll(".workflow-item").forEach((item) => {
          item.addEventListener("click", () => {
            const id = parseInt(item.dataset.id);
            this.loadWorkflow(id);
            this.container
              .querySelector("#workflow-load-modal")
              .classList.remove("visible");
          });
        });
      }

      this.container
        .querySelector("#workflow-load-modal")
        .classList.add("visible");
    }

    loadWorkflow(id) {
      const workflow = this.workflows.find((w) => w.id === id);
      if (workflow) {
        this.currentWorkflow = workflow;
        this.nodes = workflow.nodes || [];
        this.connections = workflow.connections || [];
        this.nodeIdCounter = workflow.nodeIdCounter || 0;
        this.container.querySelector("#workflow-name").value = workflow.name;
        this.selectedNode = null;
        this.updateProperties();
        this.resetView();
      }
    }

    async runWorkflow() {
      if (this.nodes.length === 0) {
        if (window.BaelNotifications) {
          window.BaelNotifications.warning("No nodes in workflow");
        }
        return;
      }

      if (window.BaelNotifications) {
        window.BaelNotifications.info("Running workflow...");
      }

      // Find start node
      const startNode = this.nodes.find((n) => n.type === "start");
      if (!startNode) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("No start node found");
        }
        return;
      }

      // Execute workflow
      await this.executeNode(startNode);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Workflow completed");
      }
    }

    async executeNode(node) {
      console.log(`Executing node: ${node.type}`, node.config);

      // Highlight current node
      const originalColor = this.nodeTypes[node.type].color;
      this.nodeTypes[node.type].color = "#00ff00";
      this.draw();

      await new Promise((resolve) => setTimeout(resolve, 500));

      this.nodeTypes[node.type].color = originalColor;
      this.draw();

      // Find next nodes
      const outgoingConnections = this.connections.filter(
        (c) => c.from === node.id,
      );

      for (const conn of outgoingConnections) {
        const nextNode = this.nodes.find((n) => n.id === conn.to);
        if (nextNode) {
          await this.executeNode(nextNode);
        }
      }
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.resizeCanvas();

      if (this.nodes.length === 0) {
        this.newWorkflow();
      }
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  // Initialize
  window.BaelWorkflowBuilder = new BaelWorkflowBuilder();
})();
