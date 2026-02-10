'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top bar with hamburger — shown on < lg (includes md and smaller) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-800 dark:text-gray-200 focus:outline-none"
            aria-label="Open menu"
          >
            <Icon icon="ph:list-bold" width={32} height={32} />
          </button>

          <div className="text-lg font-semibold tracking-tight">
            Dashboard
          </div>

          <div className="w-8" /> {/* symmetry placeholder */}
        </div>
      </header>

      {/* Sidebar handles both modes */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}