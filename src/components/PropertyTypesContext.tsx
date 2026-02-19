'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/app/lib/api'

type PropertyType = {
  typeId: number
  typeName: string
  slug?: string
}

type ContextType = {
  propertyTypes: PropertyType[]
  loading: boolean
}

const PropertyTypesContext = createContext<ContextType | null>(null)

export function PropertyTypesProvider({ children }: { children: React.ReactNode }) {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/all-property-types')
        setPropertyTypes(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchTypes()
  }, [])

  return (
    <PropertyTypesContext.Provider value={{ propertyTypes, loading }}>
      {children}
    </PropertyTypesContext.Provider>
  )
}

export function usePropertyContext() {
  const ctx = useContext(PropertyTypesContext)
  if (!ctx) {
    throw new Error('usePropertyContext must be used within PropertyTypesProvider')
  }
  return ctx
}
