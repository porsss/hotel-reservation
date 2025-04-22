// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/sidebar.css";
import { supabase } from "../supabaseClient";

const Sidebar = () => {
  const [userName, setUserName] = useState("ผู้ดูแลระบบ");
  const location = useLocation();

  useEffect(() => {
    // Fetch user data from current session
    const getUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUserName(session.user.email || "ผู้ดูแลระบบ");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserData();
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? "active-item" : "";
  };

  return (
    <div className="h-screen m-0 sidebar shadow-xl px-3">
      <div className="profile pt-3">
        <p className="text-white font-medium text-xl">ชื่อ: {userName}</p>
      </div>
      <hr className="border-gray-600 my-3" />
      <div className="w-full flex flex-col justify-between">
        <Link
          className={`side-item text-white ms-3 py-2 ${isActive(
            "/admin/manage-rooms"
          )}`}
          to="/admin/manage-rooms"
        >
          จัดการห้องพัก
        </Link>
        <Link
          className={`side-item text-white ms-3 py-2 ${isActive(
            "/admin/manage-payments"
          )}`}
          to="/admin/manage-payments"
        >
          จัดการการชำระเงิน
        </Link>
      </div>

      <div className="mt-auto pt-10">
        <div className="text-center text-gray-400 text-sm mt-10">
          <p>ระบบจัดการโรงแรม</p>
          <p>เวอร์ชัน 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
