using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DashBuilder.Api.Data;
using DashBuilder.Api.Models;

namespace DashBuilder.Api.Endpoints;

public static class WidgetEndpoints
{
    public static void MapWidgetEndpoints(this WebApplication app)
    {
        // POST /api/widgets
        // Erstellt ein neues Widget UND (falls nötig) den zugehörigen leeren Datensatz
        app.MapPost("/api/widgets", [Authorize] async (HttpContext http, AppDbContext db, CreateWidgetRequest request) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var widget = new DashboardWidget
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                WidgetType = request.WidgetType,
                GridColumn = request.GridColumn,
                GridRow = request.GridRow,
                IsActive = true,
                WeatherCity = request.WeatherCity
            };

            db.DashboardWidgets.Add(widget);

            // Je nach Widget-Typ direkt den passenden leeren Datensatz anlegen,
            // damit der User sofort reinschreiben kann
            if (request.WidgetType == "notes")
            {
                db.Notes.Add(new Note
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    WidgetId = widget.Id,
                    Header = "Neue Notiz",
                    NoteText = ""
                });
            }
            else if (request.WidgetType == "todo")
            {
                db.Todos.Add(new Todo
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    WidgetId = widget.Id,
                    Header = "Neues ToDo",
                    Text = "",
                    Prio = "mittel",
                    Erledigt = false
                });
            }
            // weather/time brauchen keinen zusätzlichen Datensatz

            // EIN SaveChangesAsync für alles – Widget + Note/Todo werden
            // zusammen gespeichert, damit nie eines ohne das andere existiert
            await db.SaveChangesAsync();

            return Results.Ok(widget);
        });

        // PUT /api/widgets/{id}
        app.MapPut("/api/widgets/{id}", [Authorize] async (HttpContext http, AppDbContext db, Guid id, UpdateWidgetRequest request) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var widget = await db.DashboardWidgets
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (widget is null)
                return Results.NotFound();

            widget.GridColumn = request.GridColumn;
            widget.GridRow = request.GridRow;
            widget.IsActive = request.IsActive;
            widget.WeatherCity = request.WeatherCity;

            await db.SaveChangesAsync();

            return Results.Ok(widget);
        });

        // DELETE /api/widgets/{id}
        app.MapDelete("/api/widgets/{id}", [Authorize] async (HttpContext http, AppDbContext db, Guid id) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var widget = await db.DashboardWidgets
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (widget is null)
                return Results.NotFound();

            // Wegen ON DELETE CASCADE in der DB werden zugehörige Notes/Todos
            // automatisch mitgelöscht, sobald das Widget gelöscht wird
            db.DashboardWidgets.Remove(widget);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

public record CreateWidgetRequest(string WidgetType, int GridColumn, int GridRow, string? WeatherCity);
public record UpdateWidgetRequest(int GridColumn, int GridRow, bool IsActive, string? WeatherCity);