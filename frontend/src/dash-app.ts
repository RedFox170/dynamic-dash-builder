import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './dash-login'

@customElement('dash-app')
export class DashApp extends LitElement {
  // Prüft beim Start ob schon ein Token vorhanden ist (z.B. nach Browser-Neustart)
  @state()
  private isLoggedIn = !!localStorage.getItem('token')

  connectedCallback() {
    super.connectedCallback()
    // Lauscht auf das Event das dash-login feuert
    this.addEventListener('login-success', this._handleLoginSuccess)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('login-success', this._handleLoginSuccess)
  }

  private _handleLoginSuccess = () => {
    this.isLoggedIn = true
  }

  render() {
    // Bedingtes Rendering – zeig Login ODER das Dashboard, nie beides
    return this.isLoggedIn
      ? html`<p>Eingeloggt! Dashboard kommt hier hin.</p>`
      : html`<dash-login></dash-login>`
  }

  static styles = css`
    :host {
      display: block;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'dash-app': DashApp
  }
}