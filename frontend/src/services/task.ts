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