import Link from 'next/link';
import { Icon } from '@iconify/react';
import PropertyCard from './PropertyCard';

export default function FavoritePropertiesSection() {
  const favorites = [
    {
      title: 'Modern Apartment in Lekki',
      price: '₦ 450,000,000',
      location: 'Lekki Phase 1, Lagos',
      beds: 4,
      baths: 5,
      area: '420 sqm',
      image: '/images/properties/property7.jpg',
    },
    {
      title: 'Luxury Villa in Ikoyi',
      price: '₦ 780,000,000',
      location: 'Ikoyi, Lagos',
      beds: 5,
      baths: 6,
      area: '650 sqm',
      image: '/images/properties/property9.jpg',
    },
  ];

  return (
    <>
    
    {/* <section className="mt-8"> Added top margin */}
      <div className="flex items-center justify-between mb-4 mt-8"> {/* Simplified classes */}
        <h2 className="text-2xl font-semibold">Favorite Properties</h2>
        <Link
          href="/favorites"
          className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
        >
          View all <Icon icon="ph:arrow-right" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {favorites.map((prop, i) => (
          <PropertyCard key={i} {...prop} />
        ))}
      </div>
    {/* </section> */}
    </>
  );
}