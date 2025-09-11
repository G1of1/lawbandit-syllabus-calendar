//TODO: Include times for certain events, and also fix prompt for model
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addEventToGoogleCalendar, createEvents, extractText } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, Upload, CalendarPlus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Task } from "@/types/type";


export default function UploadPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarMessage, setCalendarMessage] = useState("");
  const [calendarLink, setCalendarLink] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) {
    const file = e.target.files[0];
    setFile(file);
    toast("📂 File Uploaded", {
      description: file.name,
      action: {
        label: "Close",
        onClick: () => console.log("Toast closed"),
      },
    });
  }
};
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTasks([]);
    setCalendarMessage("");
    setCalendarLink(null);
    try {
      if (!file) {
        toast("Error ❌", {
          description: 'No file provided',
          duration: 5000,
          action: {
            label: "Close",
            onClick: ()=> console.log()
          }
        })
        return;
      }
        
      const text = await extractText(file as File);
      if (!text) return;
      const tasks = await createEvents(text);
      setTasks(tasks);
    } catch (error: any) {
      console.error(error.message as string);
      toast("Error",{
        description: error.message as string,
        duration: 5000,
        action: {
          label: "Close",
          onClick: ()=> console.log()
        }
      })
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!tasks.length || !session) return;
    setCalendarLoading(true);
    setCalendarMessage("");
    setCalendarLink(null);
    setError("");
    try {
      const events = await addEventToGoogleCalendar(tasks);
      setCalendarMessage(
        `✅ Successfully added ${events.length} events to Google Calendar!`
      );
      setCalendarLink("https://calendar.google.com/calendar/u/0/r"); // direct calendar link
    } catch (error: any) {
      toast("Error",{
        description: error.message as string,
        duration: 5000,
        action: {
          label: "Close",
          onClick: ()=> console.log()
        }
      })
      console.error(error.message as string)
    } finally {
      setCalendarLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Upload Form */}
        <motion.form
          onSubmit={handleUpload}
          className="space-y-4 rounded-xl border border-gray-700 bg-[#1e1c1a] p-6 shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-white">
            Upload Your Syllabus
          </h1>
          <p className="text-gray-400 text-sm">
            Upload your PDF or DOCX file. AI will extract important
            dates and tasks, and you can sync them with Google Calendar.
          </p>

          <input
            type="file"
            name="file"
            accept=".pdf,.docx"
            className="block w-full rounded-full border border-gray-600 bg-[#2a2725] p-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-blue-500"
            onChange={handleFileChange}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-2 font-medium text-[#2a2725] cursor-pointer shadow hover:bg-gray-300 disabled:opacity-50 active:scale-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" /> Upload Syllabus
              </>
            )}
          </button>
        </motion.form>

        {/* Error Message */}
        {error && (
          <motion.p
            className="text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Parsed Tasks */}
        {tasks.length > 0 && (
  <motion.div
    className="space-y-4 rounded-xl border border-gray-700 bg-[#1e1c1a] p-6 shadow-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <h2 className="text-xl font-semibold text-gray-100">
      Extracted Tasks
    </h2>

    {/* Horizontal scrollable grid */}
    <div className="grid grid-flow-col auto-cols-[250px] gap-4 overflow-x-auto pb-4">
      {tasks.map((task, idx) => (
        <motion.div
          key={idx}
          className="rounded-lg border border-gray-700 bg-[#2a2725] p-4 flex-shrink-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <p className="font-semibold text-white">{task.title}</p>
          <p className="text-sm text-gray-400">{task.date}</p>
          <p className="text-sm text-gray-300">{task.description}</p>
        </motion.div>
      ))}
    </div>

    {/* Add to Calendar Button */}
    <button
      onClick={handleAddToCalendar}
      disabled={calendarLoading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-50"
    >
      {calendarLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" /> Adding to Google Calendar...
        </>
      ) : (
        <>
          <CalendarPlus className="h-5 w-5" /> Add All to Google Calendar
        </>
      )}
    </button>

    {calendarMessage && (
      <motion.p
        className="mt-2 text-green-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {calendarMessage}
      </motion.p>
    )}

    {calendarLink && (
      <motion.a
        href={calendarLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-2 text-blue-400 hover:underline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ExternalLink className="h-4 w-4" /> Open Google Calendar
      </motion.a>
    )}
  </motion.div>
)}
      </div>
    </div>
  );
}
