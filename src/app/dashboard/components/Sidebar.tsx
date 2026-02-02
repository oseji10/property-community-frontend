'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // ← create this helper or use clsx/tailwind-merge
import Image from 'next/image';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'ph:chart-bar' },
  { href: '/dashboard/properties', label: 'Properties', icon: 'ph:house-simple-fill' },
  {href: '/dashboard/add-new-property', label: 'Add New Property', icon: 'ph:plus-circle-fill' },
  { href: '/dashboard/users', label: 'Users', icon: 'ph:users' },
  { href: '/dashboard/inquiries', label: 'Inquiries / Contact', icon: 'ph:envelope-simple' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'ph:gear-six' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="h-full flex flex-col">
        {/* Logo / Brand */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          {/* <Link href="/dashboard" className="text-2xl font-bold text-primary">
            Property Admin
          </Link> */}
           <Link href="/" className="flex-shrink-0">
           <Image
                src={'/images/header/dark-propertycommunity.svg'}
                alt='logo'
                width={400}
                height={100}
                unoptimized={true}
                className="block dark:hidden"
              />
            <Image
                src={'/images/header/propertycommunity.svg'}
                alt='logo'
                width={400}
                height={100}
                unoptimized={true}
                className="hidden dark:block"
              />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition',
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

        {/* User / Logout section */}
        {/* <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium truncate">Admin User</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                admin@gleamer.com
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </aside>
  );
}