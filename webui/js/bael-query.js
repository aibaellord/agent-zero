/**
 * BAEL Query Builder - Data Query & Filtering Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete query system:
 * - Fluent query builder
 * - Array filtering
 * - Sorting & pagination
 * - Aggregation
 * - Search & matching
 */

(function () {
  "use strict";

  class BaelQuery {
    constructor() {
      console.log("🔍 Bael Query initialized");
    }

    // Create new query
    from(data) {
      return new QueryBuilder(Array.isArray(data) ? data : []);
    }

    // Quick filter
    filter(data, predicate) {
      return new QueryBuilder(data).where(predicate).get();
    }

    // Quick find
    find(data, predicate) {
      return new QueryBuilder(data).where(predicate).first();
    }

    // Quick sort
    sort(data, key, direction = "asc") {
      return new QueryBuilder(data).orderBy(key, direction).get();
    }

    // Quick paginate
    paginate(data, page, perPage) {
      return new QueryBuilder(data).paginate(page, perPage);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUERY BUILDER
  // ═══════════════════════════════════════════════════════════════════

  class QueryBuilder {
    constructor(data) {
      this._data = [...data];
      this._filters = [];
      this._orders = [];
      this._offset = 0;
      this._limit = null;
      this._select = null;
      this._groupBy = null;
    }

    // ═══════════════════════════════════════════════════════════
    // FILTERING
    // ═══════════════════════════════════════════════════════════

    // Where clause
    where(key, operator, value) {
      // Handle function predicate
      if (typeof key === "function") {
        this._filters.push(key);
        return this;
      }

      // Handle object predicate
      if (typeof key === "object") {
        for (const [k, v] of Object.entries(key)) {
          this.where(k, "=", v);
        }
        return this;
      }

      // Handle shorthand where(key, value)
      if (value === undefined) {
        value = operator;
        operator = "=";
      }

      this._filters.push((item) => {
        const itemValue = this._getValue(item, key);
        return this._compare(itemValue, operator, value);
      });

      return this;
    }

    // Where not
    whereNot(key, value) {
      return this.where(key, "!=", value);
    }

    // Where in
    whereIn(key, values) {
      return this.where(key, "in", values);
    }

    // Where not in
    whereNotIn(key, values) {
      return this.where(key, "notIn", values);
    }

    // Where null
    whereNull(key) {
      return this.where((item) => {
        const value = this._getValue(item, key);
        return value === null || value === undefined;
      });
    }

    // Where not null
    whereNotNull(key) {
      return this.where((item) => {
        const value = this._getValue(item, key);
        return value !== null && value !== undefined;
      });
    }

    // Where between
    whereBetween(key, min, max) {
      return this.where((item) => {
        const value = this._getValue(item, key);
        return value >= min && value <= max;
      });
    }

    // Where like (contains)
    whereLike(key, pattern) {
      return this.where((item) => {
        const value = String(this._getValue(item, key)).toLowerCase();
        const search = pattern.toLowerCase().replace(/%/g, "");
        return value.includes(search);
      });
    }

    // Where starts with
    whereStartsWith(key, prefix) {
      return this.where((item) => {
        const value = String(this._getValue(item, key));
        return value.startsWith(prefix);
      });
    }

    // Where ends with
    whereEndsWith(key, suffix) {
      return this.where((item) => {
        const value = String(this._getValue(item, key));
        return value.endsWith(suffix);
      });
    }

    // Where matches regex
    whereMatches(key, pattern) {
      const regex =
        pattern instanceof RegExp ? pattern : new RegExp(pattern, "i");
      return this.where((item) => {
        const value = String(this._getValue(item, key));
        return regex.test(value);
      });
    }

    // Or where
    orWhere(key, operator, value) {
      const previousFilter = this._filters.pop();
      if (!previousFilter) {
        return this.where(key, operator, value);
      }

      const newFilter = this._createFilter(key, operator, value);
      this._filters.push((item) => previousFilter(item) || newFilter(item));
      return this;
    }

    // Helper to create filter
    _createFilter(key, operator, value) {
      if (typeof key === "function") return key;

      if (value === undefined) {
        value = operator;
        operator = "=";
      }

      return (item) => {
        const itemValue = this._getValue(item, key);
        return this._compare(itemValue, operator, value);
      };
    }

    // ═══════════════════════════════════════════════════════════
    // SORTING
    // ═══════════════════════════════════════════════════════════

    // Order by
    orderBy(key, direction = "asc") {
      this._orders.push({ key, direction });
      return this;
    }

    // Order by descending
    orderByDesc(key) {
      return this.orderBy(key, "desc");
    }

    // Order by multiple
    orderByMultiple(orders) {
      for (const { key, direction } of orders) {
        this.orderBy(key, direction);
      }
      return this;
    }

    // Shuffle (random order)
    shuffle() {
      this._orders = [{ type: "shuffle" }];
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // PAGINATION
    // ═══════════════════════════════════════════════════════════

    // Skip/offset
    skip(count) {
      this._offset = count;
      return this;
    }

    // Alias for skip
    offset(count) {
      return this.skip(count);
    }

    // Take/limit
    take(count) {
      this._limit = count;
      return this;
    }

    // Alias for take
    limit(count) {
      return this.take(count);
    }

    // For page
    forPage(page, perPage = 10) {
      this._offset = (page - 1) * perPage;
      this._limit = perPage;
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // SELECTION
    // ═══════════════════════════════════════════════════════════

    // Select fields
    select(...fields) {
      this._select = fields.flat();
      return this;
    }

    // Pluck single field
    pluck(key) {
      return this._execute().map((item) => this._getValue(item, key));
    }

    // Get unique values
    distinct(key) {
      if (key) {
        return [...new Set(this.pluck(key))];
      }
      return [...new Set(this._execute().map(JSON.stringify))].map(JSON.parse);
    }

    // ═══════════════════════════════════════════════════════════
    // AGGREGATION
    // ═══════════════════════════════════════════════════════════

    // Count
    count() {
      return this._execute().length;
    }

    // Sum
    sum(key) {
      return this._execute().reduce((sum, item) => {
        return sum + (Number(this._getValue(item, key)) || 0);
      }, 0);
    }

    // Average
    avg(key) {
      const data = this._execute();
      if (data.length === 0) return 0;
      return this.sum(key) / data.length;
    }

    // Min
    min(key) {
      const values = this.pluck(key).filter(
        (v) => v !== null && v !== undefined,
      );
      return values.length > 0 ? Math.min(...values) : null;
    }

    // Max
    max(key) {
      const values = this.pluck(key).filter(
        (v) => v !== null && v !== undefined,
      );
      return values.length > 0 ? Math.max(...values) : null;
    }

    // Group by
    groupBy(key) {
      const data = this._execute();
      const groups = {};

      for (const item of data) {
        const groupKey = this._getValue(item, key);
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
      }

      return groups;
    }

    // Count by
    countBy(key) {
      const groups = this.groupBy(key);
      const counts = {};

      for (const [k, v] of Object.entries(groups)) {
        counts[k] = v.length;
      }

      return counts;
    }

    // ═══════════════════════════════════════════════════════════
    // RESULTS
    // ═══════════════════════════════════════════════════════════

    // Get all results
    get() {
      let result = this._execute();

      // Apply selection
      if (this._select) {
        result = result.map((item) => {
          const selected = {};
          for (const field of this._select) {
            selected[field] = this._getValue(item, field);
          }
          return selected;
        });
      }

      return result;
    }

    // Alias for get
    all() {
      return this.get();
    }

    // Get first result
    first() {
      const result = this.take(1).get();
      return result[0] || null;
    }

    // Get last result
    last() {
      const result = this._execute();
      return result[result.length - 1] || null;
    }

    // Check if any results exist
    exists() {
      return this.count() > 0;
    }

    // Check if no results
    isEmpty() {
      return this.count() === 0;
    }

    // Paginate with metadata
    paginate(page = 1, perPage = 10) {
      const total = this.count();
      const lastPage = Math.ceil(total / perPage);

      const data = this.forPage(page, perPage).get();

      return {
        data,
        meta: {
          currentPage: page,
          perPage,
          total,
          lastPage,
          from: (page - 1) * perPage + 1,
          to: Math.min(page * perPage, total),
          hasMore: page < lastPage,
          hasPrevious: page > 1,
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSFORMATION
    // ═══════════════════════════════════════════════════════════

    // Map results
    map(callback) {
      return this._execute().map(callback);
    }

    // Filter results
    filter(callback) {
      return this._execute().filter(callback);
    }

    // Reduce results
    reduce(callback, initial) {
      return this._execute().reduce(callback, initial);
    }

    // Each/forEach
    each(callback) {
      this._execute().forEach(callback);
      return this;
    }

    // Transform to key-value
    keyBy(key) {
      const result = {};
      for (const item of this._execute()) {
        result[this._getValue(item, key)] = item;
      }
      return result;
    }

    // Chunk results
    chunk(size) {
      const data = this._execute();
      const chunks = [];

      for (let i = 0; i < data.length; i += size) {
        chunks.push(data.slice(i, i + size));
      }

      return chunks;
    }

    // ═══════════════════════════════════════════════════════════
    // INTERNAL METHODS
    // ═══════════════════════════════════════════════════════════

    // Execute query
    _execute() {
      let result = [...this._data];

      // Apply filters
      for (const filter of this._filters) {
        result = result.filter(filter);
      }

      // Apply sorting
      if (this._orders.length > 0) {
        if (this._orders[0].type === "shuffle") {
          result = this._shuffle(result);
        } else {
          result = this._sort(result);
        }
      }

      // Apply offset
      if (this._offset > 0) {
        result = result.slice(this._offset);
      }

      // Apply limit
      if (this._limit !== null) {
        result = result.slice(0, this._limit);
      }

      return result;
    }

    // Sort data
    _sort(data) {
      return [...data].sort((a, b) => {
        for (const { key, direction } of this._orders) {
          const aVal = this._getValue(a, key);
          const bVal = this._getValue(b, key);

          let comparison = 0;

          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;

          if (comparison !== 0) {
            return direction === "desc" ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    // Shuffle data
    _shuffle(data) {
      const result = [...data];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }

    // Get value by path
    _getValue(obj, path) {
      if (typeof path === "function") {
        return path(obj);
      }

      const parts = String(path).split(".");
      let value = obj;

      for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
      }

      return value;
    }

    // Compare values
    _compare(itemValue, operator, value) {
      switch (operator) {
        case "=":
        case "==":
          return itemValue == value;
        case "===":
          return itemValue === value;
        case "!=":
        case "<>":
          return itemValue != value;
        case "!==":
          return itemValue !== value;
        case "<":
          return itemValue < value;
        case "<=":
          return itemValue <= value;
        case ">":
          return itemValue > value;
        case ">=":
          return itemValue >= value;
        case "in":
          return Array.isArray(value) && value.includes(itemValue);
        case "notIn":
          return Array.isArray(value) && !value.includes(itemValue);
        case "like":
          return String(itemValue)
            .toLowerCase()
            .includes(String(value).toLowerCase());
        case "regex":
          return new RegExp(value, "i").test(String(itemValue));
        default:
          return itemValue == value;
      }
    }

    // Clone query
    clone() {
      const cloned = new QueryBuilder(this._data);
      cloned._filters = [...this._filters];
      cloned._orders = [...this._orders];
      cloned._offset = this._offset;
      cloned._limit = this._limit;
      cloned._select = this._select ? [...this._select] : null;
      return cloned;
    }

    // Debug
    toSQL() {
      const parts = ["SELECT"];
      parts.push(this._select ? this._select.join(", ") : "*");
      parts.push("FROM data");

      if (this._filters.length > 0) {
        parts.push(`WHERE [${this._filters.length} filters]`);
      }

      if (this._orders.length > 0) {
        const orderParts = this._orders.map((o) => `${o.key} ${o.direction}`);
        parts.push(`ORDER BY ${orderParts.join(", ")}`);
      }

      if (this._limit !== null) {
        parts.push(`LIMIT ${this._limit}`);
      }

      if (this._offset > 0) {
        parts.push(`OFFSET ${this._offset}`);
      }

      return parts.join(" ");
    }
  }

  // Initialize
  window.BaelQuery = new BaelQuery();

  // Global shortcuts
  window.$query = (data) => window.BaelQuery.from(data);
  window.$filter = (data, predicate) =>
    window.BaelQuery.filter(data, predicate);
  window.$find = (data, predicate) => window.BaelQuery.find(data, predicate);
})();
