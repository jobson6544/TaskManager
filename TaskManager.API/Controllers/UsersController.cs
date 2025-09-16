using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly TaskManagerDbContext _context;
    
    public UsersController(TaskManagerDbContext context)
    {
        _context = context;
    }
    
    // Register with email/password
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
    {
        try
        {
            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
                
            if (existingUser != null)
            {
                return BadRequest(new { message = "User with this email already exists" });
            }
            
            // Create new user
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                HasPassword = true,
                IsEmailVerified = true // For demo purposes
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Create default lists and tags for the user
            await CreateDefaultUserData(user.Id);
            
            return Ok(new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                HasPassword = user.HasPassword,
                HasGoogleLogin = user.HasGoogleLogin,
                ProfilePictureUrl = user.ProfilePictureUrl
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
        }
    }
    
    // Login with email/password
    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login(LoginRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
                
            if (user == null || !user.HasPassword || !VerifyPassword(request.Password, user.PasswordHash!))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return Ok(new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                HasPassword = user.HasPassword,
                HasGoogleLogin = user.HasGoogleLogin,
                ProfilePictureUrl = user.ProfilePictureUrl
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
        }
    }
    
    // Google OAuth login/register
    [HttpPost("google-auth")]
    public async Task<ActionResult<UserResponse>> GoogleAuth(GoogleAuthRequest request)
    {
        try
        {
            // In a real app, you would verify the Google token here
            // For demo purposes, we'll trust the provided data
            
            // Check if user exists by email
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
                
            if (existingUser != null)
            {
                // Link Google account if not already linked
                if (!existingUser.HasGoogleLogin)
                {
                    existingUser.GoogleId = request.GoogleId;
                    existingUser.HasGoogleLogin = true;
                    existingUser.ProfilePictureUrl = request.ProfilePictureUrl;
                }
                
                existingUser.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                
                return Ok(new UserResponse
                {
                    Id = existingUser.Id,
                    Name = existingUser.Name,
                    Email = existingUser.Email,
                    HasPassword = existingUser.HasPassword,
                    HasGoogleLogin = existingUser.HasGoogleLogin,
                    ProfilePictureUrl = existingUser.ProfilePictureUrl,
                    IsAccountLinked = existingUser.HasPassword && existingUser.HasGoogleLogin
                });
            }
            
            // Create new user with Google account
            var newUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                GoogleId = request.GoogleId,
                HasGoogleLogin = true,
                ProfilePictureUrl = request.ProfilePictureUrl,
                IsEmailVerified = true
            };
            
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            
            // Create default lists and tags for the user
            await CreateDefaultUserData(newUser.Id);
            
            return Ok(new UserResponse
            {
                Id = newUser.Id,
                Name = newUser.Name,
                Email = newUser.Email,
                HasPassword = newUser.HasPassword,
                HasGoogleLogin = newUser.HasGoogleLogin,
                ProfilePictureUrl = newUser.ProfilePictureUrl
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during Google authentication", error = ex.Message });
        }
    }
    
    // Get user profile
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetUser(string id)
    {
        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
        {
            return NotFound();
        }
        
        return Ok(new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            HasPassword = user.HasPassword,
            HasGoogleLogin = user.HasGoogleLogin,
            ProfilePictureUrl = user.ProfilePictureUrl,
            IsAccountLinked = user.HasPassword && user.HasGoogleLogin
        });
    }
    
    // Update user profile
    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> UpdateUser(string id, UpdateUserRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }
            
            // Update user fields
            if (!string.IsNullOrEmpty(request.Name))
            {
                user.Name = request.Name;
            }
            
            if (!string.IsNullOrEmpty(request.Email))
            {
                // Check if email is already taken by another user
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.Id != id);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email is already taken" });
                }
                user.Email = request.Email;
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                HasPassword = user.HasPassword,
                HasGoogleLogin = user.HasGoogleLogin,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsAccountLinked = user.HasPassword && user.HasGoogleLogin
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating profile", error = ex.Message });
        }
    }
    
    // Change password
    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(string id, ChangePasswordRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }
            
            // Verify current password if user has one
            if (user.HasPassword && !VerifyPassword(request.CurrentPassword, user.PasswordHash!))
            {
                return BadRequest(new { message = "Current password is incorrect" });
            }
            
            // Update password
            user.PasswordHash = HashPassword(request.NewPassword);
            user.HasPassword = true;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while changing password", error = ex.Message });
        }
    }
    
    // Reset password (simplified - in real app would send email)
    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
                
            if (user == null)
            {
                // Don't reveal if email exists
                return Ok(new { message = "If the email exists, a reset link has been sent" });
            }
            
            // In a real app, you'd generate a reset token and send email
            // For demo purposes, we'll allow direct password reset
            user.PasswordHash = HashPassword(request.NewPassword);
            user.HasPassword = true;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Password has been reset successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during password reset", error = ex.Message });
        }
    }
    
    // Delete account
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAccount(string id)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Tasks)
                .Include(u => u.Lists)
                .Include(u => u.Tags)
                .Include(u => u.Notes)
                .FirstOrDefaultAsync(u => u.Id == id);
                
            if (user == null)
            {
                return NotFound();
            }
            
            // Delete user and all associated data (cascade delete)
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Account deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting account", error = ex.Message });
        }
    }
    
    private async Task CreateDefaultUserData(string userId)
    {
        // Create user-specific copies of default lists
        var defaultLists = new[]
        {
            new TaskList { Id = $"{userId}-personal", Name = "Personal", Color = "#FF6B6B", UserId = userId },
            new TaskList { Id = $"{userId}-work", Name = "Work", Color = "#4ECDC4", UserId = userId },
            new TaskList { Id = $"{userId}-list1", Name = "List 1", Color = "#FFD166", UserId = userId }
        };
        
        _context.Lists.AddRange(defaultLists);
        
        // Create user-specific copies of default tags
        var defaultTags = new[]
        {
            new Tag { Id = $"{userId}-tag1", Name = "Tag 1", UserId = userId },
            new Tag { Id = $"{userId}-tag2", Name = "Tag 2", UserId = userId }
        };
        
        _context.Tags.AddRange(defaultTags);
        await _context.SaveChangesAsync();
    }
    
    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "organic-mind-salt"));
        return Convert.ToBase64String(hashedBytes);
    }
    
    private bool VerifyPassword(string password, string hash)
    {
        var hashedPassword = HashPassword(password);
        return hashedPassword == hash;
    }
}

// DTOs
public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class GoogleAuthRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string GoogleId { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
}

public class UserResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool HasPassword { get; set; }
    public bool HasGoogleLogin { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsAccountLinked { get; set; }
}

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}