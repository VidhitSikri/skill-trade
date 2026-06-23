import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/dbconfig/dbconfig";
import Interview from "@/models/interviewModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";

// PATCH /api/interviews/[id]/finalize — mark an interview as completed
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const interview = await Interview.findById(params.id);
    if (!interview) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    if (interview.userId.toString() !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (interview.finalized) {
      return NextResponse.json({ success: false, error: "Interview is already finalized" }, { status: 400 });
    }

    interview.finalized = true;
    interview.completedAt = new Date();
    await interview.save();

    // Award XP for completing an interview
    await User.findByIdAndUpdate(userId, { $inc: { xp: 25 } });

    return NextResponse.json({
      success: true,
      message: "Interview finalized successfully",
    });
  } catch (error) {
    console.error("Error finalizing interview:", error);
    return NextResponse.json({ success: false, error: "Failed to finalize interview" }, { status: 500 });
  }
}
