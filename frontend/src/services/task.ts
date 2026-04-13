import { api } from "./api";
import type { CreateTaskPayload, Task } from "../types/task";

interface CreateTaskResponse {
  message: string;
  task: Task;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await api.post<CreateTaskResponse>("/tasks", payload);
  return response.data.task;
}

export async function getMyTasks(): Promise<Task[]> {
  const { data } = await api.get("/tasks/me");
  return data || [];
}

export async function updateTaskStatus(
  taskId: string,
  status: Task["status"],
): Promise<void> {
  await api.put(`/tasks/${taskId}`, { status });
}