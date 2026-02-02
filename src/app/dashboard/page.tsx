import { Metadata } from 'next';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import WelcomeHeader from './components/WelcomeHeader';
import FavoritePropertiesSection from './components/FavouriteProperties';
import UpcomingViewingsSection from './components/UpcomingViewingSection';
import QuickActionsGrid from './components/QuickActionsGrid';

export const metadata: Metadata = {
  title: 'User Dashboard | Property Community',
};

export default function UserDashboard() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        {/* <TopNav title="Contact / Inquiries" /> */}

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero / Title section */}
            <div className="mb-10">
              {/* <div className="flex gap-2.5 items-center mb-4">
                <Icon
                  icon="ph:envelope-simple-fill"
                  width={24}
                  height={24}
                  className="text-primary"
                />
                <p className="text-lg font-semibold text-primary">Contact Messages</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Manage incoming inquiries
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Review and respond to user questions, property requests and support messages.
              </p> */}
              <WelcomeHeader userName="John Doe" />
            <QuickActionsGrid />
              <FavoritePropertiesSection />
            {/* <UpcomingViewingsSection /> */}
            </div>

            {/* Your original form + image card */}
            
          </div>
        </main>
        <Footer/>
      </div>
    </div>
  );
}