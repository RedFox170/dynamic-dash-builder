# KI-Nutzung & Reflexion
 
Da ich nicht weiß wie levelbuild intern mit KI-Nutzung umgeht, dokumentiere ich hier transparent wie ich vorgegangen bin. Ich bringe wenig Erfahrung mit Lit und ASP.NET Core mit - KI habe ich genutzt um mich mit dem Stack auseinanderzusetzen, eigene Entscheidungen zu hinterfragen und Fehler zu erkennen.
 
---
 
## Datenstruktur
 
Ersten Entwurf der Tabellen habe ich selbst erarbeitet. KI als Sparringspartner genutzt um den Entwurf zu prüfen.
 
**Korrekturen & Learnings:**
 
- `expired` war als einzelnes Feld geplant – zu ungenau, da zwei Konzepte vermischt. Aufgeteilt in `erledigt` (bool) und `erinnerung` (timestamp)
- Widget-Position auf dem Canvas hatte ich vergessen. `position` in `dashboard_widgets` ergänzt
- dashboard_widgets als eigene Tabelle - Widget-Zustände (an/aus, Position) hatte ich zunächst direkt beim User speichern wollen. Auf Hinweis getrennt, damit users reine Account-Daten bleibt
- ! Erstellung der init.sql Datei unter vorgabe meiner Datenstruktur
