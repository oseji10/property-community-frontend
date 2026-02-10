'use client';

import { useState } from 'react';

export default function SearchOverlay() {
  const [searchType, setSearchType] = useState<'buy' | 'rent' | 'sold'>('buy');

  return (
    <div className="absolute top-[min(18vh,180px)] left-1/2 z-20 w-full max-w-8xl -translate-x-1/2 px-5 sm:px-8 lg:px-10 xl:px-0 pt-100">
      {/* Main card – glassmorphism / subtle blur like Homez */}
      <div className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-zinc-700/40 overflow-hidden">
        <div className="p-5 sm:p-6 md:p-7 lg:p-8">
          {/* Toggle – left-aligned, compact, does NOT stretch full width */}
          <div className="mb-5 md:mb-6">
            <div className="inline-flex items-center rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 p-1.5 shadow-inner">
              {(['buy', 'rent', 'sold'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`
                    px-5 py-2.5 sm:px-6 md:px-7 text-sm sm:text-base font-medium rounded-full transition-all duration-200
                    ${
                      searchType === type
                        ? 'bg-white dark:bg-zinc-700 shadow-md text-zinc-900 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-zinc-700/40'
                    }
                  `}
                >
                  {type === 'buy' ? 'Buy' : type === 'rent' ? 'Rent' : 'Sold'}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields – responsive grid, search button in last column */}
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <input
              type="text"
              placeholder="Location, city, neighborhood..."
              className="w-full px-5 py-3.5 rounded-xl border border-zinc-300/70 dark:border-zinc-600/70 bg-white/60 dark:bg-zinc-800/50 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition"
            />

            <input
              type="text"
              placeholder="Property type (Apartment, Villa...)"
              className="w-full px-5 py-3.5 rounded-xl border border-zinc-300/70 dark:border-zinc-600/70 bg-white/60 dark:bg-zinc-800/50 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition"
            />

            <input
              type="text"
              placeholder="Price range (₦2M – ₦50M)"
              className="w-full px-5 py-3.5 rounded-xl border border-zinc-300/70 dark:border-zinc-600/70 bg-white/60 dark:bg-zinc-800/50 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition"
            />

            {/* Search button – fills the last grid cell naturally */}
            <button
              type="submit"
              className="w-full bg-[#D70040] hover:bg-[#e67e00] text-white font-semibold py-3.5 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              Search {searchType === 'buy' ? 'Homes' : searchType === 'rent' ? 'Rentals' : 'Sold Properties'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}