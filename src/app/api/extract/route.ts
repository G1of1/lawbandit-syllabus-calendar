// /app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs"; // ensure we get full Node.js APIs on Vercel

// Health check for GET requests
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Extract API is up. Use POST with form-data 'file'.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Node.js buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    if (file.type === "application/pdf") {
      const result = await pdf(buffer);
      text = result.text;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text }, { status: 200 });
  } catch (error: any) {
    console.error("Extract API error:", error);
    return NextResponse.json(
      { error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
