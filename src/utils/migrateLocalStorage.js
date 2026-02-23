/**
 * Migration script to migrate localStorage data to Supabase
 * 
 * This script should be run once to migrate existing localStorage data to Supabase.
 * Run this from the browser console or create a migration page.
 * 
 * Usage:
 * 1. Open browser console on the app
 * 2. Import and run: migrateLocalStorage()
 */

import { signUp, signIn } from '@/services/authService';
import { createPatient } from '@/services/patientService';
import { createAppointment } from '@/services/appointmentService';
import { addHistoryEntry } from '@/services/historyService';
import { saveDraft } from '@/services/draftService';
import { supabase } from '@/lib/supabase';

/**
 * Migrate users from localStorage to Supabase Auth
 */
async function migrateUsers() {
  try {
    const usersStr = localStorage.getItem('users');
    if (!usersStr) {
      console.log('No users found in localStorage');
      return { migrated: 0, errors: [] };
    }

    const users = JSON.parse(usersStr);
    const results = { migrated: 0, errors: [] };

    for (const user of users) {
      try {
        // Check if user already exists
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (existing) {
          console.log(`User ${user.email} already exists, skipping...`);
          continue;
        }

        // Create user with Supabase Auth
        const { user: authUser, error: signUpError } = await signUp(
          user.email,
          user.password,
          user.name,
          user.role
        );

        if (signUpError) {
          results.errors.push({ user: user.email, error: signUpError });
          console.error(`Error migrating user ${user.email}:`, signUpError);
        } else {
          results.migrated++;
          console.log(`Migrated user: ${user.email}`);
        }
      } catch (error) {
        results.errors.push({ user: user.email, error: error.message });
        console.error(`Error migrating user ${user.email}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error migrating users:', error);
    return { migrated: 0, errors: [{ error: error.message }] };
  }
}

/**
 * Migrate patients from localStorage to Supabase
 * Returns a mapping of old patient IDs to new UUIDs
 */
async function migratePatients() {
  try {
    const patientsStr = localStorage.getItem('patients');
    if (!patientsStr) {
      console.log('No patients found in localStorage');
      return { migrated: 0, errors: [], idMapping: {} };
    }

    const patients = JSON.parse(patientsStr);
    const results = { migrated: 0, errors: [], idMapping: {} };

    for (const patient of patients) {
      try {
        // Check if patient already exists (by name and email combination)
        const { data: existing } = await supabase
          .from('patients')
          .select('*')
          .eq('name', patient.name)
          .eq('email', patient.email || '')
          .single();

        if (existing) {
          console.log(`Patient ${patient.name} already exists, skipping...`);
          // Map old ID to existing UUID
          if (patient.id) {
            results.idMapping[patient.id] = existing.id;
          }
          // Still migrate history for existing patient
          if (patient.history && Object.keys(patient.history).length > 0) {
            await migratePatientHistory(existing.id, patient.history);
          }
          continue;
        }

        // Create patient
        const { patient: newPatient, error: createError } = await createPatient({
          name: patient.name,
          email: patient.email || null,
          phone: patient.phone || null,
          dob: patient.dob || null,
          doctorId: patient.doctorId || null,
        });

        if (createError) {
          results.errors.push({ patient: patient.name, error: createError });
          console.error(`Error migrating patient ${patient.name}:`, createError);
        } else {
          results.migrated++;
          console.log(`Migrated patient: ${patient.name}`);
          
          // Map old ID to new UUID
          if (patient.id) {
            results.idMapping[patient.id] = newPatient.id;
          }

          // Migrate patient history
          if (patient.history && Object.keys(patient.history).length > 0) {
            await migratePatientHistory(newPatient.id, patient.history);
          }
        }
      } catch (error) {
        results.errors.push({ patient: patient.name, error: error.message });
        console.error(`Error migrating patient ${patient.name}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error migrating patients:', error);
    return { migrated: 0, errors: [{ error: error.message }], idMapping: {} };
  }
}

/**
 * Migrate patient history from nested object to patient_history table
 */
async function migratePatientHistory(patientId, history) {
  try {
    let migrated = 0;
    for (const [feature, entries] of Object.entries(history)) {
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          try {
            await addHistoryEntry(patientId, feature, entry);
            migrated++;
          } catch (error) {
            console.error(`Error migrating history entry for ${feature}:`, error);
          }
        }
      }
    }
    console.log(`Migrated ${migrated} history entries for patient ${patientId}`);
    return migrated;
  } catch (error) {
    console.error('Error migrating patient history:', error);
    return 0;
  }
}

/**
 * Migrate appointments from localStorage to Supabase
 * Requires patient ID mapping from migratePatients
 */
async function migrateAppointments(patientIdMapping = {}) {
  try {
    const appointmentsStr = localStorage.getItem('appointments');
    if (!appointmentsStr) {
      console.log('No appointments found in localStorage');
      return { migrated: 0, errors: [] };
    }

    const appointments = JSON.parse(appointmentsStr);
    const results = { migrated: 0, errors: [] };

    for (const appointment of appointments) {
      try {
        // Map old patient ID to new UUID
        const newPatientId = patientIdMapping[appointment.patientId];
        if (!newPatientId) {
          console.warn(`No mapping found for patient ID ${appointment.patientId}, skipping appointment`);
          results.errors.push({ appointment: appointment.id, error: 'Patient ID not found in mapping' });
          continue;
        }

        // Check if appointment already exists
        const { data: existing } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', newPatientId)
          .eq('date', appointment.date)
          .eq('time', appointment.time)
          .single();

        if (existing) {
          console.log(`Appointment already exists, skipping...`);
          continue;
        }

        // Map doctor ID if it exists
        let newDoctorId = null;
        if (appointment.doctorId) {
          // Try to find doctor by ID (assuming doctor IDs are also mapped)
          // For now, we'll use the doctorId as-is if it's a UUID, otherwise skip
          newDoctorId = appointment.doctorId;
        }

        const { appointment: newAppointment, error: createError } = await createAppointment({
          patientId: newPatientId,
          doctorId: newDoctorId,
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
        });

        if (createError) {
          results.errors.push({ appointment: appointment.id, error: createError });
          console.error(`Error migrating appointment:`, createError);
        } else {
          results.migrated++;
          console.log(`Migrated appointment`);
        }
      } catch (error) {
        results.errors.push({ appointment: appointment.id, error: error.message });
        console.error(`Error migrating appointment:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error migrating appointments:', error);
    return { migrated: 0, errors: [{ error: error.message }] };
  }
}

/**
 * Migrate form drafts from localStorage to Supabase
 */
async function migrateDrafts() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('User not authenticated, cannot migrate drafts');
      return { migrated: 0, errors: [] };
    }

    const results = { migrated: 0, errors: [] };
    const draftKeys = [];

    // Collect all localStorage keys that look like drafts
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('-description') ||
        key.includes('-diseases') ||
        key.includes('-results') ||
        key.includes('-summary') ||
        key.includes('-response') ||
        key.includes('-questions')
      )) {
        draftKeys.push(key);
      }
    }

    for (const key of draftKeys) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;

        // Parse patient ID from key if present (format: patient-{id}-{draft-key})
        let patientId = null;
        let draftKey = key;
        
        const patientMatch = key.match(/^patient-([^-]+)-(.+)$/);
        if (patientMatch) {
          patientId = patientMatch[1];
          draftKey = patientMatch[2];
        }

        // Parse value (could be JSON or string)
        let data;
        try {
          data = JSON.parse(value);
        } catch {
          data = value;
        }

        await saveDraft(draftKey, data, patientId || null);
        results.migrated++;
        console.log(`Migrated draft: ${key}`);
      } catch (error) {
        results.errors.push({ draft: key, error: error.message });
        console.error(`Error migrating draft ${key}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error migrating drafts:', error);
    return { migrated: 0, errors: [{ error: error.message }] };
  }
}

/**
 * Main migration function
 */
export async function migrateLocalStorage() {
  console.log('Starting localStorage to Supabase migration...');
  console.log('==========================================');

  const results = {
    users: { migrated: 0, errors: [] },
    patients: { migrated: 0, errors: [] },
    appointments: { migrated: 0, errors: [] },
    drafts: { migrated: 0, errors: [] },
  };

  try {
    // Migrate users first (required for other migrations)
    console.log('\n1. Migrating users...');
    results.users = await migrateUsers();

    // Migrate patients (get ID mapping for appointments)
    console.log('\n2. Migrating patients...');
    results.patients = await migratePatients();
    const patientIdMapping = results.patients.idMapping || {};

    // Migrate appointments (use patient ID mapping)
    console.log('\n3. Migrating appointments...');
    results.appointments = await migrateAppointments(patientIdMapping);

    // Migrate drafts (requires authentication)
    console.log('\n4. Migrating drafts...');
    results.drafts = await migrateDrafts();

    console.log('\n==========================================');
    console.log('Migration Summary:');
    console.log(`Users: ${results.users.migrated} migrated, ${results.users.errors.length} errors`);
    console.log(`Patients: ${results.patients.migrated} migrated, ${results.patients.errors.length} errors`);
    console.log(`Appointments: ${results.appointments.migrated} migrated, ${results.appointments.errors.length} errors`);
    console.log(`Drafts: ${results.drafts.migrated} migrated, ${results.drafts.errors.length} errors`);
    console.log('==========================================');

    if (results.users.errors.length > 0 || 
        results.patients.errors.length > 0 || 
        results.appointments.errors.length > 0 || 
        results.drafts.errors.length > 0) {
      console.warn('Some errors occurred during migration. Check the errors above.');
    } else {
      console.log('Migration completed successfully!');
    }

    return results;
  } catch (error) {
    console.error('Migration failed:', error);
    return results;
  }
}

/**
 * Helper function to check migration status
 */
export async function checkMigrationStatus() {
  const status = {
    hasLocalStorageData: false,
    localStorageItems: [],
    supabaseUsers: 0,
    supabasePatients: 0,
    supabaseAppointments: 0,
  };

  // Check localStorage
  const users = localStorage.getItem('users');
  const patients = localStorage.getItem('patients');
  const appointments = localStorage.getItem('appointments');

  if (users || patients || appointments) {
    status.hasLocalStorageData = true;
    if (users) status.localStorageItems.push('users');
    if (patients) status.localStorageItems.push('patients');
    if (appointments) status.localStorageItems.push('appointments');
  }

  // Check Supabase
  try {
    const { count: usersCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    status.supabaseUsers = usersCount || 0;

    const { count: patientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    status.supabasePatients = patientsCount || 0;

    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });
    status.supabaseAppointments = appointmentsCount || 0;
  } catch (error) {
    console.error('Error checking Supabase status:', error);
  }

  return status;
}
