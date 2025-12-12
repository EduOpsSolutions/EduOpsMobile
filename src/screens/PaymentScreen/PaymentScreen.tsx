import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSegments } from "expo-router";
import { styles } from "./PaymentScreen.styles";
import { AppLayout } from "../../components/common";
import { usePaymentStore } from "@/src/stores/paymentStore";
import { useAuthStore } from "@/src/stores/authStore";

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  value,
  onValueChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {selectedLabel || placeholder}
        </Text>
        <Icon
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownOptions}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownOption}
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                activeOpacity={0.6}
              >
                <Text style={styles.dropdownOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export const PaymentScreen = (): React.JSX.Element => {
  const {
    formData,
    loading,
    phoneError,
    nameError,
    amountError,
    feesOptions,
    updateFormField,
    validateAndFetchStudentByID,
    validateRequiredFields,
    validatePhoneNumber,
    validateDownPaymentAmount,
    preparePaymentData,
    resetForm,
    resetPaymentFields,
    sendPaymentLinkEmail,
    setLoading,
  } = usePaymentStore();

  const { user, isAuthenticated } = useAuthStore();
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [showIdCopied, setShowIdCopied] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [guestEnrollments, setGuestEnrollments] = useState<any[]>([]);
  const [selectedEnrollmentBalance, setSelectedEnrollmentBalance] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  // Auto-fill user details on component mount
  React.useEffect(() => {
    const autoFillUserDetails = async () => {
      if (isAuthenticated && user?.userId && user?.role === "student") {
        updateFormField("student_id", user.userId);

        setIsFetchingStudent(true);
        await validateAndFetchStudentByID(user.userId);
        setIsFetchingStudent(false);

        if (user?.email) {
          updateFormField("email_address", user.email);
        }
      }
    };

    autoFillUserDetails();
  }, [isAuthenticated, user]);

  // Fetch enrollments for logged-in students
  React.useEffect(() => {
    const fetchEnrollments = async () => {
      if (isAuthenticated && user?.role === "student" && user?.id) {
        try {
          const apiUrl =
            process.env.EXPO_PUBLIC_API_URL || "http://localhost:5555/api/v1";
          const token = useAuthStore.getState().token;
          const response = await fetch(
            `${apiUrl}/assessment/student/${user.id}`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          console.log("Enrollments fetched:", data); // Debug log

          // Map the assessment data to enrollment format with outstandingBalance
          const mappedEnrollments = Array.isArray(data)
            ? data.map((assessment: any) => ({
                ...assessment,
                outstandingBalance: assessment.remainingBalance || 0,
              }))
            : [];

          setEnrollments(mappedEnrollments);
        } catch (err) {
          console.error("Error fetching enrollments:", err);
          setEnrollments([]);
        }
      } else {
        setEnrollments([]);
      }
    };
    fetchEnrollments();
  }, [isAuthenticated, user]);

  // Fetch courses and batches for guest payments
  React.useEffect(() => {
    const fetchCoursesAndBatches = async () => {
      if (!isAuthenticated) {
        try {
          const apiUrl =
            process.env.EXPO_PUBLIC_API_URL || "http://localhost:5555/api/v1";

          // Fetch courses
          const coursesRes = await fetch(`${apiUrl}/courses`);
          const coursesData = await coursesRes.json();
          setCourses(Array.isArray(coursesData) ? coursesData : []);

          // Fetch academic periods (batches)
          const batchesRes = await fetch(`${apiUrl}/academic-periods`);
          const batchesData = await batchesRes.json();
          setBatches(Array.isArray(batchesData) ? batchesData : []);
        } catch (err) {
          console.error("Error fetching courses/batches:", err);
          setCourses([]);
          setBatches([]);
        }
      }
    };
    fetchCoursesAndBatches();
  }, [isAuthenticated]);

  // Handle course/batch selection
  const handleCourseBatchChange = (value: string) => {
    if (!value) {
      updateFormField("courseId", null);
      updateFormField("batchId", null);
      setSelectedEnrollmentBalance(null);
    } else {
      const [courseId, batchId] = value.split("|");
      updateFormField("courseId", courseId);
      updateFormField("batchId", batchId);

      // Find the selected enrollment and set its outstanding balance
      const enrollmentList = isAuthenticated ? enrollments : guestEnrollments;
      const selectedEnrollment = enrollmentList.find(
        (e: any) => e.courseId === courseId && e.batchId === batchId
      );

      if (selectedEnrollment) {
        const balance = parseFloat(selectedEnrollment.outstandingBalance);
        setSelectedEnrollmentBalance(balance);

        // Clear the amount field when course/batch changes
        updateFormField("amount", "");
      }
    }
  };

  // Helper function to get proper fee type label
  const getFeeTypeLabel = (feeType: string) => {
    const feeTypeMap: Record<string, string> = {
      down_payment: "Down Payment",
      tuition_fee: "Tuition Fee",
      document_fee: "Document Fee",
      book_fee: "Book Fee",
    };

    if (!feeType) {
      return "Payment";
    }

    return feeTypeMap[feeType] || feeType.replace("_", " ");
  };

  const handleStudentIdBlur = async () => {
    const studentId = formData.student_id;
    // Only validate for guests (non-authenticated users)
    // Authenticated users already have auto-filled data
    if (studentId && !isAuthenticated) {
      setIsFetchingStudent(true);
      await validateAndFetchStudentByID(studentId);
      setIsFetchingStudent(false);

      // Fetch guest enrollments with outstanding balances
      try {
        const apiUrl =
          process.env.EXPO_PUBLIC_API_URL || "http://localhost:5555/api/v1";
        const response = await fetch(
          `${apiUrl}/assessment/student/${studentId}`
        );
        const data = await response.json();
        console.log("Guest enrollments fetched:", data); // Debug log

        // Map the assessment data to enrollment format with outstandingBalance
        const mappedEnrollments = Array.isArray(data)
          ? data.map((assessment: any) => ({
              ...assessment,
              outstandingBalance: assessment.remainingBalance || 0,
            }))
          : [];

        setGuestEnrollments(mappedEnrollments);
      } catch (err) {
        console.error("Error fetching guest enrollments:", err);
        setGuestEnrollments([]);
      }
    }
  };

  const handleCopyId = async () => {
    if (user?.userId) {
      await Clipboard.setStringAsync(user.userId);
      setShowIdCopied(true);
      setTimeout(() => setShowIdCopied(false), 2000);
    }
  };

  const handleStudentIdChange = (value: string) => {
    updateFormField("student_id", value);

    // Clear guest enrollments if student_id is changed/cleared
    if (!isAuthenticated) {
      setGuestEnrollments([]);
      updateFormField("courseId", null);
      updateFormField("batchId", null);
      setSelectedEnrollmentBalance(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateRequiredFields()) {
      Alert.alert(
        "Missing Required Fields",
        "Please fill in all required fields before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!validatePhoneNumber()) return;

    if (!validateDownPaymentAmount()) {
      Alert.alert(
        "Invalid Payment Amount",
        "Down payment must be at least ₱3,000",
        [{ text: "OK" }]
      );
      return;
    }

    // Validate payment amount does not exceed outstanding balance
    if (
      selectedEnrollmentBalance !== null &&
      formData.courseId &&
      formData.batchId
    ) {
      const paymentAmount = parseFloat(formData.amount);
      if (paymentAmount > selectedEnrollmentBalance) {
        Alert.alert(
          "Payment Amount Exceeds Balance",
          `You cannot pay more than your outstanding balance of ₱${selectedEnrollmentBalance.toFixed(
            2
          )}. Please adjust the amount.`,
          [{ text: "OK" }]
        );
        return;
      }
    }

    const feeLabel = getFeeTypeLabel(formData.fee);

    Alert.alert(
      "Confirm Payment",
      `Are you sure you want to pay ₱${formData.amount} for ${feeLabel}?\n\nPayment link will be sent to: ${formData.email_address}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, I'm sure",
          onPress: async () => {
            try {
              setLoading(true);

              const paymentData = preparePaymentData();
              const feeLabel = getFeeTypeLabel(paymentData.feeType);
              const description = `${feeLabel} - Payment for ${paymentData.firstName} ${paymentData.lastName}`;
              const emailData = {
                email: paymentData.email,
                firstName: paymentData.firstName,
                lastName: paymentData.lastName,
                amount: paymentData.amount,
                description: description,
                feeType: paymentData.feeType,
                userId: paymentData.userId,
                courseId: paymentData.courseId || null,
                batchId: paymentData.batchId || null,
              };

              const result = await sendPaymentLinkEmail(emailData);

              setLoading(false);

              if (result.success) {
                const paymentId = result?.data?.data?.paymentId;

                Alert.alert(
                  "Email Sent Successfully!",
                  `A payment link has been sent to ${paymentData.email}\n\nYou can complete your payment using the link in your email.`,
                  [
                    {
                      text: "Close",
                      style: "cancel",
                    },
                    {
                      text: "Open Payment Link",
                      onPress: () => {
                        if (paymentId) {
                          const clientBaseUrl =
                            `${process.env.EXPO_PUBLIC_CLIENT_URL}` ||
                            "https://eduops.vercel.app";
                          // For mobile, open a new tab with the payment URL - browser is used instead
                          const paymentUrl = `${clientBaseUrl}/payment?paymentId=${paymentId}`;
                          Linking.openURL(paymentUrl).catch((err) => {
                            console.error("Failed to open payment link:", err);
                            Alert.alert(
                              "Error",
                              "Could not open payment link. Please check your email."
                            );
                          });
                        }
                      },
                    },
                  ]
                );

                // For authenticated users, only reset payment fields to keep user details pre-filled
                // For guests, reset everything
                if (isAuthenticated && user?.role === "student") {
                  resetPaymentFields();
                } else {
                  resetForm();
                }
              } else {
                Alert.alert(
                  "Error",
                  result.error ||
                    "Failed to send payment link. Please try again.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              setLoading(false);
              console.error("Error sending payment link:", error);
              Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  // Dynamically determine if payment is active based on current route
  const currentRoute = "/" + (useSegments()[useSegments().length - 1] || "");
  const isPaymentActive = currentRoute === "/paymentform";

  return (
    <AppLayout
      showNotifications={true}
      enrollmentActive={false}
      paymentActive={isPaymentActive}
    >
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.paymentContainer}>
          {/* Payment Form Card */}
          <View style={styles.paymentCard}>
            {/* Form Title */}
            <Text style={styles.formTitle}>Payment Form</Text>
            <Text style={styles.formSubtitle}>
              Fields marked with (*) are required. Please enter the correct
              student information.
            </Text>

            {/* Info Banner for Logged-in Users */}
            {isAuthenticated && user?.userId && user?.role === "student" && (
              <View style={styles.infoBanner}>
                <View style={styles.infoBannerContent}>
                  <View style={styles.infoBannerRow}>
                    <Text style={styles.infoBannerLabel}>Your ID: </Text>
                    <Text style={styles.infoBannerValue}>{user.userId}</Text>
                    <TouchableOpacity
                      onPress={handleCopyId}
                      style={styles.copyButton}
                    >
                      <Text style={styles.copyButtonText}>
                        {showIdCopied ? "Copied!" : "Copy"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.infoBannerNote}>
                    <Text style={{ fontWeight: "600" }}>Note:</Text> Your
                    details have been automatically filled. You can only process
                    payments for yourself. For guest payments, you can share
                    your ID to allow others to pay without logging in.
                  </Text>
                </View>
              </View>
            )}

            {/* Info Note for Guests */}
            {!isAuthenticated && (
              <View style={styles.infoNote}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <Icon
                    name="info"
                    size={16}
                    color="#2196f3"
                    style={{ marginTop: 1 }}
                  />
                  <Text style={styles.infoNoteText}>
                    <Text style={{ fontWeight: "600" }}>Tip:</Text> Enter the
                    Student ID to fetch student details and proceed with
                    payment. If you don't have a Student ID, please contact the
                    administration.
                  </Text>
                </View>
              </View>
            )}

            {/* Student ID */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Student ID*</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[
                    styles.input,
                    isFetchingStudent && styles.inputDisabled,
                    isAuthenticated && styles.inputReadOnly,
                  ]}
                  value={formData.student_id}
                  onChangeText={handleStudentIdChange}
                  onBlur={handleStudentIdBlur}
                  placeholder="Enter Student ID"
                  placeholderTextColor="#999"
                  editable={!isFetchingStudent && !isAuthenticated}
                />
                {isFetchingStudent && (
                  <ActivityIndicator
                    size="small"
                    color="#de0000"
                    style={styles.inputIcon}
                  />
                )}
              </View>
            </View>

            {/* Course & Batch selection for logged-in students */}
            {isAuthenticated && user?.role === "student" && (
              <View style={styles.fullWidth}>
                <Text style={styles.label}>Course & Batch*</Text>
                {enrollments.filter((e: any) => e.outstandingBalance > 0).length > 0 ? (
                  <Dropdown
                    placeholder="Select course & batch"
                    value={
                      formData.courseId && formData.batchId
                        ? `${formData.courseId}|${formData.batchId}`
                        : ""
                    }
                    onValueChange={handleCourseBatchChange}
                    options={[
                      { value: "", label: "Select course & batch" },
                      ...enrollments
                        .filter((e: any) => e.outstandingBalance > 0)
                        .map((e: any) => ({
                          value: `${e.courseId}|${e.batchId}`,
                          label: `${e.course} - ${e.batch}${
                            e.year ? ` (${e.year})` : ""
                          } - Outstanding: ₱${e.outstandingBalance.toFixed(2)}`,
                        })),
                    ]}
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: 12,
                        backgroundColor: "#e3f2fd",
                        borderRadius: 8,
                      }}
                    >
                      <Icon
                        name="info"
                        size={16}
                        color="#1976d2"
                        style={{ marginTop: 1 }}
                      />
                      <Text style={styles.emptyStateText}>
                        You don't have any courses with outstanding balance. All
                        your enrolled courses are fully paid or you have no active
                        enrollments.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Course & Batch selection for guest payments */}
            {!isAuthenticated && guestEnrollments.filter((e: any) => e.outstandingBalance > 0).length > 0 && (
              <View style={styles.fullWidth}>
                <Text style={styles.label}>Course & Batch*</Text>
                <Dropdown
                  placeholder="Select course & batch"
                  value={
                    formData.courseId && formData.batchId
                      ? `${formData.courseId}|${formData.batchId}`
                      : ""
                  }
                  onValueChange={handleCourseBatchChange}
                  options={[
                    { value: "", label: "Select course & batch" },
                    ...guestEnrollments
                      .filter((e: any) => e.outstandingBalance > 0)
                      .map((e: any) => ({
                        value: `${e.courseId}|${e.batchId}`,
                        label: `${e.course} - ${e.batch}${
                          e.year ? ` (${e.year})` : ""
                        } - Outstanding: ₱${e.outstandingBalance.toFixed(2)}`,
                      })),
                  ]}
                />
              </View>
            )}

            {/* Show message if guest has no enrollments with outstanding balance */}
            {!isAuthenticated &&
              formData.student_id &&
              formData.first_name &&
              guestEnrollments.filter((e: any) => e.outstandingBalance > 0).length === 0 && (
                <View style={styles.fullWidth}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: 12,
                      backgroundColor: "#e3f2fd",
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Icon
                      name="info"
                      size={16}
                      color="#1976d2"
                      style={{ marginTop: 1 }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: "#1976d2",
                        lineHeight: 20,
                      }}
                    >
                      You don't have any courses with outstanding balance. All
                      your enrolled courses are fully paid or you have no active
                      enrollments.
                    </Text>
                  </View>
                </View>
              )}

            {/* First Row - First Name and Middle Name */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>First Name*</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputReadOnly,
                    nameError && styles.inputError,
                  ]}
                  value={formData.first_name}
                  placeholder="First Name"
                  placeholderTextColor="#999"
                  editable={false}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Middle Name</Text>
                <TextInput
                  style={[styles.input, styles.inputReadOnly]}
                  value={formData.middle_name}
                  placeholder="Middle Name"
                  placeholderTextColor="#999"
                  editable={false}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Last Name*</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.inputReadOnly,
                  nameError && styles.inputError,
                ]}
                value={formData.last_name}
                placeholder="Last Name"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>

            {/* Name Validation Error */}
            {nameError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{nameError}</Text>
              </View>
            )}

            {/* Email Address */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Email Address*</Text>
              <TextInput
                style={styles.input}
                value={formData.email_address}
                onChangeText={(value) =>
                  updateFormField("email_address", value)
                }
                placeholder="johndoe@gmail.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, phoneError && styles.inputError]}
                value={formData.phone_number}
                onChangeText={(value) => updateFormField("phone_number", value)}
                placeholder="09xxxxxxxxx"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={15}
              />
              {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
            </View>

            {/* Separator Line */}
            <View style={styles.separator} />

            {/* Payment Details Section */}
            <Text style={styles.sectionTitle}>Payment Details</Text>

            {/* Type of Fee */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Type of Fee*</Text>
              <Dropdown
                placeholder="Select Fee Type"
                value={formData.fee}
                onValueChange={(value) => updateFormField("fee", value)}
                options={feesOptions}
              />
            </View>

            {/* Amount */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Amount (PHP)*</Text>
              <TextInput
                style={[
                  styles.input,
                  amountError && styles.inputError,
                  isAuthenticated &&
                    user?.role === "student" &&
                    formData.fee === "document_fee" &&
                    styles.inputReadOnly,
                ]}
                value={formData.amount}
                onChangeText={(value) => updateFormField("amount", value)}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                editable={
                  !(
                    isAuthenticated &&
                    user?.role === "student" &&
                    formData.fee === "document_fee"
                  )
                }
              />
              {amountError && (
                <Text style={styles.errorText}>{amountError}</Text>
              )}
              {formData.fee === "down_payment" && !amountError && (
                <Text style={styles.hintText}>Minimum down payment: ₱3,000</Text>
              )}
              {selectedEnrollmentBalance !== null &&
                formData.courseId &&
                formData.batchId && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#2196f3",
                      marginTop: 4,
                    }}
                  >
                    Outstanding balance: ₱
                    {selectedEnrollmentBalance.toFixed(2)}. You can pay any
                    amount up to this balance.
                  </Text>
                )}
              {isAuthenticated &&
                user?.role === "student" &&
                formData.fee === "document_fee" && (
                  <Text style={styles.lockedAmountNote}>
                    <Icon name="info" size={12} color="#6b7280" /> Amount is
                    locked for document fees
                  </Text>
                )}
            </View>

            {/* Payment Disabled Message for Non-positive Balance */}
            {selectedEnrollmentBalance !== null &&
              selectedEnrollmentBalance <= 0 &&
              formData.courseId &&
              formData.batchId && (
                <View
                  style={{
                    backgroundColor: '#f0fdf4',
                    padding: 12,
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: '#22c55e',
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <Icon name="check-circle" size={20} color="#16a34a" style={{ marginTop: 1 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534', marginBottom: 4 }}>
                        No Payment Required
                      </Text>
                      <Text style={{ fontSize: 13, color: '#166534', lineHeight: 18 }}>
                        {selectedEnrollmentBalance < 0
                          ? `You have a credit balance of ₱${Math.abs(selectedEnrollmentBalance).toFixed(2)}. No payment is needed for this course.`
                          : 'This course is fully paid. No outstanding balance.'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || !!nameError || (selectedEnrollmentBalance !== null && selectedEnrollmentBalance <= 0)) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !!nameError || (selectedEnrollmentBalance !== null && selectedEnrollmentBalance <= 0)}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};
