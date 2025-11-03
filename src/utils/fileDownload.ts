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
    // Validate URL
    if (!url || url.trim().length === 0) {
      return {
        success: false,
        error: 'Invalid file URL. The file may not be available.',
      };
    }

    // Parse URL to get pathname and remove query parameters
    let cleanFileName = fileName;

    // First, remove query parameters (anything after ? or &)
    cleanFileName = cleanFileName.split('?')[0];
    cleanFileName = cleanFileName.split('&')[0];

    // Extract just the filename without any path components
    // Handle both forward slashes and backslashes
    cleanFileName = cleanFileName.split('/').pop() || cleanFileName;
    cleanFileName = cleanFileName.split('\\').pop() || cleanFileName;

    // Remove any invalid filename characters for safety
    cleanFileName = cleanFileName.replace(/[<>:"|?*&=]/g, '_');

    // Ensure we have a valid filename
    if (!cleanFileName || cleanFileName.length === 0) {
      cleanFileName = `download_${Date.now()}.pdf`;
    }

    // Create a unique file path in the document directory
    const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;

    // Check if the file already exists and generate a unique name if needed
    let finalFileUri = fileUri;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists) {
      // Add timestamp to make it unique
      const dotIndex = cleanFileName.lastIndexOf('.');
      if (dotIndex > 0) {
        const extension = cleanFileName.substring(dotIndex);
        const nameWithoutExt = cleanFileName.substring(0, dotIndex);
        finalFileUri = `${
          FileSystem.documentDirectory
        }${nameWithoutExt}_${Date.now()}${extension}`;
      } else {
        finalFileUri = `${
          FileSystem.documentDirectory
        }${cleanFileName}_${Date.now()}`;
      }
    }

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(url, finalFileUri);

    if (downloadResult.status === 200) {
      return {
        success: true,
        uri: downloadResult.uri,
      };
    } else if (downloadResult.status === 404) {
      return {
        success: false,
        error: 'File not found. The document may have been removed or is unavailable.',
      };
    } else if (downloadResult.status === 403) {
      return {
        success: false,
        error: 'Access denied. You may not have permission to download this file.',
      };
    } else {
      return {
        success: false,
        error: `Download failed. The file may not be available. (Status: ${downloadResult.status})`,
      };
    }
  } catch (error: any) {
    // Handle specific error messages
    const errorMessage = error.message || '';

    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return {
        success: false,
        error: 'File not found. The document may have been removed or is unavailable.',
      };
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        success: false,
        error: 'Network error. Please check your internet connection and try again.',
      };
    } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
      return {
        success: false,
        error: 'Access denied. You may not have permission to download this file.',
      };
    }

    return {
      success: false,
      error: 'Failed to download file. The document may not be available.',
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
