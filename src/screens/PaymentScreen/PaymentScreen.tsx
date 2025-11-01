import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSegments } from 'expo-router';
import { styles } from './PaymentScreen.styles';
import { AppLayout } from '../../components/common';
import { usePaymentStore } from '@/src/stores/paymentStore';
import { useAuthStore } from '@/src/stores/authStore';

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  value,
  onValueChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {selectedLabel || placeholder}
        </Text>
        <Icon
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownOptions}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownOption}
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                activeOpacity={0.6}
              >
                <Text style={styles.dropdownOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export const PaymentScreen = (): React.JSX.Element => {
  const {
    formData,
    loading,
    phoneError,
    nameError,
    feesOptions,
    updateFormField,
    validateAndFetchStudentByID,
    validateRequiredFields,
    validatePhoneNumber,
    preparePaymentData,
    resetForm,
    sendPaymentLinkEmail,
    setLoading,
  } = usePaymentStore();

  const { user, isAuthenticated } = useAuthStore();
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [showIdCopied, setShowIdCopied] = useState(false);

  // Auto-fill user details on component mount
  React.useEffect(() => {
    const autoFillUserDetails = async () => {
      if (isAuthenticated && user?.userId && user?.role === 'student') {
        updateFormField('student_id', user.userId);

        setIsFetchingStudent(true);
        await validateAndFetchStudentByID(user.userId);
        setIsFetchingStudent(false);

        if (user?.email) {
          updateFormField('email_address', user.email);
        }
      }
    };

    autoFillUserDetails();
  }, [isAuthenticated, user]);

  // Helper function to get proper fee type label
  const getFeeTypeLabel = (feeType: string) => {
    const feeTypeMap: Record<string, string> = {
      down_payment: 'Down Payment',
      tuition_fee: 'Tuition Fee',
      document_fee: 'Document Fee',
      book_fee: 'Book Fee',
    };

    if (!feeType) {
      return 'Payment';
    }

    return feeTypeMap[feeType] || feeType.replace('_', ' ');
  };

  const handleStudentIdBlur = async () => {
    const studentId = formData.student_id;
    // Only validate for guests (non-authenticated users)
    // Authenticated users already have auto-filled data
    if (studentId && !isAuthenticated) {
      setIsFetchingStudent(true);
      await validateAndFetchStudentByID(studentId);
      setIsFetchingStudent(false);
    }
  };

  const handleCopyId = async () => {
    if (user?.userId) {
      await Clipboard.setStringAsync(user.userId);
      setShowIdCopied(true);
      setTimeout(() => setShowIdCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!validateRequiredFields()) {
      Alert.alert(
        'Missing Required Fields',
        'Please fill in all required fields before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validatePhoneNumber()) return;

    const feeLabel = getFeeTypeLabel(formData.fee);

    Alert.alert(
      'Confirm Payment',
      `Are you sure you want to pay ₱${formData.amount} for ${feeLabel}?\n\nPayment link will be sent to: ${formData.email_address}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: "Yes, I'm sure",
          onPress: async () => {
            try {
              setLoading(true);

              const paymentData = preparePaymentData();
              const feeLabel = getFeeTypeLabel(paymentData.feeType);
              const description = `${feeLabel} - Payment for ${paymentData.firstName} ${paymentData.lastName}`;
              const emailData = {
                email: paymentData.email,
                firstName: paymentData.firstName,
                lastName: paymentData.lastName,
                amount: paymentData.amount,
                description: description,
                feeType: paymentData.feeType,
                userId: paymentData.userId,
              };

              const result = await sendPaymentLinkEmail(emailData);

              setLoading(false);

              if (result.success) {
                const paymentId = result?.data?.data?.paymentId;

                Alert.alert(
                  'Email Sent Successfully!',
                  `A payment link has been sent to ${paymentData.email}\n\nYou can complete your payment using the link in your email.`,
                  [
                    {
                      text: 'Close',
                      style: 'cancel',
                    },
                    {
                      text: 'Open Payment Link',
                      onPress: () => {
                        if (paymentId) {
                          const clientBaseUrl =
                            `${process.env.EXPO_PUBLIC_CLIENT_URL}` ||
                            'https://eduops.vercel.app';
                          // For mobile, open a new tab with the payment URL - browser is used instead
                          const paymentUrl = `${clientBaseUrl}/payment?paymentId=${paymentId}`;
                          Linking.openURL(paymentUrl).catch((err) => {
                            console.error('Failed to open payment link:', err);
                            Alert.alert(
                              'Error',
                              'Could not open payment link. Please check your email.'
                            );
                          });
                        }
                      },
                    },
                  ]
                );

                resetForm();
              } else {
                Alert.alert(
                  'Error',
                  result.error ||
                    'Failed to send payment link. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              setLoading(false);
              console.error('Error sending payment link:', error);
              Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Dynamically determine if payment is active based on current route
  const currentRoute = '/' + (useSegments()[useSegments().length - 1] || '');
  const isPaymentActive = currentRoute === '/paymentform';

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
        <View style={styles.paymentContainer}>
          {/* Payment Form Card */}
          <View style={styles.paymentCard}>
            {/* Form Title */}
            <Text style={styles.formTitle}>Payment Form</Text>
            <Text style={styles.formSubtitle}>
              Fields marked with (*) are required. Please enter the correct
              student information.
            </Text>

            {/* Info Banner for Logged-in Users */}
            {isAuthenticated && user?.userId && user?.role === 'student' && (
              <View style={styles.infoBanner}>
                <View style={styles.infoBannerContent}>
                  <View style={styles.infoBannerRow}>
                    <Text style={styles.infoBannerLabel}>Your ID: </Text>
                    <Text style={styles.infoBannerValue}>{user.userId}</Text>
                    <TouchableOpacity onPress={handleCopyId} style={styles.copyButton}>
                      <Text style={styles.copyButtonText}>
                        {showIdCopied ? 'Copied!' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.infoBannerNote}>
                    <Text style={{ fontWeight: '600' }}>Note:</Text> Your details
                    have been automatically filled. You can only process payments
                    for yourself. For guest payments, you can share your ID to
                    allow others to pay without logging in.
                  </Text>
                </View>
              </View>
            )}

            {/* Info Note for Guests */}
            {!isAuthenticated && (
              <View style={styles.infoNote}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <Icon
                    name="info"
                    size={16}
                    color="#2196f3"
                    style={{ marginTop: 1 }}
                  />
                  <Text style={styles.infoNoteText}>
                    <Text style={{ fontWeight: '600' }}>Tip:</Text> Enter the
                    Student ID to fetch student details and proceed with payment.
                    If you don't have a Student ID, please contact the
                    administration.
                  </Text>
                </View>
              </View>
            )}

            {/* Student ID */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Student ID*</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[
                    styles.input,
                    isFetchingStudent && styles.inputDisabled,
                    isAuthenticated && styles.inputReadOnly,
                  ]}
                  value={formData.student_id}
                  onChangeText={(value) => updateFormField('student_id', value)}
                  onBlur={handleStudentIdBlur}
                  placeholder="Enter Student ID"
                  placeholderTextColor="#999"
                  editable={!isFetchingStudent && !isAuthenticated}
                />
                {isFetchingStudent && (
                  <ActivityIndicator
                    size="small"
                    color="#de0000"
                    style={styles.inputIcon}
                  />
                )}
              </View>
            </View>

            {/* First Row - First Name and Middle Name */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>First Name*</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputReadOnly,
                    nameError && styles.inputError,
                  ]}
                  value={formData.first_name}
                  placeholder="First Name"
                  placeholderTextColor="#999"
                  editable={false}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Middle Name</Text>
                <TextInput
                  style={[styles.input, styles.inputReadOnly]}
                  value={formData.middle_name}
                  placeholder="Middle Name"
                  placeholderTextColor="#999"
                  editable={false}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Last Name*</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.inputReadOnly,
                  nameError && styles.inputError,
                ]}
                value={formData.last_name}
                placeholder="Last Name"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>

            {/* Name Validation Error */}
            {nameError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{nameError}</Text>
              </View>
            )}

            {/* Email Address */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Email Address*</Text>
              <TextInput
                style={styles.input}
                value={formData.email_address}
                onChangeText={(value) =>
                  updateFormField('email_address', value)
                }
                placeholder="johndoe@gmail.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, phoneError && styles.inputError]}
                value={formData.phone_number}
                onChangeText={(value) => updateFormField('phone_number', value)}
                placeholder="09xxxxxxxxx"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={15}
              />
              {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
            </View>

            {/* Separator Line */}
            <View style={styles.separator} />

            {/* Payment Details Section */}
            <Text style={styles.sectionTitle}>Payment Details</Text>

            {/* Type of Fee */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Type of Fee*</Text>
              <Dropdown
                placeholder="Select Fee Type"
                value={formData.fee}
                onValueChange={(value) => updateFormField('fee', value)}
                options={feesOptions}
              />
            </View>

            {/* Amount */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Amount (PHP)*</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(value) => updateFormField('amount', value)}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || !!nameError) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !!nameError}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};
