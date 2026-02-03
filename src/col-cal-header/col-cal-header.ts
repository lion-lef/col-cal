import { LitElement } from "lit";
import { addMonths, isAfter, isBefore, subMonths } from "../date.utils";
import { colCalHeaderStyles } from "./col-cal-header.css";
import { renderColCalHeader } from "./col-cal-header.html";

export class ColCalHeader extends LitElement {
  static styles = colCalHeaderStyles;

  static properties = {
    locale: { type: String },
    dataTestid: { type: String },
    date: { type: Object },
    minDate: { type: Object },
    maxDate: { type: Object },
    _date: { state: true },
  };

  locale: string = "en-US";
  dataTestid: string = "ColCal-Header";
  date: Date | null = null;
  minDate: Date | null = null;
  maxDate: Date | null = null;
  private _date: Date = this.date ?? new Date();

  handleChangeMonth() {
    this.dispatchEvent(
      new CustomEvent("change-month", {
        detail: this._date,
        bubbles: true,
        composed: true,
      })
    );
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.date !== null) {
      this._date = this.date;
    } else {
      this._date = new Date();
    }
  }

  updated(): void {
    if (this.date !== null) {
      this._date = this.date;
    } else {
      this._date = new Date();
    }
  }

  private isDateMinDisabled(date: Date | null) {
    if (date === null) return false;
    if (this.minDate && isBefore(date, this.minDate)) {
      return true;
    }
    return false;
  }

  private isDateMaxDisabled(date: Date | null) {
    if (date === null) return false;
    if (this.maxDate && isAfter(date, this.maxDate)) {
      return true;
    }
    return false;
  }

  private handlePrevMonth = () => {
    this._date = subMonths(this._date, 1);
    this.handleChangeMonth();
  };

  private handleNextMonth = () => {
    this._date = addMonths(this._date, 1);
    this.handleChangeMonth();
  };

  render() {
    return renderColCalHeader(
      this,
      this._date,
      this.locale,
      this.dataTestid,
      this.handlePrevMonth,
      this.handleNextMonth,
      this.isDateMinDisabled(this.date),
      this.isDateMaxDisabled(this.date)
    );
  }
}

customElements.define("col-cal-header", ColCalHeader);
