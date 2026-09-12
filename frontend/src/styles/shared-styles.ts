import { css } from 'lit'

export const buttonStyles = css`
  button {
    padding: 10px 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #1a1a1a;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: background 0.2s, box-shadow 0.2s;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  button:active {
    background: rgba(255, 255, 255, 0.35);
  }
`

export const glassCardStyles = css`
  .glass-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
`