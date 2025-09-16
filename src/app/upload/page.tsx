"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addEventToGoogleCalendar, createEvents, extractText } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, Upload, CalendarPlus, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import { Task } from "@/types/type";
import { handleSave } from "@/lib/db";

/**
 * UploadPage
 * ----------
 * Client-side page where users upload a syllabus (PDF or DOCX).
 * Flow:
 * 1. Upload syllabus file
 * 2. Extract text content (via /api/extract)
 * 3. Parse text into structured assignments (via /api/create-events)
 * 4. Display assignments in scrollable cards
 * 5. User can:
 *    - Save assignments to database
 *    - Sync assignments with Google Calendar
 *
 * Key Integrations:
 * - next-auth for session / userID
 * - toast notifications for UX feedback
 * - framer-motion for animations
 * - Google Calendar API via helper function
 */
export default function UploadPage() {
  const { data: session } = useSession();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);          // Extracted assignments
  const [loading, setLoading] = useState(false);           // Upload + parse loading
  const [assignmentLoading, setAssignmentLoading] = useState(false); // Save button loading
  const [calendarLoading, setCalendarLoading] = useState(false);     // Calendar sync loading
  const [calendarLink, setCalendarLink] = useState<string | null>(null); // Link to Google Calendar after sync
  const [file, setFile] = useState<File | null>(null);     // Uploaded syllabus file

  const userID = session?.user.id;

  // Toast shorthand helpers
  const notify = {
    info: (msg: string) => toast.info(msg),
    success: (msg: string) => toast.success(`✅ ${msg}`),
    error: (msg: string) => toast.error(`❌ ${msg}`),
  };

  /**
   * Handle file selection
   * - Stores file in state
   * - Fires toast to confirm upload
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFile(file);
      notify.info(`📝 File Uploaded: ${file.name}`);
    }
  };

  /**
   * Upload form submit handler
   * - Sends file to /api/extract → extracts syllabus text
   * - Sends text to /api/create-events → parses into structured tasks
   * - Updates UI with parsed tasks
   */
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTasks([]);
    setCalendarLink(null);

    try {
      if (!file) {
        notify.error("No file provided");
        return;
      }

      // Step 1: Extract raw text from syllabus
      const text = (await extractText(file as File)) as string;
      if (!text) {
        notify.error("Couldn't parse text");
        return;
      }

      // Step 2: Generate structured assignments from syllabus text
      const tasks = await createEvents(text);
      setTasks(tasks);
    } catch (error: any) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save parsed tasks to database
   * Uses helper `handleSave` which stores tasks linked to userID
   */
  const handleSaveTasks = async () => {
    try {
      setAssignmentLoading(true);
      await handleSave(tasks, userID as string);
      notify.success("Assignments saved!");
    } catch {
      notify.error("Error saving assignments");
    } finally {
      setAssignmentLoading(false);
    }
  };

  /**
   * Sync assignments to Google Calendar
   * - Uses Google Calendar API helper
   * - Returns a link to the user’s calendar once done
   */
  const handleAddToCalendar = async () => {
    if (!tasks.length || !session) return;
    setCalendarLoading(true);
    setCalendarLink(null);
    try {
      const events = await addEventToGoogleCalendar(tasks);
      notify.success(`All ${events.length} assignments added to Google Calendar`);
      setCalendarLink("https://calendar.google.com/calendar/u/0/r");
    } catch (error: any) {
      notify.error("Error adding assignments to Google Calendar...");
    } finally {
      setCalendarLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-white flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* =====================
            Upload Form
        ====================== */}
        <motion.form
          onSubmit={handleUpload}
          className="w-full space-y-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-gray-700 p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-center">Upload Your Syllabus</h1>
          <p className="text-gray-300 text-center">
            Upload your syllabus as a <span className="font-semibold">PDF</span> or{" "}
            <span className="font-semibold">DOCX</span>, and let AI do the heavy lifting.
            It will extract deadlines and assignments, and you can{" "}
            <span className="text-indigo-400">sync them with Google Calendar</span> so you
            never miss a deadline again.
          </p>

          {/* File input */}
          <input
            type="file"
            name="file"
            accept=".pdf,.docx"
            className="block w-full rounded-lg border border-gray-600 bg-[#2a2725] p-3 text-sm text-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            onChange={handleFileChange}
          />

          {/* Upload button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black shadow hover:bg-gray-500 disabled:opacity-50 active:scale-95 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
          </motion.button>
        </motion.form>

        {/* =====================
            Parsed Assignments
        ====================== */}
        {tasks.length > 0 && (
          <motion.div
            className="space-y-6 rounded-2xl border border-gray-700 bg-white/10 backdrop-blur-lg p-8 shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-semibold text-gray-100">Extracted Assignments</h2>

            {/* Scrollable cards list */}
            <div className="grid grid-flow-col auto-cols-[250px] gap-4 overflow-x-auto pb-4">
              {tasks.map((task, idx) => (
                <motion.div
                  key={idx}
                  className="rounded-lg border border-gray-700 bg-[#2a2725] p-4 flex-shrink-0 shadow hover:shadow-lg transition"
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

            {/* Save + Calendar buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Save to DB */}
              <motion.button
                onClick={handleSaveTasks}
                disabled={assignmentLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white shadow hover:bg-green-700 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {assignmentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Assignments"}
              </motion.button>

              {/* Sync to Google Calendar */}
              <motion.button
                onClick={handleAddToCalendar}
                disabled={calendarLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
              </motion.button>
            </div>

            {/* Calendar link after sync */}
            {calendarLink && (
              <motion.a
                href={calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 text-indigo-400 hover:underline"
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
