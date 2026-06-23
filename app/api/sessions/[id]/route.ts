import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Session from "@/models/sessionModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

// GET /api/sessions/[id] — get a single session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await Session.findById(params.id)
      .populate("teacherId", "username rank profilePic skillsToTeach")
      .populate("learnerId", "username rank profilePic skillsToLearn");

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Only participants can view the session
    const isParticipant =
      session.teacherId._id?.toString() === userId ||
      session.learnerId._id?.toString() === userId;

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/sessions/[id] — update session status or add rating
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

    const session = await Session.findById(params.id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isTeacher = session.teacherId.toString() === userId;
    const isLearner = session.learnerId.toString() === userId;

    if (!isTeacher && !isLearner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, rating, scheduledAt, notes } = await request.json();

    // Status transitions
    const allowedTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["ongoing", "cancelled"],
      ongoing: ["completed"],
      completed: [],
      cancelled: [],
    };

    if (status && !allowedTransitions[session.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${session.status} to ${status}` },
        { status: 400 }
      );
    }

    if (status) session.status = status;
    if (scheduledAt) session.scheduledAt = new Date(scheduledAt);
    if (notes !== undefined) session.notes = notes;

    // Ratings — teacher rates learner, learner rates teacher
    if (rating !== undefined) {
      if (isTeacher) {
        session.learnerRating = rating;
      } else {
        session.teacherRating = rating;
      }
    }

    // If completing the session, award XP
    if (status === "completed") {
      const XP_PER_SESSION = 50;
      session.xpAwarded = XP_PER_SESSION;

      await Promise.all([
        User.findByIdAndUpdate(session.teacherId, {
          $inc: { xp: XP_PER_SESSION, sessionsCompleted: 1 },
        }),
        User.findByIdAndUpdate(session.learnerId, {
          $inc: { xp: XP_PER_SESSION, sessionsCompleted: 1 },
        }),
      ]);
    }

    await session.save();

    const updatedSession = await Session.findById(params.id)
      .populate("teacherId", "username rank profilePic")
      .populate("learnerId", "username rank profilePic");

    return NextResponse.json({ success: true, session: updatedSession }, { status: 200 });
  } catch (error: any) {
    console.error("Session PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/sessions/[id] — cancel/delete a session
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

    const session = await Session.findById(params.id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isParticipant =
      session.teacherId.toString() === userId ||
      session.learnerId.toString() === userId;

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Cannot delete a completed session" },
        { status: 400 }
      );
    }

    await Session.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: "Session deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
