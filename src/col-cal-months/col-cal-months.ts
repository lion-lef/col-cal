import { LitElement } from "lit";
import type { MonthNumber } from "../col-cal.type";
import { getMonths, isAfter, isBefore } from "../date.utils";
import { colCalMonthsStyles } from "./col-cal-months.css";
import { renderColCalMonths } from "./col-cal-months.html";

export class ColCalMonths extends LitElement {
  static styles = colCalMonthsStyles;

  static properties = {
    selectedMonth: { type: Number },
    disabledMonths: { type: Array },
    year: { type: Number },
    minMonth: { type: Object },
    maxMonth: { type: Object },
    locale: { type: String },
    dataTestid: { type: String },
  };

  selectedMonth: MonthNumber | null = null;
  disabledMonths: MonthNumber[] | null = null;
  year: number = new Date().getFullYear();
  minMonth: Date | null = null;
  maxMonth: Date | null = null;
  locale: string = "en-US";
  dataTestid: string = "ColCal-Months";

  private getFromIndexMonth(month: string): MonthNumber {
    return getMonths(this.locale).indexOf(month) as MonthNumber;
  }

  private isSelected = (month: string): boolean => {
    return this.selectedMonth === this.getFromIndexMonth(month);
  };

  private isDisabled = (month: string): boolean => {
    const monthIndex = this.getFromIndexMonth(month);
    if (this.minMonth) {
      const monthDate = new Date(this.year, monthIndex, this.minMonth.getDay());

      if (isBefore(monthDate, this.minMonth)) {
        return true;
      }
    }

    if (this.maxMonth) {
      const monthDate = new Date(this.year, monthIndex, this.maxMonth.getDay());

      if (isAfter(monthDate, this.maxMonth)) {
        return true;
      }
    }

    return this.disabledMonths?.includes(monthIndex) ?? false;
  };

  private handleMonthSelect = (month: string): void => {
    this.dispatchEvent(
      new CustomEvent("change-month", {
        detail: { month: this.getFromIndexMonth(month) },
        bubbles: true,
        composed: true,
      })
    );
  };

  protected render() {
    return renderColCalMonths({
      locale: this.locale,
      dataTestid: this.dataTestid,
      isSelected: this.isSelected,
      isDisabled: this.isDisabled,
      handleMonthSelect: this.handleMonthSelect,
    });
  }
}

customElements.define("col-cal-months", ColCalMonths);

declare global {
  interface HTMLElementTagNameMap {
    "col-cal-months": ColCalMonths;
  }
}
