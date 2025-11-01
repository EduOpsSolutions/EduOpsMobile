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

interface PaymentDropdownProps {
  isActive: boolean;
}

export const PaymentDropdown: React.FC<PaymentDropdownProps> = ({ isActive }) => {
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
    router.replace(route as any); 
    setIsOpen(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={toggleDropdown}>
        <Icon name="payment" size={24} color={isActive ? "#de0000" : "#666"} />
        <View style={styles.textContainer}>
          <Text style={[styles.navText, isActive && styles.activeNavText]}>
            Payment
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
            currentRoute === '/paymentform' && styles.activeDropdownItem
          ]}
          onPress={() => navigateToScreen('/paymentform')}
        >
          <Text style={[
            styles.dropdownText,
            currentRoute === '/paymentform' && styles.activeDropdownText
          ]}>
            Payment Form
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/assessment' && styles.activeDropdownItem
          ]}
          onPress={() => navigateToScreen('/assessment')}
        >
          <Text style={[
            styles.dropdownText,
            currentRoute === '/assessment' && styles.activeDropdownText
          ]}>
            Assessment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dropdownItem,
            currentRoute === '/ledger' && styles.activeDropdownItem
          ]}
          onPress={() => navigateToScreen('/ledger')}
        >
          <Text style={[
            styles.dropdownText,
            currentRoute === '/ledger' && styles.activeDropdownText
          ]}>
            Ledger
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
});