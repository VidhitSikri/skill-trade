import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  rank: {
    type: String,
    enum: ["Beginner", "D", "C", "B", "A", "S"],
    default: "Beginner",
  },
  profilePic: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  skillsToTeach: {
    type: [String],
    default: [],
  },
  skillsToLearn: {
    type: [String],
    default: [],
  },
  currentlyLearning: {
    type: String,
    default: "",
  },
  // XP and progression
  xp: {
    type: Number,
    default: 0,
  },
  sessionsCompleted: {
    type: Number,
    default: 0,
  },
  // Matching
  isFindingMatch: {
    type: Boolean,
    default: false,
  },
  matchedUser: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    username: { type: String, default: "" },
  },
  // Auth tokens
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;