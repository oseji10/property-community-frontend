import SignUp from "@/components/Auth/SignUp";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
        "Sign Up | Property Community",
};

const SignUpPage = () => {
    return (
        <>
            <section className="pt-30!">
                <div className="p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
                    <SignUp />
                </div>
            </section>
        </>
    );
};

export default SignUpPage;
