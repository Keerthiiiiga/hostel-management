import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData) {
    const role = allowedRole;
    if (role === "admin") return <Navigate to="/admin-login" />;
    return <Navigate to="/" />;
  }

  const role = userData.user?.role || userData.role;

  if (role !== allowedRole) {
    if (allowedRole === "admin") return <Navigate to="/admin-login" />;
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;