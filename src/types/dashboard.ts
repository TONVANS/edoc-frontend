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