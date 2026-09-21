# Dev Task Management System

## Quick Start (Development)
```bash
npm install
npm start
```
Opens at http://localhost:3000

## Deploy to the web

The app is a static React build. The simplest deployment options are Vercel or Netlify, both of which can deploy directly from a Git repository.

### Prepare Supabase

1. Create or open your Supabase project.
2. Run the SQL in `supabase.sql` in the Supabase SQL Editor. This also creates the `task-attachments` Storage bucket and its access policies.
3. In Supabase, open **Authentication > URL Configuration** and add your deployed site URL to **Site URL**. Add the same URL under **Redirect URLs** if email confirmation is enabled.

### Deploy with Vercel

1. Push this project to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new), import the repository, and keep the detected framework settings.
3. In **Project Settings > Environment Variables**, add these variables for **Production** (and Preview if needed):

```text
REACT_APP_SUPABASE_URL=https://<your-project-ref>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-anon-public-api-key>
```

4. Click **Deploy**. The included `vercel.json` configures the build output and React route fallback.

### Alternative: Netlify

1. Go to [app.netlify.com](https://app.netlify.com/), choose **Add new site > Import an existing project**, and select the repository.
2. Set **Build command** to `npm run build` and **Publish directory** to `build`.
3. Add the same two `REACT_APP_*` environment variables under **Site configuration > Environment variables**.
4. Deploy the site. The included `public/_redirects` file keeps client-side routes working on refresh.

### Local production check

```bash
npm run build
```

To preview the built site locally:

```bash
npx serve -s build
```

For other static hosts, deploy the generated `build/` folder and configure unknown routes to serve `index.html`.

## Supabase setup (production)

1. Create a Supabase project and note the project URL and anon key.
2. Run the SQL in `supabase.sql` (SQL Editor) to create the `tasks` table and RLS policy.
3. For local development, copy `.env.example` to `.env.local` and replace the placeholder values with your actual Supabase project settings.

```bash
REACT_APP_SUPABASE_URL=https://<your-project-ref>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-anon-public-api-key>
```

4. For production, provide the environment variables in the hosting provider's project settings before building. Do not commit `.env.local`.

New attachments are stored in Supabase Storage. Existing attachments created before this fix used temporary browser URLs and must be uploaded again.

For a step-by-step production troubleshooting process, see [SUPABASE_DEBUGGING_GUIDE.md](SUPABASE_DEBUGGING_GUIDE.md).

Notes:
- The app requires `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` at build time for production; the app will throw if they are missing.
- The `tasks` table uses UUID primary keys and `user_id` matches Supabase auth user IDs.

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
