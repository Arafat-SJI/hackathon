import { supabase } from '@/lib/supabase';

/**
 * Get all patients
 */
export async function getPatients() {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { patients: data || [], error: null };
  } catch (error) {
    console.error('Get patients error:', error);
    return { patients: [], error: error.message };
  }
}

/**
 * Get a single patient by ID
 */
export async function getPatientById(id) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { patient: data, error: null };
  } catch (error) {
    console.error('Get patient error:', error);
    return { patient: null, error: error.message };
  }
}

/**
 * Create a new patient
 */
export async function createPatient(patientData) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        name: patientData.name,
        email: patientData.email || null,
        phone: patientData.phone || null,
        dob: patientData.dob || null,
        doctor_id: patientData.doctorId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return { patient: data, error: null };
  } catch (error) {
    console.error('Create patient error:', error);
    return { patient: null, error: error.message };
  }
}

/**
 * Update a patient
 */
export async function updatePatient(id, patientData) {
  try {
    const updateData = {};
    if (patientData.name !== undefined) updateData.name = patientData.name;
    if (patientData.email !== undefined) updateData.email = patientData.email || null;
    if (patientData.phone !== undefined) updateData.phone = patientData.phone || null;
    if (patientData.dob !== undefined) updateData.dob = patientData.dob || null;
    if (patientData.doctorId !== undefined) updateData.doctor_id = patientData.doctorId || null;

    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { patient: data, error: null };
  } catch (error) {
    console.error('Update patient error:', error);
    return { patient: null, error: error.message };
  }
}

/**
 * Delete a patient
 */
export async function deletePatient(id) {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete patient error:', error);
    return { error: error.message };
  }
}
