import { supabase } from '@/lib/supabase';

/**
 * Get all history for a patient
 */
export async function getPatientHistory(patientId) {
  try {
    if (!supabase) {
      return { history: {}, error: 'Supabase client not initialized. Please check your environment variables.' };
    }

    const { data, error } = await supabase
      .from('patient_history')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by feature to match the original structure
    const history = {};
    (data || []).forEach(entry => {
      if (!history[entry.feature]) {
        history[entry.feature] = [];
      }
      history[entry.feature].push(entry.data);
    });

    return { history, error: null };
  } catch (error) {
    console.error('Get patient history error:', error);
    return { history: {}, error: error.message };
  }
}

/**
 * Get history entries by feature type
 */
export async function getHistoryByFeature(patientId, feature) {
  try {
    const { data, error } = await supabase
      .from('patient_history')
      .select('*')
      .eq('patient_id', patientId)
      .eq('feature', feature)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const entries = (data || []).map(entry => entry.data);
    return { entries, error: null };
  } catch (error) {
    console.error('Get history by feature error:', error);
    return { entries: [], error: error.message };
  }
}

/**
 * Add a history entry for a patient
 */
export async function addHistoryEntry(patientId, feature, entryData) {
  try {
    // Ensure timestamp is included
    const dataWithTimestamp = {
      ...entryData,
      timestamp: entryData.timestamp || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('patient_history')
      .insert({
        patient_id: patientId,
        feature,
        data: dataWithTimestamp,
      })
      .select()
      .single();

    if (error) throw error;
    return { entry: data, error: null };
  } catch (error) {
    console.error('Add history entry error:', error);
    return { entry: null, error: error.message };
  }
}

/**
 * Delete a history entry
 */
export async function deleteHistoryEntry(entryId) {
  try {
    const { error } = await supabase
      .from('patient_history')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete history entry error:', error);
    return { error: error.message };
  }
}

/**
 * Delete all history for a patient
 */
export async function deletePatientHistory(patientId) {
  try {
    const { error } = await supabase
      .from('patient_history')
      .delete()
      .eq('patient_id', patientId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete patient history error:', error);
    return { error: error.message };
  }
}
