// app/dashboard/properties/[propertyId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faBed,
  faShower,
  faCar,
  faMapMarkerAlt,
  faEye,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

interface PropertyImage {
  imageId: number;
  imageUrl: string;
}

interface PropertyType {
  typeId: number;
  typeName: string;
}

interface Currency {
  currencyId: number;
  currencySymbol: string;
  currencyCode: string;
}

interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface PropertyData {
  propertyId: number;
  propertyTitle: string;
  propertyDescription: string;
  address: string;
  city: string;
  state: string;
  latitude?: string;
  longitude?: string;
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  size?: string;
  price: string;               // comes as string from backend
  listingType: 'sale' | 'rent';
  status: string;              // e.g. "available", "sold", "rented"
  amenities?: string;
  otherFeatures?: string;
  images: PropertyImage[];
  currency: Currency;
  property_type: PropertyType; // note: snake_case from backend
  owner?: Owner;
  created_at: string;
  updated_at: string;
}

interface PropertyResponse {
  property: PropertyData;
  viewsCount: number;
  favoritesCount: number;
  isOwner: boolean;
}

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const slug = useSearchParams().get('slug');
  const router = useRouter();

  const [data, setData] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('available');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${slug}`);
        const responseData: PropertyResponse = res.data;

        setData(responseData);
        setSelectedStatus(responseData.property.status?.toLowerCase() || 'available');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load property details');
        router.push('/dashboard/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug, router]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;

    if (!data || newStatus === data.property.status.toLowerCase()) return;

    if (!confirm(`Change status from "${data.property.status}" to "${newStatus}"?`)) {
      setSelectedStatus(data.property.status.toLowerCase());
      return;
    }

    try {
      setUpdatingStatus(true);
      await api.patch(`/properties/${slug}/status`, { status: newStatus });

      setData((prev) =>
        prev
          ? {
              ...prev,
              property: {
                ...prev.property,
                status: newStatus,
              },
            }
          : null
      );

      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
      setSelectedStatus(data?.property.status.toLowerCase() || 'available');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FontAwesomeIcon icon={faSpinner} className="text-primary text-5xl animate-spin mb-4" />
        <p>Loading property details...</p>
      </div>
    );
  }

  const prop = data.property;
  const priceNum = parseFloat(prop.price);
  const displayStatus = prop.status.charAt(0).toUpperCase() + prop.status.slice(1).toLowerCase();

  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-8 md:pt-10 lg:pt-12 pb-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          <Icon icon="ph:house-fill" width={24} height={24} className="text-primary" />
          <p className="text-base font-semibold text-badge dark:text-white/90">Property Details</p>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter text-black dark:text-white mb-3">
          {prop.propertyTitle}
        </h1>
        <p className="text-base text-black/60 dark:text-white/60">
          {prop.address}, {prop.city}, {prop.state}
        </p>

        <div className="flex gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEye} className="text-blue-500" />
            <span>{data.viewsCount.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHeart} className="text-red-500" />
            <span>{data.favoritesCount.toLocaleString()} favorites</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images Gallery */}
        <div className="space-y-4">
          {prop.images?.length > 0 ? (
            <>
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${prop.images[0].imageUrl}`}
                alt={prop.propertyTitle}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="grid grid-cols-4 gap-4">
                {prop.images.slice(1).map((img) => (
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
          {/* Price, Type, Status */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              {prop.currency.currencySymbol}
              {priceNum.toLocaleString('en-NG', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </h2>

            <div className="flex flex-wrap gap-3 mt-3">
              <span className="px-3 py-1 bg-black/70 text-white rounded-full text-sm">
                {prop.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </span>

              <span
                className={`px-3 py-1 text-white rounded-full text-sm ${
                  prop.status === 'available'
                    ? 'bg-green-600'
                    : prop.status === 'sold' || prop.status === 'rented'
                    ? 'bg-red-600'
                    : 'bg-amber-600'
                }`}
              >
                {displayStatus}
              </span>

              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
                {prop.property_type?.typeName ?? 'Property'}
              </span>
            </div>

            {data.isOwner && (
              <div className="mt-6">
                <label htmlFor="status" className="block text-sm font-medium mb-1.5">
                  Update Property Status
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    disabled={updatingStatus}
                    className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="available">Available</option>
                    {prop.listingType === 'sale' && <option value="sold">Sold</option>}
                    {prop.listingType === 'rent' && <option value="rented">Rented</option>}
                  </select>

                  {updatingStatus && (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBed} className="text-primary" />
              <span>{prop.bedrooms || 0} Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShower} className="text-primary" />
              <span>{prop.bathrooms || 0} Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCar} className="text-primary" />
              <span>{prop.garage || 'None'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
              <span>
                {prop.latitude && prop.longitude ? 'Has coordinates' : 'No coordinates'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {prop.propertyDescription}
            </p>
          </div>

          {prop.amenities && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Amenities</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 columns-2 sm:columns-3 gap-6">
                {prop.amenities.split(',').map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          {prop.otherFeatures && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Other Features</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 columns-2 sm:columns-3 gap-6">
                {prop.otherFeatures.split(',').map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

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