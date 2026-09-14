import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { buttonStyles, glassCardStyles } from '../styles/shared-styles'

const API_URL = 'http://localhost:5175'
const COLUMNS = 4 // feste Spaltenanzahl fürs Grid

const WIDGET_TYPES = [
  { type: 'notes', label: 'Notizen' },
  { type: 'todo', label: 'ToDo' },
  { type: 'weather', label: 'Wetter' },
  { type: 'time', label: 'Zeit' },
]

@customElement('dash-sidebar')
export class DashSidebar extends LitElement {
  // Von dash-canvas übergeben – wie viele Widgets aktuell existieren
  @property({ type: Number })
  widgetCount = 0

  @state()
  private menuOpen = false

  private _toggleMenu() {
    this.menuOpen = !this.menuOpen
  }

  private async _addWidget(widgetType: string) {
    const token = localStorage.getItem('token')

    // Nächster freier Platz: einfach durchzählen, Spalte/Zeile aus der Anzahl ableiten
    const gridColumn = this.widgetCount % COLUMNS
    const gridRow = Math.floor(this.widgetCount / COLUMNS)

    await fetch(`${API_URL}/api/widgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ widgetType, gridColumn, gridRow }),
    })

    this.menuOpen = false

    this.dispatchEvent(
      new CustomEvent('widget-added', { bubbles: true, composed: true })
    )
  }

  render() {
    return html`
      <div class="sidebar">
        ${this.menuOpen
          ? html`
              <div class="menu glass-card">
                ${WIDGET_TYPES.map(
                  (w) => html`
                    <button @click=${() => this._addWidget(w.type)}>
                      ${w.label}
                    </button>
                  `
                )}
              </div>
            `
          : ''}

        <button class="fab" @click=${this._toggleMenu}>
          ${this.menuOpen ? '×' : '+'}
        </button>
      </div>
    `
  }

  static styles = [
    buttonStyles,
    glassCardStyles,
    css`
      :host {
        position: fixed;
        bottom: 32px;
        right: 32px;
      }
      .sidebar {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
      }
      .menu {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
      }
      .fab {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
    `,
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    'dash-sidebar': DashSidebar
  }
}