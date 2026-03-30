const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roomNumber: String,
  block: String,
  floor: String
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);