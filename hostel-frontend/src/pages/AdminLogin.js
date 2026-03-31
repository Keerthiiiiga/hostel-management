import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./login.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.user.role !== "admin") {
        setError("Access denied! Admins only.");
        return;
      }
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/admin");
    } catch (err) {
      setError("Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)"}}>
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Admin Portal</h1>
          <p style={{color: "#cc0000", fontWeight: "bold"}}>Restricted Access Only</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="Enter admin email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}
            style={{background: "linear-gradient(135deg, #1a1a2e, #0f3460)"}}>
            {loading ? "Authenticating..." : "🔐 Admin Login"}
          </button>
        </form>

        <div className="login-footer">
          <p style={{color: "#999", fontSize: "12px"}}>
            This page is for authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;