import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './dash-sidebar'
import '../widgets/widgets-notes'

const API_URL = 'http://localhost:5175'
const CELL_SIZE = 220
const GAP = 20
const STEP = CELL_SIZE + GAP

interface DashboardData {
  widgets: any[]
  notes: any[]
  todos: any[]
}

@customElement('dash-canvas')
export class DashCanvas extends LitElement {
  @state()
  private data: DashboardData | null = null

  @state()
  private loading = true

  private draggedWidgetId: string | null = null

  connectedCallback() {
    super.connectedCallback()
    this._loadDashboard()
    this.addEventListener('widget-added', this._handleWidgetAdded)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('widget-added', this._handleWidgetAdded)
  }

  private _handleWidgetAdded = () => {
    this._loadDashboard()
  }

  private async _loadDashboard() {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        localStorage.removeItem('token')
        this.dispatchEvent(new CustomEvent('logout', { bubbles: true, composed: true }))
        return
      }
      this.data = await response.json()
    } catch (err) {
      console.error('Dashboard konnte nicht geladen werden', err)
    } finally {
      this.loading = false
    }
  }

  private _onDragStart(widgetId: string) {
    this.draggedWidgetId = widgetId
  }

  private _onDragOver(e: DragEvent) {
    e.preventDefault()
  }

  // Drop passiert jetzt auf dem GESAMTEN Grid, nicht mehr nur auf einem Widget
  private async _onGridDrop(e: DragEvent) {
    e.preventDefault()
    const sourceId = this.draggedWidgetId
    this.draggedWidgetId = null
    if (!sourceId || !this.data) return

    // Maus-Position relativ zum Grid-Container in Spalte/Zeile umrechnen
    const gridEl = this.shadowRoot!.querySelector('.grid') as HTMLElement
    const rect = gridEl.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const targetColumn = Math.max(0, Math.floor(x / STEP))
    const targetRow = Math.max(0, Math.floor(y / STEP))

    const source = this.data.widgets.find((w) => w.id === sourceId)
    if (!source) return

    // Prüfen ob die Zielzelle schon von einem anderen Widget belegt ist
    const occupant = this.data.widgets.find(
      (w) => w.id !== sourceId && w.gridColumn === targetColumn && w.gridRow === targetRow
    )

    if (occupant) {
      // Belegt -> Positionen tauschen
      await Promise.all([
        this._updateWidgetPosition(source, targetColumn, targetRow),
        this._updateWidgetPosition(occupant, source.gridColumn, source.gridRow),
      ])
    } else {
      // Frei -> Widget einfach dorthin verschieben
      await this._updateWidgetPosition(source, targetColumn, targetRow)
    }

    this._loadDashboard()
  }

  private async _updateWidgetPosition(widget: any, gridColumn: number, gridRow: number) {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/api/widgets/${widget.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        gridColumn,
        gridRow,
        isActive: widget.isActive,
        weatherCity: widget.weatherCity,
      }),
    })
  }

  render() {
    if (this.loading) return html`<p>Lade Dashboard...</p>`
    if (!this.data) return html`<p>Fehler beim Laden.</p>`

    return html`
      <div
        class="grid"
        @dragover=${this._onDragOver}
        @drop=${this._onGridDrop}
      >
        ${this.data.notes.map((note) => {
          const widget = this.data!.widgets.find((w) => w.id === note.widgetId)
          if (!widget) return ''

          return html`
            <div
              class="cell"
              style="grid-column: ${widget.gridColumn + 1}; grid-row: ${widget.gridRow + 1}"
            >
              <div
                class="handle"
                draggable="true"
                @dragstart=${() => this._onDragStart(widget.id)}
              >
                ⠿
              </div>
              <widget-notes .note=${note}></widget-notes>
            </div>
          `
        })}
      </div>

      <dash-sidebar .widgetCount=${this.data.widgets.length}></dash-sidebar>
    `
  }

  static styles = css`
    :host {
      display: block;
      max-width: 1000px;
      margin: 40px auto;
      font-family: system-ui, sans-serif;
    }

    .grid {
      position: relative;
      display: grid;
      grid-template-columns: repeat(auto-fill, 220px);
      grid-auto-rows: 220px;
      gap: 20px;
      padding: 20px;
      min-height: 500px;
    }

    .cell {
      position: relative;
    }

    .handle {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      cursor: grab;
      z-index: 10;
      border-radius: 4px;
    }

    .handle:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .handle:active {
      cursor: grabbing;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'dash-canvas': DashCanvas
  }
}