import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
    if (!GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { imageBase64, mimeType, reportType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    console.log('Analyzing medical report with AI...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert medical AI assistant specialized in analyzing medical reports and diagnostic images.
Provide detailed analysis including:
1. Key findings from the report/image
2. Severity level (low, moderate, high, critical)
3. Specific medical recommendations
4. Any abnormalities detected

Format your response as JSON with these fields:
{
  "analysis": "detailed analysis text",
  "findings": ["finding 1", "finding 2", ...],
  "severity": "low|moderate|high|critical",
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`
              },
              {
                text: `Please analyze this ${reportType || 'medical report'} and provide detailed findings.`
              },
              {
                inline_data: {
                  mime_type: mimeType || "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ]
      }),
    });
    console.log('Received response from Gemini API : ',response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    console.log('AI analysis completed successfully');

    // Try to parse JSON response, fallback to text if not valid JSON
    let parsedAnalysis;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      parsedAnalysis = JSON.parse(cleanedResponse);
    } catch (e) {
      // If not valid JSON, structure the text response
      parsedAnalysis = {
        analysis: aiResponse,
        findings: ['AI analysis completed - see detailed analysis'],
        severity: 'moderate',
        recommendations: ['Consult with your healthcare provider for detailed interpretation']
      };
    }

    return NextResponse.json(parsedAnalysis);
  } catch (error) {
    console.error('Error analyzing medical report:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to analyze medical report'
      },
      { status: 500 }
    );
  }
}
