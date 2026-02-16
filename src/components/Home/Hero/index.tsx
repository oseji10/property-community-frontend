'use client'; // ← important if using Next.js App Router + interactive components

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import SearchOverlay from './SearchOverlay';

// ── Sample properties (replace with your real data / API later)
const properties = [
  {
    id: 1,
    title: 'Futuristic Haven',
    location: 'Palm Springs, CA',
    price: '$4,750,000',
    priceLabel: 'For selling price',
    bedrooms: '4 Bedrooms',
    bathrooms: '4 Restroom',
    parking: 'Parking space',
    image: '/images/hero/heroBanner.png',
  },
  {
    id: 2,
    title: 'Oceanfront Retreat',
    location: 'Malibu, CA',
    price: '$6,200,000',
    priceLabel: 'For selling price',
    bedrooms: '5 Bedrooms',
    bathrooms: '6 Restroom',
    parking: '3 Parking spaces',
    image: '/images/properties/property3/property3.jpg', // ← add real images
  },
  {
    id: 3,
    title: 'Downtown Penthouse',
    location: 'Miami, FL',
    price: '$3,980,000',
    priceLabel: 'For selling price',
    bedrooms: '3 Bedrooms',
    bathrooms: '3 Restroom',
    parking: '2 Parking spaces',
    image: '/images/properties/property1/property1.jpg',
  },
  // Add more...
];

const Hero: React.FC = () => {
  // const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy');

  return (
    <section className="!py-0 relative">
      {/* Slider wrapper */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"           // nice for hero feel – or change to 'slide' / 'cards'
        fadeEffect={{ crossFade: true }}
        speed={800}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        className="h-[90vh] min-h-[700px] w-full"
      >
        {properties.map((prop) => (
          <SwiperSlide key={prop.id}>
            <div className="relative h-full w-full">
              {/* Background image – full bleed */}
              <div className="absolute inset-0">
                <Image
                  src={prop.image}
                  alt={prop.title}
                  fill
                  className="object-cover brightness-[0.65]"
                  priority={prop.id === 1} // only first one priority
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />

              {/* Content container */}
              <div className="relative container max-w-6xl mx-auto px-5 2xl:px-0 h-full flex items-left flex-col justify-between pb-24 md:pb-32 pt-40 md:pt-60 lg:pt-50  ">
                {/* Top – Title & Location */}
                <div className="text-white text-center md:text-left z-10 max-w-4xl">
                  <p className="text-xl md:text-2xl font-medium opacity-90">
                    {prop.location}
                  </p>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter mt-3 md:mt-5 leading-tight">
                    {prop.title}
                  </h1>
                </div>

                {/* Bottom info bar + CTA */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                  {/* Features & Price */}
                  {/* <div className="bg-white/95 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white rounded-2xl px-8 py-6 md:px-12 md:py-8 flex flex-wrap md:flex-nowrap gap-10 md:gap-16 lg:gap-24">
                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                     
                      <span className="text-3xl">🛏️</span>
                      <p className="text-sm md:text-base font-medium">{prop.bedrooms}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                      <span className="text-3xl">🚿</span>
                      <p className="text-sm md:text-base font-medium">{prop.bathrooms}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                      <span className="text-3xl">🚗</span>
                      <p className="text-sm md:text-base font-medium">{prop.parking}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-3xl md:text-4xl font-bold">{prop.price}</p>
                      <p className="text-sm text-black/60 dark:text-white/60">
                        {prop.priceLabel}
                      </p>
                    </div>
                  </div> */}

                  {/* CTA buttons */}
                  {/* <div className="flex flex-col xs:flex-row gap-4">
                    <Link
                      href="/contactus"
                      className="px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full font-semibold hover:bg-opacity-90 transition"
                    >
                      Get in touch
                    </Link>
                    <button className="px-8 py-4 border border-white text-white rounded-full font-semibold hover:bg-white hover:text-zinc-900 transition">
                      View Details
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── Search Overlay ─────────────────────────────────────── */}
      {/* <SearchOverlay /> */}
      <Suspense fallback={
      <div className="absolute inset-x-0 top-[min(18vh,160px)] lg:top-[min(40vh,400px)] h-64 bg-white/50 dark:bg-zinc-900/50 backdrop-blur animate-pulse rounded-2xl mx-auto max-w-[1500px]" />
      // or simpler: <div className="h-80" /> or a real skeleton
    }>
      <SearchOverlay />
    </Suspense>
    </section>
  );
};

export default Hero;