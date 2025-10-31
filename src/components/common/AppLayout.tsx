import React, { ReactNode } from 'react';
import { View, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navbar } from './Navbar';
import { BottomNavigation } from '../BottomNavigation';

interface AppLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showBottomNav?: boolean;
  showNotifications?: boolean;
  enrollmentActive?: boolean;
  paymentActive?: boolean;
  scrollable?: boolean;
}

/**
 * AppLayout Component
 * Main layout wrapper for authenticated screens with navbar and bottom navigation
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showNavbar = true,
  showBottomNav = true,
  showNotifications = true,
  enrollmentActive = false,
  paymentActive = false,
  scrollable = false,
}) => {
  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? { showsVerticalScrollIndicator: false, style: styles.scrollContent }
    : { style: styles.content };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />

      {/* Navbar */}
      {showNavbar && <Navbar showNotifications={showNotifications} />}

      {/* Main Content */}
      <ContentWrapper {...contentProps}>{children}</ContentWrapper>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNavigation
          enrollmentActive={enrollmentActive}
          paymentActive={paymentActive}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
});
