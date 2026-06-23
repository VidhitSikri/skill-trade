import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Session from "@/models/sessionModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

// GET /api/sessions — get all sessions for the logged-in user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // optional filter: pending, confirmed, completed, cancelled

    const query: any = {
      $or: [{ teacherId: userId }, { learnerId: userId }],
    };

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate("teacherId", "username rank profilePic skillsToTeach")
      .populate("learnerId", "username rank profilePic skillsToLearn")
      .sort({ scheduledAt: -1, createdAt: -1 });

    // Annotate each session with the user's role
    const annotated = sessions.map((s) => {
      const obj = s.toObject();
      obj.myRole = s.teacherId._id?.toString() === userId ? "teacher" : "learner";
      return obj;
    });

    return NextResponse.json({ success: true, sessions: annotated }, { status: 200 });
  } catch (error: any) {
    console.error("Sessions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/sessions — create a new session
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { learnerId, teacherId, skill, scheduledAt, durationMinutes, notes } =
      await request.json();

    // The requester must be either the teacher or learner
    const isTeacher = teacherId === userId;
    const isLearner = learnerId === userId;

    if (!isTeacher && !isLearner) {
      return NextResponse.json(
        { error: "You must be the teacher or learner in the session" },
        { status: 403 }
      );
    }

    if (!skill) {
      return NextResponse.json({ error: "Skill is required" }, { status: 400 });
    }

    // Verify both parties exist
    const [teacher, learner] = await Promise.all([
      User.findById(teacherId).select("username rank"),
      User.findById(learnerId).select("username rank"),
    ]);

    if (!teacher || !learner) {
      return NextResponse.json({ error: "Teacher or learner not found" }, { status: 404 });
    }

    const session = await Session.create({
      teacherId,
      learnerId,
      skill,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      durationMinutes: durationMinutes ?? 60,
      notes: notes ?? "",
      status: "pending",
    });

    const populatedSession = await Session.findById(session._id)
      .populate("teacherId", "username rank profilePic")
      .populate("learnerId", "username rank profilePic");

    return NextResponse.json(
      { success: true, session: populatedSession },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sessions POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
