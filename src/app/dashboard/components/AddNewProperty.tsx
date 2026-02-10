// app/dashboard/add-new-property/page.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '@/app/lib/api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add New Property | Property Plus Africa',
};

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

export default function AddNewProperty() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
        const res = await api.get("/currencies"); // ← your endpoint
        const data = res.data || [];
        setCurrencies(data);

        // Optional: sort so NGN comes first
        setCurrencies((prev) =>
          [...prev].sort((a, b) => (a.code === 'NGN' ? -1 : b.code === 'NGN' ? 1 : 0))
        );
      } catch (err: any) {
        setCurrenciesError(err?.response?.data?.message || "Failed to load currencies");
      } finally {
        setLoadingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, []);

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

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
      formData.append('currency', getValue('currency'));     // ← new
      formData.append('bedrooms', getValue('bedrooms'));
      formData.append('bathrooms', getValue('bathrooms'));
      formData.append('garage', getValue('garage'));
      formData.append('state', getValue('state'));
      formData.append('size', getValue('size'));
      formData.append('city', getValue('city'));
      formData.append('address', getValue('address'));
      formData.append('latitude', getValue('latitude'));
      formData.append('longitude', getValue('longitude'));
      formData.append('propertyTypeId', getValue('typeId'));
      formData.append('amenities', getValue('amenities'));
      formData.append('otherFeatures', getValue('otherFeatures'));
      formData.append('propertyDescription', getValue('propertyDescription'));

    //   selectedFiles.forEach((file) => formData.append('images', file));
      selectedFiles.forEach((file) => {
  formData.append('images[]', file);
});


      const response = await api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmitResult({
        type: 'success',
        message: response.data.message || 'Property added successfully!',
      });

      setSelectedFiles([]);
      if (formRef.current) formRef.current.reset();
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit property. Please try again.';
      setSubmitResult({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setSubmitResult(null);

  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-8 md:pt-10 lg:pt-12 pb-8 md:pb-10 lg:pb-12">
      <div className="mb-16 text-center">
        <div className="flex gap-2.5 items-center justify-center mb-3">
          <Icon icon="ph:plus-circle-fill" width={20} height={20} className="text-primary" />
          <p className="text-base font-semibold text-badge dark:text-white/90">Add Property</p>
        </div>
        <h3 className="text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14">
          Add Your Property
        </h3>
        <p className="text-base font-normal tracking-tight text-black/60 dark:text-white/60 leading-6 max-w-3xl mx-auto">
          Fill in the details below to list your property. High-quality photos and accurate info help it sell/rent faster.
        </p>
      </div>

      <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-10 shadow-xl dark:shadow-white/5 bg-white/40 dark:bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
          {/* Right - Form */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
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
                      defaultValue="NGN"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    min="0"
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
                    placeholder="e.g. 3"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Garage / Parking
                  </label>
                  <input
                    type="text"
                    name="garage"
                    placeholder="e.g. 2 cars, None, Carport"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div> */}

                <div className="hidden sm:block" /> {/* spacer */}
              </div>


               {/* State & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Garage / Parking
                  </label>
                  <input
                    type="text"
                    name="garage"
                    placeholder="e.g. 2 cars, None, Carport"
                    className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900"
                  />
                </div>

                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size (Sqms)
                  </label>
                  <input
                    type="number"
                    name="size"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 100"
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
                  placeholder="Describe the property: number of floors, parking, security, unique features, etc..."
                  required
                  className="w-full px-5 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900 resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Images * (multiple allowed)
                </label>

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
                    Drag & drop images here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    JPG, PNG • max 10MB per image • {selectedFiles.length} selected
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp, image/svg, image/avif"
                    className="hidden"
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Selected images ({selectedFiles.length})
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
                            onClick={(ev) => {
                              ev.stopPropagation();
                              removeFile(index);
                            }}
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
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting || selectedFiles.length === 0}
                  className="w-full md:w-auto px-10 py-4 rounded-full bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 hover:cursor-pointer disabled:hover:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      Submitting <FontAwesomeIcon icon={faSpinner} className="ml-2 animate-spin" />
                    </>
                  ) : (
                    'Submit Property'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success / Error Modal */}
      {submitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-[90%] shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  submitResult.type === 'success'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                }`}
              >
                <Icon
                  icon={submitResult.type === 'success' ? 'ph:check-circle-fill' : 'ph:warning-fill'}
                  width={40}
                  height={40}
                />
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {submitResult.type === 'success' ? 'Success!' : 'Error'}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-8">{submitResult.message}</p>

              <button
                onClick={closeModal}
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors hover:cursor-pointer"
              >
                {submitResult.type === 'success' ? 'Done' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}