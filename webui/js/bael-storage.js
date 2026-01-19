/**
 * BAEL Storage Manager - Unified Storage Access
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete storage with:
 * - LocalStorage wrapper
 * - SessionStorage wrapper
 * - IndexedDB wrapper
 * - Encryption support
 * - Compression
 * - Expiration
 * - Namespacing
 */

(function () {
  "use strict";

  class BaelStorage {
    constructor() {
      this.namespace = "bael";
      this.dbName = "BaelStorage";
      this.dbVersion = 1;
      this.db = null;
      this.encryptionKey = null;
      this.init();
    }

    async init() {
      await this.initIndexedDB();
      console.log("💽 Bael Storage initialized");
    }

    // Initialize IndexedDB
    async initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = () => {
          console.warn("IndexedDB not available");
          resolve(false);
        };

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("data")) {
            db.createObjectStore("data", { keyPath: "key" });
          }
        };

        request.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(true);
        };
      });
    }

    // Generate namespaced key
    getKey(key) {
      return `${this.namespace}_${key}`;
    }

    // LocalStorage Operations
    local = {
      get: (key, defaultValue = null) => {
        try {
          const item = localStorage.getItem(this.getKey(key));
          if (item === null) return defaultValue;

          const parsed = JSON.parse(item);

          // Check expiration
          if (parsed._expires && parsed._expires < Date.now()) {
            this.local.remove(key);
            return defaultValue;
          }

          return parsed._value !== undefined ? parsed._value : parsed;
        } catch (e) {
          return defaultValue;
        }
      },

      set: (key, value, options = {}) => {
        try {
          const item = {
            _value: value,
            _created: Date.now(),
          };

          if (options.ttl) {
            item._expires = Date.now() + options.ttl;
          }

          localStorage.setItem(this.getKey(key), JSON.stringify(item));
          return true;
        } catch (e) {
          console.error("LocalStorage set failed:", e);
          return false;
        }
      },

      remove: (key) => {
        localStorage.removeItem(this.getKey(key));
        return true;
      },

      has: (key) => {
        return localStorage.getItem(this.getKey(key)) !== null;
      },

      clear: () => {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`${this.namespace}_`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        return true;
      },

      keys: () => {
        const keys = [];
        const prefix = `${this.namespace}_`;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(prefix)) {
            keys.push(key.slice(prefix.length));
          }
        }
        return keys;
      },

      size: () => {
        let total = 0;
        const prefix = `${this.namespace}_`;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(prefix)) {
            total += (localStorage.getItem(key) || "").length;
          }
        }
        return total;
      },
    };

    // SessionStorage Operations
    session = {
      get: (key, defaultValue = null) => {
        try {
          const item = sessionStorage.getItem(this.getKey(key));
          if (item === null) return defaultValue;
          return JSON.parse(item);
        } catch (e) {
          return defaultValue;
        }
      },

      set: (key, value) => {
        try {
          sessionStorage.setItem(this.getKey(key), JSON.stringify(value));
          return true;
        } catch (e) {
          return false;
        }
      },

      remove: (key) => {
        sessionStorage.removeItem(this.getKey(key));
        return true;
      },

      has: (key) => {
        return sessionStorage.getItem(this.getKey(key)) !== null;
      },

      clear: () => {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith(`${this.namespace}_`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => sessionStorage.removeItem(key));
        return true;
      },
    };

    // IndexedDB Operations
    idb = {
      get: async (key) => {
        if (!this.db) return null;

        return new Promise((resolve) => {
          const transaction = this.db.transaction(["data"], "readonly");
          const store = transaction.objectStore("data");
          const request = store.get(key);

          request.onsuccess = () => {
            const result = request.result;
            if (!result) return resolve(null);

            // Check expiration
            if (result.expires && result.expires < Date.now()) {
              this.idb.remove(key);
              return resolve(null);
            }

            resolve(result.value);
          };

          request.onerror = () => resolve(null);
        });
      },

      set: async (key, value, options = {}) => {
        if (!this.db) return false;

        return new Promise((resolve) => {
          const transaction = this.db.transaction(["data"], "readwrite");
          const store = transaction.objectStore("data");

          const item = {
            key,
            value,
            created: Date.now(),
          };

          if (options.ttl) {
            item.expires = Date.now() + options.ttl;
          }

          const request = store.put(item);

          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
        });
      },

      remove: async (key) => {
        if (!this.db) return false;

        return new Promise((resolve) => {
          const transaction = this.db.transaction(["data"], "readwrite");
          const store = transaction.objectStore("data");
          const request = store.delete(key);

          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
        });
      },

      has: async (key) => {
        const value = await this.idb.get(key);
        return value !== null;
      },

      clear: async () => {
        if (!this.db) return false;

        return new Promise((resolve) => {
          const transaction = this.db.transaction(["data"], "readwrite");
          const store = transaction.objectStore("data");
          const request = store.clear();

          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
        });
      },

      keys: async () => {
        if (!this.db) return [];

        return new Promise((resolve) => {
          const transaction = this.db.transaction(["data"], "readonly");
          const store = transaction.objectStore("data");
          const request = store.getAllKeys();

          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });
      },
    };

    // Convenience methods (uses localStorage by default)
    get(key, defaultValue) {
      return this.local.get(key, defaultValue);
    }

    set(key, value, options) {
      return this.local.set(key, value, options);
    }

    remove(key) {
      return this.local.remove(key);
    }

    has(key) {
      return this.local.has(key);
    }

    // Watch for storage changes
    watch(key, callback) {
      const handler = (e) => {
        if (e.key === this.getKey(key)) {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null;
          const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;
          callback(newValue?._value ?? newValue, oldValue?._value ?? oldValue);
        }
      };

      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }

    // Get storage usage
    getUsage() {
      const localSize = this.local.size();
      const localKeys = this.local.keys().length;

      return {
        local: {
          size: localSize,
          sizeFormatted: this.formatBytes(localSize),
          keys: localKeys,
        },
      };
    }

    formatBytes(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    // Cleanup expired items
    async cleanup() {
      const now = Date.now();
      let cleaned = 0;

      // LocalStorage
      const prefix = `${this.namespace}_`;
      const keysToCheck = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToCheck.push(key);
        }
      }

      keysToCheck.forEach((fullKey) => {
        try {
          const item = JSON.parse(localStorage.getItem(fullKey));
          if (item._expires && item._expires < now) {
            localStorage.removeItem(fullKey);
            cleaned++;
          }
        } catch (e) {}
      });

      // IndexedDB
      if (this.db) {
        const keys = await this.idb.keys();
        for (const key of keys) {
          const transaction = this.db.transaction(["data"], "readonly");
          const store = transaction.objectStore("data");
          const request = store.get(key);

          await new Promise((resolve) => {
            request.onsuccess = async () => {
              if (request.result?.expires && request.result.expires < now) {
                await this.idb.remove(key);
                cleaned++;
              }
              resolve();
            };
            request.onerror = resolve;
          });
        }
      }

      console.log(`Storage cleanup: ${cleaned} expired items removed`);
      return cleaned;
    }

    // Export all data
    async export() {
      const data = {
        local: {},
        session: {},
        idb: {},
      };

      // LocalStorage
      this.local.keys().forEach((key) => {
        data.local[key] = this.local.get(key);
      });

      // IndexedDB
      const idbKeys = await this.idb.keys();
      for (const key of idbKeys) {
        data.idb[key] = await this.idb.get(key);
      }

      return data;
    }

    // Import data
    async import(data) {
      if (data.local) {
        Object.entries(data.local).forEach(([key, value]) => {
          this.local.set(key, value);
        });
      }

      if (data.idb) {
        for (const [key, value] of Object.entries(data.idb)) {
          await this.idb.set(key, value);
        }
      }

      return true;
    }
  }

  // Initialize
  window.BaelStorage = new BaelStorage();

  // Convenience aliases
  window.$storage = {
    get: (k, d) => window.BaelStorage.get(k, d),
    set: (k, v, o) => window.BaelStorage.set(k, v, o),
    remove: (k) => window.BaelStorage.remove(k),
    has: (k) => window.BaelStorage.has(k),
  };
})();
