import { fixture, html, expect } from '@open-wc/testing'
import '../wc-location-field.js'

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('renders a label when the label attribute is set', async () => {
    const el = await fixture(html`<wc-location-field label="From"></wc-location-field>`)
    const label = el.querySelector('.lf-label')
    expect(label).to.exist
    expect(label.textContent).to.equal('From')
  })

  it('renders no label element when label attribute is absent', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-label')).to.be.null
  })

  it('sets the input placeholder from the attribute', async () => {
    const el = await fixture(html`<wc-location-field placeholder="e.g. London"></wc-location-field>`)
    expect(el.querySelector('.lf-input').placeholder).to.equal('e.g. London')
  })

  it('falls back to the default placeholder when the attribute is absent', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-input').placeholder).to.equal('Search for a location…')
  })

  it('renders the GPS button', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-gps-btn')).to.exist
  })

  it('renders a map container when show-map is present', async () => {
    const el = await fixture(html`<wc-location-field show-map></wc-location-field>`)
    expect(el.querySelector('.lf-map-container')).to.exist
  })

  it('does not render a map container when show-map is absent', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-map-container')).to.be.null
  })

  it('hides the suggestions list by default', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-suggestions').style.display).to.not.equal('block')
  })
})

// ─── Reactive attributes ──────────────────────────────────────────────────────

describe('reactive attributes', () => {
  it('updates the label text when the label attribute changes', async () => {
    const el = await fixture(html`<wc-location-field label="From"></wc-location-field>`)
    el.setAttribute('label', 'To')
    expect(el.querySelector('.lf-label').textContent).to.equal('To')
  })

  it('updates the input placeholder when the placeholder attribute changes', async () => {
    const el = await fixture(html`<wc-location-field placeholder="Search…"></wc-location-field>`)
    el.setAttribute('placeholder', 'New placeholder')
    expect(el.querySelector('.lf-input').placeholder).to.equal('New placeholder')
  })
})

// ─── Initial state ────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('lat is null', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.lat).to.be.null
  })

  it('lng is null', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.lng).to.be.null
  })

  it('address is an empty string', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.address).to.equal('')
  })

  it('value is an empty string', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.value).to.equal('')
  })
})

// ─── prefill() ────────────────────────────────────────────────────────────────

describe('prefill()', () => {
  it('sets the input value to the address', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Buckingham Palace', lat: 51.5014, lng: -0.1419 })
    expect(el.querySelector('.lf-input').value).to.equal('Buckingham Palace')
  })

  it('sets lat and lng', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Buckingham Palace', lat: 51.5014, lng: -0.1419 })
    expect(el.lat).to.equal(51.5014)
    expect(el.lng).to.equal(-0.1419)
  })

  it('shows coordinates in the coords element', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Test', lat: 51.5, lng: -0.1 })
    expect(el.querySelector('.lf-coords').textContent).to.include('51.50000')
  })

  it('returns address via the value getter', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Buckingham Palace', lat: 51.5014, lng: -0.1419 })
    expect(el.value).to.equal('Buckingham Palace')
  })

  it('does not fire a location-change event', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    let fired = false
    el.addEventListener('location-change', () => { fired = true })
    el.prefill({ address: 'Buckingham Palace', lat: 51.5014, lng: -0.1419 })
    expect(fired).to.be.false
  })
})

// ─── clear() ─────────────────────────────────────────────────────────────────

describe('clear()', () => {
  it('empties the input', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Buckingham Palace', lat: 51.5014, lng: -0.1419 })
    el.clear()
    expect(el.querySelector('.lf-input').value).to.equal('')
  })

  it('resets lat and lng to null', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Test', lat: 51.5, lng: -0.1 })
    el.clear()
    expect(el.lat).to.be.null
    expect(el.lng).to.be.null
  })

  it('resets value to an empty string', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Test', lat: 51.5, lng: -0.1 })
    el.clear()
    expect(el.value).to.equal('')
  })

  it('clears the coords display', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    el.prefill({ address: 'Test', lat: 51.5, lng: -0.1 })
    el.clear()
    expect(el.querySelector('.lf-coords').textContent).to.equal('')
  })
})

// ─── location-change event ────────────────────────────────────────────────────

describe('location-change event', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = window.fetch
    window.fetch = (url) => {
      if (String(url).includes('nominatim')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            display_name: 'Test Street, London, England',
            address: { road: 'Test Street', city: 'London' },
          }),
        })
      }
      return Promise.resolve({ json: () => Promise.resolve({}) })
    }
  })

  afterEach(() => {
    window.fetch = originalFetch
  })

  it('fires when a location is resolved', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    let fired = false
    el.addEventListener('location-change', () => { fired = true })
    await el._setFromCoords(51.5, -0.1)
    expect(fired).to.be.true
  })

  it('detail contains lat and lng', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    let detail = null
    el.addEventListener('location-change', (e) => { detail = e.detail })
    await el._setFromCoords(51.5, -0.1)
    expect(detail.lat).to.equal(51.5)
    expect(detail.lng).to.equal(-0.1)
  })

  it('detail contains the reverse-geocoded address', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    let detail = null
    el.addEventListener('location-change', (e) => { detail = e.detail })
    await el._setFromCoords(51.5, -0.1)
    expect(detail.address).to.equal('Test Street, London')
  })

  it('detail.w3w is empty when no w3w-key is set', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    let detail = null
    el.addEventListener('location-change', (e) => { detail = e.detail })
    await el._setFromCoords(51.5, -0.1)
    expect(detail.w3w).to.equal('')
  })

  it('bubbles up to parent elements', async () => {
    const container = await fixture(html`
      <div><wc-location-field></wc-location-field></div>`)
    const el = container.querySelector('wc-location-field')
    let bubbled = false
    container.addEventListener('location-change', () => { bubbled = true })
    await el._setFromCoords(51.5, -0.1)
    expect(bubbled).to.be.true
  })

  it('updates internal state after resolving', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    await el._setFromCoords(51.5, -0.1)
    expect(el.lat).to.equal(51.5)
    expect(el.lng).to.equal(-0.1)
    expect(el.address).to.equal('Test Street, London')
  })
})

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('accessibility', () => {
  it('input has role="combobox"', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-input').getAttribute('role')).to.equal('combobox')
  })

  it('input has aria-expanded="false" by default', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-input').getAttribute('aria-expanded')).to.equal('false')
  })

  it('input has aria-activedescendant="" by default', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-input').getAttribute('aria-activedescendant')).to.equal('')
  })

  it('coords element has aria-live="polite"', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-coords').getAttribute('aria-live')).to.equal('polite')
  })

  it('status element has role="status" and aria-live="assertive"', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    const status = el.querySelector('.lf-status')
    expect(status.getAttribute('role')).to.equal('status')
    expect(status.getAttribute('aria-live')).to.equal('assertive')
  })

  it('GPS button has an aria-label', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    expect(el.querySelector('.lf-gps-btn').hasAttribute('aria-label')).to.be.true
  })

  it('label is associated with the input via for/id', async () => {
    const el = await fixture(html`<wc-location-field label="From"></wc-location-field>`)
    const label = el.querySelector('.lf-label')
    const input = el.querySelector('.lf-input')
    expect(label.htmlFor).to.equal(input.id)
  })

  it('map container has aria-label when show-map is set', async () => {
    const el = await fixture(html`<wc-location-field show-map></wc-location-field>`)
    expect(el.querySelector('.lf-map-container').hasAttribute('aria-label')).to.be.true
  })
})

// ─── Keyboard navigation ──────────────────────────────────────────────────────

describe('keyboard navigation', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = window.fetch
    window.fetch = () => Promise.resolve({
      json: () => Promise.resolve([
        { display_name: 'Result One, London', address: { road: 'Result One', city: 'London' }, lat: '51.5', lon: '-0.1' },
        { display_name: 'Result Two, London', address: { road: 'Result Two', city: 'London' }, lat: '51.6', lon: '-0.2' },
      ]),
    })
  })

  afterEach(() => {
    window.fetch = originalFetch
  })

  async function openSuggestions(el) {
    el.querySelector('.lf-input').value = 'Lond'
    el.querySelector('.lf-input').dispatchEvent(new Event('input'))
    await new Promise(r => setTimeout(r, 400))
  }

  it('ArrowDown moves aria-activedescendant to the first option', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    await openSuggestions(el)
    el.querySelector('.lf-input').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    const activeId = el.querySelector('.lf-input').getAttribute('aria-activedescendant')
    expect(activeId).to.not.equal('')
    expect(el.querySelector(`#${activeId}`)).to.exist
  })

  it('ArrowDown marks the first option with lf-active', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    await openSuggestions(el)
    el.querySelector('.lf-input').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    const items = el.querySelectorAll('.lf-suggestions li[role="option"]:not([aria-disabled])')
    expect(items[0].classList.contains('lf-active')).to.be.true
  })

  it('Escape closes the suggestions', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    await openSuggestions(el)
    expect(el.querySelector('.lf-suggestions').style.display).to.equal('block')
    el.querySelector('.lf-input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(el.querySelector('.lf-suggestions').style.display).to.equal('none')
  })

  it('suggestion list items have id attributes', async () => {
    const el = await fixture(html`<wc-location-field></wc-location-field>`)
    await openSuggestions(el)
    const items = el.querySelectorAll('.lf-suggestions li[role="option"]:not([aria-disabled])')
    items.forEach(li => expect(li.id).to.not.equal(''))
  })
})
