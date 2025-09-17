// TaskManager API service for .NET backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5118/api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  listId?: string;
  section?: string;
  subtasks?: number;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
  hasGoogleLogin: boolean;
  profilePictureUrl?: string;
  isAccountLinked?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  name: string;
  email: string;
  googleId: string;
  profilePictureUrl?: string;
}

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          errorMessage = JSON.stringify(errorData.errors);
        }
      } catch (e) {
        // If we can't parse JSON, use the original error message
      }
      throw new Error(errorMessage);
    }
    
    // Handle empty responses (like 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

// Tasks API
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    return await apiRequest('/tasks');
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const fetchTasksByFilter = async (filter: string): Promise<Task[]> => {
  try {
    return await apiRequest(`/tasks/filter/${filter}`);
  } catch (error) {
    console.error(`Error fetching tasks with filter ${filter}:`, error);
    return [];
  }
};

export const fetchTask = async (id: string): Promise<Task | null> => {
  try {
    return await apiRequest(`/tasks/${id}`);
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    return null;
  }
};

export const addTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task | null> => {
  try {
    return await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<boolean> => {
  try {
    await apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...task, id }),
    });
    return true;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    return false;
  }
};

export const toggleTaskCompletion = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
    return true;
  } catch (error) {
    console.error(`Error toggling task completion ${id}:`, error);
    return false;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    return false;
  }
};

// Lists API
export const fetchLists = async (): Promise<TaskList[]> => {
  try {
    return await apiRequest('/lists');
  } catch (error) {
    console.error('Error fetching lists:', error);
    return [];
  }
};

export const fetchList = async (id: string): Promise<TaskList | null> => {
  try {
    return await apiRequest(`/lists/${id}`);
  } catch (error) {
    console.error(`Error fetching list ${id}:`, error);
    return null;
  }
};

export const addList = async (list: Omit<TaskList, 'id'>): Promise<TaskList | null> => {
  try {
    return await apiRequest('/lists', {
      method: 'POST',
      body: JSON.stringify(list),
    });
  } catch (error) {
    console.error('Error adding list:', error);
    return null;
  }
};

export const updateList = async (id: string, list: Partial<TaskList>): Promise<boolean> => {
  try {
    await apiRequest(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...list, id }),
    });
    return true;
  } catch (error) {
    console.error(`Error updating list ${id}:`, error);
    return false;
  }
};

export const deleteList = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/lists/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`Error deleting list ${id}:`, error);
    return false;
  }
};

// Tags API
export const fetchTags = async (): Promise<Tag[]> => {
  try {
    return await apiRequest('/tags');
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

export const fetchTag = async (id: string): Promise<Tag | null> => {
  try {
    return await apiRequest(`/tags/${id}`);
  } catch (error) {
    console.error(`Error fetching tag ${id}:`, error);
    return null;
  }
};

export const addTag = async (tag: Omit<Tag, 'id'>): Promise<Tag | null> => {
  try {
    return await apiRequest('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    return null;
  }
};

export const updateTag = async (id: string, tag: Partial<Tag>): Promise<boolean> => {
  try {
    await apiRequest(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...tag, id }),
    });
    return true;
  } catch (error) {
    console.error(`Error updating tag ${id}:`, error);
    return false;
  }
};

export const deleteTag = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/tags/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`Error deleting tag ${id}:`, error);
    return false;
  }
};

// Notes API
export const fetchNotes = async (): Promise<Note[]> => {
  try {
    return await apiRequest('/notes');
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const fetchNote = async (id: string): Promise<Note | null> => {
  try {
    return await apiRequest(`/notes/${id}`);
  } catch (error) {
    console.error(`Error fetching note ${id}:`, error);
    return null;
  }
};

export const addNote = async (note: Omit<Note, 'id' | 'createdAt'>): Promise<Note | null> => {
  try {
    return await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  } catch (error) {
    console.error('Error adding note:', error);
    return null;
  }
};

export const updateNote = async (id: string, note: Partial<Note>): Promise<boolean> => {
  try {
    await apiRequest(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...note, id }),
    });
    return true;
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    return false;
  }
};

export const deleteNote = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/notes/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    return false;
  }
};

// Authentication API
export interface User {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
  hasGoogleLogin: boolean;
  profilePictureUrl?: string;
  isAccountLinked?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  name: string;
  email: string;
  googleId: string;
  profilePictureUrl?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export const register = async (userData: RegisterRequest): Promise<User | null> => {
  try {
    return await apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const login = async (credentials: LoginRequest): Promise<User | null> => {
  try {
    return await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const googleAuth = async (googleData: GoogleAuthRequest): Promise<User | null> => {
  try {
    return await apiRequest('/users/google-auth', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
  } catch (error) {
    console.error('Error with Google authentication:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    return await apiRequest(`/users/${userId}`);
  } catch (error) {
    console.error(`Error fetching user profile ${userId}:`, error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, userData: UpdateUserRequest): Promise<User | null> => {
  try {
    return await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error(`Error updating user profile ${userId}:`, error);
    throw error;
  }
};

export const changePassword = async (userId: string, passwordData: ChangePasswordRequest): Promise<boolean> => {
  try {
    await apiRequest(`/users/${userId}/change-password`, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
    return true;
  } catch (error) {
    console.error(`Error changing password for user ${userId}:`, error);
    throw error;
  }
};

export const resetPassword = async (resetData: ResetPasswordRequest): Promise<boolean> => {
  try {
    await apiRequest('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const deleteAccount = async (userId: string): Promise<boolean> => {
  try {
    await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`Error deleting account ${userId}:`, error);
    throw error;
  }
};