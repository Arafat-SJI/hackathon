"use client";

import GenerateButton from "@/components/common/GenerateButton/GenerateButton";
import SecondLoader from "@/components/common/Loader/SecondLoader";
import NavHeader from "@/components/common/NavHeader/NavHeader";
import ResponseHeader from "@/components/common/ResponseHeader/ResponseHeader";
import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Loader from './../../components/common/Loader/Loader';
import ResetButton from "@/components/common/ResetButton/ResetButton";
import DownloadButton from "@/components/common/DownloadButton/DownloadButton";


export default function Page() {
  const [description, setDescription] = useState("");
  const [diseases, setDiseases] = useState("");
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedDescription = localStorage.getItem("analyze-disease-description");
    const savedDiseases = localStorage.getItem("analyze-disease-diseases");
    const savedResults = localStorage.getItem("analyze-disease-results");


    if (savedDescription) setDescription(savedDescription);
    if (savedDiseases) setDiseases(savedDiseases);
    if (savedResults) setDiagnosisResults(JSON.parse(savedResults));
  }, []);

  useEffect(() => {
    localStorage.setItem("analyze-disease-description", description);
  }, [description]);

  useEffect(() => {
    localStorage.setItem("analyze-disease-diseases", diseases);
  }, [diseases]);

  const saveResultsToLocal = (results) => {
    setDiagnosisResults(results);
    localStorage.setItem("analyze-disease-results", JSON.stringify(results));
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
        saveResultsToLocal(data.data);
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

  const handleReset = () => {
    setDescription("");
    setDiseases("");
    setDiagnosisResults([]);
    localStorage.removeItem("analyze-disease-description");
    localStorage.removeItem("analyze-disease-diseases");
    localStorage.removeItem("analyze-disease-results");
  };

  const handleDownload = () => {
   
  };

  return (
    <div className="px-10 mx-auto">
      <NavHeader title="AI Possible Disease Analyst" icon="/images/icons/wired-flat-12-layers-hover-slide.gif" />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
