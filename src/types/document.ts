// Document Template Types
export interface DocumentTemplate {
  id: string;
  documentName: string;
  description?: string;
  price: 'free' | 'paid';
  amount?: number;
  privacy: 'public' | 'student_only' | 'teacher_only';
  downloadable: boolean;
  requestBasis: boolean;
  uploadFile?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  formattedAmount?: string | null;
  displayPrice?: string;
  canDownload?: boolean;
  requiresRequest?: boolean;
}

// Document Request Types
export type RequestStatus =
  | 'in_process'
  | 'approved'
  | 'ready_for_pickup'
  | 'delivered'
  | 'rejected';

export type RequestMode = 'pickup' | 'delivery';

export type PaymentMethod = 'online' | 'cash';

export type PaymentStatus = 'pending' | 'verified';

export interface DocumentRequest {
  id: string;
  userId: string;
  documentId: string;
  email: string;
  phone: string;
  mode: RequestMode;
  paymentMethod: PaymentMethod;
  purpose: string;
  additionalNotes?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status: RequestStatus;
  remarks?: string;
  proofOfPayment?: string;
  // Payment-related fields
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  paymentUrl?: string;
  paymentId?: string;
  fulfilledDocumentUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
  };
  document?: DocumentTemplate;
  // Computed fields
  name?: string;
  documentName?: string;
  displayDate?: string;
  displayStatus?: string;
  displayPaymentStatus?: string;
}

// Form Data Types
export interface DocumentRequestFormData {
  documentId: string;
  email: string;
  phone: string;
  mode: RequestMode;
  paymentMethod: PaymentMethod;
  purpose: string;
  additionalNotes?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Validation Types
export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: boolean;
}

export interface DocumentsResponse extends ApiResponse<DocumentTemplate[]> {}
export interface DocumentRequestsResponse extends ApiResponse<DocumentRequest[]> {}
export interface SingleDocumentResponse extends ApiResponse<DocumentTemplate> {}
export interface SingleRequestResponse extends ApiResponse<DocumentRequest> {}
