import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RelativePathString, useRouter } from 'expo-router';
import { styles } from './EnrollmentStatusScreen.styles';
import { useEnrollmentStore } from '../../stores/enrollmentStore';
import { useAuthStore } from '../../stores/authStore';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { GuestNavbar } from '../../components/common/GuestNavbar';
import * as Clipboard from 'expo-clipboard';

interface StepProps {
  title: string;
  stepNumber: number;
  isCompleted: boolean;
  isActive: boolean;
  isPending: boolean;
}

const StepIndicator: React.FC<StepProps> = ({
  title,
  stepNumber,
  isCompleted,
  isActive,
  isPending,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.stepCircle,
          isCompleted && styles.completedCircle,
          isActive && styles.activeCircle,
          isPending && styles.pendingCircle,
        ]}
      >
        {isCompleted ? (
          <Icon name="check" size={20} color="white" />
        ) : (
          <Text
            style={[
              styles.stepNumber,
              isActive && styles.stepNumberActive,
              isPending && styles.stepNumberPending,
            ]}
          >
            {stepNumber}
          </Text>
        )}
      </View>
      <Text style={[styles.stepTitle, isActive && styles.stepTitleActive]}>
        {title}
      </Text>
    </View>
  );
};

export const EnrollmentStatusScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const copyToClipboard = async (string: string) => {
    await Clipboard.setStringAsync(string);
  };

  const {
    enrollmentId,
    studentId,
    enrollmentStatus,
    remarkMsg,
    remarks,
    currentStep,
    completedSteps,
    fullName,
    coursesToEnroll,
    courseName,
    coursePrice,
    createdAt,
    hasPaymentProof,
    isUploadingPaymentProof,
    isStepCompleted,
    isStepCurrent,
    isStepPending,
    fetchEnrollmentData,
    setPaymentProof,
    uploadPaymentProof,
  } = useEnrollmentStore();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Auto-refresh enrollment data when screen is focused
    // This ensures we always show fresh data from the API
    console.log("=== ENROLLMENT STATUS SCREEN ===");
    console.log("Current enrollmentId:", enrollmentId);
    console.log("Current studentId:", studentId);
    console.log("Current status:", enrollmentStatus);

    if (enrollmentId) {
      console.log("EnrollmentStatusScreen - fetching fresh data for:", enrollmentId);
      fetchEnrollmentData();
    } else {
      console.log("EnrollmentStatusScreen - NO enrollmentId found, cannot fetch");
    }
  }, [enrollmentId]); // Re-fetch when enrollmentId changes

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchEnrollmentData();
    } catch (error) {
      console.error('Error refreshing enrollment data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const steps = [
    { title: 'Enrollment Form', stepNumber: 1 },
    { title: 'Verification', stepNumber: 2 },
    { title: 'Payment', stepNumber: 3 },
    { title: 'Payment Verification', stepNumber: 4 },
    { title: 'Complete', stepNumber: 5 },
  ];

  const getLineColor = (index: number) => {
    if (index >= steps.length - 1) return '#f0f0f0'; // No line after last step
    const previousStepNumber = steps[index].stepNumber;
    return isStepCompleted(previousStepNumber) ? '#4CAF50' : '#f0f0f0';
  };

  const handleFileUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile(file);
        setPaymentProof(file);

        // Auto-upload
        Alert.alert(
          'Upload Payment Proof',
          'Do you want to upload this file as your proof of payment?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Upload',
              onPress: async () => {
                await uploadPaymentProof();
                setSelectedFile(null);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const getStatusBadgeStyle = () => {
    switch (enrollmentStatus) {
      case 'COMPLETED':
        return styles.statusBadgeCompleted;
      case 'APPROVED':
        return styles.statusBadgeApproved;
      case 'VERIFIED':
        return styles.statusBadgeVerified;
      case 'PAYMENT_PENDING':
        return styles.statusBadgePaymentPending;
      case 'REJECTED':
        return styles.statusBadgeRejected;
      default:
        return styles.statusBadgePending;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />

      <GuestNavbar />

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
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
        {!enrollmentId ? (
          <View style={styles.statusContainer}>
            <View style={styles.statusCard}>
              <View style={styles.noDataContainer}>
                <Icon name="description" size={64} color="#ccc" />
                <Text style={styles.noDataTitle}>No Enrollment Data Found</Text>
                <Text style={styles.noDataText}>
                  Please submit an enrollment form first or track your existing
                  enrollment.
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.replace(
                      '/enrollment/form' as any as RelativePathString
                    )
                  }
                >
                  <Text style={styles.actionButtonText}>
                    Go to Enrollment Form
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <View style={styles.statusCard}>
              {/* Enrollment Info Header */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Enrollee ID:</Text>
                  <View style={styles.enrolleeIdContainer}>
                    <Text style={styles.infoValue}>{enrollmentId}</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={async () => {
                        await copyToClipboard(enrollmentId);
                        Alert.alert(
                          'Copied!',
                          'Enrollee ID copied to clipboard',
                          [{ text: 'OK' }]
                        );
                      }}
                    >
                      <Icon name="content-copy" size={18} color="#de0000" />
                    </TouchableOpacity>
                  </View>
                </View>

                {fullName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{fullName}</Text>
                  </View>
                )}
                {(courseName || coursesToEnroll) && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Course:</Text>
                    <Text style={styles.infoValue}>
                      {courseName || coursesToEnroll}
                    </Text>
                  </View>
                )}
                {coursePrice && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Course Fee:</Text>
                    <Text style={styles.infoPriceValue}>₱{coursePrice}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle()]}>
                    <Text style={styles.statusBadgeText}>
                      {enrollmentStatus.toUpperCase().replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                {createdAt && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Applied:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(createdAt)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress Section */}
              <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>Enrollment Progress</Text>
                <View style={styles.stepsGrid}>
                  {steps.map((step, index) => (
                    <View key={step.stepNumber} style={styles.timelineStep}>
                      <StepIndicator
                        title={step.title}
                        stepNumber={step.stepNumber}
                        isCompleted={isStepCompleted(step.stepNumber)}
                        isActive={isStepCurrent(step.stepNumber)}
                        isPending={isStepPending(step.stepNumber)}
                      />
                      {index < steps.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: getLineColor(index) },
                          ]}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Remarks Section */}
              <View style={styles.remarksSection}>
                <Text style={styles.sectionTitle}>Remarks</Text>
                <Text style={styles.remarksText}>{remarkMsg}</Text>
              </View>

              {/* Admin Remarks Section - Show if exists */}
              {remarks && (
                <View
                  style={[
                    styles.adminRemarksSection,
                    enrollmentStatus?.toLowerCase() === 'rejected'
                      ? styles.adminRemarksRejected
                      : styles.adminRemarksOther,
                  ]}
                >
                  <View style={styles.adminRemarksHeader}>
                    <Icon
                      name={
                        enrollmentStatus?.toLowerCase() === 'rejected'
                          ? 'error'
                          : 'info'
                      }
                      size={20}
                      color={
                        enrollmentStatus?.toLowerCase() === 'rejected'
                          ? '#dc2626'
                          : '#2563eb'
                      }
                    />
                    <Text
                      style={[
                        styles.adminRemarksTitle,
                        enrollmentStatus?.toLowerCase() === 'rejected'
                          ? styles.adminRemarksTitleRejected
                          : styles.adminRemarksTitleOther,
                      ]}
                    >
                      Admin Remarks
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.adminRemarksText,
                      enrollmentStatus?.toLowerCase() === 'rejected'
                        ? styles.adminRemarksTextRejected
                        : styles.adminRemarksTextOther,
                    ]}
                  >
                    {remarks}
                  </Text>
                </View>
              )}

              {/* Payment Button - Show only on step 3 */}
              {currentStep === 3 && studentId && (
                <View style={styles.paymentButtonSection}>
                  <TouchableOpacity
                    style={styles.goToPaymentButton}
                    onPress={() => {
                      // Use authenticated payment form for logged-in users, guest payment for others
                      if (isAuthenticated && user?.role === 'student') {
                        router.push('/paymentform' as any);
                      } else {
                        router.push(`/guest-payment?studentId=${studentId}` as any);
                      }
                    }}
                  >
                    <Icon name="payment" size={20} color="white" />
                    <Text style={styles.goToPaymentButtonText}>
                      Go to Payment Form
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.paymentButtonHint}>
                    Use this to make your payment directly
                  </Text>
                </View>
              )}

              {/* Upload Section - Show only on step 3 */}
              {currentStep === 3 && (
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadTitle}>
                    Upload Proof of Payment
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      isUploadingPaymentProof && styles.uploadButtonDisabled,
                    ]}
                    onPress={handleFileUpload}
                    disabled={isUploadingPaymentProof || hasPaymentProof}
                  >
                    {isUploadingPaymentProof ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.uploadButtonText}>
                        {hasPaymentProof
                          ? 'Payment Proof Uploaded'
                          : 'Choose File'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {selectedFile && (
                    <Text style={styles.uploadText}>
                      {selectedFile.fileName || 'File selected'}
                    </Text>
                  )}
                  {hasPaymentProof && !selectedFile && (
                    <Text style={styles.uploadSuccessText}>
                      Payment proof uploaded. Verification in progress (1-2
                      business days).
                    </Text>
                  )}
                </View>
              )}

              {/* Payment Note - Step 3 */}
              {currentStep === 3 && !hasPaymentProof && (
                <View style={styles.noteSection}>
                  <Text style={styles.noteTitle}>Note:</Text>
                  <View style={styles.studentIdRow}>
                    <Text style={styles.noteText}>• Student ID: </Text>
                    <Text style={styles.studentIdValue}>
                      {studentId || 'Pending...'}
                    </Text>
                    {studentId && (
                      <TouchableOpacity
                        style={styles.noteCopyButton}
                        onPress={async () => {
                          await copyToClipboard(studentId);
                          Alert.alert(
                            'Copied!',
                            'Student ID copied to clipboard',
                            [{ text: 'OK' }]
                          );
                        }}
                      >
                        <Icon name="content-copy" size={16} color="#de0000" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.noteText}>
                    • Use this Student ID in the payment form
                  </Text>
                  <Text style={styles.noteText}>
                    • Upload payment receipt after payment
                  </Text>
                  <Text style={styles.noteText}>
                    • Payment verification takes 1-2 business days
                  </Text>
                </View>
              )}

              {/* Contact Information */}
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>
                  For enrollment concerns please contact:
                </Text>
                <Text style={styles.contactNumber}>(+63) 97239232223</Text>
                <Text style={styles.contactEmail}>
                  info@sprachinstitut-cebu.inc
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
