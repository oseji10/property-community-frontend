import Image from 'next/image';
import { Icon } from '@iconify/react';

interface PropertyCardProps {
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
}

export default function PropertyCard({
  title,
  price,
  location,
  beds,
  baths,
  area,
  image,
}: PropertyCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 pb-0">
      <div className="relative h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-primary font-bold text-xl mb-2">{price}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
          <Icon icon="ph:map-pin" /> {location}
        </p>
        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1.5">
            <Icon icon="ph:bed" /> {beds} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Icon icon="ph:bathtub" /> {baths} Baths
          </span>
          <span className="flex items-center gap-1.5">
            <Icon icon="ph:ruler" /> {area}
          </span>
        </div>
      </div>
    </div>
  );
}