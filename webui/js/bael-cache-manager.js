/**
 * BAEL Cache Manager - Advanced Caching System
 * Phase 7: Testing, Documentation & Performance
 *
 * Multi-layer caching with:
 * - Memory cache (LRU)
 * - LocalStorage cache
 * - IndexedDB cache
 * - Cache invalidation strategies
 * - TTL and stale-while-revalidate
 * - Cache analytics
 */

(function () {
  "use strict";

  class BaelCacheManager {
    constructor() {
      this.memoryCache = new Map();
      this.memoryOrder = [];
      this.maxMemoryItems = 100;
      this.maxMemorySize = 10 * 1024 * 1024; // 10MB
      this.currentMemorySize = 0;
      this.stats = {
        hits: 0,
        misses: 0,
        writes: 0,
        evictions: 0,
        errors: 0,
      };
      this.dbName = "BaelCache";
      this.dbVersion = 1;
      this.db = null;
      this.initialized = false;
      this.init();
    }

    async init() {
      await this.initIndexedDB();
      this.initialized = true;
      console.log("💾 Bael Cache Manager initialized");
    }

    // Initialize IndexedDB
    async initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = () => {
          console.warn(
            "IndexedDB not available, using memory/localStorage only",
          );
          resolve();
        };

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("cache")) {
            const store = db.createObjectStore("cache", { keyPath: "key" });
            store.createIndex("expires", "expires", { unique: false });
            store.createIndex("tags", "tags", {
              unique: false,
              multiEntry: true,
            });
          }
        };

        request.onsuccess = (e) => {
          this.db = e.target.result;
          resolve();
        };
      });
    }

    // Get from cache (checks all layers)
    async get(key, options = {}) {
      const { layer = "auto", allowStale = false } = options;

      // Memory cache (fastest)
      if (layer === "auto" || layer === "memory") {
        const memResult = this.getFromMemory(key);
        if (memResult !== undefined) {
          if (!this.isExpired(memResult)) {
            this.stats.hits++;
            return memResult.value;
          } else if (allowStale) {
            this.stats.hits++;
            return memResult.value;
          }
        }
      }

      // LocalStorage cache
      if (layer === "auto" || layer === "localStorage") {
        const lsResult = this.getFromLocalStorage(key);
        if (lsResult !== undefined) {
          if (!this.isExpired(lsResult)) {
            this.stats.hits++;
            // Promote to memory cache
            this.setToMemory(key, lsResult);
            return lsResult.value;
          } else if (allowStale) {
            this.stats.hits++;
            return lsResult.value;
          }
        }
      }

      // IndexedDB cache
      if ((layer === "auto" || layer === "indexedDB") && this.db) {
        const idbResult = await this.getFromIndexedDB(key);
        if (idbResult !== undefined) {
          if (!this.isExpired(idbResult)) {
            this.stats.hits++;
            // Promote to memory cache
            this.setToMemory(key, idbResult);
            return idbResult.value;
          } else if (allowStale) {
            this.stats.hits++;
            return idbResult.value;
          }
        }
      }

      this.stats.misses++;
      return undefined;
    }

    // Set to cache
    async set(key, value, options = {}) {
      const {
        ttl = 3600000, // 1 hour default
        layer = "all",
        tags = [],
        priority = "normal",
      } = options;

      const cacheItem = {
        key,
        value,
        created: Date.now(),
        expires: Date.now() + ttl,
        ttl,
        tags,
        priority,
        size: this.estimateSize(value),
      };

      this.stats.writes++;

      // Memory cache
      if (layer === "all" || layer === "memory") {
        this.setToMemory(key, cacheItem);
      }

      // LocalStorage
      if (layer === "all" || layer === "localStorage") {
        this.setToLocalStorage(key, cacheItem);
      }

      // IndexedDB
      if ((layer === "all" || layer === "indexedDB") && this.db) {
        await this.setToIndexedDB(cacheItem);
      }

      return this;
    }

    // Delete from cache
    async delete(key, options = {}) {
      const { layer = "all" } = options;

      if (layer === "all" || layer === "memory") {
        this.deleteFromMemory(key);
      }

      if (layer === "all" || layer === "localStorage") {
        this.deleteFromLocalStorage(key);
      }

      if ((layer === "all" || layer === "indexedDB") && this.db) {
        await this.deleteFromIndexedDB(key);
      }

      return this;
    }

    // Check if key exists
    async has(key) {
      const value = await this.get(key);
      return value !== undefined;
    }

    // Memory cache operations
    getFromMemory(key) {
      const item = this.memoryCache.get(key);
      if (item) {
        // Move to end (LRU)
        const index = this.memoryOrder.indexOf(key);
        if (index > -1) {
          this.memoryOrder.splice(index, 1);
          this.memoryOrder.push(key);
        }
      }
      return item;
    }

    setToMemory(key, item) {
      // Evict if necessary
      while (
        this.memoryOrder.length >= this.maxMemoryItems ||
        this.currentMemorySize + item.size > this.maxMemorySize
      ) {
        if (this.memoryOrder.length === 0) break;
        const oldestKey = this.memoryOrder.shift();
        const oldItem = this.memoryCache.get(oldestKey);
        if (oldItem) {
          this.currentMemorySize -= oldItem.size;
          this.memoryCache.delete(oldestKey);
          this.stats.evictions++;
        }
      }

      // Remove old entry if exists
      if (this.memoryCache.has(key)) {
        const oldItem = this.memoryCache.get(key);
        this.currentMemorySize -= oldItem.size;
        const index = this.memoryOrder.indexOf(key);
        if (index > -1) this.memoryOrder.splice(index, 1);
      }

      this.memoryCache.set(key, item);
      this.memoryOrder.push(key);
      this.currentMemorySize += item.size;
    }

    deleteFromMemory(key) {
      const item = this.memoryCache.get(key);
      if (item) {
        this.currentMemorySize -= item.size;
        this.memoryCache.delete(key);
        const index = this.memoryOrder.indexOf(key);
        if (index > -1) this.memoryOrder.splice(index, 1);
      }
    }

    // LocalStorage operations
    getFromLocalStorage(key) {
      try {
        const stored = localStorage.getItem(`bcache_${key}`);
        return stored ? JSON.parse(stored) : undefined;
      } catch (e) {
        return undefined;
      }
    }

    setToLocalStorage(key, item) {
      try {
        localStorage.setItem(`bcache_${key}`, JSON.stringify(item));
      } catch (e) {
        // Storage full, try to clear old items
        this.cleanLocalStorage();
        try {
          localStorage.setItem(`bcache_${key}`, JSON.stringify(item));
        } catch (e2) {
          this.stats.errors++;
        }
      }
    }

    deleteFromLocalStorage(key) {
      localStorage.removeItem(`bcache_${key}`);
    }

    cleanLocalStorage() {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("bcache_")) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (this.isExpired(item)) {
              localStorage.removeItem(key);
            } else {
              keys.push({ key, expires: item.expires });
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }

      // Remove oldest 10% if still near capacity
      keys.sort((a, b) => a.expires - b.expires);
      const toRemove = Math.ceil(keys.length * 0.1);
      keys.slice(0, toRemove).forEach(({ key }) => {
        localStorage.removeItem(key);
      });
    }

    // IndexedDB operations
    getFromIndexedDB(key) {
      return new Promise((resolve) => {
        if (!this.db) return resolve(undefined);

        const transaction = this.db.transaction(["cache"], "readonly");
        const store = transaction.objectStore("cache");
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      });
    }

    setToIndexedDB(item) {
      return new Promise((resolve, reject) => {
        if (!this.db) return resolve();

        const transaction = this.db.transaction(["cache"], "readwrite");
        const store = transaction.objectStore("cache");
        const request = store.put(item);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          this.stats.errors++;
          reject(request.error);
        };
      });
    }

    deleteFromIndexedDB(key) {
      return new Promise((resolve) => {
        if (!this.db) return resolve();

        const transaction = this.db.transaction(["cache"], "readwrite");
        const store = transaction.objectStore("cache");
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    }

    // Invalidate by tag
    async invalidateByTag(tag) {
      // Memory
      for (const [key, item] of this.memoryCache) {
        if (item.tags?.includes(tag)) {
          this.deleteFromMemory(key);
        }
      }

      // LocalStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith("bcache_")) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item.tags?.includes(tag)) {
              localStorage.removeItem(key);
            }
          } catch {}
        }
      }

      // IndexedDB
      if (this.db) {
        return new Promise((resolve) => {
          const transaction = this.db.transaction(["cache"], "readwrite");
          const store = transaction.objectStore("cache");
          const index = store.index("tags");
          const request = index.openCursor(IDBKeyRange.only(tag));

          request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              store.delete(cursor.value.key);
              cursor.continue();
            } else {
              resolve();
            }
          };

          request.onerror = () => resolve();
        });
      }
    }

    // Clear all cache
    async clear(layer = "all") {
      if (layer === "all" || layer === "memory") {
        this.memoryCache.clear();
        this.memoryOrder = [];
        this.currentMemorySize = 0;
      }

      if (layer === "all" || layer === "localStorage") {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key?.startsWith("bcache_")) {
            localStorage.removeItem(key);
          }
        }
      }

      if ((layer === "all" || layer === "indexedDB") && this.db) {
        return new Promise((resolve) => {
          const transaction = this.db.transaction(["cache"], "readwrite");
          const store = transaction.objectStore("cache");
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
      }
    }

    // Check if item is expired
    isExpired(item) {
      return item.expires && item.expires < Date.now();
    }

    // Estimate size of value
    estimateSize(value) {
      try {
        return new Blob([JSON.stringify(value)]).size;
      } catch {
        return 0;
      }
    }

    // Stale-while-revalidate pattern
    async swr(key, fetcher, options = {}) {
      const { ttl = 60000, swrTTL = 300000 } = options;

      // Get cached value
      const cached = await this.get(key, { allowStale: true });
      const freshTime = Date.now();

      // If we have a cached value
      if (cached !== undefined) {
        const item = this.memoryCache.get(key) || this.getFromLocalStorage(key);

        // If still fresh, return immediately
        if (item && !this.isExpired(item)) {
          return cached;
        }

        // If stale but within SWR window, return cached and revalidate
        if (item && item.expires + swrTTL > freshTime) {
          // Revalidate in background
          fetcher()
            .then((value) => {
              this.set(key, value, { ttl, ...options });
            })
            .catch(console.error);

          return cached;
        }
      }

      // Fetch fresh data
      const value = await fetcher();
      await this.set(key, value, { ttl, ...options });
      return value;
    }

    // Memoize function results
    memoize(fn, options = {}) {
      const { keyGenerator = (...args) => JSON.stringify(args), ttl = 60000 } =
        options;

      return async (...args) => {
        const key = `memo_${fn.name}_${keyGenerator(...args)}`;
        const cached = await this.get(key);

        if (cached !== undefined) {
          return cached;
        }

        const result = await fn(...args);
        await this.set(key, result, { ttl });
        return result;
      };
    }

    // Cache wrapper for fetch
    cachedFetch(url, options = {}) {
      const { cacheOptions = {}, ...fetchOptions } = options;
      const key = `fetch_${url}_${JSON.stringify(fetchOptions)}`;

      return this.swr(
        key,
        async () => {
          const response = await fetch(url, fetchOptions);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        },
        cacheOptions,
      );
    }

    // Get cache statistics
    getStats() {
      const hitRate =
        this.stats.hits + this.stats.misses > 0
          ? (
              (this.stats.hits / (this.stats.hits + this.stats.misses)) *
              100
            ).toFixed(1)
          : 0;

      return {
        ...this.stats,
        hitRate: `${hitRate}%`,
        memoryItems: this.memoryCache.size,
        memorySize: this.formatBytes(this.currentMemorySize),
      };
    }

    formatBytes(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    // Cleanup expired items
    async cleanup() {
      const now = Date.now();
      let cleaned = 0;

      // Memory
      for (const [key, item] of this.memoryCache) {
        if (this.isExpired(item)) {
          this.deleteFromMemory(key);
          cleaned++;
        }
      }

      // LocalStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith("bcache_")) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (this.isExpired(item)) {
              localStorage.removeItem(key);
              cleaned++;
            }
          } catch {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }

      // IndexedDB
      if (this.db) {
        await new Promise((resolve) => {
          const transaction = this.db.transaction(["cache"], "readwrite");
          const store = transaction.objectStore("cache");
          const index = store.index("expires");
          const request = index.openCursor(IDBKeyRange.upperBound(now));

          request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              store.delete(cursor.value.key);
              cleaned++;
              cursor.continue();
            } else {
              resolve();
            }
          };
        });
      }

      console.log(`Cache cleanup: ${cleaned} items removed`);
      return cleaned;
    }
  }

  // Initialize and schedule cleanup
  window.BaelCache = new BaelCacheManager();

  // Run cleanup every 5 minutes
  setInterval(
    () => {
      window.BaelCache.cleanup();
    },
    5 * 60 * 1000,
  );
})();
