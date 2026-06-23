import { NextResponse } from "next/server";
import { connectDB } from "@/dbconfig/dbconfig";
import Interview from "@/models/interviewModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest } from "next/server";

// POST /api/interviews/[id]/analyze
// Analyzes an interview answer — uses a simple scoring heuristic if OpenAI is not configured
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answer, question } = body;

    if (!answer || answer.trim() === "") {
      return NextResponse.json({ success: false, error: "Answer is required" }, { status: 400 });
    }

    // Heuristic scoring (replace with OpenAI call when OPENAI_API_KEY is available)
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 0;
    if (wordCount >= 10) score += 30;
    if (wordCount >= 30) score += 20;
    if (wordCount >= 60) score += 20;
    if (/example|because|therefore|specifically|for instance/i.test(answer)) score += 15;
    if (answer.length > 100) score += 15;
    score = Math.min(score, 100);

    return NextResponse.json({
      success: true,
      score,
      feedback: `Your answer covered the question reasonably. (${wordCount} words). For best results, configure OPENAI_API_KEY for AI-powered analysis.`,
      suggestions: [
        "Provide specific examples to strengthen your answer",
        "Explain the 'why' behind your reasoning",
        "Keep your answer structured with a clear intro, body, and conclusion",
      ],
    });
  } catch (error) {
    console.error("Error analyzing interview answer:", error);
    return NextResponse.json({ success: false, error: "Failed to analyze answer" }, { status: 500 });
  }
}
