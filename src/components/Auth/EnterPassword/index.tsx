"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header2/BrandLogo/Logo";
import api from "@/app/lib/api";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";

export default function EnterPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    password: '',
  });


  useEffect(() => {
  const email = localStorage.getItem("pending_user_email");
  if (!email) {
    router.push("/auth/signin");
    return; 
  }

  setUserEmail(email);           
}, [router]);                    


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

 
  
  useEffect(() => {
    const storedEmail = localStorage.getItem("pending_user_email");
    if (!storedEmail) {
      router.push("/auth/signin");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: email, password: formData.password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("pending_user_email");
        
                      const userData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          role: data.role,

          // id: data.id,
        };
        // const tenantId = {data.tenantId;
        localStorage.setItem("user", JSON.stringify(userData));
       
//        const roleRedirectMap: Record<string, string> = {
//   ADMIN: "/admin-dashboard",
//   AGENT: "/agent-dashboard",
//   OWNER: "/agent-dashboard",
//   user: "/user-dashboard",
// };

// router.push(roleRedirectMap[data.role] ?? "/auth/signin");


        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* <ArrowPathIcon className="w-12 h-12 animate-spin text-brand-500 mx-auto" /> */}
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    {/* // <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4"> */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary font-medium hover:underline hover:cursor-pointer"
      >
        <Icon icon="akar-icons:arrow-left" width={20} height={20} />
        Back to Homepage
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-dark dark:text-white">
          Enter Password To Continue
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create a secure password for <strong>{userEmail}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <br/>
          <div>
            <label className="block mb-2 text-base text-dark dark:text-white">
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                name="password"
                required
                minLength={8}
                placeholder="Enter new password"
                className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary dark:text-white dark:focus:border-primary pr-10"
              />
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showPassword ? (
                    // <EyeSlashIcon className="w-5 h-5" />
                    <FontAwesomeIcon icon={faEyeSlash} className="text-gray-500 dark:text-gray-400"/>
                  ) : (
                    // <EyeIcon className="w-5 h-5" />
                    <FontAwesomeIcon icon={faEye} className="text-gray-500 dark:text-gray-400"/>
                  )}
                </button>
            </div>
            

          </div>
        

          <button
            type="submit"
            disabled={isLoading || !formData.password}
            className="w-full py-3 px-4 bg-primary text-white rounded-md font-medium hover:bg-darkprimary transition duration-300 disabled:opacity-50 hover:cursor-pointer"
          >
            {isLoading ? "Signing you in..." : "Sign In"}
            {isLoading && <FontAwesomeIcon icon={faSpinner} className="mr-1 w-4 h-5 sm:w-4 sm:h-4 animate-spin" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      </>
    
  );
}