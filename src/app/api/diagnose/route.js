import { GET_DIAGNOSIS_URL } from "@/url/api";

export async function POST(req) {
    try {
      const body = await req.json();
  
      const response = await fetch(
        GET_DIAGNOSIS_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": process.env.DXGPT_KEY, // your key in .env
          },
          body: JSON.stringify(body),
        }
      );
  
      const data = await response.json();
      console.log('Diagnosis API response data:', data);
  
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      console.log("Error in /api/diagnose:", err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
  