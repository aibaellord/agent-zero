/**
 * BAEL Proxy - Reactive Proxy & Data Binding System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete proxy system:
 * - Reactive proxies
 * - Deep observation
 * - Computed properties
 * - Two-way binding
 * - Change detection
 */

(function () {
  "use strict";

  class BaelProxy {
    constructor() {
      this.proxies = new WeakMap();
      this.handlers = new WeakMap();
      console.log("🔗 Bael Proxy initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // REACTIVE PROXY
    // ═══════════════════════════════════════════════════════════

    reactive(target, options = {}) {
      if (this.proxies.has(target)) {
        return this.proxies.get(target);
      }

      if (!this._isObject(target)) {
        return target;
      }

      const handlers = {
        get: new Set(),
        set: new Set(),
        delete: new Set(),
      };

      this.handlers.set(target, handlers);

      const proxy = new Proxy(target, {
        get: (obj, prop, receiver) => {
          const value = Reflect.get(obj, prop, receiver);

          // Track access
          if (options.trackGet) {
            handlers.get.forEach((h) => h(prop, value));
          }

          // Deep reactivity
          if (options.deep !== false && this._isObject(value)) {
            return this.reactive(value, options);
          }

          return value;
        },

        set: (obj, prop, value, receiver) => {
          const oldValue = obj[prop];

          if (Object.is(oldValue, value)) {
            return true;
          }

          const result = Reflect.set(obj, prop, value, receiver);

          // Notify listeners
          handlers.set.forEach((h) => h(prop, value, oldValue));

          return result;
        },

        deleteProperty: (obj, prop) => {
          const oldValue = obj[prop];
          const result = Reflect.deleteProperty(obj, prop);

          if (result) {
            handlers.delete.forEach((h) => h(prop, oldValue));
          }

          return result;
        },
      });

      this.proxies.set(target, proxy);
      return proxy;
    }

    // ═══════════════════════════════════════════════════════════
    // OBSERVATION
    // ═══════════════════════════════════════════════════════════

    watch(target, callback, options = {}) {
      const handlers = this.handlers.get(target);
      if (!handlers) {
        throw new Error("Target is not reactive");
      }

      const watchFn = (prop, newValue, oldValue) => {
        if (options.deep && this._isObject(newValue)) {
          this.watch(newValue, callback, options);
        }
        callback({ prop, newValue, oldValue, target });
      };

      handlers.set.add(watchFn);

      // Also watch deletions
      if (options.watchDelete !== false) {
        handlers.delete.add((prop, oldValue) => {
          callback({
            prop,
            newValue: undefined,
            oldValue,
            target,
            deleted: true,
          });
        });
      }

      // Return unwatch function
      return () => {
        handlers.set.delete(watchFn);
      };
    }

    watchPath(target, path, callback) {
      const parts = path.split(".");
      let current = target;

      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
        if (!this._isObject(current)) return () => {};
      }

      const lastProp = parts[parts.length - 1];

      return this.watch(current, (change) => {
        if (change.prop === lastProp) {
          callback(change);
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // COMPUTED PROPERTIES
    // ═══════════════════════════════════════════════════════════

    computed(target, computedProps) {
      const reactive = this.reactive(target);
      const cache = new Map();
      const deps = new Map();

      for (const [key, getter] of Object.entries(computedProps)) {
        // Track dependencies
        const tracked = new Set();

        const compute = () => {
          tracked.clear();
          const result = getter.call(reactive, reactive);
          deps.set(key, new Set(tracked));
          cache.set(key, result);
          return result;
        };

        // Initial computation
        compute();

        // Watch for dependency changes
        this.watch(target, (change) => {
          const propDeps = deps.get(key);
          if (propDeps && propDeps.has(change.prop)) {
            compute();
          }
        });

        // Define computed property
        Object.defineProperty(reactive, key, {
          get: () => cache.get(key),
          enumerable: true,
        });
      }

      return reactive;
    }

    // ═══════════════════════════════════════════════════════════
    // DATA BINDING
    // ═══════════════════════════════════════════════════════════

    bind(element, target, property, options = {}) {
      const reactive = this.reactive(target);
      const bindings = [];

      // Get initial value
      const getValue = () => {
        const parts = property.split(".");
        return parts.reduce((obj, key) => obj?.[key], reactive);
      };

      // Set value
      const setValue = (value) => {
        const parts = property.split(".");
        const last = parts.pop();
        const parent = parts.reduce((obj, key) => obj?.[key], reactive);
        if (parent) parent[last] = value;
      };

      // Update element
      const updateElement = () => {
        const value = getValue();

        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
          if (element.type === "checkbox") {
            element.checked = !!value;
          } else if (element.type === "radio") {
            element.checked = element.value === String(value);
          } else {
            element.value = value ?? "";
          }
        } else if (element.tagName === "SELECT") {
          element.value = value ?? "";
        } else {
          if (options.html) {
            element.innerHTML = value ?? "";
          } else {
            element.textContent = value ?? "";
          }
        }
      };

      // Initial update
      updateElement();

      // Watch for model changes
      const unwatch = this.watchPath(target, property, updateElement);
      bindings.push(unwatch);

      // Two-way binding for inputs
      if (options.twoWay !== false) {
        const inputHandler = (e) => {
          const el = e.target;
          let value;

          if (el.type === "checkbox") {
            value = el.checked;
          } else if (el.type === "number" || el.type === "range") {
            value = parseFloat(el.value);
          } else {
            value = el.value;
          }

          setValue(value);
        };

        const eventType = element.tagName === "SELECT" ? "change" : "input";
        element.addEventListener(eventType, inputHandler);
        bindings.push(() =>
          element.removeEventListener(eventType, inputHandler),
        );
      }

      // Return unbind function
      return () => bindings.forEach((fn) => fn());
    }

    bindAll(container, target, options = {}) {
      const bindings = [];
      const selector = options.selector || "[data-bind]";
      const elements = container.querySelectorAll(selector);

      elements.forEach((element) => {
        const property = element.dataset.bind;
        if (property) {
          const unbind = this.bind(element, target, property, options);
          bindings.push(unbind);
        }
      });

      return () => bindings.forEach((fn) => fn());
    }

    // ═══════════════════════════════════════════════════════════
    // CHANGE DETECTION
    // ═══════════════════════════════════════════════════════════

    diff(oldObj, newObj) {
      const changes = [];

      const allKeys = new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {}),
      ]);

      for (const key of allKeys) {
        const oldVal = oldObj?.[key];
        const newVal = newObj?.[key];

        if (!Object.is(oldVal, newVal)) {
          if (!(key in (newObj || {}))) {
            changes.push({ type: "delete", key, oldValue: oldVal });
          } else if (!(key in (oldObj || {}))) {
            changes.push({ type: "add", key, newValue: newVal });
          } else {
            changes.push({
              type: "update",
              key,
              oldValue: oldVal,
              newValue: newVal,
            });
          }
        }
      }

      return changes;
    }

    deepDiff(oldObj, newObj, path = "") {
      const changes = [];

      const allKeys = new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {}),
      ]);

      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const oldVal = oldObj?.[key];
        const newVal = newObj?.[key];

        if (this._isObject(oldVal) && this._isObject(newVal)) {
          changes.push(...this.deepDiff(oldVal, newVal, currentPath));
        } else if (!Object.is(oldVal, newVal)) {
          if (!(key in (newObj || {}))) {
            changes.push({
              type: "delete",
              path: currentPath,
              oldValue: oldVal,
            });
          } else if (!(key in (oldObj || {}))) {
            changes.push({ type: "add", path: currentPath, newValue: newVal });
          } else {
            changes.push({
              type: "update",
              path: currentPath,
              oldValue: oldVal,
              newValue: newVal,
            });
          }
        }
      }

      return changes;
    }

    // ═══════════════════════════════════════════════════════════
    // IMMUTABLE OPERATIONS
    // ═══════════════════════════════════════════════════════════

    clone(obj) {
      if (!this._isObject(obj)) return obj;

      if (Array.isArray(obj)) {
        return obj.map((item) => this.clone(item));
      }

      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.clone(value);
      }
      return result;
    }

    freeze(obj) {
      if (!this._isObject(obj)) return obj;

      Object.freeze(obj);

      for (const value of Object.values(obj)) {
        if (this._isObject(value)) {
          this.freeze(value);
        }
      }

      return obj;
    }

    setPath(obj, path, value) {
      const result = this.clone(obj);
      const parts = path.split(".");
      const last = parts.pop();

      let current = result;
      for (const part of parts) {
        if (!this._isObject(current[part])) {
          current[part] = {};
        } else {
          current[part] = this.clone(current[part]);
        }
        current = current[part];
      }

      current[last] = value;
      return result;
    }

    deletePath(obj, path) {
      const result = this.clone(obj);
      const parts = path.split(".");
      const last = parts.pop();

      let current = result;
      for (const part of parts) {
        if (!this._isObject(current[part])) return result;
        current[part] = this.clone(current[part]);
        current = current[part];
      }

      delete current[last];
      return result;
    }

    mergePath(obj, path, value) {
      const existing = this.getPath(obj, path) || {};
      return this.setPath(obj, path, { ...existing, ...value });
    }

    getPath(obj, path) {
      return path.split(".").reduce((o, k) => o?.[k], obj);
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _isObject(value) {
      return value !== null && typeof value === "object";
    }

    isReactive(target) {
      return this.proxies.has(target);
    }

    toRaw(proxy) {
      // Find the original object
      for (const [target, p] of this.proxies) {
        if (p === proxy) return target;
      }
      return proxy;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // REF (Simple reactive reference)
  // ═══════════════════════════════════════════════════════════════════

  class Ref {
    constructor(value) {
      this._value = value;
      this._listeners = new Set();
    }

    get value() {
      return this._value;
    }

    set value(newValue) {
      const oldValue = this._value;
      if (!Object.is(oldValue, newValue)) {
        this._value = newValue;
        this._listeners.forEach((fn) => fn(newValue, oldValue));
      }
    }

    watch(callback) {
      this._listeners.add(callback);
      return () => this._listeners.delete(callback);
    }

    toString() {
      return String(this._value);
    }

    valueOf() {
      return this._value;
    }
  }

  function ref(value) {
    return new Ref(value);
  }

  function isRef(value) {
    return value instanceof Ref;
  }

  function unref(value) {
    return isRef(value) ? value.value : value;
  }

  // Initialize
  window.BaelProxy = new BaelProxy();
  window.Ref = Ref;

  // Global shortcuts
  window.$proxy = window.BaelProxy;
  window.$reactive = (obj, opts) => window.BaelProxy.reactive(obj, opts);
  window.$ref = ref;
  window.$watch = (target, cb, opts) =>
    window.BaelProxy.watch(target, cb, opts);

  console.log("🔗 Bael Proxy ready");
})();
