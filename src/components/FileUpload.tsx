"use client";

import { createEvents, extractText } from "@/lib/api";
import { useState } from "react";

interface Props {
  onEventsExtracted: (events: any[]) => void;
}

export default function FileUpload({ onEventsExtracted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      console.log("File selected:", e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await extractText(file);
      if (!data) return;
      const events = await createEvents(data);
      console.log("Created events:", events);
      onEventsExtracted(events);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <input
        type="file"
        accept=".pdf,.docx,image/*"
        className="border p-2 rounded"
        onChange={handleFileChange}
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="border-white rounded-xl mt-4 border-2 py-4 px-6 hover:bg-white hover:text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:bg-red-500"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {loading && <p className="mt-2 text-gray-600">Extracting tasks...</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
