using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly TaskManagerDbContext _context;

    public TasksController(TaskManagerDbContext context)
    {
        _context = context;
    }

    // GET: api/tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        return await _context.Tasks.Include(t => t.List).ToListAsync();
    }

    // GET: api/tasks/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(string id)
    {
        var task = await _context.Tasks.Include(t => t.List)
                                     .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return NotFound();
        }

        return task;
    }

    // GET: api/tasks/filter/{filter}
    [HttpGet("filter/{filter}")]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasksByFilter(string filter)
    {
        var tasks = _context.Tasks.Include(t => t.List).AsQueryable();
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        switch (filter.ToLower())
        {
            case "today":
                tasks = tasks.Where(t => t.DueDate.HasValue && 
                                       t.DueDate.Value.Date == today);
                break;
            case "upcoming":
                tasks = tasks.Where(t => t.DueDate.HasValue && 
                                       t.DueDate.Value.Date >= tomorrow);
                break;
            case "work":
            case "personal":
            case "list1":
                tasks = tasks.Where(t => t.ListId == filter);
                break;
            default:
                // Return all tasks if filter is not recognized
                break;
        }

        return await tasks.ToListAsync();
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
    {
        // Ensure the task has a new ID and creation timestamp
        task.Id = Guid.NewGuid().ToString();
        task.CreatedAt = DateTime.UtcNow;

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // PUT: api/tasks/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(string id, TaskItem task)
    {
        if (id != task.Id)
        {
            return BadRequest();
        }

        _context.Entry(task).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TaskExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // PATCH: api/tasks/{id}/toggle
    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleTaskCompletion(string id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        task.Completed = !task.Completed;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/tasks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(string id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TaskExists(string id)
    {
        return _context.Tasks.Any(e => e.Id == id);
    }
}