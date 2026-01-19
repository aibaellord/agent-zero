/**
 * BAEL Calendar Component - Lord Of All Time
 *
 * Full-featured calendar with:
 * - Date picker
 * - Date range selection
 * - Multiple views (month, week, day)
 * - Events display
 * - Internationalization
 * - Min/max dates
 * - Disabled dates
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CALENDAR CLASS
  // ============================================================

  class BaelCalendar {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-calendar-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-calendar-styles";
      styles.textContent = `
                .bael-calendar {
                    --cal-primary: #4f46e5;
                    --cal-bg: #ffffff;
                    --cal-border: #e5e7eb;
                    --cal-text: #111827;
                    --cal-text-muted: #6b7280;
                    --cal-hover: #f3f4f6;
                    --cal-selected: #eef2ff;
                    --cal-today-ring: #4f46e5;

                    background: var(--cal-bg);
                    border: 1px solid var(--cal-border);
                    border-radius: 12px;
                    padding: 16px;
                    font-size: 0.875rem;
                    user-select: none;
                    min-width: 300px;
                }

                /* Header */
                .bael-calendar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .bael-calendar-title {
                    font-weight: 600;
                    font-size: 1rem;
                    color: var(--cal-text);
                }

                .bael-calendar-nav {
                    display: flex;
                    gap: 4px;
                }

                .bael-calendar-nav-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: none;
                    border-radius: 6px;
                    cursor: pointer;
                    color: var(--cal-text-muted);
                    transition: all 0.15s;
                }

                .bael-calendar-nav-btn:hover {
                    background: var(--cal-hover);
                    color: var(--cal-text);
                }

                /* Weekdays */
                .bael-calendar-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    margin-bottom: 8px;
                }

                .bael-calendar-weekday {
                    text-align: center;
                    font-weight: 500;
                    color: var(--cal-text-muted);
                    padding: 8px 0;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                }

                /* Days grid */
                .bael-calendar-days {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .bael-calendar-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    position: relative;
                }

                .bael-calendar-day:hover:not(.disabled):not(.other-month) {
                    background: var(--cal-hover);
                }

                .bael-calendar-day.other-month {
                    color: #d1d5db;
                }

                .bael-calendar-day.today {
                    box-shadow: inset 0 0 0 2px var(--cal-today-ring);
                }

                .bael-calendar-day.selected {
                    background: var(--cal-primary) !important;
                    color: white;
                }

                .bael-calendar-day.in-range {
                    background: var(--cal-selected);
                    border-radius: 0;
                }

                .bael-calendar-day.range-start {
                    border-radius: 8px 0 0 8px;
                }

                .bael-calendar-day.range-end {
                    border-radius: 0 8px 8px 0;
                }

                .bael-calendar-day.disabled {
                    color: #d1d5db;
                    cursor: not-allowed;
                }

                .bael-calendar-day.has-event::after {
                    content: '';
                    position: absolute;
                    bottom: 4px;
                    width: 4px;
                    height: 4px;
                    background: var(--cal-primary);
                    border-radius: 50%;
                }

                /* Month/Year picker */
                .bael-calendar-picker {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .bael-calendar-picker-item {
                    padding: 12px;
                    text-align: center;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-calendar-picker-item:hover {
                    background: var(--cal-hover);
                }

                .bael-calendar-picker-item.selected {
                    background: var(--cal-primary);
                    color: white;
                }

                /* Footer */
                .bael-calendar-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--cal-border);
                }

                .bael-calendar-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.15s;
                }

                .bael-calendar-btn-secondary {
                    background: var(--cal-hover);
                    color: var(--cal-text);
                }

                .bael-calendar-btn-secondary:hover {
                    background: #e5e7eb;
                }

                .bael-calendar-btn-primary {
                    background: var(--cal-primary);
                    color: white;
                }

                .bael-calendar-btn-primary:hover {
                    background: #4338ca;
                }

                /* Time picker */
                .bael-calendar-time {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--cal-border);
                }

                .bael-calendar-time-input {
                    width: 60px;
                    padding: 8px;
                    text-align: center;
                    border: 1px solid var(--cal-border);
                    border-radius: 6px;
                    font-size: 0.875rem;
                }

                .bael-calendar-time-input:focus {
                    outline: none;
                    border-color: var(--cal-primary);
                }

                .bael-calendar-time-separator {
                    display: flex;
                    align-items: center;
                    font-weight: 600;
                }

                /* Events list */
                .bael-calendar-events {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--cal-border);
                }

                .bael-calendar-events-title {
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .bael-calendar-event {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    border-radius: 6px;
                    background: var(--cal-hover);
                    margin-bottom: 4px;
                }

                .bael-calendar-event-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .bael-calendar-event-text {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-calendar-event-time {
                    font-size: 0.75rem;
                    color: var(--cal-text-muted);
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE CALENDAR
    // ============================================================

    /**
     * Create a calendar
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Calendar container not found");
        return null;
      }

      const id = `bael-calendar-${++this.idCounter}`;
      const config = {
        value: null,
        range: false,
        showTime: false,
        showFooter: false,
        showEvents: false,
        events: [],
        minDate: null,
        maxDate: null,
        disabledDates: [],
        disabledDays: [],
        firstDayOfWeek: 0, // 0 = Sunday
        locale: "en-US",
        monthFormat: "long",
        weekdayFormat: "short",
        onChange: null,
        onMonthChange: null,
        onYearChange: null,
        ...options,
      };

      const today = new Date();
      const state = {
        id,
        container,
        config,
        viewDate: config.value ? new Date(config.value) : today,
        selectedDate: config.value ? new Date(config.value) : null,
        rangeStart: null,
        rangeEnd: null,
        hoveredDate: null,
        view: "days", // days, months, years
        hours: 12,
        minutes: 0,
      };

      // Initialize range values
      if (config.range && config.value) {
        if (Array.isArray(config.value) && config.value.length === 2) {
          state.rangeStart = new Date(config.value[0]);
          state.rangeEnd = new Date(config.value[1]);
        }
      }

      // Create structure
      this._createStructure(state);
      this._render(state);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => this.getValue(id),
        setValue: (value) => this.setValue(id, value),
        getViewDate: () => state.viewDate,
        goToDate: (date) => this.goToDate(id, date),
        goToMonth: (month) => this.goToMonth(id, month),
        goToYear: (year) => this.goToYear(id, year),
        nextMonth: () => this.nextMonth(id),
        prevMonth: () => this.prevMonth(id),
        addEvent: (event) => this.addEvent(id, event),
        removeEvent: (eventId) => this.removeEvent(id, eventId),
        clear: () => this.clear(id),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create calendar structure
     */
    _createStructure(state) {
      const calendar = document.createElement("div");
      calendar.className = "bael-calendar";
      calendar.id = state.id;

      // Header
      const header = document.createElement("div");
      header.className = "bael-calendar-header";
      calendar.appendChild(header);

      // Content
      const content = document.createElement("div");
      content.className = "bael-calendar-content";
      calendar.appendChild(content);

      // Time picker
      if (state.config.showTime) {
        const time = document.createElement("div");
        time.className = "bael-calendar-time";
        time.innerHTML = `
                    <input type="number" class="bael-calendar-time-input"
                        min="0" max="23" value="${state.hours}">
                    <span class="bael-calendar-time-separator">:</span>
                    <input type="number" class="bael-calendar-time-input"
                        min="0" max="59" value="${String(state.minutes).padStart(2, "0")}">
                `;

        const inputs = time.querySelectorAll("input");
        inputs[0].addEventListener("change", (e) => {
          state.hours = Math.max(
            0,
            Math.min(23, parseInt(e.target.value) || 0),
          );
          e.target.value = state.hours;
          this._emitChange(state);
        });
        inputs[1].addEventListener("change", (e) => {
          state.minutes = Math.max(
            0,
            Math.min(59, parseInt(e.target.value) || 0),
          );
          e.target.value = String(state.minutes).padStart(2, "0");
          this._emitChange(state);
        });

        calendar.appendChild(time);
      }

      // Events
      if (state.config.showEvents) {
        const events = document.createElement("div");
        events.className = "bael-calendar-events";
        calendar.appendChild(events);
      }

      // Footer
      if (state.config.showFooter) {
        const footer = document.createElement("div");
        footer.className = "bael-calendar-footer";
        footer.innerHTML = `
                    <button class="bael-calendar-btn bael-calendar-btn-secondary">Clear</button>
                    <button class="bael-calendar-btn bael-calendar-btn-primary">Today</button>
                `;

        footer.querySelector(".bael-calendar-btn-secondary").onclick = () => {
          this.clear(state.id);
        };
        footer.querySelector(".bael-calendar-btn-primary").onclick = () => {
          this.goToDate(state.id, new Date());
          this.setValue(state.id, new Date());
        };

        calendar.appendChild(footer);
      }

      state.container.appendChild(calendar);
      state.calendar = calendar;
      state.header = header;
      state.content = content;
    }

    // ============================================================
    // RENDER
    // ============================================================

    /**
     * Render calendar
     */
    _render(state) {
      switch (state.view) {
        case "days":
          this._renderDays(state);
          break;
        case "months":
          this._renderMonths(state);
          break;
        case "years":
          this._renderYears(state);
          break;
      }

      this._renderEvents(state);
    }

    /**
     * Render days view
     */
    _renderDays(state) {
      const { config, header, content, viewDate } = state;

      // Header
      header.innerHTML = `
                <div class="bael-calendar-nav">
                    <button class="bael-calendar-nav-btn" data-action="prev-month">◀</button>
                </div>
                <div class="bael-calendar-title" style="cursor: pointer;">
                    ${viewDate.toLocaleDateString(config.locale, {
                      month: config.monthFormat,
                      year: "numeric",
                    })}
                </div>
                <div class="bael-calendar-nav">
                    <button class="bael-calendar-nav-btn" data-action="next-month">▶</button>
                </div>
            `;

      header.querySelector('[data-action="prev-month"]').onclick = () =>
        this.prevMonth(state.id);
      header.querySelector('[data-action="next-month"]').onclick = () =>
        this.nextMonth(state.id);
      header.querySelector(".bael-calendar-title").onclick = () => {
        state.view = "months";
        this._render(state);
      };

      // Weekdays
      const weekdays = this._getWeekdays(state);
      let weekdaysHTML = '<div class="bael-calendar-weekdays">';
      weekdays.forEach((day) => {
        weekdaysHTML += `<div class="bael-calendar-weekday">${day}</div>`;
      });
      weekdaysHTML += "</div>";

      // Days
      const days = this._getCalendarDays(state);
      let daysHTML = '<div class="bael-calendar-days">';
      days.forEach((day) => {
        const classes = ["bael-calendar-day"];
        if (day.otherMonth) classes.push("other-month");
        if (day.today) classes.push("today");
        if (day.selected) classes.push("selected");
        if (day.inRange) classes.push("in-range");
        if (day.rangeStart) classes.push("range-start");
        if (day.rangeEnd) classes.push("range-end");
        if (day.disabled) classes.push("disabled");
        if (day.hasEvent) classes.push("has-event");

        daysHTML += `
                    <div class="${classes.join(" ")}" data-date="${day.date.toISOString()}">
                        ${day.date.getDate()}
                    </div>
                `;
      });
      daysHTML += "</div>";

      content.innerHTML = weekdaysHTML + daysHTML;

      // Event listeners for days
      content.querySelectorAll(".bael-calendar-day").forEach((dayEl) => {
        dayEl.addEventListener("click", () => {
          if (dayEl.classList.contains("disabled")) return;
          const date = new Date(dayEl.dataset.date);
          this._selectDate(state, date);
        });

        if (config.range) {
          dayEl.addEventListener("mouseenter", () => {
            if (dayEl.classList.contains("disabled")) return;
            state.hoveredDate = new Date(dayEl.dataset.date);
            this._render(state);
          });
        }
      });
    }

    /**
     * Render months view
     */
    _renderMonths(state) {
      const { config, header, content, viewDate } = state;

      // Header
      header.innerHTML = `
                <div class="bael-calendar-nav">
                    <button class="bael-calendar-nav-btn" data-action="prev-year">◀</button>
                </div>
                <div class="bael-calendar-title" style="cursor: pointer;">
                    ${viewDate.getFullYear()}
                </div>
                <div class="bael-calendar-nav">
                    <button class="bael-calendar-nav-btn" data-action="next-year">▶</button>
                </div>
            `;

      header.querySelector('[data-action="prev-year"]').onclick = () => {
        state.viewDate.setFullYear(viewDate.getFullYear() - 1);
        this._render(state);
      };
      header.querySelector('[data-action="next-year"]').onclick = () => {
        state.viewDate.setFullYear(viewDate.getFullYear() + 1);
        this._render(state);
      };
      header.querySelector(".bael-calendar-title").onclick = () => {
        state.view = "years";
        this._render(state);
      };

      // Months
      let html = '<div class="bael-calendar-picker">';
      for (let i = 0; i < 12; i++) {
        const date = new Date(viewDate.getFullYear(), i, 1);
        const name = date.toLocaleDateString(config.locale, { month: "short" });
        const isSelected =
          state.selectedDate &&
          state.selectedDate.getMonth() === i &&
          state.selectedDate.getFullYear() === viewDate.getFullYear();

        html += `
                    <div class="bael-calendar-picker-item ${isSelected ? "selected" : ""}"
                         data-month="${i}">
                        ${name}
                    </div>
                `;
      }
      html += "</div>";

      content.innerHTML = html;

      content.querySelectorAll(".bael-calendar-picker-item").forEach((item) => {
        item.addEventListener("click", () => {
          state.viewDate.setMonth(parseInt(item.dataset.month));
          state.view = "days";
          this._render(state);
        });
      });
    }

    /**
     * Render years view
     */
    _renderYears(state) {
      const { header, content, viewDate } = state;
      const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;

      // Header
      header.innerHTML = `
                <div class="bael-calendar-nav">
                    <button class="bael-calendar-nav-btn" data-action="prev">◀</button>
                </div>
                <div class="bael-calendar-title">
                    ${startYear} - ${startYear + 11}
                </div>
                <div class="bael-calendar-nav">
                    <button class="bael-calendar-nav-btn" data-action="next">▶</button>
                </div>
            `;

      header.querySelector('[data-action="prev"]').onclick = () => {
        state.viewDate.setFullYear(viewDate.getFullYear() - 12);
        this._render(state);
      };
      header.querySelector('[data-action="next"]').onclick = () => {
        state.viewDate.setFullYear(viewDate.getFullYear() + 12);
        this._render(state);
      };

      // Years
      let html = '<div class="bael-calendar-picker">';
      for (let i = 0; i < 12; i++) {
        const year = startYear + i;
        const isSelected =
          state.selectedDate && state.selectedDate.getFullYear() === year;

        html += `
                    <div class="bael-calendar-picker-item ${isSelected ? "selected" : ""}"
                         data-year="${year}">
                        ${year}
                    </div>
                `;
      }
      html += "</div>";

      content.innerHTML = html;

      content.querySelectorAll(".bael-calendar-picker-item").forEach((item) => {
        item.addEventListener("click", () => {
          state.viewDate.setFullYear(parseInt(item.dataset.year));
          state.view = "months";
          this._render(state);
        });
      });
    }

    /**
     * Render events for selected date
     */
    _renderEvents(state) {
      if (!state.config.showEvents) return;

      const eventsEl = state.calendar.querySelector(".bael-calendar-events");
      if (!eventsEl) return;

      const date = state.selectedDate || new Date();
      const dateStr = date.toDateString();
      const events = state.config.events.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === dateStr;
      });

      if (events.length === 0) {
        eventsEl.innerHTML = `
                    <div class="bael-calendar-events-title">Events</div>
                    <div style="color: #6b7280; font-size: 0.875rem;">No events</div>
                `;
        return;
      }

      eventsEl.innerHTML = `
                <div class="bael-calendar-events-title">
                    Events for ${date.toLocaleDateString()}
                </div>
                ${events
                  .map(
                    (e) => `
                    <div class="bael-calendar-event">
                        <div class="bael-calendar-event-dot"
                             style="background: ${e.color || "#4f46e5"}"></div>
                        <div class="bael-calendar-event-text">${e.title}</div>
                        ${e.time ? `<div class="bael-calendar-event-time">${e.time}</div>` : ""}
                    </div>
                `,
                  )
                  .join("")}
            `;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    /**
     * Get weekday names
     */
    _getWeekdays(state) {
      const { config } = state;
      const days = [];
      const date = new Date(2024, 0, 7 + config.firstDayOfWeek); // A Sunday

      for (let i = 0; i < 7; i++) {
        days.push(
          date.toLocaleDateString(config.locale, {
            weekday: config.weekdayFormat,
          }),
        );
        date.setDate(date.getDate() + 1);
      }

      return days;
    }

    /**
     * Get calendar days for current view
     */
    _getCalendarDays(state) {
      const {
        config,
        viewDate,
        selectedDate,
        rangeStart,
        rangeEnd,
        hoveredDate,
      } = state;
      const days = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      // First day of month
      const firstDay = new Date(year, month, 1);
      const startDayOfWeek = firstDay.getDay();

      // Adjust for first day of week
      let daysFromPrevMonth = startDayOfWeek - config.firstDayOfWeek;
      if (daysFromPrevMonth < 0) daysFromPrevMonth += 7;

      // Start date (might be in previous month)
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - daysFromPrevMonth);

      // Generate 42 days (6 weeks)
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const otherMonth = date.getMonth() !== month;
        const isToday = date.getTime() === today.getTime();
        const isSelected = this._isDateSelected(state, date);
        const inRange = this._isInRange(state, date);
        const isRangeStart =
          rangeStart && date.getTime() === rangeStart.getTime();
        const isRangeEnd = rangeEnd && date.getTime() === rangeEnd.getTime();
        const disabled = this._isDateDisabled(state, date);
        const hasEvent = config.events.some((e) => {
          const eventDate = new Date(e.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === date.getTime();
        });

        days.push({
          date,
          otherMonth,
          today: isToday,
          selected: isSelected,
          inRange,
          rangeStart: isRangeStart,
          rangeEnd: isRangeEnd,
          disabled,
          hasEvent,
        });
      }

      return days;
    }

    /**
     * Check if date is selected
     */
    _isDateSelected(state, date) {
      const { config, selectedDate, rangeStart, rangeEnd } = state;

      if (config.range) {
        return (
          (rangeStart && date.getTime() === rangeStart.getTime()) ||
          (rangeEnd && date.getTime() === rangeEnd.getTime())
        );
      }

      return selectedDate && date.getTime() === selectedDate.getTime();
    }

    /**
     * Check if date is in range
     */
    _isInRange(state, date) {
      const { config, rangeStart, rangeEnd, hoveredDate } = state;
      if (!config.range || !rangeStart) return false;

      const end = rangeEnd || hoveredDate;
      if (!end) return false;

      const start = rangeStart.getTime();
      const endTime = end.getTime();
      const dateTime = date.getTime();

      return (
        dateTime > Math.min(start, endTime) &&
        dateTime < Math.max(start, endTime)
      );
    }

    /**
     * Check if date is disabled
     */
    _isDateDisabled(state, date) {
      const { config } = state;

      // Check day of week
      if (config.disabledDays.includes(date.getDay())) {
        return true;
      }

      // Check min/max
      if (config.minDate) {
        const min = new Date(config.minDate);
        min.setHours(0, 0, 0, 0);
        if (date < min) return true;
      }

      if (config.maxDate) {
        const max = new Date(config.maxDate);
        max.setHours(0, 0, 0, 0);
        if (date > max) return true;
      }

      // Check disabled dates
      return config.disabledDates.some((d) => {
        const disabled = new Date(d);
        disabled.setHours(0, 0, 0, 0);
        return date.getTime() === disabled.getTime();
      });
    }

    /**
     * Select a date
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

      this._render(state);
      this._emitChange(state);
    }

    /**
     * Emit change event
     */
    _emitChange(state) {
      if (state.config.onChange) {
        state.config.onChange(this.getValue(state.id));
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Get value
     */
    getValue(calendarId) {
      const state = this.instances.get(calendarId);
      if (!state) return null;

      if (state.config.range) {
        if (!state.rangeStart) return null;
        return [state.rangeStart, state.rangeEnd].filter(Boolean);
      }

      if (!state.selectedDate) return null;

      if (state.config.showTime) {
        const date = new Date(state.selectedDate);
        date.setHours(state.hours, state.minutes);
        return date;
      }

      return state.selectedDate;
    }

    /**
     * Set value
     */
    setValue(calendarId, value) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      if (state.config.range && Array.isArray(value)) {
        state.rangeStart = value[0] ? new Date(value[0]) : null;
        state.rangeEnd = value[1] ? new Date(value[1]) : null;
        if (state.rangeStart) state.viewDate = new Date(state.rangeStart);
      } else if (value) {
        state.selectedDate = new Date(value);
        state.viewDate = new Date(value);

        if (state.config.showTime) {
          state.hours = state.selectedDate.getHours();
          state.minutes = state.selectedDate.getMinutes();
        }
      }

      this._render(state);
    }

    /**
     * Go to specific date
     */
    goToDate(calendarId, date) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.viewDate = new Date(date);
      state.view = "days";
      this._render(state);
    }

    /**
     * Go to month
     */
    goToMonth(calendarId, month) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.viewDate.setMonth(month);
      this._render(state);
    }

    /**
     * Go to year
     */
    goToYear(calendarId, year) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.viewDate.setFullYear(year);
      this._render(state);
    }

    /**
     * Next month
     */
    nextMonth(calendarId) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.viewDate.setMonth(state.viewDate.getMonth() + 1);
      this._render(state);

      if (state.config.onMonthChange) {
        state.config.onMonthChange(
          state.viewDate.getMonth(),
          state.viewDate.getFullYear(),
        );
      }
    }

    /**
     * Previous month
     */
    prevMonth(calendarId) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.viewDate.setMonth(state.viewDate.getMonth() - 1);
      this._render(state);

      if (state.config.onMonthChange) {
        state.config.onMonthChange(
          state.viewDate.getMonth(),
          state.viewDate.getFullYear(),
        );
      }
    }

    /**
     * Add event
     */
    addEvent(calendarId, event) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.config.events.push(event);
      this._render(state);
    }

    /**
     * Remove event
     */
    removeEvent(calendarId, eventId) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.config.events = state.config.events.filter((e) => e.id !== eventId);
      this._render(state);
    }

    /**
     * Clear selection
     */
    clear(calendarId) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.selectedDate = null;
      state.rangeStart = null;
      state.rangeEnd = null;

      this._render(state);
      this._emitChange(state);
    }

    /**
     * Destroy calendar
     */
    destroy(calendarId) {
      const state = this.instances.get(calendarId);
      if (!state) return;

      state.calendar.remove();
      this.instances.delete(calendarId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelCalendar();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$calendar = (container, options) => bael.create(container, options);
  window.$datePicker = (container, options) =>
    bael.create(container, {
      showFooter: true,
      ...options,
    });
  window.$dateRange = (container, options) =>
    bael.create(container, {
      range: true,
      showFooter: true,
      ...options,
    });

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCalendar = bael;

  console.log("📅 BAEL Calendar Component loaded");
})();
