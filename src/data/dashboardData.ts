import { StatItem, DocumentItem } from '@/types/dashboard';

export const STATS: StatItem[] = [
  {
    label: 'Total Folders',
    value: '1,248',
    badge: { status: 'success', text: '+12%' },
    iconName: 'folder',
    iconBg: 'bg-[#185C4D]/10',
    iconColor: 'text-[#185C4D]',
  },
  {
    label: 'Active Konos',
    value: '342',
    badge: { status: 'warning', text: 'In Use' },
    iconName: 'inbox',
    iconBg: 'bg-[#FDF0D5]/80',
    iconColor: 'text-[#9B7016]',
  },
  {
    label: 'Pending Destruction',
    value: '56',
    badge: { status: 'danger', text: 'Action Needed' },
    iconName: 'archive',
    iconBg: 'bg-[#FCE4E4]/80',
    iconColor: 'text-[#B83131]',
  },
];

export const DOCUMENTS: DocumentItem[] = [
  { id: 1, name: 'Q1 Financial Reports 2026',   type: 'Accounting', status: 'success', statusText: 'Active',         date: '2 hours ago', isLocked: false },
  { id: 2, name: 'Employee Contracts - IT Dept', type: 'HR',         status: 'danger',  statusText: 'Restricted',    date: '5 hours ago', isLocked: true  },
  { id: 3, name: 'Vendor Invoices May',          type: 'Finance',    status: 'warning', statusText: 'Pending Review', date: '1 day ago',   isLocked: false },
  { id: 4, name: 'Annual Tax Returns 2025',      type: 'Accounting', status: 'success', statusText: 'Active',         date: '2 days ago',  isLocked: false },
];