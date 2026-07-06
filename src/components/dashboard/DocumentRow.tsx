import { Folder, Lock, Printer } from 'lucide-react';
import { Button, Tooltip } from 'antd';
import StatusBadge from './StatusBadge';
import { DocumentItem } from '@/types/dashboard';

export default function DocumentRow({ doc }: { doc: DocumentItem }) {
  return (
    <div className="group grid grid-cols-12 gap-3 items-center py-3.5 px-5 rounded-[14px] bg-white/60 backdrop-blur-lg border border-white/80 shadow-sm transition-all duration-300 cursor-pointer hover:bg-white/85 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
      <div className="col-span-4 flex items-center gap-2.5 min-w-0">
        <Folder size={16} className="shrink-0" style={{ color: '#737373' }} />
        <span className="font-medium text-[13px] truncate" style={{ color: '#1C1C1E' }}>{doc.name}</span>
        {doc.isLocked && (
          <Tooltip title="Locked: In use by HR Team" placement="top">
            <Lock size={13} className="shrink-0 cursor-help" style={{ color: '#737373' }} />
          </Tooltip>
        )}
      </div>

      <div className="col-span-2 text-[12.5px] font-medium" style={{ color: '#737373' }}>{doc.type}</div>

      <div className="col-span-2">
        <StatusBadge status={doc.status}>{doc.statusText}</StatusBadge>
      </div>

      <div className="col-span-2 text-[12.5px]" style={{ color: '#1C1C1E' }}>{doc.date}</div>

      <div className="col-span-2 flex justify-end">
        <Button
          type="primary"
          size="small"
          icon={<Printer size={13} />}
          className="rounded-[8px]! h-8! text-[12px]! font-medium! transition-transform group-hover:scale-105"
          style={{ backgroundColor: '#185C4D', borderColor: '#185C4D' }}
        >
          Print QR
        </Button>
      </div>
    </div>
  );
}