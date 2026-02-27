import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPatientWithHistory, buildReportText } from "@/lib/patientReport";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM env vars."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return { transporter, from };
}

export async function POST(req) {
  try {
    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    const { patient, history } = await getPatientWithHistory(patientId);

    if (!patient?.email) {
      return NextResponse.json(
        { error: "Patient does not have an email address" },
        { status: 400 }
      );
    }

    const reportText = buildReportText(patient, history);

    const { transporter, from } = createTransporter();

    await transporter.sendMail({
      from,
      to: patient.email,
      subject: `Patient Report for ${patient.name || "Patient"}`,
      text: reportText,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending patient report email:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error sending report email",
      },
      { status: 500 }
    );
  }
}

