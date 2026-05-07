class LocationField extends HTMLElement {
  static _count = 0;

  static get observedAttributes() {
    return ["label", "placeholder", "center-lat", "center-lng", "radius-km"];
  }

  constructor() {
    super();
    this._uid = `lf-${LocationField._count++}`;
    this._lat = null;
    this._lng = null;
    this._address = "";
    this._w3w = "";
    this._map = null;
    this._marker = null;
    this._overlayLayer = null;
    this._geojson = null;
    this._timer = null;
    this._results = [];
    this._googleSuggestions = [];
    this._inputEl = null;
    this._listEl = null;
    this._coordEl = null;
    this._statusEl = null;
    this._activeIdx = -1;
  }

  // ── Attribute accessors ───────────────────────────────────────────────────

  get label() {
    return this.getAttribute("label") || "";
  }

  set label(val) {
    this.setAttribute("label", val);
  }

  get placeholder() {
    return this.getAttribute("placeholder") || "Search for a location…";
  }

  set placeholder(val) {
    this.setAttribute("placeholder", val);
  }

  /** Latitude bias for search and map centre */
  get centerLat() {
    const v = parseFloat(this.getAttribute("center-lat"));
    return Number.isNaN(v) ? null : v;
  }

  /** Longitude bias for search and map centre */
  get centerLng() {
    const v = parseFloat(this.getAttribute("center-lng"));
    return Number.isNaN(v) ? null : v;
  }

  /** Show the interactive map below the search box */
  get showMap() {
    return this.hasAttribute("show-map");
  }

  /** Optional What3Words API key — enables W3W search and reverse-geocode */
  get w3wKey() {
    return this.getAttribute("w3w-key") || null;
  }

  /** Radius in km — draws a circle overlay on the map when show-map is set */
  get radiusKm() {
    const v = parseFloat(this.getAttribute("radius-km"));
    return Number.isNaN(v) ? null : v;
  }

  /** Map/geocoding provider: "nominatim" (default) or "google" */
  get mapProvider() {
    return this.getAttribute("map-provider") || "nominatim";
  }

  /** Google Maps API key — required when map-provider="google" */
  get googleMapsKey() {
    return this.getAttribute("google-maps-key") || null;
  }

  /** Display-only mode — hides search UI and disables map click/drag interactions */
  get readonly() {
    return this.hasAttribute("readonly");
  }

  /** GeoJSON object (or JSON string) — draws a polygon/feature overlay on the map */
  set geojson(val) {
    this._geojson = typeof val === "string" ? JSON.parse(val) : val;
    if (this._map) this._applyOverlay();
  }

  get geojson() {
    return this._geojson;
  }

  // ── Public state getters ──────────────────────────────────────────────────

  get lat() {
    return this._lat;
  }
  get lng() {
    return this._lng;
  }
  get address() {
    return this._address;
  }
  get w3w() {
    return this._w3w || null;
  }

  /** W3W words if resolved, else address string, else raw input */
  get value() {
    return this._w3w || this._address || this._inputEl?.value?.trim() || "";
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  connectedCallback() {
    this._upgradeProperty("label");
    this._upgradeProperty("placeholder");
    this._render();
    if (this.mapProvider === "google") {
      const key = this.googleMapsKey;
      if (!key) {
        console.warn(
          'wc-location-field: google-maps-key required when map-provider="google"',
        );
        return;
      }
      _ensureGoogleMaps(key)
        .then(() => {
          if (this.showMap) this._initMap();
        })
        .catch(() => {});
    } else {
      if (this.showMap) {
        _ensureLeaflet()
          .then(() => this._initMap())
          .catch(() => {});
      }
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "label" && this._labelEl) {
      this._labelEl.textContent = newVal;
    } else if (name === "placeholder" && this._inputEl) {
      this._inputEl.placeholder = newVal;
    } else if (
      (name === "center-lat" ||
        name === "center-lng" ||
        name === "radius-km") &&
      this._map
    ) {
      this._initMap();
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  clear() {
    this._lat = null;
    this._lng = null;
    this._address = "";
    this._w3w = "";
    if (this._inputEl) this._inputEl.value = "";
    if (this._coordEl) this._coordEl.textContent = "";
    if (this._marker) {
      if (this.mapProvider === "google") {
        this._marker.setMap(null);
      } else {
        this._marker.remove();
      }
      this._marker = null;
    }
    this._hideSuggestions();
  }

  prefill({ address = "", lat = null, lng = null, w3w = "" } = {}) {
    this._address = address;
    this._lat = lat;
    this._lng = lng;
    this._w3w = this.w3wKey ? w3w : "";
    if (this._inputEl) this._inputEl.value = address;
    if (this._coordEl && lat !== null) {
      this._coordEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    if (lat !== null && this._map) {
      if (this.mapProvider === "google") {
        this._map.setCenter({ lat, lng });
        if (this._map.getZoom() < 16) this._map.setZoom(16);
      } else {
        this._map.setView([lat, lng], Math.max(this._map.getZoom(), 16));
      }
      this._placeMarker(lat, lng);
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  _render() {
    const id = this._uid;

    if (this.readonly) {
      const labelHtml = this.label
        ? `<label class="lf-label">${this._esc(this.label)}</label>`
        : "";
      const mapHtml = this.showMap
        ? `<div class="lf-map-container" aria-label="Location map"><div class="lf-map"></div></div>`
        : "";
      this.innerHTML = `${labelHtml}${mapHtml}`;
      this._labelEl = this.querySelector(".lf-label");
      this._inputEl = null;
      this._listEl = null;
      this._coordEl = null;
      this._statusEl = null;
      return;
    }

    const labelHtml = this.label
      ? `<label class="lf-label" for="${id}-input">${this._esc(this.label)}</label>`
      : "";
    const mapHtml = this.showMap
      ? `<div class="lf-map-container" aria-label="Interactive location map"><div class="lf-map"></div></div>
         <p class="lf-hint">Tap the map or drag the pin to set a precise location</p>`
      : "";

    this.innerHTML = `
      ${labelHtml}
      <div class="lf-field">
        <div class="lf-input-wrap">
          <input
            id="${id}-input"
            type="text"
            class="lf-input"
            placeholder="${this._esc(this.placeholder)}"
            autocomplete="off"
            role="combobox"
            aria-expanded="false"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls="${id}-suggestions"
          />
          <ul class="lf-suggestions" id="${id}-suggestions" role="listbox"></ul>
        </div>
        <button type="button" class="lf-gps-btn" title="Use my location" aria-label="Use my current location">
          ${_crosshairSVG}
        </button>
      </div>
      <p class="lf-coords" aria-live="polite"></p>
      <p class="lf-status" role="status" aria-live="assertive" aria-atomic="true"></p>
      ${mapHtml}
    `;

    this._labelEl = this.querySelector(".lf-label");
    this._inputEl = this.querySelector(".lf-input");
    this._listEl = this.querySelector(".lf-suggestions");
    this._coordEl = this.querySelector(".lf-coords");
    this._statusEl = this.querySelector(".lf-status");

    this._inputEl.addEventListener("input", () => this._onInput());
    this._inputEl.addEventListener("blur", () =>
      setTimeout(() => this._hideSuggestions(), 150),
    );
    this._inputEl.addEventListener("keydown", (e) => this._onKeydown(e));
    this.querySelector(".lf-gps-btn").addEventListener("click", () =>
      this._useGeolocation(),
    );
  }

  // ── Map ───────────────────────────────────────────────────────────────────

  _initMap() {
    if (this.mapProvider === "google") {
      this._initMapGoogle();
    } else {
      this._initMapLeaflet();
    }
  }

  _initMapLeaflet() {
    const el = this.querySelector(".lf-map");
    if (!el || typeof L === "undefined") return;
    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    const centre =
      this.readonly && this._lat !== null
        ? [this._lat, this._lng]
        : this._mapCentre();
    this._map = L.map(el, { maxZoom: 19 }).setView(
      centre,
      this.readonly ? 19 : 13,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(this._map);

    this._applyOverlay();

    if (this.readonly) {
      if (this._lat !== null) this._placeMarker(this._lat, this._lng);
    } else {
      this._placeMarker(...centre);
      this._map.on("click", async (e) => {
        this._placeMarker(e.latlng.lat, e.latlng.lng);
        await this._setFromCoords(e.latlng.lat, e.latlng.lng, false);
      });
    }

    new ResizeObserver(() => this._map?.invalidateSize()).observe(el);
    this._map.invalidateSize();
  }

  _initMapGoogle() {
    const el = this.querySelector(".lf-map");
    if (!el || !window.google?.maps) return;
    if (this._map) {
      this._marker = null;
      this._overlayLayer = null;
      this._map = null;
    }

    const [lat, lng] =
      this.readonly && this._lat !== null
        ? [this._lat, this._lng]
        : this._mapCentre();
    this._map = new google.maps.Map(el, {
      center: { lat, lng },
      zoom: this.readonly ? 19 : 13,
      maxZoom: 19,
    });

    this._applyOverlay();

    if (this.readonly) {
      if (this._lat !== null) this._placeMarker(this._lat, this._lng);
    } else {
      this._placeMarker(lat, lng);
      this._map.addListener("click", async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        this._placeMarker(lat, lng);
        await this._setFromCoords(lat, lng, false);
      });
    }

    new ResizeObserver(() => {
      google.maps.event.trigger(this._map, "resize");
    }).observe(el);
  }

  _mapCentre() {
    if (this._geojson) {
      try {
        if (this.mapProvider === "google") {
          const c = this._geojsonCenter(this._geojson);
          if (c) return c;
        } else {
          const layer = L.geoJSON(this._geojson);
          const b = layer.getBounds();
          if (b.isValid()) return [b.getCenter().lat, b.getCenter().lng];
        }
      } catch {
        /* fall through */
      }
    }
    return [this.centerLat ?? 51.505, this.centerLng ?? -0.09];
  }

  _geojsonCenter(geojson) {
    const coords = [];
    const collect = (c) => {
      if (typeof c[0] === "number") {
        coords.push(c);
        return;
      }
      c.forEach(collect);
    };
    const features =
      geojson.type === "FeatureCollection" ? geojson.features : [geojson];
    features.forEach((f) => {
      const geom = f.geometry || f;
      if (geom?.coordinates) collect(geom.coordinates);
    });
    if (!coords.length) return null;
    const lats = coords.map((c) => c[1]);
    const lngs = coords.map((c) => c[0]);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }

  _applyOverlay() {
    if (!this._map) return;
    if (this._overlayLayer) {
      if (this.mapProvider === "google") {
        this._overlayLayer.setMap(null);
      } else {
        this._overlayLayer.remove();
      }
      this._overlayLayer = null;
    }

    if (this.mapProvider === "google") {
      const style = {
        fillColor: "#d4e8e3",
        fillOpacity: 0.15,
        strokeColor: "#4a7c6f",
        strokeWeight: 1.5,
        clickable: false,
      };
      if (this._geojson) {
        this._overlayLayer = new google.maps.Data({ map: this._map });
        const geojsonToAdd =
          this._geojson.type === "Feature" ||
          this._geojson.type === "FeatureCollection"
            ? this._geojson
            : { type: "Feature", geometry: this._geojson, properties: {} };
        this._overlayLayer.addGeoJson(geojsonToAdd);
        this._overlayLayer.setStyle(style);
      } else if (this.centerLat !== null && this.radiusKm !== null) {
        this._overlayLayer = new google.maps.Circle({
          map: this._map,
          center: { lat: this.centerLat, lng: this.centerLng },
          radius: this.radiusKm * 1000,
          ...style,
        });
      }
    } else {
      const style = {
        color: "#4a7c6f",
        fillColor: "#d4e8e3",
        fillOpacity: 0.15,
        weight: 1.5,
      };
      if (this._geojson) {
        this._overlayLayer = L.geoJSON(this._geojson, { style }).addTo(
          this._map,
        );
      } else if (this.centerLat !== null && this.radiusKm !== null) {
        this._overlayLayer = L.circle([this.centerLat, this.centerLng], {
          radius: this.radiusKm * 1000,
          ...style,
        }).addTo(this._map);
      }
    }
  }

  _placeMarker(lat, lng) {
    if (!this._map) return;
    if (this.mapProvider === "google") {
      if (this._marker) {
        this._marker.setPosition({ lat, lng });
      } else {
        this._marker = new google.maps.Marker({
          map: this._map,
          position: { lat, lng },
          draggable: !this.readonly,
        });
        if (!this.readonly) {
          this._marker.addListener("dragend", async () => {
            const pos = this._marker.getPosition();
            await this._setFromCoords(pos.lat(), pos.lng(), false);
          });
        }
      }
    } else {
      if (this._marker) {
        this._marker.setLatLng([lat, lng]);
      } else {
        this._marker = L.marker([lat, lng], {
          draggable: !this.readonly,
        }).addTo(this._map);
        if (!this.readonly) {
          this._marker.on("dragend", async () => {
            const { lat, lng } = this._marker.getLatLng();
            await this._setFromCoords(lat, lng, false);
          });
        }
      }
    }
  }

  async _setFromCoords(lat, lng, panMap = true) {
    this._lat = lat;
    this._lng = lng;
    if (this._coordEl)
      this._coordEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    if (panMap && this._map) {
      if (this.mapProvider === "google") {
        this._map.setCenter({ lat, lng });
        if (this._map.getZoom() < 16) this._map.setZoom(16);
      } else {
        this._map.setView([lat, lng], Math.max(this._map.getZoom(), 16));
      }
      this._placeMarker(lat, lng);
    }

    const fetches = [];
    if (this.mapProvider === "google") {
      fetches.push(
        new Promise((resolve) => {
          new google.maps.Geocoder().geocode(
            { location: { lat, lng } },
            (results, status) => {
              resolve(status === "OK" && results?.[0] ? results[0] : null);
            },
          );
        }),
      );
    } else {
      fetches.push(
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "en" } },
        ).then((r) => r.json()),
      );
    }
    if (this.w3wKey) {
      fetches.push(
        fetch(
          `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${this.w3wKey}`,
        ).then((r) => r.json()),
      );
    }

    const [geoResult, w3wResult] = await Promise.allSettled(fetches);

    if (geoResult.status === "fulfilled" && geoResult.value) {
      if (this.mapProvider === "google") {
        this._address = geoResult.value.formatted_address || "";
      } else if (geoResult.value?.display_name) {
        this._address = this._formatAddress(geoResult.value);
      }
      this._inputEl.value = this._address;
    }
    if (w3wResult?.status === "fulfilled" && w3wResult.value?.words) {
      this._w3w = `///${w3wResult.value.words}`;
    }

    this.dispatchEvent(
      new CustomEvent("location-change", {
        bubbles: true,
        detail: {
          lat: this._lat,
          lng: this._lng,
          address: this._address,
          w3w: this._w3w,
        },
      }),
    );
  }

  // ── Geolocation ───────────────────────────────────────────────────────────

  async _useGeolocation() {
    const btn = this.querySelector(".lf-gps-btn");
    if (!navigator.geolocation) {
      this._setStatus("Your browser doesn't support location access.");
      return;
    }
    btn.disabled = true;
    btn.classList.add("lf-gps-btn--loading");
    this._setStatus("Getting your location…");
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        }),
      );
      this._setStatus("");
      await this._setFromCoords(
        pos.coords.latitude,
        pos.coords.longitude,
        true,
      );
    } catch {
      this._setStatus(
        "Couldn't get your location. Try tapping the map or searching instead.",
      );
    } finally {
      btn.disabled = false;
      btn.classList.remove("lf-gps-btn--loading");
    }
  }

  // ── Search ────────────────────────────────────────────────────────────────

  _onInput() {
    const query = this._inputEl.value.trim();
    this._lat = null;
    this._lng = null;
    this._address = "";
    this._w3w = "";
    if (this._coordEl) this._coordEl.textContent = "";
    clearTimeout(this._timer);

    if (query.length < 3) {
      this._hideSuggestions();
      return;
    }
    this._timer = setTimeout(() => this._search(query), 350);
  }

  async _search(query) {
    try {
      if (this.w3wKey && _looksLikeW3W(query)) {
        await this._searchW3W(query);
      } else if (this.mapProvider === "google") {
        await this._searchGoogle(query);
      } else {
        await this._searchNominatim(query);
      }
    } catch {
      // network error — fail silently
    }
  }

  async _searchGoogle(query) {
    const { AutocompleteSuggestion } =
      await google.maps.importLibrary("places");
    const request = { input: query };
    if (this.centerLat !== null) {
      request.locationBias = {
        center: { lat: this.centerLat, lng: this.centerLng },
        radius: 50000,
      };
    }

    this._googleSuggestions = [];
    try {
      const { suggestions } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      this._googleSuggestions = (suggestions || []).filter(
        (s) => s.placePrediction,
      );
    } catch {
      /* zero results */
    }

    this._listEl.innerHTML = this._googleSuggestions.length
      ? this._googleSuggestions
          .map(
            (s, i) =>
              `<li id="${this._uid}-opt-${i}" role="option" data-index="${i}"
          >${this._esc(s.placePrediction.text.toString())}</li>`,
          )
          .join("")
      : `<li class="lf-no-results" role="option" aria-disabled="true">No results found</li>`;

    this._listEl
      .querySelectorAll("li[role='option']:not([aria-disabled])")
      .forEach((li) => {
        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          this._selectGoogleSuggestion(Number(li.dataset.index));
        });
      });
    this._showSuggestions();
  }

  async _selectGoogleSuggestion(index) {
    try {
      const place = this._googleSuggestions[index].placePrediction.toPlace();
      await place.fetchFields({ fields: ["location", "formattedAddress"] });
      const lat = place.location.lat();
      const lng = place.location.lng();
      this._address =
        place.formattedAddress ||
        this._googleSuggestions[index].placePrediction.text.toString();
      this._inputEl.value = this._address;
      this._hideSuggestions();
      await this._setFromCoords(lat, lng, true);
    } catch {
      // fail silently
    }
  }

  async _searchW3W(query) {
    const words = query.replace(/^\/\/\//, "");
    const params = new URLSearchParams({
      input: words,
      key: this.w3wKey,
      "n-results": 5,
    });
    if (this.centerLat !== null)
      params.set("focus", `${this.centerLat},${this.centerLng}`);

    const data = await fetch(
      `https://api.what3words.com/v3/autosuggest?${params}`,
    ).then((r) => r.json());
    const suggestions = data.suggestions || [];

    this._listEl.innerHTML = suggestions.length
      ? suggestions
          .map(
            (s, i) =>
              `<li id="${this._uid}-opt-${i}" role="option" data-w3w="${this._esc(s.words)}">
            <span class="lf-w3w-prefix">///</span>${this._esc(s.words)}
            <span class="lf-nearby">${this._esc(s.nearestPlace)}</span>
          </li>`,
          )
          .join("")
      : `<li class="lf-no-results" role="option" aria-disabled="true">No What3Words results</li>`;

    this._listEl
      .querySelectorAll("li[role='option']:not([aria-disabled])")
      .forEach((li) => {
        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          this._selectW3W(li.dataset.w3w);
        });
      });
    this._showSuggestions();
  }

  async _searchNominatim(query) {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: 5,
      addressdetails: 1,
    });
    if (this.centerLat !== null) {
      const d = 0.15;
      params.set(
        "viewbox",
        `${this.centerLng - d},${this.centerLat + d},${this.centerLng + d},${this.centerLat - d}`,
      );
    }
    this._results = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { "Accept-Language": "en" } },
    ).then((r) => r.json());

    this._listEl.innerHTML = this._results.length
      ? this._results
          .map(
            (r, i) =>
              `<li id="${this._uid}-opt-${i}" role="option" data-index="${i}">${this._esc(this._formatAddress(r))}</li>`,
          )
          .join("")
      : `<li class="lf-no-results" role="option" aria-disabled="true">No results found</li>`;

    this._listEl
      .querySelectorAll("li[role='option']:not([aria-disabled])")
      .forEach((li) => {
        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          this._selectResult(Number(li.dataset.index));
        });
      });
    this._showSuggestions();
  }

  async _selectResult(index) {
    const r = this._results[index];
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    this._results = [];
    this._hideSuggestions();
    this._address = this._formatAddress(r);
    this._inputEl.value = this._address;
    await this._setFromCoords(lat, lng, true);
  }

  async _selectW3W(words) {
    try {
      const data = await fetch(
        `https://api.what3words.com/v3/convert-to-coordinates?words=${encodeURIComponent(words)}&key=${this.w3wKey}`,
      ).then((r) => r.json());
      if (!data.coordinates) return;
      const { lat, lng } = data.coordinates;
      this._w3w = `///${words}`;
      this._inputEl.value = `///${words}`;
      this._hideSuggestions();
      await this._setFromCoords(lat, lng, true);
    } catch {
      // fail silently
    }
  }

  _showSuggestions() {
    this._activeIdx = -1;
    this._inputEl.removeAttribute("aria-activedescendant");
    this._listEl.style.display = "block";
    this._inputEl.setAttribute("aria-expanded", "true");
  }

  _hideSuggestions() {
    this._activeIdx = -1;
    if (this._inputEl) {
      this._inputEl.removeAttribute("aria-activedescendant");
      this._inputEl.setAttribute("aria-expanded", "false");
    }
    if (this._listEl) this._listEl.style.display = "none";
  }

  _setActiveOption(idx) {
    const items = [
      ...this._listEl.querySelectorAll(
        "li[role='option']:not([aria-disabled])",
      ),
    ];
    items.forEach((li, i) => {
      li.classList.toggle("lf-active", i === idx);
    });
    this._activeIdx = idx;
    if (items[idx]?.id) {
      this._inputEl.setAttribute("aria-activedescendant", items[idx].id);
    } else {
      this._inputEl.removeAttribute("aria-activedescendant");
    }
    items[idx]?.scrollIntoView({ block: "nearest" });
  }

  _setStatus(msg) {
    if (this._statusEl) this._statusEl.textContent = msg;
  }

  _onKeydown(e) {
    if (this._listEl.style.display !== "block") return;
    const items = [
      ...this._listEl.querySelectorAll(
        "li[role='option']:not([aria-disabled])",
      ),
    ];
    if (!items.length && e.key !== "Escape") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this._setActiveOption(Math.min(this._activeIdx + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._setActiveOption(Math.max(this._activeIdx - 1, 0));
    } else if (e.key === "Enter" && this._activeIdx >= 0) {
      e.preventDefault();
      const active = items[this._activeIdx];
      if (active?.dataset.w3w) this._selectW3W(active.dataset.w3w);
      else if (active?.dataset.index !== undefined) {
        if (this.mapProvider === "google")
          this._selectGoogleSuggestion(Number(active.dataset.index));
        else this._selectResult(Number(active.dataset.index));
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      this._hideSuggestions();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _upgradeProperty(prop) {
    if (Object.hasOwn(this, prop)) {
      const val = this[prop];
      delete this[prop];
      this[prop] = val;
    }
  }

  _formatAddress(result) {
    const a = result.address || {};
    const parts = [
      a.road || a.path || a.pedestrian || a.footway,
      a.suburb || a.neighbourhood || a.village || a.town || a.city || a.county,
    ].filter(Boolean);
    return parts.length
      ? parts.join(", ")
      : (result.display_name || "").split(",").slice(0, 2).join(",").trim();
  }

  _esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

let _leafletPromise = null;

function _ensureLeaflet() {
  if (typeof L !== "undefined") return Promise.resolve();
  if (_leafletPromise) return _leafletPromise;

  _leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = resolve;
    script.onerror = () => {
      _leafletPromise = null;
      reject(new Error("Failed to load Leaflet"));
    };
    document.head.appendChild(script);
  });

  return _leafletPromise;
}

let _googleMapsPromise = null;

function _ensureGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve();
  if (_googleMapsPromise) return _googleMapsPromise;

  _googleMapsPromise = new Promise((resolve, reject) => {
    const cb = "__lfGMapsReady";
    window[cb] = () => {
      delete window[cb];
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=${cb}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      _googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return _googleMapsPromise;
}

function _looksLikeW3W(text) {
  return /^(?:\/\/\/)?[a-z]+\.([a-z]+(\.([a-z]*))?)?$/i.test(text.trim());
}

const _crosshairSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  width="18" height="18" aria-hidden="true">
  <circle cx="12" cy="12" r="3"/>
  <line x1="12" y1="1" x2="12" y2="5"/>
  <line x1="12" y1="19" x2="12" y2="23"/>
  <line x1="1" y1="12" x2="5" y2="12"/>
  <line x1="19" y1="12" x2="23" y2="12"/>
</svg>`;

const _css = new CSSStyleSheet();
_css.replaceSync(`
wc-location-field {
  --lf-map-height: 240px;
  --lf-w3w-color: #e11f26;
  display: block;
}

wc-location-field[hidden] {
  display: none;
}

.lf-label {
  display: block;
  margin-bottom: 0.25rem;
}

.lf-field {
  display: flex;
  gap: 0.25rem;
  align-items: flex-start;
}

.lf-input-wrap {
  flex: 1;
  position: relative;
}

.lf-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font: inherit;
}

.lf-gps-btn {
  flex-shrink: 0;
  cursor: pointer;
}

.lf-gps-btn:disabled {
  cursor: not-allowed;
}

.lf-gps-btn--loading svg {
  animation: lf-spin 1s linear infinite;
}

@keyframes lf-spin {
  to { transform: rotate(360deg); }
}

.lf-suggestions {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  background: Canvas;
  border: 1px solid ButtonBorder;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.lf-suggestions li {
  padding: 0.4rem 0.6rem;
  cursor: pointer;
}

.lf-suggestions li:hover,
.lf-suggestions li:focus,
.lf-suggestions li.lf-active {
  background: Highlight;
  color: HighlightText;
}

.lf-no-results {
  cursor: default !important;
  font-style: italic;
}

.lf-w3w-prefix {
  color: var(--lf-w3w-color);
  font-weight: 700;
}

.lf-coords {
  margin: 0.25rem 0 0;
  font-size: 0.8em;
  font-variant-numeric: tabular-nums;
}

.lf-map-container {
  margin-top: 0.5rem;
  overflow: hidden;
}

.lf-map {
  height: var(--lf-map-height);
  width: 100%;
  display: block;
}

.lf-hint {
  margin: 0.25rem 0 0;
  font-size: 0.8em;
}
`);

document.adoptedStyleSheets = [...document.adoptedStyleSheets, _css];

if (!customElements.get("wc-location-field")) {
  customElements.define("wc-location-field", LocationField);
}
