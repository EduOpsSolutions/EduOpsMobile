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
import { authApi } from "../../utils/api";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation: Email is required
    if (!email.trim()) {
      Alert.alert("Input Required", "Please enter your email address.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.requestResetPassword(email.trim());

      setIsLoading(false);

      if (response.error) {
        // Show warning for user not found or other errors
        Alert.alert("Warning", response.message || "Unable to process request.");
        return;
      }

      // Success
      Alert.alert(
        "Success",
        response.message || "Password reset link has been sent to your email.",
        [
          {
            text: "OK",
            onPress: () => {
              setEmail("");
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        "Error",
        error.message || "An error occurred. Please try again."
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail("");
      onClose();
    }
  };

  return (
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
              <Text style={styles.title}>Forgot Password?</Text>
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
                Please provide the email address that you used when you signed
                up for your account. We will send you an email with a link to
                reset your password.
              </Text>

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
                    autoFocus={true}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!email.trim() || isLoading) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!email.trim() || isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Sending...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Reset Password</Text>
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
                  The reset link will expire in 30 minutes. If you don't receive
                  the email, please check your spam folder.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
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
    marginTop: 8,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 18,
  },
});
