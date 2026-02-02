import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function UpcomingViewingsSection() {
  const viewings = [
    { time: 'Today, 2:30 PM', property: 'Luxury 4-Bed in Ikoyi' },
    { time: 'Tomorrow, 11:00 AM', property: 'Beachfront Condo in Eko Atlantic' },
    { time: 'Feb 5, 4:00 PM', property: '3-Bed Penthouse in Victoria Island' },
  ];

  return (
    <>
    
    {/* <section className="mt-8"> Added top margin instead of using pt-0 */}
      <div className="flex items-center justify-between mb-4 mt-8"> {/* Simplified classes */}
        <h2 className="text-2xl font-semibold">Upcoming Viewings</h2>
        <Link
          href="/appointments"
          className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
        >
          Manage <Icon icon="ph:arrow-right" />
        </Link>
      </div>

      <div className="space-y-4">
        {viewings.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition"
          >
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl">
              <Icon icon="ph:calendar-blank" />
            </div>
            <div>
              <p className="font-medium">{item.property}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    {/* </section> */}
    </>
  );
}