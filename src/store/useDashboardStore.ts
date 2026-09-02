// src/store/useDashboardStore.ts
import { create } from 'zustand';
import api from '@/lib/api';
import { DashboardStatsData, DashboardStatsResponse } from '@/types/dashboard';

export const initialDashboardStats: DashboardStatsData = {
  summary: {
    warehouses: 0,
    lockers: 0,
    shelves: 0,
    folders: 0,
    documentTypes: 0,
    documents: 0,
    borrows: {
      total: 0,
      active: 0,
      returned: 0,
    },
  },
  borrowAlerts: {
    overdueCount: 0,
    upcomingDueCount: 0,
  },
  retentionStatus: {
    activeCount: 0,
    expiredCount: 0,
    contractBoundCount: 0,
  },
  storageCapacity: {
    totalCapacity: 0,
    usedCapacity: 0,
    usagePercentage: 0,
  },
  documentsByDepartment: [],
  documentsByDocumentType: [],
  documentsByDivision: [],
  monthlyGrowth: [],
};

interface FetchStatsParams {
  departmentId?: string | number | null;
}

interface DashboardStoreState {
  stats: DashboardStatsData;
  isLoading: boolean;
  isInitialLoaded: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  selectedDepartmentId: string | number | null;

  // Actions
  fetchStats: (params?: FetchStatsParams) => Promise<void>;
  setSelectedDepartmentId: (departmentId: string | number | null) => void;
}

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  stats: initialDashboardStats,
  isLoading: false,
  isInitialLoaded: false,
  error: null,
  lastFetchedAt: null,
  selectedDepartmentId: null,

  setSelectedDepartmentId: (departmentId) => {
    set({ selectedDepartmentId: departmentId });
  },

  fetchStats: async (params) => {
    set({ isLoading: true, error: null });

    const deptId = params?.departmentId !== undefined ? params.departmentId : get().selectedDepartmentId;
    if (params?.departmentId !== undefined) {
      set({ selectedDepartmentId: params.departmentId });
    }

    try {
      const queryParams: Record<string, any> = {};
      if (deptId && deptId !== 'ALL' && deptId !== '') {
        queryParams.departmentId = deptId;
      }

      const response = await api.get<DashboardStatsResponse>('/dashboard/stats', {
        params: queryParams,
      });

      // Support both { message: "Success", data: { ... } } and direct object response
      const resData = (response.data && (response.data as any).data) ? (response.data as any).data : response.data;

      if (resData && typeof resData === 'object' && resData.summary) {
        set({
          stats: {
            summary: {
              warehouses: Number(resData.summary?.warehouses ?? 0),
              lockers: Number(resData.summary?.lockers ?? 0),
              shelves: Number(resData.summary?.shelves ?? 0),
              folders: Number(resData.summary?.folders ?? 0),
              documentTypes: Number(resData.summary?.documentTypes ?? 0),
              documents: Number(resData.summary?.documents ?? 0),
              borrows: {
                total: Number(resData.summary?.borrows?.total ?? 0),
                active: Number(resData.summary?.borrows?.active ?? 0),
                returned: Number(resData.summary?.borrows?.returned ?? 0),
              },
            },
            borrowAlerts: {
              overdueCount: Number(resData.borrowAlerts?.overdueCount ?? 0),
              upcomingDueCount: Number(resData.borrowAlerts?.upcomingDueCount ?? 0),
            },
            retentionStatus: {
              activeCount: Number(resData.retentionStatus?.activeCount ?? 0),
              expiredCount: Number(resData.retentionStatus?.expiredCount ?? 0),
              contractBoundCount: Number(resData.retentionStatus?.contractBoundCount ?? 0),
            },
            storageCapacity: {
              totalCapacity: Number(resData.storageCapacity?.totalCapacity ?? 0),
              usedCapacity: Number(resData.storageCapacity?.usedCapacity ?? 0),
              usagePercentage: Number(resData.storageCapacity?.usagePercentage ?? 0),
            },
            documentsByDepartment: Array.isArray(resData.documentsByDepartment) ? resData.documentsByDepartment : [],
            documentsByDocumentType: Array.isArray(resData.documentsByDocumentType) ? resData.documentsByDocumentType : [],
            documentsByDivision: Array.isArray(resData.documentsByDivision) ? resData.documentsByDivision : [],
            monthlyGrowth: Array.isArray(resData.monthlyGrowth) ? resData.monthlyGrowth : [],
          },
          isLoading: false,
          isInitialLoaded: true,
          lastFetchedAt: new Date(),
        });
      } else {
        set({ isLoading: false, isInitialLoaded: true });
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats from backend:', err);
      set({
        isLoading: false,
        isInitialLoaded: true,
        error: err?.message || 'Failed to fetch dashboard stats from server',
      });
    }
  },
}));
