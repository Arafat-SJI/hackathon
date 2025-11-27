import { NextResponse } from "next/server";
import { GET_REPORT_ANALYSIS_URL } from "@/url/api";

// export const config = {
//   api: {
//     bodyParser: true, 
//   },
// };

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(GET_REPORT_ANALYSIS_URL, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.DXGPT_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
