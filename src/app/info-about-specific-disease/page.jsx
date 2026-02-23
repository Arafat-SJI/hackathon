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

export default function Page() {
  const [disease, setDisease] = useState("");
  const [medicalDescription, setMedicalDescription] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'doctor') {
      router.push('/patient-management');
    }
  }, [currentUser, router]);

  useEffect(() => {
    const loadDrafts = async () => {
      const { draft: diseaseDraft } = await getDraft('disease-info-disease');
      const { draft: descDraft } = await getDraft('disease-info-medicalDescription');
      const { draft: infoDraft } = await getDraft('disease-info-response');

      if (diseaseDraft?.data) setDisease(diseaseDraft.data);
      if (descDraft?.data) setMedicalDescription(descDraft.data);
      if (infoDraft?.data && diseaseDraft?.data) {
        setInfo(infoDraft.data);
      } else {
        setInfo("");
      }
    };

    loadDrafts();
  }, []);

  useEffect(() => {
    const saveDisease = async () => {
      if (disease) {
        await saveDraft('disease-info-disease', disease);
      }
    };
    saveDisease();
  }, [disease]);

  useEffect(() => {
    const saveDescription = async () => {
      if (medicalDescription) {
        await saveDraft('disease-info-medicalDescription', medicalDescription);
      }
    };
    saveDescription();
  }, [medicalDescription]);

  const saveResponse = async (content) => {
    setInfo(content);
    await saveDraft('disease-info-response', content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/disease-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionType: 1,
          disease,
          myuuid: "550e8400-e29b-41d4-a716-446655440000",
          lang: "en",
          detectedLang: "en",
          timezone: "America/New_York",
          medicalDescription,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.result === "success") {
        await saveResponse(data.data.content);
      } else {
        setError("Failed to fetch disease info.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setDisease("");
    setMedicalDescription("");
    setInfo("");
    await deleteDraft('disease-info-response');
    await deleteDraft('disease-info-disease');
    await deleteDraft('disease-info-medicalDescription');
  };


  
  return (
    <div className="max-w-4xl mx-auto">
      <NavHeader title="Info About Specific Disease" icon="/images/icons/wired-flat-19-magnifier-zoom-search-hover-spin.gif" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
          placeholder="Enter disease name..."
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          required
        />

        <textarea
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
          rows={5}
          placeholder="Enter disease description..."
          value={medicalDescription}
          onChange={(e) => setMedicalDescription(e.target.value)}
          required
        />
        <div className="flex items-center justify-between mt-4">

          <GenerateButton loading={loading} text="Get Info" />

          <div>
            <ResetButton handleReset={handleReset} />
          </div>

        </div>
      </form>


      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

      {info && (
        <div className="mt-6 relative p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design h-96 overflow-y-auto">
          <ResponseHeader title="Specific Disease Info" icon="/images/icons/wired-flat-19-magnifier-zoom-search-hover-spin.gif" />
          <div className={`${loading ? "blur-sm pointer-events-none" : ""}`} dangerouslySetInnerHTML={{ __html: info }} />
          {loading && (
            <SecondLoader />
          )}
        </div>
      )}


    </div>
  );
}
