import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DocumentRequest } from '../../types/document';
import documentApi from '../../utils/documentApi';

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

  if (!request) return null;

  const getStatusColor = (status: string) => {
    return documentApi.helpers.getStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_process':
        return 'hourglass-empty';
      case 'in_transit':
        return 'local-shipping';
      case 'delivered':
      case 'fulfilled':
        return 'check-circle';
      case 'failed':
        return 'error';
      default:
        return 'info';
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
            'Permission Required',
            'Camera access is required to take photos.'
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
            'Permission Required',
            'Gallery access is required to select photos.'
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
          asset.uri.split('/').pop() || `proof-${Date.now()}.jpg`;

        // Determine file type based on URI extension
        let fileType = 'image/jpeg';
        if (asset.uri.toLowerCase().endsWith('.png')) {
          fileType = 'image/png';
        } else if (
          asset.uri.toLowerCase().endsWith('.jpg') ||
          asset.uri.toLowerCase().endsWith('.jpeg')
        ) {
          fileType = 'image/jpeg';
        }

        setUploadingProof(true);
        await onUploadProof(request.id, asset.uri, fileName, fileType);
        setUploadingProof(false);
      }
    } catch (error: any) {
      setUploadingProof(false);
      Alert.alert(
        'Error',
        error.message || 'Failed to upload proof of payment'
      );
    }
  };

  const handleUploadProof = () => {
    Alert.alert(
      'Upload Proof of Payment',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => handlePickImage(true),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handlePickImage(false),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveProof = () => {
    Alert.alert(
      'Remove Proof of Payment',
      'Are you sure you want to remove this proof of payment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
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

  const hasProofOfPayment = !!request.proofOfPayment;
  const isPaidDocument = request.document?.price === 'paid';

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
                { backgroundColor: getStatusColor(request.status) + '20' },
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
                  {request.mode === 'pickup' ? 'Pickup' : 'Delivery'}
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
            {request.mode === 'delivery' && request.address && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.addressText}>
                  {request.address}
                  {'\n'}
                  {request.city}, {request.state} {request.zipCode}
                  {'\n'}
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

            {/* Proof of Payment */}
            {isPaidDocument && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Proof of Payment</Text>
                {hasProofOfPayment ? (
                  <View style={styles.proofContainer}>
                    <Image
                      source={{ uri: request.proofOfPayment }}
                      style={styles.proofImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeProofButton}
                      onPress={handleRemoveProof}
                      disabled={loading}
                    >
                      <Icon name="delete" size={16} color="#dc2626" />
                      <Text style={styles.removeProofText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleUploadProof}
                    disabled={uploadingProof || loading}
                  >
                    <Icon name="cloud-upload" size={20} color="#2563eb" />
                    <Text style={styles.uploadButtonText}>
                      {uploadingProof
                        ? 'Uploading...'
                        : 'Upload Proof of Payment'}
                    </Text>
                  </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  documentPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  remarksText: {
    fontSize: 14,
    color: '#dc2626',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  proofContainer: {
    gap: 12,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  removeProofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  removeProofText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    backgroundColor: '#eff6ff',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  closeFooterButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  closeFooterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});
