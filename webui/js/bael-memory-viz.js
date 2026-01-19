/**
 * BAEL - LORD OF ALL
 * Memory Visualization - Visual representation of agent memory and knowledge
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMemoryViz {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.ctx = null;
      this.nodes = [];
      this.connections = [];
      this.isVisible = false;
      this.animationFrame = null;
      this.hoveredNode = null;
      this.selectedNode = null;
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.isDragging = false;
      this.dragStart = { x: 0, y: 0 };
      this.lastMouse = { x: 0, y: 0 };
      this.categories = {
        solution: { color: "#4caf50", icon: "💡" },
        fragment: { color: "#2196f3", icon: "📝" },
        metadata: { color: "#9c27b0", icon: "🏷️" },
        knowledge: { color: "#ff9800", icon: "📚" },
        user: { color: "#ff3366", icon: "👤" },
      };
      this.init();
    }

    init() {
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      console.log("🧠 Bael Memory Visualization initialized");
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-memory-viz";
      container.className = "bael-memory-viz";
      container.innerHTML = `
                <div class="memory-viz-header">
                    <div class="memory-viz-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        <span>Memory Visualization</span>
                    </div>
                    <div class="memory-viz-controls">
                        <button class="memory-control-btn" id="memory-refresh" title="Refresh">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                        <button class="memory-control-btn" id="memory-zoom-in" title="Zoom In">+</button>
                        <button class="memory-control-btn" id="memory-zoom-out" title="Zoom Out">−</button>
                        <button class="memory-control-btn" id="memory-reset-view" title="Reset View">⌂</button>
                    </div>
                    <button class="memory-viz-close" id="memory-viz-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="memory-viz-sidebar">
                    <div class="memory-viz-search">
                        <input type="text" id="memory-search-input" placeholder="Search memories...">
                    </div>
                    <div class="memory-viz-filters">
                        <label class="memory-filter">
                            <input type="checkbox" checked data-category="solution">
                            <span class="filter-dot" style="background: #4caf50"></span>
                            Solutions
                        </label>
                        <label class="memory-filter">
                            <input type="checkbox" checked data-category="fragment">
                            <span class="filter-dot" style="background: #2196f3"></span>
                            Fragments
                        </label>
                        <label class="memory-filter">
                            <input type="checkbox" checked data-category="metadata">
                            <span class="filter-dot" style="background: #9c27b0"></span>
                            Metadata
                        </label>
                        <label class="memory-filter">
                            <input type="checkbox" checked data-category="knowledge">
                            <span class="filter-dot" style="background: #ff9800"></span>
                            Knowledge
                        </label>
                        <label class="memory-filter">
                            <input type="checkbox" checked data-category="user">
                            <span class="filter-dot" style="background: #ff3366"></span>
                            User Data
                        </label>
                    </div>
                    <div class="memory-viz-stats">
                        <div class="memory-stat">
                            <span class="stat-value" id="stat-total">0</span>
                            <span class="stat-label">Total Memories</span>
                        </div>
                        <div class="memory-stat">
                            <span class="stat-value" id="stat-connections">0</span>
                            <span class="stat-label">Connections</span>
                        </div>
                    </div>
                </div>

                <div class="memory-viz-canvas-container">
                    <canvas id="memory-canvas"></canvas>
                    <div class="memory-viz-tooltip" id="memory-tooltip"></div>
                </div>

                <div class="memory-viz-detail" id="memory-detail">
                    <div class="detail-header">
                        <span class="detail-category"></span>
                        <button class="detail-close">×</button>
                    </div>
                    <div class="detail-content">
                        <h4 class="detail-title"></h4>
                        <p class="detail-text"></p>
                        <div class="detail-meta"></div>
                    </div>
                    <div class="detail-actions">
                        <button class="detail-btn" data-action="delete">Delete</button>
                        <button class="detail-btn primary" data-action="edit">Edit</button>
                    </div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;
      this.canvas = container.querySelector("#memory-canvas");
      this.ctx = this.canvas.getContext("2d");
    }

    addStyles() {
      if (document.getElementById("bael-memory-viz-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-memory-viz-styles";
      styles.textContent = `
                .bael-memory-viz {
                    position: fixed;
                    inset: 0;
                    background: var(--bael-bg-primary, #0a0a0f);
                    z-index: 100010;
                    display: none;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .bael-memory-viz.visible {
                    display: block;
                    animation: memoryFadeIn 0.3s ease;
                }

                @keyframes memoryFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .memory-viz-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 56px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    z-index: 10;
                }

                .memory-viz-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .memory-viz-title svg {
                    width: 24px;
                    height: 24px;
                    color: var(--bael-accent, #ff3366);
                }

                .memory-viz-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .memory-control-btn {
                    width: 32px;
                    height: 32px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: var(--bael-bg-primary, #0a0a0f);
                    color: var(--bael-text-primary, #fff);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all 0.2s ease;
                }

                .memory-control-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .memory-control-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .memory-viz-close {
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

                .memory-viz-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .memory-viz-close svg {
                    width: 20px;
                    height: 20px;
                }

                .memory-viz-sidebar {
                    position: absolute;
                    top: 56px;
                    left: 0;
                    width: 280px;
                    bottom: 0;
                    background: var(--bael-bg-secondary, #12121a);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    overflow-y: auto;
                }

                .memory-viz-search input {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    outline: none;
                }

                .memory-viz-search input:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .memory-viz-filters {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .memory-filter {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    color: var(--bael-text-secondary, #aaa);
                }

                .memory-filter input {
                    display: none;
                }

                .filter-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    transition: opacity 0.2s ease;
                }

                .memory-filter input:not(:checked) ~ .filter-dot {
                    opacity: 0.3;
                }

                .memory-viz-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-radius: 12px;
                }

                .memory-stat {
                    text-align: center;
                }

                .stat-value {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--bael-accent, #ff3366);
                }

                .stat-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .memory-viz-canvas-container {
                    position: absolute;
                    top: 56px;
                    left: 280px;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                }

                #memory-canvas {
                    width: 100%;
                    height: 100%;
                    cursor: grab;
                }

                #memory-canvas:active {
                    cursor: grabbing;
                }

                .memory-viz-tooltip {
                    position: absolute;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    max-width: 300px;
                    z-index: 100;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                }

                .memory-viz-tooltip.visible {
                    opacity: 1;
                }

                .memory-viz-detail {
                    position: absolute;
                    right: 20px;
                    top: 76px;
                    width: 350px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    display: none;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }

                .memory-viz-detail.visible {
                    display: block;
                    animation: detailSlideIn 0.3s ease;
                }

                @keyframes detailSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .detail-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .detail-category {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--bael-accent, #ff3366);
                }

                .detail-close {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 18px;
                    line-height: 1;
                }

                .detail-content {
                    padding: 16px;
                }

                .detail-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin: 0 0 12px 0;
                }

                .detail-text {
                    font-size: 14px;
                    color: var(--bael-text-secondary, #aaa);
                    margin: 0 0 16px 0;
                    line-height: 1.6;
                }

                .detail-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .detail-meta span {
                    padding: 4px 8px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-radius: 4px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .detail-actions {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .detail-btn {
                    flex: 1;
                    padding: 10px 16px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-secondary, #aaa);
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .detail-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--bael-text-primary, #fff);
                }

                .detail-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .detail-btn.primary:hover {
                    background: var(--bael-accent-hover, #ff4d7a);
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close button
      this.container
        .querySelector("#memory-viz-close")
        .addEventListener("click", () => this.close());

      // Control buttons
      this.container
        .querySelector("#memory-refresh")
        .addEventListener("click", () => this.loadMemories());
      this.container
        .querySelector("#memory-zoom-in")
        .addEventListener("click", () => this.zoomIn());
      this.container
        .querySelector("#memory-zoom-out")
        .addEventListener("click", () => this.zoomOut());
      this.container
        .querySelector("#memory-reset-view")
        .addEventListener("click", () => this.resetView());

      // Search
      this.container
        .querySelector("#memory-search-input")
        .addEventListener("input", (e) => {
          this.filterBySearch(e.target.value);
        });

      // Filters
      this.container
        .querySelectorAll(".memory-filter input")
        .forEach((input) => {
          input.addEventListener("change", () => this.applyFilters());
        });

      // Canvas interactions
      this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
      this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
      this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
      this.canvas.addEventListener("wheel", (e) => this.handleWheel(e));
      this.canvas.addEventListener("click", (e) => this.handleClick(e));

      // Detail panel close
      this.container
        .querySelector(".detail-close")
        .addEventListener("click", () => {
          this.container
            .querySelector("#memory-detail")
            .classList.remove("visible");
          this.selectedNode = null;
        });

      // Escape to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });

      // Resize handler
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

    generateSampleMemories() {
      // Generate sample data for visualization
      const categories = Object.keys(this.categories);
      const count = 50 + Math.floor(Math.random() * 50);
      const nodes = [];

      const containerWidth = this.canvas.width / window.devicePixelRatio;
      const containerHeight = this.canvas.height / window.devicePixelRatio;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      for (let i = 0; i < count; i++) {
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const angle = (i / count) * Math.PI * 2;
        const radius = 100 + Math.random() * 200;

        nodes.push({
          id: i,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          radius: 8 + Math.random() * 12,
          category,
          title: `Memory ${i + 1}`,
          content: `Sample memory content for node ${i + 1}. This represents stored knowledge or experience.`,
          timestamp: Date.now() - Math.random() * 86400000 * 30,
          visible: true,
        });
      }

      // Generate connections
      const connections = [];
      nodes.forEach((node, i) => {
        const connectionCount = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < connectionCount; j++) {
          const target = Math.floor(Math.random() * nodes.length);
          if (target !== i) {
            connections.push({
              source: i,
              target,
              strength: 0.2 + Math.random() * 0.8,
            });
          }
        }
      });

      this.nodes = nodes;
      this.connections = connections;
      this.updateStats();
    }

    updateStats() {
      this.container.querySelector("#stat-total").textContent =
        this.nodes.filter((n) => n.visible).length;
      this.container.querySelector("#stat-connections").textContent =
        this.connections.length;
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

      // Apply transformations
      ctx.save();
      ctx.translate(this.pan.x, this.pan.y);
      ctx.scale(this.zoom, this.zoom);

      // Draw grid
      this.drawGrid(ctx, width, height);

      // Draw connections
      this.connections.forEach((conn) => {
        const source = this.nodes[conn.source];
        const target = this.nodes[conn.target];

        if (!source.visible || !target.visible) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = `rgba(255, 51, 102, ${conn.strength * 0.2})`;
        ctx.lineWidth = conn.strength * 2;
        ctx.stroke();
      });

      // Draw nodes
      this.nodes.forEach((node) => {
        if (!node.visible) return;

        const cat = this.categories[node.category];
        const isHovered = node === this.hoveredNode;
        const isSelected = node === this.selectedNode;

        // Glow effect
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            node.radius,
            node.x,
            node.y,
            node.radius + 20,
          );
          gradient.addColorStop(0, cat.color + "80");
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = cat.color;
        ctx.fill();

        // Border
        if (isSelected) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Icon
        ctx.font = `${node.radius}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cat.icon, node.x, node.y);
      });

      ctx.restore();
    }

    drawGrid(ctx, width, height) {
      const gridSize = 50 * this.zoom;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;

      for (
        let x = this.pan.x % gridSize;
        x < width / this.zoom;
        x += gridSize
      ) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height / this.zoom);
        ctx.stroke();
      }

      for (
        let y = this.pan.y % gridSize;
        y < height / this.zoom;
        y += gridSize
      ) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width / this.zoom, y);
        ctx.stroke();
      }
    }

    getNodeAtPosition(x, y) {
      // Transform coordinates
      const tx = (x - this.pan.x) / this.zoom;
      const ty = (y - this.pan.y) / this.zoom;

      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const node = this.nodes[i];
        if (!node.visible) continue;

        const dx = tx - node.x;
        const dy = ty - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= node.radius) {
          return node;
        }
      }
      return null;
    }

    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.isDragging) {
        this.pan.x += x - this.lastMouse.x;
        this.pan.y += y - this.lastMouse.y;
        this.draw();
      } else {
        const node = this.getNodeAtPosition(x, y);

        if (node !== this.hoveredNode) {
          this.hoveredNode = node;
          this.draw();
        }

        const tooltip = this.container.querySelector("#memory-tooltip");
        if (node) {
          tooltip.textContent = node.title;
          tooltip.style.left = `${e.clientX - rect.left + 15}px`;
          tooltip.style.top = `${e.clientY - rect.top + 15}px`;
          tooltip.classList.add("visible");
          this.canvas.style.cursor = "pointer";
        } else {
          tooltip.classList.remove("visible");
          this.canvas.style.cursor = "grab";
        }
      }

      this.lastMouse = { x, y };
    }

    handleMouseDown(e) {
      this.isDragging = true;
      this.canvas.style.cursor = "grabbing";
    }

    handleMouseUp(e) {
      this.isDragging = false;
      this.canvas.style.cursor = this.hoveredNode ? "pointer" : "grab";
    }

    handleWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.min(3, Math.max(0.3, this.zoom * delta));
      this.draw();
    }

    handleClick(e) {
      if (this.hoveredNode) {
        this.selectedNode = this.hoveredNode;
        this.showDetail(this.hoveredNode);
        this.draw();
      }
    }

    showDetail(node) {
      const detail = this.container.querySelector("#memory-detail");
      const cat = this.categories[node.category];

      detail.querySelector(".detail-category").textContent =
        `${cat.icon} ${node.category}`;
      detail.querySelector(".detail-category").style.color = cat.color;
      detail.querySelector(".detail-title").textContent = node.title;
      detail.querySelector(".detail-text").textContent = node.content;
      detail.querySelector(".detail-meta").innerHTML = `
                <span>ID: ${node.id}</span>
                <span>${new Date(node.timestamp).toLocaleDateString()}</span>
            `;
      detail.classList.add("visible");
    }

    filterBySearch(query) {
      query = query.toLowerCase();
      this.nodes.forEach((node) => {
        if (!query) {
          node.visible = true;
        } else {
          node.visible =
            node.title.toLowerCase().includes(query) ||
            node.content.toLowerCase().includes(query);
        }
      });
      this.updateStats();
      this.draw();
    }

    applyFilters() {
      const activeCategories = new Set();
      this.container
        .querySelectorAll(".memory-filter input:checked")
        .forEach((input) => {
          activeCategories.add(input.dataset.category);
        });

      this.nodes.forEach((node) => {
        node.visible = activeCategories.has(node.category);
      });
      this.updateStats();
      this.draw();
    }

    zoomIn() {
      this.zoom = Math.min(3, this.zoom * 1.2);
      this.draw();
    }

    zoomOut() {
      this.zoom = Math.max(0.3, this.zoom / 1.2);
      this.draw();
    }

    resetView() {
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.draw();
    }

    loadMemories() {
      // In real implementation, fetch from API
      this.generateSampleMemories();
      this.draw();
    }

    animate() {
      // Simple physics simulation for organic layout
      const damping = 0.95;
      const repulsion = 500;
      const attraction = 0.01;

      // Apply forces
      this.nodes.forEach((node, i) => {
        if (!node.visible) return;

        // Repulsion from other nodes
        this.nodes.forEach((other, j) => {
          if (i === j || !other.visible) return;

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);

          node.vx += (dx / dist) * force * 0.1;
          node.vy += (dy / dist) * force * 0.1;
        });

        // Attraction to center
        const cx = this.canvas.width / window.devicePixelRatio / 2;
        const cy = this.canvas.height / window.devicePixelRatio / 2;
        node.vx += (cx - node.x) * attraction;
        node.vy += (cy - node.y) * attraction;

        // Apply velocity with damping
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      });

      this.draw();

      if (this.isVisible) {
        this.animationFrame = requestAnimationFrame(() => this.animate());
      }
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.resizeCanvas();
      this.loadMemories();
      this.animate();
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
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
  window.BaelMemoryViz = new BaelMemoryViz();
})();
