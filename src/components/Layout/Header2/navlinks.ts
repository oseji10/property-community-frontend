// src/app/api/navlink.ts (or wherever it lives)
export const navLinks: NavItem[] = [
  {
    title: 'Home',
    path: '/',                    // ← must be string
  },
  {
    title: 'Properties',
    path: '#',
    submenu: [
      { title: 'Buy', path: '/properties' },
      { title: 'Sell', path: '/dashboard/add-new-property' },
      { title: 'Rent', path: '/properties' },
      // { title: 'New Developments', path: '/new-developments' },
    ],
  },
  {
    title: 'Workforce',
    path: '/workforce',
  },
  {
    title: 'Services',
    path: '#',
    submenu: [
      { title: 'Property Management', path: '/property-management' },
      { title: 'Legal Services', path: '/legal-services' },
      { title: 'Title Documentation', path: '/title-documentation' },
      { title: 'Consultation', path: '/consultation' },
      { title: 'Contract Services', path: '/contract-services' },
      { title: 'Property Development', path: '/property-development' },
      { title: 'Engineering Services', path: '/engineering-services' },
      { title: 'Architectural Services', path: '/architectural-services' },
    ],
  },
  {
    title: 'Contact',
    path: '/contactus',
  },
  // ... etc.
];