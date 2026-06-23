import mongoose, { Schema, Document } from "mongoose";

export interface IInterview extends Document {
  userId: string;
  role: string;
  type: string;
  techstack: string[];
  level: string;
  questions: string[];
  answers: Record<string, string>;
  feedback: Record<string, string>;
  finalized: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Technical", "Behavioral", "Portfolio"],
      required: true,
    },
    techstack: {
      type: [String],
      default: [],
    },
    level: {
      type: String,
      enum: ["Junior", "Mid-level", "Senior", "Lead"],
      required: true,
    },
    questions: {
      type: [String],
      default: [],
    },
    finalized: {
      type: Boolean,
      default: false,
    },
    answers: {
      type: Map,
      of: String,
      default: {},
    },
    feedback: {
      type: Map,
      of: String,
      default: {},
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);
const Interview = mongoose.models.Interview || mongoose.model("Interview", interviewSchema);


export default Interview;