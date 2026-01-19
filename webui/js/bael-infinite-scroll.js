/**
 * BAEL Infinite Scroll Component - Lord Of All Streams
 *
 * Infinite scrolling/pagination with:
 * - Scroll-based loading
 * - Intersection observer
 * - Loading states
 * - Error handling
 * - Manual load more
 * - Reverse scrolling
 * - Virtual scrolling for large lists
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // INFINITE SCROLL CLASS
  // ============================================================

  class BaelInfiniteScroll {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-infinite-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-infinite-styles";
      styles.textContent = `
                .bael-infinite {
                    position: relative;
                }

                .bael-infinite-content {
                    position: relative;
                }

                /* Loader */
                .bael-infinite-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 24px;
                    color: #6b7280;
                }

                .bael-infinite-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: bael-infinite-spin 0.8s linear infinite;
                }

                @keyframes bael-infinite-spin {
                    to { transform: rotate(360deg); }
                }

                /* Load more button */
                .bael-infinite-load-more {
                    display: flex;
                    justify-content: center;
                    padding: 16px;
                }

                .bael-infinite-load-more button {
                    padding: 10px 24px;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .bael-infinite-load-more button:hover {
                    background: #4338ca;
                }

                .bael-infinite-load-more button:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }

                /* End message */
                .bael-infinite-end {
                    text-align: center;
                    padding: 24px;
                    color: #9ca3af;
                    font-size: 0.875rem;
                }

                /* Error */
                .bael-infinite-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 24px;
                    color: #ef4444;
                }

                .bael-infinite-error button {
                    padding: 8px 16px;
                    background: #fef2f2;
                    color: #ef4444;
                    border: 1px solid #fecaca;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-infinite-error button:hover {
                    background: #fee2e2;
                }

                /* Sentinel */
                .bael-infinite-sentinel {
                    height: 1px;
                    width: 100%;
                }

                /* Scroll to top */
                .bael-infinite-scroll-top {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 48px;
                    height: 48px;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    font-size: 1.25rem;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: all 0.3s;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(20px);
                    z-index: 100;
                }

                .bael-infinite-scroll-top.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .bael-infinite-scroll-top:hover {
                    background: #4338ca;
                    transform: translateY(-2px);
                }

                /* Pull to refresh */
                .bael-infinite-pull {
                    position: absolute;
                    top: -60px;
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 60px;
                    color: #6b7280;
                    transition: transform 0.2s;
                }

                .bael-infinite-pull-icon {
                    transition: transform 0.2s;
                }

                .bael-infinite-pull.ready .bael-infinite-pull-icon {
                    transform: rotate(180deg);
                }

                .bael-infinite-pull.refreshing .bael-infinite-pull-icon {
                    animation: bael-infinite-spin 0.8s linear infinite;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE INFINITE SCROLL
    // ============================================================

    /**
     * Create infinite scroll
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Infinite scroll container not found");
        return null;
      }

      const id = `bael-infinite-${++this.idCounter}`;
      const config = {
        loadMore: null, // async function that returns items
        renderItem: null, // function to render single item
        threshold: 200, // pixels from bottom to trigger load
        initialLoad: true,
        manualLoad: false, // use button instead of auto
        loadMoreText: "Load More",
        loadingText: "Loading...",
        endText: "No more items",
        errorText: "Failed to load. ",
        retryText: "Try again",
        showScrollTop: true,
        scrollTopThreshold: 500,
        reverse: false, // load at top (chat-style)
        pullToRefresh: false,
        pullText: "Pull to refresh",
        releaseText: "Release to refresh",
        refreshingText: "Refreshing...",
        pageSize: 20,
        onLoad: null,
        onError: null,
        onEnd: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        page: 1,
        isLoading: false,
        hasMore: true,
        error: null,
        items: [],
        observer: null,
        pullStartY: 0,
        pulling: false,
      };

      // Create structure
      this._createStructure(state);
      this._setupEvents(state);

      // Initial load
      if (config.initialLoad && !config.manualLoad) {
        this._loadItems(state);
      }

      this.instances.set(id, state);

      return {
        id,
        loadMore: () => this._loadItems(state),
        reset: () => this.reset(id),
        refresh: () => this.refresh(id),
        getItems: () => state.items,
        setHasMore: (hasMore) => {
          state.hasMore = hasMore;
          this._updateUI(state);
        },
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create structure
     */
    _createStructure(state) {
      const { config, container } = state;

      const wrapper = document.createElement("div");
      wrapper.className = "bael-infinite";
      wrapper.id = state.id;

      // Pull to refresh
      if (config.pullToRefresh) {
        const pull = document.createElement("div");
        pull.className = "bael-infinite-pull";
        pull.innerHTML = `
                    <span class="bael-infinite-pull-icon">↓</span>
                    <span class="bael-infinite-pull-text">${config.pullText}</span>
                `;
        wrapper.appendChild(pull);
        state.pullEl = pull;
      }

      // Content area
      const content = document.createElement("div");
      content.className = "bael-infinite-content";
      wrapper.appendChild(content);

      // Sentinel for intersection observer
      const sentinel = document.createElement("div");
      sentinel.className = "bael-infinite-sentinel";

      // Status area (loader/error/end/load more button)
      const status = document.createElement("div");
      status.className = "bael-infinite-status";

      if (config.reverse) {
        wrapper.insertBefore(sentinel, content);
        wrapper.insertBefore(status, content);
      } else {
        wrapper.appendChild(sentinel);
        wrapper.appendChild(status);
      }

      // Scroll to top button
      if (config.showScrollTop) {
        const scrollTop = document.createElement("button");
        scrollTop.className = "bael-infinite-scroll-top";
        scrollTop.innerHTML = "↑";
        scrollTop.onclick = () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        };
        document.body.appendChild(scrollTop);
        state.scrollTopBtn = scrollTop;
      }

      container.appendChild(wrapper);

      state.wrapper = wrapper;
      state.content = content;
      state.sentinel = sentinel;
      state.status = status;
    }

    /**
     * Setup event listeners
     */
    _setupEvents(state) {
      const { config, sentinel } = state;

      // Intersection observer for auto-loading
      if (!config.manualLoad) {
        state.observer = new IntersectionObserver(
          (entries) => {
            if (
              entries[0].isIntersecting &&
              !state.isLoading &&
              state.hasMore &&
              !state.error
            ) {
              this._loadItems(state);
            }
          },
          {
            rootMargin: `${config.threshold}px`,
          },
        );

        state.observer.observe(sentinel);
      }

      // Scroll to top visibility
      if (config.showScrollTop) {
        window.addEventListener("scroll", () => {
          const shouldShow = window.scrollY > config.scrollTopThreshold;
          state.scrollTopBtn.classList.toggle("visible", shouldShow);
        });
      }

      // Pull to refresh
      if (config.pullToRefresh) {
        this._setupPullToRefresh(state);
      }
    }

    /**
     * Setup pull to refresh
     */
    _setupPullToRefresh(state) {
      const { wrapper, pullEl, config } = state;

      wrapper.addEventListener(
        "touchstart",
        (e) => {
          if (window.scrollY === 0) {
            state.pullStartY = e.touches[0].clientY;
            state.pulling = true;
          }
        },
        { passive: true },
      );

      wrapper.addEventListener(
        "touchmove",
        (e) => {
          if (!state.pulling || state.isLoading) return;

          const pullDistance = e.touches[0].clientY - state.pullStartY;

          if (pullDistance > 0 && window.scrollY === 0) {
            const progress = Math.min(pullDistance / 100, 1);
            pullEl.style.transform = `translateY(${pullDistance * 0.5}px)`;

            if (progress >= 1) {
              pullEl.classList.add("ready");
              pullEl.querySelector(".bael-infinite-pull-text").textContent =
                config.releaseText;
            } else {
              pullEl.classList.remove("ready");
              pullEl.querySelector(".bael-infinite-pull-text").textContent =
                config.pullText;
            }
          }
        },
        { passive: true },
      );

      wrapper.addEventListener("touchend", async () => {
        if (!state.pulling) return;
        state.pulling = false;

        if (pullEl.classList.contains("ready") && !state.isLoading) {
          pullEl.classList.remove("ready");
          pullEl.classList.add("refreshing");
          pullEl.querySelector(".bael-infinite-pull-text").textContent =
            config.refreshingText;
          pullEl.querySelector(".bael-infinite-pull-icon").textContent = "↻";

          await this.refresh(state.id);

          pullEl.classList.remove("refreshing");
          pullEl.querySelector(".bael-infinite-pull-icon").textContent = "↓";
        }

        pullEl.style.transform = "";
        pullEl.querySelector(".bael-infinite-pull-text").textContent =
          config.pullText;
      });
    }

    // ============================================================
    // LOADING
    // ============================================================

    /**
     * Load items
     */
    async _loadItems(state) {
      const { config, content } = state;

      if (state.isLoading || !state.hasMore) return;

      state.isLoading = true;
      state.error = null;
      this._updateUI(state);

      try {
        const newItems = await config.loadMore(state.page, config.pageSize);

        if (!newItems || newItems.length === 0) {
          state.hasMore = false;
        } else {
          state.items.push(...newItems);
          state.page++;

          // Render items
          newItems.forEach((item) => {
            const element = config.renderItem
              ? config.renderItem(item)
              : this._defaultRenderItem(item);

            if (typeof element === "string") {
              content.insertAdjacentHTML(
                config.reverse ? "afterbegin" : "beforeend",
                element,
              );
            } else if (element instanceof Element) {
              if (config.reverse) {
                content.insertBefore(element, content.firstChild);
              } else {
                content.appendChild(element);
              }
            }
          });

          // Check if less than page size (end of data)
          if (newItems.length < config.pageSize) {
            state.hasMore = false;
          }
        }

        if (config.onLoad) {
          config.onLoad(newItems, state.items);
        }

        if (!state.hasMore && config.onEnd) {
          config.onEnd(state.items);
        }
      } catch (error) {
        console.error("Error loading items:", error);
        state.error = error;

        if (config.onError) {
          config.onError(error);
        }
      }

      state.isLoading = false;
      this._updateUI(state);
    }

    /**
     * Default item renderer
     */
    _defaultRenderItem(item) {
      const div = document.createElement("div");
      div.textContent = typeof item === "string" ? item : JSON.stringify(item);
      return div;
    }

    /**
     * Update UI based on state
     */
    _updateUI(state) {
      const { config, status } = state;

      if (state.isLoading) {
        status.innerHTML = `
                    <div class="bael-infinite-loader">
                        <div class="bael-infinite-spinner"></div>
                        <span>${config.loadingText}</span>
                    </div>
                `;
      } else if (state.error) {
        status.innerHTML = `
                    <div class="bael-infinite-error">
                        <span>${config.errorText}</span>
                        <button>${config.retryText}</button>
                    </div>
                `;
        status.querySelector("button").onclick = () => {
          state.error = null;
          this._loadItems(state);
        };
      } else if (!state.hasMore) {
        if (state.items.length > 0) {
          status.innerHTML = `
                        <div class="bael-infinite-end">${config.endText}</div>
                    `;
        } else {
          status.innerHTML = "";
        }
      } else if (config.manualLoad) {
        status.innerHTML = `
                    <div class="bael-infinite-load-more">
                        <button>${config.loadMoreText}</button>
                    </div>
                `;
        status.querySelector("button").onclick = () => this._loadItems(state);
      } else {
        status.innerHTML = "";
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Reset infinite scroll
     */
    reset(infiniteId) {
      const state = this.instances.get(infiniteId);
      if (!state) return;

      state.page = 1;
      state.items = [];
      state.hasMore = true;
      state.error = null;
      state.content.innerHTML = "";

      this._updateUI(state);

      if (!state.config.manualLoad) {
        this._loadItems(state);
      }
    }

    /**
     * Refresh (reset and reload)
     */
    async refresh(infiniteId) {
      const state = this.instances.get(infiniteId);
      if (!state) return;

      state.page = 1;
      state.items = [];
      state.hasMore = true;
      state.error = null;
      state.content.innerHTML = "";

      await this._loadItems(state);
    }

    /**
     * Destroy infinite scroll
     */
    destroy(infiniteId) {
      const state = this.instances.get(infiniteId);
      if (!state) return;

      if (state.observer) {
        state.observer.disconnect();
      }

      if (state.scrollTopBtn) {
        state.scrollTopBtn.remove();
      }

      state.wrapper.remove();
      this.instances.delete(infiniteId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelInfiniteScroll();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$infiniteScroll = (container, options) =>
    bael.create(container, options);
  window.$loadMore = (container, options) =>
    bael.create(container, {
      manualLoad: true,
      ...options,
    });

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelInfiniteScroll = bael;

  console.log("♾️ BAEL Infinite Scroll Component loaded");
})();
