import { connectDB } from "@/dbconfig/dbconfig";
import CommunityPost from "@/models/communityPostModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";


// Get single post
export async function GET(request: NextRequest, { params }: { params: { postid: string } }) {
    try {
        await connectDB();
        const post = await CommunityPost.findById(params.postid)
            .populate("user", "username rank")
            .populate("comments.user", "username profilePic rank");

        if (!post) {
            console.error("Post not found for ID:", params.postid);
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }


        return NextResponse.json({ post });
    } catch (error: any) {
        console.error("GET Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { postid: string } }) {
    try {
        await connectDB();
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postid } = params;

        // Find the post
        const post = await CommunityPost.findById(postid);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Check if the user is the owner of the post
        if (post.user.toString() !== userId) {
            return NextResponse.json({ error: "You do not have permission to delete this post" }, { status: 403 });
        }

        // Delete the post
        await post.deleteOne();

        return NextResponse.json({ success: true, message: "Post deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting post:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}