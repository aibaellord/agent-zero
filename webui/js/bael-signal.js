/**
 * BAEL Signal - Fine-grained Reactivity System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete signal system:
 * - Signals (reactive values)
 * - Effects (side effects)
 * - Computed signals
 * - Batching
 * - Automatic dependency tracking
 */

(function () {
  "use strict";

  // Global state
  let currentEffect = null;
  let batchDepth = 0;
  let pendingEffects = new Set();

  class BaelSignal {
    constructor() {
      console.log("⚡ Bael Signal initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // SIGNAL CREATION
    // ═══════════════════════════════════════════════════════════

    create(initialValue) {
      return new Signal(initialValue);
    }

    computed(fn) {
      return new ComputedSignal(fn);
    }

    effect(fn) {
      return new Effect(fn);
    }

    // ═══════════════════════════════════════════════════════════
    // BATCHING
    // ═══════════════════════════════════════════════════════════

    batch(fn) {
      batchDepth++;
      try {
        return fn();
      } finally {
        batchDepth--;
        if (batchDepth === 0) {
          this._flushEffects();
        }
      }
    }

    _flushEffects() {
      const effects = [...pendingEffects];
      pendingEffects.clear();

      for (const effect of effects) {
        effect.run();
      }
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    untrack(fn) {
      const prev = currentEffect;
      currentEffect = null;
      try {
        return fn();
      } finally {
        currentEffect = prev;
      }
    }

    isSignal(value) {
      return value instanceof Signal;
    }

    isComputed(value) {
      return value instanceof ComputedSignal;
    }

    isEffect(value) {
      return value instanceof Effect;
    }

    // ═══════════════════════════════════════════════════════════
    // CONVENIENCE METHODS
    // ═══════════════════════════════════════════════════════════

    memo(fn, deps) {
      let cached;
      let lastDeps;

      return () => {
        const currentDeps = deps();
        const hasChanged =
          !lastDeps ||
          currentDeps.length !== lastDeps.length ||
          currentDeps.some((dep, i) => !Object.is(dep, lastDeps[i]));

        if (hasChanged) {
          cached = fn();
          lastDeps = currentDeps;
        }

        return cached;
      };
    }

    when(signal, predicate, callback) {
      return this.effect(() => {
        if (predicate(signal.value)) {
          callback(signal.value);
        }
      });
    }

    sync(source, target, transform = (v) => v) {
      return this.effect(() => {
        target.value = transform(source.value);
      });
    }

    combine(...signals) {
      return this.computed(() => signals.map((s) => s.value));
    }

    select(signal, selector) {
      return this.computed(() => selector(signal.value));
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SIGNAL
  // ═══════════════════════════════════════════════════════════════════

  class Signal {
    constructor(value) {
      this._value = value;
      this._subscribers = new Set();
    }

    get value() {
      // Track dependency
      if (currentEffect) {
        this._subscribers.add(currentEffect);
        currentEffect._dependencies.add(this);
      }
      return this._value;
    }

    set value(newValue) {
      if (Object.is(this._value, newValue)) return;

      this._value = newValue;
      this._notify();
    }

    peek() {
      return this._value;
    }

    update(fn) {
      this.value = fn(this._value);
    }

    _notify() {
      for (const subscriber of this._subscribers) {
        if (batchDepth > 0) {
          pendingEffects.add(subscriber);
        } else {
          subscriber.run();
        }
      }
    }

    subscribe(callback) {
      const effect = new Effect(() => {
        callback(this.value);
      });
      return () => effect.dispose();
    }

    toJSON() {
      return this._value;
    }

    toString() {
      return String(this._value);
    }

    valueOf() {
      return this._value;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED SIGNAL
  // ═══════════════════════════════════════════════════════════════════

  class ComputedSignal extends Signal {
    constructor(fn) {
      super(undefined);
      this._fn = fn;
      this._dirty = true;
      this._effect = null;
      this._computing = false;
    }

    get value() {
      // Track dependency
      if (currentEffect) {
        this._subscribers.add(currentEffect);
        currentEffect._dependencies.add(this);
      }

      if (this._dirty) {
        this._compute();
      }

      return this._value;
    }

    set value(v) {
      throw new Error("Cannot set computed signal");
    }

    _compute() {
      if (this._computing) {
        throw new Error("Circular dependency detected");
      }

      this._computing = true;

      // Clean up old dependencies
      if (this._effect) {
        this._effect.dispose();
      }

      // Create internal effect to track dependencies
      const self = this;
      this._effect = new Effect(
        () => {
          const newValue = self._fn();
          if (!Object.is(self._value, newValue)) {
            self._value = newValue;
            self._dirty = false;
            self._notify();
          }
        },
        { lazy: true },
      );

      this._effect.run();
      this._computing = false;
      this._dirty = false;
    }

    peek() {
      if (this._dirty) {
        this._compute();
      }
      return this._value;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EFFECT
  // ═══════════════════════════════════════════════════════════════════

  class Effect {
    constructor(fn, options = {}) {
      this._fn = fn;
      this._dependencies = new Set();
      this._disposed = false;
      this._onCleanup = null;

      if (!options.lazy) {
        this.run();
      }
    }

    run() {
      if (this._disposed) return;

      // Cleanup previous dependencies
      this._cleanup();

      // Track new dependencies
      const prev = currentEffect;
      currentEffect = this;

      try {
        const result = this._fn();

        // Support cleanup function
        if (typeof result === "function") {
          this._onCleanup = result;
        }
      } finally {
        currentEffect = prev;
      }
    }

    _cleanup() {
      // Call cleanup function
      if (this._onCleanup) {
        this._onCleanup();
        this._onCleanup = null;
      }

      // Remove from all dependencies
      for (const dep of this._dependencies) {
        dep._subscribers.delete(this);
      }
      this._dependencies.clear();
    }

    dispose() {
      this._cleanup();
      this._disposed = true;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STORE (Signal-based state container)
  // ═══════════════════════════════════════════════════════════════════

  class SignalStore {
    constructor(initialState = {}) {
      this._signals = {};
      this._computed = {};

      // Create signals for each property
      for (const [key, value] of Object.entries(initialState)) {
        if (typeof value === "function") {
          this._computed[key] = new ComputedSignal(() => value(this));
        } else {
          this._signals[key] = new Signal(value);
        }
      }

      // Create proxy for easy access
      return new Proxy(this, {
        get(target, prop) {
          if (prop in target._signals) {
            return target._signals[prop].value;
          }
          if (prop in target._computed) {
            return target._computed[prop].value;
          }
          return target[prop];
        },
        set(target, prop, value) {
          if (prop in target._signals) {
            target._signals[prop].value = value;
            return true;
          }
          if (prop in target._computed) {
            throw new Error(`Cannot set computed property: ${prop}`);
          }
          target[prop] = value;
          return true;
        },
      });
    }

    getSignal(key) {
      return this._signals[key] || this._computed[key];
    }

    subscribe(key, callback) {
      const signal = this.getSignal(key);
      return signal ? signal.subscribe(callback) : () => {};
    }

    batch(fn) {
      return window.BaelSignal.batch(() => fn(this));
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // FACTORY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  function signal(value) {
    return new Signal(value);
  }

  function computed(fn) {
    return new ComputedSignal(fn);
  }

  function effect(fn) {
    return new Effect(fn);
  }

  function store(initialState) {
    return new SignalStore(initialState);
  }

  // Initialize
  window.BaelSignal = new BaelSignal();
  window.Signal = Signal;
  window.ComputedSignal = ComputedSignal;
  window.Effect = Effect;
  window.SignalStore = SignalStore;

  // Global shortcuts
  window.$signal = signal;
  window.$computed = computed;
  window.$effect = effect;
  window.$signalStore = store;

  console.log("⚡ Bael Signal ready");
})();
