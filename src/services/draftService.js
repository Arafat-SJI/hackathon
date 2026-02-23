import { supabase } from '@/lib/supabase';

/**
 * Save a form draft
 */
export async function saveDraft(draftKey, data, patientId = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if draft already exists
    const { data: existing } = await supabase
      .from('form_drafts')
      .select('id')
      .eq('user_id', user.id)
      .eq('draft_key', draftKey)
      .eq('patient_id', patientId || null)
      .single();

    if (existing) {
      // Update existing draft
      const { data: updated, error } = await supabase
        .from('form_drafts')
        .update({ data })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { draft: updated, error: null };
    } else {
      // Create new draft
      const { data: created, error } = await supabase
        .from('form_drafts')
        .insert({
          user_id: user.id,
          patient_id: patientId || null,
          draft_key: draftKey,
          data,
        })
        .select()
        .single();

      if (error) throw error;
      return { draft: created, error: null };
    }
  } catch (error) {
    console.error('Save draft error:', error);
    return { draft: null, error: error.message };
  }
}

/**
 * Get a form draft
 */
export async function getDraft(draftKey, patientId = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { draft: null, error: null };

    const { data, error } = await supabase
      .from('form_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('draft_key', draftKey)
      .eq('patient_id', patientId || null)
      .single();

    if (error) {
      // Not found is not an error
      if (error.code === 'PGRST116') {
        return { draft: null, error: null };
      }
      throw error;
    }

    return { draft: data, error: null };
  } catch (error) {
    console.error('Get draft error:', error);
    return { draft: null, error: error.message };
  }
}

/**
 * Delete a form draft
 */
export async function deleteDraft(draftKey, patientId = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('form_drafts')
      .delete()
      .eq('user_id', user.id)
      .eq('draft_key', draftKey)
      .eq('patient_id', patientId || null);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete draft error:', error);
    return { error: error.message };
  }
}

/**
 * Get all drafts for the current user
 */
export async function getAllDrafts(patientId = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { drafts: [], error: null };

    let query = supabase
      .from('form_drafts')
      .select('*')
      .eq('user_id', user.id);

    if (patientId !== null) {
      query = query.eq('patient_id', patientId);
    } else {
      query = query.is('patient_id', null);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return { drafts: data || [], error: null };
  } catch (error) {
    console.error('Get all drafts error:', error);
    return { drafts: [], error: error.message };
  }
}
