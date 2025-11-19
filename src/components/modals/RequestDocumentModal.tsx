import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  DocumentTemplate,
  DocumentRequestFormData,
  RequestMode,
  PaymentMethod,
} from "../../types/document";
import { useAuthStore } from "../../stores/authStore";

interface RequestDocumentModalProps {
  visible: boolean;
  document: DocumentTemplate | null;
  onClose: () => void;
  onSubmit: (requestData: DocumentRequestFormData) => Promise<void>;
  loading?: boolean;
}

export const RequestDocumentModal: React.FC<RequestDocumentModalProps> = ({
  visible,
  document,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<DocumentRequestFormData>({
    documentId: "",
    email: "",
    phone: "",
    mode: "pickup",
    paymentMethod: "online",
    purpose: "",
    additionalNotes: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible && document && user) {
      setFormData({
        documentId: document.id,
        email: user.email || "",
        phone: user.phone || "",
        mode: "pickup",
        paymentMethod: "online",
        purpose: "",
        additionalNotes: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      });
      setErrors({});
    }
  }, [visible, document, user]);

  const handleModeChange = (mode: RequestMode) => {
    setFormData((prev) => ({
      ...prev,
      mode,
      // If cash payment and switching to delivery, change to online
      paymentMethod:
        prev.paymentMethod === "cash" && mode === "delivery"
          ? "online"
          : prev.paymentMethod,
    }));
  };

  const handlePaymentMethodChange = (paymentMethod: PaymentMethod) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod,
      // If cash is selected, force pickup mode
      mode: paymentMethod === "cash" ? "pickup" : prev.mode,
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (!document) return null;

  const isPaid = document.price === "paid";
  const showDeliveryFields = formData.mode === "delivery";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="assignment" size={24} color="#2563eb" />
              <Text style={styles.headerTitle}>Request Document</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Document Info */}
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{document.documentName}</Text>
              <Text style={styles.documentPrice}>{document.displayPrice}</Text>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+63 XXX XXX XXXX"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Delivery Mode */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Mode *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleModeChange("pickup")}
                >
                  <Icon
                    name={
                      formData.mode === "pickup"
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color="#2563eb"
                  />
                  <Text style={styles.radioLabel}>Pickup</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    formData.paymentMethod === "cash" &&
                      styles.radioOptionDisabled,
                  ]}
                  onPress={() => handleModeChange("delivery")}
                  disabled={formData.paymentMethod === "cash"}
                >
                  <Icon
                    name={
                      formData.mode === "delivery"
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={
                      formData.paymentMethod === "cash" ? "#d1d5db" : "#2563eb"
                    }
                  />
                  <Text
                    style={[
                      styles.radioLabel,
                      formData.paymentMethod === "cash" &&
                        styles.radioLabelDisabled,
                    ]}
                  >
                    Delivery
                  </Text>
                </TouchableOpacity>
              </View>
              {formData.paymentMethod === "cash" && (
                <Text style={styles.helperText}>
                  * Cash payment is only available for pickup
                </Text>
              )}
            </View>

            {/* Payment Method */}
            {isPaid && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                    style={styles.picker}
                  >
                    <Picker.Item label="Cash (Pickup Only)" value="cash" />
                    <Picker.Item label="Pay Online" value="online" />
                  </Picker>
                </View>
              </View>
            )}

            {/* Delivery Address */}
            {showDeliveryFields && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>

                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123 Main St."
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                />

                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                />

                <Text style={styles.label}>State/Province *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State/Province"
                  value={formData.state}
                  onChangeText={(text) =>
                    setFormData({ ...formData, state: text })
                  }
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>ZIP Code *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ZIP"
                      value={formData.zipCode}
                      onChangeText={(text) =>
                        setFormData({ ...formData, zipCode: text })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Country *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Country"
                      value={formData.country}
                      onChangeText={(text) =>
                        setFormData({ ...formData, country: text })
                      }
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Purpose */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Purpose *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Please specify the purpose of this request..."
                value={formData.purpose}
                onChangeText={(text) =>
                  setFormData({ ...formData, purpose: text })
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Additional Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Additional Notes (Optional)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any additional information..."
                value={formData.additionalNotes}
                onChangeText={(text) =>
                  setFormData({ ...formData, additionalNotes: text })
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.submitButtonText}>Submitting...</Text>
              ) : (
                <>
                  <Icon name="send" size={16} color="white" />
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  documentInfo: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  documentPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "white",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: "#374151",
  },
  radioOptionDisabled: {
    opacity: 0.5,
  },
  radioLabelDisabled: {
    color: "#9ca3af",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "white",
  },
  picker: {
    height: 54,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  submitButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
