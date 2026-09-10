using Microsoft.EntityFrameworkCore;
using DashBuilder.Api.Models;

namespace DashBuilder.Api.Data;

// AppDbContext ist die Brücke zwischen deinem C#-Code und der Datenbank.
// Entity Framework nutzt diese Klasse um SQL-Abfragen zu generieren –
// du arbeitest nur mit C#-Objekten, nie direkt mit SQL.
public class AppDbContext : DbContext
{
    // Konstruktor - nimmt die DB-Verbindungseinstellungen entgegen
    // die in Program.cs konfiguriert werden (Connection String aus appsettings.json)
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSet = Zugriffspunkt auf eine Tabelle.
    // Users entspricht der "users"-Tabelle in PostgreSQL.
    public DbSet<User> Users => Set<User>();

    // dashboard_widgets-Tabelle
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();

    // notes-Tabelle
    public DbSet<Note> Notes => Set<Note>();

    // todos-Tabelle
    public DbSet<Todo> Todos => Set<Todo>();
}