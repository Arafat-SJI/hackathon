-- Fix infinite recursion in RLS policies
-- The issue: Patient policies check user_profiles, which triggers user_profiles RLS, causing recursion
-- Solution: Create a security definer function to check user role without triggering RLS

-- Create a function to get user role (security definer bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN user_role;
END;
$$;

-- Drop existing patient policies
DROP POLICY IF EXISTS "Doctors can view all patients" ON patients;
DROP POLICY IF EXISTS "Receptionists can view all patients" ON patients;
DROP POLICY IF EXISTS "Doctors can insert patients" ON patients;
DROP POLICY IF EXISTS "Receptionists can insert patients" ON patients;
DROP POLICY IF EXISTS "Doctors can update patients" ON patients;
DROP POLICY IF EXISTS "Receptionists can update patients" ON patients;
DROP POLICY IF EXISTS "Doctors can delete patients" ON patients;
DROP POLICY IF EXISTS "Receptionists can delete patients" ON patients;

-- Recreate patient policies using the function (avoids recursion)
CREATE POLICY "Doctors can view all patients"
  ON patients FOR SELECT
  USING (get_user_role(auth.uid()) = 'doctor');

CREATE POLICY "Receptionists can view all patients"
  ON patients FOR SELECT
  USING (get_user_role(auth.uid()) = 'receptionist');

CREATE POLICY "Doctors can insert patients"
  ON patients FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'doctor');

CREATE POLICY "Receptionists can insert patients"
  ON patients FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'receptionist');

CREATE POLICY "Doctors can update patients"
  ON patients FOR UPDATE
  USING (get_user_role(auth.uid()) = 'doctor');

CREATE POLICY "Receptionists can update patients"
  ON patients FOR UPDATE
  USING (get_user_role(auth.uid()) = 'receptionist');

CREATE POLICY "Doctors can delete patients"
  ON patients FOR DELETE
  USING (get_user_role(auth.uid()) = 'doctor');

CREATE POLICY "Receptionists can delete patients"
  ON patients FOR DELETE
  USING (get_user_role(auth.uid()) = 'receptionist');

-- Also fix the "Doctors and receptionists can view all profiles" policy to avoid recursion
DROP POLICY IF EXISTS "Doctors and receptionists can view all profiles" ON user_profiles;

CREATE POLICY "Doctors and receptionists can view all profiles"
  ON user_profiles FOR SELECT
  USING (get_user_role(auth.uid()) IN ('doctor', 'receptionist'));

-- Fix appointments policies to avoid recursion
DROP POLICY IF EXISTS "Doctors can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Receptionists can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Receptionists can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Receptionists can update appointments" ON appointments;
DROP POLICY IF EXISTS "Receptionists can delete appointments" ON appointments;

CREATE POLICY "Doctors can view all appointments"
  ON appointments FOR SELECT
  USING (get_user_role(auth.uid()) = 'doctor');

CREATE POLICY "Receptionists can view all appointments"
  ON appointments FOR SELECT
  USING (get_user_role(auth.uid()) = 'receptionist');

CREATE POLICY "Receptionists can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'receptionist');

CREATE POLICY "Receptionists can update appointments"
  ON appointments FOR UPDATE
  USING (get_user_role(auth.uid()) = 'receptionist');

CREATE POLICY "Receptionists can delete appointments"
  ON appointments FOR DELETE
  USING (get_user_role(auth.uid()) = 'receptionist');

-- Fix patient_history policies to avoid recursion
DROP POLICY IF EXISTS "Doctors can view all patient history" ON patient_history;
DROP POLICY IF EXISTS "Doctors can insert patient history" ON patient_history;

CREATE POLICY "Doctors can view all patient history"
  ON patient_history FOR SELECT
  USING (get_user_role(auth.uid()) = 'doctor');

CREATE POLICY "Doctors can insert patient history"
  ON patient_history FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'doctor');
