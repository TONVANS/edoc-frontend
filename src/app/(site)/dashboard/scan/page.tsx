import QRScannerView from '@/components/views/storage/QRScannerView';

export const metadata = {
  title: 'Scan QR | E-Document Management',
  description: 'Scan document and Kono QR codes.',
};

export default function ScanQRPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
      <QRScannerView />
    </div>
  );
}
