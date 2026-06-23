import { connectDB } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

// POST /api/users/register
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const reqBody = await request.json();
    const { username, email, password, skillsToTeach, skillsToLearn, currentlyLearning } = reqBody;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // Check if email is taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      skillsToTeach: skillsToTeach ?? [],
      skillsToLearn: skillsToLearn ?? [],
      currentlyLearning: currentlyLearning ?? (skillsToLearn?.[0] ?? ""),
    });

    const savedUser = await newUser.save();

    // Send verification email (non-blocking — don't fail registration if email fails)
    try {
      await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue — user is created, just email failed
    }

    return NextResponse.json({
      message: "Account created successfully! Please check your email to verify your account.",
      success: true,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        rank: savedUser.rank,
        isVerified: savedUser.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}