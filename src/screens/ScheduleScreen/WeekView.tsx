import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ScheduleScreen.styles';

interface WeekViewProps {
  currentMonth: string;
  currentYear: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'class' | 'exam' | 'break' | 'activity';
}

export const WeekView: React.FC<WeekViewProps> = ({ currentMonth, currentYear }) => {
  // Sample week data - replace with your actual data
  const weekDays = [
    { day: 'Mon', date: 1, events: [
      { id: '1', title: 'Math Class', time: '8:00 AM', type: 'class' as const },
      { id: '2', title: 'Break', time: '10:00 AM', type: 'break' as const },
    ]},
    { day: 'Tue', date: 2, events: [
      { id: '3', title: 'Science Lab', time: '9:00 AM', type: 'class' as const },
    ]},
    { day: 'Wed', date: 3, events: [] },
    { day: 'Thu', date: 4, events: [
      { id: '4', title: 'Mid-term Exam', time: '2:00 PM', type: 'exam' as const },
    ]},
    { day: 'Fri', date: 5, events: [
      { id: '5', title: 'Sports Activity', time: '3:00 PM', type: 'activity' as const },
    ]},
  ];

  const getEventStyle = (eventType: string) => {
    switch (eventType) {
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
    <View style={styles.calendarGrid}>
      {/* Day Labels Row */}
      <View style={styles.dayLabelsRow}>
        {weekDays.map((day) => (
          <View key={day.day} style={styles.dayLabelCell}>
            <Text style={styles.dayLabel}>{day.day}</Text>
          </View>
        ))}
      </View>

      {/* Week Row */}
      <View style={styles.calendarRow}>
        {weekDays.map((day) => (
          <View key={`${day.day}-${day.date}`} style={styles.dayColumn}>
            <View style={[
              styles.dayHeader,
              day.date === 3 && styles.todayHeader // Assuming today is 3rd
            ]}>
              <Text style={[
                styles.dayNumber,
                day.date === 3 && styles.todayNumber
              ]}>
                {day.date}
              </Text>
            </View>
            <View style={styles.eventsContainer}>
              {day.events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventBlock, getEventStyle(event.type)]}
                >
                  <Text style={styles.eventTime}>{event.time}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};