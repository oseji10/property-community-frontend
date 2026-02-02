import Link from 'next/link';
import { Icon } from '@iconify/react';

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export default function QuickActionCard({
  icon,
  title,
  description,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all group"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition">
        <Icon icon={icon} className="text-3xl text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </Link>
  );
}