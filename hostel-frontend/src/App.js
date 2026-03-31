/***import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden"
          element={
            <ProtectedRoute allowedRole="warden">
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; ***/
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login            from "./pages/login";
import Register         from "./pages/Register";
import AdminLogin       from "./pages/AdminLogin";
import AdminDashboard   from "./pages/AdminDashboard";
import WardenDashboard  from "./pages/WardenDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ForgotPassword   from "./pages/ForgotPassword";
import VerifyEmail      from "./pages/VerifyEmail";

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !user.role) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Default ───────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ── Auth Pages ────────────────────────────────── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />
        <Route path="/admin-login"     element={<AdminLogin />} />

        {/* ── Protected Pages ───────────────────────────── */}
        <Route path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/warden"
          element={
            <ProtectedRoute allowedRole="warden">
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;