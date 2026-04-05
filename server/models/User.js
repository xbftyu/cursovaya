const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user"
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    default: ""
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  followedTags: [{
    type: String
  }]
}, { timestamps: true });

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

module.exports = mongoose.model("User", UserSchema);
