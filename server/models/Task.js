// models/Task.js
//
// Mongoose schema for a single task in the task manager. This is the
// data our MERN app stores in MongoDB (MongoDB Atlas in production on
// Azure, a local in-memory MongoDB for the demo/verification script).

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
