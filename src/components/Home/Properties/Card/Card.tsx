import { PropertyHomes } from '@/types/properyHomes'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'

const PropertyCard: React.FC<{ item: PropertyHomes }> = ({ item }) => {
  const {
    propertyTitle,
    location,
    price,
    bedrooms,
    bathrooms,
    currency,
    size,
    slug,
    images,
    listingType = 'sale',
    property_type,
    city,
    state
  } = item

  const mainImage = images?.[0]?.imageUrl
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${images[0].imageUrl}`
    : '/images/placeholder-property.jpg'

  const formatMoney = (value: number | string) =>
    new Intl.NumberFormat('en-NG', { minimumFractionDigits: 0 }).format(Number(value))

  // ────────────────────────────────────────────────
  // Listing Type Badge (For Sale / For Rent)
  // ────────────────────────────────────────────────
  const isForSale = listingType?.toLowerCase() === 'sale'
  const listingTagText = isForSale ? 'FOR SALE' : 'FOR RENT'
  const listingTagConfig = isForSale
    ? {
        bg: 'bg-gradient-to-r from-emerald-500 to-emerald-700',
        icon: 'solar:tag-price-bold',
        iconColor: 'text-emerald-100',
      }
    : {
        bg: 'bg-gradient-to-r from-violet-500 to-purple-600',
        icon: 'solar:home-bold',
        iconColor: 'text-purple-100',
      }

  // ────────────────────────────────────────────────
  // Property Type Badge
  // ────────────────────────────────────────────────
  const typeName = property_type?.typeName?.toUpperCase() || 'PROPERTY'
  const typeBadgeConfig = {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    icon: 'solar:buildings-2-bold',
    iconColor: 'text-amber-100',
  }

  // If you want different icons/colors per type, you can add a map:
  // const typeIconMap: Record<string, string> = {
  //   APARTMENT: 'solar:buildings-2-bold',
  //   HOUSE: 'solar:home-bold',
  //   LAND: 'solar:map-linear',
  //   COMMERCIAL: 'solar:shop-2-bold',
  //   // etc.
  // }

  return (
    <div className="group relative rounded-2xl border border-dark/10 dark:border-white/10 hover:shadow-3xl duration-300 dark:hover:shadow-white/20 overflow-hidden">
      {/* Image + badges */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <Link href={`/properties/detail?slug=${slug}`}>
          {mainImage ? (
            <Image
              src={mainImage}
              alt={propertyTitle}
              width={440}
              height={300}
              className="w-full aspect-[4/3] object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-500 hover:cursor-pointer"
              unoptimized={true}
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image available</span>
            </div>
          )}
        </Link>

        {/* Prominent For Sale / For Rent badge with icon */}
        <div
          className={`
            absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide
            ${listingTagConfig.bg} text-white shadow-lg shadow-black/30
          `}
        >
          <Icon icon={listingTagConfig.icon} width={18} height={18} className={listingTagConfig.iconColor} />
          {listingTagText}
        </div>

        {/* Property Type badge with icon */}
        <div
          className={`
            absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide
            ${typeBadgeConfig.bg} text-white shadow-md shadow-black/30
          `}
        >
          <Icon icon={typeBadgeConfig.icon} width={16} height={16} className={typeBadgeConfig.iconColor} />
          {typeName}
        </div>

        {/* Hover overlay with arrow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
          <div className="p-5 bg-white/90 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            <Link href={`/properties/detail?slug=${slug}`}>
            <Icon icon="solar:arrow-right-linear" width={28} height={28} className="text-black" />
            </Link>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-5">
          <div>
            <Link href={`/properties/detail?slug=${slug}`}>
              <h3 className="text-xl font-semibold text-primary dark:text-white group-hover:text-dark transition-colors line-clamp-2">
                {propertyTitle}
              </h3>
            </Link>
            <p className="text-sm font-bold text-black/60 dark:text-white/60 mt-1.5 flex items-center gap-1.5">
              <Icon icon="solar:map-point-linear" width={16} height={16} className="text-primary" />
              {`${city} | ${state}`}
            </p>
          </div>

          <div className="self-start sm:self-center">
            <span className="inline-block text-lg font-bold text-black dark:text-white px-4 py-2 rounded-xl bg-primary/10">
              {currency?.currencySymbol}{formatMoney(price)}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/10 dark:border-white/20">
          <div className="flex flex-col items-center text-center">
            <Icon icon="solar:bed-linear" width={24} height={24} className="text-primary mb-1" />
            <span className="text-sm font-medium text-black dark:text-white">
              {bedrooms} Beds
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <Icon icon="solar:bath-linear" width={24} height={24} className="text-primary mb-1" />
            <span className="text-sm font-medium text-black dark:text-white">
              {bathrooms} Baths
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <Icon icon="lineicons:arrow-all-direction" width={24} height={24} className="text-primary mb-1" />
            <span className="text-sm font-medium text-black dark:text-white">
              {size} m²
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard