'use client';

import { Card, Tooltip } from 'antd';
import { Lock } from 'lucide-react';
import { Folder } from '@/types/prisma-mapped';

interface KonoCardProps {
  folder: Folder;
  onClick?: () => void;
}

export default function KonoCard({ folder, onClick }: KonoCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border-none shadow-sm rounded-xl overflow-hidden cursor-pointer"
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-textMain">{folder.name}</h3>
        {(folder as any).isLocked && (
          <Tooltip title={`Locked: In use by ${(folder as any).lockedBy}`} color="#333333">
            <Lock className="w-4 h-4 text-textMuted" />
          </Tooltip>
        )}
      </div>
      <p className="text-sm text-textMuted mt-2">ID: {folder.id}</p>
    </Card>
  );
}
