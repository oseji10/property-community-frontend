import { Icon } from '@iconify/react';
import StatCard from './StatCard';

interface WelcomeHeaderProps {
  userName: string;
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <>
    
    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
      Welcome back, {userName}!
    </h1>

    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Here's what's happening with your properties and activity.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon="ph:heart-fill"
        title="Saved Properties"
        value="24"
        color="text-rose-500"
      />
      <StatCard
        icon="ph:envelope-simple-open-fill"
        title="Inquiries Sent"
        value="8"
        color="text-blue-500"
      />
      <StatCard
        icon="ph:eye-fill"
        title="Property Views"
        value="1,240"
        color="text-green-500"
      />
      <StatCard
        icon="ph:calendar-check-fill"
        title="Upcoming Viewings"
        value="3"
        color="text-amber-500"
      />
    </div>
  {/* // </section> */}
    </>
    // <section className="mb-1 pt-0 !important"> {/* Changed from mb-4 to mb-8 for consistent spacing */}
  );
}