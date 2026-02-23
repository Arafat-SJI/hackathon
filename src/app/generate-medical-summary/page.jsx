"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResetButton from "@/components/common/ResetButton/ResetButton";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import PatientSelector from "@/components/common/PatientSelector/PatientSelector";
import React, { useState, useEffect } from "react";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { getDraft, saveDraft, deleteDraft } from '@/services/draftService';
import { addHistoryEntry } from '@/services/historyService';

export default function Page() {
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
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
        const { draft: descDraft } = await getDraft('create-summary-description', selectedPatient.id);
        const { draft: summaryDraft } = await getDraft('create-summary-summary', selectedPatient.id);

        if (descDraft?.data) setDescription(descDraft.data);
        else setDescription("");
        
        if (summaryDraft?.data) setSummary(summaryDraft.data);
        else setSummary("");
      } else {
        setDescription("");
        setSummary("");
      }
    };

    loadDrafts();
  }, [selectedPatient]);

  useEffect(() => {
    const saveDescription = async () => {
      if (selectedPatient && description) {
        await saveDraft('create-summary-description', description, selectedPatient.id);
      }
    };
    saveDescription();
  }, [description, selectedPatient]);

  const saveSummaryToLocal = async (newSummary) => {
    setSummary(newSummary);
    if (selectedPatient) {
      await saveDraft('create-summary-summary', newSummary, selectedPatient.id);
      
      // Save to patient's history
      await addHistoryEntry(selectedPatient.id, 'generate-medical-summary', {
        timestamp: new Date().toISOString(),
        description,
        summary: newSummary
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description,
          myuuid: "550e8400-e29b-41d4-a716-446655440000",
          lang: "en",
          timezone: "America/New_York",
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.result === "success") {
        await saveSummaryToLocal(data.data.summary);
        // Save summary as draft for analyze-disease page
        if (selectedPatient) {
          await saveDraft('analyze-disease-description', data.data.summary, selectedPatient.id);
        }
      } else {
        setSummary("");
        if (selectedPatient) {
          await deleteDraft('create-summary-summary', selectedPatient.id);
          await deleteDraft('analyze-disease-description', selectedPatient.id);
        }
        if (data?.details[0]?.reason) {
          setError(data?.details[0]?.reason);
        } else {
          setError("Failed to summarize.");
        }
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
    setSummary("");
    if (selectedPatient) {
      await deleteDraft('create-summary-description', selectedPatient.id);
      await deleteDraft('create-summary-summary', selectedPatient.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <NavHeader title="Generate Medical Summary" icon="/images/icons/wired-flat-56-document-hover-swipe.gif" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PatientSelector selectedPatient={selectedPatient} onPatientChange={setSelectedPatient} />

        <textarea
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
          rows={8}
          placeholder="Enter patient description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="flex items-center justify-between mt-4">


          <GenerateButton loading={loading} text="Summarize" />
          <div>
            <ResetButton handleReset={handleReset} />
          </div>
        </div>

      </form>



      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

      {summary && (
        <div className="mt-6 relative p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design min-h-[100px]">
          <ResponseHeader title="AI Generated Summary" icon="/images/icons/wired-flat-56-document-hover-swipe.gif" />
          <p className={`${loading ? "blur-sm pointer-events-none" : ""}`}>
            {summary}
          </p>
          {loading && (
            <SecondLoader />
          )}
        </div>
      )}
    </div>
  );
}
