import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import Navbar from "../components/Navbar";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ดึงข้อมูลห้องพักจาก Supabase
  const fetchRooms = async () => {
    const { data, error } = await supabase.from("rooms").select("*");
    if (error) {
      console.error("Error fetching rooms:", error);
    } else {
      setRooms(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleBooking = (roomId) => {
    // เปลี่ยนเส้นทางไปยังหน้าจองห้องพักโดยใช้ `roomId`
    navigate(`/book/${roomId}`);
  };

  if (loading) {
    return <p>กำลังโหลดข้อมูลห้องพัก...</p>;
  }

  return (
    <div className="bg-gray-100 h-screen">
      <Navbar userName={"Username"} />

      <div className="container py-2">
        <div className="row room-list">
          {rooms.map((room) => (
            <Link
              to={"/room/" + room.id}
              key={room.id}
              className="col-12 text-decoration-none col-md-3 col-sm-6 col-xs-12  room-card"
            >
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-center">
                    <img
                      className=""
                      src={room.image_url || "default-room-image.jpg"}
                      alt={room.room_type}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <h2>
                    <strong>{room.room_name || "ห้องพัก"}</strong>
                  </h2>
                  {/* แสดงชื่อห้อง */}
                  <p>{room.room_type}</p>
                  <p>ขนาด: {room.size} ตร.ม.</p>
                  <p>ราคาเริ่มต้น: ฿{room.price}</p>
                  <p>
                    สถานะ: {room.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                  </p>
                  {room.status === "available" ? (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleBooking(room.id)}
                    >
                      จองห้อง
                    </button>
                  ) : (
                    <button className="btn btn-outline-warning" disabled="true">
                      ห้องนี้ไม่ว่าง
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomList;
