"use client";

import React, { useState, useEffect } from 'react';
import NavHeader from "@/components/common/NavHeader/NavHeader";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

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
  const { currentUser, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'receptionist') {
      router.push('/analyze-disease');
    }
  }, [currentUser, router]);

  useEffect(() => {
    // Load patients
    const storedPatients = localStorage.getItem('patients');
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    } else {
      // Initialize with sample patients if none exist
      const samplePatients = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', dob: '1980-01-01', doctorId: '', history: {} },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', dob: '1985-05-15', doctorId: '', history: {} },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '555-123-4567', dob: '1990-10-20', doctorId: '', history: {} },
      ];
      setPatients(samplePatients);
      localStorage.setItem('patients', JSON.stringify(samplePatients));
    }

    // Load doctors and receptionists
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const doctorList = users.filter(user => user.role === 'doctor');
      const receptionistList = users.filter(user => user.role === 'receptionist');
      setDoctors(doctorList);
      setReceptionists(receptionistList);
    }

    // Load appointments
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
  }, []);

  const handleAddPatient = (e) => {
    e.preventDefault();
    const patient = {
      id: Date.now(),
      ...newPatient,
      history: {}
    };
    const updatedPatients = [...patients, patient];
    setPatients(updatedPatients);
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    setNewPatient({ name: '', email: '', phone: '', dob: '' });
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient({ name: patient.name, email: patient.email, phone: patient.phone, dob: patient.dob, doctorId: patient.doctorId || '' });
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    const updatedPatients = patients.map(p =>
      p.id === editingPatient.id ? { ...p, ...newPatient } : p
    );
    setPatients(updatedPatients);
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    setEditingPatient(null);
    setNewPatient({ name: '', email: '', phone: '', dob: '' });
  };

  const handleDeletePatient = (id) => {
    const updatedPatients = patients.filter(p => p.id !== id);
    setPatients(updatedPatients);
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    const appointment = {
      id: Date.now(),
      ...newAppointment,
      patientId: parseInt(newAppointment.patientId)
    };
    const updatedAppointments = [...appointments, appointment];
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setNewAppointment({ patientId: '', date: '', time: '', reason: '', doctorId: '' });
  };

  const handleAddReceptionist = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === newReceptionist.email)) {
      alert('Email already exists');
      return;
    }

    const receptionist = {
      id: Date.now(),
      ...newReceptionist,
      role: 'receptionist'
    };
    users.push(receptionist);
    localStorage.setItem('users', JSON.stringify(users));
    setReceptionists([...receptionists, receptionist]);
    setNewReceptionist({ name: '', email: '', password: '' });
  };

  const handleEditReceptionist = (receptionist) => {
    setEditingReceptionist(receptionist);
    setNewReceptionist({ name: receptionist.name, email: receptionist.email, password: '' });
  };

  const handleUpdateReceptionist = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => 
      u.id === editingReceptionist.id ? { ...u, ...newReceptionist } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setReceptionists(updatedUsers.filter(u => u.role === 'receptionist'));
    setEditingReceptionist(null);
    setNewReceptionist({ name: '', email: '', password: '' });
  };

  const handleDeleteReceptionist = (id) => {
    if (confirm('Are you sure you want to delete this receptionist?')) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => u.id !== id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setReceptionists(updatedUsers.filter(u => u.role === 'receptionist'));
    }
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
        const patientsData = JSON.parse(localStorage.getItem('patients') || '[]');
        const patientIndex = patientsData.findIndex(p => p.id === selectedPatientForSummary.id);
        if (patientIndex !== -1) {
          if (!patientsData[patientIndex].history) {
            patientsData[patientIndex].history = {};
          }
          if (!patientsData[patientIndex].history['generate-medical-summary']) {
            patientsData[patientIndex].history['generate-medical-summary'] = [];
          }
          patientsData[patientIndex].history['generate-medical-summary'].push({
            timestamp: new Date().toISOString(),
            description: summaryDescription,
            summary: data.data.summary
          });
          localStorage.setItem('patients', JSON.stringify(patientsData));
        }
        // Also save to localStorage for the doctor's page
        localStorage.setItem(`patient-${selectedPatientForSummary.id}-create-summary-description`, summaryDescription);
        localStorage.setItem(`patient-${selectedPatientForSummary.id}-create-summary-summary`, data.data.summary);
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

  return (
    <div className="p-6">
      <NavHeader title="Patient Management" icon="/images/icons/wired-flat-37-approve-checked-simple-hover-pinch.gif" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add/Edit Patient */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </h3>
          <form onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={newPatient.name}
              onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={newPatient.email}
              onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={newPatient.dob}
              onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})}
              required
            />
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
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
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded hover:bg-cyan-700"
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
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mt-2"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Add Appointment */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Schedule Appointment</h3>
          <form onSubmit={handleAddAppointment} className="space-y-4">
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
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
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
              required
            />
            <input
              type="time"
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
              required
            />
            <textarea
              placeholder="Reason for appointment"
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={newAppointment.reason}
              onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
              required
            />
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
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
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded hover:bg-cyan-700"
            >
              Schedule Appointment
            </button>
          </form>
        </div>

        {/* Generate Medical Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Generate Medical Summary</h3>
          <form onSubmit={handleGenerateSummary} className="space-y-4">
            <select
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              value={selectedPatientForSummary?.id || ''}
              onChange={(e) => {
                const patient = patients.find(p => p.id === parseInt(e.target.value));
                setSelectedPatientForSummary(patient);
              }}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
            <textarea
              className="w-full p-3 border-2 border-cyan-600 rounded-md"
              rows={4}
              placeholder="Enter patient description..."
              value={summaryDescription}
              onChange={(e) => setSummaryDescription(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={summaryLoading}
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded hover:bg-cyan-700 disabled:opacity-50"
            >
              {summaryLoading ? 'Generating...' : 'Generate Summary'}
            </button>
          </form>
          {generatedSummary && (
            <div className="mt-4 p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg">
              <h4 className="font-semibold mb-2">Generated Summary:</h4>
              <p className="text-sm">{generatedSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Patients List */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Patients</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">DOB</th>
                <th className="px-4 py-2 text-left">Primary Doctor</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => {
                const doctor = doctors.find(d => d.id === patient.doctorId);
                return (
                  <tr key={patient.id} className="border-b">
                    <td className="px-4 py-2">{patient.name}</td>
                    <td className="px-4 py-2">{patient.email}</td>
                    <td className="px-4 py-2">{patient.phone}</td>
                    <td className="px-4 py-2">{patient.dob}</td>
                    <td className="px-4 py-2">{doctor ? doctor.name : 'Not Assigned'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointments List */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Appointments</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => {
                const patient = patients.find(p => p.id === appointment.patientId);
                const doctor = doctors.find(d => d.id === appointment.doctorId);
                return (
                  <tr key={appointment.id} className="border-b">
                    <td className="px-4 py-2">{patient?.name || 'Unknown'}</td>
                    <td className="px-4 py-2">{appointment.date}</td>
                    <td className="px-4 py-2">{appointment.time}</td>
                    <td className="px-4 py-2">{doctor?.name || 'Unknown'}</td>
                    <td className="px-4 py-2">{appointment.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receptionist Management */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Receptionist Management</h3>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        {/* Add/Edit Receptionist Form */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3">
            {editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
          </h4>
          <form onSubmit={editingReceptionist ? handleUpdateReceptionist : handleAddReceptionist} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="p-3 border-2 border-cyan-600 rounded-md"
              value={newReceptionist.name}
              onChange={(e) => setNewReceptionist({...newReceptionist, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 border-2 border-cyan-600 rounded-md"
              value={newReceptionist.email}
              onChange={(e) => setNewReceptionist({...newReceptionist, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 border-2 border-cyan-600 rounded-md"
              value={newReceptionist.password}
              onChange={(e) => setNewReceptionist({...newReceptionist, password: e.target.value})}
              required={!editingReceptionist}
            />
            <button
              type="submit"
              className="bg-cyan-600 text-white py-3 px-4 rounded hover:bg-cyan-700 md:col-span-3"
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
                className="bg-gray-500 text-white py-3 px-4 rounded hover:bg-gray-600 md:col-span-3"
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
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receptionists.map(receptionist => (
                <tr key={receptionist.id} className="border-b">
                  <td className="px-4 py-2">{receptionist.name}</td>
                  <td className="px-4 py-2">{receptionist.email}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEditReceptionist(receptionist)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReceptionist(receptionist.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
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
