import Link from "next/link";
import { Icon } from "@iconify/react"
import { FooterLinks } from "@/app/api/footerlinks";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900  border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto max-w-8xl px-8 py-4">
        
     
        <div className="flex justify-between md:flex-nowrap flex-wrap items-center py-4 gap-6">
          <p className="text-dark dark:text-white text-sm text-center md:text-center justify-center w-full">
            ©2026 Property Community - Site Developed by <Link href="https://resilience.ng/" className="hover:text-primary" target="_blank">Resilience Nigeria</Link>
          </p>
          
        </div>
      </div>
    </footer >
  );
};

export default Footer;