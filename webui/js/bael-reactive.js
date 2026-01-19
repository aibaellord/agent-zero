/**
 * BAEL Reactive System - Lord Of All Reactivity
 *
 * Reactive data binding system with:
 * - Observable values
 * - Computed properties
 * - Watch functions
 * - Effect system
 * - Dependency tracking
 * - Batch updates
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CORE REACTIVE SYSTEM
  // ============================================================

  class BaelReactive {
    constructor() {
      this.currentEffect = null;
      this.effectStack = [];
      this.batchQueue = [];
      this.isBatching = false;
      this.scheduler = queueMicrotask;
    }

    // ============================================================
    // SIGNAL (REACTIVE VALUE)
    // ============================================================

    /**
     * Create a reactive signal
     */
    signal(initialValue) {
      const self = this;
      const subscribers = new Set();
      let value = initialValue;

      const getter = () => {
        // Track dependency
        if (self.currentEffect) {
          subscribers.add(self.currentEffect);
          self.currentEffect.dependencies.add(subscribers);
        }
        return value;
      };

      const setter = (newValue) => {
        if (newValue !== value) {
          value = newValue;
          self._notifySubscribers(subscribers);
        }
      };

      // Return tuple-like array with getter/setter
      const signal = [getter, setter];
      signal.get = getter;
      signal.set = setter;
      signal.update = (fn) => setter(fn(value));
      signal.peek = () => value;
      signal.subscribe = (fn) => {
        const effect = { fn, dependencies: new Set() };
        subscribers.add(effect);
        return () => subscribers.delete(effect);
      };

      return signal;
    }

    /**
     * Create multiple signals from object
     */
    reactive(obj) {
      const signals = {};
      const result = {};

      for (const key of Object.keys(obj)) {
        const [get, set] = this.signal(obj[key]);
        signals[key] = { get, set };

        Object.defineProperty(result, key, {
          get: () => get(),
          set: (v) => set(v),
          enumerable: true,
        });
      }

      result.$signals = signals;
      result.$set = (key, value) => signals[key]?.set(value);
      result.$get = (key) => signals[key]?.get();
      result.$toJSON = () => {
        const json = {};
        for (const key of Object.keys(signals)) {
          json[key] = signals[key].get();
        }
        return json;
      };

      return result;
    }

    /**
     * Create a ref (object with .value property)
     */
    ref(initialValue) {
      const [get, set] = this.signal(initialValue);
      return {
        get value() {
          return get();
        },
        set value(v) {
          set(v);
        },
        get: get,
        set: set,
        update: (fn) => set(fn(get())),
        peek: () => get(),
      };
    }

    // ============================================================
    // COMPUTED
    // ============================================================

    /**
     * Create a computed value
     */
    computed(computeFn) {
      const self = this;
      let cachedValue;
      let isDirty = true;
      const subscribers = new Set();

      // Effect that marks dirty and triggers recompute
      const effect = {
        fn: () => {
          isDirty = true;
          self._notifySubscribers(subscribers);
        },
        dependencies: new Set(),
      };

      const getter = () => {
        // Track dependency
        if (self.currentEffect) {
          subscribers.add(self.currentEffect);
          self.currentEffect.dependencies.add(subscribers);
        }

        if (isDirty) {
          // Track dependencies during compute
          self._pushEffect(effect);
          try {
            cachedValue = computeFn();
          } finally {
            self._popEffect();
          }
          isDirty = false;
        }

        return cachedValue;
      };

      return {
        get value() {
          return getter();
        },
        get: getter,
        peek: () => cachedValue,
      };
    }

    /**
     * Create a lazy computed (only computes on first access)
     */
    lazy(computeFn) {
      let computed = false;
      let value;

      return {
        get value() {
          if (!computed) {
            value = computeFn();
            computed = true;
          }
          return value;
        },
        reset: () => {
          computed = false;
        },
      };
    }

    // ============================================================
    // EFFECT (SIDE EFFECTS)
    // ============================================================

    /**
     * Create a reactive effect
     */
    effect(effectFn) {
      const self = this;
      const effect = {
        fn: effectFn,
        dependencies: new Set(),
        cleanup: null,
      };

      const execute = () => {
        // Run cleanup from previous execution
        if (effect.cleanup) {
          effect.cleanup();
          effect.cleanup = null;
        }

        // Clear old dependencies
        effect.dependencies.forEach((dep) => dep.delete(effect));
        effect.dependencies.clear();

        // Track dependencies during execution
        self._pushEffect(effect);
        try {
          const cleanup = effectFn();
          if (typeof cleanup === "function") {
            effect.cleanup = cleanup;
          }
        } finally {
          self._popEffect();
        }
      };

      // Run immediately
      execute();

      // Return cleanup function
      return () => {
        if (effect.cleanup) {
          effect.cleanup();
        }
        effect.dependencies.forEach((dep) => dep.delete(effect));
        effect.dependencies.clear();
      };
    }

    /**
     * Create a render effect (runs after DOM updates)
     */
    renderEffect(effectFn) {
      let scheduled = false;
      const execute = () => {
        scheduled = false;
        effectFn();
      };

      return this.effect(() => {
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(execute);
        }
      });
    }

    // ============================================================
    // WATCH
    // ============================================================

    /**
     * Watch a value and run callback on change
     */
    watch(getter, callback, options = {}) {
      const { immediate = false, deep = false } = options;
      let oldValue = deep ? this._deepClone(getter()) : getter();
      let cleanup;

      const compare = deep
        ? (a, b) => JSON.stringify(a) !== JSON.stringify(b)
        : (a, b) => a !== b;

      const dispose = this.effect(() => {
        const newValue = getter();

        if (compare(newValue, oldValue)) {
          if (cleanup) cleanup();
          const result = callback(
            deep ? this._deepClone(newValue) : newValue,
            oldValue,
          );
          if (typeof result === "function") {
            cleanup = result;
          }
          oldValue = deep ? this._deepClone(newValue) : newValue;
        }
      });

      if (immediate) {
        callback(oldValue, undefined);
      }

      return dispose;
    }

    /**
     * Watch multiple values
     */
    watchMultiple(getters, callback, options = {}) {
      let oldValues = getters.map((g) => g());

      return this.effect(() => {
        const newValues = getters.map((g) => g());
        const hasChanged = newValues.some((v, i) => v !== oldValues[i]);

        if (hasChanged) {
          callback(newValues, oldValues);
          oldValues = [...newValues];
        }
      });
    }

    /**
     * Watch once and auto-dispose
     */
    watchOnce(getter, callback) {
      const dispose = this.watch(getter, (newVal, oldVal) => {
        callback(newVal, oldVal);
        dispose();
      });
      return dispose;
    }

    // ============================================================
    // MEMO
    // ============================================================

    /**
     * Memoize a function with reactive dependencies
     */
    memo(fn, deps = []) {
      let cached;
      let lastDeps = [];

      return () => {
        const currentDeps = deps.map((d) =>
          typeof d === "function" ? d() : d,
        );
        const hasChanged = currentDeps.some((v, i) => v !== lastDeps[i]);

        if (hasChanged || lastDeps.length === 0) {
          cached = fn();
          lastDeps = currentDeps;
        }

        return cached;
      };
    }

    // ============================================================
    // BATCH UPDATES
    // ============================================================

    /**
     * Batch multiple updates
     */
    batch(fn) {
      if (this.isBatching) {
        return fn();
      }

      this.isBatching = true;
      try {
        return fn();
      } finally {
        this.isBatching = false;
        this._flushBatch();
      }
    }

    /**
     * Queue an update for batching
     */
    queueUpdate(update) {
      if (this.isBatching) {
        this.batchQueue.push(update);
      } else {
        update();
      }
    }

    /**
     * Flush queued updates
     */
    _flushBatch() {
      const updates = [...this.batchQueue];
      this.batchQueue = [];

      const uniqueUpdates = [...new Set(updates)];
      uniqueUpdates.forEach((update) => update());
    }

    // ============================================================
    // STORE PATTERN
    // ============================================================

    /**
     * Create a reactive store
     */
    createStore(initialState, actions = {}) {
      const self = this;
      const state = this.reactive(initialState);
      const subscribers = new Set();

      const store = {
        state,

        // Getters
        getState: () => state.$toJSON(),

        // Subscribe to all changes
        subscribe: (callback) => {
          subscribers.add(callback);
          return () => subscribers.delete(callback);
        },

        // Dispatch action
        dispatch: (actionName, payload) => {
          if (actions[actionName]) {
            const result = actions[actionName](state, payload);
            subscribers.forEach((cb) =>
              cb(state.$toJSON(), actionName, payload),
            );
            return result;
          }
          console.warn(`Unknown action: ${actionName}`);
        },

        // Select with computed
        select: (selector) => {
          return self.computed(() => selector(state));
        },

        // Watch specific state
        watch: (selector, callback) => {
          return self.watch(() => selector(state), callback);
        },
      };

      // Add action methods directly
      for (const [name, action] of Object.entries(actions)) {
        store[name] = (payload) => store.dispatch(name, payload);
      }

      return store;
    }

    // ============================================================
    // DOM BINDINGS
    // ============================================================

    /**
     * Bind a signal to an element
     */
    bind(element, signal, property = "textContent") {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }

      if (!element) return;

      const [get, set] = Array.isArray(signal)
        ? signal
        : [signal.get, signal.set];

      // Update DOM
      this.effect(() => {
        const value = get();
        if (property === "textContent") {
          element.textContent = value;
        } else if (property === "innerHTML") {
          element.innerHTML = value;
        } else if (property === "value") {
          element.value = value;
        } else if (property.startsWith("style.")) {
          element.style[property.slice(6)] = value;
        } else if (property.startsWith("class.")) {
          element.classList.toggle(property.slice(6), !!value);
        } else {
          element.setAttribute(property, value);
        }
      });

      // Two-way binding for inputs
      if (property === "value" && set) {
        element.addEventListener("input", () => set(element.value));
      }
    }

    /**
     * Bind multiple signals to element
     */
    bindAll(element, bindings) {
      for (const [property, signal] of Object.entries(bindings)) {
        this.bind(element, signal, property);
      }
    }

    /**
     * Create reactive element
     */
    createElement(tag, props = {}, children = []) {
      const element = document.createElement(tag);

      for (const [key, value] of Object.entries(props)) {
        if (key === "className") {
          if (typeof value === "function" || Array.isArray(value)) {
            this.bind(element, value, "class");
          } else {
            element.className = value;
          }
        } else if (key === "style") {
          if (typeof value === "object") {
            for (const [prop, val] of Object.entries(value)) {
              if (typeof val === "function" || Array.isArray(val)) {
                this.bind(element, val, `style.${prop}`);
              } else {
                element.style[prop] = val;
              }
            }
          }
        } else if (key.startsWith("on")) {
          const event = key.slice(2).toLowerCase();
          element.addEventListener(event, value);
        } else if (typeof value === "function" || Array.isArray(value)) {
          this.bind(element, value, key);
        } else {
          element.setAttribute(key, value);
        }
      }

      for (const child of children) {
        if (typeof child === "function" || Array.isArray(child)) {
          const textNode = document.createTextNode("");
          const [get] = Array.isArray(child) ? child : [child.get || child];
          this.effect(() => {
            textNode.textContent = get();
          });
          element.appendChild(textNode);
        } else if (child instanceof Node) {
          element.appendChild(child);
        } else {
          element.appendChild(document.createTextNode(String(child)));
        }
      }

      return element;
    }

    /**
     * Conditional rendering
     */
    when(condition, trueContent, falseContent = null) {
      const [get] = Array.isArray(condition)
        ? condition
        : [condition.get || condition];
      let current = null;
      let parent = null;
      let marker = document.createComment("when");

      const update = () => {
        const value = get();
        const newContent = value ? trueContent : falseContent;

        if (current && current.parentNode) {
          current.remove();
        }

        if (newContent) {
          const element =
            typeof newContent === "function" ? newContent() : newContent;
          if (element) {
            parent = marker.parentNode;
            if (parent) {
              parent.insertBefore(element, marker);
              current = element;
            }
          }
        }
      };

      this.effect(update);

      return marker;
    }

    /**
     * List rendering
     */
    each(list, renderFn, keyFn = (item, i) => i) {
      const [get] = Array.isArray(list) ? list : [list.get || list];
      const fragment = document.createDocumentFragment();
      const marker = document.createComment("each");
      let currentNodes = new Map();

      const update = () => {
        const items = get() || [];
        const parent = marker.parentNode;
        if (!parent) return;

        const newNodes = new Map();
        const newElements = [];

        items.forEach((item, index) => {
          const key = keyFn(item, index);
          let node = currentNodes.get(key);

          if (!node) {
            node = renderFn(item, index);
          }

          newNodes.set(key, node);
          newElements.push(node);
        });

        // Remove old nodes
        currentNodes.forEach((node, key) => {
          if (!newNodes.has(key)) {
            node.remove();
          }
        });

        // Insert new nodes in order
        let current = marker;
        for (const node of newElements) {
          if (node.nextSibling !== current.nextSibling) {
            parent.insertBefore(node, marker);
          }
          current = node;
        }

        currentNodes = newNodes;
      };

      this.effect(update);
      fragment.appendChild(marker);

      return fragment;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    /**
     * Push effect to stack
     */
    _pushEffect(effect) {
      this.effectStack.push(this.currentEffect);
      this.currentEffect = effect;
    }

    /**
     * Pop effect from stack
     */
    _popEffect() {
      this.currentEffect = this.effectStack.pop();
    }

    /**
     * Notify subscribers
     */
    _notifySubscribers(subscribers) {
      for (const sub of subscribers) {
        if (this.isBatching) {
          this.batchQueue.push(() => sub.fn());
        } else {
          this.scheduler(() => sub.fn());
        }
      }
    }

    /**
     * Deep clone
     */
    _deepClone(obj) {
      if (obj === null || typeof obj !== "object") return obj;
      if (obj instanceof Date) return new Date(obj);
      if (Array.isArray(obj)) return obj.map((i) => this._deepClone(i));
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this._deepClone(obj[key]);
        }
      }
      return cloned;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelReactive();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$signal = (v) => bael.signal(v);
  window.$ref = (v) => bael.ref(v);
  window.$computed = (fn) => bael.computed(fn);
  window.$effect = (fn) => bael.effect(fn);
  window.$watch = (g, cb, o) => bael.watch(g, cb, o);
  window.$reactive = (obj) => bael.reactive(obj);
  window.$store = (state, actions) => bael.createStore(state, actions);
  window.$batch = (fn) => bael.batch(fn);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelReactive = bael;

  console.log("⚡ BAEL Reactive System loaded");
})();
