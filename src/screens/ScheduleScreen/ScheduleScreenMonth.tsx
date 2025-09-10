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
import { styles } from './ScheduleScreenMonth.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';

interface CalendarEvent {
  id: string;
  type: 'class' | 'exam' | 'break' | 'activity';
}

interface DayData {
  day: number;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday?: boolean;
}

const CalendarDay: React.FC<{
  dayData: DayData;
}> = ({ dayData }) => {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'class':
        return styles.classEventDot;
      case 'exam':
        return styles.examEventDot;
      case 'break':
        return styles.breakEventDot;
      case 'activity':
        return styles.activityEventDot;
      default:
        return styles.classEventDot;
    }
  };

  return (
    <View style={styles.dayCell}>
      <View style={[
        styles.dayHeader,
        dayData.isToday && styles.todayHeader,
        !dayData.isCurrentMonth && styles.otherMonthDay
      ]}>
        <Text style={[
          styles.dayNumber,
          dayData.isToday && styles.todayNumber,
          !dayData.isCurrentMonth && styles.otherMonthNumber
        ]}>
          {dayData.day}
        </Text>
      </View>
      <View style={styles.eventsContainer}>
        {dayData.events.slice(0, 4).map((event, index) => (
          <View
            key={event.id}
            style={[styles.eventDot, getEventColor(event.type)]}
          />
        ))}
      </View>
    </View>
  );
};

export const CalendarScreen = (): React.JSX.Element => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState('January');
  const [currentYear, setCurrentYear] = useState('2024');
  const [viewMode, setViewMode] = useState<'Month' | 'Week'>('Month');

  // Generate calendar data for January 2024
  const generateCalendarData = (): DayData[][] => {
    const weeks: DayData[][] = [];
    
    // Sample events data
    const eventsData: { [key: number]: CalendarEvent[] } = {
      1: [
        { id: '1', type: 'class' },
        { id: '2', type: 'exam' },
        { id: '3', type: 'break' }
      ],
      2: [
        { id: '4', type: 'class' },
        { id: '5', type: 'activity' }
      ],
      3: [
        { id: '6', type: 'exam' },
        { id: '7', type: 'break' },
        { id: '8', type: 'activity' }
      ],
      4: [
        { id: '9', type: 'class' },
        { id: '10', type: 'exam' }
      ],
      5: [
        { id: '11', type: 'break' },
        { id: '12', type: 'activity' }
      ],
      6: [
        { id: '13', type: 'class' },
        { id: '14', type: 'exam' },
        { id: '15', type: 'break' }
      ],
      7: [
        { id: '16', type: 'activity' }
      ],
      8: [
        { id: '17', type: 'class' },
        { id: '18', type: 'exam' }
      ],
      9: [
        { id: '19', type: 'break' },
        { id: '20', type: 'activity' }
      ],
      10: [
        { id: '21', type: 'class' },
        { id: '22', type: 'exam' }
      ],
      11: [
        { id: '23', type: 'break' },
        { id: '24', type: 'activity' }
      ],
      12: [
        { id: '25', type: 'class' }
      ],
      13: [
        { id: '26', type: 'exam' },
        { id: '27', type: 'break' }
      ],
      14: [
        { id: '28', type: 'activity' }
      ],
      15: [
        { id: '29', type: 'class' },
        { id: '30', type: 'exam' }
      ],
      16: [
        { id: '31', type: 'break' }
      ],
      17: [
        { id: '32', type: 'activity' },
        { id: '33', type: 'class' }
      ],
      18: [
        { id: '34', type: 'exam' },
        { id: '35', type: 'break' }
      ],
      19: [
        { id: '36', type: 'activity' }
      ],
      20: [
        { id: '37', type: 'class' },
        { id: '38', type: 'exam' }
      ],
      21: [
        { id: '39', type: 'break' },
        { id: '40', type: 'activity' }
      ],
      22: [
        { id: '41', type: 'class' }
      ],
      23: [
        { id: '42', type: 'exam' },
        { id: '43', type: 'break' }
      ],
      24: [
        { id: '44', type: 'activity' }
      ],
      25: [
        { id: '45', type: 'class' },
        { id: '46', type: 'exam' }
      ],
      26: [
        { id: '47', type: 'break' }
      ],
      27: [
        { id: '48', type: 'activity' },
        { id: '49', type: 'class' }
      ],
      28: [
        { id: '50', type: 'exam' },
        { id: '51', type: 'break' }
      ],
      29: [
        { id: '52', type: 'activity' }
      ],
      30: [
        { id: '53', type: 'class' },
        { id: '54', type: 'exam' }
      ],
      31: [
        { id: '55', type: 'break' }
      ]
    };

    // Week 1: Dec 30, 31, Jan 1-5
    weeks.push([
      { day: 30, events: [], isCurrentMonth: false },
      { day: 31, events: [], isCurrentMonth: false },
      { day: 1, events: eventsData[1] || [], isCurrentMonth: true },
      { day: 2, events: eventsData[2] || [], isCurrentMonth: true },
      { day: 3, events: eventsData[3] || [], isCurrentMonth: true, isToday: true },
      { day: 4, events: eventsData[4] || [], isCurrentMonth: true },
      { day: 5, events: eventsData[5] || [], isCurrentMonth: true }
    ]);

    // Week 2: Jan 6-12
    weeks.push([
      { day: 6, events: eventsData[6] || [], isCurrentMonth: true },
      { day: 7, events: eventsData[7] || [], isCurrentMonth: true },
      { day: 8, events: eventsData[8] || [], isCurrentMonth: true },
      { day: 9, events: eventsData[9] || [], isCurrentMonth: true },
      { day: 10, events: eventsData[10] || [], isCurrentMonth: true },
      { day: 11, events: eventsData[11] || [], isCurrentMonth: true },
      { day: 12, events: eventsData[12] || [], isCurrentMonth: true }
    ]);

    // Week 3: Jan 13-19
    weeks.push([
      { day: 13, events: eventsData[13] || [], isCurrentMonth: true },
      { day: 14, events: eventsData[14] || [], isCurrentMonth: true },
      { day: 15, events: eventsData[15] || [], isCurrentMonth: true },
      { day: 16, events: eventsData[16] || [], isCurrentMonth: true },
      { day: 17, events: eventsData[17] || [], isCurrentMonth: true },
      { day: 18, events: eventsData[18] || [], isCurrentMonth: true },
      { day: 19, events: eventsData[19] || [], isCurrentMonth: true }
    ]);

    // Week 4: Jan 20-26
    weeks.push([
      { day: 20, events: eventsData[20] || [], isCurrentMonth: true },
      { day: 21, events: eventsData[21] || [], isCurrentMonth: true },
      { day: 22, events: eventsData[22] || [], isCurrentMonth: true },
      { day: 23, events: eventsData[23] || [], isCurrentMonth: true },
      { day: 24, events: eventsData[24] || [], isCurrentMonth: true },
      { day: 25, events: eventsData[25] || [], isCurrentMonth: true },
      { day: 26, events: eventsData[26] || [], isCurrentMonth: true }
    ]);

    // Week 5: Jan 27-31, Feb 1-2
    weeks.push([
      { day: 27, events: eventsData[27] || [], isCurrentMonth: true },
      { day: 28, events: eventsData[28] || [], isCurrentMonth: true },
      { day: 29, events: eventsData[29] || [], isCurrentMonth: true },
      { day: 30, events: eventsData[30] || [], isCurrentMonth: true },
      { day: 31, events: eventsData[31] || [], isCurrentMonth: true },
      { day: 1, events: [], isCurrentMonth: false },
      { day: 2, events: [], isCurrentMonth: false }
    ]);

    return weeks;
  };

  const calendarWeeks = generateCalendarData();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
        {/* Decorative Elements */}
        <View style={styles.decorativeTop} />
        <View style={styles.decorativeBottom} />
        
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

                {/* Calendar Weeks */}
                {calendarWeeks.map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.calendarWeek}>
                    {week.map((dayData, dayIndex) => (
                      <CalendarDay
                        key={`${weekIndex}-${dayIndex}`}
                        dayData={dayData}
                      />
                    ))}
                  </View>
                ))}
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