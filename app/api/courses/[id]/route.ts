import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Course from "@/models/courseModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

// GET /api/courses/[id] — get single course details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const course = await Course.findById(params.id)
      .populate("instructor", "username rank profilePic skillsToTeach")
      .populate("enrollments.student", "username rank profilePic");

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if requester is enrolled (if authenticated)
    let isEnrolled = false;
    const userId = getDataFromToken(request);
    if (userId && course.enrollments) {
      isEnrolled = course.enrollments.some(
        (e: any) => e.student?._id?.toString() === userId
      );
    }

    return NextResponse.json(
      { success: true, course, isEnrolled, enrollmentCount: course.enrollments?.length ?? 0 },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/courses/[id] — update course (instructor only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.instructor.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden — only the instructor can edit this course" }, { status: 403 });
    }

    const { title, description, skill, tags, price, level, modules, thumbnail, isPublished } =
      await request.json();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (skill !== undefined) updateData.skill = skill;
    if (tags !== undefined) updateData.tags = tags;
    if (price !== undefined) updateData.price = price;
    if (level !== undefined) updateData.level = level;
    if (modules !== undefined) updateData.modules = modules;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updated = await Course.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("instructor", "username rank profilePic");

    return NextResponse.json({ success: true, course: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/courses/[id] — delete a course (instructor or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [course, user] = await Promise.all([
      Course.findById(params.id),
      User.findById(userId).select("isAdmin"),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.instructor.toString() !== userId && !user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Course.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: "Course deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
