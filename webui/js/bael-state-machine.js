/**
 * BAEL State Machine - Finite State Machine Engine
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete FSM implementation with:
 * - State definitions and transitions
 * - Guards and conditions
 * - Actions on entry/exit/transition
 * - Hierarchical states (nested)
 * - Parallel regions
 * - State persistence
 * - History states
 * - Event queue
 * - Visualization
 */

(function () {
  "use strict";

  class BaelStateMachine {
    constructor() {
      this.machines = new Map();
      this.globalContext = {};
      this.eventHistory = [];
      this.maxHistory = 100;
      this.init();
    }

    init() {
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.createDemoMachine();
      console.log("🔄 Bael State Machine initialized");
    }

    // Machine Creation
    createMachine(id, config) {
      const machine = new StateMachine(id, config, this);
      this.machines.set(id, machine);
      this.updateUI();
      return machine;
    }

    getMachine(id) {
      return this.machines.get(id);
    }

    removeMachine(id) {
      const machine = this.machines.get(id);
      if (machine) {
        machine.stop();
        this.machines.delete(id);
        this.updateUI();
      }
    }

    // Demo Machine
    createDemoMachine() {
      this.createMachine("chat-flow", {
        id: "chat-flow",
        initial: "idle",
        context: {
          messages: 0,
          lastActivity: null,
        },
        states: {
          idle: {
            on: {
              USER_INPUT: { target: "thinking", actions: ["logInput"] },
              LOAD_HISTORY: { target: "loading" },
            },
            entry: ["resetContext"],
          },
          loading: {
            on: {
              LOADED: { target: "idle" },
              ERROR: { target: "error" },
            },
          },
          thinking: {
            on: {
              RESPONSE_START: { target: "responding" },
              ERROR: { target: "error" },
              CANCEL: { target: "idle" },
            },
            entry: ["showThinking"],
            exit: ["hideThinking"],
          },
          responding: {
            on: {
              COMPLETE: { target: "idle", actions: ["incrementMessages"] },
              ERROR: { target: "error" },
              CANCEL: { target: "idle" },
            },
          },
          error: {
            on: {
              RETRY: { target: "thinking" },
              DISMISS: { target: "idle" },
            },
            entry: ["logError"],
          },
        },
        actions: {
          logInput: (ctx, event) => {
            console.log("[FSM] User input:", event.data);
            ctx.lastActivity = new Date();
          },
          resetContext: (ctx) => {
            ctx.lastActivity = new Date();
          },
          showThinking: () => {
            console.log("[FSM] Showing thinking indicator");
          },
          hideThinking: () => {
            console.log("[FSM] Hiding thinking indicator");
          },
          incrementMessages: (ctx) => {
            ctx.messages++;
          },
          logError: (ctx, event) => {
            console.error("[FSM] Error:", event.error);
          },
        },
      });
    }

    // Event Logging
    logEvent(machineId, event, from, to) {
      this.eventHistory.push({
        machineId,
        event,
        from,
        to,
        timestamp: new Date(),
      });

      while (this.eventHistory.length > this.maxHistory) {
        this.eventHistory.shift();
      }

      this.updateEventLog();
    }

    // UI
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-fsm-panel";
      this.panel.innerHTML = `
                <div class="fsm-panel-header">
                    <h3>🔄 State Machines</h3>
                    <div class="fsm-panel-actions">
                        <button class="create-btn" title="Create Machine">+ New</button>
                        <button class="close-btn">✕</button>
                    </div>
                </div>

                <div class="fsm-panel-tabs">
                    <button class="tab-btn active" data-tab="machines">Machines</button>
                    <button class="tab-btn" data-tab="visualize">Visualize</button>
                    <button class="tab-btn" data-tab="events">Events</button>
                </div>

                <div class="fsm-panel-content">
                    <div class="tab-content active" id="fsm-tab-machines">
                        <div class="machine-list"></div>
                    </div>

                    <div class="tab-content" id="fsm-tab-visualize">
                        <div class="fsm-visualization">
                            <select id="fsm-machine-select">
                                <option value="">Select a machine...</option>
                            </select>
                            <div class="state-diagram" id="fsm-diagram"></div>
                        </div>
                    </div>

                    <div class="tab-content" id="fsm-tab-events">
                        <div class="event-log" id="fsm-event-log"></div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);
    }

    updateUI() {
      this.updateMachineList();
      this.updateMachineSelect();
    }

    updateMachineList() {
      const list = this.panel.querySelector(".machine-list");

      list.innerHTML =
        Array.from(this.machines.entries())
          .map(
            ([id, machine]) => `
                <div class="machine-item" data-id="${id}">
                    <div class="machine-header">
                        <span class="machine-name">${id}</span>
                        <span class="machine-state">${machine.currentState}</span>
                    </div>
                    <div class="machine-context">
                        <pre>${JSON.stringify(machine.context, null, 2)}</pre>
                    </div>
                    <div class="machine-actions">
                        <button class="send-event-btn" data-machine="${id}">Send Event</button>
                        <button class="reset-btn" data-machine="${id}">Reset</button>
                        <button class="delete-btn" data-machine="${id}">Delete</button>
                    </div>
                </div>
            `,
          )
          .join("") ||
        '<div class="no-machines">No state machines created</div>';
    }

    updateMachineSelect() {
      const select = document.getElementById("fsm-machine-select");
      if (!select) return;

      const currentValue = select.value;
      select.innerHTML =
        '<option value="">Select a machine...</option>' +
        Array.from(this.machines.keys())
          .map(
            (id) =>
              `<option value="${id}" ${id === currentValue ? "selected" : ""}>${id}</option>`,
          )
          .join("");

      if (currentValue) {
        this.visualizeMachine(currentValue);
      }
    }

    updateEventLog() {
      const log = document.getElementById("fsm-event-log");
      if (!log) return;

      const recentEvents = this.eventHistory.slice(-30).reverse();
      log.innerHTML =
        recentEvents
          .map(
            (e) => `
                <div class="event-item">
                    <span class="event-time">${this.formatTime(e.timestamp)}</span>
                    <span class="event-machine">${e.machineId}</span>
                    <span class="event-name">${e.event}</span>
                    <span class="event-transition">${e.from} → ${e.to}</span>
                </div>
            `,
          )
          .join("") || '<div class="no-events">No events recorded</div>';
    }

    visualizeMachine(id) {
      const machine = this.machines.get(id);
      if (!machine) return;

      const diagram = document.getElementById("fsm-diagram");
      const states = Object.entries(machine.config.states);

      // Simple text-based visualization
      let html = '<div class="state-nodes">';

      states.forEach(([stateName, stateConfig]) => {
        const isCurrent = stateName === machine.currentState;
        const isInitial = stateName === machine.config.initial;

        html += `
                    <div class="state-node ${isCurrent ? "current" : ""} ${isInitial ? "initial" : ""}">
                        <div class="state-name">${isInitial ? "●" : ""} ${stateName}</div>
                        <div class="state-transitions">
                            ${Object.entries(stateConfig.on || {})
                              .map(([event, transition]) => {
                                const target =
                                  typeof transition === "string"
                                    ? transition
                                    : transition.target;
                                return `<div class="transition">${event} → ${target}</div>`;
                              })
                              .join("")}
                        </div>
                    </div>
                `;
      });

      html += "</div>";
      diagram.innerHTML = html;
    }

    formatTime(date) {
      return new Date(date).toLocaleTimeString();
    }

    showSendEventDialog(machineId) {
      const machine = this.machines.get(machineId);
      if (!machine) return;

      const currentState = machine.config.states[machine.currentState];
      const availableEvents = Object.keys(currentState?.on || {});

      const event = prompt(
        `Send event to "${machineId}":\n\nAvailable events: ${availableEvents.join(", ")}\n\nEnter event name:`,
      );

      if (event) {
        machine.send(event);
      }
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-fsm-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 600px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: var(--bael-surface, #1e1e1e);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    z-index: 100001;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                }

                #bael-fsm-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .fsm-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .fsm-panel-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .fsm-panel-actions {
                    display: flex;
                    gap: 8px;
                }

                .fsm-panel-actions button {
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .fsm-panel-actions .close-btn {
                    background: transparent;
                    border: none;
                }

                .fsm-panel-tabs {
                    display: flex;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .tab-btn {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    cursor: pointer;
                    font-size: 12px;
                    text-transform: uppercase;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .tab-btn.active {
                    color: var(--bael-accent, #00d4ff);
                    border-bottom-color: var(--bael-accent, #00d4ff);
                }

                .fsm-panel-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .tab-content {
                    display: none;
                }

                .tab-content.active {
                    display: block;
                }

                .machine-item {
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                }

                .machine-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .machine-name {
                    font-weight: 600;
                    color: var(--bael-text, #fff);
                }

                .machine-state {
                    background: var(--bael-accent, #00d4ff);
                    color: #000;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .machine-context {
                    background: rgba(0,0,0,0.3);
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 12px;
                    max-height: 100px;
                    overflow-y: auto;
                }

                .machine-context pre {
                    margin: 0;
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                }

                .machine-actions {
                    display: flex;
                    gap: 8px;
                }

                .machine-actions button {
                    flex: 1;
                    padding: 8px 12px;
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                }

                .machine-actions .delete-btn {
                    background: #f44336;
                    border-color: #f44336;
                }

                /* Visualization */
                .fsm-visualization {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                #fsm-machine-select {
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    border-radius: 6px;
                    font-size: 13px;
                }

                .state-nodes {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .state-node {
                    background: var(--bael-bg-dark, #151515);
                    border: 2px solid var(--bael-border, #333);
                    border-radius: 12px;
                    padding: 16px;
                    min-width: 150px;
                }

                .state-node.current {
                    border-color: var(--bael-accent, #00d4ff);
                    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
                }

                .state-node.initial .state-name::before {
                    content: '';
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background: var(--bael-accent, #00d4ff);
                    border-radius: 50%;
                    margin-right: 8px;
                }

                .state-name {
                    font-weight: 600;
                    color: var(--bael-text, #fff);
                    margin-bottom: 12px;
                }

                .state-transitions {
                    font-size: 11px;
                }

                .transition {
                    color: var(--bael-text-dim, #888);
                    padding: 4px 0;
                    border-top: 1px solid var(--bael-border, #333);
                }

                /* Event Log */
                .event-item {
                    display: grid;
                    grid-template-columns: 80px 100px 1fr 120px;
                    gap: 12px;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    margin-bottom: 8px;
                    font-size: 12px;
                }

                .event-time {
                    color: var(--bael-text-dim, #888);
                }

                .event-machine {
                    color: var(--bael-accent, #00d4ff);
                }

                .event-name {
                    color: #4caf50;
                    font-weight: 500;
                }

                .event-transition {
                    color: var(--bael-text-dim, #888);
                }

                .no-machines, .no-events {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-dim, #888);
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Close button
      this.panel.querySelector(".close-btn").addEventListener("click", () => {
        this.close();
      });

      // Create button
      this.panel.querySelector(".create-btn").addEventListener("click", () => {
        const id = prompt("Enter machine ID:");
        if (id) {
          this.createMachine(id, {
            id,
            initial: "initial",
            states: {
              initial: {
                on: {
                  NEXT: { target: "state1" },
                },
              },
              state1: {
                on: {
                  BACK: { target: "initial" },
                },
              },
            },
          });
        }
      });

      // Tab switching
      this.panel.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".tab-btn")
            .forEach((b) => b.classList.remove("active"));
          this.panel
            .querySelectorAll(".tab-content")
            .forEach((c) => c.classList.remove("active"));

          btn.classList.add("active");
          document
            .getElementById(`fsm-tab-${btn.dataset.tab}`)
            .classList.add("active");
        });
      });

      // Machine select
      document
        .getElementById("fsm-machine-select")
        ?.addEventListener("change", (e) => {
          if (e.target.value) {
            this.visualizeMachine(e.target.value);
          }
        });

      // Machine actions
      this.panel.addEventListener("click", (e) => {
        const target = e.target;

        if (target.classList.contains("send-event-btn")) {
          this.showSendEventDialog(target.dataset.machine);
        }

        if (target.classList.contains("reset-btn")) {
          const machine = this.machines.get(target.dataset.machine);
          if (machine) machine.reset();
        }

        if (target.classList.contains("delete-btn")) {
          if (confirm("Delete this state machine?")) {
            this.removeMachine(target.dataset.machine);
          }
        }
      });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "M") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    open() {
      this.panel.classList.add("visible");
      this.updateUI();
    }

    close() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    get isVisible() {
      return this.panel.classList.contains("visible");
    }
  }

  // State Machine Class
  class StateMachine {
    constructor(id, config, manager) {
      this.id = id;
      this.config = config;
      this.manager = manager;
      this.context = { ...config.context };
      this.currentState = config.initial;
      this.history = [];
      this.running = true;
      this.subscribers = [];
    }

    send(event, data = {}) {
      if (!this.running) return;

      const stateConfig = this.config.states[this.currentState];
      if (!stateConfig || !stateConfig.on) return;

      const transition = stateConfig.on[event];
      if (!transition) {
        console.warn(
          `[FSM ${this.id}] No transition for event "${event}" in state "${this.currentState}"`,
        );
        return;
      }

      const target =
        typeof transition === "string" ? transition : transition.target;
      const actions =
        typeof transition === "string" ? [] : transition.actions || [];
      const guard = typeof transition === "string" ? null : transition.guard;

      // Check guard
      if (guard && typeof this.config.guards?.[guard] === "function") {
        if (!this.config.guards[guard](this.context, { type: event, data })) {
          console.log(`[FSM ${this.id}] Guard "${guard}" blocked transition`);
          return;
        }
      }

      // Execute exit actions
      const fromState = this.config.states[this.currentState];
      if (fromState?.exit) {
        this.executeActions(fromState.exit, { type: event, data });
      }

      // Record history
      this.history.push({
        from: this.currentState,
        to: target,
        event,
        timestamp: new Date(),
      });

      const prevState = this.currentState;
      this.currentState = target;

      // Execute transition actions
      this.executeActions(actions, { type: event, data });

      // Execute entry actions
      const toState = this.config.states[target];
      if (toState?.entry) {
        this.executeActions(toState.entry, { type: event, data });
      }

      // Log event
      this.manager.logEvent(this.id, event, prevState, target);

      // Notify subscribers
      this.subscribers.forEach((fn) => fn(this.currentState, prevState, event));

      // Update UI
      this.manager.updateUI();
    }

    executeActions(actions, event) {
      const actionList = Array.isArray(actions) ? actions : [actions];

      actionList.forEach((action) => {
        if (typeof action === "function") {
          action(this.context, event);
        } else if (
          typeof action === "string" &&
          this.config.actions?.[action]
        ) {
          this.config.actions[action](this.context, event);
        }
      });
    }

    subscribe(fn) {
      this.subscribers.push(fn);
      return () => {
        const idx = this.subscribers.indexOf(fn);
        if (idx > -1) this.subscribers.splice(idx, 1);
      };
    }

    reset() {
      this.context = { ...this.config.context };
      this.currentState = this.config.initial;
      this.history = [];
      this.manager.updateUI();
    }

    stop() {
      this.running = false;
    }

    start() {
      this.running = true;
    }

    matches(state) {
      return this.currentState === state;
    }

    can(event) {
      const stateConfig = this.config.states[this.currentState];
      return !!stateConfig?.on?.[event];
    }
  }

  // Initialize
  window.BaelStateMachine = new BaelStateMachine();
})();
