export type TaskType = "personal" | "organization";
export type TaskStatus = 'to_do' | 'doing' | 'done';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  due_date?: string;
  type: TaskType;
  organization_id?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  type: TaskType;
  status: TaskStatus;
  created_by: string;
  user_id?: string | null;
  organization_id?: string | null;
  organization_name?: string;
  created_at: string;
  updated_at: string;
}