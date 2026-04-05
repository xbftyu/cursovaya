const mongoose = require("mongoose");

const AdminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  details: {
    type: String,
    required: true
  }
}, { timestamps: true });

AdminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AdminLog", AdminLogSchema);
