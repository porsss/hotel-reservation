// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "ยืนยันการออกจากระบบ",
        text: "คุณต้องการออกจากระบบใช่หรือไม่?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ใช่, ออกจากระบบ",
        cancelButtonText: "ยกเลิก",
      });

      if (result.isConfirmed) {
        await supabase.auth.signOut();
        localStorage.removeItem("auth");

        Swal.fire({
          title: "ออกจากระบบสำเร็จ",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถออกจากระบบได้ โปรดลองอีกครั้ง",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-0">
      <div className="row g-0">
        <div className="col-md-2 col-lg-2 col-xl-2 p-0 d-none d-md-block">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10 col-lg-10 col-xl-10">
          <div className="row g-0">
            <div className="col-12 py-3 bg-white shadow-md flex justify-between px-4 align-items-center">
              <h5 className="mb-0 font-semibold">ระบบจัดการโรงแรม</h5>
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <Outlet />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Trigger - visible only on small screens */}
        <div className="position-fixed bottom-0 end-0 m-4 d-md-none">
          <button
            className="btn btn-primary rounded-circle shadow-lg p-3"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileSidebar"
            aria-controls="mobileSidebar"
          >
            <span className="fs-4">≡</span>
          </button>
        </div>

        {/* Mobile Sidebar Offcanvas - visible only on small screens */}
        <div
          className="offcanvas offcanvas-start d-md-none"
          tabIndex="-1"
          id="mobileSidebar"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">ระบบจัดการโรงแรม</h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body p-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
