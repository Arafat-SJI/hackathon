"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import PatientSelector from "@/components/common/PatientSelector/PatientSelector";
import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Loader from './../../components/common/Loader/Loader';
import ResetButton from "@/components/common/ResetButton/ResetButton";
import DownloadButton from "@/components/common/DownloadButton/DownloadButton";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { getDraft, saveDraft, deleteDraft } from '@/services/draftService';
import { addHistoryEntry } from '@/services/historyService';


export default function Page() {
  const [description, setDescription] = useState("");
  const [diseases, setDiseases] = useState("");
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'doctor') {
      router.push('/patient-management');
    }
  }, [currentUser, router]);

  useEffect(() => {
    const loadDrafts = async () => {
      if (selectedPatient) {
        // Load drafts
        const { draft: summaryDraft } = await getDraft('create-summary-summary', selectedPatient.id);
        const { draft: descDraft } = await getDraft('analyze-disease-description', selectedPatient.id);
        const { draft: diseasesDraft } = await getDraft('analyze-disease-diseases', selectedPatient.id);
        const { draft: resultsDraft } = await getDraft('analyze-disease-results', selectedPatient.id);

        // Use summary if available, otherwise use saved description
        if (summaryDraft?.data) {
          setDescription(summaryDraft.data);
        } else if (descDraft?.data) {
          setDescription(descDraft.data);
        } else {
          setDescription("");
        }
        
        if (diseasesDraft?.data) {
          setDiseases(diseasesDraft.data);
        } else {
          setDiseases("");
        }
        
        if (resultsDraft?.data) {
          setDiagnosisResults(Array.isArray(resultsDraft.data) ? resultsDraft.data : []);
        } else {
          setDiagnosisResults([]);
        }
      } else {
        setDescription("");
        setDiseases("");
        setDiagnosisResults([]);
      }
    };

    loadDrafts();
  }, [selectedPatient]);

  useEffect(() => {
    const saveDescription = async () => {
      if (selectedPatient && description) {
        await saveDraft('analyze-disease-description', description, selectedPatient.id);
      }
    };
    saveDescription();
  }, [description, selectedPatient]);

  useEffect(() => {
    const saveDiseases = async () => {
      if (selectedPatient && diseases) {
        await saveDraft('analyze-disease-diseases', diseases, selectedPatient.id);
      }
    };
    saveDiseases();
  }, [diseases, selectedPatient]);

  const saveResultsToLocal = async (results) => {
    setDiagnosisResults(results);
    if (selectedPatient) {
      // Save draft
      await saveDraft('analyze-disease-results', results, selectedPatient.id);
      
      // Save to patient's history
      await addHistoryEntry(selectedPatient.id, 'analyze-disease', {
        timestamp: new Date().toISOString(),
        description,
        diseases,
        results
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          diseases_list: diseases || '',
          myuuid: "550e8400-e29b-41d4-a716-446655440000",
          lang: "en",
          timezone: "America/New_York",
          model: "gpt4o",
          response_mode: "direct",
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.result === "success") {
        await saveResultsToLocal(data.data);
      } else {
        setError("Failed to analyze disease.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setDescription("");
    setDiseases("");
    setDiagnosisResults([]);
    if (selectedPatient) {
      await deleteDraft('analyze-disease-description', selectedPatient.id);
      await deleteDraft('analyze-disease-diseases', selectedPatient.id);
      await deleteDraft('analyze-disease-results', selectedPatient.id);
    }
  };

  const handleDownload = () => {
   
  };

  return (
    <div className="px-10 mx-auto">
      <NavHeader title="AI Possible Disease Analyst" icon="/images/icons/wired-flat-12-layers-hover-slide.gif" />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PatientSelector selectedPatient={selectedPatient} onPatientChange={setSelectedPatient} />

            <textarea
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
              rows={5}
              placeholder="Enter Medical Summary..."
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <input
              type="text"
              className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
              placeholder="Enter possible diseases. Example: Diabetes, Hypertension."
              value={diseases || ''}
              onChange={(e) => setDiseases(e.target.value)}

            />
            {/* <GenerateButton loading={loading} text="Analyze" /> */}

           <div className="flex items-center justify-between mt-4">

            <div className="flex items-center justify-center bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 text-white px-6 py-3 h-14 rounded-md hover:bg-gradient-to-r hover:from-cyan-800 hover:via-cyan-700 hover:to-cyan-600 font-semibold transition cursor-pointer">
              <button
                type="submit"
                disabled={loading}
                className='cursor-pointer'
              >
                {loading ? <Loader /> : "Analyze"}
              </button>
              {loading ? <></> : <FaArrowRight className="ms-1 w-4 h-4" />}
            </div>
            <div className="flex items-center justify-end gap-2">
            {/* <DownloadButton handleDownload={handleDownload} text="Download Analysis" /> */}
            <ResetButton handleReset={handleReset} />
            </div>

           </div> 
          </form>
      
          {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}
        </div>

        <div className="w-full lg:w-2/3">
          {diagnosisResults.length > 0 && (
            <div className="relative p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design max-h-[700px] overflow-y-auto">
              <ResponseHeader title="Analysis Results" icon="/images/icons/wired-flat-12-layers-hover-slide-a.gif" />

              <div className={`${loading ? "blur-sm pointer-events-none" : ""} grid grid-cols-1 md:grid-cols-3 gap-4`}>
                {diagnosisResults.map((item, index) => {
                  const bgColors = [
                    "bg-gradient-to-br from-purple-600 to-purple-400",
                    "bg-gradient-to-br from-green-500 to-teal-400",
                    "bg-gradient-to-br from-pink-500 to-red-400",
                    "bg-gradient-to-br from-yellow-500 to-orange-400",
                    "bg-gradient-to-br from-indigo-500 to-blue-400",
                    "bg-gradient-to-br from-rose-500 to-fuchsia-400",
                    "bg-gradient-to-br from-cyan-500 to-blue-300",
                    "bg-gradient-to-br from-lime-500 to-green-300"
                  ];
                  const bgClass = bgColors[index % bgColors.length];
                  return (
                    <div
                      key={index}
                      className={`${bgClass} text-white rounded-2xl p-3 shadow-xl hover:scale-105 transform transition-transform h-80 flex flex-col justify-start`}
                    >
                      <h3 className="text-xl font-bold mb-2 text-nowrap">{item.diagnosis}</h3>
                      <p className="text-sm font-bold">{item.description}</p>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-semibold">Symptoms in common:</span> {item.symptoms_in_common.join(", ")}
                        </p>
                        <p>
                          <span className="font-semibold">Symptoms not in common:</span> {item.symptoms_not_in_common.join(", ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {loading && (
                <SecondLoader />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
