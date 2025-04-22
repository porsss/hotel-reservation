import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./Navbar";
import Swal from "sweetalert2"; // ใช้ SweetAlert2 สำหรับการแจ้งเตือน

const BookingForm = () => {
  const { roomId } = useParams(); // รับ roomId จาก URL
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลห้องจาก Supabase
  const fetchRoomDetails = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    if (error) {
      console.error("Error fetching room details:", error);
    } else {
      setRoom(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  // ฟังก์ชันการจองห้อง
  const handleBooking = async () => {
    if (!fullName || !phone || !email) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const bookingData = {
      room_id: room.id,
      room_name: room.room_name, // เพิ่มชื่อห้อง
      room_type: room.room_type, // เพิ่มประเภทห้อง
      full_name: fullName,
      phone,
      email,
      check_in: checkInDate,
      check_out: checkOutDate,
    };

    // บันทึกการจองห้องในฐานข้อมูล (ตาราง bookings)
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select("id")
      .single();
    if (error) {
      console.error("Error booking room:", error);
    } else {
      Swal.fire({
        icon: "success",
        title: "การจองห้องพักสำเร็จ",
        text: "คุณได้ทำการจองห้องพักเรียบร้อยแล้ว",
      }).then(() => {
        navigate("/payment/" + data.id); // เปลี่ยนเส้นทางไปยังหน้าสถานะการจอง
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p>กำลังโหลดข้อมูลห้องพัก...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 h-screen ">
      <Navbar userName={"Username"} />
      <div className="container mt-3">
        <div className="d-flex justify-content-center">
          <div className="card w-full">
            <div className="card-body">
              <h1 className="px-3">การจองห้องพัก</h1>
              <div className=" row room-details">
                <div className="col-12 col-sm-12 col-md-6 px-5">
                  <img src={room.image_url} alt={room.room_type} />
                </div>
                <div className="col-12 col-sm-12 col-md-6 px-5">
                  <h2>{room.room_type}</h2>
                  <h3 className="text-primary">
                    {room.room_name || "ห้องพัก"}
                  </h3>
                  <p>ราคา: ฿{room.price}</p>
                  <p>
                    สถานะ: {room.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                  </p>

                  {room.status === "available" ? (
                    <>
                      <div className="my-3">
                        <label>ชื่อเต็ม:</label>
                        <input
                          type="text"
                          value={fullName}
                          style={{
                            borderBottom: "solid 3px ",
                            borderRadius: "5px",
                            paddingLeft: "10px",
                            marginLeft: "10px",
                          }}
                          placeholder="กรุณากรอกชื่อเต็ม"
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div className="my-3">
                        <label>เบอร์โทร:</label>
                        <input
                          type="text"
                          value={phone}
                          style={{
                            borderBottom: "solid 3px ",
                            borderRadius: "5px",
                            paddingLeft: "10px",
                            marginLeft: "10px",
                          }}
                          placeholder="กรุณากรอกเบอร์โทร"
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div className="my-3">
                        <label>อีเมล:</label>
                        <input
                          type="email"
                          value={email}
                          placeholder="กรุณากรอกอีเมล"
                          style={{
                            borderBottom: "solid 3px ",
                            borderRadius: "5px",
                            paddingLeft: "10px",
                            marginLeft: "10px",
                          }}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="my-3 d-flex">
                        <label>เลือกวันที่เข้าพัก:</label>
                        <div
                          className=""
                          style={{
                            borderBottom: "solid 3px ",
                            borderRadius: "5px",
                            paddingLeft: "10px",
                            marginLeft: "10px",
                          }}
                        >
                          <DatePicker
                            selected={checkInDate}
                            onChange={(date) => setCheckInDate(date)}
                          />
                        </div>
                      </div>

                      <div className="my-3 d-flex">
                        <label>เลือกวันที่ออก:</label>
                        <div
                          className=""
                          style={{
                            borderBottom: "solid 3px ",
                            borderRadius: "5px",
                            paddingLeft: "10px",
                            marginLeft: "10px",
                          }}
                        >
                          <DatePicker
                            selected={checkOutDate}
                            onChange={(date) => setCheckOutDate(date)}
                          />
                        </div>
                      </div>
                      <button
                        className="btn btn-success form-control my-2"
                        onClick={handleBooking}
                      >
                        จองห้องพัก
                      </button>
                    </>
                  ) : (
                    <p>ห้องนี้ไม่ว่างในขณะนี้</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
