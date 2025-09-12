// /app/api/create-events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });


export async function POST(req: NextRequest) {
  try {
    // Extract form-data and read syllabus text
    const { text } = await req.json();
    console.log('create-events route: ', text)
    // Prompt instructs Gemini to output ONLY valid JSON
    const prompt = `
You are a scheduling assistant that turns a law school syllabus into structured calendar tasks.

Return ONLY valid JSON (an array), no commentary.
Schema: [
  {
    "title": string,
    "date": "YYYY-MM-DD",
    "start_time": "HH:MM",        // 24h; include if a time frame is given or can be inferred
    "end_time": "HH:MM",          // include if a time frame is given
    "description": string
  }
]

GOAL
- Produce one task per dated class meeting or dated assignment/due item that can be inferred from syllabus context.

HOW TO INFER DATES (CRITICAL)
1) Extract global context from the syllabus:
   - TERM + YEAR (e.g., "Fall 2024") to get the calendar year.
   - MEETING PATTERN + TIME WINDOW (e.g., "MW 9:00–10:50 am") to get which weekdays the class meets and the class start/end time.
   - WEEKLY OUTLINE (e.g., "Week 1 ...", "Week 2 ...") and any labels like "No class", "Holiday", etc.
   - Any explicit calendar dates (use them if present).

2) Anchor the calendar when explicit dates are missing:
   - Prefer explicit dates when they exist.
   - Otherwise, use named U.S. holidays mentioned in the syllabus to anchor a specific week/day. Compute the holiday’s date for the given YEAR, then map weeks around it.
     Holiday rules you may use:
       • Labor Day = first Monday in September
       • Thanksgiving = fourth Thursday in November
       • Martin Luther King Jr. Day = third Monday in January
       • Memorial Day = last Monday in May
       • Independence Day = July 4
     Example: If "Week 3 (Mon): Labor Day Holiday" appears, set Week 3 Monday = first Monday of September of that YEAR; Week 1 Monday is 14 days earlier; Week 2 Monday is 7 days earlier.

3) Compute the calendar for all class meetings in the covered weeks:
   - Map "M, T, W, Th, F" to Monday–Friday.
   - For each week number, assign actual dates for the listed meeting days using the anchor from step 2 (or any explicit dates).
   - If a meeting day is marked "Holiday", "No class", or similar, skip creating a task for that day.

4) Create tasks:
   - For each dated class meeting, create a task with:
       • title = a short label (e.g., "Contracts – Week 2 (Mon): Readings")
       • date = the computed date
       • start_time/end_time = the class time window from the syllabus (e.g., "09:00"/"10:50") if given
       • description = the specific readings/assignments listed for that meeting ("Hawkins v. McGee; Blaisdell", page ranges, case names, etc.)
   - For items with explicit due times ("by 11:59 pm", "by noon"), set start_time to that due time and omit end_time.
   - If an item says "before class," schedule it at the class start_time for that meeting day.

5) Do NOT guess beyond the provided context:
   - Only output tasks whose dates can be uniquely determined using the above rules.
   - If a midterm/final is mentioned without any date or inferable anchor, omit it.

6) Formatting rules:
   - Use 24-hour times with leading zeros (e.g., "09:00", "10:50").
   - Ensure every task with a meeting/due time frame includes start_time and (if applicable) end_time.
   - Deduplicate tasks.

INPUT SYLLABUS TEXT
"""${text}"""
`;

    // Call Gemini with the provided syllabus text
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    // Gemini sometimes wraps JSON in ```json ... ```
    let responseText = response.text as string;
    console.log('Response Text:', responseText);
    responseText = responseText
      .replace(/```json\s*/i, "")
      .replace(/```$/, "")
      .trim();

    console.log('Response Text', responseText);
    let events;

    try {
      // Attempt to parse Gemini’s output into JSON
      events = JSON.parse(responseText);
    } catch (error: any) {
      console.log(error.message as string);
      return NextResponse.json(
        { error: "Error parsing events", raw: responseText },
        { status: 500 }
      );
    }

    console.log('Events:', events);

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
