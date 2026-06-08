-- Supabase table definition for DevTaskManager

create extension if not exists pgcrypto;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  no text not null,
  name text not null,
  description text,
  category text,
  priority text,
  status text,
  assignee text,
  startDate date,
  dueDate date,
  completedDate date,
  remark text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_status_idx on public.tasks (status);
create index tasks_due_date_idx on public.tasks (dueDate);

alter table public.tasks enable row level security;

create policy "Users can manage own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
