"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useContext, useEffect, useState } from "react";
import AuthDialogContext from "@/app/context/AuthDialogContext";
import Logo from "@/components/Layout/Header2/BrandLogo/Logo";
import api from "@/app/lib/api";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Role {
  roleId: string | number;
  roleName: string;
}

interface FieldErrors {
  fullName?: string[];
  email?: string[];
  phoneNumber?: string[];
  role?: string[];
  [key: string]: string[] | undefined;
}

const SignUp = ({ signUpOpen }: { signUpOpen?: (open: boolean) => void }) => {
  const router = useRouter();
  const authDialog = useContext(AuthDialogContext);

  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Fetch roles
  useEffect(() => {
    setRolesLoading(true);
    api
      .get("/roles")
      .then((res) => {
        const data = res.data ?? [];
        const roleList = Array.isArray(data) ? data : [];
        setRoles(roleList);

        if (roleList.length > 0) {
          setSelectedRole(roleList[0].roleId?.toString() || "");
          setFormData((prev) => ({ ...prev, role: roleList[0].roleId?.toString() || "" }));
        }
      })
      .catch((err) => {
        console.error("Failed to load roles:", err);
        toast.error("Could not load signup types");
      })
      .finally(() => setRolesLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setGeneralError("");
    setFieldErrors({});
    setSuccessMessage("");

    if (!selectedRole) {
      setGeneralError("Please select a signup type");
      return;
    }

    setLoading(true);

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      role: selectedRole,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        setSuccessMessage("Sign up successful! Please verify your email.");
        localStorage.setItem("pending_user_email", formData.email);
        // Most apps redirect here — keeping both for flexibility
        router.push("/auth/verify-email");
        // You can remove the line below if you always want to redirect
        // setFormData({ fullName: "", email: "", phoneNumber: "", role: "" });
      } else {
        // ── Handle different error shapes ──
        if (data?.status === "error" && data?.errors && typeof data.errors === "object") {
          // Laravel-like validation errors
          setFieldErrors(data.errors as FieldErrors);

          // Show first general message if no field errors are visible
          if (Object.keys(data.errors).length === 0 && data.message) {
            setGeneralError(data.message);
          }
        } else if (data?.message) {
          setGeneralError(data.message);
        } else {
          setGeneralError("Sign up failed. Please try again.");
        }

        toast.error("Please correct the errors above");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setGeneralError("Network error. Please check your connection.");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: keyof FieldErrors) =>
    fieldErrors[field]?.[0] || undefined;

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>

      {generalError && (
        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          {generalError}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <h1 className="mb-6 text-center text-2xl font-semibold">Sign Up</h1>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="mb-6">
          <label className="mb-2 block text-base text-dark dark:text-white">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className={`w-full rounded-md border px-5 py-3 text-base outline-none transition ${
              getFieldError("fullName")
                ? "border-red-500 focus:border-red-500"
                : "border-black/10 dark:border-white/20 focus:border-primary"
            } bg-transparent dark:text-white placeholder:text-gray-300`}
          />
          {getFieldError("fullName") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("fullName")}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="mb-2 block text-base text-dark dark:text-white">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="yourname@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full rounded-md border px-5 py-3 text-base outline-none transition ${
              getFieldError("email")
                ? "border-red-500 focus:border-red-500"
                : "border-black/10 dark:border-white/20 focus:border-primary"
            } bg-transparent dark:text-white placeholder:text-gray-300`}
          />
          {getFieldError("email") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("email")}</p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="mb-2 block text-base text-dark dark:text-white">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="+234 000 000 0000"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9+\-\s()]{8,15}"
            inputMode="numeric"
            autoComplete="tel"
            className={`w-full rounded-md border px-5 py-3 text-base outline-none transition ${
              getFieldError("phoneNumber")
                ? "border-red-500 focus:border-red-500"
                : "border-black/10 dark:border-white/20 focus:border-primary"
            } bg-transparent dark:text-white placeholder:text-gray-300`}
          />
          {getFieldError("phoneNumber") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("phoneNumber")}</p>
          )}
        </div>

        {/* Role / Signup Type */}
        <div className="mb-6">
          <label className="mb-2 block text-base text-dark dark:text-white">
            Signup Type <span className="text-red-500">*</span>
          </label>
          {rolesLoading ? (
            <div className="py-3 text-gray-500">Loading types...</div>
          ) : roles.length === 0 ? (
            <div className="py-3 text-red-600">No signup types available</div>
          ) : (
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setFormData((prev) => ({ ...prev, role: e.target.value }));
              }}
              required
              className={`w-full rounded-md border px-5 py-3 text-base outline-none transition appearance-none ${
                getFieldError("role")
                  ? "border-red-500 focus:border-red-500"
                  : "border-black/10 dark:border-white/20 focus:border-primary"
              } bg-transparent dark:text-white`}
            >
              <option value="" disabled>
                Select signup type
              </option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
          )}
          {getFieldError("role") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("role")}</p>
          )}
        </div>

        <div className="mb-8">
          <button
            type="submit"
            disabled={loading || rolesLoading || !selectedRole}
            className="flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-darkprimary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                Creating account...
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="ml-3 h-4 w-4 animate-spin"
                />
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
      </form>

      <p className="text-center text-base mb-4">
        By creating an account you agree with our{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>

      <p className="text-center text-base">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignUp;