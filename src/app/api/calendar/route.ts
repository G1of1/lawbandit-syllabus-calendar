import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createEvents, listEvents } from "@/lib/calendar";

/**
 * 📄 Calendar API Route
 *
 * This file exposes two endpoints:
 * - POST /api/calendar → Create calendar events
 * - GET /api/calendar  → List upcoming calendar events
 *
 * Authentication:
 * - Requires a valid NextAuth session.
 * - Session must include an `accessToken` (used for Google Calendar API).
 *
 * Error Handling:
 * - 401 Unauthorized → Session missing or invalid.
 * - 500 Server Error → Calendar API or server failure.
 */

/**
 * POST /api/calendar
 *
 * Create one or more new calendar events for the authenticated user.
 *
 * @param req - Incoming request with a JSON array of event objects.
 *   Example body:
 *   [
 *     {
 *       "summary": "Team Meeting",
 *       "start": { "dateTime": "2025-09-20T10:00:00-04:00" },
 *       "end": { "dateTime": "2025-09-20T11:00:00-04:00" }
 *     }
 *   ]
 *
 * @returns {NextResponse} - JSON array of created events, or error response.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  try {
    const accessToken = (session as any).accessToken;
    const events = await req.json(); // JSON array from Gemini or client
    const created = await createEvents(accessToken, events);

    return NextResponse.json(created, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar
 *
 * Retrieve upcoming calendar events for the authenticated user.
 *
 * @param req - Incoming request (no body required).
 *
 * @returns {Response} - JSON array of upcoming events, or error response.
 *   Example success:
 *   [
 *     {
 *       "id": "abcd1234",
 *       "summary": "Team Meeting",
 *       "start": { "dateTime": "2025-09-20T10:00:00-04:00" },
 *       "end": { "dateTime": "2025-09-20T11:00:00-04:00" }
 *     }
 *   ]
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  try {
    const accessToken = (session as any).accessToken;
    const upcomingEvents = await listEvents(accessToken);

    return new Response(JSON.stringify(upcomingEvents), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
