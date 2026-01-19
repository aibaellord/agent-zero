/**
 * BAEL i18n - Internationalization & Localization
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete i18n system:
 * - Multi-language support
 * - Translation management
 * - Pluralization rules
 * - Date/number formatting
 * - RTL support
 */

(function () {
  "use strict";

  class BaelI18n {
    constructor() {
      this.locale = "en";
      this.fallbackLocale = "en";
      this.translations = {};
      this.pluralRules = this.createPluralRules();
      this.listeners = new Set();
      this.dateFormats = {};
      this.numberFormats = {};
      this.rtlLocales = ["ar", "he", "fa", "ur", "yi"];
      console.log("🌍 Bael i18n initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // LOCALE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = locale;

      // Update document direction
      if (typeof document !== "undefined") {
        document.documentElement.lang = locale;
        document.documentElement.dir = this.isRTL(locale) ? "rtl" : "ltr";
      }

      // Notify listeners
      this.listeners.forEach((fn) => fn(locale, oldLocale));

      return this;
    }

    getLocale() {
      return this.locale;
    }

    setFallbackLocale(locale) {
      this.fallbackLocale = locale;
      return this;
    }

    detectLocale() {
      // Try browser language
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang) {
        const locale = browserLang.split("-")[0];
        if (this.translations[locale]) {
          return locale;
        }
      }

      // Try navigator.languages
      if (navigator.languages) {
        for (const lang of navigator.languages) {
          const locale = lang.split("-")[0];
          if (this.translations[locale]) {
            return locale;
          }
        }
      }

      return this.fallbackLocale;
    }

    isRTL(locale = this.locale) {
      return this.rtlLocales.includes(locale.split("-")[0]);
    }

    onLocaleChange(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSLATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    addMessages(locale, messages) {
      if (!this.translations[locale]) {
        this.translations[locale] = {};
      }
      this.mergeDeep(this.translations[locale], messages);
      return this;
    }

    addLocale(locale, messages) {
      return this.addMessages(locale, messages);
    }

    loadMessages(locale, messages) {
      this.translations[locale] = messages;
      return this;
    }

    async loadMessagesAsync(locale, url) {
      try {
        const response = await fetch(url);
        const messages = await response.json();
        this.addMessages(locale, messages);
        return messages;
      } catch (error) {
        console.error(`Failed to load messages for ${locale}:`, error);
        throw error;
      }
    }

    hasMessage(key, locale = this.locale) {
      return this.getNestedValue(this.translations[locale], key) !== undefined;
    }

    getMessages(locale = this.locale) {
      return this.translations[locale] || {};
    }

    getAvailableLocales() {
      return Object.keys(this.translations);
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSLATION
    // ═══════════════════════════════════════════════════════════

    t(key, params = {}, locale = this.locale) {
      let message = this.getMessage(key, locale);

      if (message === undefined) {
        // Try fallback
        message = this.getMessage(key, this.fallbackLocale);
      }

      if (message === undefined) {
        console.warn(`Missing translation: ${key}`);
        return key;
      }

      // Handle pluralization
      if (typeof message === "object" && !Array.isArray(message)) {
        if ("count" in params || "n" in params) {
          const count = params.count ?? params.n;
          message = this.pluralize(message, count, locale);
        } else {
          message = message.other || message.one || Object.values(message)[0];
        }
      }

      // Interpolate parameters
      return this.interpolate(message, params);
    }

    translate(key, params, locale) {
      return this.t(key, params, locale);
    }

    getMessage(key, locale) {
      const messages = this.translations[locale];
      if (!messages) return undefined;
      return this.getNestedValue(messages, key);
    }

    getNestedValue(obj, key) {
      if (!obj) return undefined;

      const keys = key.split(".");
      let value = obj;

      for (const k of keys) {
        if (value === undefined || value === null) return undefined;
        value = value[k];
      }

      return value;
    }

    interpolate(message, params) {
      if (typeof message !== "string") return message;

      // Replace {param} style
      let result = message.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });

      // Replace {{param}} style
      result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });

      // Replace $param style
      result = result.replace(/\$(\w+)/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });

      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // PLURALIZATION
    // ═══════════════════════════════════════════════════════════

    createPluralRules() {
      return {
        en: (n) => (n === 1 ? "one" : "other"),
        ru: (n) => {
          const mod10 = n % 10;
          const mod100 = n % 100;
          if (mod10 === 1 && mod100 !== 11) return "one";
          if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return "few";
          return "other";
        },
        pl: (n) => {
          const mod10 = n % 10;
          const mod100 = n % 100;
          if (n === 1) return "one";
          if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return "few";
          return "other";
        },
        ar: (n) => {
          if (n === 0) return "zero";
          if (n === 1) return "one";
          if (n === 2) return "two";
          const mod100 = n % 100;
          if (mod100 >= 3 && mod100 <= 10) return "few";
          if (mod100 >= 11 && mod100 <= 99) return "many";
          return "other";
        },
        zh: () => "other",
        ja: () => "other",
        ko: () => "other",
        fr: (n) => (n < 2 ? "one" : "other"),
        de: (n) => (n === 1 ? "one" : "other"),
        es: (n) => (n === 1 ? "one" : "other"),
        it: (n) => (n === 1 ? "one" : "other"),
        pt: (n) => (n === 1 ? "one" : "other"),
      };
    }

    pluralize(messages, count, locale = this.locale) {
      const rule = this.pluralRules[locale] || this.pluralRules["en"];
      const form = rule(Math.abs(count));

      return (
        messages[form] ||
        messages.other ||
        messages.one ||
        Object.values(messages)[0]
      );
    }

    addPluralRule(locale, rule) {
      this.pluralRules[locale] = rule;
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // DATE FORMATTING
    // ═══════════════════════════════════════════════════════════

    formatDate(date, format = "medium", locale = this.locale) {
      const d = date instanceof Date ? date : new Date(date);

      if (isNaN(d.getTime())) {
        return "Invalid Date";
      }

      // Check for custom format
      if (this.dateFormats[locale]?.[format]) {
        return this.formatDateCustom(
          d,
          this.dateFormats[locale][format],
          locale,
        );
      }

      // Use Intl.DateTimeFormat
      const options = this.getDateFormatOptions(format);
      return new Intl.DateTimeFormat(locale, options).format(d);
    }

    getDateFormatOptions(format) {
      const formats = {
        short: { month: "numeric", day: "numeric", year: "2-digit" },
        medium: { month: "short", day: "numeric", year: "numeric" },
        long: { month: "long", day: "numeric", year: "numeric" },
        full: {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        },
        time: { hour: "numeric", minute: "numeric" },
        timeWithSeconds: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        },
        datetime: {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        },
        iso: { year: "numeric", month: "2-digit", day: "2-digit" },
      };

      return formats[format] || formats.medium;
    }

    formatDateCustom(date, format, locale) {
      const tokens = {
        YYYY: date.getFullYear(),
        YY: String(date.getFullYear()).slice(-2),
        MM: String(date.getMonth() + 1).padStart(2, "0"),
        M: date.getMonth() + 1,
        DD: String(date.getDate()).padStart(2, "0"),
        D: date.getDate(),
        HH: String(date.getHours()).padStart(2, "0"),
        H: date.getHours(),
        hh: String(date.getHours() % 12 || 12).padStart(2, "0"),
        h: date.getHours() % 12 || 12,
        mm: String(date.getMinutes()).padStart(2, "0"),
        m: date.getMinutes(),
        ss: String(date.getSeconds()).padStart(2, "0"),
        s: date.getSeconds(),
        A: date.getHours() >= 12 ? "PM" : "AM",
        a: date.getHours() >= 12 ? "pm" : "am",
      };

      let result = format;
      for (const [token, value] of Object.entries(tokens)) {
        result = result.replace(new RegExp(token, "g"), value);
      }

      return result;
    }

    setDateFormat(locale, name, format) {
      if (!this.dateFormats[locale]) {
        this.dateFormats[locale] = {};
      }
      this.dateFormats[locale][name] = format;
      return this;
    }

    relativeTime(date, locale = this.locale) {
      const now = new Date();
      const d = date instanceof Date ? date : new Date(date);
      const diff = now - d;
      const absDiff = Math.abs(diff);
      const past = diff > 0;

      const units = [
        { unit: "year", ms: 31536000000 },
        { unit: "month", ms: 2628000000 },
        { unit: "week", ms: 604800000 },
        { unit: "day", ms: 86400000 },
        { unit: "hour", ms: 3600000 },
        { unit: "minute", ms: 60000 },
        { unit: "second", ms: 1000 },
      ];

      for (const { unit, ms } of units) {
        if (absDiff >= ms) {
          const value = Math.floor(absDiff / ms);
          try {
            return new Intl.RelativeTimeFormat(locale, {
              numeric: "auto",
            }).format(past ? -value : value, unit);
          } catch {
            return past
              ? `${value} ${unit}${value !== 1 ? "s" : ""} ago`
              : `in ${value} ${unit}${value !== 1 ? "s" : ""}`;
          }
        }
      }

      return this.t("common.now", {}, locale) || "just now";
    }

    // ═══════════════════════════════════════════════════════════
    // NUMBER FORMATTING
    // ═══════════════════════════════════════════════════════════

    formatNumber(number, format = "decimal", locale = this.locale) {
      const options = this.getNumberFormatOptions(format);
      return new Intl.NumberFormat(locale, options).format(number);
    }

    getNumberFormatOptions(format) {
      if (typeof format === "object") return format;

      const formats = {
        decimal: { style: "decimal" },
        integer: { style: "decimal", maximumFractionDigits: 0 },
        percent: { style: "percent" },
        percentDecimal: { style: "percent", minimumFractionDigits: 2 },
        compact: { notation: "compact" },
        scientific: { notation: "scientific" },
        engineering: { notation: "engineering" },
      };

      return formats[format] || formats.decimal;
    }

    formatCurrency(amount, currency = "USD", locale = this.locale) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount);
    }

    formatPercent(value, decimals = 0, locale = this.locale) {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    }

    formatCompact(number, locale = this.locale) {
      return new Intl.NumberFormat(locale, {
        notation: "compact",
      }).format(number);
    }

    // ═══════════════════════════════════════════════════════════
    // LIST FORMATTING
    // ═══════════════════════════════════════════════════════════

    formatList(items, style = "conjunction", locale = this.locale) {
      try {
        return new Intl.ListFormat(locale, { style, type: style }).format(
          items,
        );
      } catch {
        // Fallback
        if (items.length === 0) return "";
        if (items.length === 1) return items[0];
        if (style === "disjunction") {
          return (
            items.slice(0, -1).join(", ") + " or " + items[items.length - 1]
          );
        }
        return (
          items.slice(0, -1).join(", ") + " and " + items[items.length - 1]
        );
      }
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════════════════

    mergeDeep(target, source) {
      for (const key in source) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          if (!target[key]) target[key] = {};
          this.mergeDeep(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    }

    // Direction helpers
    getDirection(locale = this.locale) {
      return this.isRTL(locale) ? "rtl" : "ltr";
    }

    // Create namespaced translator
    namespace(ns) {
      return (key, params, locale) => this.t(`${ns}.${key}`, params, locale);
    }

    // Create translator function
    createTranslator(locale, namespace) {
      return (key, params) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        return this.t(fullKey, params, locale);
      };
    }
  }

  // Initialize
  window.BaelI18n = new BaelI18n();

  // Global shortcuts
  window.$i18n = window.BaelI18n;
  window.$t = (key, params, locale) => window.BaelI18n.t(key, params, locale);
  window.$locale = {
    get: () => window.BaelI18n.getLocale(),
    set: (l) => window.BaelI18n.setLocale(l),
    detect: () => window.BaelI18n.detectLocale(),
  };

  console.log("🌍 Bael i18n ready");
})();
