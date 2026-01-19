/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * KNOWLEDGE GRAPH VISUALIZER - Relationship Mapping
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Visualize conversation knowledge and relationships:
 * - Entity extraction
 * - Relationship mapping
 * - Interactive graph
 * - Concept clustering
 * - Memory integration
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelKnowledgeGraph {
    constructor() {
      this.nodes = new Map();
      this.edges = [];
      this.clusters = new Map();
      this.canvas = null;
      this.ctx = null;
      this.panel = null;
      this.isVisible = false;
      this.selectedNode = null;
      this.draggingNode = null;
      this.offset = { x: 0, y: 0 };
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };

      this.init();
    }

    init() {
      this.loadGraph();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("🕸️ Bael Knowledge Graph initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // NODE MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    addNode(label, type = "concept", data = {}) {
      const id =
        "node_" +
        Date.now().toString(36) +
        Math.random().toString(36).substr(2, 4);

      const node = {
        id,
        label,
        type, // concept, entity, topic, action
        data,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        vx: 0,
        vy: 0,
        size: this.getNodeSize(type),
        color: this.getNodeColor(type),
        createdAt: new Date(),
        mentions: 1,
      };

      this.nodes.set(id, node);
      this.saveGraph();
      return node;
    }

    addEdge(sourceId, targetId, relation = "related", strength = 1) {
      const source = this.nodes.get(sourceId);
      const target = this.nodes.get(targetId);
      if (!source || !target) return null;

      // Check for existing edge
      const existing = this.edges.find(
        (e) =>
          (e.source === sourceId && e.target === targetId) ||
          (e.source === targetId && e.target === sourceId),
      );

      if (existing) {
        existing.strength++;
        return existing;
      }

      const edge = {
        id: "edge_" + Date.now().toString(36),
        source: sourceId,
        target: targetId,
        relation,
        strength,
      };

      this.edges.push(edge);
      this.saveGraph();
      return edge;
    }

    removeNode(nodeId) {
      this.nodes.delete(nodeId);
      this.edges = this.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      );
      this.saveGraph();
    }

    findNodeByLabel(label) {
      for (const node of this.nodes.values()) {
        if (node.label.toLowerCase() === label.toLowerCase()) {
          return node;
        }
      }
      return null;
    }

    getOrCreateNode(label, type = "concept") {
      let node = this.findNodeByLabel(label);
      if (node) {
        node.mentions++;
        return node;
      }
      return this.addNode(label, type);
    }

    getNodeSize(type) {
      const sizes = {
        topic: 30,
        entity: 25,
        concept: 20,
        action: 15,
      };
      return sizes[type] || 20;
    }

    getNodeColor(type) {
      const colors = {
        topic: "#ff3366",
        entity: "#10b981",
        concept: "#6366f1",
        action: "#f59e0b",
      };
      return colors[type] || "#888";
    }

    // ═════════════════════════════════════════════════════════════════
    // ENTITY EXTRACTION
    // ═════════════════════════════════════════════════════════════════

    extractFromText(text) {
      const entities = [];

      // Simple pattern-based extraction
      // Names (capitalized words)
      const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
      const names = text.match(namePattern) || [];
      names.forEach((name) => {
        if (name.length > 2 && !this.isCommonWord(name)) {
          entities.push({ label: name, type: "entity" });
        }
      });

      // Technical terms (CamelCase, snake_case)
      const techPattern = /\b[a-z]+(?:[A-Z][a-z]+)+\b|\b[a-z]+(?:_[a-z]+)+\b/g;
      const techTerms = text.match(techPattern) || [];
      techTerms.forEach((term) => {
        entities.push({ label: term, type: "concept" });
      });

      // Keywords/topics (frequent nouns - simplified)
      const words = text.toLowerCase().split(/\W+/);
      const wordCount = {};
      words.forEach((w) => {
        if (w.length > 4 && !this.isStopWord(w)) {
          wordCount[w] = (wordCount[w] || 0) + 1;
        }
      });

      Object.entries(wordCount)
        .filter(([, count]) => count >= 2)
        .forEach(([word]) => {
          entities.push({ label: word, type: "topic" });
        });

      return entities;
    }

    isCommonWord(word) {
      const common = [
        "The",
        "This",
        "That",
        "There",
        "Here",
        "What",
        "When",
        "Where",
        "How",
        "Why",
      ];
      return common.includes(word);
    }

    isStopWord(word) {
      const stopWords = [
        "the",
        "and",
        "but",
        "for",
        "with",
        "this",
        "that",
        "from",
        "have",
        "been",
        "will",
        "would",
        "could",
        "should",
      ];
      return stopWords.includes(word);
    }

    processMessage(text) {
      const entities = this.extractFromText(text);
      const nodeIds = [];

      entities.forEach(({ label, type }) => {
        const node = this.getOrCreateNode(label, type);
        nodeIds.push(node.id);
      });

      // Create edges between entities in same message
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          this.addEdge(nodeIds[i], nodeIds[j], "co-occurs");
        }
      }

      this.saveGraph();
      return entities;
    }

    // ═════════════════════════════════════════════════════════════════
    // PHYSICS SIMULATION
    // ═════════════════════════════════════════════════════════════════

    simulate() {
      const nodes = Array.from(this.nodes.values());
      const damping = 0.9;
      const springLength = 150;
      const springStrength = 0.01;
      const repulsion = 5000;
      const centerGravity = 0.01;

      // Apply forces
      nodes.forEach((node) => {
        // Repulsion from other nodes
        nodes.forEach((other) => {
          if (node.id === other.id) return;

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);

          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        });

        // Attraction to center
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        node.vx += (cx - node.x) * centerGravity;
        node.vy += (cy - node.y) * centerGravity;
      });

      // Edge spring forces
      this.edges.forEach((edge) => {
        const source = this.nodes.get(edge.source);
        const target = this.nodes.get(edge.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - springLength) * springStrength * edge.strength;

        source.vx += (dx / dist) * force;
        source.vy += (dy / dist) * force;
        target.vx -= (dx / dist) * force;
        target.vy -= (dy / dist) * force;
      });

      // Update positions
      nodes.forEach((node) => {
        if (node === this.draggingNode) return;

        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Keep in bounds
        const margin = 50;
        node.x = Math.max(margin, Math.min(this.canvas.width - margin, node.x));
        node.y = Math.max(
          margin,
          Math.min(this.canvas.height - margin, node.y),
        );
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // RENDERING
    // ═════════════════════════════════════════════════════════════════

    render() {
      if (!this.ctx || !this.canvas) return;

      const ctx = this.ctx;
      const width = this.canvas.width;
      const height = this.canvas.height;

      // Clear
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(0, 0, width, height);

      // Apply zoom and pan
      ctx.save();
      ctx.translate(this.pan.x, this.pan.y);
      ctx.scale(this.zoom, this.zoom);

      // Draw edges
      this.edges.forEach((edge) => {
        const source = this.nodes.get(edge.source);
        const target = this.nodes.get(edge.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = `rgba(255,255,255,${0.1 + edge.strength * 0.05})`;
        ctx.lineWidth = 1 + edge.strength * 0.5;
        ctx.stroke();
      });

      // Draw nodes
      for (const node of this.nodes.values()) {
        const isSelected = node === this.selectedNode;
        const size = node.size * (1 + node.mentions * 0.1);

        // Glow effect
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 10, 0, Math.PI * 2);
          ctx.fillStyle = node.color + "40";
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = "#fff";
        ctx.font = `${isSelected ? "bold " : ""}12px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.label, node.x, node.y + size + 5);
      }

      ctx.restore();
    }

    startAnimation() {
      const animate = () => {
        if (this.isVisible) {
          this.simulate();
          this.render();
          requestAnimationFrame(animate);
        }
      };
      animate();
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadGraph() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_knowledge_graph") || "{}",
        );
        if (saved.nodes) {
          Object.entries(saved.nodes).forEach(([id, node]) => {
            this.nodes.set(id, node);
          });
        }
        if (saved.edges) {
          this.edges = saved.edges;
        }
      } catch (e) {
        console.warn("Failed to load knowledge graph:", e);
      }
    }

    saveGraph() {
      const data = {
        nodes: Object.fromEntries(this.nodes),
        edges: this.edges,
      };
      localStorage.setItem("bael_knowledge_graph", JSON.stringify(data));
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-knowledge-panel";
      panel.className = "bael-knowledge-panel";
      panel.innerHTML = `
                <div class="kg-header">
                    <div class="kg-title">
                        <span>🕸️</span>
                        <span>Knowledge Graph</span>
                        <span class="kg-badge">${this.nodes.size} nodes</span>
                    </div>
                    <div class="kg-actions">
                        <button class="kg-btn" id="kg-add-node" title="Add Node">+</button>
                        <button class="kg-btn" id="kg-clear" title="Clear">🗑</button>
                        <button class="kg-btn" id="kg-close">×</button>
                    </div>
                </div>
                <div class="kg-canvas-container">
                    <canvas id="kg-canvas"></canvas>
                </div>
                <div class="kg-info" id="kg-info">
                    <p>Select a node to see details</p>
                </div>
            `;
      document.body.appendChild(panel);
      this.panel = panel;

      this.canvas = panel.querySelector("#kg-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.resizeCanvas();
    }

    resizeCanvas() {
      if (!this.canvas) return;
      const container = this.canvas.parentElement;
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }

    showNodeInfo(node) {
      const info = this.panel.querySelector("#kg-info");
      if (!node) {
        info.innerHTML = "<p>Select a node to see details</p>";
        return;
      }

      const connections = this.edges.filter(
        (e) => e.source === node.id || e.target === node.id,
      );

      info.innerHTML = `
                <div class="kg-node-info">
                    <h4>${node.label}</h4>
                    <p class="kg-type">${node.type}</p>
                    <p class="kg-mentions">${node.mentions} mentions</p>
                    <p class="kg-connections">${connections.length} connections</p>
                    <button class="kg-remove-btn" data-id="${node.id}">Remove</button>
                </div>
            `;

      info.querySelector(".kg-remove-btn")?.addEventListener("click", () => {
        this.removeNode(node.id);
        this.selectedNode = null;
        this.showNodeInfo(null);
      });
    }

    addStyles() {
      if (document.getElementById("bael-knowledge-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-knowledge-styles";
      styles.textContent = `
                .bael-knowledge-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 900px;
                    height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100070;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-knowledge-panel.visible {
                    display: flex;
                    animation: kgIn 0.3s ease;
                }

                @keyframes kgIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .kg-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .kg-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .kg-badge {
                    font-size: 10px;
                    padding: 3px 8px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 20px;
                }

                .kg-actions {
                    display: flex;
                    gap: 8px;
                }

                .kg-btn {
                    width: 32px;
                    height: 32px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    cursor: pointer;
                    font-size: 14px;
                }

                .kg-canvas-container {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }

                #kg-canvas {
                    width: 100%;
                    height: 100%;
                    cursor: grab;
                }

                #kg-canvas:active {
                    cursor: grabbing;
                }

                .kg-info {
                    padding: 16px 20px;
                    border-top: 1px solid var(--color-border, #252535);
                    min-height: 80px;
                }

                .kg-info p {
                    color: var(--color-text-muted, #666);
                    font-size: 13px;
                }

                .kg-node-info h4 {
                    font-size: 15px;
                    color: var(--color-text, #fff);
                    margin-bottom: 6px;
                }

                .kg-node-info p {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                    margin: 2px 0;
                }

                .kg-type {
                    color: var(--color-primary, #ff3366) !important;
                    text-transform: capitalize;
                }

                .kg-remove-btn {
                    margin-top: 10px;
                    padding: 6px 12px;
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid #ef4444;
                    border-radius: 6px;
                    color: #ef4444;
                    font-size: 11px;
                    cursor: pointer;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "G") {
          e.preventDefault();
          this.toggle();
        }
      });

      // Wait for panel to exist
      setTimeout(() => this.bindPanelEvents(), 100);
    }

    bindPanelEvents() {
      if (!this.panel || !this.canvas) return;

      this.panel
        .querySelector("#kg-close")
        ?.addEventListener("click", () => this.close());

      this.panel
        .querySelector("#kg-add-node")
        ?.addEventListener("click", () => {
          const label = prompt("Node label:");
          if (label) {
            const type = prompt(
              "Type (topic/entity/concept/action):",
              "concept",
            );
            this.addNode(label, type || "concept");
          }
        });

      this.panel.querySelector("#kg-clear")?.addEventListener("click", () => {
        if (confirm("Clear all nodes?")) {
          this.nodes.clear();
          this.edges = [];
          this.saveGraph();
        }
      });

      // Canvas interaction
      this.canvas.addEventListener("mousedown", (e) => {
        const node = this.getNodeAtPosition(e.offsetX, e.offsetY);
        if (node) {
          this.draggingNode = node;
          this.selectedNode = node;
          this.offset.x = e.offsetX - node.x;
          this.offset.y = e.offsetY - node.y;
          this.showNodeInfo(node);
        } else {
          this.selectedNode = null;
          this.showNodeInfo(null);
        }
      });

      this.canvas.addEventListener("mousemove", (e) => {
        if (this.draggingNode) {
          this.draggingNode.x = e.offsetX - this.offset.x;
          this.draggingNode.y = e.offsetY - this.offset.y;
        }
      });

      this.canvas.addEventListener("mouseup", () => {
        this.draggingNode = null;
      });

      this.canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.5, Math.min(2, this.zoom * delta));
      });

      window.addEventListener("resize", () => this.resizeCanvas());
    }

    getNodeAtPosition(x, y) {
      for (const node of this.nodes.values()) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.size) {
          return node;
        }
      }
      return null;
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:knowledge:${event}`, { detail: data }),
      );
    }

    open() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.resizeCanvas();
      this.startAnimation();
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelKnowledgeGraph = new BaelKnowledgeGraph();
})();
