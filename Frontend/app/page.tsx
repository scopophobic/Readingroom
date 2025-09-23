"use client";

import { useAuth } from "@/lib/auth-context";
import ReadingRoomLanding from "@/components/landing-page";
import { MainContent } from "@/components/main-content";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-800 mx-auto"></div>
          <p className="mt-4 text-purple-800">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the main content with posts
  if (user) {
    return <MainContent />;
  }

  // If not authenticated, show the landing page
  return <ReadingRoomLanding />;
}
