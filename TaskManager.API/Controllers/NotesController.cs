using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly TaskManagerDbContext _context;

    public NotesController(TaskManagerDbContext context)
    {
        _context = context;
    }

    // GET: api/notes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
    {
        return await _context.Notes.OrderByDescending(n => n.CreatedAt).ToListAsync();
    }

    // GET: api/notes/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Note>> GetNote(string id)
    {
        var note = await _context.Notes.FindAsync(id);

        if (note == null)
        {
            return NotFound();
        }

        return note;
    }

    // POST: api/notes
    [HttpPost]
    public async Task<ActionResult<Note>> CreateNote(Note note)
    {
        // Ensure the note has a new ID and creation timestamp
        note.Id = Guid.NewGuid().ToString();
        note.CreatedAt = DateTime.UtcNow;

        _context.Notes.Add(note);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
    }

    // PUT: api/notes/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNote(string id, Note note)
    {
        if (id != note.Id)
        {
            return BadRequest();
        }

        note.UpdatedAt = DateTime.UtcNow;
        _context.Entry(note).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!NoteExists(id))
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

    // DELETE: api/notes/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNote(string id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null)
        {
            return NotFound();
        }

        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool NoteExists(string id)
    {
        return _context.Notes.Any(e => e.Id == id);
    }
}