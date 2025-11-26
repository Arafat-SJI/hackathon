"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import React, { useState, useEffect } from "react";

export default function Page() {
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedDescription = localStorage.getItem("create-summary-description");
    const savedSummary = localStorage.getItem("create-summary-summary");

    if (savedDescription) setDescription(savedDescription);
    if (savedSummary) setSummary(savedSummary);
  }, []);

  useEffect(() => {
    localStorage.setItem("create-summary-description", description);
  }, [description]);

  const saveSummaryToLocal = (newSummary) => {
    setSummary(newSummary);
    localStorage.setItem("create-summary-summary", newSummary);
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
        saveSummaryToLocal(data.data.summary);
        localStorage.setItem("analyze-disease-description",data.data.summary);
           localStorage.setItem("analyze-disease-diseases",[]);
          localStorage.setItem("analyze-disease-results",[]);
      
      
      } else {
        setError("Failed to summarize.");

      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <NavHeader title="Generate Medical Summary" icon="/images/icons/wired-flat-56-document-hover-swipe.gif" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
          rows={8}
          placeholder="Enter patient description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <GenerateButton loading={loading} text="Summarize" />

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
