export interface Voucher {
  id: string; // The physical document ID (Voucher Number)
  konoId: string;
  createdAt: string;
  status: 'STRICT_RETENTION' | 'HOLD_CONTRACT' | 'DESTROYABLE';
}

export interface HierarchyNode {
  id: string;
  name: string;
  parentId?: string | null;
  children?: HierarchyNode[];
}
