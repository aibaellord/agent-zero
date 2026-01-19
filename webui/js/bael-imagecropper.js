/**
 * BAEL Image Cropper Component - Lord Of All Images
 *
 * Image cropping tool:
 * - Crop area selection
 * - Aspect ratio constraints
 * - Zoom and rotate
 * - Preview output
 * - Touch support
 * - Export to blob/base64
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // IMAGE CROPPER CLASS
  // ============================================================

  class BaelImageCropper {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-cropper-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-cropper-styles";
      styles.textContent = `
                .bael-cropper {
                    position: relative;
                    font-family: system-ui, -apple-system, sans-serif;
                    background: #1a1a1a;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .bael-cropper-container {
                    position: relative;
                    width: 100%;
                    height: 400px;
                    overflow: hidden;
                    cursor: move;
                }

                .bael-cropper-image {
                    position: absolute;
                    max-width: none;
                    user-select: none;
                    -webkit-user-drag: none;
                    transform-origin: center center;
                }

                .bael-cropper-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .bael-cropper-shade {
                    position: absolute;
                    background: rgba(0, 0, 0, 0.6);
                }

                .bael-cropper-area {
                    position: absolute;
                    border: 2px solid white;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
                    pointer-events: auto;
                }

                .bael-cropper-grid {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .bael-cropper-grid-line {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.4);
                }

                .bael-cropper-grid-line.h {
                    left: 0;
                    right: 0;
                    height: 1px;
                }

                .bael-cropper-grid-line.h:nth-child(1) { top: 33.33%; }
                .bael-cropper-grid-line.h:nth-child(2) { top: 66.66%; }

                .bael-cropper-grid-line.v {
                    top: 0;
                    bottom: 0;
                    width: 1px;
                }

                .bael-cropper-grid-line.v:nth-child(3) { left: 33.33%; }
                .bael-cropper-grid-line.v:nth-child(4) { left: 66.66%; }

                .bael-cropper-handle {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    pointer-events: auto;
                }

                .bael-cropper-handle::before {
                    content: '';
                    position: absolute;
                    background: white;
                }

                .bael-cropper-handle.tl { top: -2px; left: -2px; cursor: nwse-resize; }
                .bael-cropper-handle.tr { top: -2px; right: -2px; cursor: nesw-resize; }
                .bael-cropper-handle.bl { bottom: -2px; left: -2px; cursor: nesw-resize; }
                .bael-cropper-handle.br { bottom: -2px; right: -2px; cursor: nwse-resize; }

                .bael-cropper-handle.tl::before,
                .bael-cropper-handle.br::before {
                    width: 3px;
                    height: 20px;
                    top: 0;
                }
                .bael-cropper-handle.tl::after,
                .bael-cropper-handle.br::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 3px;
                    background: white;
                }

                .bael-cropper-handle.tl::before { left: 0; }
                .bael-cropper-handle.tl::after { top: 0; left: 0; }
                .bael-cropper-handle.br::before { right: 0; }
                .bael-cropper-handle.br::after { bottom: 0; right: 0; }

                .bael-cropper-handle.tr::before,
                .bael-cropper-handle.bl::before {
                    width: 3px;
                    height: 20px;
                    top: 0;
                }
                .bael-cropper-handle.tr::after,
                .bael-cropper-handle.bl::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 3px;
                    background: white;
                }

                .bael-cropper-handle.tr::before { right: 0; }
                .bael-cropper-handle.tr::after { top: 0; right: 0; }
                .bael-cropper-handle.bl::before { left: 0; }
                .bael-cropper-handle.bl::after { bottom: 0; left: 0; }

                .bael-cropper-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 16px;
                    background: #111;
                }

                .bael-cropper-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .bael-cropper-btn:hover {
                    background: rgba(255,255,255,0.2);
                }

                .bael-cropper-btn svg {
                    width: 20px;
                    height: 20px;
                }

                .bael-cropper-zoom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-cropper-slider {
                    width: 120px;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                }

                .bael-cropper-slider::-webkit-slider-thumb {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    background: white;
                    border-radius: 50%;
                    cursor: grab;
                }

                .bael-cropper-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: white;
                    border: none;
                    border-radius: 50%;
                    cursor: grab;
                }

                .bael-cropper-zoom-label {
                    color: rgba(255,255,255,0.7);
                    font-size: 12px;
                    min-width: 40px;
                    text-align: center;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE CROPPER
    // ============================================================

    /**
     * Create image cropper
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Cropper container not found");
        return null;
      }

      const id = `bael-cropper-${++this.idCounter}`;
      const config = {
        src: null,
        aspectRatio: null, // e.g., 16/9, 1, 4/3
        minWidth: 50,
        minHeight: 50,
        showGrid: true,
        showControls: true,
        outputWidth: null,
        outputHeight: null,
        outputFormat: "image/jpeg",
        outputQuality: 0.9,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-cropper";
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        zoom: 1,
        rotation: 0,
        imagePos: { x: 0, y: 0 },
        cropArea: { x: 50, y: 50, width: 200, height: 200 },
        isDragging: false,
        isResizing: false,
        dragMode: null,
        startPos: null,
        imageSize: { width: 0, height: 0 },
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      // Load image if provided
      if (config.src) {
        this.setImage(id, config.src);
      }

      return {
        id,
        setImage: (src) => this.setImage(id, src),
        getCroppedCanvas: () => this.getCroppedCanvas(id),
        getCroppedBlob: (type, quality) =>
          this.getCroppedBlob(id, type, quality),
        getCroppedBase64: (type, quality) =>
          this.getCroppedBase64(id, type, quality),
        setAspectRatio: (ratio) => this.setAspectRatio(id, ratio),
        reset: () => this.reset(id),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render cropper
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Container
      const container = document.createElement("div");
      container.className = "bael-cropper-container";
      state.containerEl = container;

      // Image
      const img = document.createElement("img");
      img.className = "bael-cropper-image";
      img.draggable = false;
      state.imageEl = img;
      container.appendChild(img);

      // Crop area
      const cropArea = document.createElement("div");
      cropArea.className = "bael-cropper-area";
      this._updateCropArea(state, cropArea);

      // Grid
      if (config.showGrid) {
        const grid = document.createElement("div");
        grid.className = "bael-cropper-grid";
        grid.innerHTML = `
                    <div class="bael-cropper-grid-line h"></div>
                    <div class="bael-cropper-grid-line h"></div>
                    <div class="bael-cropper-grid-line v"></div>
                    <div class="bael-cropper-grid-line v"></div>
                `;
        cropArea.appendChild(grid);
      }

      // Resize handles
      ["tl", "tr", "bl", "br"].forEach((pos) => {
        const handle = document.createElement("div");
        handle.className = `bael-cropper-handle ${pos}`;
        handle.dataset.handle = pos;
        cropArea.appendChild(handle);
      });

      state.cropAreaEl = cropArea;
      container.appendChild(cropArea);

      // Event listeners
      this._setupEvents(state, container, cropArea);

      element.appendChild(container);

      // Controls
      if (config.showControls) {
        const controls = this._createControls(state);
        element.appendChild(controls);
      }
    }

    /**
     * Create controls
     */
    _createControls(state) {
      const controls = document.createElement("div");
      controls.className = "bael-cropper-controls";

      // Rotate left
      const rotateLeft = document.createElement("button");
      rotateLeft.type = "button";
      rotateLeft.className = "bael-cropper-btn";
      rotateLeft.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 2v6h6M2.66 15.57a9 9 0 1 0 .57-8.38"/></svg>`;
      rotateLeft.title = "Rotate left";
      rotateLeft.addEventListener("click", () => this._rotate(state, -90));
      controls.appendChild(rotateLeft);

      // Rotate right
      const rotateRight = document.createElement("button");
      rotateRight.type = "button";
      rotateRight.className = "bael-cropper-btn";
      rotateRight.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a9 9 0 1 1-.57-8.38"/></svg>`;
      rotateRight.title = "Rotate right";
      rotateRight.addEventListener("click", () => this._rotate(state, 90));
      controls.appendChild(rotateRight);

      // Zoom
      const zoom = document.createElement("div");
      zoom.className = "bael-cropper-zoom";

      const zoomOut = document.createElement("button");
      zoomOut.type = "button";
      zoomOut.className = "bael-cropper-btn";
      zoomOut.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;
      zoomOut.addEventListener("click", () =>
        this._setZoom(state, state.zoom - 0.1),
      );
      zoom.appendChild(zoomOut);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.className = "bael-cropper-slider";
      slider.min = "0.5";
      slider.max = "3";
      slider.step = "0.1";
      slider.value = state.zoom;
      slider.addEventListener("input", () =>
        this._setZoom(state, parseFloat(slider.value)),
      );
      state.zoomSlider = slider;
      zoom.appendChild(slider);

      const zoomIn = document.createElement("button");
      zoomIn.type = "button";
      zoomIn.className = "bael-cropper-btn";
      zoomIn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;
      zoomIn.addEventListener("click", () =>
        this._setZoom(state, state.zoom + 0.1),
      );
      zoom.appendChild(zoomIn);

      const zoomLabel = document.createElement("span");
      zoomLabel.className = "bael-cropper-zoom-label";
      zoomLabel.textContent = "100%";
      state.zoomLabel = zoomLabel;
      zoom.appendChild(zoomLabel);

      controls.appendChild(zoom);

      // Reset
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "bael-cropper-btn";
      reset.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
      reset.title = "Reset";
      reset.addEventListener("click", () => this.reset(state.id));
      controls.appendChild(reset);

      return controls;
    }

    /**
     * Setup events
     */
    _setupEvents(state, container, cropArea) {
      // Mouse events for crop area
      cropArea.addEventListener("mousedown", (e) => {
        e.preventDefault();

        const handle = e.target.closest(".bael-cropper-handle");
        if (handle) {
          state.isResizing = true;
          state.resizeHandle = handle.dataset.handle;
        } else if (
          e.target === cropArea ||
          e.target.closest(".bael-cropper-grid")
        ) {
          state.isDragging = true;
          state.dragMode = "crop";
        }

        state.startPos = { x: e.clientX, y: e.clientY };
        state.startCrop = { ...state.cropArea };
      });

      // Mouse events for image pan
      container.addEventListener("mousedown", (e) => {
        if (e.target === state.imageEl) {
          state.isDragging = true;
          state.dragMode = "image";
          state.startPos = { x: e.clientX, y: e.clientY };
          state.startImagePos = { ...state.imagePos };
        }
      });

      // Mouse move/up on document
      document.addEventListener("mousemove", (e) => this._handleMove(state, e));
      document.addEventListener("mouseup", () => this._handleUp(state));

      // Wheel zoom
      container.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this._setZoom(state, state.zoom + delta);
      });
    }

    /**
     * Handle mouse move
     */
    _handleMove(state, e) {
      if (!state.isDragging && !state.isResizing) return;

      const dx = e.clientX - state.startPos.x;
      const dy = e.clientY - state.startPos.y;

      if (state.isResizing) {
        this._handleResize(state, dx, dy);
      } else if (state.dragMode === "crop") {
        this._handleCropDrag(state, dx, dy);
      } else if (state.dragMode === "image") {
        state.imagePos.x = state.startImagePos.x + dx;
        state.imagePos.y = state.startImagePos.y + dy;
        this._updateImageTransform(state);
      }
    }

    /**
     * Handle mouse up
     */
    _handleUp(state) {
      state.isDragging = false;
      state.isResizing = false;
      state.dragMode = null;
    }

    /**
     * Handle crop area drag
     */
    _handleCropDrag(state, dx, dy) {
      const containerRect = state.containerEl.getBoundingClientRect();
      const { startCrop } = state;

      let x = startCrop.x + dx;
      let y = startCrop.y + dy;

      // Constrain to container
      x = Math.max(0, Math.min(x, containerRect.width - startCrop.width));
      y = Math.max(0, Math.min(y, containerRect.height - startCrop.height));

      state.cropArea.x = x;
      state.cropArea.y = y;
      this._updateCropArea(state, state.cropAreaEl);
    }

    /**
     * Handle resize
     */
    _handleResize(state, dx, dy) {
      const { config, startCrop, resizeHandle } = state;
      const containerRect = state.containerEl.getBoundingClientRect();

      let { x, y, width, height } = startCrop;

      // Calculate new dimensions based on handle
      switch (resizeHandle) {
        case "br":
          width = Math.max(config.minWidth, startCrop.width + dx);
          height = Math.max(config.minHeight, startCrop.height + dy);
          break;
        case "bl":
          width = Math.max(config.minWidth, startCrop.width - dx);
          height = Math.max(config.minHeight, startCrop.height + dy);
          x = startCrop.x + startCrop.width - width;
          break;
        case "tr":
          width = Math.max(config.minWidth, startCrop.width + dx);
          height = Math.max(config.minHeight, startCrop.height - dy);
          y = startCrop.y + startCrop.height - height;
          break;
        case "tl":
          width = Math.max(config.minWidth, startCrop.width - dx);
          height = Math.max(config.minHeight, startCrop.height - dy);
          x = startCrop.x + startCrop.width - width;
          y = startCrop.y + startCrop.height - height;
          break;
      }

      // Apply aspect ratio
      if (config.aspectRatio) {
        if (resizeHandle.includes("r")) {
          height = width / config.aspectRatio;
        } else {
          width = height * config.aspectRatio;
        }
      }

      // Constrain to container
      width = Math.min(width, containerRect.width - x);
      height = Math.min(height, containerRect.height - y);
      x = Math.max(0, x);
      y = Math.max(0, y);

      state.cropArea = { x, y, width, height };
      this._updateCropArea(state, state.cropAreaEl);
    }

    /**
     * Update crop area position
     */
    _updateCropArea(state, el) {
      const { x, y, width, height } = state.cropArea;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    }

    /**
     * Update image transform
     */
    _updateImageTransform(state) {
      const { imageEl, zoom, rotation, imagePos } = state;
      imageEl.style.transform = `translate(${imagePos.x}px, ${imagePos.y}px) scale(${zoom}) rotate(${rotation}deg)`;
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Set image source
     */
    setImage(cropperId, src) {
      const state = this.instances.get(cropperId);
      if (!state) return;

      const img = new Image();
      img.onload = () => {
        state.imageEl.src = src;
        state.imageSize = { width: img.width, height: img.height };

        // Center image
        const containerRect = state.containerEl.getBoundingClientRect();
        const scale =
          Math.min(
            containerRect.width / img.width,
            containerRect.height / img.height,
          ) * 0.8;

        state.zoom = scale;
        state.imagePos = {
          x: (containerRect.width - img.width * scale) / 2,
          y: (containerRect.height - img.height * scale) / 2,
        };

        // Set initial crop area
        const cropSize =
          Math.min(containerRect.width, containerRect.height) * 0.6;
        state.cropArea = {
          x: (containerRect.width - cropSize) / 2,
          y: (containerRect.height - cropSize) / 2,
          width: cropSize,
          height: state.config.aspectRatio
            ? cropSize / state.config.aspectRatio
            : cropSize,
        };

        this._updateImageTransform(state);
        this._updateCropArea(state, state.cropAreaEl);

        if (state.zoomSlider) {
          state.zoomSlider.value = state.zoom;
          state.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
        }
      };
      img.src = src;
    }

    /**
     * Set zoom level
     */
    _setZoom(state, zoom) {
      state.zoom = Math.max(0.5, Math.min(3, zoom));
      this._updateImageTransform(state);

      if (state.zoomSlider) {
        state.zoomSlider.value = state.zoom;
        state.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
      }
    }

    /**
     * Rotate image
     */
    _rotate(state, degrees) {
      state.rotation = (state.rotation + degrees) % 360;
      this._updateImageTransform(state);
    }

    /**
     * Set aspect ratio
     */
    setAspectRatio(cropperId, ratio) {
      const state = this.instances.get(cropperId);
      if (!state) return;

      state.config.aspectRatio = ratio;

      if (ratio) {
        state.cropArea.height = state.cropArea.width / ratio;
        this._updateCropArea(state, state.cropAreaEl);
      }
    }

    /**
     * Reset cropper
     */
    reset(cropperId) {
      const state = this.instances.get(cropperId);
      if (!state) return;

      state.zoom = 1;
      state.rotation = 0;
      state.imagePos = { x: 0, y: 0 };

      if (state.imageEl.src) {
        this.setImage(cropperId, state.imageEl.src);
      }
    }

    /**
     * Get cropped canvas
     */
    getCroppedCanvas(cropperId) {
      const state = this.instances.get(cropperId);
      if (!state || !state.imageEl.src) return null;

      const {
        config,
        cropArea,
        imagePos,
        zoom,
        rotation,
        imageSize,
        containerEl,
      } = state;
      const containerRect = containerEl.getBoundingClientRect();

      // Calculate crop coordinates relative to original image
      const canvas = document.createElement("canvas");
      const outputWidth = config.outputWidth || cropArea.width;
      const outputHeight = config.outputHeight || cropArea.height;

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext("2d");

      // Calculate the portion of the image to crop
      const scaleX = imageSize.width / (imageSize.width * zoom);
      const scaleY = imageSize.height / (imageSize.height * zoom);

      const sourceX = (cropArea.x - imagePos.x) / zoom;
      const sourceY = (cropArea.y - imagePos.y) / zoom;
      const sourceWidth = cropArea.width / zoom;
      const sourceHeight = cropArea.height / zoom;

      // Handle rotation
      ctx.save();
      if (rotation) {
        ctx.translate(outputWidth / 2, outputHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-outputWidth / 2, -outputHeight / 2);
      }

      ctx.drawImage(
        state.imageEl,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      ctx.restore();

      return canvas;
    }

    /**
     * Get cropped image as blob
     */
    getCroppedBlob(cropperId, type, quality) {
      const state = this.instances.get(cropperId);
      const canvas = this.getCroppedCanvas(cropperId);
      if (!canvas) return Promise.resolve(null);

      const format = type || state.config.outputFormat;
      const q = quality || state.config.outputQuality;

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), format, q);
      });
    }

    /**
     * Get cropped image as base64
     */
    getCroppedBase64(cropperId, type, quality) {
      const state = this.instances.get(cropperId);
      const canvas = this.getCroppedCanvas(cropperId);
      if (!canvas) return null;

      const format = type || state.config.outputFormat;
      const q = quality || state.config.outputQuality;

      return canvas.toDataURL(format, q);
    }

    /**
     * Destroy cropper
     */
    destroy(cropperId) {
      const state = this.instances.get(cropperId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(cropperId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelImageCropper();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$imageCropper = (container, options) =>
    bael.create(container, options);
  window.$cropper = window.$imageCropper;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelImageCropper = bael;

  console.log("✂️ BAEL Image Cropper Component loaded");
})();
