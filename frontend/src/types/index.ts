export type Task = {
  id: string;
  title: string;
  description: string;
  author_id: string;
  organization_id: string | null;
  status: 'to_do' | 'doing' | 'done';
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
};

export type Page = 'home' | 'my-tasks' | 'organization' | 'create-task';
