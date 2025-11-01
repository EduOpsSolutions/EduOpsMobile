import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DocumentRequest } from '../../types/document';
import documentApi from '../../utils/documentApi';

interface ViewRequestsModalProps {
  visible: boolean;
  requests: DocumentRequest[];
  loading?: boolean;
  onClose: () => void;
  onRequestPress: (request: DocumentRequest) => void;
  onRefresh?: () => void;
}

export const ViewRequestsModal: React.FC<ViewRequestsModalProps> = ({
  visible,
  requests,
  loading = false,
  onClose,
  onRequestPress,
  onRefresh,
}) => {
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
              <Text style={styles.headerTitle}>My Requests</Text>
            </View>
            <View style={styles.headerRight}>
              {onRefresh && (
                <TouchableOpacity
                  onPress={onRefresh}
                  style={styles.refreshButton}
                >
                  <Icon name="refresh" size={20} color="#666" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading requests...</Text>
              </View>
            ) : requests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="assignment" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No Requests Yet</Text>
                <Text style={styles.emptyText}>
                  You haven't submitted any document requests yet.
                </Text>
              </View>
            ) : (
              <View style={styles.requestsList}>
                {requests.map((request) => (
                  <TouchableOpacity
                    key={request.id}
                    style={styles.requestCard}
                    onPress={() => onRequestPress(request)}
                  >
                    <View style={styles.requestHeader}>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestDocument} numberOfLines={1}>
                          {request.documentName}
                        </Text>
                        <Text style={styles.requestDate}>
                          {request.displayDate}
                        </Text>
                      </View>
                      <Icon
                        name={getStatusIcon(request.status)}
                        size={24}
                        color={getStatusColor(request.status)}
                      />
                    </View>

                    <View style={styles.requestDetails}>
                      <View style={styles.detailRow}>
                        <Icon name="payment" size={14} color="#6b7280" />
                        <Text style={styles.detailText}>
                          {documentApi.helpers.getPaymentMethodText(
                            request.paymentMethod
                          )}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon
                          name={
                            request.mode === 'pickup'
                              ? 'store'
                              : 'local-shipping'
                          }
                          size={14}
                          color="#6b7280"
                        />
                        <Text style={styles.detailText}>
                          {request.mode === 'pickup' ? 'Pickup' : 'Delivery'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(request.status) + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(request.status) },
                        ]}
                      >
                        {request.displayStatus}
                      </Text>
                    </View>

                    <View style={styles.viewDetailsRow}>
                      <Text style={styles.viewDetailsText}>
                        Tap to view details
                      </Text>
                      <Icon name="chevron-right" size={16} color="#2563eb" />
                    </View>
                  </TouchableOpacity>
                ))}
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
    maxHeight: '85%',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginRight: 12,
  },
  requestDocument: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
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
