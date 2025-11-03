import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { UserAvatar } from '../UserAvatar';
import { NotificationDropdown } from '../NotificationDropdown';

interface NavbarProps {
  showNotifications?: boolean;
}

/**
 * Navbar Component
 * Reusable top navigation bar with logo, notifications, and user avatar
 */
export const Navbar: React.FC<NavbarProps> = ({ showNotifications = true }) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/sprachins-logo-3.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerIcons}>
          {showNotifications ? (
            <NotificationDropdown />
          ) : (
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="notifications" size={24} color="white" />
            </TouchableOpacity>
          )}
          <UserAvatar
            size={40}
            onPress={() => router.replace('/profile')}
            style={styles.profileButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#de0000',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  profileButton: {
    // Avatar styling handled by UserAvatar component
  },
});
