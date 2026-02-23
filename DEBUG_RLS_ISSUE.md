# Debugging RLS Profile Fetch Error

## Issue
Getting empty error object `{}` when trying to fetch user profile after signup/login.

## Possible Causes

1. **RLS Policy Issue**: The session might not be fully established when querying
2. **Timing Issue**: Querying too quickly after signup/signin
3. **Session Not Set**: The auth session might not be properly set in Supabase client

## Solutions Applied

1. Added session check before querying profile
2. Added small delay after signin to ensure session is ready
3. Improved error logging to see actual error details
4. Added fallback to query profile directly if getCurrentUser fails

## If Issue Persists

### Check RLS Policies in Supabase

Run this SQL to verify the policies exist:

```sql
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

You should see:
- "Users can insert own profile" (INSERT)
- "Users can view own profile" (SELECT)
- "Users can update own profile" (UPDATE)

### Verify Session

Check in browser console:
```javascript
// In browser console after login
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

### Test RLS Policy Directly

In Supabase SQL Editor, test if you can query your own profile:
```sql
-- This should work if you're logged in
SELECT * FROM user_profiles WHERE id = auth.uid();
```

### Manual Fix

If RLS is blocking, you can temporarily disable it for testing (NOT recommended for production):

```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

Then re-enable and fix policies:
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```
