import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { buttonStyles, glassCardStyles } from './styles/shared-styles'

// URL zu deinem Backend – später ggf. in eine Config auslagern
const API_URL = 'http://localhost:5175'

@customElement('dash-login')
export class DashLogin extends LitElement {
  // @state = reaktiver, interner Zustand (anders als @property, wird nicht von außen gesetzt)
  // Ändert sich der Wert, rendert Lit die Komponente automatisch neu
  @state()
  private username = ''

  @state()
  private password = ''

  @state()
  private errorMessage = ''

  render() {
    return html`
      <form class="glass-card" @submit=${this._handleSubmit}>
        <h2>Login</h2>

        <label>
          Username
          <input
            type="text"
            .value=${this.username}
            @input=${(e: Event) => (this.username = (e.target as HTMLInputElement).value)}
          />
        </label>

        <label>
          Passwort
          <input
            type="password"
            .value=${this.password}
            @input=${(e: Event) => (this.password = (e.target as HTMLInputElement).value)}
          />
        </label>

        ${this.errorMessage ? html`<p class="error">${this.errorMessage}</p>` : ''}

        <button type="submit">Einloggen</button>
      </form>
    `
  }

  // async weil wir auf die Antwort vom Backend warten müssen (fetch ist asynchron)
  private async _handleSubmit(e: Event) {
    // verhindert dass das Formular die Seite neu lädt (Standard-Browser-Verhalten)
    e.preventDefault()
    this.errorMessage = ''

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      })

      if (!response.ok) {
        this.errorMessage = 'Login fehlgeschlagen – Username oder Passwort falsch'
        return
      }

      const data = await response.json()
      // Token speichern, damit spätere Requests ihn mitschicken können
      localStorage.setItem('token', data.token)

      // Eigenes Event feuern – dash-canvas (oder wer auch immer zuhört)
      // erfährt so "Login war erfolgreich", ohne dass dash-login das Canvas direkt kennen muss
      this.dispatchEvent(
        new CustomEvent('login-success', { bubbles: true, composed: true })
      )
    } catch (err) {
      this.errorMessage = 'Verbindung zum Server fehlgeschlagen'
    }
  }

  static styles = [
  buttonStyles,
  glassCardStyles,
  css`
    :host { display: block; max-width: 320px; margin: 80px auto; font-family: system-ui, sans-serif; }
    form { display: flex; flex-direction: column; gap: 12px; padding: 24px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: white; }
    input {
      padding: 8px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      background: rgba(255,255,255,0.1);
      color: white;
      font-size: 14px;
    }
    input::placeholder { color: rgba(255,255,255,0.6); }
    h2 { color: white; margin: 0; }
    .error { color: #ffb4b4; font-size: 13px; margin: 0; }
  `
]
}




declare global {
  interface HTMLElementTagNameMap {
    'dash-login': DashLogin
  }
}