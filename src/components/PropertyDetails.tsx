"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/lib/api"; // ← adjust path to your axios instance

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
  otherFeatures: string;     // "Furnished boys quarters"
  amenities: string;         // "swinming pool, court yard"
  images: Array<{
    imageId: number;
    imageUrl: string;
  }>;
  currency: {
    currencySymbol: string;
  };
  // add more fields if needed
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8004/images";
export default function Details() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Adjust this endpoint to match your actual route
        // Most common patterns:
        // 1. /api/properties/{slug}
        // 2. /api/properties?slug=xxx
        const response = await api.get(`/properties/${slug}/detail`);
        // or: await api.get("/api/properties", { params: { slug } });

        const data = response.data;

        if (!data?.propertyId) {
          throw new Error("Property not found");
        }

        setProperty(data);
      } catch (err: any) {
        console.error("Failed to load property:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Could not load property details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  if (loading) {
    return (
      <section className="!pt-44 pb-20 relative">
        <div className="container mx-auto max-w-8xl px-5 2xl:px-0 text-center py-20">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Loading property details...
          </p>
        </div>
      </section>
    );
  }

  if (error || !property) {
    return (
      <section className="!pt-44 pb-20 relative">
        <div className="container mx-auto max-w-8xl px-5 2xl:px-0 text-center py-20">
          <p className="text-xl text-red-600 dark:text-red-400 mb-6">
            {error || "Property not found"}
          </p>
          <Link
            href="/properties"
            className="inline-block px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90"
          >
            Back to Properties
          </Link>
        </div>
      </section>
    );
  }

  // ────────────────────────────────────────────────
  // Prepare data for display
  // ────────────────────────────────────────────────
  const title = property.propertyTitle;
  const location = `${property.city}, ${property.state}`;
  const description = property.propertyDescription || "No description available.";
  const priceFormatted = `${property.currency.currencySymbol}${Number(property.price).toLocaleString()}`;

  const mainImage = property.images?.[0]?.imageUrl
    ? `${IMAGE_URL}${property.images[0].imageUrl}`
    : "/placeholder-property.jpg";

  const secondaryImages = property.images
    ?.slice(1, 4)
    .map((img) => ({
      src: `${IMAGE_URL}${img.imageUrl}`,
      alt: `Property image ${img.imageId}`,
    })) || [];

  // Split comma-separated strings → trim + filter empty
  const amenitiesList = property.amenities
    ? property.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const featuresList = property.otherFeatures
    ? property.otherFeatures
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="!pt-44 pb-20 relative">
      <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
        {/* Title + location + specs */}
        <div className="grid grid-cols-12 items-end gap-6">
          <div className="lg:col-span-8 col-span-12">
            <h1 className="lg:text-52 text-40 font-semibold text-dark dark:text-white">
              {title}
            </h1>
            <div className="flex gap-2.5">
              <Icon
                icon="ph:map-pin"
                width={24}
                height={24}
                className="text-dark/50 dark:text-white/50"
              />
              <p className="text-dark/50 dark:text-white/50 text-xm">{location}</p>
            </div>
          </div>

          <div className="lg:col-span-4 col-span-12">
            <div className="flex">
              <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 pr-2 xs:pr-4 mobile:pr-8">
                <Icon icon="solar:bed-linear" width={20} height={20} />
                <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
                  {property.bedrooms} Bedrooms
                </p>
              </div>
              <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 px-2 xs:px-4 mobile:px-8">
                <Icon icon="solar:bath-linear" width={20} height={20} />
                <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
                  {property.bathrooms} Bathrooms
                </p>
              </div>
              <div className="flex flex-col gap-2 pl-2 xs:pl-4 mobile:pl-8 opacity-50">
                <Icon icon="lineicons:arrow-all-direction" width={20} height={20} />
                <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
                  — m²
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-12 mt-8 gap-8">
          <div className="lg:col-span-8 col-span-12 row-span-2">
            <Image
              src={mainImage}
              alt={title}
              width={800}
              height={540}
              className="rounded-2xl w-full h-540 object-cover"
              unoptimized={true}
            />
          </div>

          {secondaryImages.map((img, idx) => (
            <div
              key={idx}
              className={`${
                idx === 0 ? "lg:col-span-4 lg:block hidden" : "lg:col-span-2 col-span-6"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={500}
                className="rounded-2xl w-full h-full object-cover"
                unoptimized={true}
              />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-8 mt-10">
          <div className="lg:col-span-8 col-span-12">
            <h3 className="text-xl font-medium">Property details</h3>

            <div className="py-8 my-8 border-y border-dark/10 dark:border-white/20">
              <p className="text-dark dark:text-white text-xm whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </div>

            {/* ─── Dynamic Amenities ──────────────────────────────────────── */}
            {amenitiesList.length > 0 && (
              <div className="py-8 mt-8 border-t border-dark/5 dark:border-white/15">
                <h3 className="text-xl font-medium mb-5">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {amenitiesList.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Icon icon="solar:check-circle-bold" className="text-primary" width={22} height={22} />
                      <p className="text-base dark:text-white text-dark">{amenity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Dynamic Other Features ─────────────────────────────────── */}
            {featuresList.length > 0 && (
              <div className="py-8 mt-4 border-t border-dark/5 dark:border-white/15">
                <h3 className="text-xl font-medium mb-5">Additional Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {featuresList.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Icon icon="solar:star-bold" className="text-primary" width={22} height={22} />
                      <p className="text-base dark:text-white text-dark">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* You can keep or remove the static "What this property offers" */}
            {/* If you want to keep it → leave as is */}
            {/* If you want to remove it → delete the block below */}

            <div className="py-8 mt-8 border-t border-dark/5 dark:border-white/15">
              <h3 className="text-xl font-medium">What this property offers</h3>
              <div className="grid grid-cols-3 mt-5 gap-6">
                <div className="flex items-center gap-2.5">
                  <Icon icon="ph:aperture" width={24} height={24} className="text-dark dark:text-white" />
                  <p className="text-base dark:text-white text-dark">Smart Home Integration</p>
                </div>
                {/* ... other static items ... */}
              </div>
            </div>

            {/* Map – consider making dynamic with lat/lng later */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d938779.7831767448!2d71.05098621661072!3d23.20271516446136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e82dd003ff749%3A0x359e803f537cea25!2sGANESH%20GLORY%2C%20Gota%2C%20Ahmedabad%2C%20Gujarat%20382481!5e0!3m2!1sen!2sin!4v1715676641521!5m2!1sen!2sin"
              width="1114"
              height="400"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-2xl w-full mt-10"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 col-span-12">
            <div className="bg-primary/10 p-8 rounded-2xl relative z-10 overflow-hidden">
              <h4 className="text-dark text-3xl font-medium dark:text-white">
                {priceFormatted}
              </h4>
              <p className="text-sm text-dark/50 dark:text-white">Asking Price</p>
              <Link
                href="#"
                className="py-4 px-8 bg-primary text-white rounded-full w-full block text-center hover:bg-dark duration-300 text-base mt-8"
              >
                Get in touch
              </Link>
              <div className="absolute right-0 top-4 -z-[1]">
                <Image src="/images/properties/vector.svg" width={400} height={500} alt="vector" unoptimized={true} />
              </div>
            </div>

            {/* Testimonial – kept as is for now */}
            {/* You can later fetch real testimonials too */}
          </div>
        </div>
      </div>
    </section>
  );
}