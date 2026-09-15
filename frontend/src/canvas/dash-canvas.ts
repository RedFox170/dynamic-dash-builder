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

  @state()
  private draggingWidgetId: string | null = null

  @state()
  private dragOffset = { x: 0, y: 0 }

  @state()
  private confirmDeleteWidgetId: string | null = null

  private dragStartX = 0
  private dragStartY = 0

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

  private _onHandlePointerDown(e: PointerEvent, widgetId: string) {
    // Nur linke Maustaste / primärer Touch-Kontakt
    if (e.button !== undefined && e.button !== 0) return
    e.preventDefault()

    this.draggingWidgetId = widgetId
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    this.dragOffset = { x: 0, y: 0 }

    window.addEventListener('pointermove', this._onPointerMove)
    window.addEventListener('pointerup', this._onPointerUp)
  }

  private _onPointerMove = (e: PointerEvent) => {
    if (!this.draggingWidgetId) return
    this.dragOffset = {
      x: e.clientX - this.dragStartX,
      y: e.clientY - this.dragStartY,
    }
  }

  private _onPointerUp = async (e: PointerEvent) => {
    window.removeEventListener('pointermove', this._onPointerMove)
    window.removeEventListener('pointerup', this._onPointerUp)

    const sourceId = this.draggingWidgetId
    this.draggingWidgetId = null
    this.dragOffset = { x: 0, y: 0 }
    if (!sourceId || !this.data) return

    const source = this.data.widgets.find((w) => w.id === sourceId)
    if (!source) return

    // Maus-Position relativ zum Grid-Container in Spalte/Zeile umrechnen
    const gridEl = this.shadowRoot!.querySelector('.grid') as HTMLElement
    const rect = gridEl.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const targetColumn = Math.max(0, Math.floor(x / STEP))
    const targetRow = Math.max(0, Math.floor(y / STEP))

    if (targetColumn === source.gridColumn && targetRow === source.gridRow) return

    // Prüfen ob die Zielzelle schon von einem anderen Widget belegt ist
    const occupant = this.data.widgets.find(
      (w) => w.id !== sourceId && w.gridColumn === targetColumn && w.gridRow === targetRow
    )

    // Optimistisches lokales Update, damit die UI sofort reagiert
    const sourceOrigin = { column: source.gridColumn, row: source.gridRow }
    source.gridColumn = targetColumn
    source.gridRow = targetRow
    if (occupant) {
      occupant.gridColumn = sourceOrigin.column
      occupant.gridRow = sourceOrigin.row
    }
    this.data = { ...this.data, widgets: [...this.data.widgets] }

    if (occupant) {
      await Promise.all([
        this._updateWidgetPosition(source, targetColumn, targetRow),
        this._updateWidgetPosition(occupant, sourceOrigin.column, sourceOrigin.row),
      ])
    } else {
      await this._updateWidgetPosition(source, targetColumn, targetRow)
    }
  }

  private async _deleteWidget(widgetId: string) {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/api/widgets/${widgetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    this.confirmDeleteWidgetId = null
    await this._loadDashboard()
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
      <div class="grid">
        ${this.data.notes.map((note) => {
          const widget = this.data!.widgets.find((w) => w.id === note.widgetId)
          if (!widget) return ''

          const isDragging = this.draggingWidgetId === widget.id
          const style = isDragging
            ? `grid-column: ${widget.gridColumn + 1}; grid-row: ${widget.gridRow + 1}; transform: translate(${this.dragOffset.x}px, ${this.dragOffset.y}px);`
            : `grid-column: ${widget.gridColumn + 1}; grid-row: ${widget.gridRow + 1};`

          return html`
            <div class="cell ${isDragging ? 'dragging' : ''}" style="${style}">
              <div
                class="handle"
                @pointerdown=${(e: PointerEvent) => this._onHandlePointerDown(e, widget.id)}
              >
                ⠿
              </div>
              <button
                class="trash"
                @click=${() => (this.confirmDeleteWidgetId = widget.id)}
              >
                🗑
              </button>
              <widget-notes .note=${note}></widget-notes>
              ${this.confirmDeleteWidgetId === widget.id
                ? html`
                    <div class="confirm-overlay">
                      <p>Notiz wirklich löschen?</p>
                      <div class="confirm-actions">
                        <button
                          class="confirm-yes"
                          @click=${() => this._deleteWidget(widget.id)}
                        >
                          Ja
                        </button>
                        <button
                          class="confirm-no"
                          @click=${() => (this.confirmDeleteWidgetId = null)}
                        >
                          Nein
                        </button>
                      </div>
                    </div>
                  `
                : ''}
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

    .cell.dragging {
      z-index: 100;
      cursor: grabbing;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
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
      touch-action: none;
      pointer-events: auto;
    }

    .handle:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .handle:active {
      cursor: grabbing;
    }

    .trash {
      position: absolute;
      top: 4px;
      right: 32px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      cursor: pointer;
      z-index: 10;
      border-radius: 4px;
      padding: 0;
    }

    .trash:hover {
      background: rgba(255, 80, 80, 0.25);
      color: white;
    }

    .confirm-overlay {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: rgba(20, 20, 20, 0.85);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      color: white;
    }

    .confirm-overlay p {
      margin: 0;
      font-size: 14px;
    }

    .confirm-actions {
      display: flex;
      gap: 8px;
    }

    .confirm-actions button {
      padding: 6px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    .confirm-yes {
      background: #e03131;
      color: white;
    }

    .confirm-yes:hover {
      background: #c92a2a;
    }

    .confirm-no {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .confirm-no:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'dash-canvas': DashCanvas
  }
}