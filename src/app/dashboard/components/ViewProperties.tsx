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
  faStar,
  faCheckCircle,
  faTimesCircle,
  faClock,
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
  price: string;
  listingType: 'sale' | 'rent';
  status: string;
  amenities?: string;
  otherFeatures?: string;
  images: PropertyImage[];
  currency: Currency;
  property_type: PropertyType;
  owner?: Owner;
  created_at: string;
  updated_at: string;
  isFeatured?: boolean;
}

interface PropertyResponse {
  property: PropertyData;
  viewsCount: number;
  favoritesCount: number;
  isOwner: boolean;
}

interface FeaturedPlan {
  id: number;
  name: string;
  description?: string;
  durationDays: number;
  amount: number;
  isPopular?: boolean;
}

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');

  const [data, setData] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [makingFeatured, setMakingFeatured] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('available');

  // Featured plans
  const [plans, setPlans] = useState<FeaturedPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Payment status banners
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [showPendingBanner, setShowPendingBanner] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  // Handle payment callback from gateway
  useEffect(() => {
    const payment = searchParams.get('payment');

    if (!payment) return;

    let message = '';
    let bannerType: 'success' | 'error' | 'pending' | null = null;
    let shouldRefetch = false;

    const lower = payment.toLowerCase();

    if (['success', 'successful', 'completed'].includes(lower)) {
      message = 'Payment successful! Your property is now featured.';
      bannerType = 'success';
      shouldRefetch = true;
      setShowSuccessBanner(true);
      setShowErrorBanner(false);
      setShowPendingBanner(false);
    } else if (['failed', 'declined', 'error'].includes(lower)) {
      message = 'Payment failed or encountered an error. No changes were made.';
      bannerType = 'error';
      setShowErrorBanner(true);
      setShowSuccessBanner(false);
      setShowPendingBanner(false);
    } else if (['cancelled', 'canceled'].includes(lower)) {
      message = 'Payment was cancelled. No changes were made to your property.';
      bannerType = 'error';
      setShowErrorBanner(true);
      setShowSuccessBanner(false);
      setShowPendingBanner(false);
    } else if (['pending', 'processing'].includes(lower)) {
      message = 'Payment is being processed. We will update your property once confirmed.';
      bannerType = 'pending';
      setShowPendingBanner(true);
      setShowSuccessBanner(false);
      setShowErrorBanner(false);
    } else {
      message = 'Unknown payment status. Please check your transaction.';
      bannerType = 'error';
      setShowErrorBanner(true);
      setShowSuccessBanner(false);
      setShowPendingBanner(false);
    }

    if (message) {
      setPaymentMessage(message);
      toast[bannerType === 'success' ? 'success' : bannerType === 'pending' ? 'loading' : 'error'](
        message,
        { duration: 6500, position: 'top-center' }
      );
    }

    // Clean URL so refreshing doesn't re-trigger banners
    router.replace(`/dashboard/properties/view/?slug=${slug}`, { scroll: false });

    // Only refetch on success to update isFeatured
    if (shouldRefetch) {
      setTimeout(() => {
        fetchProperty();
      }, 1200);
    }
  }, [searchParams, router, propertyId, slug]);

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

    if (slug) fetchProperty();
  }, [slug, router]);

  // Load available featured plans
  useEffect(() => {
    const fetchFeaturedPlans = async () => {
      if (!data?.isOwner || data?.property.isFeatured) return;

      try {
        setPlansLoading(true);
        const res = await api.get('/featured-plans');

        const rawPlans = res.data || []; // assuming array directly

        const mappedPlans: FeaturedPlan[] = rawPlans
          .filter((p: any) => p.isActive === 1)
          .map((p: any) => ({
            id: p.packageId,
            name: p.packageName,
            description: p.packageDescription,
            durationDays: p.durationDays,
            amount: parseFloat(p.price),
            isPopular: p.durationDays === 30 || p.packageName.toLowerCase().includes('popular'),
          }));

        setPlans(mappedPlans);

        if (mappedPlans.length > 0) {
          const preferred = mappedPlans.find(p => p.isPopular) || mappedPlans[0];
          setSelectedPlanId(preferred.id.toString());
        }
      } catch (err: any) {
        toast.error('Could not load featured plan options');
        console.error(err);
      } finally {
        setPlansLoading(false);
      }
    };

    if (data?.isOwner && !data?.property.isFeatured) {
      fetchFeaturedPlans();
    }
  }, [data?.isOwner, data?.property.isFeatured]);

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
              property: { ...prev.property, status: newStatus },
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

  const handleInitiateFeaturedPayment = async () => {
    if (!data?.isOwner || data?.property.isFeatured || !selectedPlanId) return;

    const selectedPlan = plans.find((p) => p.id.toString() === selectedPlanId);
    if (!selectedPlan) return;

    if (
      !confirm(
        `Pay ₦${selectedPlan.amount.toLocaleString()} to feature this property for ${selectedPlan.durationDays} days?`
      )
    ) {
      return;
    }

    setMakingFeatured(true);

    try {
      const payload = {
        planId: selectedPlanId,
      };

      const res = await api.post(`/properties/${slug}/initiate-feature-payment`, payload);

      if (res.data?.success && res.data?.payment_link) {
        window.location.href = res.data.payment_link;
      } else {
        toast.error('Failed to start payment process');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initiate featured payment');
    } finally {
      setMakingFeatured(false);
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
  const isFeatured = prop.isFeatured ?? false;

  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-8 md:pt-10 lg:pt-12 pb-12">
      {/* Payment status banners */}
      {showSuccessBanner && (
        <div className="mb-10 p-6 bg-green-50 border border-green-200 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-4xl mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
              <p className="text-green-700">{paymentMessage}</p>
            </div>
          </div>
        </div>
      )}

      {showErrorBanner && (
        <div className="mb-10 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-4xl mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h2>
              <p className="text-red-700">{paymentMessage}</p>
            </div>
          </div>
        </div>
      )}

      {showPendingBanner && (
        <div className="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <FontAwesomeIcon icon={faClock} className="text-blue-600 text-4xl mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">Payment Pending</h2>
              <p className="text-blue-700">{paymentMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          <Icon icon="ph:house-fill" width={24} height={24} className="text-primary" />
          <p className="text-base font-semibold text-badge dark:text-white/90">Property Details</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter text-black dark:text-white mb-3 sm:mb-0">
            {prop.propertyTitle}
          </h1>
          {isFeatured && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full text-base font-medium border border-amber-200 dark:border-amber-800/50">
              <FontAwesomeIcon icon={faStar} className="text-amber-500" />
              Featured
            </div>
          )}
        </div>

        <p className="text-base text-black/60 dark:text-white/60 mt-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
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
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              {prop.currency.currencySymbol}
              {priceNum.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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

              {isFeatured && (
                <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm flex items-center gap-1">
                  <FontAwesomeIcon icon={faStar} className="text-white" />
                  Featured
                </span>
              )}
            </div>

            {data.isOwner && (
              <div className="mt-8 space-y-8">
                {/* Status Update */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1.5">
                    Update Property Status
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      id="status"
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      disabled={updatingStatus}
                      className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
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

                {/* Featured Plans */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Make Property Featured</label>

                  {isFeatured ? (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800/40">
                      <FontAwesomeIcon icon={faStar} className="text-green-600" />
                      <span>This property is currently featured</span>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {plansLoading ? (
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Loading available plans...
                        </div>
                      ) : plans.length === 0 ? (
                        <p className="text-sm text-amber-600">
                          Featured plans are currently unavailable.
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Select duration to feature your property:
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plans.map((plan) => (
                              <label
                                key={plan.id}
                                className={`
                                  relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all
                                  ${
                                    selectedPlanId === plan.id.toString()
                                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-400/40'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-amber-400'
                                  }
                                `}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="featured-plan"
                                      id={`plan-${plan.id}`}
                                      value={plan.id}
                                      checked={selectedPlanId === plan.id.toString()}
                                      onChange={() => setSelectedPlanId(plan.id.toString())}
                                      className="w-4 h-4 mt-1 text-amber-600 border-gray-300 focus:ring-amber-500"
                                    />
                                    <div>
                                      <div className="font-medium">{plan.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {plan.durationDays} days
                                      </div>
                                    </div>
                                  </div>

                                  {plan.isPopular && (
                                    <span className="px-2.5 py-1 text-xs font-medium bg-amber-500 text-white rounded-full">
                                      Popular
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 text-lg font-semibold text-amber-700 dark:text-amber-300">
                                  ₦{plan.amount.toLocaleString()}
                                </div>
                              </label>
                            ))}
                          </div>

                          <button
                            onClick={handleInitiateFeaturedPayment}
                            disabled={makingFeatured || !selectedPlanId}
                            className={`
                              mt-2 w-full sm:w-auto px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all hover:cursor-pointer
                              ${
                                makingFeatured || !selectedPlanId
                                  ? 'bg-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                              }
                            `}
                          >
                            {makingFeatured ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faStar} className="mr-2" />
                                Proceed to Payment
                              </>
                            )}
                          </button>
                        </>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Featured properties appear at the top of search results and in premium placements for the selected duration.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description, Amenities, Other Features */}
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