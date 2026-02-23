"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import React, { useState, useEffect } from "react";
import { getDraft, saveDraft } from '@/services/draftService';

export default function Page() {
  const [description, setDescription] = useState("");
  const [diseases, setDiseases] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDrafts = async () => {
      const { draft: descDraft } = await getDraft('generate-initial-questions-description');
      const { draft: diseasesDraft } = await getDraft('generate-initial-questions-diseases');
      const { draft: questionsDraft } = await getDraft('generate-initial-questions-questions');

      if (descDraft?.data) setDescription(descDraft.data);
      if (diseasesDraft?.data) setDiseases(diseasesDraft.data);
      if (questionsDraft?.data) setQuestions(Array.isArray(questionsDraft.data) ? questionsDraft.data : []);
    };

    loadDrafts();
  }, []);

  useEffect(() => {
    const saveDescription = async () => {
      if (description) {
        await saveDraft('generate-initial-questions-description', description);
      }
    };
    saveDescription();
  }, [description]);

  useEffect(() => {
    const saveDiseases = async () => {
      if (diseases) {
        await saveDraft('generate-initial-questions-diseases', diseases);
      }
    };
    saveDiseases();
  }, [diseases]);

  const saveQuestionsToLocal = async (newQuestions) => {
    setQuestions(newQuestions);
    await saveDraft('generate-initial-questions-questions', newQuestions);
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
        await saveQuestionsToLocal(data.data.questions);
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
