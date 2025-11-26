import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./GuestPaymentScreen.styles";
import { GuestNavbar } from "../../components/common/GuestNavbar";
import { usePaymentStore } from "@/src/stores/paymentStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  value,
  onValueChange,
  options,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {selectedLabel || placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={16} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || placeholder}</Text>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <Icon name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.modalScrollView}
                  showsVerticalScrollIndicator={true}
                >
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.modalOption,
                        value === option.value && styles.modalOptionSelected,
                        index === options.length - 1 && styles.modalOptionLast,
                      ]}
                      onPress={() => {
                        onValueChange(option.value);
                        setIsOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          value === option.value &&
                            styles.modalOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {value === option.value && (
                        <Icon name="check" size={20} color="#de0000" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export const GuestPaymentScreen = (): React.JSX.Element => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const studentId = params.studentId as string | undefined;

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
    sendPaymentLinkEmail,
    setLoading,
  } = usePaymentStore();

  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  // Clear form when component mounts
  useEffect(() => {
    resetForm();
  }, []);

  // Fetch courses and batches for guest payments
  useEffect(() => {
    const fetchCoursesAndBatches = async () => {
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
    };
    fetchCoursesAndBatches();
  }, []);

  // Prefill student ID if provided via URL params
  useEffect(() => {
    if (studentId && studentId !== formData.student_id) {
      updateFormField("student_id", studentId);
      // Automatically fetch student data
      const fetchStudent = async () => {
        setIsFetchingStudent(true);
        await validateAndFetchStudentByID(studentId);
        setIsFetchingStudent(false);
      };
      fetchStudent();
    }
  }, [studentId]);

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
    if (studentId) {
      setIsFetchingStudent(true);
      await validateAndFetchStudentByID(studentId);
      setIsFetchingStudent(false);
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
                  `A payment link has been sent to ${paymentData.email}\n\nYou can complete your payment using the link in your email.\n\nYou will be redirected to the login page.`,
                  [
                    {
                      text: "Open Payment Link",
                      onPress: () => {
                        if (paymentId) {
                          const clientBaseUrl =
                            `${process.env.EXPO_PUBLIC_CLIENT_URL}` ||
                            "https://eduops.vercel.app";
                          const paymentUrl = `${clientBaseUrl}/payment?paymentId=${paymentId}`;
                          Linking.openURL(paymentUrl).catch((err) => {
                            console.error("Failed to open payment link:", err);
                            Alert.alert(
                              "Error",
                              "Could not open payment link. Please check your email."
                            );
                          });
                        }
                        resetForm();
                        router.replace("/");
                      },
                    },
                    {
                      text: "Go to Login",
                      onPress: () => {
                        resetForm();
                        router.replace("/");
                      },
                    },
                  ]
                );
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

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />

      <GuestNavbar />

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

            {/* Student ID - No "Use My ID" button for guest */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Student ID*</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[
                    styles.input,
                    isFetchingStudent && styles.inputDisabled,
                  ]}
                  value={formData.student_id}
                  onChangeText={(value) => updateFormField("student_id", value)}
                  onBlur={handleStudentIdBlur}
                  placeholder="Enter Student ID"
                  placeholderTextColor="#999"
                  editable={!isFetchingStudent}
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

            {/* Course & Batch selection for guest payments */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Course*</Text>
                {courses.length > 0 ? (
                  <Dropdown
                    placeholder="Select course"
                    label="Select Course"
                    value={formData.courseId || ""}
                    onValueChange={(value) =>
                      updateFormField("courseId", value)
                    }
                    options={[
                      { value: "", label: "Select course" },
                      ...courses
                        .filter((c: any) => !c.deletedAt)
                        .map((c: any) => ({
                          value: c.id,
                          label: c.name,
                        })),
                    ]}
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      Loading courses...
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Batch/Period*</Text>
                {batches.length > 0 ? (
                  <Dropdown
                    placeholder="Select batch"
                    label="Select Batch/Period"
                    value={formData.batchId || ""}
                    onValueChange={(value) => updateFormField("batchId", value)}
                    options={[
                      { value: "", label: "Select batch" },
                      ...batches
                        .filter((b: any) => !b.deletedAt)
                        .map((b: any) => ({
                          value: b.id,
                          label: `${b.batchName || b.name}${
                            b.schoolYear ? ` (${b.schoolYear})` : ""
                          }`,
                        })),
                    ]}
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      Loading batches...
                    </Text>
                  </View>
                )}
              </View>
            </View>

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
              <Text style={styles.label}>Phone Number*</Text>
              <TextInput
                style={[styles.input, phoneError && styles.inputError]}
                value={formData.phone_number}
                onChangeText={(value) => updateFormField("phone_number", value)}
                placeholder="+63 XXX XXX XXXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
              {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
            </View>

            {/* Fee Type */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Fee Type*</Text>
              <Dropdown
                placeholder="Select Fee Type"
                label="Select Fee Type"
                value={formData.fee}
                onValueChange={(value) => updateFormField("fee", value)}
                options={feesOptions}
              />
            </View>

            {/* Amount */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Amount*</Text>
              <TextInput
                style={[styles.input, amountError && styles.inputError]}
                value={formData.amount}
                onChangeText={(value) => updateFormField("amount", value)}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
              {amountError && (
                <Text style={styles.errorText}>{amountError}</Text>
              )}
              {formData.fee === "down_payment" && !amountError && (
                <Text style={styles.hintText}>Minimum down payment: ₱3,000</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Payment Link</Text>
              )}
            </TouchableOpacity>

            {/* Information Panel */}
            <View style={styles.infoPanel}>
              <Icon name="info" size={20} color="#0066cc" />
              <View style={styles.infoPanelContent}>
                <Text style={styles.infoPanelTitle}>How it works:</Text>
                <Text style={styles.infoPanelText}>
                  • Enter your Student ID to auto-fill your information
                </Text>
                <Text style={styles.infoPanelText}>
                  • Provide your email and phone number for the payment link
                </Text>
                <Text style={styles.infoPanelText}>
                  • Select the fee type and enter the amount
                </Text>
                <Text style={styles.infoPanelText}>
                  • Click "Send Payment Link" to receive the payment link via
                  email
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
