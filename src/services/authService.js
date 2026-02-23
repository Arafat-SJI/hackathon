import { supabase } from '@/lib/supabase';

/**
 * Sign up a new user with Supabase Auth and create their profile
 */
export async function signUp(email, password, name, role) {
  try {
    if (!supabase) {
      return { user: null, error: 'Supabase client not initialized. Please check your environment variables.' };
    }

    // Create auth user (email confirmation disabled in Supabase settings)
    // Explicitly disable all email sending
    // Store name and role in user metadata as fallback if profile fetch fails
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // No email redirect needed
        data: {
          skip_email_verification: true, // Skip email verification
          name: name, // Store in metadata as fallback
          role: role, // Store in metadata as fallback
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Note: authData.session might be null if email confirmation was required
    // But since we disabled it, session should be available
    // If session is null, we'll still proceed and the user can sign in

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        name,
        role,
      });

    if (profileError) {
      // Note: Admin API would be needed to delete user if profile creation fails
      // For now, log the error - user will need to be cleaned up manually if needed
      console.error('Profile creation failed, but auth user was created:', profileError);
      throw profileError;
    }

    // Wait a moment for session to be fully established after signup
    if (authData.session) {
      // Session is available, we can proceed
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Return user object directly from signup response (don't call getCurrentUser immediately)
    // The session might not be ready yet, so construct user from what we have
    const user = {
      id: authData.user.id,
      email: authData.user.email,
      name: name,
      role: role,
    };

    return { user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: error.message };
  }
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email, password) {
  try {
    if (!supabase) {
      return { user: null, error: 'Supabase client not initialized. Please check your environment variables.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Wait a moment for session to be fully established
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get user profile
    let user = await getCurrentUser();
    
    if (!user) {
      // If getCurrentUser fails, try to get user from session/auth directly
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Try to get profile directly (bypassing getCurrentUser)
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (profile) {
          // Profile found, use it
          user = {
            id: authUser.id,
            email: authUser.email,
            name: profile.name,
            role: profile.role,
          };
        } else {
          // Profile not found, try to use user metadata as fallback
          const userMetadata = authUser.user_metadata || {};
          
          if (userMetadata.name && userMetadata.role) {
            // Use metadata as fallback
            user = {
              id: authUser.id,
              email: authUser.email,
              name: userMetadata.name,
              role: userMetadata.role,
            };
          } else {
            // Last resort: try to get profile from database without RLS check
            // This shouldn't happen, but if it does, return error
            console.error('Failed to get user profile and no metadata available');
            console.error('Profile error:', profileError);
            return { 
              user: null, 
              error: 'Failed to fetch user profile. Please contact support or try signing up again.' 
            };
          }
        }
      } else {
        return { user: null, error: 'Failed to authenticate user' };
      }
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error.message };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
}

/**
 * Get the current authenticated user with profile
 */
export async function getCurrentUser() {
  try {
    if (!supabase) {
      return null;
    }

    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      // No active session - this is normal if user is not logged in
      return null;
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return null;
    }

    // Get user profile - use maybeSingle() instead of single() to avoid errors when no row found
    // maybeSingle() returns null instead of error when no rows match
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    // With maybeSingle(), if no row is found, profile will be null and error will be null
    // Only log errors if there's an actual error (not just "not found")
    if (profileError) {
      // Empty error object {} usually means RLS is blocking the query
      // Log only once to avoid spam
      if (Object.keys(profileError).length === 0) {
        // Empty error object - RLS is likely blocking
        // Only log once per session to avoid spam
        if (!getCurrentUser._rlsWarningLogged) {
          console.warn('RLS Policy may be blocking profile access. Empty error object returned.');
          console.warn('User ID:', authUser.id);
          console.warn('Please run migration: 004_fix_rls_user_profiles_select.sql in Supabase SQL Editor');
          getCurrentUser._rlsWarningLogged = true;
        }
      } else {
        // Real error with properties
        // console.error('Profile fetch error:', profileError);
      }
      return null;
    }

    if (!profile) {
      // Profile not found - try to get it from user metadata or return basic user info
      // This allows the app to work even if profile fetch fails due to RLS
      const userMetadata = authUser.user_metadata || {};
      
      // If we have name and role in metadata, use that
      if (userMetadata.name && userMetadata.role) {
        return {
          id: authUser.id,
          email: authUser.email,
          name: userMetadata.name,
          role: userMetadata.role,
        };
      }
      
      // Otherwise, return null - profile is required
      console.warn('Profile not found and no metadata available for user:', authUser.id);
      return null;
    }

    return {
      id: authUser.id,
      email: authUser.email,
      name: profile.name,
      role: profile.role,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { profile: updatedProfile, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { profile: null, error: error.message };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
