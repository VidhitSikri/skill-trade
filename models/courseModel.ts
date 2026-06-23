import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Skill category
    skill: {
      type: String,
      required: [true, "Skill category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    // Rank required to create (only S-rank users can create)
    requiredInstructorRank: {
      type: String,
      enum: ["Beginner", "D", "C", "B", "A", "S"],
      default: "S",
    },
    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // Discount for higher ranks: e.g. { B: 10, A: 20, S: 50 }
    rankDiscounts: {
      D: { type: Number, default: 0 },
      C: { type: Number, default: 10 },
      B: { type: Number, default: 20 },
      A: { type: Number, default: 35 },
      S: { type: Number, default: 50 },
    },
    // Students enrolled
    enrollments: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        enrolledAt: { type: Date, default: Date.now },
        completed: { type: Boolean, default: false },
      },
    ],
    // Content sections/modules
    modules: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
    // Course level
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    // Average rating
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Course =
  mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
