"use client";

import React, { useState, useEffect } from 'react';
import NavHeader from "@/components/common/NavHeader/NavHeader";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { getPatients, createPatient, updatePatient, deletePatient } from '@/services/patientService';
import { getAppointments, createAppointment } from '@/services/appointmentService';
import { addHistoryEntry } from '@/services/historyService';
import { saveDraft } from '@/services/draftService';
import { signUp, updateUserProfile } from '@/services/authService';
import { supabase } from '@/lib/supabase';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', dob: '', doctorId: '' });
  const [editingPatient, setEditingPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ patientId: '', date: '', time: '', reason: '', doctorId: '' });
  const [doctors, setDoctors] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [newReceptionist, setNewReceptionist] = useState({ name: '', email: '', password: '' });
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [selectedPatientForSummary, setSelectedPatientForSummary] = useState(null);
  const [summaryDescription, setSummaryDescription] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sendingReportForPatientId, setSendingReportForPatientId] = useState(null);
  const [sendingWhatsappForPatientId, setSendingWhatsappForPatientId] = useState(null);
  const { currentUser, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'receptionist') {
      router.push('/analyze-disease');
    }
  }, [currentUser, router]);

  useEffect(() => {
    const loadData = async () => {
      // Load patients
      const { patients: patientsData, error: patientsError } = await getPatients();
      if (!patientsError && patientsData) {
        const transformedPatients = patientsData.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          dob: p.dob,
          doctorId: p.doctor_id,
          history: {}, // History is now in separate table
        }));
        setPatients(transformedPatients);
      }

      // Load doctors and receptionists from user_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (!profilesError && profiles) {
        const doctorList = profiles.filter(p => p.role === 'doctor').map(p => ({
          id: p.id,
          name: p.name,
          email: '', // Email is in auth.users, not in profile
          role: p.role,
        }));
        const receptionistList = profiles.filter(p => p.role === 'receptionist').map(p => ({
          id: p.id,
          name: p.name,
          email: '',
          role: p.role,
        }));
        setDoctors(doctorList);
        setReceptionists(receptionistList);
      }

      // Load appointments
      const { appointments: appointmentsData, error: appointmentsError } = await getAppointments();
      if (!appointmentsError && appointmentsData) {
        const transformedAppointments = appointmentsData.map(a => ({
          id: a.id,
          patientId: a.patient_id,
          doctorId: a.doctor_id,
          date: a.date,
          time: a.time,
          reason: a.reason,
        }));
        setAppointments(transformedAppointments);
      }
    };

    loadData();
  }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    const { patient, error } = await createPatient(newPatient);
    if (error) {
      alert(`Error creating patient: ${error}`);
      return;
    }
    if (patient) {
      const transformedPatient = {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        doctorId: patient.doctor_id,
        history: {},
      };
      setPatients([...patients, transformedPatient]);
      setNewPatient({ name: '', email: '', phone: '', dob: '', doctorId: '' });
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient({ name: patient.name, email: patient.email, phone: patient.phone, dob: patient.dob, doctorId: patient.doctorId || '' });
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    const { patient, error } = await updatePatient(editingPatient.id, newPatient);
    if (error) {
      alert(`Error updating patient: ${error}`);
      return;
    }
    if (patient) {
      const transformedPatient = {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        doctorId: patient.doctor_id,
        history: {},
      };
      setPatients(patients.map(p => p.id === patient.id ? transformedPatient : p));
      setEditingPatient(null);
      setNewPatient({ name: '', email: '', phone: '', dob: '', doctorId: '' });
    }
  };

  const handleDeletePatient = async (id) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    const { error } = await deletePatient(id);
    if (error) {
      alert(`Error deleting patient: ${error}`);
      return;
    }
    setPatients(patients.filter(p => p.id !== id));
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    const { appointment, error } = await createAppointment({
      patientId: newAppointment.patientId,
      doctorId: newAppointment.doctorId || null,
      date: newAppointment.date,
      time: newAppointment.time,
      reason: newAppointment.reason,
    });
    if (error) {
      alert(`Error creating appointment: ${error}`);
      return;
    }
    if (appointment) {
      const transformedAppointment = {
        id: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
      };
      setAppointments([...appointments, transformedAppointment]);
      setNewAppointment({ patientId: '', date: '', time: '', reason: '', doctorId: '' });
    }
  };

  const handleAddReceptionist = async (e) => {
    e.preventDefault();
    const { user, error } = await signUp(
      newReceptionist.email,
      newReceptionist.password,
      newReceptionist.name,
      'receptionist'
    );
    if (error) {
      alert(`Error creating receptionist: ${error}`);
      return;
    }
    if (user) {
      const newReceptionistData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      setReceptionists([...receptionists, newReceptionistData]);
      setNewReceptionist({ name: '', email: '', password: '' });
    }
  };

  const handleEditReceptionist = (receptionist) => {
    setEditingReceptionist(receptionist);
    setNewReceptionist({ name: receptionist.name, email: receptionist.email, password: '' });
  };

  const handleUpdateReceptionist = async (e) => {
    e.preventDefault();
    const updateData = { name: newReceptionist.name };
    if (newReceptionist.password) {
      // Note: Password update would need to be handled via Supabase Auth
      // For now, we'll just update the profile
      alert('Password updates are not yet supported. Please use Supabase dashboard.');
    }
    const { profile, error } = await updateUserProfile(updateData);
    if (error) {
      alert(`Error updating receptionist: ${error}`);
      return;
    }
    if (profile) {
      const updatedReceptionist = {
        id: editingReceptionist.id,
        name: profile.name,
        email: editingReceptionist.email,
        role: 'receptionist',
      };
      setReceptionists(receptionists.map(r => r.id === editingReceptionist.id ? updatedReceptionist : r));
      setEditingReceptionist(null);
      setNewReceptionist({ name: '', email: '', password: '' });
    }
  };

  const handleDeleteReceptionist = async (id) => {
    if (!confirm('Are you sure you want to delete this receptionist?')) return;
    
    // Note: User deletion should be done via Supabase Admin API
    // For now, we'll just remove from the list (actual deletion requires admin access)
    alert('User deletion requires admin access. Please use Supabase dashboard to delete users.');
    // setReceptionists(receptionists.filter(r => r.id !== id));
  };

  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    if (!selectedPatientForSummary) {
      alert('Please select a patient');
      return;
    }
    setSummaryLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: summaryDescription,
          myuuid: "550e8400-e29b-41d4-a716-446655440000",
          lang: "en",
          timezone: "America/New_York",
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.result === "success") {
        setGeneratedSummary(data.data.summary);
        
        // Save to patient's history
        await addHistoryEntry(selectedPatientForSummary.id, 'generate-medical-summary', {
          timestamp: new Date().toISOString(),
          description: summaryDescription,
          summary: data.data.summary
        });

        // Save drafts for the doctor's page
        await saveDraft('create-summary-description', summaryDescription, selectedPatientForSummary.id);
        await saveDraft('create-summary-summary', data.data.summary, selectedPatientForSummary.id);
      } else {
        alert("Failed to summarize.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSendReport = async (patient) => {
    if (!patient?.email) {
      alert('This patient does not have an email address.');
      return;
    }

    try {
      setSendingReportForPatientId(patient.id);

      const response = await fetch('/api/send-patient-report-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId: patient.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send patient report.');
      }

      alert('Patient report has been emailed successfully.');
    } catch (error) {
      console.error('Failed to send patient report:', error);
      alert(error.message || 'Failed to send patient report.');
    } finally {
      setSendingReportForPatientId(null);
    }
  };

  const handleSendReportWhatsapp = async (patient) => {
    if (!patient?.phone) {
      alert('This patient does not have a phone number.');
      return;
    }

    try {
      setSendingWhatsappForPatientId(patient.id);

      const response = await fetch('/api/send-patient-report-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId: patient.id, channel: 'whatsapp' }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send patient report via WhatsApp.');
      }

      alert('Patient report has been sent via WhatsApp successfully.');
    } catch (error) {
      console.error('Failed to send patient report via WhatsApp:', error);
      alert(error.message || 'Failed to send patient report via WhatsApp.');
    } finally {
      setSendingWhatsappForPatientId(null);
    }
  };

  return (
    <div className="px-10 mx-auto">
      <NavHeader title="Patient Management" icon="/images/icons/wired-flat-37-approve-checked-simple-hover-pinch.gif" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Add/Edit Patient */}
        <div className="bg-white p-6 rounded-lg shadow-design border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded"></span>
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </h3>
          <form onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              value={newPatient.name}
              onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              value={newPatient.email}
              onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              value={newPatient.dob}
              onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})}
              required
            />
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
              value={newPatient.doctorId}
              onChange={(e) => setNewPatient({...newPatient, doctorId: e.target.value})}
            >
              <option value="">Select Primary Doctor (Optional)</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 text-white py-3 px-4 rounded-md hover:from-cyan-800 hover:via-cyan-700 hover:to-cyan-600 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {editingPatient ? 'Update Patient' : 'Add Patient'}
            </button>
            {editingPatient && (
              <button
                type="button"
                onClick={() => {
                  setEditingPatient(null);
                  setNewPatient({ name: '', email: '', phone: '', dob: '', doctorId: '' });
                }}
                className="w-full bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 font-semibold transition-all duration-200 shadow-md hover:shadow-lg mt-2"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Add Appointment */}
        <div className="bg-white p-6 rounded-lg shadow-design border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded"></span>
            Schedule Appointment
          </h3>
          <form onSubmit={handleAddAppointment} className="space-y-4">
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
              value={newAppointment.patientId}
              onChange={(e) => setNewAppointment({...newAppointment, patientId: e.target.value})}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
            <input
              type="date"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
              required
            />
            <input
              type="time"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
              required
            />
            <textarea
              placeholder="Reason for appointment"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
              rows={3}
              value={newAppointment.reason}
              onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
              required
            />
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
              value={newAppointment.doctorId}
              onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 text-white py-3 px-4 rounded-md hover:from-cyan-800 hover:via-cyan-700 hover:to-cyan-600 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Schedule Appointment
            </button>
          </form>
        </div>

        {/* Generate Medical Summary */}
        <div className="bg-white p-6 rounded-lg shadow-design border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded"></span>
            Generate Medical Summary
          </h3>
          <form onSubmit={handleGenerateSummary} className="space-y-4">
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
              value={selectedPatientForSummary?.id || ''}
              onChange={(e) => {
                const patient = patients.find(p => p.id === e.target.value);
                setSelectedPatientForSummary(patient || null);
              }}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
            <textarea
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
              rows={4}
              placeholder="Enter patient description..."
              value={summaryDescription}
              onChange={(e) => setSummaryDescription(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={summaryLoading}
              className="w-full bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 text-white py-3 px-4 rounded-md hover:from-cyan-800 hover:via-cyan-700 hover:to-cyan-600 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {summaryLoading ? 'Generating...' : 'Generate Summary'}
            </button>
          </form>
          {generatedSummary && (
            <div className="mt-4 p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design">
              <h4 className="font-bold mb-2 text-gray-800">Generated Summary:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Patients List */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-design border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded"></span>
          Patients
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-50 to-blue-50">
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">DOB</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Primary Doctor</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => {
                const doctor = doctors.find(d => d.id === patient.doctorId);
                return (
                  <tr key={patient.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition-colors`}>
                    <td className="px-6 py-4 font-medium text-gray-800">{patient.name}</td>
                    <td className="px-6 py-4 text-gray-600">{patient.email}</td>
                    <td className="px-6 py-4 text-gray-600">{patient.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{patient.dob}</td>
                    <td className="px-6 py-4 text-gray-600">{doctor ? doctor.name : <span className="text-gray-400 italic">Not Assigned</span>}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSendReport(patient)}
                          disabled={!patient.email || sendingReportForPatientId === patient.id}
                          className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-md font-medium transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 ${
                            !patient.email || sendingReportForPatientId === patient.id
                              ? 'opacity-50 cursor-not-allowed hover:scale-100'
                              : 'hover:from-green-600 hover:to-green-700 hover:scale-105'
                          }`}
                        >
                          {sendingReportForPatientId === patient.id ? 'Sending...' : 'Send Report'}
                        </button>
                        <button
                          onClick={() => handleSendReportWhatsapp(patient)}
                          disabled={!patient.phone || sendingWhatsappForPatientId === patient.id}
                          className={`bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-md font-medium transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 ${
                            !patient.phone || sendingWhatsappForPatientId === patient.id
                              ? 'opacity-50 cursor-not-allowed hover:scale-100'
                              : 'hover:from-emerald-600 hover:to-emerald-700 hover:scale-105'
                          }`}
                        >
                          {sendingWhatsappForPatientId === patient.id ? 'Sending...' : 'Send WhatsApp'}
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-red-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointments List */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-design border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded"></span>
          Appointments
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-50 to-blue-50">
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Time</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Doctor</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => {
                const patient = patients.find(p => p.id === appointment.patientId);
                const doctor = doctors.find(d => d.id === appointment.doctorId);
                return (
                  <tr key={appointment.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition-colors`}>
                    <td className="px-6 py-4 font-medium text-gray-800">{patient?.name || <span className="text-gray-400 italic">Unknown</span>}</td>
                    <td className="px-6 py-4 text-gray-600">{appointment.date}</td>
                    <td className="px-6 py-4 text-gray-600">{appointment.time}</td>
                    <td className="px-6 py-4 text-gray-600">{doctor?.name || <span className="text-gray-400 italic">Unknown</span>}</td>
                    <td className="px-6 py-4 text-gray-600">{appointment.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receptionist Management */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-design border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded"></span>
            Receptionist Management
          </h3>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-md hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            Logout
          </button>
        </div>
        
        {/* Add/Edit Receptionist Form */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-bold mb-4 text-gray-800">
            {editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
          </h4>
          <form onSubmit={editingReceptionist ? handleUpdateReceptionist : handleAddReceptionist} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
              value={newReceptionist.name}
              onChange={(e) => setNewReceptionist({...newReceptionist, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
              value={newReceptionist.email}
              onChange={(e) => setNewReceptionist({...newReceptionist, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
              value={newReceptionist.password}
              onChange={(e) => setNewReceptionist({...newReceptionist, password: e.target.value})}
              required={!editingReceptionist}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 text-white py-3 px-4 rounded-md hover:from-cyan-800 hover:via-cyan-700 hover:to-cyan-600 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] md:col-span-3"
            >
              {editingReceptionist ? 'Update Receptionist' : 'Add Receptionist'}
            </button>
            {editingReceptionist && (
              <button
                type="button"
                onClick={() => {
                  setEditingReceptionist(null);
                  setNewReceptionist({ name: '', email: '', password: '' });
                }}
                className="bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 font-semibold transition-all duration-200 shadow-md hover:shadow-lg md:col-span-3"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Receptionists Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-50 to-blue-50">
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receptionists.map((receptionist, index) => (
                <tr key={receptionist.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition-colors`}>
                  <td className="px-6 py-4 font-medium text-gray-800">{receptionist.name}</td>
                  <td className="px-6 py-4 text-gray-600">{receptionist.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReceptionist(receptionist)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReceptionist(receptionist.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-red-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
