
'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { navLinks } from './navlinks'
import { useTheme } from 'next-themes';

interface NavItem {
  title: string
  path: string
  submenu?: NavItem[]
}

const Header2: React.FC = () => {
  const [sticky, setSticky] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const { resolvedTheme } = useTheme();

  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
      setMobileOpen(false)
    }
  }

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 80)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleScroll])

  const isHomepage = pathname === '/'
  const isDark = resolvedTheme === 'dark';

const darkLogo = '/images/header/dark-propertycommunity.svg';
const lightLogo = '/images/header/propertycommunity.svg';


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
      <nav className={`container max-w-8xl mx-auto flex items-center justify-between py-4 duration-300 ${sticky ? "shadow-lg bg-white dark:bg-dark rounded-full px-6" : ""}`}>
        <div className='flex justify-between items-center w-full'>
          
        <Link href="/" className="flex-shrink-0 z-50">
  {/* MOBILE */}
  {!sticky && isHomepage ? (
    <Image
      src="/images/header/propertycommunity.svg"
   
      alt="logo"
      width={200}
      height={50}
      className="block lg:hidden h-8 w-auto"
      unoptimized
    />
  ) : (
    <Image
      // src="/images/header/dark-propertycommunity.svg"
         src={
    isDark
      ? lightLogo
      : !sticky && isHomepage
        ? lightLogo
        : darkLogo
  }
      alt="logo"
      width={200}
      height={50}
      className="block lg:hidden h-8 w-auto"
      unoptimized
    />
  )}

  {/* DESKTOP */}
  <Image
    // src="/images/header/dark-propertycommunity.svg"
    src={isDark ? lightLogo : darkLogo}
    alt="logo"
    width={400}
    height={100}
    unoptimized
    className={`hidden lg:block h-10 w-auto ${
      sticky || !isHomepage ? "" : "brightness-0 invert"
    }`}
  />
</Link>


          

          {/* Desktop Navigation - unchanged */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks
              .filter(item => item && typeof item.path === 'string')
              .map((item: NavItem, index) => (
                <div key={index} className="relative group px-1">
                  <Link
                    href={item.path}
                    className={`
                      px-5 py-2.5 rounded-lg text-base font-medium transition-colors
                      ${sticky || !isHomepage
                        ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-white hover:bg-white/10'
                      }
                      ${pathname === item.path ? 'font-semibold' : ''}
                    `}
                  >
                    {item.title}
                    {item.submenu && item.submenu.length > 0 && (
                      <Icon 
                        icon="solar:alt-arrow-down-bold" 
                        className="inline ml-1.5 text-sm opacity-70 group-hover:opacity-100"
                      />
                    )}
                  </Link>
                  
                  {item.submenu && item.submenu.length > 0 && (
                    <div 
                      className={`
                        absolute top-full left-0 min-w-[220px] pt-2 opacity-0 invisible 
                        group-hover:opacity-100 group-hover:visible transition-all duration-200
                        ${sticky || !isHomepage 
                          ? 'bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800'
                          : 'bg-black/80 backdrop-blur-md border border-white/20 rounded-xl'
                        }
                      `}
                    >
                      <div className="py-3">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.path}
                            className={`
                              block px-6 py-3 text-sm transition-colors
                              ${sticky || !isHomepage
                                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                : 'text-white/90 hover:bg-white/10'
                              }
                              ${pathname === subItem.path ? 'font-medium bg-gray-50 dark:bg-gray-800' : ''}
                            `}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* Auth buttons - desktop */}
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
              <Link
                href="/auth/signin"
                className={`
                  px-6 py-2.5 rounded-full font-medium transition
                  ${sticky || !isHomepage
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-white/10 text-white border border-white/40 hover:bg-white/20'
                  }
                `}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className={`
                  px-6 py-2.5 rounded-full font-medium transition
                  ${sticky || !isHomepage
                    ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                    : 'bg-white text-primary border border-white hover:bg-gray-100'
                  }
                `}
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg z-50"
            aria-label="Toggle menu"
          >
            <Icon 
              icon={mobileOpen ? "solar:close-square-bold" : "solar:hamburger-menu-bold"} 
              className={`text-3xl ${sticky || !isHomepage ? 'text-gray-800 dark:text-white' : 'text-white'}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden
          ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Sidebar Menu */}
      <div
        ref={mobileMenuRef}
        className={`
          fixed top-0 right-0 h-full w-full max-w-[320px] bg-white dark:bg-gray-950 shadow-2xl
          transform transition-transform duration-300 ease-out z-50 lg:hidden
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Mobile Header */}
          <div className="p-4 border-b dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between">
              <Image
                src="/images/header/propertycommunity.svg"
                alt="Logo"
                width={180}
                height={45}
                className="h-8 w-auto"
                unoptimized
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Icon icon="solar:close-square-bold" className="text-3xl" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-1">
              {navLinks.map((item: NavItem, index) => (
                <div key={index} className="mb-2">
                  <Link
                    href={item.path}
                    className={`
                      flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium
                      ${pathname === item.path 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{item.title}</span>
                    {item.submenu && item.submenu.length > 0 && (
                      <Icon icon="solar:alt-arrow-down-bold" className="text-xl opacity-70" />
                    )}
                  </Link>

                  {/* Mobile Submenu */}
                  {item.submenu && item.submenu.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-800 pl-4">
                      {item.submenu.map((sub, subIdx) => (
                        <Link
                          key={subIdx}
                          href={sub.path}
                          className={`
                            block px-4 py-2.5 rounded-md text-sm
                            ${pathname === sub.path 
                              ? 'text-primary font-medium' 
                              : 'text-gray-700 dark:text-gray-300 hover:text-primary'
                            }
                          `}
                          onClick={() => setMobileOpen(false)}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t dark:border-gray-800 mt-auto">
            <div className="flex flex-col gap-3">
              <Link
                href="/signin"
                className="py-3 px-4 bg-primary text-white rounded-lg text-center font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="py-3 px-4 border border-primary text-primary rounded-lg text-center font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Create Account
              </Link>
            </div>

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