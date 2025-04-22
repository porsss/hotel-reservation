// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Using a fallback approach for better error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error) => {
  console.error("Supabase error:", error);
  return error.message || "An unexpected error occurred";
};

export default supabase;
