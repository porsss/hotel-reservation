// src/pages/Login.jsx
import { useState } from "react";
import { supabase, handleSupabaseError } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Store auth info in localStorage for persistence
      localStorage.setItem("auth", JSON.stringify(data));

      // Check if the user is admin and redirect accordingly
      if (email.toLowerCase() === "admin@gmail.com") {
        Swal.fire({
          title: "เข้าสู่ระบบผู้ดูแลสำเร็จ",
          text: "กำลังนำคุณไปยังหน้าจัดการระบบ",
          icon: "success",
          timer: 1500,
        }).then(() => {
          navigate("/admin/manage-rooms");
        });
      } else {
        Swal.fire({
          title: "เข้าสู่ระบบสำเร็จ",
          text: "ยินดีต้อนรับเข้าสู่ระบบ",
          icon: "success",
          timer: 1500,
        }).then(() => {
          navigate("/");
        });
      }
    } catch (error) {
      setError(handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-amber-50">
      <div className="rounded-3xl w-full max-w-md p-10 bg-gray-100 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-3">เข้าสู่ระบบ</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              placeholder="อีเมล"
              className="form-control w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control w-full"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <button
              type="submit"
              className="btn btn-success w-full"
              disabled={loading}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </div>
        </form>
        <hr className="my-4" />
        <div className="text-center">
          <Link className="text-black hover:underline" to="/register">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
