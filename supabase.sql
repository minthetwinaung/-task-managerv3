-- Supabase table definition for DevTaskManager
-- Safe to re-run. Paste into Supabase Dashboard -> SQL Editor -> Run.
--
-- NOTE: date columns are lowercase (startdate, duedate, completeddate).
-- The app maps them to startDate / dueDate / completedDate in src/App.js
-- (sanitizeTask / normalizeTask). Keep both in sync.

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  no text not null,
  name text not null,
  description text,
  category text,
  priority text,
  status text,
  assignee text,
  startdate date,
  duedate date,
  completeddate date,
  remark text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- Repair date columns created by earlier versions of this script
-- (quoted camelCase "startDate" etc.) so they match what the app sends.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tasks' and column_name = 'startDate') then
    alter table public.tasks rename column "startDate" to startdate;
  elsif not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tasks' and column_name = 'startdate') then
    alter table public.tasks add column startdate date;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tasks' and column_name = 'dueDate') then
    alter table public.tasks rename column "dueDate" to duedate;
  elsif not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tasks' and column_name = 'duedate') then
    alter table public.tasks add column duedate date;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tasks' and column_name = 'completedDate') then
    alter table public.tasks rename column "completedDate" to completeddate;
  elsif not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tasks' and column_name = 'completeddate') then
    alter table public.tasks add column completeddate date;
  end if;

  if not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tasks' and column_name = 'created_at') then
    alter table public.tasks add column created_at timestamp with time zone default now();
  end if;
end $$;

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (status);
drop index if exists tasks_due_date_idx;
create index if not exists tasks_due_date_idx on public.tasks (duedate);

-- Row Level Security: each user only sees / edits their own tasks.
alter table public.tasks enable row level security;

drop policy if exists "Users can manage own tasks" on public.tasks;
create policy "Users can manage own tasks"
  on public.tasks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for task attachments.
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload task attachments" on storage.objects;
create policy "Users can upload task attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update task attachments" on storage.objects;
create policy "Users can update task attachments"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete task attachments" on storage.objects;
create policy "Users can delete task attachments"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

notify pgrst, 'reload schema';
