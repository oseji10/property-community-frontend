import SignUp from "@/components/Auth/SignUp";
import VerifyOTP from "@/components/Auth/VerifyOTP/page";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title:
        "Verify OTP | Property Plus Africa",
};

const VerifyOTPPage = () => {
    return (
        <>
            <section className="pt-30!">
                <div className="p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
                    
                     <Suspense
                                                    fallback={
                                                      <div className="flex items-center justify-center py-12">
                                                        <p className="text-lg text-gray-600 dark:text-gray-400">
                                                          Loading properties...
                                                        </p>
                                                      </div>
                                                    }
                                                  >
                    <VerifyOTP />
                                                  </Suspense>
                </div>
            </section>
        </>
    );
};

export default VerifyOTPPage;
