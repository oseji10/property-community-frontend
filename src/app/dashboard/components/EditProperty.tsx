// app/dashboard/properties/[propertyId]/edit/page.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '@/app/lib/api';
import { Metadata } from 'next';
import toast from 'react-hot-toast';

// export const metadata: Metadata = {
//   title: 'Edit Property | Property Plus Africa',
// };

interface PropertyType {
  typeId: number | string;
  typeName: string;
}

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
  currency: Currency | { currencyId: number };
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  state: string;
  city: string;
  address: string;
  latitude?: string;
  longitude?: string;
  propertyTypeId: number | string;
  amenities?: string;
  otherFeatures?: string;
  propertyDescription: string;
  images?: PropertyImage[];
}

export default function EditProperty() {
  const { propertyId } = useParams();
  const slug = useSearchParams().get('slug');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Property types
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState<string | null>(null);

  // Currencies
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [currenciesError, setCurrenciesError] = useState<string | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Property data
  const [property, setProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  const formRef = useRef<HTMLFormElement>(null);

  // Fetch property types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setLoadingTypes(true);
        const res = await api.get("/property-types");
        setPropertyTypes(res.data || []);
      } catch (err: any) {
        setTypesError(err?.response?.data?.message || "Failed to load property types");
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchPropertyTypes();
  }, []);

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const res = await api.get("/currencies");
        const data = res.data || [];
        setCurrencies(data.sort((a: Currency, b: Currency) => (a.currencyCode === 'NGN' ? -1 : b.currencyCode === 'NGN' ? 1 : 0)));
      } catch (err: any) {
        setCurrenciesError(err?.response?.data?.message || "Failed to load currencies");
      } finally {
        setLoadingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, []);

  // Fetch existing property
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoadingProperty(true);
        const res = await api.get(`/properties/${slug}`);
        setProperty(res.data);
        setExistingImages(res.data.images || []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load property details');
        router.push('/dashboard/properties');
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const handleClick = () => fileInputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/properties/${slug}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.imageId !== imageId));
      toast.success('Image deleted successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    const getValue = (name: string) =>
      (e.currentTarget.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement)?.value ?? '';

    try {
      const formData = new FormData();

      formData.append('propertyTitle', getValue('propertyTitle'));
      formData.append('listingType', getValue('listingType'));
      formData.append('price', getValue('price'));
      formData.append('currency', getValue('currency'));
      formData.append('bedrooms', getValue('bedrooms'));
      formData.append('bathrooms', getValue('bathrooms'));
      formData.append('garage', getValue('garage'));
      formData.append('state', getValue('state'));
      formData.append('city', getValue('city'));
      formData.append('address', getValue('address'));
      formData.append('latitude', getValue('latitude'));
      formData.append('longitude', getValue('longitude'));
      formData.append('propertyTypeId', getValue('typeId'));
      formData.append('amenities', getValue('amenities'));
      formData.append('otherFeatures', getValue('otherFeatures'));
      formData.append('propertyDescription', getValue('propertyDescription'));

      selectedFiles.forEach((file) => formData.append('images', file));

    //   const response = await api.put(`/properties/${slug}`, formData, {
   const response = await api.post(`/properties/${slug}/edit?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'Property updated successfully!');
    //   router.push('/dashboard/properties');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update property. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setSubmitResult(null);

  if (loadingProperty || !property) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FontAwesomeIcon icon={faSpinner} className="text-primary text-5xl animate-spin mb-4" />
        <p>Loading property details...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-8 md:pt-10 lg:pt-12 pb-8 md:pb-10 lg:pb-12">
      <div className="mb-16 text-center">
        <div className="flex gap-2.5 items-center justify-center mb-3">
          <Icon icon="ph:pencil-circle-fill" width={20} height={20} className="text-primary" />
          <p className="text-base font-semibold text-badge dark:text-white/90">Edit Property</p>
        </div>
        <h3 className="text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14">
          Edit Your Property
        </h3>
        <p className="text-base font-normal tracking-tight text-black/60 dark:text-white/60 leading-6 max-w-3xl mx-auto">
          Update the details below to modify your property listing.
        </p>
      </div>

      <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-10 shadow-xl dark:shadow-white/5 bg-white/40 dark:bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
          <div className="flex-1">
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-7">
              {/* Title & Listing Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="propertyTitle"
                    defaultValue={property.propertyTitle}
                    placeholder="e.g. Modern 3 Bedroom Apartment in Lekki Phase 1"
                    required
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Listing Type *
                  </label>
                  <select
                    name="listingType"
                    defaultValue={property.listingType}
                    required
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  >
                    <option value="">Select type</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>

              {/* Price + Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    defaultValue={property.price}
                    placeholder="e.g. 45000000.00"
                    required
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency *
                  </label>
                  {loadingCurrencies ? (
                    <div className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                      Loading...
                    </div>
                  ) : currenciesError ? (
                    <div className="px-5 py-3.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm">
                      {currenciesError}
                    </div>
                  ) : (
                    <select
                      name="currency"
                      required
                      defaultValue={typeof property.currency === 'object' ? property.currency.currencyId : ''}
                      className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                    >
                      <option value="">Select currency</option>
                      {currencies.map((cur) => (
                        <option key={cur.currencyId} value={cur.currencyId}>
                          {cur.currencyCode} ({cur.currencySymbol})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Beds, Baths, Garage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    min="0"
                    defaultValue={property.bedrooms}
                    placeholder="e.g. 3"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    min="0"
                    step="0.5"
                    defaultValue={property.bathrooms}
                    placeholder="e.g. 3"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Garage / Parking
                  </label>
                  <input
                    type="text"
                    name="garage"
                    defaultValue={property.garage}
                    placeholder="e.g. 2 cars, None, Carport"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>
              </div>

              {/* State & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={property.state}
                    placeholder="e.g. Lagos, FCT"
                    required
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={property.city}
                    placeholder="e.g. Lekki, Maitama"
                    required
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  rows={4}
                  defaultValue={property.address}
                  placeholder="e.g. 12 Admiralty Way, Lekki Phase 1, Lagos"
                  required
                  className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900 resize-none"
                />
              </div>

              {/* Lat / Lng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    defaultValue={property.latitude}
                    placeholder="e.g. 6.5244"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    defaultValue={property.longitude}
                    placeholder="e.g. 3.3792"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Type *
                </label>
                {loadingTypes ? (
                  <div className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                    Loading property types...
                  </div>
                ) : typesError ? (
                  <div className="px-5 py-3.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                    {typesError}
                  </div>
                ) : (
                  <select
                    name="typeId"
                    defaultValue={property.propertyTypeId}
                    required
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type.typeId} value={type.typeId}>
                        {type.typeName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amenities & Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amenities (comma separated)
                  </label>
                  <input
                    type="text"
                    name="amenities"
                    defaultValue={property.amenities}
                    placeholder="e.g. Swimming Pool, Gym, 24/7 Security, CCTV"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Other Features (comma separated)
                  </label>
                  <input
                    type="text"
                    name="otherFeatures"
                    defaultValue={property.otherFeatures}
                    placeholder="e.g. Fully Furnished, Boys Quarter, Generator"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Description *
                </label>
                <textarea
                  name="propertyDescription"
                  rows={6}
                  defaultValue={property.propertyDescription}
                  placeholder="Describe the property: number of floors, parking, security, unique features, etc..."
                  required
                  className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900 resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Images
                </label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Existing images ({existingImages.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {existingImages.map((img) => (
                        <div key={img.imageId} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img.imageUrl}`}
                              alt="Existing property image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.imageId)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <Icon icon="ph:x-bold" width={14} height={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-black/20 dark:border-white/20 hover:border-primary/50'
                  } cursor-pointer`}
                  onClick={handleClick}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                >
                  <Icon icon="ph:images" width={48} height={48} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
                    Drag & drop new images here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    JPG, PNG • max 10MB per image • {selectedFiles.length} new selected
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      New selected images ({selectedFiles.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            disabled={isSubmitting}
                          >
                            <Icon icon="ph:x-bold" width={14} height={14} />
                          </button>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="mt-8 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-10 py-4 rounded-full bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center hover:cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      Updating... <FontAwesomeIcon icon={faSpinner} className="ml-2 animate-spin" />
                    </>
                  ) : (
                    'Update Property'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full md:w-auto px-10 py-4 rounded-full bg-gray-200 text-gray-800 text-base font-semibold hover:bg-gray-300 transition-colors duration-300 hover:cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}