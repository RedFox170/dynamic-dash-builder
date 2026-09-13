using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DashBuilder.Api.Data;
using DashBuilder.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// CORS erlauben – Frontend (5173) und Backend (5175) sind unterschiedliche Origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Datenbankverbindung registrieren
// EF Core liest den Connection String aus appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT-Authentifizierung konfigurieren
// Das Backend prüft bei geschützten Endpoints ob ein gültiger JWT mitgeschickt wurde
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Muss vor Authentication/Authorization stehen (CORS)
app.UseCors("AllowFrontend");

// Middleware – Reihenfolge ist wichtig!
// Erst Auth prüfen, dann Authorisierung
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapDashboardEndpoints();
app.MapNoteEndpoints();
app.MapTodoEndpoints();
app.MapWidgetEndpoints();

app.Run();