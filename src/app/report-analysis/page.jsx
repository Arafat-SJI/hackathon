"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import React, { useState } from "react";

export default function Page() {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // Helper to convert File to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // get base64 only
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const images = [];
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const base64 = await fileToBase64(file);
          images.push({
            name: file.name,
            type: file.type,
            data: base64,
          });
        }
      }

      const body = {
        text: description || undefined,
        images: images.length ? images : undefined,
      };

      const response = await fetch("/api/report-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      setResult(data?.result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <NavHeader title="Report Analysis" icon="/images/icons/wired-flat-54-photo-hover-pinch.gif" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:border-cyan-600"
          rows={5}
          placeholder="Enter patient description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          className="w-full p-3 border-2 border-cyan-600 rounded-md shadow-md focus:outline-none focus:border-cyan-600"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />

        <GenerateButton loading={loading} text="Analyze Report" />
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result || loading ? (
        <div className="mt-6 relative p-4 bg-gray-50 border-l-8 border-cyan-500 rounded-lg shadow-design h-96 overflow-y-auto">
          <ResponseHeader title="Analysis Result" icon="/images/icons/wired-flat-54-photo-hover-pinch.gif" />
          {result && <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>}
          {loading && <SecondLoader />}
        </div>
      ) : null}

    </div>
  );
}
