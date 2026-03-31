import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./DashboardLayout.css";

function DashboardLayout({ children, role }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = {
    Admin: ["Dashboard", "Students", "Wardens", "Complaints"],
    Warden: ["Dashboard", "Students", "Rooms", "Complaints"],
    Student: ["Dashboard", "My Room", "Submit Complaint", "My Complaints"],
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>HostelMS</h2>

        <ul>
          {menuItems[role].map((item) => (
            <li
              key={item}
              className={active === item ? "active" : ""}
              onClick={() => setActive(item)}
            >
              {item}
            </li>
          ))}
        </ul>

        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="main-content">
        <div className="topbar">
          <h3>{active}</h3>
        </div>

        <div className="content-area">{children(active)}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
