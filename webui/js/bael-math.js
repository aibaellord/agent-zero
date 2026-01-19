/**
 * BAEL Math Utilities - Number & Math Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete math system:
 * - Number formatting
 * - Mathematical operations
 * - Statistics
 * - Random generation
 * - Interpolation
 * - Unit conversion
 */

(function () {
  "use strict";

  class BaelMath {
    constructor() {
      console.log("🔢 Bael Math Utilities initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // FORMATTING
    // ═══════════════════════════════════════════════════════════

    // Format with thousands separator
    format(num, options = {}) {
      const { decimals = 2, locale = "en-US", style = "decimal" } = options;

      return new Intl.NumberFormat(locale, {
        style,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    }

    // Format as compact
    compact(num, options = {}) {
      const { decimals = 1, locale = "en-US" } = options;

      return new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: decimals,
      }).format(num);
    }

    // Format as currency
    currency(num, currency = "USD", locale = "en-US") {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(num);
    }

    // Format as percentage
    percent(num, decimals = 1) {
      return (num * 100).toFixed(decimals) + "%";
    }

    // Format as ordinal
    ordinal(num) {
      const suffixes = ["th", "st", "nd", "rd"];
      const v = num % 100;
      return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }

    // Format bytes
    bytes(bytes, options = {}) {
      const { decimals = 2, binary = true } = options;

      if (bytes === 0) return "0 Bytes";

      const k = binary ? 1024 : 1000;
      const sizes = binary
        ? ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB"]
        : ["Bytes", "KB", "MB", "GB", "TB", "PB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (
        parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
      );
    }

    // ═══════════════════════════════════════════════════════════
    // CLAMPING & ROUNDING
    // ═══════════════════════════════════════════════════════════

    // Clamp value
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    // Round to precision
    round(value, precision = 0) {
      const multiplier = Math.pow(10, precision);
      return Math.round(value * multiplier) / multiplier;
    }

    // Floor to precision
    floor(value, precision = 0) {
      const multiplier = Math.pow(10, precision);
      return Math.floor(value * multiplier) / multiplier;
    }

    // Ceil to precision
    ceil(value, precision = 0) {
      const multiplier = Math.pow(10, precision);
      return Math.ceil(value * multiplier) / multiplier;
    }

    // Truncate to precision
    trunc(value, precision = 0) {
      const multiplier = Math.pow(10, precision);
      return Math.trunc(value * multiplier) / multiplier;
    }

    // ═══════════════════════════════════════════════════════════
    // MATHEMATICAL OPERATIONS
    // ═══════════════════════════════════════════════════════════

    // Sum
    sum(...values) {
      return values.flat().reduce((a, b) => a + Number(b), 0);
    }

    // Average/Mean
    mean(...values) {
      const flat = values.flat();
      return flat.length > 0 ? this.sum(flat) / flat.length : 0;
    }

    // Median
    median(...values) {
      const flat = values.flat().sort((a, b) => a - b);
      const mid = Math.floor(flat.length / 2);

      if (flat.length === 0) return 0;
      return flat.length % 2 !== 0
        ? flat[mid]
        : (flat[mid - 1] + flat[mid]) / 2;
    }

    // Mode
    mode(...values) {
      const flat = values.flat();
      const counts = {};
      let maxCount = 0;
      let modes = [];

      for (const val of flat) {
        counts[val] = (counts[val] || 0) + 1;
        if (counts[val] > maxCount) {
          maxCount = counts[val];
          modes = [val];
        } else if (counts[val] === maxCount && !modes.includes(val)) {
          modes.push(val);
        }
      }

      return modes.length === flat.length ? null : modes;
    }

    // Range
    range(...values) {
      const flat = values.flat();
      return flat.length > 0 ? Math.max(...flat) - Math.min(...flat) : 0;
    }

    // Variance
    variance(...values) {
      const flat = values.flat();
      if (flat.length === 0) return 0;

      const avg = this.mean(flat);
      return (
        flat.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / flat.length
      );
    }

    // Standard deviation
    stdDev(...values) {
      return Math.sqrt(this.variance(...values));
    }

    // Min
    min(...values) {
      return Math.min(...values.flat());
    }

    // Max
    max(...values) {
      return Math.max(...values.flat());
    }

    // Product
    product(...values) {
      return values.flat().reduce((a, b) => a * b, 1);
    }

    // Factorial
    factorial(n) {
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    }

    // Fibonacci
    fibonacci(n) {
      if (n < 0) return NaN;
      if (n <= 1) return n;
      let a = 0,
        b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    }

    // GCD
    gcd(a, b) {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) {
        [a, b] = [b, a % b];
      }
      return a;
    }

    // LCM
    lcm(a, b) {
      return Math.abs(a * b) / this.gcd(a, b);
    }

    // Power
    pow(base, exponent) {
      return Math.pow(base, exponent);
    }

    // Square root
    sqrt(value) {
      return Math.sqrt(value);
    }

    // Absolute
    abs(value) {
      return Math.abs(value);
    }

    // Sign
    sign(value) {
      return Math.sign(value);
    }

    // ═══════════════════════════════════════════════════════════
    // RANDOM
    // ═══════════════════════════════════════════════════════════

    // Random integer
    randomInt(min = 0, max = 100) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Random float
    randomFloat(min = 0, max = 1, decimals = 2) {
      const value = Math.random() * (max - min) + min;
      return this.round(value, decimals);
    }

    // Random boolean
    randomBool(probability = 0.5) {
      return Math.random() < probability;
    }

    // Random from array
    randomFrom(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Random color
    randomColor(format = "hex") {
      const r = this.randomInt(0, 255);
      const g = this.randomInt(0, 255);
      const b = this.randomInt(0, 255);

      switch (format) {
        case "hex":
          return (
            "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
          );
        case "rgb":
          return `rgb(${r}, ${g}, ${b})`;
        case "hsl":
          return `hsl(${this.randomInt(0, 360)}, ${this.randomInt(50, 100)}%, ${this.randomInt(30, 70)}%)`;
        default:
          return { r, g, b };
      }
    }

    // UUID
    uuid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // INTERPOLATION
    // ═══════════════════════════════════════════════════════════

    // Linear interpolation
    lerp(start, end, t) {
      return start + (end - start) * t;
    }

    // Inverse lerp
    invLerp(start, end, value) {
      return (value - start) / (end - start);
    }

    // Map range
    map(value, inMin, inMax, outMin, outMax) {
      return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
    }

    // Smooth step
    smoothStep(edge0, edge1, x) {
      const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    }

    // Smoother step
    smootherStep(edge0, edge1, x) {
      const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    // ═══════════════════════════════════════════════════════════
    // GEOMETRY
    // ═══════════════════════════════════════════════════════════

    // Distance between points
    distance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Angle between points (radians)
    angle(x1, y1, x2, y2) {
      return Math.atan2(y2 - y1, x2 - x1);
    }

    // Degrees to radians
    degToRad(degrees) {
      return degrees * (Math.PI / 180);
    }

    // Radians to degrees
    radToDeg(radians) {
      return radians * (180 / Math.PI);
    }

    // Circle area
    circleArea(radius) {
      return Math.PI * radius * radius;
    }

    // Circle circumference
    circumference(radius) {
      return 2 * Math.PI * radius;
    }

    // Rectangle area
    rectArea(width, height) {
      return width * height;
    }

    // Triangle area
    triangleArea(base, height) {
      return (base * height) / 2;
    }

    // ═══════════════════════════════════════════════════════════
    // UNIT CONVERSION
    // ═══════════════════════════════════════════════════════════

    // Temperature
    celsiusToFahrenheit(celsius) {
      return (celsius * 9) / 5 + 32;
    }

    fahrenheitToCelsius(fahrenheit) {
      return ((fahrenheit - 32) * 5) / 9;
    }

    // Length
    milesToKm(miles) {
      return miles * 1.60934;
    }

    kmToMiles(km) {
      return km / 1.60934;
    }

    feetToMeters(feet) {
      return feet * 0.3048;
    }

    metersToFeet(meters) {
      return meters / 0.3048;
    }

    inchesToCm(inches) {
      return inches * 2.54;
    }

    cmToInches(cm) {
      return cm / 2.54;
    }

    // Weight
    poundsToKg(pounds) {
      return pounds * 0.453592;
    }

    kgToPounds(kg) {
      return kg / 0.453592;
    }

    // ═══════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════

    // Is number
    isNumber(value) {
      return typeof value === "number" && !isNaN(value) && isFinite(value);
    }

    // Is integer
    isInteger(value) {
      return Number.isInteger(value);
    }

    // Is positive
    isPositive(value) {
      return this.isNumber(value) && value > 0;
    }

    // Is negative
    isNegative(value) {
      return this.isNumber(value) && value < 0;
    }

    // Is even
    isEven(value) {
      return this.isInteger(value) && value % 2 === 0;
    }

    // Is odd
    isOdd(value) {
      return this.isInteger(value) && value % 2 !== 0;
    }

    // Is prime
    isPrime(value) {
      if (!this.isInteger(value) || value < 2) return false;
      if (value === 2) return true;
      if (value % 2 === 0) return false;

      for (let i = 3; i <= Math.sqrt(value); i += 2) {
        if (value % i === 0) return false;
      }
      return true;
    }

    // Is between
    isBetween(value, min, max, inclusive = true) {
      return inclusive
        ? value >= min && value <= max
        : value > min && value < max;
    }

    // ═══════════════════════════════════════════════════════════
    // PARSING
    // ═══════════════════════════════════════════════════════════

    // Parse number
    parse(value, defaultValue = 0) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    // Parse int
    parseInt(value, defaultValue = 0) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    // Extract numbers from string
    extract(str) {
      const matches = str.match(/-?\d+\.?\d*/g);
      return matches ? matches.map(Number) : [];
    }

    // ═══════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════

    get PI() {
      return Math.PI;
    }
    get E() {
      return Math.E;
    }
    get PHI() {
      return (1 + Math.sqrt(5)) / 2;
    } // Golden ratio
    get SQRT2() {
      return Math.SQRT2;
    }
    get SQRT3() {
      return Math.sqrt(3);
    }
  }

  // Initialize
  window.BaelMath = new BaelMath();

  // Global shortcuts
  window.$math = window.BaelMath;
  window.$rand = (min, max) => window.BaelMath.randomInt(min, max);
  window.$clamp = (val, min, max) => window.BaelMath.clamp(val, min, max);
  window.$lerp = (start, end, t) => window.BaelMath.lerp(start, end, t);
})();
