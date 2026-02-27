import { NextResponse } from "next/server";
import { getPatientWithHistory, buildReportText } from "@/lib/patientReport";

async function sendWhatsAppMessage(toPhone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error(
      "Twilio WhatsApp configuration is missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM env vars."
    );
  }

  const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const to =
    toPhone.startsWith("whatsapp:") || toPhone.startsWith("WHATSAPP:")
      ? toPhone
      : `whatsapp:${toPhone}`;
  const fromNumber =
    from.startsWith("whatsapp:") || from.startsWith("WHATSAPP:")
      ? from
      : `whatsapp:${from}`;

  const body = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: message,
  });

  const authString = Buffer.from(`${accountSid}:${authToken}`).toString(
    "base64"
  );

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Twilio WhatsApp API error: ${response.status} - ${errorText}`
    );
  }
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

    if (!patient?.phone) {
      return NextResponse.json(
        { error: "Patient does not have a phone number" },
        { status: 400 }
      );
    }

    const reportText = buildReportText(patient, history);

    await sendWhatsAppMessage(patient.phone, reportText);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending patient report via WhatsApp:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error sending report via WhatsApp",
      },
      { status: 500 }
    );
  }
}

