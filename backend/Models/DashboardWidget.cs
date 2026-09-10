// Repräsentiert einen Widget-Eintrag auf dem Dashboard eines Users.
// Steuert welche Widgets aktiv sind, in welcher Reihenfolge und mit welcher Config.
namespace DashBuilder.Api.Models;

public class DashboardWidget
{
    // PK
    public Guid Id { get; set; }

    // FK
    public Guid UserId { get; set; }

    // Welcher Widget-Typ: 'notes', 'todo', 'weather', 'time', 'test'
    public string WidgetType { get; set; } = string.Empty;

    // Position im Grid – wo auf dem Canvas hängt das Widget?
    public int GridColumn { get; set; }
    public int GridRow { get; set; }

    // Ein-/ausgeblendet
    public bool IsActive { get; set; } = true;

    // Nur für das Wetter-Widget relevant, bei allen anderen null
    public string? WeatherCity { get; set; }

}