import { supabase } from "@/lib/supabase";

export async function getPatientWithHistory(patientId) {
  // Fetch patient basic info
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();

  if (patientError) {
    throw new Error(`Failed to load patient: ${patientError.message}`);
  }

  // Fetch patient history
  const { data: historyRows, error: historyError } = await supabase
    .from("patient_history")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (historyError) {
    throw new Error(`Failed to load patient history: ${historyError.message}`);
  }

  // Group history by feature for easier reading
  const history = {};
  (historyRows || []).forEach((entry) => {
    if (!history[entry.feature]) {
      history[entry.feature] = [];
    }
    history[entry.feature].push(entry.data);
  });

  return { patient, history };
}

export function buildReportText(patient, history) {
  const lines = [];

  lines.push("Patient Report");
  lines.push("==============");
  lines.push("");
  lines.push(`Name   : ${patient.name || "N/A"}`);
  lines.push(`Email  : ${patient.email || "N/A"}`);
  lines.push(`Phone  : ${patient.phone || "N/A"}`);
  lines.push(`DOB    : ${patient.dob || "N/A"}`);
  lines.push("");

  const featureKeys = Object.keys(history);
  if (featureKeys.length === 0) {
    lines.push("No historical entries found for this patient.");
  } else {
    lines.push("History:");
    lines.push("--------");
    featureKeys.forEach((feature) => {
      lines.push("");
      lines.push(`Feature: ${feature}`);
      lines.push("---------");
      history[feature].forEach((entry, index) => {
        lines.push(`Entry ${index + 1}:`);
        lines.push(JSON.stringify(entry, null, 2));
        lines.push("");
      });
    });
  }

  return lines.join("\n");
}

