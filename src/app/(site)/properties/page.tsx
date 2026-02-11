import HeroSub from "@/components/shared/HeroSub";
import PropertiesListing from "@/components/Properties/PropertyList";
import React, { Suspense } from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Property List | Property Plus Africa",
};

const page = () => {
    return (
        <>
            {/* <HeroSub
                title="Discover inspiring designed homes."
                description="Experience elegance and comfort with our exclusive luxury  villas, designed for sophisticated living."
                badge="Properties"
                
            /> */}
            

             <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Loading properties...
                </p>
              </div>
            }
          >
             <PropertiesListing />
          </Suspense>
        </>
    );
};

export default page;
