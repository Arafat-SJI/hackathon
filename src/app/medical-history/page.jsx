"use client";

import React, { useState, useEffect } from 'react';
import NavHeader from "@/components/common/NavHeader/NavHeader";
import PatientSelector from "@/components/common/PatientSelector/PatientSelector";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function MedicalHistory() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState({});
  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'doctor') {
      router.push('/patient-management');
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (selectedPatient) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory(selectedPatient.history || {});
    } else {
      setHistory({});
    }
  }, [selectedPatient]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderHistoryItem = (feature, items) => {
    if (!items || items.length === 0) return null;

    return (
      <div key={feature} className="mb-6">
        <h3 className="text-lg font-semibold mb-3 capitalize">{feature.replace('-', ' ')}</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-cyan-500">
              <div className="text-sm text-gray-600 mb-2">
                {formatDate(item.timestamp)}
              </div>
              {feature === 'analyze-disease' && (
                <div>
                  <p><strong>Description:</strong> {item.description}</p>
                  <p><strong>Diseases:</strong> {item.diseases}</p>
                  <div className="mt-2">
                    <strong>Results:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {item.results.map((result, idx) => (
                        <li key={idx}>{result.diagnosis}: {result.description}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {feature === 'ai-report-analysis' && (
                <div>
                  <p><strong>Report Type:</strong> {item.reportType}</p>
                  <p><strong>File:</strong> {item.fileName}</p>
                  <div className="mt-2">
                    <strong>Analysis:</strong> {item.result.analysis}
                  </div>
                  <div className="mt-2">
                    <strong>Findings:</strong>
                    <ul className="list-disc list-inside">
                      {item.result.findings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <strong>Severity:</strong> <span className={`px-2 py-1 rounded ${
                      item.result.severity === 'critical' ? 'bg-red-500 text-white' :
                      item.result.severity === 'high' ? 'bg-orange-500 text-white' :
                      item.result.severity === 'moderate' ? 'bg-yellow-500 text-black' :
                      'bg-green-500 text-white'
                    }`}>
                      {item.result.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <strong>Recommendations:</strong>
                    <ul className="list-disc list-inside">
                      {item.result.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {feature === 'generate-medical-summary' && (
                <div>
                  <p><strong>Description:</strong> {item.description}</p>
                  <div className="mt-2">
                    <strong>Summary:</strong> {item.summary}
                  </div>
                </div>
              )}
              {feature === 'info-about-specific-disease' && (
                <div>
                  <p><strong>Disease:</strong> {item.disease}</p>
                  <p><strong>Medical Description:</strong> {item.medicalDescription}</p>
                  <div className="mt-2">
                    <strong>Info:</strong>
                    <div dangerouslySetInnerHTML={{ __html: item.info }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <NavHeader title="Medical History" icon="/images/icons/wired-flat-56-document-hover-swipe.gif" />

      <div className="mb-6">
        <PatientSelector selectedPatient={selectedPatient} onPatientChange={setSelectedPatient} />
      </div>

      {selectedPatient ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Medical History for {selectedPatient.name}</h2>

          {Object.keys(history).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(history).map(([feature, items]) =>
                renderHistoryItem(feature, items)
              )}
            </div>
          ) : (
            <p className="text-gray-600">No medical history available for this patient.</p>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Please select a patient to view their medical history.</p>
        </div>
      )}
    </div>
  );
}
