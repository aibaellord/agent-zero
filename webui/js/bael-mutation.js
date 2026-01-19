/**
 * BAEL Mutation - Mutation Observer System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete DOM mutation system:
 * - Attribute watching
 * - Child changes
 * - Text content
 * - DOM diffing
 * - Change batching
 */

(function () {
  "use strict";

  class BaelMutation {
    constructor() {
      this.observers = new Map();
      console.log("🧬 Bael Mutation initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // BASIC OBSERVATION
    // ═══════════════════════════════════════════════════════════

    observe(element, callback, options = {}) {
      const el = this._getElement(element);

      if (!el) {
        console.warn("Element not found:", element);
        return () => {};
      }

      const config = {
        childList: options.childList !== false,
        subtree: options.subtree !== false,
        attributes: options.attributes !== false,
        characterData: options.characterData || false,
        attributeOldValue: options.attributeOldValue || false,
        characterDataOldValue: options.characterDataOldValue || false,
        attributeFilter: options.attributeFilter,
      };

      const observer = new MutationObserver((mutations) => {
        const parsed = this._parseMutations(mutations);
        callback(parsed, mutations);
      });

      observer.observe(el, config);
      this.observers.set(el, observer);

      return () => this.disconnect(el);
    }

    disconnect(element) {
      const el = this._getElement(element);
      const observer = this.observers.get(el);

      if (observer) {
        observer.disconnect();
        this.observers.delete(el);
      }
    }

    _parseMutations(mutations) {
      const result = {
        added: [],
        removed: [],
        attributeChanges: [],
        textChanges: [],
        count: mutations.length,
      };

      for (const mutation of mutations) {
        switch (mutation.type) {
          case "childList":
            result.added.push(...mutation.addedNodes);
            result.removed.push(...mutation.removedNodes);
            break;

          case "attributes":
            result.attributeChanges.push({
              target: mutation.target,
              name: mutation.attributeName,
              oldValue: mutation.oldValue,
              newValue: mutation.target.getAttribute(mutation.attributeName),
            });
            break;

          case "characterData":
            result.textChanges.push({
              target: mutation.target,
              oldValue: mutation.oldValue,
              newValue: mutation.target.textContent,
            });
            break;
        }
      }

      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // SPECIALIZED OBSERVERS
    // ═══════════════════════════════════════════════════════════

    onChildChange(element, callback, options = {}) {
      return this.observe(
        element,
        (changes) => {
          if (changes.added.length > 0 || changes.removed.length > 0) {
            callback({
              added: changes.added,
              removed: changes.removed,
            });
          }
        },
        {
          childList: true,
          subtree: options.deep || false,
          attributes: false,
        },
      );
    }

    onAdd(element, callback, options = {}) {
      return this.observe(
        element,
        (changes) => {
          if (changes.added.length > 0) {
            // Filter to elements only
            const elements = [...changes.added].filter((n) => n.nodeType === 1);
            if (elements.length > 0) {
              callback(elements);
            }
          }
        },
        {
          childList: true,
          subtree: options.deep || false,
          attributes: false,
        },
      );
    }

    onRemove(element, callback, options = {}) {
      return this.observe(
        element,
        (changes) => {
          if (changes.removed.length > 0) {
            const elements = [...changes.removed].filter(
              (n) => n.nodeType === 1,
            );
            if (elements.length > 0) {
              callback(elements);
            }
          }
        },
        {
          childList: true,
          subtree: options.deep || false,
          attributes: false,
        },
      );
    }

    onAttributeChange(element, callback, options = {}) {
      return this.observe(
        element,
        (changes) => {
          if (changes.attributeChanges.length > 0) {
            for (const change of changes.attributeChanges) {
              callback(change);
            }
          }
        },
        {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: options.filter,
          childList: false,
        },
      );
    }

    onTextChange(element, callback) {
      return this.observe(
        element,
        (changes) => {
          if (changes.textChanges.length > 0) {
            for (const change of changes.textChanges) {
              callback(change);
            }
          }
        },
        {
          characterData: true,
          characterDataOldValue: true,
          subtree: true,
          childList: false,
          attributes: false,
        },
      );
    }

    // ═══════════════════════════════════════════════════════════
    // ATTRIBUTE WATCHING
    // ═══════════════════════════════════════════════════════════

    watchAttribute(element, attribute, callback) {
      const el = this._getElement(element);
      let lastValue = el.getAttribute(attribute);

      return this.onAttributeChange(
        el,
        (change) => {
          if (change.name === attribute && change.newValue !== lastValue) {
            callback({
              oldValue: lastValue,
              newValue: change.newValue,
            });
            lastValue = change.newValue;
          }
        },
        {
          filter: [attribute],
        },
      );
    }

    watchClass(element, callback) {
      const el = this._getElement(element);
      let lastClasses = new Set(el.classList);

      return this.watchAttribute(el, "class", (change) => {
        const currentClasses = new Set(el.classList);

        const added = [...currentClasses].filter((c) => !lastClasses.has(c));
        const removed = [...lastClasses].filter((c) => !currentClasses.has(c));

        if (added.length > 0 || removed.length > 0) {
          callback({ added, removed, current: [...currentClasses] });
        }

        lastClasses = currentClasses;
      });
    }

    watchStyle(element, properties, callback) {
      const el = this._getElement(element);
      let lastValues = {};

      properties.forEach((prop) => {
        lastValues[prop] = getComputedStyle(el)[prop];
      });

      return this.watchAttribute(el, "style", () => {
        const changes = [];

        for (const prop of properties) {
          const current = getComputedStyle(el)[prop];
          if (current !== lastValues[prop]) {
            changes.push({
              property: prop,
              oldValue: lastValues[prop],
              newValue: current,
            });
            lastValues[prop] = current;
          }
        }

        if (changes.length > 0) {
          callback(changes);
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // SELECTOR WATCHING
    // ═══════════════════════════════════════════════════════════

    watchSelector(root, selector, callback) {
      const el = this._getElement(root);
      let matched = new Set(el.querySelectorAll(selector));

      // Initial callback
      if (matched.size > 0) {
        callback({
          added: [...matched],
          removed: [],
          current: [...matched],
        });
      }

      return this.onChildChange(
        el,
        () => {
          const current = new Set(el.querySelectorAll(selector));

          const added = [...current].filter((n) => !matched.has(n));
          const removed = [...matched].filter((n) => !current.has(n));

          if (added.length > 0 || removed.length > 0) {
            callback({
              added,
              removed,
              current: [...current],
            });
          }

          matched = current;
        },
        { deep: true },
      );
    }

    waitFor(root, selector, options = {}) {
      return new Promise((resolve, reject) => {
        const el = this._getElement(root);

        // Check if already exists
        const existing = el.querySelector(selector);
        if (existing) {
          resolve(existing);
          return;
        }

        // Timeout
        let timeoutId;
        if (options.timeout) {
          timeoutId = setTimeout(() => {
            disconnect();
            reject(new Error(`Timeout waiting for ${selector}`));
          }, options.timeout);
        }

        // Watch for addition
        const disconnect = this.watchSelector(el, selector, ({ added }) => {
          if (added.length > 0) {
            disconnect();
            if (timeoutId) clearTimeout(timeoutId);
            resolve(added[0]);
          }
        });
      });
    }

    // ═══════════════════════════════════════════════════════════
    // BATCHING
    // ═══════════════════════════════════════════════════════════

    batchObserve(element, callback, options = {}) {
      const el = this._getElement(element);
      const delay = options.delay || 100;
      let batch = {
        added: [],
        removed: [],
        attributeChanges: [],
        textChanges: [],
      };
      let timeoutId = null;

      return this.observe(
        el,
        (changes) => {
          // Accumulate changes
          batch.added.push(...changes.added);
          batch.removed.push(...changes.removed);
          batch.attributeChanges.push(...changes.attributeChanges);
          batch.textChanges.push(...changes.textChanges);

          // Debounce callback
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          timeoutId = setTimeout(() => {
            callback(batch);

            // Reset batch
            batch = {
              added: [],
              removed: [],
              attributeChanges: [],
              textChanges: [],
            };
            timeoutId = null;
          }, delay);
        },
        options,
      );
    }

    // ═══════════════════════════════════════════════════════════
    // DOM SNAPSHOTS
    // ═══════════════════════════════════════════════════════════

    snapshot(element) {
      const el = this._getElement(element);

      return {
        html: el.innerHTML,
        text: el.textContent,
        attributes: this._getAttributes(el),
        children: [...el.children].map((child) => ({
          tag: child.tagName.toLowerCase(),
          id: child.id,
          classes: [...child.classList],
          attributes: this._getAttributes(child),
        })),
        timestamp: Date.now(),
      };
    }

    compare(element, snapshot) {
      const current = this.snapshot(element);

      return {
        htmlChanged: current.html !== snapshot.html,
        textChanged: current.text !== snapshot.text,
        attributesChanged:
          JSON.stringify(current.attributes) !==
          JSON.stringify(snapshot.attributes),
        childCountChanged: current.children.length !== snapshot.children.length,
        current,
        previous: snapshot,
      };
    }

    _getAttributes(element) {
      const attrs = {};
      for (const attr of element.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    onceAdded(root, selector, callback) {
      const disconnect = this.watchSelector(root, selector, ({ added }) => {
        if (added.length > 0) {
          disconnect();
          callback(added[0]);
        }
      });
      return disconnect;
    }

    track(element, options = {}) {
      const el = this._getElement(element);
      const history = [];
      const maxHistory = options.maxHistory || 100;

      const disconnect = this.observe(
        el,
        (changes, mutations) => {
          history.push({
            changes,
            mutations,
            timestamp: Date.now(),
          });

          if (history.length > maxHistory) {
            history.shift();
          }

          if (options.onChange) {
            options.onChange(changes, history);
          }
        },
        options,
      );

      return {
        getHistory: () => [...history],
        clear: () => (history.length = 0),
        destroy: disconnect,
      };
    }

    disconnectAll() {
      for (const [, observer] of this.observers) {
        observer.disconnect();
      }
      this.observers.clear();
    }
  }

  // Initialize
  window.BaelMutation = new BaelMutation();

  // Global shortcuts
  window.$mutation = window.BaelMutation;
  window.$watchDOM = (el, cb, opts) =>
    window.BaelMutation.observe(el, cb, opts);
  window.$waitForElement = (root, sel, opts) =>
    window.BaelMutation.waitFor(root, sel, opts);

  console.log("🧬 Bael Mutation ready");
})();
