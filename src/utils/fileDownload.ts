/**
 * File Download Utility for EduOps Mobile App
 * Handles downloading files from URLs using expo-file-system
 */

import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

/**
 * Download a file from URL and save to device
 * @param url - File URL
 * @param fileName - Name for the downloaded file
 * @returns Promise with download result
 */
export const downloadFile = async (
  url: string,
  fileName: string
): Promise<{ success: boolean; uri?: string; error?: string }> => {
  try {
    // Extract just the filename without any path components
    // Handle both forward slashes and backslashes
    let cleanFileName = fileName.split('/').pop() || fileName;
    cleanFileName = cleanFileName.split('\\').pop() || cleanFileName;
    // Remove any non-filename characters for safety
    cleanFileName = cleanFileName.replace(/[<>:"|?*]/g, '_');

    // Create a unique file path in the document directory
    const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;

    // Check if the file already exists and generate a unique name if needed
    let finalFileUri = fileUri;
    let counter = 1;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists) {
      // Add timestamp to make it unique
      const extension = cleanFileName.substring(cleanFileName.lastIndexOf('.'));
      const nameWithoutExt = cleanFileName.substring(
        0,
        cleanFileName.lastIndexOf('.')
      );
      finalFileUri = `${
        FileSystem.documentDirectory
      }${nameWithoutExt}_${Date.now()}${extension}`;
    }

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(url, finalFileUri);

    if (downloadResult.status === 200) {
      return {
        success: true,
        uri: downloadResult.uri,
      };
    } else {
      return {
        success: false,
        error: `Download failed with status ${downloadResult.status}`,
      };
    }
  } catch (error: any) {
    console.error('Download error:', error);
    return {
      success: false,
      error: error.message || 'Failed to download file',
    };
  }
};

/**
 * Download file and show sharing options (iOS/Android native share)
 * @param url - File URL
 * @param fileName - Name for the downloaded file
 */
export const downloadAndShare = async (
  url: string,
  fileName: string
): Promise<void> => {
  try {
    // Download the file first
    const result = await downloadFile(url, fileName);

    if (!result.success || !result.uri) {
      throw new Error(result.error || 'Download failed');
    }

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();

    if (!isSharingAvailable) {
      Alert.alert(
        'Success',
        `File downloaded successfully to:\n${result.uri}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Share the file (this opens the native share sheet)
    await Sharing.shareAsync(result.uri, {
      mimeType: getMimeType(fileName),
      dialogTitle: `Save ${fileName}`,
    });
  } catch (error: any) {
    console.error('Download and share error:', error);
    Alert.alert(
      'Download Failed',
      error.message || 'Failed to download file. Please try again.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Show confirmation dialog before downloading
 * @param fileName - Name of the file
 * @param fileSize - Size of the file (optional)
 * @param onConfirm - Callback when user confirms
 */
export const showDownloadConfirmation = (
  fileName: string,
  fileSize: number | undefined,
  onConfirm: () => void
): void => {
  const sizeText = fileSize
    ? `\nSize: ${(fileSize / 1024 / 1024).toFixed(2)} MB`
    : '';

  Alert.alert(
    'Download File',
    `Do you want to download this file?\n\n${fileName}${sizeText}`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Download',
        onPress: onConfirm,
      },
    ]
  );
};

/**
 * Get MIME type from file name
 * @param fileName - File name with extension
 * @returns MIME type string
 */
const getMimeType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  const mimeTypes: { [key: string]: string } = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };

  return mimeTypes[extension || ''] || 'application/octet-stream';
};
