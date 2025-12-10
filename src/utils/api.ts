import axiosInstance from './axios';

// Generic API error handler
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return (
      error.response.data?.message ||
      error.response.statusText ||
      'An error occurred'
    );
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred';
  }
};

// Enrollment API
export const enrollmentApi = {
  trackEnrollment: async (enrollmentId?: string, email?: string) => {
    try {
      const response = await axiosInstance.post('/enrollment/track', {
        enrollmentId: enrollmentId || null,
        email: email || null,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createEnrollmentRequest: async (enrollmentData: any) => {
    try {
      const response = await axiosInstance.post(
        '/enrollment/enroll',
        enrollmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updatePaymentProof: async (
    enrollmentId: string,
    paymentProofPath: string
  ) => {
    try {
      const response = await axiosInstance.patch('/enrollment/payment-proof', {
        enrollmentId,
        paymentProofPath,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getEnrollmentStatus: async (enrollmentId: string) => {
    try {
      const response = await axiosInstance.get(`/enrollment/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getEnrollmentHistory: async () => {
    try {
      const response = await axiosInstance.get('/enrollment/history');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  trackEnrollmentByEmail: async (email: string) => {
    try {
      const response = await axiosInstance.get(
        `/enrollment/track/email/${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error: any) {
      // Return a structured error response instead of throwing
      // This allows the caller to handle 404 (no enrollment found) gracefully
      if (error.response?.status === 404) {
        return { error: true, status: 404, message: 'No enrollment found' };
      }
      throw new Error(handleApiError(error));
    }
  },
};

// Posts API
export const postsApi = {
  getPosts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPost: async (postId: string) => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getMyPosts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/posts/my/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// User Profile API
export const profileApi = {
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateProfile: async (userData: any) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  uploadProfilePicture: async (file: any) => {
    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await axiosInstance.post(
        '/users/update-profile-picture',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Documents API
export const documentsApi = {
  getDocuments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/documents', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  requestDocument: async (documentType: string, reason?: string) => {
    try {
      const response = await axiosInstance.post('/documents/request', {
        documentType,
        reason,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  downloadDocument: async (documentId: string) => {
    try {
      const response = await axiosInstance.get(
        `/documents/${documentId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Grades API
export const gradesApi = {
  getGrades: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/grades', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getGradesBySemester: async (semester: string, schoolYear: string) => {
    try {
      const response = await axiosInstance.get('/grades/semester', {
        params: { semester, schoolYear },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStudentGrades: async (studentId: string, periodId?: string) => {
    try {
      const url = periodId
        ? `/grades/student/${studentId}?periodId=${periodId}`
        : `/grades/student/${studentId}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Assessment/Payment API
export const assessmentApi = {
  // Get all assessments for a specific student (all courses/batches)
  getStudentAssessments: async (studentId: string) => {
    try {
      const response = await axiosInstance.get(`/assessment/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get specific assessment for a student with course and batch
  getAssessmentDetails: async (
    studentId: string,
    courseId: string,
    academicPeriodId: string
  ) => {
    try {
      const response = await axiosInstance.get(`/assessment/${studentId}`, {
        params: { courseId, academicPeriodId },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPaymentHistory: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/assessment/history', {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  makePayment: async (paymentData: any) => {
    try {
      const response = await axiosInstance.post(
        '/assessment/payment',
        paymentData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Schedule API
export const scheduleApi = {
  getSchedule: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/schedule', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getScheduleBySemester: async (semester: string, schoolYear: string) => {
    try {
      const response = await axiosInstance.get('/schedule/semester', {
        params: { semester, schoolYear },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// File Upload API
export const fileApi = {
  uploadFile: async (file: any, directory: string) => {
    try {
      const formData = new FormData();

      // React Native requires file to be formatted with uri, name, and type
      // ImagePicker returns { uri, type, fileName, ... }
      const fileUri = file.uri;
      const fileName = file.fileName || file.uri?.split('/').pop() || 'file.jpg';
      const fileType = file.mimeType || file.type || 'image/jpeg';

      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append('directory', directory);

      const response = await axiosInstance.post(
        `/upload?directory=${directory}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  guestUploadFile: async (file: any, directory: string) => {
    try {
      const formData = new FormData();

      // React Native requires file to be formatted with uri, name, and type
      // ImagePicker returns { uri, type, fileName, ... }
      const fileUri = file.uri;
      const fileName = file.fileName || file.uri?.split('/').pop() || 'file.jpg';
      const fileType = file.mimeType || file.type || 'image/jpeg';

      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append('directory', directory);

      const response = await axiosInstance.post(
        `/upload/guest?directory=${directory}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Courses API
export const coursesApi = {
  getCourses: async () => {
    try {
      const response = await axiosInstance.get('/courses');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getCourseRequisites: async (courseIds: string[]) => {
    try {
      const response = await axiosInstance.get(
        `/course-requisites?courseIds=${courseIds.join(',')}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  checkStudentEligibility: async (studentId: string, courseIds: string[]) => {
    try {
      const response = await axiosInstance.get(
        `/course-requisites/check-student?studentId=${studentId}&courseIds=${courseIds.join(',')}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAcademicPeriodCourses: async (periodId: string) => {
    try {
      const response = await axiosInstance.get(
        `/academic-period-courses/${periodId}/courses`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Auth API
export const authApi = {
  requestResetPassword: async (email: string) => {
    try {
      const response = await axiosInstance.post('/auth/request-reset-password', {
        email,
      });
      return response.data;
    } catch (error: any) {
      // Handle specific error responses
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(handleApiError(error));
    }
  },
};

// Academic Periods API
export const academicPeriodsApi = {
  getAcademicPeriods: async () => {
    try {
      const response = await axiosInstance.get('/academic-periods');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Ledger API
export const ledgerApi = {
  getStudentLedger: async (studentId: string) => {
    try {
      const response = await axiosInstance.get(`/ledger/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getOngoingStudents: async () => {
    try {
      const response = await axiosInstance.get('/ledger/students/ongoing');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default {
  enrollment: enrollmentApi,
  posts: postsApi,
  profile: profileApi,
  documents: documentsApi,
  grades: gradesApi,
  assessment: assessmentApi,
  schedule: scheduleApi,
  file: fileApi,
  courses: coursesApi,
  academicPeriods: academicPeriodsApi,
  ledger: ledgerApi,
  auth: authApi,
};
