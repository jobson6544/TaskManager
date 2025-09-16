using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManager.API.Models;

public class TaskItem
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(500)]
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public bool Completed { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? DueDate { get; set; }
    
    public string? ListId { get; set; }
    
    public string? UserId { get; set; }
    
    public string? Section { get; set; }
    
    public int? Subtasks { get; set; }
    
    // Navigation properties
    [JsonIgnore]
    public virtual TaskList? List { get; set; }
    
    [JsonIgnore]
    public virtual User? User { get; set; }
}