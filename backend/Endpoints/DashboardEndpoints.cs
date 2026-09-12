using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DashBuilder.Api.Data;

namespace DashBuilder.Api.Endpoints;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this WebApplication app)
    {
        // GET /api/dashboard
        // [Authorize] = nur mit gültigem JWT aufrufbar
        app.MapGet("/api/dashboard", [Authorize] async (HttpContext http, AppDbContext db) =>
        {
            // UserId aus dem JWT-Token lesen
            // Den haben wir beim Login als Claim reingepackt
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Alle Widgets des Users laden
            var widgets = await db.DashboardWidgets
                .Where(w => w.UserId == userId)
                .ToListAsync();

            // Alle Notes des Users laden
            var notes = await db.Notes
                .Where(n => n.UserId == userId)
                .ToListAsync();

            // Alle Todos des Users laden
            var todos = await db.Todos
                .Where(t => t.UserId == userId)
                .ToListAsync();

            // Alles zusammenpacken und zurückgeben
            return Results.Ok(new
            {
                widgets,
                notes,
                todos
            });
        });
    }
}