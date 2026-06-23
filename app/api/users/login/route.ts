import { connectDB } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/users/login
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const reqBody = await request.json();
    const { email, password } = reqBody;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Build JWT payload
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET ?? process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Return user data (excluding sensitive fields)
    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      rank: user.rank,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
      skillsToTeach: user.skillsToTeach,
      skillsToLearn: user.skillsToLearn,
      currentlyLearning: user.currentlyLearning,
      xp: user.xp,
      sessionsCompleted: user.sessionsCompleted,
      isFindingMatch: user.isFindingMatch,
    };

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: safeUser,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}