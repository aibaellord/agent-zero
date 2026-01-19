/**
 * BAEL Lightbox Component - Lord Of All Imagery
 *
 * Image lightbox gallery:
 * - Full screen viewing
 * - Zoom and pan
 * - Slideshow mode
 * - Thumbnail navigation
 * - Keyboard controls
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // LIGHTBOX CLASS
  // ============================================================

  class BaelLightbox {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this.activeInstance = null;
      this._injectStyles();
      this._setupGlobalEvents();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-lightbox-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-lightbox-styles";
      styles.textContent = `
                .bael-lightbox-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s, visibility 0.3s;
                }

                .bael-lightbox-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                /* Header */
                .bael-lightbox-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: linear-gradient(180deg, rgba(0,0,0,0.5), transparent);
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 10;
                }

                .bael-lightbox-counter {
                    font-size: 14px;
                    color: rgba(255,255,255,0.8);
                }

                .bael-lightbox-title {
                    flex: 1;
                    text-align: center;
                    font-size: 14px;
                    color: white;
                    padding: 0 20px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-lightbox-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-lightbox-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-lightbox-btn:hover {
                    background: rgba(255,255,255,0.2);
                }

                .bael-lightbox-btn svg {
                    width: 20px;
                    height: 20px;
                }

                /* Main content */
                .bael-lightbox-content {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 60px;
                    overflow: hidden;
                }

                .bael-lightbox-image-wrapper {
                    position: relative;
                    max-width: 100%;
                    max-height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-lightbox-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    user-select: none;
                    transition: transform 0.3s ease;
                    cursor: zoom-in;
                }

                .bael-lightbox-image.zoomed {
                    cursor: grab;
                    max-width: none;
                    max-height: none;
                }

                .bael-lightbox-image.dragging {
                    cursor: grabbing;
                    transition: none;
                }

                .bael-lightbox-loading {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    color: rgba(255,255,255,0.6);
                }

                .bael-lightbox-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: bael-lightbox-spin 0.8s linear infinite;
                }

                @keyframes bael-lightbox-spin {
                    to { transform: rotate(360deg); }
                }

                /* Navigation */
                .bael-lightbox-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    transition: all 0.15s;
                    z-index: 5;
                }

                .bael-lightbox-nav:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateY(-50%) scale(1.1);
                }

                .bael-lightbox-nav:disabled {
                    opacity: 0.3;
                    cursor: default;
                    transform: translateY(-50%);
                }

                .bael-lightbox-nav svg {
                    width: 24px;
                    height: 24px;
                }

                .bael-lightbox-prev {
                    left: 20px;
                }

                .bael-lightbox-next {
                    right: 20px;
                }

                /* Thumbnails */
                .bael-lightbox-thumbnails {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px;
                    background: linear-gradient(0deg, rgba(0,0,0,0.5), transparent);
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    overflow-x: auto;
                }

                .bael-lightbox-thumbnail {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: all 0.15s;
                    flex-shrink: 0;
                    border: 2px solid transparent;
                }

                .bael-lightbox-thumbnail:hover {
                    opacity: 0.8;
                }

                .bael-lightbox-thumbnail.active {
                    opacity: 1;
                    border-color: white;
                }

                .bael-lightbox-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Caption */
                .bael-lightbox-caption {
                    position: absolute;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    max-width: 80%;
                    padding: 12px 20px;
                    background: rgba(0,0,0,0.7);
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    text-align: center;
                }

                /* Zoom controls */
                .bael-lightbox-zoom-controls {
                    position: absolute;
                    bottom: 100px;
                    right: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-lightbox-zoom-level {
                    font-size: 12px;
                    color: rgba(255,255,255,0.6);
                    text-align: center;
                }

                /* Slideshow */
                .bael-lightbox-slideshow-progress {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: rgba(255,255,255,0.2);
                    z-index: 11;
                }

                .bael-lightbox-slideshow-bar {
                    height: 100%;
                    background: #3b82f6;
                    width: 0;
                    transition: width linear;
                }
            `;
      document.head.appendChild(styles);
    }

    /**
     * Setup global keyboard events
     */
    _setupGlobalEvents() {
      document.addEventListener("keydown", (e) => {
        if (!this.activeInstance) return;

        const state = this.activeInstance;
        switch (e.key) {
          case "Escape":
            this.close(state.id);
            break;
          case "ArrowLeft":
            this._navigate(state, -1);
            break;
          case "ArrowRight":
            this._navigate(state, 1);
            break;
          case "+":
          case "=":
            this._zoom(state, 0.5);
            break;
          case "-":
            this._zoom(state, -0.5);
            break;
          case "0":
            this._resetZoom(state);
            break;
          case " ":
            e.preventDefault();
            this._toggleSlideshow(state);
            break;
        }
      });
    }

    // ============================================================
    // CREATE LIGHTBOX
    // ============================================================

    /**
     * Create lightbox
     */
    create(options = {}) {
      const id = `bael-lightbox-${++this.idCounter}`;
      const config = {
        images: [], // Array of { src, thumb, title, caption }
        startIndex: 0,
        showThumbnails: true,
        showCounter: true,
        showZoomControls: true,
        enableZoom: true,
        enableSlideshow: true,
        slideshowInterval: 4000,
        loop: true,
        closeOnOverlay: true,
        onOpen: null,
        onClose: null,
        onChange: null,
        ...options,
      };

      const state = {
        id,
        config,
        currentIndex: config.startIndex,
        zoomLevel: 1,
        isZoomed: false,
        isDragging: false,
        isSlideshow: false,
        slideshowTimer: null,
        panX: 0,
        panY: 0,
      };

      this._createOverlay(state);
      this.instances.set(id, state);

      return {
        id,
        open: (index) => this.open(id, index),
        close: () => this.close(id),
        next: () => this._navigate(state, 1),
        prev: () => this._navigate(state, -1),
        goTo: (index) => this._goTo(state, index),
        startSlideshow: () => this._startSlideshow(state),
        stopSlideshow: () => this._stopSlideshow(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create overlay elements
     */
    _createOverlay(state) {
      const { config } = state;

      const overlay = document.createElement("div");
      overlay.className = "bael-lightbox-overlay";
      overlay.id = state.id;

      // Header
      const header = document.createElement("div");
      header.className = "bael-lightbox-header";

      if (config.showCounter) {
        const counter = document.createElement("div");
        counter.className = "bael-lightbox-counter";
        counter.textContent = `${state.currentIndex + 1} / ${config.images.length}`;
        state.counterEl = counter;
        header.appendChild(counter);
      }

      const title = document.createElement("div");
      title.className = "bael-lightbox-title";
      state.titleEl = title;
      header.appendChild(title);

      const actions = document.createElement("div");
      actions.className = "bael-lightbox-actions";

      if (config.enableSlideshow) {
        const slideshowBtn = document.createElement("button");
        slideshowBtn.type = "button";
        slideshowBtn.className = "bael-lightbox-btn";
        slideshowBtn.title = "Slideshow";
        slideshowBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
        slideshowBtn.addEventListener("click", () =>
          this._toggleSlideshow(state),
        );
        state.slideshowBtn = slideshowBtn;
        actions.appendChild(slideshowBtn);
      }

      const downloadBtn = document.createElement("button");
      downloadBtn.type = "button";
      downloadBtn.className = "bael-lightbox-btn";
      downloadBtn.title = "Download";
      downloadBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
      downloadBtn.addEventListener("click", () => this._download(state));
      actions.appendChild(downloadBtn);

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "bael-lightbox-btn";
      closeBtn.title = "Close (Esc)";
      closeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      closeBtn.addEventListener("click", () => this.close(state.id));
      actions.appendChild(closeBtn);

      header.appendChild(actions);
      overlay.appendChild(header);

      // Content
      const content = document.createElement("div");
      content.className = "bael-lightbox-content";

      const imageWrapper = document.createElement("div");
      imageWrapper.className = "bael-lightbox-image-wrapper";

      const loading = document.createElement("div");
      loading.className = "bael-lightbox-loading";
      loading.innerHTML = '<div class="bael-lightbox-spinner"></div>';
      state.loadingEl = loading;
      imageWrapper.appendChild(loading);

      const image = document.createElement("img");
      image.className = "bael-lightbox-image";
      image.addEventListener("click", () => {
        if (config.enableZoom) {
          if (state.isZoomed) {
            this._resetZoom(state);
          } else {
            this._zoom(state, 1);
          }
        }
      });
      this._setupDrag(state, image);
      state.imageEl = image;
      imageWrapper.appendChild(image);

      content.appendChild(imageWrapper);
      state.contentEl = content;
      overlay.appendChild(content);

      // Navigation
      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "bael-lightbox-nav bael-lightbox-prev";
      prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`;
      prevBtn.addEventListener("click", () => this._navigate(state, -1));
      state.prevBtn = prevBtn;
      overlay.appendChild(prevBtn);

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "bael-lightbox-nav bael-lightbox-next";
      nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
      nextBtn.addEventListener("click", () => this._navigate(state, 1));
      state.nextBtn = nextBtn;
      overlay.appendChild(nextBtn);

      // Zoom controls
      if (config.showZoomControls && config.enableZoom) {
        const zoomControls = document.createElement("div");
        zoomControls.className = "bael-lightbox-zoom-controls";

        const zoomIn = document.createElement("button");
        zoomIn.type = "button";
        zoomIn.className = "bael-lightbox-btn";
        zoomIn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;
        zoomIn.addEventListener("click", () => this._zoom(state, 0.5));
        zoomControls.appendChild(zoomIn);

        const zoomOut = document.createElement("button");
        zoomOut.type = "button";
        zoomOut.className = "bael-lightbox-btn";
        zoomOut.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;
        zoomOut.addEventListener("click", () => this._zoom(state, -0.5));
        zoomControls.appendChild(zoomOut);

        const zoomLevel = document.createElement("div");
        zoomLevel.className = "bael-lightbox-zoom-level";
        zoomLevel.textContent = "100%";
        state.zoomLevelEl = zoomLevel;
        zoomControls.appendChild(zoomLevel);

        overlay.appendChild(zoomControls);
      }

      // Thumbnails
      if (config.showThumbnails && config.images.length > 1) {
        const thumbnails = document.createElement("div");
        thumbnails.className = "bael-lightbox-thumbnails";

        config.images.forEach((img, index) => {
          const thumb = document.createElement("div");
          thumb.className = "bael-lightbox-thumbnail";
          if (index === state.currentIndex) thumb.classList.add("active");

          const thumbImg = document.createElement("img");
          thumbImg.src = img.thumb || img.src;
          thumbImg.alt = img.title || "";
          thumb.appendChild(thumbImg);

          thumb.addEventListener("click", () => this._goTo(state, index));
          thumbnails.appendChild(thumb);
        });

        state.thumbnailsEl = thumbnails;
        overlay.appendChild(thumbnails);
      }

      // Slideshow progress
      if (config.enableSlideshow) {
        const progress = document.createElement("div");
        progress.className = "bael-lightbox-slideshow-progress";
        progress.style.display = "none";
        progress.innerHTML = '<div class="bael-lightbox-slideshow-bar"></div>';
        state.slideshowProgressEl = progress;
        overlay.appendChild(progress);
      }

      // Close on overlay click
      if (config.closeOnOverlay) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay || e.target === content) {
            this.close(state.id);
          }
        });
      }

      state.overlay = overlay;
      document.body.appendChild(overlay);
    }

    /**
     * Setup drag functionality for zoomed images
     */
    _setupDrag(state, image) {
      let startX, startY, startPanX, startPanY;

      const onMouseDown = (e) => {
        if (!state.isZoomed) return;
        e.preventDefault();
        state.isDragging = true;
        image.classList.add("dragging");
        startX = e.clientX;
        startY = e.clientY;
        startPanX = state.panX;
        startPanY = state.panY;
      };

      const onMouseMove = (e) => {
        if (!state.isDragging) return;
        state.panX = startPanX + (e.clientX - startX);
        state.panY = startPanY + (e.clientY - startY);
        this._updateTransform(state);
      };

      const onMouseUp = () => {
        state.isDragging = false;
        image.classList.remove("dragging");
      };

      image.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }

    // ============================================================
    // NAVIGATION
    // ============================================================

    _navigate(state, direction) {
      const { config } = state;
      let newIndex = state.currentIndex + direction;

      if (config.loop) {
        if (newIndex < 0) newIndex = config.images.length - 1;
        if (newIndex >= config.images.length) newIndex = 0;
      } else {
        if (newIndex < 0 || newIndex >= config.images.length) return;
      }

      this._goTo(state, newIndex);
    }

    _goTo(state, index) {
      const { config } = state;
      if (index < 0 || index >= config.images.length) return;

      state.currentIndex = index;
      this._resetZoom(state);
      this._loadImage(state);

      // Update UI
      if (state.counterEl) {
        state.counterEl.textContent = `${index + 1} / ${config.images.length}`;
      }

      if (state.thumbnailsEl) {
        const thumbs = state.thumbnailsEl.querySelectorAll(
          ".bael-lightbox-thumbnail",
        );
        thumbs.forEach((t, i) => t.classList.toggle("active", i === index));
      }

      // Update nav buttons
      if (!config.loop) {
        state.prevBtn.disabled = index === 0;
        state.nextBtn.disabled = index === config.images.length - 1;
      }

      if (config.onChange) config.onChange(index);
    }

    /**
     * Load current image
     */
    _loadImage(state) {
      const { config, imageEl, loadingEl, titleEl } = state;
      const img = config.images[state.currentIndex];

      loadingEl.style.display = "flex";
      imageEl.style.opacity = "0";

      const newImg = new Image();
      newImg.onload = () => {
        imageEl.src = newImg.src;
        imageEl.style.opacity = "1";
        loadingEl.style.display = "none";
      };
      newImg.onerror = () => {
        loadingEl.innerHTML = "<span>Failed to load image</span>";
      };
      newImg.src = img.src;

      titleEl.textContent = img.title || "";
    }

    // ============================================================
    // ZOOM
    // ============================================================

    _zoom(state, delta) {
      state.zoomLevel = Math.max(1, Math.min(5, state.zoomLevel + delta));
      state.isZoomed = state.zoomLevel > 1;
      state.imageEl.classList.toggle("zoomed", state.isZoomed);

      if (state.zoomLevelEl) {
        state.zoomLevelEl.textContent = `${Math.round(state.zoomLevel * 100)}%`;
      }

      this._updateTransform(state);
    }

    _resetZoom(state) {
      state.zoomLevel = 1;
      state.isZoomed = false;
      state.panX = 0;
      state.panY = 0;
      state.imageEl.classList.remove("zoomed");

      if (state.zoomLevelEl) {
        state.zoomLevelEl.textContent = "100%";
      }

      this._updateTransform(state);
    }

    _updateTransform(state) {
      const { imageEl, zoomLevel, panX, panY } = state;
      imageEl.style.transform = `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`;
    }

    // ============================================================
    // SLIDESHOW
    // ============================================================

    _toggleSlideshow(state) {
      if (state.isSlideshow) {
        this._stopSlideshow(state);
      } else {
        this._startSlideshow(state);
      }
    }

    _startSlideshow(state) {
      const { config, slideshowBtn, slideshowProgressEl } = state;

      state.isSlideshow = true;

      if (slideshowBtn) {
        slideshowBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
      }

      if (slideshowProgressEl) {
        slideshowProgressEl.style.display = "block";
      }

      this._runSlideshow(state);
    }

    _runSlideshow(state) {
      const { config, slideshowProgressEl } = state;
      const bar = slideshowProgressEl?.querySelector(
        ".bael-lightbox-slideshow-bar",
      );

      if (bar) {
        bar.style.transition = "none";
        bar.style.width = "0";
        void bar.offsetWidth;
        bar.style.transition = `width ${config.slideshowInterval}ms linear`;
        bar.style.width = "100%";
      }

      state.slideshowTimer = setTimeout(() => {
        this._navigate(state, 1);
        if (state.isSlideshow) {
          this._runSlideshow(state);
        }
      }, config.slideshowInterval);
    }

    _stopSlideshow(state) {
      state.isSlideshow = false;

      if (state.slideshowTimer) {
        clearTimeout(state.slideshowTimer);
      }

      if (state.slideshowBtn) {
        state.slideshowBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      }

      if (state.slideshowProgressEl) {
        state.slideshowProgressEl.style.display = "none";
      }
    }

    // ============================================================
    // DOWNLOAD
    // ============================================================

    _download(state) {
      const img = state.config.images[state.currentIndex];
      const link = document.createElement("a");
      link.href = img.src;
      link.download = img.title || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // ============================================================
    // OPEN/CLOSE
    // ============================================================

    open(id, index) {
      const state = this.instances.get(id);
      if (!state) return;

      if (typeof index === "number") {
        state.currentIndex = index;
      }

      this._loadImage(state);
      state.overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      this.activeInstance = state;

      if (state.config.onOpen) state.config.onOpen();
    }

    close(id) {
      const state = this.instances.get(id);
      if (!state) return;

      this._stopSlideshow(state);
      state.overlay.classList.remove("open");
      document.body.style.overflow = "";
      this.activeInstance = null;

      if (state.config.onClose) state.config.onClose();
    }

    /**
     * Destroy lightbox
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      this._stopSlideshow(state);
      state.overlay.remove();
      this.instances.delete(id);

      if (this.activeInstance?.id === id) {
        this.activeInstance = null;
        document.body.style.overflow = "";
      }
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelLightbox();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$lightbox = (options) => bael.create(options);
  window.$gallery = window.$lightbox;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelLightbox = bael;

  console.log("🖼️ BAEL Lightbox Gallery Component loaded");
})();
