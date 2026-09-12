using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DashBuilder.Api.Data;
using DashBuilder.Api.Models;

namespace DashBuilder.Api.Endpoints;

public static class TodoEndpoints
{
    public static void MapTodoEndpoints(this WebApplication app)
    {
        // GET /api/todos
            app.MapGet("/api/todos", [Authorize] async (HttpContext http, AppDbContext db) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var todos = await db.Todos
                .Where(t => t.UserId == userId)
                .ToListAsync();

            return Results.Ok(todos);
        });

        // POST /api/todos
        app.MapPost("/api/todos", [Authorize] async (HttpContext http, AppDbContext db, CreateTodoRequest request) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var todo = new Todo
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Header = request.Header,
                Text = request.Text,
                Prio = request.Prio,
                Erledigt = false,
                Erinnerung = request.Erinnerung
            };

            db.Todos.Add(todo);
            await db.SaveChangesAsync();

            return Results.Ok(todo);
        });


        // PUT /api/todos/{id}
        app.MapPut("/api/todos/{id}", [Authorize] async (HttpContext http, AppDbContext db, Guid id, UpdateTodoRequest request) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Todo suchen – UND direkt prüfen ob es dem eingeloggten User gehört.
            // Das ist der Ownership-Check: ohne "&& t.UserId == userId" könnte
            // jeder eingeloggte User JEDES Todo bearbeiten, indem er einfach eine fremde Id rät.
            var todo = await db.Todos
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            // Kein Todo gefunden ODER gehört einem anderen User -> 404
            // Bewusst 404 statt 403 ("verboten"), damit ein Angreifer nicht mal erfährt
            // ob die Id überhaupt existiert.
            if (todo is null)
                return Results.NotFound();

            // Nur die Felder überschreiben die im Request mitgeschickt wurden
            todo.Header = request.Header;
            todo.Text = request.Text;
            todo.Prio = request.Prio;
            todo.Erledigt = request.Erledigt;
            todo.Erinnerung = request.Erinnerung;

            await db.SaveChangesAsync();

            return Results.Ok(todo);
        });

        // DELETE /api/todos/{id}
        app.MapDelete("/api/todos/{id}", [Authorize] async (HttpContext http, AppDbContext db, Guid id) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var todo = await db.Todos
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (todo is null)
                return Results.NotFound();

            db.Todos.Remove(todo);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

public record CreateTodoRequest(string Header, string? Text, string Prio, DateTime? Erinnerung);

// Fürs Update braucht man auch Erledigt – hier DARF der Client es setzen,
// weil "als erledigt markieren" ein legitimer Use-Case ist
public record UpdateTodoRequest(string Header, string? Text, string Prio, bool Erledigt, DateTime? Erinnerung);