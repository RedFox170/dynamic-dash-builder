using System.ComponentModel.DataAnnotations.Schema;

namespace DashBuilder.Api.Models;

// Repräsentiert einen ToDo-Eintrag – gehört immer einem User
public class Todo
{
    // PK
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    // Überschrift
    public string Header { get; set; } = string.Empty;

    // Beschreibung/Bemerkung
    public string? Text { get; set; }

    // Priorität: 'niedrig', 'mittel', 'hoch'
    public string Prio { get; set; } = "mittel";

    public bool Erledigt { get; set; } = false;

    // Wann steht der Termin an? (kein Pflichtfeld)
    public DateTime? Erinnerung { get; set; } 
}