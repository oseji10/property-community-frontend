import Signin from "@/components/Auth/SignIn";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title:
        "Sign In | Property Plus Africa",
};

const SigninPage = () => {
    return (
        <>
            <section className="pt-44!">
                <div className="p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
                   
                    <Suspense
                                                   fallback={
                                                     <div className="flex items-center justify-center py-12">
                                                       <p className="text-lg text-gray-600 dark:text-gray-400">
                                                         Loading signin page...
                                                       </p>
                                                     </div>
                                                   }
                                                 >
                    <Signin />
                                                 </Suspense>
                </div>
            </section>
        </>
    );
};

export default SigninPage;
