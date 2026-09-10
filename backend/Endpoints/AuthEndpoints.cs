using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DashBuilder.Api.Data;

namespace DashBuilder.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        // POST /api/auth/login
        // Erwartet Username + Passwort, gibt bei Erfolg einen JWT zurück
        app.MapPost("/api/auth/login", async (LoginRequest request, AppDbContext db, IConfiguration config) =>
        {
            // User in der DB suchen
            var user = await db.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            // User nicht gefunden oder Passwort falsch
            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Results.Unauthorized();

            // JWT erstellen
            var secret = config["Jwt:Secret"]!;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                // Claims = Informationen die im Token stecken
                // Hier speichern wir die UserId damit wir sie später aus dem Token lesen können
                claims: new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username)
                },
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Results.Ok(new { token = tokenString });
        });
    }
}

// Das Datenmodell für den Login-Request (was das Frontend schickt)
public record LoginRequest(string Username, string Password);