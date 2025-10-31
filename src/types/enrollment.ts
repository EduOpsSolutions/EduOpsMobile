export interface EnrollmentFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  extensions?: string;
  honorific: string;
  sex: string;
  birthDate: string;
  civilStatus: string;
  address: string;
  referredBy: string;
  contactNumber: string;
  altContactNumber?: string;
  preferredEmail: string;
  altEmail?: string;
  motherName?: string;
  motherContact?: string;
  fatherName?: string;
  fatherContact?: string;
  guardianName?: string;
  guardianContact?: string;
  coursesToEnroll: string;
  validIdPath?: string;
  idPhotoPath?: string;
}

export interface EnrollmentData {
  enrollmentId: string;
  studentId?: string;
  status: EnrollmentStatus;
  currentStep: number;
  completedSteps: number[];
  remarkMsg: string;
  fullName: string;
  email: string;
  createdAt: string;
  coursesToEnroll: string;
  coursePrice?: number;
  courseName?: string;
  paymentProofPath?: string;
}

export type EnrollmentStatus =
  | "pending"
  | "VERIFIED"
  | "PAYMENT_PENDING"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

export interface EnrollmentStoreState {
  // State
  enrollmentId: string | null;
  studentId: string | null;
  enrollmentStatus: EnrollmentStatus;
  remarkMsg: string;
  fullName: string;
  email: string;
  coursesToEnroll: string;
  courseName: string | null;
  coursePrice: number | null;
  createdAt: string | null;
  currentStep: number;
  completedSteps: number[];
  paymentProof: any | null;
  hasPaymentProof: boolean;
  isUploadingPaymentProof: boolean;

  // Actions
  setEnrollmentData: (data: Partial<EnrollmentData>) => void;
  clearEnrollmentData: () => void;
  fetchEnrollmentData: () => Promise<void>;
  advanceToNextStep: () => void;
  setPaymentProof: (file: any) => void;
  uploadPaymentProof: () => Promise<string | null>;
  trackEnrollment: (enrollmentId?: string, email?: string) => Promise<void>;
  createEnrollment: (formData: EnrollmentFormData) => Promise<void>;

  // Helper methods
  isStepCompleted: (stepNumber: number) => boolean;
  isStepCurrent: (stepNumber: number) => boolean;
  isStepPending: (stepNumber: number) => boolean;
}

export interface TrackEnrollmentResponse {
  enrollmentId: string;
  status: EnrollmentStatus;
  currentStep: number;
  completedSteps: number[];
  remarkMsg: string;
  fullName: string;
  email: string;
  createdAt: string;
  coursesToEnroll: string;
  coursePrice?: number;
  courseName?: string;
  paymentProofPath?: string;
  studentId?: string;
}

export interface CreateEnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    enrollmentId: string;
    enrollmentStatus: string;
    email: string;
  };
}
