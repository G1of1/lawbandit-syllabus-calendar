"use client";
import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "@/lib/db";
import { Task } from "@/types/type";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Download } from "lucide-react";
import { toast } from "react-toastify";
import { addEventToGoogleCalendar } from "@/lib/api";
import { useSession } from "next-auth/react";

type SortOption = "name" | "date";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null); // 👈 for modal
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();
  const userID = session?.user.id;

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
      toast.error("❌ Error deleting assignment");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const addToGoogleCalendar = async (tasks: Task[], id: number) => {
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

  const filteredTasks = sortedTasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const getDaysLeft = (date: string) => {
    const today = new Date();
    const due = new Date(date);
    const diff = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const getBadgeColor = (daysLeft: number) => {
    if (daysLeft < 0) return "bg-red-500 text-white"; // overdue
    if (daysLeft <= 3) return "bg-yellow-500 text-black"; // urgent
    return "bg-green-500 text-white"; // safe
  };

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
        View assignments here. Search, sort, delete, or sync them with Google
        Calendar.
      </h3>

      {/* Search + Sort Controls */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 md:items-center">
        <input
          type="text"
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-gray-300 bg-white text-black p-2"
        />
        <div className="flex items-center gap-2">
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
      </div>

      {filteredTasks.length > 0 ? (
        <motion.div layout>
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const daysLeft = getDaysLeft(task.date);
              return (
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
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs rounded-full font-medium ${getBadgeColor(
                          daysLeft
                        )}`}
                      >
                        {daysLeft < 0
                          ? "Overdue"
                          : daysLeft === 0
                          ? "Due Today"
                          : `Due in ${daysLeft} day${
                              daysLeft === 1 ? "" : "s"
                            }`}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setConfirmId(task.id)} // 👈 open modal
                      disabled={deletingId === task.id}
                      className="text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50"
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
                  </div>
                </motion.div>
              );
            })}
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
        {confirmId !== null && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 text-center w-80"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-lg font-semibold mb-4 text-black">
                Are you sure you want to delete this assignment?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDelete(confirmId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
