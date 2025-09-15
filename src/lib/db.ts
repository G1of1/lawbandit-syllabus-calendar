// lib/db.ts
//TODO: Figure out invalid API key error
import { supabase } from "./supabaseClient";
import { Task } from "@/types/type";

// Save tasks
export const handleSave = async(tasks: Task[]) => {
  const { data, error } = await supabase.from("tasks").insert(tasks);
  if (error) {
    console.error(`Supabase Error: ${error.message}`);
  }
  return data;
}

export const getTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if(error) {
        console.error(`Supabase Error: ${error.message}`);
        return;
    }
    return data;
}

export const deleteTask = async (id: number) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    console.error(`Supabase Error: ${error.message}`);
    return;
  }
}