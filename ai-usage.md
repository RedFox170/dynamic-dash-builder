# KI-Nutzung & Reflexion

Da ich nicht weiß wie levelbuild intern mit KI-Nutzung umgeht, dokumentiere ich hier transparent wie ich vorgegangen bin. Ich bringe wenig Erfahrung mit Lit und ASP.NET Core mit – KI habe ich genutzt um mich mit dem Stack auseinanderzusetzen, eigene Entscheidungen zu hinterfragen und Fehler zu erkennen.

---

## Datenstruktur

Ersten Entwurf der Tabellen habe ich selbst erarbeitet. KI als Sparringspartner genutzt um den Entwurf zu prüfen.

**Korrekturen & Learnings:**

- `expired` war als einzelnes Feld geplant – zu ungenau, da zwei Konzepte vermischt. Aufgeteilt in `erledigt` (bool) und `erinnerung` (timestamp)
- Widget-Position auf dem Canvas hatte ich vergessen. `position` in `dashboard_widgets` ergänzt
- `dashboard_widgets` als eigene Tabelle – Widget-Zustände (an/aus, Position) hatte ich zunächst direkt beim User speichern wollen. Auf Hinweis getrennt, damit `users` reine Account-Daten bleibt
- Erstellung der `init.sql` Datei nach Vorgabe meiner Datenstruktur

## Backend (C# / ASP.NET Core)

Hier habe ich deutlich stärker auf KI-Unterstützung gesetzt als bei der Datenstruktur, weil ich mit C# und ASP.NET Core kaum Vorerfahrung habe. Vieles am grundsätzlichen Aufbau (Routing, Middleware, Dependency Injection) kam mir aus meiner Web-Erfahrung (z.B. Next.js) bekannt vor, auch wenn die konkrete Syntax und Konventionen in C# neu für mich waren.

**Womit KI konkret geholfen hat:**

- Grundgerüst der Minimal API (Program.cs, DbContext, JWT-Auth-Konfiguration)
- Debugging der EF Core / PostgreSQL Namenskonventionen (PascalCase vs. snake_case), inkl. der `[Column("...")]`-Attribute zur Lösung
- Trennung von DB-Model und Request-DTO (z.B. `CreateNoteRequest` statt direkt `Note`), damit Clients keine Felder wie `Id` oder `UserId` selbst setzen können
- Ownership-Check bei PUT/DELETE-Endpoints (`WHERE Id = ... AND UserId = ...`), damit kein User fremde Datensätze bearbeiten kann – dieses Konzept kannte ich vorher nicht
- Grundaufbau sowie Einsatz C#-spezifischer Sprachkonstrukte (z.B. record, Attribute, LINQ)
- wiederholung und erklärung von Datenfluss