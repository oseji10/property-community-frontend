'use client'

import { useEffect, useState } from 'react'
import PropertyCard from '@/components/Home/Properties/Card/Card'
import { PropertyHomes } from '@/types/properyHomes'
import api from '@/app/lib/api'
         // ← adjust path to your axios instance

// You most likely need to update your type definition
// Current PropertyHomes probably doesn't match this backend structure
// Quick temporary type (you should improve/extend it later)

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
    // ... other fields
  }>
  property_type?: {
    typeId: number
    typeName: string
    // ...
  }
  // ... other fields you might need
}

const PropertiesListing: React.FC = () => {
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get('/properties') // ← adjust endpoint if needed

        // Your response structure → we want response.data.data (the array)
        const propertyList = response.data?.data ?? []

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

  return (
    <section className="pt-0!">
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading properties...
            </p>
            {/* Optional: add skeleton cards here later */}
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                // Simple reload – you can also re-call fetchProperties()
                window.location.reload()
              }}
              className="mt-5 px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center text-lg text-gray-600 dark:text-gray-400">
            No properties available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {properties.map((item) => (
              <div
                key={item.propertyId || item.slug || `${item.propertyTitle}-${item.address}`}
              >
                <PropertyCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default PropertiesListing