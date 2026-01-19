/**
 * BAEL Color Utilities - Color Manipulation Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete color system:
 * - Color parsing
 * - Format conversion
 * - Color manipulation
 * - Palette generation
 * - Contrast checking
 * - Theme colors
 */

(function () {
  "use strict";

  class BaelColor {
    constructor() {
      console.log("🎨 Bael Color Utilities initialized");
    }

    // Parse any color format to RGBA
    parse(color) {
      if (!color) return null;

      // Already an object
      if (typeof color === "object" && "r" in color) {
        return { r: color.r, g: color.g, b: color.b, a: color.a ?? 1 };
      }

      const str = String(color).trim().toLowerCase();

      // Hex
      if (str.startsWith("#")) {
        return this.hexToRgb(str);
      }

      // RGB/RGBA
      const rgbMatch = str.match(
        /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/,
      );
      if (rgbMatch) {
        return {
          r: parseInt(rgbMatch[1]),
          g: parseInt(rgbMatch[2]),
          b: parseInt(rgbMatch[3]),
          a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
        };
      }

      // HSL/HSLA
      const hslMatch = str.match(
        /^hsla?\s*\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)$/,
      );
      if (hslMatch) {
        return this.hslToRgb({
          h: parseInt(hslMatch[1]),
          s: parseFloat(hslMatch[2]),
          l: parseFloat(hslMatch[3]),
          a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
        });
      }

      // Named colors
      const named = this.namedColors[str];
      if (named) {
        return this.hexToRgb(named);
      }

      return null;
    }

    // Hex to RGB
    hexToRgb(hex) {
      let h = hex.replace("#", "");

      if (h.length === 3) {
        h = h
          .split("")
          .map((c) => c + c)
          .join("");
      }

      if (h.length === 4) {
        h = h
          .split("")
          .map((c) => c + c)
          .join("");
      }

      const r = parseInt(h.substr(0, 2), 16);
      const g = parseInt(h.substr(2, 2), 16);
      const b = parseInt(h.substr(4, 2), 16);
      const a = h.length === 8 ? parseInt(h.substr(6, 2), 16) / 255 : 1;

      return { r, g, b, a };
    }

    // RGB to Hex
    rgbToHex(rgb, includeAlpha = false) {
      const toHex = (n) => Math.round(n).toString(16).padStart(2, "0");
      let hex = "#" + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
      if (includeAlpha && rgb.a !== undefined && rgb.a < 1) {
        hex += toHex(rgb.a * 255);
      }
      return hex;
    }

    // RGB to HSL
    rgbToHsl(rgb) {
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      if (max === min) {
        return { h: 0, s: 0, l: l * 100, a: rgb.a ?? 1 };
      }

      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      let h;
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }

      return { h: Math.round(h * 360), s: s * 100, l: l * 100, a: rgb.a ?? 1 };
    }

    // HSL to RGB
    hslToRgb(hsl) {
      const h = hsl.h / 360;
      const s = hsl.s / 100;
      const l = hsl.l / 100;

      if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v, a: hsl.a ?? 1 };
      }

      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
        a: hsl.a ?? 1,
      };
    }

    // RGB to HSV
    rgbToHsv(rgb) {
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;

      let h = 0;
      const s = max === 0 ? 0 : d / max;
      const v = max;

      if (max !== min) {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return { h: Math.round(h * 360), s: s * 100, v: v * 100, a: rgb.a ?? 1 };
    }

    // HSV to RGB
    hsvToRgb(hsv) {
      const h = hsv.h / 360;
      const s = hsv.s / 100;
      const v = hsv.v / 100;

      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);

      let r, g, b;
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a: hsv.a ?? 1,
      };
    }

    // Format color to string
    format(color, format = "hex") {
      const rgb = this.parse(color);
      if (!rgb) return null;

      switch (format) {
        case "hex":
          return this.rgbToHex(rgb);
        case "hexa":
          return this.rgbToHex(rgb, true);
        case "rgb":
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case "rgba":
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
        case "hsl":
          const hsl = this.rgbToHsl(rgb);
          return `hsl(${hsl.h}, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%)`;
        case "hsla":
          const hsla = this.rgbToHsl(rgb);
          return `hsla(${hsla.h}, ${hsla.s.toFixed(1)}%, ${hsla.l.toFixed(1)}%, ${hsla.a})`;
        default:
          return this.rgbToHex(rgb);
      }
    }

    // Lighten color
    lighten(color, amount = 10) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      const hsl = this.rgbToHsl(rgb);
      hsl.l = Math.min(100, hsl.l + amount);
      return this.format(this.hslToRgb(hsl), "hex");
    }

    // Darken color
    darken(color, amount = 10) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      const hsl = this.rgbToHsl(rgb);
      hsl.l = Math.max(0, hsl.l - amount);
      return this.format(this.hslToRgb(hsl), "hex");
    }

    // Saturate color
    saturate(color, amount = 10) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      const hsl = this.rgbToHsl(rgb);
      hsl.s = Math.min(100, hsl.s + amount);
      return this.format(this.hslToRgb(hsl), "hex");
    }

    // Desaturate color
    desaturate(color, amount = 10) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      const hsl = this.rgbToHsl(rgb);
      hsl.s = Math.max(0, hsl.s - amount);
      return this.format(this.hslToRgb(hsl), "hex");
    }

    // Rotate hue
    rotate(color, degrees) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      const hsl = this.rgbToHsl(rgb);
      hsl.h = (hsl.h + degrees + 360) % 360;
      return this.format(this.hslToRgb(hsl), "hex");
    }

    // Invert color
    invert(color) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      return this.format(
        {
          r: 255 - rgb.r,
          g: 255 - rgb.g,
          b: 255 - rgb.b,
          a: rgb.a,
        },
        "hex",
      );
    }

    // Grayscale
    grayscale(color) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
      return this.format({ r: gray, g: gray, b: gray, a: rgb.a }, "hex");
    }

    // Set alpha
    alpha(color, a) {
      const rgb = this.parse(color);
      if (!rgb) return color;

      rgb.a = Math.max(0, Math.min(1, a));
      return this.format(rgb, "rgba");
    }

    // Mix two colors
    mix(color1, color2, weight = 0.5) {
      const rgb1 = this.parse(color1);
      const rgb2 = this.parse(color2);
      if (!rgb1 || !rgb2) return color1;

      return this.format(
        {
          r: Math.round(rgb1.r * (1 - weight) + rgb2.r * weight),
          g: Math.round(rgb1.g * (1 - weight) + rgb2.g * weight),
          b: Math.round(rgb1.b * (1 - weight) + rgb2.b * weight),
          a: rgb1.a * (1 - weight) + rgb2.a * weight,
        },
        "hex",
      );
    }

    // Get luminance
    luminance(color) {
      const rgb = this.parse(color);
      if (!rgb) return 0;

      const toLinear = (c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };

      return (
        0.2126 * toLinear(rgb.r) +
        0.7152 * toLinear(rgb.g) +
        0.0722 * toLinear(rgb.b)
      );
    }

    // Contrast ratio between two colors
    contrast(color1, color2) {
      const l1 = this.luminance(color1);
      const l2 = this.luminance(color2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    // Check WCAG compliance
    isAccessible(foreground, background, level = "AA") {
      const ratio = this.contrast(foreground, background);
      const thresholds = { AA: 4.5, AAA: 7, AALarge: 3, AAALarge: 4.5 };
      return ratio >= (thresholds[level] || 4.5);
    }

    // Get readable text color
    getReadableColor(background, options = {}) {
      const { lightColor = "#ffffff", darkColor = "#000000" } = options;
      const lum = this.luminance(background);
      return lum > 0.179 ? darkColor : lightColor;
    }

    // Generate color palette
    palette(baseColor, type = "complementary") {
      const rgb = this.parse(baseColor);
      if (!rgb) return [baseColor];

      const hsl = this.rgbToHsl(rgb);
      const colors = [];

      switch (type) {
        case "complementary":
          colors.push(baseColor);
          colors.push(this.rotate(baseColor, 180));
          break;

        case "analogous":
          colors.push(this.rotate(baseColor, -30));
          colors.push(baseColor);
          colors.push(this.rotate(baseColor, 30));
          break;

        case "triadic":
          colors.push(baseColor);
          colors.push(this.rotate(baseColor, 120));
          colors.push(this.rotate(baseColor, 240));
          break;

        case "tetradic":
          colors.push(baseColor);
          colors.push(this.rotate(baseColor, 90));
          colors.push(this.rotate(baseColor, 180));
          colors.push(this.rotate(baseColor, 270));
          break;

        case "splitComplementary":
          colors.push(baseColor);
          colors.push(this.rotate(baseColor, 150));
          colors.push(this.rotate(baseColor, 210));
          break;

        case "shades":
          for (let i = 0; i < 5; i++) {
            colors.push(this.darken(baseColor, i * 15));
          }
          break;

        case "tints":
          for (let i = 0; i < 5; i++) {
            colors.push(this.lighten(baseColor, i * 15));
          }
          break;

        case "monochromatic":
          colors.push(this.darken(baseColor, 30));
          colors.push(this.darken(baseColor, 15));
          colors.push(baseColor);
          colors.push(this.lighten(baseColor, 15));
          colors.push(this.lighten(baseColor, 30));
          break;

        default:
          colors.push(baseColor);
      }

      return colors;
    }

    // Gradient string
    gradient(colors, direction = "to right", type = "linear") {
      const colorStops = colors
        .map(
          (c, i) =>
            `${this.format(c, "hex")} ${((i / (colors.length - 1)) * 100).toFixed(0)}%`,
        )
        .join(", ");

      if (type === "radial") {
        return `radial-gradient(${direction}, ${colorStops})`;
      }
      return `linear-gradient(${direction}, ${colorStops})`;
    }

    // Random color
    random(options = {}) {
      const { hue, saturation = [50, 100], lightness = [30, 70] } = options;

      const h = hue ?? Math.floor(Math.random() * 360);
      const s = Array.isArray(saturation)
        ? saturation[0] + Math.random() * (saturation[1] - saturation[0])
        : saturation;
      const l = Array.isArray(lightness)
        ? lightness[0] + Math.random() * (lightness[1] - lightness[0])
        : lightness;

      return this.format(this.hslToRgb({ h, s, l, a: 1 }), "hex");
    }

    // Named colors (subset)
    get namedColors() {
      return {
        black: "#000000",
        white: "#ffffff",
        red: "#ff0000",
        green: "#008000",
        blue: "#0000ff",
        yellow: "#ffff00",
        cyan: "#00ffff",
        magenta: "#ff00ff",
        gray: "#808080",
        grey: "#808080",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        violet: "#ee82ee",
        indigo: "#4b0082",
        lime: "#00ff00",
        navy: "#000080",
        teal: "#008080",
        olive: "#808000",
        maroon: "#800000",
        coral: "#ff7f50",
        salmon: "#fa8072",
        gold: "#ffd700",
        silver: "#c0c0c0",
        crimson: "#dc143c",
        turquoise: "#40e0d0",
        transparent: "rgba(0,0,0,0)",
      };
    }
  }

  // Initialize
  window.BaelColor = new BaelColor();

  // Global shortcuts
  window.$color = (color) => window.BaelColor.parse(color);
  window.$hex = (color) => window.BaelColor.format(color, "hex");
  window.$rgb = (color) => window.BaelColor.format(color, "rgb");
})();
