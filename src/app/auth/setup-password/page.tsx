import SignUp from "@/components/Auth/SignUp";
import { Metadata } from "next";
import SignUpPage from "../signup/page";
import SetupPassword from "@/components/Auth/SetupPassword/page";
import { Suspense } from "react";

export const metadata: Metadata = {
    title:
        "Setup Password | Property Plus Africa",
};

const SetupPasswordPage = () => {
    return (
        <>
            <section className="pt-30!">
                <div className="p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
                     <Suspense
                                                    fallback={
                                                      <div className="flex items-center justify-center py-12">
                                                        <p className="text-lg text-gray-600 dark:text-gray-400">
                                                          Loading password setup page...
                                                        </p>
                                                      </div>
                                                    }
                                                  >
                                      
                    <SetupPassword />
                                                  </Suspense>
                </div>
            </section>
        </>
    );
};

export default SetupPasswordPage;
