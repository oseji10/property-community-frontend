import { Icon } from '@iconify/react';

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  color: string;
}

export default function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Icon icon={icon} className={`text-3xl ${color}`} />
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{title}</p>
    </div>
  );
}