import React from 'react';
import DocumentExpiredTable from '@/components/views/document-expired/DocumentExpiredTable';

export const metadata = {
  title: 'Expired Documents | E-Document Management',
  description: 'Manage expired documents',
};

export default function DocumentExpiredPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
      <DocumentExpiredTable />
    </div>
  );
}
