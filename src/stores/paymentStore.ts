import { create } from 'zustand';
import axiosInstance from '@/src/utils/axios';

interface FormData {
  student_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  fee: string;
  amount: string;
  courseId: string | null;
  batchId: string | null;
}

interface StudentData {
  id: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface FeeOption {
  value: string;
  label: string;
}

interface PaymentState {
  formData: FormData;
  loading: boolean;
  phoneError: string;
  nameError: string;
  amountError: string;
  studentData: StudentData | null;
  feesOptions: FeeOption[];

  updateFormField: (name: keyof FormData, value: string | null) => void;
  validateAndFetchStudentByID: (studentId: string) => Promise<boolean>;
  resetForm: () => void;
  resetPaymentFields: () => void;
  validateRequiredFields: () => boolean;
  validatePhoneNumber: () => boolean;
  validateDownPaymentAmount: () => boolean;
  preparePaymentData: () => any;
  sendPaymentLinkEmail: (
    paymentData: any
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  setLoading: (loading: boolean) => void;
}

const initialFormData: FormData = {
  student_id: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  email_address: '',
  phone_number: '',
  fee: '',
  amount: '',
  courseId: null,
  batchId: null,
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  formData: { ...initialFormData },
  loading: false,
  phoneError: '',
  nameError: '',
  amountError: '',
  studentData: null,
  feesOptions: [
    { value: 'down_payment', label: 'Down Payment' },
    { value: 'tuition_fee', label: 'Tuition Fee' },
    { value: 'document_fee', label: 'Document Fee' },
    { value: 'book_fee', label: 'Book Fee' },
  ],

  setLoading: (loading: boolean) => set({ loading }),

  updateFormField: (name: keyof FormData, value: string | null) => {
    set((state) => ({
      formData: { ...state.formData, [name]: value },
    }));

    if (
      name === 'first_name' ||
      name === 'last_name' ||
      name === 'student_id'
    ) {
      set({ nameError: '' });
    }

    if (name === 'amount' || name === 'fee') {
      set({ amountError: '' });
    }
  },

  validateAndFetchStudentByID: async (studentId: string) => {
    if (!studentId) {
      set({
        nameError: 'Student ID is required',
        formData: {
          ...get().formData,
          first_name: '',
          middle_name: '',
          last_name: '',
        },
      });
      return false;
    }

    try {
      const response = await axiosInstance.get(
        `/users/get-student-by-id/${studentId}`
      );
      const data = response.data;

      if (data.error || !data.success) {
        set({
          nameError:
            data.message ||
            'Student ID not found. Please verify the Student ID.',
          formData: {
            ...get().formData,
            first_name: '',
            middle_name: '',
            last_name: '',
          },
        });
        return false;
      }

      if (data.data) {
        set((state) => ({
          formData: {
            ...state.formData,
            first_name: data.data.firstName || '',
            middle_name: data.data.middleName || '',
            last_name: data.data.lastName || '',
          },
          nameError: '',
          studentData: data.data,
        }));
      }

      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Unable to find student. Please verify the Student ID.';
      set({
        nameError: errorMessage,
        formData: {
          ...get().formData,
          first_name: '',
          middle_name: '',
          last_name: '',
        },
      });
      return false;
    }
  },

  resetForm: () => {
    set({
      formData: { ...initialFormData },
      phoneError: '',
      nameError: '',
      amountError: '',
      studentData: null,
    });
  },

  resetPaymentFields: () => {
    set((state) => ({
      formData: {
        ...state.formData,
        fee: '',
        amount: '',
        courseId: null,
        batchId: null,
      },
      phoneError: '',
    }));
  },

  validateRequiredFields: () => {
    const { formData } = get();
    return !!(
      formData.student_id &&
      formData.first_name &&
      formData.last_name &&
      formData.email_address &&
      formData.fee &&
      formData.amount
    );
  },

  validatePhoneNumber: () => {
    const { formData } = get();
    if (formData.phone_number && formData.phone_number.length < 11) {
      set({ phoneError: 'Phone number must be at least 11 digits long.' });
      return false;
    }
    set({ phoneError: '' });
    return true;
  },

  validateDownPaymentAmount: () => {
    const { formData } = get();
    const amount = parseFloat(formData.amount);

    if (formData.fee === 'down_payment' && amount < 3000) {
      set({ amountError: 'Down payment must be at least ₱3,000' });
      return false;
    }
    set({ amountError: '' });
    return true;
  },

  preparePaymentData: () => {
    const { formData, studentData } = get();
    console.log('studentData ko', studentData);
    return {
      userId: studentData?.id || null,
      studentId: studentData?.userId || null,
      firstName: formData.first_name,
      middleName: formData.middle_name || null,
      lastName: formData.last_name,
      email: formData.email_address,
      phoneNumber: formData.phone_number || null,
      amount: parseFloat(formData.amount),
      feeType: formData.fee,
      courseId: formData.courseId || null,
      batchId: formData.batchId || null,
    };
  },

  sendPaymentLinkEmail: async (paymentData: any) => {
    try {
      console.log('paymentData ko', paymentData);
      const response = await axiosInstance.post(
        '/payments/send-email',
        paymentData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || 'Failed to send payment link email',
      };
    }
  },
}));
