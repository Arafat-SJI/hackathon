-- Fix: Add INSERT policy for user_profiles to allow users to create their own profile during signup
-- This fixes the "new row violates row-level security policy" error during signup/login

-- Drop existing policy if it exists (in case you need to re-run)
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create INSERT policy
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
