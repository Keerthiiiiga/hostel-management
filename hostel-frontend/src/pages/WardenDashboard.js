import { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import API from "../api";

function WardenDashboard() {
  const [rooms, setRooms]           = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents]     = useState([]);
  const [roomForm, setRoomForm]     = useState({
    studentId: "",
    roomNumber: "",
    block: "",
    floor: ""
  });
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  // ── Fetch Data ────────────────────────────────────────────
  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data);
    } catch (err) {
      console.log("Error fetching rooms:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.log("Error fetching complaints:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/auth/students");
      setStudents(res.data);
    } catch (err) {
      console.log("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchComplaints();
    fetchStudents();
  }, []);

  // ── Allocate Room ─────────────────────────────────────────
  const handleAllocateRoom = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await API.post("/rooms", roomForm);
      setSuccess("Room allocated successfully!");
      setRoomForm({ studentId: "", roomNumber: "", block: "", floor: "" });
      fetchRooms();
    } catch (err) {
      console.error("Room error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to allocate room!");
    }
  };

  // ── Resolve Complaint ─────────────────────────────────────
  const handleResolve = async (id) => {
    try {
      await API.put(`/complaints/${id}`);
      fetchComplaints();
    } catch (err) {
      console.log("Error resolving complaint:", err);
    }
  };

  return (
    <DashboardLayout role="Warden">
      {(active) => {

        // ── Dashboard ───────────────────────────────────────
        if (active === "Dashboard")
          return (
            <>
              <div className="card">
                <h3>👋 Welcome Warden!</h3>
                <p>Manage students, rooms and complaints from here.</p>
              </div>
              <div className="card">
                <h3>🏠 Total Rooms Allocated</h3>
                <p style={{ fontSize: "28px", fontWeight: "bold", color: "#667eea" }}>
                  {rooms.length}
                </p>
              </div>
              <div className="card">
                <h3>📋 Pending Complaints</h3>
                <p style={{ fontSize: "28px", fontWeight: "bold", color: "red" }}>
                  {complaints.filter(c => c.status === "Pending").length}
                </p>
              </div>
            </>
          );

        // ── Students ────────────────────────────────────────
        if (active === "Students")
          return (
            <div>
              <h3 style={{ marginBottom: "15px" }}>👨‍🎓 Registered Students</h3>
              {rooms.length === 0 ? (
                <div className="card">
                  <p style={{ color: "#999" }}>No rooms allocated yet.</p>
                </div>
              ) : (
                rooms.map((r) => (
                  <div className="card" key={r._id} style={{ marginBottom: "10px" }}>
                    <p><strong>Student:</strong> {r.student?.name || "N/A"}</p>
                    <p>
                      <strong>Room:</strong> {r.roomNumber} |{" "}
                      <strong>Block:</strong> {r.block} |{" "}
                      <strong>Floor:</strong> {r.floor}
                    </p>
                  </div>
                ))
              )}
            </div>
          );

        // ── Rooms ───────────────────────────────────────────
        if (active === "Rooms")
          return (
            <div className="card">
              <h3>🏠 Allocate Room</h3>
              {success && (
                <p style={{ color: "green", marginBottom: "10px" }}>✅ {success}</p>
              )}
              {error && (
                <p style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</p>
              )}

              <form onSubmit={handleAllocateRoom}>
                {/* ✅ Dropdown of registered students */}
                <select
                  value={roomForm.studentId}
                  onChange={(e) => setRoomForm({ ...roomForm, studentId: e.target.value })}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Room Number (e.g. 101)"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Block (e.g. A)"
                  value={roomForm.block}
                  onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Floor (e.g. 1)"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                  required
                  style={inputStyle}
                />
                <button type="submit" style={btnStyle}>
                  Allocate Room
                </button>
              </form>

              <h3 style={{ marginTop: "25px", marginBottom: "15px" }}>
                📋 Allocated Rooms
              </h3>
              {rooms.length === 0 ? (
                <p style={{ color: "#999" }}>No rooms allocated yet.</p>
              ) : (
                rooms.map((r) => (
                  <div key={r._id} style={roomCardStyle}>
                    <p>
                      <strong>Room:</strong> {r.roomNumber} |{" "}
                      <strong>Block:</strong> {r.block} |{" "}
                      <strong>Floor:</strong> {r.floor}
                    </p>
                    <p><strong>Student:</strong> {r.student?.name || "N/A"}</p>
                  </div>
                ))
              )}
            </div>
          );

        // ── Complaints ──────────────────────────────────────
        if (active === "Complaints")
          return (
            <div>
              <h3 style={{ marginBottom: "15px" }}>📋 All Complaints</h3>
              {complaints.length === 0 ? (
                <div className="card">
                  <p style={{ color: "#999" }}>No complaints yet.</p>
                </div>
              ) : (
                complaints.map((c) => (
                  <div className="card" key={c._id} style={{ marginBottom: "10px" }}>
                    <p><strong>Student:</strong> {c.studentName}</p>
                    <p><strong>Room:</strong> {c.roomNumber}</p>
                    <p><strong>Category:</strong> {c.category}</p>
                    <p><strong>Description:</strong> {c.description}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span style={{
                        color: c.status === "Resolved" ? "green" : "red",
                        fontWeight: "bold"
                      }}>
                        {c.status}
                      </span>
                    </p>
                    {c.status !== "Resolved" && (
                      <button
                        onClick={() => handleResolve(c._id)}
                        style={{
                          ...btnStyle,
                          backgroundColor: "green",
                          marginTop: "10px"
                        }}
                      >
                        ✅ Mark as Resolved
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          );
      }}
    </DashboardLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px",
  boxSizing: "border-box",
};

const btnStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#667eea",
  color: "white",
  cursor: "pointer",
  fontSize: "15px",
};

const roomCardStyle = {
  padding: "10px",
  background: "#f9f9f9",
  borderRadius: "8px",
  marginBottom: "10px",
};

export default WardenDashboard;