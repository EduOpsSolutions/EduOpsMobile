import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { styles } from './ScheduleScreen.styles';
import { AppLayout } from '../../components/common';
import axiosInstance from '@/src/utils/axios';

interface Schedule {
  id: string;
  courseName: string;
  days: string;
  time_start: string;
  time_end: string;
  teacherName: string;
  location: string;
  periodStart: string;
  periodEnd: string;
  academicPeriodName?: string;
  notes?: string;
  color?: string;
}

interface DaySchedulesModalProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  schedules: Schedule[];
  onScheduleClick: (schedule: Schedule) => void;
}

interface ScheduleDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  schedule: Schedule | null;
}

// Day Schedules Modal Component
const DaySchedulesModal: React.FC<DaySchedulesModalProps> = ({
  visible,
  onClose,
  date,
  schedules,
  onScheduleClick,
}) => {
  if (!visible) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{formatDate(date)}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {schedules.length === 0 ? (
            <View style={styles.emptyModal}>
              <Icon name="event-busy" size={48} color="#999" />
              <Text style={styles.emptyModalText}>No classes scheduled for this day</Text>
            </View>
          ) : (
            schedules.map((schedule) => (
              <TouchableOpacity
                key={schedule.id}
                style={styles.scheduleItem}
                onPress={() => onScheduleClick(schedule)}
              >
                <View style={styles.scheduleItemHeader}>
                  <Text style={styles.scheduleItemCourse}>{schedule.courseName}</Text>
                  <Icon name="chevron-right" size={20} color="#666" />
                </View>
                <Text style={styles.scheduleItemTime}>
                  {schedule.time_start} - {schedule.time_end}
                </Text>
                <Text style={styles.scheduleItemDetails}>
                  {schedule.teacherName} • {schedule.location}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

// Schedule Details Modal Component
const ScheduleDetailsModal: React.FC<ScheduleDetailsModalProps> = ({
  visible,
  onClose,
  schedule,
}) => {
  if (!visible || !schedule) return null;

  const calculateTotalHours = (sched: Schedule): string => {
    try {
      if (
        !sched?.periodStart ||
        !sched?.periodEnd ||
        !sched?.time_start ||
        !sched?.time_end ||
        !sched?.days
      ) {
        return '—';
      }

      const [sh, sm] = String(sched.time_start).split(':').map(Number);
      const [eh, em] = String(sched.time_end).split(':').map(Number);
      const minutes = eh * 60 + em - (sh * 60 + sm);
      if (minutes <= 0) return '—';
      const hoursPerSession = minutes / 60;

      const dayMap: Record<string, number> = {
        SU: 0,
        M: 1,
        T: 2,
        W: 3,
        TH: 4,
        F: 5,
        S: 6,
      };
      const selectedDays = new Set(
        String(sched.days)
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => dayMap[d])
          .filter((n) => n !== undefined)
      );
      if (selectedDays.size === 0) return '—';

      const start = new Date(sched.periodStart);
      const end = new Date(sched.periodEnd);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return '—';
      if (start > end) return '—';

      let count = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (selectedDays.has(d.getDay())) count++;
      }

      const total = count * hoursPerSession;
      const fixed = total.toFixed(1);
      return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
    } catch (error) {
      return '—';
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.detailsModalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Schedule Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.detailsContent}
          contentContainerStyle={styles.detailsContentContainer}
        >
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Course</Text>
              <Text style={styles.detailValue}>{schedule.courseName || 'N/A'}</Text>
            </View>

            {schedule.academicPeriodName && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Academic Period</Text>
                <Text style={styles.detailValue}>{schedule.academicPeriodName}</Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Teacher</Text>
              <Text style={styles.detailValue}>{schedule.teacherName || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{schedule.location || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Days</Text>
              <Text style={styles.detailValue}>{schedule.days || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {schedule.time_start} - {schedule.time_end}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Estimated Total Hours</Text>
              <Text style={styles.detailValue}>{calculateTotalHours(schedule)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Period (YYYY-MM-DD)</Text>
              <Text style={styles.detailValue}>
                {schedule.periodStart || '—'} to {schedule.periodEnd || '—'}
              </Text>
            </View>

            {schedule.notes && (
              <View style={[styles.detailItem, styles.notesItem]}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValue}>{schedule.notes}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export const ScheduleScreen = (): React.JSX.Element => {
  const [events, setEvents] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [daySchedules, setDaySchedules] = useState<Schedule[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate consistent color for a course based on its name
  const getColorForCourse = (courseName: string): string => {
    const colors = [
      '#de0000', // Red
      '#2196F3', // Blue
      '#4CAF50', // Green
      '#FF9800', // Orange
      '#9C27B0', // Purple
      '#00BCD4', // Cyan
      '#FF5722', // Deep Orange
      '#3F51B5', // Indigo
      '#8BC34A', // Light Green
      '#E91E63', // Pink
      '#009688', // Teal
      '#FFC107', // Amber
      '#673AB7', // Deep Purple
      '#CDDC39', // Lime
      '#607D8B', // Blue Grey
    ];

    // Generate a hash from the course name
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Determine if text should be white or black for contrast
  const getContrastColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light backgrounds, white for dark
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const resp = await axiosInstance.get('/schedules/mine');
      if (Array.isArray(resp.data)) {
        setEvents(resp.data);
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.error('Failed to fetch student schedules', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const resp = await axiosInstance.get('/schedules/mine');
      if (Array.isArray(resp.data)) {
        setEvents(resp.data);
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.error('Failed to fetch student schedules', e);
      setEvents([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getSchedulesForDate = (day: number, month: number, year: number): Schedule[] => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const dayMap = ['SU', 'M', 'T', 'W', 'TH', 'F', 'S'];
    const dayCode = dayMap[dayOfWeek];

    return events.filter((event) => {
      const start = new Date(event.periodStart);
      const end = new Date(event.periodEnd);
      const isInPeriod = date >= start && date <= end;
      const days = event.days?.split(',').map((d) => d.trim()) || [];
      const isOnThisDay = days.includes(dayCode);

      return isInPeriod && isOnThisDay;
    });
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const schedulesForDay = getSchedulesForDate(day, currentMonth, currentYear);

    if (schedulesForDay.length > 0) {
      setSelectedDate(date);
      setDaySchedules(schedulesForDay);
      setShowDayModal(true);
    }
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDayModal(false);
    setShowDetailsModal(true);
  };

  const handleCloseModals = () => {
    setShowDayModal(false);
    setShowDetailsModal(false);
    setSelectedSchedule(null);
    setSelectedDate(null);
    setDaySchedules([]);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const schedulesForDay = getSchedulesForDate(day, currentMonth, currentYear);
      const hasSchedules = schedulesForDay.length > 0;
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear();

      // Get color from first schedule for badge only
      const badgeColor = hasSchedules
        ? (schedulesForDay[0].color || getColorForCourse(schedulesForDay[0].courseName))
        : '#de0000';

      // Get contrast color for badge text
      const badgeTextColor = hasSchedules ? getContrastColor(badgeColor) : '#fff';

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
            hasSchedules && styles.hasSchedulesCell,
          ]}
          onPress={() => handleDateClick(day)}
          disabled={!hasSchedules}
        >
          <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
          {hasSchedules && (
            <View style={[styles.scheduleIndicator, { backgroundColor: badgeColor }]}>
              <Text style={[styles.scheduleCount, { color: badgeTextColor }]}>
                {schedulesForDay.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <AppLayout showNotifications={false} enrollmentActive={true} paymentActive={false}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            setShowMonthPicker(false);
            setShowYearPicker(false);
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#de0000']}
              tintColor="#de0000"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#de0000" />
              <Text style={styles.loadingText}>Loading your schedules...</Text>
            </View>
          ) : (
            <View style={styles.calendarContainer}>
              {/* Backdrop for closing pickers */}
              {(showMonthPicker || showYearPicker) && (
                <TouchableOpacity
                  style={styles.pickerBackdrop}
                  activeOpacity={1}
                  onPress={() => {
                    setShowMonthPicker(false);
                    setShowYearPicker(false);
                  }}
                />
              )}

              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                {/* Month Picker */}
                <TouchableOpacity
                  style={styles.monthButton}
                  onPress={() => {
                    setShowMonthPicker(!showMonthPicker);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={styles.monthButtonText}>{monthNames[currentMonth]}</Text>
                  <Icon name="arrow-drop-down" size={20} color="#fff" />
                </TouchableOpacity>

                {showMonthPicker && (
                  <View
                    style={styles.pickerDropdown}
                    onStartShouldSetResponder={() => true}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    <ScrollView
                      style={styles.pickerScroll}
                      nestedScrollEnabled={true}
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                    >
                      {monthNames.map((month, index) => (
                        <TouchableOpacity
                          key={month}
                          style={[
                            styles.pickerItem,
                            currentMonth === index && styles.pickerItemActive,
                          ]}
                          onPress={() => {
                            setCurrentMonth(index);
                            setShowMonthPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              currentMonth === index && styles.pickerItemTextActive,
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Year Picker */}
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => {
                    setShowYearPicker(!showYearPicker);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={styles.yearButtonText}>{currentYear}</Text>
                  <Icon name="arrow-drop-down" size={20} color="#fff" />
                </TouchableOpacity>

                {showYearPicker && (
                  <View
                    style={[styles.pickerDropdown, styles.yearDropdown]}
                    onStartShouldSetResponder={() => true}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    <ScrollView
                      style={styles.pickerScroll}
                      nestedScrollEnabled={true}
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                    >
                      {yearRange.map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.pickerItem,
                            currentYear === year && styles.pickerItemActive,
                          ]}
                          onPress={() => {
                            setCurrentYear(year);
                            setShowYearPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              currentYear === year && styles.pickerItemTextActive,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Navigation Arrows */}
                <View style={styles.navigationButtons}>
                  <TouchableOpacity onPress={() => navigateMonth('prev')}>
                    <Icon name="chevron-left" size={28} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigateMonth('next')}>
                    <Icon name="chevron-right" size={28} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendar}>
                {/* Weekday Headers */}
                <View style={styles.weekdayRow}>
                  {weekdays.map((day) => (
                    <View key={day} style={styles.weekdayCell}>
                      <Text style={styles.weekdayText}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Days */}
                <View style={styles.daysGrid}>{renderCalendar()}</View>
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, styles.todayLegend]} />
                  <Text style={styles.legendText}>Today</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, styles.hasScheduleLegend]} />
                  <Text style={styles.legendText}>Has Class</Text>
                </View>
                <View style={styles.legendItem}>
                  <Icon name="palette" size={16} color="#666" />
                  <Text style={styles.legendText}>Badge colors = Course colors</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Day Schedules Modal */}
        {selectedDate && (
          <DaySchedulesModal
            visible={showDayModal}
            onClose={handleCloseModals}
            date={selectedDate}
            schedules={daySchedules}
            onScheduleClick={handleScheduleClick}
          />
        )}

        {/* Schedule Details Modal */}
        <ScheduleDetailsModal
          visible={showDetailsModal}
          onClose={handleCloseModals}
          schedule={selectedSchedule}
        />
      </View>
    </AppLayout>
  );
};
