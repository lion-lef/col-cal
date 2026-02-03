import { LitElement } from "lit";
import { colCalYearsStyles } from "./col-cal-years.css";
import { renderColCalYears } from "./col-cal-years.html";

export class ColCalYears extends LitElement {
  static styles = colCalYearsStyles;

  static properties = {
    selectedYear: { type: Number },
    minYear: { type: Number },
    maxYear: { type: Number },
    disabledYears: { type: Array },
    dataTestid: { type: String },
    _startYear: { state: true },
  };

  selectedYear: number | null = null;
  minYear: number | null = null;
  maxYear: number | null = null;
  disabledYears: number[] = [];
  dataTestid: string = "ColCal-Years";
  private _startYear: number = 2005;
  private _chunkSize = 12;

  connectedCallback() {
    super.connectedCallback();
    this.initializeStartYear();
  }

  private initializeStartYear() {
    let centerYear = 2023;
    if (this.selectedYear && !isNaN(Number(this.selectedYear))) {
      centerYear = Number(this.selectedYear);
    }

    this._startYear = centerYear - 3;
  }

  private get fullYears() {
    return Array.from({ length: this._chunkSize }, (_, i) =>
      (this._startYear + i).toString()
    );
  }

  private handlePrev = (): void => {
    this._startYear -= this._chunkSize;
  };

  private handleNext = (): void => {
    this._startYear += this._chunkSize;
  };

  private isSelectedYear = (year: string): boolean => {
    return this.selectedYear === Number(year);
  };

  private isYearDisabled = (year: number): boolean => {
    if (this.minYear && year < this.minYear) {
      return true;
    }
    if (this.maxYear && year > this.maxYear) {
      return true;
    }
    return this.disabledYears.includes(year);
  };

  private handleYearSelect = (year: number): void => {
    this.selectedYear = year;
    this.dispatchEvent(
      new CustomEvent("change-year", {
        detail: { year: year },
        bubbles: true,
        composed: true,
      })
    );
  };

  protected render() {
    return renderColCalYears({
      dataTestid: this.dataTestid,
      years: this.fullYears,
      isSelectedYear: this.isSelectedYear,
      isYearDisabled: this.isYearDisabled,
      handlePrev: this.handlePrev,
      handleNext: this.handleNext,
      handleYearSelect: this.handleYearSelect,
    });
  }
}

customElements.define("col-cal-years", ColCalYears);

declare global {
  interface HTMLElementTagNameMap {
    "col-cal-years": ColCalYears;
  }
}
