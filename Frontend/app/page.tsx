"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ReadingRoomLanding from "@/components/landing-page";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If user is authenticated and not loading, redirect to discover page
    if (isAuthenticated() && !isLoading) {
      router.push("/discover");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-800 mx-auto"></div>
          <p className="mt-4 text-purple-800">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show the landing page
  return <ReadingRoomLanding />;
}
