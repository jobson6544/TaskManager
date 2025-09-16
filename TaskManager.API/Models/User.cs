using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? PasswordHash { get; set; }
    
    [MaxLength(255)]
    public string? GoogleId { get; set; }
    
    [MaxLength(255)]
    public string? ProfilePictureUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Account linking properties
    public bool IsEmailVerified { get; set; } = false;
    public bool HasPassword { get; set; } = false;
    public bool HasGoogleLogin { get; set; } = false;
    
    // Navigation properties for user's data
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public virtual ICollection<TaskList> Lists { get; set; } = new List<TaskList>();
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
}