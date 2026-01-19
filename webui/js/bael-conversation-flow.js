/**
 * BAEL - LORD OF ALL
 * Conversation Flow - Visual conversation branching and navigation
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelConversationFlow {
    constructor() {
      this.panel = null;
      this.canvas = null;
      this.ctx = null;
      this.nodes = [];
      this.connections = [];
      this.selectedNode = null;
      this.scale = 1;
      this.offset = { x: 0, y: 0 };
      this.isDragging = false;
      this.init();
    }

    init() {
      this.addStyles();
      this.createUI();
      this.bindEvents();
      this.generateSampleFlow();
      console.log("🌊 Bael Conversation Flow initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-flow-styles";
      styles.textContent = `
                /* Flow Panel */
                .bael-flow-panel {
                    position: fixed;
                    inset: 60px 20px 20px 20px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100035;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-flow-panel.visible {
                    display: flex;
                    animation: flowAppear 0.3s ease;
                }

                @keyframes flowAppear {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                /* Header */
                .flow-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .flow-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .flow-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .flow-zoom {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 6px;
                }

                .zoom-btn {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                    border-radius: 4px;
                }

                .zoom-btn:hover {
                    background: var(--bael-bg-secondary, #12121a);
                    color: var(--bael-text-primary, #fff);
                }

                .zoom-level {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    min-width: 40px;
                    text-align: center;
                }

                .flow-action {
                    padding: 6px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .flow-action:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .flow-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 18px;
                }

                .flow-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Canvas Container */
                .flow-canvas-container {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    background:
                        linear-gradient(var(--bael-border, #2a2a3a) 1px, transparent 1px),
                        linear-gradient(90deg, var(--bael-border, #2a2a3a) 1px, transparent 1px);
                    background-size: 40px 40px;
                    background-position: center center;
                }

                .flow-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    cursor: grab;
                }

                .flow-canvas.dragging {
                    cursor: grabbing;
                }

                /* Nodes */
                .flow-node {
                    position: absolute;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 12px 16px;
                    min-width: 180px;
                    max-width: 250px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 10;
                }

                .flow-node:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.02);
                }

                .flow-node.selected {
                    border-color: var(--bael-accent, #ff3366);
                    box-shadow: 0 0 20px rgba(255, 51, 102, 0.3);
                }

                .flow-node.user {
                    border-color: #6366f1;
                }

                .flow-node.assistant {
                    border-color: #4ade80;
                }

                .flow-node.branched {
                    border-style: dashed;
                }

                .node-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .node-type {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .node-type.user {
                    color: #6366f1;
                }

                .node-type.assistant {
                    color: #4ade80;
                }

                .node-id {
                    font-size: 9px;
                    color: var(--bael-text-muted, #555);
                }

                .node-content {
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.4;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                }

                .node-meta {
                    margin-top: 8px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                /* Mini-map */
                .flow-minimap {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    width: 150px;
                    height: 100px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .minimap-viewport {
                    position: absolute;
                    border: 2px solid var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .minimap-node {
                    position: absolute;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 2px;
                }

                /* Side panel */
                .flow-sidebar {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 100%;
                    background: var(--bael-bg-secondary, #12121a);
                    border-left: 1px solid var(--bael-border, #2a2a3a);
                    display: none;
                    flex-direction: column;
                }

                .flow-sidebar.visible {
                    display: flex;
                }

                .sidebar-header {
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sidebar-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .sidebar-close {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .sidebar-content {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }

                .detail-section {
                    margin-bottom: 16px;
                }

                .detail-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }

                .detail-value {
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.5;
                }

                .sidebar-actions {
                    padding: 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sidebar-btn {
                    padding: 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .sidebar-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .sidebar-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Floating button */
                .bael-flow-btn {
                    position: fixed;
                    bottom: 360px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 100005;
                    transition: all 0.3s ease;
                }

                .bael-flow-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Floating button
      const button = document.createElement("button");
      button.className = "bael-flow-btn";
      button.innerHTML = "🌊";
      button.title = "Conversation Flow (Ctrl+Shift+G)";
      button.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(button);
      this.button = button;

      // Main panel
      const panel = document.createElement("div");
      panel.className = "bael-flow-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.canvas = panel.querySelector(".flow-canvas");
      this.sidebar = panel.querySelector(".flow-sidebar");

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="flow-header">
                    <div class="flow-title">
                        <span>🌊</span>
                        <span>Conversation Flow</span>
                    </div>
                    <div class="flow-controls">
                        <div class="flow-zoom">
                            <button class="zoom-btn" id="zoom-out">−</button>
                            <span class="zoom-level" id="zoom-level">100%</span>
                            <button class="zoom-btn" id="zoom-in">+</button>
                        </div>
                        <button class="flow-action" id="fit-view">Fit View</button>
                        <button class="flow-action" id="export-flow">Export</button>
                        <button class="flow-close">×</button>
                    </div>
                </div>

                <div class="flow-canvas-container">
                    <div class="flow-canvas" id="flow-canvas">
                        <!-- Nodes will be rendered here -->
                    </div>

                    <div class="flow-minimap" id="flow-minimap">
                        <div class="minimap-viewport"></div>
                    </div>

                    <div class="flow-sidebar">
                        <div class="sidebar-header">
                            <span class="sidebar-title">Node Details</span>
                            <button class="sidebar-close">×</button>
                        </div>
                        <div class="sidebar-content" id="sidebar-content">
                            <!-- Node details will be rendered here -->
                        </div>
                        <div class="sidebar-actions">
                            <button class="sidebar-btn" id="go-to-message">Go to Message</button>
                            <button class="sidebar-btn" id="branch-from">Branch from Here</button>
                            <button class="sidebar-btn primary" id="continue-from">Continue from Here</button>
                        </div>
                    </div>
                </div>
            `;
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".flow-close")
        .addEventListener("click", () => this.closePanel());
      this.panel
        .querySelector("#zoom-in")
        .addEventListener("click", () => this.zoom(0.1));
      this.panel
        .querySelector("#zoom-out")
        .addEventListener("click", () => this.zoom(-0.1));
      this.panel
        .querySelector("#fit-view")
        .addEventListener("click", () => this.fitView());
      this.panel
        .querySelector("#export-flow")
        .addEventListener("click", () => this.exportFlow());
      this.panel
        .querySelector(".sidebar-close")
        .addEventListener("click", () => this.closeSidebar());

      // Canvas panning
      this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
      this.canvas.addEventListener("mousemove", (e) => this.drag(e));
      this.canvas.addEventListener("mouseup", () => this.endDrag());
      this.canvas.addEventListener("mouseleave", () => this.endDrag());

      // Zoom with wheel
      this.panel
        .querySelector(".flow-canvas-container")
        .addEventListener("wheel", (e) => {
          e.preventDefault();
          this.zoom(e.deltaY > 0 ? -0.1 : 0.1);
        });
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "G") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    generateSampleFlow() {
      // Generate sample conversation nodes
      this.nodes = [
        {
          id: 1,
          type: "user",
          content: "Hello, can you help me with a Python script?",
          x: 100,
          y: 100,
          tokens: 12,
        },
        {
          id: 2,
          type: "assistant",
          content:
            "Of course! I'd be happy to help you with a Python script. What would you like to accomplish?",
          x: 100,
          y: 250,
          tokens: 24,
          parent: 1,
        },
        {
          id: 3,
          type: "user",
          content: "I need to parse a JSON file and extract specific fields",
          x: 100,
          y: 400,
          tokens: 15,
          parent: 2,
        },
        {
          id: 4,
          type: "assistant",
          content:
            "Here's a Python script that parses JSON and extracts specific fields...",
          x: 100,
          y: 550,
          tokens: 156,
          parent: 3,
        },
        {
          id: 5,
          type: "user",
          content: "Actually, can we use pandas instead?",
          x: 350,
          y: 550,
          tokens: 10,
          parent: 3,
          branched: true,
        },
        {
          id: 6,
          type: "assistant",
          content: "Sure! Here's the pandas version of the script...",
          x: 350,
          y: 700,
          tokens: 142,
          parent: 5,
        },
      ];

      this.connections = this.nodes
        .filter((n) => n.parent)
        .map((n) => ({
          from: n.parent,
          to: n.id,
          branched: n.branched,
        }));
    }

    renderFlow() {
      this.canvas.innerHTML = "";

      // Render connections first (behind nodes)
      this.renderConnections();

      // Render nodes
      this.nodes.forEach((node) => {
        const nodeEl = this.createNodeElement(node);
        this.canvas.appendChild(nodeEl);
      });

      this.updateCanvasTransform();
      this.updateMinimap();
    }

    createNodeElement(node) {
      const el = document.createElement("div");
      el.className = `flow-node ${node.type} ${node.branched ? "branched" : ""} ${this.selectedNode === node.id ? "selected" : ""}`;
      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;
      el.dataset.id = node.id;

      el.innerHTML = `
                <div class="node-header">
                    <span class="node-type ${node.type}">${node.type}</span>
                    <span class="node-id">#${node.id}</span>
                </div>
                <div class="node-content">${this.escapeHtml(node.content)}</div>
                <div class="node-meta">
                    <span>${node.tokens} tokens</span>
                    ${node.branched ? "<span>⑂ Branched</span>" : ""}
                </div>
            `;

      el.addEventListener("click", () => this.selectNode(node.id));
      el.addEventListener("dblclick", () => this.goToMessage(node.id));

      return el;
    }

    renderConnections() {
      // Create SVG for connections
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "2000px";
      svg.style.height = "2000px";
      svg.style.pointerEvents = "none";
      svg.style.zIndex = "1";

      this.connections.forEach((conn) => {
        const fromNode = this.nodes.find((n) => n.id === conn.from);
        const toNode = this.nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        const fromX = fromNode.x + 100;
        const fromY = fromNode.y + 80;
        const toX = toNode.x + 100;
        const toY = toNode.y;

        const midY = (fromY + toY) / 2;
        const d = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute(
          "stroke",
          conn.branched ? "#fbbf24" : "var(--bael-border, #2a2a3a)",
        );
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-dasharray", conn.branched ? "5,5" : "none");

        svg.appendChild(path);
      });

      this.canvas.appendChild(svg);
    }

    selectNode(id) {
      this.selectedNode = id;
      this.renderFlow();
      this.showNodeDetails(id);
    }

    showNodeDetails(id) {
      const node = this.nodes.find((n) => n.id === id);
      if (!node) return;

      const content = this.panel.querySelector("#sidebar-content");
      content.innerHTML = `
                <div class="detail-section">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">${this.capitalizeFirst(node.type)}</div>
                </div>
                <div class="detail-section">
                    <div class="detail-label">Content</div>
                    <div class="detail-value">${this.escapeHtml(node.content)}</div>
                </div>
                <div class="detail-section">
                    <div class="detail-label">Tokens</div>
                    <div class="detail-value">${node.tokens}</div>
                </div>
                ${
                  node.branched
                    ? `
                    <div class="detail-section">
                        <div class="detail-label">Branch Info</div>
                        <div class="detail-value">This message creates an alternate branch</div>
                    </div>
                `
                    : ""
                }
            `;

      this.sidebar.classList.add("visible");
    }

    closeSidebar() {
      this.sidebar.classList.remove("visible");
      this.selectedNode = null;
      this.renderFlow();
    }

    goToMessage(id) {
      // In production, this would scroll to the actual message in chat
      if (window.BaelNotifications) {
        window.BaelNotifications.info(`Navigating to message #${id}`);
      }
      this.closePanel();
    }

    startDrag(e) {
      if (
        e.target.classList.contains("flow-node") ||
        e.target.closest(".flow-node")
      )
        return;
      this.isDragging = true;
      this.dragStart = {
        x: e.clientX - this.offset.x,
        y: e.clientY - this.offset.y,
      };
      this.canvas.classList.add("dragging");
    }

    drag(e) {
      if (!this.isDragging) return;
      this.offset.x = e.clientX - this.dragStart.x;
      this.offset.y = e.clientY - this.dragStart.y;
      this.updateCanvasTransform();
    }

    endDrag() {
      this.isDragging = false;
      this.canvas.classList.remove("dragging");
    }

    zoom(delta) {
      this.scale = Math.max(0.25, Math.min(2, this.scale + delta));
      this.updateCanvasTransform();
      this.panel.querySelector("#zoom-level").textContent =
        `${Math.round(this.scale * 100)}%`;
    }

    updateCanvasTransform() {
      this.canvas.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.scale})`;
      this.updateMinimap();
    }

    fitView() {
      // Calculate bounding box of all nodes
      if (this.nodes.length === 0) return;

      const minX = Math.min(...this.nodes.map((n) => n.x));
      const maxX = Math.max(...this.nodes.map((n) => n.x + 200));
      const minY = Math.min(...this.nodes.map((n) => n.y));
      const maxY = Math.max(...this.nodes.map((n) => n.y + 100));

      const container = this.panel.querySelector(".flow-canvas-container");
      const width = container.clientWidth;
      const height = container.clientHeight;

      const scaleX = width / (maxX - minX + 100);
      const scaleY = height / (maxY - minY + 100);
      this.scale = Math.min(scaleX, scaleY, 1);

      this.offset.x =
        (width - (maxX - minX) * this.scale) / 2 - minX * this.scale;
      this.offset.y =
        (height - (maxY - minY) * this.scale) / 2 - minY * this.scale;

      this.updateCanvasTransform();
      this.panel.querySelector("#zoom-level").textContent =
        `${Math.round(this.scale * 100)}%`;
    }

    updateMinimap() {
      const minimap = this.panel.querySelector("#flow-minimap");
      const viewport = minimap.querySelector(".minimap-viewport");

      // Clear existing nodes
      minimap.querySelectorAll(".minimap-node").forEach((n) => n.remove());

      // Scale factor for minimap
      const scale = 0.05;

      // Render mini nodes
      this.nodes.forEach((node) => {
        const miniNode = document.createElement("div");
        miniNode.className = "minimap-node";
        miniNode.style.left = `${node.x * scale}px`;
        miniNode.style.top = `${node.y * scale}px`;
        miniNode.style.width = "10px";
        miniNode.style.height = "6px";
        minimap.appendChild(miniNode);
      });
    }

    exportFlow() {
      const data = {
        nodes: this.nodes,
        connections: this.connections,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-conversation-flow-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Flow exported!");
      }
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.renderFlow();
        setTimeout(() => this.fitView(), 100);
      }
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelConversationFlow = new BaelConversationFlow();
})();
