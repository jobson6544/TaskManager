'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import useTaskStore from '@/store/useTaskStore';

const StickyWallPage = () => {
  const { tasks, notes, fetchTasks, fetchNotes, addNote, updateNote, deleteNote } = useTaskStore();
  const [showAddNote, setShowAddNote] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: '#FFD433'
  });

  useEffect(() => {
    fetchTasks();
    fetchNotes();
  }, [fetchTasks, fetchNotes]);
  
  const colorOptions = [
    '#FFD433', // Yellow
    '#4ECDC4', // Teal
    '#FF6B6B', // Red
    '#FFB347', // Orange
    '#7159C1', // Purple
    '#59c17f'  // Green
  ];
  
  const handleAddNote = async () => {
    if (!newNote.title.trim()) return;
    
    const noteData = {
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      color: newNote.color
    };
    
    const result = await addNote(noteData);
    if (result) {
      await fetchNotes(); // Refresh notes
    }
    
    setNewNote({ title: '', content: '', color: '#FFD433' });
    setShowAddNote(false);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      color: note.color
    });
    setShowAddNote(true);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNote.title.trim()) return;
    
    const updatedData = {
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      color: newNote.color
    };
    
    await updateNote(editingNote.id, updatedData);
    await fetchNotes(); // Refresh notes
    
    setEditingNote(null);
    setNewNote({ title: '', content: '', color: '#FFD433' });
    setShowAddNote(false);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNewNote({ title: '', content: '', color: '#FFD433' });
    setShowAddNote(false);
  };

  const handleTaskToNote = async (task: any) => {
    const noteData = {
      title: task.title,
      content: task.description || `Task: ${task.title}\nDue: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}\nStatus: ${task.completed ? 'Completed' : 'Pending'}`,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)]
    };
    
    const result = await addNote(noteData);
    if (result) {
      await fetchNotes(); // Refresh notes
    }
    setShowTaskList(false);
  };
  
  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    await fetchNotes(); // Refresh notes
  };
  
  return (
    <SidebarLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sticky Wall</h1>
          <div className="flex items-center gap-3">
            <button 
              className="btn flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setShowTaskList(!showTaskList)}
            >
              <DocumentTextIcon className="h-5 w-5 mr-1" />
              <span>From Tasks</span>
            </button>
            <button 
              className="btn btn-primary flex items-center bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              onClick={() => setShowAddNote(true)}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              <span>Add Note</span>
            </button>
          </div>
        </div>

        {/* Task Selection Modal */}
        {showTaskList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Convert Task to Note</h2>
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tasks available</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleTaskToNote(task)}
                    >
                      <div className="font-medium dark:text-white">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
                  onClick={() => setShowTaskList(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Note Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Add Note Form */}
          {showAddNote && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Note Title"
                  className="w-full px-2 py-1 text-lg font-medium border-0 focus:outline-none bg-transparent dark:text-white"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  autoFocus
                />
              </div>
              
              <div className="p-4">
                <textarea
                  placeholder="Note content..."
                  className="w-full h-32 px-2 py-1 border-0 focus:outline-none resize-none bg-transparent dark:text-white"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                ></textarea>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded-full ${
                        newNote.color === color ? 'ring-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewNote({ ...newNote, color })}
                    ></button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-primary text-dark rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                    onClick={editingNote ? handleUpdateNote : handleAddNote}
                    disabled={!newNote.title.trim()}
                  >
                    {editingNote ? 'Update Note' : 'Add Note'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Existing Notes */}
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl shadow-sm overflow-hidden relative group"
              style={{ backgroundColor: note.color }}
            >
              <div className="p-4 border-b border-black border-opacity-10">
                <h3 className="text-lg font-medium">{note.title}</h3>
              </div>
              
              <div className="p-4">
                <p className="whitespace-pre-line">{note.content}</p>
              </div>
              
              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-1 rounded-full text-gray-700 hover:bg-black hover:bg-opacity-10"
                  onClick={() => handleEditNote(note)}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button 
                  className="p-1 rounded-full text-gray-700 hover:bg-black hover:bg-opacity-10"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Add Note Button */}
          <div 
            className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center h-48 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => setShowAddNote(true)}
          >
            <div className="text-center">
              <PlusIcon className="h-8 w-8 mx-auto text-gray-400" />
              <span className="block mt-1 text-gray-500 dark:text-gray-400">Add Note</span>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default StickyWallPage;