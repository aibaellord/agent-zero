/**
 * BAEL Infinite Scroll Component - Lord Of All Streams
 *
 * Infinite scrolling:
 * - Auto-load on scroll
 * - Loading indicators
 * - End of content detection
 * - Scroll position restoration
 * - Custom thresholds
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
      if (document.getElementById("bael-infinite-scroll-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-infinite-scroll-styles";
      styles.textContent = `
                .bael-infinite-scroll {
                    position: relative;
                }

                .bael-infinite-scroll-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    gap: 12px;
                    color: #888;
                    font-size: 14px;
                }

                .bael-infinite-scroll-loader.hidden {
                    display: none;
                }

                .bael-infinite-scroll-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: bael-infinite-spin 0.8s linear infinite;
                }

                @keyframes bael-infinite-spin {
                    to { transform: rotate(360deg); }
                }

                .bael-infinite-scroll-end {
                    text-align: center;
                    padding: 24px;
                    color: #666;
                    font-size: 14px;
                }

                .bael-infinite-scroll-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 24px;
                    color: #888;
                    font-size: 14px;
                }

                .bael-infinite-scroll-retry {
                    padding: 8px 20px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 6px;
                    color: #ddd;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-infinite-scroll-retry:hover {
                    background: rgba(255,255,255,0.15);
                }

                .bael-infinite-scroll-sentinel {
                    height: 1px;
                    width: 100%;
                }

                /* Pull to refresh */
                .bael-infinite-scroll-pull {
                    position: absolute;
                    top: -60px;
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    color: #888;
                    font-size: 14px;
                    transition: transform 0.2s;
                }

                .bael-infinite-scroll-pull.visible {
                    transform: translateY(60px);
                }

                .bael-infinite-scroll-pull.refreshing .bael-infinite-scroll-spinner {
                    width: 20px;
                    height: 20px;
                }

                .bael-infinite-scroll-pull-icon {
                    width: 24px;
                    height: 24px;
                    transition: transform 0.2s;
                }

                .bael-infinite-scroll-pull.triggered .bael-infinite-scroll-pull-icon {
                    transform: rotate(180deg);
                }

                /* Skeleton loading */
                .bael-infinite-scroll-skeleton {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                }

                .bael-infinite-scroll-skeleton-item {
                    display: flex;
                    gap: 12px;
                    animation: bael-skeleton-pulse 1.5s ease-in-out infinite;
                }

                .bael-infinite-scroll-skeleton-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                }

                .bael-infinite-scroll-skeleton-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-infinite-scroll-skeleton-line {
                    height: 16px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }

                .bael-infinite-scroll-skeleton-line:first-child {
                    width: 60%;
                }

                .bael-infinite-scroll-skeleton-line:last-child {
                    width: 40%;
                }

                @keyframes bael-skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
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
        console.error("InfiniteScroll container not found");
        return null;
      }

      const id = `bael-infinite-scroll-${++this.idCounter}`;
      const config = {
        threshold: 200, // Pixels from bottom to trigger load
        loadingText: "Loading more...",
        endText: "No more items",
        errorText: "Failed to load",
        retryText: "Retry",
        loader: "spinner", // spinner, skeleton, custom
        skeletonCount: 3,
        pullToRefresh: false,
        pullThreshold: 80,
        pullText: "Pull to refresh",
        releaseText: "Release to refresh",
        refreshingText: "Refreshing...",
        onLoadMore: null, // async function
        onRefresh: null, // async function for pull to refresh
        ...options,
      };

      container.classList.add("bael-infinite-scroll");

      const state = {
        id,
        container,
        config,
        loading: false,
        hasMore: true,
        error: null,
        page: 1,
        observer: null,
        pullDistance: 0,
        isPulling: false,
        isRefreshing: false,
      };

      this._createElements(state);
      this._setupObserver(state);

      if (config.pullToRefresh) {
        this._setupPullToRefresh(state);
      }

      this.instances.set(id, state);

      return {
        id,
        loadMore: () => this._loadMore(state),
        reset: () => this._reset(state),
        setHasMore: (hasMore) => {
          state.hasMore = hasMore;
          this._updateState(state);
        },
        setError: (error) => {
          state.error = error;
          this._updateState(state);
        },
        getPage: () => state.page,
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create loading elements
     */
    _createElements(state) {
      const { container, config } = state;

      // Loader
      state.loaderEl = document.createElement("div");
      state.loaderEl.className = "bael-infinite-scroll-loader hidden";

      if (config.loader === "spinner") {
        state.loaderEl.innerHTML = `
                    <div class="bael-infinite-scroll-spinner"></div>
                    <span>${config.loadingText}</span>
                `;
      } else if (config.loader === "skeleton") {
        state.loaderEl.className = "bael-infinite-scroll-skeleton hidden";
        let skeletonHTML = "";
        for (let i = 0; i < config.skeletonCount; i++) {
          skeletonHTML += `
                        <div class="bael-infinite-scroll-skeleton-item">
                            <div class="bael-infinite-scroll-skeleton-avatar"></div>
                            <div class="bael-infinite-scroll-skeleton-content">
                                <div class="bael-infinite-scroll-skeleton-line"></div>
                                <div class="bael-infinite-scroll-skeleton-line"></div>
                            </div>
                        </div>
                    `;
        }
        state.loaderEl.innerHTML = skeletonHTML;
      }

      container.appendChild(state.loaderEl);

      // End message
      state.endEl = document.createElement("div");
      state.endEl.className = "bael-infinite-scroll-end hidden";
      state.endEl.textContent = config.endText;
      container.appendChild(state.endEl);

      // Error message
      state.errorEl = document.createElement("div");
      state.errorEl.className = "bael-infinite-scroll-error hidden";
      state.errorEl.innerHTML = `
                <span>${config.errorText}</span>
                <button class="bael-infinite-scroll-retry">${config.retryText}</button>
            `;
      state.errorEl
        .querySelector(".bael-infinite-scroll-retry")
        .addEventListener("click", () => {
          state.error = null;
          this._loadMore(state);
        });
      container.appendChild(state.errorEl);

      // Sentinel (for intersection observer)
      state.sentinelEl = document.createElement("div");
      state.sentinelEl.className = "bael-infinite-scroll-sentinel";
      container.appendChild(state.sentinelEl);
    }

    /**
     * Setup intersection observer
     */
    _setupObserver(state) {
      const { config, sentinelEl } = state;

      state.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              state.hasMore &&
              !state.loading &&
              !state.error
            ) {
              this._loadMore(state);
            }
          });
        },
        {
          root: null,
          rootMargin: `${config.threshold}px`,
          threshold: 0,
        },
      );

      state.observer.observe(sentinelEl);
    }

    /**
     * Setup pull to refresh
     */
    _setupPullToRefresh(state) {
      const { container, config } = state;

      // Create pull indicator
      state.pullEl = document.createElement("div");
      state.pullEl.className = "bael-infinite-scroll-pull";
      state.pullEl.innerHTML = `
                <svg class="bael-infinite-scroll-pull-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="7 13 12 18 17 13"/>
                    <polyline points="7 6 12 11 17 6"/>
                </svg>
                <span class="bael-infinite-scroll-pull-text">${config.pullText}</span>
            `;
      container.insertBefore(state.pullEl, container.firstChild);

      let startY = 0;
      let currentY = 0;

      const onTouchStart = (e) => {
        if (container.scrollTop === 0) {
          startY = e.touches[0].clientY;
          state.isPulling = true;
        }
      };

      const onTouchMove = (e) => {
        if (!state.isPulling || state.isRefreshing) return;

        currentY = e.touches[0].clientY;
        state.pullDistance = Math.max(0, currentY - startY);

        if (state.pullDistance > 0) {
          e.preventDefault();
          state.pullEl.classList.add("visible");

          const text = state.pullEl.querySelector(
            ".bael-infinite-scroll-pull-text",
          );
          if (state.pullDistance >= config.pullThreshold) {
            state.pullEl.classList.add("triggered");
            text.textContent = config.releaseText;
          } else {
            state.pullEl.classList.remove("triggered");
            text.textContent = config.pullText;
          }
        }
      };

      const onTouchEnd = async () => {
        if (!state.isPulling) return;

        if (state.pullDistance >= config.pullThreshold && !state.isRefreshing) {
          await this._refresh(state);
        }

        state.isPulling = false;
        state.pullDistance = 0;
        state.pullEl.classList.remove("visible", "triggered");
      };

      container.addEventListener("touchstart", onTouchStart, { passive: true });
      container.addEventListener("touchmove", onTouchMove, { passive: false });
      container.addEventListener("touchend", onTouchEnd);

      state.touchListeners = { onTouchStart, onTouchMove, onTouchEnd };
    }

    /**
     * Load more items
     */
    async _loadMore(state) {
      if (state.loading || !state.hasMore || state.error) return;

      const { config } = state;
      state.loading = true;
      this._updateState(state);

      try {
        if (config.onLoadMore) {
          const result = await config.onLoadMore(state.page);

          if (result === false || (result && result.hasMore === false)) {
            state.hasMore = false;
          } else {
            state.page++;
          }
        }
      } catch (error) {
        console.error("InfiniteScroll load error:", error);
        state.error = error.message || "Failed to load";
      }

      state.loading = false;
      this._updateState(state);
    }

    /**
     * Refresh content (pull to refresh)
     */
    async _refresh(state) {
      const { config } = state;

      state.isRefreshing = true;
      state.pullEl.classList.add("refreshing");
      state.pullEl.classList.add("visible");

      const text = state.pullEl.querySelector(
        ".bael-infinite-scroll-pull-text",
      );
      const icon = state.pullEl.querySelector(
        ".bael-infinite-scroll-pull-icon",
      );
      text.textContent = config.refreshingText;
      icon.outerHTML = '<div class="bael-infinite-scroll-spinner"></div>';

      try {
        if (config.onRefresh) {
          await config.onRefresh();
        }
        state.page = 1;
        state.hasMore = true;
        state.error = null;
      } catch (error) {
        console.error("InfiniteScroll refresh error:", error);
      }

      state.isRefreshing = false;
      state.pullEl.classList.remove("refreshing", "visible");

      // Restore icon
      const spinner = state.pullEl.querySelector(
        ".bael-infinite-scroll-spinner",
      );
      if (spinner) {
        spinner.outerHTML = `
                    <svg class="bael-infinite-scroll-pull-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="7 13 12 18 17 13"/>
                        <polyline points="7 6 12 11 17 6"/>
                    </svg>
                `;
      }
      text.textContent = config.pullText;

      this._updateState(state);
    }

    /**
     * Update UI state
     */
    _updateState(state) {
      const { loaderEl, endEl, errorEl, loading, hasMore, error } = state;

      // Hide all
      loaderEl.classList.add("hidden");
      endEl.classList.add("hidden");
      errorEl.classList.add("hidden");

      if (error) {
        errorEl.classList.remove("hidden");
      } else if (loading) {
        loaderEl.classList.remove("hidden");
      } else if (!hasMore) {
        endEl.classList.remove("hidden");
      }
    }

    /**
     * Reset infinite scroll
     */
    _reset(state) {
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
      this._updateState(state);
    }

    /**
     * Destroy infinite scroll
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      if (state.observer) {
        state.observer.disconnect();
      }

      if (state.touchListeners) {
        const { container } = state;
        container.removeEventListener(
          "touchstart",
          state.touchListeners.onTouchStart,
        );
        container.removeEventListener(
          "touchmove",
          state.touchListeners.onTouchMove,
        );
        container.removeEventListener(
          "touchend",
          state.touchListeners.onTouchEnd,
        );
      }

      state.loaderEl?.remove();
      state.endEl?.remove();
      state.errorEl?.remove();
      state.sentinelEl?.remove();
      state.pullEl?.remove();

      state.container.classList.remove("bael-infinite-scroll");

      this.instances.delete(id);
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
  window.$infinite = window.$infiniteScroll;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelInfiniteScroll = bael;

  console.log("♾️ BAEL Infinite Scroll Component loaded");
})();
