'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { navLinks } from './navlinks'
import { useTheme } from 'next-themes'
import api from '@/app/lib/api'

interface NavItem {
  title: string
  path: string
  submenu?: NavItem[]
}

interface User {
  firstName: string
  lastName: string
  otherNames?: string
  email: string
  role: number
  id: number
}

const Header2: React.FC = () => {
  const [sticky, setSticky] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const isLoggedIn = !!user
  const isHomepage = pathname === '/'
  const isDark = resolvedTheme === 'dark'

  const darkLogo = '/images/header/dark-logo.png'
  const lightLogo = '/images/header/logo.png'

  const displayName = user
    ? user.firstName || user.email.split('@')[0]
    : ''

  /* ---------------- Auth Check ---------------- */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/user')
        if (data?.id && data?.email) setUser(data)
        else setUser(null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  /* ---------------- Sticky Header ---------------- */
  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 80)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  /* ---------------- Click Outside Mobile Menu ---------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
   <header
      className="
        fixed 
        top-[25px]  
        md:top-10
        lg:top-8            
        left-0 right-0 z-50 w-full bg-transparent 
        transition-all duration-300 
        px-4 py-6 md:px-6 md:py-8 lg:py-10 lg:px-0
      "
    >
      {/* ================= NAV BAR ================= */}
      <nav
        className={`
          container max-w-8xl mx-auto
          flex items-center justify-between
          py-3 md:py-4
          transition-all duration-300
          ${sticky ? 'bg-white dark:bg-dark shadow-lg rounded-full px-4 xl:px-6' : ''}
        `}
      >
        <div className="flex items-center justify-between w-full">
          {/* ================= LOGO ================= */}
          <Link href="/" className="flex-shrink-0 z-50">
            {/* Mobile + Tablet */}
            <Image
              src={isDark ? lightLogo : darkLogo}
              alt="Logo"
              width={200}
              height={50}
              className="block xl:hidden h-8 md:h-10 w-auto"
              unoptimized
            />

            {/* Desktop */}
            <Image
              src={isDark ? lightLogo : darkLogo}
              alt="Logo"
              width={400}
              height={100}
              className={`hidden xl:block h-14 w-auto ${
                sticky || !isHomepage ? '' : 'brightness-0 invert'
              }`}
              unoptimized
            />
          </Link>

          {/* ================= DESKTOP NAV (xl+) ================= */}
          <div className="hidden xl:flex items-center space-x-1">
            {navLinks.map((item: NavItem, index) => (
              <div key={index} className="relative group">
                <Link
                  href={item.path}
                  className={`
                    px-4 xl:px-5 py-2
                    text-sm xl:text-base font-medium
                    rounded-lg transition
                    ${sticky || !isHomepage
                      ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-white hover:bg-white/10'
                    }
                  `}
                >
                  {item.title}
                  {item.submenu && (
                    <Icon
                      icon="solar:alt-arrow-down-bold"
                      className="inline ml-1 text-sm opacity-70"
                    />
                  )}
                </Link>

                {item.submenu && (
                  <div
                    className={`
                      absolute top-full left-0 mt-2 min-w-[220px]
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200
                      rounded-xl shadow-xl
                      ${sticky || !isHomepage
                        ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
                        : 'bg-black/80 backdrop-blur-md border border-white/20'
                      }
                    `}
                  >
                    {item.submenu.map((sub, i) => (
                      <Link
                        key={i}
                        href={sub.path}
                        className="
                          block px-6 py-3 text-sm
                          hover:bg-gray-100 dark:hover:bg-gray-800
                        "
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* ===== Auth Section (Desktop) ===== */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l">
              {loading ? (
                <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
              ) : isLoggedIn ? (
                <>
                  <span className="text-sm font-medium">
                    Hi, {displayName}
                  </span>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 text-sm rounded-full bg-primary text-white"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-5 py-2 text-sm rounded-full bg-primary text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-5 py-2 text-sm rounded-full border border-primary text-primary"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ================= HAMBURGER (Mobile + Tablet) ================= */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2 z-50"
          >
            <Icon
              icon={mobileOpen ? 'solar:close-square-bold' : 'solar:hamburger-menu-bold'}
              className={`text-3xl ${
                sticky || !isHomepage ? 'text-gray-800 dark:text-white' : 'text-white'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* ================= OVERLAY ================= */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden
          ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        onClick={() => setMobileOpen(false)}
      />

      {/* ================= MOBILE / TABLET SIDEBAR ================= */}
      <div
        ref={mobileMenuRef}
        className={`
          fixed top-0 right-0 h-full
          w-full max-w-[360px] md:max-w-[420px]
          bg-white dark:bg-gray-950
          shadow-2xl
          transform transition-transform duration-300
          z-50 xl:hidden
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto p-4">
          <nav className="space-y-2">
            {navLinks.map((item, i) => (
              <Link
                key={i}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="block text-center py-3 bg-primary text-white rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-center py-3 bg-primary text-white rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block text-center py-3 border border-primary text-primary rounded-lg"
                >
                  Create Account
                </Link>
              </>
            )}

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium mb-1">Contact us:</p>
              <a 
                href="mailto:hello@propertycommunity.com" 
                className="text-primary hover:underline break-words"
              >
                hello@propertycommunity.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header2
