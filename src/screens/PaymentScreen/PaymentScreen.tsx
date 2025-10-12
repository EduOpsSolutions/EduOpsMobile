import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles } from './PaymentScreen.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';
import { PaymentDropdown } from '../../../components/PaymentDropdown';

interface DropdownProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}

const Dropdown: React.FC<DropdownProps> = ({placeholder, value, onValueChange, options}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}>
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={16} color="#666" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                onValueChange(option);
                setIsOpen(false);
              }}>
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const PaymentScreen = (): React.JSX.Element => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    feeType: '',
    amount: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const feeTypeOptions = ['School Fee', 'Enrollment Fee', 'Examination Fee', 'Certificate Fee', 'Other'];

  const handleSubmit = () => {
    // Add payment submission logic here
    console.log('Payment form submitted:', formData);
  };

  // Dynamically determine if payment is active based on current route
  const currentRoute = router?.pathname || router?.route || '';
  const isPaymentActive = currentRoute === '/payment';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/sprachins-logo-3.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="notifications" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
            //   onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.paymentContainer}>
            {/* Payment Form Card */}
            <View style={styles.paymentCard}>
              {/* Form Title */}
              <Text style={styles.formTitle}>Maya Payment Form</Text>
              <Text style={styles.formSubtitle}>Please enter valid information.</Text>

              {/* First Row - First Name and Middle Name */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    placeholder=""
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Middle Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.middleName}
                    onChangeText={(value) => updateFormData('middleName', value)}
                    placeholder=""
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Second Row - Last Name and Email Address */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    placeholder=""
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.emailAddress}
                    onChangeText={(value) => updateFormData('emailAddress', value)}
                    placeholder=""
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.fullWidth}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(value) => updateFormData('phoneNumber', value)}
                  placeholder=""
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Separator Line */}
              <View style={styles.separator} />

              {/* Type of Fees Section */}
              <Text style={styles.sectionTitle}>Type of fees:</Text>

              {/* Fee Type and Amount */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Fee</Text>
                  <Dropdown
                    placeholder="School Fee"
                    value={formData.feeType}
                    onValueChange={(value) => updateFormData('feeType', value)}
                    options={feeTypeOptions}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.amount}
                    onChangeText={(value) => updateFormData('amount', value)}
                    placeholder="₱ 0.00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/home')}
        >
          <Icon name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <EnrollmentDropdown isActive={false} />
        
        <TouchableOpacity 
          style={styles.navItem}
        //   onPress={() => router.push('/grades')}
        >
          <Icon name="grade" size={24} color="#666" />
          <Text style={styles.navText}>Grades</Text>
        </TouchableOpacity>
        <PaymentDropdown isActive={isPaymentActive} />
        <TouchableOpacity 
          style={styles.navItem}
        //   onPress={() => router.push('/documents')}
        >
          <Icon name="description" size={24} color="#666" />
          <Text style={styles.navText}>Documents</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};