"use client";

import { useState } from "react";
import { Comment } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";

interface CommentThreadProps {
  comment: Comment;
  postId: number;
  onCommentAdded: () => void;
  depth?: number;
}

export function CommentThread({
  comment,
  postId,
  onCommentAdded,
  depth = 0,
}: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.comments.createComment(postId, {
        content: replyContent,
        parent: comment.id,
      });

      setReplyContent("");
      setReplyingTo(false);
      onCommentAdded(); // Refresh comments

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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`${depth > 0 ? "ml-6 border-l-2 border-purple-200 pl-4" : ""}`}
    >
      <Card className="mb-3">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.avatar} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                {comment.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-purple-800 text-sm">
                  {comment.user.username}
                </h4>
                <span className="text-purple-500 text-xs">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-purple-700 text-sm mb-3">{comment.content}</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 text-xs"
                  onClick={() => setReplyingTo(!replyingTo)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>

              {/* Reply Form */}
              {replyingTo && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={submitting || !replyContent.trim()}
                      className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Reply"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(false);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
