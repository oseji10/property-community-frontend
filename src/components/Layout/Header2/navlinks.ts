// src/app/api/navlink.ts (or wherever it lives)
export const navLinks: NavItem[] = [
  {
    title: 'Home',
    path: '/',                    // ← must be string
  },
  {
    title: 'Properties',
    path: '/properties',
    submenu: [
      { title: 'Buy', path: '/buy' },
      { title: 'Rent', path: '/rent' },
      { title: 'New Developments', path: '/new-developments' },
    ],
  },
  {
    title: 'About',
    path: '/about',
  },
  {
    title: 'Contact',
    path: '/contact',
  },
  // ... etc.
];