# Dynamic Dash-Builder – Datenbankstruktur (PoC)

## Entscheidungen auf einen Blick

| Thema | Entscheidung | Begründung |
|---|---|---|
| Kerndaten (Notes, ToDo) | Normalisierte Tabellen | Relationale Beziehungen klar zeigen |
| Widget-Config (z. B. Wetterstadt) | JSONB-Spalte in `dashboard_widgets` | Flexibel, kein Schema-Change bei neuem Widget-Typ |
| Login | Username + Password-Hash | Simpel, kein E-Mail-Handling nötig |
| Widget-Zustand | `dashboard_widgets`-Tabelle | Sauber getrennt von User-Account-Daten |

---

## Tabellen

### `users`
| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Primärschlüssel |
| `username` | TEXT UNIQUE NOT NULL | Login-Name |
| `password_hash` | TEXT NOT NULL | Gehashtes Passwort (kein Klartext) |

---

### `dashboard_widgets`
Steuert welche Widgets aktiv sind, in welcher Reihenfolge und mit welcher Konfiguration.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Primärschlüssel |
| `user_id` | UUID (FK → users) | Besitzer des Widgets |
| `widget_type` | TEXT NOT NULL | `'notes'`, `'todo'`, `'weather'`, `'time'`, `'test'` |
| `position` | INT NOT NULL | Reihenfolge auf dem Canvas |
| `is_active` | BOOL NOT NULL DEFAULT true | Ein-/ausgeblendet |
| `config` | JSONB | Widget-spezifische Config, z. B. `{"city": "Leipzig"}` |

---

### `notes`
| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Primärschlüssel |
| `user_id` | UUID (FK → users) | Besitzer |
| `header` | TEXT NOT NULL | Überschrift der Notiz |
| `note` | TEXT | Inhalt |

---

### `todos`
| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Primärschlüssel |
| `user_id` | UUID (FK → users) | Besitzer |
| `header` | TEXT NOT NULL | Überschrift |
| `text` | TEXT | Beschreibung/Bemerkung |
| `prio` | TEXT NOT NULL | `'niedrig'`, `'mittel'`, `'hoch'` |
| `erledigt` | BOOL NOT NULL DEFAULT false | Abgehakt ja/nein |
| `erinnerung` | TIMESTAMP | Wann der Termin ansteht (nullable) |

---

## Beziehungen

```
users (1) ──── (n) dashboard_widgets
users (1) ──── (n) notes
users (1) ──── (n) todos
```

Alle Tabellen hängen direkt an `users`. Kein separates `dashboards`-Entity nötig – der User **ist** das Dashboard.

---

## Bewusste Designentscheidungen

- **JSONB nur für variable Widget-Config** (z. B. Wetterstadt), nicht für Kerndaten – Hybrid-Ansatz.
- **Kein Cascade-Delete** noch nicht definiert – für den PoC vernachlässigbar, in Produktion würde man `ON DELETE CASCADE` bei allen FKs setzen.
- **Wetter- und Zeit-Widget** speichern keine eigenen Datensätze (Wetter kommt live von Open-Meteo, Zeit ist clientseitig) – nur `config` in `dashboard_widgets` reicht.
