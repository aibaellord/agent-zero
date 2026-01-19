/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * MOBILE LAYOUT SYSTEM - Responsive Design Controller
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Provides comprehensive responsive design support with:
 * - Breakpoint detection and management
 * - Touch-optimized interactions
 * - Gesture recognition
 * - Adaptive layouts
 * - Mobile-specific UI components
 * - Performance optimizations for mobile devices
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelMobileLayout {
    constructor() {
      // Breakpoints
      this.breakpoints = {
        xs: 0, // Extra small (phones)
        sm: 576, // Small (large phones)
        md: 768, // Medium (tablets)
        lg: 992, // Large (desktops)
        xl: 1200, // Extra large
        xxl: 1400, // Extra extra large
      };

      // Current state
      this.currentBreakpoint = null;
      this.isMobile = false;
      this.isTablet = false;
      this.isDesktop = true;
      this.isTouchDevice = false;
      this.orientation = "portrait";

      // Touch gestures
      this.touchStart = null;
      this.touchEnd = null;
      this.gestures = new Map();

      // Sidebar state
      this.sidebarOpen = false;

      // Initialize
      this.init();
    }

    init() {
      this.detectDevice();
      this.detectBreakpoint();
      this.setupResizeListener();
      this.setupTouchListeners();
      this.setupGestures();
      this.applyMobileStyles();
      this.createMobileUI();
      console.log(
        `📱 Bael Mobile Layout initialized (${this.currentBreakpoint})`,
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // DEVICE DETECTION
    // ═════════════════════════════════════════════════════════════════

    detectDevice() {
      // Touch detection
      this.isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      // Mobile detection (user agent)
      const ua = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        "android",
        "webos",
        "iphone",
        "ipad",
        "ipod",
        "blackberry",
        "windows phone",
      ];
      const isMobileUA = mobileKeywords.some((keyword) => ua.includes(keyword));

      // Set device class
      document.body.classList.toggle("device-touch", this.isTouchDevice);
      document.body.classList.toggle("device-pointer", !this.isTouchDevice);
      document.body.classList.toggle("device-mobile-ua", isMobileUA);

      // Orientation
      this.detectOrientation();
      window.addEventListener("orientationchange", () =>
        this.detectOrientation(),
      );
    }

    detectOrientation() {
      this.orientation =
        window.innerWidth > window.innerHeight ? "landscape" : "portrait";
      document.body.classList.toggle(
        "orientation-landscape",
        this.orientation === "landscape",
      );
      document.body.classList.toggle(
        "orientation-portrait",
        this.orientation === "portrait",
      );
    }

    detectBreakpoint() {
      const width = window.innerWidth;
      let breakpoint = "xs";

      for (const [name, minWidth] of Object.entries(this.breakpoints)) {
        if (width >= minWidth) {
          breakpoint = name;
        }
      }

      const previousBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = breakpoint;

      // Update device type flags
      this.isMobile = ["xs", "sm"].includes(breakpoint);
      this.isTablet = breakpoint === "md";
      this.isDesktop = ["lg", "xl", "xxl"].includes(breakpoint);

      // Update body classes
      Object.keys(this.breakpoints).forEach((bp) => {
        document.body.classList.toggle(`bp-${bp}`, bp === breakpoint);
      });
      document.body.classList.toggle("is-mobile", this.isMobile);
      document.body.classList.toggle("is-tablet", this.isTablet);
      document.body.classList.toggle("is-desktop", this.isDesktop);

      // Emit event if changed
      if (previousBreakpoint !== breakpoint) {
        this.emit("breakpoint-change", {
          from: previousBreakpoint,
          to: breakpoint,
          isMobile: this.isMobile,
          isTablet: this.isTablet,
          isDesktop: this.isDesktop,
        });
      }
    }

    setupResizeListener() {
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.detectBreakpoint();
          this.detectOrientation();
        }, 100);
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // TOUCH & GESTURES
    // ═════════════════════════════════════════════════════════════════

    setupTouchListeners() {
      document.addEventListener(
        "touchstart",
        (e) => {
          this.touchStart = {
            x: e.changedTouches[0].screenX,
            y: e.changedTouches[0].screenY,
            time: Date.now(),
          };
        },
        { passive: true },
      );

      document.addEventListener(
        "touchend",
        (e) => {
          if (!this.touchStart) return;

          this.touchEnd = {
            x: e.changedTouches[0].screenX,
            y: e.changedTouches[0].screenY,
            time: Date.now(),
          };

          this.processGesture();
        },
        { passive: true },
      );
    }

    setupGestures() {
      // Swipe right to open sidebar
      this.registerGesture("swipe-right", {
        minDistance: 100,
        maxTime: 300,
        direction: "right",
        action: () => this.openSidebar(),
      });

      // Swipe left to close sidebar
      this.registerGesture("swipe-left", {
        minDistance: 100,
        maxTime: 300,
        direction: "left",
        action: () => this.closeSidebar(),
      });

      // Swipe down to refresh (pull to refresh)
      this.registerGesture("pull-refresh", {
        minDistance: 80,
        maxTime: 500,
        direction: "down",
        condition: () => window.scrollY === 0,
        action: () => this.triggerRefresh(),
      });
    }

    registerGesture(name, config) {
      this.gestures.set(name, config);
    }

    processGesture() {
      if (!this.touchStart || !this.touchEnd) return;

      const deltaX = this.touchEnd.x - this.touchStart.x;
      const deltaY = this.touchEnd.y - this.touchStart.y;
      const deltaTime = this.touchEnd.time - this.touchStart.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Determine direction
      let direction = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      // Check against registered gestures
      for (const [name, config] of this.gestures) {
        if (
          config.direction === direction &&
          distance >= config.minDistance &&
          deltaTime <= config.maxTime &&
          (!config.condition || config.condition())
        ) {
          config.action();
          this.emit("gesture", { name, direction, distance, deltaTime });
          break;
        }
      }

      // Reset
      this.touchStart = null;
      this.touchEnd = null;
    }

    // ═════════════════════════════════════════════════════════════════
    // MOBILE UI
    // ═════════════════════════════════════════════════════════════════

    createMobileUI() {
      // Create mobile header
      this.createMobileHeader();

      // Create mobile navigation
      this.createMobileNav();

      // Create mobile sidebar overlay
      this.createSidebarOverlay();
    }

    createMobileHeader() {
      if (document.getElementById("bael-mobile-header")) return;

      const header = document.createElement("div");
      header.id = "bael-mobile-header";
      header.className = "bael-mobile-header";
      header.innerHTML = `
                <button class="mobile-menu-btn" id="mobile-menu-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                <div class="mobile-title">
                    <img src="public/bael-favicon.svg" alt="Bael" class="mobile-logo">
                    <span>Bael</span>
                </div>
                <button class="mobile-action-btn" id="mobile-new-chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                </button>
            `;
      document.body.insertBefore(header, document.body.firstChild);

      // Bind events
      header
        .querySelector("#mobile-menu-toggle")
        .addEventListener("click", () => {
          this.toggleSidebar();
        });

      header.querySelector("#mobile-new-chat").addEventListener("click", () => {
        if (window.Alpine && Alpine.store("chats")) {
          Alpine.store("chats").create();
        }
        this.closeSidebar();
      });
    }

    createMobileNav() {
      if (document.getElementById("bael-mobile-nav")) return;

      const nav = document.createElement("div");
      nav.id = "bael-mobile-nav";
      nav.className = "bael-mobile-nav";
      nav.innerHTML = `
                <button class="mobile-nav-btn active" data-tab="chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Chat</span>
                </button>
                <button class="mobile-nav-btn" data-tab="history">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>History</span>
                </button>
                <button class="mobile-nav-btn" data-tab="tools">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                    <span>Tools</span>
                </button>
                <button class="mobile-nav-btn" data-tab="settings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <span>Settings</span>
                </button>
            `;
      document.body.appendChild(nav);

      // Bind tab switching
      nav.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          nav
            .querySelectorAll(".mobile-nav-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          const tab = btn.dataset.tab;
          this.switchMobileTab(tab);
        });
      });
    }

    createSidebarOverlay() {
      if (document.getElementById("bael-sidebar-overlay")) return;

      const overlay = document.createElement("div");
      overlay.id = "bael-sidebar-overlay";
      overlay.className = "bael-sidebar-overlay";
      overlay.addEventListener("click", () => this.closeSidebar());
      document.body.appendChild(overlay);
    }

    switchMobileTab(tab) {
      if (window.Alpine && Alpine.store("tabs")) {
        Alpine.store("tabs").select(tab);
      }
      this.emit("mobile-tab-change", { tab });
    }

    openSidebar() {
      this.sidebarOpen = true;
      document.body.classList.add("sidebar-open");
      this.emit("sidebar-open");
    }

    closeSidebar() {
      this.sidebarOpen = false;
      document.body.classList.remove("sidebar-open");
      this.emit("sidebar-close");
    }

    toggleSidebar() {
      if (this.sidebarOpen) {
        this.closeSidebar();
      } else {
        this.openSidebar();
      }
    }

    triggerRefresh() {
      this.emit("pull-refresh");
      // Reload the page or refresh data
      if (window.location) {
        window.location.reload();
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // MOBILE STYLES
    // ═════════════════════════════════════════════════════════════════

    applyMobileStyles() {
      if (document.getElementById("bael-mobile-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-mobile-styles";
      styles.textContent = `
                /* ═══════════════════════════════════════════════════════════
                   MOBILE LAYOUT SYSTEM
                   ═══════════════════════════════════════════════════════════ */

                /* Mobile Header */
                .bael-mobile-header {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 56px;
                    background: var(--color-panel, #12121a);
                    border-bottom: 1px solid var(--color-border, #2a2a3a);
                    z-index: 1000;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 12px;
                }

                .is-mobile .bael-mobile-header {
                    display: flex;
                }

                .mobile-menu-btn,
                .mobile-action-btn {
                    width: 40px;
                    height: 40px;
                    background: transparent;
                    border: none;
                    color: var(--color-text, #fff);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .mobile-menu-btn:hover,
                .mobile-action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .mobile-menu-btn svg,
                .mobile-action-btn svg {
                    width: 24px;
                    height: 24px;
                }

                .mobile-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .mobile-logo {
                    width: 28px;
                    height: 28px;
                }

                /* Mobile Navigation */
                .bael-mobile-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 64px;
                    background: var(--color-panel, #12121a);
                    border-top: 1px solid var(--color-border, #2a2a3a);
                    z-index: 1000;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0 8px;
                    padding-bottom: env(safe-area-inset-bottom, 0);
                }

                .is-mobile .bael-mobile-nav {
                    display: flex;
                }

                .mobile-nav-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 12px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .mobile-nav-btn.active {
                    color: var(--color-primary, #ff3366);
                }

                .mobile-nav-btn svg {
                    width: 24px;
                    height: 24px;
                }

                .mobile-nav-btn span {
                    font-size: 10px;
                    font-weight: 500;
                }

                /* Sidebar Overlay */
                .bael-sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .is-mobile.sidebar-open .bael-sidebar-overlay {
                    display: block;
                    opacity: 1;
                }

                /* Mobile Sidebar Transform */
                .is-mobile .sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 280px;
                    max-width: 80vw;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                    z-index: 1001;
                }

                .is-mobile.sidebar-open .sidebar {
                    transform: translateX(0);
                }

                /* Mobile Content Adjustments */
                .is-mobile .container {
                    padding-top: 56px;
                    padding-bottom: 64px;
                }

                .is-mobile .chat-container {
                    margin-top: 0;
                }

                .is-mobile .input-area {
                    margin-bottom: 64px;
                }

                /* Touch-friendly Sizing */
                .device-touch button,
                .device-touch .btn {
                    min-height: 44px;
                    min-width: 44px;
                }

                .device-touch input,
                .device-touch textarea,
                .device-touch select {
                    font-size: 16px; /* Prevents zoom on iOS */
                }

                /* Hide Desktop-only Elements on Mobile */
                .is-mobile .desktop-only {
                    display: none !important;
                }

                .is-desktop .mobile-only {
                    display: none !important;
                }

                /* Tablet Adjustments */
                .is-tablet .sidebar {
                    width: 280px;
                }

                .is-tablet .chat-container {
                    max-width: 100%;
                }

                /* Landscape Orientation */
                .orientation-landscape.is-mobile .bael-mobile-nav {
                    width: 64px;
                    height: 100%;
                    top: 56px;
                    left: auto;
                    right: 0;
                    flex-direction: column;
                    border-top: none;
                    border-left: 1px solid var(--color-border, #2a2a3a);
                }

                .orientation-landscape.is-mobile .container {
                    padding-right: 64px;
                    padding-bottom: 0;
                }

                /* Safe Area Support (Notch, etc.) */
                @supports (padding: env(safe-area-inset-bottom)) {
                    .bael-mobile-nav {
                        padding-bottom: calc(8px + env(safe-area-inset-bottom));
                    }

                    .bael-mobile-header {
                        padding-top: env(safe-area-inset-top);
                        height: calc(56px + env(safe-area-inset-top));
                    }
                }

                /* Floating Action Button on Mobile */
                .is-mobile .bael-fab {
                    bottom: 80px;
                }

                /* Mobile-optimized Scrolling */
                .is-mobile .messages-container {
                    -webkit-overflow-scrolling: touch;
                }

                /* Swipe Hint */
                .swipe-hint {
                    position: fixed;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 60px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 0 4px 4px 0;
                    opacity: 0.3;
                    pointer-events: none;
                    transition: opacity 0.3s;
                }

                .sidebar-open .swipe-hint {
                    opacity: 0;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENTS
    // ═════════════════════════════════════════════════════════════════

    emit(event, data = {}) {
      window.dispatchEvent(
        new CustomEvent(`bael:mobile:${event}`, {
          detail: { ...data, isMobile: this.isMobile },
        }),
      );
    }

    on(event, handler) {
      window.addEventListener(`bael:mobile:${event}`, handler);
      return () => window.removeEventListener(`bael:mobile:${event}`, handler);
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    getDeviceInfo() {
      return {
        breakpoint: this.currentBreakpoint,
        isMobile: this.isMobile,
        isTablet: this.isTablet,
        isDesktop: this.isDesktop,
        isTouchDevice: this.isTouchDevice,
        orientation: this.orientation,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
      };
    }

    setBreakpoints(breakpoints) {
      Object.assign(this.breakpoints, breakpoints);
      this.detectBreakpoint();
    }
  }

  // Initialize
  window.BaelMobileLayout = new BaelMobileLayout();
})();
