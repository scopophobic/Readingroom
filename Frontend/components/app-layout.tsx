"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";

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
      <div className="flex">
        <Sidebar />
        {/* Main content with proper left margin to account for fixed sidebar */}
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
