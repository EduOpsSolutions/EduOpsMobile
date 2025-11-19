import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNotificationStore } from '../stores/notificationStore';

/**
 * NotificationDropdown Component
 * Displays notifications in a dropdown with mark as read and mark all as read functionality
 */
export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  // Zustand store
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startAutoRefresh,
    stopAutoRefresh,
    getUnreadNotifications,
  } = useNotificationStore();

  // Get unread notifications
  const unreadNotifications = getUnreadNotifications();

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchNotifications();
    startAutoRefresh(30000); // Refresh every 30 seconds

    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = async () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Refresh notifications when opening
    if (newIsOpen) {
      await fetchNotifications();
    }

    // Animate dropdown
    Animated.timing(dropdownHeight, {
      toValue: newIsOpen ? 400 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Handle notification click (mark as read)
  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Get user initials
  const getInitials = (notification: any) => {
    const firstName =
      notification.data?.posterFirstName || notification.user?.firstName;
    const lastName =
      notification.data?.posterLastName || notification.user?.lastName;

    if (!firstName && !lastName) return '?';
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
  };

  // Get profile picture URL
  const getProfilePicture = (notification: any) => {
    return notification.data?.posterProfilePic || notification.profilePic;
  };

  // Get display name
  const getDisplayName = (notification: any) => {
    const firstName =
      notification.data?.posterFirstName || notification.user?.firstName;
    const lastName =
      notification.data?.posterLastName || notification.user?.lastName;

    if (!firstName && !lastName) return 'Unknown User';
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Notification Bell Button */}
      <TouchableOpacity
        style={styles.bellButton}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Icon name="notifications" size={24} color="white" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <Pressable
            style={styles.overlay}
            onPress={() => {
              setIsOpen(false);
              Animated.timing(dropdownHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
              }).start();
            }}
          />

          {/* Dropdown Content */}
          <Animated.View
            style={[
              styles.dropdown,
              {
                height: dropdownHeight,
                opacity: dropdownHeight.interpolate({
                  inputRange: [0, 400],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadNotifications.length > 0 && (
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Notifications List */}
            <ScrollView
              style={styles.notificationsList}
              contentContainerStyle={styles.notificationsContent}
              showsVerticalScrollIndicator={false}
            >
              {loading && notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading...</Text>
                </View>
              ) : unreadNotifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="notifications-none" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No new notifications</Text>
                </View>
              ) : (
                unreadNotifications.map((notification, index) => (
                  <View key={notification.id}>
                    <TouchableOpacity
                      style={[
                        styles.notificationItem,
                        !notification.isRead && styles.unreadItem,
                      ]}
                      onPress={() => handleNotificationClick(notification.id)}
                      activeOpacity={0.7}
                    >
                      {/* User Avatar */}
                      <View style={styles.avatarContainer}>
                        {getProfilePicture(notification) ? (
                          <Image
                            source={{ uri: getProfilePicture(notification) }}
                            style={styles.avatarImage}
                            onError={() => {
                              // Fallback to initials on image load error handled by View below
                            }}
                          />
                        ) : (
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                              {getInitials(notification)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Notification Content */}
                      <View style={styles.notificationContent}>
                        {/* Author Name */}
                        <Text style={styles.authorName}>
                          {getDisplayName(notification)}
                        </Text>

                        {/* Title */}
                        <Text
                          style={[
                            styles.notificationTitle,
                            !notification.isRead && styles.unreadText,
                          ]}
                          numberOfLines={1}
                        >
                          {notification.title}
                        </Text>

                        {/* Message */}
                        <Text
                          style={styles.notificationMessage}
                          numberOfLines={2}
                        >
                          {notification.message}
                        </Text>

                        {/* Timestamp */}
                        <Text style={styles.timestamp}>
                          {formatTimestamp(notification.createdAt)}
                        </Text>
                      </View>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <View style={styles.unreadIndicator} />
                      )}
                    </TouchableOpacity>

                    {/* Divider */}
                    {index < unreadNotifications.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  bellButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#de0000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 10000,
    height: 10000,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: -62,
    width: 350,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1001,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllText: {
    fontSize: 13,
    color: '#de0000',
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  unreadItem: {
    backgroundColor: '#fffdf2',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#de0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#de0000',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationContent: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#de0000',
    marginLeft: 8,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 68,
  },
});
