-- Fix RLS policy for user_profiles SELECT
-- This ensures users can read their own profile

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Recreate the policy
-- This policy allows users to view their own profile when auth.uid() matches the profile id
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
