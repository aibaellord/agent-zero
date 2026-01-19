/**
 * BAEL String Utilities - Text Manipulation Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete string system:
 * - Case conversion
 * - Formatting
 * - Parsing
 * - Validation
 * - Truncation
 * - Template literals
 */

(function () {
  "use strict";

  class BaelString {
    constructor() {
      console.log("📝 Bael String Utilities initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // CASE CONVERSION
    // ═══════════════════════════════════════════════════════════

    // To camelCase
    camelCase(str) {
      return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^[A-Z]/, (c) => c.toLowerCase());
    }

    // To PascalCase
    pascalCase(str) {
      return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^[a-z]/, (c) => c.toUpperCase());
    }

    // To snake_case
    snakeCase(str) {
      return str
        .replace(/([A-Z])/g, "_$1")
        .replace(/[-\s]+/g, "_")
        .toLowerCase()
        .replace(/^_/, "");
    }

    // To kebab-case
    kebabCase(str) {
      return str
        .replace(/([A-Z])/g, "-$1")
        .replace(/[_\s]+/g, "-")
        .toLowerCase()
        .replace(/^-/, "");
    }

    // To CONSTANT_CASE
    constantCase(str) {
      return this.snakeCase(str).toUpperCase();
    }

    // To Title Case
    titleCase(str) {
      return str
        .toLowerCase()
        .replace(/(?:^|\s|["'([{])\S/g, (match) => match.toUpperCase());
    }

    // To Sentence case
    sentenceCase(str) {
      return str
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
    }

    // ═══════════════════════════════════════════════════════════
    // FORMATTING
    // ═══════════════════════════════════════════════════════════

    // Truncate string
    truncate(str, length = 50, suffix = "...") {
      if (str.length <= length) return str;
      return str.slice(0, length - suffix.length).trimEnd() + suffix;
    }

    // Truncate words
    truncateWords(str, count = 10, suffix = "...") {
      const words = str.split(/\s+/);
      if (words.length <= count) return str;
      return words.slice(0, count).join(" ") + suffix;
    }

    // Pad string
    pad(str, length, char = " ", position = "end") {
      str = String(str);
      if (str.length >= length) return str;

      const padding = char.repeat(length - str.length);
      return position === "start" ? padding + str : str + padding;
    }

    // Pad both sides
    padBoth(str, length, char = " ") {
      str = String(str);
      if (str.length >= length) return str;

      const total = length - str.length;
      const left = Math.floor(total / 2);
      const right = total - left;
      return char.repeat(left) + str + char.repeat(right);
    }

    // Word wrap
    wordWrap(str, width = 80, breakWord = false) {
      if (!str || width <= 0) return str;

      const lines = [];
      const paragraphs = str.split("\n");

      for (const para of paragraphs) {
        let line = "";
        const words = para.split(" ");

        for (const word of words) {
          if (line.length + word.length + 1 <= width) {
            line += (line ? " " : "") + word;
          } else if (word.length > width && breakWord) {
            // Break long word
            if (line) lines.push(line);
            let remaining = word;
            while (remaining.length > width) {
              lines.push(remaining.slice(0, width));
              remaining = remaining.slice(width);
            }
            line = remaining;
          } else {
            if (line) lines.push(line);
            line = word;
          }
        }
        if (line) lines.push(line);
      }

      return lines.join("\n");
    }

    // Repeat string
    repeat(str, count) {
      return str.repeat(Math.max(0, count));
    }

    // Reverse string
    reverse(str) {
      return [...str].reverse().join("");
    }

    // ═══════════════════════════════════════════════════════════
    // CLEANING
    // ═══════════════════════════════════════════════════════════

    // Trim
    trim(str, chars) {
      if (!chars) return str.trim();
      const pattern = new RegExp(
        `^[${this.escapeRegex(chars)}]+|[${this.escapeRegex(chars)}]+$`,
        "g",
      );
      return str.replace(pattern, "");
    }

    // Remove extra whitespace
    collapseWhitespace(str) {
      return str.replace(/\s+/g, " ").trim();
    }

    // Remove all whitespace
    removeWhitespace(str) {
      return str.replace(/\s+/g, "");
    }

    // Strip HTML tags
    stripTags(str, allowedTags = []) {
      if (allowedTags.length === 0) {
        return str.replace(/<[^>]*>/g, "");
      }
      const pattern = new RegExp(
        `<(?!\/?(${allowedTags.join("|")})\\b)[^>]*>`,
        "gi",
      );
      return str.replace(pattern, "");
    }

    // Clean for slug
    slugify(str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^\w\s-]/g, "") // Remove non-word chars
        .replace(/[-\s]+/g, "-") // Replace spaces with hyphens
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    }

    // ═══════════════════════════════════════════════════════════
    // PARSING
    // ═══════════════════════════════════════════════════════════

    // Extract numbers
    extractNumbers(str) {
      const matches = str.match(/-?\d+\.?\d*/g);
      return matches ? matches.map(Number) : [];
    }

    // Extract emails
    extractEmails(str) {
      const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      return str.match(pattern) || [];
    }

    // Extract URLs
    extractUrls(str) {
      const pattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
      return str.match(pattern) || [];
    }

    // Extract hashtags
    extractHashtags(str) {
      const pattern = /#\w+/g;
      return str.match(pattern) || [];
    }

    // Extract mentions
    extractMentions(str) {
      const pattern = /@\w+/g;
      return str.match(pattern) || [];
    }

    // Count words
    wordCount(str) {
      const words = str.trim().split(/\s+/);
      return words[0] === "" ? 0 : words.length;
    }

    // Count characters
    charCount(str, includeSpaces = true) {
      return includeSpaces ? str.length : str.replace(/\s/g, "").length;
    }

    // Count lines
    lineCount(str) {
      if (!str) return 0;
      return str.split("\n").length;
    }

    // ═══════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════

    // Is empty
    isEmpty(str) {
      return !str || str.trim().length === 0;
    }

    // Is blank (whitespace only)
    isBlank(str) {
      return !str || /^\s*$/.test(str);
    }

    // Is alphanumeric
    isAlphanumeric(str) {
      return /^[a-zA-Z0-9]+$/.test(str);
    }

    // Is alphabetic
    isAlpha(str) {
      return /^[a-zA-Z]+$/.test(str);
    }

    // Is numeric
    isNumeric(str) {
      return /^-?\d+\.?\d*$/.test(str);
    }

    // Is email
    isEmail(str) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    }

    // Is URL
    isUrl(str) {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    }

    // Contains
    contains(str, search, caseSensitive = true) {
      if (!caseSensitive) {
        return str.toLowerCase().includes(search.toLowerCase());
      }
      return str.includes(search);
    }

    // Starts with
    startsWith(str, prefix, caseSensitive = true) {
      if (!caseSensitive) {
        return str.toLowerCase().startsWith(prefix.toLowerCase());
      }
      return str.startsWith(prefix);
    }

    // Ends with
    endsWith(str, suffix, caseSensitive = true) {
      if (!caseSensitive) {
        return str.toLowerCase().endsWith(suffix.toLowerCase());
      }
      return str.endsWith(suffix);
    }

    // ═══════════════════════════════════════════════════════════
    // TEMPLATING
    // ═══════════════════════════════════════════════════════════

    // Simple template interpolation
    template(str, data, options = {}) {
      const { start = "{{", end = "}}" } = options;
      const pattern = new RegExp(
        `${this.escapeRegex(start)}\\s*(\\w+(?:\\.\\w+)*)\\s*${this.escapeRegex(end)}`,
        "g",
      );

      return str.replace(pattern, (_, path) => {
        const value = this.getNestedValue(data, path);
        return value !== undefined ? String(value) : "";
      });
    }

    // Get nested value
    getNestedValue(obj, path) {
      return path.split(".").reduce((o, k) => o?.[k], obj);
    }

    // Format with indexed placeholders
    format(str, ...args) {
      return str.replace(/\{(\d+)\}/g, (_, i) =>
        args[parseInt(i)] !== undefined ? String(args[parseInt(i)]) : "",
      );
    }

    // ═══════════════════════════════════════════════════════════
    // FORMATTING NUMBERS & DATES
    // ═══════════════════════════════════════════════════════════

    // Format number
    formatNumber(num, options = {}) {
      const { locale = "en-US", decimals, notation } = options;
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        notation,
      }).format(num);
    }

    // Format currency
    formatCurrency(amount, currency = "USD", locale = "en-US") {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount);
    }

    // Format bytes
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (
        parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
      );
    }

    // Format duration
    formatDuration(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);

      if (h > 0) {
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
      return `${m}:${String(s).padStart(2, "0")}`;
    }

    // Relative time
    formatRelativeTime(date, options = {}) {
      const { locale = "en-US", style = "long" } = options;
      const now = Date.now();
      const then = date instanceof Date ? date.getTime() : date;
      const diff = (then - now) / 1000;

      const units = [
        { unit: "year", seconds: 31536000 },
        { unit: "month", seconds: 2592000 },
        { unit: "week", seconds: 604800 },
        { unit: "day", seconds: 86400 },
        { unit: "hour", seconds: 3600 },
        { unit: "minute", seconds: 60 },
        { unit: "second", seconds: 1 },
      ];

      for (const { unit, seconds } of units) {
        const value = Math.floor(Math.abs(diff) / seconds);
        if (value >= 1) {
          const rtf = new Intl.RelativeTimeFormat(locale, { style });
          return rtf.format(diff > 0 ? value : -value, unit);
        }
      }

      return "just now";
    }

    // ═══════════════════════════════════════════════════════════
    // SEARCH & REPLACE
    // ═══════════════════════════════════════════════════════════

    // Highlight matches
    highlight(str, query, options = {}) {
      const { tag = "mark", className = "" } = options;
      if (!query) return str;

      const pattern = new RegExp(`(${this.escapeRegex(query)})`, "gi");
      const cls = className ? ` class="${className}"` : "";
      return str.replace(pattern, `<${tag}${cls}>$1</${tag}>`);
    }

    // Replace all
    replaceAll(str, search, replace) {
      return str.split(search).join(replace);
    }

    // Escape regex
    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Escape HTML
    escapeHtml(str) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return str.replace(/[&<>"']/g, (char) => entities[char]);
    }

    // Unescape HTML
    unescapeHtml(str) {
      const entities = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
      };
      return str.replace(
        /&amp;|&lt;|&gt;|&quot;|&#39;/g,
        (entity) => entities[entity],
      );
    }

    // ═══════════════════════════════════════════════════════════
    // GENERATION
    // ═══════════════════════════════════════════════════════════

    // Generate random string
    random(length = 8, charset = "alphanumeric") {
      const charsets = {
        alpha: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numeric: "0123456789",
        alphanumeric:
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        hex: "0123456789abcdef",
        symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
      };

      const chars = charsets[charset] || charset;
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    }

    // Generate UUID
    uuid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    // Generate lorem ipsum
    lorem(words = 50) {
      const text =
        "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum";
      const wordList = text.split(" ");
      const result = [];

      for (let i = 0; i < words; i++) {
        result.push(wordList[i % wordList.length]);
      }

      return result.join(" ");
    }
  }

  // Initialize
  window.BaelString = new BaelString();

  // Global shortcuts
  window.$str = window.BaelString;
  window.$truncate = (str, len, suffix) =>
    window.BaelString.truncate(str, len, suffix);
  window.$slugify = (str) => window.BaelString.slugify(str);
  window.$template = (str, data) => window.BaelString.template(str, data);
})();
