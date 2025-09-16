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

export interface List {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
}