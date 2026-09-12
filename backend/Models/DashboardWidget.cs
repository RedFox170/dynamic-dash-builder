using System.ComponentModel.DataAnnotations.Schema;

namespace DashBuilder.Api.Models;

public class DashboardWidget
{
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("widget_type")]
    public string WidgetType { get; set; } = string.Empty;

    [Column("grid_column")]
    public int GridColumn { get; set; }

    [Column("grid_row")]
    public int GridRow { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("weather_city")]
    public string? WeatherCity { get; set; }
}