/**
 * BAEL Progress Steps Component - Lord Of All Journeys
 *
 * Step indicator / progress wizard:
 * - Horizontal / vertical layout
 * - Active, completed, pending states
 * - Icons or numbers
 * - Descriptions
 * - Clickable navigation
 * - Connector lines
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // PROGRESS STEPS CLASS
  // ============================================================

  class BaelProgressSteps {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-progresssteps-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-progresssteps-styles";
      styles.textContent = `
                .bael-progresssteps {
                    display: flex;
                    align-items: flex-start;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-progresssteps.vertical {
                    flex-direction: column;
                }

                /* Step */
                .bael-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    position: relative;
                }

                .bael-progresssteps.vertical .bael-step {
                    flex-direction: row;
                    flex: 0 0 auto;
                    min-height: 60px;
                }

                .bael-step.clickable {
                    cursor: pointer;
                }

                .bael-step.clickable:hover .bael-step-indicator {
                    transform: scale(1.1);
                }

                /* Indicator */
                .bael-step-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.15);
                    border-radius: 50%;
                    font-size: 14px;
                    font-weight: 600;
                    color: #666;
                    transition: all 0.2s ease;
                    position: relative;
                    z-index: 2;
                }

                .bael-step-indicator svg {
                    width: 18px;
                    height: 18px;
                }

                /* Active state */
                .bael-step.active .bael-step-indicator {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: #3b82f6;
                    color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
                }

                /* Completed state */
                .bael-step.completed .bael-step-indicator {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                }

                /* Error state */
                .bael-step.error .bael-step-indicator {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* Content */
                .bael-step-content {
                    text-align: center;
                    margin-top: 10px;
                }

                .bael-progresssteps.vertical .bael-step-content {
                    text-align: left;
                    margin-top: 0;
                    margin-left: 14px;
                    padding-bottom: 24px;
                }

                .bael-step-title {
                    font-size: 13px;
                    font-weight: 500;
                    color: #888;
                    transition: color 0.2s;
                }

                .bael-step.active .bael-step-title,
                .bael-step.completed .bael-step-title {
                    color: #ddd;
                }

                .bael-step-description {
                    font-size: 11px;
                    color: #666;
                    margin-top: 3px;
                    max-width: 120px;
                }

                .bael-progresssteps.vertical .bael-step-description {
                    max-width: 300px;
                }

                /* Connector line - horizontal */
                .bael-step-connector {
                    position: absolute;
                    top: 18px;
                    left: calc(50% + 22px);
                    right: calc(-50% + 22px);
                    height: 2px;
                    background: rgba(255,255,255,0.1);
                    z-index: 1;
                }

                .bael-step-connector::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 0%;
                    background: #3b82f6;
                    transition: width 0.3s ease;
                }

                .bael-step.completed .bael-step-connector::after {
                    width: 100%;
                }

                .bael-step:last-child .bael-step-connector {
                    display: none;
                }

                /* Connector line - vertical */
                .bael-progresssteps.vertical .bael-step-connector {
                    top: 40px;
                    bottom: 0;
                    left: 17px;
                    right: auto;
                    width: 2px;
                    height: auto;
                }

                .bael-progresssteps.vertical .bael-step-connector::after {
                    width: 100%;
                    height: 0%;
                    transition: height 0.3s ease;
                }

                .bael-progresssteps.vertical .bael-step.completed .bael-step-connector::after {
                    height: 100%;
                }

                /* Size: Small */
                .bael-progresssteps.small .bael-step-indicator {
                    width: 28px;
                    height: 28px;
                    font-size: 12px;
                }

                .bael-progresssteps.small .bael-step-indicator svg {
                    width: 14px;
                    height: 14px;
                }

                .bael-progresssteps.small .bael-step-connector {
                    top: 14px;
                    left: calc(50% + 18px);
                    right: calc(-50% + 18px);
                }

                .bael-progresssteps.small.vertical .bael-step-connector {
                    top: 32px;
                    left: 13px;
                }

                .bael-progresssteps.small .bael-step-title {
                    font-size: 12px;
                }

                .bael-progresssteps.small .bael-step-description {
                    font-size: 10px;
                }

                /* Size: Large */
                .bael-progresssteps.large .bael-step-indicator {
                    width: 48px;
                    height: 48px;
                    font-size: 18px;
                }

                .bael-progresssteps.large .bael-step-indicator svg {
                    width: 24px;
                    height: 24px;
                }

                .bael-progresssteps.large .bael-step-connector {
                    top: 24px;
                    left: calc(50% + 28px);
                    right: calc(-50% + 28px);
                }

                .bael-progresssteps.large.vertical .bael-step-connector {
                    top: 52px;
                    left: 23px;
                }

                .bael-progresssteps.large .bael-step-title {
                    font-size: 15px;
                }

                .bael-progresssteps.large .bael-step-description {
                    font-size: 12px;
                }

                /* Color variants */
                .bael-progresssteps.green .bael-step.active .bael-step-indicator {
                    background: rgba(34, 197, 94, 0.2);
                    border-color: #22c55e;
                    color: #22c55e;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
                }

                .bael-progresssteps.green .bael-step.completed .bael-step-indicator {
                    background: #22c55e;
                    border-color: #22c55e;
                }

                .bael-progresssteps.green .bael-step.completed .bael-step-connector::after,
                .bael-progresssteps.green .bael-step-connector::after {
                    background: #22c55e;
                }

                .bael-progresssteps.purple .bael-step.active .bael-step-indicator {
                    background: rgba(139, 92, 246, 0.2);
                    border-color: #8b5cf6;
                    color: #8b5cf6;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
                }

                .bael-progresssteps.purple .bael-step.completed .bael-step-indicator {
                    background: #8b5cf6;
                    border-color: #8b5cf6;
                }

                .bael-progresssteps.purple .bael-step-connector::after {
                    background: #8b5cf6;
                }

                /* Dot variant */
                .bael-progresssteps.dots .bael-step-indicator {
                    width: 12px;
                    height: 12px;
                    font-size: 0;
                    border-width: 0;
                }

                .bael-progresssteps.dots .bael-step-indicator svg {
                    display: none;
                }

                .bael-progresssteps.dots .bael-step.active .bael-step-indicator {
                    width: 16px;
                    height: 16px;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }

                .bael-progresssteps.dots .bael-step-connector {
                    top: 5px;
                    left: calc(50% + 10px);
                    right: calc(-50% + 10px);
                }

                .bael-progresssteps.dots .bael-step.active + .bael-step .bael-step-connector,
                .bael-progresssteps.dots .bael-step.completed + .bael-step .bael-step-connector {
                    top: 7px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _checkIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
    _errorIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    // ============================================================
    // CREATE PROGRESS STEPS
    // ============================================================

    /**
     * Create progress steps
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Progress steps container not found");
        return null;
      }

      const id = `bael-progresssteps-${++this.idCounter}`;
      const config = {
        steps: [], // [{ title, description?, icon?, status? }]
        current: 0, // Current step index (0-based)
        clickable: false, // Allow clicking to navigate
        vertical: false,
        size: "default", // small, default, large
        color: "blue", // blue, green, purple
        variant: "default", // default, dots
        showNumbers: true, // Show step numbers if no icon
        onChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-progresssteps";
      if (config.vertical) el.classList.add("vertical");
      if (config.size !== "default") el.classList.add(config.size);
      if (config.color !== "blue") el.classList.add(config.color);
      if (config.variant !== "default") el.classList.add(config.variant);
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        current: config.current,
        stepEls: [],
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getCurrent: () => state.current,
        setCurrent: (i) => this._setCurrent(state, i),
        next: () => this._next(state),
        prev: () => this._prev(state),
        setStepStatus: (i, status) => this._setStepStatus(state, i, status),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render steps
     */
    _render(state) {
      const { element, config } = state;

      config.steps.forEach((step, i) => {
        const stepEl = document.createElement("div");
        stepEl.className = "bael-step";
        if (config.clickable) stepEl.classList.add("clickable");
        stepEl.dataset.index = i;

        // Set status
        this._applyStepStatus(stepEl, step, i, state.current);

        // Indicator
        const indicator = document.createElement("div");
        indicator.className = "bael-step-indicator";

        if (step.icon) {
          indicator.innerHTML = step.icon;
        } else if (config.variant === "dots") {
          // Empty for dots
        } else if (step.status === "completed") {
          indicator.innerHTML = this._checkIcon;
        } else if (step.status === "error") {
          indicator.innerHTML = this._errorIcon;
        } else if (config.showNumbers) {
          indicator.textContent = i + 1;
        }

        stepEl.appendChild(indicator);

        // Connector (except last)
        if (i < config.steps.length - 1) {
          const connector = document.createElement("div");
          connector.className = "bael-step-connector";
          stepEl.appendChild(connector);
        }

        // Content
        const content = document.createElement("div");
        content.className = "bael-step-content";

        if (step.title) {
          const title = document.createElement("div");
          title.className = "bael-step-title";
          title.textContent = step.title;
          content.appendChild(title);
        }

        if (step.description) {
          const desc = document.createElement("div");
          desc.className = "bael-step-description";
          desc.textContent = step.description;
          content.appendChild(desc);
        }

        stepEl.appendChild(content);

        state.stepEls.push(stepEl);
        element.appendChild(stepEl);
      });
    }

    /**
     * Apply step status class
     */
    _applyStepStatus(stepEl, step, index, current) {
      stepEl.classList.remove("active", "completed", "error", "pending");

      if (step.status === "error") {
        stepEl.classList.add("error");
      } else if (step.status === "completed" || index < current) {
        stepEl.classList.add("completed");
      } else if (index === current) {
        stepEl.classList.add("active");
      } else {
        stepEl.classList.add("pending");
      }
    }

    /**
     * Update indicator content
     */
    _updateIndicator(state, stepEl, step, index) {
      const indicator = stepEl.querySelector(".bael-step-indicator");
      if (!indicator) return;

      if (step.icon) {
        indicator.innerHTML = step.icon;
      } else if (state.config.variant === "dots") {
        indicator.innerHTML = "";
      } else if (stepEl.classList.contains("completed") && !step.icon) {
        indicator.innerHTML = this._checkIcon;
      } else if (stepEl.classList.contains("error")) {
        indicator.innerHTML = this._errorIcon;
      } else if (state.config.showNumbers) {
        indicator.textContent = index + 1;
      }
    }

    /**
     * Set current step
     */
    _setCurrent(state, index) {
      if (index < 0 || index >= state.config.steps.length) return;

      const changed = state.current !== index;
      state.current = index;

      // Update all steps
      state.stepEls.forEach((stepEl, i) => {
        const step = state.config.steps[i];
        this._applyStepStatus(stepEl, step, i, index);
        this._updateIndicator(state, stepEl, step, i);
      });

      if (changed && state.config.onChange) {
        state.config.onChange(index);
      }
    }

    /**
     * Set step status
     */
    _setStepStatus(state, index, status) {
      if (index < 0 || index >= state.config.steps.length) return;

      state.config.steps[index].status = status;

      const stepEl = state.stepEls[index];
      const step = state.config.steps[index];
      this._applyStepStatus(stepEl, step, index, state.current);
      this._updateIndicator(state, stepEl, step, index);
    }

    /**
     * Go to next step
     */
    _next(state) {
      if (state.current < state.config.steps.length - 1) {
        this._setCurrent(state, state.current + 1);
      }
    }

    /**
     * Go to previous step
     */
    _prev(state) {
      if (state.current > 0) {
        this._setCurrent(state, state.current - 1);
      }
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      if (!state.config.clickable) return;

      state.stepEls.forEach((stepEl, i) => {
        stepEl.addEventListener("click", () => {
          this._setCurrent(state, i);
        });
      });
    }

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelProgressSteps();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$steps = (container, options) => bael.create(container, options);
  window.$wizard = (container, options) => bael.create(container, options);
  window.$progressSteps = (container, options) =>
    bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelProgressSteps = bael;

  console.log("🚶 BAEL Progress Steps loaded");
})();
