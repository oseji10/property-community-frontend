import SignUp from "@/components/Auth/SignUp";
import { Metadata } from "next";
import SignUpPage from "../signup/page";
import SetupPassword from "@/components/Auth/SetupPassword/page";

export const metadata: Metadata = {
    title:
        "Setup Password | Property Community",
};

const SetupPasswordPage = () => {
    return (
        <>
            <section className="pt-30!">
                <div className="p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
                    <SetupPassword />
                </div>
            </section>
        </>
    );
};

export default SetupPasswordPage;
