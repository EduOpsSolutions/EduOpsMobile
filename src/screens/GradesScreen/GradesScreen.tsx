import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSegments } from "expo-router";
import { styles } from "./GradesScreen.styles";
import { AppLayout } from "../../components/common";
import Icon from "react-native-vector-icons/MaterialIcons";
import { gradesApi, academicPeriodsApi, assessmentApi } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";

interface GradeData {
  id: string;
  courseName: string;
  status: "NO GRADE" | "PASS" | "FAIL";
  completedDate: string | null;
  courseId: string;
  studentId: string;
  batchId: string | null;
  files: Array<{
    url: string;
    uploadedAt: string;
  }>;
}

interface AcademicPeriod {
  id: string;
  batchName: string;
  startAt: string;
  endAt: string;
  enrollmentStatus: string;
  batchStatus: string;
}

interface GradeItemProps {
  grade: GradeData;
  onViewDetails: () => void;
}

const GradeItem: React.FC<GradeItemProps> = ({ grade, onViewDetails }) => {
  const getStatusStyle = () => {
    switch (grade.status) {
      case "PASS":
        return styles.passStatus;
      case "FAIL":
        return styles.failStatus;
      default:
        return styles.noGradeStatus;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
          color={grade.status === "NO GRADE" ? "#999" : "#de0000"}
        />
      </View>
    </TouchableOpacity>
  );
};

export const GradesScreen = (): React.JSX.Element => {
  const segments = useSegments();
  const currentRoute = "/" + (segments[segments.length - 1] || "");

  const { user } = useAuthStore();
  const [gradesData, setGradesData] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [periodsLoading, setPeriodsLoading] = useState(true);

  // Fetch academic periods on mount
  useEffect(() => {
    const fetchAcademicPeriods = async () => {
      setPeriodsLoading(true);
      try {
        const periods = await academicPeriodsApi.getAcademicPeriods();

        // Sort periods by startAt date (latest first)
        const sortedPeriods = periods.sort(
          (a: AcademicPeriod, b: AcademicPeriod) =>
            new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
        );

        setAcademicPeriods(sortedPeriods);

        // Set default to the latest/current period (first in sorted list)
        if (sortedPeriods.length > 0) {
          setSelectedPeriod(sortedPeriods[0].id);
        }
      } catch (err: any) {
        console.error("[Grades Screen] Error fetching academic periods:", err);
      } finally {
        setPeriodsLoading(false);
      }
    };
    fetchAcademicPeriods();
  }, []);

  // Fetch grades when selectedPeriod changes
  useEffect(() => {
    if (user && !periodsLoading) {
      fetchGrades();
    }
  }, [user, selectedPeriod, periodsLoading]);

  const fetchGrades = async () => {
    if (!user?.id) {
      console.warn("[Grades Screen] No user ID found, not fetching grades.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Grades Debug] Selected Period:', selectedPeriod);

      // Fetch grades with optional periodId parameter
      const gradesData = await gradesApi.getStudentGrades(
        user.id,
        selectedPeriod || undefined
      );

      console.log('[Grades Debug] Received data count:', gradesData.length);
      console.log('[Grades Debug] Received data:', gradesData);

      // Sort courses alphabetically (A1, A2, B1, B2, etc.)
      const sortedGrades = gradesData.sort((a: any, b: any) =>
        a.course.name.localeCompare(b.course.name)
      );

      // Map grades to the expected format
      const mapped: GradeData[] = sortedGrades.map((grade: any) => ({
        id: grade.id,
        courseName: grade.course.name,
        status:
          grade.grade === "Pass"
            ? "PASS"
            : grade.grade === "Fail"
            ? "FAIL"
            : "NO GRADE",
        completedDate: grade.updatedAt || null,
        courseId: grade.courseId,
        studentId: user.id,
        batchId: grade.periodId || null,
        files: grade.files || [],
      }));

      setGradesData(mapped);
    } catch (err: any) {
      console.error("[Grades Screen] Error fetching grades:", err);
      setError(err.message || "Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchGrades();
    } catch (error) {
      console.error("Error refreshing grades:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = async (grade: GradeData) => {
    if (grade.status === "NO GRADE") {
      Alert.alert(
        "Not Available",
        "Course has not been graded or you have not completed the course yet.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    try {
      // Check for outstanding balance
      console.log(
        "Checking assessment for:",
        grade.studentId,
        grade.courseId,
        grade.batchId
      );

      if (!grade.batchId) {
        console.warn("[Grades Screen] No batchId found for grade:", grade);
      }

      const assessmentData = await assessmentApi.getStudentAssessments(
        grade.studentId
      );
      console.log("Assessment Data:", assessmentData);

      // Find the specific assessment for this course and batch
      const specificAssessment = Array.isArray(assessmentData)
        ? assessmentData.find(
            (assessment: any) =>
              assessment.courseId === grade.courseId &&
              assessment.batchId === grade.batchId
          )
        : null;

      console.log("Specific Assessment for this course:", specificAssessment);

      if (specificAssessment) {
        // Sort all enrollments by date to calculate credit properly
        const sortedEnrollments = [...assessmentData].sort(
          (a: any, b: any) => {
            const dateA = a.startAt ? new Date(a.startAt).getTime() : 0;
            const dateB = b.startAt ? new Date(b.startAt).getTime() : 0;
            return dateA - dateB;
          }
        );

        // Find current enrollment index
        const currentIndex = sortedEnrollments.findIndex(
          (e: any) => e.courseId === grade.courseId && e.batchId === grade.batchId
        );

        // Calculate available credit from previous courses (progressive consumption)
        let runningCredit = 0;
        for (let i = 0; i < currentIndex; i++) {
          const course = sortedEnrollments[i];
          const courseBalance = course.remainingBalance;
          if (courseBalance < 0) {
            // Course was overpaid, add to running credit
            runningCredit += Math.abs(courseBalance);
          } else if (courseBalance > 0) {
            // Course has balance due, consume credit
            runningCredit = Math.max(0, runningCredit - courseBalance);
          }
        }

        // Calculate balance after applying credits for this course
        const currentBalance = specificAssessment.remainingBalance;
        const balanceAfterCredits = Math.max(0, currentBalance - runningCredit);

        console.log("[Grades Debug] Current Balance:", currentBalance);
        console.log("[Grades Debug] Available Credit:", runningCredit);
        console.log("[Grades Debug] Balance After Credits:", balanceAfterCredits);

        if (balanceAfterCredits > 0) {
          Alert.alert(
            "Outstanding Balance",
            `You have an outstanding balance of ₱${balanceAfterCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for this course (after applying credits). Please clear your dues to access the certificate.`,
            [{ text: "OK", style: "default" }]
          );
          return;
        }
      }
    } catch (err) {
      console.error("[Grades Screen] Error checking assessment balance:", err);
      Alert.alert(
        "Error",
        "An error occurred while checking your assessment balance. Please try again later.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    // Open the latest file if available
    if (grade.files && grade.files.length > 0) {
      // Sort files by uploadedAt descending (latest first)
      const sortedFiles = [...grade.files].sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const latestFile = sortedFiles[0];
      if (latestFile.url) {
        // Open in browser instead of in-app preview
        try {
          const supported = await Linking.canOpenURL(latestFile.url);
          if (supported) {
            await Linking.openURL(latestFile.url);
          } else {
            Alert.alert(
              "Error",
              "Cannot open this URL. Please try again later.",
              [{ text: "OK", style: "default" }]
            );
          }
        } catch (error) {
          console.error("[Grades Screen] Error opening URL:", error);
          Alert.alert(
            "Error",
            "Failed to open certificate. Please try again.",
            [{ text: "OK", style: "default" }]
          );
        }
      } else {
        Alert.alert("File Error", "No file URL found.", [
          { text: "OK", style: "default" },
        ]);
      }
    } else {
      Alert.alert(
        "No File Available",
        "No grade file has been uploaded for this course.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const isEnrollmentActive =
    currentRoute === "/enrollment" ||
    currentRoute === "/enrollment-status" ||
    currentRoute === "/schedule";

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
              colors={["#de0000"]}
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
                  {`${user.lastName?.toUpperCase() || ""}, ${
                    user.firstName?.toUpperCase() || ""
                  } ${user.middleName?.charAt(0)?.toUpperCase() || ""}.`}
                </Text>
              )}

              {/* Academic Period Filter */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Academic Period:</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedPeriod || ""}
                    onValueChange={(itemValue) =>
                      setSelectedPeriod(itemValue || null)
                    }
                    enabled={!periodsLoading && academicPeriods.length > 0}
                    style={styles.picker}
                  >
                    <Picker.Item label="All Periods" value="" />
                    {academicPeriods.map((period) => (
                      <Picker.Item
                        key={period.id}
                        label={period.batchName}
                        value={period.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

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
    </AppLayout>
  );
};
