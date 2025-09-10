import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ScheduleScreen.styles';

interface MonthViewProps {
  currentMonth: string;
  currentYear: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'class' | 'exam' | 'break' | 'activity';
}

interface DayData {
  date: number | null;
  events: CalendarEvent[];
  isToday?: boolean;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentMonth, currentYear }) => {
  // Sample month data - replace with your actual data logic
  const generateMonthData = (): DayData[][] => {
    const weeks: DayData[][] = [];
    
    // Sample week 1
    weeks.push([
      { date: null, events: [] },
      { date: 31, events: [] },
      { date: 1, events: [
        { id: '1', title: 'Math Class', time: '8:00 AM', type: 'class' as const },
        { id: '2', title: 'Break', time: '10:00 AM', type: 'break' as const },
        { id: '3', title: 'Lab Session', time: '1:30 PM', type: 'class' as const },
      ]},
      { date: 2, events: [
        { id: '4', title: 'Science Class', time: '9:00 AM', type: 'class' as const },
        { id: '5', title: 'Break', time: '11:00 AM', type: 'break' as const },
      ]},
      { date: 3, events: [], isToday: true },
      { date: 4, events: [
        { id: '6', title: 'Exam', time: '2:00 PM', type: 'exam' as const },
      ]},
      { date: 5, events: [
        { id: '7', title: 'Sports', time: '3:00 PM', type: 'activity' as const },
      ]},
    ]);

    // Add more weeks as needed...
    for (let week = 0; week < 5; week++) {
      if (week === 0) continue; // We already added the first week
      
      const weekData: DayData[] = [];
      for (let day = 0; day < 7; day++) {
        const date = (week * 7) + day - 2; // Adjust based on your calendar logic
        if (date > 0 && date <= 31) {
          weekData.push({ date, events: [] });
        } else {
          weekData.push({ date: null, events: [] });
        }
      }
      weeks.push(weekData);
    }

    return weeks;
  };

  const monthData = generateMonthData();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
        {dayLabels.map((label, index) => (
          <View key={index} style={styles.dayLabelCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Rows */}
      {monthData.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.calendarRow}>
          {week.map((day, dayIndex) => (
            <View key={dayIndex} style={styles.dayColumn}>
              {day.date && (
                <>
                  <View style={[
                    styles.dayHeader,
                    day.isToday && styles.todayHeader
                  ]}>
                    <Text style={[
                      styles.dayNumber,
                      day.isToday && styles.todayNumber
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
                </>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};