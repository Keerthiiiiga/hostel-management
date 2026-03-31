import { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import API from "../api";

function AdminDashboard() {
  const [wardens, setWardens] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);

  const fetchData = async () => {
    try {
      const roomsRes = await API.get("/rooms");
      setRooms(roomsRes.data);

      const complaintsRes = await API.get("/complaints");
      setComplaints(complaintsRes.data);

      const wardensRes = await API.get("/auth/wardens");
      setWardens(wardensRes.data);

      const studentsRes = await API.get("/auth/students");
      setStudents(studentsRes.data);
    } catch (err) {
      console.log("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (id) => {
    try {
      await API.put(`/complaints/${id}`);
      fetchData();
    } catch (err) {
      console.log("Error resolving:", err);
    }
  };

  return (
    <DashboardLayout role="Admin">
      {(active) => {
        if (active === "Dashboard")
          return (
            <>
              <div className="card">
                <h3>👋 Welcome Admin!</h3>
                <p>Full control over hostel management system.</p>
              </div>
              <div className="card">
                <h3>👨‍🎓 Total Students</h3>
                <p style={{fontSize: "28px", fontWeight: "bold", color: "#667eea"}}>{students.length}</p>
              </div>
              <div className="card">
                <h3>👮 Total Wardens</h3>
                <p style={{fontSize: "28px", fontWeight: "bold", color: "#764ba2"}}>{wardens.length}</p>
              </div>
              <div className="card">
                <h3>🏠 Total Rooms</h3>
                <p style={{fontSize: "28px", fontWeight: "bold", color: "green"}}>{rooms.length}</p>
              </div>
              <div className="card">
                <h3>📋 Pending Complaints</h3>
                <p style={{fontSize: "28px", fontWeight: "bold", color: "red"}}>
                  {complaints.filter(c => c.status === "Pending").length}
                </p>
              </div>
            </>
          );

        if (active === "Students")
          return (
            <div>
              <h3 style={{marginBottom: "15px"}}>👨‍🎓 All Students</h3>
              {students.length === 0 ? (
                <div className="card"><p style={{color: "#999"}}>No students registered yet.</p></div>
              ) : (
                students.map((s) => (
                  <div className="card" key={s._id} style={{marginBottom: "10px"}}>
                    <p><strong>Name:</strong> {s.name}</p>
                    <p><strong>Email:</strong> {s.email}</p>
                    <p><strong>Role:</strong> {s.role}</p>
                  </div>
                ))
              )}
            </div>
          );

        if (active === "Wardens")
          return (
            <div>
              <h3 style={{marginBottom: "15px"}}>👮 All Wardens</h3>
              {wardens.length === 0 ? (
                <div className="card"><p style={{color: "#999"}}>No wardens registered yet.</p></div>
              ) : (
                wardens.map((w) => (
                  <div className="card" key={w._id} style={{marginBottom: "10px"}}>
                    <p><strong>Name:</strong> {w.name}</p>
                    <p><strong>Email:</strong> {w.email}</p>
                    <p><strong>Role:</strong> {w.role}</p>
                  </div>
                ))
              )}
            </div>
          );

        if (active === "Complaints")
          return (
            <div>
              <h3 style={{marginBottom: "15px"}}>📋 All Complaints</h3>
              {complaints.length === 0 ? (
                <div className="card"><p style={{color: "#999"}}>No complaints yet.</p></div>
              ) : (
                complaints.map((c) => (
                  <div className="card" key={c._id} style={{marginBottom: "10px"}}>
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
                          padding: "8px 15px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "green",
                          color: "white",
                          cursor: "pointer",
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

export default AdminDashboard;