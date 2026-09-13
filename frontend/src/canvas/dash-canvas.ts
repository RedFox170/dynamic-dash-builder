import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

const API_URL = 'http://localhost:5175'

// Struktur der Antwort von GET /api/dashboard
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

  // Lifecycle-Methode: läuft automatisch sobald die Komponente ins DOM eingefügt wird
  // Perfekter Ort um initial Daten zu laden
  connectedCallback() {
    super.connectedCallback()
    this._loadDashboard()
  }

  private async _loadDashboard() {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Token ungültig/abgelaufen -> zurück zum Login
        localStorage.removeItem('token')
        this.dispatchEvent(
          new CustomEvent('logout', { bubbles: true, composed: true })
        )
        return
      }

      this.data = await response.json()
    } catch (err) {
      console.error('Dashboard konnte nicht geladen werden', err)
    } finally {
      this.loading = false
    }
  }

  render() {
    if (this.loading) {
      return html`<p>Lade Dashboard...</p>`
    }

    if (!this.data) {
      return html`<p>Fehler beim Laden.</p>`
    }

    return html`
      <div class="canvas">
        <h2>Meine Notizen</h2>
        ${this.data.notes.map(
          (note) => html`
            <div class="glass-card">
              <h3>${note.header}</h3>
              <p>${note.noteText}</p>
            </div>
          `
        )}

        <h2>Meine ToDos</h2>
        ${this.data.todos.map(
          (todo) => html`
            <div class="glass-card">
              <h3>${todo.header}</h3>
              <p>${todo.text}</p>
              <small>Prio: ${todo.prio} ${todo.erledigt ? '✓ Erledigt' : ''}</small>
            </div>
          `
        )}
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 40px auto;
      font-family: system-ui, sans-serif;
      color: white;
    }

    .canvas {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      padding: 16px;
    }

    h3 {
      margin: 0 0 8px;
    }

    p {
      margin: 0;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'dash-canvas': DashCanvas
  }
}