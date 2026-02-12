import QuickActionCard from './QuickActionCard';

export default function QuickActionsGrid() {
  return (
    <>
    {/* <section className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 mt-8">

      <QuickActionCard
        icon="ph:house-simple-fill"
        title="Your Properties"
        description="Find your next dream home"
        href="/dashboard/properties"
      />
      <QuickActionCard
        icon="ph:plus-circle-fill"
        title="List Your Property"
        description="Sell or rent with ease"
        href="/dashboard/add-new-property"
      />
      <QuickActionCard
        icon="ph:chat-teardrop-text-fill"
        title="Messages & Inquiries"
        description="Check responses from agents"
        href="/dashboard/messages"
      />

    </div>
    {/* </section> */}
    
    </>
  );
}