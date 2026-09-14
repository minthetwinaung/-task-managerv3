# Supabase Production Debugging Guide

Use this guide when creating, updating, loading, or deleting tasks fails in production.

## 1. Check the production table schema

Open the Supabase dashboard, select the production project, open **SQL Editor**, and run:

```sql
select
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tasks'
order by ordinal_position;
```

To check date columns specifically:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tasks'
  and column_name ilike '%date%';
```

PostgreSQL lowercases unquoted identifiers. For example:

```sql
completedDate
```

becomes:

```sql
completeddate
```

Always use the names returned by the production query. Do not rely only on the local `supabase.sql` file.

## 2. Verify frontend field names

The task form uses these UI names:

```text
startDate
dueDate
completedDate
```

The current application maps them to the lowercase names used by the existing production table:

```text
startdate
duedate
completeddate
```

This mapping is in `src/App.js`, in `sanitizeTask` and `normalizeTask`.

Before sending a request, temporarily log the payload inside `saveTask`:

```js
console.log('Supabase task payload:', payload);
```

Then:

1. Open the application.
2. Press `F12`.
3. Open the **Console** tab.
4. Create or update a task.
5. Compare every payload key with the result of the production schema query.

Blank date fields must be sent as `null`, not as an empty string:

```js
dueDate: dueDate || null
```

## 3. Inspect Supabase errors

Supabase returns an error object with useful fields. Log all of them while troubleshooting:

```js
if (error) {
  console.error('Supabase task operation failed:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}
```

Common error codes:

| Code | Meaning |
| --- | --- |
| `PGRST204` | Column is missing from the PostgREST schema cache or request |
| `42501` | Permission denied, usually Row Level Security |
| `23505` | Duplicate key or unique constraint violation |
| `23502` | Required column received `null` |
| `22P02` | Invalid data type or format |
| `PGRST116` | A single-row query returned no row or multiple rows |

If a column was added or renamed, run this in Supabase SQL Editor after the change:

```sql
notify pgrst, 'reload schema';
```

## 4. Trace UI to PostgreSQL

### Browser UI

Open DevTools with `F12` and check:

- **Console**: frontend logs and the complete Supabase error.
- **Network**: the request to `/rest/v1/tasks`.
- Request method: `POST` for insert, `PATCH` for update, `DELETE` for delete.
- Request payload: field names, values, and `user_id`.
- Response status and response body.

### Interpret the HTTP response

| Status | Check |
| --- | --- |
| `400` | Invalid column, payload, or data type |
| `401` | Missing or invalid authentication |
| `403` | RLS or permission problem |
| `409` | Duplicate or conflicting data |
| `422` | Invalid data format |

### Supabase and PostgreSQL

In Supabase, inspect:

- **Logs -> Postgres Logs** for database-side errors.
- **Authentication -> Users** to confirm the logged-in user exists.
- **Table Editor -> tasks** to confirm rows and column names.
- **Authentication -> Policies** or the SQL query below to inspect RLS.

## 5. Check authentication and RLS

The authenticated user's ID must match the task's `user_id`.

Temporarily log the authenticated user:

```js
const { data } = await supabase.auth.getUser();
console.log('Authenticated user ID:', data.user?.id);
```

Inspect the production policies:

```sql
select
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'tasks';
```

The task policy should enforce the equivalent of:

```sql
auth.uid() = user_id
```

If the IDs do not match, the insert, update, or delete will be rejected by RLS.

## 6. Check data types

Run:

```sql
select
  column_name,
  data_type,
  udt_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tasks'
order by ordinal_position;
```

Expected important types:

- `id`: `uuid`
- `user_id`: `uuid`
- Date fields: `date`
- `attachments`: `jsonb`
- Text fields: `text`

Check these common problems:

- A UUID column receives a numeric or arbitrary string ID.
- A date column receives `''` instead of `null` or `YYYY-MM-DD`.
- A JSONB column receives a plain string instead of an array/object.
- A required column receives `null`.

## 7. Fast diagnosis checklist

Follow this order to find the root cause quickly:

1. Reproduce the error once.
2. Read the exact browser Console error.
3. Inspect the `/rest/v1/tasks` Network request.
4. Compare request keys with `information_schema.columns`.
5. Check the HTTP status and response body.
6. Confirm the authenticated user ID and `user_id` match.
7. Check RLS policies.
8. Check the affected column data type.
9. Inspect Supabase Postgres Logs.
10. Reload the PostgREST schema after schema changes.

## Root-cause categories

- **Frontend code**: payload has the wrong key, wrong value, or wrong empty-value handling.
- **Database schema**: column is missing, misspelled, differently cased, or has the wrong type.
- **RLS policy**: the user is not allowed to insert, update, or delete that row.
- **Authentication**: there is no valid Supabase session or the user ID is wrong.
- **Data type**: a UUID, date, JSONB, or required value is malformed.
- **Schema cache**: the database changed but PostgREST has not reloaded its schema.

Do not expose the Supabase service-role key in frontend code. The frontend should use only the public anon key, with RLS enabled.
