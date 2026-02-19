"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type FeaturedProperty = {
  propertyId: number;
  propertyTitle: string;
  propertyDescription: string;
  address: string;
  city: string;
  state: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  garage: string;
  size: string;
  slug: string;
  isFeatured: number;
  images: Array<{
    imageId: number;
    imageUrl: string;
  }>;
  currency: {
    currencySymbol: string;
  };
  // add more fields if needed
};

const FeaturedProperties = () => {
  const [properties, setProperties] = React.useState<FeaturedProperty[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("http://localhost:8004/api/featured-properties", {
          cache: "no-store", // or use revalidate if on Next.js App Router
        });

        if (!res.ok) throw new Error("Failed to fetch featured properties");

        const json = await res.json();

        if (json.status !== "success") throw new Error("API error");

        // Filter featured only (optional safety)
        const featured = json.data.data.filter(
          (p: FeaturedProperty) => p.isFeatured === 1
        );

        setProperties(featured);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-5 text-center">
          <p className="text-lg">Loading featured properties...</p>
        </div>
      </section>
    );
  }

  if (error || properties.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-5 text-center">
          <p className="text-lg text-muted-foreground">
            {error || "No featured properties available at the moment."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-primary font-semibold flex items-center gap-2 text-lg">
              <Icon icon="ph:star-fill" className="text-2xl" />
              Featured Properties
            </p>
            <h2 className="text-4xl md:text-5xl font-medium mt-2">
              Discover Our Top Listings
            </h2>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {properties.map((property) => {
              // const mainImage = property.images[0]?.imageUrl
              //   ? `/api/image-proxy?url=${encodeURIComponent(property.images[0].imageUrl)}` // adjust if images served differently
              //   : "/placeholder-property.jpg";

     const mainImage = property?.images?.[0]?.imageUrl
  ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${property.images[0].imageUrl}`
  : '/images/placeholder-property.jpg';

              const fullAddress = `${property.address}, ${property.city}, ${property.state}`;

              return (
                <CarouselItem
                  key={property.propertyId}
                  className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-2/3 xl:basis-1/3"
                >
                  <div className="group h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={mainImage}
                        alt={property.propertyTitle}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                      <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-1.5 line-clamp-1">
                        {property.propertyTitle}
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
                        <Icon icon="ph:map-pin" className="text-base" />
                        {fullAddress}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-2 flex-grow">
                        {property.propertyDescription}
                      </p>

                      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                        <div className="flex flex-col items-center">
                          <Icon icon="ph:bed" className="text-primary text-2xl mb-1" />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Icon icon="ph:bathtub" className="text-primary text-2xl mb-1" />
                          <span>{property.bathrooms} Baths</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Icon icon="ph:car" className="text-primary text-2xl mb-1" />
                          <span>{property.garage} Garage</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {property.currency.currencySymbol}
                            {Number(property.price).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            For {property.listingType}
                          </p>
                        </div>

                        <Link
                          href={`/properties/detail?slug=${property.slug}`}
                          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <div className="hidden sm:flex justify-between mt-6">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedProperties;