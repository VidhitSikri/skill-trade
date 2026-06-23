import { connectDB } from "@/dbconfig/dbconfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import CommunityPost from "@/models/communityPostModel";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";


export async function POST(request: NextRequest, { params }: { params: { postid: string } }) {
    try {
        await connectDB();
        // Verify user authentication
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find the post and validate
        const post = await CommunityPost.findById(params.postid);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Initialize likedBy array if missing
        if (!post.likedBy) post.likedBy = [];

        // Convert IDs for comparison
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const isAlreadyLiked = post.likedBy.some((id: mongoose.Types.ObjectId) => 
            id.equals(userObjectId)
        );

        // Toggle like status
        if (isAlreadyLiked) {
            // User already liked the post, so unlike it
            post.likes = Math.max(0, post.likes - 1); // Ensure likes don't go below 0
            post.likedBy = post.likedBy.filter((id: mongoose.Types.ObjectId) => 
                !id.equals(userObjectId)
            );
        } else {
            // User hasn't liked the post yet, so like it
            post.likes += 1;
            post.likedBy.push(userObjectId);
        }

        // Save changes
        await post.save();

        // Return the NEW liked status (opposite of isAlreadyLiked)
        return NextResponse.json({ 
            success: true, 
            likes: post.likes,
            liked: !isAlreadyLiked 
        });

    } catch (error: any) {
        console.error("Like operation failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}