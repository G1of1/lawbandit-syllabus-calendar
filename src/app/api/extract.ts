/**
 * @file extract.ts
 * @description
 * Utility functions to extract plain text from uploaded files.
 * 
 * Supported formats:
 *   - PDF (.pdf) via `pdf-parse`
 *   - DOCX (.docx) via `mammoth`
 *   - Images (.png, .jpg, etc.) via `tesseract.js` (OCR)
 */

import pdf from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import { toast } from "sonner";

/**
 * Extract text from a PDF buffer using `pdf-parse`.
 *
 * @param buffer - The file buffer containing PDF data.
 * @returns {Promise<string>} Extracted plain text from the PDF.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

/**
 * Extract text from a DOCX buffer using `mammoth`.
 *
 * @param buffer - The file buffer containing DOCX data.
 * @returns {Promise<string>} Extracted plain text from the DOCX.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

/**
 * Extract text from an image buffer using OCR (`tesseract.js`).
 *
 * @param buffer - The file buffer containing image data (PNG, JPG, etc.).
 * @returns {Promise<string>} Extracted text from the image.
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const {
    data: { text },
  } = await Tesseract.recognize(buffer, "eng");
  return text;
}

/**
 * Generic file wrapper for uploaded files, used in API routes.
 */
export interface UploadedFile {
  /** File content as a Node.js Buffer */
  buffer: Buffer;
  /** MIME type of the file (e.g., application/pdf, image/png) */
  mimetype: string;
  /** Original filename (used as a fallback for type detection) */
  originalname: string;
}

/**
 * Unified text extractor that routes the uploaded file buffer
 * to the correct parser based on mimetype or file extension.
 *
 * @param file - The uploaded file object (buffer, mimetype, originalname).
 * @returns {Promise<string>} Extracted text from the file.
 * @throws Will throw an error if the file type is unsupported.
 */
export async function textExtractor(file: UploadedFile): Promise<string> {
  const { buffer, mimetype, originalname } = file;

  try {
    if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
    return await extractTextFromPDF(buffer);
  }

  // Handle DOCX files
  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalname.endsWith(".docx")
  ) {
    return await extractTextFromDocx(buffer);
  }

  // Handle image files (PNG, JPG, etc.)
  if (mimetype.startsWith("image/")) {
    return await extractTextFromImage(buffer);
  }
  }
  catch(error: any) {
    console.error(error as string);
    toast("Error",{
    description: `Unsupported file type: ${mimetype}`,
    duration: 7000,
    action: {
        label: "Close",
        onClick: ()=> console.log()
      }
  })
  }  
  // Fallback for unsupported formats
  throw new Error(`Unsupported file type: ${mimetype}`);

}
