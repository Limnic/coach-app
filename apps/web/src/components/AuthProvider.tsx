'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

const publicPaths = ['/login', '/register', '/forgot-password'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on a public path
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    if (!isAuthenticated && !isPublicPath) {
      // Not authenticated and trying to access protected route
      router.push('/login');
    } else if (isAuthenticated && isPublicPath) {
      // Already authenticated but on auth page, redirect to dashboard
      router.push('/');
    }
    
    setIsLoading(false);
  }, [isAuthenticated, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-surface-400">Loading...</p>
        </div>
      </div>
    );
  }

  // For public paths, always render children
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  if (isPublicPath) {
    return <>{children}</>;
  }

  // For protected paths, only render if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

