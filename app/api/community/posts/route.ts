import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import CommunityPost from "@/models/communityPostModel";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, tags } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const newPost = new CommunityPost({
      content,
      tags: tags || [],
      user: userId,
      likes: 0,
      comments: [],
    });
    await newPost.save();

    const populatedPost = await CommunityPost.findById(newPost._id)
      .populate("user", "username rank");

    return NextResponse.json({ post: populatedPost }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({})
      .populate("user", "username rank")
      .populate("comments.user", "username profilePic rank")
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Population Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}