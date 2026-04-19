# &lt;wc-location-field&gt;

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/@annoyingmouse/wc-location-field)

A self-contained web component for location selection. Provides address search via [Nominatim](https://nominatim.org/) (OpenStreetMap), an optional [Leaflet](https://leafletjs.com/) map, browser geolocation, and optional [What3Words](https://what3words.com/developers) integration. No framework dependencies.

## Installation

```html
<script src="https://unpkg.com/@annoyingmouse/wc-location-field/wc-location-field.js" defer></script>
```

Styles and Leaflet (when `show-map` is used) are loaded automatically — no extra `<link>` tags needed.

Or as a module:

```html
<script type="module" src="https://cdn.skypack.dev/@annoyingmouse/wc-location-field/wc-location-field.js"></script>
```

## Usage

```html
<wc-location-field label="From" placeholder="e.g. Paddington Station"></wc-location-field>
```

With map:

```html
<wc-location-field
  label="Meeting point"
  show-map
  center-lat="51.505"
  center-lng="-0.09"
></wc-location-field>
```

## Attributes

| Attribute | Description |
|---|---|
| `label` | Field label text (reactive) |
| `placeholder` | Input placeholder text (reactive) |
| `center-lat` / `center-lng` | Map centre and Nominatim search bias |
| `show-map` | Renders an interactive Leaflet map |
| `w3w-key` | What3Words API key; enables `///word.word.word` search |

## Public API

```js
const field = document.querySelector('wc-location-field')

// Programmatically set a location (does not fire location-change)
field.prefill({ address: 'Buckingham Palace', lat: 51.5014, lng: -0.1419 })

// Reset
field.clear()

// Read state
console.log(field.value, field.lat, field.lng, field.address)

// label and placeholder can also be set as JS properties
field.label = 'Destination'
field.placeholder = 'Search for a place…'
```

## Events

```js
field.addEventListener('location-change', e => {
  const { lat, lng, address, w3w } = e.detail
})
```

The `location-change` CustomEvent bubbles and fires whenever a location is resolved (from search, map click, marker drag, or geolocation).

## Theming

The component is intentionally minimal — input and button styling inherit from your page. Two CSS custom properties are available:

```css
wc-location-field {
  --lf-map-height: 300px;   /* default: 240px */
  --lf-w3w-color: #e11f26;  /* What3Words /// prefix colour */
}
```

## Accessibility

- ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-activedescendant`)
- Full keyboard navigation: `ArrowDown`/`ArrowUp` to move through suggestions, `Enter` to select, `Escape` to dismiss
- Coordinates announced via `aria-live="polite"`
- Geolocation status and errors announced via `aria-live="assertive"`
- GPS button has an accessible label

## Licence

MIT
