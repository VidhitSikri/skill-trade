import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

// GET /api/matches — check current match status
export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(userId).select(
      "matchedUser isFindingMatch currentlyLearning skillsToTeach skillsToLearn"
    );
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isFindingMatch: currentUser.isFindingMatch,
      matchedUser: currentUser.matchedUser?.id ? currentUser.matchedUser : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/matches — find or return a match
export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If already matched, return existing match
    if (currentUser.matchedUser?.id) {
      const matchedUserDoc = await User.findById(currentUser.matchedUser.id).select(
        "username rank profilePic skillsToTeach skillsToLearn currentlyLearning"
      );
      return NextResponse.json({
        success: true,
        match: {
          ...currentUser.matchedUser.toObject(),
          details: matchedUserDoc,
        },
      });
    }

    // Check if someone already matched with the current user
    const existingPartner = await User.findOne({ "matchedUser.id": currentUser._id });
    if (existingPartner) {
      currentUser.matchedUser = { id: existingPartner._id, username: existingPartner.username };
      await currentUser.save();
      return NextResponse.json({
        success: true,
        match: currentUser.matchedUser,
      });
    }

    // Not finding match yet — inform client
    if (!currentUser.isFindingMatch) {
      return NextResponse.json({
        success: false,
        message: "You are not currently looking for a match. Enable match-finding in your profile.",
      });
    }

    // Find a compatible user
    const matchUser = await User.findOne({
      _id: { $ne: currentUser._id },
      isFindingMatch: true,
      "matchedUser.id": null, // Not already matched
      skillsToTeach: { $in: currentUser.skillsToLearn },
      skillsToLearn: { $in: currentUser.skillsToTeach },
    });

    if (!matchUser) {
      return NextResponse.json({
        success: false,
        message: "No compatible match found right now. Keep searching!",
      });
    }

    // Assign match to both users
    currentUser.matchedUser = { id: matchUser._id, username: matchUser.username };
    matchUser.matchedUser = { id: currentUser._id, username: currentUser.username };
    currentUser.isFindingMatch = false;
    matchUser.isFindingMatch = false;

    await Promise.all([currentUser.save(), matchUser.save()]);

    return NextResponse.json({
      success: true,
      match: currentUser.matchedUser,
      message: "Match found!",
    });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/matches — cancel a match
export async function DELETE(request: NextRequest) {
  await connectDB();
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Unlink the partner's match too
    if (currentUser.matchedUser?.id) {
      await User.findByIdAndUpdate(currentUser.matchedUser.id, {
        $set: { "matchedUser.id": null, "matchedUser.username": "" },
      });
    }

    currentUser.matchedUser = { id: null, username: "" };
    currentUser.isFindingMatch = false;
    await currentUser.save();

    return NextResponse.json({ success: true, message: "Match cancelled" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}