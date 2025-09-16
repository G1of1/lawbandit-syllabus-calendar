// /app/api/create-events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

/**
 * 📄 Create Events API
 *
 * This endpoint uses Google's Gemini model to analyze a **law school syllabus**
 * and transform it into structured calendar tasks.
 *
 * Endpoint: POST /api/create-events
 *
 * 🔑 Authentication:
 * - Does not require a session (but depends on a valid GEMINI_API_KEY in env).
 *
 * ⚙️ Workflow:
 * 1. Accepts syllabus text from the request body.
 * 2. Builds a detailed prompt instructing Gemini to output ONLY valid JSON.
 * 3. Calls Gemini (`gemini-2.5-flash`) to generate structured event data.
 * 4. Cleans up Gemini output (removes ```json wrappers).
 * 5. Attempts to parse into JSON.
 * 6. Returns structured events as JSON to the client.
 *
 * 📌 Event Schema (array of tasks):
 * [
 *   {
 *     "title": string,        // Short descriptive label
 *     "date": "YYYY-MM-DD",   // Computed or explicit date
 *     "start_time": "HH:MM",  // Optional, 24h format
 *     "end_time": "HH:MM",    // Optional, 24h format
 *     "description": string   // Reading/assignment details
 *   }
 * ]
 *
 * ⚠️ Notes on inference:
 * - Uses explicit dates if present.
 * - Otherwise, anchors using U.S. holidays (e.g., Labor Day, Thanksgiving).
 * - Calculates dates for class meetings based on week numbers + meeting patterns.
 * - Skips tasks without inferable dates.
 * - Deduplicates events and enforces valid time formatting.
 */

/**
 * POST /api/create-events
 *
 * Accept syllabus text and return structured calendar events.
 *
 * @param req - Incoming request with JSON body:
 *   {
 *     "text": string // Raw syllabus text
 *   }
 *
 * @returns {NextResponse} - JSON array of structured events, or error response.
 *
 * ✅ Example request:
 * {
 *   "text": "Fall 2024, Mondays/Wednesdays 9:00–10:50 am. Week 1: Hawkins v. McGee..."
 * }
 *
 * ✅ Example success response:
 * [
 *   {
 *     "title": "Contracts – Week 1 (Mon): Readings",
 *     "date": "2024-08-26",
 *     "start_time": "09:00",
 *     "end_time": "10:50",
 *     "description": "Hawkins v. McGee; Blaisdell"
 *   }
 * ]
 *
 * ❌ Example error response:
 * {
 *   "error": "Error parsing events",
 *   "raw": "<Gemini’s raw text that failed to parse>"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Extract syllabus text from request body
    const { text } = await req.json();
    console.log("create-events route: ", text);

    // Build prompt to guide Gemini into outputting valid JSON
    const prompt = `
You are a scheduling assistant that turns a law school syllabus into structured calendar tasks.

Return ONLY valid JSON (an array), no commentary.
Schema: [
  {
    "title": string,
    "date": "YYYY-MM-DD",
    "start_time": "HH:MM",
    "end_time": "HH:MM",
    "description": string
  }
]

... (prompt content shortened for readability in this comment) ...

INPUT SYLLABUS TEXT
"""${text}"""
`;

    // Call Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Gemini may wrap output in ```json ... ```
    let responseText = response.text as string;
    console.log("Response Text:", responseText);
    responseText = responseText
      .replace(/```json\s*/i, "")
      .replace(/```$/, "")
      .trim();

    console.log("Cleaned Response:", responseText);

    let events;
    try {
      // Parse Gemini's output
      events = JSON.parse(responseText);
    } catch (error: any) {
      console.log(error.message as string);
      return NextResponse.json(
        { error: "Error parsing events", raw: responseText },
        { status: 500 }
      );
    }

    console.log("Events:", events);

    // Success → return structured events
    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    // Catch unexpected server errors
    console.error(err.message as string);
    return NextResponse.json(
      { error: `Server Error: ${err.message}` },
      { status: 500 }
    );
  }
}
