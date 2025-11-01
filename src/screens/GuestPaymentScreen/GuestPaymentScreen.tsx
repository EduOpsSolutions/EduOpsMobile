import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styles } from './GuestPaymentScreen.styles';
import { GuestNavbar } from '../../components/common/GuestNavbar';
import { usePaymentStore } from '@/src/stores/paymentStore';

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
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {selectedLabel || placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={16} color="#666" />
      </TouchableOpacity>
      {isOpen && (
        <ScrollView style={styles.dropdownOptions} nestedScrollEnabled>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownOption}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export const GuestPaymentScreen = (): React.JSX.Element => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const studentId = params.studentId as string | undefined;

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

  const [isFetchingStudent, setIsFetchingStudent] = useState(false);

  // Clear form when component mounts
  useEffect(() => {
    resetForm();
  }, []);

  // Prefill student ID if provided via URL params
  useEffect(() => {
    if (studentId && studentId !== formData.student_id) {
      updateFormField('student_id', studentId);
      // Automatically fetch student data
      const fetchStudent = async () => {
        setIsFetchingStudent(true);
        await validateAndFetchStudentByID(studentId);
        setIsFetchingStudent(false);
      };
      fetchStudent();
    }
  }, [studentId]);

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
    if (studentId) {
      setIsFetchingStudent(true);
      await validateAndFetchStudentByID(studentId);
      setIsFetchingStudent(false);
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
                  `A payment link has been sent to ${paymentData.email}\n\nYou can complete your payment using the link in your email.\n\nYou will be redirected to the login page.`,
                  [
                    {
                      text: 'Open Payment Link',
                      onPress: () => {
                        if (paymentId) {
                          const clientBaseUrl =
                            `${process.env.EXPO_PUBLIC_CLIENT_URL}` ||
                            'https://eduops.vercel.app';
                          const paymentUrl = `${clientBaseUrl}/payment?paymentId=${paymentId}`;
                          Linking.openURL(paymentUrl).catch((err) => {
                            console.error('Failed to open payment link:', err);
                            Alert.alert(
                              'Error',
                              'Could not open payment link. Please check your email.'
                            );
                          });
                        }
                        resetForm();
                        router.replace('/');
                      },
                    },
                    {
                      text: 'Go to Login',
                      onPress: () => {
                        resetForm();
                        router.replace('/');
                      },
                    },
                  ]
                );
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

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />

      <GuestNavbar />

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

            {/* Student ID - No "Use My ID" button for guest */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Student ID*</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[
                    styles.input,
                    isFetchingStudent && styles.inputDisabled,
                  ]}
                  value={formData.student_id}
                  onChangeText={(value) => updateFormField('student_id', value)}
                  onBlur={handleStudentIdBlur}
                  placeholder="Enter Student ID"
                  placeholderTextColor="#999"
                  editable={!isFetchingStudent}
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
              <Text style={styles.label}>Phone Number*</Text>
              <TextInput
                style={[styles.input, phoneError && styles.inputError]}
                value={formData.phone_number}
                onChangeText={(value) => updateFormField('phone_number', value)}
                placeholder="+63 XXX XXX XXXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
              {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
            </View>

            {/* Fee Type */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Fee Type*</Text>
              <Dropdown
                placeholder="Select Fee Type"
                value={formData.fee}
                onValueChange={(value) => updateFormField('fee', value)}
                options={feesOptions}
              />
            </View>

            {/* Amount */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Amount*</Text>
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
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Payment Link</Text>
              )}
            </TouchableOpacity>

            {/* Information Panel */}
            <View style={styles.infoPanel}>
              <Icon name="info" size={20} color="#0066cc" />
              <View style={styles.infoPanelContent}>
                <Text style={styles.infoPanelTitle}>How it works:</Text>
                <Text style={styles.infoPanelText}>
                  • Enter your Student ID to auto-fill your information
                </Text>
                <Text style={styles.infoPanelText}>
                  • Provide your email and phone number for the payment link
                </Text>
                <Text style={styles.infoPanelText}>
                  • Select the fee type and enter the amount
                </Text>
                <Text style={styles.infoPanelText}>
                  • Click "Send Payment Link" to receive the payment link via
                  email
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
