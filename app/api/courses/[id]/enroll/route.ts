import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Course from "@/models/courseModel";
import { NextRequest, NextResponse } from "next/server";

// POST /api/courses/[id]/enroll — enroll in a course
export async function POST(
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

    if (!course.isPublished) {
      return NextResponse.json({ error: "This course is not available for enrollment" }, { status: 400 });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrollments?.some(
      (e: any) => e.student?.toString() === userId
    );

    if (alreadyEnrolled) {
      return NextResponse.json({ error: "You are already enrolled in this course" }, { status: 400 });
    }

    // Instructor can't enroll in their own course
    if (course.instructor.toString() === userId) {
      return NextResponse.json(
        { error: "You cannot enroll in your own course" },
        { status: 400 }
      );
    }

    course.enrollments.push({ student: userId, enrolledAt: new Date(), completed: false });
    await course.save();

    return NextResponse.json(
      { success: true, message: "Successfully enrolled in the course!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/courses/[id]/enroll — unenroll from a course
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

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrollmentIndex = course.enrollments?.findIndex(
      (e: any) => e.student?.toString() === userId
    );

    if (enrollmentIndex === -1 || enrollmentIndex === undefined) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 400 });
    }

    course.enrollments.splice(enrollmentIndex, 1);
    await course.save();

    return NextResponse.json(
      { success: true, message: "Successfully unenrolled from the course" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
