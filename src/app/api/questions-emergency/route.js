import { GET_EMERGENCY_QUESTIONS_URL } from "@/url/api";

export async function POST(req) {
    try {
      const body = await req.json();
  
      const response = await fetch(
        GET_EMERGENCY_QUESTIONS_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": process.env.DXGPT_KEY,
          },
          body: JSON.stringify(body),
        }
      );
  
      const data = await response.json();
  
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
  