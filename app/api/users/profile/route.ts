import { connectDB } from "@/dbconfig/dbconfig"
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  // extract data from token
  await connectDB();
  const userId = getDataFromToken(request)
  const user = await User.findOne({ _id: userId }).select("-password -verifyToken -verifyTokenExpiry -__v")

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  return NextResponse.json({ user, success: true }, { status: 200 })
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const userId = getDataFromToken(request);
    console.log("User ID from token:", userId);

    const reqBody = await request.json();
    console.log("Request body:", reqBody);

    const { username, email, skillsToTeach, skillsToLearn, currentlyLearning, isFindingMatch } = reqBody;

    // Build update data object; include isFindingMatch update if provided
    const updateData: any = {
      ...(username && { username }),
      ...(email && { email }),
      ...(skillsToTeach && { skillsToTeach }),
      ...(skillsToLearn && { skillsToLearn }),
      ...(currentlyLearning && { currentlyLearning }),
      // Update isFindingMatch if it's a boolean value
      ...(typeof isFindingMatch === "boolean" && { isFindingMatch }),
    };

    if (skillsToLearn && skillsToLearn.length > 0) {
      console.log("Setting currentlyLearning to:", skillsToLearn[0]);
      updateData.currentlyLearning = skillsToLearn[0];
    }

    console.log("Update data:", updateData);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      updateData,
      { new: true, runValidators: true }
    ).select("-password -verifyToken -verifyTokenExpiry -__v");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Updated user:", updatedUser);

    return NextResponse.json({ user: updatedUser, success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}