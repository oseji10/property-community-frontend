'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';           // ← added
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { getUserEmail, getUserName } from '@/app/lib/auth';

interface TopNavProps {
  title: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

export default function TopNav({
  title,
  firstName = 'Admin',
  lastName = 'User',
  avatarUrl,
}: TopNavProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const closeDropdown = () => setIsDropdownOpen(false);

  const fullName = getUserName();
  const email = getUserEmail();
  const [firstNamePart, lastNamePart] = fullName.split(' ');
  const firstNameFinal = firstNamePart || firstName;
  const lastNameFinal = lastNamePart || lastName;

  const initials = `${firstNameFinal[0] || ''}${lastNameFinal[0] || ''}`.toUpperCase() || 'AU';

  // ────────────────────────────────────────────────
  //              LOGOUT LOGIC
  // ────────────────────────────────────────────────
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

    // 4. Close dropdown & redirect
    closeDropdown();
    router.push('/auth/signin');           // or '/signin' — use your actual login path
    // router.replace('/login');     // if you want to prevent back-button access
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-5 flex items-center justify-between">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-5">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hover:cursor-pointer"
        >
          <Icon
            icon="solar:sun-bold"
            width={28}
            height={28}
            className={`dark:hidden block`}
          />
          <Icon
            icon="solar:moon-bold"
            width={28}
            height={28}
            className="dark:block hidden text-white"
          />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition relative hover:cursor-pointer"
          aria-label="Notifications"
        >
          <Icon icon="ph:bell" width={24} height={24} />
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-3 hover:opacity-90 transition focus:outline-none hover:cursor-pointer"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${firstNameFinal} ${lastNameFinal}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-lg border-2 border-primary/30">
                {initials}
              </div>
            )}

            {/* Name */}
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="font-medium text-sm leading-tight">
                {fullName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {email}
              </span>
            </div>

            <Icon
              icon="ph:caret-down"
              width={16}
              height={16}
              className="text-gray-500 dark:text-gray-400"
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={closeDropdown}
                aria-hidden="true"
              />

              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-medium">{fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {email}
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={closeDropdown}
                  >
                    <Icon icon="ph:user-circle" width={20} height={20} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={closeDropdown}
                  >
                    <Icon icon="ph:gear-six" width={20} height={20} />
                    <span>Settings</span>
                  </Link>

                  <hr className="my-1 border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition hover:cursor-pointer"
                  >
                    <Icon icon="ph:sign-out" width={20} height={20} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}