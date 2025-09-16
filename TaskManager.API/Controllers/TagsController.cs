using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly TaskManagerDbContext _context;

    public TagsController(TaskManagerDbContext context)
    {
        _context = context;
    }

    // GET: api/tags
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tag>>> GetTags()
    {
        return await _context.Tags.ToListAsync();
    }

    // GET: api/tags/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Tag>> GetTag(string id)
    {
        var tag = await _context.Tags.FindAsync(id);

        if (tag == null)
        {
            return NotFound();
        }

        return tag;
    }

    // POST: api/tags
    [HttpPost]
    public async Task<ActionResult<Tag>> CreateTag(Tag tag)
    {
        // Ensure the tag has a new ID
        tag.Id = Guid.NewGuid().ToString();

        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTag), new { id = tag.Id }, tag);
    }

    // PUT: api/tags/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(string id, Tag tag)
    {
        if (id != tag.Id)
        {
            return BadRequest();
        }

        _context.Entry(tag).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TagExists(id))
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

    // DELETE: api/tags/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(string id)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null)
        {
            return NotFound();
        }

        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TagExists(string id)
    {
        return _context.Tags.Any(e => e.Id == id);
    }
}