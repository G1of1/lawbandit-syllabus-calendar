"use client";
import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "@/lib/db";
import { Task } from "@/types/type";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { addEventToGoogleCalendar } from "@/lib/api";
import { useSession } from "next-auth/react";

type SortOption = "name" | "date";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();
  const userID = session?.user.id;

  // Modal state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getTasks(userID as string);
        setTasks(data as Task[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteTask(id, userID as string);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("✅ Assignment deleted");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("❌ Failed to delete assignment");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const addToGoogleCalendar = async (tasks: Task[], id: number) => {
    if (!tasks) {
      toast.error("❌Error saving assignment to Google Calendar");
    }
    try {
      setDeletingId(id);
      await addEventToGoogleCalendar(tasks);
      toast.success(`✅ Assignment has been added to Google Calendar`);
    } catch (error) {
      toast.error("❌ Error saving assignment to Google Calendar");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "date") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-20 w-20 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Saved Assignments</h1>
      <h3 className="text-lg font-semibold mb-4">
        View assignments here. You have the option to delete assignments or save
        them to Google Calendar.
      </h3>

      {/* Sort Menu */}
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="sort" className="font-medium">
          Sort by:
        </label>
        <motion.select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded border border-gray-300 bg-white text-black p-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
        </motion.select>
      </div>

      {sortedTasks.length > 0 ? (
        <motion.div layout>
          <AnimatePresence>
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="p-4 border rounded mb-2 bg-white text-black shadow flex justify-between items-center"
              >
                {deletingId === task.id ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.date}</p>
                    <p className="text-sm">{task.description}</p>
                  </div>
                )}

                <motion.button
                  onClick={() => setConfirmDeleteId(task.id)} // 👈 open modal
                  disabled={deletingId === task.id}
                  className="text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50 mr-5"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>

                <motion.button
                  onClick={() => addToGoogleCalendar([task], task.id)}
                  disabled={deletingId === task.id}
                  className="text-blue-500 hover:text-blue-700 cursor-pointer disabled:opacity-50"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="h-5 w-5" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-lg">No Saved Assignments</h3>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-xl font-bold mb-4 text-black">Are you sure?</h2>
              <p className="text-black mb-6">
                This will permanently delete the assignment.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
