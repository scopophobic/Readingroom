"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postsApi, booksApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks/use-toast";

export default function TestIntegrationPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Posts API
      console.log("Testing Posts API...");
      const postsResponse = await postsApi.listPosts();
      results.posts = {
        success: postsResponse.status === 200,
        count: postsResponse.data?.length || 0,
        error: postsResponse.status !== 200 ? "Failed to fetch posts" : null,
      };
      setPosts(postsResponse.data || []);

      // Test 2: Books API
      console.log("Testing Books API...");
      const booksResponse = await booksApi.listBooks();
      results.books = {
        success: booksResponse.status === 200,
        count: booksResponse.data?.length || 0,
        error: booksResponse.status !== 200 ? "Failed to fetch books" : null,
      };
      setBooks(booksResponse.data || []);

      // Test 3: Authentication Status
      results.auth = {
        authenticated: isAuthenticated(),
        user: user ? { id: user.id, username: user.username } : null,
      };
    } catch (error) {
      console.error("Integration test failed:", error);
      results.error = "General test failure";
    }

    setTestResults(results);
    setLoading(false);

    // Show toast with results
    const successCount = Object.values(results).filter(
      (r: any) => r?.success
    ).length;
    const totalTests = Object.keys(results).length;

    toast({
      title: `Integration Test Complete`,
      description: `${successCount}/${totalTests} tests passed`,
      variant: successCount === totalTests ? "default" : "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">
            Frontend-Backend Integration Test
          </h1>
          <p className="text-lg text-purple-700/70">
            Test the integration between frontend and backend APIs
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={runTests} disabled={loading} className="w-full">
                {loading ? "Running Tests..." : "Run Integration Tests"}
              </Button>
            </CardContent>
          </Card>

          {Object.keys(testResults).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(testResults).map(
                    ([key, result]: [string, any]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </h3>
                          {result.error && (
                            <p className="text-red-600 text-sm">
                              {result.error}
                            </p>
                          )}
                          {result.count !== undefined && (
                            <p className="text-gray-600 text-sm">
                              Count: {result.count}
                            </p>
                          )}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.success
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {result.success ? "✅ Pass" : "❌ Fail"}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {posts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Posts ({posts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {posts.slice(0, 3).map((post: any) => (
                    <div key={post.id} className="p-3 border rounded-lg">
                      <p className="font-medium">
                        {post.content?.substring(0, 100)}...
                      </p>
                      <p className="text-sm text-gray-600">
                        By {post.user?.username || post.author?.username} on{" "}
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {books.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Books ({books.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {books.slice(0, 3).map((book: any) => (
                    <div key={book.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-gray-600">By {book.authors}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            This page tests the core API integration between frontend and
            backend. Check the browser console for detailed logs.
          </p>
        </div>
      </div>
    </div>
  );
}
