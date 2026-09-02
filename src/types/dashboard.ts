// src/types/dashboard.ts

export type StatusType = 'success' | 'warning' | 'danger';

export interface StatItem {
  label: string;
  value: string;
  badge: { status: StatusType; text: string };
  iconName: 'folder' | 'inbox' | 'archive';
  iconBg: string;
  iconColor: string;
}

export interface DocumentItem {
  id: number;
  name: string;
  type: string;
  status: StatusType;
  statusText: string;
  date: string;
  isLocked: boolean;
}

// ── GET /dashboard/stats Response Types ──

export interface DashboardBorrowsSummary {
  total: number;
  active: number;
  returned: number;
}

export interface DashboardSummary {
  warehouses: number;
  lockers: number;
  shelves: number;
  folders: number;
  documentTypes: number;
  documents: number;
  borrows: DashboardBorrowsSummary;
}

export interface DashboardBorrowAlerts {
  overdueCount: number;
  upcomingDueCount: number;
}

export interface DashboardRetentionStatus {
  activeCount: number;
  expiredCount: number;
  contractBoundCount: number;
}

export interface DashboardStorageCapacity {
  totalCapacity: number;
  usedCapacity: number;
  usagePercentage: number;
}

export interface DepartmentDocumentStat {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  documentCount: number;
}

export interface DocumentTypeStat {
  documentTypeId: string;
  documentTypeCode: string;
  documentTypeName: string;
  documentCount: number;
}

export interface DivisionDocumentStat {
  divisionId: number;
  divisionCode: string;
  divisionName: string;
  divisionShortName?: string;
  documentCount: number;
}

export interface MonthlyGrowthStat {
  month: string;
  count: number;
}

export interface DashboardStatsData {
  summary: DashboardSummary;
  borrowAlerts: DashboardBorrowAlerts;
  retentionStatus: DashboardRetentionStatus;
  storageCapacity: DashboardStorageCapacity;
  documentsByDepartment: DepartmentDocumentStat[];
  documentsByDocumentType: DocumentTypeStat[];
  documentsByDivision: DivisionDocumentStat[];
  monthlyGrowth: MonthlyGrowthStat[];
}

export interface DashboardStatsResponse {
  message: string;
  data: DashboardStatsData;
}