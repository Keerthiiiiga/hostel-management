import { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import API from "../api";

function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [room, setRoom]             = useState(null);
  const [complaintForm, setComplaintForm] = useState({
    studentName: "",
    roomNumber:  "",
    category:    "Other",
    description: ""
  });
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  // ── Fetch Complaints ────────────────────────────────────
  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.log("Error fetching complaints:", err);
    }
  };

  // ── Fetch Room ──────────────────────────────────────────
  const fetchRoom = async () => {
    try {
      const res  = await API.get("/rooms");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id || user.id;

      console.log("User ID:", userId);
      console.log("Rooms:", res.data);

      const myRoom = res.data.find(r => {
        const sid = r.student?._id?.toString() || r.student?.toString();
        return sid === userId?.toString();
      });

      console.log("My Room:", myRoom);
      setRoom(myRoom || null);
    } catch (err) {
      console.log("Error fetching room:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchRoom();
  }, []);

  // ── Submit Complaint ────────────────────────────────────
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await API.post("/complaints", complaintForm);
      setSuccess("Complaint submitted successfully!");
      setComplaintForm({
        studentName: "", roomNumber: "", category: "Other", description: ""
      });
      fetchComplaints();
    } catch (err) {
      console.error("Complaint error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to submit complaint!");
    }
  };

  return (
    <DashboardLayout role="Student">
      {(active) => {

        // ── Dashboard ─────────────────────────────────────
        if (active === "Dashboard")
          return (
            <>
              <div className="card">
                <h3>👋 Welcome Student!</h3>
                <p>Manage your room and complaints from here.</p>
              </div>
              <div className="card">
                <h3>🏠 Room Status</h3>
                <p>{room
                  ? `Room ${room.roomNumber} - Block ${room.block}`
                  : "Not Allocated"}
                </p>
              </div>
              <div className="card">
                <h3>📋 Pending Complaints</h3>
                <p>{complaints.filter(c => c.status === "Pending").length}</p>
              </div>
            </>
          );

        // ── My Room ───────────────────────────────────────
        if (active === "My Room")
          return (
            <div className="card">
              <h3>🏠 Room Details</h3>
              {room ? (
                <>
                  <p><strong>Room Number:</strong> {room.roomNumber}</p>
                  <p><strong>Block:</strong>       {room.block}</p>
                  <p><strong>Floor:</strong>       {room.floor}</p>
                </>
              ) : (
                <p style={{ color: "#999" }}>
                  No room allocated yet. Please contact warden.
                </p>
              )}
            </div>
          );

        // ── Submit Complaint ──────────────────────────────
        if (active === "Submit Complaint")
          return (
            <div className="card">
              <h3>📝 Submit Complaint</h3>
              {success && <p style={{ color: "green", marginBottom: "10px" }}>✅ {success}</p>}
              {error   && <p style={{ color: "red",   marginBottom: "10px" }}>⚠️ {error}</p>}
              <form onSubmit={handleComplaintSubmit}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={complaintForm.studentName}
                  onChange={e => setComplaintForm({ ...complaintForm, studentName: e.target.value })}
                  required style={iS}
                />
                <input
                  type="text"
                  placeholder="Room Number"
                  value={complaintForm.roomNumber}
                  onChange={e => setComplaintForm({ ...complaintForm, roomNumber: e.target.value })}
                  required style={iS}
                />
                <select
                  value={complaintForm.category}
                  onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  style={iS}
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
                <textarea
                  placeholder="Describe your complaint..."
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  required
                  style={{ ...iS, height: "100px", resize: "vertical" }}
                />
                <button type="submit" style={bS}>Submit Complaint</button>
              </form>
            </div>
          );

        // ── My Complaints ─────────────────────────────────
        if (active === "My Complaints")
          return (
            <div>
              <h3 style={{ marginBottom: "15px" }}>📋 My Complaints</h3>
              {complaints.length === 0 ? (
                <div className="card">
                  <p style={{ color: "#999" }}>No complaints submitted yet.</p>
                </div>
              ) : (
                complaints.map(c => (
                  <div className="card" key={c._id} style={{ marginBottom: "10px" }}>
                    <p><strong>Category:</strong>    {c.category}</p>
                    <p><strong>Description:</strong> {c.description}</p>
                    <p><strong>Room:</strong>        {c.roomNumber}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span style={{
                        color: c.status === "Resolved"
                          ? "green" : c.status === "In Progress"
                          ? "orange" : "red",
                        fontWeight: "bold"
                      }}>
                        {c.status}
                      </span>
                    </p>
                  </div>
                ))
              )}
            </div>
          );
      }}
    </DashboardLayout>
  );
}

const iS = {
  width: "100%", padding: "10px", marginBottom: "10px",
  borderRadius: "8px", border: "1px solid #ddd",
  fontSize: "14px", boxSizing: "border-box",
};

const bS = {
  padding: "10px 20px", borderRadius: "8px", border: "none",
  backgroundColor: "#764ba2", color: "white",
  cursor: "pointer", fontSize: "15px",
};

export default StudentDashboard;
