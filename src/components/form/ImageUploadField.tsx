import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ImageUploadFieldProps {
  currentImage?: string | null;
  onImageChange?: (imageUri: string, previewUrl: string) => void;
  onImageRemove?: () => void;
  disabled?: boolean;
  resetKey?: number;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  currentImage,
  onImageChange,
  onImageRemove,
  disabled = false,
  resetKey = 0,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset preview when resetKey changes
    if (
      currentImage &&
      (currentImage.startsWith('http') || currentImage.startsWith('file://'))
    ) {
      setPreviewUrl(currentImage);
    } else {
      setPreviewUrl(null);
    }
  }, [currentImage, resetKey]);

  const getUserInitials = (name?: string | null): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const requestPermissions = async (
    type: 'camera' | 'library'
  ): Promise<boolean> => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Camera permission is required to take photos.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Photo library permission is required to select images.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const pickImageFromCamera = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestPermissions('camera');
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setPreviewUrl(imageUri);
        if (onImageChange) {
          onImageChange(imageUri, imageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromLibrary = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestPermissions('library');
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setPreviewUrl(imageUri);
        if (onImageChange) {
          onImageChange(imageUri, imageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image from library:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showImagePickerOptions = () => {
    if (disabled) return;

    if (Platform.OS === 'ios') {
      // iOS Action Sheet
      const options = previewUrl
        ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
        : ['Take Photo', 'Choose from Library', 'Cancel'];
      const destructiveButtonIndex = previewUrl ? 2 : undefined;
      const cancelButtonIndex = previewUrl ? 3 : 2;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            pickImageFromCamera();
          } else if (buttonIndex === 1) {
            pickImageFromLibrary();
          } else if (buttonIndex === 2 && previewUrl) {
            handleRemoveImage();
          }
        }
      );
    } else {
      // Android Alert
      const buttons = [
        { text: 'Take Photo', onPress: pickImageFromCamera },
        { text: 'Choose from Library', onPress: pickImageFromLibrary },
      ];

      if (previewUrl) {
        buttons.push({
          text: 'Remove Photo',
          onPress: () => Promise.resolve(handleRemoveImage()),
        } as const);
      }

      buttons.push({
        text: 'Cancel',
        onPress: () => Promise.resolve(),
      } as const);

      Alert.alert('Profile Picture', 'Choose an option', buttons);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={showImagePickerOptions}
        disabled={disabled || loading}
        style={styles.imageContainer}
      >
        <View style={styles.imageWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#de0000" />
            </View>
          ) : previewUrl ? (
            <Image source={{ uri: previewUrl }} style={styles.image} />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>
                {getUserInitials(currentImage)}
              </Text>
            </View>
          )}
        </View>

        {!disabled && !loading && (
          <View style={styles.editIconContainer}>
            <Icon name="edit" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {!disabled && (
        <TouchableOpacity
          onPress={showImagePickerOptions}
          disabled={loading}
          style={styles.editButton}
        >
          <Icon name="photo-camera" size={16} color="#666" />
          <Text style={styles.editButtonText}>Edit Profile Picture</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#de0000',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#de0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#de0000',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
