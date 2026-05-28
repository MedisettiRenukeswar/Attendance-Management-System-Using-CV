// models/Attendance.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  matchConfidence: { type: Number, required: true },
  time: { type: String, required: true },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
