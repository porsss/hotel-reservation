// src/App.jsx
import { lazy, Suspense } from "react";
import "./styles/App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

// Lazy loaded components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const RoomList = lazy(() => import("./pages/RoomList"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const BookingForm = lazy(() => import("./components/BookingForm"));
const PaymentForm = lazy(() => import("./components/PaymentForm"));
const BookingStatus = lazy(() => import("./components/BookingStatus"));
const AdminRoomManagement = lazy(() => import("./pages/AdminRoomManagement"));
const AdminPaymentManagement = lazy(() =>
  import("./pages/AdminPaymentManagement")
);
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
import { useEffect, useState } from "react";

import { isAdmin } from "./utils/auth";
import Swal from "sweetalert2";
// Authentication wrapper component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("auth") !== null;

  if (!isAuthenticated) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin route protection
// Admin route protection
const AdminRoute = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    // Show notification before redirect
    Swal.fire({
      icon: "error",
      title: "ไม่มีสิทธิ์เข้าถึง",
      text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ดูแลระบบเท่านั้น",
    });

    // Redirect to home page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

// Loading component
const LoadingFallback = () => (
  <div className="h-screen flex justify-center items-center bg-gray-100">
    <div className="text-center">
      <p className="text-xl">กำลังโหลด...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoomList />} />
          <Route path="/room/:roomId" element={<RoomDetails />} />

          {/* Protected routes requiring authentication */}
          <Route
            path="/book/:roomId"
            element={
              <ProtectedRoute>
                <BookingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <PaymentForm />
              </ProtectedRoute>
            }
          />
          <Route path="/booking-status" element={<BookingStatus />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/admin/manage-rooms" replace />}
            />
            <Route path="manage-rooms" element={<AdminRoomManagement />} />
            <Route
              path="manage-payments"
              element={<AdminPaymentManagement />}
            />
          </Route>

          {/* Catch-all for 404 */}
          <Route
            path="*"
            element={
              <div className="h-screen flex justify-center items-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-4">404</h1>
                  <p className="text-xl mb-6">ไม่พบหน้าที่คุณกำลังค้นหา</p>
                  <a href="/" className="btn btn-primary">
                    กลับสู่หน้าหลัก
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
      <footer className="bg-black text-white py-3">
        <div className="container">
          <div className="row">
            <div className="col text-center">
              <p className="mb-0">© 2025 Hotel Booking System</p>
            </div>
          </div>
        </div>
      </footer>
    </Router>
  );
}

export default App;
