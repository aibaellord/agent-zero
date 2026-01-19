/**
 * BAEL Media Utilities - Audio, Video & Image Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete media system:
 * - Image manipulation
 * - Audio playback
 * - Video controls
 * - Canvas utilities
 * - File handling
 * - Media queries
 */

(function () {
  "use strict";

  class BaelMedia {
    constructor() {
      this.audioContext = null;
      this.sounds = new Map();
      this.breakpoints = {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400,
      };
      console.log("🎬 Bael Media initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // IMAGE UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Load image with promise
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }

    // Get image dimensions
    async getImageDimensions(src) {
      const img = await this.loadImage(src);
      return {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      };
    }

    // Resize image
    async resizeImage(src, maxWidth, maxHeight, options = {}) {
      const { format = "image/jpeg", quality = 0.8 } = options;

      const img = await this.loadImage(src);

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = width * (maxHeight / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      return {
        dataUrl: canvas.toDataURL(format, quality),
        blob: await new Promise((resolve) =>
          canvas.toBlob(resolve, format, quality),
        ),
        width,
        height,
      };
    }

    // Crop image
    async cropImage(src, x, y, width, height, options = {}) {
      const { format = "image/jpeg", quality = 0.8 } = options;

      const img = await this.loadImage(src);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      return {
        dataUrl: canvas.toDataURL(format, quality),
        blob: await new Promise((resolve) =>
          canvas.toBlob(resolve, format, quality),
        ),
      };
    }

    // Convert to grayscale
    async toGrayscale(src) {
      const img = await this.loadImage(src);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    }

    // Apply blur
    async blur(src, radius = 5) {
      const img = await this.loadImage(src);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.filter = `blur(${radius}px)`;
      ctx.drawImage(img, 0, 0);

      return canvas.toDataURL("image/png");
    }

    // Get dominant color
    async getDominantColor(src) {
      const img = await this.loadImage(src);
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 1, 1);

      const data = ctx.getImageData(0, 0, 1, 1).data;
      return {
        r: data[0],
        g: data[1],
        b: data[2],
        hex: `#${data[0].toString(16).padStart(2, "0")}${data[1].toString(16).padStart(2, "0")}${data[2].toString(16).padStart(2, "0")}`,
      };
    }

    // Get color palette
    async getColorPalette(src, count = 5) {
      const img = await this.loadImage(src);
      const canvas = document.createElement("canvas");
      const size = 100;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const colors = {};

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = Math.round(imageData.data[i] / 32) * 32;
        const g = Math.round(imageData.data[i + 1] / 32) * 32;
        const b = Math.round(imageData.data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colors[key] = (colors[key] || 0) + 1;
      }

      return Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([color]) => {
          const [r, g, b] = color.split(",").map(Number);
          return {
            r,
            g,
            b,
            hex: `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
          };
        });
    }

    // Image to base64
    async imageToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Base64 to blob
    base64ToBlob(base64, type = "image/png") {
      const byteString = atob(base64.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type });
    }

    // ═══════════════════════════════════════════════════════════
    // AUDIO UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Get audio context
    getAudioContext() {
      if (!this.audioContext) {
        this.audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      return this.audioContext;
    }

    // Load audio
    async loadAudio(url, name) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer =
        await this.getAudioContext().decodeAudioData(arrayBuffer);

      this.sounds.set(name, audioBuffer);
      return audioBuffer;
    }

    // Play sound
    playSound(name, options = {}) {
      const { volume = 1, loop = false, playbackRate = 1 } = options;
      const audioBuffer = this.sounds.get(name);

      if (!audioBuffer) {
        console.warn(`Sound "${name}" not found`);
        return null;
      }

      const context = this.getAudioContext();
      const source = context.createBufferSource();
      const gainNode = context.createGain();

      source.buffer = audioBuffer;
      source.loop = loop;
      source.playbackRate.value = playbackRate;

      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(context.destination);
      source.start(0);

      return {
        source,
        gainNode,
        stop: () => source.stop(),
        setVolume: (v) => {
          gainNode.gain.value = v;
        },
      };
    }

    // Create oscillator
    createOscillator(type = "sine", frequency = 440) {
      const context = this.getAudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      return {
        oscillator,
        gainNode,
        start: () => oscillator.start(),
        stop: () => oscillator.stop(),
        setFrequency: (f) => {
          oscillator.frequency.value = f;
        },
        setVolume: (v) => {
          gainNode.gain.value = v;
        },
      };
    }

    // Simple beep
    beep(frequency = 440, duration = 200, volume = 0.5) {
      const osc = this.createOscillator("sine", frequency);
      osc.setVolume(volume);
      osc.start();
      setTimeout(() => osc.stop(), duration);
    }

    // ═══════════════════════════════════════════════════════════
    // VIDEO UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Create video player
    createVideoPlayer(container, options = {}) {
      const {
        src,
        poster,
        controls = true,
        autoplay = false,
        muted = false,
        loop = false,
      } = options;

      const video = document.createElement("video");
      video.src = src;
      if (poster) video.poster = poster;
      video.controls = controls;
      video.autoplay = autoplay;
      video.muted = muted;
      video.loop = loop;
      video.style.width = "100%";

      if (typeof container === "string") {
        container = document.querySelector(container);
      }
      container.appendChild(video);

      return {
        element: video,
        play: () => video.play(),
        pause: () => video.pause(),
        stop: () => {
          video.pause();
          video.currentTime = 0;
        },
        seek: (time) => {
          video.currentTime = time;
        },
        setVolume: (v) => {
          video.volume = v;
        },
        mute: () => {
          video.muted = true;
        },
        unmute: () => {
          video.muted = false;
        },
        getDuration: () => video.duration,
        getCurrentTime: () => video.currentTime,
        isPlaying: () => !video.paused,
        on: (event, handler) => video.addEventListener(event, handler),
      };
    }

    // Capture video frame
    captureVideoFrame(video, format = "image/png", quality = 1) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      return canvas.toDataURL(format, quality);
    }

    // ═══════════════════════════════════════════════════════════
    // CANVAS UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Create canvas
    createCanvas(width, height) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      return {
        canvas,
        ctx,
        clear: () => ctx.clearRect(0, 0, width, height),
        fill: (color) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, width, height);
        },
        drawRect: (x, y, w, h, color) => {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, w, h);
        },
        drawCircle: (x, y, radius, color) => {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        },
        drawLine: (x1, y1, x2, y2, color, width = 1) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          ctx.stroke();
        },
        drawText: (text, x, y, options = {}) => {
          const {
            font = "16px sans-serif",
            color = "#000",
            align = "left",
          } = options;
          ctx.font = font;
          ctx.fillStyle = color;
          ctx.textAlign = align;
          ctx.fillText(text, x, y);
        },
        toDataURL: (format = "image/png", quality = 1) =>
          canvas.toDataURL(format, quality),
        toBlob: (format = "image/png", quality = 1) => {
          return new Promise((resolve) =>
            canvas.toBlob(resolve, format, quality),
          );
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // MEDIA QUERIES
    // ═══════════════════════════════════════════════════════════

    // Get current breakpoint
    getBreakpoint() {
      const width = window.innerWidth;
      const breakpoints = Object.entries(this.breakpoints).sort(
        (a, b) => b[1] - a[1],
      );

      for (const [name, minWidth] of breakpoints) {
        if (width >= minWidth) {
          return name;
        }
      }
      return "xs";
    }

    // Check if matches breakpoint
    matches(breakpoint) {
      const current = this.getBreakpoint();
      const order = Object.keys(this.breakpoints);
      return order.indexOf(current) >= order.indexOf(breakpoint);
    }

    // Watch breakpoint changes
    watchBreakpoint(callback) {
      let currentBreakpoint = this.getBreakpoint();

      const handler = () => {
        const newBreakpoint = this.getBreakpoint();
        if (newBreakpoint !== currentBreakpoint) {
          callback(newBreakpoint, currentBreakpoint);
          currentBreakpoint = newBreakpoint;
        }
      };

      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
    }

    // Create media query listener
    mediaQuery(query, callback) {
      const mql = window.matchMedia(query);

      const handler = (e) => callback(e.matches);
      mql.addEventListener("change", handler);

      // Initial call
      callback(mql.matches);

      return () => mql.removeEventListener("change", handler);
    }

    // ═══════════════════════════════════════════════════════════
    // FILE UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Read file as text
    readAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    // Read file as data URL
    readAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Read file as array buffer
    readAsArrayBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }

    // Get file info
    getFileInfo(file) {
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified),
        extension: file.name.split(".").pop().toLowerCase(),
      };
    }

    // Format file size
    formatFileSize(bytes) {
      const units = ["B", "KB", "MB", "GB", "TB"];
      let unitIndex = 0;
      let size = bytes;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    // ═══════════════════════════════════════════════════════════
    // FULLSCREEN
    // ═══════════════════════════════════════════════════════════

    // Request fullscreen
    requestFullscreen(element = document.documentElement) {
      if (element.requestFullscreen) {
        return element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        return element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        return element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        return element.msRequestFullscreen();
      }
    }

    // Exit fullscreen
    exitFullscreen() {
      if (document.exitFullscreen) {
        return document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        return document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        return document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        return document.msExitFullscreen();
      }
    }

    // Check if fullscreen
    isFullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }

    // Toggle fullscreen
    toggleFullscreen(element) {
      if (this.isFullscreen()) {
        return this.exitFullscreen();
      }
      return this.requestFullscreen(element);
    }

    // Watch fullscreen changes
    onFullscreenChange(callback) {
      const events = [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ];
      events.forEach((event) => document.addEventListener(event, callback));
      return () =>
        events.forEach((event) =>
          document.removeEventListener(event, callback),
        );
    }
  }

  // Initialize
  window.BaelMedia = new BaelMedia();

  // Global shortcuts
  window.$media = window.BaelMedia;
  window.$loadImage = (src) => window.BaelMedia.loadImage(src);
  window.$breakpoint = () => window.BaelMedia.getBreakpoint();
})();
