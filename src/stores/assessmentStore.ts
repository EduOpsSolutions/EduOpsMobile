import { create } from 'zustand';
import axiosInstance from '@/src/utils/axios';
import { useAuthStore } from './authStore';

export interface Fee {
  id?: string;
  name: string;
  price: number;
  type: string;
  dueDate?: string;
}

export interface StudentFee {
  id: string;
  name: string;
  amount: number;
  type: 'fee' | 'discount';
  dueDate?: string;
}

export interface Payment {
  paidAt: string;
  amount: number;
  paymentMethod?: string;
  referenceNumber?: string;
  remarks?: string;
  status: string;
}

export interface AssessmentSummary {
  studentId: string;
  name: string;
  courseId: string;
  course: string; // Course name as string (from API)
  batchId: string;
  batch: string; // Batch name as string (from API)
  year: number;
  netAssessment: number;
  totalPayments: number;
  remainingBalance: number;
  studentFees?: StudentFee[];
  startAt?: string; // For sorting enrollments by date
}

export interface AssessmentDetails {
  studentId: string;
  name: string;
  course: {
    id: string;
    name: string;
    price: number;
  };
  batch: {
    id: string;
    batchName: string;
    year: number;
  };
  fees: Fee[];
  studentFees: StudentFee[];
  payments: Payment[];
  courseBasePrice: number;
  netAssessment: number;
  totalPayments: number;
  remainingBalance: number;
  overpayment?: number;
  availableCreditFromOthers?: number;
}

interface AssessmentState {
  assessments: AssessmentSummary[];
  selectedAssessment: AssessmentDetails | null;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;

  // Actions
  fetchStudentAssessments: (studentId?: string) => Promise<void>;
  fetchAssessmentDetails: (
    studentId: string,
    courseId: string,
    academicPeriodId: string
  ) => Promise<void>;
  selectAssessment: (assessment: AssessmentSummary) => void;
  clearSelectedAssessment: () => void;
  clearError: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: [],
  selectedAssessment: null,
  isLoading: false,
  isLoadingDetails: false,
  error: null,

  fetchStudentAssessments: async (studentId?: string) => {
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

      const response = await axiosInstance.get(
        `/assessment/student/${targetStudentId}`
      );

      // The API returns an array of assessment summaries
      const assessmentsData = response.data || [];

      set({
        assessments: assessmentsData,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to load assessments. Please try again.';

      set({
        assessments: [],
        isLoading: false,
        error: errorMessage,
      });

      console.error('Error fetching assessments:', error);
    }
  },

  fetchAssessmentDetails: async (
    studentId: string,
    courseId: string,
    academicPeriodId: string
  ) => {
    set({ isLoadingDetails: true, error: null });

    try {
      const response = await axiosInstance.get(`/assessment/${studentId}`, {
        params: { courseId, academicPeriodId },
      });

      // The API returns detailed assessment data
      const detailsData = response.data || null;

      set({
        selectedAssessment: detailsData,
        isLoadingDetails: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to load assessment details. Please try again.';

      set({
        selectedAssessment: null,
        isLoadingDetails: false,
        error: errorMessage,
      });

      console.error('Error fetching assessment details:', error);
    }
  },

  selectAssessment: async (assessment: AssessmentSummary) => {
    // When selecting an assessment, fetch its details
    await get().fetchAssessmentDetails(
      assessment.studentId,
      assessment.courseId,
      assessment.batchId
    );

    // After fetching details, calculate available credit from previous courses
    const assessments = get().assessments;
    const selectedAssessment = get().selectedAssessment;

    if (!selectedAssessment) return;

    // Sort all enrollments by startAt date
    const sortedEnrollments = [...assessments].sort((a, b) => {
      const dateA = a.startAt ? new Date(a.startAt).getTime() : 0;
      const dateB = b.startAt ? new Date(b.startAt).getTime() : 0;
      return dateA - dateB;
    });

    // Find the current course index
    const currentIndex = sortedEnrollments.findIndex(
      (e) => e.courseId === assessment.courseId && e.batchId === assessment.batchId
    );

    // Calculate available credit by consuming credits progressively
    let runningCredit = 0;
    for (let i = 0; i < currentIndex; i++) {
      const course = sortedEnrollments[i];
      const courseBalance = course.remainingBalance;

      if (courseBalance < 0) {
        // This course has overpayment, add to running credit
        runningCredit += Math.abs(courseBalance);
      } else if (courseBalance > 0) {
        // This course has balance due, consume credit
        runningCredit = Math.max(0, runningCredit - courseBalance);
      }
    }

    // Calculate overpayment for current course
    const currentBalance = selectedAssessment.remainingBalance;
    const overpayment = currentBalance < 0 ? Math.abs(currentBalance) : 0;

    // Update selected assessment with calculated values
    set({
      selectedAssessment: {
        ...selectedAssessment,
        overpayment,
        availableCreditFromOthers: runningCredit,
      },
    });
  },

  clearSelectedAssessment: () => {
    set({ selectedAssessment: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
