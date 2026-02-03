import { LitElement, html } from "lit";
import { colCalPopoverStyles } from "./col-cal-popover.css";

/**
 * Feature detection for native Popover API support.
 * The Popover API is available in Chrome 114+, Edge 114+, Safari 17+.
 * @returns true if the browser supports the native Popover API
 */
export function supportsPopoverAPI(): boolean {
  return (
    typeof HTMLElement !== "undefined" &&
    "popover" in HTMLElement.prototype &&
    typeof HTMLElement.prototype.showPopover === "function" &&
    typeof HTMLElement.prototype.hidePopover === "function"
  );
}

/**
 * ColCalPopover - A calendar popover component using the native HTML Popover API.
 *
 * This component leverages the browser's native popover functionality for better
 * accessibility, performance, and standards compliance. It uses:
 * - The `popover="auto"` attribute for automatic light-dismiss behavior
 * - The `:popover-open` CSS pseudo-selector for styling open state
 * - CSS anchor positioning for placement relative to trigger elements
 *
 * For browsers that don't support the Popover API, it provides graceful
 * degradation using a JavaScript-based fallback mechanism.
 *
 * @fires col-cal-show - Fired when the popover is shown
 * @fires col-cal-after-hide - Fired when the popover is hidden
 *
 * @example
 * ```html
 * <button id="trigger">Open Calendar</button>
 * <col-cal-popover for="trigger">
 *   <div>Popover content</div>
 * </col-cal-popover>
 * ```
 */
export class ColCalPopover extends LitElement {
  static styles = colCalPopoverStyles;

  static properties = {
    for: { type: String },
    dataTestid: { type: String },
    _open: { state: true },
  };

  /**
   * The ID of the anchor element that triggers this popover.
   * The popover will be positioned relative to this element.
   */
  for: string = "";

  /**
   * Data-testid attribute for testing purposes.
   */
  dataTestid: string = "ColCal-Popover";

  /**
   * Internal state tracking whether the popover is open.
   * Used for fallback mode when native popover is not supported.
   */
  private _open: boolean = false;

  /**
   * Whether native Popover API is supported in this browser.
   */
  private _supportsNativePopover: boolean = supportsPopoverAPI();

  /**
   * Reference to the anchor element that triggers this popover.
   */
  private _anchorElement: HTMLElement | null = null;

  /**
   * CSS anchor name for positioning the popover relative to the anchor.
   */
  private _anchorName: string = "";

  /**
   * Reference to the popover container element.
   */
  private get _popoverElement(): HTMLElement | null {
    return this.renderRoot?.querySelector(".popover-container") ?? null;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupAnchor();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanupAnchor();
  }

  /**
   * Sets up the anchor element reference and configures the trigger.
   * In native mode, sets up popovertarget attribute on the anchor.
   * In fallback mode, adds click event listener.
   */
  private _setupAnchor(): void {
    requestAnimationFrame(() => {
      if (this.for) {
        const root = this.getRootNode() as Document | ShadowRoot;
        this._anchorElement = root.getElementById(this.for);
        if (this._anchorElement) {
          // Create unique anchor name from the element's ID for CSS anchor positioning
          this._anchorName = `--anchor-${this.for}`;
          // Set anchor-name CSS property on the target element
          this._anchorElement.style.setProperty("anchor-name", this._anchorName);

          if (this._supportsNativePopover) {
            // Use native popovertarget attribute for the trigger
            // Note: Since we're using Shadow DOM, we need to wait for the
            // popover element to be rendered before setting up the target
            this.updateComplete.then(() => {
              const popoverEl = this._popoverElement;
              if (popoverEl && this._anchorElement) {
                // Generate a unique ID for the popover element if needed
                const popoverId = `popover-${this.for}`;
                popoverEl.id = popoverId;
                // Set popovertarget on the anchor element
                this._anchorElement.setAttribute("popovertarget", popoverId);
                this._anchorElement.setAttribute("popovertargetaction", "toggle");
              }
            });
          } else {
            // Fallback: use click listener for browsers without popover support
            this._anchorElement.addEventListener("click", this._handleAnchorClick);
          }
        }
      }
    });
  }

  /**
   * Cleans up event listeners and CSS properties when disconnected.
   */
  private _cleanupAnchor(): void {
    if (this._anchorElement) {
      this._anchorElement.removeEventListener("click", this._handleAnchorClick);
      // Remove anchor-name from the element
      this._anchorElement.style.removeProperty("anchor-name");
      // Remove popovertarget attributes
      this._anchorElement.removeAttribute("popovertarget");
      this._anchorElement.removeAttribute("popovertargetaction");
    }
  }

  /**
   * Handles click on anchor element (fallback mode only).
   */
  private _handleAnchorClick = (): void => {
    this.show();
  };

  /**
   * Shows the popover.
   * Uses native showPopover() API when available, falls back to state toggle.
   */
  public show(): void {
    const popoverEl = this._popoverElement;
    if (this._supportsNativePopover && popoverEl) {
      try {
        popoverEl.showPopover();
      } catch {
        // Popover might already be open, ignore error
      }
    }
    this._open = true;
    this.dispatchEvent(new CustomEvent("col-cal-show", { bubbles: true, composed: true }));
  }

  /**
   * Hides the popover.
   * Uses native hidePopover() API when available, falls back to state toggle.
   */
  public hide(): void {
    const popoverEl = this._popoverElement;
    if (this._supportsNativePopover && popoverEl) {
      try {
        popoverEl.hidePopover();
      } catch {
        // Popover might already be hidden, ignore error
      }
    }
    this._open = false;
    this.dispatchEvent(new CustomEvent("col-cal-after-hide", { bubbles: true, composed: true }));
  }

  /**
   * Handles click on backdrop (fallback mode only).
   * In native mode, the popover auto-dismisses via light-dismiss behavior.
   */
  private _handleBackdropClick = (): void => {
    this.hide();
  };

  /**
   * Handles the native 'toggle' event from the Popover API.
   * This event fires when the popover state changes.
   */
  private _handlePopoverToggle = (event: Event): void => {
    const toggleEvent = event as ToggleEvent;
    if (toggleEvent.newState === "open") {
      this._open = true;
      this.dispatchEvent(new CustomEvent("col-cal-show", { bubbles: true, composed: true }));
    } else if (toggleEvent.newState === "closed") {
      this._open = false;
      this.dispatchEvent(new CustomEvent("col-cal-after-hide", { bubbles: true, composed: true }));
    }
  };

  render() {
    // Render different markup based on native popover support
    if (this._supportsNativePopover) {
      return this._renderNativePopover();
    }
    return this._renderFallbackPopover();
  }

  /**
   * Renders the popover using native Popover API.
   * Uses popover="auto" for automatic light-dismiss behavior.
   */
  private _renderNativePopover() {
    return html`
      <div
        class="popover-container"
        popover="auto"
        style="--popover-anchor: ${this._anchorName}"
        data-testid="${this.dataTestid}"
        @toggle=${this._handlePopoverToggle}
      >
        <div class="popover-content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /**
   * Renders the popover using fallback mechanism for browsers
   * that don't support the native Popover API.
   * Uses a backdrop element for light-dismiss behavior.
   */
  private _renderFallbackPopover() {
    return html`
      ${this._open
        ? html`<div
            class="popover-backdrop"
            @click=${this._handleBackdropClick}
          ></div>`
        : null}
      <div
        class="popover-container"
        ?data-open=${this._open}
        style="--popover-anchor: ${this._anchorName}"
        data-testid="${this.dataTestid}"
      >
        <div class="popover-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define("col-cal-popover", ColCalPopover);

declare global {
  interface HTMLElementTagNameMap {
    "col-cal-popover": ColCalPopover;
  }
}
