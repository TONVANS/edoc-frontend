import DocumentTypeListView from '@/components/views/documents/DocumentTypeListView';

export const metadata = {
  title: 'Document Types | E-Document Management',
  description: 'Manage document types and categories.',
};

export default function DocumentTypesPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto min-h-full">
      <DocumentTypeListView />
    </div>
  );
}
