'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
// import { Metadata } from 'next';
import { FormEvent, useState } from 'react';
import axios from 'axios';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


// export const metadata: Metadata = {
//   title: 'Contact Us | Property Plus Africa',
// };

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);

// const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//   e.preventDefault();

//   setIsSubmitting(true);
//   const form = e.currentTarget;           // ← capture it immediately (sync)

//   const formData = new FormData(form);

//   const payload = {
//     fullname: formData.get('fullname') as string,
//     mobile: formData.get('mobile') as string,
//     email: formData.get('email') as string,
//     message: formData.get('message') as string,
//   };

//   if (
//     !payload.fullname?.trim() ||
//     !payload.email?.trim() ||
//     !payload.mobile?.trim() ||
//     !payload.message?.trim()
//   ) {
//     toast.error('Please fill in all required fields');
//     return;
//   }

//   toast.promise(
//     api.post('/contact', payload, {
//       headers: { 'Content-Type': 'application/json' },
//     }),
//     {
//       loading: 'Sending your message...',

//       success: (response) => {
//         form.reset();                    // ← use the captured reference
//         return response.data?.message || "Thank you! We'll get back to you soon.";
//       },
      

//       error: (err) => {
//         // your existing error handling...
//         if (axios.isAxiosError(err) && err.response) {
//           const data = err.response.data;
//           if (data?.error) {
//             let msg = data.error;
//             if (data.details) {
//               const firstError = Object.values(data.details)?.[0]?.[0];
//               if (firstError) msg += `: ${firstError}`;
//             }
//             return msg;
            
//           }
//           return data?.message || 'Failed to send message. Please try again.';
//         }
//         return 'No connection. Please check your internet and try again.';
//       },
//     },
//     {
//       duration: 3000,
//       position: 'top-right',
//     }
//   );
// };

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setIsSubmitting(true);

  const form = e.currentTarget;
  const formData = new FormData(form);

  const payload = {
    fullname: formData.get('fullname') as string,
    mobile: formData.get('mobile') as string,
    email: formData.get('email') as string,
    message: formData.get('message') as string,
  };

  // Client-side required check
  if (
    !payload.fullname?.trim() ||
    !payload.email?.trim() ||
    !payload.mobile?.trim() ||
    !payload.message?.trim()
  ) {
    toast.error('Please fill in all required fields');
    setIsSubmitting(false);
    return;
  }

  // ────────────────────────────────────────────────
  // Main submission with toast.promise
  // ────────────────────────────────────────────────
  toast.promise(
    api.post('/contact', payload, {
      headers: { 'Content-Type': 'application/json' },
    }),
    {
      loading: 'Sending your message...',

      success: (response) => {
        form.reset();
        return response.data?.message || "Thank you! We'll get back to you soon.";
      },

      error: (err: unknown) => {
        if (axios.isAxiosError(err)) {
          if (err.response?.data?.error) {
            let msg = err.response.data.error as string;

            // Show first validation error if present
            if (err.response.data.details) {
              const firstError = Object.values(err.response.data.details as Record<string, string[]>)[0]?.[0];
              if (firstError) msg += `: ${firstError}`;
            }

            return msg;
          }

          if (err.response?.status === 429) {
            return 'Too many messages. Please try again later.';
          }

          return err.response?.data?.message || 'Failed to send message. Please try again.';
        }

        return 'No connection. Please check your internet.';
      },
    },
    {
      duration: 5000,
      position: 'top-right',
    }
  ).finally(() => {
    // This always runs – success, error or even if cancelled
    setIsSubmitting(false);
  });
};
  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28">
      <div className="mb-16">
        <div className="flex gap-2.5 items-center justify-center mb-3">
          <span>
            <Icon
              icon="ph:house-simple-fill"
              width={20}
              height={20}
              className="text-primary"
            />
          </span>
          <p className="text-base font-semibold text-badge dark:text-white/90">
            Contact us
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14">
            Have questions? ready to help!
          </h3>
          <p className="text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6">
            Looking for your dream home or ready to sell? Our expert team offers
            personalized guidance and market expertise tailored to you.
          </p>
        </div>
      </div>

      <div className="border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-xl dark:shadow-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12">
          <div className="relative w-fit">
            <Image
              src="/images/contactUs/contactUs.jpg"
              alt="Contact us illustration"
              width={497}
              height={535}
              className="rounded-2xl brightness-50 h-full object-cover"
              unoptimized
            />
            <div className="absolute top-6 left-6 lg:top-12 lg:left-12 flex flex-col gap-2">
              <h5 className="text-xl xs:text-2xl mobile:text-3xl font-medium tracking-tight text-white">
                Contact information
              </h5>
              <p className="text-sm xs:text-base mobile:text-lg font-normal text-white/80">
                Ready to find your dream home or sell your property? We’re here to help!
              </p>
            </div>
            <div className="absolute bottom-6 left-6 lg:bottom-12 lg:left-12 flex flex-col gap-4 text-white">
              <Link href="tel:+1212456789" className="w-fit">
                <div className="flex items-center gap-4 group w-fit">
                  <Icon icon="ph:phone" width={32} height={32} />
                  <p className="text-sm xs:text-base mobile:text-lg font-normal group-hover:text-primary">
                    +1-212-456-789
                  </p>
                </div>
              </Link>
              <Link href="mailto:support@propertyplusafrica.com" className="w-fit">
                <div className="flex items-center gap-4 group w-fit">
                  <Icon icon="ph:envelope-simple" width={32} height={32} />
                  <p className="text-sm xs:text-base mobile:text-lg font-normal group-hover:text-primary">
                    support@propertyplusafrica.com
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Icon icon="ph:map-pin" width={32} height={32} />
                <p className="text-sm xs:text-base mobile:text-lg font-normal">
                  Blane Street, Manchester
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Name*"
                    required
                    className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full"
                  />
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Phone number*"
                    required
                    className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full"
                  />
                </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email address*"
                  required
                  className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full"
                />

                <textarea
                  rows={8}
                  name="message"
                  placeholder="Write here your message..."
                  required
                  className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-primary focus:outline resize-y min-h-[140px]"
                />

                {/* Honeypot – hidden from humans, visible to bots */}
                <div style={{ display: 'none' }}>
                  <label htmlFor="my_website_url">
                    Leave this field empty if you're human
                  </label>
                  <input
                    type="text"
                    name="my_website_url"
                    id="my_website_url"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {/* <button
                  type="submit"
                  className="px-8 py-4 rounded-full bg-primary text-white text-base font-semibold w-full sm:w-fit hover:bg-dark transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  Send message
                </button> */}
                
                 <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-full bg-primary text-white text-base font-semibold w-full sm:w-fit hover:bg-dark transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      Sending Message... <FontAwesomeIcon icon={faSpinner} className="ml-2 animate-spin" />
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}