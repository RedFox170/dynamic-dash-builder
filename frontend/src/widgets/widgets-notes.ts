import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { glassCardStyles } from '../styles/shared-styles'

const API_URL = 'http://localhost:5175'

// Property = wird von außen reingegeben (von dash-canvas), nicht selbst verwaltet
interface NoteData {
  id: string
  header: string
  noteText: string
}

@customElement('widget-notes')
export class WidgetNotes extends LitElement {
  @property({ type: Object })
  note!: NoteData

  // Lokaler Entwurf während des Tippens – erst beim Verlassen des Feldes gespeichert
  @state()
  private draftHeader = ''

  @state()
  private draftText = ''

  // Lifecycle-Methode: läuft wenn sich eine @property ändert
  // Hier: sobald "note" von außen gesetzt wird, Entwurf initial befüllen
  willUpdate(changedProps: Map<string, unknown>) {
    if (changedProps.has('note') && this.note) {
      this.draftHeader = this.note.header
      this.draftText = this.note.noteText
    }
  }

  private async _save() {
    const token = localStorage.getItem('token')

    await fetch(`${API_URL}/api/notes/${this.note.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        header: this.draftHeader,
        noteText: this.draftText,
      }),
    })
  }

  render() {
    return html`
      <div class="postit glass-card">
        <input
          class="header-input"
          .value=${this.draftHeader}
          @input=${(e: Event) => (this.draftHeader = (e.target as HTMLInputElement).value)}
          @blur=${this._save}
        />
        <textarea
          .value=${this.draftText}
          @input=${(e: Event) => (this.draftText = (e.target as HTMLTextAreaElement).value)}
          @blur=${this._save}
        ></textarea>
      </div>
    `
  }

  static styles = [
    glassCardStyles,
    css`
      :host {
        display: block;
        width: 220px;
        height: 220px;
      }

      .postit {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .header-input {
        background: transparent;
        border: none;
        color: white;
        font-size: 15px;
        font-weight: 600;
        outline: none;
        padding: 2px 0;
      }

      .header-input::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      textarea {
        flex: 1;
        background: transparent;
        border: none;
        color: white;
        font-size: 13px;
        resize: none;
        outline: none;
        font-family: inherit;
      }
    `,
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    'widget-notes': WidgetNotes
  }
}