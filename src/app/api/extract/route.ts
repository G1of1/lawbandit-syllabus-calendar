// /app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from 'mammoth';
// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Extract API is up.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer for Node libraries
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";
    
    try {
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
    } catch (parseErr: any) {
      console.error("Parsing failed:", parseErr);
      return NextResponse.json(
        { error: `Parsing failed: ${parseErr.message}` },
        { status: 500 }
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
