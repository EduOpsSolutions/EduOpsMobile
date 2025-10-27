import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { useEnrollmentStore } from "../../stores/enrollmentStore";
import { ForgotEnrollmentIdModal } from "./ForgotEnrollmentIdModal";

interface TrackEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackEnrollmentModal: React.FC<TrackEnrollmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { trackEnrollment } = useEnrollmentStore();

  const [enrollmentId, setEnrollmentId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotIdModalOpen, setForgotIdModalOpen] = useState(false);

  const handleSubmit = async () => {
    // Validation: At least one field must be filled
    if (!enrollmentId.trim() && !email.trim()) {
      Alert.alert(
        "Input Required",
        "Please provide either Enrollment ID or Email address."
      );
      return;
    }

    // Email format validation if email is provided
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Call the trackEnrollment method from store
      await trackEnrollment(
        enrollmentId.trim() || undefined,
        email.trim() || undefined
      );

      // Success - close modal and navigate
      setIsLoading(false);
      onClose();

      // Clear inputs
      setEnrollmentId("");
      setEmail("");

      // Navigate to enrollment status screen
      router.push("/enrollment/status" as any as RelativePathString);
    } catch (error: any) {
      setIsLoading(false);
      // Error is already handled in the store with Alert.alert
      // Just log it here
      console.error("Track enrollment error:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEnrollmentId("");
      setEmail("");
      onClose();
    }
  };

  return (
    <>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Track Enrollment</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.description}>
                  Enter your Enrollment ID or Email address to track your
                  enrollment status.
                </Text>

                {/* Enrollment ID Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Enrollment ID</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="badge"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter enrollment ID"
                      placeholderTextColor="#999"
                      value={enrollmentId}
                      onChangeText={setEnrollmentId}
                      autoCapitalize="characters"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* OR Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="email"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Forgot ID Link */}
                <TouchableOpacity
                  style={styles.forgotLinkContainer}
                  onPress={() => setForgotIdModalOpen(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.forgotLinkText}>
                    Forgot enrollment ID?
                  </Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isLoading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Track Now</Text>
                  )}
                </TouchableOpacity>

                {/* Info Text */}
                <View style={styles.infoContainer}>
                  <Icon
                    name="info-outline"
                    size={16}
                    color="#666"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoText}>
                    You can track your enrollment using either your Enrollment
                    ID or the email address you used during registration.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Forgot Enrollment ID Modal */}
      <ForgotEnrollmentIdModal
        isOpen={forgotIdModalOpen}
        onClose={() => setForgotIdModalOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#de0000",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    color: "#333",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  forgotLinkContainer: {
    alignItems: "flex-start",
    marginBottom: 24,
  },
  forgotLinkText: {
    fontSize: 18,
    color: "#de0000",
    textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: "#de0000",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginTop: 16,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: "#1e40af",
    lineHeight: 18,
  },
});
