"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import PatientSelector from "@/components/common/PatientSelector/PatientSelector";
import React, { useState } from "react";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("medical report");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'doctor') {
      router.push('/patient-management');
    }
  }, [currentUser, router]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
    } else {
      setFile(null);
      alert("Please select a valid image file.");
    }
  };

  // Helper to convert File to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const imageBase64 = await fileToBase64(file);
      const base64Data = imageBase64.split(',')[1]; // Get base64 data without prefix

      const body = {
        imageBase64: base64Data,
        mimeType: file.type,
        reportType,
      };

      const response = await fetch("/api/ai-report-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await response.json();
      setResult(data);
      // Save to patient's history
      if (selectedPatient) {
        const patients = JSON.parse(localStorage.getItem('patients') || '[]');
        const patientIndex = patients.findIndex(p => p.id === selectedPatient.id);
        if (patientIndex !== -1) {
          if (!patients[patientIndex].history['ai-report-analysis']) {
            patients[patientIndex].history['ai-report-analysis'] = [];
          }
          patients[patientIndex].history['ai-report-analysis'].push({
            timestamp: new Date().toISOString(),
            reportType,
            fileName: file.name,
            result: data
          });
          localStorage.setItem('patients', JSON.stringify(patients));
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <NavHeader title="AI Diagnostic Report Analysis" icon="/images/icons/wired-flat-54-photo-hover-pinch.gif" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PatientSelector selectedPatient={selectedPatient} onPatientChange={setSelectedPatient} />

        <div>
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <select
            className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:border-cyan-600"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="medical report">Medical Report</option>
            <option value="x-ray">X-Ray</option>
            <option value="MRI">MRI</option>
            <option value="CT scan">CT Scan</option>
            <option value="blood test">Blood Test</option>
            <option value="lab report">Lab Report</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <input
            type="file"
            className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:border-cyan-600"
            accept="image/*"
            onChange={handleFileChange}
          />
          {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
        </div>

        <GenerateButton loading={loading} text="Analyze with AI" />
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result || loading ? (
        <div className="mt-6 relative p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design h-96 overflow-y-auto">
          <ResponseHeader title="AI Analysis Result" icon="/images/icons/wired-flat-54-photo-hover-pinch.gif" />
          {result && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Analysis</h3>
                <p className="whitespace-pre-wrap">{result.analysis}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Findings</h3>
                <ul className="list-disc list-inside">
                  {result.findings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Severity</h3>
                <span className={`px-2 py-1 rounded ${
                  result.severity === 'critical' ? 'bg-red-500 text-white' :
                  result.severity === 'high' ? 'bg-orange-500 text-white' :
                  result.severity === 'moderate' ? 'bg-yellow-500 text-black' :
                  'bg-green-500 text-white'
                }`}>
                  {result.severity.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Recommendations</h3>
                <ul className="list-disc list-inside">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {loading && <SecondLoader />}
        </div>
      ) : null}
    </div>
  );
}
