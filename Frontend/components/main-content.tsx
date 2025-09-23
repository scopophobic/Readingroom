"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PostCard } from "@/components/post-card"
import { ReviewCard } from "@/components/review-card"
import { TrendingBooks } from "@/components/trending-books"
import { FeedHeader } from "@/components/feed-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, Post } from "@/lib/api-client"
import { Plus, Loader2, BookOpen } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function MainContent() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.posts.listPosts()
      setPosts(response.data)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      // Don't show error toast on home page, just show sample posts
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl mx-auto">
        <FeedHeader />

        <div className="space-y-6 p-6">
          {/* Header with Create Post Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-800 mb-2">Welcome to Reading Room! 📚</h1>
              <p className="text-purple-600">Discover, discuss, and share your love for books with fellow readers</p>
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-purple-700">Loading posts...</span>
              </div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => router.push(`/posts/${post.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-semibold">
                          {post.user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-800">
                          {post.user?.username || "Unknown User"}
                        </h3>
                        <p className="text-sm text-purple-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
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
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-purple-700 leading-relaxed mb-4">
                      {post.content}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-purple-500">
                      <span>❤️ {post.likes_count || 0} likes</span>
                      <span>💬 {post.comments_count || 0} comments</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Fallback to sample posts if no real posts available
            <div className="space-y-6">
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
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 p-6 border-l bg-card/30 backdrop-blur-sm">
        <TrendingBooks />
      </div>
    </div>
  )
}
