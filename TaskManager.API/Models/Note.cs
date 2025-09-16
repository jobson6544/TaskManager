using System.Text.Json.Serialization;

namespace TaskManager.API.Models;

public class Note
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Color { get; set; } = "#FFD433";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public string? UserId { get; set; }
    
    // Navigation property
    [JsonIgnore]
    public virtual User? User { get; set; }
}