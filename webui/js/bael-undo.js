/**
 * BAEL Undo/Redo System - Lord Of All Reversions
 *
 * Comprehensive undo/redo management with:
 * - Command pattern implementation
 * - State snapshots
 * - Transaction grouping
 * - Branch history
 * - Memory-efficient diffing
 * - Keyboard shortcuts
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // UNDO/REDO MANAGER CLASS
  // ============================================================

  class BaelUndo {
    constructor() {
      this.stacks = new Map();
      this.defaultStackId = "default";
      this.maxHistorySize = 100;
      this.keyboardEnabled = false;
      this.hooks = {
        beforeUndo: [],
        afterUndo: [],
        beforeRedo: [],
        afterRedo: [],
        onChange: [],
      };
    }

    // ============================================================
    // STACK MANAGEMENT
    // ============================================================

    /**
     * Get or create a history stack
     */
    getStack(id = this.defaultStackId) {
      if (!this.stacks.has(id)) {
        this.stacks.set(id, {
          id,
          past: [],
          future: [],
          present: null,
          savedIndex: -1,
          transaction: null,
          branches: [],
        });
      }
      return this.stacks.get(id);
    }

    /**
     * Clear a history stack
     */
    clear(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      stack.past = [];
      stack.future = [];
      stack.present = null;
      stack.savedIndex = -1;
      stack.transaction = null;
      stack.branches = [];
      this._notifyChange(stackId);
    }

    /**
     * Remove a stack entirely
     */
    removeStack(stackId) {
      this.stacks.delete(stackId);
    }

    // ============================================================
    // COMMAND PATTERN
    // ============================================================

    /**
     * Execute a command with undo/redo support
     */
    execute(command, stackId = this.defaultStackId) {
      if (!command.execute || !command.undo) {
        throw new Error("Command must have execute and undo methods");
      }

      const stack = this.getStack(stackId);

      // Execute the command
      const result = command.execute();

      // Add to history
      const entry = {
        command,
        timestamp: Date.now(),
        description: command.description || "Unknown action",
        result,
      };

      if (stack.transaction) {
        stack.transaction.commands.push(entry);
      } else {
        this._addToHistory(stack, entry);
      }

      return result;
    }

    /**
     * Create a simple action command
     */
    action(doFn, undoFn, description = "") {
      return {
        execute: doFn,
        undo: undoFn,
        description,
      };
    }

    /**
     * Create a property change command
     */
    propertyChange(target, property, newValue, description = "") {
      const oldValue = target[property];
      return {
        execute: () => {
          target[property] = newValue;
          return newValue;
        },
        undo: () => {
          target[property] = oldValue;
          return oldValue;
        },
        description: description || `Change ${property}`,
      };
    }

    /**
     * Create an array mutation command
     */
    arrayPush(array, item, description = "") {
      return {
        execute: () => {
          array.push(item);
          return array.length;
        },
        undo: () => {
          array.pop();
          return array.length;
        },
        description: description || "Add item",
      };
    }

    arrayPop(array, description = "") {
      let removed;
      return {
        execute: () => {
          removed = array.pop();
          return removed;
        },
        undo: () => {
          array.push(removed);
          return removed;
        },
        description: description || "Remove item",
      };
    }

    arraySplice(array, index, deleteCount, ...items) {
      let removed;
      return {
        execute: () => {
          removed = array.splice(index, deleteCount, ...items);
          return removed;
        },
        undo: () => {
          array.splice(index, items.length, ...removed);
          return removed;
        },
        description: `Splice at ${index}`,
      };
    }

    /**
     * Create a DOM mutation command
     */
    domAppend(parent, child, description = "") {
      return {
        execute: () => {
          parent.appendChild(child);
          return child;
        },
        undo: () => {
          parent.removeChild(child);
          return child;
        },
        description: description || "Append element",
      };
    }

    domRemove(element, description = "") {
      const parent = element.parentNode;
      const nextSibling = element.nextSibling;
      return {
        execute: () => {
          element.remove();
          return element;
        },
        undo: () => {
          parent.insertBefore(element, nextSibling);
          return element;
        },
        description: description || "Remove element",
      };
    }

    domAttribute(element, attr, newValue, description = "") {
      const oldValue = element.getAttribute(attr);
      return {
        execute: () => {
          if (newValue === null) element.removeAttribute(attr);
          else element.setAttribute(attr, newValue);
          return newValue;
        },
        undo: () => {
          if (oldValue === null) element.removeAttribute(attr);
          else element.setAttribute(attr, oldValue);
          return oldValue;
        },
        description: description || `Change ${attr}`,
      };
    }

    domClass(element, className, add, description = "") {
      return {
        execute: () => {
          element.classList.toggle(className, add);
          return add;
        },
        undo: () => {
          element.classList.toggle(className, !add);
          return !add;
        },
        description:
          description || `${add ? "Add" : "Remove"} class ${className}`,
      };
    }

    domStyle(element, property, newValue, description = "") {
      const oldValue = element.style[property];
      return {
        execute: () => {
          element.style[property] = newValue;
          return newValue;
        },
        undo: () => {
          element.style[property] = oldValue;
          return oldValue;
        },
        description: description || `Change ${property} style`,
      };
    }

    domInnerHTML(element, newHTML, description = "") {
      const oldHTML = element.innerHTML;
      return {
        execute: () => {
          element.innerHTML = newHTML;
          return newHTML;
        },
        undo: () => {
          element.innerHTML = oldHTML;
          return oldHTML;
        },
        description: description || "Change content",
      };
    }

    domTextContent(element, newText, description = "") {
      const oldText = element.textContent;
      return {
        execute: () => {
          element.textContent = newText;
          return newText;
        },
        undo: () => {
          element.textContent = oldText;
          return oldText;
        },
        description: description || "Change text",
      };
    }

    // ============================================================
    // STATE SNAPSHOTS
    // ============================================================

    /**
     * Push a state snapshot
     */
    pushState(state, description = "", stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      const clonedState = this._deepClone(state);

      const entry = {
        state: clonedState,
        timestamp: Date.now(),
        description,
        type: "state",
      };

      if (stack.transaction) {
        stack.transaction.commands.push(entry);
      } else {
        this._addToHistory(stack, entry);
      }
    }

    /**
     * Push a diff-based state (memory efficient)
     */
    pushDiff(
      oldState,
      newState,
      description = "",
      stackId = this.defaultStackId,
    ) {
      const stack = this.getStack(stackId);
      const diff = this._createDiff(oldState, newState);

      const entry = {
        diff,
        timestamp: Date.now(),
        description,
        type: "diff",
      };

      if (stack.transaction) {
        stack.transaction.commands.push(entry);
      } else {
        this._addToHistory(stack, entry);
      }
    }

    /**
     * Create diff between two states
     */
    _createDiff(oldState, newState) {
      const changes = [];

      const compare = (path, oldVal, newVal) => {
        if (oldVal === newVal) return;

        if (
          typeof oldVal !== typeof newVal ||
          oldVal === null ||
          newVal === null ||
          typeof oldVal !== "object"
        ) {
          changes.push({ path, oldVal, newVal });
          return;
        }

        if (Array.isArray(oldVal) !== Array.isArray(newVal)) {
          changes.push({ path, oldVal, newVal });
          return;
        }

        const allKeys = new Set([
          ...Object.keys(oldVal),
          ...Object.keys(newVal),
        ]);

        for (const key of allKeys) {
          compare([...path, key], oldVal[key], newVal[key]);
        }
      };

      compare([], oldState, newState);
      return changes;
    }

    /**
     * Apply diff to state
     */
    _applyDiff(state, diff, reverse = false) {
      const result = this._deepClone(state);

      for (const change of diff) {
        const value = reverse ? change.oldVal : change.newVal;
        let target = result;

        for (let i = 0; i < change.path.length - 1; i++) {
          target = target[change.path[i]];
        }

        const lastKey = change.path[change.path.length - 1];
        if (value === undefined) {
          delete target[lastKey];
        } else {
          target[lastKey] = value;
        }
      }

      return result;
    }

    // ============================================================
    // UNDO/REDO OPERATIONS
    // ============================================================

    /**
     * Undo the last action
     */
    undo(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);

      if (stack.past.length === 0) {
        return null;
      }

      this._runHooks("beforeUndo", stackId);

      const entry = stack.past.pop();
      stack.future.unshift(entry);

      let result;
      if (entry.command) {
        result = entry.command.undo();
      } else if (entry.type === "state") {
        result = entry.state;
      } else if (entry.type === "diff") {
        result = entry.diff;
      }

      this._runHooks("afterUndo", stackId, entry);
      this._notifyChange(stackId);

      return result;
    }

    /**
     * Redo the last undone action
     */
    redo(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);

      if (stack.future.length === 0) {
        return null;
      }

      this._runHooks("beforeRedo", stackId);

      const entry = stack.future.shift();
      stack.past.push(entry);

      let result;
      if (entry.command) {
        result = entry.command.execute();
      } else if (entry.type === "state") {
        result = entry.state;
      } else if (entry.type === "diff") {
        result = entry.diff;
      }

      this._runHooks("afterRedo", stackId, entry);
      this._notifyChange(stackId);

      return result;
    }

    /**
     * Undo multiple steps
     */
    undoMultiple(count, stackId = this.defaultStackId) {
      const results = [];
      for (let i = 0; i < count; i++) {
        const result = this.undo(stackId);
        if (result === null) break;
        results.push(result);
      }
      return results;
    }

    /**
     * Redo multiple steps
     */
    redoMultiple(count, stackId = this.defaultStackId) {
      const results = [];
      for (let i = 0; i < count; i++) {
        const result = this.redo(stackId);
        if (result === null) break;
        results.push(result);
      }
      return results;
    }

    /**
     * Jump to a specific point in history
     */
    jumpTo(index, stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      const currentIndex = stack.past.length - 1;

      if (index === currentIndex) return null;

      if (index < currentIndex) {
        // Go back
        return this.undoMultiple(currentIndex - index, stackId);
      } else {
        // Go forward
        return this.redoMultiple(index - currentIndex, stackId);
      }
    }

    // ============================================================
    // TRANSACTIONS
    // ============================================================

    /**
     * Begin a transaction (group multiple actions)
     */
    beginTransaction(description = "", stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);

      if (stack.transaction) {
        throw new Error("Transaction already in progress");
      }

      stack.transaction = {
        commands: [],
        description,
        startTime: Date.now(),
      };
    }

    /**
     * Commit the current transaction
     */
    commit(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);

      if (!stack.transaction) {
        throw new Error("No transaction in progress");
      }

      if (stack.transaction.commands.length > 0) {
        const entry = {
          commands: stack.transaction.commands,
          timestamp: Date.now(),
          description: stack.transaction.description,
          type: "transaction",
        };

        this._addToHistory(stack, entry);
      }

      stack.transaction = null;
    }

    /**
     * Rollback the current transaction
     */
    rollback(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);

      if (!stack.transaction) {
        throw new Error("No transaction in progress");
      }

      // Undo all commands in reverse order
      const commands = stack.transaction.commands.slice().reverse();
      for (const entry of commands) {
        if (entry.command) {
          entry.command.undo();
        }
      }

      stack.transaction = null;
    }

    /**
     * Execute a function as a transaction
     */
    transaction(fn, description = "", stackId = this.defaultStackId) {
      this.beginTransaction(description, stackId);
      try {
        const result = fn();
        this.commit(stackId);
        return result;
      } catch (error) {
        this.rollback(stackId);
        throw error;
      }
    }

    /**
     * Async transaction
     */
    async transactionAsync(
      fn,
      description = "",
      stackId = this.defaultStackId,
    ) {
      this.beginTransaction(description, stackId);
      try {
        const result = await fn();
        this.commit(stackId);
        return result;
      } catch (error) {
        this.rollback(stackId);
        throw error;
      }
    }

    // ============================================================
    // HISTORY INFO
    // ============================================================

    /**
     * Check if can undo
     */
    canUndo(stackId = this.defaultStackId) {
      return this.getStack(stackId).past.length > 0;
    }

    /**
     * Check if can redo
     */
    canRedo(stackId = this.defaultStackId) {
      return this.getStack(stackId).future.length > 0;
    }

    /**
     * Get undo count
     */
    undoCount(stackId = this.defaultStackId) {
      return this.getStack(stackId).past.length;
    }

    /**
     * Get redo count
     */
    redoCount(stackId = this.defaultStackId) {
      return this.getStack(stackId).future.length;
    }

    /**
     * Get history
     */
    getHistory(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      return {
        past: [...stack.past],
        future: [...stack.future],
        currentIndex: stack.past.length - 1,
        totalCount: stack.past.length + stack.future.length,
      };
    }

    /**
     * Get last action description
     */
    getLastAction(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      const last = stack.past[stack.past.length - 1];
      return last ? last.description : null;
    }

    /**
     * Get next redo action description
     */
    getNextRedo(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      const next = stack.future[0];
      return next ? next.description : null;
    }

    // ============================================================
    // SAVE POINTS
    // ============================================================

    /**
     * Mark current point as saved
     */
    markSaved(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      stack.savedIndex = stack.past.length - 1;
    }

    /**
     * Check if state is modified since last save
     */
    isModified(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      return stack.savedIndex !== stack.past.length - 1;
    }

    /**
     * Get steps since last save
     */
    stepsSinceSave(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      return Math.abs(stack.past.length - 1 - stack.savedIndex);
    }

    /**
     * Revert to saved point
     */
    revertToSaved(stackId = this.defaultStackId) {
      const stack = this.getStack(stackId);
      if (stack.savedIndex === -1) return null;
      return this.jumpTo(stack.savedIndex, stackId);
    }

    // ============================================================
    // KEYBOARD SHORTCUTS
    // ============================================================

    /**
     * Enable keyboard shortcuts
     */
    enableKeyboard(stackId = this.defaultStackId) {
      if (this.keyboardEnabled) return;

      this._keyHandler = (e) => {
        // Ctrl+Z / Cmd+Z = Undo
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          this.undo(stackId);
        }
        // Ctrl+Shift+Z / Cmd+Shift+Z = Redo
        // Ctrl+Y = Redo
        if (
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
          ((e.ctrlKey || e.metaKey) && e.key === "y")
        ) {
          e.preventDefault();
          this.redo(stackId);
        }
      };

      document.addEventListener("keydown", this._keyHandler);
      this.keyboardEnabled = true;
    }

    /**
     * Disable keyboard shortcuts
     */
    disableKeyboard() {
      if (!this.keyboardEnabled) return;

      document.removeEventListener("keydown", this._keyHandler);
      this.keyboardEnabled = false;
    }

    // ============================================================
    // HOOKS AND EVENTS
    // ============================================================

    /**
     * Add hook
     */
    on(event, callback) {
      if (this.hooks[event]) {
        this.hooks[event].push(callback);
      }
      return () => this.off(event, callback);
    }

    /**
     * Remove hook
     */
    off(event, callback) {
      if (this.hooks[event]) {
        const index = this.hooks[event].indexOf(callback);
        if (index !== -1) {
          this.hooks[event].splice(index, 1);
        }
      }
    }

    /**
     * Run hooks
     */
    _runHooks(event, stackId, data) {
      for (const hook of this.hooks[event]) {
        try {
          hook(stackId, data);
        } catch (e) {
          console.error(`Hook error (${event}):`, e);
        }
      }
    }

    /**
     * Notify change
     */
    _notifyChange(stackId) {
      this._runHooks("onChange", stackId, {
        canUndo: this.canUndo(stackId),
        canRedo: this.canRedo(stackId),
        undoCount: this.undoCount(stackId),
        redoCount: this.redoCount(stackId),
      });
    }

    // ============================================================
    // HELPERS
    // ============================================================

    /**
     * Add entry to history
     */
    _addToHistory(stack, entry) {
      // Clear future when new action is performed
      stack.future = [];

      // Add to past
      stack.past.push(entry);

      // Trim history if needed
      if (stack.past.length > this.maxHistorySize) {
        stack.past.shift();
        if (stack.savedIndex !== -1) {
          stack.savedIndex--;
        }
      }

      this._notifyChange(stack.id);
    }

    /**
     * Deep clone helper
     */
    _deepClone(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }

      if (obj instanceof Date) {
        return new Date(obj.getTime());
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => this._deepClone(item));
      }

      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this._deepClone(obj[key]);
        }
      }
      return cloned;
    }

    // ============================================================
    // UI HELPERS
    // ============================================================

    /**
     * Create undo/redo buttons
     */
    createButtons(container, stackId = this.defaultStackId) {
      const wrapper = document.createElement("div");
      wrapper.className = "bael-undo-buttons";

      const undoBtn = document.createElement("button");
      undoBtn.className = "bael-undo-btn";
      undoBtn.innerHTML = "↩ Undo";
      undoBtn.disabled = !this.canUndo(stackId);
      undoBtn.onclick = () => this.undo(stackId);

      const redoBtn = document.createElement("button");
      redoBtn.className = "bael-redo-btn";
      redoBtn.innerHTML = "Redo ↪";
      redoBtn.disabled = !this.canRedo(stackId);
      redoBtn.onclick = () => this.redo(stackId);

      wrapper.appendChild(undoBtn);
      wrapper.appendChild(redoBtn);

      // Update on changes
      this.on("onChange", (id, data) => {
        if (id === stackId) {
          undoBtn.disabled = !data.canUndo;
          redoBtn.disabled = !data.canRedo;
        }
      });

      if (typeof container === "string") {
        container = document.querySelector(container);
      }
      container.appendChild(wrapper);

      return { wrapper, undoBtn, redoBtn };
    }

    /**
     * Create history panel
     */
    createHistoryPanel(container, stackId = this.defaultStackId) {
      const panel = document.createElement("div");
      panel.className = "bael-history-panel";

      const title = document.createElement("h3");
      title.textContent = "History";
      panel.appendChild(title);

      const list = document.createElement("ul");
      list.className = "bael-history-list";
      panel.appendChild(list);

      const render = () => {
        const history = this.getHistory(stackId);
        list.innerHTML = "";

        history.past.forEach((entry, index) => {
          const item = document.createElement("li");
          item.className = "bael-history-item";
          if (index === history.currentIndex) {
            item.classList.add("current");
          }
          item.textContent = entry.description || "Action";
          item.onclick = () => this.jumpTo(index, stackId);
          list.appendChild(item);
        });

        history.future.forEach((entry, index) => {
          const item = document.createElement("li");
          item.className = "bael-history-item future";
          item.textContent = entry.description || "Action";
          item.onclick = () =>
            this.jumpTo(history.past.length + index, stackId);
          list.appendChild(item);
        });
      };

      render();
      this.on("onChange", (id) => {
        if (id === stackId) render();
      });

      if (typeof container === "string") {
        container = document.querySelector(container);
      }
      container.appendChild(panel);

      return panel;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelUndo();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$undo = (stackId) => bael.undo(stackId);
  window.$redo = (stackId) => bael.redo(stackId);
  window.$undoable = (doFn, undoFn, desc) =>
    bael.execute(bael.action(doFn, undoFn, desc));
  window.$transaction = (fn, desc, stackId) =>
    bael.transaction(fn, desc, stackId);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelUndo = bael;

  // Auto-initialize keyboard shortcuts
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bael.enableKeyboard();
    });
  } else {
    bael.enableKeyboard();
  }

  console.log("🔄 BAEL Undo System loaded");
})();
