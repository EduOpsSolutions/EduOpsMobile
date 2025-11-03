import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles } from './AssessmentScreen.styles';
import { AppLayout } from '../../components/common';
import {
  useAssessmentStore,
  AssessmentSummary,
} from '../../stores/assessmentStore';
import { useAuthStore } from '../../stores/authStore';
import axiosInstance from '../../utils/axios';

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  zIndex?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  value,
  onValueChange,
  options,
  zIndex = 1000,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.dropdownContainer, { zIndex: isOpen ? zIndex : 1 }]}>
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
        <ScrollView
          style={styles.dropdownOptions}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
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
        </ScrollView>
      )}
    </View>
  );
};

interface FeeItemProps {
  description: string;
  amount: string;
}

const FeeItem: React.FC<FeeItemProps> = ({ description, amount }) => {
  return (
    <View style={styles.feeRow}>
      <Text style={styles.feeDescription}>{description}</Text>
      <Text style={styles.feeAmount}>{amount}</Text>
    </View>
  );
};

interface Course {
  id: string;
  name: string;
  price: number;
}

interface AcademicPeriod {
  id: string;
  batchName: string;
  startAt: string;
  endAt: string;
}

export const AssessmentScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { user, getUserFullName } = useAuthStore();
  const {
    assessments,
    selectedAssessment,
    isLoading,
    isLoadingDetails,
    error,
    fetchStudentAssessments,
    selectAssessment,
    clearSelectedAssessment,
  } = useAssessmentStore();

  const [searchData, setSearchData] = useState({
    course: '',
    batch: '',
    year: '',
  });
  const [filteredAssessments, setFilteredAssessments] = useState<
    AssessmentSummary[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get('/courses');
        setCourses(response.data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  // Fetch all academic periods on mount
  useEffect(() => {
    const fetchAcademicPeriods = async () => {
      try {
        const response = await axiosInstance.get('/academic-periods');
        setAcademicPeriods(response.data || []);
      } catch (err) {
        console.error('Error fetching academic periods:', err);
        setAcademicPeriods([]);
      }
    };
    fetchAcademicPeriods();
  }, []);

  // Load assessments on mount
  useEffect(() => {
    if (user?.id) {
      fetchStudentAssessments();
    }
  }, [user]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK' }]);
    }
  }, [error]);

  const updateSearchData = (field: string, value: string) => {
    setSearchData((prev) => ({ ...prev, [field]: value }));
  };

  // Get dropdown options from fetched data
  const courseOptions = courses.map((course) => course.name).sort();

  const batchOptions = Array.from(
    new Set(academicPeriods.map((period) => period.batchName))
  ).sort();

  const yearOptions = Array.from(
    new Set(
      academicPeriods
        .map((period) => {
          if (period.startAt) {
            const date = new Date(period.startAt);
            if (!isNaN(date.getTime())) {
              return date.getFullYear().toString();
            }
          }
          return null;
        })
        .filter((year): year is string => year !== null)
    )
  ).sort((a, b) => Number(b) - Number(a));

  // Filter assessments whenever search criteria or assessments change
  useEffect(() => {
    const filtered = assessments.filter((assessment) => {
      const courseMatch =
        !searchData.course || assessment.course === searchData.course;
      const batchMatch =
        !searchData.batch || assessment.batch === searchData.batch;
      const yearMatch =
        !searchData.year || assessment.year.toString() === searchData.year;

      return courseMatch && batchMatch && yearMatch;
    });

    setFilteredAssessments(filtered);
  }, [assessments, searchData]);

  const handleSearch = () => {
    // Clear selected assessment when searching
    clearSelectedAssessment();

    // If only one result, auto-select it
    if (filteredAssessments.length === 1) {
      selectAssessment(filteredAssessments[0]);
    } else if (filteredAssessments.length === 0) {
      Alert.alert(
        'No Results',
        'No assessments found matching your search criteria.'
      );
    }
  };

  const handleSelectAssessment = (assessment: AssessmentSummary) => {
    selectAssessment(assessment);
  };

  const handleProceedToPayment = () => {
    if (!selectedAssessment) {
      Alert.alert('Error', 'Please select an assessment first.');
      return;
    }

    if (selectedAssessment.remainingBalance <= 0) {
      Alert.alert('Info', 'No outstanding balance to pay.');
      return;
    }

    // Navigate to payment screen with assessment data
    router.push('/paymentform');
  };

  const handleTransactionHistory = () => {
    Alert.alert(
      'Transaction History',
      'This feature will open transaction history modal.',
      [{ text: 'OK' }]
    );
  };

  const formatAmount = (amount: number) => {
    return new Number(amount).toFixed(2);
  };

  const isPaymentActive = true;

  return (
    <AppLayout
      showNotifications={true}
      enrollmentActive={false}
      paymentActive={isPaymentActive}
    >
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.assessmentContainer}>
          {/* Search Section */}
          <View style={styles.searchCard}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
              <Icon name="search" size={20} color="#333" />
              <Text style={styles.searchTitle}>
                SEARCH TUITION FEE ASSESSMENT
              </Text>
            </View>

            {/* Search Form */}
            <View style={styles.searchForm}>
              <View style={[styles.searchRow, { zIndex: 2 }]}>
                <View style={styles.searchField}>
                  <Text style={styles.searchLabel}>Course</Text>
                  <Dropdown
                    placeholder="Select Course"
                    value={searchData.course}
                    onValueChange={(value) => updateSearchData('course', value)}
                    options={courseOptions}
                    zIndex={3000}
                  />
                </View>
                <View style={styles.searchField}>
                  <Text style={styles.searchLabel}>Batch</Text>
                  <Dropdown
                    placeholder="Select Batch"
                    value={searchData.batch}
                    onValueChange={(value) => updateSearchData('batch', value)}
                    options={batchOptions}
                    zIndex={2000}
                  />
                </View>
              </View>
              <View style={[styles.searchRow, { zIndex: 1 }]}>
                <View style={styles.searchField}>
                  <Text style={styles.searchLabel}>Year</Text>
                  <Dropdown
                    placeholder="Select Year"
                    value={searchData.year}
                    onValueChange={(value) => updateSearchData('year', value)}
                    options={yearOptions}
                    zIndex={1000}
                  />
                </View>
                <View style={styles.searchButtonContainer}>
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                  >
                    <Text style={styles.searchButtonText}>Search</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#8B0E07" />
              <Text style={styles.loadingText}>Loading assessments...</Text>
            </View>
          )}

          {/* Assessment List - Show when no assessment is selected */}
          {!isLoading && !selectedAssessment && (
            <View style={styles.resultsListCard}>
              <Text style={styles.resultsListTitle}>
                {filteredAssessments.length === 0
                  ? 'No assessments found'
                  : `Your Assessments (${filteredAssessments.length})`}
              </Text>
              {filteredAssessments.map((assessment, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.assessmentItem}
                  onPress={() => handleSelectAssessment(assessment)}
                >
                  <View style={styles.assessmentItemHeader}>
                    <Text style={styles.assessmentItemTitle}>
                      {assessment.course}
                    </Text>
                    <Text style={styles.assessmentItemSubtitle}>
                      {assessment.batch} | {assessment.year}
                    </Text>
                  </View>
                  <View style={styles.assessmentItemFooter}>
                    <Text style={styles.assessmentItemLabel}>
                      Remaining Balance:
                    </Text>
                    <Text style={styles.assessmentItemBalance}>
                      ₱{formatAmount(assessment.remainingBalance)}
                    </Text>
                    <Icon name="chevron-right" size={24} color="#8B0E07" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Assessment Details */}
          {!isLoading && selectedAssessment && (
            <View style={styles.resultsCard}>
              {isLoadingDetails && (
                <View style={styles.detailsLoadingOverlay}>
                  <ActivityIndicator size="large" color="#8B0E07" />
                </View>
              )}

              {/* Course Info with Back button */}
              <View style={styles.detailsHeader}>
                <Text style={styles.courseTitle}>
                  {selectedAssessment.course.name}:{' '}
                  {selectedAssessment.batch.batchName} |{' '}
                  {selectedAssessment.batch.year}
                </Text>
                <TouchableOpacity
                  onPress={clearSelectedAssessment}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>Back to List</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.courseInfo}>
                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={handleTransactionHistory}
                  >
                    <Icon name="history" size={16} color="white" />
                    <Text style={styles.historyButtonText}>History</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ledgerButton}
                    onPress={() => router.push('/ledger')}
                  >
                    <Icon name="receipt-long" size={16} color="white" />
                    <Text style={styles.ledgerButtonText}>Ledger</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Student Name */}
              <Text style={styles.studentName}>
                {getUserFullName().toUpperCase()}
              </Text>

              {/* Fees Section */}
              <View style={styles.feesSection}>
                <View style={styles.feesHeader}>
                  <Text style={styles.feesHeaderText}>Description</Text>
                  <Text style={styles.feesHeaderText}>Amount</Text>
                </View>

                <View style={styles.feesList}>
                  {/* Course Base Price */}
                  <FeeItem
                    description="COURSE BASE FEE"
                    amount={formatAmount(selectedAssessment.courseBasePrice)}
                  />

                  {/* Standard Course Fees */}
                  {selectedAssessment.fees.map((fee, index) => (
                    <FeeItem
                      key={`fee-${index}`}
                      description={fee.name.toUpperCase()}
                      amount={formatAmount(fee.price)}
                    />
                  ))}

                  {/* Student-Specific Fees */}
                  {selectedAssessment.studentFees
                    .filter((sf) => sf.type === 'fee')
                    .map((fee, index) => (
                      <FeeItem
                        key={`student-fee-${index}`}
                        description={fee.name.toUpperCase()}
                        amount={formatAmount(fee.amount)}
                      />
                    ))}

                  {/* Discounts */}
                  {selectedAssessment.studentFees
                    .filter((sf) => sf.type === 'discount')
                    .map((discount, index) => (
                      <View key={`discount-${index}`} style={styles.feeRow}>
                        <Text
                          style={[styles.feeDescription, styles.discountText]}
                        >
                          {discount.name.toUpperCase()} (DISCOUNT)
                        </Text>
                        <Text style={[styles.feeAmount, styles.discountAmount]}>
                          -{formatAmount(discount.amount)}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>

              {/* Summary Section */}
              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Net Assessment</Text>
                  <Text style={styles.summaryAmount}>
                    ₱{formatAmount(selectedAssessment.netAssessment)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Payments</Text>
                  <Text style={styles.summaryAmount}>
                    ₱{formatAmount(selectedAssessment.totalPayments)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.balanceRow]}>
                  <Text style={styles.balanceLabel}>Remaining Balance</Text>
                  <Text
                    style={[
                      styles.balanceAmount,
                      selectedAssessment.remainingBalance > 0
                        ? styles.balancePositive
                        : styles.balancePaid,
                    ]}
                  >
                    ₱{formatAmount(selectedAssessment.remainingBalance)}
                  </Text>
                </View>
              </View>

              {/* Proceed Button */}
              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  selectedAssessment.remainingBalance <= 0 &&
                    styles.proceedButtonDisabled,
                ]}
                onPress={handleProceedToPayment}
                disabled={selectedAssessment.remainingBalance <= 0}
              >
                <Text style={styles.proceedButtonText}>
                  {selectedAssessment.remainingBalance > 0
                    ? 'Proceed to Payment'
                    : 'Fully Paid'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </AppLayout>
  );
};
