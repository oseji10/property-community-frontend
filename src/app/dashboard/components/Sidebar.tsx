'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import api from '@/app/lib/api';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'ph:shield-checkered-fill' },
  { href: '/dashboard/properties', label: 'Properties', icon: 'ph:house-simple-fill' },
  { href: '/dashboard/add-new-property', label: 'Add New Property', icon: 'ph:plus-circle-fill' },
  // { href: '/dashboard/users', label: 'Users', icon: 'ph:users' },
  // { href: '/dashboard/inquiries', label: 'Inquiries / Contact', icon: 'ph:envelope-simple' },
  // { href: '/dashboard/settings', label: 'Settings', icon: 'ph:gear-six' },
  { href: '/', label: 'Return To Website', icon: 'ph:arrow-left' },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data once on mount
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        const response = await api.get("/user", { withCredentials: true });
        setIsAuthenticated(true);
        setUserData(response.data);
        setIsAdmin(response.data.role === 'ADMIN');
      } catch {
        setIsAuthenticated(false);
        setUserData(null);
        setIsAdmin(false);
      }
    };
    checkAuthAndFetchUser();
  }, []);

  // Redirect when not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, router]);

  // Token refresh interceptor
  const refreshToken = useCallback(async () => {
    try {
      await api.post("/refresh", {}, { withCredentials: true });
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response?.status === 401 &&
          error.config &&
          !error.config.__isRetryRequest
        ) {
          error.config.__isRetryRequest = true;
          const refreshed = await refreshToken();
          if (refreshed) {
            return api(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);


    const handleLogout = () => {
    // 1. Clear localStorage (adjust keys to match what you actually store)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');   // if you use different name
    localStorage.removeItem('refresh_token');  // if you have one

    // 2. Clear non-httpOnly cookies (most client-side set cookies)
    //    This won't clear httpOnly cookies — those need server-side handling
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // 3. Optional: Call logout API endpoint (recommended if you have refresh tokens
    //    or want the backend to invalidate the session)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
      .catch(console.error);
 
    router.push('/auth/signin');           // or '/signin' — use your actual login path
    // router.replace('/login');     // if you want to prevent back-button access
  };


  if (isAuthenticated === null) {
    return <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-white dark:bg-gray-900" />;
  }

  if (!isAuthenticated) return null;

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex-shrink-0 block" onClick={onClose}>
          <Image
            src="/images/header/dark-logo.png"
            alt="logo"
            width={400}
            height={100}
            unoptimized
            className="block dark:hidden w-full max-w-[220px]"
          />
          <Image
            src="/images/header/logo.png"
            alt="logo"
            width={400}
            height={100}
            unoptimized
            className="hidden dark:block w-full max-w-[220px]"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            if (item.href === '/dashboard/' && !isAdmin) return null;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon icon={item.icon} width={24} height={24} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Optional: User section / logout can go here later */}
      <Button
        // href="/auth/signout"
        className="m-6 px-4 py-3 bg-red-500 text-white rounded-lg text-center hover:bg-red-600 transition-colors hover:cursor-pointer"
        // onClick={onClose}
        onClick={handleLogout}
      >
        Sign Out
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {sidebarContent}
      </aside>

      {/* Mobile: slide-in drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden transition-transform duration-300 ease-in-out transform',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <aside className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}