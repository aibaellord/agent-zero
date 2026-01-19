/**
 * BAEL DateTime Utilities - Date & Time Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete datetime system:
 * - Date parsing
 * - Formatting
 * - Manipulation
 * - Comparison
 * - Duration
 * - Timezone handling
 */

(function () {
  "use strict";

  class BaelDateTime {
    constructor() {
      this.locale = navigator.language || "en-US";
      console.log("📅 Bael DateTime initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // PARSING
    // ═══════════════════════════════════════════════════════════

    // Parse any date format
    parse(input) {
      if (!input) return null;
      if (input instanceof Date) return input;
      if (typeof input === "number") return new Date(input);

      // ISO string
      const parsed = Date.parse(input);
      if (!isNaN(parsed)) return new Date(parsed);

      // Common formats
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      ];

      for (const format of formats) {
        const match = input.match(format);
        if (match) {
          if (format.source.startsWith("^(\\d{4})")) {
            return new Date(match[1], match[2] - 1, match[3]);
          }
          return new Date(match[3], match[1] - 1, match[2]);
        }
      }

      return null;
    }

    // ═══════════════════════════════════════════════════════════
    // FORMATTING
    // ═══════════════════════════════════════════════════════════

    // Format date with pattern
    format(date, pattern = "YYYY-MM-DD") {
      const d = this.parse(date);
      if (!d) return "";

      const tokens = {
        YYYY: d.getFullYear(),
        YY: String(d.getFullYear()).slice(-2),
        MM: String(d.getMonth() + 1).padStart(2, "0"),
        M: d.getMonth() + 1,
        DD: String(d.getDate()).padStart(2, "0"),
        D: d.getDate(),
        HH: String(d.getHours()).padStart(2, "0"),
        H: d.getHours(),
        hh: String(d.getHours() % 12 || 12).padStart(2, "0"),
        h: d.getHours() % 12 || 12,
        mm: String(d.getMinutes()).padStart(2, "0"),
        m: d.getMinutes(),
        ss: String(d.getSeconds()).padStart(2, "0"),
        s: d.getSeconds(),
        SSS: String(d.getMilliseconds()).padStart(3, "0"),
        A: d.getHours() >= 12 ? "PM" : "AM",
        a: d.getHours() >= 12 ? "pm" : "am",
        dddd: this.getDayName(d),
        ddd: this.getDayName(d, true),
        MMMM: this.getMonthName(d),
        MMM: this.getMonthName(d, true),
      };

      let result = pattern;
      for (const [token, value] of Object.entries(tokens)) {
        result = result.replace(token, value);
      }
      return result;
    }

    // Localized format
    formatLocale(date, options = {}) {
      const d = this.parse(date);
      if (!d) return "";

      const defaultOptions = {
        dateStyle: "medium",
        timeStyle: undefined,
        ...options,
      };

      return new Intl.DateTimeFormat(
        options.locale || this.locale,
        defaultOptions,
      ).format(d);
    }

    // Get day name
    getDayName(date, short = false) {
      const d = this.parse(date);
      if (!d) return "";
      return new Intl.DateTimeFormat(this.locale, {
        weekday: short ? "short" : "long",
      }).format(d);
    }

    // Get month name
    getMonthName(date, short = false) {
      const d = this.parse(date);
      if (!d) return "";
      return new Intl.DateTimeFormat(this.locale, {
        month: short ? "short" : "long",
      }).format(d);
    }

    // ═══════════════════════════════════════════════════════════
    // RELATIVE TIME
    // ═══════════════════════════════════════════════════════════

    // Format as relative time
    relative(date, baseDate = new Date()) {
      const d = this.parse(date);
      if (!d) return "";

      const diff = d.getTime() - this.parse(baseDate).getTime();
      const seconds = Math.abs(diff) / 1000;
      const isPast = diff < 0;

      const units = [
        { unit: "year", seconds: 31536000 },
        { unit: "month", seconds: 2592000 },
        { unit: "week", seconds: 604800 },
        { unit: "day", seconds: 86400 },
        { unit: "hour", seconds: 3600 },
        { unit: "minute", seconds: 60 },
        { unit: "second", seconds: 1 },
      ];

      for (const { unit, seconds: unitSeconds } of units) {
        const value = Math.floor(seconds / unitSeconds);
        if (value >= 1) {
          const rtf = new Intl.RelativeTimeFormat(this.locale, {
            numeric: "auto",
          });
          return rtf.format(isPast ? -value : value, unit);
        }
      }

      return "just now";
    }

    // Time ago (simpler)
    timeAgo(date) {
      const d = this.parse(date);
      if (!d) return "";

      const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

      if (seconds < 60) return "just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
      if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
      return `${Math.floor(seconds / 31536000)}y ago`;
    }

    // ═══════════════════════════════════════════════════════════
    // MANIPULATION
    // ═══════════════════════════════════════════════════════════

    // Add time
    add(date, amount, unit) {
      const d = new Date(this.parse(date));
      if (!d) return null;

      switch (unit) {
        case "year":
        case "years":
          d.setFullYear(d.getFullYear() + amount);
          break;
        case "month":
        case "months":
          d.setMonth(d.getMonth() + amount);
          break;
        case "week":
        case "weeks":
          d.setDate(d.getDate() + amount * 7);
          break;
        case "day":
        case "days":
          d.setDate(d.getDate() + amount);
          break;
        case "hour":
        case "hours":
          d.setHours(d.getHours() + amount);
          break;
        case "minute":
        case "minutes":
          d.setMinutes(d.getMinutes() + amount);
          break;
        case "second":
        case "seconds":
          d.setSeconds(d.getSeconds() + amount);
          break;
        case "millisecond":
        case "milliseconds":
          d.setMilliseconds(d.getMilliseconds() + amount);
          break;
      }

      return d;
    }

    // Subtract time
    subtract(date, amount, unit) {
      return this.add(date, -amount, unit);
    }

    // Start of unit
    startOf(date, unit) {
      const d = new Date(this.parse(date));
      if (!d) return null;

      switch (unit) {
        case "year":
          d.setMonth(0, 1);
          d.setHours(0, 0, 0, 0);
          break;
        case "month":
          d.setDate(1);
          d.setHours(0, 0, 0, 0);
          break;
        case "week":
          d.setDate(d.getDate() - d.getDay());
          d.setHours(0, 0, 0, 0);
          break;
        case "day":
          d.setHours(0, 0, 0, 0);
          break;
        case "hour":
          d.setMinutes(0, 0, 0);
          break;
        case "minute":
          d.setSeconds(0, 0);
          break;
      }

      return d;
    }

    // End of unit
    endOf(date, unit) {
      const d = new Date(this.parse(date));
      if (!d) return null;

      switch (unit) {
        case "year":
          d.setMonth(11, 31);
          d.setHours(23, 59, 59, 999);
          break;
        case "month":
          d.setMonth(d.getMonth() + 1, 0);
          d.setHours(23, 59, 59, 999);
          break;
        case "week":
          d.setDate(d.getDate() + (6 - d.getDay()));
          d.setHours(23, 59, 59, 999);
          break;
        case "day":
          d.setHours(23, 59, 59, 999);
          break;
        case "hour":
          d.setMinutes(59, 59, 999);
          break;
        case "minute":
          d.setSeconds(59, 999);
          break;
      }

      return d;
    }

    // ═══════════════════════════════════════════════════════════
    // COMPARISON
    // ═══════════════════════════════════════════════════════════

    // Is before
    isBefore(date1, date2) {
      const d1 = this.parse(date1);
      const d2 = this.parse(date2);
      return d1 && d2 && d1.getTime() < d2.getTime();
    }

    // Is after
    isAfter(date1, date2) {
      const d1 = this.parse(date1);
      const d2 = this.parse(date2);
      return d1 && d2 && d1.getTime() > d2.getTime();
    }

    // Is same
    isSame(date1, date2, unit = "day") {
      const d1 = this.startOf(date1, unit);
      const d2 = this.startOf(date2, unit);
      return d1 && d2 && d1.getTime() === d2.getTime();
    }

    // Is between
    isBetween(date, start, end, inclusive = true) {
      const d = this.parse(date);
      const s = this.parse(start);
      const e = this.parse(end);

      if (!d || !s || !e) return false;

      const t = d.getTime();
      const st = s.getTime();
      const et = e.getTime();

      return inclusive ? t >= st && t <= et : t > st && t < et;
    }

    // Is today
    isToday(date) {
      return this.isSame(date, new Date(), "day");
    }

    // Is yesterday
    isYesterday(date) {
      return this.isSame(date, this.subtract(new Date(), 1, "day"), "day");
    }

    // Is tomorrow
    isTomorrow(date) {
      return this.isSame(date, this.add(new Date(), 1, "day"), "day");
    }

    // Is weekend
    isWeekend(date) {
      const d = this.parse(date);
      if (!d) return false;
      const day = d.getDay();
      return day === 0 || day === 6;
    }

    // Is leap year
    isLeapYear(year) {
      const y =
        typeof year === "number" ? year : this.parse(year)?.getFullYear();
      if (!y) return false;
      return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    }

    // ═══════════════════════════════════════════════════════════
    // DIFFERENCE
    // ═══════════════════════════════════════════════════════════

    // Difference in unit
    diff(date1, date2, unit = "day") {
      const d1 = this.parse(date1);
      const d2 = this.parse(date2);
      if (!d1 || !d2) return null;

      const ms = d1.getTime() - d2.getTime();

      switch (unit) {
        case "year":
        case "years":
          return Math.floor(ms / 31536000000);
        case "month":
        case "months":
          return (
            (d1.getFullYear() - d2.getFullYear()) * 12 +
            (d1.getMonth() - d2.getMonth())
          );
        case "week":
        case "weeks":
          return Math.floor(ms / 604800000);
        case "day":
        case "days":
          return Math.floor(ms / 86400000);
        case "hour":
        case "hours":
          return Math.floor(ms / 3600000);
        case "minute":
        case "minutes":
          return Math.floor(ms / 60000);
        case "second":
        case "seconds":
          return Math.floor(ms / 1000);
        default:
          return ms;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Get now
    now() {
      return new Date();
    }

    // Get today at midnight
    today() {
      return this.startOf(new Date(), "day");
    }

    // Days in month
    daysInMonth(date) {
      const d = this.parse(date);
      if (!d) return 0;
      return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }

    // Day of year
    dayOfYear(date) {
      const d = this.parse(date);
      if (!d) return 0;
      const start = new Date(d.getFullYear(), 0, 0);
      const diff = d - start;
      return Math.floor(diff / 86400000);
    }

    // Week of year
    weekOfYear(date) {
      const d = this.parse(date);
      if (!d) return 0;
      const start = new Date(d.getFullYear(), 0, 1);
      const days = Math.floor((d - start) / 86400000);
      return Math.ceil((days + start.getDay() + 1) / 7);
    }

    // Get quarter
    quarter(date) {
      const d = this.parse(date);
      if (!d) return 0;
      return Math.floor(d.getMonth() / 3) + 1;
    }

    // ═══════════════════════════════════════════════════════════
    // RANGES
    // ═══════════════════════════════════════════════════════════

    // Get date range
    range(start, end, unit = "day") {
      const dates = [];
      let current = new Date(this.parse(start));
      const endDate = this.parse(end);

      if (!current || !endDate) return dates;

      while (current <= endDate) {
        dates.push(new Date(current));
        current = this.add(current, 1, unit);
      }

      return dates;
    }

    // Get calendar month
    calendar(date, options = {}) {
      const d = this.parse(date);
      if (!d) return [];

      const { startWeekOn = 0 } = options; // 0 = Sunday
      const first = this.startOf(d, "month");
      const last = this.endOf(d, "month");

      // Fill in days from previous month
      const startDay = first.getDay();
      const daysFromPrev = (startDay - startWeekOn + 7) % 7;
      const start = this.subtract(first, daysFromPrev, "days");

      // Generate 6 weeks
      const weeks = [];
      let current = new Date(start);

      for (let w = 0; w < 6; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
          week.push({
            date: new Date(current),
            day: current.getDate(),
            inMonth: current.getMonth() === first.getMonth(),
            isToday: this.isToday(current),
            isWeekend: this.isWeekend(current),
          });
          current = this.add(current, 1, "day");
        }
        weeks.push(week);
      }

      return weeks;
    }

    // ═══════════════════════════════════════════════════════════
    // TIMEZONE
    // ═══════════════════════════════════════════════════════════

    // Get timezone offset
    getTimezoneOffset(date) {
      const d = this.parse(date) || new Date();
      return d.getTimezoneOffset();
    }

    // Get timezone name
    getTimezoneName() {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // Convert to timezone
    toTimezone(date, timezone) {
      const d = this.parse(date);
      if (!d) return null;

      return new Date(d.toLocaleString("en-US", { timeZone: timezone }));
    }

    // ═══════════════════════════════════════════════════════════
    // DURATION
    // ═══════════════════════════════════════════════════════════

    // Format duration
    formatDuration(ms, options = {}) {
      const { long = false } = options;

      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const parts = [];

      if (days > 0) {
        parts.push(long ? `${days} day${days !== 1 ? "s" : ""}` : `${days}d`);
      }
      if (hours % 24 > 0) {
        parts.push(
          long
            ? `${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`
            : `${hours % 24}h`,
        );
      }
      if (minutes % 60 > 0) {
        parts.push(
          long
            ? `${minutes % 60} minute${minutes % 60 !== 1 ? "s" : ""}`
            : `${minutes % 60}m`,
        );
      }
      if (seconds % 60 > 0 || parts.length === 0) {
        parts.push(
          long
            ? `${seconds % 60} second${seconds % 60 !== 1 ? "s" : ""}`
            : `${seconds % 60}s`,
        );
      }

      return parts.join(" ");
    }

    // Parse duration string
    parseDuration(str) {
      const units = {
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000,
        ms: 1,
      };

      let total = 0;
      const matches = str.matchAll(/(\d+\.?\d*)\s*(d|h|m|s|ms)/gi);

      for (const match of matches) {
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        total += value * (units[unit] || 0);
      }

      return total;
    }
  }

  // Initialize
  window.BaelDateTime = new BaelDateTime();

  // Global shortcuts
  window.$date = (date) => window.BaelDateTime.parse(date);
  window.$now = () => new Date();
  window.$formatDate = (date, pattern) =>
    window.BaelDateTime.format(date, pattern);
  window.$timeAgo = (date) => window.BaelDateTime.timeAgo(date);
})();
