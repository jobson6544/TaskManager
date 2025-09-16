using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManager.API.Models;

public class TaskList
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(7)] // For hex color codes like #FF6B6B
    public string Color { get; set; } = "#6366f1";
    
    public string? UserId { get; set; }
    
    // Navigation properties
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    
    [JsonIgnore]
    public virtual User? User { get; set; }
}