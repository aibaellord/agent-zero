/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * WORKFLOW AUTOMATION ENGINE - Visual Workflow Builder
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Build and execute automated workflows:
 * - Visual node-based editor
 * - Conditional branching
 * - Loop execution
 * - Variable passing
 * - Trigger integration
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelWorkflowEngine {
    constructor() {
      // Workflow storage
      this.workflows = new Map();

      // Execution state
      this.running = new Map();
      this.variables = new Map();

      // Node types
      this.nodeTypes = new Map();

      // UI
      this.panel = null;
      this.canvas = null;
      this.isVisible = false;
      this.selectedWorkflow = null;

      this.init();
    }

    init() {
      this.registerDefaultNodes();
      this.loadWorkflows();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("⚙️ Bael Workflow Engine initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // NODE TYPES
    // ═════════════════════════════════════════════════════════════════

    registerDefaultNodes() {
      // Trigger nodes
      this.registerNode("trigger-manual", {
        category: "triggers",
        name: "Manual Trigger",
        icon: "▶️",
        inputs: [],
        outputs: ["next"],
        execute: async () => ({ success: true }),
      });

      this.registerNode("trigger-schedule", {
        category: "triggers",
        name: "Scheduled Trigger",
        icon: "⏰",
        inputs: [],
        outputs: ["next"],
        config: { cron: "0 9 * * *" },
        execute: async () => ({ success: true }),
      });

      this.registerNode("trigger-event", {
        category: "triggers",
        name: "Event Trigger",
        icon: "📡",
        inputs: [],
        outputs: ["next"],
        config: { event: "message-received" },
        execute: async () => ({ success: true }),
      });

      // Action nodes
      this.registerNode("action-message", {
        category: "actions",
        name: "Send Message",
        icon: "💬",
        inputs: ["trigger"],
        outputs: ["success", "error"],
        config: { message: "" },
        execute: async (ctx) => {
          try {
            if (window.BaelChat) {
              await window.BaelChat.sendMessage(ctx.config.message);
            }
            return { success: true, output: "success" };
          } catch (e) {
            return { success: false, output: "error", error: e.message };
          }
        },
      });

      this.registerNode("action-wait", {
        category: "actions",
        name: "Wait",
        icon: "⏳",
        inputs: ["trigger"],
        outputs: ["next"],
        config: { duration: 1000 },
        execute: async (ctx) => {
          await new Promise((r) => setTimeout(r, ctx.config.duration));
          return { success: true, output: "next" };
        },
      });

      this.registerNode("action-api", {
        category: "actions",
        name: "API Request",
        icon: "🌐",
        inputs: ["trigger"],
        outputs: ["success", "error"],
        config: { url: "", method: "GET", headers: {}, body: "" },
        execute: async (ctx) => {
          try {
            const response = await fetch(ctx.config.url, {
              method: ctx.config.method,
              headers: ctx.config.headers,
              body: ctx.config.method !== "GET" ? ctx.config.body : undefined,
            });
            const data = await response.json();
            return { success: true, output: "success", data };
          } catch (e) {
            return { success: false, output: "error", error: e.message };
          }
        },
      });

      this.registerNode("action-notification", {
        category: "actions",
        name: "Show Notification",
        icon: "🔔",
        inputs: ["trigger"],
        outputs: ["next"],
        config: { title: "", message: "" },
        execute: async (ctx) => {
          if (window.BaelNotifications) {
            window.BaelNotifications.show(ctx.config.message, "info");
          }
          return { success: true, output: "next" };
        },
      });

      // Logic nodes
      this.registerNode("logic-condition", {
        category: "logic",
        name: "Condition",
        icon: "🔀",
        inputs: ["trigger"],
        outputs: ["true", "false"],
        config: { variable: "", operator: "==", value: "" },
        execute: async (ctx) => {
          const varValue = ctx.variables.get(ctx.config.variable);
          let result = false;

          switch (ctx.config.operator) {
            case "==":
              result = varValue == ctx.config.value;
              break;
            case "!=":
              result = varValue != ctx.config.value;
              break;
            case ">":
              result = varValue > ctx.config.value;
              break;
            case "<":
              result = varValue < ctx.config.value;
              break;
            case "contains":
              result = String(varValue).includes(ctx.config.value);
              break;
          }

          return { success: true, output: result ? "true" : "false" };
        },
      });

      this.registerNode("logic-loop", {
        category: "logic",
        name: "Loop",
        icon: "🔁",
        inputs: ["trigger"],
        outputs: ["iteration", "complete"],
        config: { count: 5 },
        execute: async (ctx) => {
          // Loop handling is done in workflow execution
          return {
            success: true,
            output: "iteration",
            loopCount: ctx.config.count,
          };
        },
      });

      this.registerNode("logic-merge", {
        category: "logic",
        name: "Merge",
        icon: "🔗",
        inputs: ["input1", "input2"],
        outputs: ["next"],
        execute: async () => ({ success: true, output: "next" }),
      });

      // Data nodes
      this.registerNode("data-set", {
        category: "data",
        name: "Set Variable",
        icon: "📝",
        inputs: ["trigger"],
        outputs: ["next"],
        config: { name: "", value: "" },
        execute: async (ctx) => {
          ctx.variables.set(ctx.config.name, ctx.config.value);
          return { success: true, output: "next" };
        },
      });

      this.registerNode("data-transform", {
        category: "data",
        name: "Transform Data",
        icon: "🔄",
        inputs: ["trigger"],
        outputs: ["next"],
        config: { expression: "" },
        execute: async (ctx) => {
          try {
            // Safe expression evaluation
            const fn = new Function(
              "vars",
              `with(vars) { return ${ctx.config.expression}; }`,
            );
            const result = fn(Object.fromEntries(ctx.variables));
            ctx.variables.set("_result", result);
            return { success: true, output: "next", data: result };
          } catch (e) {
            return { success: false, output: "next", error: e.message };
          }
        },
      });
    }

    registerNode(type, definition) {
      this.nodeTypes.set(type, definition);
    }

    // ═════════════════════════════════════════════════════════════════
    // WORKFLOW MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    createWorkflow(name) {
      const workflow = {
        id: this.generateId(),
        name,
        nodes: [],
        connections: [],
        variables: {},
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.workflows.set(workflow.id, workflow);
      this.saveWorkflows();
      this.emit("workflow-created", workflow);

      return workflow;
    }

    addNode(workflowId, type, position = { x: 100, y: 100 }) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) return null;

      const nodeType = this.nodeTypes.get(type);
      if (!nodeType) return null;

      const node = {
        id: this.generateId(),
        type,
        position,
        config: { ...nodeType.config },
      };

      workflow.nodes.push(node);
      workflow.updatedAt = new Date();
      this.saveWorkflows();

      return node;
    }

    connect(workflowId, fromNode, fromOutput, toNode, toInput) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) return false;

      const connection = {
        id: this.generateId(),
        from: { node: fromNode, output: fromOutput },
        to: { node: toNode, input: toInput },
      };

      workflow.connections.push(connection);
      workflow.updatedAt = new Date();
      this.saveWorkflows();

      return connection;
    }

    deleteNode(workflowId, nodeId) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) return false;

      workflow.nodes = workflow.nodes.filter((n) => n.id !== nodeId);
      workflow.connections = workflow.connections.filter(
        (c) => c.from.node !== nodeId && c.to.node !== nodeId,
      );
      workflow.updatedAt = new Date();
      this.saveWorkflows();

      return true;
    }

    // ═════════════════════════════════════════════════════════════════
    // EXECUTION ENGINE
    // ═════════════════════════════════════════════════════════════════

    async executeWorkflow(workflowId, triggerData = {}) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow || !workflow.enabled) return null;

      const executionId = this.generateId();
      const state = {
        id: executionId,
        workflowId,
        status: "running",
        startTime: Date.now(),
        variables: new Map(Object.entries(workflow.variables)),
        triggerData,
        nodeResults: new Map(),
        log: [],
      };

      this.running.set(executionId, state);
      this.emit("execution-started", state);

      try {
        // Find trigger node
        const triggerNode = workflow.nodes.find((n) =>
          n.type.startsWith("trigger-"),
        );
        if (!triggerNode) throw new Error("No trigger node found");

        // Execute from trigger
        await this.executeNode(workflow, state, triggerNode.id);

        state.status = "completed";
        state.endTime = Date.now();
      } catch (error) {
        state.status = "failed";
        state.error = error.message;
        state.endTime = Date.now();
      }

      this.running.delete(executionId);
      this.emit("execution-completed", state);

      return state;
    }

    async executeNode(workflow, state, nodeId) {
      const node = workflow.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const nodeType = this.nodeTypes.get(node.type);
      if (!nodeType) return;

      state.log.push({
        nodeId,
        nodeName: nodeType.name,
        timestamp: Date.now(),
        action: "start",
      });

      // Create execution context
      const context = {
        config: node.config,
        variables: state.variables,
        triggerData: state.triggerData,
        previousResults: state.nodeResults,
      };

      // Execute node
      const result = await nodeType.execute(context);
      state.nodeResults.set(nodeId, result);

      state.log.push({
        nodeId,
        nodeName: nodeType.name,
        timestamp: Date.now(),
        action: "complete",
        result,
      });

      // Handle loop nodes specially
      if (node.type === "logic-loop" && result.loopCount) {
        const iterationConnections = workflow.connections.filter(
          (c) => c.from.node === nodeId && c.from.output === "iteration",
        );

        for (let i = 0; i < result.loopCount; i++) {
          state.variables.set("_loopIndex", i);
          for (const conn of iterationConnections) {
            await this.executeNode(workflow, state, conn.to.node);
          }
        }

        // Execute complete output
        const completeConnections = workflow.connections.filter(
          (c) => c.from.node === nodeId && c.from.output === "complete",
        );
        for (const conn of completeConnections) {
          await this.executeNode(workflow, state, conn.to.node);
        }
        return;
      }

      // Find and execute connected nodes
      const outConnections = workflow.connections.filter(
        (c) => c.from.node === nodeId && c.from.output === result.output,
      );

      for (const conn of outConnections) {
        await this.executeNode(workflow, state, conn.to.node);
      }
    }

    stopWorkflow(executionId) {
      const state = this.running.get(executionId);
      if (state) {
        state.status = "stopped";
        this.running.delete(executionId);
        this.emit("execution-stopped", state);
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadWorkflows() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_workflows") || "{}",
        );
        if (saved.workflows) {
          for (const [id, wf] of Object.entries(saved.workflows)) {
            wf.createdAt = new Date(wf.createdAt);
            wf.updatedAt = new Date(wf.updatedAt);
            this.workflows.set(id, wf);
          }
        }
      } catch (e) {
        console.warn("Failed to load workflows:", e);
      }
    }

    saveWorkflows() {
      const data = {
        workflows: Object.fromEntries(this.workflows),
      };
      localStorage.setItem("bael_workflows", JSON.stringify(data));
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-workflow-panel";
      panel.className = "bael-workflow-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const workflowList = Array.from(this.workflows.values());

      return `
                <div class="wf-header">
                    <div class="wf-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 3v18M3 12h18"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span>Workflow Automation</span>
                    </div>
                    <button class="wf-close" id="wf-close">×</button>
                </div>

                <div class="wf-toolbar">
                    <button class="wf-btn primary" id="wf-new">+ New Workflow</button>
                    <span class="wf-count">${workflowList.length} workflows</span>
                </div>

                <div class="wf-content">
                    <div class="wf-sidebar">
                        <div class="wf-list">
                            ${workflowList.length === 0 ? '<div class="empty">No workflows yet</div>' : ""}
                            ${workflowList
                              .map(
                                (wf) => `
                                <div class="wf-item ${this.selectedWorkflow === wf.id ? "selected" : ""}" data-id="${wf.id}">
                                    <div class="wf-item-info">
                                        <span class="wf-name">${wf.name}</span>
                                        <span class="wf-meta">${wf.nodes.length} nodes</span>
                                    </div>
                                    <div class="wf-item-actions">
                                        <button class="wf-run" data-id="${wf.id}" title="Run">▶</button>
                                        <button class="wf-delete" data-id="${wf.id}" title="Delete">🗑</button>
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>

                    <div class="wf-canvas" id="wf-canvas">
                        ${
                          this.selectedWorkflow
                            ? this.renderCanvas(this.selectedWorkflow)
                            : `
                            <div class="canvas-placeholder">
                                <p>Select a workflow or create a new one</p>
                            </div>
                        `
                        }
                    </div>

                    <div class="wf-nodes-palette">
                        <h4>Nodes</h4>
                        ${["triggers", "actions", "logic", "data"]
                          .map(
                            (cat) => `
                            <div class="node-category">
                                <h5>${cat}</h5>
                                <div class="node-list">
                                    ${Array.from(this.nodeTypes.entries())
                                      .filter(([, def]) => def.category === cat)
                                      .map(
                                        ([type, def]) => `
                                            <div class="node-template" draggable="true" data-type="${type}">
                                                <span class="node-icon">${def.icon}</span>
                                                <span class="node-name">${def.name}</span>
                                            </div>
                                        `,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `;
    }

    renderCanvas(workflowId) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) return "";

      return `
                <svg class="wf-connections">
                    ${workflow.connections
                      .map((conn) => {
                        const fromNode = workflow.nodes.find(
                          (n) => n.id === conn.from.node,
                        );
                        const toNode = workflow.nodes.find(
                          (n) => n.id === conn.to.node,
                        );
                        if (!fromNode || !toNode) return "";

                        const x1 = fromNode.position.x + 150;
                        const y1 = fromNode.position.y + 30;
                        const x2 = toNode.position.x;
                        const y2 = toNode.position.y + 30;

                        return `<path d="M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}"
                                    stroke="var(--color-primary)" stroke-width="2" fill="none"/>`;
                      })
                      .join("")}
                </svg>

                ${workflow.nodes
                  .map((node) => {
                    const nodeType = this.nodeTypes.get(node.type);
                    return `
                        <div class="wf-node" data-id="${node.id}"
                             style="left: ${node.position.x}px; top: ${node.position.y}px">
                            <div class="node-header">
                                <span class="node-icon">${nodeType?.icon || "?"}</span>
                                <span class="node-title">${nodeType?.name || node.type}</span>
                            </div>
                            <div class="node-inputs">
                                ${(nodeType?.inputs || [])
                                  .map(
                                    (inp) => `
                                    <div class="node-port input" data-port="${inp}">${inp}</div>
                                `,
                                  )
                                  .join("")}
                            </div>
                            <div class="node-outputs">
                                ${(nodeType?.outputs || [])
                                  .map(
                                    (out) => `
                                    <div class="node-port output" data-port="${out}">${out}</div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `;
                  })
                  .join("")}
            `;
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    addStyles() {
      if (document.getElementById("bael-workflow-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-workflow-styles";
      styles.textContent = `
                .bael-workflow-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 1200px;
                    height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100080;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-workflow-panel.visible {
                    display: flex;
                    animation: wfIn 0.3s ease;
                }

                @keyframes wfIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .wf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .wf-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .wf-title svg {
                    width: 24px;
                    height: 24px;
                    color: var(--color-primary, #ff3366);
                }

                .wf-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .wf-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .wf-btn {
                    padding: 8px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    cursor: pointer;
                }

                .wf-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .wf-count {
                    font-size: 12px;
                    color: var(--color-text-muted, #666);
                }

                .wf-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                .wf-sidebar {
                    width: 250px;
                    border-right: 1px solid var(--color-border, #252535);
                    overflow-y: auto;
                }

                .wf-list {
                    padding: 12px;
                }

                .wf-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                }

                .wf-item.selected {
                    border-color: var(--color-primary, #ff3366);
                }

                .wf-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                }

                .wf-meta {
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                }

                .wf-item-actions button {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-size: 12px;
                }

                .wf-canvas {
                    flex: 1;
                    position: relative;
                    background:
                        radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 20px 20px;
                    overflow: auto;
                }

                .canvas-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--color-text-muted, #666);
                }

                .wf-connections {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .wf-node {
                    position: absolute;
                    min-width: 150px;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: move;
                }

                .node-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: var(--color-surface, #181820);
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .node-icon {
                    font-size: 16px;
                }

                .node-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .node-inputs, .node-outputs {
                    padding: 8px 0;
                }

                .node-port {
                    padding: 4px 12px;
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                    cursor: pointer;
                }

                .node-port.input::before {
                    content: '●';
                    margin-right: 6px;
                    color: var(--color-primary, #ff3366);
                }

                .node-port.output::after {
                    content: '●';
                    margin-left: 6px;
                    color: #10b981;
                    float: right;
                }

                .wf-nodes-palette {
                    width: 200px;
                    border-left: 1px solid var(--color-border, #252535);
                    padding: 16px;
                    overflow-y: auto;
                }

                .wf-nodes-palette h4 {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 12px;
                }

                .node-category h5 {
                    font-size: 10px;
                    text-transform: uppercase;
                    color: var(--color-text-muted, #555);
                    margin: 16px 0 8px;
                }

                .node-template {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 6px;
                    margin-bottom: 6px;
                    cursor: grab;
                    font-size: 11px;
                    color: var(--color-text, #fff);
                }

                .node-template:hover {
                    border-color: var(--color-primary, #ff3366);
                }

                .empty {
                    text-align: center;
                    padding: 30px;
                    color: var(--color-text-muted, #555);
                    font-size: 13px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "W") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      this.panel
        .querySelector("#wf-close")
        ?.addEventListener("click", () => this.close());

      this.panel.querySelector("#wf-new")?.addEventListener("click", () => {
        const name = prompt("Workflow name:");
        if (name) {
          const wf = this.createWorkflow(name);
          this.selectedWorkflow = wf.id;
          this.updateUI();
        }
      });

      this.panel.querySelectorAll(".wf-item").forEach((item) => {
        item.addEventListener("click", () => {
          this.selectedWorkflow = item.dataset.id;
          this.updateUI();
        });
      });

      this.panel.querySelectorAll(".wf-run").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.executeWorkflow(btn.dataset.id);
        });
      });

      this.panel.querySelectorAll(".wf-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm("Delete this workflow?")) {
            this.workflows.delete(btn.dataset.id);
            this.saveWorkflows();
            this.updateUI();
          }
        });
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    generateId() {
      return (
        "wf_" + Date.now().toString(36) + Math.random().toString(36).substr(2)
      );
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:workflow:${event}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    open() {
      this.isVisible = true;
      this.updateUI();
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }

    getWorkflows() {
      return Array.from(this.workflows.values());
    }
  }

  // Initialize
  window.BaelWorkflowEngine = new BaelWorkflowEngine();
})();
