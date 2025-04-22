// src/components/PaymentForm.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "./Navbar";

const PaymentForm = () => {
  const { bookingId } = useParams(); // Now using useParams instead of useLocation
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch booking details and pre-fill the form
  useEffect(() => {
    const fetchBookingAndPaymentStatus = async () => {
      try {
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (bookingError) throw bookingError;

        setBookingDetails(bookingData);
        setFullName(bookingData.full_name || "");
        setPhone(bookingData.phone || "");
        setEmail(bookingData.email || "");

        // Check if payment already exists
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select("status")
          .eq("booking_id", bookingId)
          .maybeSingle();

        if (!paymentError && paymentData) {
          setPaymentStatus(paymentData.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "ไม่พบข้อมูลการจอง",
          text: "ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง",
        }).then(() => {
          navigate("/");
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingAndPaymentStatus();
    }
  }, [bookingId, navigate]);

  // Handle file upload
  const handlePaymentSlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentSlip(file);
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!fullName || !phone || !email || !paymentSlip) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดสลิป",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload payment slip to Supabase Storage
      const timestamp = new Date().getTime();
      const filePath = `slips/${timestamp}-${paymentSlip.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(filePath, paymentSlip);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("payment-slips")
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl || filePath;

      // Save payment data in database
      const { error: paymentError } = await supabase.from("payments").insert([
        {
          booking_id: bookingId,
          full_name: fullName,
          phone,
          email,
          payment_slip: publicUrl,
          status: "pending", // Default status
        },
      ]);

      if (paymentError) throw paymentError;

      Swal.fire({
        icon: "success",
        title: "ส่งหลักฐานการชำระเงินเรียบร้อย",
        text: "เจ้าหน้าที่จะตรวจสอบและยืนยันการชำระเงินของคุณต่อไป",
      }).then(() => {
        setPaymentStatus("pending");
        navigate("/booking-status");
      });
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถส่งหลักฐานการชำระเงินได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar userName={"ผู้ใช้งาน"} />
        <div className="container py-5 text-center">
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // If payment is already completed, show confirmation screen
  if (paymentStatus === "completed") {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar userName={"ผู้ใช้งาน"} />
        <div className="card mx-5 my-5">
          <div className="card-body px-5 py-5">
            <h1 className="text-xl font-bold mb-4">สถานะการชำระเงิน</h1>
            <div className="alert alert-success">
              <p>การชำระเงินของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={() => navigate("/")}
            >
              กลับไปหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar userName={"ผู้ใช้งาน"} />
      <div className="card mx-5 my-5">
        <div className="card-body px-5 py-5">
          <div className="row">
            <div className="col-12 col-sm-12 col-md-6 d-flex justify-content-center">
              <div className="p-4 bg-gray-50 rounded shadow-sm w-full">
                <h2 className="text-lg font-semibold mb-3">ข้อมูลการจอง</h2>
                {bookingDetails && (
                  <>
                    <p>
                      <strong>ห้อง:</strong> {bookingDetails.room_id}
                    </p>
                    <p>
                      <strong>ชื่อผู้จอง:</strong> {bookingDetails.full_name}
                    </p>
                    <p>
                      <strong>วันที่เข้าพัก:</strong>{" "}
                      {new Date(bookingDetails.check_in).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>วันที่ออก:</strong>{" "}
                      {new Date(bookingDetails.check_out).toLocaleDateString()}
                    </p>
                  </>
                )}
                <div className="alert alert-warning mt-3">
                  <p className="text-sm">โอนเงินมาที่:</p>
                  <p className="font-semibold">บัญชีธนาคาร: XXX-X-XXXXX-X</p>
                  <p className="font-semibold">ชื่อบัญชี: โรงแรม XYZ</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-6">
              <h1 className="text-xl font-bold mb-4">ชำระเงิน</h1>
              <div className="mb-3">
                <label className="block mb-1">ชื่อเต็ม:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-control"
                  placeholder="กรุณากรอกชื่อเต็ม"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1">เบอร์โทร:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  placeholder="กรุณากรอกเบอร์โทร"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1">อีเมล:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="กรุณากรอกอีเมล"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1">อัปโหลดสลิปการชำระเงิน:</label>
                <input
                  type="file"
                  onChange={handlePaymentSlipUpload}
                  className="form-control"
                  accept="image/*"
                  required
                />
                <small className="text-gray-500">
                  กรุณาอัปโหลดสลิปการชำระเงินเพื่อยืนยันการจอง
                </small>
              </div>

              <button
                onClick={handlePayment}
                className="btn btn-success my-4 form-control"
                disabled={loading || paymentStatus === "pending"}
              >
                {loading
                  ? "กำลังส่งข้อมูล..."
                  : paymentStatus === "pending"
                  ? "รอการตรวจสอบ"
                  : "ยืนยันการชำระเงิน"}
              </button>

              {paymentStatus === "pending" && (
                <div className="alert alert-info mt-2">
                  สถานะการชำระเงิน: รอการตรวจสอบ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
