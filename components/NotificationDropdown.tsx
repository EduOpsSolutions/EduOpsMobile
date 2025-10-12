import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface NotificationDropdownProps {
  isActive?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isActive = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Sample notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Payment Reminder',
      message: 'Your tuition fee payment is due in 3 days',
      time: '2 hours ago',
      isRead: false,
      type: 'warning',
    },
    {
      id: '2',
      title: 'Schedule Update',
      message: 'Class schedule has been updated for next week',
      time: '1 day ago',
      isRead: true,
      type: 'info',
    },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleNotificationPress = (notificationId: string) => {
    // Handle notification tap - mark as read, navigate, etc.
    console.log('Notification pressed:', notificationId);
  };

  const markAllAsRead = () => {
    // Logic to mark all notifications as read
    console.log('Mark all as read');
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280], // Reduced from 320 to account for header and button
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'warning':
        return '#ff9800';
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.notificationButton} onPress={toggleDropdown}>
        <Icon name="notifications" size={24} color="white" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <View style={styles.dropdownHeader}>
          <Text style={styles.dropdownTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllRead}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.isRead && styles.unreadNotification
              ]}
              onPress={() => handleNotificationPress(notification.id)}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Icon 
                    name={getNotificationIcon(notification.type)} 
                    size={16} 
                    color={getNotificationIconColor(notification.type)} 
                  />
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Notifications</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#de0000',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: -50,
    width: 280,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllRead: {
    fontSize: 11,
    color: '#de0000',
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5, // Make the border thinner
    borderBottomColor: '#f0f0f0',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  notificationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#de0000',
  },
  notificationMessage: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: '#999',
  },
  viewAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 0.5, // Make the border thinner
    borderTopColor: '#f0f0f0', // Use lighter color
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: '#de0000',
    fontWeight: '500',
  },
});