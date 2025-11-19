import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PostAvatarProps {
  profilePicUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: number;
  style?: any;
}

/**
 * PostAvatar Component
 * Displays post author's profile picture or initials as fallback
 */
export const PostAvatar: React.FC<PostAvatarProps> = ({
  profilePicUrl,
  firstName = '',
  lastName = '',
  size = 40,
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  // Get user's initials from first and last name
  const getInitials = (): string => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';

    if (!first && !last) return '??';

    const firstInitial = first.charAt(0).toUpperCase();
    const lastInitial = last.charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  };

  const renderContent = () => {
    // Show profile picture if available and no error
    if (profilePicUrl && !imageError) {
      return (
        <Image
          source={{ uri: profilePicUrl }}
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

  return <View style={containerStyle}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#de0000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  initialsText: {
    color: '#fff',
    fontWeight: '600',
  },
});
