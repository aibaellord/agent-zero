/**
 * BAEL Date Picker Component - Lord Of All Dates
 *
 * Date selection with:
 * - Calendar view (month)
 * - Year/month navigation
 * - Date range selection
 * - Min/max dates
 * - Disabled dates
 * - Multiple selection
 * - Localization
 * - Inline mode
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // DATE PICKER CLASS
  // ============================================================

  class BaelDatePicker {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();

      // Default locale
      this.locale = {
        months: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        monthsShort: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        weekdays: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        weekdaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        today: "Today",
        clear: "Clear",
      };
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-datepicker-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-datepicker-styles";
      styles.textContent = `
                .bael-datepicker {
                    font-family: system-ui, -apple-system, sans-serif;
                    display: inline-block;
                    position: relative;
                }

                /* Input */
                .bael-datepicker-input {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    min-width: 180px;
                    transition: all 0.2s;
                }

                .bael-datepicker-input:hover {
                    border-color: #4f46e5;
                }

                .bael-datepicker-input:focus-within {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .bael-datepicker-input input {
                    border: none;
                    outline: none;
                    flex: 1;
                    font-size: 14px;
                    color: #374151;
                    background: transparent;
                }

                .bael-datepicker-input input::placeholder {
                    color: #9ca3af;
                }

                .bael-datepicker-icon {
                    width: 18px;
                    height: 18px;
                    color: #9ca3af;
                }

                /* Calendar dropdown */
                .bael-datepicker-calendar {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 8px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    padding: 16px;
                    z-index: 1000;
                    display: none;
                    min-width: 280px;
                }

                .bael-datepicker-calendar.open {
                    display: block;
                    animation: baelDatePickerFadeIn 0.2s ease-out;
                }

                .bael-datepicker.inline .bael-datepicker-calendar {
                    position: static;
                    display: block;
                    margin-top: 0;
                    box-shadow: none;
                    border: 1px solid #e5e7eb;
                }

                @keyframes baelDatePickerFadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Header */
                .bael-datepicker-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .bael-datepicker-nav {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .bael-datepicker-nav-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .bael-datepicker-nav-btn:hover {
                    background: #f3f4f6;
                    color: #4f46e5;
                }

                .bael-datepicker-title {
                    display: flex;
                    gap: 8px;
                }

                .bael-datepicker-title-btn {
                    padding: 6px 12px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-datepicker-title-btn:hover {
                    background: #e5e7eb;
                }

                /* Weekdays */
                .bael-datepicker-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    margin-bottom: 8px;
                }

                .bael-datepicker-weekday {
                    text-align: center;
                    font-size: 11px;
                    font-weight: 600;
                    color: #9ca3af;
                    text-transform: uppercase;
                    padding: 4px;
                }

                /* Days grid */
                .bael-datepicker-days {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .bael-datepicker-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    border: none;
                    background: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #374151;
                }

                .bael-datepicker-day:hover:not(.disabled):not(.selected) {
                    background: #f3f4f6;
                }

                .bael-datepicker-day.other-month {
                    color: #d1d5db;
                }

                .bael-datepicker-day.today {
                    font-weight: 600;
                    color: #4f46e5;
                    background: #eef2ff;
                }

                .bael-datepicker-day.selected {
                    background: #4f46e5;
                    color: white;
                    font-weight: 600;
                }

                .bael-datepicker-day.in-range {
                    background: #eef2ff;
                    border-radius: 0;
                }

                .bael-datepicker-day.range-start {
                    border-radius: 8px 0 0 8px;
                }

                .bael-datepicker-day.range-end {
                    border-radius: 0 8px 8px 0;
                }

                .bael-datepicker-day.disabled {
                    color: #d1d5db;
                    cursor: not-allowed;
                }

                /* Months grid */
                .bael-datepicker-months {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .bael-datepicker-month {
                    padding: 12px 8px;
                    border: none;
                    background: none;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #374151;
                }

                .bael-datepicker-month:hover {
                    background: #f3f4f6;
                }

                .bael-datepicker-month.selected {
                    background: #4f46e5;
                    color: white;
                }

                /* Years grid */
                .bael-datepicker-years {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                .bael-datepicker-year {
                    padding: 12px 8px;
                    border: none;
                    background: none;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #374151;
                }

                .bael-datepicker-year:hover {
                    background: #f3f4f6;
                }

                .bael-datepicker-year.selected {
                    background: #4f46e5;
                    color: white;
                }

                /* Footer */
                .bael-datepicker-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .bael-datepicker-footer-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-datepicker-footer-btn.primary {
                    background: #4f46e5;
                    color: white;
                }

                .bael-datepicker-footer-btn.primary:hover {
                    background: #4338ca;
                }

                .bael-datepicker-footer-btn.secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .bael-datepicker-footer-btn.secondary:hover {
                    background: #e5e7eb;
                }
            `;
      document.head.appendChild(styles);
    }

    /**
     * Format date
     */
    _formatDate(date, format) {
      if (!date) return "";

      const d = new Date(date);
      const pad = (n) => n.toString().padStart(2, "0");

      const replacements = {
        YYYY: d.getFullYear(),
        MM: pad(d.getMonth() + 1),
        DD: pad(d.getDate()),
        M: d.getMonth() + 1,
        D: d.getDate(),
      };

      let result = format;
      for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(key, value);
      }

      return result;
    }

    /**
     * Parse date string
     */
    _parseDate(str, format) {
      if (!str) return null;
      if (str instanceof Date) return new Date(str);

      // Simple parsing for common formats
      const parts = str.split(/[-/]/);
      if (parts.length >= 3) {
        if (format.startsWith("YYYY")) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        } else if (format.startsWith("DD")) {
          return new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          return new Date(parts[2], parts[0] - 1, parts[1]);
        }
      }

      return new Date(str);
    }

    /**
     * Check if same day
     */
    _isSameDay(d1, d2) {
      if (!d1 || !d2) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    }

    /**
     * Check if date is in range
     */
    _isInRange(date, start, end) {
      if (!start || !end) return false;
      return date > start && date < end;
    }

    // ============================================================
    // CREATE DATE PICKER
    // ============================================================

    /**
     * Create a date picker
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Date picker container not found");
        return null;
      }

      const id = `bael-datepicker-${++this.idCounter}`;
      const config = {
        value: null, // initial date
        format: "YYYY-MM-DD",
        placeholder: "Select date",
        inline: false,
        range: false, // range selection
        multiple: false, // multiple dates
        min: null, // min date
        max: null, // max date
        disabledDates: [], // array of disabled dates
        firstDayOfWeek: 0, // 0 = Sunday
        showFooter: true,
        locale: this.locale,
        onChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-datepicker${config.inline ? " inline" : ""}`;
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        selectedDate: config.value
          ? this._parseDate(config.value, config.format)
          : null,
        rangeStart: null,
        rangeEnd: null,
        selectedDates: [],
        viewDate: config.value
          ? this._parseDate(config.value, config.format)
          : new Date(),
        view: "days", // days, months, years
        open: config.inline,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => this.getValue(id),
        setValue: (value) => this.setValue(id, value),
        open: () => this._openCalendar(state),
        close: () => this._closeCalendar(state),
        goToDate: (date) => this._goToDate(state, date),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render date picker
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Input (not for inline mode)
      if (!config.inline) {
        const inputWrap = document.createElement("div");
        inputWrap.className = "bael-datepicker-input";

        const icon = document.createElement("span");
        icon.className = "bael-datepicker-icon";
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
        inputWrap.appendChild(icon);

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = config.placeholder;
        input.readOnly = true;
        inputWrap.appendChild(input);

        element.appendChild(inputWrap);
        state.input = input;

        this._updateInputValue(state);

        inputWrap.addEventListener("click", () => {
          this._toggleCalendar(state);
        });
      }

      // Calendar
      const calendar = document.createElement("div");
      calendar.className = `bael-datepicker-calendar${state.open ? " open" : ""}`;
      element.appendChild(calendar);
      state.calendar = calendar;

      this._renderCalendar(state);

      // Close on outside click
      if (!config.inline) {
        document.addEventListener("click", (e) => {
          if (!element.contains(e.target)) {
            this._closeCalendar(state);
          }
        });
      }
    }

    /**
     * Render calendar content
     */
    _renderCalendar(state) {
      const { calendar, view } = state;

      calendar.innerHTML = "";

      // Header
      calendar.appendChild(this._renderHeader(state));

      // Content based on view
      if (view === "days") {
        calendar.appendChild(this._renderWeekdays(state));
        calendar.appendChild(this._renderDays(state));
      } else if (view === "months") {
        calendar.appendChild(this._renderMonths(state));
      } else if (view === "years") {
        calendar.appendChild(this._renderYears(state));
      }

      // Footer
      if (state.config.showFooter && view === "days") {
        calendar.appendChild(this._renderFooter(state));
      }
    }

    /**
     * Render header
     */
    _renderHeader(state) {
      const { viewDate, view, config } = state;
      const header = document.createElement("div");
      header.className = "bael-datepicker-header";

      // Nav left
      const navLeft = document.createElement("div");
      navLeft.className = "bael-datepicker-nav";

      const prevBtn = document.createElement("button");
      prevBtn.className = "bael-datepicker-nav-btn";
      prevBtn.type = "button";
      prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>`;
      prevBtn.addEventListener("click", () => this._navigate(state, -1));
      navLeft.appendChild(prevBtn);

      // Title
      const title = document.createElement("div");
      title.className = "bael-datepicker-title";

      if (view === "days") {
        const monthBtn = document.createElement("button");
        monthBtn.className = "bael-datepicker-title-btn";
        monthBtn.type = "button";
        monthBtn.textContent = config.locale.months[viewDate.getMonth()];
        monthBtn.addEventListener("click", () => {
          state.view = "months";
          this._renderCalendar(state);
        });

        const yearBtn = document.createElement("button");
        yearBtn.className = "bael-datepicker-title-btn";
        yearBtn.type = "button";
        yearBtn.textContent = viewDate.getFullYear();
        yearBtn.addEventListener("click", () => {
          state.view = "years";
          this._renderCalendar(state);
        });

        title.appendChild(monthBtn);
        title.appendChild(yearBtn);
      } else if (view === "months") {
        const yearBtn = document.createElement("button");
        yearBtn.className = "bael-datepicker-title-btn";
        yearBtn.type = "button";
        yearBtn.textContent = viewDate.getFullYear();
        yearBtn.addEventListener("click", () => {
          state.view = "years";
          this._renderCalendar(state);
        });
        title.appendChild(yearBtn);
      } else if (view === "years") {
        const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
        const yearRange = document.createElement("span");
        yearRange.className = "bael-datepicker-title-btn";
        yearRange.style.cursor = "default";
        yearRange.textContent = `${startYear} - ${startYear + 11}`;
        title.appendChild(yearRange);
      }

      // Nav right
      const navRight = document.createElement("div");
      navRight.className = "bael-datepicker-nav";

      const nextBtn = document.createElement("button");
      nextBtn.className = "bael-datepicker-nav-btn";
      nextBtn.type = "button";
      nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>`;
      nextBtn.addEventListener("click", () => this._navigate(state, 1));
      navRight.appendChild(nextBtn);

      header.appendChild(navLeft);
      header.appendChild(title);
      header.appendChild(navRight);

      return header;
    }

    /**
     * Render weekdays row
     */
    _renderWeekdays(state) {
      const { config } = state;
      const weekdays = document.createElement("div");
      weekdays.className = "bael-datepicker-weekdays";

      for (let i = 0; i < 7; i++) {
        const idx = (i + config.firstDayOfWeek) % 7;
        const day = document.createElement("div");
        day.className = "bael-datepicker-weekday";
        day.textContent = config.locale.weekdaysShort[idx];
        weekdays.appendChild(day);
      }

      return weekdays;
    }

    /**
     * Render days grid
     */
    _renderDays(state) {
      const { viewDate, selectedDate, rangeStart, rangeEnd, config } = state;
      const days = document.createElement("div");
      days.className = "bael-datepicker-days";

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const today = new Date();

      // First day of month
      const firstDay = new Date(year, month, 1);
      // Last day of month
      const lastDay = new Date(year, month + 1, 0);

      // Start offset
      let startOffset = firstDay.getDay() - config.firstDayOfWeek;
      if (startOffset < 0) startOffset += 7;

      // Previous month days
      const prevMonth = new Date(year, month, 0);
      for (let i = startOffset - 1; i >= 0; i--) {
        const dayNum = prevMonth.getDate() - i;
        const dayBtn = this._createDayButton(
          state,
          new Date(year, month - 1, dayNum),
          true,
        );
        days.appendChild(dayBtn);
      }

      // Current month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        const dayBtn = this._createDayButton(state, date, false);

        // Today
        if (this._isSameDay(date, today)) {
          dayBtn.classList.add("today");
        }

        // Selected
        if (config.range) {
          if (this._isSameDay(date, rangeStart)) {
            dayBtn.classList.add("selected", "range-start");
          }
          if (this._isSameDay(date, rangeEnd)) {
            dayBtn.classList.add("selected", "range-end");
          }
          if (this._isInRange(date, rangeStart, rangeEnd)) {
            dayBtn.classList.add("in-range");
          }
        } else {
          if (this._isSameDay(date, selectedDate)) {
            dayBtn.classList.add("selected");
          }
        }

        days.appendChild(dayBtn);
      }

      // Next month days
      const totalCells = 42; // 6 weeks
      const remaining = totalCells - days.children.length;
      for (let i = 1; i <= remaining; i++) {
        const dayBtn = this._createDayButton(
          state,
          new Date(year, month + 1, i),
          true,
        );
        days.appendChild(dayBtn);
      }

      return days;
    }

    /**
     * Create day button
     */
    _createDayButton(state, date, otherMonth) {
      const { config } = state;
      const dayBtn = document.createElement("button");
      dayBtn.className = "bael-datepicker-day";
      dayBtn.type = "button";
      dayBtn.textContent = date.getDate();

      if (otherMonth) {
        dayBtn.classList.add("other-month");
      }

      // Check disabled
      const isDisabled = this._isDateDisabled(state, date);
      if (isDisabled) {
        dayBtn.classList.add("disabled");
      } else {
        dayBtn.addEventListener("click", () => {
          this._selectDate(state, date);
        });
      }

      return dayBtn;
    }

    /**
     * Check if date is disabled
     */
    _isDateDisabled(state, date) {
      const { config } = state;

      if (config.min && date < new Date(config.min)) return true;
      if (config.max && date > new Date(config.max)) return true;

      for (const disabled of config.disabledDates) {
        if (this._isSameDay(date, new Date(disabled))) return true;
      }

      return false;
    }

    /**
     * Render months grid
     */
    _renderMonths(state) {
      const { viewDate, config } = state;
      const months = document.createElement("div");
      months.className = "bael-datepicker-months";

      for (let i = 0; i < 12; i++) {
        const monthBtn = document.createElement("button");
        monthBtn.className = "bael-datepicker-month";
        monthBtn.type = "button";
        monthBtn.textContent = config.locale.monthsShort[i];

        if (i === viewDate.getMonth()) {
          monthBtn.classList.add("selected");
        }

        monthBtn.addEventListener("click", () => {
          state.viewDate.setMonth(i);
          state.view = "days";
          this._renderCalendar(state);
        });

        months.appendChild(monthBtn);
      }

      return months;
    }

    /**
     * Render years grid
     */
    _renderYears(state) {
      const { viewDate } = state;
      const years = document.createElement("div");
      years.className = "bael-datepicker-years";

      const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;

      for (let i = 0; i < 12; i++) {
        const year = startYear + i;
        const yearBtn = document.createElement("button");
        yearBtn.className = "bael-datepicker-year";
        yearBtn.type = "button";
        yearBtn.textContent = year;

        if (year === viewDate.getFullYear()) {
          yearBtn.classList.add("selected");
        }

        yearBtn.addEventListener("click", () => {
          state.viewDate.setFullYear(year);
          state.view = "months";
          this._renderCalendar(state);
        });

        years.appendChild(yearBtn);
      }

      return years;
    }

    /**
     * Render footer
     */
    _renderFooter(state) {
      const { config } = state;
      const footer = document.createElement("div");
      footer.className = "bael-datepicker-footer";

      const todayBtn = document.createElement("button");
      todayBtn.className = "bael-datepicker-footer-btn secondary";
      todayBtn.type = "button";
      todayBtn.textContent = config.locale.today;
      todayBtn.addEventListener("click", () => {
        this._selectDate(state, new Date());
      });

      const clearBtn = document.createElement("button");
      clearBtn.className = "bael-datepicker-footer-btn secondary";
      clearBtn.type = "button";
      clearBtn.textContent = config.locale.clear;
      clearBtn.addEventListener("click", () => {
        state.selectedDate = null;
        state.rangeStart = null;
        state.rangeEnd = null;
        if (state.input) state.input.value = "";
        this._renderCalendar(state);
        this._closeCalendar(state);
      });

      footer.appendChild(todayBtn);
      footer.appendChild(clearBtn);

      return footer;
    }

    /**
     * Navigate month/year
     */
    _navigate(state, delta) {
      const { view, viewDate } = state;

      if (view === "days") {
        viewDate.setMonth(viewDate.getMonth() + delta);
      } else if (view === "months") {
        viewDate.setFullYear(viewDate.getFullYear() + delta);
      } else if (view === "years") {
        viewDate.setFullYear(viewDate.getFullYear() + delta * 12);
      }

      this._renderCalendar(state);
    }

    /**
     * Select date
     */
    _selectDate(state, date) {
      const { config } = state;

      if (config.range) {
        if (!state.rangeStart || state.rangeEnd) {
          state.rangeStart = date;
          state.rangeEnd = null;
        } else {
          if (date < state.rangeStart) {
            state.rangeEnd = state.rangeStart;
            state.rangeStart = date;
          } else {
            state.rangeEnd = date;
          }
        }
      } else {
        state.selectedDate = date;
      }

      this._updateInputValue(state);
      this._renderCalendar(state);

      if (!config.range || (state.rangeStart && state.rangeEnd)) {
        if (config.onChange) {
          config.onChange(this.getValue(state.id));
        }
        if (!config.inline) {
          this._closeCalendar(state);
        }
      }
    }

    /**
     * Update input value
     */
    _updateInputValue(state) {
      if (!state.input) return;

      const { config, selectedDate, rangeStart, rangeEnd } = state;

      if (config.range) {
        if (rangeStart && rangeEnd) {
          state.input.value = `${this._formatDate(rangeStart, config.format)} - ${this._formatDate(rangeEnd, config.format)}`;
        } else if (rangeStart) {
          state.input.value = this._formatDate(rangeStart, config.format);
        } else {
          state.input.value = "";
        }
      } else {
        state.input.value = selectedDate
          ? this._formatDate(selectedDate, config.format)
          : "";
      }
    }

    /**
     * Toggle calendar
     */
    _toggleCalendar(state) {
      if (state.open) {
        this._closeCalendar(state);
      } else {
        this._openCalendar(state);
      }
    }

    /**
     * Open calendar
     */
    _openCalendar(state) {
      state.open = true;
      state.calendar.classList.add("open");
    }

    /**
     * Close calendar
     */
    _closeCalendar(state) {
      state.open = false;
      state.calendar.classList.remove("open");
    }

    /**
     * Go to specific date
     */
    _goToDate(state, date) {
      state.viewDate = new Date(date);
      state.view = "days";
      this._renderCalendar(state);
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Get selected value
     */
    getValue(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return null;

      const { config } = state;

      if (config.range) {
        return {
          start: state.rangeStart,
          end: state.rangeEnd,
          formatted: state.input ? state.input.value : "",
        };
      }

      return {
        date: state.selectedDate,
        formatted: state.input
          ? state.input.value
          : state.selectedDate
            ? this._formatDate(state.selectedDate, config.format)
            : "",
      };
    }

    /**
     * Set value
     */
    setValue(pickerId, value) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      if (state.config.range && value.start) {
        state.rangeStart = this._parseDate(value.start, state.config.format);
        state.rangeEnd = value.end
          ? this._parseDate(value.end, state.config.format)
          : null;
      } else {
        state.selectedDate = this._parseDate(value, state.config.format);
      }

      state.viewDate = state.selectedDate || state.rangeStart || new Date();
      this._updateInputValue(state);
      this._renderCalendar(state);
    }

    /**
     * Destroy date picker
     */
    destroy(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(pickerId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelDatePicker();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$datePicker = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelDatePicker = bael;

  console.log("📅 BAEL Date Picker Component loaded");
})();
