'use client'

import { NavItem } from '@/types/navlink' // adjust path to your NavItem type
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface NavLinkProps {
  item: NavItem
  onClick: () => void // usually closes mobile menu
}

const NavLink: React.FC<NavLinkProps> = ({ item, onClick }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isCollapsible = item.path === '#'
  const isActive =
    pathname === item.path ||
    (item.path !== '#' && pathname.startsWith(item.path)) ||
    (item.submenu?.some(sub => pathname === sub.path || pathname.startsWith(sub.path)) ?? false)

  const linkClasses = clsx(
    'py-3 text-4xl sm:text-6xl font-medium rounded-full transition-colors group-hover:text-primary',
    {
      '!text-primary': isActive,
      'text-white/40': !isActive,
    }
  )

  const underlineClasses = clsx(
    'w-0 h-0.5 bg-primary transition-all duration-300',
    {
      '!block w-6 mr-4': isActive,
      'block w-6 group-hover:block group-hover:w-6 group-hover:mr-4': true,
    }
  )

  const chevronClasses = clsx(
    'ml-4 transition-transform duration-300',
    isOpen && 'rotate-180'
  )

  const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();           // ← Add this line
  
  if (isCollapsible) {
    e.preventDefault();
    setIsOpen(prev => !prev);
    // still do NOT call onClick()
  } else {
    onClick();
  }
}

  return (
    <li className="w-full">
      {/* Parent row – clickable area */}
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={handleClick}
      >
        <div className="flex items-center">
          <div className={underlineClasses} />
          <span className={linkClasses}>{item.title}</span>
        </div>

        {item.submenu && item.submenu.length > 0 && (
          // <ChevronDown className={chevronClasses} size={32} strokeWidth={2.5} />
          <ChevronDown
  className={chevronClasses}
  size={32}
  strokeWidth={2.5}
  onClick={(e) => e.stopPropagation()}   // ← extra safety
/>
        )}
      </div>

      {/* Submenu – only shown when collapsible parent is open */}
      {item.submenu && item.submenu.length > 0 && isOpen && (
        <ul className="ml-12 mt-3 space-y-5 animate-fade-in">
          {item.submenu.map(sub => {
            const subActive = pathname === sub.path || pathname.startsWith(sub.path)

            return (
              <li key={sub.title}>
                <Link
                  href={sub.path}
                  className={clsx(
                    'text-3xl font-medium transition-colors',
                    subActive ? 'text-primary' : 'text-white/60 hover:text-primary'
                  )}
                  onClick={onClick} // close menu when clicking a real sub-link
                >
                  {sub.title}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

export default NavLink