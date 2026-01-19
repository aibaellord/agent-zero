/**
 * BAEL Drag & Drop Manager - Universal Drag Operations
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete drag-and-drop system:
 * - Native drag API support
 * - File drop zones
 * - Sortable lists
 * - Draggable items
 * - Custom ghost images
 * - Multi-select drag
 * - Touch support
 */

(function () {
  "use strict";

  class BaelDragDrop {
    constructor() {
      this.activeDrag = null;
      this.dropZones = new Map();
      this.draggables = new Map();
      this.sortables = new Map();
      this.ghostElement = null;
      this.touchDrag = null;
      this.init();
    }

    init() {
      this.bindGlobalEvents();
      this.observeDOM();
      this.addStyles();
      console.log("🖱️ Bael Drag & Drop initialized");
    }

    // Bind global events
    bindGlobalEvents() {
      // Prevent default drag behaviors
      document.addEventListener("dragover", (e) => e.preventDefault());
      document.addEventListener("drop", (e) => e.preventDefault());
    }

    // Create a draggable element
    makeDraggable(element, options = {}) {
      const id = options.id || this.generateId();
      const config = {
        id,
        element,
        data: options.data || null,
        handle: options.handle || null,
        disabled: options.disabled || false,
        ghostClass: options.ghostClass || "bael-drag-ghost",
        dragClass: options.dragClass || "bael-dragging",
        onStart: options.onStart || (() => {}),
        onMove: options.onMove || (() => {}),
        onEnd: options.onEnd || (() => {}),
      };

      element.setAttribute("draggable", "true");
      element.dataset.baelDraggable = id;

      // Handle drag start
      const handleStart = (e) => {
        if (config.disabled) {
          e.preventDefault();
          return;
        }

        // Check if starting from handle
        if (config.handle) {
          const handle = element.querySelector(config.handle);
          if (handle && !handle.contains(e.target)) {
            e.preventDefault();
            return;
          }
        }

        this.activeDrag = {
          id,
          element,
          data: config.data,
          startX: e.clientX,
          startY: e.clientY,
        };

        element.classList.add(config.dragClass);

        // Set drag data
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify(config.data || { id }),
        );

        // Custom ghost image
        if (options.ghost) {
          const ghost =
            typeof options.ghost === "function"
              ? options.ghost(element)
              : element.cloneNode(true);
          ghost.classList.add(config.ghostClass);
          document.body.appendChild(ghost);
          e.dataTransfer.setDragImage(ghost, 0, 0);
          this.ghostElement = ghost;
          setTimeout(() => ghost.remove(), 0);
        }

        config.onStart({ element, data: config.data, event: e });
      };

      const handleDrag = (e) => {
        if (!this.activeDrag) return;
        config.onMove({
          element,
          data: config.data,
          x: e.clientX,
          y: e.clientY,
          event: e,
        });
      };

      const handleEnd = (e) => {
        if (!this.activeDrag) return;

        element.classList.remove(config.dragClass);
        config.onEnd({ element, data: config.data, event: e });

        this.activeDrag = null;
      };

      element.addEventListener("dragstart", handleStart);
      element.addEventListener("drag", handleDrag);
      element.addEventListener("dragend", handleEnd);

      // Touch support
      this.addTouchSupport(element, config);

      this.draggables.set(id, {
        ...config,
        destroy: () => {
          element.removeAttribute("draggable");
          delete element.dataset.baelDraggable;
          element.removeEventListener("dragstart", handleStart);
          element.removeEventListener("drag", handleDrag);
          element.removeEventListener("dragend", handleEnd);
          this.draggables.delete(id);
        },
      });

      return id;
    }

    // Create a drop zone
    createDropZone(element, options = {}) {
      const id = options.id || this.generateId();
      const config = {
        id,
        element,
        accept: options.accept || "*",
        disabled: options.disabled || false,
        activeClass: options.activeClass || "bael-drop-active",
        hoverClass: options.hoverClass || "bael-drop-hover",
        onEnter: options.onEnter || (() => {}),
        onLeave: options.onLeave || (() => {}),
        onDrop: options.onDrop || (() => {}),
        onFile: options.onFile || null,
      };

      element.dataset.baelDropzone = id;

      const handleDragEnter = (e) => {
        if (config.disabled) return;
        e.preventDefault();
        element.classList.add(config.hoverClass);
        config.onEnter({ element, event: e });
      };

      const handleDragOver = (e) => {
        if (config.disabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      };

      const handleDragLeave = (e) => {
        // Only if actually leaving the element
        if (!element.contains(e.relatedTarget)) {
          element.classList.remove(config.hoverClass);
          config.onLeave({ element, event: e });
        }
      };

      const handleDrop = (e) => {
        if (config.disabled) return;
        e.preventDefault();
        element.classList.remove(config.hoverClass);

        // Handle file drops
        if (e.dataTransfer.files.length > 0 && config.onFile) {
          config.onFile({
            element,
            files: Array.from(e.dataTransfer.files),
            event: e,
          });
          return;
        }

        // Handle data drops
        let data = null;
        try {
          data = JSON.parse(e.dataTransfer.getData("text/plain"));
        } catch {
          data = e.dataTransfer.getData("text/plain");
        }

        config.onDrop({
          element,
          data,
          draggedElement: this.activeDrag?.element,
          event: e,
        });
      };

      element.addEventListener("dragenter", handleDragEnter);
      element.addEventListener("dragover", handleDragOver);
      element.addEventListener("dragleave", handleDragLeave);
      element.addEventListener("drop", handleDrop);

      this.dropZones.set(id, {
        ...config,
        destroy: () => {
          delete element.dataset.baelDropzone;
          element.removeEventListener("dragenter", handleDragEnter);
          element.removeEventListener("dragover", handleDragOver);
          element.removeEventListener("dragleave", handleDragLeave);
          element.removeEventListener("drop", handleDrop);
          this.dropZones.delete(id);
        },
      });

      return id;
    }

    // Create a file drop zone
    createFileDropZone(element, options = {}) {
      const id = this.createDropZone(element, {
        ...options,
        onFile: (result) => {
          if (options.accept) {
            const accepted = options.accept.split(",").map((t) => t.trim());
            result.files = result.files.filter((file) => {
              return accepted.some((type) => {
                if (type.endsWith("/*")) {
                  return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type || file.name.endsWith(type);
              });
            });
          }

          if (options.maxSize) {
            result.files = result.files.filter(
              (f) => f.size <= options.maxSize,
            );
          }

          if (options.maxFiles) {
            result.files = result.files.slice(0, options.maxFiles);
          }

          if (result.files.length > 0) {
            options.onDrop?.(result);
          }
        },
      });

      // Add visual styling
      element.classList.add("bael-file-dropzone");

      return id;
    }

    // Create a sortable list
    makeSortable(container, options = {}) {
      const id = options.id || this.generateId();
      const config = {
        id,
        container,
        itemSelector: options.itemSelector || ".sortable-item",
        handle: options.handle || null,
        group: options.group || null,
        animation: options.animation !== false,
        disabled: options.disabled || false,
        onSort: options.onSort || (() => {}),
        onChange: options.onChange || (() => {}),
      };

      container.dataset.baelSortable = id;
      container.classList.add("bael-sortable");

      let placeholder = null;
      let draggedItem = null;

      const getItems = () =>
        Array.from(container.querySelectorAll(config.itemSelector));

      const createPlaceholder = (height) => {
        const el = document.createElement("div");
        el.className = "bael-sort-placeholder";
        el.style.height = `${height}px`;
        return el;
      };

      const getClosestItem = (y) => {
        const items = getItems().filter(
          (item) => item !== draggedItem && item !== placeholder,
        );
        let closest = null;
        let closestOffset = Number.NEGATIVE_INFINITY;

        for (const item of items) {
          const rect = item.getBoundingClientRect();
          const offset = y - (rect.top + rect.height / 2);

          if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closest = item;
          }
        }

        return closest;
      };

      const handleDragStart = (e) => {
        if (config.disabled) return;

        const item = e.target.closest(config.itemSelector);
        if (!item || !container.contains(item)) return;

        // Handle check
        if (config.handle) {
          const handle = item.querySelector(config.handle);
          if (!handle?.contains(e.target)) return;
        }

        draggedItem = item;
        const rect = item.getBoundingClientRect();
        placeholder = createPlaceholder(rect.height);

        item.classList.add("bael-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.dataset.id || "");

        setTimeout(() => {
          item.style.display = "none";
          container.insertBefore(placeholder, item);
        }, 0);

        config.onSort({ type: "start", item, index: getItems().indexOf(item) });
      };

      const handleDragOver = (e) => {
        if (!draggedItem) return;
        e.preventDefault();

        const closest = getClosestItem(e.clientY);

        if (closest) {
          container.insertBefore(placeholder, closest);
        } else {
          container.appendChild(placeholder);
        }
      };

      const handleDrop = (e) => {
        e.preventDefault();
      };

      const handleDragEnd = () => {
        if (!draggedItem) return;

        draggedItem.style.display = "";
        draggedItem.classList.remove("bael-dragging");

        if (placeholder?.parentNode) {
          container.insertBefore(draggedItem, placeholder);
          placeholder.remove();
        }

        const newOrder = getItems().map((item, index) => ({
          element: item,
          id: item.dataset.id,
          index,
        }));

        config.onChange({ order: newOrder });
        config.onSort({ type: "end", item: draggedItem, order: newOrder });

        draggedItem = null;
        placeholder = null;
      };

      // Set items as draggable
      getItems().forEach((item) => {
        item.setAttribute("draggable", "true");
      });

      container.addEventListener("dragstart", handleDragStart);
      container.addEventListener("dragover", handleDragOver);
      container.addEventListener("drop", handleDrop);
      container.addEventListener("dragend", handleDragEnd);

      // Observer for new items
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.matches?.(config.itemSelector)) {
              node.setAttribute("draggable", "true");
            }
          });
        });
      });

      observer.observe(container, { childList: true });

      this.sortables.set(id, {
        ...config,
        getOrder: () =>
          getItems().map((item, i) => ({
            element: item,
            id: item.dataset.id,
            index: i,
          })),
        destroy: () => {
          observer.disconnect();
          delete container.dataset.baelSortable;
          container.classList.remove("bael-sortable");
          container.removeEventListener("dragstart", handleDragStart);
          container.removeEventListener("dragover", handleDragOver);
          container.removeEventListener("drop", handleDrop);
          container.removeEventListener("dragend", handleDragEnd);
          this.sortables.delete(id);
        },
      });

      return id;
    }

    // Add touch support for mobile
    addTouchSupport(element, config) {
      let clone = null;
      let startX, startY;

      const handleTouchStart = (e) => {
        if (config.disabled) return;
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        // Create clone for visual feedback
        clone = element.cloneNode(true);
        clone.classList.add("bael-touch-ghost");
        clone.style.cssText = `
                    position: fixed;
                    left: ${touch.clientX}px;
                    top: ${touch.clientY}px;
                    opacity: 0.8;
                    z-index: 99999;
                    pointer-events: none;
                    transform: translate(-50%, -50%);
                `;
        document.body.appendChild(clone);

        this.touchDrag = { element, data: config.data };
        element.classList.add(config.dragClass);
        config.onStart({ element, data: config.data, event: e });
      };

      const handleTouchMove = (e) => {
        if (!clone) return;
        e.preventDefault();

        const touch = e.touches[0];
        clone.style.left = `${touch.clientX}px`;
        clone.style.top = `${touch.clientY}px`;

        config.onMove({
          element,
          data: config.data,
          x: touch.clientX,
          y: touch.clientY,
          event: e,
        });

        // Find drop target
        clone.style.display = "none";
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        clone.style.display = "";

        // Highlight drop zones
        this.dropZones.forEach((zone) => {
          if (zone.element.contains(target)) {
            zone.element.classList.add(zone.hoverClass);
          } else {
            zone.element.classList.remove(zone.hoverClass);
          }
        });
      };

      const handleTouchEnd = (e) => {
        if (!clone) return;

        const touch = e.changedTouches[0];
        clone.remove();
        clone = null;

        element.classList.remove(config.dragClass);

        // Find drop target
        const target = document.elementFromPoint(touch.clientX, touch.clientY);

        this.dropZones.forEach((zone) => {
          zone.element.classList.remove(zone.hoverClass);
          if (zone.element.contains(target) && !zone.disabled) {
            zone.onDrop({
              element: zone.element,
              data: config.data,
              draggedElement: element,
              event: e,
            });
          }
        });

        config.onEnd({ element, data: config.data, event: e });
        this.touchDrag = null;
      };

      element.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      element.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      element.addEventListener("touchend", handleTouchEnd);
    }

    // DOM observer for auto-setup
    observeDOM() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            // Auto-setup draggables
            if (node.dataset?.draggable !== undefined) {
              this.makeDraggable(
                node,
                JSON.parse(node.dataset.draggable || "{}"),
              );
            }

            // Auto-setup drop zones
            if (node.dataset?.dropzone !== undefined) {
              this.createDropZone(
                node,
                JSON.parse(node.dataset.dropzone || "{}"),
              );
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Generate unique ID
    generateId() {
      return "dd_" + Math.random().toString(36).substr(2, 9);
    }

    // Get sortable instance
    getSortable(id) {
      return this.sortables.get(id);
    }

    // Get drop zone instance
    getDropZone(id) {
      return this.dropZones.get(id);
    }

    // Destroy a draggable
    destroyDraggable(id) {
      this.draggables.get(id)?.destroy();
    }

    // Destroy a drop zone
    destroyDropZone(id) {
      this.dropZones.get(id)?.destroy();
    }

    // Destroy a sortable
    destroySortable(id) {
      this.sortables.get(id)?.destroy();
    }

    // Add styles
    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                [draggable="true"] {
                    cursor: grab;
                    user-select: none;
                }

                .bael-dragging {
                    opacity: 0.5 !important;
                    cursor: grabbing !important;
                }

                .bael-drag-ghost {
                    pointer-events: none;
                    opacity: 0.8;
                }

                .bael-drop-hover {
                    background: rgba(99, 102, 241, 0.1) !important;
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
                }

                .bael-file-dropzone {
                    border: 2px dashed var(--bael-border, #444);
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    transition: all 0.2s;
                }

                .bael-file-dropzone.bael-drop-hover {
                    border-style: solid;
                    background: rgba(99, 102, 241, 0.1);
                }

                .bael-sortable {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bael-sort-placeholder {
                    background: rgba(99, 102, 241, 0.2);
                    border: 2px dashed #6366f1;
                    border-radius: 8px;
                    transition: height 0.2s;
                }

                .bael-touch-ghost {
                    pointer-events: none !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    border-radius: 8px;
                }

                .sortable-item {
                    padding: 12px;
                    background: var(--bael-surface, #2a2a2a);
                    border-radius: 8px;
                    cursor: grab;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .sortable-item:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }

                .sortable-item.bael-dragging {
                    cursor: grabbing;
                }
            `;
      document.head.appendChild(style);
    }
  }

  // Initialize
  window.BaelDragDrop = new BaelDragDrop();

  // Global shortcuts
  window.$drag = (element, options) =>
    window.BaelDragDrop.makeDraggable(element, options);
  window.$dropzone = (element, options) =>
    window.BaelDragDrop.createDropZone(element, options);
  window.$sortable = (container, options) =>
    window.BaelDragDrop.makeSortable(container, options);
})();
