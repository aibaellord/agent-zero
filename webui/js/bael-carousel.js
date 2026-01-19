/**
 * BAEL Carousel Component - Lord Of All Sliders
 *
 * Full-featured carousel/slider component with:
 * - Smooth animations
 * - Touch/swipe support
 * - Auto-play
 * - Infinite loop
 * - Multiple slides
 * - Fade/slide effects
 * - Thumbnails
 * - Accessibility
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CAROUSEL CLASS
  // ============================================================

  class BaelCarousel {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
    }

    // ============================================================
    // CREATE CAROUSEL
    // ============================================================

    /**
     * Create a carousel
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Carousel container not found");
        return null;
      }

      const id = `bael-carousel-${++this.idCounter}`;
      const config = {
        effect: "slide",
        direction: "horizontal",
        speed: 300,
        autoPlay: false,
        autoPlayInterval: 3000,
        pauseOnHover: true,
        loop: true,
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: false,
        navigation: true,
        pagination: true,
        paginationType: "bullets",
        keyboard: true,
        touch: true,
        threshold: 50,
        draggable: true,
        freeMode: false,
        lazy: false,
        startSlide: 0,
        onSlideChange: null,
        onInit: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        wrapper: null,
        slides: [],
        currentIndex: config.startSlide,
        previousIndex: 0,
        isAnimating: false,
        autoPlayTimer: null,
        touchStartX: 0,
        touchStartY: 0,
        touchMoveX: 0,
        translateX: 0,
        isDragging: false,
      };

      // Setup structure
      this._setupStructure(state);

      // Setup navigation
      if (config.navigation) {
        this._setupNavigation(state);
      }

      // Setup pagination
      if (config.pagination) {
        this._setupPagination(state);
      }

      // Setup touch
      if (config.touch) {
        this._setupTouch(state);
      }

      // Setup keyboard
      if (config.keyboard) {
        this._setupKeyboard(state);
      }

      // Go to start slide
      this._goToSlide(state, config.startSlide, false);

      // Auto-play
      if (config.autoPlay) {
        this._startAutoPlay(state);

        if (config.pauseOnHover) {
          container.addEventListener("mouseenter", () =>
            this._stopAutoPlay(state),
          );
          container.addEventListener("mouseleave", () =>
            this._startAutoPlay(state),
          );
        }
      }

      this.instances.set(id, state);

      // Callback
      if (config.onInit) {
        config.onInit(state);
      }

      return {
        id,
        next: () => this.next(id),
        prev: () => this.prev(id),
        goTo: (index) => this.goTo(id, index),
        play: () => this.play(id),
        pause: () => this.pause(id),
        getCurrentIndex: () => state.currentIndex,
        getSlideCount: () => state.slides.length,
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Setup carousel structure
     */
    _setupStructure(state) {
      const { container, config } = state;

      container.classList.add("bael-carousel");
      container.classList.add(`bael-carousel-${config.direction}`);
      container.classList.add(`bael-carousel-${config.effect}`);

      // Find or create wrapper
      let wrapper = container.querySelector(
        ".carousel-wrapper, [data-carousel-wrapper]",
      );
      if (!wrapper) {
        wrapper = document.createElement("div");
        // Move existing children to wrapper
        while (container.firstChild) {
          wrapper.appendChild(container.firstChild);
        }
        container.appendChild(wrapper);
      }
      wrapper.classList.add("bael-carousel-wrapper");
      state.wrapper = wrapper;

      // Setup slides
      const slides = wrapper.querySelectorAll(
        ".carousel-slide, [data-carousel-slide], > *:not(.bael-carousel-nav):not(.bael-carousel-pagination)",
      );
      slides.forEach((slide, index) => {
        slide.classList.add("bael-carousel-slide");
        slide.dataset.index = index;

        // Handle lazy loading
        if (config.lazy) {
          const img = slide.querySelector("img[data-src]");
          if (img) {
            img.classList.add("bael-lazy");
          }
        }

        state.slides.push(slide);
      });

      // Set wrapper width for slide effect
      if (config.effect === "slide") {
        this._updateWrapperSize(state);
      }
    }

    /**
     * Update wrapper size
     */
    _updateWrapperSize(state) {
      const { wrapper, slides, config } = state;
      const containerWidth = state.container.offsetWidth;
      const slideWidth =
        (containerWidth - (config.slidesPerView - 1) * config.spaceBetween) /
        config.slidesPerView;

      slides.forEach((slide) => {
        slide.style.width = `${slideWidth}px`;
        slide.style.marginRight = `${config.spaceBetween}px`;
      });

      if (config.direction === "horizontal") {
        wrapper.style.width = `${slides.length * (slideWidth + config.spaceBetween)}px`;
      }
    }

    /**
     * Setup navigation
     */
    _setupNavigation(state) {
      const { container } = state;

      // Previous button
      const prevBtn = document.createElement("button");
      prevBtn.className = "bael-carousel-nav bael-carousel-prev";
      prevBtn.innerHTML = "❮";
      prevBtn.setAttribute("aria-label", "Previous slide");
      prevBtn.onclick = () => this.prev(state.id);

      // Next button
      const nextBtn = document.createElement("button");
      nextBtn.className = "bael-carousel-nav bael-carousel-next";
      nextBtn.innerHTML = "❯";
      nextBtn.setAttribute("aria-label", "Next slide");
      nextBtn.onclick = () => this.next(state.id);

      container.appendChild(prevBtn);
      container.appendChild(nextBtn);

      state.prevBtn = prevBtn;
      state.nextBtn = nextBtn;
    }

    /**
     * Setup pagination
     */
    _setupPagination(state) {
      const { container, slides, config } = state;

      const pagination = document.createElement("div");
      pagination.className = "bael-carousel-pagination";

      if (config.paginationType === "bullets") {
        slides.forEach((_, index) => {
          const bullet = document.createElement("button");
          bullet.className = "bael-carousel-bullet";
          bullet.setAttribute("aria-label", `Go to slide ${index + 1}`);
          bullet.onclick = () => this.goTo(state.id, index);
          pagination.appendChild(bullet);
        });
      } else if (config.paginationType === "fraction") {
        const current = document.createElement("span");
        current.className = "bael-carousel-current";
        current.textContent = "1";

        const separator = document.createElement("span");
        separator.textContent = " / ";

        const total = document.createElement("span");
        total.className = "bael-carousel-total";
        total.textContent = slides.length;

        pagination.appendChild(current);
        pagination.appendChild(separator);
        pagination.appendChild(total);

        state.paginationCurrent = current;
      } else if (config.paginationType === "progressbar") {
        const progressbar = document.createElement("div");
        progressbar.className = "bael-carousel-progressbar";

        const progress = document.createElement("div");
        progress.className = "bael-carousel-progress";
        progressbar.appendChild(progress);

        pagination.appendChild(progressbar);
        state.progressBar = progress;
      }

      container.appendChild(pagination);
      state.pagination = pagination;
    }

    /**
     * Update pagination
     */
    _updatePagination(state) {
      const { config, currentIndex, slides, pagination } = state;

      if (!config.pagination) return;

      if (config.paginationType === "bullets") {
        const bullets = pagination.querySelectorAll(".bael-carousel-bullet");
        bullets.forEach((bullet, index) => {
          bullet.classList.toggle("active", index === currentIndex);
        });
      } else if (config.paginationType === "fraction") {
        state.paginationCurrent.textContent = currentIndex + 1;
      } else if (config.paginationType === "progressbar") {
        const progress = ((currentIndex + 1) / slides.length) * 100;
        state.progressBar.style.width = `${progress}%`;
      }
    }

    /**
     * Setup touch/swipe
     */
    _setupTouch(state) {
      const { container, config } = state;

      container.addEventListener(
        "touchstart",
        (e) => {
          state.touchStartX = e.touches[0].clientX;
          state.touchStartY = e.touches[0].clientY;
          state.isDragging = true;
        },
        { passive: true },
      );

      container.addEventListener(
        "touchmove",
        (e) => {
          if (!state.isDragging) return;

          state.touchMoveX = e.touches[0].clientX - state.touchStartX;
          const touchMoveY = e.touches[0].clientY - state.touchStartY;

          // Prevent vertical scrolling when swiping horizontally
          if (Math.abs(state.touchMoveX) > Math.abs(touchMoveY)) {
            if (config.freeMode) {
              this._updateTransform(state, state.translateX + state.touchMoveX);
            }
          }
        },
        { passive: true },
      );

      container.addEventListener("touchend", () => {
        if (!state.isDragging) return;
        state.isDragging = false;

        if (Math.abs(state.touchMoveX) > config.threshold) {
          if (state.touchMoveX > 0) {
            this.prev(state.id);
          } else {
            this.next(state.id);
          }
        } else if (config.freeMode) {
          // Snap back
          this._goToSlide(state, state.currentIndex, true);
        }

        state.touchMoveX = 0;
      });

      // Mouse drag
      if (config.draggable) {
        let mouseStartX = 0;
        let mouseMoveX = 0;

        container.addEventListener("mousedown", (e) => {
          mouseStartX = e.clientX;
          state.isDragging = true;
          container.style.cursor = "grabbing";
        });

        container.addEventListener("mousemove", (e) => {
          if (!state.isDragging) return;
          mouseMoveX = e.clientX - mouseStartX;
        });

        container.addEventListener("mouseup", () => {
          if (!state.isDragging) return;
          state.isDragging = false;
          container.style.cursor = "";

          if (Math.abs(mouseMoveX) > config.threshold) {
            if (mouseMoveX > 0) {
              this.prev(state.id);
            } else {
              this.next(state.id);
            }
          }
          mouseMoveX = 0;
        });

        container.addEventListener("mouseleave", () => {
          state.isDragging = false;
          container.style.cursor = "";
        });
      }
    }

    /**
     * Setup keyboard navigation
     */
    _setupKeyboard(state) {
      state.container.setAttribute("tabindex", "0");

      state.container.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            this.prev(state.id);
            break;
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            this.next(state.id);
            break;
          case "Home":
            e.preventDefault();
            this.goTo(state.id, 0);
            break;
          case "End":
            e.preventDefault();
            this.goTo(state.id, state.slides.length - 1);
            break;
        }
      });
    }

    // ============================================================
    // NAVIGATION METHODS
    // ============================================================

    /**
     * Go to next slide
     */
    next(carouselId) {
      const state = this.instances.get(carouselId);
      if (!state || state.isAnimating) return;

      let nextIndex = state.currentIndex + 1;

      if (nextIndex >= state.slides.length) {
        if (state.config.loop) {
          nextIndex = 0;
        } else {
          return;
        }
      }

      this._goToSlide(state, nextIndex, true);
    }

    /**
     * Go to previous slide
     */
    prev(carouselId) {
      const state = this.instances.get(carouselId);
      if (!state || state.isAnimating) return;

      let prevIndex = state.currentIndex - 1;

      if (prevIndex < 0) {
        if (state.config.loop) {
          prevIndex = state.slides.length - 1;
        } else {
          return;
        }
      }

      this._goToSlide(state, prevIndex, true);
    }

    /**
     * Go to specific slide
     */
    goTo(carouselId, index) {
      const state = this.instances.get(carouselId);
      if (!state || state.isAnimating) return;

      if (index < 0 || index >= state.slides.length) return;

      this._goToSlide(state, index, true);
    }

    /**
     * Internal go to slide
     */
    _goToSlide(state, index, animate = true) {
      const { config, slides, wrapper, currentIndex } = state;

      if (state.isAnimating) return;

      state.previousIndex = currentIndex;
      state.currentIndex = index;

      // Update active class
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });

      // Animate
      if (config.effect === "slide") {
        const containerWidth = state.container.offsetWidth;
        const slideWidth =
          (containerWidth - (config.slidesPerView - 1) * config.spaceBetween) /
          config.slidesPerView;
        const translateX = -(index * (slideWidth + config.spaceBetween));

        state.translateX = translateX;

        if (animate) {
          state.isAnimating = true;
          wrapper.style.transition = `transform ${config.speed}ms ease`;
        }

        wrapper.style.transform = `translateX(${translateX}px)`;

        if (animate) {
          setTimeout(() => {
            wrapper.style.transition = "";
            state.isAnimating = false;
          }, config.speed);
        }
      } else if (config.effect === "fade") {
        slides.forEach((slide, i) => {
          if (i === index) {
            slide.style.opacity = "0";
            slide.style.display = "block";
            slide.offsetHeight;

            if (animate) {
              state.isAnimating = true;
              slide.style.transition = `opacity ${config.speed}ms ease`;
            }

            slide.style.opacity = "1";

            if (animate) {
              setTimeout(() => {
                slide.style.transition = "";
                state.isAnimating = false;
              }, config.speed);
            }
          } else {
            slide.style.display = "none";
            slide.style.opacity = "0";
          }
        });
      }

      // Lazy load
      if (config.lazy) {
        this._loadLazyImages(state, index);
      }

      // Update pagination
      this._updatePagination(state);

      // Update navigation
      this._updateNavigation(state);

      // Callback
      if (config.onSlideChange && currentIndex !== index) {
        config.onSlideChange(index, state.previousIndex, state);
      }
    }

    /**
     * Update transform
     */
    _updateTransform(state, translateX) {
      state.wrapper.style.transform = `translateX(${translateX}px)`;
    }

    /**
     * Update navigation buttons
     */
    _updateNavigation(state) {
      const { config, currentIndex, slides, prevBtn, nextBtn } = state;

      if (!config.navigation) return;

      if (!config.loop) {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === slides.length - 1;
      }
    }

    /**
     * Load lazy images
     */
    _loadLazyImages(state, index) {
      const slide = state.slides[index];
      const img = slide.querySelector("img[data-src]");

      if (img && !img.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        img.classList.remove("bael-lazy");
      }

      // Preload adjacent slides
      [-1, 1].forEach((offset) => {
        const adjacentIndex = index + offset;
        if (adjacentIndex >= 0 && adjacentIndex < state.slides.length) {
          const adjacentSlide = state.slides[adjacentIndex];
          const adjacentImg = adjacentSlide.querySelector("img[data-src]");
          if (adjacentImg && !adjacentImg.src) {
            adjacentImg.src = adjacentImg.dataset.src;
            adjacentImg.removeAttribute("data-src");
          }
        }
      });
    }

    // ============================================================
    // AUTO-PLAY
    // ============================================================

    /**
     * Start auto-play
     */
    _startAutoPlay(state) {
      this._stopAutoPlay(state);

      state.autoPlayTimer = setInterval(() => {
        this.next(state.id);
      }, state.config.autoPlayInterval);
    }

    /**
     * Stop auto-play
     */
    _stopAutoPlay(state) {
      if (state.autoPlayTimer) {
        clearInterval(state.autoPlayTimer);
        state.autoPlayTimer = null;
      }
    }

    /**
     * Play
     */
    play(carouselId) {
      const state = this.instances.get(carouselId);
      if (!state) return;

      this._startAutoPlay(state);
    }

    /**
     * Pause
     */
    pause(carouselId) {
      const state = this.instances.get(carouselId);
      if (!state) return;

      this._stopAutoPlay(state);
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy carousel
     */
    destroy(carouselId) {
      const state = this.instances.get(carouselId);
      if (!state) return;

      this._stopAutoPlay(state);

      const { container, slides } = state;

      // Remove classes
      container.classList.remove(
        "bael-carousel",
        `bael-carousel-${state.config.direction}`,
        `bael-carousel-${state.config.effect}`,
      );

      slides.forEach((slide) => {
        slide.classList.remove("bael-carousel-slide", "active");
        slide.style.cssText = "";
      });

      // Remove navigation
      if (state.prevBtn) state.prevBtn.remove();
      if (state.nextBtn) state.nextBtn.remove();

      // Remove pagination
      if (state.pagination) state.pagination.remove();

      // Reset wrapper
      state.wrapper.classList.remove("bael-carousel-wrapper");
      state.wrapper.style.cssText = "";

      this.instances.delete(carouselId);
    }

    // ============================================================
    // AUTO-INIT
    // ============================================================

    /**
     * Auto-initialize carousels
     */
    autoInit() {
      document.querySelectorAll("[data-carousel]").forEach((container) => {
        const options = {};

        if (container.dataset.carouselEffect) {
          options.effect = container.dataset.carouselEffect;
        }
        if (container.dataset.carouselAutoplay !== undefined) {
          options.autoPlay = container.dataset.carouselAutoplay !== "false";
        }
        if (container.dataset.carouselLoop !== undefined) {
          options.loop = container.dataset.carouselLoop !== "false";
        }
        if (container.dataset.carouselSpeed) {
          options.speed = parseInt(container.dataset.carouselSpeed);
        }
        if (container.dataset.carouselInterval) {
          options.autoPlayInterval = parseInt(
            container.dataset.carouselInterval,
          );
        }

        this.create(container, options);
      });
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelCarousel();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$carousel = (container, options) => bael.create(container, options);
  window.$slider = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCarousel = bael;

  // Auto-init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bael.autoInit());
  } else {
    bael.autoInit();
  }

  console.log("🎠 BAEL Carousel Component loaded");
})();
