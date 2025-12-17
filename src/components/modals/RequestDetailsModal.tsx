import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
  Clipboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Icon from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { DocumentRequest } from "../../types/document";
import documentApi from "../../utils/documentApi";
import { usePaymentStore } from "../../stores/paymentStore";

interface RequestDetailsModalProps {
  visible: boolean;
  request: DocumentRequest | null;
  onClose: () => void;
  onUploadProof: (
    requestId: string,
    fileUri: string,
    fileName: string,
    fileType: string
  ) => Promise<void>;
  onRemoveProof: (requestId: string) => Promise<void>;
  loading?: boolean;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  visible,
  request,
  onClose,
  onUploadProof,
  onRemoveProof,
  loading = false,
}) => {
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedSignature, setCopiedSignature] = useState(false);
  const qrCodeRef = useRef<any>(null);

  if (!request) return null;

  const isFreeDocument = request.document?.price === "free";
  const isCashPayment = request.paymentMethod === "cash";

  const getStatusColor = (status: string) => {
    return documentApi.helpers.getStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_process":
        return "hourglass-empty";
      case "approved":
        return "check";
      case "ready_for_pickup":
        return "store";
      case "delivered":
        return "local-shipping";
      case "rejected":
        return "close";
      default:
        return "info";
    }
  };

  const handlePickImage = async (fromCamera: boolean) => {
    try {
      let result;

      if (fromCamera) {
        // Request camera permissions
        const cameraPermission =
          await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert(
            "Permission Required",
            "Camera access is required to take photos."
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        // Request gallery permissions
        const galleryPermission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPermission.granted) {
          Alert.alert(
            "Permission Required",
            "Gallery access is required to select photos."
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName =
          asset.uri.split("/").pop() || `proof-${Date.now()}.jpg`;

        // Determine file type based on URI extension
        let fileType = "image/jpeg";
        if (asset.uri.toLowerCase().endsWith(".png")) {
          fileType = "image/png";
        } else if (
          asset.uri.toLowerCase().endsWith(".jpg") ||
          asset.uri.toLowerCase().endsWith(".jpeg")
        ) {
          fileType = "image/jpeg";
        }

        setUploadingProof(true);
        await onUploadProof(request.id, asset.uri, fileName, fileType);
        setUploadingProof(false);
      }
    } catch (error: any) {
      setUploadingProof(false);
      Alert.alert(
        "Error",
        error.message || "Failed to upload proof of payment"
      );
    }
  };

  const handleUploadProof = () => {
    Alert.alert(
      "Upload Proof of Payment",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => handlePickImage(true),
        },
        {
          text: "Choose from Gallery",
          onPress: () => handlePickImage(false),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveProof = () => {
    Alert.alert(
      "Remove Proof of Payment",
      "Are you sure you want to remove this proof of payment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await onRemoveProof(request.id);
            } catch (error) {
              // Error handled in store
            }
          },
        },
      ]
    );
  };

  const handleProceedToPayment = () => {
    const { updateFormField } = usePaymentStore.getState();

    Alert.alert(
      "Proceed to Payment",
      "You will be redirected to the payment form to complete payment for this document.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            // Pre-fill payment form with document fee details
            updateFormField("fee", "document_fee");
            if (request.document?.amount) {
              updateFormField("amount", request.document.amount.toString());
            }

            // Close the modal
            onClose();

            // Navigate to payment screen
            router.push("/paymentform");
          },
        },
      ]
    );
  };

  const handleCopySignature = async () => {
    if (request.validationSignature) {
      try {
        await Clipboard.setString(request.validationSignature);
        setCopiedSignature(true);
        Alert.alert("Copied!", "Signature copied to clipboard");
        setTimeout(() => setCopiedSignature(false), 2000);
      } catch (error) {
        Alert.alert("Error", "Failed to copy signature");
      }
    }
  };

  const handleDownloadQRCode = async () => {
    if (!qrCodeRef.current || !request.validationSignature) return;

    try {
      // Get the QR code as a base64 image
      qrCodeRef.current.toDataURL(async (dataURL: string) => {
        try {
          const filename = FileSystem.documentDirectory + `qr-code-${request.validationSignature}.png`;

          // Save the base64 image to file
          await FileSystem.writeAsStringAsync(filename, dataURL, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Share the file
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filename, {
              mimeType: 'image/png',
              dialogTitle: 'Save QR Code',
              UTI: 'public.png',
            });
            Alert.alert("Success", "QR code downloaded successfully");
          } else {
            Alert.alert("Error", "Sharing is not available on this device");
          }
        } catch (error) {
          console.error("Error saving QR code:", error);
          Alert.alert("Error", "Failed to download QR code");
        }
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      Alert.alert("Error", "Failed to generate QR code");
    }
  };

  const handleOpenValidationPage = () => {
    if (!request.validationSignature) return;

    const clientUrl = process.env.EXPO_PUBLIC_CLIENT_URL || 'https://eduops.cloud';
    const validationUrl = `${clientUrl}/validate-document?signature=${request.validationSignature}`;

    Linking.canOpenURL(validationUrl).then((supported) => {
      if (supported) {
        Linking.openURL(validationUrl);
      } else {
        Alert.alert('Error', 'Cannot open validation page');
      }
    }).catch(() => {
      Alert.alert('Error', 'Failed to open validation page');
    });
  };

  const hasProofOfPayment = !!request.proofOfPayment;
  const isPaidDocument = request.document?.price === "paid";

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
              <Icon
                name={getStatusIcon(request.status)}
                size={24}
                color={getStatusColor(request.status)}
              />
              <Text style={styles.headerTitle}>Request Details</Text>
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
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + "20" },
              ]}
            >
              <Icon
                name={getStatusIcon(request.status)}
                size={16}
                color={getStatusColor(request.status)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {request.displayStatus}
              </Text>
            </View>

            {/* Document Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Document</Text>
              <Text style={styles.sectionValue}>{request.documentName}</Text>
              {request.document && (
                <Text style={styles.documentPrice}>
                  {request.document.displayPrice}
                </Text>
              )}
            </View>

            {/* Request Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Request Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Request Date:</Text>
                <Text style={styles.infoValue}>{request.displayDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Delivery Mode:</Text>
                <Text style={styles.infoValue}>
                  {request.mode === "pickup" ? "Pickup" : "Delivery"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method:</Text>
                <Text style={styles.infoValue}>
                  {documentApi.helpers.getPaymentMethodText(
                    request.paymentMethod
                  )}
                </Text>
              </View>
            </View>

            {/* Payment Status Section - Only for paid documents */}
            {!isFreeDocument && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Status</Text>

                {isCashPayment ? (
                  <View style={styles.paymentStatusCard}>
                    <View style={styles.paymentStatusHeader}>
                      <Icon name="check-circle" size={20} color="#16a34a" />
                      <Text style={styles.paymentStatusVerified}>
                        Cash on{" "}
                        {request.mode === "delivery" ? "Delivery" : "Pickup"} -
                        Auto-verified
                      </Text>
                    </View>
                  </View>
                ) : request.paymentStatus === "verified" ? (
                  <View style={styles.paymentStatusCard}>
                    <View style={styles.paymentStatusHeader}>
                      <Icon name="check-circle" size={20} color="#16a34a" />
                      <Text style={styles.paymentStatusVerified}>Verified</Text>
                    </View>
                    {request.paymentId && (
                      <Text style={styles.paymentInfo}>
                        Transaction ID: {request.paymentId}
                      </Text>
                    )}
                    {request.paymentAmount && (
                      <Text style={styles.paymentInfo}>
                        Amount: ₱
                        {parseFloat(String(request.paymentAmount)).toFixed(2)}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.paymentStatusCard}>
                    <View style={styles.paymentStatusHeader}>
                      <Icon name="schedule" size={20} color="#ca8a04" />
                      <Text style={styles.paymentStatusPending}>
                        Pending Verification
                      </Text>
                    </View>
                    {request.paymentId && (
                      <Text style={styles.paymentInfo}>
                        Transaction ID: {request.paymentId}
                      </Text>
                    )}
                    {request.paymentAmount && (
                      <Text style={styles.paymentInfo}>
                        Amount: ₱
                        {parseFloat(String(request.paymentAmount)).toFixed(2)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Contact Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.infoRow}>
                <Icon name="email" size={16} color="#6b7280" />
                <Text style={styles.infoValue}>{request.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={16} color="#6b7280" />
                <Text style={styles.infoValue}>{request.phone}</Text>
              </View>
            </View>

            {/* Delivery Address */}
            {request.mode === "delivery" && request.address && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.addressText}>
                  {request.address}
                  {"\n"}
                  {request.city}, {request.state} {request.zipCode}
                  {"\n"}
                  {request.country}
                </Text>
              </View>
            )}

            {/* Purpose */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Purpose</Text>
              <Text style={styles.sectionValue}>{request.purpose}</Text>
            </View>

            {/* Additional Notes */}
            {request.additionalNotes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <Text style={styles.sectionValue}>
                  {request.additionalNotes}
                </Text>
              </View>
            )}

            {/* Remarks */}
            {request.remarks && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Remarks</Text>
                <Text style={styles.remarksText}>{request.remarks}</Text>
              </View>
            )}

            {/* Fulfilled Document */}
            {request.fulfilledDocumentUrl && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completed Document</Text>

                {/* File Signature and QR Code */}
                {request.validationSignature && (
                  <View style={styles.signatureCard}>
                    <View style={styles.signatureHeader}>
                      <Icon name="verified" size={18} color="#16a34a" />
                      <Text style={styles.signatureTitle}>
                        VERIFIED DOCUMENT
                      </Text>
                    </View>
                    <View style={styles.signatureContent}>
                      <Text style={styles.signatureLabel}>File Signature:</Text>
                      <View style={styles.signatureBox}>
                        <Text style={styles.signatureText}>
                          {request.validationSignature}
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.copyButton,
                            copiedSignature && styles.copyButtonCopied,
                          ]}
                          onPress={handleCopySignature}
                        >
                          <Icon
                            name={copiedSignature ? "check" : "content-copy"}
                            size={16}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.signatureHelp}>
                        Use this signature to verify document authenticity
                      </Text>

                      {/* QR Code Section */}
                      <View style={styles.qrCodeSection}>
                        <Text style={styles.qrCodeLabel}>Validation QR Code:</Text>
                        <View style={styles.qrCodeContainer}>
                          <View style={styles.qrCodeWrapper}>
                            <QRCode
                              value={`${process.env.EXPO_PUBLIC_CLIENT_URL || 'https://eduops.cloud'}/validate-document?signature=${request.validationSignature}`}
                              size={160}
                              color="#000000"
                              backgroundColor="#ffffff"
                              getRef={(ref) => (qrCodeRef.current = ref)}
                            />
                          </View>
                          <View style={styles.qrCodeActions}>
                            <TouchableOpacity
                              style={styles.qrActionButton}
                              onPress={handleDownloadQRCode}
                            >
                              <Icon name="download" size={18} color="#2563eb" />
                              <Text style={styles.qrActionButtonText}>Download QR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.qrActionButton}
                              onPress={handleOpenValidationPage}
                            >
                              <Icon name="open-in-browser" size={18} color="#2563eb" />
                              <Text style={styles.qrActionButtonText}>Validate Online</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.qrCodeHelp}>
                          Scan this QR code to verify the document online
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => {
                    if (request.fulfilledDocumentUrl) {
                      Linking.openURL(request.fulfilledDocumentUrl);
                    }
                  }}
                >
                  <Icon name="file-download" size={20} color="#059669" />
                  <Text style={styles.downloadButtonText}>
                    Download Completed Document
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Proof of Payment - Hide for free documents and cash payments */}
            {isPaidDocument && !isCashPayment && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Proof of Payment</Text>
                {hasProofOfPayment ? (
                  <View style={styles.proofContainer}>
                    <View style={styles.proofUploadedBadge}>
                      <Icon name="check-circle" size={18} color="#16a34a" />
                      <Text style={styles.proofUploadedText}>Uploaded</Text>
                    </View>
                    {request.status === "in_process" && (
                      <View style={styles.proofPendingNote}>
                        <Icon name="info" size={16} color="#ca8a04" />
                        <Text style={styles.proofPendingText}>
                          Payment verification is being processed by admin.
                          Please refrain from paying again to avoid duplicate
                          transactions.
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: request.proofOfPayment }}
                      style={styles.proofImage}
                      resizeMode="cover"
                    />
                    <View style={styles.proofActions}>
                      <TouchableOpacity
                        style={styles.viewProofButton}
                        onPress={() => {
                          if (request.proofOfPayment) {
                            Linking.openURL(request.proofOfPayment);
                          }
                        }}
                      >
                        <Icon name="visibility" size={16} color="white" />
                        <Text style={styles.viewProofButtonText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeProofButton}
                        onPress={handleRemoveProof}
                        disabled={loading}
                      >
                        <Icon name="delete" size={16} color="#dc2626" />
                        <Text style={styles.removeProofText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.proofNotUploadedBadge}>
                      <Icon name="warning" size={18} color="#ca8a04" />
                      <Text style={styles.proofNotUploadedText}>
                        Not uploaded
                      </Text>
                    </View>

                    {/* Proceed to Payment Button */}
                    {request.status === "in_process" &&
                      request.paymentStatus !== "verified" && (
                        <TouchableOpacity
                          style={styles.proceedPaymentButton}
                          onPress={handleProceedToPayment}
                        >
                          <Icon name="payment" size={18} color="white" />
                          <Text style={styles.proceedPaymentButtonText}>
                            Proceed to Payment
                          </Text>
                        </TouchableOpacity>
                      )}

                    {/* Upload Proof Button */}
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handleUploadProof}
                      disabled={uploadingProof || loading}
                    >
                      <Icon name="cloud-upload" size={20} color="#2563eb" />
                      <Text style={styles.uploadButtonText}>
                        {uploadingProof
                          ? "Uploading..."
                          : "Upload Proof of Payment"}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.uploadHelperText}>
                      JPG, PNG, PDF (Max 5MB)
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeFooterButton}
              onPress={onClose}
            >
              <Text style={styles.closeFooterButtonText}>Close</Text>
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionValue: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 22,
  },
  documentPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#059669",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  remarksText: {
    fontSize: 14,
    color: "#dc2626",
    fontStyle: "italic",
    lineHeight: 20,
  },
  proofContainer: {
    gap: 12,
  },
  proofImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  removeProofButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  removeProofText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#2563eb",
    borderStyle: "dashed",
    backgroundColor: "#eff6ff",
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  closeFooterButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  closeFooterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#059669",
    backgroundColor: "#ecfdf5",
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  // Payment Status Card Styles
  paymentStatusCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  paymentStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  paymentStatusVerified: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16a34a",
  },
  paymentStatusPending: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ca8a04",
  },
  paymentInfo: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  // File Signature Styles
  signatureCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#86efac",
    marginBottom: 12,
  },
  signatureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  signatureTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a",
    letterSpacing: 0.5,
  },
  signatureContent: {
    gap: 6,
  },
  signatureLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  signatureBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#86efac",
    gap: 8,
  },
  signatureText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 1,
  },
  copyButton: {
    backgroundColor: "#16a34a",
    padding: 8,
    borderRadius: 6,
  },
  copyButtonCopied: {
    backgroundColor: "#059669",
  },
  signatureHelp: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
  },
  // Proof of Payment Enhanced Styles
  proofUploadedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  proofUploadedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  proofNotUploadedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  proofNotUploadedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ca8a04",
  },
  proofPendingNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  proofPendingText: {
    flex: 1,
    fontSize: 11,
    color: "#92400e",
    lineHeight: 16,
  },
  proofActions: {
    flexDirection: "row",
    gap: 8,
  },
  viewProofButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  viewProofButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  proceedPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    marginBottom: 10,
  },
  proceedPaymentButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  uploadHelperText: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
  },
  // QR Code Styles
  qrCodeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#86efac",
  },
  qrCodeLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 12,
    fontWeight: "600",
  },
  qrCodeContainer: {
    alignItems: "center",
    gap: 12,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#86efac",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  qrActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  qrActionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  qrCodeHelp: {
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
});
