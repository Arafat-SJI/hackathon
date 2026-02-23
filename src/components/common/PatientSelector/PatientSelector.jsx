"use client";

import React, { useState, useEffect } from 'react';
import { getPatients } from '@/services/patientService';

const PatientSelector = ({ selectedPatient, onPatientChange }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      const { patients: patientsData, error } = await getPatients();
      if (!error && patientsData) {
        // Transform to match expected format
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
      setLoading(false);
    };

    loadPatients();
  }, []);

  const handleChange = (e) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    onPatientChange(patient || null);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Select Patient</label>
      <select
        className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:border-cyan-600"
        value={selectedPatient?.id || ''}
        onChange={handleChange}
        required
        disabled={loading}
      >
        <option value="" disabled>{loading ? 'Loading patients...' : 'Select a patient'}</option>
        {patients.map(patient => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PatientSelector;
