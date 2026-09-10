# Simple erklärung von mir für mich BACKENDSTRUKTUR
RestaurantBeispiel

### Models - Die Speisekarte
Beschreibt was es gibt und wie es aussieht

### Data (AppDbContext) - die Küche
Weiß wo die Zutaten (Daten) lagern und wie man sie holt. Wenn du einen User brauchst, fragst du den DbContext – der spricht mit PostgreSQL und bringt dir ein User-Objekt zurück.

### Endpoints - Kellner
Nimmt Bestellung  (vom Frontend) entgegen - geht in Küche (Context) - bringt Ergebnis zurück

### Zusatz
LoginRequest (in AuthEndpoints.cs) - quasi der Bestellzettel (definiert was das Frontend mitschicken muss (Username + Password))