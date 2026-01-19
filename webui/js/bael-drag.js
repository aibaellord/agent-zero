/**
 * BAEL Drag - Drag & Drop System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete drag/drop system:
 * - Native drag/drop
 * - Sortable lists
 * - File drops
 * - Touch support
 * - Drag previews
 */

(function () {
  "use strict";

  class BaelDrag {
    constructor() {
      this.activeDropzones = new Map();
      this.activeDraggables = new Map();
      console.log("🖐️ Bael Drag initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // DRAGGABLE ELEMENTS
    // ═══════════════════════════════════════════════════════════

    makeDraggable(element, options = {}) {
      const el = this._getElement(element);

      el.draggable = true;
      el.classList.add("bael-draggable");

      const handlers = {
        dragstart: (e) => {
          e.dataTransfer.effectAllowed = options.effectAllowed || "move";

          // Set drag data
          const data = options.getData ? options.getData(el) : el.id;
          e.dataTransfer.setData("text/plain", data);
          e.dataTransfer.setData(
            "application/json",
            JSON.stringify({
              type: options.type || "element",
              data: data,
            }),
          );

          // Custom drag image
          if (options.dragImage) {
            const img = options.dragImage(el);
            e.dataTransfer.setDragImage(
              img.element || img,
              img.x || 0,
              img.y || 0,
            );
          }

          el.classList.add("dragging");

          if (options.onStart) {
            options.onStart(e, el, data);
          }
        },

        dragend: (e) => {
          el.classList.remove("dragging");

          if (options.onEnd) {
            options.onEnd(e, el);
          }
        },
      };

      el.addEventListener("dragstart", handlers.dragstart);
      el.addEventListener("dragend", handlers.dragend);

      this.activeDraggables.set(el, handlers);

      return () => this.removeDraggable(el);
    }

    removeDraggable(element) {
      const el = this._getElement(element);
      const handlers = this.activeDraggables.get(el);

      if (handlers) {
        el.removeEventListener("dragstart", handlers.dragstart);
        el.removeEventListener("dragend", handlers.dragend);
        el.draggable = false;
        el.classList.remove("bael-draggable");
        this.activeDraggables.delete(el);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // DROPZONES
    // ═══════════════════════════════════════════════════════════

    makeDropzone(element, options = {}) {
      const el = this._getElement(element);

      el.classList.add("bael-dropzone");

      const handlers = {
        dragover: (e) => {
          e.preventDefault();

          // Check accepted types
          if (options.accept && !this._checkAccept(e, options.accept)) {
            e.dataTransfer.dropEffect = "none";
            return;
          }

          e.dataTransfer.dropEffect = options.dropEffect || "move";
          el.classList.add("dragover");

          if (options.onOver) {
            options.onOver(e, el);
          }
        },

        dragenter: (e) => {
          e.preventDefault();
          el.classList.add("dragover");

          if (options.onEnter) {
            options.onEnter(e, el);
          }
        },

        dragleave: (e) => {
          // Only trigger if leaving the dropzone entirely
          if (!el.contains(e.relatedTarget)) {
            el.classList.remove("dragover");

            if (options.onLeave) {
              options.onLeave(e, el);
            }
          }
        },

        drop: (e) => {
          e.preventDefault();
          el.classList.remove("dragover");

          const data = this._extractDropData(e);

          if (options.onDrop) {
            options.onDrop(e, el, data);
          }
        },
      };

      el.addEventListener("dragover", handlers.dragover);
      el.addEventListener("dragenter", handlers.dragenter);
      el.addEventListener("dragleave", handlers.dragleave);
      el.addEventListener("drop", handlers.drop);

      this.activeDropzones.set(el, handlers);

      return () => this.removeDropzone(el);
    }

    removeDropzone(element) {
      const el = this._getElement(element);
      const handlers = this.activeDropzones.get(el);

      if (handlers) {
        el.removeEventListener("dragover", handlers.dragover);
        el.removeEventListener("dragenter", handlers.dragenter);
        el.removeEventListener("dragleave", handlers.dragleave);
        el.removeEventListener("drop", handlers.drop);
        el.classList.remove("bael-dropzone");
        this.activeDropzones.delete(el);
      }
    }

    _checkAccept(event, accept) {
      const types = event.dataTransfer.types;

      if (typeof accept === "function") {
        return accept(types);
      }

      if (Array.isArray(accept)) {
        return accept.some((type) => types.includes(type));
      }

      return types.includes(accept);
    }

    _extractDropData(event) {
      const data = {
        text: event.dataTransfer.getData("text/plain"),
        html: event.dataTransfer.getData("text/html"),
        files: [...event.dataTransfer.files],
        types: [...event.dataTransfer.types],
      };

      // Try to parse JSON data
      try {
        const jsonStr = event.dataTransfer.getData("application/json");
        if (jsonStr) {
          data.json = JSON.parse(jsonStr);
        }
      } catch (e) {}

      return data;
    }

    // ═══════════════════════════════════════════════════════════
    // SORTABLE LISTS
    // ═══════════════════════════════════════════════════════════

    makeSortable(container, options = {}) {
      const el = this._getElement(container);
      const itemSelector = options.items || ":scope > *";
      let draggedItem = null;
      let placeholder = null;

      const createPlaceholder = (item) => {
        placeholder = document.createElement("div");
        placeholder.className =
          options.placeholderClass || "sortable-placeholder";
        placeholder.style.height = `${item.offsetHeight}px`;
        placeholder.style.margin = getComputedStyle(item).margin;
        return placeholder;
      };

      const getInsertPosition = (e, items) => {
        const y = e.clientY;

        for (let i = 0; i < items.length; i++) {
          const rect = items[i].getBoundingClientRect();
          const middle = rect.top + rect.height / 2;

          if (y < middle) {
            return { element: items[i], position: "before" };
          }
        }

        return { element: items[items.length - 1], position: "after" };
      };

      const handlers = {
        dragstart: (e) => {
          const item = e.target.closest(itemSelector);
          if (!item || item.parentElement !== el) return;

          draggedItem = item;
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.dataset.id || "");

          placeholder = createPlaceholder(item);

          requestAnimationFrame(() => {
            item.classList.add("sorting");
            item.style.opacity = "0.5";
          });

          if (options.onStart) {
            options.onStart(item, this._getItemIndex(el, item, itemSelector));
          }
        },

        dragover: (e) => {
          e.preventDefault();
          if (!draggedItem) return;

          const items = [...el.querySelectorAll(itemSelector)].filter(
            (i) => i !== draggedItem && i !== placeholder,
          );

          if (items.length === 0) {
            if (!placeholder.parentElement) {
              el.appendChild(placeholder);
            }
            return;
          }

          const { element, position } = getInsertPosition(e, items);

          if (position === "before") {
            element.parentElement.insertBefore(placeholder, element);
          } else {
            element.parentElement.insertBefore(
              placeholder,
              element.nextSibling,
            );
          }
        },

        dragend: (e) => {
          if (!draggedItem) return;

          draggedItem.classList.remove("sorting");
          draggedItem.style.opacity = "";

          if (placeholder && placeholder.parentElement) {
            placeholder.parentElement.insertBefore(draggedItem, placeholder);
            placeholder.remove();
          }

          const newIndex = this._getItemIndex(el, draggedItem, itemSelector);

          if (options.onEnd) {
            options.onEnd(draggedItem, newIndex);
          }

          draggedItem = null;
          placeholder = null;
        },
      };

      el.addEventListener("dragstart", handlers.dragstart);
      el.addEventListener("dragover", handlers.dragover);
      el.addEventListener("dragend", handlers.dragend);

      // Make items draggable
      const items = el.querySelectorAll(itemSelector);
      items.forEach((item) => {
        item.draggable = true;
      });

      // Watch for new items
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1 && node.matches(itemSelector)) {
              node.draggable = true;
            }
          }
        }
      });

      observer.observe(el, { childList: true });

      return () => {
        el.removeEventListener("dragstart", handlers.dragstart);
        el.removeEventListener("dragover", handlers.dragover);
        el.removeEventListener("dragend", handlers.dragend);
        observer.disconnect();
      };
    }

    _getItemIndex(container, item, itemSelector) {
      const items = [...container.querySelectorAll(itemSelector)];
      return items.indexOf(item);
    }

    // ═══════════════════════════════════════════════════════════
    // FILE DROP
    // ═══════════════════════════════════════════════════════════

    fileDropzone(element, callback, options = {}) {
      const el = this._getElement(element);

      const handlers = {
        dragover: (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          el.classList.add("file-dragover");
        },

        dragleave: (e) => {
          if (!el.contains(e.relatedTarget)) {
            el.classList.remove("file-dragover");
          }
        },

        drop: async (e) => {
          e.preventDefault();
          el.classList.remove("file-dragover");

          const files = [...e.dataTransfer.files];

          // Filter by accept types
          let filteredFiles = files;
          if (options.accept) {
            const accepts = options.accept.split(",").map((t) => t.trim());
            filteredFiles = files.filter((file) => {
              return accepts.some((accept) => {
                if (accept.startsWith(".")) {
                  return file.name.endsWith(accept);
                }
                if (accept.endsWith("/*")) {
                  return file.type.startsWith(accept.slice(0, -2));
                }
                return file.type === accept;
              });
            });
          }

          // Check file size
          if (options.maxSize) {
            filteredFiles = filteredFiles.filter(
              (f) => f.size <= options.maxSize,
            );
          }

          // Check max files
          if (options.maxFiles) {
            filteredFiles = filteredFiles.slice(0, options.maxFiles);
          }

          // Read file contents if requested
          if (options.readAs) {
            const results = await Promise.all(
              filteredFiles.map((file) => this._readFile(file, options.readAs)),
            );
            callback(results);
          } else {
            callback(filteredFiles);
          }
        },
      };

      // Also handle paste events
      if (options.allowPaste !== false) {
        handlers.paste = async (e) => {
          const files = [...(e.clipboardData?.files || [])];
          if (files.length > 0) {
            e.preventDefault();

            if (options.readAs) {
              const results = await Promise.all(
                files.map((file) => this._readFile(file, options.readAs)),
              );
              callback(results);
            } else {
              callback(files);
            }
          }
        };
        el.addEventListener("paste", handlers.paste);
      }

      el.addEventListener("dragover", handlers.dragover);
      el.addEventListener("dragleave", handlers.dragleave);
      el.addEventListener("drop", handlers.drop);

      return () => {
        el.removeEventListener("dragover", handlers.dragover);
        el.removeEventListener("dragleave", handlers.dragleave);
        el.removeEventListener("drop", handlers.drop);
        if (handlers.paste) {
          el.removeEventListener("paste", handlers.paste);
        }
      };
    }

    _readFile(file, readAs) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            content: reader.result,
            file,
          });
        };

        reader.onerror = reject;

        switch (readAs) {
          case "text":
            reader.readAsText(file);
            break;
          case "dataURL":
          case "base64":
            reader.readAsDataURL(file);
            break;
          case "arrayBuffer":
            reader.readAsArrayBuffer(file);
            break;
          default:
            reader.readAsDataURL(file);
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // TOUCH DRAG
    // ═══════════════════════════════════════════════════════════

    touchDrag(element, options = {}) {
      const el = this._getElement(element);
      let startX, startY, currentX, currentY;
      let isDragging = false;
      let clone = null;

      const touchStart = (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        // Long press to start drag
        el._dragTimeout = setTimeout(() => {
          isDragging = true;

          // Create drag clone
          if (options.clone !== false) {
            clone = el.cloneNode(true);
            clone.style.cssText = `
                            position: fixed;
                            top: ${startY}px;
                            left: ${startX}px;
                            pointer-events: none;
                            opacity: 0.8;
                            z-index: 9999;
                            transform: translate(-50%, -50%);
                        `;
            document.body.appendChild(clone);
          }

          el.classList.add("touch-dragging");

          if (options.onStart) {
            options.onStart(el, { x: startX, y: startY });
          }
        }, options.longPressDelay || 300);
      };

      const touchMove = (e) => {
        if (!isDragging) {
          // Cancel drag if moved before long press
          if (el._dragTimeout) {
            clearTimeout(el._dragTimeout);
          }
          return;
        }

        e.preventDefault();
        const touch = e.touches[0];
        currentX = touch.clientX;
        currentY = touch.clientY;

        if (clone) {
          clone.style.left = `${currentX}px`;
          clone.style.top = `${currentY}px`;
        }

        // Find dropzone under touch
        if (clone) clone.style.display = "none";
        const elementBelow = document.elementFromPoint(currentX, currentY);
        if (clone) clone.style.display = "";

        const dropzone = elementBelow?.closest(".bael-dropzone");

        // Clear previous hover
        document
          .querySelectorAll(".bael-dropzone.touch-dragover")
          .forEach((z) => z.classList.remove("touch-dragover"));

        if (dropzone) {
          dropzone.classList.add("touch-dragover");
        }

        if (options.onMove) {
          options.onMove(el, { x: currentX, y: currentY }, dropzone);
        }
      };

      const touchEnd = (e) => {
        clearTimeout(el._dragTimeout);

        if (!isDragging) return;

        isDragging = false;
        el.classList.remove("touch-dragging");

        // Find dropzone
        if (clone) clone.style.display = "none";
        const elementBelow = document.elementFromPoint(currentX, currentY);
        if (clone) clone.remove();
        clone = null;

        const dropzone = elementBelow?.closest(".bael-dropzone");

        document
          .querySelectorAll(".bael-dropzone.touch-dragover")
          .forEach((z) => z.classList.remove("touch-dragover"));

        if (options.onEnd) {
          options.onEnd(el, { x: currentX, y: currentY }, dropzone);
        }
      };

      el.addEventListener("touchstart", touchStart, { passive: true });
      el.addEventListener("touchmove", touchMove, { passive: false });
      el.addEventListener("touchend", touchEnd);
      el.addEventListener("touchcancel", touchEnd);

      return () => {
        el.removeEventListener("touchstart", touchStart);
        el.removeEventListener("touchmove", touchMove);
        el.removeEventListener("touchend", touchEnd);
        el.removeEventListener("touchcancel", touchEnd);
      };
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    isSupported() {
      return "draggable" in document.createElement("div");
    }

    destroyAll() {
      for (const el of this.activeDraggables.keys()) {
        this.removeDraggable(el);
      }
      for (const el of this.activeDropzones.keys()) {
        this.removeDropzone(el);
      }
    }
  }

  // Initialize
  window.BaelDrag = new BaelDrag();

  // Global shortcuts
  window.$drag = window.BaelDrag;
  window.$draggable = (el, opts) => window.BaelDrag.makeDraggable(el, opts);
  window.$dropzone = (el, opts) => window.BaelDrag.makeDropzone(el, opts);
  window.$sortable = (el, opts) => window.BaelDrag.makeSortable(el, opts);

  console.log("🖐️ Bael Drag ready");
})();
