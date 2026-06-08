# Dev Task Management System

## Quick Start (Development)
```bash
npm install
npm start
```
Opens at http://localhost:3000

## Build for Production
```bash
npm run build
```
Then deploy the `build/` folder to any static host (Netlify, Vercel, GitHub Pages, Nginx).

## Supabase setup (production)

1. Create a Supabase project and note the project URL and anon key.
2. Run the SQL in `supabase.sql` (SQL Editor) to create the `tasks` table and RLS policy.
3. In your project, copy `.env.example` to `.env.local` and replace the placeholder values with your actual Supabase project settings.

```bash
REACT_APP_SUPABASE_URL=https://<your-project-ref>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-anon-public-api-key>
```

4. In production builds ensure the environment variables are provided at build time (Netlify/Vercel provide ways to set them).

Notes:
- The app requires `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` at build time for production; the app will throw if they are missing.
- The `tasks` table uses UUID primary keys and `user_id` matches Supabase auth user IDs.

## Run Built Version Locally
```bash
npm install -g serve
serve -s build
```

## Features
- Add / Edit / Delete tasks
- Fields: No, Task Name, Description, Category, Priority, Status, Assignee, Start Date, Due Date, Completed Date, Remark, Attachments
- Filter by Status / Priority / Category
- Search across all fields
- Sort by any column
- Table view & Card (Grid) view
- Overdue highlighting
- Export to Excel (.xlsx)
- Drag & drop file attachments

## Tech Stack
- React 18
- lucide-react (icons)
- xlsx (Excel export)
