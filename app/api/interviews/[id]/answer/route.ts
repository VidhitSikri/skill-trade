import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/dbconfig/dbconfig";
import Interview from "@/models/interviewModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

// POST /api/interviews/[id]/answer — save an answer to an interview question
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionIndex, answer, feedback } = body;

    const interview = await Interview.findById(params.id);
    if (!interview) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    if (interview.userId.toString() !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Store answers as a map
    if (!interview.answers) interview.answers = {};
    if (!interview.feedback) interview.feedback = {};

    interview.answers[questionIndex] = answer;
    if (feedback) interview.feedback[questionIndex] = feedback;

    await interview.save();

    return NextResponse.json({
      success: true,
      message: "Answer saved successfully",
    });
  } catch (error) {
    console.error("Error saving interview answer:", error);
    return NextResponse.json({ success: false, error: "Failed to save answer" }, { status: 500 });
  }
}
