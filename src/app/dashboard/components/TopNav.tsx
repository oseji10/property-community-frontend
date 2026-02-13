'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { getUserEmail, getUserName } from '@/app/lib/auth';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useUnreadStore } from '@/app/lib/stores/unreadStore';

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

  const { unreadCount, setUnreadCount } = useUnreadStore(); // ← correct usage

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const closeDropdown = () => setIsDropdownOpen(false);

  const fullName = getUserName();
  const email = getUserEmail();
  const [firstNamePart, lastNamePart] = fullName.split(' ');
  const firstNameFinal = firstNamePart || firstName;
  const lastNameFinal = lastNamePart || lastName;

  const initials = `${firstNameFinal[0] || ''}${lastNameFinal[0] || ''}`.toUpperCase() || 'U';

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadCount(res.data?.unreadCount || 0); // ← FIXED: use setter
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount(); // initial fetch

    const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []); // no dependencies needed here

  // ────────────────────────────────────────────────
  // LOGOUT LOGIC
  // ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(console.error);

    closeDropdown();
    router.push('/auth/signin');
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

        {/* Messages Icon with live unread count */}
        <Link
          href="/dashboard/messages"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition relative hover:cursor-pointer group"
          aria-label={`Messages (${unreadCount} unread)`}
        >
          <Icon icon="ph:chat-dots" width={24} height={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm transition-all group-hover:scale-110">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

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