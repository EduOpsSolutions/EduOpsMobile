import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useEnrollmentStore } from '../src/stores/enrollmentStore';
import { enrollmentApi } from '../src/utils/api';

interface EnrollmentDropdownProps {
  isActive: boolean;
}

export const EnrollmentDropdown: React.FC<EnrollmentDropdownProps> = ({
  isActive,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = '/' + (segments[segments.length - 1] || '');
  const { user, isAuthenticated } = useAuthStore();
  const { setEnrollmentData } = useEnrollmentStore();

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const navigateToScreen = (route: string) => {
    router.replace(route as any);
    setIsOpen(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleNewEnrollmentPress = async () => {
    // Close dropdown first
    setIsOpen(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Check if user is authenticated and has an email
    if (isAuthenticated && user?.email) {
      setIsCheckingEnrollment(true);
      try {
        const response = await enrollmentApi.trackEnrollmentByEmail(user.email);

        // If enrollment found (no error and has data), redirect to tracking
        if (!response.error && response.data) {
          // Set enrollment data in store
          setEnrollmentData(response.data);

          Alert.alert(
            'Existing Enrollment Found',
            'You already have an active enrollment for the current period. Redirecting to your enrollment status.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/enrollment/status' as any),
              },
            ]
          );
          return;
        }
      } catch (error) {
        // If error (other than 404), log it but still allow navigation to form
        console.error('Error checking existing enrollment:', error);
      } finally {
        setIsCheckingEnrollment(false);
      }
    }

    // No existing enrollment found, navigate to enrollment form
    router.replace('/enrollment/form' as any);
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180], // Increased height to accommodate 3 items
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={toggleDropdown}>
        <Icon name="school" size={24} color={isActive ? '#de0000' : '#666'} />
        <View style={styles.textContainer}>
          <Text style={[styles.navText, isActive && styles.activeNavText]}>
            Enrollment
          </Text>
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <Icon
              name="keyboard-arrow-down"
              size={12}
              color={isActive ? '#de0000' : '#666'}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/form' && styles.activeDropdownItem,
          ]}
          onPress={handleNewEnrollmentPress}
          disabled={isCheckingEnrollment}
          onPress={() => navigateToScreen('/enrollment/form')}
        >
          <Text
            style={[
              styles.dropdownText,
              currentRoute === '/form' && styles.activeDropdownText,
              isCheckingEnrollment && styles.disabledText,
            ]}
          >
            {isCheckingEnrollment ? 'Checking...' : 'New Enrollment'}
            ]}
          >
            New Enrollment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/studyload' && styles.activeDropdownItem,
          ]}
          onPress={() => navigateToScreen('/studyload')}
        >
          <Text
            style={[
              styles.dropdownText,
              currentRoute === '/studyload' && styles.activeDropdownText,
            ]}
          >
            Study Load
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/schedule' && styles.activeDropdownItem,
          ]}
          onPress={() => navigateToScreen('/schedule')}
        >
          <Text
            style={[
              styles.dropdownText,
              currentRoute === '/schedule' && styles.activeDropdownText,
            ]}
          >
            Schedule
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    zIndex: 10001,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  navText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginRight: 2,
  },
  activeNavText: {
    color: '#de0000',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    bottom: '113%',
    left: -50,
    right: -50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    borderRadius: 12,
    zIndex: 10002,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeDropdownItem: {
    backgroundColor: '#fff3e0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeDropdownText: {
    color: '#de0000',
    fontWeight: '700',
  },
  disabledText: {
    color: '#999',
  },
});
