// lib/db.ts
// Database utility functions for handling user tasks in Supabase

import { supabase } from "./supabaseClient";
import { Task } from "@/types/type";

/**
 * Save tasks to Supabase
 * ----------------------
 * @param tasks - Array of Task objects to save
 * @param userId - The current authenticated user's ID
 * @returns The inserted tasks
 *
 * Notes:
 * - Automatically attaches the `user_id` to each task
 * - Throws an error if Supabase insert fails
 */
export const handleSave = async (tasks: Task[], userId: string) => {
  const tasksWithUser = tasks.map((t) => ({
    ...t,
    user_id: userId,
  }));

  const { data, error } = await supabase.from("tasks").insert(tasksWithUser);
  if (error) throw error;

  return data;
};

/**
 * Get tasks for a user
 * --------------------
 * @param userId - The current authenticated user's ID
 * @returns All tasks belonging to the user
 *
 * Notes:
 * - Filters by `user_id` so users only see their own tasks
 */
export const getTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

/**
 * Delete a task by ID
 * -------------------
 * @param id - The task ID
 * @param userId - The current authenticated user's ID
 * @returns void
 *
 * Notes:
 * - Ensures the task belongs to the user before deleting
 * - Throws if Supabase returns an error
 */
export const deleteTask = async (id: number, userId: string) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};
