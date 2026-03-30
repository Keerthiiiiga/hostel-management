const router = require("express").Router();
const Complaint = require("../models/Complaint");
const protect = require("../middleware/authMiddleware");

// Create Complaint
router.post("/", protect, async (req, res) => {
  console.log("Body received:", req.body);
  try {
    const { studentName, roomNumber, category, description } = req.body;
    const complaint = await Complaint.create({
      studentName,
      roomNumber,
      category,
      description
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get All Complaints
router.get("/", protect, async (req, res) => {
  const complaints = await Complaint.find();
  res.json(complaints);
});

// Mark Resolved
router.put("/:id", protect, async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status: "Resolved" },
    { new: true }
  );
  res.json(complaint);
});

module.exports = router;