import { fixture, html, expect } from "@open-wc/testing";
import "../wc-location-field.js";

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("rendering", () => {
  it("renders a label when the label attribute is set", async () => {
    const el = await fixture(
      html`<wc-location-field label="From"></wc-location-field>`,
    );
    const label = el.querySelector(".lf-label");
    expect(label).to.exist;
    expect(label.textContent).to.equal("From");
  });

  it("renders no label element when label attribute is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-label")).to.be.null;
  });

  it("sets the input placeholder from the attribute", async () => {
    const el = await fixture(
      html`<wc-location-field placeholder="e.g. London"></wc-location-field>`,
    );
    expect(el.querySelector(".lf-input").placeholder).to.equal("e.g. London");
  });

  it("falls back to the default placeholder when the attribute is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-input").placeholder).to.equal(
      "Search for a location…",
    );
  });

  it("renders the GPS button", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-gps-btn")).to.exist;
  });

  it("renders a map container when show-map is present", async () => {
    const el = await fixture(
      html`<wc-location-field show-map></wc-location-field>`,
    );
    expect(el.querySelector(".lf-map-container")).to.exist;
  });

  it("does not render a map container when show-map is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-map-container")).to.be.null;
  });

  it("hides the suggestions list by default", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-suggestions").style.display).to.not.equal(
      "block",
    );
  });
});

// ─── Reactive attributes ──────────────────────────────────────────────────────

describe("reactive attributes", () => {
  it("updates the label text when the label attribute changes", async () => {
    const el = await fixture(
      html`<wc-location-field label="From"></wc-location-field>`,
    );
    el.setAttribute("label", "To");
    expect(el.querySelector(".lf-label").textContent).to.equal("To");
  });

  it("updates the input placeholder when the placeholder attribute changes", async () => {
    const el = await fixture(
      html`<wc-location-field placeholder="Search…"></wc-location-field>`,
    );
    el.setAttribute("placeholder", "New placeholder");
    expect(el.querySelector(".lf-input").placeholder).to.equal(
      "New placeholder",
    );
  });
});

// ─── Initial state ────────────────────────────────────────────────────────────

describe("initial state", () => {
  it("lat is null", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.lat).to.be.null;
  });

  it("lng is null", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.lng).to.be.null;
  });

  it("address is an empty string", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.address).to.equal("");
  });

  it("value is an empty string", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.value).to.equal("");
  });

  it("w3w is null", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.w3w).to.be.null;
  });
});

// ─── prefill() ────────────────────────────────────────────────────────────────

describe("prefill()", () => {
  it("sets the input value to the address", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    expect(el.querySelector(".lf-input").value).to.equal("Buckingham Palace");
  });

  it("sets lat and lng", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    expect(el.lat).to.equal(51.5014);
    expect(el.lng).to.equal(-0.1419);
  });

  it("shows coordinates in the coords element", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Test", lat: 51.5, lng: -0.1 });
    expect(el.querySelector(".lf-coords").textContent).to.include("51.50000");
  });

  it("returns address via the value getter", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    expect(el.value).to.equal("Buckingham Palace");
  });

  it("does not fire a location-change event", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    let fired = false;
    el.addEventListener("location-change", () => {
      fired = true;
    });
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    expect(fired).to.be.false;
  });

  it("ignores w3w when no w3w-key attribute is set", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({
      address: "Buckingham Palace",
      lat: 51.5014,
      lng: -0.1419,
      w3w: "filled.count.soap",
    });
    expect(el.w3w).to.be.null;
  });

  it("stores w3w when w3w-key attribute is set", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    el.prefill({
      address: "Buckingham Palace",
      lat: 51.5014,
      lng: -0.1419,
      w3w: "filled.count.soap",
    });
    expect(el.w3w).to.equal("filled.count.soap");
  });

  it("value returns w3w when w3w-key is set and w3w is provided", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    el.prefill({
      address: "Buckingham Palace",
      lat: 51.5014,
      lng: -0.1419,
      w3w: "filled.count.soap",
    });
    expect(el.value).to.equal("filled.count.soap");
  });
});

// ─── clear() ─────────────────────────────────────────────────────────────────

describe("clear()", () => {
  it("empties the input", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    el.clear();
    expect(el.querySelector(".lf-input").value).to.equal("");
  });

  it("resets lat and lng to null", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Test", lat: 51.5, lng: -0.1 });
    el.clear();
    expect(el.lat).to.be.null;
    expect(el.lng).to.be.null;
  });

  it("resets value to an empty string", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Test", lat: 51.5, lng: -0.1 });
    el.clear();
    expect(el.value).to.equal("");
  });

  it("clears the coords display", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.prefill({ address: "Test", lat: 51.5, lng: -0.1 });
    el.clear();
    expect(el.querySelector(".lf-coords").textContent).to.equal("");
  });
});

// ─── location-change event ────────────────────────────────────────────────────

describe("location-change event", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = (url) => {
      if (String(url).includes("nominatim")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              display_name: "Test Street, London, England",
              address: { road: "Test Street", city: "London" },
            }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    };
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it("fires when a location is resolved", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    let fired = false;
    el.addEventListener("location-change", () => {
      fired = true;
    });
    await el._setFromCoords(51.5, -0.1);
    expect(fired).to.be.true;
  });

  it("detail contains lat and lng", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });
    await el._setFromCoords(51.5, -0.1);
    expect(detail.lat).to.equal(51.5);
    expect(detail.lng).to.equal(-0.1);
  });

  it("detail contains the reverse-geocoded address", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });
    await el._setFromCoords(51.5, -0.1);
    expect(detail.address).to.equal("Test Street, London");
  });

  it("detail.w3w is empty when no w3w-key is set", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });
    await el._setFromCoords(51.5, -0.1);
    expect(detail.w3w).to.equal("");
  });

  it("bubbles up to parent elements", async () => {
    const container = await fixture(html`
      <div><wc-location-field></wc-location-field></div>`);
    const el = container.querySelector("wc-location-field");
    let bubbled = false;
    container.addEventListener("location-change", () => {
      bubbled = true;
    });
    await el._setFromCoords(51.5, -0.1);
    expect(bubbled).to.be.true;
  });

  it("updates internal state after resolving", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await el._setFromCoords(51.5, -0.1);
    expect(el.lat).to.equal(51.5);
    expect(el.lng).to.equal(-0.1);
    expect(el.address).to.equal("Test Street, London");
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe("accessibility", () => {
  it('input has role="combobox"', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-input").getAttribute("role")).to.equal(
      "combobox",
    );
  });

  it('input has aria-expanded="false" by default', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(
      el.querySelector(".lf-input").getAttribute("aria-expanded"),
    ).to.equal("false");
  });

  it("input has no aria-activedescendant by default", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-input").getAttribute("aria-activedescendant"))
      .to.be.null;
  });

  it('coords element has aria-live="polite"', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-coords").getAttribute("aria-live")).to.equal(
      "polite",
    );
  });

  it('status element has role="alert"', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const status = el.querySelector(".lf-status");
    expect(status.getAttribute("role")).to.equal("alert");
  });

  it("GPS button has an aria-label", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.querySelector(".lf-gps-btn").hasAttribute("aria-label")).to.be
      .true;
  });

  it("label is associated with the input via for/id", async () => {
    const el = await fixture(
      html`<wc-location-field label="From"></wc-location-field>`,
    );
    const label = el.querySelector(".lf-label");
    const input = el.querySelector(".lf-input");
    expect(label.htmlFor).to.equal(input.id);
  });

  it("map container has aria-label when show-map is set", async () => {
    const el = await fixture(
      html`<wc-location-field show-map></wc-location-field>`,
    );
    expect(el.querySelector(".lf-map-container").hasAttribute("aria-label")).to
      .be.true;
  });
});

// ─── Keyboard navigation ──────────────────────────────────────────────────────

describe("keyboard navigation", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = () =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              display_name: "Result One, London",
              address: { road: "Result One", city: "London" },
              lat: "51.5",
              lon: "-0.1",
            },
            {
              display_name: "Result Two, London",
              address: { road: "Result Two", city: "London" },
              lat: "51.6",
              lon: "-0.2",
            },
          ]),
      });
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  async function openSuggestions(el) {
    el.querySelector(".lf-input").value = "Lond";
    el.querySelector(".lf-input").dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));
  }

  it("ArrowDown moves aria-activedescendant to the first option", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    el.querySelector(".lf-input").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    const activeId = el
      .querySelector(".lf-input")
      .getAttribute("aria-activedescendant");
    expect(activeId).to.not.equal("");
    expect(el.querySelector(`#${activeId}`)).to.exist;
  });

  it("ArrowDown marks the first option with lf-active", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    el.querySelector(".lf-input").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    const items = el.querySelectorAll(
      '.lf-suggestions li[role="option"]:not([aria-disabled])',
    );
    expect(items[0].classList.contains("lf-active")).to.be.true;
  });

  it("Escape closes the suggestions", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    expect(el.querySelector(".lf-suggestions").style.display).to.equal("block");
    el.querySelector(".lf-input").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(el.querySelector(".lf-suggestions").style.display).to.equal("none");
  });

  it("suggestion list items have id attributes", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    const items = el.querySelectorAll(
      '.lf-suggestions li[role="option"]:not([aria-disabled])',
    );
    items.forEach((li) => {
      expect(li.id).to.not.equal("");
    });
  });

  it("ArrowDown twice marks the second option active", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    const input = el.querySelector(".lf-input");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    const items = el.querySelectorAll(
      '.lf-suggestions li[role="option"]:not([aria-disabled])',
    );
    expect(items[1].classList.contains("lf-active")).to.be.true;
    expect(items[0].classList.contains("lf-active")).to.be.false;
  });

  it("ArrowUp moves back to the previous option", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    const input = el.querySelector(".lf-input");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
    );
    const items = el.querySelectorAll(
      '.lf-suggestions li[role="option"]:not([aria-disabled])',
    );
    expect(items[0].classList.contains("lf-active")).to.be.true;
  });

  it("ArrowDown does not go past the last option", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    const input = el.querySelector(".lf-input");
    for (let i = 0; i < 10; i++) {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    }
    const items = el.querySelectorAll(
      '.lf-suggestions li[role="option"]:not([aria-disabled])',
    );
    expect(items[items.length - 1].classList.contains("lf-active")).to.be.true;
  });

  it("ArrowUp does not go before the first option", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    const input = el.querySelector(".lf-input");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    for (let i = 0; i < 10; i++) {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
    }
    const items = el.querySelectorAll(
      '.lf-suggestions li[role="option"]:not([aria-disabled])',
    );
    expect(items[0].classList.contains("lf-active")).to.be.true;
  });

  it("Escape removes aria-activedescendant", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);
    const input = el.querySelector(".lf-input");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(input.getAttribute("aria-activedescendant")).to.be.null;
  });

  it("Enter on an active option fires location-change", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await openSuggestions(el);

    // swap fetch for the reverse-geocode call triggered by _selectResult
    window.fetch = () =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            display_name: "Result One, London",
            address: { road: "Result One", city: "London" },
          }),
      });

    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });

    const input = el.querySelector(".lf-input");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    await new Promise((r) => setTimeout(r, 100));
    expect(detail).to.exist;
    expect(detail.lat).to.equal(51.5);
    expect(detail.lng).to.equal(-0.1);
  });
});

// ─── Search behaviour ─────────────────────────────────────────────────────────

describe("search behaviour", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
  });
  afterEach(() => {
    window.fetch = originalFetch;
  });

  it("does not fetch when the query is fewer than 3 characters", async () => {
    let called = false;
    window.fetch = () => {
      called = true;
      return Promise.resolve({ json: () => Promise.resolve([]) });
    };
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.querySelector(".lf-input").value = "Lo";
    el.querySelector(".lf-input").dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));
    expect(called).to.be.false;
  });

  it("sets aria-expanded to true when suggestions open", async () => {
    window.fetch = () =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              display_name: "London, England",
              address: { city: "London" },
              lat: "51.5",
              lon: "-0.1",
            },
          ]),
      });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.querySelector(".lf-input").value = "Lond";
    el.querySelector(".lf-input").dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));
    expect(
      el.querySelector(".lf-input").getAttribute("aria-expanded"),
    ).to.equal("true");
  });

  it("renders a no-results item when search returns empty", async () => {
    window.fetch = () => Promise.resolve({ json: () => Promise.resolve([]) });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.querySelector(".lf-input").value = "xyzzy";
    el.querySelector(".lf-input").dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));
    expect(el.querySelector(".lf-no-results")).to.exist;
  });
});

// ─── value getter priority ────────────────────────────────────────────────────

describe("value getter", () => {
  it("returns the W3W address when one is resolved", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el._w3w = "///some.test.words";
    el._address = "Some Street, London";
    expect(el.value).to.equal("///some.test.words");
  });

  it("falls back to address when W3W is not set", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el._address = "Some Street, London";
    expect(el.value).to.equal("Some Street, London");
  });

  it("falls back to raw input when neither W3W nor address is set", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.querySelector(".lf-input").value = "partial input";
    expect(el.value).to.equal("partial input");
  });
});

// ─── Status messages ──────────────────────────────────────────────────────────

describe("status messages", () => {
  it("_setStatus updates the status element", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el._setStatus("Test message");
    expect(el.querySelector(".lf-status").textContent).to.equal("Test message");
  });

  it("_setStatus clears the status element when called with an empty string", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el._setStatus("Test message");
    el._setStatus("");
    expect(el.querySelector(".lf-status").textContent).to.equal("");
  });
});

// ─── radiusKm getter ──────────────────────────────────────────────────────────

describe("radiusKm getter", () => {
  it("returns null when radius-km is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.radiusKm).to.be.null;
  });

  it("returns the numeric value when radius-km is set", async () => {
    const el = await fixture(
      html`<wc-location-field radius-km="2.5"></wc-location-field>`,
    );
    expect(el.radiusKm).to.equal(2.5);
  });

  it("returns null when radius-km is a non-numeric string", async () => {
    const el = await fixture(
      html`<wc-location-field radius-km="bad"></wc-location-field>`,
    );
    expect(el.radiusKm).to.be.null;
  });
});

// ─── geojson property ─────────────────────────────────────────────────────────

describe("geojson property", () => {
  const POLYGON = {
    type: "Polygon",
    coordinates: [
      [
        [0.1, 52.3],
        [0.2, 52.3],
        [0.2, 52.4],
        [0.1, 52.4],
        [0.1, 52.3],
      ],
    ],
  };

  it("is null by default", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.geojson).to.be.null;
  });

  it("stores an object assigned to the property", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.geojson = POLYGON;
    expect(el.geojson).to.deep.equal(POLYGON);
  });

  it("parses a JSON string assigned to the property", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.geojson = JSON.stringify(POLYGON);
    expect(el.geojson).to.deep.equal(POLYGON);
  });

  it("_overlayLayer is null initially", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._overlayLayer).to.be.null;
  });
});

// ─── _mapCentre() ─────────────────────────────────────────────────────────────

describe("_mapCentre()", () => {
  it("returns center-lat/center-lng when set and no geojson", async () => {
    const el = await fixture(
      html`<wc-location-field center-lat="52.5" center-lng="0.3"></wc-location-field>`,
    );
    const centre = el._mapCentre();
    expect(centre[0]).to.equal(52.5);
    expect(centre[1]).to.equal(0.3);
  });

  it("falls back to [51.505, -0.09] when no center-lat and no geojson", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const centre = el._mapCentre();
    expect(centre[0]).to.equal(51.505);
    expect(centre[1]).to.equal(-0.09);
  });

  it("returns the geojson centroid for the Google provider", async () => {
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    el._geojson = {
      type: "Polygon",
      coordinates: [
        [
          [0, 50],
          [2, 50],
          [2, 52],
          [0, 52],
          [0, 50],
        ],
      ],
    };
    const centre = el._mapCentre();
    expect(centre[0]).to.equal(51);
    expect(centre[1]).to.equal(1);
  });
});

// ─── mapProvider / googleMapsKey getters ──────────────────────────────────────

describe("mapProvider getter", () => {
  it('returns "nominatim" by default', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.mapProvider).to.equal("nominatim");
  });

  it('returns "google" when map-provider="google" is set', async () => {
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    expect(el.mapProvider).to.equal("google");
  });
});

describe("googleMapsKey getter", () => {
  it("returns null when google-maps-key is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.googleMapsKey).to.be.null;
  });

  it("returns the key string when google-maps-key is set", async () => {
    const el = await fixture(
      html`<wc-location-field google-maps-key="TEST_KEY"></wc-location-field>`,
    );
    expect(el.googleMapsKey).to.equal("TEST_KEY");
  });
});

// ─── _setFromCoords() with Google provider ────────────────────────────────────

describe("_setFromCoords() with Google provider", () => {
  let originalGoogle;

  beforeEach(() => {
    originalGoogle = window.google;
    window.google = {
      maps: {
        Geocoder: class {
          geocode(_opts, cb) {
            cb([{ formatted_address: "Buckingham Palace, London, UK" }], "OK");
          }
        },
      },
    };
  });

  afterEach(() => {
    window.google = originalGoogle;
  });

  it("reads formatted_address from the Geocoder response", async () => {
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });
    await el._setFromCoords(51.5014, -0.1419);
    expect(detail.address).to.equal("Buckingham Palace, London, UK");
  });

  it("fires location-change with the correct lat and lng", async () => {
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });
    await el._setFromCoords(51.5014, -0.1419);
    expect(detail.lat).to.equal(51.5014);
    expect(detail.lng).to.equal(-0.1419);
  });

  it("sets the input value to the formatted address", async () => {
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    await el._setFromCoords(51.5014, -0.1419);
    expect(el.querySelector(".lf-input").value).to.equal(
      "Buckingham Palace, London, UK",
    );
  });

  it("still fires location-change when the Geocoder returns no results", async () => {
    window.google.maps.Geocoder = class {
      geocode(_opts, cb) {
        cb([], "ZERO_RESULTS");
      }
    };
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    let fired = false;
    el.addEventListener("location-change", () => {
      fired = true;
    });
    await el._setFromCoords(51.5014, -0.1419);
    expect(fired).to.be.true;
  });
});

// ─── clear() with Google provider ────────────────────────────────────────────

describe("clear() with Google provider", () => {
  it("calls setMap(null) on the marker instead of remove()", async () => {
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    let setMapArg = "not-called";
    el._marker = {
      setMap: (v) => {
        setMapArg = v;
      },
    };
    el.clear();
    expect(setMapArg).to.be.null;
  });

  it("sets _marker to null after clearing", async () => {
    const el = await fixture(
      html`<wc-location-field map-provider="google"></wc-location-field>`,
    );
    el._marker = { setMap: () => {} };
    el.clear();
    expect(el._marker).to.be.null;
  });
});

// ─── _geojsonCenter() ─────────────────────────────────────────────────────────

describe("_geojsonCenter()", () => {
  it("returns the bounding-box centre of a Polygon", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const [lat, lng] = el._geojsonCenter({
      type: "Polygon",
      coordinates: [
        [
          [0, 50],
          [2, 50],
          [2, 52],
          [0, 52],
          [0, 50],
        ],
      ],
    });
    expect(lat).to.equal(51);
    expect(lng).to.equal(1);
  });

  it("returns the centroid across all features in a FeatureCollection", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const [lat, lng] = el._geojsonCenter({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 50] },
          properties: {},
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [2, 52] },
          properties: {},
        },
      ],
    });
    expect(lat).to.equal(51);
    expect(lng).to.equal(1);
  });

  it("handles a wrapped Feature", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const [lat, lng] = el._geojsonCenter({
      type: "Feature",
      geometry: { type: "Point", coordinates: [1, 51] },
      properties: {},
    });
    expect(lat).to.equal(51);
    expect(lng).to.equal(1);
  });

  it("returns null for a FeatureCollection with no features", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._geojsonCenter({ type: "FeatureCollection", features: [] })).to.be
      .null;
  });
});

// ─── readonly ─────────────────────────────────────────────────────────────────

describe("readonly", () => {
  it("readonly getter returns true when the attribute is present", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    expect(el.readonly).to.be.true;
  });

  it("readonly getter returns false when the attribute is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el.readonly).to.be.false;
  });

  it("does not render an input element", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    expect(el.querySelector(".lf-input")).to.be.null;
  });

  it("does not render a GPS button", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    expect(el.querySelector(".lf-gps-btn")).to.be.null;
  });

  it("does not render a coords element", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    expect(el.querySelector(".lf-coords")).to.be.null;
  });

  it("does not render a status element", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    expect(el.querySelector(".lf-status")).to.be.null;
  });

  it("does not render a suggestions list", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    expect(el.querySelector(".lf-suggestions")).to.be.null;
  });

  it("renders a map container when show-map is also set", async () => {
    const el = await fixture(
      html`<wc-location-field readonly show-map></wc-location-field>`,
    );
    expect(el.querySelector(".lf-map-container")).to.exist;
  });

  it("does not render a map container when show-map is absent", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    expect(el.querySelector(".lf-map-container")).to.be.null;
  });

  it("does not render the map hint paragraph", async () => {
    const el = await fixture(
      html`<wc-location-field readonly show-map></wc-location-field>`,
    );
    expect(el.querySelector(".lf-hint")).to.be.null;
  });

  it("still renders a label when the label attribute is set", async () => {
    const el = await fixture(
      html`<wc-location-field readonly label="Venue"></wc-location-field>`,
    );
    const label = el.querySelector(".lf-label");
    expect(label).to.exist;
    expect(label.textContent).to.equal("Venue");
  });

  it("label has no for attribute in readonly mode", async () => {
    const el = await fixture(
      html`<wc-location-field readonly label="Venue"></wc-location-field>`,
    );
    expect(el.querySelector(".lf-label").hasAttribute("for")).to.be.false;
  });

  it('map container has aria-label="Location map"', async () => {
    const el = await fixture(
      html`<wc-location-field readonly show-map></wc-location-field>`,
    );
    expect(
      el.querySelector(".lf-map-container").getAttribute("aria-label"),
    ).to.equal("Location map");
  });

  it("prefill() stores lat and lng", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    expect(el.lat).to.equal(51.5014);
    expect(el.lng).to.equal(-0.1419);
  });

  it("prefill() stores address", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    expect(el.address).to.equal("Buckingham Palace");
  });

  it("value getter returns address from prefill", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    expect(el.value).to.equal("Buckingham Palace");
  });

  it("clear() resets lat, lng, and address", async () => {
    const el = await fixture(
      html`<wc-location-field readonly></wc-location-field>`,
    );
    el.prefill({ address: "Buckingham Palace", lat: 51.5014, lng: -0.1419 });
    el.clear();
    expect(el.lat).to.be.null;
    expect(el.lng).to.be.null;
    expect(el.address).to.equal("");
  });
});

// ─── Multiple instances ───────────────────────────────────────────────────────

describe("multiple instances", () => {
  it("two instances have different suggestion list IDs", async () => {
    const a = await fixture(html`<wc-location-field></wc-location-field>`);
    const b = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(a.querySelector(".lf-suggestions").id).to.not.equal(
      b.querySelector(".lf-suggestions").id,
    );
  });

  it("two instances have different input IDs", async () => {
    const a = await fixture(
      html`<wc-location-field label="A"></wc-location-field>`,
    );
    const b = await fixture(
      html`<wc-location-field label="B"></wc-location-field>`,
    );
    expect(a.querySelector(".lf-input").id).to.not.equal(
      b.querySelector(".lf-input").id,
    );
  });
});

// ─── _esc() ───────────────────────────────────────────────────────────────────

describe("_esc()", () => {
  it("escapes ampersands", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc("a & b")).to.equal("a &amp; b");
  });

  it("escapes less-than signs", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc("<script>")).to.equal("&lt;script&gt;");
  });

  it("escapes greater-than signs", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc(">")).to.equal("&gt;");
  });

  it("escapes double quotes", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc('"hello"')).to.equal("&quot;hello&quot;");
  });

  it("escapes all special characters in a combined XSS string", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc('<div class="a&b">')).to.equal(
      "&lt;div class=&quot;a&amp;b&quot;&gt;",
    );
  });

  it("converts numbers to string before escaping", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc(42)).to.equal("42");
  });

  it("converts null to string before escaping", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc(null)).to.equal("null");
  });

  it("returns plain text unchanged", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._esc("safe text")).to.equal("safe text");
  });
});

// ─── _formatAddress() ─────────────────────────────────────────────────────────

describe("_formatAddress()", () => {
  it("returns road and city when both are present", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(
      el._formatAddress({ address: { road: "High Street", city: "London" } }),
    ).to.equal("High Street, London");
  });

  it("uses town when city is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(
      el._formatAddress({
        address: { road: "High Street", town: "Cambridge" },
      }),
    ).to.equal("High Street, Cambridge");
  });

  it("prefers village over town", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(
      el._formatAddress({
        address: { road: "Church Lane", village: "Witchford", town: "Ely" },
      }),
    ).to.equal("Church Lane, Witchford");
  });

  it("uses path when road is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(
      el._formatAddress({ address: { path: "Canal Path", city: "Oxford" } }),
    ).to.equal("Canal Path, Oxford");
  });

  it("returns road only when no locality is present", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._formatAddress({ address: { road: "Some Road" } })).to.equal(
      "Some Road",
    );
  });

  it("falls back to the first two parts of display_name when address parts are empty", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(
      el._formatAddress({
        address: {},
        display_name: "Buckingham Palace, Westminster, London, England",
      }),
    ).to.equal("Buckingham Palace, Westminster");
  });

  it("falls back to display_name when address object is absent", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(
      el._formatAddress({ display_name: "A Place, City, Country" }),
    ).to.equal("A Place, City");
  });
});

// ─── geojson setter error handling ───────────────────────────────────────────

describe("geojson setter error handling", () => {
  it("does not throw when given a malformed JSON string", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(() => {
      el.geojson = "{bad json}";
    }).to.not.throw();
  });

  it("leaves _geojson unchanged when given a malformed JSON string", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const POLYGON = { type: "Polygon", coordinates: [] };
    el.geojson = POLYGON;
    el.geojson = "{bad json}";
    expect(el.geojson).to.deep.equal(POLYGON);
  });

  it("accepts a valid JSON string and parses it", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const POLYGON = { type: "Polygon", coordinates: [] };
    el.geojson = JSON.stringify(POLYGON);
    expect(el.geojson).to.deep.equal(POLYGON);
  });
});

// ─── clear() closes suggestions ──────────────────────────────────────────────

describe("clear() closes suggestions", () => {
  it("hides the suggestions dropdown", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el._listEl.style.display = "block";
    el._inputEl.setAttribute("aria-expanded", "true");
    el.clear();
    expect(el.querySelector(".lf-suggestions").style.display).to.equal("none");
  });

  it("sets aria-expanded to false after clear", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el._inputEl.setAttribute("aria-expanded", "true");
    el.clear();
    expect(
      el.querySelector(".lf-input").getAttribute("aria-expanded"),
    ).to.equal("false");
  });
});

// ─── disconnectedCallback ─────────────────────────────────────────────────────

describe("disconnectedCallback", () => {
  it("calls disconnect() on the ResizeObserver and nulls the reference", async () => {
    const container = await fixture(
      html`<div><wc-location-field></wc-location-field></div>`,
    );
    const el = container.querySelector("wc-location-field");
    let disconnected = false;
    el._resizeObserver = {
      disconnect: () => {
        disconnected = true;
      },
    };
    container.removeChild(el);
    expect(disconnected).to.be.true;
    expect(el._resizeObserver).to.be.null;
  });

  it("sets _map to null and calls remove() on a Leaflet map", async () => {
    const container = await fixture(
      html`<div><wc-location-field></wc-location-field></div>`,
    );
    const el = container.querySelector("wc-location-field");
    let removed = false;
    el._map = {
      remove: () => {
        removed = true;
      },
    };
    container.removeChild(el);
    expect(removed).to.be.true;
    expect(el._map).to.be.null;
  });

  it("nulls _marker and _overlayLayer when a map is active", async () => {
    const container = await fixture(
      html`<div><wc-location-field></wc-location-field></div>`,
    );
    const el = container.querySelector("wc-location-field");
    el._map = { remove: () => {} };
    el._marker = {};
    el._overlayLayer = {};
    container.removeChild(el);
    expect(el._marker).to.be.null;
    expect(el._overlayLayer).to.be.null;
  });

  it("cancels the debounce timer so no search fires after disconnect", async () => {
    const container = await fixture(
      html`<div><wc-location-field></wc-location-field></div>`,
    );
    const el = container.querySelector("wc-location-field");
    let timerFired = false;
    el._timer = setTimeout(() => {
      timerFired = true;
    }, 100);
    container.removeChild(el);
    await new Promise((r) => setTimeout(r, 200));
    expect(timerFired).to.be.false;
  });
});

// ─── search sequence counter (race condition) ─────────────────────────────────

describe("search sequence counter", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it("starts at zero", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    expect(el._searchSeq).to.equal(0);
  });

  it("increments with each search", async () => {
    window.fetch = () => Promise.resolve({ json: () => Promise.resolve([]) });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    el.querySelector(".lf-input").value = "Lond";
    el.querySelector(".lf-input").dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));
    expect(el._searchSeq).to.equal(1);
  });

  it("discards results from a superseded search", async () => {
    let resolveStale;
    let callCount = 0;

    window.fetch = () => {
      callCount++;
      if (callCount === 1) {
        return new Promise((resolve) => {
          resolveStale = () =>
            resolve({
              json: () =>
                Promise.resolve([
                  {
                    display_name: "Stale Result, Nowhere",
                    address: { road: "Stale Road", city: "Nowhere" },
                    lat: "50.0",
                    lon: "0.0",
                  },
                ]),
            });
        });
      }
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              display_name: "Fresh Result, London",
              address: { road: "Fresh Road", city: "London" },
              lat: "51.5",
              lon: "-0.1",
            },
          ]),
      });
    };

    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const input = el.querySelector(".lf-input");

    input.value = "Stale";
    input.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));

    input.value = "Fresh";
    input.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));

    resolveStale();
    await new Promise((r) => setTimeout(r, 50));

    const items = el.querySelectorAll(
      ".lf-suggestions li[role='option']:not([aria-disabled])",
    );
    expect(items[0].textContent.trim()).to.equal("Fresh Road, London");
  });
});

// ─── W3W pattern detection ────────────────────────────────────────────────────

describe("W3W pattern detection", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  async function searchAndCaptureUrl(el, query) {
    let calledUrl = "";
    window.fetch = (url) => {
      calledUrl = String(url);
      if (calledUrl.includes("what3words")) {
        return Promise.resolve({
          json: () => Promise.resolve({ suggestions: [] }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    };
    el.querySelector(".lf-input").value = query;
    el.querySelector(".lf-input").dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));
    return calledUrl;
  }

  it("routes three dot-separated words to the W3W endpoint", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    const url = await searchAndCaptureUrl(el, "word.word.word");
    expect(url).to.include("what3words.com");
  });

  it("routes ///word.word.word to the W3W endpoint", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    const url = await searchAndCaptureUrl(el, "///word.word.word");
    expect(url).to.include("what3words.com");
  });

  it("routes two-word input to Nominatim even with w3w-key set", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    const url = await searchAndCaptureUrl(el, "two.words");
    expect(url).to.include("nominatim");
  });

  it("routes plain text to Nominatim even with w3w-key set", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    const url = await searchAndCaptureUrl(el, "London Bridge");
    expect(url).to.include("nominatim");
  });

  it("routes three dot-separated words to Nominatim when no w3w-key is set", async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const url = await searchAndCaptureUrl(el, "word.word.word");
    expect(url).to.include("nominatim");
  });
});

// ─── W3W search results ───────────────────────────────────────────────────────

describe("W3W search results", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = () =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            suggestions: [
              { words: "filled.count.soap", nearestPlace: "London, UK" },
              { words: "index.home.raft", nearestPlace: "London, UK" },
            ],
          }),
      });
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  async function openW3WSuggestions(el) {
    el.querySelector(".lf-input").value = "filled.count.soap";
    el.querySelector(".lf-input").dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 400));
  }

  it("renders the /// prefix element for each suggestion", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    await openW3WSuggestions(el);
    const prefixes = el.querySelectorAll(".lf-w3w-prefix");
    expect(prefixes.length).to.equal(2);
    expect(prefixes[0].textContent).to.equal("///");
  });

  it("renders the nearest place for each suggestion", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    await openW3WSuggestions(el);
    expect(el.querySelector(".lf-nearby")).to.exist;
    expect(el.querySelector(".lf-nearby").textContent).to.equal("London, UK");
  });

  it("stores data-w3w on each suggestion item", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    await openW3WSuggestions(el);
    const items = el.querySelectorAll(
      ".lf-suggestions li[role='option']:not([aria-disabled])",
    );
    expect(items[0].dataset.w3w).to.equal("filled.count.soap");
    expect(items[1].dataset.w3w).to.equal("index.home.raft");
  });

  it("renders a no-results item when W3W returns no suggestions", async () => {
    window.fetch = () =>
      Promise.resolve({ json: () => Promise.resolve({ suggestions: [] }) });
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    await openW3WSuggestions(el);
    expect(el.querySelector(".lf-no-results")).to.exist;
  });
});

// ─── _selectW3W() ────────────────────────────────────────────────────────────

describe("_selectW3W()", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = (url) => {
      if (String(url).includes("convert-to-coordinates")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              coordinates: { lat: 51.5208, lng: -0.1967 },
              words: "filled.count.soap",
            }),
        });
      }
      if (String(url).includes("nominatim")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              display_name: "Paddington, London",
              address: { suburb: "Paddington", city: "London" },
            }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    };
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it("fires location-change with the resolved coordinates", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });
    await el._selectW3W("filled.count.soap");
    expect(detail).to.exist;
    expect(detail.lat).to.equal(51.5208);
    expect(detail.lng).to.equal(-0.1967);
  });

  it("sets _w3w to the /// prefixed form", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    await el._selectW3W("filled.count.soap");
    expect(el.w3w).to.equal("///filled.count.soap");
  });

  it("updates the input to the reverse-geocoded address after selection", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    await el._selectW3W("filled.count.soap");
    // _setFromCoords overwrites the input with the street address from reverse geocode
    // _formatAddress returns suburb only when no road is present; city is the second part
    expect(el.querySelector(".lf-input").value).to.equal("Paddington");
  });

  it("does not fire location-change when the API returns no coordinates", async () => {
    window.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    let fired = false;
    el.addEventListener("location-change", () => {
      fired = true;
    });
    await el._selectW3W("invalid.w3w.address");
    expect(fired).to.be.false;
  });

  it("hides the suggestions list after selection", async () => {
    const el = await fixture(
      html`<wc-location-field w3w-key="TEST"></wc-location-field>`,
    );
    el._listEl.style.display = "block";
    await el._selectW3W("filled.count.soap");
    expect(el.querySelector(".lf-suggestions").style.display).to.equal("none");
  });
});

// ─── geolocation ─────────────────────────────────────────────────────────────

describe("geolocation", () => {
  let originalFetch;
  let originalGeolocation;

  beforeEach(() => {
    originalFetch = window.fetch;
    originalGeolocation = navigator.geolocation;
    window.fetch = (url) => {
      if (String(url).includes("nominatim")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              display_name: "Test Place, London",
              address: { road: "Test Road", city: "London" },
            }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    };
  });

  afterEach(() => {
    window.fetch = originalFetch;
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
    });
  });

  function mockGeolocation(
    success,
    coords = { latitude: 51.5, longitude: -0.1 },
  ) {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (resolve, reject) => {
          if (success) resolve({ coords });
          else reject(new Error("denied"));
        },
      },
      configurable: true,
    });
  }

  it("fires location-change with the device coordinates on success", async () => {
    mockGeolocation(true, { latitude: 51.5, longitude: -0.1 });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    let detail = null;
    el.addEventListener("location-change", (e) => {
      detail = e.detail;
    });
    await el._useGeolocation();
    expect(detail).to.exist;
    expect(detail.lat).to.equal(51.5);
    expect(detail.lng).to.equal(-0.1);
  });

  it("sets an error status message on failure", async () => {
    mockGeolocation(false);
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await el._useGeolocation();
    expect(el.querySelector(".lf-status").textContent).to.include(
      "Couldn't get",
    );
  });

  it("sets status to 'Getting your location…' while the request is in flight", async () => {
    let resolveFn;
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (resolve) => {
          resolveFn = resolve;
        },
      },
      configurable: true,
    });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const promise = el._useGeolocation();
    expect(el.querySelector(".lf-status").textContent).to.include("Getting");
    resolveFn({ coords: { latitude: 51.5, longitude: -0.1 } });
    await promise;
  });

  it("disables the GPS button while the request is in flight", async () => {
    let resolveFn;
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (resolve) => {
          resolveFn = resolve;
        },
      },
      configurable: true,
    });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    const btn = el.querySelector(".lf-gps-btn");
    const promise = el._useGeolocation();
    expect(btn.disabled).to.be.true;
    resolveFn({ coords: { latitude: 51.5, longitude: -0.1 } });
    await promise;
  });

  it("re-enables the GPS button after success", async () => {
    mockGeolocation(true, { latitude: 51.5, longitude: -0.1 });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await el._useGeolocation();
    expect(el.querySelector(".lf-gps-btn").disabled).to.be.false;
  });

  it("re-enables the GPS button after failure", async () => {
    mockGeolocation(false);
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await el._useGeolocation();
    expect(el.querySelector(".lf-gps-btn").disabled).to.be.false;
  });

  it("sets a status message when geolocation is not supported", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });
    const el = await fixture(html`<wc-location-field></wc-location-field>`);
    await el._useGeolocation();
    expect(el.querySelector(".lf-status").textContent).to.include(
      "doesn't support",
    );
  });
});

// ─── reactive map attributes ──────────────────────────────────────────────────

describe("reactive map attributes", () => {
  it("does not call _initMap when center-lat changes and no map is active", async () => {
    const el = await fixture(
      html`<wc-location-field center-lat="51.5"></wc-location-field>`,
    );
    let called = false;
    el._initMap = () => {
      called = true;
    };
    el.setAttribute("center-lat", "52.0");
    expect(called).to.be.false;
  });

  it("calls _initMap when center-lat changes and a map is active", async () => {
    const el = await fixture(
      html`<wc-location-field center-lat="51.5"></wc-location-field>`,
    );
    let called = false;
    el._map = { remove: () => {} };
    el._initMap = () => {
      called = true;
    };
    el.setAttribute("center-lat", "52.0");
    expect(called).to.be.true;
  });

  it("calls _initMap when center-lng changes and a map is active", async () => {
    const el = await fixture(
      html`<wc-location-field center-lng="-0.09"></wc-location-field>`,
    );
    let called = false;
    el._map = { remove: () => {} };
    el._initMap = () => {
      called = true;
    };
    el.setAttribute("center-lng", "0.12");
    expect(called).to.be.true;
  });

  it("calls _initMap when radius-km changes and a map is active", async () => {
    const el = await fixture(
      html`<wc-location-field radius-km="5"></wc-location-field>`,
    );
    let called = false;
    el._map = { remove: () => {} };
    el._initMap = () => {
      called = true;
    };
    el.setAttribute("radius-km", "10");
    expect(called).to.be.true;
  });

  it("does not call _initMap when the same value is set again", async () => {
    const el = await fixture(
      html`<wc-location-field center-lat="51.5"></wc-location-field>`,
    );
    let called = false;
    el._map = { remove: () => {} };
    el._initMap = () => {
      called = true;
    };
    el.setAttribute("center-lat", "51.5");
    expect(called).to.be.false;
  });
});
