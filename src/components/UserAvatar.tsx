import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../hooks/useAuth';

interface UserAvatarProps {
  size?: number;
  onPress?: () => void;
  style?: any;
}

/**
 * UserAvatar Component
 * Displays user's profile picture (with caching) or initials as fallback
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 40,
  onPress,
  style,
}) => {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get user's initials
  const getInitials = (): string => {
    if (!user) return '??';

    const firstName = user.firstName?.trim() || '';
    const lastName = user.lastName?.trim() || '';

    if (!firstName && !lastName) return '??';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  };

  // Get cached file path
  const getCachedFilePath = (url: string): string => {
    const filename = url.split('/').pop() || 'profile';
    const fileExtension = filename.split('.').pop() || 'jpg';
    return `${FileSystem.cacheDirectory}profile_${user?.id}.${fileExtension}`;
  };

  // Load profile picture with caching
  const loadProfilePicture = async () => {
    if (!user?.profilePicLink) {
      setImageUri(null);
      return;
    }

    const profilePicUrl = user.profilePicLink;
    const cachedFilePath = getCachedFilePath(profilePicUrl);

    try {
      setIsLoading(true);

      // Check if cached file exists
      const fileInfo = await FileSystem.getInfoAsync(cachedFilePath);

      if (fileInfo.exists) {
        // Use cached image
        console.log('Using cached profile picture:', cachedFilePath);
        setImageUri(cachedFilePath);
        setImageError(false);
      } else {
        // Download and cache the image
        console.log('Downloading profile picture:', profilePicUrl);
        const downloadResult = await FileSystem.downloadAsync(
          profilePicUrl,
          cachedFilePath
        );

        if (downloadResult.status === 200) {
          console.log('Profile picture cached:', cachedFilePath);
          setImageUri(downloadResult.uri);
          setImageError(false);
        } else {
          console.error('Failed to download profile picture');
          setImageError(true);
        }
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
      setImageError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfilePicture();
  }, [user?.profilePicLink]);

  const renderContent = () => {
    // Show loading indicator while downloading
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          color="#fff"
          style={styles.loadingIndicator}
        />
      );
    }

    // Show profile picture if available and no error
    if (imageUri && !imageError && user?.profilePicLink) {
      return (
        <Image
          source={{ uri: imageUri }}
          style={[styles.profileImage, { width: size, height: size }]}
          onError={() => setImageError(true)}
        />
      );
    }

    // Fallback to initials
    const initials = getInitials();
    const fontSize = size * 0.4; // Scale font size based on avatar size

    return <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>;
  };

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{renderContent()}</View>;
};

/**
 * Clear cached profile picture
 * This should be called on logout
 */
export const clearProfilePictureCache = async (userId?: string) => {
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;

    // If userId is provided, delete specific user's cached image
    if (userId) {
      const pattern = `profile_${userId}.`;
      const files = await FileSystem.readDirectoryAsync(cacheDir);

      for (const file of files) {
        if (file.includes(pattern)) {
          const filePath = `${cacheDir}${file}`;
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          console.log('Deleted cached profile picture:', filePath);
        }
      }
    } else {
      // Delete all profile cache files
      const files = await FileSystem.readDirectoryAsync(cacheDir);

      for (const file of files) {
        if (file.startsWith('profile_')) {
          const filePath = `${cacheDir}${file}`;
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          console.log('Deleted cached profile picture:', filePath);
        }
      }
    }
  } catch (error) {
    console.error('Error clearing profile picture cache:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#de0000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  initialsText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingIndicator: {
    // The ActivityIndicator will center itself
  },
});
