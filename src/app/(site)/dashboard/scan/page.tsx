import ScanPageClient from './ScanPageClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Scan QR | E-Document Management',
  description: 'Scan document and Kono QR codes.',
};

export default function ScanQRPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
      <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#185C4D]" /></div>}>
        <ScanPageClient />
      </Suspense>
    </div>
  );
}
