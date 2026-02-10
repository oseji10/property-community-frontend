// app/dashboard/my-properties/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faPlus,
  faTrash,
  faEdit,
  faEye,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import api from '@/app/lib/api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Properties | Property Community',
};

interface Currency {
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  currencyId: number;
}

interface PropertyImage {
  imageId: number;
  imageUrl: string;
}

interface Property {
  propertyId: number | string;
  propertyTitle: string;
  listingType: 'sale' | 'rent';
  price: number;
  currency?: Currency | string;
  bedrooms?: number;
  bathrooms?: number;
  state: string;
  city: string;
  address?: string;
  propertyTypeName?: string;
  images?: PropertyImage[];
  createdAt?: string;
  status?: string; // e.g. 'active', 'pending', 'sold', 'rented'
}

export default function MyProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/properties/my');
      const data = res.data || [];
      setProperties(data);
      setFilteredProperties(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load your properties.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever searchTerm, listingTypeFilter or statusFilter changes
  useMemo(() => {
    let result = [...properties];

    // Search by title
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((p) =>
        p.propertyTitle.toLowerCase().includes(term)
      );
    }

    // Filter by listing type
    if (listingTypeFilter !== 'all') {
      result = result.filter((p) => p.listingType === listingTypeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    setFilteredProperties(result);
  }, [properties, searchTerm, listingTypeFilter, statusFilter]);

  const handleDelete = async (propertyId: number | string) => {
    if (
      !confirm(
        `Delete "${properties.find((p) => p.propertyId === propertyId)?.propertyTitle}"?\nThis cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(propertyId);
      await api.delete(`/properties/${propertyId}`);
      setProperties((prev) => prev.filter((p) => p.propertyId !== propertyId));
      toast.success('Property deleted successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete property');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setListingTypeFilter('all');
    setStatusFilter('all');
  };

  const formatPrice = (price: number, currency?: Currency | string) => {
    const symbol =
      typeof currency === 'object' && currency?.currencySymbol
        ? currency.currencySymbol
        : typeof currency === 'string'
        ? currency
        : '₦';

    return `${symbol}${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(value);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    listingTypeFilter !== 'all' ||
    statusFilter !== 'all';

  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-8 md:pt-10 lg:pt-12 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
        <div>
          <div className="flex gap-2.5 items-center mb-3">
            <Icon
              icon="ph:building-apartment-fill"
              width={24}
              height={24}
              className="text-primary"
            />
            <p className="text-base font-semibold text-badge dark:text-white/90">
              Dashboard
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter text-black dark:text-white">
            My Properties
          </h1>
        </div>

        <Link
          href="/dashboard/add-new-property"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-medium shadow-sm whitespace-nowrap"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Add New Property
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 bg-white/50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search input */}
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by title
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Lekki apartment..."
                className="w-full pl-10 pr-4 py-3 border border-black/10 dark:border-white/10 rounded-full bg-white dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Listing Type */}
          <div className="w-full md:w-44">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={listingTypeFilter}
              onChange={(e) =>
                setListingTypeFilter(e.target.value as 'all' | 'sale' | 'rent')
              }
              className="w-full px-4 py-3 border border-black/10 dark:border-white/10 rounded-full bg-white dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="all">All Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Status */}
          <div className="w-full md:w-44">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-black/10 dark:border-white/10 rounded-full bg-white dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              {/* Add more statuses if your backend uses different values */}
            </select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-5 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faTimes} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        )}
      </div>

      {/* Properties Grid */}
      <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-10 shadow-xl dark:shadow-white/5 bg-white/40 dark:bg-black/30 backdrop-blur-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-primary text-5xl animate-spin mb-4"
            />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Loading your properties...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <Icon
              icon="ph:warning-fill"
              className="text-red-500 text-6xl mx-auto mb-4"
            />
            <p className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Oops!
            </p>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              icon="ph:house-line-duotone"
              className="text-gray-400 dark:text-gray-500 text-8xl mx-auto mb-6"
            />
            <h3 className="text-2xl font-semibold mb-3">
              {hasActiveFilters ? 'No matching properties' : 'No properties yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your filters or search term.'
                : "You haven't added any properties yet. Start listing now!"}
            </p>
            {!hasActiveFilters && (
              <Link
                href="/dashboard/add-new-property"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-lg font-medium"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Your First Property
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => (
              <div
                key={prop.propertyId}
                className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                  {prop.images && prop.images.length > 0 ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${prop.images[0].imageUrl}`}
                      alt={prop.propertyTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon icon="ph:house-simple" className="text-gray-300 text-6xl" />
                    </div>
                  )}

                  {prop.status && (
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-white">
                      {prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
                    </span>
                  )}

                  <span className="absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full bg-black/70 text-white">
                    {prop.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {prop.propertyTitle}
                  </h3>

                  <p className="text-xl font-bold text-primary mb-3">
                    {/* {formatPrice(prop.price, prop.currency)} */}
                    {prop.currency?.currencySymbol}{formatMoney(prop.price)}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {prop.bedrooms !== undefined && prop.bedrooms > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Icon icon="ph:bed" width={18} />
                        <span>{prop.bedrooms}</span>
                      </div>
                    )}
                    {prop.bathrooms !== undefined && prop.bathrooms > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Icon icon="ph:shower" width={18} />
                        <span>{prop.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Icon icon="ph:map-pin" width={18} />
                      <span className="line-clamp-1">
                        {prop.city}, {prop.state}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/dashboard/properties/view?slug=${prop.slug}`}
                      className="flex-1 py-2.5 text-sm font-medium border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faEye} size="sm" />
                      View
                    </Link>

                    <Link
                      href={`/dashboard/properties/edit?slug=${prop.slug}`}
                      className="flex-1 py-2.5 text-sm font-medium border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faEdit} size="sm" />
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(prop.propertyId)}
                      disabled={deletingId === prop.propertyId}
                      className={`hover:cursor-pointer flex-1 py-2.5 text-sm font-medium border border-red-500/30 text-red-600 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                        deletingId === prop.propertyId ? 'cursor-wait' : ''
                      }`}
                    >
                      {deletingId === prop.propertyId ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" size="sm" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}