"use client";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import SocialSignIn from "../SocialSignIn";
import toast, { Toaster } from 'react-hot-toast';
import AuthDialogContext from "@/app/context/AuthDialogContext";
import Logo from "@/components/Layout/Header2/BrandLogo/Logo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Icon } from "@iconify/react";

const Signin = ({ signInOpen }: { signInOpen?: any }) => {
  const { data: session } = useSession();
  const [email, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const authDialog = useContext(AuthDialogContext);

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // const handleSubmit = async (e: any) => {
  //   const notify = () => toast('Here is your toast.');
  //   e.preventDefault();
  //   const result = await signIn("credentials", {
  //     redirect: false,
  //     email,
  //     password,
  //   });
  //   if (result?.error) {
  //     setError(result.error);
  //   }
  //   if (result?.status === 200) {
  //     setTimeout(() => {
  //       signInOpen(false);
  //     }, 1200);
  //     authDialog?.setIsSuccessDialogOpen(true);
  //     setTimeout(() => {
  //       authDialog?.setIsSuccessDialogOpen(false);
  //     }, 1100);
  //   } else {
  //     authDialog?.setIsFailedDialogOpen(true);
  //     setTimeout(() => {
  //       authDialog?.setIsFailedDialogOpen(false);
  //     }, 1100);
  //   }
  // };


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.requiresEmailVerification) {
      localStorage.setItem("pending_user_email", data.email);
      router.push("/auth/verify-email");
      return;
    }

    if (data.requiresPasswordSetup) {
      localStorage.setItem("pending_user_email", data.email);
      router.push("/auth/setup-password");
      return;
    }

    if (data.requiresPassword) {
      localStorage.setItem("pending_user_email", formData.username);
      router.push("/auth/enter-password");
      return;
    }

    if (data.status) {
      router.push("/dashboard");
    } else {
      setError(data.message || "Login failed");
    }
  } catch {
    setError("Network error");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
        <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary font-medium hover:underline hover:cursor-pointer"
      >
        <Icon icon="akar-icons:arrow-left" width={20} height={20} />
        Back to Homepage
      </Link>
      <div className="mb-2 text-center flex justify-center">
        <Logo />
      </div>
        <h1 className="mb-6 text-center text-2xl font-semibold pb-0">Welcome Back!</h1>
    <p className="text-center pt-0">Sign in to continue</p>
      {/* <SocialSignIn /> */}

      {/* <span className="z-1 relative my-8 block text-center">
        <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-black/10 dark:bg-white/20"></span>
        <span className="text-body-secondary relative z-10 inline-block bg-white px-3 text-base dark:bg-black">
          OR
          </span>
      </span> */}
        
        {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-[22px]">
          <br/>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email or Phone Number</label>
          <input
            type="text"
            placeholder="Email or Phone Number"
            required
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full rounded-2xl border placeholder:text-gray-400 border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition  focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div>
        {/* <div className="mb-[22px]">
          <input
            type="password"
            required
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition  focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div> */}
        <div className="mb-9">
          {/* <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-primary bg-primary hover:bg-transparent hover:text-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out "
          >
            Next
          </button> */}

           <button
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading} 
                  className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-primary bg-primary hover:bg-transparent hover:text-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out "
                >
                  {isLoading ? "Checking..." : "Next"}
                  {isLoading && <FontAwesomeIcon icon={faSpinner} className="mr-1 w-4 h-5 sm:w-4 sm:h-4 animate-spin" />}
                </button>

        </div>
      </form>

      <div className="text-center">
        <Link
          href="/"
          className="mb-2 text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forget Password?
        </Link>
      </div>
      <p className="text-body-secondary text-base text-center">
        Not a member yet?{" "}
        <Link href="/auth/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default Signin;