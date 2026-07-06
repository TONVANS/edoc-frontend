import DocumentListView from '@/components/views/documents/DocumentListView';
import { Suspense } from 'react';

export const metadata = {
  title: 'Restricted Documents | E-Document Management',
  description: 'Manage restricted and confidential documents.',
};

export default function RestrictedDocumentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
      <div className="mb-4 text-sm font-medium text-[#B83131] bg-[#FCE4E4]/50 border border-[#F8CACA] p-3 rounded-xl backdrop-blur-sm">
        You are viewing restricted documents. Access is audited and monitored.
      </div>
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
