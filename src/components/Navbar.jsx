// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import "./css/navbar.css";

const Navbar = () => {
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setIsLoggedIn(true);
          setUserName(session.user.email || "ผู้ใช้งาน");
        } else {
          setIsLoggedIn(false);
          setUserName("");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserName(session.user.email || "ผู้ใช้งาน");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("auth");

      Swal.fire({
        icon: "success",
        title: "ออกจากระบบสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="navbar d-flex justify-content-between px-5 py-3 bg-amber-400 shadow-xl">
          <div className="d-flex align-items-center">
            <h3 className="font-bold my-0 me-4">โรงแรม</h3>
            <Link to="/" className="link-item my-auto ms-3 text-black">
              จองห้องพัก
            </Link>
            <Link
              to="/booking-status"
              className="link-item my-auto ms-3 text-black"
            >
              ตรวจสอบสถานะการจอง
            </Link>
          </div>
          <div>
            {isLoggedIn ? (
              <Dropdown
                label={userName}
                options={[{ label: "ออกจากระบบ", action: handleLogout }]}
              />
            ) : (
              <div className="d-flex gap-3">
                <Link to="/login" className="btn btn-outline-dark btn-sm">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="btn btn-dark btn-sm">
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
