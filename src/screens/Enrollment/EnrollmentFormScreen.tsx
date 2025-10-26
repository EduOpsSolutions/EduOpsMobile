import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./EnrollmentFormScreen.styles";
import { RelativePathString, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEnrollmentStore } from "../../stores/enrollmentStore";
import { EnrollmentFormData } from "../../types/enrollment";
import { GuestNavbar } from "../../components/common/GuestNavbar";

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  title?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  value,
  onValueChange,
  options,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            {title && <Text style={styles.modalTitle}>{title}</Text>}
            <ScrollView style={styles.dropdownOptions}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => {
                    onValueChange(option);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function EnrollmentFormScreen(): React.JSX.Element {
  const router = useRouter();
  const { createEnrollment } = useEnrollmentStore();
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: new Date().toISOString(),
    civilStatus: "",
    address: "",
    referredBy: "",
    contactNumber: "",
    altContactNumber: "",
    preferredEmail: "",
    altEmail: "",
    motherName: "",
    fatherName: "",
    guardianName: "",
    guardianContact: "",
    coursesToEnroll: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EnrollmentFormData, string>>
  >({});

  const updateFormData = (field: keyof EnrollmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const sexOptions = ["Male", "Female"];
  const civilStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const referredByOptions = [
    "Friend",
    "Family",
    "Online",
    "Advertisement",
    "Other",
  ];
  const courseOptions = [
    "German Language Course",
    "English Course",
    "French Course",
    "Spanish Course",
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EnrollmentFormData, string>> = {};

    // Required fields validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.birthDate.trim())
      newErrors.birthDate = "Birth date is required";
    if (!formData.civilStatus)
      newErrors.civilStatus = "Civil status is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.referredBy) newErrors.referredBy = "Referred by is required";
    if (!formData.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";
    if (!formData.preferredEmail.trim())
      newErrors.preferredEmail = "Email is required";
    if (!formData.coursesToEnroll)
      newErrors.coursesToEnroll = "Please select a course";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.preferredEmail && !emailRegex.test(formData.preferredEmail)) {
      newErrors.preferredEmail = "Please enter a valid email";
    }
    if (formData.altEmail && !emailRegex.test(formData.altEmail)) {
      newErrors.altEmail = "Please enter a valid email";
    }

    // Phone validation (Philippine format)
    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (
      formData.contactNumber &&
      !phoneRegex.test(formData.contactNumber.replace(/\s/g, ""))
    ) {
      newErrors.contactNumber = "Please enter a valid Philippine mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createEnrollment(formData);
      // Navigate to enrollment status screen
      router.replace("/enrollment/status" as any as RelativePathString);
    } catch (error) {
      // Error already handled in store
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />

      <GuestNavbar />

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Enrollment Form</Text>
            <Text style={styles.requiredText}>
              Items with (*) are required fields
            </Text>

            {/* First Row - First Name and Middle Name */}
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>First Name*</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData("firstName", value)}
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Middle Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.middleName}
                  onChangeText={(value) => updateFormData("middleName", value)}
                />
              </View>
            </View>

            {/* Second Row - Last Name and Birth Date */}
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Last Name*</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData("lastName", value)}
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Birth Date*</Text>
                <TouchableOpacity
                  onPress={() => setBirthDateOpen(true)}
                  style={styles.dateInputContainer}
                >
                  <Text style={styles.dateInput}>
                    {formData.birthDate
                      ? new Date(formData.birthDate).toLocaleDateString()
                      : "Select birth date"}
                  </Text>
                  <Icon name="calendar-today" size={20} color="#666" />
                </TouchableOpacity>
                {errors.birthDate && (
                  <Text style={styles.errorText}>{errors.birthDate}</Text>
                )}
              </View>
            </View>

            {/* Civil Status and Referred By */}
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Civil Status*</Text>
                <Dropdown
                  placeholder="Select"
                  value={formData.civilStatus}
                  onValueChange={(value) =>
                    updateFormData("civilStatus", value)
                  }
                  options={civilStatusOptions}
                />
                {errors.civilStatus && (
                  <Text style={styles.errorText}>{errors.civilStatus}</Text>
                )}
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Referred By*</Text>
                <Dropdown
                  placeholder="Select"
                  value={formData.referredBy}
                  onValueChange={(value) => updateFormData("referredBy", value)}
                  options={referredByOptions}
                />
                {errors.referredBy && (
                  <Text style={styles.errorText}>{errors.referredBy}</Text>
                )}
              </View>
            </View>

            {/* Current Address */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Current Address*</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Street, Barangay, City, Province, Zip Code"
                placeholderTextColor="#999"
                value={formData.address}
                onChangeText={(value) => updateFormData("address", value)}
                multiline
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            {/* Contact Numbers */}
            <View style={styles.row}>
              <Text style={styles.label}>Contact Number*</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.contactNumber && styles.inputError,
                ]}
                placeholder="+63 9xxxxxxxxx"
                placeholderTextColor="#999"
                value={formData.contactNumber}
                onChangeText={(value) => updateFormData("contactNumber", value)}
                keyboardType="phone-pad"
              />
              {errors.contactNumber && (
                <Text style={styles.errorText}>{errors.contactNumber}</Text>
              )}
              <Text style={styles.label}>Alternate Contact No.</Text>
              <TextInput
                style={styles.input}
                placeholder="+63 9xxxxxxxxx"
                placeholderTextColor="#999"
                value={formData.altContactNumber}
                onChangeText={(value) =>
                  updateFormData("altContactNumber", value)
                }
                keyboardType="phone-pad"
              />
            </View>

            {/* Email Addresses */}
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email Address*</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.preferredEmail && styles.inputError,
                  ]}
                  placeholder="johndoe@gmail.com"
                  placeholderTextColor="#999"
                  value={formData.preferredEmail}
                  onChangeText={(value) =>
                    updateFormData("preferredEmail", value)
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.preferredEmail && (
                  <Text style={styles.errorText}>{errors.preferredEmail}</Text>
                )}
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Alternate Email Address</Text>
                <TextInput
                  style={[styles.input, errors.altEmail && styles.inputError]}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#999"
                  value={formData.altEmail}
                  onChangeText={(value) => updateFormData("altEmail", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.altEmail && (
                  <Text style={styles.errorText}>{errors.altEmail}</Text>
                )}
              </View>
            </View>

            {/* Course Selection */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Course to Enroll*</Text>
              <Dropdown
                placeholder="Select a course"
                value={formData.coursesToEnroll}
                onValueChange={(value) =>
                  updateFormData("coursesToEnroll", value)
                }
                options={courseOptions}
              />
              {errors.coursesToEnroll && (
                <Text style={styles.errorText}>{errors.coursesToEnroll}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                isSubmitting && styles.nextButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextButtonText}>Submit Enrollment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {birthDateOpen && (
        <DateTimePicker
          value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setBirthDateOpen(false);
            if (selectedDate) {
              setFormData({
                ...formData,
                birthDate: selectedDate.toISOString(),
              });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
