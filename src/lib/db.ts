// lib/db.ts
//TODO: Figure out invalid API key error
import { supabase } from "./supabaseClient";
import { Task } from "@/types/type";

// Save tasks
export const handleSave = async(tasks: Task[], userId: string) =>{
  const tasksWithUser = tasks.map((t) => ({
    ...t,
    user_id: userId,
  }));

  const { data, error } = await supabase.from("tasks").insert(tasksWithUser);
  if (error) throw error;

  return data;
}

export const getTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}


export const deleteTask = async (id: number, userId: string) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
