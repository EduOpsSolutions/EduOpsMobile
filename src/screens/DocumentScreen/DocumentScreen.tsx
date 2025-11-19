import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
<<<<<<< HEAD
  Linking,
=======
>>>>>>> 651fc52127e3c51fc1816a72ac262f9503e2968f
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './DocumentScreen.styles';
import { AppLayout } from '../../components/common';
import { useDocumentStore } from '../../stores/documentStore';
import { DocumentTemplate } from '../../types/document';
import {
  DocumentDetailsModal,
  RequestDocumentModal,
  ViewRequestsModal,
  RequestDetailsModal,
} from '../../components/modals';
<<<<<<< HEAD
=======
import {
  downloadAndShare,
  showDownloadConfirmation,
} from '../../utils/fileDownload';
>>>>>>> 651fc52127e3c51fc1816a72ac262f9503e2968f

interface DocumentItemProps {
  document: DocumentTemplate;
  onPress: () => void;
  onAction: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  onPress,
  onAction,
}) => {
  const getActionButton = () => {
    if (document.requiresRequest) {
      return (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={(e) => {
            e.stopPropagation();
            onAction();
          }}
        >
          <Text style={styles.requestButtonText}>Request</Text>
        </TouchableOpacity>
      );
    } else if (document.canDownload) {
      return (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={(e) => {
            e.stopPropagation();
            onAction();
          }}
        >
          <Icon name="download" size={16} color="white" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.documentRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.feeText} numberOfLines={1} ellipsizeMode="tail">
        {document.displayPrice}
      </Text>
      <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
        {document.documentName}
      </Text>
      <View style={styles.actionContainer}>{getActionButton()}</View>
      {/* <Text
        style={styles.descriptionText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {document.description || ''}
      </Text> */}
    </TouchableOpacity>
  );
};

export const DocumentScreen = (): React.JSX.Element => {
  const {
    documents,
    requests,
    loading,
    requestsLoading,
    searchQuery,
    selectedDocument,
    selectedRequest,
    requestModalVisible,
    requestsModalVisible,
    requestDetailsModalVisible,
    documentDetailsModalVisible,
    fetchDocuments,
    fetchRequests,
    searchDocuments,
    createRequest,
    uploadProofOfPayment,
    removeProofOfPayment,
    openRequestModal,
    closeRequestModal,
    openRequestsModal,
    closeRequestsModal,
    openRequestDetailsModal,
    closeRequestDetailsModal,
    openDocumentDetailsModal,
    closeDocumentDetailsModal,
  } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
    fetchRequests();
  }, []);

  const handleSearch = (query: string) => {
    searchDocuments(query);
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadDocument = async (document: DocumentTemplate) => {
<<<<<<< HEAD
    // Validate document has a file URL
    if (!document.uploadFile || document.uploadFile.trim().length === 0) {
      Alert.alert(
        'File Not Available',
        'This document does not have a file uploaded yet.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate URL format
    try {
      const urlObj = new URL(document.uploadFile);
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol');
      }
    } catch (error) {
      Alert.alert(
        'Invalid File URL',
        'The document file URL is invalid. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Open URL in browser - let browser handle download/viewing
    try {
      const canOpen = await Linking.canOpenURL(document.uploadFile);
      if (canOpen) {
        await Linking.openURL(document.uploadFile);
      } else {
        Alert.alert(
          'Error',
          'Unable to open the document. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open the document. Please try again.',
        [{ text: 'OK' }]
      );
    }
=======
    if (!document.uploadFile) {
      Alert.alert('Error', 'This document is not available for download.');
      return;
    }

    // Extract filename from URL (handle Firebase Storage URLs with query params)
    let fileName = document.uploadFile.split('/').pop() || '';

    // Remove query parameters if present
    fileName = fileName.split('?')[0];

    // Fallback to document name if extraction failed
    if (!fileName || fileName.length === 0) {
      fileName = `${document.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    }

    // Show confirmation dialog before downloading (same as posts/homepage)
    showDownloadConfirmation(fileName, undefined, async () => {
      try {
        await downloadAndShare(document.uploadFile!, fileName);
      } catch (error: any) {
        console.error('Download error:', error);
        Alert.alert('Error', 'Failed to download document. Please try again.');
      }
    });
>>>>>>> 651fc52127e3c51fc1816a72ac262f9503e2968f
  };

  const handleDocumentAction = (document: DocumentTemplate) => {
    if (document.requiresRequest) {
      openRequestModal(document);
    } else if (document.canDownload) {
      handleDownloadDocument(document);
    }
  };

  const handleViewRequests = () => {
    fetchRequests();
    openRequestsModal();
  };

  return (
    <AppLayout
      showNotifications={true}
      enrollmentActive={false}
      paymentActive={false}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.documentsContainer}>
          {/* Documents Card */}
          <View style={styles.documentsCard}>
            {/* Header Section */}
            <View style={styles.documentsHeader}>
              <Icon name="description" size={24} color="#333" />
              <Text style={styles.documentsTitle}>Documents</Text>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search documents"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton}>
                  <Icon name="search" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.seeRequestsButton}
                onPress={handleViewRequests}
              >
                <Icon name="assignment" size={16} color="white" />
                <Text style={styles.seeRequestsText}>See Requests</Text>
              </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableHeaderFee]}>
                FEE
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderName]}>
                NAME
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderActions]}>
                ACTIONS
              </Text>
              {/* <Text style={styles.tableHeaderDescription}>DESCRIPTION</Text> */}
            </View>

            {/* Documents List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading documents...</Text>
              </View>
            ) : filteredDocuments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="description" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'No documents found'
                    : 'No documents available'}
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.documentsList}
                contentContainerStyle={{ paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {filteredDocuments.map((document) => (
                  <DocumentItem
                    key={document.id}
                    document={document}
                    onPress={() => openDocumentDetailsModal(document)}
                    onAction={() => handleDocumentAction(document)}
                  />
                ))}
              </ScrollView>
            )}

            {/* Version Info */}
            {/* <View style={styles.versionInfo}>
              <Text style={styles.versionText}>Latest Version</Text>
              <Text style={styles.versionDate}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View> */}
          </View>
        </View>
      </View>

      {/* Modals */}
      <DocumentDetailsModal
        visible={documentDetailsModalVisible}
        document={selectedDocument}
        onClose={closeDocumentDetailsModal}
        onRequest={(doc) => {
          closeDocumentDetailsModal();
          openRequestModal(doc);
        }}
        onDownload={handleDownloadDocument}
      />

      <RequestDocumentModal
        visible={requestModalVisible}
        document={selectedDocument}
        onClose={closeRequestModal}
        onSubmit={createRequest}
        loading={loading}
      />

      <ViewRequestsModal
        visible={requestsModalVisible}
        requests={requests}
        loading={requestsLoading}
        onClose={closeRequestsModal}
        onRequestPress={(request) => {
          closeRequestsModal();
          openRequestDetailsModal(request);
        }}
        onRefresh={fetchRequests}
      />

      <RequestDetailsModal
        visible={requestDetailsModalVisible}
        request={selectedRequest}
        onClose={closeRequestDetailsModal}
        onUploadProof={uploadProofOfPayment}
        onRemoveProof={removeProofOfPayment}
        loading={loading}
      />
    </AppLayout>
  );
};
