import { LitElement, html } from "lit";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
  addDays,
  subDays,
  getDay,
} from "../date.utils";
import { colCalDatesStyles } from "./col-cal-dates.css";
import { renderColCalDates } from "./col-cal-dates.html";

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export class ColCalDates extends LitElement {
  static styles = colCalDatesStyles;

  static properties = {
    month: { type: Object },
    minDate: { type: Object },
    maxDate: { type: Object },
    selectedDate: { type: Object },
    dataTestid: { type: String },
    locale: { type: String },
    firstDayOfWeek: { type: Number },
    disabledDates: { type: Array },
    events: { type: Array },
  };

  month: Date | null = null;
  minDate: Date | null = null;
  maxDate: Date | null = null;
  selectedDate: Date | null = null;
  dataTestid: string = "Dates";
  locale: string = "en-US";
  firstDayOfWeek: Day = 1;
  disabledDates: Date[] = [];
  events: Array<{ date: Date; title: string }> = [];

  private getPrevMonthDays(month: Date): Date[] {
    const start = startOfMonth(month);
    const firstDay = getDay(start);
    const daysBefore = (firstDay - this.firstDayOfWeek + 7) % 7;
    if (daysBefore === 0) {
      return [];
    }
    const prevMonthStart = subDays(start, daysBefore);
    return eachDayOfInterval({
      start: prevMonthStart,
      end: subDays(start, 1),
    });
  }

  private getNextMonthDays(month: Date): Date[] {
    const end = endOfMonth(month);
    const nextMonthStart = addDays(end, 1);
    const firstDayOfNext = getDay(nextMonthStart);

    const daysAfter =
      (7 - ((firstDayOfNext - this.firstDayOfWeek + 7) % 7)) % 7;

    if (daysAfter === 0) {
      return [];
    }

    const nextMonthEnd = addDays(nextMonthStart, daysAfter - 1);

    return eachDayOfInterval({
      start: nextMonthStart,
      end: nextMonthEnd,
    });
  }

  private getMonthDays() {
    if (!this.month) return null;

    const month = this.month;
    const currentMonthDays = eachDayOfInterval({
      start: startOfMonth(month),
      end: endOfMonth(month),
    });

    this.disabledDates = [
      ...this.getPrevMonthDays(month),
      ...this.getNextMonthDays(month),
    ];

    return [
      ...this.getPrevMonthDays(month),
      ...currentMonthDays,
      ...this.getNextMonthDays(month),
    ];
  }

  private isDateDisabled = (date: Date): boolean => {
    if (this.minDate) {
      const minDateCopy = new Date(this.minDate);
      minDateCopy.setHours(0, 0, 0, 0);
      if (isBefore(date, minDateCopy)) {
        return true;
      }
    }

    if (this.maxDate) {
      const maxDateCopy = new Date(this.maxDate);
      maxDateCopy.setHours(0, 0, 0, 0);
      if (isAfter(date, maxDateCopy)) {
        return true;
      }
    }

    return this.disabledDates.some((d) => isSameDay(date, d));
  };

  private handleDateSelect = (date: Date): void => {
    if (!this.isDateDisabled(date)) {
      this.selectedDate = date;
      this.dispatchEvent(new CustomEvent("change-date", { detail: date }));
    }
  };

  render() {
    const days = this.getMonthDays();
    if (!days) {
      return html``;
    }

    return renderColCalDates({
      days,
      selectedDate: this.selectedDate,
      dataTestid: this.dataTestid,
      locale: this.locale,
      isDateDisabled: this.isDateDisabled,
      handleDateSelect: this.handleDateSelect,
    });
  }
}

customElements.define("col-cal-dates", ColCalDates);

declare global {
  interface HTMLElementTagNameMap {
    "col-cal-dates": ColCalDates;
  }
}
