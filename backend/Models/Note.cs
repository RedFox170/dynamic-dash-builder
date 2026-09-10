namespace DashBuilder.Api.Models;

// Notiz – gehört immer einem User
public class Note
{
    // PK
    public Guid Id { get; set; }

    // FK
    public Guid UserId { get; set; }

    // Überschrift
    public string Header { get; set; } = string.Empty;

    // Inhalt
    public string? NoteText { get; set; }
}