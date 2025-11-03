import { create } from 'zustand';
import axiosInstance from '@/src/utils/axios';
import { useAuthStore } from './authStore';

export interface LedgerEntry {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: string;
  remarks?: string;
  orNumber?: string;
}

interface LedgerState {
  ledgerEntries: LedgerEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLedger: (studentId?: string) => Promise<void>;
  clearLedger: () => void;
  setError: (error: string | null) => void;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  ledgerEntries: [],
  isLoading: false,
  error: null,

  fetchLedger: async (studentId?: string) => {
    set({ isLoading: true, error: null });

    try {
      // Get the current user's ID if no studentId is provided
      let targetStudentId = studentId;

      if (!targetStudentId) {
        const authUser = useAuthStore.getState().user;
        if (!authUser?.id) {
          throw new Error('User not authenticated');
        }
        targetStudentId = authUser.id;
      }

      const response = await axiosInstance.get(`/ledger/student/${targetStudentId}`);

      // The API returns the ledger data directly as an array
      const ledgerData = response.data.data || response.data || [];

      set({
        ledgerEntries: ledgerData,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to load ledger data. Please try again.';

      set({
        ledgerEntries: [],
        isLoading: false,
        error: errorMessage,
      });

      console.error('Error fetching ledger:', error);
    }
  },

  clearLedger: () => {
    set({
      ledgerEntries: [],
      error: null,
    });
  },

  setError: (error: string | null) => set({ error }),
}));
