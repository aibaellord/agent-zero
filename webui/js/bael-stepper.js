/**
 * BAEL Stepper/Wizard Component - Lord Of All Wizards
 *
 * Multi-step form/wizard component with:
 * - Horizontal/vertical layouts
 * - Step validation
 * - Navigation controls
 * - Progress tracking
 * - Animations
 * - Multiple themes
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // STEPPER CLASS
  // ============================================================

  class BaelStepper {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-stepper-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-stepper-styles";
      styles.textContent = `
                .bael-stepper {
                    --stepper-color: #4f46e5;
                    --stepper-inactive: #9ca3af;
                    --stepper-bg: #f3f4f6;
                    --stepper-size: 36px;
                    --stepper-line: 2px;
                }

                /* Header with steps */
                .bael-stepper-header {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }

                .bael-stepper-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    position: relative;
                }

                .bael-stepper-step:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    top: calc(var(--stepper-size) / 2);
                    left: calc(50% + var(--stepper-size) / 2 + 8px);
                    right: calc(-50% + var(--stepper-size) / 2 + 8px);
                    height: var(--stepper-line);
                    background: var(--stepper-bg);
                }

                .bael-stepper-step.completed::after {
                    background: var(--stepper-color);
                }

                .bael-stepper-indicator {
                    width: var(--stepper-size);
                    height: var(--stepper-size);
                    border-radius: 50%;
                    background: var(--stepper-bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--stepper-inactive);
                    transition: all 0.2s ease;
                    border: 2px solid transparent;
                    z-index: 1;
                    cursor: pointer;
                }

                .bael-stepper-step.active .bael-stepper-indicator {
                    background: var(--stepper-color);
                    color: white;
                    border-color: var(--stepper-color);
                }

                .bael-stepper-step.completed .bael-stepper-indicator {
                    background: var(--stepper-color);
                    color: white;
                }

                .bael-stepper-step.completed .bael-stepper-indicator::before {
                    content: '✓';
                }

                .bael-stepper-step.error .bael-stepper-indicator {
                    background: #fee2e2;
                    color: #ef4444;
                    border-color: #ef4444;
                }

                .bael-stepper-label {
                    margin-top: 8px;
                    font-size: 0.875rem;
                    color: var(--stepper-inactive);
                    text-align: center;
                    transition: color 0.2s;
                }

                .bael-stepper-step.active .bael-stepper-label,
                .bael-stepper-step.completed .bael-stepper-label {
                    color: #374151;
                }

                .bael-stepper-description {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    text-align: center;
                    margin-top: 4px;
                }

                /* Content */
                .bael-stepper-content {
                    min-height: 200px;
                }

                .bael-stepper-panel {
                    display: none;
                    animation: bael-stepper-fadeIn 0.3s ease;
                }

                .bael-stepper-panel.active {
                    display: block;
                }

                @keyframes bael-stepper-fadeIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Navigation */
                .bael-stepper-navigation {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 24px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .bael-stepper-btn {
                    padding: 10px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .bael-stepper-btn-prev {
                    background: #f3f4f6;
                    color: #374151;
                }

                .bael-stepper-btn-prev:hover {
                    background: #e5e7eb;
                }

                .bael-stepper-btn-prev:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bael-stepper-btn-next {
                    background: var(--stepper-color);
                    color: white;
                }

                .bael-stepper-btn-next:hover {
                    filter: brightness(1.1);
                }

                .bael-stepper-btn-next:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Vertical layout */
                .bael-stepper-vertical {
                    display: flex;
                    gap: 24px;
                }

                .bael-stepper-vertical .bael-stepper-header {
                    flex-direction: column;
                    margin-bottom: 0;
                    min-width: 180px;
                }

                .bael-stepper-vertical .bael-stepper-step {
                    flex-direction: row;
                    align-items: flex-start;
                    gap: 12px;
                    padding-bottom: 24px;
                }

                .bael-stepper-vertical .bael-stepper-step:not(:last-child)::after {
                    top: calc(var(--stepper-size) + 8px);
                    left: calc(var(--stepper-size) / 2);
                    right: auto;
                    width: var(--stepper-line);
                    height: calc(100% - var(--stepper-size) - 8px);
                }

                .bael-stepper-vertical .bael-stepper-step-content {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                .bael-stepper-vertical .bael-stepper-label,
                .bael-stepper-vertical .bael-stepper-description {
                    text-align: left;
                    margin-top: 0;
                }

                .bael-stepper-vertical .bael-stepper-content {
                    flex: 1;
                }

                /* Compact variant */
                .bael-stepper-compact .bael-stepper-indicator {
                    --stepper-size: 28px;
                    font-size: 0.75rem;
                }

                .bael-stepper-compact .bael-stepper-label {
                    font-size: 0.75rem;
                }

                /* Progress variant */
                .bael-stepper-progress .bael-stepper-header {
                    position: relative;
                }

                .bael-stepper-progress-bar {
                    position: absolute;
                    top: calc(var(--stepper-size) / 2);
                    left: 0;
                    right: 0;
                    height: var(--stepper-line);
                    background: var(--stepper-bg);
                    z-index: 0;
                }

                .bael-stepper-progress-fill {
                    height: 100%;
                    background: var(--stepper-color);
                    transition: width 0.3s ease;
                }

                /* Colors */
                .bael-stepper-success { --stepper-color: #10b981; }
                .bael-stepper-warning { --stepper-color: #f59e0b; }
                .bael-stepper-danger { --stepper-color: #ef4444; }
                .bael-stepper-info { --stepper-color: #06b6d4; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE STEPPER
    // ============================================================

    /**
     * Create a stepper
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Stepper container not found");
        return null;
      }

      const id = `bael-stepper-${++this.idCounter}`;
      const config = {
        steps: [],
        currentStep: 0,
        vertical: false,
        compact: false,
        showProgress: false,
        linear: true,
        allowClickNavigation: true,
        color: "primary",
        showNavigation: true,
        prevText: "Previous",
        nextText: "Next",
        finishText: "Finish",
        onStepChange: null,
        onComplete: null,
        onValidate: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        completedSteps: new Set(),
      };

      // Create structure
      this._createStructure(state);
      this._setupEvents(state);
      this._updateUI(state);

      this.instances.set(id, state);

      return {
        id,
        next: () => this.next(id),
        prev: () => this.prev(id),
        goTo: (step) => this.goTo(id, step),
        getCurrentStep: () => state.config.currentStep,
        setStepError: (step, error) => this.setStepError(id, step, error),
        clearStepError: (step) => this.clearStepError(id, step),
        markStepComplete: (step) => this.markStepComplete(id, step),
        reset: () => this.reset(id),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create stepper structure
     */
    _createStructure(state) {
      const { config, container } = state;

      const stepper = document.createElement("div");
      stepper.className = `bael-stepper bael-stepper-${config.color}`;
      stepper.id = state.id;

      if (config.vertical) stepper.classList.add("bael-stepper-vertical");
      if (config.compact) stepper.classList.add("bael-stepper-compact");
      if (config.showProgress) stepper.classList.add("bael-stepper-progress");

      // Header
      const header = document.createElement("div");
      header.className = "bael-stepper-header";

      // Progress bar
      if (config.showProgress) {
        const progressBar = document.createElement("div");
        progressBar.className = "bael-stepper-progress-bar";

        const progressFill = document.createElement("div");
        progressFill.className = "bael-stepper-progress-fill";
        progressBar.appendChild(progressFill);
        header.appendChild(progressBar);

        state.progressFill = progressFill;
      }

      // Steps
      config.steps.forEach((stepConfig, index) => {
        const step = document.createElement("div");
        step.className = "bael-stepper-step";
        step.dataset.step = index;

        const indicator = document.createElement("div");
        indicator.className = "bael-stepper-indicator";
        indicator.textContent = index + 1;
        step.appendChild(indicator);

        const stepContent = document.createElement("div");
        stepContent.className = "bael-stepper-step-content";

        const label = document.createElement("div");
        label.className = "bael-stepper-label";
        label.textContent = stepConfig.label || `Step ${index + 1}`;
        stepContent.appendChild(label);

        if (stepConfig.description) {
          const description = document.createElement("div");
          description.className = "bael-stepper-description";
          description.textContent = stepConfig.description;
          stepContent.appendChild(description);
        }

        step.appendChild(stepContent);
        header.appendChild(step);
      });

      stepper.appendChild(header);
      state.header = header;

      // Content
      const content = document.createElement("div");
      content.className = "bael-stepper-content";

      config.steps.forEach((stepConfig, index) => {
        const panel = document.createElement("div");
        panel.className = "bael-stepper-panel";
        panel.dataset.step = index;

        if (stepConfig.content instanceof Element) {
          panel.appendChild(stepConfig.content);
        } else if (stepConfig.content) {
          panel.innerHTML = stepConfig.content;
        }

        content.appendChild(panel);
      });

      stepper.appendChild(content);
      state.content = content;

      // Navigation
      if (config.showNavigation) {
        const navigation = document.createElement("div");
        navigation.className = "bael-stepper-navigation";

        const prevBtn = document.createElement("button");
        prevBtn.className = "bael-stepper-btn bael-stepper-btn-prev";
        prevBtn.textContent = config.prevText;
        prevBtn.type = "button";
        navigation.appendChild(prevBtn);
        state.prevBtn = prevBtn;

        const nextBtn = document.createElement("button");
        nextBtn.className = "bael-stepper-btn bael-stepper-btn-next";
        nextBtn.textContent = config.nextText;
        nextBtn.type = "button";
        navigation.appendChild(nextBtn);
        state.nextBtn = nextBtn;

        stepper.appendChild(navigation);
      }

      container.appendChild(stepper);
      state.stepper = stepper;
    }

    /**
     * Setup events
     */
    _setupEvents(state) {
      const { config, header } = state;

      // Step click
      header.querySelectorAll(".bael-stepper-step").forEach((step) => {
        step.addEventListener("click", () => {
          if (!config.allowClickNavigation) return;

          const stepIndex = parseInt(step.dataset.step);

          if (config.linear) {
            if (stepIndex <= state.completedSteps.size) {
              this.goTo(state.id, stepIndex);
            }
          } else {
            this.goTo(state.id, stepIndex);
          }
        });
      });

      // Navigation buttons
      if (state.prevBtn) {
        state.prevBtn.addEventListener("click", () => this.prev(state.id));
      }

      if (state.nextBtn) {
        state.nextBtn.addEventListener("click", () => {
          const isLastStep = config.currentStep === config.steps.length - 1;

          if (isLastStep) {
            if (config.onComplete) {
              config.onComplete();
            }
          } else {
            this.next(state.id);
          }
        });
      }
    }

    // ============================================================
    // NAVIGATION
    // ============================================================

    /**
     * Go to next step
     */
    async next(stepperId) {
      const state = this.instances.get(stepperId);
      if (!state) return false;

      const { config } = state;
      const currentStep = config.currentStep;

      // Validate current step
      if (config.onValidate) {
        const isValid = await config.onValidate(currentStep);
        if (!isValid) return false;
      }

      if (currentStep < config.steps.length - 1) {
        state.completedSteps.add(currentStep);
        config.currentStep = currentStep + 1;
        this._updateUI(state);

        if (config.onStepChange) {
          config.onStepChange(config.currentStep, currentStep);
        }

        return true;
      }

      return false;
    }

    /**
     * Go to previous step
     */
    prev(stepperId) {
      const state = this.instances.get(stepperId);
      if (!state) return false;

      const { config } = state;
      const currentStep = config.currentStep;

      if (currentStep > 0) {
        config.currentStep = currentStep - 1;
        this._updateUI(state);

        if (config.onStepChange) {
          config.onStepChange(config.currentStep, currentStep);
        }

        return true;
      }

      return false;
    }

    /**
     * Go to specific step
     */
    async goTo(stepperId, step) {
      const state = this.instances.get(stepperId);
      if (!state) return false;

      const { config } = state;

      if (step < 0 || step >= config.steps.length) return false;

      const currentStep = config.currentStep;

      // If moving forward, validate current step
      if (step > currentStep && config.onValidate) {
        const isValid = await config.onValidate(currentStep);
        if (!isValid) return false;
      }

      config.currentStep = step;
      this._updateUI(state);

      if (config.onStepChange) {
        config.onStepChange(step, currentStep);
      }

      return true;
    }

    /**
     * Reset stepper
     */
    reset(stepperId) {
      const state = this.instances.get(stepperId);
      if (!state) return;

      state.config.currentStep = 0;
      state.completedSteps.clear();
      this._updateUI(state);
    }

    // ============================================================
    // STEP STATE
    // ============================================================

    /**
     * Set step error
     */
    setStepError(stepperId, stepIndex, message) {
      const state = this.instances.get(stepperId);
      if (!state) return;

      const stepEl = state.header.querySelector(
        `.bael-stepper-step[data-step="${stepIndex}"]`,
      );
      if (stepEl) {
        stepEl.classList.add("error");
        stepEl.classList.remove("completed");
      }
    }

    /**
     * Clear step error
     */
    clearStepError(stepperId, stepIndex) {
      const state = this.instances.get(stepperId);
      if (!state) return;

      const stepEl = state.header.querySelector(
        `.bael-stepper-step[data-step="${stepIndex}"]`,
      );
      if (stepEl) {
        stepEl.classList.remove("error");
      }
    }

    /**
     * Mark step complete
     */
    markStepComplete(stepperId, stepIndex) {
      const state = this.instances.get(stepperId);
      if (!state) return;

      state.completedSteps.add(stepIndex);
      this._updateUI(state);
    }

    // ============================================================
    // UI UPDATE
    // ============================================================

    /**
     * Update UI
     */
    _updateUI(state) {
      const { config, header, content, completedSteps } = state;
      const currentStep = config.currentStep;

      // Update steps
      header.querySelectorAll(".bael-stepper-step").forEach((stepEl, index) => {
        stepEl.classList.remove("active", "completed");

        if (index === currentStep) {
          stepEl.classList.add("active");
        } else if (completedSteps.has(index)) {
          stepEl.classList.add("completed");
        }

        // Update indicator number for completed
        const indicator = stepEl.querySelector(".bael-stepper-indicator");
        if (completedSteps.has(index)) {
          indicator.textContent = "";
        } else {
          indicator.textContent = index + 1;
        }
      });

      // Update panels
      content
        .querySelectorAll(".bael-stepper-panel")
        .forEach((panel, index) => {
          panel.classList.toggle("active", index === currentStep);
        });

      // Update progress
      if (state.progressFill) {
        const progress = (currentStep / (config.steps.length - 1)) * 100;
        state.progressFill.style.width = `${progress}%`;
      }

      // Update navigation
      if (state.prevBtn) {
        state.prevBtn.disabled = currentStep === 0;
      }

      if (state.nextBtn) {
        const isLastStep = currentStep === config.steps.length - 1;
        state.nextBtn.textContent = isLastStep
          ? config.finishText
          : config.nextText;
      }
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy stepper
     */
    destroy(stepperId) {
      const state = this.instances.get(stepperId);
      if (!state) return;

      state.stepper.remove();
      this.instances.delete(stepperId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelStepper();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$stepper = (container, options) => bael.create(container, options);
  window.$wizard = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelStepper = bael;

  console.log("🚶 BAEL Stepper Component loaded");
})();
