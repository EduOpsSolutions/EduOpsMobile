import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import { downloadAndShare } from '../../utils/fileDownload';

interface FilePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  fileUrl: string | null;
  title: string;
}

const { width, height } = Dimensions.get('window');

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  visible,
  onClose,
  fileUrl,
  title,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [downloading, setDownloading] = React.useState(false);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
  };

  const getFileNameFromUrl = (url: string): string => {
    try {
      // Decode URL in case it's encoded
      const decodedUrl = decodeURIComponent(url);
      const urlParts = decodedUrl.split('/');
      let fileName = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      fileName = fileName.split('?')[0];
      // Extra safety: remove any remaining path components
      fileName = fileName.split('/').pop() || fileName;
      return fileName || 'certificate.pdf';
    } catch (error) {
      return 'certificate.pdf';
    }
  };

  const handleDownload = async () => {
    if (!fileUrl) {
      Alert.alert('Error', 'No file URL available');
      return;
    }

    setDownloading(true);
    try {
      const fileName = getFileNameFromUrl(fileUrl);
      console.log('FilePreviewModal - fileUrl:', fileUrl);
      console.log('FilePreviewModal - extracted fileName:', fileName);
      await downloadAndShare(fileUrl, fileName);
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        error.message || 'Failed to download file'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleDownload}
              style={styles.downloadButton}
              disabled={downloading || !fileUrl}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="download" size={24} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {fileUrl ? (
            <>
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#de0000" />
                  <Text style={styles.loadingText}>Loading document...</Text>
                </View>
              )}
              <WebView
                source={{
                  uri:
                    Platform.OS === 'android'
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(
                          fileUrl
                        )}&embedded=true`
                      : fileUrl,
                }}
                style={styles.webview}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#de0000" />
                  </View>
                )}
              />
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={64} color="#999" />
              <Text style={styles.errorText}>No file available</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#de0000',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadButton: {
    padding: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
