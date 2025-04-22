import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../components/Navbar";
import { LeftCircleFilled, LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const RoomDetails = () => {
  const { roomId } = useParams(); // รับ roomId จาก URL
  const [room, setRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // ดึงข้อมูลห้องพักจาก Supabase ตาม roomId
  const fetchRoomDetails = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single(); // ใช้ single เพื่อดึงแค่ 1 ห้อง
    if (error) {
      console.error("Error fetching room details:", error);
    } else {
      setRoom(data);
      setLoading(false);
    }
  };

  const handleBooking = (roomId) => {
    console.log(roomId);
    // เปลี่ยนเส้นทางไปยังหน้าจองห้องพักโดยใช้ `roomId`
    navigate(`/book/${roomId}`);
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  if (loading) {
    return <p>กำลังโหลดข้อมูลห้องพัก...</p>;
  }

  return (
    <div className="h-screen bg-gray-100">
      <Navbar userName={"Username"} />
      <div className="card bg-white shadow-md rounded-lg p-4 mx-5 my-5">
        <div className="card-body px-5 py-5">
          <div className="row">
            <div className="d-flex ">
              <Link to={"/"} className="my-auto me-3 text-2xl text-black">
                <LeftCircleFilled />
              </Link>
              <h1>รายละเอียดห้องพัก</h1>
            </div>

            <hr className="mb-5" />
            <div className="col-12 col-sm-12 col-md-6">
              <img src={room.image_url} alt={room.room_type} />
            </div>
            <div className="col-12 col-sm-12 col-md-6">
              <div className="room-details">
                <h2>{room.room_type}</h2>
                {/* แสดงชื่อห้อง */}
                <h3 className="text-xl text-primary">
                  {room.room_name || "ห้องพัก"}
                </h3>
                <p>ขนาด: {room.size} ตร.ม.</p>
                <p>ราคา: ฿{room.price}</p>
                <p>สถานะ: {room.status === "available" ? "ว่าง" : "ไม่ว่าง"}</p>

                {room.status === "available" ? (
                  <>
                    <div>
                      <label>เลือกวันที่เข้าพัก:</label>
                      <DatePicker
                        selected={checkInDate}
                        onChange={(date) => setCheckInDate(date)}
                      />
                    </div>

                    <div>
                      <label>เลือกวันที่ออก:</label>
                      <DatePicker
                        selected={checkOutDate}
                        onChange={(date) => setCheckOutDate(date)}
                      />
                    </div>

                    <button
                      onClick={() => handleBooking(roomId)}
                      className="btn btn-warning form-control my-3"
                    >
                      จองห้องพัก
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline-warning form-control"
                    disabled="true"
                  >
                    ห้องนี้ไม่ว่างในขณะนี้
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
