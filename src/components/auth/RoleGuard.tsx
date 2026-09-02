// src/components/auth/RoleGuard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Spin } from 'antd';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run initialize on mount to ensure Zustand has hydrated from localStorage/cookies
    initialize();
    setIsChecking(false);
  }, [initialize]);

  useEffect(() => {
    if (isChecking) return; // Wait until initialize has finished

    // Give it a small delay for hydration if needed, but checking user works once hydrated.
    if (!isLoading) {
      if (!isAuthenticated) {
        const queryString = searchParams.toString();
        const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      } else if (allowedRoles && allowedRoles.length > 0) {
        if (!user?.role || !allowedRoles.includes(user.role)) {
          // If logged in but role not allowed, redirect USER to /dashboard/folder and others to /dashboard
          const fallbackPath = user?.role === 'USER' ? '/dashboard/folder' : '/dashboard';
          router.replace(fallbackPath);
        } else {
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, isChecking]);

  if (isLoading || !isReady || isChecking) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
