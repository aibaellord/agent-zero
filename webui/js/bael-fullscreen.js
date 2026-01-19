/**
 * BAEL Fullscreen - Fullscreen API System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete fullscreen system:
 * - Element fullscreen
 * - Document fullscreen
 * - Keyboard shortcuts
 * - Change detection
 * - Cross-browser support
 */

(function () {
  "use strict";

  class BaelFullscreen {
    constructor() {
      this.listeners = new Set();
      this._initEvents();
      console.log("🖥️ Bael Fullscreen initialized");
    }

    _initEvents() {
      const events = [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ];

      for (const event of events) {
        document.addEventListener(event, () => this._handleChange());
      }
    }

    _handleChange() {
      const isFullscreen = this.isFullscreen();
      const element = this.getElement();

      for (const listener of this.listeners) {
        listener({ isFullscreen, element });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // FULLSCREEN OPERATIONS
    // ═══════════════════════════════════════════════════════════

    async enter(element = document.documentElement, options = {}) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;

      if (!el) {
        throw new Error("Element not found");
      }

      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen(options);
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        } else {
          throw new Error("Fullscreen not supported");
        }
        return true;
      } catch (error) {
        console.warn("Fullscreen request failed:", error);
        return false;
      }
    }

    async exit() {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        return true;
      } catch (error) {
        console.warn("Exit fullscreen failed:", error);
        return false;
      }
    }

    async toggle(element = document.documentElement, options = {}) {
      if (this.isFullscreen()) {
        return this.exit();
      } else {
        return this.enter(element, options);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STATE QUERIES
    // ═══════════════════════════════════════════════════════════

    isFullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }

    getElement() {
      return (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        null
      );
    }

    isEnabled() {
      return !!(
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
      );
    }

    isSupported() {
      return !!(
        document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.mozRequestFullScreen ||
        document.documentElement.msRequestFullscreen
      );
    }

    // ═══════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════

    onChange(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    onEnter(callback) {
      return this.onChange(({ isFullscreen, element }) => {
        if (isFullscreen) {
          callback(element);
        }
      });
    }

    onExit(callback) {
      return this.onChange(({ isFullscreen }) => {
        if (!isFullscreen) {
          callback();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════

    enableKeyboard(element = document.documentElement, key = "F11") {
      const handler = (e) => {
        if (e.key === key || (key === "F11" && e.keyCode === 122)) {
          e.preventDefault();
          this.toggle(element);
        }
      };

      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }

    // ═══════════════════════════════════════════════════════════
    // BUTTON HELPER
    // ═══════════════════════════════════════════════════════════

    button(buttonElement, targetElement, options = {}) {
      const btn =
        typeof buttonElement === "string"
          ? document.querySelector(buttonElement)
          : buttonElement;

      const target =
        typeof targetElement === "string"
          ? document.querySelector(targetElement)
          : targetElement || document.documentElement;

      if (!btn) return () => {};

      const updateButton = () => {
        const isFS = this.isFullscreen();

        if (options.activeClass) {
          btn.classList.toggle(options.activeClass, isFS);
        }

        if (options.enterText && options.exitText) {
          btn.textContent = isFS ? options.exitText : options.enterText;
        }

        if (options.enterIcon && options.exitIcon) {
          const icon = btn.querySelector("svg, i, img");
          if (icon) {
            if (isFS) {
              icon.outerHTML = options.exitIcon;
            } else {
              icon.outerHTML = options.enterIcon;
            }
          }
        }
      };

      const clickHandler = () => this.toggle(target);

      btn.addEventListener("click", clickHandler);
      const unsubscribe = this.onChange(updateButton);

      // Initial update
      updateButton();

      return () => {
        btn.removeEventListener("click", clickHandler);
        unsubscribe();
      };
    }

    // ═══════════════════════════════════════════════════════════
    // ELEMENT UTILITIES
    // ═══════════════════════════════════════════════════════════

    lockOrientation(orientation = "landscape") {
      if (screen.orientation && screen.orientation.lock) {
        return screen.orientation
          .lock(orientation)
          .then(() => true)
          .catch(() => false);
      }
      return Promise.resolve(false);
    }

    unlockOrientation() {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
        return true;
      }
      return false;
    }

    // Hide cursor after inactivity
    hideCursorOnIdle(element, timeout = 3000) {
      const el =
        typeof element === "string"
          ? document.querySelector(element)
          : element || document.documentElement;

      let cursorTimeout;
      let isCursorHidden = false;

      const showCursor = () => {
        if (isCursorHidden) {
          el.style.cursor = "";
          isCursorHidden = false;
        }
      };

      const hideCursor = () => {
        if (this.isFullscreen()) {
          el.style.cursor = "none";
          isCursorHidden = true;
        }
      };

      const resetTimer = () => {
        showCursor();
        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(hideCursor, timeout);
      };

      el.addEventListener("mousemove", resetTimer);
      el.addEventListener("mousedown", resetTimer);

      // Start timer
      resetTimer();

      // Reset on exit
      const unsubscribe = this.onExit(() => {
        showCursor();
        clearTimeout(cursorTimeout);
      });

      return () => {
        el.removeEventListener("mousemove", resetTimer);
        el.removeEventListener("mousedown", resetTimer);
        clearTimeout(cursorTimeout);
        showCursor();
        unsubscribe();
      };
    }

    // ═══════════════════════════════════════════════════════════
    // VIDEO HELPERS
    // ═══════════════════════════════════════════════════════════

    video(videoElement, options = {}) {
      const video =
        typeof videoElement === "string"
          ? document.querySelector(videoElement)
          : videoElement;

      if (!video) return { enter: () => {}, exit: () => {}, toggle: () => {} };

      return {
        enter: async () => {
          // Try video-specific fullscreen first (for iOS)
          if (video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
            return true;
          }
          return this.enter(options.container || video.parentElement || video);
        },
        exit: () => this.exit(),
        toggle: async () => {
          if (this.isFullscreen()) {
            return this.exit();
          }
          return this.enter(options.container || video.parentElement || video);
        },
        isFullscreen: () => this.isFullscreen(),
      };
    }

    // ═══════════════════════════════════════════════════════════
    // PICTURE-IN-PICTURE
    // ═══════════════════════════════════════════════════════════

    async enterPiP(videoElement) {
      const video =
        typeof videoElement === "string"
          ? document.querySelector(videoElement)
          : videoElement;

      if (!video || !document.pictureInPictureEnabled) {
        return false;
      }

      try {
        await video.requestPictureInPicture();
        return true;
      } catch (error) {
        console.warn("PiP failed:", error);
        return false;
      }
    }

    async exitPiP() {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return true;
      }
      return false;
    }

    isPiP() {
      return !!document.pictureInPictureElement;
    }

    isPiPSupported() {
      return !!document.pictureInPictureEnabled;
    }
  }

  // Initialize
  window.BaelFullscreen = new BaelFullscreen();

  // Global shortcuts
  window.$fullscreen = window.BaelFullscreen;
  window.$enterFullscreen = (el, opts) => window.BaelFullscreen.enter(el, opts);
  window.$exitFullscreen = () => window.BaelFullscreen.exit();
  window.$toggleFullscreen = (el, opts) =>
    window.BaelFullscreen.toggle(el, opts);

  console.log("🖥️ Bael Fullscreen ready");
})();
