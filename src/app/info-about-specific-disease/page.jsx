"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResetButton from "@/components/common/ResetButton/ResetButton";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import React, { useState, useEffect } from "react";

export default function Page() {
  const [disease, setDisease] = useState("");
  const [medicalDescription, setMedicalDescription] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedDisease = localStorage.getItem("disease-info-disease");
    const savedMedicalDesc = localStorage.getItem("disease-info-medicalDescription");
    const savedInfo = localStorage.getItem("disease-info-response");

    if (savedDisease) setDisease(savedDisease);
    if (savedMedicalDesc) setMedicalDescription(savedMedicalDesc);
    if (savedInfo && savedDisease) {
      setInfo(savedInfo);

    } else {
      localStorage.setItem("disease-info-response", "");
      setInfo("");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("disease-info-disease", disease);
  }, [disease]);

  useEffect(() => {
    localStorage.setItem("disease-info-medicalDescription", medicalDescription);
  }, [medicalDescription]);

  const saveResponse = (content) => {
    setInfo(content);
    localStorage.setItem("disease-info-response", content);
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
        saveResponse(data.data.content);
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

  const handleReset = () => {
    setDisease("");
    setMedicalDescription("");
    setInfo("");
    localStorage.removeItem("disease-info-response");
    localStorage.removeItem("disease-info-disease");
    localStorage.removeItem("disease-info-medicalDescription");
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
