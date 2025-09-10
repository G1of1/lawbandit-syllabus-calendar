import { Task } from "@/types/type";
import { getSession } from "next-auth/react";
import { toast } from 'sonner';

/**
 * @file client-api.ts
 * @description
 * Client-side utilities for interacting with the backend API routes.
 * 
 * - `extractText(file: File)` uploads a file and retrieves its extracted text.
 * - `createEvents(text: string)` sends syllabus text for event extraction.
 */
export async function extractText(file: File) {
  const formdata = new FormData();
  formdata.append("file", file);

  const res = await fetch(`/api/extract`, {
    method: "POST",
    body: formdata,
  });
  const data = await res.json();

  if (data.error) {
    console.error(data.error);
    toast("Error",{
      description: data.error as string,
      duration: 7000,
      action: {
        label: "Close",
        onClick: ()=> console.log()
      }
    })
    return;
  }

  return data;
}

/**
 * Send syllabus text to the `/api/create-events` endpoint
 * to generate structured syllabus events using Gemini.
 *
 * @param text - The raw syllabus text to be processed.
 * @returns {Promise<any>} JSON response containing extracted events or error details.
 *
 * Example:
 * ```ts
 * const syllabusText = "Week 1: Case Brief due 2025-09-10";
 * const events = await createEvents(syllabusText);
 * console.log(events);
 * ```
 */
export const createEvents = async (text: string) => {
  const formdata = new FormData();
  formdata.append("text", text);

  const res = await fetch(`/api/create-events`, {
    method: "POST",
    body: formdata,
  });

  const data = await res.json();

  if (data.error) {
    console.error(data.error);
    toast("Error",{
      description: data.error as string,
      duration: 7000,
      action: {
        label: "Close",
        onClick: ()=> console.log()
      }
    })
    return;
  }

  return data;
};


export const addEventToGoogleCalendar = async (events: Task[]) => {
  let session = await getSession();

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const postEvents = async (accessToken: string) => {
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(events),
    });

    const data = await res.json();
    if (data.error) {
      toast("Error",{
      description: data.error as string,
      duration: 7000,
      action: {
        label: "Close",
        onClick: ()=> console.log()
      }
    })
    }
    return data;
  };

  try {
    // 1️⃣ First attempt
    return await postEvents(session.accessToken);
  } catch (err: any) {
    if (err.message.includes("Invalid Credentials") || err.message.includes("401")) {
      console.warn("Access token expired, retrying with refreshed session…");
      // 2️⃣ Force a session refresh from NextAuth
      session = await getSession();
      if (!session?.accessToken) {
        throw new Error("Failed to refresh access token");
      }
      return await postEvents(session.accessToken);
    }
    throw err;
  }
};

