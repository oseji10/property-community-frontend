"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/lib/api";
import toast from "react-hot-toast";

interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  otherNames?: string;
  email: string;
  phoneNumber: string;
  user_role: {
    roleName: string;
  };
}

interface Property {
  propertyId: number;
  propertyTitle: string;
  propertyDescription: string;
  address: string;
  city: string;
  state: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  slug: string;
  otherFeatures: string;
  amenities: string;
  created_at: string;
  images: Array<{
    imageId: number;
    imageUrl: string;
  }>;
  currency: {
    currencySymbol: string;
  };
  owner: Owner;
  latitude?: string;
  longitude?: string;
}

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8004/images";

export default function PropertyDetails() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Message form
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  // Login Modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Pending favorite action (to retry after login)
  const [pendingFavoriteAction, setPendingFavoriteAction] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("No property selected");
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/properties/${slug}/detail`);
        const data = response.data;

        if (!data?.propertyId) {
          throw new Error("Property not found");
        }

        setProperty(data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Could not load property details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  // ────────────────────────────────────────────────
  // Toggle favorite with 401 handling
  // ────────────────────────────────────────────────
  const toggleFavorite = async () => {
    if (!property?.propertyId) return;

    setTogglingFavorite(true);

    const action = async () => {
      try {
        if (isFavorite) {
          await api.delete(`/favorites/${property.propertyId}`);
          toast.success("Removed from favorites");
          setIsFavorite(false);
        } else {
          await api.post("/favorites", { propertyId: property.propertyId });
          toast.success("Added to favorites");
          setIsFavorite(true);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          // Unauthorized → show login modal and queue the action
          setPendingFavoriteAction(() => action);
          setShowLoginModal(true);
        } else {
          toast.error(err.response?.data?.message || "Could not update favorites");
        }
      } finally {
        setTogglingFavorite(false);
      }
    };

    await action();
  };

  // ────────────────────────────────────────────────
  // Handle login from modal
  // ────────────────────────────────────────────────
  // Your handleLogin (cleaned up)
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginLoading(true);
  setLoginError(null);

  try {
    const res = await api.post("/login", {
      username: loginEmail.trim(),
      password: loginPassword,
    });

    // No need to store tokens — they're in httpOnly cookies now
    // You can immediately fetch user profile if needed
    const { data } = res; // axios gives you data directly

    // Option 1: Store minimal non-sensitive user info (if really needed)
    // Many apps skip localStorage entirely here
    localStorage.setItem("user", JSON.stringify({
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phoneNumber: data.phoneNumber ?? "",
      role: data.role ?? null,
    }));

    toast.success("Logged in successfully!");

    setShowLoginModal(false);
    setLoginEmail("");
    setLoginPassword("");

    if (pendingFavoriteAction) {
      await pendingFavoriteAction();
      setPendingFavoriteAction(null);
    }

    // Optional: redirect or refresh app state
    // navigate("/dashboard");
  } catch (err: any) {
    setLoginError(err.response?.data?.message || "Login failed. Please try again.");
  } finally {
    setLoginLoading(false);
  }
};

  // ────────────────────────────────────────────────
  // Send message (your existing logic – unchanged)
  // ────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !property?.owner?.id) return;

    setSendingMessage(true);

    try {
      const res = await api.post("/messages", {
        recipientId: property.owner.id,
        propertyId: property.propertyId,
        message: messageText.trim(),
      });

      toast.success(res.data?.message || "Message sent successfully!");
      setMessageText("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-xl text-red-600 dark:text-red-400">{error || "Property not found"}</p>
        <Link
          href="/properties"
          className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition"
        >
          Back to Properties
        </Link>
      </div>
    );
  }

  const owner = property.owner;
  const isAgent = owner.user_role?.roleName?.toUpperCase() === "AGENT";
  const contactTitle = isAgent ? "Contact Agent" : "Contact Owner";

  const postedDate = new Date(property.created_at).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const mainImage = property.images?.[0]?.imageUrl
    ? `${IMAGE_URL}${property.images[0].imageUrl}`
    : "/images/placeholder-property.jpg";

  const priceFormatted = `${property.currency.currencySymbol}${Number(property.price).toLocaleString()}`;

  const amenitiesList = property.amenities
    ? property.amenities.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const featuresList = property.otherFeatures
    ? property.otherFeatures.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <>
      <section className="pt-44 pb-20">
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 mt-30">
            <div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-primary hover:underline mb-4 hover:cursor-pointer"
              >
                <Icon icon="akar-icons:arrow-left" width={20} />
                Back to Properties
              </Link>

              <h1 className="text-4xl lg:text-5xl font-bold text-dark dark:text-white">
                {property.propertyTitle}
              </h1>

              <div className="mt-4 flex flex-wrap gap-6 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Icon icon="ph:map-pin" width={20} />
                  {property.city}, {property.state}
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-linear" width={20} />
                  Posted on {postedDate}
                </div>
              </div>
            </div>

            <button
              onClick={toggleFavorite}
              disabled={togglingFavorite}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                border ${isFavorite 
                  ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" 
                  : "border-gray-300 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 hover:cursor-pointer"}
              `}
            >
              <Icon 
                icon={isFavorite ? "solar:heart-bold" : "solar:heart-linear"} 
                width={24} 
                className={isFavorite ? "text-red-500" : "text-gray-500 dark:text-gray-400"}
              />
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </button>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            <div className="lg:col-span-3">
              <Image
                src={mainImage}
                alt={property.propertyTitle}
                width={1200}
                height={700}
                className="rounded-2xl w-full h-[500px] lg:h-[700px] object-cover shadow-xl"
                unoptimized
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
              {property.images?.slice(1, 4).map((img, idx) => (
                <Image
                  key={img.imageId}
                  src={`${IMAGE_URL}${img.imageUrl}`}
                  alt={`Property image ${idx + 2}`}
                  width={400}
                  height={300}
                  className="rounded-2xl w-full h-60 object-cover shadow-md"
                  unoptimized
                />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-12">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">Description</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {property.propertyDescription || "No description available."}
                </p>
              </div>

              {amenitiesList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-semibold mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {amenitiesList.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Icon icon="solar:check-circle-bold" className="text-green-500" width={24} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {featuresList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-semibold mb-6">Additional Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {featuresList.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Icon icon="solar:star-bold" className="text-amber-500" width={24} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">Location</h2>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Map would appear here (Google Maps / Leaflet)</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Price Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg border border-indigo-100 dark:border-gray-700">
                <div className="text-4xl font-bold text-primary dark:text-secondary mb-2">
                  {property.currency.currencySymbol}{Number(property.price).toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Asking Price</p>
              </div>

              {/* Contact Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold">
                    {contactTitle}
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                      {owner.firstName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {owner.firstName} {owner.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isAgent ? "Real Estate Agent" : "Property Owner"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={`tel:${owner.phoneNumber}`}
                      className="flex items-center justify-center gap-2 py-3.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition font-medium"
                    >
                      <Icon icon="ph:phone-call-fill" width={20} />
                      Call
                    </a>

                    <a
                      href={`https://wa.me/${owner.phoneNumber.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(owner.firstName)}%2C%20I'm%20interested%20in%20your%20property%20listing...`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-medium"
                    >
                      <Icon icon="logos:whatsapp-icon" width={20} />
                      WhatsApp
                    </a>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Icon icon="ph:envelope-simple-fill" width={20} className="text-indigo-600" />
                    <a href={`mailto:${owner.email}`} className="hover:text-indigo-600 break-all">
                      {owner.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Message Form Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="text-lg font-semibold mb-5">Send Message to {owner.firstName}</h4>

                <form onSubmit={handleSendMessage} className="space-y-5">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Hi ${owner.firstName}, I would like to know more about...`}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                    disabled={sendingMessage}
                  />

                  <button
                    type="submit"
                    disabled={sendingMessage || !messageText.trim()}
                    className={`
                      w-full py-3.5 rounded-xl font-medium text-white transition-all hover:cursor-pointer
                      ${sendingMessage
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary hover:bg-secondary"}
                    `}
                  >
                    {sendingMessage ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon icon="eos-icons:loading" className="animate-spin" width={20} />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          Login Modal
      ──────────────────────────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowLoginModal(false);
                setPendingFavoriteAction(null);
                setLoginError(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Icon icon="ph:x-bold" width={24} height={24} />
            </button>

            <h3 className="text-2xl font-bold text-center mb-6">
              Sign in to favorite this property
            </h3>

            {loginError && (
              <p className="text-red-600 dark:text-red-400 text-center mb-4">{loginError}</p>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={loginLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={loginLoading}
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className={`
                  w-full py-3.5 rounded-xl font-medium text-white transition-all
                  ${loginLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"}
                `}
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="eos-icons:loading" className="animate-spin" width={20} />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}