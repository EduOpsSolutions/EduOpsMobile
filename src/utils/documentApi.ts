import axiosInstance from './axios';
import { handleApiError } from './api';

// Document Templates API
export const documentTemplatesApi = {
  // Get all document templates (role-based filtering)
  getAll: async (includeHidden = false) => {
    try {
      const response = await axiosInstance.get('/documents/templates', {
        params: { includeHidden },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Search document templates
  search: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/documents/templates/search', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get document template by ID
  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/documents/templates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Document Requests API
export const documentRequestsApi = {
  // Get all document requests (role-based access)
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/documents/requests');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Search document requests
  search: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/documents/requests/search', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get document request by ID
  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/documents/requests/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create document request (students and teachers)
  create: async (requestData: any) => {
    try {
      const response = await axiosInstance.post(
        '/documents/requests',
        requestData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Upload proof of payment (students and teachers for their own requests)
  uploadProofOfPayment: async (
    id: string,
    fileUri: string,
    fileName: string,
    fileType: string
  ) => {
    try {
      // Create file object in React Native format
      const fileData: any = {
        uri: fileUri,
        type: fileType,
        name: fileName,
      };

      const formData = new FormData();
      formData.append('proofOfPayment', fileData);

      const response = await axiosInstance.patch(
        `/documents/requests/${id}/proof-of-payment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Remove proof of payment
  removeProofOfPayment: async (id: string) => {
    try {
      const response = await axiosInstance.patch(
        `/documents/requests/${id}/proof-of-payment`,
        {
          proofOfPayment: null,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Document Validations API
export const documentValidationsApi = {
  // Validate document by signature (public endpoint)
  validateSignature: async (signature: string) => {
    try {
      const response = await axiosInstance.get(
        `/documents/validate/${signature}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Helper functions
export const documentHelpers = {
  // Format document for display
  formatDocument: (document: any) => ({
    ...document,
    formattedAmount:
      document.price === 'paid' && document.amount
        ? parseFloat(document.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : null,
    displayPrice:
      document.price === 'free'
        ? 'FREE'
        : document.price === 'paid'
        ? `₱${document.amount}`
        : document.price,
    canDownload: document.downloadable && document.uploadFile,
    requiresRequest: document.requestBasis,
  }),

  // Format document request for display
  formatDocumentRequest: (request: any) => {
    // Format name from user or firstName/lastName
    let name = 'Unknown Student';
    if (request.user) {
      name = `${request.user.firstName} ${
        request.user.middleName ? request.user.middleName + ' ' : ''
      }${request.user.lastName}`;
    } else if (request.firstName && request.lastName) {
      name = `${request.firstName} ${request.lastName}`;
    }

    // Format document name
    const documentName = request.document?.documentName || 'Unknown Document';

    // Format status for display
    const statusMap: { [key: string]: string } = {
      in_process: 'In Process',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      failed: 'Failed',
      fulfilled: 'Fulfilled',
    };

    return {
      ...request,
      name,
      documentName: documentName,
      displayDate: new Date(request.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      displayStatus: statusMap[request.status] || request.status,
      remarks: request.remarks || '-',
    };
  },

  // Check if user can access document based on role and privacy
  canAccessDocument: (document: any, userRole: string) => {
    const accessRules: { [key: string]: string[] } = {
      admin: ['public', 'student_only', 'teacher_only'],
      teacher: ['public', 'teacher_only'],
      student: ['public', 'student_only'],
    };

    const allowedPrivacyLevels = accessRules[userRole] || accessRules.student;
    return allowedPrivacyLevels.includes(document.privacy?.toLowerCase());
  },

  // Validate document request data
  validateDocumentRequest: (requestData: any) => {
    const errors: { [key: string]: string } = {};

    if (!requestData.documentId) {
      errors.documentId = 'Document is required';
    }

    if (
      !requestData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)
    ) {
      errors.email = 'Valid email is required';
    }

    if (!requestData.phone || !/^[\d\s\-\+\(\)]+$/.test(requestData.phone)) {
      errors.phone = 'Valid phone number is required';
    }

    if (requestData.mode === 'delivery') {
      if (!requestData.address)
        errors.address = 'Address is required for delivery';
      if (!requestData.city) errors.city = 'City is required for delivery';
      if (!requestData.state) errors.state = 'State is required for delivery';
      if (!requestData.zipCode)
        errors.zipCode = 'ZIP code is required for delivery';
      if (!requestData.country)
        errors.country = 'Country is required for delivery';
    }

    if (!requestData.purpose) {
      errors.purpose = 'Purpose is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Get status color for UI
  getStatusColor: (status: string) => {
    const statusColors: { [key: string]: string } = {
      in_process: '#FFA500', // Orange
      in_transit: '#1E90FF', // DodgerBlue
      delivered: '#32CD32', // LimeGreen
      fulfilled: '#32CD32', // LimeGreen
      failed: '#DC143C', // Crimson
    };
    return statusColors[status] || '#666666';
  },

  // Get payment method display text
  getPaymentMethodText: (method: string) => {
    const methodMap: { [key: string]: string } = {
      online: 'Online (Maya)',
      cod: 'Cash on Delivery',
      cashPickup: 'Cash (Pay upon Pickup)',
    };
    return methodMap[method] || method;
  },
};

// Export all APIs as default
const documentApi = {
  templates: documentTemplatesApi,
  requests: documentRequestsApi,
  validations: documentValidationsApi,
  helpers: documentHelpers,
};

export default documentApi;
