// /app/api/create-events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/**
 * API Route: /api/create-events
 *
 * This endpoint accepts syllabus text (via multipart/form-data),
 * sends it to Google Gemini for parsing, and returns structured
 * syllabus events as JSON.
 *
 * Expected schema:
 * [
 *   {
 *     "title": string,
 *     "date": "YYYY-MM-DD",
 *     "description": string
 *   }
 * ]
 *
 * Example request:
 * POST /api/create-events
 * Content-Type: multipart/form-data
 *
 * text=Week 1: Case Brief due 2025-09-10
 *
 * Example success response:
 * [
 *   {
 *     "title": "Case Brief",
 *     "date": "2025-09-10",
 *     "description": "Week 1 reading and case analysis"
 *   }
 * ]
 */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

/**
 * Handles POST requests for syllabus parsing.
 *
 * @param req - The Next.js API request object.
 * @returns {NextResponse} JSON response containing structured events or error details.
 */
export async function POST(req: NextRequest) {
  try {
    // Extract form-data and read syllabus text
    const formdata = await req.formData();
    const text = formdata.get("text") as string;

    // Prompt instructs Gemini to output ONLY valid JSON
    const prompt = `You are an assistant that extracts structured tasks from a law school syllabus.
      Return ONLY valid JSON, no commentary.
      Schema: [{ "title": string, "date": "YYYY-MM-DD", "description": string }]
      
      Input syllabus text:
      """${text}"""
    `;

    // Call Gemini with the provided syllabus text
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Gemini sometimes wraps JSON in ```json ... ```
    let responseText = response.text as string;
    responseText = responseText
      .replace(/```json\s*/i, "")
      .replace(/```$/, "")
      .trim();

    let events;

    try {
      // Attempt to parse Gemini’s output into JSON
      events = JSON.parse(responseText as string);
    } catch (error: any) {
      console.log(error.message as string);
      return NextResponse.json(
        { error: "Error parsing events", raw: responseText },
        { status: 500 }
      );
    }

    // Successfully return structured events
    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    // Fallback for unexpected server errors
    console.error(err.message as string);
    return NextResponse.json(
      { error: `Server Error: ${err.message}` },
      { status: 500 }
    );
  }
}
