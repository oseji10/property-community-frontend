'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

const Header1: React.FC = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const sideMenuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) {
      setNavbarOpen(false);
    }
  };

  const handleScroll = useCallback(() => {
    setHasScrolled(window.scrollY >= 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    handleScroll(); // initial check
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleScroll]);

  const isHomepage = pathname === '/';

  const textColor = hasScrolled
    ? 'text-white'
    : isHomepage
      ? 'text-white'
      : 'text-gray-800';

  const hoverColor = hasScrolled
    ? 'hover:text-white/90'
    : isHomepage
      ? 'hover:text-white/90'
      : 'hover:text-gray-900';

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        w-full
        bg-[#FF8C00] dark:bg-dark shadow-lg
      "
    >
      <nav
        className="
          container mx-auto max-w-8xl
          px-4 sm:px-6 lg:px-8
          flex items-center justify-between
          transition-all duration-300
          min-h-[48px] md:min-h-[60px]
          ${hasScrolled ? 'py-2' : 'py-3 md:py-4'}
        "
      >
        {/* Left: Contact info - hide on very small screens or compact */}
        <div className="hidden lg:flex items-center gap-3 md:gap-6 text-xs md:text-sm font-medium ">
          <Link
            href="mailto:info@yourcompany.com"
            className={`flex items-center gap-1.5 ${textColor} ${hoverColor}`}
          >
            <Icon icon="solar:letter-bold" width={18} height={18} className="shrink-0" />
            info@yourcompany.com
          </Link>

          <Link
            href="tel:+1212456789"
            className={`flex items-center gap-1.5 ${textColor} ${hoverColor}`}
          >
            <Icon icon="ph:phone-bold" width={18} height={18} className="shrink-0" />
            +1-212-456-789
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
          {/* Social icons - show on md+, compact on sm */}
          <div className="hidden sm:flex items-center gap-2 md:gap-4">
            <a
              href="https://x.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className={`${textColor} ${hoverColor} hover:cursor-pointer`}
            >
              <Icon icon="ri:twitter-x-fill" width={20} height={20} />
            </a>
            <a
              href="https://facebook.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className={`${textColor} ${hoverColor} hover:cursor-pointer`}
            >
              <Icon icon="ri:facebook-fill" width={20} height={20} />
            </a>
            <a
              href="https://instagram.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className={`${textColor} ${hoverColor} hover:cursor-pointer`}
            >
              <Icon icon="ri:instagram-fill" width={20} height={20} />
            </a>
          </div>

          {/* Action buttons - compact on mobile */}
<div className="flex items-center gap-2 sm:gap-3 md:gap-4 pointer-events-auto">
            <Link
              href="/buy-property"
              className={`
                flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-white dark:text-white 
                hover:bg-black/20 dark:hover:bg-white/10 duration-300 text-xs sm:text-sm md:text-base 
                font-semibold rounded-full ${hoverColor} hover:cursor-pointer
              `}
            >
              <FontAwesomeIcon icon={faArrowCircleRight} className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Buy</span>
              <span className="xs:hidden">Buy</span>
            </Link>

            <Link
              href="/sell-property"
              className={`
                flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-white dark:text-white 
                hover:bg-black/20 dark:hover:bg-white/10 duration-300 text-xs sm:text-sm md:text-base 
                font-semibold rounded-full ${hoverColor} hover:cursor-pointer
              `}
            >
              <FontAwesomeIcon icon={faArrowCircleRight} className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Sell</span>
              <span className="xs:hidden">Sell</span>
            </Link>

            <Link
              href="/list-property"
              className={`
                flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-white dark:text-white 
                hover:bg-black/20 dark:hover:bg-white/10 duration-300 text-xs sm:text-sm md:text-base 
                font-semibold rounded-full ${hoverColor} hover:cursor-pointer
              `}
            >
              <FontAwesomeIcon icon={faArrowCircleRight} className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">List</span>
              <span className="xs:hidden">List</span>
            </Link>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:cursor-pointer flex-shrink-0"
          >
            <Icon
              icon="solar:sun-bold"
              width={24} height={24}
              className={`dark:hidden block ${textColor}`}
            />
            <Icon
              icon="solar:moon-bold"
              width={24} height={24}
              className="dark:block hidden text-white"
            />
          </button>
        </div>
      </nav>

      {/* Optional mobile dropdown if needed - but since it's a top bar, perhaps not */}
      {navbarOpen && (
        <div 
          ref={sideMenuRef}
          className="fixed top-[48px] right-4 w-48 bg-white dark:bg-dark shadow-xl rounded-xl p-4 z-40 md:hidden"
        >
          {/* Add mobile-specific items if needed, e.g. contact/social */}
          <div className="space-y-3">
            <Link 
              href="mailto:info@yourcompany.com" 
              className="block text-sm hover:cursor-pointer hover:text-blue-600"
              onClick={() => setNavbarOpen(false)}
            >
              info@yourcompany.com
            </Link>
            <Link 
              href="tel:+1212456789" 
              className="block text-sm hover:cursor-pointer hover:text-blue-600"
              onClick={() => setNavbarOpen(false)}
            >
              +1-212-456-789
            </Link>
            {/* Social links */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header1;