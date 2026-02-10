// app/dashboard/properties/[propertyId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faBed, faShower, faCar, faMapMarkerAlt, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import api from '@/app/lib/api';
import { Metadata } from 'next';
import toast from 'react-hot-toast';

// export const metadata: Metadata = {
//   title: 'Property Details | Property Plus Africa',
// };

interface PropertyImage {
  imageId: number;
  imageUrl: string;
}

interface PropertyType {
  typeName: string;
}

interface Currency {
  currencySymbol: string;
}

interface Property {
  propertyId: number | string;
  propertyTitle: string;
  listingType: 'sale' | 'rent';
  price: number;
  currency: Currency;
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  state: string;
  city: string;
  address: string;
  latitude?: string;
  longitude?: string;
  propertyType: PropertyType;
  amenities?: string;
  otherFeatures?: string;
  propertyDescription: string;
  images?: PropertyImage[];
  status?: string;
}

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const slug = useSearchParams().get('slug');
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${slug}`);
        setProperty(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load property details');
        router.push('/dashboard/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const formatPrice = (price: number, symbol: string) => {
    return `${symbol}${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(value);


  if (loading || !property) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FontAwesomeIcon icon={faSpinner} className="text-primary text-5xl animate-spin mb-4" />
        <p>Loading property details...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-8 md:pt-10 lg:pt-12 pb-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          <Icon icon="ph:house-fill" width={24} height={24} className="text-primary" />
          <p className="text-base font-semibold text-badge dark:text-white/90">Property Details</p>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter text-black dark:text-white mb-3">
          {property.propertyTitle}
        </h1>
        <p className="text-base text-black/60 dark:text-white/60">
          {property.address}, {property.city}, {property.state}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images Gallery */}
        <div className="space-y-4">
          {property.images && property.images.length > 0 ? (
            <>
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${property.images[0].imageUrl}`}
                alt={property.propertyTitle}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="grid grid-cols-4 gap-4">
                {property.images.slice(1).map((img) => (
                  <img
                    key={img.imageId}
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img.imageUrl}`}
                    alt="Property image"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <Icon icon="ph:house-simple" className="text-gray-300 text-8xl" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-8">
          {/* Price and Type */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              {property.currency.currencySymbol}{formatMoney(property.price)}
            </h2>
            <div className="flex gap-4 text-sm">
              <span className="px-3 py-1 bg-black/70 text-white rounded-full">
                {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              {property.status && (
                <span className="px-3 py-1 bg-primary/90 text-white rounded-full">
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                {property?.property_type?.typeName}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBed} className="text-primary" />
              <span>{property.bedrooms || 0} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShower} className="text-primary" />
              <span>{property.bathrooms || 0} Bathrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCar} className="text-primary" />
              <span>{property.garage || 'None'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
              <span>{property.latitude && property.longitude ? `${property.latitude}, ${property.longitude}` : 'No coordinates'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {property.propertyDescription}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Amenities</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
                {property.amenities.split(',').map((item, idx) => (
                  <li key={idx}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Other Features */}
          {property.otherFeatures && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Other Features</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
                {property.otherFeatures.split(',').map((item, idx) => (
                  <li key={idx}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-12 text-center">
        <button
          onClick={() => router.back()}
          className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors hover:cursor-pointer"
        >
          Back to My Properties
        </button>
      </div>
    </div>
  );
}