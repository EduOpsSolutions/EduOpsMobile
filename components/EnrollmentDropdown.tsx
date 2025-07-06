import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useSegments } from "expo-router";

interface EnrollmentDropdownProps {
  isActive: boolean;
}

export const EnrollmentDropdown: React.FC<EnrollmentDropdownProps> = ({ isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = '/' + (segments[segments.length - 1] || '');

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
    router.replace('/enrollmentform');
    setIsOpen(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150], 
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={toggleDropdown}>
        <Icon name="school" size={24} color={isActive ? "#de0000" : "#666"} />
        <View style={styles.textContainer}>
          <Text style={[styles.navText, isActive && styles.activeNavText]}>
            Enrollment
          </Text>
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <Icon 
              name="keyboard-arrow-down" 
              size={12} 
              color={isActive ? "#de0000" : "#666"} 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/enrollment' && styles.activeDropdownItem
          ]}
          onPress={() => navigateToScreen('/enrollment')}
        >
          <Text style={[
            styles.dropdownText,
            currentRoute === '/enrollment' && styles.activeDropdownText
          ]}>
            Form
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/studyload' && styles.activeDropdownItem
          ]}
          onPress={() => navigateToScreen('/studyload')}
        >
          <Text style={[
            styles.dropdownText,
            currentRoute === '/studyload' && styles.activeDropdownText
          ]}>
            Study Load
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/schedule' && styles.activeDropdownItem
          ]}
          onPress={() => navigateToScreen('/schedule')}
        >
          <Text style={[
            styles.dropdownText,
            currentRoute === '/schedule' && styles.activeDropdownText
          ]}>
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
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8, 
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  activeDropdownItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownText: {
    fontSize: 12,
    color: 'black',
    fontWeight: '500',
  },
  activeDropdownText: {
    color: '#ffcf00',
    fontWeight: '600',
  },
});