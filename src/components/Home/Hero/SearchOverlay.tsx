'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePropertyContext } from '../../PropertyTypesContext';

export default function SearchOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { propertyTypes, loading } = usePropertyContext();

  const [searchType, setSearchType] = useState<'buy' | 'rent'>(
    (searchParams.get('type') as 'buy' | 'rent') || 'buy'
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    propertyTypeId: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('min') || '',
    maxPrice: searchParams.get('max') || '',
    bedrooms: searchParams.get('beds') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const params = new URLSearchParams();

  params.set('type', searchType);
  if (filters.location) params.set('location', filters.location);
  if (filters.propertyTypeId) params.set('propertyType', filters.propertyTypeId);
  if (filters.minPrice) params.set('min', filters.minPrice);
  if (filters.maxPrice) params.set('max', filters.maxPrice);
  if (filters.bedrooms) params.set('beds', filters.bedrooms);

  router.push(`/properties?${params.toString()}`);
};


  /* ---------- Sync URL ---------- */
  useEffect(() => {
    const params = new URLSearchParams();

    params.set('type', searchType);
    if (filters.location) params.set('location', filters.location);
    if (filters.propertyTypeId) params.set('propertyType', filters.propertyTypeId);
    if (filters.minPrice) params.set('min', filters.minPrice);
    if (filters.maxPrice) params.set('max', filters.maxPrice);
    if (filters.bedrooms) params.set('beds', filters.bedrooms);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchType, filters, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const setPresetPrice = (value: number) => {
    setFilters({
      ...filters,
      minPrice: value.toString(),
      maxPrice: '',
    });
  };

  return (
    <div
      className="
        absolute
        top-[min(18vh,160px)]
        lg:top-[min(40vh,400px)]
        xl:top-[min(50vh,600px)]
        inset-x-0
        z-20
        mx-auto
        w-full
        max-w-[1500px]
        px-4 sm:px-6 md:px-8 lg:px-10
      "
    >
      <div className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-zinc-700/40">
        <div className="p-5 sm:p-6 md:p-7 lg:p-8">
          {/* ---------- Toggle ---------- */}
          <div className="mb-6">
            <div className="inline-flex rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 p-1.5">
              {(['buy', 'rent'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition hover:cursor-pointer
                    ${
                      searchType === type
                        ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  {type === 'buy' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- Main Form ---------- */}
          <form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
>

            {/* Location */}
            <div>
              <label className="block mb-1 text-sm font-medium">Location</label>
              <input
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="City or neighborhood"
                className="w-full px-5 py-3.5 rounded-xl border bg-white/60 dark:bg-zinc-800/50"
              />
            </div>

            {/* Property type */}
            <div>
              <label className="block mb-1 text-sm font-medium">Property type</label>
              <select
                name="propertyTypeId"
                value={filters.propertyTypeId}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl border bg-white/60 dark:bg-zinc-800/50"
              >
                <option value="">
                  {loading ? 'Loading…' : 'All types'}
                </option>
                {propertyTypes.map((type) => (
                  <option key={type.typeId} value={type.typeId}>
                    {type.typeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block mb-1 text-sm font-medium">Price range</label>
             <div className="flex gap-2">
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    name="minPrice"
    value={filters.minPrice}
    onChange={handleChange}
    placeholder="Min ₦"
    className="w-full px-4 py-3.5 rounded-xl border"
  />

  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    name="maxPrice"
    value={filters.maxPrice}
    onChange={handleChange}
    placeholder="Max ₦"
    className="w-full px-4 py-3.5 rounded-xl border"
  />
</div>

            </div>

            {/* Submit */}
<div>
  <label className="block mb-1 text-sm font-medium opacity-0 select-none ">
    Search
  </label>

  <button
    type="submit"
    className="
      w-full
      bg-[#D70040]
      text-white font-semibold
      rounded-xl
      py-3.5
      hover:opacity-90 transition
      hover:cursor-pointer
    "
  >
    Search
  </button>
</div>


          </form>

          {/* ---------- Price presets ---------- */}
          <div className="flex gap-2 mt-4">
            {[5_000_000, 10_000_000, 20_000_000].map((price) => (
              <button
                key={price}
                onClick={() => setPresetPrice(price)}
                type="button"
                className="px-4 py-2 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800"
              >
                ₦{price / 1_000_000}M+
              </button>
            ))}
          </div>

          {/* ---------- Advanced filters ---------- */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-6 text-sm font-medium text-primary"
          >
            {showAdvanced ? 'Hide advanced filters' : 'Advanced filters'}
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Bedrooms</label>
                <input
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className="w-full px-4 py-3 rounded-xl border"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
