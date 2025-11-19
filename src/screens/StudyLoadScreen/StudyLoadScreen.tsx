import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { styles } from './StudyLoadScreen.styles';
import { AppLayout } from '../../components/common';
import { useAuthStore } from '@/src/stores/authStore';
import axiosInstance from '@/src/utils/axios';
import { generateStudyLoadPdfHtml } from '@/src/utils/studyLoadPdfTemplate';

interface AcademicPeriod {
  id: string;
  batchName: string;
  periodStart: string;
  periodEnd: string;
  deletedAt?: string | null;
}

interface Schedule {
  id: string;
  academicPeriodId: string;
  courseName: string;
  days: string;
  time_start: string;
  time_end: string;
  teacherName: string;
  location: string;
  periodStart: string;
  periodEnd: string;
}

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
      <View style={styles.scheduleCell}>
        <Text style={styles.cellText}>{course}</Text>
      </View>
      <View style={styles.scheduleCell}>
        <Text style={styles.cellText}>{schedule}</Text>
      </View>
      <View style={styles.scheduleCell}>
        <Text style={styles.cellText}>{adviser}</Text>
      </View>
      <View style={styles.scheduleCell}>
        <Text style={styles.cellText}>{hours}</Text>
      </View>
      <View style={styles.scheduleCell}>
        <Text style={styles.cellText}>{room}</Text>
      </View>
    </View>
  );
};

export const StudyLoadScreen = (): React.JSX.Element => {
  const { user, getUserFullName } = useAuthStore();
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<AcademicPeriod | null>(
    null
  );
  const [results, setResults] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load all academic periods and current student schedules
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Load academic periods
        const periodsResp = await axiosInstance.get('/academic-periods');
        const periodsData: AcademicPeriod[] = Array.isArray(periodsResp.data)
          ? periodsResp.data
          : [];
        if (!mounted) return;
        const activePeriods = periodsData.filter((p) => !p.deletedAt);
        setPeriods(activePeriods);

        // Load current student schedules to determine current batch
        const schedulesResp = await axiosInstance.get('/schedules/mine');
        const schedulesData: Schedule[] = Array.isArray(schedulesResp.data)
          ? schedulesResp.data
          : [];

        if (schedulesData.length > 0) {
          // Get the most recent academic period from schedules
          const currentPeriodId = schedulesData[0].academicPeriodId;
          const currentPeriod = activePeriods.find(
            (p) => p.id === currentPeriodId
          );

          if (currentPeriod) {
            setSelectedBatch(currentPeriod.batchName);
            setSelectedPeriod(currentPeriod);
            // Only show courses for the current batch
            const currentBatchSchedules = schedulesData.filter(
              (schedule) => schedule.academicPeriodId === currentPeriodId
            );
            setResults(currentBatchSchedules);
          }
        }
      } catch (e) {
        console.error('Error loading data:', e);
        setPeriods([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const batchOptions = useMemo(() => {
    const batches = periods.map((p) => p.batchName).filter(Boolean);
    const uniq = [...new Set(batches)];
    return uniq.sort();
  }, [periods]);

  const handleSearch = async () => {
    try {
      setSearching(true);
      setResults([]);
      setSelectedPeriod(null);
      if (!selectedBatch) return;

      const period = periods.find((p) => p.batchName === selectedBatch);
      if (!period) {
        setResults([]);
        setSelectedPeriod(null);
        return;
      }

      setSelectedPeriod(period);
      // Fetch student schedules and filter by selected period
      const resp = await axiosInstance.get('/schedules/mine');
      const all: Schedule[] = Array.isArray(resp.data) ? resp.data : [];
      const inPeriod = all.filter((e) => e.academicPeriodId === period.id);
      setResults(inPeriod);
    } catch (error) {
      console.error('Error searching schedules:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Helper: compute total hours between start/end dates based on selected days
  const calculateTotalHours = (schedule: Schedule): string => {
    try {
      if (
        !schedule?.periodStart ||
        !schedule?.periodEnd ||
        !schedule?.time_start ||
        !schedule?.time_end ||
        !schedule?.days
      ) {
        return '—';
      }

      // Parse time duration in hours
      const [sh, sm] = String(schedule.time_start).split(':').map(Number);
      const [eh, em] = String(schedule.time_end).split(':').map(Number);
      const minutes = eh * 60 + em - (sh * 60 + sm);
      if (minutes <= 0) return '—';
      const hoursPerSession = minutes / 60;

      // Map day codes to JS day indexes (0=Sun ... 6=Sat)
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
        String(schedule.days)
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => dayMap[d])
          .filter((n) => n !== undefined)
      );
      if (selectedDays.size === 0) return '—';

      // Count matching days between start and end (inclusive)
      const start = new Date(schedule.periodStart);
      const end = new Date(schedule.periodEnd);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return '—';
      if (start > end) return '—';

      let count = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (selectedDays.has(d.getDay())) count++;
      }

      const total = count * hoursPerSession;
      // Return with one decimal precision, trimming trailing .0
      const fixed = total.toFixed(1);
      return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
    } catch (error) {
      return '—';
    }
  };

  // Calculate total hours for all schedules
  const calculateTotalHoursSum = (): string => {
    let total = 0;
    for (const schedule of results) {
      const hours = calculateTotalHours(schedule);
      if (hours !== '—') {
        total += parseFloat(hours);
      }
    }
    const fixed = total.toFixed(1);
    return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
  };

  // Export PDF functionality
  const handleExportPdf = async () => {
    try {
      if (results.length === 0 || !selectedPeriod) {
        Alert.alert(
          'No Data',
          'Please select a batch with schedules to export.'
        );
        return;
      }

      // Load logo asset and convert to base64 data URI
      let logoUri: string | undefined;
      try {
        const asset = Asset.fromModule(
          require('../../../public/sprachins-logo-3.png')
        );
        await asset.downloadAsync();
        const localUri = asset.localUri || asset.uri;

        if (localUri) {
          // Read the file as base64
          const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          // Create data URI
          logoUri = `data:image/png;base64,${base64}`;
        }
      } catch (logoError) {
        console.warn('Failed to load logo:', logoError);
        // Continue without logo
      }

      // Prepare data for PDF
      const schedules = results.map((schedule) => ({
        courseName: schedule.courseName || '—',
        days: schedule.days || '—',
        time_start: schedule.time_start || '—',
        time_end: schedule.time_end || '',
        teacherName: schedule.teacherName || '—',
        location: schedule.location || '—',
        hours: calculateTotalHours(schedule),
      }));

      const studentName = user?.lastName
        ? `${user.lastName}, ${user.firstName}`
        : 'Student';

      const studentId = user?.userId || user?.id || 'N/A';
      const totalHours = calculateTotalHoursSum();
      const printedAt = new Date().toLocaleString();

      const htmlContent = generateStudyLoadPdfHtml({
        studentName,
        studentId,
        batchName: selectedPeriod.batchName,
        schedules,
        totalHours,
        printedAt,
        logoUri,
      });

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Share or save PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Study Load PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    }
  };

  const isScheduleActive = true;

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#de0000" />
          <Text style={styles.loadingText}>Loading your study load...</Text>
        </View>
      );
    }

    if (searching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#de0000" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (!selectedPeriod) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="info-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>
            Select a batch to view your study load.
          </Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="school" size={48} color="#999" />
          <Text style={styles.emptyText}>Not enrolled in this batch.</Text>
        </View>
      );
    }

    return (
      <View style={styles.scheduleList}>
        {results.map((schedule) => {
          const scheduleText = `${schedule.days || '—'}\n${
            schedule.time_start || '—'
          }${schedule.time_end ? ` - ${schedule.time_end}` : ''}`;
          return (
            <ScheduleItem
              key={schedule.id}
              course={schedule.courseName || '—'}
              schedule={scheduleText}
              adviser={schedule.teacherName || '—'}
              hours={calculateTotalHours(schedule)}
              room={schedule.location || '—'}
            />
          );
        })}
      </View>
    );
  };

  return (
    <AppLayout
      showNotifications={true}
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
                <Text style={styles.scheduleTitle}>SELECT BATCH</Text>
              </View>

              {/* Filter Section */}
              <View style={styles.filterSection}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedBatch}
                    onValueChange={(itemValue) => setSelectedBatch(itemValue)}
                    style={styles.picker}
                    enabled={!loading && !searching}
                  >
                    <Picker.Item label="-- Select Batch --" value="" />
                    {batchOptions.map((batch, index) => (
                      <Picker.Item key={index} label={batch} value={batch} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={[
                    styles.searchButton,
                    (loading || searching || !selectedBatch) &&
                      styles.searchButtonDisabled,
                  ]}
                  onPress={handleSearch}
                  disabled={loading || searching || !selectedBatch}
                >
                  <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
              </View>

              {/* Student Name, Batch Info, and Export Button */}
              <View style={styles.infoSection}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.studentName}>
                    {user?.lastName
                      ? `${user.lastName}, ${user.firstName}`
                      : getUserFullName() || 'Your Study Load'}
                  </Text>
                  {selectedPeriod && (
                    <Text style={styles.batchInfo}>
                      {selectedPeriod.batchName}
                    </Text>
                  )}
                </View>
                {results.length > 0 && selectedPeriod && (
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={handleExportPdf}
                    activeOpacity={0.7}
                  >
                    <Icon name="picture-as-pdf" size={20} color="white" />
                    <Text style={styles.exportButtonText}>Export PDF</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.headerCell}>
                  <Text style={styles.tableHeaderText}>Course</Text>
                </View>
                <View style={styles.headerCell}>
                  <Text style={styles.tableHeaderText}>Schedule</Text>
                </View>
                <View style={styles.headerCell}>
                  <Text style={styles.tableHeaderText}>Adviser</Text>
                </View>
                <View style={styles.headerCell}>
                  <Text style={styles.tableHeaderText}># of Hours</Text>
                </View>
                <View style={styles.headerCell}>
                  <Text style={styles.tableHeaderText}>Room</Text>
                </View>
              </View>

              {/* Schedule List or Empty States */}
              {renderBody()}
            </View>
          </View>
        </ScrollView>
      </View>
    </AppLayout>
  );
};
