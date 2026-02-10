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
import { getUserName } from '../lib/auth';
import DashboardHeader from './components/MobileDashboardHeader';

export const metadata: Metadata = {
  title: 'User Dashboard | Property Plus Africa',
};


export default async function UserDashboard() {
  const fullName = await getUserName();           // ← await it!
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardHeader/>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav title='USER DASHBOARD' />
        
        {/* <TopNav title="Contact / Inquiries" /> */}

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero / Title section */}
            <div className="mb-10">
              
              <WelcomeHeader userName={fullName ?? 'User'}/>
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