import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { enrollmentApi, fileApi } from "../utils/api";
import {
  EnrollmentStoreState,
  EnrollmentFormData,
  EnrollmentData,
  EnrollmentStatus,
} from "../types/enrollment";

export const useEnrollmentStore = create<EnrollmentStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      enrollmentId: null,
      studentId: null,
      enrollmentStatus: "pending" as EnrollmentStatus,
      remarkMsg: "Please track your enrollment to view progress.",
      fullName: "",
      email: "",
      coursesToEnroll: "",
      courseName: null,
      coursePrice: null,
      createdAt: null,
      currentStep: 1,
      completedSteps: [],
      paymentProof: null,
      hasPaymentProof: false,
      isUploadingPaymentProof: false,

      // Helper methods
      isStepCompleted: (stepNumber: number) =>
        get().completedSteps.includes(stepNumber),
      isStepCurrent: (stepNumber: number) => stepNumber === get().currentStep,
      isStepPending: (stepNumber: number) =>
        !get().completedSteps.includes(stepNumber) &&
        stepNumber !== get().currentStep,

      // Set enrollment data from API response
      setEnrollmentData: (data: Partial<EnrollmentData>) => {
        const currentStep = data.currentStep || 1;
        const completedSteps =
          currentStep >= 2 && !data.completedSteps?.includes(1)
            ? [1, ...(data.completedSteps || [])]
            : data.completedSteps || (currentStep > 1 ? [1] : []);

        set({
          enrollmentId: data.enrollmentId || get().enrollmentId,
          studentId: data.studentId || get().studentId,
          enrollmentStatus: data.status || get().enrollmentStatus,
          currentStep,
          completedSteps,
          remarkMsg: data.remarkMsg || get().remarkMsg,
          fullName: data.fullName || get().fullName,
          email: data.email || get().email,
          coursesToEnroll: data.coursesToEnroll || get().coursesToEnroll,
          courseName: data.courseName || get().courseName,
          coursePrice: data.coursePrice || get().coursePrice,
          createdAt: data.createdAt || get().createdAt,
          paymentProof: null,
          hasPaymentProof: !!data.paymentProofPath,
        });
      },

      // Clear enrollment data
      clearEnrollmentData: () => {
        set({
          enrollmentId: null,
          studentId: null,
          enrollmentStatus: "pending",
          remarkMsg: "Please track your enrollment to view progress.",
          fullName: "",
          email: "",
          coursesToEnroll: "",
          courseName: null,
          coursePrice: null,
          createdAt: null,
          currentStep: 1,
          completedSteps: [],
          paymentProof: null,
          hasPaymentProof: false,
          isUploadingPaymentProof: false,
        });
      },

      // Fetch enrollment data (already available from tracking)
      fetchEnrollmentData: async () => {
        const { enrollmentId } = get();
        if (!enrollmentId) {
          console.log("No enrollment ID available for fetching data");
          return;
        }
        console.log("Enrollment data already available in store");
      },

      // Track enrollment by ID or email
      trackEnrollment: async (enrollmentId?: string, email?: string) => {
        try {
          if (!enrollmentId && !email) {
            throw new Error("Please provide an enrollment ID or email address");
          }

          const response = await enrollmentApi.trackEnrollment(
            enrollmentId,
            email
          );

          if (response.error) {
            throw new Error(response.message || "Failed to track enrollment");
          }

          // Set the enrollment data
          get().setEnrollmentData({
            enrollmentId: response.data.enrollmentId,
            studentId: response.data.studentId,
            status: response.data.status,
            currentStep: response.data.currentStep,
            completedSteps: response.data.completedSteps,
            remarkMsg: response.data.remarkMsg,
            fullName: response.data.fullName,
            email: response.data.email,
            createdAt: response.data.createdAt,
            coursesToEnroll: response.data.coursesToEnroll,
            coursePrice: response.data.coursePrice,
            courseName: response.data.courseName,
            paymentProofPath: response.data.paymentProofPath,
          });

          return response.data;
        } catch (error: any) {
          console.error("Error tracking enrollment:", error);
          Alert.alert(
            "Error",
            error.message || "Failed to track enrollment. Please try again."
          );
          throw error;
        }
      },

      // Create new enrollment
      createEnrollment: async (formData: EnrollmentFormData) => {
        try {
          const response = await enrollmentApi.createEnrollmentRequest(
            formData
          );

          if (response.error) {
            throw new Error(response.message || "Failed to create enrollment");
          }

          Alert.alert(
            "Success",
            `Enrollment submitted successfully!\n\nYour Enrollment ID: ${response.data.enrollmentId}\n\nPlease save this ID for tracking your enrollment.`,
            [{ text: "OK" }]
          );

          // Set the enrollment ID and initial data
          set({
            enrollmentId: response.data.enrollmentId,
            email: response.data.email || formData.preferredEmail,
            enrollmentStatus: response.data.enrollmentStatus || "pending",
            currentStep: 1,
            completedSteps: [1],
            remarkMsg:
              "Your enrollment has been submitted. Please wait for verification.",
            fullName: `${formData.firstName} ${formData.middleName || ""} ${
              formData.lastName
            }`.trim(),
            coursesToEnroll: formData.coursesToEnroll,
          });

          return response.data;
        } catch (error: any) {
          console.error("Error creating enrollment:", error);
          Alert.alert(
            "Error",
            error.message || "Failed to submit enrollment. Please try again."
          );
          throw error;
        }
      },

      // Advance to next step (for demo purposes)
      advanceToNextStep: () => {
        const { currentStep, paymentProof, hasPaymentProof, coursePrice } =
          get();

        if (currentStep >= 5) return;

        if (currentStep === 3 && !paymentProof && !hasPaymentProof) {
          Alert.alert(
            "Payment Proof Required",
            "Please upload your proof of payment before proceeding."
          );
          return;
        }

        const statusUpdates: Record<
          number,
          { enrollmentStatus: EnrollmentStatus; remarkMsg: string }
        > = {
          2: {
            enrollmentStatus: "VERIFIED",
            remarkMsg: `Your enrollment form has been verified. Please proceed with payment of ₱${
              coursePrice || "TBA"
            }.`,
          },
          3: {
            enrollmentStatus: "PAYMENT_PENDING",
            remarkMsg:
              "Your payment is being verified. This may take 1-2 business days.",
          },
          4: {
            enrollmentStatus: "APPROVED",
            remarkMsg: "Your payment has been approved. Almost done!",
          },
        };

        set((state) => ({
          completedSteps: [...state.completedSteps, currentStep],
          currentStep: currentStep + 1,
          ...statusUpdates[currentStep],
        }));

        if (currentStep === 4) {
          Alert.alert(
            "Enrollment Complete",
            "Congratulations! Your enrollment is now complete.",
            [{ text: "OK" }]
          );
        }
      },

      // Set payment proof file
      setPaymentProof: (file: any) => set({ paymentProof: file }),

      // Upload payment proof
      uploadPaymentProof: async () => {
        const { paymentProof, enrollmentId } = get();
        if (!paymentProof || !enrollmentId) {
          Alert.alert("Error", "No payment proof or enrollment ID found");
          return null;
        }

        set({ isUploadingPaymentProof: true });

        try {
          // Upload file to Firebase/Storage
          const uploadResponse = await fileApi.guestUploadFile(
            paymentProof,
            "payment-proofs"
          );

          const downloadURL = uploadResponse?.data?.downloadURL;

          if (uploadResponse.error || !downloadURL) {
            throw new Error("Failed to upload file to storage");
          }

          // Update enrollment record with payment proof
          const updateResponse = await enrollmentApi.updatePaymentProof(
            enrollmentId,
            downloadURL
          );

          if (updateResponse.error) {
            throw new Error(
              updateResponse.message || "Failed to update enrollment record"
            );
          }

          set({
            isUploadingPaymentProof: false,
            hasPaymentProof: true,
            enrollmentStatus: "PAYMENT_PENDING",
            remarkMsg:
              "Your payment proof has been uploaded. Verification in progress (1-2 business days).",
          });

          Alert.alert(
            "Success",
            "Payment proof uploaded successfully. It will be verified within 1-2 business days."
          );

          return downloadURL;
        } catch (error: any) {
          console.error("Error uploading payment proof:", error);
          Alert.alert(
            "Upload Failed",
            error.message || "Failed to upload payment proof. Please try again."
          );
          set({ isUploadingPaymentProof: false });
          return null;
        }
      },
    }),
    {
      name: "eduops-enrollment-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enrollmentId: state.enrollmentId,
        studentId: state.studentId,
        enrollmentStatus: state.enrollmentStatus,
        remarkMsg: state.remarkMsg,
        fullName: state.fullName,
        email: state.email,
        coursesToEnroll: state.coursesToEnroll,
        courseName: state.courseName,
        coursePrice: state.coursePrice,
        createdAt: state.createdAt,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        hasPaymentProof: state.hasPaymentProof,
      }),
    }
  )
);

export default useEnrollmentStore;
