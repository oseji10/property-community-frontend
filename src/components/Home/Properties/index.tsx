'use client'

import { Icon } from '@iconify/react'
import PropertyCard from './Card/Card'
import { propertyHomes } from '@/app/api/propertyhomes'
import { useEffect, useState } from 'react'
import api from '@/app/lib/api'

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
  images: Array<{
    imageId: number
    imageUrl: string
  }>
  property_type?: {
    typeId: number
    typeName: string
  }
}

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get('/properties')

        const propertyList = response.data?.data?.data ?? []

        if (!Array.isArray(propertyList)) {
          throw new Error('Expected "data" to be an array of properties')
        }

        setProperties(propertyList)
      } catch (err: any) {
        console.error('Failed to load properties:', err)
        const message =
          err.response?.data?.message ||
          err.message ||
          'Unable to load properties. Please try again later.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Skeleton loader component (matches typical property card structure)
  const PropertySkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 md:h-56 bg-gray-300 dark:bg-gray-700" />

      <div className="p-5 space-y-4">
        {/* Title / Price row */}
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/5" />
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20" />
        </div>

        {/* Location */}
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5" />

        {/* Features */}
        <div className="flex gap-6 pt-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12" />
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12" />
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12" />
        </div>
      </div>
    </div>
  )

  return (
    <section>
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        <div className="mb-16 flex flex-col gap-3">
          <div className="flex gap-2.5 items-center justify-center">
            <span>
              <Icon
                icon="ph:house-simple-fill"
                width={20}
                height={20}
                className="text-primary"
              />
            </span>
            <p className="text-base font-semibold text-dark/75 dark:text-white/75">
              Properties
            </p>
          </div>
          <h2 className="text-40 lg:text-52 font-medium text-black dark:text-white text-center tracking-tight leading-11 mb-2">
            Discover inspiring designed homes.
          </h2>
          <p className="text-xm font-normal text-black/50 dark:text-white/50 text-center">
            Curated homes where elegance, style, and comfort unite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {loading ? (
            // Show 6 skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <PropertySkeleton key={`skeleton-${index}`} />
            ))
          ) : error ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  // You could also call fetchProperties() again instead of reload
                  window.location.reload()
                }}
                className="mt-5 px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition hover:cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="col-span-full py-20 text-center text-lg text-gray-600 dark:text-gray-400">
              No properties available right now.
            </div>
          ) : (
            // Real properties (you had .slice(0,6) before → keeping the limit)
            properties.slice(0, 6).map((item) => (
              <div key={item.propertyId || item.slug || item.propertyTitle}>
                <PropertyCard item={item} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default Properties