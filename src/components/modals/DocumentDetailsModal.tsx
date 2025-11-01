import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DocumentTemplate } from '../../types/document';

interface DocumentDetailsModalProps {
  visible: boolean;
  document: DocumentTemplate | null;
  onClose: () => void;
  onRequest?: (document: DocumentTemplate) => void;
  onDownload?: (document: DocumentTemplate) => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  visible,
  document,
  onClose,
  onRequest,
  onDownload,
}) => {
  if (!document) return null;

  const handleAction = () => {
    if (document.requiresRequest && onRequest) {
      onRequest(document);
    } else if (document.canDownload && onDownload) {
      onDownload(document);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="description" size={24} color="#2563eb" />
              <Text style={styles.headerTitle}>Document Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Document Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Document Name</Text>
              <Text style={styles.value}>{document.documentName}</Text>
            </View>

            {/* Description */}
            {document.description && (
              <View style={styles.section}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.valueMultiline}>
                  {document.description}
                </Text>
              </View>
            )}

            {/* Price */}
            <View style={styles.section}>
              <Text style={styles.label}>Price</Text>
              <Text style={[styles.value, styles.priceValue]}>
                {document.displayPrice}
              </Text>
            </View>

            {/* Privacy */}
            <View style={styles.section}>
              <Text style={styles.label}>Availability</Text>
              <Text style={styles.value}>
                {document.privacy === 'public'
                  ? 'Available to All'
                  : document.privacy === 'student_only'
                  ? 'Students Only'
                  : 'Teachers Only'}
              </Text>
            </View>

            {/* Downloadable */}
            <View style={styles.section}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                {document.downloadable && (
                  <View style={styles.typeBadge}>
                    <Icon name="download" size={14} color="#059669" />
                    <Text style={styles.typeBadgeText}>Downloadable</Text>
                  </View>
                )}
                {document.requestBasis && (
                  <View style={[styles.typeBadge, styles.typeBadgeRequest]}>
                    <Icon name="assignment" size={14} color="#2563eb" />
                    <Text
                      style={[
                        styles.typeBadgeText,
                        styles.typeBadgeTextRequest,
                      ]}
                    >
                      Request Basis
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.label}>Status</Text>
              <Text
                style={[
                  styles.value,
                  document.isActive
                    ? styles.activeStatus
                    : styles.inactiveStatus,
                ]}
              >
                {document.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            {document.isActive && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAction}
              >
                <Icon
                  name={document.requiresRequest ? 'assignment' : 'download'}
                  size={16}
                  color="white"
                />
                <Text style={styles.actionButtonText}>
                  {document.requiresRequest ? 'Request' : 'Download'}
                </Text>
              </TouchableOpacity>
            )}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  valueMultiline: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#059669',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeBadgeRequest: {
    backgroundColor: '#dbeafe',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  typeBadgeTextRequest: {
    color: '#2563eb',
  },
  activeStatus: {
    color: '#059669',
    fontWeight: '600',
  },
  inactiveStatus: {
    color: '#dc2626',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
