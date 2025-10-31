import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './StudyLoadScreen.styles';
import { AppLayout } from '../../components/common';

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  value,
  onValueChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={16} color="#666" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownOption}
              onPress={() => {
                onValueChange(option);
                setIsOpen(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

interface ScheduleItemProps {
  course: string;
  schedule: string;
  adviser: string;
  hours: string;
  room: string;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({
  course,
  schedule,
  adviser,
  hours,
  room,
}) => {
  return (
    <View style={styles.scheduleRow}>
      <Text style={styles.courseText}>{course}</Text>
      <Text style={styles.scheduleText}>{schedule}</Text>
      <Text style={styles.adviserText}>{adviser}</Text>
      <Text style={styles.hoursText}>{hours}</Text>
      <Text style={styles.roomText}>{room}</Text>
    </View>
  );
};

export const StudyLoadScreen = (): React.JSX.Element => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const periodOptions = [
    '1st Quarter',
    '2nd Quarter',
    '3rd Quarter',
    '4th Quarter',
  ];
  const yearOptions = ['2024', '2023', '2022', '2021'];

  const scheduleData: ScheduleItemProps[] = [
    {
      course: 'A1',
      schedule: 'TTH 6:30AM - 7:30PM',
      adviser: 'Tricia Cruz',
      hours: '12',
      room: 'Room 01',
    },
  ];

  const isScheduleActive = true;

  return (
    <AppLayout
      showNotifications={false}
      enrollmentActive={isScheduleActive}
      paymentActive={false}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scheduleContainer}>
            {/* Schedule Card */}
            <View style={styles.scheduleCard}>
              {/* Header Section */}
              <View style={styles.scheduleHeader}>
                <Icon name="calendar-today" size={20} color="#333" />
                <Text style={styles.scheduleTitle}>SELECT SCHOOL PERIOD</Text>
              </View>

              {/* Filter Section */}
              <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Period</Text>
                    <Dropdown
                      placeholder="Select Period"
                      value={selectedPeriod}
                      onValueChange={setSelectedPeriod}
                      options={periodOptions}
                    />
                  </View>
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Year</Text>
                    <Dropdown
                      placeholder="Select Year"
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                      options={yearOptions}
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.searchButton}>
                  <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
              </View>

              {/* Student Name */}
              <Text style={styles.studentName}>Dolor, Polano</Text>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Course</Text>
                <Text style={styles.tableHeaderText}>Schedule</Text>
                <Text style={styles.tableHeaderText}>Adviser</Text>
                <Text style={styles.tableHeaderText}># of Hours</Text>
                <Text style={styles.tableHeaderText}>Room</Text>
              </View>

              {/* Schedule List */}
              <View style={styles.scheduleList}>
                {scheduleData.map((item, index) => (
                  <ScheduleItem
                    key={index}
                    course={item.course}
                    schedule={item.schedule}
                    adviser={item.adviser}
                    hours={item.hours}
                    room={item.room}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </AppLayout>
  );
};
