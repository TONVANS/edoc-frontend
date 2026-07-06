import DocumentListView from '@/components/views/documents/DocumentListView';
import { Suspense } from 'react';

export const metadata = {
  title: 'Documents | E-Document Management',
  description: 'Manage and track your electronic and physical documents.',
};

export default function DocumentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full font-lao">
      <Suspense fallback={
        <div className="flex justify-center items-center py-20 min-h-screen">
          <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
        </div>
      }>
        <DocumentListView />
      </Suspense>
    </div>
  );
}
