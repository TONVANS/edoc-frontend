import TrackingLogView from '@/components/views/tracking/TrackingLogView';

export const metadata = {
  title: 'Tracking & Logs | E-Document Management',
  description: 'Monitor document movements and history.',
};

export default function TrackingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
      <TrackingLogView />
    </div>
  );
}
