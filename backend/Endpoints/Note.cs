using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DashBuilder.Api.Data;
using DashBuilder.Api.Models;

namespace DashBuilder.Api.Endpoints;

public static class NoteEndpoints
{
    public static void MapNoteEndpoints(this WebApplication app)
    {
        // GET /api/notes
        app.MapGet("/api/notes", [Authorize] async (HttpContext http, AppDbContext db) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var notes = await db.Notes
                .Where(n => n.UserId == userId)
                .ToListAsync();

            return Results.Ok(notes);
        });

        // POST /api/notes
        app.MapPost("/api/notes", [Authorize] async (HttpContext http, AppDbContext db, CreateNoteRequest request) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Neues Note-Objekt aus dem Request bauen –
            // Id und UserId bestimmt das Backend, nicht der Client
            var note = new Note
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Header = request.Header,
                NoteText = request.NoteText
            };

            db.Notes.Add(note);
            await db.SaveChangesAsync();

            return Results.Ok(note);
        });
    }
}

// Nur die Felder die der Client wirklich mitschicken soll
public record CreateNoteRequest(string Header, string? NoteText);