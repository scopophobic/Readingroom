"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Post } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Plus,
  Loader2,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Sidebar } from "@/components/sidebar";

export default function PostsFeed() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    fetchPosts();
  }, [isAuthenticated, router]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.posts.listPosts();
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await apiClient.posts.likePost(postId);
      await fetchPosts(); // Refresh to get updated like count
    } catch (error) {
      console.error("Failed to like post:", error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnlikePost = async (postId: number) => {
    try {
      await apiClient.posts.unlikePost(postId);
      await fetchPosts(); // Refresh to get updated like count
    } catch (error) {
      console.error("Failed to unlike post:", error);
      toast({
        title: "Error",
        description: "Failed to unlike post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="text-lg text-purple-700">Loading posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50/30 to-[#D9BDF4]/10">
      <Sidebar />
      <div className="flex-1 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-800 mb-2">
              Reading Room Feed
            </h1>
            <p className="text-purple-600">
              Discover what your fellow readers are thinking about
            </p>
          </div>
          <Button
            onClick={() => router.push("/create-post")}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-purple-700 mb-2">
                  No posts yet
                </h3>
                <p className="text-purple-600 mb-4">
                  Be the first to share your thoughts with the community!
                </p>
                <Button
                  onClick={() => router.push("/create-post")}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Link href={`/posts/${post.id}`} key={post.id}>
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {post.user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-purple-800">
                            {post.user?.username || "Unknown User"}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            Reader
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-purple-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Book Information */}
                    {post.book && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-3">
                          {post.book.cover_image_url && (
                            <img
                              src={post.book.cover_image_url}
                              alt={post.book.title}
                              className="w-12 h-16 object-cover rounded shadow-sm"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-800 text-sm">
                              {post.book.title}
                            </h4>
                            {post.book.authors && (
                              <p className="text-purple-600 text-xs">
                                by {post.book.authors}
                              </p>
                            )}
                            {post.book.publisher && (
                              <p className="text-purple-500 text-xs">
                                {post.book.publisher}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-purple-700 leading-relaxed mb-4">
                      {post.content}
                    </p>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            post.is_liked
                              ? handleUnlikePost(post.id)
                              : handleLikePost(post.id)
                          }
                          className={`flex items-center space-x-1 ${
                            post.is_liked
                              ? "text-red-500 hover:text-red-600"
                              : "text-purple-600 hover:text-purple-700"
                          }`}
                        >
                          {post.is_liked ? (
                            <ThumbsUp className="h-4 w-4 fill-current" />
                          ) : (
                            <Heart className="h-4 w-4" />
                          )}
                          <span>{post.likes_count}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/posts/${post.id}`);
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments_count}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </Button>
                      </div>

                      {post.book && (
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Book Discussion
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
