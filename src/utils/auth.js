// src/utils/auth.js
import { supabase } from "../supabaseClient";

// Admin email list - you can add more admin emails here
const ADMIN_EMAILS = ["admin@gmail.com"];

/**
 * Check if the current user is authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>}
 */
export const isAdmin = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return false;
    }

    // Check if user's email is in the admin list
    const userEmail = session.user.email;
    return ADMIN_EMAILS.includes(userEmail);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Get the current user data
 * @returns {Promise<object|null>}
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
