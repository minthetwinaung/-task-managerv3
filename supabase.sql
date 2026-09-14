-- Supabase table definition for DevTaskManager

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  no text not null,
  name text not null,
  description text,
  category text,
  priority text,
  status text,
  assignee text,
  "startDate" date,
  "dueDate" date,
  "completedDate" date,
  remark text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (status);

-- Repair or add date columns created by earlier versions of this script.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'startdate'
  ) then
    alter table public.tasks rename column startdate to "startDate";
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'startDate'
  ) then
    alter table public.tasks add column "startDate" date;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'duedate'
  ) then
    alter table public.tasks rename column duedate to "dueDate";
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'dueDate'
  ) then
    alter table public.tasks add column "dueDate" date;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'completeddate'
  ) then
    alter table public.tasks rename column completeddate to "completedDate";
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'completedDate'
  ) then
    alter table public.tasks add column "completedDate" date;
  end if;
end $$;

drop index if exists tasks_due_date_idx;
create index if not exists tasks_due_date_idx on public.tasks ("dueDate");

alter table public.tasks enable row level security;

drop policy if exists "Users can manage own tasks" on public.tasks;

create policy "Users can manage own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
