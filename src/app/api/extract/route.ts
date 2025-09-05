// /app/api/extract/route.ts

import { NextRequest, NextResponse } from "next/server";
import { textExtractor } from "../extract";

/**
 * API Route: /api/extract
 *
 * This endpoint accepts a file upload (PDF, DOCX, or image),
 * extracts its text content using the `textExtractor` utility,
 * and returns the raw extracted text.
 *
 * Supported file types depend on the implementation of `textExtractor`
 * (e.g., pdf-parse for PDFs, mammoth for DOCX, Tesseract for images).
 *
 * ---
 * Example Request:
 * POST /api/extract
 * Content-Type: multipart/form-data
 *
 * file=<uploaded_file>
 *
 * Example Success Response (200 OK):
 * {
 *   "text": "Week 1: Read Chapter 1 and submit case brief..."
 * }
 *
 * Example Error Response (400 Bad Request):
 * {
 *   "error": "No file uploaded"
 * }
 *
 * Example Error Response (500 Server Error):
 * {
 *   "error": "Server Error: Failed to process file"
 * }
 */

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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a file-like object for the extractor
    const uploadedFile = {
      buffer,
      mimetype: file.type,
      originalname: file.name,
    };

    // Use the text extractor utility to extract plain text
    const text = await textExtractor(uploadedFile);

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
