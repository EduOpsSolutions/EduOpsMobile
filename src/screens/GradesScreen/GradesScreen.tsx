import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSegments } from 'expo-router';
import { styles } from './GradesScreen.styles';
import { AppLayout } from '../../components/common';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { gradesApi, coursesApi } from '../../utils/api';
import { useAuthStore } from '../../stores/authStore';
import { FilePreviewModal } from '../../components/modals/FilePreviewModal';

interface GradeData {
  id: string;
  courseName: string;
  status: 'NO GRADE' | 'PASS' | 'FAIL';
  completedDate: string | null;
  courseId: string;
  studentId: string;
  files: Array<{
    url: string;
    uploadedAt: string;
  }>;
}

interface GradeItemProps {
  grade: GradeData;
  onViewDetails: () => void;
}

const GradeItem: React.FC<GradeItemProps> = ({ grade, onViewDetails }) => {
  const getStatusStyle = () => {
    switch (grade.status) {
      case 'PASS':
        return styles.passStatus;
      case 'FAIL':
        return styles.failStatus;
      default:
        return styles.noGradeStatus;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.gradeRow} onPress={onViewDetails}>
      <Text style={styles.courseName}>{grade.courseName}</Text>
      <Text style={[styles.status, getStatusStyle()]}>{grade.status}</Text>
      <Text style={styles.dateText}>{formatDate(grade.completedDate)}</Text>
      <View style={styles.detailsButton}>
        <Icon
          name="description"
          size={20}
          color={grade.status === 'NO GRADE' ? '#999' : '#de0000'}
        />
      </View>
    </TouchableOpacity>
  );
};

export const GradesScreen = (): React.JSX.Element => {
  const segments = useSegments();
  const currentRoute = '/' + (segments[segments.length - 1] || '');

  const { user } = useAuthStore();
  const [gradesData, setGradesData] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState({ url: '', title: '' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    if (!user?.id) {
      console.warn('[Grades Screen] No user ID found, not fetching grades.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all courses and student grades in parallel
      const [coursesData, gradesData] = await Promise.all([
        coursesApi.getCourses(),
        gradesApi.getStudentGrades(user.id),
      ]);

      // Sort courses alphabetically (A1, A2, B1, B2, etc.)
      const sortedCourses = coursesData.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );

      // Create a map of student grades by courseId for quick lookup
      const gradesMap: { [key: string]: any } = {};
      gradesData.forEach((grade: any) => {
        gradesMap[grade.courseId] = grade;
      });

      // Map all courses with student grades (if any)
      const mapped: GradeData[] = sortedCourses.map((course: any) => {
        const grade = gradesMap[course.id];
        return {
          id: grade?.id || course.id,
          courseName: course.name,
          status: grade
            ? grade.grade === 'Pass'
              ? 'PASS'
              : grade.grade === 'Fail'
              ? 'FAIL'
              : 'NO GRADE'
            : 'NO GRADE',
          completedDate: grade?.updatedAt || null,
          courseId: course.id,
          studentId: user.id,
          files: grade?.files || [],
        };
      });

      setGradesData(mapped);
    } catch (err: any) {
      console.error('[Grades Screen] Error fetching grades:', err);
      setError(err.message || 'Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchGrades();
    } catch (error) {
      console.error('Error refreshing grades:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (grade: GradeData) => {
    if (grade.status === 'NO GRADE') {
      Alert.alert(
        "You haven't taken this course",
        'If you think this is a mistake please contact your instructor or administrator.',
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      // Open the latest file if available
      if (grade.files && grade.files.length > 0) {
        // Sort files by uploadedAt descending (latest first)
        const sortedFiles = [...grade.files].sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        const latestFile = sortedFiles[0];
        if (latestFile.url) {
          setPreviewFile({ url: latestFile.url, title: 'Certificate Preview' });
          setShowPreview(true);
        } else {
          Alert.alert('File Error', 'No file URL found.', [
            { text: 'OK', style: 'default' },
          ]);
        }
      } else {
        Alert.alert(
          'No File Available',
          'No grade file has been uploaded for this course.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    }
  };

  const isEnrollmentActive =
    currentRoute === '/enrollment' ||
    currentRoute === '/enrollment-status' ||
    currentRoute === '/schedule';

  return (
    <AppLayout
      showNotifications={true}
      enrollmentActive={isEnrollmentActive}
      paymentActive={false}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#de0000']}
              tintColor="#de0000"
            />
          }
        >
          <View style={styles.gradesContainer}>
            {/* Grades Card */}
            <View style={styles.gradesCard}>
              {/* Header Section */}
              <View style={styles.gradesHeader}>
                <Icon name="school" size={24} color="#333" />
                <Text style={styles.gradesTitle}>My Grades</Text>
              </View>

              {/* Student Info */}
              {user && (
                <Text style={styles.studentInfo}>
                  {`${user.lastName?.toUpperCase() || ''}, ${
                    user.firstName?.toUpperCase() || ''
                  } ${user.middleName?.charAt(0)?.toUpperCase() || ''}.`}
                </Text>
              )}

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#de0000" />
                  <Text style={styles.loadingText}>Loading grades...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={48} color="#F44336" />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchGrades}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                      Course
                    </Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                      Status
                    </Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                      Date
                    </Text>
                    <Text
                      style={[styles.tableHeaderText, { flex: 0.5 }]}
                    ></Text>
                  </View>

                  {/* Grades List */}
                  {gradesData.length > 0 ? (
                    <View style={styles.gradesList}>
                      {gradesData.map((grade, index) => (
                        <GradeItem
                          key={grade.id || index}
                          grade={grade}
                          onViewDetails={() => handleViewDetails(grade)}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Icon name="school" size={64} color="#ccc" />
                      <Text style={styles.emptyText}>No grades available</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* File Preview Modal */}
      <FilePreviewModal
        visible={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewFile({ url: '', title: '' });
        }}
        fileUrl={previewFile.url}
        title={previewFile.title}
      />
    </AppLayout>
  );
};
