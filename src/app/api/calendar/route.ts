import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createEvents, listEvents } from "@/lib/calendar";


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return  NextResponse.json("Unauthorized", { status: 401 });
  try{
    const accessToken = (session as any).accessToken;
    console.log(session);
  const events = await req.json(); // JSON array from Gemini

  const created = await createEvents(accessToken, events);
  return NextResponse.json(created, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  }
  catch(error: any) {
    return NextResponse.json({error: `Server Error: ${error.message}`}, {status: 500})
  }
  
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  try{
    const accessToken = (session as any).accessToken;
    const upcomingEvents = await listEvents(accessToken);

    return new Response(JSON.stringify(upcomingEvents), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  }
  catch(error: any) {
    return NextResponse.json({error: `Server Error: ${error.message}`}, {status: 500})
  }

  
}