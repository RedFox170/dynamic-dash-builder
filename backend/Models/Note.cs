using System.ComponentModel.DataAnnotations.Schema;

namespace DashBuilder.Api.Models;

// Notiz – gehört immer einem User
public class Note
{
    // PK
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    // Überschrift
    public string Header { get; set; } = string.Empty;

    [Column("note")]
    public string? NoteText { get; set; }
}