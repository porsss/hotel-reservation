// src/components/AuthStatus.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthStatus = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session (updated for Supabase v2.x API)
    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Clean up subscription
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="p-4">
      {user ? (
        <p className="text-green-600">ยินดีต้อนรับ {user.email}</p>
      ) : (
        <p className="text-amber-600">กรุณาเข้าสู่ระบบ</p>
      )}
    </div>
  );
};

export default AuthStatus;
