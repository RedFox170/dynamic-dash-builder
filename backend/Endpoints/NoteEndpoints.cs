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

        // PUT /api/notes/{id}
        app.MapPut("/api/notes/{id}", [Authorize] async (HttpContext http, AppDbContext db, Guid id, UpdateNoteRequest request) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var note = await db.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (note is null)
                return Results.NotFound();

            note.Header = request.Header;
            note.NoteText = request.NoteText;

            await db.SaveChangesAsync();

            return Results.Ok(note);
        });

        // DELETE /api/notes/{id}
        app.MapDelete("/api/notes/{id}", [Authorize] async (HttpContext http, AppDbContext db, Guid id) =>
        {
            var userId = Guid.Parse(http.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var note = await db.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (note is null)
                return Results.NotFound();

            db.Notes.Remove(note);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

public record CreateNoteRequest(string Header, string? NoteText);
public record UpdateNoteRequest(string Header, string? NoteText);