/**
 * BAEL Keyboard Component - Lord Of All Shortcuts
 *
 * Keyboard handling utilities:
 * - Hotkey registration
 * - Keyboard shortcuts
 * - Key sequences (Konami code)
 * - Keyboard navigation
 * - Focus management
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // KEYBOARD CLASS
  // ============================================================

  class BaelKeyboard {
    constructor() {
      this.hotkeys = new Map();
      this.sequences = [];
      this.sequenceBuffer = [];
      this.sequenceTimeout = null;
      this.pressedKeys = new Set();
      this.enabled = true;

      this._initListeners();
    }

    /**
     * Initialize keyboard listeners
     */
    _initListeners() {
      document.addEventListener("keydown", (e) => this._handleKeyDown(e));
      document.addEventListener("keyup", (e) => this._handleKeyUp(e));
      window.addEventListener("blur", () => this.pressedKeys.clear());
    }

    /**
     * Parse key string to components
     */
    _parseKey(keyString) {
      const parts = keyString
        .toLowerCase()
        .split("+")
        .map((p) => p.trim());
      const modifiers = {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      };
      let key = "";

      parts.forEach((part) => {
        switch (part) {
          case "ctrl":
          case "control":
            modifiers.ctrl = true;
            break;
          case "alt":
          case "option":
            modifiers.alt = true;
            break;
          case "shift":
            modifiers.shift = true;
            break;
          case "meta":
          case "cmd":
          case "command":
          case "win":
          case "windows":
            modifiers.meta = true;
            break;
          default:
            key = part;
        }
      });

      // Normalize key names
      const keyMap = {
        space: " ",
        spacebar: " ",
        up: "arrowup",
        down: "arrowdown",
        left: "arrowleft",
        right: "arrowright",
        esc: "escape",
        del: "delete",
        ins: "insert",
      };

      key = keyMap[key] || key;

      return { modifiers, key };
    }

    /**
     * Check if event matches key config
     */
    _matchesKey(event, config) {
      const { modifiers, key } = config;

      if (modifiers.ctrl !== event.ctrlKey) return false;
      if (modifiers.alt !== event.altKey) return false;
      if (modifiers.shift !== event.shiftKey) return false;
      if (modifiers.meta !== event.metaKey) return false;

      return event.key.toLowerCase() === key;
    }

    /**
     * Handle keydown
     */
    _handleKeyDown(event) {
      if (!this.enabled) return;

      const eventKey = event.key.toLowerCase();
      this.pressedKeys.add(eventKey);

      // Check hotkeys
      for (const [id, hotkey] of this.hotkeys) {
        if (this._matchesKey(event, hotkey.config)) {
          // Check scope
          if (hotkey.options.scope) {
            const scopeEl = document.querySelector(hotkey.options.scope);
            if (!scopeEl || !scopeEl.contains(document.activeElement)) {
              continue;
            }
          }

          // Skip if in input and not allowed
          if (hotkey.options.allowInInput !== true) {
            const tagName = event.target.tagName.toLowerCase();
            if (["input", "textarea", "select"].includes(tagName)) {
              if (!event.target.readOnly) continue;
            }
            if (event.target.isContentEditable) continue;
          }

          // Prevent default if specified
          if (hotkey.options.preventDefault !== false) {
            event.preventDefault();
          }

          // Execute callback
          hotkey.callback(event);

          if (hotkey.options.stopPropagation) {
            event.stopPropagation();
          }
        }
      }

      // Check sequences
      this._checkSequences(event);
    }

    /**
     * Handle keyup
     */
    _handleKeyUp(event) {
      this.pressedKeys.delete(event.key.toLowerCase());
    }

    /**
     * Check key sequences
     */
    _checkSequences(event) {
      if (this.sequences.length === 0) return;

      // Clear timeout
      if (this.sequenceTimeout) {
        clearTimeout(this.sequenceTimeout);
      }

      // Add to buffer
      this.sequenceBuffer.push(event.key.toLowerCase());

      // Check each sequence
      for (const seq of this.sequences) {
        const pattern = seq.keys.map((k) => k.toLowerCase());
        const bufferStr = this.sequenceBuffer.join(",");
        const patternStr = pattern.join(",");

        if (bufferStr === patternStr) {
          seq.callback(event);
          this.sequenceBuffer = [];
          return;
        }

        // Check if still matching prefix
        if (patternStr.startsWith(bufferStr)) {
          // Set timeout to clear buffer
          this.sequenceTimeout = setTimeout(() => {
            this.sequenceBuffer = [];
          }, seq.timeout || 1000);
          return;
        }
      }

      // No match, reset
      this.sequenceBuffer = [];
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Register hotkey
     */
    on(keys, callback, options = {}) {
      const id = `hotkey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const config = this._parseKey(keys);

      this.hotkeys.set(id, {
        keys,
        config,
        callback,
        options,
      });

      return {
        id,
        destroy: () => this.off(id),
        enable: () => this._setHotkeyEnabled(id, true),
        disable: () => this._setHotkeyEnabled(id, false),
      };
    }

    /**
     * Unregister hotkey
     */
    off(id) {
      return this.hotkeys.delete(id);
    }

    /**
     * Enable/disable hotkey
     */
    _setHotkeyEnabled(id, enabled) {
      const hotkey = this.hotkeys.get(id);
      if (hotkey) {
        hotkey.options.enabled = enabled;
      }
    }

    /**
     * Register key sequence
     */
    sequence(keys, callback, options = {}) {
      const seq = {
        id: `seq_${Date.now()}`,
        keys: Array.isArray(keys) ? keys : keys.split(" "),
        callback,
        timeout: options.timeout || 1000,
      };

      this.sequences.push(seq);

      return {
        id: seq.id,
        destroy: () => {
          this.sequences = this.sequences.filter((s) => s.id !== seq.id);
        },
      };
    }

    /**
     * Register Konami code
     */
    konami(callback) {
      return this.sequence(
        [
          "arrowup",
          "arrowup",
          "arrowdown",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "arrowleft",
          "arrowright",
          "b",
          "a",
        ],
        callback,
        { timeout: 2000 },
      );
    }

    /**
     * Check if key is pressed
     */
    isPressed(key) {
      return this.pressedKeys.has(key.toLowerCase());
    }

    /**
     * Check if any modifier is pressed
     */
    hasModifier() {
      return (
        this.isPressed("control") ||
        this.isPressed("alt") ||
        this.isPressed("shift") ||
        this.isPressed("meta")
      );
    }

    /**
     * Enable all hotkeys
     */
    enable() {
      this.enabled = true;
    }

    /**
     * Disable all hotkeys
     */
    disable() {
      this.enabled = false;
    }

    /**
     * Clear all hotkeys
     */
    clear() {
      this.hotkeys.clear();
      this.sequences = [];
    }

    // ============================================================
    // KEYBOARD NAVIGATION
    // ============================================================

    /**
     * Create keyboard navigation for list
     */
    createNavigation(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }
      if (!container) return null;

      const config = {
        itemSelector: options.itemSelector || "[data-nav-item]",
        activeClass: options.activeClass || "nav-active",
        loop: options.loop !== false,
        orientation: options.orientation || "vertical", // vertical, horizontal, both
        onSelect: options.onSelect,
        onNavigate: options.onNavigate,
      };

      let currentIndex = -1;

      const getItems = () =>
        Array.from(container.querySelectorAll(config.itemSelector));

      const navigate = (direction) => {
        const items = getItems();
        if (items.length === 0) return;

        // Remove active from current
        if (currentIndex >= 0 && items[currentIndex]) {
          items[currentIndex].classList.remove(config.activeClass);
        }

        // Calculate new index
        if (direction === "next") {
          currentIndex++;
          if (currentIndex >= items.length) {
            currentIndex = config.loop ? 0 : items.length - 1;
          }
        } else if (direction === "prev") {
          currentIndex--;
          if (currentIndex < 0) {
            currentIndex = config.loop ? items.length - 1 : 0;
          }
        } else if (direction === "first") {
          currentIndex = 0;
        } else if (direction === "last") {
          currentIndex = items.length - 1;
        }

        // Add active to new
        if (items[currentIndex]) {
          items[currentIndex].classList.add(config.activeClass);
          items[currentIndex].scrollIntoView({ block: "nearest" });

          if (config.onNavigate) {
            config.onNavigate(items[currentIndex], currentIndex);
          }
        }
      };

      const select = () => {
        const items = getItems();
        if (currentIndex >= 0 && items[currentIndex]) {
          if (config.onSelect) {
            config.onSelect(items[currentIndex], currentIndex);
          }
          items[currentIndex].click();
        }
      };

      // Keyboard handler
      const handler = (e) => {
        const isVertical =
          config.orientation === "vertical" || config.orientation === "both";
        const isHorizontal =
          config.orientation === "horizontal" || config.orientation === "both";

        switch (e.key) {
          case "ArrowDown":
            if (isVertical) {
              e.preventDefault();
              navigate("next");
            }
            break;
          case "ArrowUp":
            if (isVertical) {
              e.preventDefault();
              navigate("prev");
            }
            break;
          case "ArrowRight":
            if (isHorizontal) {
              e.preventDefault();
              navigate("next");
            }
            break;
          case "ArrowLeft":
            if (isHorizontal) {
              e.preventDefault();
              navigate("prev");
            }
            break;
          case "Home":
            e.preventDefault();
            navigate("first");
            break;
          case "End":
            e.preventDefault();
            navigate("last");
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            select();
            break;
        }
      };

      container.addEventListener("keydown", handler);
      container.setAttribute("tabindex", "0");

      return {
        navigate,
        select,
        getCurrentIndex: () => currentIndex,
        setCurrentIndex: (index) => {
          currentIndex = index - 1;
          navigate("next");
        },
        destroy: () => {
          container.removeEventListener("keydown", handler);
        },
      };
    }

    // ============================================================
    // FOCUS TRAP
    // ============================================================

    /**
     * Create focus trap for modal/dialog
     */
    createFocusTrap(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }
      if (!container) return null;

      const config = {
        initialFocus: options.initialFocus,
        returnFocus: options.returnFocus !== false,
        escapeDeactivates: options.escapeDeactivates !== false,
        onEscape: options.onEscape,
      };

      const focusableSelector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      let previousActiveElement = document.activeElement;
      let isActive = false;

      const getFocusableElements = () => {
        return Array.from(container.querySelectorAll(focusableSelector)).filter(
          (el) => el.offsetParent !== null,
        );
      };

      const trapHandler = (e) => {
        if (!isActive || e.key !== "Tab") return;

        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      const escapeHandler = (e) => {
        if (isActive && config.escapeDeactivates && e.key === "Escape") {
          if (config.onEscape) {
            config.onEscape();
          }
          deactivate();
        }
      };

      const activate = () => {
        if (isActive) return;

        isActive = true;
        previousActiveElement = document.activeElement;

        document.addEventListener("keydown", trapHandler);
        document.addEventListener("keydown", escapeHandler);

        // Set initial focus
        requestAnimationFrame(() => {
          if (config.initialFocus) {
            const initial = container.querySelector(config.initialFocus);
            if (initial) {
              initial.focus();
              return;
            }
          }

          const focusable = getFocusableElements();
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            container.setAttribute("tabindex", "-1");
            container.focus();
          }
        });
      };

      const deactivate = () => {
        if (!isActive) return;

        isActive = false;
        document.removeEventListener("keydown", trapHandler);
        document.removeEventListener("keydown", escapeHandler);

        if (config.returnFocus && previousActiveElement) {
          previousActiveElement.focus();
        }
      };

      return {
        activate,
        deactivate,
        isActive: () => isActive,
      };
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelKeyboard();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$hotkey = (keys, cb, opts) => bael.on(keys, cb, opts);
  window.$sequence = (keys, cb, opts) => bael.sequence(keys, cb, opts);
  window.$konami = (cb) => bael.konami(cb);
  window.$keyNav = (container, opts) => bael.createNavigation(container, opts);
  window.$focusTrap = (container, opts) =>
    bael.createFocusTrap(container, opts);
  window.$isKeyPressed = (key) => bael.isPressed(key);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelKeyboard = bael;

  console.log("⌨️ BAEL Keyboard loaded");
})();
