import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import axios from "axios";

// GET /api/posts - List all posts
export async function GET() {
  try {
    console.log("Fetching posts...");
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/`);
    const posts = response.data;

    console.log(`Found ${posts.length} posts`);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, bookId, image } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Create the post using your backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/`,
      {
        content,
        image,
        book_id: bookId,
      },
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
} 