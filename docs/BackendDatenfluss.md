# Datenfluss – Backend Request-Zyklus

Am Beispiel `POST /api/todos`, gilt aber für alle Endpoints nach dem gleichen Schema.

## Ablauf

1. **Client schickt HTTP-Request** mit JSON-Body an den passenden Pfad
2. **Routing** – ASP.NET Core matched Pfad + HTTP-Methode gegen die registrierten Endpoints in [`TodoEndpoints.cs`](../backend/Endpoints/TodoEndpoints.cs)
3. **`[Authorize]`** – Middleware prüft den JWT im Request BEVOR der eigentliche Code läuft. Kein gültiger Token → sofortiger Abbruch mit 401, der restliche Code wird nie erreicht
4. **Parameter-Binding** (Dependency Injection) – für jeden Parameter der Methode wird automatisch die passende Quelle ermittelt:
   - `HttpContext http` → Framework-Typ, enthält Request/Response inkl. der User-Claims aus dem JWT (z. B. `UserId`)
   - `AppDbContext db` → registrierter Service aus [`Program.cs`](../backend/Program.cs), Zugriff auf die Datenbank
   - `CreateTodoRequest request` → wird aus dem JSON-Body gebaut, Property-Namen müssen zu den JSON-Feldern passen
5. **Eigener Code läuft** – UserId aus dem Token lesen, neues `Todo`-Objekt aus dem Request bauen, in die DB schreiben
6. **Response** geht als JSON zurück an den Client

## Warum zwei Klassen (Request vs. Model)?

- **Model** (`Todo` in [`Models/Todo.cs`](../backend/Models/Todo.cs)) – vollständige Struktur wie ein Datensatz in der DB aussieht
- **Request** (`CreateTodoRequest`, direkt in [`TodoEndpoints.cs`](../backend/Endpoints/TodoEndpoints.cs)) – reduzierter Eingabekanal, nur die Felder die der Client wirklich liefern darf

Felder wie `Id`, `UserId`, `Erledigt` fehlen im Request bewusst – die bestimmt das Backend selbst, nicht der Client. Verhindert dass ein Client sich als anderer User ausgibt oder fremde Datensätze überschreibt.

## Gleiches Muster bei

- [`NoteEndpoints.cs`](../backend/Endpoints/NoteEndpoints.cs) – `CreateNoteRequest` → `Note`
- [`AuthEndpoints.cs`](../backend/Endpoints/AuthEndpoints.cs) – `LoginRequest` → JWT statt DB-Insert