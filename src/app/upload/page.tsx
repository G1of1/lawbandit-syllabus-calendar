"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addEventToGoogleCalendar, createEvents, extractText } from "@/lib/api";

export default function UploadPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarMessage, setCalendarMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      console.log("File selected:", e.target.files[0]);
    }
  };

  // 1️⃣ Upload syllabus and parse tasks
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTasks([]);
    setCalendarMessage("");
    try {
      if(!file) return;
      const text = await extractText(file as File);
      if(!text) return;
      const tasks = await createEvents(text);
      console.log('Created Events:', tasks);
      setTasks(tasks);

    } 
    catch (error: any) {
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  };

  // 2️⃣ Send tasks to Google Calendar
  const handleAddToCalendar = async () => {
    if (!tasks.length || !session) return;
    setCalendarLoading(true);
    setCalendarMessage("");
    setError("");
    try {
      const events = await addEventToGoogleCalendar(tasks);
      setCalendarMessage(`Successfully added ${events.length} events to Google Calendar!`);
      console.log(events);
    } catch (err: any) {
      setCalendarMessage(`Error: ${err.message}`);
      setError(error as string);
    } finally {
      setCalendarLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          name="file"
          accept=".pdf,.docx,image/*"
          className="block w-full border p-2 rounded"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-black rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upload Syllabus"}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* Parsed Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Extracted Tasks</h2>
          <ul className="space-y-2">
            {tasks.map((task, idx) => (
              <li key={idx} className="p-3 border rounded bg-gray-50">
                <p className="font-semibold">{task.title}</p>
                <p className="text-gray-600 text-sm">{task.date}</p>
                <p className="text-sm">{task.description}</p>
              </li>
            ))}
          </ul>

          {/* Add to Calendar Button */}
          <button
            onClick={handleAddToCalendar}
            disabled={calendarLoading}
            className="mt-4 px-4 py-2 bg-indigo-600 text-black rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {calendarLoading ? "Adding to Google Calendar..." : "Add All to Google Calendar"}
          </button>

          {calendarMessage && <p className="mt-2 text-green-600">{calendarMessage}</p>}
        </div>
      )}
    </div>
  );
}
