-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Doctors and receptionists can view all profiles (for user management)
CREATE POLICY "Doctors and receptionists can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('doctor', 'receptionist')
    )
  );

-- Patients Policies
-- Doctors can view all patients
CREATE POLICY "Doctors can view all patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Receptionists can view all patients
CREATE POLICY "Receptionists can view all patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Doctors can insert patients
CREATE POLICY "Doctors can insert patients"
  ON patients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Receptionists can insert patients
CREATE POLICY "Receptionists can insert patients"
  ON patients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Doctors can update patients
CREATE POLICY "Doctors can update patients"
  ON patients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Receptionists can update patients
CREATE POLICY "Receptionists can update patients"
  ON patients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Doctors can delete patients
CREATE POLICY "Doctors can delete patients"
  ON patients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Receptionists can delete patients
CREATE POLICY "Receptionists can delete patients"
  ON patients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Appointments Policies
-- Doctors can view all appointments
CREATE POLICY "Doctors can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Receptionists can view all appointments
CREATE POLICY "Receptionists can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Receptionists can insert appointments
CREATE POLICY "Receptionists can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Receptionists can update appointments
CREATE POLICY "Receptionists can update appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Receptionists can delete appointments
CREATE POLICY "Receptionists can delete appointments"
  ON appointments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Patient History Policies
-- Doctors can view all patient history
CREATE POLICY "Doctors can view all patient history"
  ON patient_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Doctors can insert patient history
CREATE POLICY "Doctors can insert patient history"
  ON patient_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );

-- Form Drafts Policies
-- Users can view their own drafts
CREATE POLICY "Users can view own drafts"
  ON form_drafts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own drafts
CREATE POLICY "Users can insert own drafts"
  ON form_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts"
  ON form_drafts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts"
  ON form_drafts FOR DELETE
  USING (auth.uid() = user_id);
