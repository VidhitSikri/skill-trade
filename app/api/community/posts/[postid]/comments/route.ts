import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import CommunityPost from "@/models/communityPostModel";
import { NextRequest, NextResponse } from "next/server";

// POST /api/community/posts/[postid]/comments — add a comment
export async function POST(request: NextRequest, { params }: { params: { postid: string } }) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: "Comment content is required" }, { status: 400 });

    const post = await CommunityPost.findById(params.postid);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    post.comments.push({
      content: text.trim(),
      user: userId,
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await CommunityPost.findById(post._id)
      .populate("comments.user", "username profilePic rank");

    return NextResponse.json({ success: true, comments: updatedPost?.comments ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/community/posts/[postid]/comments — get all comments for a post
export async function GET(request: NextRequest, { params }: { params: { postid: string } }) {
  try {
    await connectDB();

    const post = await CommunityPost.findById(params.postid)
      .populate("comments.user", "username profilePic rank")
      .select("comments");

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json({ success: true, comments: post.comments ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}