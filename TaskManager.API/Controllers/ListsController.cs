using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListsController : ControllerBase
{
    private readonly TaskManagerDbContext _context;

    public ListsController(TaskManagerDbContext context)
    {
        _context = context;
    }

    // GET: api/lists
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskList>>> GetLists()
    {
        return await _context.Lists.Include(l => l.Tasks).ToListAsync();
    }

    // GET: api/lists/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskList>> GetList(string id)
    {
        var list = await _context.Lists.Include(l => l.Tasks)
                                      .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null)
        {
            return NotFound();
        }

        return list;
    }

    // POST: api/lists
    [HttpPost]
    public async Task<ActionResult<TaskList>> CreateList(TaskList list)
    {
        // Ensure the list has a new ID
        list.Id = Guid.NewGuid().ToString();

        _context.Lists.Add(list);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetList), new { id = list.Id }, list);
    }

    // PUT: api/lists/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateList(string id, TaskList list)
    {
        if (id != list.Id)
        {
            return BadRequest();
        }

        _context.Entry(list).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ListExists(id))
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

    // DELETE: api/lists/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteList(string id)
    {
        var list = await _context.Lists.FindAsync(id);
        if (list == null)
        {
            return NotFound();
        }

        // Remove all tasks associated with this list
        var tasksToRemove = _context.Tasks.Where(t => t.ListId == id);
        _context.Tasks.RemoveRange(tasksToRemove);

        _context.Lists.Remove(list);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ListExists(string id)
    {
        return _context.Lists.Any(e => e.Id == id);
    }
}