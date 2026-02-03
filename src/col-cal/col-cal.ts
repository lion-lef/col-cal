import { LitElement, html } from "lit";
import "../col-cal-header/col-cal-header";
import "../col-cal-dates/col-cal-dates";
import "../col-cal-months/col-cal-months";
import "../col-cal-years/col-cal-years";
import "../col-cal-popover/col-cal-popover";
import type { MonthNumber } from "../col-cal.type";
import { createDateFromMonthNumber, getMonths } from "../date.utils";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import type { ColCalPopover } from "../col-cal-popover/col-cal-popover";
import { insertSlotsByName } from "../lightdom.utils";
import { colCalStyles } from "./col-cal.css";

export class ColCal extends LitElement {
  static properties = {
    date: { type: Object },
    minDate: { type: Object },
    maxDate: { type: Object },
    locale: { type: String },
    dataTestid: { type: String },
    firstDayOfWeek: { type: Number },
    disabledDates: { type: Array },
    events: { type: Array },
    _date: { state: true },
  };

  date: Date = new Date();
  minDate: Date | null = null;
  maxDate: Date | null = null;
  locale: string = "en-US";
  dataTestid: string = "ColCal";
  firstDayOfWeek: number = 1;
  disabledDates: Date[] = [];
  events: Array<{ date: Date; title: string }> = [];

  private _date: Date = this.date;
  private _monthsButtonId: string = "open-months-popup";
  private _yearsButtonId: string = "open-years-popup";

  private popoverYearsRef: Ref<ColCalPopover> = createRef();
  private popoverMonthsRef: Ref<ColCalPopover> = createRef();

  private get currentLocale(): string {
    return this.locale;
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private generateUniqueButtonId(prefix: string) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return prefix + crypto.randomUUID().substring(0, 5);
    }

    const randomPart =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return prefix + randomPart;
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.date !== null) {
      this._date = this.date;
    } else {
      this._date = new Date();
    }

    this._monthsButtonId = this.generateUniqueButtonId(this._monthsButtonId);
    this._yearsButtonId = this.generateUniqueButtonId(this._yearsButtonId);

    requestAnimationFrame(() => {
      insertSlotsByName(this);
    });
  }

  updated(): void {
    requestAnimationFrame(() => {
      insertSlotsByName(this);
    });
  }

  private handleChangeMonth({ detail }: { detail: { month: MonthNumber } }) {
    this._date = createDateFromMonthNumber(detail.month, this._date.getFullYear());
    if (this.popoverMonthsRef.value) {
      this.popoverMonthsRef.value.hide();
    }
  }

  private handleYearSelected({ detail }: { detail: { year: number } }) {
    this._date = new Date(this._date.getFullYear(), this._date.getMonth(), 3);
    this._date.setFullYear(detail.year);
    if (this.popoverYearsRef.value) {
      this.popoverYearsRef.value.hide();
    }
  }

  private handleMonthsChange() {
    this.dispatchEvent(
      new CustomEvent("show-months", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleYearsChange() {
    this.dispatchEvent(
      new CustomEvent("show-years", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleYearsHideChange() {
    this.dispatchEvent(
      new CustomEvent("hide-years", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleMonthsHideChange() {
    this.dispatchEvent(
      new CustomEvent("hide-months", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleDateSelected(e: CustomEvent) {
    this.date = e.detail;
    this.dispatchEvent(
      new CustomEvent("change-date", {
        detail: { date: this.date },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    return html`
      <style>
        ${colCalStyles}
      </style>
      <div class="calendar" data-testid="${this.dataTestid}">
        <col-cal-header
          .date=${this._date}
          .locale=${this.currentLocale}
          .minDate=${this.minDate}
          .maxDate=${this.maxDate}
          .dataTestid="${`${this.dataTestid}-Header`}"
          @change-month=${({ detail }: { detail: Date }) => {
            this._date = detail as Date;
          }}
        >
          <div
            slot="header-date"
            class="calendar__header-date"
            data-testid="${`${this.dataTestid}-Header-Date`}"
          >
            <button
              id="${this._monthsButtonId}"
              class="popup"
              data-testid="${`${this.dataTestid}-Months`}"
            >
              ${getMonths(this.currentLocale).at(this._date.getMonth())}
              <div
                name="months-popup-icon"
                data-testid="${`${this.dataTestid}-MonthsIcon`}"
              ></div>
            </button>
            <button
              id="${this._yearsButtonId}"
              class="popup"
              data-testid="${`${this.dataTestid}-Years`}"
            >
              ${this._date.getFullYear()}
              <div
                name="years-popup-icon"
                data-testid="${`${this.dataTestid}-YearsIcon`}"
              ></div>
            </button>
          </div>
          <div
            part="icon-button"
            name="icon-left-button"
            slot="icon-left-button"
            data-testid="${`${this.dataTestid}-IconsLeftYear`}"
          >
            &lt;
          </div>
          <div
            part="icon-button"
            name="icon-right-button"
            slot="icon-right-button"
            data-testid="${`${this.dataTestid}-IconsRightYear`}"
          >
            &gt;
          </div>
        </col-cal-header>

        <col-cal-popover
          ${ref(this.popoverMonthsRef)}
          for="${this._monthsButtonId}"
          data-testid="${`${this.dataTestid}-Popover-Months`}"
          @col-cal-show="${this.handleMonthsChange}"
          @col-cal-after-hide="${this.handleMonthsHideChange}"
        >
          <col-cal-months
            dataTestid="${`${this.dataTestid}-Months`}"
            .year="${this._date.getFullYear()}"
            .selectedMonth=${this._date.getMonth()}
            .minMonth=${this.minDate}
            .maxMonth=${this.maxDate}
            .locale=${this.currentLocale}
            @change-month="${this.handleChangeMonth}"
          ></col-cal-months>
        </col-cal-popover>

        <col-cal-popover
          ${ref(this.popoverYearsRef)}
          for="${this._yearsButtonId}"
          data-testid="${`${this.dataTestid}-Popover-Years`}"
          @col-cal-show="${this.handleYearsChange}"
          @col-cal-after-hide="${this.handleYearsHideChange}"
        >
          <col-cal-years
            .dataTestid="${`${this.dataTestid}-Years`}"
            .selectedYear=${this._date.getFullYear()}
            .minYear=${this.minDate?.getFullYear()}
            .maxYear=${this.maxDate?.getFullYear()}
            @change-year=${this.handleYearSelected}
          >
            <div
              part="years-arrow-icon"
              slot="icon-left-button"
              name="years-icon-left"
              data-testid="${`${this.dataTestid}-LeftButton`}"
            >
              &lt;
            </div>
            <div
              part="years-arrow-icon"
              slot="icon-right-button"
              name="years-icon-right"
              data-testid="${`${this.dataTestid}-RightButton`}"
            >
              &gt;
            </div>
          </col-cal-years>
        </col-cal-popover>

        <col-cal-dates
          .dataTestid="${`${this.dataTestid}-Dates`}"
          .month=${this._date}
          .minDate=${this.minDate}
          .maxDate=${this.maxDate}
          .selectedDate=${this.date}
          .locale=${this.currentLocale}
          .firstDayOfWeek=${this.firstDayOfWeek}
          .disabledDates=${this.disabledDates}
          .events=${this.events}
          @change-date=${this.handleDateSelected}
        ></col-cal-dates>
      </div>
    `;
  }
}

customElements.define("col-cal", ColCal);

declare global {
  interface HTMLElementTagNameMap {
    "col-cal": ColCal;
  }
}
