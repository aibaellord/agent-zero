/**
 * BAEL DOM Utilities - Enhanced Element Manipulation
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete DOM system:
 * - jQuery-like selector
 * - Element creation
 * - Traversal helpers
 * - Attribute helpers
 * - Event delegation
 * - DOM observation
 */

(function () {
  "use strict";

  class BaelDOM {
    constructor() {
      this.observers = new Map();
      console.log("🌳 Bael DOM Utilities initialized");
    }

    // Query selector (returns enhanced element)
    $(selector, context = document) {
      if (selector instanceof HTMLElement) {
        return this.enhance(selector);
      }
      const el = context.querySelector(selector);
      return el ? this.enhance(el) : null;
    }

    // Query all (returns enhanced elements)
    $$(selector, context = document) {
      const elements = context.querySelectorAll(selector);
      return Array.from(elements).map((el) => this.enhance(el));
    }

    // Enhance element with helpers
    enhance(el) {
      if (!el || el._baelEnhanced) return el;
      el._baelEnhanced = true;

      // Chaining methods
      const chain =
        (method) =>
        (...args) => {
          method(...args);
          return el;
        };

      // CSS manipulation
      el.css = (prop, value) => {
        if (typeof prop === "object") {
          Object.assign(el.style, prop);
          return el;
        }
        if (value === undefined) {
          return getComputedStyle(el)[prop];
        }
        el.style[prop] = value;
        return el;
      };

      // Class manipulation
      el.addClass = chain((...classes) => el.classList.add(...classes));
      el.removeClass = chain((...classes) => el.classList.remove(...classes));
      el.toggleClass = chain((cls, force) => el.classList.toggle(cls, force));
      el.hasClass = (cls) => el.classList.contains(cls);

      // Attribute helpers
      el.attr = (name, value) => {
        if (typeof name === "object") {
          for (const [k, v] of Object.entries(name)) {
            if (v === null) el.removeAttribute(k);
            else el.setAttribute(k, v);
          }
          return el;
        }
        if (value === undefined) return el.getAttribute(name);
        if (value === null) el.removeAttribute(name);
        else el.setAttribute(name, value);
        return el;
      };

      el.data = (key, value) => {
        if (value === undefined) {
          const raw = el.dataset[key];
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
        el.dataset[key] =
          typeof value === "object" ? JSON.stringify(value) : value;
        return el;
      };

      el.prop = (name, value) => {
        if (value === undefined) return el[name];
        el[name] = value;
        return el;
      };

      // Content manipulation
      el.html = (content) => {
        if (content === undefined) return el.innerHTML;
        el.innerHTML = content;
        return el;
      };

      el.text = (content) => {
        if (content === undefined) return el.textContent;
        el.textContent = content;
        return el;
      };

      el.val = (value) => {
        if (value === undefined) return el.value;
        el.value = value;
        return el;
      };

      // Traversal
      el.parent = () => this.enhance(el.parentElement);
      el.children = () => Array.from(el.children).map((c) => this.enhance(c));
      el.first = () => this.enhance(el.firstElementChild);
      el.last = () => this.enhance(el.lastElementChild);
      el.next = () => this.enhance(el.nextElementSibling);
      el.prev = () => this.enhance(el.previousElementSibling);
      el.siblings = () =>
        Array.from(el.parentElement?.children || [])
          .filter((c) => c !== el)
          .map((c) => this.enhance(c));

      el.closest = (selector) => {
        const found = el.closest(selector);
        return found ? this.enhance(found) : null;
      };

      el.find = (selector) => this.$(selector, el);
      el.findAll = (selector) => this.$$(selector, el);

      // Visibility
      el.show = chain(() => (el.style.display = ""));
      el.hide = chain(() => (el.style.display = "none"));
      el.toggle = chain((show) => {
        const visible = show ?? el.style.display === "none";
        el.style.display = visible ? "" : "none";
      });
      el.isVisible = () => {
        return !!(
          el.offsetWidth ||
          el.offsetHeight ||
          el.getClientRects().length
        );
      };

      // Dimensions
      el.width = (value) => {
        if (value === undefined) return el.offsetWidth;
        el.style.width = typeof value === "number" ? `${value}px` : value;
        return el;
      };
      el.height = (value) => {
        if (value === undefined) return el.offsetHeight;
        el.style.height = typeof value === "number" ? `${value}px` : value;
        return el;
      };
      el.offset = () => {
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        };
      };
      el.position = () => ({ top: el.offsetTop, left: el.offsetLeft });

      // DOM manipulation
      el.append = chain((...nodes) => {
        nodes.forEach((node) => {
          if (typeof node === "string") {
            el.insertAdjacentHTML("beforeend", node);
          } else {
            el.appendChild(node);
          }
        });
      });

      el.prepend = chain((...nodes) => {
        nodes.reverse().forEach((node) => {
          if (typeof node === "string") {
            el.insertAdjacentHTML("afterbegin", node);
          } else {
            el.insertBefore(node, el.firstChild);
          }
        });
      });

      el.before = chain((...nodes) => {
        nodes.forEach((node) => {
          if (typeof node === "string") {
            el.insertAdjacentHTML("beforebegin", node);
          } else {
            el.parentNode?.insertBefore(node, el);
          }
        });
      });

      el.after = chain((...nodes) => {
        nodes.reverse().forEach((node) => {
          if (typeof node === "string") {
            el.insertAdjacentHTML("afterend", node);
          } else {
            el.parentNode?.insertBefore(node, el.nextSibling);
          }
        });
      });

      el.replaceWith = (...nodes) => {
        const parent = el.parentNode;
        if (!parent) return;
        nodes.forEach((node, i) => {
          if (typeof node === "string") {
            const temp = document.createElement("div");
            temp.innerHTML = node;
            node = temp.firstChild;
          }
          if (i === 0) {
            parent.replaceChild(node, el);
          } else {
            parent.insertBefore(node, el.nextSibling);
          }
        });
      };

      el.remove = () => el.parentNode?.removeChild(el);
      el.empty = chain(() => (el.innerHTML = ""));
      el.clone = (deep = true) => this.enhance(el.cloneNode(deep));

      // Events (simplified)
      el.on = (event, handler, options) => {
        el.addEventListener(event, handler, options);
        return el;
      };
      el.off = (event, handler, options) => {
        el.removeEventListener(event, handler, options);
        return el;
      };
      el.once = (event, handler) => {
        el.addEventListener(event, handler, { once: true });
        return el;
      };
      el.trigger = (event, detail) => {
        el.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
        return el;
      };

      // Focus
      el.focus = chain(() => el.focus());
      el.blur = chain(() => el.blur());
      el.hasFocus = () => document.activeElement === el;

      // Scroll
      el.scrollTo = chain((options) => el.scrollTo(options));
      el.scrollIntoView = chain((options) => el.scrollIntoView(options));

      return el;
    }

    // Create element
    create(tag, attrs = {}, children = []) {
      const el = document.createElement(tag);

      for (const [key, value] of Object.entries(attrs)) {
        if (key === "class" || key === "className") {
          el.className = Array.isArray(value) ? value.join(" ") : value;
        } else if (key === "style" && typeof value === "object") {
          Object.assign(el.style, value);
        } else if (key === "data" && typeof value === "object") {
          for (const [k, v] of Object.entries(value)) {
            el.dataset[k] = typeof v === "object" ? JSON.stringify(v) : v;
          }
        } else if (key.startsWith("on") && typeof value === "function") {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === "html") {
          el.innerHTML = value;
        } else if (key === "text") {
          el.textContent = value;
        } else {
          el.setAttribute(key, value);
        }
      }

      if (!Array.isArray(children)) {
        children = [children];
      }

      children.forEach((child) => {
        if (typeof child === "string") {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          el.appendChild(child);
        }
      });

      return this.enhance(el);
    }

    // Create from HTML string
    createFromHTML(html) {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      const content = template.content;
      if (content.childNodes.length === 1) {
        return this.enhance(content.firstChild);
      }
      return Array.from(content.childNodes).map((n) =>
        n.nodeType === Node.ELEMENT_NODE ? this.enhance(n) : n,
      );
    }

    // Event delegation
    delegate(parent, event, selector, handler) {
      const parentEl =
        typeof parent === "string" ? document.querySelector(parent) : parent;
      if (!parentEl) return () => {};

      const delegated = (e) => {
        const target = e.target.closest(selector);
        if (target && parentEl.contains(target)) {
          handler.call(target, e, target);
        }
      };

      parentEl.addEventListener(event, delegated);
      return () => parentEl.removeEventListener(event, delegated);
    }

    // Observe element
    observe(element, callback, options = {}) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return null;

      const id = "obs_" + Math.random().toString(36).substr(2, 9);
      const observer = new MutationObserver((mutations) => {
        callback(mutations, el);
      });

      observer.observe(el, {
        childList: options.childList ?? true,
        attributes: options.attributes ?? true,
        characterData: options.characterData ?? false,
        subtree: options.subtree ?? false,
        attributeFilter: options.attributeFilter,
      });

      this.observers.set(id, observer);

      return {
        id,
        disconnect: () => {
          observer.disconnect();
          this.observers.delete(id);
        },
      };
    }

    // Observe resize
    observeResize(element, callback) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return null;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          callback({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
            element: entry.target,
          });
        }
      });

      observer.observe(el);

      return {
        disconnect: () => observer.disconnect(),
      };
    }

    // Observe intersection
    observeIntersection(element, callback, options = {}) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            callback({
              isIntersecting: entry.isIntersecting,
              ratio: entry.intersectionRatio,
              element: entry.target,
            });
          });
        },
        {
          root: options.root || null,
          rootMargin: options.rootMargin || "0px",
          threshold: options.threshold || 0,
        },
      );

      observer.observe(el);

      return {
        disconnect: () => observer.disconnect(),
      };
    }

    // Wait for element
    waitFor(selector, options = {}) {
      const { timeout = 5000, parent = document } = options;

      return new Promise((resolve, reject) => {
        const el = parent.querySelector(selector);
        if (el) {
          resolve(this.enhance(el));
          return;
        }

        const observer = new MutationObserver((_, obs) => {
          const found = parent.querySelector(selector);
          if (found) {
            obs.disconnect();
            clearTimeout(timeoutId);
            resolve(this.enhance(found));
          }
        });

        const timeoutId = setTimeout(() => {
          observer.disconnect();
          reject(
            new Error(`Element ${selector} not found within ${timeout}ms`),
          );
        }, timeout);

        observer.observe(parent, { childList: true, subtree: true });
      });
    }

    // Ready helper
    ready(callback) {
      if (document.readyState !== "loading") {
        callback();
      } else {
        document.addEventListener("DOMContentLoaded", callback);
      }
    }

    // Escape HTML
    escapeHTML(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    // Parse HTML entities
    unescapeHTML(str) {
      const div = document.createElement("div");
      div.innerHTML = str;
      return div.textContent;
    }

    // Get/set scroll position
    scroll(x, y) {
      if (x === undefined && y === undefined) {
        return { x: window.scrollX, y: window.scrollY };
      }
      window.scrollTo(x ?? window.scrollX, y ?? window.scrollY);
    }

    // Smooth scroll to element
    scrollToElement(element, options = {}) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return;

      const { offset = 0, behavior = "smooth" } = options;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior });
    }

    // Get viewport dimensions
    viewport() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
    }

    // Check if element is in viewport
    inViewport(element, options = {}) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return false;

      const { partial = true, offset = 0 } = options;
      const rect = el.getBoundingClientRect();

      if (partial) {
        return (
          rect.bottom >= offset &&
          rect.right >= offset &&
          rect.top <= window.innerHeight - offset &&
          rect.left <= window.innerWidth - offset
        );
      }

      return (
        rect.top >= offset &&
        rect.left >= offset &&
        rect.bottom <= window.innerHeight - offset &&
        rect.right <= window.innerWidth - offset
      );
    }

    // Copy styles
    copyStyles(source, target, properties = []) {
      const sourceEl =
        typeof source === "string" ? document.querySelector(source) : source;
      const targetEl =
        typeof target === "string" ? document.querySelector(target) : target;
      if (!sourceEl || !targetEl) return;

      const computed = getComputedStyle(sourceEl);
      if (properties.length === 0) {
        properties = Array.from(computed);
      }

      properties.forEach((prop) => {
        targetEl.style[prop] = computed[prop];
      });
    }

    // Get all focusable elements
    getFocusable(container = document) {
      const selector = [
        "a[href]",
        "button:not([disabled])",
        'input:not([disabled]):not([type="hidden"])',
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(", ");

      return Array.from(container.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null,
      );
    }

    // Focus trap
    trapFocus(container) {
      const focusable = this.getFocusable(container);
      if (focusable.length === 0) return () => {};

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const handler = (e) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      container.addEventListener("keydown", handler);
      first.focus();

      return () => container.removeEventListener("keydown", handler);
    }
  }

  // Initialize
  window.BaelDOM = new BaelDOM();

  // Global shortcuts
  window.$el = (selector, context) => window.BaelDOM.$(selector, context);
  window.$$el = (selector, context) => window.BaelDOM.$$(selector, context);
  window.$create = (tag, attrs, children) =>
    window.BaelDOM.create(tag, attrs, children);
})();
