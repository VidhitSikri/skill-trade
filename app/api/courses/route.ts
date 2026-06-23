import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Course from "@/models/courseModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

// GET /api/courses — list all published courses (with optional filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const level = searchParams.get("level");
    const search = searchParams.get("search");

    const query: any = { isPublished: true };
    if (skill) query.skill = { $regex: skill, $options: "i" };
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const courses = await Course.find(query)
      .populate("instructor", "username rank profilePic")
      .sort({ createdAt: -1 })
      .select("-enrollments"); // Don't expose full enrollment list

    return NextResponse.json({ success: true, courses }, { status: 200 });
  } catch (error: any) {
    console.error("Courses GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/courses — create a new course (S-rank only, or adjust rank requirement)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instructor = await User.findById(userId).select("rank username");
    if (!instructor) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Rank check — only A-rank or S-rank users can create courses
    const eligibleRanks = ["A", "S"];
    if (!eligibleRanks.includes(instructor.rank)) {
      return NextResponse.json(
        { error: `Only A-rank and S-rank users can create courses. Your current rank: ${instructor.rank}` },
        { status: 403 }
      );
    }

    const { title, description, skill, tags, price, level, modules, thumbnail } =
      await request.json();

    if (!title || !description || !skill) {
      return NextResponse.json(
        { error: "Title, description, and skill are required" },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title,
      description,
      instructor: userId,
      skill,
      tags: tags ?? [],
      price: price ?? 0,
      level: level ?? "Beginner",
      modules: modules ?? [],
      thumbnail: thumbnail ?? "",
      isPublished: false, // Draft by default
    });

    const populated = await Course.findById(course._id).populate(
      "instructor",
      "username rank profilePic"
    );

    return NextResponse.json({ success: true, course: populated }, { status: 201 });
  } catch (error: any) {
    console.error("Courses POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
