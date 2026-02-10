import { Metadata } from 'next';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import AddNewProperty from '../components/AddNewProperty';


export const metadata: Metadata = {
  title: 'User Dashboard | Property Plus Africa',
};

export default async function UserDashboard() {
 
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
             <AddNewProperty />
            </div>

            {/* Your original form + image card */}
            
          </div>
        </main>
        <Footer/>
      </div>
    </div>
  );
}