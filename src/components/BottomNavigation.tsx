import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useSegments } from 'expo-router';
import { EnrollmentDropdown } from '../../components/EnrollmentDropdown';
import { PaymentDropdown } from '../../components/PaymentDropdown';

interface BottomNavigationProps {
  enrollmentActive?: boolean;
  paymentActive?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  enrollmentActive = false,
  paymentActive = false,
}) => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = '/' + (segments[segments.length - 1] || '');
  const insets = useSafeAreaInsets();

  const navItems = [
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      route: '/home',
    },
    {
      id: 'grades',
      icon: 'grade',
      label: 'Grades',
      route: '/grades',
    },
    {
      id: 'documents',
      icon: 'description',
      label: 'Documents',
      route: '/document',
    },
  ];

  const handleNavigation = (route: string) => {
    router.navigate(route as any);
  };

  const isActiveRoute = (route: string) => {
    return currentRoute === route;
  };

  return (
    <View
      style={[
        styles.bottomNavigation,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {/* Home */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation('/home')}
      >
        <Icon
          name="home"
          size={24}
          color={isActiveRoute('/home') ? '#de0000' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActiveRoute('/home') && styles.activeNavText,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Enrollment Dropdown */}
      <EnrollmentDropdown isActive={enrollmentActive} />

      {/* Grades */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation('/grades')}
      >
        <Icon
          name="grade"
          size={24}
          color={isActiveRoute('/grades') ? '#de0000' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActiveRoute('/grades') && styles.activeNavText,
          ]}
        >
          Grades
        </Text>
      </TouchableOpacity>

      {/* Payment Dropdown */}
      <PaymentDropdown isActive={paymentActive} />

      {/* Documents */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation('/document')}
      >
        <Icon
          name="description"
          size={24}
          color={isActiveRoute('/document') ? '#de0000' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActiveRoute('/document') && styles.activeNavText,
          ]}
        >
          Documents
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 10000,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activeNavText: {
    color: '#de0000',
    fontWeight: '500',
  },
});
