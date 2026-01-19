/**
 * BAEL Avatar Component - Lord Of All Avatars
 *
 * User avatar component with:
 * - Image avatars
 * - Initial/letter avatars
 * - Icon avatars
 * - Multiple sizes
 * - Status indicators
 * - Avatar groups
 * - Fallback handling
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // AVATAR CLASS
  // ============================================================

  class BaelAvatar {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-avatar-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-avatar-styles";
      styles.textContent = `
                .bael-avatar {
                    --avatar-size: 40px;
                    --avatar-bg: #e5e7eb;
                    --avatar-color: #6b7280;

                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: var(--avatar-size);
                    height: var(--avatar-size);
                    border-radius: 50%;
                    background: var(--avatar-bg);
                    color: var(--avatar-color);
                    font-weight: 500;
                    font-size: calc(var(--avatar-size) * 0.4);
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .bael-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .bael-avatar-icon {
                    width: 60%;
                    height: 60%;
                }

                /* Sizes */
                .bael-avatar-xs { --avatar-size: 24px; }
                .bael-avatar-sm { --avatar-size: 32px; }
                .bael-avatar-md { --avatar-size: 40px; }
                .bael-avatar-lg { --avatar-size: 56px; }
                .bael-avatar-xl { --avatar-size: 80px; }
                .bael-avatar-2xl { --avatar-size: 120px; }

                /* Shapes */
                .bael-avatar-circle { border-radius: 50%; }
                .bael-avatar-square { border-radius: 8px; }
                .bael-avatar-rounded { border-radius: 12px; }

                /* Colors */
                .bael-avatar-primary { --avatar-bg: #eef2ff; --avatar-color: #4f46e5; }
                .bael-avatar-success { --avatar-bg: #d1fae5; --avatar-color: #059669; }
                .bael-avatar-warning { --avatar-bg: #fef3c7; --avatar-color: #d97706; }
                .bael-avatar-danger { --avatar-bg: #fee2e2; --avatar-color: #dc2626; }
                .bael-avatar-info { --avatar-bg: #cffafe; --avatar-color: #0891b2; }
                .bael-avatar-dark { --avatar-bg: #374151; --avatar-color: white; }

                /* Status indicator */
                .bael-avatar-status {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: calc(var(--avatar-size) * 0.3);
                    height: calc(var(--avatar-size) * 0.3);
                    min-width: 10px;
                    min-height: 10px;
                    border-radius: 50%;
                    border: 2px solid white;
                    background: #9ca3af;
                }

                .bael-avatar-status-online { background: #10b981; }
                .bael-avatar-status-offline { background: #9ca3af; }
                .bael-avatar-status-busy { background: #ef4444; }
                .bael-avatar-status-away { background: #f59e0b; }
                .bael-avatar-status-dnd { background: #ef4444; }

                /* Border */
                .bael-avatar-bordered {
                    border: 3px solid white;
                    box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
                }

                /* Avatar group */
                .bael-avatar-group {
                    display: inline-flex;
                    flex-direction: row-reverse;
                }

                .bael-avatar-group .bael-avatar {
                    margin-left: -10px;
                    border: 2px solid white;
                    transition: transform 0.15s, z-index 0.15s;
                }

                .bael-avatar-group .bael-avatar:last-child {
                    margin-left: 0;
                }

                .bael-avatar-group .bael-avatar:hover {
                    transform: translateY(-4px);
                    z-index: 10;
                }

                .bael-avatar-group-more {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: #e5e7eb;
                    color: #374151;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                /* Clickable */
                .bael-avatar-clickable {
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s;
                }

                .bael-avatar-clickable:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                /* With name */
                .bael-avatar-with-name {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-avatar-name {
                    display: flex;
                    flex-direction: column;
                }

                .bael-avatar-name-primary {
                    font-weight: 500;
                    color: #374151;
                }

                .bael-avatar-name-secondary {
                    font-size: 0.875rem;
                    color: #6b7280;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE AVATAR
    // ============================================================

    /**
     * Create an avatar
     */
    create(options = {}) {
      const id = `bael-avatar-${++this.idCounter}`;
      const config = {
        src: null,
        alt: "",
        name: "",
        initials: "",
        icon: null,
        size: "md",
        shape: "circle",
        color: "primary",
        status: null,
        bordered: false,
        clickable: false,
        onClick: null,
        customClass: "",
        ...options,
      };

      const avatar = document.createElement("div");
      avatar.id = id;
      avatar.className = this._buildClassName(config);

      // Content
      if (config.src) {
        const img = document.createElement("img");
        img.className = "bael-avatar-img";
        img.src = config.src;
        img.alt = config.alt || config.name;
        img.onerror = () => {
          img.remove();
          this._addFallback(avatar, config);
        };
        avatar.appendChild(img);
      } else if (config.icon) {
        const iconWrapper = document.createElement("span");
        iconWrapper.className = "bael-avatar-icon";
        iconWrapper.innerHTML = config.icon;
        avatar.appendChild(iconWrapper);
      } else {
        this._addFallback(avatar, config);
      }

      // Status
      if (config.status) {
        const status = document.createElement("span");
        status.className = `bael-avatar-status bael-avatar-status-${config.status}`;
        avatar.appendChild(status);
      }

      // Click handler
      if (config.clickable || config.onClick) {
        avatar.classList.add("bael-avatar-clickable");
        avatar.onclick = config.onClick;
      }

      const state = { id, avatar, config };
      this.instances.set(id, state);

      return {
        id,
        element: avatar,
        setImage: (src) => this.setImage(id, src),
        setStatus: (status) => this.setStatus(id, status),
        setInitials: (initials) => this.setInitials(id, initials),
      };
    }

    /**
     * Build class name
     */
    _buildClassName(config) {
      const classes = ["bael-avatar"];

      classes.push(`bael-avatar-${config.size}`);
      classes.push(`bael-avatar-${config.shape}`);

      if (!config.src) {
        classes.push(`bael-avatar-${config.color}`);
      }

      if (config.bordered) classes.push("bael-avatar-bordered");
      if (config.customClass) classes.push(config.customClass);

      return classes.join(" ");
    }

    /**
     * Add fallback content
     */
    _addFallback(avatar, config) {
      const initials = config.initials || this._getInitials(config.name);
      avatar.textContent = initials;
    }

    /**
     * Get initials from name
     */
    _getInitials(name) {
      if (!name) return "?";

      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }

      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }

    // ============================================================
    // AVATAR WITH NAME
    // ============================================================

    /**
     * Create avatar with name display
     */
    createWithName(options = {}) {
      const config = {
        primaryName: "",
        secondaryName: "",
        ...options,
      };

      const wrapper = document.createElement("div");
      wrapper.className = "bael-avatar-with-name";

      // Create avatar
      const avatar = this.create({
        ...config,
        name: config.primaryName || config.name,
      });

      wrapper.appendChild(avatar.element);

      // Name section
      if (config.primaryName || config.secondaryName) {
        const nameWrapper = document.createElement("div");
        nameWrapper.className = "bael-avatar-name";

        if (config.primaryName) {
          const primary = document.createElement("span");
          primary.className = "bael-avatar-name-primary";
          primary.textContent = config.primaryName;
          nameWrapper.appendChild(primary);
        }

        if (config.secondaryName) {
          const secondary = document.createElement("span");
          secondary.className = "bael-avatar-name-secondary";
          secondary.textContent = config.secondaryName;
          nameWrapper.appendChild(secondary);
        }

        wrapper.appendChild(nameWrapper);
      }

      return {
        ...avatar,
        wrapper,
      };
    }

    // ============================================================
    // AVATAR GROUP
    // ============================================================

    /**
     * Create avatar group
     */
    createGroup(container, avatars = [], options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) return null;

      const id = `bael-avatar-group-${++this.idCounter}`;
      const config = {
        max: 5,
        size: "md",
        showMore: true,
        ...options,
      };

      const group = document.createElement("div");
      group.id = id;
      group.className = "bael-avatar-group";

      const avatarInstances = [];
      const displayCount = Math.min(avatars.length, config.max);
      const remaining = avatars.length - displayCount;

      // Create avatars in reverse order for stacking
      for (let i = displayCount - 1; i >= 0; i--) {
        const avatarConfig =
          typeof avatars[i] === "string" ? { src: avatars[i] } : avatars[i];

        const avatar = this.create({
          size: config.size,
          bordered: true,
          ...avatarConfig,
        });

        avatar.element.style.zIndex = displayCount - i;
        group.appendChild(avatar.element);
        avatarInstances.push(avatar);
      }

      // Show remaining count
      if (config.showMore && remaining > 0) {
        const more = document.createElement("div");
        more.className = `bael-avatar bael-avatar-${config.size} bael-avatar-group-more`;
        more.textContent = `+${remaining}`;
        more.style.zIndex = 0;
        group.insertBefore(more, group.firstChild);
      }

      container.appendChild(group);

      return {
        id,
        element: group,
        avatars: avatarInstances,
        count: avatars.length,
      };
    }

    // ============================================================
    // UPDATES
    // ============================================================

    /**
     * Set avatar image
     */
    setImage(avatarId, src) {
      const state = this.instances.get(avatarId);
      if (!state) return;

      const { avatar, config } = state;
      config.src = src;

      // Remove existing content
      avatar.textContent = "";

      const img = document.createElement("img");
      img.className = "bael-avatar-img";
      img.src = src;
      img.alt = config.alt || config.name;
      img.onerror = () => {
        img.remove();
        this._addFallback(avatar, config);
      };

      avatar.insertBefore(img, avatar.firstChild);
    }

    /**
     * Set status
     */
    setStatus(avatarId, status) {
      const state = this.instances.get(avatarId);
      if (!state) return;

      const { avatar, config } = state;

      // Remove existing status
      const existingStatus = avatar.querySelector(".bael-avatar-status");
      if (existingStatus) {
        existingStatus.remove();
      }

      if (status) {
        const statusEl = document.createElement("span");
        statusEl.className = `bael-avatar-status bael-avatar-status-${status}`;
        avatar.appendChild(statusEl);
      }

      config.status = status;
    }

    /**
     * Set initials
     */
    setInitials(avatarId, initials) {
      const state = this.instances.get(avatarId);
      if (!state) return;

      const { avatar, config } = state;

      // Remove image if exists
      const img = avatar.querySelector("img");
      if (img) img.remove();

      config.initials = initials;
      config.src = null;

      // Clear and set initials
      avatar.textContent = initials;
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy avatar
     */
    destroy(avatarId) {
      const state = this.instances.get(avatarId);
      if (!state) return;

      state.avatar.remove();
      this.instances.delete(avatarId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelAvatar();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$avatar = (options) => bael.create(options);
  window.$avatarWithName = (options) => bael.createWithName(options);
  window.$avatarGroup = (container, avatars, options) =>
    bael.createGroup(container, avatars, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelAvatar = bael;

  console.log("👤 BAEL Avatar Component loaded");
})();
