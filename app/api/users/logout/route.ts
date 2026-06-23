import { NextResponse } from "next/server";

// POST /api/users/logout
// Clears the auth cookie to log the user out
export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logged out successfully",
      success: true,
    });

    // Clear the auth cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Also support GET for easy browser-triggered logout
export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Logged out successfully",
      success: true,
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}