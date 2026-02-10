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

export default function SetupPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });


  useEffect(() => {
  const email = localStorage.getItem("pending_user_email");
  if (!email) {
    router.push("/signin");
    return; // ← good practice
  }

  setUserEmail(email);           // ← this line was missing!
}, [router]);                    // ← router is stable, but it's fine to include


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const passwordStrength = () => {
    if (formData.password.length === 0) return '';
    if (formData.password.length < 6) return 'weak';
    if (formData.password.length < 8) return 'medium';
    return 'strong';
  };

  // Password strength criteria (shown in real-time)
//   const [strength, setStrength] = useState({
//     length: false,
//     number: false,
//     special: false,
//     uppercase: false,
//   });

//   useEffect(() => {
//     const checks = {
//       length: password.length >= 8,
//       number: /[0-9]/.test(password),
//       special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
//       uppercase: /[A-Z]/.test(password),
//     };
//     setStrength(checks);
//   }, [password]);

//   const isStrong = Object.values(strength).every(Boolean);

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Set password
      const setupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/setup-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        }),
      });

      const setupData = await setupResponse.json().catch(() => ({}));

      if (!setupResponse.ok || setupData.status !== 'success') {
        setError(setupData.message || 'Failed to set password');
        setIsLoading(false);
        return;
      }

      setSuccess('Password set successfully! Logging you in...');

      // Step 2: Auto-login
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // For setting JWT cookies
        body: JSON.stringify({
          username: userEmail,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json().catch(() => ({}));

      if (loginResponse.ok) {
        // Store user data (adjust based on your actual response)
        const userData = {
          email: loginData.email, // If your backend returns token in body
          firstName: loginData.firstName,
          lastName: loginData.lastName,
          phoneNumber: loginData.phoneNumber,
          role: loginData.role,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('pending_user_email');
        // localStorage.setItem("currentTenantId", String(loginData.tenantId)); // ✅

        setSuccess('Setup successful! Login you in and redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setError(loginData.message || 'Auto-login failed. Please sign in manually.');
        localStorage.removeItem('pending_user_email');
        setTimeout(() => router.push('/auth/signin'), 2500);
      }
    } catch (err) {
      console.error('Password setup error:', err);
      setError('Network error. Please try again.');
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
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-dark dark:text-white">
          Set Your Password
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create a secure password for <strong>{userEmail}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <br/>
          <div>
            <label className="block mb-2 text-base text-dark dark:text-white">
              New Password
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
            {formData.password && (
                <div className="mt-2 text-sm">
                  <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-400">
                    <span>Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength() === 'weak' ? 'text-error-500' :
                      passwordStrength() === 'medium' ? 'text-yellow-500' :
                      passwordStrength() === 'strong' ? 'text-success-500' : ''
                    }`}>
                      {passwordStrength() ? passwordStrength().charAt(0).toUpperCase() + passwordStrength().slice(1) : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength() === 'weak' ? 'w-1/3 bg-error-500' :
                      passwordStrength() === 'medium' ? 'w-2/3 bg-yellow-500' :
                      passwordStrength() === 'strong' ? 'w-full bg-green-500' : 'w-0'
                    }`} />
                  </div>
                </div>
              )}
          

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-base text-dark dark:text-white">
              Confirm Password
            </label>
            <div className="relative">
               <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary dark:text-white dark:focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showConfirmPassword ? (
                    // <EyeSlashIcon className="w-5 h-5" />
                    <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5" />
                  ) : (
                    // <EyeIcon className="w-5 h-5" />
                    <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                  )}
                </button>
              </div>

              {formData.confirmPassword && (
                <p className={`mt-2 text-sm ${
                  formData.password === formData.confirmPassword
                    ? 'text-success-500'
                    : 'text-error-500'
                }`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>

        

          <button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword}
            className="w-full py-3 px-4 bg-primary text-white rounded-md font-medium hover:bg-darkprimary transition duration-300 disabled:opacity-50 hover:cursor-pointer"
          >
            {isLoading ? "Setting password..." : "Set Password & Continue"}
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