export type TaskType = "personal" | "organization";

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
  status: "pending" | "done";
  created_by: string;
  user_id?: string | null;
  organization_id?: string | null;
  created_at: string;
  updated_at: string;
}