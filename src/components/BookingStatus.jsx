// src/components/BookingStatus.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "./Navbar";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const BookingStatus = () => {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Get current user and fetch their bookings on component mount
  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          // Optional: redirect to login if not logged in
          // navigate('/login');
          setError("กรุณาเข้าสู่ระบบเพื่อดูการจองของคุณ");
          setLoading(false);
          return;
        }

        setUser(session.user);
        console.log("User session:", session.user.email);

        // Fetch user's bookings by email
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .eq("email", session.user.email)
          .order("created_at", { ascending: false });

        if (bookingsError) throw bookingsError;

        if (bookings.length > 0) {
          // For each booking, get its payment status
          const bookingsWithPayment = await Promise.all(
            bookings.map(async (booking) => {
              const { data: payment } = await supabase
                .from("payments")
                .select("status")
                .eq("booking_id", booking.id)
                .maybeSingle();

              return {
                ...booking,
                paymentStatus: payment?.status || "pending",
              };
            })
          );

          setUserBookings(bookingsWithPayment);
        } else {
          setUserBookings([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("ไม่สามารถดึงข้อมูลการจองได้");
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBookings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="badge bg-success">ชำระเงินแล้ว</span>;
      case "pending":
        return (
          <span className="badge bg-warning text-dark">รอการชำระเงิน</span>
        );
      default:
        return <span className="badge bg-secondary">ไม่ทราบสถานะ</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="card mx-5 my-5 bg-white shadow-md rounded-lg">
        <div className="card-body py-5 px-5">
          <h1 className="text-xl font-bold mb-4">การจองของฉัน</h1>

          {error && (
            <div className="alert alert-warning">
              <p>{error}</p>
              {!user && (
                <div className="mt-3">
                  <Link to="/login" className="btn btn-primary me-2">
                    เข้าสู่ระบบ
                  </Link>
                  <Link to="/register" className="btn btn-outline-primary">
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">กำลังโหลด...</span>
              </div>
              <p className="mt-2">กำลังโหลดข้อมูลการจอง...</p>
            </div>
          ) : (
            <>
              {user && userBookings.length === 0 ? (
                <div className="alert alert-info">
                  <p>คุณยังไม่มีการจองในระบบ</p>
                  <Link to="/" className="btn btn-primary mt-3">
                    จองห้องพักเลย
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>หมายเลขการจอง</th>
                        <th>ชื่อผู้จอง</th>
                        <th>ประเภทห้อง</th>
                        <th>ชื่อห้อง</th>
                        <th>วันที่เข้าพัก</th>
                        <th>วันที่ออก</th>
                        <th>สถานะการชำระเงิน</th>
                        <th>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.id}</td>
                          <td>{booking.full_name}</td>
                          <td>{booking.room_type || "-"}</td>
                          <td>{booking.room_name || "-"}</td>
                          <td>{formatDate(booking.check_in)}</td>
                          <td>{formatDate(booking.check_out)}</td>
                          <td>{getStatusBadge(booking.paymentStatus)}</td>
                          <td>
                            {booking.paymentStatus === "pending" ? (
                              <Link
                                to={`/payment/${booking.id}`}
                                className="btn btn-sm btn-warning"
                              >
                                ชำระเงิน
                              </Link>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-success"
                                disabled
                              >
                                ชำระเงินแล้ว
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;
