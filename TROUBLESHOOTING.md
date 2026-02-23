# Troubleshooting Guide

## 500 Error on Routes

If you're getting a 500 error (especially during compile/render), follow these steps:

### 1. Check Environment Variables

Make sure you have a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: 
- The file must be named `.env.local` (not `.env`)
- Restart your dev server after adding/changing environment variables
- Environment variables are only loaded when the server starts

### 2. Restart Dev Server

After adding environment variables, you MUST restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Verify Environment Variables Are Loaded

Check the browser console or terminal for warnings. If you see:
```
⚠️ Missing Supabase environment variables...
```

This means the variables aren't being loaded. Check:
- File is named `.env.local` (not `.env`)
- File is in the root directory (same level as `package.json`)
- No typos in variable names
- Values don't have extra quotes or spaces

### 4. Check Supabase Connection

Verify your Supabase credentials:
1. Go to your Supabase dashboard
2. Settings > API
3. Copy the exact URL and anon key
4. Make sure there are no extra spaces or characters

### 5. Verify Database Migrations

Make sure you've run both SQL migration files:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

Check in Supabase dashboard > Table Editor to see if tables exist.

### 6. Check Browser Console

Open browser DevTools (F12) and check:
- Console tab for error messages
- Network tab to see if API calls are failing
- Look for specific error messages about Supabase

### 7. Common Error Messages

**"Supabase client not initialized"**
- Environment variables not set or not loaded
- Restart dev server

**"relation does not exist"**
- Database migrations not run
- Run the SQL files in Supabase SQL Editor

**"new row violates row-level security policy"**
- RLS policies not set up correctly
- Run `002_rls_policies.sql` migration
- Make sure you're logged in with correct role

**"Invalid API key"**
- Wrong anon key
- Check Supabase dashboard for correct key

### 8. Still Having Issues?

1. Clear browser cache and localStorage
2. Check terminal/console for full error stack trace
3. Verify you're using the correct Supabase project
4. Make sure your Supabase project is active (not paused)
