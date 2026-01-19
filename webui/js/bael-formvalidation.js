/**
 * BAEL Form Validation Component - Lord Of All Validation
 *
 * Form validation utilities:
 * - Field validators
 * - Real-time validation
 * - Custom rules
 * - Error messages
 * - Form state management
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function() {
    'use strict';

    // ============================================================
    // FORM VALIDATION CLASS
    // ============================================================

    class BaelFormValidation {
        constructor() {
            this.forms = new Map();
            this.idCounter = 0;

            // Built-in validators
            this.validators = {
                required: (value) => {
                    if (typeof value === 'string') return value.trim().length > 0;
                    if (Array.isArray(value)) return value.length > 0;
                    return value !== null && value !== undefined;
                },
                email: (value) => {
                    if (!value) return true;
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                url: (value) => {
                    if (!value) return true;
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return false;
                    }
                },
                minLength: (value, min) => {
                    if (!value) return true;
                    return String(value).length >= min;
                },
                maxLength: (value, max) => {
                    if (!value) return true;
                    return String(value).length <= max;
                },
                min: (value, min) => {
                    if (!value && value !== 0) return true;
                    return Number(value) >= min;
                },
                max: (value, max) => {
                    if (!value && value !== 0) return true;
                    return Number(value) <= max;
                },
                pattern: (value, regex) => {
                    if (!value) return true;
                    const re = typeof regex === 'string' ? new RegExp(regex) : regex;
                    return re.test(value);
                },
                number: (value) => {
                    if (!value && value !== 0) return true;
                    return !isNaN(Number(value));
                },
                integer: (value) => {
                    if (!value && value !== 0) return true;
                    return Number.isInteger(Number(value));
                },
                alpha: (value) => {
                    if (!value) return true;
                    return /^[a-zA-Z]+$/.test(value);
                },
                alphanumeric: (value) => {
                    if (!value) return true;
                    return /^[a-zA-Z0-9]+$/.test(value);
                },
                phone: (value) => {
                    if (!value) return true;
                    return /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 7;
                },
                date: (value) => {
                    if (!value) return true;
                    const d = new Date(value);
                    return !isNaN(d.getTime());
                },
                matches: (value, fieldName, formData) => {
                    return value === formData[fieldName];
                },
                custom: (value, validator) => {
                    return validator(value);
                }
            };

            // Default error messages
            this.messages = {
                required: 'This field is required',
                email: 'Please enter a valid email address',
                url: 'Please enter a valid URL',
                minLength: 'Must be at least {0} characters',
                maxLength: 'Must be no more than {0} characters',
                min: 'Must be at least {0}',
                max: 'Must be no more than {0}',
                pattern: 'Please match the required format',
                number: 'Please enter a valid number',
                integer: 'Please enter a whole number',
                alpha: 'Only letters are allowed',
                alphanumeric: 'Only letters and numbers are allowed',
                phone: 'Please enter a valid phone number',
                date: 'Please enter a valid date',
                matches: 'Fields do not match'
            };

            this._injectStyles();
        }

        /**
         * Inject validation styles
         */
        _injectStyles() {
            if (document.getElementById('bael-validation-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'bael-validation-styles';
            styles.textContent = `
                /* Form field states */
                .bael-field-wrapper {
                    position: relative;
                    margin-bottom: 16px;
                }

                .bael-field-wrapper.valid input,
                .bael-field-wrapper.valid textarea,
                .bael-field-wrapper.valid select {
                    border-color: var(--success, #4caf50) !important;
                }

                .bael-field-wrapper.invalid input,
                .bael-field-wrapper.invalid textarea,
                .bael-field-wrapper.invalid select {
                    border-color: var(--error, #f44336) !important;
                }

                .bael-field-wrapper.valid input:focus,
                .bael-field-wrapper.valid textarea:focus,
                .bael-field-wrapper.valid select:focus {
                    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
                }

                .bael-field-wrapper.invalid input:focus,
                .bael-field-wrapper.invalid textarea:focus,
                .bael-field-wrapper.invalid select:focus {
                    box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.2);
                }

                /* Error message */
                .bael-field-error {
                    font-size: 0.75rem;
                    color: var(--error, #f44336);
                    margin-top: 4px;
                    display: none;
                    animation: bael-error-slide 0.2s ease;
                }

                .bael-field-wrapper.invalid .bael-field-error {
                    display: block;
                }

                @keyframes bael-error-slide {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Valid icon */
                .bael-field-valid-icon {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 18px;
                    height: 18px;
                    color: var(--success, #4caf50);
                    display: none;
                }

                .bael-field-wrapper.valid .bael-field-valid-icon {
                    display: block;
                }

                /* Strength meter */
                .bael-password-strength {
                    height: 4px;
                    border-radius: 2px;
                    margin-top: 4px;
                    background: var(--border-color, #444);
                    overflow: hidden;
                }

                .bael-password-strength-bar {
                    height: 100%;
                    width: 0;
                    transition: width 0.3s, background 0.3s;
                }

                .bael-password-strength.weak .bael-password-strength-bar {
                    width: 25%;
                    background: #f44336;
                }

                .bael-password-strength.fair .bael-password-strength-bar {
                    width: 50%;
                    background: #ff9800;
                }

                .bael-password-strength.good .bael-password-strength-bar {
                    width: 75%;
                    background: #ffeb3b;
                }

                .bael-password-strength.strong .bael-password-strength-bar {
                    width: 100%;
                    background: #4caf50;
                }

                .bael-password-strength-label {
                    font-size: 0.75rem;
                    margin-top: 4px;
                    color: var(--text-muted, #888);
                }

                /* Submit button disabled */
                .bael-form-invalid [type="submit"] {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Character counter */
                .bael-char-counter {
                    font-size: 0.75rem;
                    color: var(--text-muted, #888);
                    text-align: right;
                    margin-top: 4px;
                }

                .bael-char-counter.warning {
                    color: var(--warning, #ff9800);
                }

                .bael-char-counter.error {
                    color: var(--error, #f44336);
                }
            `;
            document.head.appendChild(styles);
        }

        // ============================================================
        // FORM METHODS
        // ============================================================

        /**
         * Initialize form validation
         */
        create(form, options = {}) {
            if (typeof form === 'string') {
                form = document.querySelector(form);
            }
            if (!form) return null;

            const id = `bael-form-${++this.idCounter}`;

            const state = {
                id,
                form,
                fields: new Map(),
                config: {
                    validateOnBlur: options.validateOnBlur !== false,
                    validateOnInput: options.validateOnInput !== false,
                    validateOnSubmit: options.validateOnSubmit !== false,
                    showValidIcon: options.showValidIcon !== false,
                    disableSubmitUntilValid: options.disableSubmitUntilValid || false,
                    onSubmit: options.onSubmit,
                    onError: options.onError,
                    onValid: options.onValid
                },
                isValid: false
            };

            // Parse field rules from data attributes or options
            if (options.rules) {
                Object.entries(options.rules).forEach(([fieldName, rules]) => {
                    const field = form.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        this._setupField(state, field, rules);
                    }
                });
            }

            // Auto-detect fields with validation attributes
            const fields = form.querySelectorAll('[data-validate], [required]');
            fields.forEach(field => {
                if (!state.fields.has(field.name)) {
                    const rules = this._parseDataRules(field);
                    if (Object.keys(rules).length > 0) {
                        this._setupField(state, field, rules);
                    }
                }
            });

            // Submit handling
            form.addEventListener('submit', (e) => this._handleSubmit(state, e));

            this.forms.set(id, state);

            return {
                id,
                addField: (name, rules) => this._addField(state, name, rules),
                removeField: (name) => this._removeField(state, name),
                validate: () => this._validateForm(state),
                validateField: (name) => this._validateField(state, name),
                reset: () => this._resetForm(state),
                getErrors: () => this._getErrors(state),
                isValid: () => state.isValid,
                getValues: () => this._getFormValues(state),
                destroy: () => this.destroy(id)
            };
        }

        /**
         * Setup field validation
         */
        _setupField(state, field, rules) {
            const wrapper = this._wrapField(field, state.config.showValidIcon);

            const fieldState = {
                field,
                wrapper,
                rules,
                isValid: true,
                errors: []
            };

            state.fields.set(field.name, fieldState);

            // Validation events
            if (state.config.validateOnBlur) {
                field.addEventListener('blur', () => this._validateField(state, field.name));
            }

            if (state.config.validateOnInput) {
                field.addEventListener('input', () => {
                    // Debounce
                    clearTimeout(field._validateTimeout);
                    field._validateTimeout = setTimeout(() => {
                        this._validateField(state, field.name);
                    }, 300);
                });
            }
        }

        /**
         * Wrap field with validation container
         */
        _wrapField(field, showValidIcon) {
            // Check if already wrapped
            if (field.parentElement.classList.contains('bael-field-wrapper')) {
                return field.parentElement;
            }

            const wrapper = document.createElement('div');
            wrapper.className = 'bael-field-wrapper';

            field.parentNode.insertBefore(wrapper, field);
            wrapper.appendChild(field);

            // Add error message element
            const errorEl = document.createElement('div');
            errorEl.className = 'bael-field-error';
            wrapper.appendChild(errorEl);

            // Add valid icon
            if (showValidIcon) {
                const validIcon = document.createElement('span');
                validIcon.className = 'bael-field-valid-icon';
                validIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>`;
                wrapper.appendChild(validIcon);
            }

            return wrapper;
        }

        /**
         * Parse validation rules from data attributes
         */
        _parseDataRules(field) {
            const rules = {};

            if (field.required) {
                rules.required = true;
            }

            if (field.type === 'email') {
                rules.email = true;
            }

            if (field.type === 'url') {
                rules.url = true;
            }

            if (field.type === 'number') {
                rules.number = true;
            }

            if (field.minLength) {
                rules.minLength = parseInt(field.minLength);
            }

            if (field.maxLength) {
                rules.maxLength = parseInt(field.maxLength);
            }

            if (field.min) {
                rules.min = parseFloat(field.min);
            }

            if (field.max) {
                rules.max = parseFloat(field.max);
            }

            if (field.pattern) {
                rules.pattern = field.pattern;
            }

            // Custom data-validate attribute
            const validateAttr = field.dataset.validate;
            if (validateAttr) {
                validateAttr.split(' ').forEach(rule => {
                    const [name, param] = rule.split(':');
                    rules[name] = param ? (isNaN(param) ? param : Number(param)) : true;
                });
            }

            // Custom message
            if (field.dataset.message) {
                rules._message = field.dataset.message;
            }

            return rules;
        }

        // ============================================================
        // VALIDATION
        // ============================================================

        /**
         * Validate single field
         */
        _validateField(state, fieldName) {
            const fieldState = state.fields.get(fieldName);
            if (!fieldState) return true;

            const { field, wrapper, rules } = fieldState;
            const value = this._getFieldValue(field);
            const formData = this._getFormValues(state);

            fieldState.errors = [];

            // Run each validator
            for (const [ruleName, ruleParam] of Object.entries(rules)) {
                if (ruleName.startsWith('_')) continue;

                const validator = this.validators[ruleName];
                if (!validator) continue;

                const isValid = validator(value, ruleParam, formData);

                if (!isValid) {
                    const message = rules._message || this._formatMessage(ruleName, ruleParam);
                    fieldState.errors.push(message);
                }
            }

            // Update UI
            fieldState.isValid = fieldState.errors.length === 0;
            wrapper.classList.remove('valid', 'invalid');
            wrapper.classList.add(fieldState.isValid ? 'valid' : 'invalid');

            const errorEl = wrapper.querySelector('.bael-field-error');
            if (errorEl) {
                errorEl.textContent = fieldState.errors[0] || '';
            }

            // Update form validity
            this._updateFormValidity(state);

            return fieldState.isValid;
        }

        /**
         * Validate entire form
         */
        _validateForm(state) {
            let isValid = true;

            for (const [fieldName] of state.fields) {
                if (!this._validateField(state, fieldName)) {
                    isValid = false;
                }
            }

            state.isValid = isValid;

            if (isValid && state.config.onValid) {
                state.config.onValid(this._getFormValues(state));
            } else if (!isValid && state.config.onError) {
                state.config.onError(this._getErrors(state));
            }

            return isValid;
        }

        /**
         * Update form validity state
         */
        _updateFormValidity(state) {
            let isValid = true;

            for (const [, fieldState] of state.fields) {
                if (!fieldState.isValid) {
                    isValid = false;
                    break;
                }
            }

            state.isValid = isValid;
            state.form.classList.toggle('bael-form-invalid', !isValid);
        }

        /**
         * Get field value
         */
        _getFieldValue(field) {
            if (field.type === 'checkbox') {
                return field.checked;
            }
            if (field.type === 'radio') {
                const checked = field.form.querySelector(`[name="${field.name}"]:checked`);
                return checked ? checked.value : '';
            }
            if (field.type === 'file') {
                return field.files;
            }
            return field.value;
        }

        /**
         * Get all form values
         */
        _getFormValues(state) {
            const values = {};
            const formData = new FormData(state.form);

            for (const [key, value] of formData.entries()) {
                if (values[key]) {
                    if (!Array.isArray(values[key])) {
                        values[key] = [values[key]];
                    }
                    values[key].push(value);
                } else {
                    values[key] = value;
                }
            }

            return values;
        }

        /**
         * Get all errors
         */
        _getErrors(state) {
            const errors = {};

            for (const [fieldName, fieldState] of state.fields) {
                if (fieldState.errors.length > 0) {
                    errors[fieldName] = fieldState.errors;
                }
            }

            return errors;
        }

        /**
         * Format error message
         */
        _formatMessage(ruleName, param) {
            let message = this.messages[ruleName] || 'Invalid value';

            if (param !== true) {
                message = message.replace('{0}', param);
            }

            return message;
        }

        // ============================================================
        // FORM EVENTS
        // ============================================================

        /**
         * Handle form submit
         */
        _handleSubmit(state, e) {
            if (state.config.validateOnSubmit) {
                if (!this._validateForm(state)) {
                    e.preventDefault();

                    // Focus first error
                    for (const [, fieldState] of state.fields) {
                        if (!fieldState.isValid) {
                            fieldState.field.focus();
                            break;
                        }
                    }
                    return;
                }
            }

            if (state.config.onSubmit) {
                e.preventDefault();
                state.config.onSubmit(this._getFormValues(state), e);
            }
        }

        /**
         * Reset form
         */
        _resetForm(state) {
            state.form.reset();

            for (const [, fieldState] of state.fields) {
                fieldState.isValid = true;
                fieldState.errors = [];
                fieldState.wrapper.classList.remove('valid', 'invalid');
            }

            state.isValid = false;
            state.form.classList.remove('bael-form-invalid');
        }

        // ============================================================
        // FIELD MANAGEMENT
        // ============================================================

        /**
         * Add field to form
         */
        _addField(state, name, rules) {
            const field = state.form.querySelector(`[name="${name}"]`);
            if (field && !state.fields.has(name)) {
                this._setupField(state, field, rules);
            }
        }

        /**
         * Remove field from form
         */
        _removeField(state, name) {
            const fieldState = state.fields.get(name);
            if (fieldState) {
                fieldState.wrapper.classList.remove('valid', 'invalid');
                state.fields.delete(name);
            }
        }

        // ============================================================
        // UTILITIES
        // ============================================================

        /**
         * Add custom validator
         */
        addValidator(name, validator, message) {
            this.validators[name] = validator;
            if (message) {
                this.messages[name] = message;
            }
        }

        /**
         * Password strength meter
         */
        passwordStrength(input, options = {}) {
            if (typeof input === 'string') {
                input = document.querySelector(input);
            }
            if (!input) return null;

            const config = {
                showLabel: options.showLabel !== false,
                onStrength: options.onStrength
            };

            const wrapper = input.parentElement;

            const meter = document.createElement('div');
            meter.className = 'bael-password-strength';
            meter.innerHTML = '<div class="bael-password-strength-bar"></div>';
            wrapper.appendChild(meter);

            let labelEl;
            if (config.showLabel) {
                labelEl = document.createElement('div');
                labelEl.className = 'bael-password-strength-label';
                wrapper.appendChild(labelEl);
            }

            const checkStrength = (password) => {
                let score = 0;

                if (password.length >= 8) score++;
                if (password.length >= 12) score++;
                if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
                if (/\d/.test(password)) score++;
                if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

                let strength = 'weak';
                if (score >= 4) strength = 'strong';
                else if (score >= 3) strength = 'good';
                else if (score >= 2) strength = 'fair';

                return strength;
            };

            input.addEventListener('input', () => {
                const strength = checkStrength(input.value);

                meter.className = `bael-password-strength ${strength}`;

                if (labelEl) {
                    const labels = {
                        weak: 'Weak password',
                        fair: 'Fair password',
                        good: 'Good password',
                        strong: 'Strong password'
                    };
                    labelEl.textContent = input.value ? labels[strength] : '';
                }

                if (config.onStrength) {
                    config.onStrength(strength, input.value);
                }
            });

            return {
                getStrength: () => checkStrength(input.value),
                destroy: () => {
                    meter.remove();
                    if (labelEl) labelEl.remove();
                }
            };
        }

        /**
         * Character counter
         */
        charCounter(input, max, options = {}) {
            if (typeof input === 'string') {
                input = document.querySelector(input);
            }
            if (!input) return null;

            const wrapper = input.parentElement;

            const counter = document.createElement('div');
            counter.className = 'bael-char-counter';
            wrapper.appendChild(counter);

            const update = () => {
                const len = input.value.length;
                counter.textContent = `${len} / ${max}`;

                counter.classList.remove('warning', 'error');
                if (len > max) {
                    counter.classList.add('error');
                } else if (len > max * 0.8) {
                    counter.classList.add('warning');
                }
            };

            input.addEventListener('input', update);
            update();

            return {
                destroy: () => counter.remove()
            };
        }

        /**
         * Destroy form validation
         */
        destroy(id) {
            const state = this.forms.get(id);
            if (state) {
                state.fields.clear();
                this.forms.delete(id);
            }
        }
    }

    // ============================================================
    // SINGLETON INSTANCE
    // ============================================================

    const bael = new BaelFormValidation();

    // ============================================================
    // GLOBAL SHORTCUTS
    // ============================================================

    window.$validate = (form, opts) => bael.create(form, opts);
    window.$addValidator = (name, fn, msg) => bael.addValidator(name, fn, msg);
    window.$passwordStrength = (input, opts) => bael.passwordStrength(input, opts);
    window.$charCounter = (input, max, opts) => bael.charCounter(input, max, opts);

    // ============================================================
    // EXPORT
    // ============================================================

    window.BaelFormValidation = bael;

    console.log('✓ BAEL Form Validation loaded');

})();
