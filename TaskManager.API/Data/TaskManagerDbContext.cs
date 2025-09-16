using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data;

public class TaskManagerDbContext : DbContext
{
    public TaskManagerDbContext(DbContextOptions<TaskManagerDbContext> options) : base(options)
    {
    }
    
    public DbSet<TaskItem> Tasks { get; set; } = null!;
    public DbSet<TaskList> Lists { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<Note> Notes { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure User relationships
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
            
        modelBuilder.Entity<User>()
            .HasIndex(u => u.GoogleId)
            .IsUnique();
        
        // Configure TaskItem relationships
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.List)
            .WithMany(l => l.Tasks)
            .HasForeignKey(t => t.ListId)
            .OnDelete(DeleteBehavior.SetNull);
            
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Configure TaskList relationships
        modelBuilder.Entity<TaskList>()
            .HasOne(l => l.User)
            .WithMany(u => u.Lists)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Configure Tag relationships
        modelBuilder.Entity<Tag>()
            .HasOne(t => t.User)
            .WithMany(u => u.Tags)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Configure Note relationships
        modelBuilder.Entity<Note>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notes)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Seed default data (these will be global/template data)
        modelBuilder.Entity<TaskList>().HasData(
            new TaskList { Id = "personal", Name = "Personal", Color = "#FF6B6B", UserId = null },
            new TaskList { Id = "work", Name = "Work", Color = "#4ECDC4", UserId = null },
            new TaskList { Id = "list1", Name = "List 1", Color = "#FFD166", UserId = null }
        );
        
        modelBuilder.Entity<Tag>().HasData(
            new Tag { Id = "tag1", Name = "Tag 1", UserId = null },
            new Tag { Id = "tag2", Name = "Tag 2", UserId = null }
        );
    }
}