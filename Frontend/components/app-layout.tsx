"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
  // Don't show sidebar on auth pages
  const isAuthPage = pathname.startsWith('/auth');
  
  // Show sidebar if user is authenticated (including on home page) or if not on auth pages
  const showSidebar = !isAuthPage && (user || (!isLoading && pathname !== '/'));

  if (showSidebar) {
    return (
      <div className="flex flex-col md:flex-row">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main content */}
        <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Floating Action Button for Create Post */}
        {user && (
          <div className="md:hidden fixed bottom-20 right-4 z-50">
            <Link href="/create-post">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-[#D9BDF4] hover:bg-[#C9A9E4] text-purple-900 shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        )}
        
        {/* Mobile bottom navigation - hidden on desktop */}
        <div className="md:hidden">
          <Sidebar />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
