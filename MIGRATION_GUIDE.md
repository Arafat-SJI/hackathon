# localStorage to Supabase Migration Guide

This guide will help you migrate your existing localStorage data to Supabase.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at https://supabase.com
   - Get your project URL and anon key from Settings > API

2. **Environment Variables**
   - Create a `.env.local` file in the root directory
   - Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Database Migrations**
   - In your Supabase dashboard, go to SQL Editor
   - Run the migration files in order:
     1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
     2. `supabase/migrations/002_rls_policies.sql` - Sets up Row Level Security

## Migration Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` which is required for the migration.

### Step 2: Run Database Migrations

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute
5. Repeat for `supabase/migrations/002_rls_policies.sql`

### Step 3: Migrate Existing Data

You have two options:

#### Option A: Use Migration Script (Recommended)

1. Start your development server: `npm run dev`
2. Open your browser and navigate to your app
3. Open the browser console (F12)
4. Import and run the migration:

```javascript
// In browser console
import { migrateLocalStorage } from '/src/utils/migrateLocalStorage.js';
await migrateLocalStorage();
```

Or create a temporary migration page:

1. Create `src/app/migrate/page.jsx`:
```jsx
"use client";
import { migrateLocalStorage } from '@/utils/migrateLocalStorage';
import { useState } from 'react';

export default function MigratePage() {
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);

  const handleMigrate = async () => {
    setStatus('Migrating...');
    const results = await migrateLocalStorage();
    setResults(results);
    setStatus('Migration completed!');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Migration</h1>
      <button 
        onClick={handleMigrate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Migration
      </button>
      {status && <p className="mt-4">{status}</p>}
      {results && (
        <div className="mt-4">
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

2. Navigate to `/migrate` in your browser
3. Click "Start Migration"
4. Review the results

#### Option B: Manual Migration

If you prefer to migrate manually:

1. **Users**: Sign up each user again through the signup page
2. **Patients**: Add patients through the patient management page
3. **Appointments**: Recreate appointments through the patient management page
4. **History**: History will be created automatically as you use the features

### Step 4: Verify Migration

1. Check Supabase dashboard > Table Editor to verify data
2. Test login with migrated users
3. Verify patients, appointments, and history are accessible

### Step 5: Clean Up (Optional)

After verifying everything works:

1. You can clear localStorage (it's safe now, data is in Supabase)
2. Remove the migration page if you created one

## Important Notes

1. **User Passwords**: Users will need to use their original passwords when logging in. The migration creates new Supabase Auth users with the same passwords.

2. **Patient IDs**: Patient IDs will change from integers to UUIDs. The migration handles this automatically.

3. **History**: Patient history is normalized from nested objects to separate table entries.

4. **Form Drafts**: Drafts are now stored per-user and per-patient, allowing multi-device sync.

5. **Authentication**: The app now uses Supabase Auth, which is more secure than plain text passwords.

## Troubleshooting

### Migration Errors

- **"User already exists"**: This is normal if you've already migrated some users. The script skips existing users.
- **"Not authenticated"**: Make sure you're logged in before running the migration script.
- **RLS Policy Errors**: Ensure you've run the RLS policies migration file.

### Common Issues

1. **Environment Variables Not Set**
   - Make sure `.env.local` exists with correct values
   - Restart your dev server after adding environment variables

2. **Database Connection Errors**
   - Verify your Supabase URL and anon key are correct
   - Check that migrations have been run successfully

3. **RLS Policy Blocking Access**
   - Ensure you're logged in as a user with the correct role
   - Check that RLS policies are correctly set up

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all migrations have been run
3. Ensure environment variables are set correctly
4. Check Supabase dashboard for any database errors
