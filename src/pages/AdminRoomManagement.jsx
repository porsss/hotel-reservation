// src/pages/AdminRoomManagement.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

const AdminRoomManagement = () => {
  const [roomType, setRoomType] = useState("");
  const [roomName, setRoomName] = useState(""); // เพิ่ม state สำหรับชื่อห้อง
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("available");
  const [roomImage, setRoomImage] = useState(null);
  const [roomImagePreview, setRoomImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!roomType.trim()) errors.roomType = "กรุณากรอกประเภทห้อง";
    if (!roomName.trim()) errors.roomName = "กรุณากรอกชื่อห้อง"; // เพิ่มการตรวจสอบชื่อห้อง
    if (!size.trim()) errors.size = "กรุณากรอกขนาดห้อง";
    if (!price.trim()) errors.price = "กรุณากรอกราคา";
    if (isNaN(Number(price))) errors.price = "ราคาต้องเป็นตัวเลขเท่านั้น";
    if (!roomImage) errors.roomImage = "กรุณาอัปโหลดรูปห้อง";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle image upload and preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRoomImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("rooms").select("*");

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถดึงข้อมูลห้องพักได้",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new room
  const addRoom = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Upload image to Supabase Storage
      const timestamp = new Date().getTime();
      const filePath = `rooms/${timestamp}-${roomImage.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(filePath, roomImage);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("room-images")
        .getPublicUrl(filePath);

      const imageUrl = urlData?.publicUrl || filePath;

      // Add room to database
      const { data, error } = await supabase.from("rooms").insert([
        {
          room_type: roomType,
          room_name: roomName, // เพิ่มชื่อห้อง
          size,
          price: Number(price),
          status,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "เพิ่มห้องพักสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });

      // Reset form
      setRoomType("");
      setRoomName(""); // รีเซ็ตชื่อห้อง
      setSize("");
      setPrice("");
      setStatus("available");
      setRoomImage(null);
      setRoomImagePreview("");
      setFormErrors({});

      // Refresh room list
      fetchRooms();
    } catch (error) {
      console.error("Error adding room:", error);
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถเพิ่มห้องพักได้",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit room price
  const editRoom = async (roomId) => {
    try {
      const room = rooms.find((r) => r.id === roomId);

      // สร้างฟอร์มสำหรับแก้ไขด้วย SweetAlert2
      const { value: formValues } = await Swal.fire({
        title: "แก้ไขข้อมูลห้องพัก",
        html: `
          <div class="mb-3">
            <label class="form-label">ชื่อห้อง</label>
            <input id="swal-room-name" class="form-control" value="${
              room.room_name || ""
            }">
          </div>
          <div class="mb-3">
            <label class="form-label">ราคา</label>
            <input id="swal-price" class="form-control" type="number" value="${
              room.price
            }">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "บันทึก",
        cancelButtonText: "ยกเลิก",
        preConfirm: () => {
          const roomName = document.getElementById("swal-room-name").value;
          const price = document.getElementById("swal-price").value;

          if (!roomName.trim()) {
            Swal.showValidationMessage("กรุณากรอกชื่อห้อง");
            return false;
          }

          if (!price || isNaN(Number(price))) {
            Swal.showValidationMessage("ราคาต้องเป็นตัวเลขเท่านั้น");
            return false;
          }

          return { roomName, price };
        },
      });

      if (formValues) {
        const { roomName, price } = formValues;

        const { error } = await supabase
          .from("rooms")
          .update({
            room_name: roomName,
            price: Number(price),
          })
          .eq("id", roomId);

        if (error) throw error;

        Swal.fire({
          icon: "success",
          title: "แก้ไขข้อมูลห้องพักสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });

        fetchRooms();
      }
    } catch (error) {
      console.error("Error updating room:", error);
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถแก้ไขข้อมูลห้องพักได้",
        text: error.message,
      });
    }
  };

  // Delete room
  const deleteRoom = async (roomId) => {
    try {
      const result = await Swal.fire({
        title: "ยืนยันการลบห้องพัก",
        text: "คุณแน่ใจหรือไม่ว่าต้องการลบห้องพักนี้?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
      });

      if (result.isConfirmed) {
        const { error } = await supabase
          .from("rooms")
          .delete()
          .eq("id", roomId);

        if (error) throw error;

        Swal.fire({
          icon: "success",
          title: "ลบห้องพักสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });

        fetchRooms();
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถลบห้องพักได้",
        text: error.message,
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">เพิ่มห้องพัก</h2>
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">ประเภทห้อง</label>
          <input
            type="text"
            value={roomType}
            className={`form-control ${
              formErrors.roomType ? "is-invalid" : ""
            }`}
            placeholder="เช่น ห้องเตียงเดี่ยว, ห้องเตียงคู่"
            onChange={(e) => setRoomType(e.target.value)}
          />
          {formErrors.roomType && (
            <div className="invalid-feedback">{formErrors.roomType}</div>
          )}
        </div>
        <div className="col-md-3">
          <label className="form-label">ชื่อห้อง</label>
          <input
            type="text"
            value={roomName}
            className={`form-control ${
              formErrors.roomName ? "is-invalid" : ""
            }`}
            placeholder="เช่น Deluxe 101, Suite 202"
            onChange={(e) => setRoomName(e.target.value)}
          />
          {formErrors.roomName && (
            <div className="invalid-feedback">{formErrors.roomName}</div>
          )}
        </div>
        <div className="col-md-2">
          <label className="form-label">ขนาดห้อง (ตร.ม.)</label>
          <input
            type="text"
            className={`form-control ${formErrors.size ? "is-invalid" : ""}`}
            placeholder="เช่น 25"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
          {formErrors.size && (
            <div className="invalid-feedback">{formErrors.size}</div>
          )}
        </div>
        <div className="col-md-2">
          <label className="form-label">ราคา (บาท)</label>
          <input
            type="text"
            className={`form-control ${formErrors.price ? "is-invalid" : ""}`}
            placeholder="เช่น 1500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {formErrors.price && (
            <div className="invalid-feedback">{formErrors.price}</div>
          )}
        </div>
        <div className="col-md-2">
          <label className="form-label">สถานะห้อง</label>
          <select
            value={status}
            className="form-select"
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="available">ว่าง</option>
            <option value="unavailable">ไม่ว่าง</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">อัปโหลดรูปห้อง</label>
          <input
            type="file"
            className={`form-control ${
              formErrors.roomImage ? "is-invalid" : ""
            }`}
            onChange={handleImageUpload}
            accept="image/*"
          />
          {formErrors.roomImage && (
            <div className="invalid-feedback">{formErrors.roomImage}</div>
          )}
        </div>
        <div className="col-12">
          {roomImagePreview && (
            <div className="mt-2 text-center">
              <img
                src={roomImagePreview}
                alt="Room Preview"
                className="img-thumbnail"
                style={{ maxHeight: "100px" }}
              />
            </div>
          )}
        </div>
        <div className="col-12">
          <button
            onClick={addRoom}
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? "กำลังเพิ่มห้อง..." : "เพิ่มห้องพัก"}
          </button>
        </div>
      </div>

      <hr className="my-4" />

      <h2 className="text-xl font-bold mb-4">รายการห้องพัก</h2>

      {loading && !rooms.length ? (
        <p className="text-center py-4">กำลังโหลดข้อมูลห้องพัก...</p>
      ) : rooms.length === 0 ? (
        <div className="alert alert-info">ยังไม่มีห้องพักในระบบ</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {rooms.map((room) => (
            <div className="col" key={room.id}>
              <div className="card h-100">
                <div className="text-center p-3">
                  <img
                    src={room.image_url || "/placeholder-room.jpg"}
                    alt={room.room_type}
                    className="img-fluid rounded"
                    style={{
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="card-body pt-0">
                  <h5 className="card-title">
                    {" "}
                    ชื่อห้อง: {room.room_name || "ไม่ระบุ"}
                  </h5>
                  <p className="card-text mb-1">{room.room_type}</p>
                  <p className="card-text mb-1">ขนาด: {room.size} ตร.ม.</p>
                  <p className="card-text mb-1">ราคา: ฿{room.price}</p>
                  <p className="card-text mb-3">
                    สถานะ:
                    <span
                      className={`ms-1 badge ${
                        room.status === "available" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {room.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                    </span>
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-warning flex-grow-1"
                      onClick={() => editRoom(room.id)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="btn btn-danger flex-grow-1"
                      onClick={() => deleteRoom(room.id)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRoomManagement;
