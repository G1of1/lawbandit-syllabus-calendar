// /app/api/extract/route.ts

import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from "mammoth";

/**
 * 📄 Extract API
 *
 * This route extracts raw text content from uploaded files.
 * Supported formats:
 *   - PDF (`application/pdf`)
 *   - DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
 *
 * Used for processing syllabi or documents before sending them to AI pipelines.
 *
 * Endpoints:
 *   - GET /api/extract  → Health check
 *   - POST /api/extract → Upload a file and extract text
 *
 * 🔑 Authentication: Not required.
 *
 * ⚠️ Limitations:
 *   - Only extracts raw text (no formatting, images, or metadata).
 *   - Returns an error for unsupported file types or failed parsing.
 */

/**
 * GET /api/extract
 *
 * Health check endpoint to verify that the Extract API is up.
 *
 * @returns {NextResponse} - JSON with status message
 *
 * ✅ Example response:
 * {
 *   "status": "ok",
 *   "message": "Extract API is up."
 * }
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Extract API is up.",
  });
}

/**
 * POST /api/extract
 *
 * Upload a file and extract its raw text content.
 *
 * @param req - FormData request with "file" field (PDF or DOCX).
 *
 * @returns {NextResponse} - JSON object containing extracted text,
 *                           or error response.
 *
 * ✅ Example request (multipart/form-data):
 *   file: syllabus.pdf
 *
 * ✅ Example success response:
 * {
 *   "text": "Week 1: Introduction...\nWeek 2: Contracts..."
 * }
 *
 * ❌ Example error responses:
 * {
 *   "error": "No file uploaded"
 * }
 * {
 *   "error": "Unsupported file type: image/png"
 * }
 * {
 *   "error": "Parsing failed: ..."
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer for parsing libraries
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    try {
      if (file.type === "application/pdf") {
        // Parse PDF → extract text
        const result = await pdf(buffer);
        text = result.text;
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Parse DOCX → extract raw text
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

    // Ensure non-empty extracted text
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
