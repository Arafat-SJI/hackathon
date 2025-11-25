"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import React, { useState, useEffect } from "react";

export default function Page() {
  const [description, setDescription] = useState("");
  const [diseases, setDiseases] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedDescription = localStorage.getItem("generate-initial-questions-description");
    const savedDiseases = localStorage.getItem("generate-initial-questions-diseases");
    const savedQuestions = localStorage.getItem("generate-initial-questions-questions");

    if (savedDescription) setDescription(savedDescription);
    if (savedDiseases) setDiseases(savedDiseases);
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
  }, []);

  useEffect(() => {
    localStorage.setItem("generate-initial-questions-description", description);
  }, [description]);

  useEffect(() => {
    localStorage.setItem("generate-initial-questions-diseases", diseases);
  }, [diseases]);

  const saveQuestionsToLocal = (newQuestions) => {
    setQuestions(newQuestions);
    localStorage.setItem("generate-initial-questions-questions", JSON.stringify(newQuestions));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          diseases,
          myuuid: "550e8400-e29b-41d4-a716-446655440000",
          lang: "en",
          timezone: "America/New_York",
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.result === "success") {
        saveQuestionsToLocal(data.data.questions);
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

      <NavHeader title="Generate Initial Follow-Up Questions" icon="/images/icons/wired-flat-35-edit-hover-line.gif" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
          rows={5}
          placeholder="Enter patient description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none  focus:border-cyan-600"
          placeholder="Enter possible diseases. Example: Diabetes, Hypertension."
          value={diseases}
          onChange={(e) => setDiseases(e.target.value)}
          required
        />

        <GenerateButton loading={loading} text="Generate Questions" />
      </form>

      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

      {questions.length > 0 && (
        <div className="mt-6 relative p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design h-96 overflow-y-auto">
         <ResponseHeader title="Follow-Up Questions" icon="/images/icons/wired-flat-35-edit-hover-line-a.gif" />
          <ul className={`${loading ? "blur-sm pointer-events-none" : ""} list-disc list-inside space-y-2`}>
            {questions.map((q, index) => (
              <li key={index}>{q}</li>
            ))}
          </ul>
          {loading && (
            <SecondLoader />
          )}
        </div>
      )}
    </div>
  );
}
