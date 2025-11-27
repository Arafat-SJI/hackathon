"use client";

import React, { useState, useEffect } from 'react';

const PatientSelector = ({ selectedPatient, onPatientChange }) => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Load patients from localStorage
    const storedPatients = localStorage.getItem('patients');
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    } else {
      // Initialize with sample patients
      const samplePatients = [
        { id: 1, name: 'John Doe', history: {} },
        { id: 2, name: 'Jane Smith', history: {} },
        { id: 3, name: 'Bob Johnson', history: {} },
      ];
      setPatients(samplePatients);
      localStorage.setItem('patients', JSON.stringify(samplePatients));
    }
  }, []);

  const handleChange = (e) => {
    const patientId = parseInt(e.target.value);
    const patient = patients.find(p => p.id === patientId);
    onPatientChange(patient);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Select Patient</label>
      <select
        className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:border-cyan-600"
        value={selectedPatient?.id || ''}
        onChange={handleChange}
        required
      >
        <option value="" disabled>Select a patient</option>
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
