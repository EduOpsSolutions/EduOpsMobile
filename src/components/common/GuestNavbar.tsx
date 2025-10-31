import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export const GuestNavbar = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/' as any)}
        >
          <Icon name="home" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#de0000',
  },
  navbar: {
    backgroundColor: '#de0000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeButton: {
    padding: 4,
  },
});
