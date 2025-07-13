"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import apiClient, { Post } from "@/lib/api-client";
import { Edit, Camera, Loader2 } from "lucide-react";
import { Suspense } from "react";

function ProfileContent() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  // Simplified auth check useEffect
  useEffect(() => {
    console.log("Profile - Auth state check:", {
      authLoading,
      isAuthenticated: isAuthenticated(),
      hasUser: !!user,
      userId: user?.id,
    });

    // If AuthContext is still doing its initial load, wait
    if (authLoading) {
      console.log("Profile - Waiting for AuthContext's initial load");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log("Profile - User not authenticated, redirecting to login");
      toast({
        title: "Authentication required",
        description: "Please log in to view your profile",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    // If we have user data, we're good to go
    if (user) {
      console.log("Profile - Auth check passed, user is authenticated");
      setIsLoadingData(false);
    }
  }, [authLoading, isAuthenticated, router, toast, user]);

  // Data fetching useEffect
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id || !isAuthenticated() || authLoading) {
        return;
      }
      setIsLoadingData(true);
      try {
        // Only fetch posts for this user
        const postsResponse = await apiClient.posts.listPosts();
        const allPosts = postsResponse.data.filter(
          (post) => post.user.id === user.id
        );
        setPosts(allPosts);
      } catch (error) {
        toast({
          title: "Error",
          description:
            "Failed to load your profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchUserData();
  }, [user?.id, isAuthenticated, authLoading, toast]);

  // Updated loading condition
  if (authLoading || !user || isLoadingData) {
    console.log("Profile - Showing loading state:", {
      authLoading,
      hasUser: !!user,
      isLoadingData,
    });
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50/30 to-[#D9BDF4]/10">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  // At this point, we know user is not null because of the check above
  const { username, email, avatar, bio } = user;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50/30 to-[#D9BDF4]/10">
      <Sidebar />

      <div className="flex-1 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="relative pt-16 px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* Avatar */}
                <div className="flex justify-between">
                  <div className="relative justify-between mb-4 sm:mb-0">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={
                          avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${username}`
                        }
                        alt={username}
                      />
                      <AvatarFallback className="text-2xl bg-[#D9BDF4] text-purple-800">
                        {username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 bg-white border-white hover:bg-gray-50"
                      onClick={() =>
                        toast({
                          title: "Coming Soon",
                          description:
                            "Profile picture upload will be available soon!",
                        })
                      }
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-10 ml-10">
                    <h1 className="text-2xl font-bold text-purple-800">
                      {username}
                    </h1>
                    <p className="text-purple-600">{email}</p>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    className="border-[#D9BDF4] text-purple-700 hover:bg-[#D9BDF4]/10"
                    onClick={() =>
                      toast({
                        title: "Coming Soon",
                        description: "Profile editing will be available soon!",
                      })
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {bio && (
                <p className="mt-4 text-purple-800 leading-relaxed">{bio}</p>
              )}

              {/* Stats */}
              <div className="flex space-x-6 mt-4">
                <div className="text-center">
                  <div className="font-bold text-purple-800">
                    {posts.length}
                  </div>
                  <div className="text-sm text-purple-600">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-800">0</div>
                  <div className="text-sm text-purple-600">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-800">0</div>
                  <div className="text-sm text-purple-600">Books Read</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-1 bg-white/70 border border-[#D9BDF4]/20">
                  <TabsTrigger
                    value="posts"
                    className="data-[state=active]:bg-[#D9BDF4] data-[state=active]:text-purple-900"
                  >
                    Posts ({posts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-6">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        user={{
                          name: post.user.username,
                          username: post.user.username,
                          avatar: post.user.avatar || "",
                        }}
                        book={
                          post.book
                            ? {
                                title: post.book.title,
                                author: post.book.authors || "",
                                cover: post.book.cover_image_url || "",
                              }
                            : {
                                title: "",
                                author: "",
                                cover: "",
                              }
                        }
                        content={post.content}
                        timestamp={new Date(
                          post.created_at
                        ).toLocaleDateString()}
                        likes={post.likes_count}
                        comments={post.comments_count}
                        image={post.image}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">
                          No posts yet. Start sharing your reading journey!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* About */}
              <Card className="border-[#D9BDF4]/20 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-800">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-700">
                    {bio ||
                      "No bio yet. Add one to tell others about yourself!"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-gradient-to-br from-purple-50/30 to-[#D9BDF4]/10">
          <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
