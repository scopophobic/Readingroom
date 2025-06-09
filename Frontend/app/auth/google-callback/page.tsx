"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks/use-toast";

// Helper function to safely access localStorage
const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const code = searchParams.get("code");
      if (!code) {
        toast({
          title: "Error",
          description: "No authorization code received from Google",
          variant: "destructive",
        });
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate with Google");
        }

        const data = await response.json();

        if (data.access) {
          // Use the safe localStorage helper
          setLocalStorageItem("access_token", data.access);
          if (data.refresh) {
            setLocalStorageItem("refresh_token", data.refresh);
          }

          // Call login to update auth context
          await login({
            email: data.user.email,
            password: "", // Not needed for Google login
          });

          toast({
            title: "Success",
            description: "Successfully logged in with Google",
          });

          router.push("/profile");
        } else {
          throw new Error("No access token received");
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast({
          title: "Error",
          description: "Failed to login with Google. Please try again.",
          variant: "destructive",
        });
        router.push("/auth/login");
      }
    };

    handleGoogleLogin();
  }, [searchParams, router, login, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Processing Google Login...</h1>
        <p className="mt-2 text-gray-600">
          Please wait while we complete your login.
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Loading...</h1>
            <p className="mt-2 text-gray-600">
              Please wait while we process your login.
            </p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
