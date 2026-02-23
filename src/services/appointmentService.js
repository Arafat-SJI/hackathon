import { supabase } from '@/lib/supabase';

/**
 * Get all appointments
 */
export async function getAppointments() {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return { appointments: data || [], error: null };
  } catch (error) {
    console.error('Get appointments error:', error);
    return { appointments: [], error: error.message };
  }
}

/**
 * Get appointments by patient ID
 */
export async function getAppointmentsByPatientId(patientId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return { appointments: data || [], error: null };
  } catch (error) {
    console.error('Get appointments by patient error:', error);
    return { appointments: [], error: error.message };
  }
}

/**
 * Get appointments by doctor ID
 */
export async function getAppointmentsByDoctorId(doctorId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return { appointments: data || [], error: null };
  } catch (error) {
    console.error('Get appointments by doctor error:', error);
    return { appointments: [], error: error.message };
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointmentData) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointmentData.patientId,
        doctor_id: appointmentData.doctorId || null,
        date: appointmentData.date,
        time: appointmentData.time,
        reason: appointmentData.reason,
      })
      .select()
      .single();

    if (error) throw error;
    return { appointment: data, error: null };
  } catch (error) {
    console.error('Create appointment error:', error);
    return { appointment: null, error: error.message };
  }
}

/**
 * Update an appointment
 */
export async function updateAppointment(id, appointmentData) {
  try {
    const updateData = {};
    if (appointmentData.patientId !== undefined) updateData.patient_id = appointmentData.patientId;
    if (appointmentData.doctorId !== undefined) updateData.doctor_id = appointmentData.doctorId || null;
    if (appointmentData.date !== undefined) updateData.date = appointmentData.date;
    if (appointmentData.time !== undefined) updateData.time = appointmentData.time;
    if (appointmentData.reason !== undefined) updateData.reason = appointmentData.reason;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { appointment: data, error: null };
  } catch (error) {
    console.error('Update appointment error:', error);
    return { appointment: null, error: error.message };
  }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id) {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete appointment error:', error);
    return { error: error.message };
  }
}
