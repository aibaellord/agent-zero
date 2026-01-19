/**
 * BAEL Command - Command Pattern & Undo/Redo System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete command system:
 * - Command pattern
 * - Undo/Redo stacks
 * - Command batching
 * - Command history
 * - Macro recording
 */

(function () {
  "use strict";

  class BaelCommand {
    constructor() {
      this.commands = new Map();
      this.managers = new Map();
      console.log("⌨️ Bael Command initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // COMMAND REGISTRATION
    // ═══════════════════════════════════════════════════════════

    register(name, config) {
      const command = {
        name,
        execute: config.execute,
        undo: config.undo || null,
        canExecute: config.canExecute || (() => true),
        description: config.description || "",
        category: config.category || "general",
      };
      this.commands.set(name, command);
      return this;
    }

    get(name) {
      return this.commands.get(name);
    }

    has(name) {
      return this.commands.has(name);
    }

    remove(name) {
      this.commands.delete(name);
    }

    list() {
      return [...this.commands.keys()];
    }

    getByCategory(category) {
      return [...this.commands.entries()]
        .filter(([, cmd]) => cmd.category === category)
        .map(([name]) => name);
    }

    // ═══════════════════════════════════════════════════════════
    // COMMAND EXECUTION
    // ═══════════════════════════════════════════════════════════

    async execute(name, ...args) {
      const command = this.commands.get(name);
      if (!command) {
        throw new Error(`Command "${name}" not found`);
      }

      if (!command.canExecute(...args)) {
        return { success: false, reason: "Cannot execute" };
      }

      const result = await command.execute(...args);
      return { success: true, result };
    }

    canExecute(name, ...args) {
      const command = this.commands.get(name);
      return command ? command.canExecute(...args) : false;
    }

    // ═══════════════════════════════════════════════════════════
    // UNDO/REDO MANAGER
    // ═══════════════════════════════════════════════════════════

    createManager(name = "default", options = {}) {
      const manager = new UndoManager({
        name,
        maxHistory: options.maxHistory || 100,
        groupTimeout: options.groupTimeout || 500,
        ...options,
      });
      this.managers.set(name, manager);
      return manager;
    }

    getManager(name = "default") {
      if (!this.managers.has(name)) {
        this.createManager(name);
      }
      return this.managers.get(name);
    }

    // ═══════════════════════════════════════════════════════════
    // SHORTHAND METHODS
    // ═══════════════════════════════════════════════════════════

    run(executeArgs) {
      const manager = this.getManager();
      return manager.execute(executeArgs);
    }

    undo() {
      return this.getManager().undo();
    }

    redo() {
      return this.getManager().redo();
    }

    canUndo() {
      return this.getManager().canUndo();
    }

    canRedo() {
      return this.getManager().canRedo();
    }

    history() {
      return this.getManager().getHistory();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // UNDO MANAGER
  // ═══════════════════════════════════════════════════════════════════

  class UndoManager {
    constructor(options) {
      this.options = options;
      this.undoStack = [];
      this.redoStack = [];
      this.listeners = [];
      this.grouping = false;
      this.currentGroup = null;
      this.groupTimer = null;
      this.recording = false;
      this.macro = [];
    }

    execute(command) {
      let cmd = command;

      // If just an object with execute/undo, wrap it
      if (typeof command === "object" && command.execute) {
        cmd = new Command(command);
      }

      // Execute the command
      const result = cmd.execute();

      // Handle grouping
      if (this.grouping && this.currentGroup) {
        this.currentGroup.add(cmd);
      } else {
        this._pushUndo(cmd);
      }

      // Clear redo stack
      this.redoStack = [];

      // Record for macro
      if (this.recording) {
        this.macro.push(cmd.toJSON());
      }

      this._notify("execute", cmd);
      return result;
    }

    undo() {
      if (!this.canUndo()) return null;

      const cmd = this.undoStack.pop();
      const result = cmd.undo();
      this.redoStack.push(cmd);

      this._enforceLimit();
      this._notify("undo", cmd);
      return result;
    }

    redo() {
      if (!this.canRedo()) return null;

      const cmd = this.redoStack.pop();
      const result = cmd.execute();
      this.undoStack.push(cmd);

      this._notify("redo", cmd);
      return result;
    }

    canUndo() {
      return this.undoStack.length > 0;
    }

    canRedo() {
      return this.redoStack.length > 0;
    }

    clear() {
      this.undoStack = [];
      this.redoStack = [];
      this._notify("clear");
    }

    _pushUndo(cmd) {
      this.undoStack.push(cmd);
      this._enforceLimit();
    }

    _enforceLimit() {
      while (this.undoStack.length > this.options.maxHistory) {
        this.undoStack.shift();
      }
    }

    // ═══════════════════════════════════════════════════════════
    // GROUPING
    // ═══════════════════════════════════════════════════════════

    beginGroup(name = "Group") {
      if (this.grouping) {
        this.endGroup();
      }

      this.grouping = true;
      this.currentGroup = new CommandGroup(name);

      return this;
    }

    endGroup() {
      if (!this.grouping) return this;

      this.grouping = false;

      if (this.currentGroup && this.currentGroup.commands.length > 0) {
        this._pushUndo(this.currentGroup);
      }

      this.currentGroup = null;
      clearTimeout(this.groupTimer);

      return this;
    }

    autoGroup(timeout = this.options.groupTimeout) {
      this.beginGroup();

      clearTimeout(this.groupTimer);
      this.groupTimer = setTimeout(() => {
        this.endGroup();
      }, timeout);

      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSACTIONS
    // ═══════════════════════════════════════════════════════════

    transaction(fn) {
      this.beginGroup("Transaction");

      try {
        const result = fn(this);
        this.endGroup();
        return result;
      } catch (e) {
        // Rollback
        if (this.currentGroup) {
          for (let i = this.currentGroup.commands.length - 1; i >= 0; i--) {
            this.currentGroup.commands[i].undo();
          }
        }
        this.currentGroup = null;
        this.grouping = false;
        throw e;
      }
    }

    async transactionAsync(fn) {
      this.beginGroup("Transaction");

      try {
        const result = await fn(this);
        this.endGroup();
        return result;
      } catch (e) {
        // Rollback
        if (this.currentGroup) {
          for (let i = this.currentGroup.commands.length - 1; i >= 0; i--) {
            await this.currentGroup.commands[i].undo();
          }
        }
        this.currentGroup = null;
        this.grouping = false;
        throw e;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // MACRO RECORDING
    // ═══════════════════════════════════════════════════════════

    startRecording() {
      this.recording = true;
      this.macro = [];
      return this;
    }

    stopRecording() {
      this.recording = false;
      return this.macro;
    }

    playMacro(macro, createCommand) {
      const commands = macro.map((data) => createCommand(data));

      this.beginGroup("Macro Playback");

      for (const cmd of commands) {
        this.execute(cmd);
      }

      this.endGroup();
    }

    // ═══════════════════════════════════════════════════════════
    // HISTORY
    // ═══════════════════════════════════════════════════════════

    getHistory() {
      return this.undoStack.map((cmd, index) => ({
        index,
        name: cmd.name,
        timestamp: cmd.timestamp,
        data: cmd.toJSON?.() || null,
      }));
    }

    getRedoHistory() {
      return this.redoStack.map((cmd, index) => ({
        index,
        name: cmd.name,
        timestamp: cmd.timestamp,
        data: cmd.toJSON?.() || null,
      }));
    }

    goTo(index) {
      while (this.undoStack.length > index + 1) {
        this.undo();
      }
      while (this.undoStack.length < index + 1 && this.canRedo()) {
        this.redo();
      }
    }

    // ═══════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════

    onChange(callback) {
      this.listeners.push(callback);
      return () => {
        const idx = this.listeners.indexOf(callback);
        if (idx > -1) this.listeners.splice(idx, 1);
      };
    }

    _notify(action, command = null) {
      const event = {
        action,
        command,
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length,
      };

      for (const listener of this.listeners) {
        listener(event);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════

    getState() {
      return {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length,
        isGrouping: this.grouping,
        isRecording: this.recording,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMMAND
  // ═══════════════════════════════════════════════════════════════════

  class Command {
    constructor(config) {
      this.name = config.name || "Command";
      this._execute = config.execute;
      this._undo = config.undo;
      this.data = config.data || {};
      this.timestamp = Date.now();
    }

    execute() {
      return this._execute(this.data);
    }

    undo() {
      if (this._undo) {
        return this._undo(this.data);
      }
    }

    toJSON() {
      return {
        name: this.name,
        data: this.data,
        timestamp: this.timestamp,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMMAND GROUP
  // ═══════════════════════════════════════════════════════════════════

  class CommandGroup {
    constructor(name = "Group") {
      this.name = name;
      this.commands = [];
      this.timestamp = Date.now();
    }

    add(command) {
      this.commands.push(command);
    }

    execute() {
      for (const cmd of this.commands) {
        cmd.execute();
      }
    }

    undo() {
      for (let i = this.commands.length - 1; i >= 0; i--) {
        this.commands[i].undo();
      }
    }

    toJSON() {
      return {
        name: this.name,
        commands: this.commands.map((c) => c.toJSON?.() || null),
        timestamp: this.timestamp,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // FACTORY HELPERS
  // ═══════════════════════════════════════════════════════════════════

  function createCommand(config) {
    return new Command(config);
  }

  function createPropertyCommand(target, property, newValue) {
    const oldValue = target[property];

    return new Command({
      name: `Set ${property}`,
      data: { target, property, oldValue, newValue },
      execute: (data) => {
        data.target[data.property] = data.newValue;
      },
      undo: (data) => {
        data.target[data.property] = data.oldValue;
      },
    });
  }

  function createArrayCommand(type, array, ...args) {
    const commands = {
      push: {
        name: "Array Push",
        execute: (d) => {
          d.index = d.array.push(...d.items) - 1;
        },
        undo: (d) => {
          d.array.splice(d.index, d.items.length);
        },
      },
      pop: {
        name: "Array Pop",
        execute: (d) => {
          d.item = d.array.pop();
        },
        undo: (d) => {
          d.array.push(d.item);
        },
      },
      splice: {
        name: "Array Splice",
        execute: (d) => {
          d.removed = d.array.splice(d.start, d.deleteCount, ...d.items);
        },
        undo: (d) => {
          d.array.splice(d.start, d.items.length, ...d.removed);
        },
      },
    };

    const config = commands[type];
    if (!config) throw new Error(`Unknown array command: ${type}`);

    return new Command({
      name: config.name,
      data: { array, items: args, ...args },
      execute: config.execute,
      undo: config.undo,
    });
  }

  // Initialize
  window.BaelCommand = new BaelCommand();
  window.Command = Command;
  window.UndoManager = UndoManager;

  // Global shortcuts
  window.$command = window.BaelCommand;
  window.$undo = () => window.BaelCommand.undo();
  window.$redo = () => window.BaelCommand.redo();
  window.$createCommand = createCommand;

  console.log("⌨️ Bael Command ready");
})();
