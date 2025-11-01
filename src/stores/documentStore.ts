import { create } from 'zustand';
import documentApi from '../utils/documentApi';
import {
  DocumentTemplate,
  DocumentRequest,
  DocumentRequestFormData,
} from '../types/document';
import { Alert } from 'react-native';

interface DocumentStore {
  // State
  documents: DocumentTemplate[];
  requests: DocumentRequest[];
  selectedDocument: DocumentTemplate | null;
  selectedRequest: DocumentRequest | null;
  loading: boolean;
  requestsLoading: boolean;
  error: string | null;
  searchQuery: string;

  // Modals
  requestModalVisible: boolean;
  requestsModalVisible: boolean;
  requestDetailsModalVisible: boolean;
  documentDetailsModalVisible: boolean;

  // Actions - Documents
  fetchDocuments: () => Promise<void>;
  searchDocuments: (query: string) => void;
  setSelectedDocument: (document: DocumentTemplate | null) => void;
  clearDocuments: () => void;

  // Actions - Requests
  fetchRequests: () => Promise<void>;
  createRequest: (requestData: DocumentRequestFormData) => Promise<void>;
  refreshRequest: (requestId: string) => Promise<void>;
  uploadProofOfPayment: (
    requestId: string,
    fileUri: string,
    fileName: string,
    fileType: string
  ) => Promise<void>;
  removeProofOfPayment: (requestId: string) => Promise<void>;
  setSelectedRequest: (request: DocumentRequest | null) => void;

  // Actions - Modals
  openRequestModal: (document: DocumentTemplate) => void;
  closeRequestModal: () => void;
  openRequestsModal: () => void;
  closeRequestsModal: () => void;
  openRequestDetailsModal: (request: DocumentRequest) => void;
  closeRequestDetailsModal: () => void;
  openDocumentDetailsModal: (document: DocumentTemplate) => void;
  closeDocumentDetailsModal: () => void;

  // Actions - Reset
  resetStore: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Initial State
  documents: [],
  requests: [],
  selectedDocument: null,
  selectedRequest: null,
  loading: false,
  requestsLoading: false,
  error: null,
  searchQuery: '',
  requestModalVisible: false,
  requestsModalVisible: false,
  requestDetailsModalVisible: false,
  documentDetailsModalVisible: false,

  // Fetch all documents
  fetchDocuments: async () => {
    try {
      set({ loading: true, error: null });
      const response = await documentApi.templates.getAll(false);

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch documents');
      }

      const formattedDocuments = response.data.map((doc: DocumentTemplate) =>
        documentApi.helpers.formatDocument(doc)
      );

      set({
        documents: formattedDocuments,
        loading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      set({
        loading: false,
        error: error.message || 'Failed to fetch documents',
      });
      Alert.alert('Error', error.message || 'Failed to fetch documents');
    }
  },

  // Search documents locally
  searchDocuments: (query: string) => {
    set({ searchQuery: query });
  },

  // Set selected document
  setSelectedDocument: (document: DocumentTemplate | null) => {
    set({ selectedDocument: document });
  },

  // Clear documents
  clearDocuments: () => {
    set({ documents: [], searchQuery: '' });
  },

  // Fetch all requests for current user
  fetchRequests: async () => {
    try {
      set({ requestsLoading: true, error: null });
      const response = await documentApi.requests.getAll();

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch requests');
      }

      const formattedRequests = response.data.map((req: DocumentRequest) =>
        documentApi.helpers.formatDocumentRequest(req)
      );

      set({
        requests: formattedRequests,
        requestsLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch requests:', error);
      set({
        requestsLoading: false,
        error: error.message || 'Failed to fetch requests',
      });
    }
  },

  // Create new document request
  createRequest: async (requestData: DocumentRequestFormData) => {
    try {
      set({ loading: true, error: null });

      // Validate request data
      const validation = documentApi.helpers.validateDocumentRequest(requestData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join('\n');
        throw new Error(errorMessages);
      }

      const response = await documentApi.requests.create(requestData);

      if (response.error) {
        throw new Error(response.message || 'Failed to create request');
      }

      // Refresh requests list
      await get().fetchRequests();

      set({ loading: false });

      Alert.alert(
        'Success!',
        'Document request submitted successfully',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Failed to create request:', error);
      set({
        loading: false,
        error: error.message || 'Failed to create request',
      });
      Alert.alert('Error', error.message || 'Failed to create request');
      throw error;
    }
  },

  // Refresh a specific request
  refreshRequest: async (requestId: string) => {
    try {
      const response = await documentApi.requests.getById(requestId);

      if (response.error) {
        throw new Error(response.message || 'Failed to refresh request');
      }

      const formattedRequest = documentApi.helpers.formatDocumentRequest(
        response.data
      );

      // Update in requests list
      set((state) => ({
        requests: state.requests.map((req) =>
          req.id === requestId ? formattedRequest : req
        ),
        selectedRequest:
          state.selectedRequest?.id === requestId
            ? formattedRequest
            : state.selectedRequest,
      }));
    } catch (error: any) {
      console.error('Failed to refresh request:', error);
    }
  },

  // Upload proof of payment
  uploadProofOfPayment: async (
    requestId: string,
    fileUri: string,
    fileName: string,
    fileType: string
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await documentApi.requests.uploadProofOfPayment(
        requestId,
        fileUri,
        fileName,
        fileType
      );

      if (response.error) {
        throw new Error(response.message || 'Failed to upload proof of payment');
      }

      // Refresh the request
      await get().refreshRequest(requestId);

      set({ loading: false });

      Alert.alert(
        'Success!',
        'Proof of payment uploaded successfully',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Failed to upload proof of payment:', error);
      set({
        loading: false,
        error: error.message || 'Failed to upload proof of payment',
      });
      Alert.alert('Error', error.message || 'Failed to upload proof of payment');
      throw error;
    }
  },

  // Remove proof of payment
  removeProofOfPayment: async (requestId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await documentApi.requests.removeProofOfPayment(requestId);

      if (response.error) {
        throw new Error(response.message || 'Failed to remove proof of payment');
      }

      // Refresh the request
      await get().refreshRequest(requestId);

      set({ loading: false });

      Alert.alert(
        'Success!',
        'Proof of payment removed successfully',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Failed to remove proof of payment:', error);
      set({
        loading: false,
        error: error.message || 'Failed to remove proof of payment',
      });
      Alert.alert('Error', error.message || 'Failed to remove proof of payment');
      throw error;
    }
  },

  // Set selected request
  setSelectedRequest: (request: DocumentRequest | null) => {
    set({ selectedRequest: request });
  },

  // Open request modal
  openRequestModal: (document: DocumentTemplate) => {
    set({
      selectedDocument: document,
      requestModalVisible: true,
    });
  },

  // Close request modal
  closeRequestModal: () => {
    set({
      requestModalVisible: false,
      selectedDocument: null,
    });
  },

  // Open requests list modal
  openRequestsModal: () => {
    set({ requestsModalVisible: true });
  },

  // Close requests list modal
  closeRequestsModal: () => {
    set({ requestsModalVisible: false });
  },

  // Open request details modal
  openRequestDetailsModal: (request: DocumentRequest) => {
    set({
      selectedRequest: request,
      requestDetailsModalVisible: true,
    });
  },

  // Close request details modal
  closeRequestDetailsModal: () => {
    set({
      requestDetailsModalVisible: false,
      selectedRequest: null,
    });
  },

  // Open document details modal
  openDocumentDetailsModal: (document: DocumentTemplate) => {
    set({
      selectedDocument: document,
      documentDetailsModalVisible: true,
    });
  },

  // Close document details modal
  closeDocumentDetailsModal: () => {
    set({
      documentDetailsModalVisible: false,
      selectedDocument: null,
    });
  },

  // Reset store
  resetStore: () => {
    set({
      documents: [],
      requests: [],
      selectedDocument: null,
      selectedRequest: null,
      loading: false,
      requestsLoading: false,
      error: null,
      searchQuery: '',
      requestModalVisible: false,
      requestsModalVisible: false,
      requestDetailsModalVisible: false,
      documentDetailsModalVisible: false,
    });
  },
}));

export default useDocumentStore;
