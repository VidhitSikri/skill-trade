import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    // The two participants
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Skill being taught in this session
    skill: {
      type: String,
      required: [true, "Skill is required"],
      trim: true,
    },
    // Session status lifecycle
    status: {
      type: String,
      enum: ["pending", "confirmed", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    // Scheduled time
    scheduledAt: {
      type: Date,
      default: null,
    },
    // Duration in minutes
    durationMinutes: {
      type: Number,
      default: 60,
    },
    // Ratings (filled after session completes)
    teacherRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    learnerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // Optional notes/description
    notes: {
      type: String,
      default: "",
    },
    // XP awarded after completion
    xpAwarded: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
