import { supabase } from "../supabaseClient";

// ฟังก์ชันเพิ่มร้านค้า
export const addShop = async (shop) => {
  const { data, error } = await supabase.from("trusted_shops").insert([
    {
      shop_name: shop.shopName,
      description: shop.description,
      product_images: shop.productImages,
      purchase_link: shop.purchaseLink,
    },
  ]);
  if (error) throw error;
  return data;
};

// ฟังก์ชันดึงข้อมูลร้านค้าที่ไว้ใจ
export const getTrustedShops = async () => {
  const { data, error } = await supabase
    .from("trusted_shops")
    .select("id, shop_name, description, product_images, purchase_link");

  if (error) throw error;
  return data;
};

// ฟังก์ชันอัปเดตร้านค้า
export const updateShop = async (shopId, shop) => {
  const { data, error } = await supabase
    .from("trusted_shops")
    .update({
      shop_name: shop.shopName,
      description: shop.description,
      product_images: shop.productImages,
      purchase_link: shop.purchaseLink,
    })
    .eq("id", shopId);
  if (error) throw error;
  return data;
};

// ฟังก์ชันลบร้านค้า
export const deleteShop = async (shopId) => {
  const { data, error } = await supabase
    .from("trusted_shops")
    .delete()
    .match({ id: shopId });

  if (error) {
    console.error("Error deleting shop:", error);
    throw new Error("ไม่สามารถลบร้านค้าได้");
  }
  return data; // ส่งคืนข้อมูลร้านค้าที่ถูกลบ
};

// ฟังก์ชันอัปโหลดรูปภาพไปยัง Supabase Storage
export const uploadImageToSupabase = async (file) => {
  const fileName = encodeURIComponent(file.name); // แปลงชื่อไฟล์ให้เป็นรูปแบบที่ปลอดภัย
  const { data, error } = await supabase.storage
    .from("shop-images")
    .upload(`products/${fileName}`, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { publicURL } = supabase.storage
    .from("shop-images")
    .getPublicUrl(`products/${fileName}`);
  return publicURL;
};

// ฟังก์ชันเพื่ออัปโหลดหลายไฟล์
export const uploadImages = async (files) => {
  const uploadedUrls = [];
  for (let file of files) {
    const url = await uploadImageToSupabase(file);
    uploadedUrls.push(url);
  }
  return uploadedUrls;
};

// ฟังก์ชันเพิ่มรายงานใหม่
export const createReport = async (report) => {
  const { data, error } = await supabase
    .from("fraud_reports")
    .insert([{ ...report }]);
  if (error) throw error;
  return data;
};

// ฟังก์ชันดึงรายงานทั้งหมด
export const getReports = async () => {
  const { data, error } = await supabase.from("fraud_reports").select("*");
  if (error) throw error;
  return data;
};

// ฟังก์ชันดึงรายงานที่ได้รับการอนุมัติ
export const getReportApprove = async () => {
  const { data, error } = await supabase
    .from("fraud_reports")
    .select("*")
    .eq("status", "approved");
  if (error) throw error;
  return data;
};

// ฟังก์ชันลบรายงาน
export const deleteReport = async (report_id) => {
  const { data, error } = await supabase
    .from("fraud_reports")
    .delete()
    .match({ report_id });
  if (error) throw error;
  return data;
};

// ฟังก์ชันอัปเดตรายงาน
export const updateReport = async (report_id, updatedData) => {
  const { data, error } = await supabase
    .from("fraud_reports")
    .update(updatedData)
    .eq("report_id", report_id);

  if (error) {
    console.error("Update error:", error);
    throw error;
  }

  return data;
};
