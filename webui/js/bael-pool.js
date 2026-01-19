/**
 * BAEL Pool - Object & Resource Pooling System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete pooling system:
 * - Object pools
 * - Connection pools
 * - Resource management
 * - Automatic cleanup
 * - Pool statistics
 */

(function () {
  "use strict";

  class BaelPool {
    constructor() {
      this.pools = new Map();
      console.log("🏊 Bael Pool initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // POOL CREATION
    // ═══════════════════════════════════════════════════════════

    create(name, options = {}) {
      if (this.pools.has(name)) {
        throw new Error(`Pool "${name}" already exists`);
      }

      const pool = new ObjectPool({
        name,
        create: options.create || (() => ({})),
        reset: options.reset || ((obj) => obj),
        destroy: options.destroy || (() => {}),
        validate: options.validate || (() => true),
        min: options.min || 0,
        max: options.max || 10,
        acquireTimeout: options.acquireTimeout || 30000,
        idleTimeout: options.idleTimeout || 60000,
        evictionInterval: options.evictionInterval || 30000,
        ...options,
      });

      this.pools.set(name, pool);
      return pool;
    }

    get(name) {
      const pool = this.pools.get(name);
      if (!pool) {
        throw new Error(`Pool "${name}" not found`);
      }
      return pool;
    }

    has(name) {
      return this.pools.has(name);
    }

    destroy(name) {
      const pool = this.pools.get(name);
      if (pool) {
        pool.drain();
        this.pools.delete(name);
      }
    }

    list() {
      return [...this.pools.keys()];
    }

    stats() {
      const result = {};
      for (const [name, pool] of this.pools) {
        result[name] = pool.stats();
      }
      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // SPECIALIZED POOLS
    // ═══════════════════════════════════════════════════════════

    createConnectionPool(name, options) {
      return this.create(name, {
        ...options,
        create: options.connect,
        destroy: options.disconnect || ((conn) => conn.close?.()),
        validate: options.validate || ((conn) => conn.isOpen?.() !== false),
      });
    }

    createDOMPool(name, tagName, options = {}) {
      return this.create(name, {
        create: () => document.createElement(tagName),
        reset: (el) => {
          el.className = "";
          el.removeAttribute("style");
          el.innerHTML = "";
          return el;
        },
        destroy: (el) => el.remove?.(),
        ...options,
      });
    }

    createArrayPool(name, size, options = {}) {
      return this.create(name, {
        create: () => new Array(size),
        reset: (arr) => {
          arr.length = 0;
          arr.length = size;
          return arr;
        },
        ...options,
      });
    }

    createTypedArrayPool(name, TypedArrayClass, size, options = {}) {
      return this.create(name, {
        create: () => new TypedArrayClass(size),
        reset: (arr) => {
          arr.fill(0);
          return arr;
        },
        ...options,
      });
    }

    createCanvasPool(name, width, height, options = {}) {
      return this.create(name, {
        create: () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          return canvas;
        },
        reset: (canvas) => {
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          return canvas;
        },
        ...options,
      });
    }

    createWorkerPool(name, workerScript, options = {}) {
      return this.create(name, {
        create: () => new Worker(workerScript),
        destroy: (worker) => worker.terminate(),
        validate: () => true,
        ...options,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBJECT POOL
  // ═══════════════════════════════════════════════════════════════════

  class ObjectPool {
    constructor(options) {
      this.options = options;
      this.available = [];
      this.inUse = new Set();
      this.waiting = [];
      this._stats = {
        created: 0,
        acquired: 0,
        released: 0,
        destroyed: 0,
        evicted: 0,
        timedOut: 0,
      };

      // Pre-populate minimum
      for (let i = 0; i < options.min; i++) {
        this._createResource();
      }

      // Start eviction timer
      if (options.evictionInterval > 0) {
        this._evictionTimer = setInterval(
          () => this._evict(),
          options.evictionInterval,
        );
      }
    }

    async acquire() {
      // Try to get from available pool
      while (this.available.length > 0) {
        const resource = this.available.pop();

        if (this.options.validate(resource.obj)) {
          resource.lastUsed = Date.now();
          this.inUse.add(resource);
          this._stats.acquired++;
          return resource.obj;
        } else {
          this._destroy(resource);
        }
      }

      // Create new if under max
      if (this.size < this.options.max) {
        const resource = this._createResource();
        resource.lastUsed = Date.now();
        this.inUse.add(resource);
        this._stats.acquired++;
        return resource.obj;
      }

      // Wait for available resource
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const idx = this.waiting.indexOf(waiter);
          if (idx > -1) {
            this.waiting.splice(idx, 1);
          }
          this._stats.timedOut++;
          reject(new Error("Acquire timeout"));
        }, this.options.acquireTimeout);

        const waiter = { resolve, reject, timeout };
        this.waiting.push(waiter);
      });
    }

    release(obj) {
      let resource = null;
      for (const r of this.inUse) {
        if (r.obj === obj) {
          resource = r;
          break;
        }
      }

      if (!resource) return;

      this.inUse.delete(resource);
      this._stats.released++;

      // Reset the object
      try {
        resource.obj = this.options.reset(resource.obj);
      } catch (e) {
        this._destroy(resource);
        return;
      }

      // Check if someone is waiting
      if (this.waiting.length > 0) {
        const waiter = this.waiting.shift();
        clearTimeout(waiter.timeout);
        resource.lastUsed = Date.now();
        this.inUse.add(resource);
        this._stats.acquired++;
        waiter.resolve(resource.obj);
        return;
      }

      // Return to available pool
      resource.lastUsed = Date.now();
      this.available.push(resource);
    }

    async use(fn) {
      const obj = await this.acquire();
      try {
        return await fn(obj);
      } finally {
        this.release(obj);
      }
    }

    _createResource() {
      const obj = this.options.create();
      const resource = {
        obj,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };
      this._stats.created++;
      return resource;
    }

    _destroy(resource) {
      try {
        this.options.destroy(resource.obj);
      } catch (e) {
        console.error("Pool destroy error:", e);
      }
      this._stats.destroyed++;
    }

    _evict() {
      const now = Date.now();
      const toEvict = [];

      // Find idle resources to evict
      for (let i = this.available.length - 1; i >= 0; i--) {
        const resource = this.available[i];
        if (now - resource.lastUsed > this.options.idleTimeout) {
          if (this.size > this.options.min) {
            toEvict.push(i);
          }
        }
      }

      // Evict oldest first
      for (const idx of toEvict) {
        const resource = this.available.splice(idx, 1)[0];
        this._destroy(resource);
        this._stats.evicted++;
      }
    }

    drain() {
      // Clear eviction timer
      if (this._evictionTimer) {
        clearInterval(this._evictionTimer);
      }

      // Reject waiting requests
      for (const waiter of this.waiting) {
        clearTimeout(waiter.timeout);
        waiter.reject(new Error("Pool drained"));
      }
      this.waiting = [];

      // Destroy all resources
      for (const resource of this.available) {
        this._destroy(resource);
      }
      this.available = [];

      for (const resource of this.inUse) {
        this._destroy(resource);
      }
      this.inUse.clear();
    }

    get size() {
      return this.available.length + this.inUse.size;
    }

    get availableCount() {
      return this.available.length;
    }

    get inUseCount() {
      return this.inUse.size;
    }

    get waitingCount() {
      return this.waiting.length;
    }

    stats() {
      return {
        name: this.options.name,
        size: this.size,
        available: this.availableCount,
        inUse: this.inUseCount,
        waiting: this.waitingCount,
        min: this.options.min,
        max: this.options.max,
        ...this._stats,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SIMPLE POOL (Lightweight version)
  // ═══════════════════════════════════════════════════════════════════

  class SimplePool {
    constructor(factory, reset = (x) => x) {
      this._factory = factory;
      this._reset = reset;
      this._available = [];
    }

    acquire() {
      return this._available.length > 0
        ? this._available.pop()
        : this._factory();
    }

    release(obj) {
      this._available.push(this._reset(obj));
    }

    use(fn) {
      const obj = this.acquire();
      try {
        return fn(obj);
      } finally {
        this.release(obj);
      }
    }

    drain() {
      this._available = [];
    }

    get size() {
      return this._available.length;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RING BUFFER
  // ═══════════════════════════════════════════════════════════════════

  class RingBuffer {
    constructor(capacity) {
      this.capacity = capacity;
      this.buffer = new Array(capacity);
      this.head = 0;
      this.tail = 0;
      this.length = 0;
    }

    push(item) {
      this.buffer[this.tail] = item;
      this.tail = (this.tail + 1) % this.capacity;

      if (this.length < this.capacity) {
        this.length++;
      } else {
        this.head = (this.head + 1) % this.capacity;
      }

      return this;
    }

    pop() {
      if (this.length === 0) return undefined;

      this.tail = (this.tail - 1 + this.capacity) % this.capacity;
      const item = this.buffer[this.tail];
      this.buffer[this.tail] = undefined;
      this.length--;

      return item;
    }

    shift() {
      if (this.length === 0) return undefined;

      const item = this.buffer[this.head];
      this.buffer[this.head] = undefined;
      this.head = (this.head + 1) % this.capacity;
      this.length--;

      return item;
    }

    get(index) {
      if (index < 0 || index >= this.length) return undefined;
      return this.buffer[(this.head + index) % this.capacity];
    }

    peek() {
      return this.buffer[this.head];
    }

    peekLast() {
      if (this.length === 0) return undefined;
      return this.buffer[(this.tail - 1 + this.capacity) % this.capacity];
    }

    clear() {
      this.buffer = new Array(this.capacity);
      this.head = 0;
      this.tail = 0;
      this.length = 0;
    }

    isFull() {
      return this.length === this.capacity;
    }

    isEmpty() {
      return this.length === 0;
    }

    toArray() {
      const result = [];
      for (let i = 0; i < this.length; i++) {
        result.push(this.get(i));
      }
      return result;
    }

    forEach(callback) {
      for (let i = 0; i < this.length; i++) {
        callback(this.get(i), i, this);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // LRU CACHE (Pool-like behavior)
  // ═══════════════════════════════════════════════════════════════════

  class LRUPool {
    constructor(capacity, options = {}) {
      this.capacity = capacity;
      this.cache = new Map();
      this.onCreate = options.onCreate || (() => ({}));
      this.onEvict = options.onEvict || (() => {});
    }

    get(key) {
      if (!this.cache.has(key)) return undefined;

      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }

    set(key, value) {
      if (this.cache.has(key)) {
        this.cache.delete(key);
      } else if (this.cache.size >= this.capacity) {
        const oldest = this.cache.keys().next().value;
        const evicted = this.cache.get(oldest);
        this.cache.delete(oldest);
        this.onEvict(oldest, evicted);
      }

      this.cache.set(key, value);
      return this;
    }

    getOrCreate(key) {
      if (this.cache.has(key)) {
        return this.get(key);
      }

      const value = this.onCreate(key);
      this.set(key, value);
      return value;
    }

    has(key) {
      return this.cache.has(key);
    }

    delete(key) {
      return this.cache.delete(key);
    }

    clear() {
      this.cache.clear();
    }

    get size() {
      return this.cache.size;
    }

    keys() {
      return [...this.cache.keys()];
    }

    values() {
      return [...this.cache.values()];
    }

    entries() {
      return [...this.cache.entries()];
    }
  }

  // Initialize
  window.BaelPool = new BaelPool();
  window.ObjectPool = ObjectPool;
  window.SimplePool = SimplePool;
  window.RingBuffer = RingBuffer;
  window.LRUPool = LRUPool;

  // Global shortcuts
  window.$pool = window.BaelPool;
  window.$createPool = (name, opts) => window.BaelPool.create(name, opts);

  console.log("🏊 Bael Pool ready");
})();
