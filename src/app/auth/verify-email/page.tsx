import SignUp from "@/components/Auth/SignUp";
import VerifyOTP from "@/components/Auth/VerifyOTP/page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
        "Verify OTP | Property Community",
};

const VerifyOTPPage = () => {
    return (
        <>
            <section className="pt-30!">
                <div className="p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
                    <VerifyOTP />
                </div>
            </section>
        </>
    );
};

export default VerifyOTPPage;
