import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles } from './ScheduleScreen.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';

// Import your different calendar components
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';

export const ScheduleScreen = (): React.JSX.Element => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState('January');
  const [currentYear, setCurrentYear] = useState('2024');
  const [viewMode, setViewMode] = useState<'Month' | 'Week'>('Month');

  const renderCalendarView = () => {
    if (viewMode === 'Week') {
      return (
        <WeekView 
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      );
    } else {
      return (
        <MonthView 
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />
      
      {/* Header */}
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
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="notifications" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarCard}>
            {/* Calendar Controls */}
            <View style={styles.calendarControls}>
              <View style={styles.monthYearContainer}>
                <TouchableOpacity style={styles.monthButton}>
                  <Text style={styles.monthText}>{currentMonth}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.yearButton}>
                  <Text style={styles.yearText}>{currentYear}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.navigationContainer}>
                <TouchableOpacity style={styles.navButton}>
                  <Icon name="keyboard-arrow-left" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton}>
                  <Icon name="keyboard-arrow-right" size={20} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.viewModeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.viewModeButton,
                    viewMode === 'Month' && styles.activeViewMode
                  ]}
                  onPress={() => setViewMode('Month')}
                >
                  <Text style={[
                    styles.viewModeText,
                    viewMode === 'Month' && styles.activeViewModeText
                  ]}>
                    Month
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.viewModeButton,
                    viewMode === 'Week' && styles.activeViewMode
                  ]}
                  onPress={() => setViewMode('Week')}
                >
                  <Text style={[
                    styles.viewModeText,
                    viewMode === 'Week' && styles.activeViewModeText
                  ]}>
                    Week
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Render appropriate calendar view */}
            {renderCalendarView()}
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/home')}
        >
          <Icon name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <EnrollmentDropdown isActive={false} />
        
        <TouchableOpacity style={styles.navItem}>
          <Icon name="grade" size={24} color="#666" />
          <Text style={styles.navText}>Grades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="payment" size={24} color="#666" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="description" size={24} color="#666" />
          <Text style={styles.navText}>Documents</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};