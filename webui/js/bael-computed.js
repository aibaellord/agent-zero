/**
 * BAEL - LORD OF ALL
 * Computed Values - Derived reactive computations
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelComputed {
    constructor() {
      this.computeds = new Map();
      this.dependencies = new WeakMap();
      console.log("🧮 Bael Computed System initialized");
    }

    /**
     * Create a computed value
     */
    create(getter, options = {}) {
      const { lazy = false, memo = true } = options;

      let cached = undefined;
      let dirty = true;
      const subscribers = new Set();
      const deps = new Set();

      const computed = {
        get value() {
          // Track this computed as dependency
          if (window.BaelReactive?.currentEffect) {
            subscribers.add(window.BaelReactive.currentEffect);
          }

          if (dirty || !memo) {
            const prevEffect = window.BaelReactive?.currentEffect;

            // Track dependencies
            const trackEffect = () => {
              dirty = true;
              subscribers.forEach((sub) => sub());
            };

            if (window.BaelReactive) {
              window.BaelReactive.currentEffect = trackEffect;
            }

            cached = getter();
            dirty = false;

            if (window.BaelReactive) {
              window.BaelReactive.currentEffect = prevEffect;
            }
          }

          return cached;
        },

        invalidate() {
          dirty = true;
        },

        subscribe(callback) {
          subscribers.add(callback);
          return () => subscribers.delete(callback);
        },

        __subscribers: subscribers,
      };

      if (!lazy) {
        // Trigger initial computation
        computed.value;
      }

      return computed;
    }

    /**
     * Create writable computed
     */
    writable(getter, setter) {
      const computed = this.create(getter);

      return {
        get value() {
          return computed.value;
        },
        set value(newValue) {
          setter(newValue);
        },
        invalidate: computed.invalidate,
        subscribe: computed.subscribe,
      };
    }

    /**
     * Create async computed
     */
    async(asyncGetter, defaultValue = undefined) {
      let value = defaultValue;
      let loading = true;
      let error = null;
      const subscribers = new Set();

      const refresh = async () => {
        loading = true;
        error = null;
        notify();

        try {
          value = await asyncGetter();
          loading = false;
        } catch (e) {
          error = e;
          loading = false;
        }

        notify();
      };

      const notify = () => {
        subscribers.forEach((sub) => sub());
      };

      refresh();

      return {
        get value() {
          return value;
        },
        get loading() {
          return loading;
        },
        get error() {
          return error;
        },
        refresh,
        subscribe(callback) {
          subscribers.add(callback);
          return () => subscribers.delete(callback);
        },
      };
    }

    /**
     * Create debounced computed
     */
    debounced(getter, delay = 300) {
      let cached = undefined;
      let dirty = true;
      let timeoutId = null;
      const subscribers = new Set();

      const update = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          cached = getter();
          dirty = false;
          subscribers.forEach((sub) => sub());
        }, delay);
      };

      return {
        get value() {
          if (dirty) {
            cached = getter();
            dirty = false;
          }
          return cached;
        },
        invalidate() {
          dirty = true;
          update();
        },
        subscribe(callback) {
          subscribers.add(callback);
          return () => subscribers.delete(callback);
        },
      };
    }

    /**
     * Create filtered computed from array
     */
    filter(source, predicate) {
      return this.create(() => {
        const value = source.value ?? source;
        return Array.isArray(value) ? value.filter(predicate) : [];
      });
    }

    /**
     * Create mapped computed from array
     */
    map(source, mapper) {
      return this.create(() => {
        const value = source.value ?? source;
        return Array.isArray(value) ? value.map(mapper) : [];
      });
    }

    /**
     * Create sorted computed from array
     */
    sorted(source, compareFn) {
      return this.create(() => {
        const value = source.value ?? source;
        return Array.isArray(value) ? [...value].sort(compareFn) : [];
      });
    }

    /**
     * Create reduced computed from array
     */
    reduce(source, reducer, initial) {
      return this.create(() => {
        const value = source.value ?? source;
        return Array.isArray(value) ? value.reduce(reducer, initial) : initial;
      });
    }

    /**
     * Create grouped computed from array
     */
    groupBy(source, keyFn) {
      return this.create(() => {
        const value = source.value ?? source;
        if (!Array.isArray(value)) return {};

        return value.reduce((groups, item) => {
          const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
          return groups;
        }, {});
      });
    }

    /**
     * Create unique computed from array
     */
    unique(source, keyFn = null) {
      return this.create(() => {
        const value = source.value ?? source;
        if (!Array.isArray(value)) return [];

        if (keyFn) {
          const seen = new Set();
          return value.filter((item) => {
            const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }

        return [...new Set(value)];
      });
    }

    /**
     * Create combined computed from multiple sources
     */
    combine(sources, combiner) {
      return this.create(() => {
        const values = sources.map((s) => s.value ?? s);
        return combiner(...values);
      });
    }

    /**
     * Create conditional computed
     */
    when(condition, thenGetter, elseGetter = () => undefined) {
      return this.create(() => {
        const cond =
          typeof condition === "function"
            ? condition()
            : (condition.value ?? condition);
        return cond ? thenGetter() : elseGetter();
      });
    }

    /**
     * Create memoized function
     */
    memo(fn, keyFn = (...args) => JSON.stringify(args)) {
      const cache = new Map();

      return (...args) => {
        const key = keyFn(...args);

        if (cache.has(key)) {
          return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
      };
    }
  }

  // Initialize
  window.BaelComputed = new BaelComputed();
})();
