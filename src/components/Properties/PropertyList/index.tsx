'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PropertyCard from '@/components/Home/Properties/Card/Card'
import api from '@/app/lib/api'
import { usePropertyContext } from '@/components/PropertyTypesContext'

interface ApiProperty {
  propertyId: number
  propertyTitle: string
  address: string
  city: string
  state: string
  price: string
  bedrooms: number
  bathrooms: number
  garage: string
  slug: string
  images: Array<{ imageId: number; imageUrl: string }>
  property_type?: { typeId: number; typeName: string }
}

const PropertiesListing: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { propertyTypes, loading: typesLoading } = usePropertyContext()

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    propertyTypeId: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('min') || '',
    maxPrice: searchParams.get('max') || '',
    bedrooms: searchParams.get('beds') || '',
  })

  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.type) params.set('type', filters.type)
      if (filters.location) params.set('location', filters.location)
      if (filters.propertyTypeId) params.set('propertyType', filters.propertyTypeId)
      if (filters.minPrice) params.set('min', filters.minPrice)
      if (filters.maxPrice) params.set('max', filters.maxPrice)
      if (filters.bedrooms) params.set('beds', filters.bedrooms)

      // Update URL without full navigation
      router.replace(`?${params.toString()}`, { scroll: false })

      const response = await api.get(`/properties?${params.toString()}`)
      const propertyList = response.data?.data?.data ?? []

      if (!Array.isArray(propertyList)) throw new Error('Invalid property data')
      setProperties(propertyList)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Unable to load properties.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load + whenever filters change via URL (back/forward)
  useEffect(() => {
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]) // Re-run when URL params change

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSearchClick = () => {
    fetchProperties()
  }

  const PropertySkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse">
      <div className="h-48 md:h-56 bg-gray-300 dark:bg-gray-700" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/5" />
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5" />
        <div className="flex gap-6 pt-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12" />
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12" />
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12" />
        </div>
      </div>
    </div>
  )

  return (
    <section className="py-10 min-h-screen">
      <div className="flex">
        {/* Fixed Filter Column - ALWAYS VISIBLE on desktop */}
        <div className="hidden lg:block w-80 xl:w-96 min-h-screen border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 fixed left-0 top-5 pt-32 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Filter Properties
            </h2>

            <div className="grid grid-cols-1 gap-5">
              {/* Type */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                >
                  <option value="">All</option>
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  name="location"
                  value={filters.location}
                  onChange={handleChange}
                  placeholder="City or neighborhood"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              {/* Property type */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property type
                </label>
                <select
                  name="propertyTypeId"
                  value={filters.propertyTypeId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  disabled={typesLoading}
                >
                  <option value="">{typesLoading ? 'Loading…' : 'All types'}</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price range (₦)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleChange}
                    placeholder="Min"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="Max"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bedrooms
                </label>
                <input
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearchClick}
              disabled={loading}
              className={`
                mt-8 w-full py-3.5 rounded-xl font-semibold text-white transition hover:cursor-pointer
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#D70040] hover:bg-[#b50036] active:bg-[#8f002c]'}
              `}
            >
              {loading ? 'Applying...' : 'Apply Filters'}
            </button>
          </div>
        </div>

        {/* Mobile Filter - Above properties */}
        <div className="lg:hidden w-full px-5 2xl:px-0">
          <div className="mb-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Filter Properties
              </h2>

              <div className="grid grid-cols-1 gap-5">
                {/* Type */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  >
                    <option value="">All</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                    placeholder="City or neighborhood"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>

                {/* Property type */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Property type
                  </label>
                  <select
                    name="propertyTypeId"
                    value={filters.propertyTypeId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    disabled={typesLoading}
                  >
                    <option value="">{typesLoading ? 'Loading…' : 'All types'}</option>
                    {propertyTypes.map((type) => (
                      <option key={type.typeId} value={type.typeId}>
                        {type.typeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price range (₦)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleChange}
                      placeholder="Min"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleChange}
                      placeholder="Max"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bedrooms
                  </label>
                  <input
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSearchClick}
                disabled={loading}
                className={`
                  mt-8 w-full py-3.5 rounded-xl font-semibold text-white transition
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#D70040] hover:bg-[#b50036] active:bg-[#8f002c]'}
                `}
              >
                {loading ? 'Applying...' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Scrolls with the page */}
        <div className="flex-1 lg:ml-80 xl:ml-96">
          <div className="container max-w-8xl mx-auto px-5 2xl:px-5 py-6 lg:py-8 lg:pt-30">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertySkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={fetchProperties}
                  className="mt-6 px-8 py-3 bg-[#D70040] text-white rounded-xl hover:bg-[#b50036] transition"
                >
                  Try Again
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className="py-20 text-center text-lg text-gray-600 dark:text-gray-400">
                No properties found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                {properties.map((item) => (
                  <PropertyCard
                    key={item.propertyId || item.slug || `${item.propertyTitle}-${item.address}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PropertiesListing