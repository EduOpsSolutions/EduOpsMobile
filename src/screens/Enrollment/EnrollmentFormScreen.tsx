import React, { useState, useEffect } from "react";
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
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./EnrollmentFormScreen.styles";
import { RelativePathString, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useEnrollmentStore } from "../../stores/enrollmentStore";
import { EnrollmentFormData } from "../../types/enrollment";
import { GuestNavbar } from "../../components/common/GuestNavbar";
import { checkOngoingEnrollmentPeriod } from "../../utils/enrollmentPeriodUtils";
import { coursesApi, fileApi } from "../../utils/api";

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  title?: string;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  value,
  onValueChange,
  options,
  title,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, error && styles.inputError]}
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

interface Course {
  id: string;
  name: string;
  price: number;
  visibility: string;
}

interface EnrollmentPeriod {
  id: string;
  batchName: string;
  endAt: string;
}

export default function EnrollmentFormScreen(): React.JSX.Element {
  const router = useRouter();
  const { createEnrollment } = useEnrollmentStore();
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    extensions: "",
    honorific: "",
    sex: "",
    birthDate: new Date().toISOString(),
    civilStatus: "",
    address: "",
    referredBy: "",
    contactNumber: "",
    altContactNumber: "",
    preferredEmail: "",
    altEmail: "",
    motherName: "",
    motherContact: "",
    fatherName: "",
    fatherContact: "",
    guardianName: "",
    guardianContact: "",
    coursesToEnroll: "",
    validIdPath: "",
    idPhotoPath: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EnrollmentFormData, string>>
  >({});

  // File upload states
  const [validId, setValidId] = useState<any>(null);
  const [idPhoto, setIdPhoto] = useState<any>(null);
  const [validIdUploading, setValidIdUploading] = useState(false);
  const [idPhotoUploading, setIdPhotoUploading] = useState(false);

  // Course states
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Enrollment period states
  const [enrollmentPeriodCheck, setEnrollmentPeriodCheck] = useState({
    loading: true,
    hasOngoingPeriod: false,
    currentPeriod: null as EnrollmentPeriod | null,
    error: null as string | null,
  });

  const updateFormData = (field: keyof EnrollmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const honorificOptions = ["Mr.", "Ms.", "Mrs."];
  const sexOptions = ["Male", "Female"];
  const civilStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const referredByOptions = [
    "Family",
    "Colleague",
    "Social Media",
    "Website",
    "Other",
  ];

  // Fetch enrollment period
  const checkEnrollmentPeriod = async () => {
    try {
      setEnrollmentPeriodCheck((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const result = await checkOngoingEnrollmentPeriod();

      setEnrollmentPeriodCheck({
        loading: false,
        hasOngoingPeriod: result.hasOngoingPeriod,
        currentPeriod: result.currentPeriod,
        error: result.error,
      });

      return result;
    } catch (error) {
      console.error("Failed to check enrollment periods:", error);
      const errorResult = {
        hasOngoingPeriod: false,
        currentPeriod: null,
        error: "Failed to check enrollment availability",
      };

      setEnrollmentPeriodCheck({
        loading: false,
        ...errorResult,
      });

      return errorResult;
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await coursesApi.getCourses();
      const visibleCourses = response.filter(
        (course: Course) => course.visibility === "visible"
      );
      setCourses(visibleCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      Alert.alert(
        "Error",
        "Failed to load available courses. Please refresh the page."
      );
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      const periodCheck = await checkEnrollmentPeriod();

      // Only fetch courses if enrollment is available
      if (periodCheck.hasOngoingPeriod) {
        await fetchCourses();
      }
    };

    initializePage();
  }, []);

  // Request image picker permissions
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload images."
        );
      }
    })();
  }, []);

  // Handle image picking
  const pickImage = async (type: "validId" | "idPhoto") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "idPhoto" ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Upload file
        if (type === "validId") {
          setValidIdUploading(true);
          try {
            const formData: any = {
              uri: asset.uri,
              type: "image/jpeg",
              name: `valid_id_${Date.now()}.jpg`,
            };

            const uploadResult = await fileApi.guestUploadFile(
              formData,
              "proof-ids"
            );

            if (uploadResult.error) {
              Alert.alert("Error", "Failed to upload Valid ID");
              return;
            }

            setValidId(uploadResult.data.downloadURL);
            setFormData((prev) => ({
              ...prev,
              validIdPath: uploadResult.data.downloadURL,
            }));
          } catch (error) {
            Alert.alert("Error", "Failed to upload Valid ID");
          } finally {
            setValidIdUploading(false);
          }
        } else if (type === "idPhoto") {
          setIdPhotoUploading(true);
          try {
            const formData: any = {
              uri: asset.uri,
              type: "image/jpeg",
              name: `id_photo_${Date.now()}.jpg`,
            };

            const uploadResult = await fileApi.guestUploadFile(
              formData,
              "enrollment"
            );

            if (uploadResult.error) {
              Alert.alert("Error", "Failed to upload 2x2 ID Photo");
              return;
            }

            setIdPhoto(uploadResult.data.downloadURL);
            setFormData((prev) => ({
              ...prev,
              idPhotoPath: uploadResult.data.downloadURL,
            }));
          } catch (error) {
            Alert.alert("Error", "Failed to upload 2x2 ID Photo");
          } finally {
            setIdPhotoUploading(false);
          }
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EnrollmentFormData, string>> = {};

    // Required fields validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.honorific) newErrors.honorific = "Honorific is required";
    if (!formData.sex) newErrors.sex = "Sex is required";
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
    if (!formData.validIdPath) newErrors.validIdPath = "Valid ID is required";
    if (!formData.idPhotoPath)
      newErrors.idPhotoPath = "2x2 ID Photo is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.preferredEmail && !emailRegex.test(formData.preferredEmail)) {
      newErrors.preferredEmail = "Please enter a valid email";
    }
    if (formData.altEmail && !emailRegex.test(formData.altEmail)) {
      newErrors.altEmail = "Please enter a valid email";
    }

    // Phone validation - numeric only, 11-15 characters
    const phoneRegex = /^\d{11,15}$/;
    if (formData.contactNumber && !phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 11-15 digits";
    }
    if (
      formData.altContactNumber &&
      formData.altContactNumber.trim() !== "" &&
      !phoneRegex.test(formData.altContactNumber)
    ) {
      newErrors.altContactNumber = "Alternate contact must be 11-15 digits";
    }
    if (
      formData.motherContact &&
      formData.motherContact.trim() !== "" &&
      !phoneRegex.test(formData.motherContact)
    ) {
      newErrors.motherContact = "Mother's contact must be 11-15 digits";
    }
    if (
      formData.fatherContact &&
      formData.fatherContact.trim() !== "" &&
      !phoneRegex.test(formData.fatherContact)
    ) {
      newErrors.fatherContact = "Father's contact must be 11-15 digits";
    }
    if (
      formData.guardianContact &&
      formData.guardianContact.trim() !== "" &&
      !phoneRegex.test(formData.guardianContact)
    ) {
      newErrors.guardianContact = "Guardian's contact must be 11-15 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Incorrect Input",
        "Please fill in all required fields correctly"
      );
      return;
    }

    // Check if uploads are still in progress
    if (validIdUploading || idPhotoUploading) {
      Alert.alert("Please Wait", "File uploads are still in progress");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get selected course details (name and price) based on course ID
      const selectedCourse = courses.find(
        (course) => course.id === formData.coursesToEnroll
      );

      if (!selectedCourse) {
        throw new Error("Selected course not found");
      }

      // Create enrollment data with course name (matching web app)
      const enrollmentData = {
        ...formData,
        coursesToEnroll: selectedCourse.name,
      };

      const response = await createEnrollment(enrollmentData);

      // Navigate to enrollment status screen
      router.replace("/enrollment/status" as any as RelativePathString);
    } catch (error: any) {
      // Error already handled in store
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle contact number input - only allow numbers
  const handleContactNumberChange = (
    field: keyof EnrollmentFormData,
    value: string
  ) => {
    const numericValue = value.replace(/\D/g, "");
    updateFormData(field, numericValue);
  };

  // Loading state
  if (enrollmentPeriodCheck.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#de0000" barStyle="light-content" />
        <GuestNavbar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#de0000" />
          <Text style={styles.loadingText}>
            Checking enrollment availability...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // No ongoing enrollment period
  if (!enrollmentPeriodCheck.hasOngoingPeriod) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#de0000" barStyle="light-content" />
        <GuestNavbar />
        <ScrollView
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.unavailableContainer}>
            <Icon name="warning" size={80} color="#999" />
            <Text style={styles.unavailableTitle}>
              Enrollment Currently Unavailable
            </Text>
            <Text style={styles.unavailableText}>
              We're sorry, enrollment has ended or has not yet started.
            </Text>

            {enrollmentPeriodCheck.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {enrollmentPeriodCheck.error}
                </Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>What can you do?</Text>
              <Text style={styles.infoItem}>
                • Check back regularly for new enrollment period.
              </Text>
              <Text style={styles.infoItem}>
                • Follow our social media for enrollment announcements.
              </Text>
              <Text style={styles.infoItem}>
                • Contact us directly for information about upcoming
                enrollments.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace("/" as any as RelativePathString)}
            >
              <Text style={styles.homeButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          {/* Current Enrollment Period Info */}
          {enrollmentPeriodCheck.currentPeriod && (
            <View style={styles.periodInfoContainer}>
              <Text style={styles.periodInfoTitle}>
                Current Enrollment Period
              </Text>
              <Text style={styles.periodBatchName}>
                Batch: {enrollmentPeriodCheck.currentPeriod.batchName}
              </Text>
              <Text style={styles.periodEndDate}>
                Ends:{" "}
                {new Date(
                  enrollmentPeriodCheck.currentPeriod.endAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Enrollment Form</Text>
            <Text style={styles.requiredText}>
              Items with (*) are required fields
            </Text>

            {/* First Row - First Name, Middle Name, Last Name */}
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

            {/* Second Row - Last Name and Extensions */}
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
                <Text style={styles.label}>Extension</Text>
                <TextInput
                  style={styles.input}
                  value={formData.extensions}
                  onChangeText={(value) => updateFormData("extensions", value)}
                  placeholder="Jr., Sr., III, etc."
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Third Row - Honorific, Sex, Birth Date */}
            <View style={styles.row}>
              <View style={styles.thirdFieldContainer}>
                <Text style={styles.label}>Honorific*</Text>
                <Dropdown
                  placeholder="Select"
                  value={formData.honorific}
                  onValueChange={(value) => updateFormData("honorific", value)}
                  options={honorificOptions}
                  error={errors.honorific}
                />
                {errors.honorific && (
                  <Text style={styles.errorText}>{errors.honorific}</Text>
                )}
              </View>
              <View style={styles.thirdFieldContainer}>
                <Text style={styles.label}>Sex*</Text>
                <Dropdown
                  placeholder="Select"
                  value={formData.sex}
                  onValueChange={(value) => updateFormData("sex", value)}
                  options={sexOptions}
                  error={errors.sex}
                />
                {errors.sex && (
                  <Text style={styles.errorText}>{errors.sex}</Text>
                )}
              </View>
              <View style={styles.thirdFieldContainer}>
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
                  error={errors.civilStatus}
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
                  error={errors.referredBy}
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
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Contact Number*</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.contactNumber && styles.inputError,
                  ]}
                  placeholder="09xxxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.contactNumber}
                  onChangeText={(value) =>
                    handleContactNumberChange("contactNumber", value)
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                {errors.contactNumber && (
                  <Text style={styles.errorText}>{errors.contactNumber}</Text>
                )}
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Alternate Contact No.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09xxxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.altContactNumber}
                  onChangeText={(value) =>
                    handleContactNumberChange("altContactNumber", value)
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
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

            {/* Mother's Information */}
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Mother's Maiden Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.motherName}
                  onChangeText={(value) => updateFormData("motherName", value)}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09xxxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.motherContact}
                  onChangeText={(value) =>
                    handleContactNumberChange("motherContact", value)
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            {/* Father's Information */}
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Father's Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fatherName}
                  onChangeText={(value) => updateFormData("fatherName", value)}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09xxxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.fatherContact}
                  onChangeText={(value) =>
                    handleContactNumberChange("fatherContact", value)
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            {/* Guardian's Information */}
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Guardian's Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.guardianName}
                  onChangeText={(value) =>
                    updateFormData("guardianName", value)
                  }
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09xxxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.guardianContact}
                  onChangeText={(value) =>
                    handleContactNumberChange("guardianContact", value)
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            {/* Course Selection */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Course to Enroll*</Text>
              <Dropdown
                placeholder={
                  coursesLoading
                    ? "Loading courses..."
                    : courses.length > 0
                    ? "Select a course"
                    : "No courses available"
                }
                value={
                  courses.find((c) => c.id === formData.coursesToEnroll)
                    ?.name || ""
                }
                onValueChange={(value) => {
                  const selectedCourse = courses.find((c) => c.name === value);
                  if (selectedCourse) {
                    updateFormData("coursesToEnroll", selectedCourse.id);
                  }
                }}
                options={courses.map((c) => c.name)}
                error={errors.coursesToEnroll}
              />
              {errors.coursesToEnroll && (
                <Text style={styles.errorText}>{errors.coursesToEnroll}</Text>
              )}
            </View>

            {/* File Uploads */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>
                Upload Valid ID (front and back)*
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  errors.validIdPath && styles.inputError,
                ]}
                onPress={() => pickImage("validId")}
                disabled={validIdUploading}
              >
                {validIdUploading ? (
                  <ActivityIndicator color="#de0000" />
                ) : validId ? (
                  <>
                    <Icon name="check-circle" size={20} color="#22c55e" />
                    <Text style={styles.uploadButtonTextSuccess}>
                      Valid ID Uploaded
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="cloud-upload" size={20} color="#666" />
                    <Text style={styles.uploadButtonText}>Choose Valid ID</Text>
                  </>
                )}
              </TouchableOpacity>
              {errors.validIdPath && (
                <Text style={styles.errorText}>{errors.validIdPath}</Text>
              )}
            </View>

            <View style={styles.fullWidth}>
              <Text style={styles.label}>
                Upload 2X2 ID Photo (white background)*
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  errors.idPhotoPath && styles.inputError,
                ]}
                onPress={() => pickImage("idPhoto")}
                disabled={idPhotoUploading}
              >
                {idPhotoUploading ? (
                  <ActivityIndicator color="#de0000" />
                ) : idPhoto ? (
                  <>
                    <Icon name="check-circle" size={20} color="#22c55e" />
                    <Text style={styles.uploadButtonTextSuccess}>
                      2x2 ID Photo Uploaded
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="cloud-upload" size={20} color="#666" />
                    <Text style={styles.uploadButtonText}>
                      Choose 2x2 ID Photo
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {errors.idPhotoPath && (
                <Text style={styles.errorText}>{errors.idPhotoPath}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                (isSubmitting || validIdUploading || idPhotoUploading) &&
                  styles.nextButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || validIdUploading || idPhotoUploading}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : validIdUploading || idPhotoUploading ? (
                <Text style={styles.nextButtonText}>Uploading...</Text>
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
