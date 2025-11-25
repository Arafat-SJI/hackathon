"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import React, { useState, useEffect } from "react";

export default function Page() {
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedDescription = localStorage.getItem("emergency-questions-description");
    const savedQuestions = localStorage.getItem("emergency-questions-response");

    if (savedDescription) setDescription(savedDescription);
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
  }, []);

  useEffect(() => {
    localStorage.setItem("emergency-questions-description", description);
  }, [description]);

  const saveResponse = (data) => {
    setQuestions(data);
    localStorage.setItem("emergency-questions-response", JSON.stringify(data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/questions-emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          myuuid: "550e8400-e29b-41d4-a716-446655440000",
          lang: "en",
          timezone: "America/New_York",
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.result === "success") {
        saveResponse(data.data.questions);
      } else {
        setError("Failed to generate questions.");
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
      <NavHeader title="Generate Emergency Assessment Questions" icon="/images/icons/wired-flat-37-approve-checked-simple-hover-pinch.gif" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
          rows={5}
          placeholder="Enter patient description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

       <GenerateButton loading={loading} text="Generate Questions" />
      </form>

      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

      {questions.length > 0 && (
        <div className="mt-6 relative p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design h-96 overflow-y-auto">
          <div className={`${loading ? "blur-sm pointer-events-none" : ""}`}>
            <ResponseHeader title="Emergency Questions" icon="/images/icons/wired-flat-37-approve-checked-simple-hover-pinch.gif" />
            <ul className="list-disc list-inside space-y-1">
              {questions.map((q, index) => (
                <li key={index}>{q}</li>
              ))}
            </ul>
          </div>

          {loading && (
            <SecondLoader />
          )}
        </div>
      )}
    </div>
  );
}
