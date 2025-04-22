// src/pages/Register.jsx
import { useState } from "react";
import { supabase, handleSupabaseError } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      Swal.fire({
        title: "สมัครสมาชิกสำเร็จ",
        text: "กรุณายืนยันอีเมลของคุณ และเข้าสู่ระบบ",
        icon: "success",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      setError(handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-amber-50">
      <div className="rounded-3xl w-full max-w-md p-10 bg-gray-100 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-3">สมัครสมาชิก</h2>
        <form onSubmit={handleRegister}>
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
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              className="form-control w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <button
              type="submit"
              className="btn btn-success w-full"
              disabled={loading}
            >
              {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
            </button>
          </div>
        </form>
        <hr className="my-4" />
        <div className="text-center">
          <Link className="text-black hover:underline" to="/login">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
