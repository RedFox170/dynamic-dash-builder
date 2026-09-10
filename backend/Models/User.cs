// Models beschreiben wie ein Datensatz aus der DB in C# aussieht.
// Entity Framework nutzt diese Klasse um auf die "users"-Tabelle zuzugreifen.
namespace DashBuilder.Api.Models;

public class User
{
    public Guid Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}