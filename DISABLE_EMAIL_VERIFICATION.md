# How to Disable Email Verification in Supabase

## Step 1: Disable Email Confirmation in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings** (or **Auth** → **Settings**)
3. Scroll down to **Email Auth** section
4. Find **"Enable email confirmations"** toggle
5. **Turn OFF** the toggle (disable it)
6. Click **Save** if there's a save button

This will allow users to sign up without email verification.

## Step 2: Verify the Code (Already Done)

The code in `src/services/authService.js` is already set up correctly. The `signUp` function will work without email verification once you disable it in the dashboard.

## Alternative: Using Supabase Client Options

If you want to ensure email confirmation is disabled programmatically, you can also check the Supabase client configuration, but the dashboard setting is the primary way to control this.

## Testing

After disabling email confirmation:
1. Try signing up with a new account
2. You should be able to log in immediately without checking email
3. No confirmation email will be sent

## Note

- Existing users who haven't confirmed their email will still need to confirm (or you can manually confirm them in the Supabase dashboard)
- New signups after disabling will work immediately without verification
