/**
 * BAEL Object Utilities - Data Structure Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete object system:
 * - Deep clone/merge
 * - Path access
 * - Comparison
 * - Transformation
 * - Array utilities
 * - Collection helpers
 */

(function () {
  "use strict";

  class BaelObject {
    constructor() {
      console.log("📦 Bael Object Utilities initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // DEEP OPERATIONS
    // ═══════════════════════════════════════════════════════════

    // Deep clone
    clone(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }

      if (obj instanceof Date) {
        return new Date(obj.getTime());
      }

      if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags);
      }

      if (obj instanceof Map) {
        return new Map(
          Array.from(obj.entries()).map(([k, v]) => [k, this.clone(v)]),
        );
      }

      if (obj instanceof Set) {
        return new Set(Array.from(obj).map((v) => this.clone(v)));
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => this.clone(item));
      }

      const cloned = {};
      for (const key of Object.keys(obj)) {
        cloned[key] = this.clone(obj[key]);
      }
      return cloned;
    }

    // Deep merge
    merge(...objects) {
      const result = {};

      for (const obj of objects) {
        if (!obj) continue;

        for (const key of Object.keys(obj)) {
          const value = obj[key];

          if (this.isPlainObject(value) && this.isPlainObject(result[key])) {
            result[key] = this.merge(result[key], value);
          } else if (Array.isArray(value)) {
            result[key] = [...value];
          } else {
            result[key] = value;
          }
        }
      }

      return result;
    }

    // Deep freeze
    freeze(obj) {
      if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
        Object.freeze(obj);
        Object.keys(obj).forEach((key) => this.freeze(obj[key]));
      }
      return obj;
    }

    // ═══════════════════════════════════════════════════════════
    // PATH OPERATIONS
    // ═══════════════════════════════════════════════════════════

    // Get value at path
    get(obj, path, defaultValue = undefined) {
      if (!obj || !path) return defaultValue;

      const keys = Array.isArray(path) ? path : path.split(".");
      let current = obj;

      for (const key of keys) {
        if (current === null || current === undefined) {
          return defaultValue;
        }
        current = current[key];
      }

      return current === undefined ? defaultValue : current;
    }

    // Set value at path
    set(obj, path, value) {
      if (!obj || !path) return obj;

      const keys = Array.isArray(path) ? path : path.split(".");
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== "object") {
          current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return obj;
    }

    // Check if path exists
    has(obj, path) {
      if (!obj || !path) return false;

      const keys = Array.isArray(path) ? path : path.split(".");
      let current = obj;

      for (const key of keys) {
        if (!current || typeof current !== "object" || !(key in current)) {
          return false;
        }
        current = current[key];
      }

      return true;
    }

    // Delete value at path
    unset(obj, path) {
      if (!obj || !path) return obj;

      const keys = Array.isArray(path) ? path : path.split(".");
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current || typeof current !== "object") {
          return obj;
        }
        current = current[keys[i]];
      }

      if (current && typeof current === "object") {
        delete current[keys[keys.length - 1]];
      }

      return obj;
    }

    // ═══════════════════════════════════════════════════════════
    // COMPARISON
    // ═══════════════════════════════════════════════════════════

    // Deep equality
    equals(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (typeof a !== typeof b) return false;

      if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      }

      if (a instanceof RegExp && b instanceof RegExp) {
        return a.toString() === b.toString();
      }

      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => this.equals(item, b[index]));
      }

      if (typeof a === "object") {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;
        return keysA.every((key) => this.equals(a[key], b[key]));
      }

      return false;
    }

    // Get differences between objects
    diff(obj1, obj2) {
      const changes = [];

      const compare = (a, b, path = "") => {
        const keysA = Object.keys(a || {});
        const keysB = Object.keys(b || {});
        const allKeys = new Set([...keysA, ...keysB]);

        for (const key of allKeys) {
          const currentPath = path ? `${path}.${key}` : key;

          if (!(key in a)) {
            changes.push({ type: "add", path: currentPath, value: b[key] });
          } else if (!(key in b)) {
            changes.push({ type: "remove", path: currentPath, value: a[key] });
          } else if (!this.equals(a[key], b[key])) {
            if (this.isPlainObject(a[key]) && this.isPlainObject(b[key])) {
              compare(a[key], b[key], currentPath);
            } else {
              changes.push({
                type: "change",
                path: currentPath,
                oldValue: a[key],
                newValue: b[key],
              });
            }
          }
        }
      };

      compare(obj1, obj2);
      return changes;
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSFORMATION
    // ═══════════════════════════════════════════════════════════

    // Pick keys
    pick(obj, keys) {
      const result = {};
      keys.forEach((key) => {
        if (key in obj) {
          result[key] = obj[key];
        }
      });
      return result;
    }

    // Omit keys
    omit(obj, keys) {
      const result = { ...obj };
      keys.forEach((key) => delete result[key]);
      return result;
    }

    // Map object values
    mapValues(obj, fn) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = fn(value, key, obj);
      }
      return result;
    }

    // Map object keys
    mapKeys(obj, fn) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[fn(key, value, obj)] = value;
      }
      return result;
    }

    // Filter object
    filter(obj, predicate) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (predicate(value, key, obj)) {
          result[key] = value;
        }
      }
      return result;
    }

    // Flatten nested object
    flatten(obj, separator = ".", prefix = "") {
      const result = {};

      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}${separator}${key}` : key;

        if (this.isPlainObject(value)) {
          Object.assign(result, this.flatten(value, separator, newKey));
        } else {
          result[newKey] = value;
        }
      }

      return result;
    }

    // Unflatten object
    unflatten(obj, separator = ".") {
      const result = {};

      for (const [key, value] of Object.entries(obj)) {
        this.set(result, key.split(separator), value);
      }

      return result;
    }

    // Invert object
    invert(obj) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[value] = key;
      }
      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Check if plain object
    isPlainObject(value) {
      if (!value || typeof value !== "object") return false;
      const proto = Object.getPrototypeOf(value);
      return proto === null || proto === Object.prototype;
    }

    // Check if empty
    isEmpty(obj) {
      if (!obj) return true;
      if (Array.isArray(obj)) return obj.length === 0;
      if (typeof obj === "object") return Object.keys(obj).length === 0;
      return false;
    }

    // Get object size
    size(obj) {
      if (!obj) return 0;
      if (Array.isArray(obj)) return obj.length;
      if (obj instanceof Map || obj instanceof Set) return obj.size;
      if (typeof obj === "object") return Object.keys(obj).length;
      return 0;
    }

    // Create object from entries
    fromEntries(entries) {
      return Object.fromEntries(entries);
    }

    // ═══════════════════════════════════════════════════════════
    // ARRAY UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Chunk array
    chunk(arr, size) {
      const result = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    }

    // Unique values
    unique(arr, key) {
      if (key) {
        const seen = new Set();
        return arr.filter((item) => {
          const k = typeof key === "function" ? key(item) : item[key];
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      }
      return [...new Set(arr)];
    }

    // Group by key
    groupBy(arr, key) {
      return arr.reduce((groups, item) => {
        const k = typeof key === "function" ? key(item) : item[key];
        (groups[k] = groups[k] || []).push(item);
        return groups;
      }, {});
    }

    // Sort by key
    sortBy(arr, key, order = "asc") {
      const fn = typeof key === "function" ? key : (item) => item[key];
      const multiplier = order === "desc" ? -1 : 1;

      return [...arr].sort((a, b) => {
        const valA = fn(a);
        const valB = fn(b);

        if (valA < valB) return -1 * multiplier;
        if (valA > valB) return 1 * multiplier;
        return 0;
      });
    }

    // Find by predicate
    find(arr, predicate) {
      if (typeof predicate === "function") {
        return arr.find(predicate);
      }
      return arr.find((item) => {
        for (const [key, value] of Object.entries(predicate)) {
          if (item[key] !== value) return false;
        }
        return true;
      });
    }

    // Filter by predicate
    where(arr, predicate) {
      if (typeof predicate === "function") {
        return arr.filter(predicate);
      }
      return arr.filter((item) => {
        for (const [key, value] of Object.entries(predicate)) {
          if (item[key] !== value) return false;
        }
        return true;
      });
    }

    // Pluck values
    pluck(arr, key) {
      return arr.map((item) => item[key]);
    }

    // Sum values
    sum(arr, key) {
      return arr.reduce((total, item) => {
        const value = key ? item[key] : item;
        return total + (Number(value) || 0);
      }, 0);
    }

    // Average
    average(arr, key) {
      if (arr.length === 0) return 0;
      return this.sum(arr, key) / arr.length;
    }

    // Min value
    min(arr, key) {
      if (arr.length === 0) return undefined;
      return arr.reduce(
        (min, item) => {
          const value = key ? item[key] : item;
          return value < min ? value : min;
        },
        key ? arr[0][key] : arr[0],
      );
    }

    // Max value
    max(arr, key) {
      if (arr.length === 0) return undefined;
      return arr.reduce(
        (max, item) => {
          const value = key ? item[key] : item;
          return value > max ? value : max;
        },
        key ? arr[0][key] : arr[0],
      );
    }

    // Shuffle array
    shuffle(arr) {
      const result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }

    // Sample random elements
    sample(arr, count = 1) {
      const shuffled = this.shuffle(arr);
      return count === 1 ? shuffled[0] : shuffled.slice(0, count);
    }

    // First n elements
    first(arr, n = 1) {
      return n === 1 ? arr[0] : arr.slice(0, n);
    }

    // Last n elements
    last(arr, n = 1) {
      return n === 1 ? arr[arr.length - 1] : arr.slice(-n);
    }

    // Compact (remove falsy values)
    compact(arr) {
      return arr.filter(Boolean);
    }

    // Flatten array
    flattenArray(arr, depth = Infinity) {
      return arr.flat(depth);
    }

    // Intersection
    intersection(...arrays) {
      if (arrays.length === 0) return [];
      return arrays.reduce((result, arr) =>
        result.filter((item) => arr.includes(item)),
      );
    }

    // Difference
    difference(arr, ...others) {
      const excludeSet = new Set(others.flat());
      return arr.filter((item) => !excludeSet.has(item));
    }

    // Union
    union(...arrays) {
      return [...new Set(arrays.flat())];
    }

    // Range
    range(start, end, step = 1) {
      if (end === undefined) {
        end = start;
        start = 0;
      }

      const result = [];
      for (let i = start; step > 0 ? i < end : i > end; i += step) {
        result.push(i);
      }
      return result;
    }

    // Key by
    keyBy(arr, key) {
      return arr.reduce((result, item) => {
        const k = typeof key === "function" ? key(item) : item[key];
        result[k] = item;
        return result;
      }, {});
    }

    // Partition
    partition(arr, predicate) {
      const truthy = [];
      const falsy = [];

      for (const item of arr) {
        if (predicate(item)) {
          truthy.push(item);
        } else {
          falsy.push(item);
        }
      }

      return [truthy, falsy];
    }

    // Zip arrays
    zip(...arrays) {
      const maxLength = Math.max(...arrays.map((a) => a.length));
      return Array.from({ length: maxLength }, (_, i) =>
        arrays.map((arr) => arr[i]),
      );
    }
  }

  // Initialize
  window.BaelObject = new BaelObject();

  // Global shortcuts
  window.$obj = window.BaelObject;
  window.$get = (obj, path, def) => window.BaelObject.get(obj, path, def);
  window.$set = (obj, path, val) => window.BaelObject.set(obj, path, val);
  window.$clone = (obj) => window.BaelObject.clone(obj);
  window.$merge = (...objs) => window.BaelObject.merge(...objs);
})();
