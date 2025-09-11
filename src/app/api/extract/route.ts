// /app/api/extract/route.ts

import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs"; // ensure we get full Node.js APIs on Vercel


export async function POST(req: NextRequest) {
  try {
    // Parse form-data and retrieve the uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      // Reject if no file is included in the request
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the uploaded file into a Node.js Buffer
     const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

      if (file.type === "application/pdf") {
    const result = await pdf(buffer);
    text = result.text;
  } 
  
  else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  }
    console.log(text);

    if (!text) {
      // Handle extraction failures or empty results
      return NextResponse.json(
        { error: "Missing syllabus file or error extracting syllabus text." },
        { status: 400 }
      );
    }

    // Return extracted text as JSON
    return NextResponse.json(text, { status: 200 });

  } catch (error: any) {
    // Catch and report server-side errors
    console.error(error.message as string);
    return NextResponse.json(
      { error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
