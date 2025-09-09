import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles } from './ScheduleScreen.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'class' | 'exam' | 'break' | 'activity';
}

interface DayEvents {
  [key: string]: CalendarEvent[];
}

const CalendarDay: React.FC<{
  day: number;
  events: CalendarEvent[];
  isToday?: boolean;
}> = ({ day, events, isToday = false }) => {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'class':
        return styles.classEvent;
      case 'exam':
        return styles.examEvent;
      case 'break':
        return styles.breakEvent;
      case 'activity':
        return styles.activityEvent;
      default:
        return styles.classEvent;
    }
  };

  return (
    <View style={styles.dayColumn}>
      <View style={[styles.dayHeader, isToday && styles.todayHeader]}>
        <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
          {day}
        </Text>
      </View>
      <View style={styles.eventsContainer}>
        {events.map((event) => (
          <View
            key={event.id}
            style={[styles.eventBlock, getEventColor(event.type)]}
          >
            <Text style={styles.eventTime}>{event.time}</Text>
            <Text 
              style={styles.eventTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {event.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ScheduleScreen = (): React.JSX.Element => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState('January');
  const [currentYear, setCurrentYear] = useState('2024');
  const [viewMode, setViewMode] = useState<'Month' | 'Week'>('Month');

  // Sample events data
  const weekEvents: DayEvents = {
    '30': [],
    '31': [],
    '1': [
      { id: '1', time: '8:00 AM', title: 'Event Title', type: 'class' },
      { id: '2', time: '10:00 AM', title: 'Event Title', type: 'exam' },
      { id: '3', time: '1:30 PM', title: 'Event Title', type: 'break' },
    ],
    '2': [
      { id: '4', time: '9:00 AM', title: 'Event Title', type: 'class' },
      { id: '5', time: '11:00 AM', title: 'Event Title', type: 'exam' },
      { id: '6', time: '1:30 PM', title: 'Event Title', type: 'break' },
    ],
    '3': [
      { id: '7', time: '8:00 AM', title: 'Event Title', type: 'class' },
      { id: '8', time: '10:00 AM', title: 'Event Title', type: 'exam' },
      { id: '9', time: '1:30 PM', title: 'Event Title', type: 'break' },
      { id: '10', time: '2:30 PM', title: 'Event Title', type: 'activity' },
      { id: '11', time: '3:30 PM', title: 'Event Title', type: 'activity' },
    ],
    '4': [
      { id: '12', time: '9:00 AM', title: 'Event Title', type: 'class' },
      { id: '13', time: '11:00 AM', title: 'Event Title', type: 'exam' },
      { id: '14', time: '1:30 PM', title: 'Event Title', type: 'break' },
      { id: '15', time: '4:30 PM', title: 'Event Title', type: 'activity' },
      { id: '16', time: '6:00 PM', title: 'Event Title', type: 'activity' },
    ],
    '5': [
      { id: '17', time: '8:00 AM', title: 'Event Title', type: 'class' },
      { id: '18', time: '10:00 AM', title: 'Event Title', type: 'exam' },
    ],
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekDays = ['30', '31', '1', '2', '3', '4', '5'];

  const isCalendarActive = true;

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
            <TouchableOpacity 
              style={styles.profileButton}
            //   onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.calendarContainer}>
            {/* Calendar Card */}
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

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {/* Day Labels */}
                <View style={styles.dayLabelsRow}>
                  {dayLabels.map((label, index) => (
                    <View key={index} style={styles.dayLabelCell}>
                      <Text style={styles.dayLabel}>{label}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Days */}
                <View style={styles.calendarRow}>
                  {weekDays.map((day, index) => (
                    <CalendarDay
                      key={day}
                      day={parseInt(day)}
                      events={weekEvents[day] || []}
                      isToday={day === '3'}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
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
        
        <TouchableOpacity 
          style={styles.navItem}
        //   onPress={() => router.push('/grades')}
        >
          <Icon name="grade" size={24} color="#666" />
          <Text style={styles.navText}>Grades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="payment" size={24} color="#666" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
        //   onPress={() => router.push('/documents')}
        >
          <Icon name="description" size={24} color="#666" />
          <Text style={styles.navText}>Documents</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};