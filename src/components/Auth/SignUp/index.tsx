"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useContext, useEffect, useState } from "react";
import AuthDialogContext from "@/app/context/AuthDialogContext";
import Logo from "@/components/Layout/Header2/BrandLogo/Logo";
import api from "@/app/lib/api";

interface Role {
  roleId: string | number;
  roleName: string;
  // add other fields if your /roles returns more
}

const SignUp = ({ signUpOpen }: { signUpOpen?: (open: boolean) => void }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const authDialog = useContext(AuthDialogContext);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: ""
  });

  // Fetch roles
  useEffect(() => {
    setRolesLoading(true);

    api
      .get("/roles") // ← no second argument needed for simple GET
      .then((res) => {
        const data = res.data; // axios gives you .data
        const roleList = Array.isArray(data) ? data : [];
        setRoles(roleList);

        if (roleList.length > 0) {
          setSelectedRole(roleList[0].id?.toString() || roleList[0].name || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load roles:", err);
        toast.error("Could not load signup types");
      })
      .finally(() => {
        setRolesLoading(false);
      });
  }, []);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert("Your name is required!");
      // or set error state
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required!");
      // or set error state
      return;
    }

    if (!formData.phoneNumber.trim()) {
      alert("Phone number is required!");
      // or set error state
      return;
    }

    setIsLoading(true);

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setUserEmail(formData.email);
        if (response.ok) {
          localStorage.setItem("pending_user_email", formData.email);
          router.push("/auth/verify-email");
        }
        setSuccess("Sign up successful! Please verify your email.");
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          role: ""
        });
      } else {
        // alert(data.message || "Sign up failed. Please check your details.");
        setError(data.message || "Sign up failed. Please check your details.");
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>

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

      {/* <SocialSignUp /> */}
      {/* <div className="relative my-8 text-center">… OR …</div> */}
      <h1 className="mb-6 text-center text-2xl font-semibold">Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-[22px]">
          {/* <input
            type="text"
            placeholder="Name"
            name="name"
            required
            className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary dark:text-white dark:focus:border-primary"
          /> */}
          <label>
            Your Name<span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="mb-[22px]">
          <label>
            Email<span className="text-error-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            name="email"
            required
            className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="mb-[22px]">
          <label>
            Phone Number<span className="text-error-500">*</span>
          </label>
          <input
            type="tel" // ← semantically correct for phones
            placeholder="Phone number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10,15}" // basic client-side validation (adjust length)
            inputMode="numeric" // shows numeric keyboard on mobile
            autoComplete="tel" // helps browser autofill
            className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary dark:text-white dark:focus:border-primary"
            onKeyPress={(e) => {
              // Allow only digits, +, -, (, ), space
              const allowed = /[0-9+\-\s()]/;
              if (!allowed.test(e.key)) {
                e.preventDefault();
              }
            }}
            // Optional: format as user types (very common for UX)
            onInput={(e) => {
              // Remove anything that's not digit / + / - / space / ( )
              const value = e.currentTarget.value.replace(/[^0-9+\-\s()]/g, "");
              e.currentTarget.value = value;
            }}
          />
        </div>
        {/* </div> */}

        <div className="mb-[22px]">
          <label className="mb-2 block text-base text-dark dark:text-white">
            Signup Type
          </label>
          {rolesLoading ? (
            <div className="text-gray-500">Loading types...</div>
          ) : roles.length === 0 ? (
            <div className="text-red-500">No signup types available</div>
          ) : (
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
              className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:text-white dark:focus:border-primary appearance-none"
              style={{ backgroundColor: "transparent" }}
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
        </div>

        <div className="mb-9">
          <button
            type="submit"
            disabled={isLoading || rolesLoading || !selectedRole}
            className="flex w-full cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:!bg-darkprimary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            { isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </div>
      </form>

      <p className="text-center mb-4 text-base">
        By creating an account you agree with our{" "}
        <Link href="/" className="text-primary hover:underline">
          Privacy
        </Link>{" "}
        and{" "}
        <Link href="/" className="text-primary hover:underline">
          Policy
        </Link>
      </p>

      <p className="text-center text-base">
        Already have an account?{" "}
        <Link href="/auth/signin" className="pl-2 text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignUp;
