'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface TopNavProps {
  title: string;
  // We'll pass these from a layout or auth context in real apps
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string; // optional — if you have profile picture URL
}

export default function TopNav({
  title,
  firstName = 'Admin',
  lastName = 'User',
  email = 'admin@example.com',
  avatarUrl,
}: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const closeDropdown = () => setIsDropdownOpen(false);

  // Get initials for avatar fallback
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'AU';

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
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition relative"
          aria-label="Notifications"
        >
          <Icon icon="ph:bell" width={24} height={24} />
          {/* Optional badge */}
          {/* <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span> */}
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-3 hover:opacity-90 transition focus:outline-none"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${firstName} ${lastName}`}
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
                {firstName} {lastName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {email}
              </span>
            </div>

            {/* Chevron */}
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
              {/* Backdrop to close on outside click */}
              <div
                className="fixed inset-0 z-30"
                onClick={closeDropdown}
                aria-hidden="true"
              />

              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-medium">{firstName} {lastName}</p>
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
                    onClick={() => {
                      // Add real logout logic here (e.g. signOut from next-auth)
                      console.log('Logging out...');
                      closeDropdown();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
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