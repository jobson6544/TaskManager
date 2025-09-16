using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManager.API.Models;

public class Tag
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
    
    public string? UserId { get; set; }
    
    // Navigation property
    [JsonIgnore]
    public virtual User? User { get; set; }
}