import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import Session from "@/models/sessionModel";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dashboard
// Returns: user profile + aggregated stats for the dashboard
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user (exclude sensitive fields)
    const user = await User.findById(userId).select(
      "-password -verifyToken -verifyTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry -__v"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Aggregate session stats
    const [sessionsAsTeacher, sessionsAsLearner] = await Promise.all([
      Session.countDocuments({ teacherId: userId, status: "completed" }),
      Session.countDocuments({ learnerId: userId, status: "completed" }),
    ]);

    // Upcoming sessions (confirmed or ongoing)
    const upcomingSessions = await Session.find({
      $or: [{ teacherId: userId }, { learnerId: userId }],
      status: { $in: ["confirmed", "ongoing", "pending"] },
    })
      .populate("teacherId", "username rank profilePic")
      .populate("learnerId", "username rank profilePic")
      .sort({ scheduledAt: 1 })
      .limit(5);

    // XP thresholds for rank progression
    const rankThresholds: Record<string, { xpNeeded: number; nextRank: string }> = {
      Beginner: { xpNeeded: 100, nextRank: "D" },
      D: { xpNeeded: 300, nextRank: "C" },
      C: { xpNeeded: 700, nextRank: "B" },
      B: { xpNeeded: 1500, nextRank: "A" },
      A: { xpNeeded: 3000, nextRank: "S" },
      S: { xpNeeded: 0, nextRank: "S" }, // Max rank
    };

    const currentRankInfo = rankThresholds[user.rank] ?? rankThresholds["Beginner"];
    const xpProgress =
      currentRankInfo.xpNeeded > 0
        ? Math.min(Math.round((user.xp / currentRankInfo.xpNeeded) * 100), 100)
        : 100;

    const dashboardData = {
      user,
      stats: {
        totalSessionsCompleted: sessionsAsTeacher + sessionsAsLearner,
        sessionsAsTeacher,
        sessionsAsLearner,
        xp: user.xp,
        rank: user.rank,
        nextRank: currentRankInfo.nextRank,
        xpProgress,
        xpNeededForNextRank: currentRankInfo.xpNeeded,
        skillsToTeachCount: user.skillsToTeach?.length ?? 0,
        skillsToLearnCount: user.skillsToLearn?.length ?? 0,
      },
      upcomingSessions,
    };

    return NextResponse.json({ success: true, data: dashboardData }, { status: 200 });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
