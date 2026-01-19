/**
 * BAEL FSM - Finite State Machine System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete FSM system:
 * - State machines
 * - Hierarchical states
 * - Guards & actions
 * - Parallel states
 * - History states
 */

(function () {
  "use strict";

  class BaelFSM {
    constructor() {
      this.machines = new Map();
      console.log("🔄 Bael FSM initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // MACHINE CREATION
    // ═══════════════════════════════════════════════════════════

    create(config) {
      return new StateMachine(config);
    }

    register(name, config) {
      const machine = this.create(config);
      this.machines.set(name, machine);
      return machine;
    }

    get(name) {
      return this.machines.get(name);
    }

    has(name) {
      return this.machines.has(name);
    }

    delete(name) {
      const machine = this.machines.get(name);
      if (machine) {
        machine.stop();
        this.machines.delete(name);
      }
    }

    list() {
      return [...this.machines.keys()];
    }

    // ═══════════════════════════════════════════════════════════
    // BUILDER PATTERN
    // ═══════════════════════════════════════════════════════════

    builder() {
      return new StateMachineBuilder();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STATE MACHINE
  // ═══════════════════════════════════════════════════════════════════

  class StateMachine {
    constructor(config) {
      this.id = config.id || this._generateId();
      this.initial = config.initial;
      this.states = config.states || {};
      this.context = { ...config.context } || {};
      this.currentState = null;
      this.history = [];
      this.listeners = new Map();
      this.running = false;
      this.parent = null;
      this.children = new Map();

      // Actions & guards
      this.actions = config.actions || {};
      this.guards = config.guards || {};
      this.services = config.services || {};
    }

    start() {
      if (this.running) return this;

      this.running = true;
      this._enterState(this.initial);
      this._emit("start", { state: this.currentState, context: this.context });

      return this;
    }

    stop() {
      if (!this.running) return this;

      this._exitState(this.currentState);
      this.running = false;
      this._emit("stop", { state: this.currentState, context: this.context });

      // Stop child machines
      for (const child of this.children.values()) {
        child.stop();
      }

      return this;
    }

    send(event, payload = {}) {
      if (!this.running) return this;

      const eventObj =
        typeof event === "string" ? { type: event, ...payload } : event;
      const stateConfig = this.states[this.currentState];

      if (!stateConfig) return this;

      // Check for transition
      const transition = this._findTransition(stateConfig, eventObj);

      if (transition) {
        this._performTransition(transition, eventObj);
      }

      return this;
    }

    _findTransition(stateConfig, event) {
      const on = stateConfig.on || {};
      let transition = on[event.type];

      if (!transition) return null;

      // Handle array of transitions (with guards)
      if (Array.isArray(transition)) {
        for (const t of transition) {
          if (this._checkGuard(t.guard, event)) {
            return t;
          }
        }
        return null;
      }

      // Handle object transition
      if (typeof transition === "object" && transition.target) {
        if (!this._checkGuard(transition.guard, event)) {
          return null;
        }
        return transition;
      }

      // Handle string transition (just target)
      return { target: transition };
    }

    _checkGuard(guard, event) {
      if (!guard) return true;

      if (typeof guard === "function") {
        return guard(this.context, event);
      }

      if (typeof guard === "string" && this.guards[guard]) {
        return this.guards[guard](this.context, event);
      }

      return true;
    }

    _performTransition(transition, event) {
      const from = this.currentState;
      const to = transition.target;

      // Exit current state
      this._exitState(from);

      // Execute transition actions
      this._executeActions(transition.actions, event);

      // Update history
      this.history.push({
        from,
        to,
        event: event.type,
        timestamp: Date.now(),
      });

      // Enter new state
      this._enterState(to, event);

      // Emit transition event
      this._emit("transition", {
        from,
        to,
        event,
        context: this.context,
      });
    }

    _enterState(stateName, event = null) {
      this.currentState = stateName;
      const stateConfig = this.states[stateName];

      if (!stateConfig) return;

      // Execute entry actions
      this._executeActions(stateConfig.entry, event);

      // Start child machine if exists
      if (stateConfig.invoke) {
        this._invokeService(stateConfig.invoke);
      }

      // Handle initial state for nested states
      if (stateConfig.initial && stateConfig.states) {
        const childMachine = new StateMachine({
          initial: stateConfig.initial,
          states: stateConfig.states,
          context: this.context,
          actions: this.actions,
          guards: this.guards,
        });
        childMachine.parent = this;
        this.children.set(stateName, childMachine);
        childMachine.start();
      }

      this._emit("stateEnter", { state: stateName, context: this.context });
    }

    _exitState(stateName) {
      const stateConfig = this.states[stateName];

      if (!stateConfig) return;

      // Execute exit actions
      this._executeActions(stateConfig.exit);

      // Stop child machine
      if (this.children.has(stateName)) {
        this.children.get(stateName).stop();
        this.children.delete(stateName);
      }

      this._emit("stateExit", { state: stateName, context: this.context });
    }

    _executeActions(actions, event = null) {
      if (!actions) return;

      const actionList = Array.isArray(actions) ? actions : [actions];

      for (const action of actionList) {
        if (typeof action === "function") {
          action(this.context, event);
        } else if (typeof action === "string" && this.actions[action]) {
          this.actions[action](this.context, event);
        } else if (typeof action === "object" && action.type) {
          // XState-style action
          if (action.type === "assign") {
            this._assign(action.assignment, event);
          } else if (this.actions[action.type]) {
            this.actions[action.type](this.context, event, action);
          }
        }
      }
    }

    _assign(assignment, event) {
      if (typeof assignment === "function") {
        Object.assign(this.context, assignment(this.context, event));
      } else {
        for (const [key, value] of Object.entries(assignment)) {
          if (typeof value === "function") {
            this.context[key] = value(this.context, event);
          } else {
            this.context[key] = value;
          }
        }
      }
    }

    _invokeService(invoke) {
      const invokeDef = typeof invoke === "string" ? { src: invoke } : invoke;
      const service = this.services[invokeDef.src];

      if (!service) return;

      const promise = service(this.context);

      if (promise instanceof Promise) {
        promise
          .then((data) => {
            if (invokeDef.onDone) {
              this.send(invokeDef.onDone, { data });
            }
          })
          .catch((error) => {
            if (invokeDef.onError) {
              this.send(invokeDef.onError, { error });
            }
          });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STATE QUERIES
    // ═══════════════════════════════════════════════════════════

    getState() {
      return this.currentState;
    }

    getContext() {
      return { ...this.context };
    }

    matches(state) {
      if (typeof state === "string") {
        return this.currentState === state;
      }
      if (Array.isArray(state)) {
        return state.includes(this.currentState);
      }
      return false;
    }

    can(event) {
      const stateConfig = this.states[this.currentState];
      if (!stateConfig || !stateConfig.on) return false;
      return event in stateConfig.on;
    }

    getHistory() {
      return [...this.history];
    }

    getAvailableEvents() {
      const stateConfig = this.states[this.currentState];
      if (!stateConfig || !stateConfig.on) return [];
      return Object.keys(stateConfig.on);
    }

    // ═══════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════

    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      return () => this.off(event, callback);
    }

    off(event, callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const idx = callbacks.indexOf(callback);
        if (idx > -1) callbacks.splice(idx, 1);
      }
    }

    _emit(event, data) {
      const callbacks = this.listeners.get(event) || [];
      for (const callback of callbacks) {
        callback(data);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _generateId() {
      return `fsm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    toJSON() {
      return {
        id: this.id,
        currentState: this.currentState,
        context: this.context,
        history: this.history,
        running: this.running,
      };
    }

    visualize() {
      const lines = [`State Machine: ${this.id}`];
      lines.push(
        `Current: ${this.currentState} ${this.running ? "(running)" : "(stopped)"}`,
      );
      lines.push("States:");

      for (const [name, config] of Object.entries(this.states)) {
        const marker = name === this.currentState ? "→" : " ";
        const initial = name === this.initial ? " (initial)" : "";
        lines.push(`  ${marker} ${name}${initial}`);

        if (config.on) {
          for (const [event, target] of Object.entries(config.on)) {
            const targetName =
              typeof target === "string" ? target : target.target;
            lines.push(`      on ${event} → ${targetName}`);
          }
        }
      }

      return lines.join("\n");
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STATE MACHINE BUILDER
  // ═══════════════════════════════════════════════════════════════════

  class StateMachineBuilder {
    constructor() {
      this._config = {
        states: {},
        context: {},
        actions: {},
        guards: {},
        services: {},
      };
      this._currentState = null;
    }

    id(id) {
      this._config.id = id;
      return this;
    }

    initial(state) {
      this._config.initial = state;
      return this;
    }

    context(ctx) {
      this._config.context = { ...this._config.context, ...ctx };
      return this;
    }

    state(name, config = {}) {
      this._config.states[name] = { on: {}, ...config };
      this._currentState = name;
      return this;
    }

    on(event, target, options = {}) {
      if (!this._currentState) {
        throw new Error("No state defined. Call state() first.");
      }

      const transition =
        typeof target === "string" ? { target, ...options } : target;

      this._config.states[this._currentState].on[event] = transition;
      return this;
    }

    entry(action) {
      if (!this._currentState) {
        throw new Error("No state defined. Call state() first.");
      }
      this._config.states[this._currentState].entry = action;
      return this;
    }

    exit(action) {
      if (!this._currentState) {
        throw new Error("No state defined. Call state() first.");
      }
      this._config.states[this._currentState].exit = action;
      return this;
    }

    action(name, fn) {
      this._config.actions[name] = fn;
      return this;
    }

    guard(name, fn) {
      this._config.guards[name] = fn;
      return this;
    }

    service(name, fn) {
      this._config.services[name] = fn;
      return this;
    }

    build() {
      if (!this._config.initial) {
        throw new Error("Initial state not set. Call initial() first.");
      }
      return new StateMachine(this._config);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  function assign(assignment) {
    return { type: "assign", assignment };
  }

  function send(event) {
    return { type: "send", event };
  }

  function raise(event) {
    return { type: "raise", event };
  }

  // Initialize
  window.BaelFSM = new BaelFSM();
  window.StateMachine = StateMachine;

  // Global shortcuts
  window.$fsm = window.BaelFSM;
  window.$createMachine = (config) => window.BaelFSM.create(config);
  window.$assign = assign;

  console.log("🔄 Bael FSM ready");
})();
