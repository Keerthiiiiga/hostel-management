const router = require("express").Router();
const Room = require("../models/Room");
const protect = require("../middleware/authMiddleware");

// Allocate Room
router.post("/", protect, async (req, res) => {
  const { studentId, roomNumber, block, floor } = req.body;

  const room = await Room.create({
    student: studentId,
    roomNumber,
    block,
    floor
  });

  res.status(201).json(room);
});

// Get All Rooms
router.get("/", protect, async (req, res) => {
  const rooms = await Room.find().populate("student", "name");

  res.json(rooms);
});

module.exports = router;