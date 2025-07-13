"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Post, Comment } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  Reply,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { CommentThread } from "@/components/CommentThread";
import { Sidebar } from "@/components/sidebar";

export default function PostDetail() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    fetchPostAndComments();
  }, [postId, isAuthenticated, router]);

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      const [postResponse, commentsResponse] = await Promise.all([
        apiClient.posts.getPost(parseInt(postId)),
        apiClient.comments.listComments(parseInt(postId)),
      ]);

      setPost(postResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error("Failed to fetch post and comments:", error);
      toast({
        title: "Error",
        description: "Failed to load post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!post) return;
    try {
      await apiClient.posts.likePost(post.id);
      await fetchPostAndComments(); // Refresh to get updated like count
    } catch (error) {
      console.error("Failed to like post:", error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnlikePost = async () => {
    if (!post) return;
    try {
      await apiClient.posts.unlikePost(post.id);
      await fetchPostAndComments(); // Refresh to get updated like count
    } catch (error) {
      console.error("Failed to unlike post:", error);
      toast({
        title: "Error",
        description: "Failed to unlike post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingComment(true);
      await apiClient.comments.createComment(parseInt(postId), {
        content: newComment,
      });

      setNewComment("");
      await fetchPostAndComments(); // Refresh comments

      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.comments.createComment(parseInt(postId), {
        content: replyContent,
        parent: commentId,
      });

      setReplyContent("");
      setReplyingTo(null);
      await fetchPostAndComments(); // Refresh comments

      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
    } catch (error) {
      console.error("Failed to post reply:", error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
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
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50/30 to-[#D9BDF4]/10">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="text-lg text-purple-700">Loading post...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50/30 to-[#D9BDF4]/10">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              Post not found
            </h2>
            <Link href="/posts">
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50/30 to-[#D9BDF4]/10">
      <Sidebar />
      <div className="flex-1 max-w-6xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/posts">
            <Button
              variant="ghost"
              className="text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
        </div>

        {/* Main Post */}
        <Card className="mb-8">
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
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-4">
                  {post.book.cover_image_url && (
                    <img
                      src={post.book.cover_image_url}
                      alt={post.book.title}
                      className="w-16 h-20 object-cover rounded shadow-sm"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-800 text-lg mb-1">
                      {post.book.title}
                    </h4>
                    {post.book.authors && (
                      <p className="text-purple-600 text-sm mb-1">
                        by {post.book.authors}
                      </p>
                    )}
                    {post.book.publisher && (
                      <p className="text-purple-500 text-sm mb-2">
                        {post.book.publisher}
                      </p>
                    )}
                    {post.book.description && (
                      <p className="text-purple-700 text-sm line-clamp-3">
                        {post.book.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-purple-700 leading-relaxed text-lg mb-6">
              {post.content}
            </p>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-purple-100">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={post.is_liked ? handleUnlikePost : handleLikePost}
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

                <div className="flex items-center space-x-1 text-purple-600">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count} comments</span>
                </div>

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

        {/* Comments Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-purple-800 mb-4">
            Comments ({comments.length})
          </h3>

          {/* Add Comment */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts on this post..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <MessageCircle className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                  <h4 className="text-lg font-semibold text-purple-700 mb-2">
                    No comments yet
                  </h4>
                  <p className="text-purple-600">
                    Be the first to share your thoughts!
                  </p>
                </CardContent>
              </Card>
            ) : (
              // Filter top-level comments (no parent) and render them with CommentThread
              comments
                .filter((comment) => !comment.parent)
                .map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    postId={parseInt(postId)}
                    onCommentAdded={fetchPostAndComments}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
