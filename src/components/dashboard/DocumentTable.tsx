import { Button } from 'antd';
import { ArrowRight } from 'lucide-react';
import DocumentRow from './DocumentRow';
import { DocumentItem } from '@/types/dashboard';

export default function DocumentTable({ documents }: { documents: DocumentItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[15px] font-semibold" style={{ color: '#1C1C1E' }}>Recent Documents</h2>
        <Button
          type="link"
          className="flex items-center gap-1.5 p-0! text-[13px] font-medium"
          style={{ color: '#185C4D' }}
        >
          View All <ArrowRight size={14} />
        </Button>
      </div>

      {/* Level 1 Glass wrapper */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-3 sm:p-5 rounded-[28px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] overflow-x-auto">
        <div className="min-w-[700px]">

          {/* Header */}
          <div
            className="grid grid-cols-12 gap-3 py-3.5 px-5 rounded-[14px] mb-3 text-[12px] font-medium tracking-wide text-white"
            style={{ background: 'linear-gradient(90deg, #185C4D 0%, #30836B 100%)' }}
          >
            <div className="col-span-4">Folder Name</div>
            <div className="col-span-2">Document Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Last Modified</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-2.5">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}