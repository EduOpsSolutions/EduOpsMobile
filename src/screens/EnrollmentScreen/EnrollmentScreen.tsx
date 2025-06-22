import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './EnrollmentScreen.styles';
import { useRouter, useSegments } from "expo-router";

const {width} = Dimensions.get('window');

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
        <Icon name="keyboard-arrow-down" size={20} color="#666" />
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
              }}>
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const EnrollmentScreen = (): 
React.JSX.Element => {
    const router = useRouter();
    const segments = useSegments();
    const currentRoute = '/' + (segments[segments.length - 1] || '');
    
    const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    extensions: '',
    honorific: '',
    sex: '',
    birthDate: '',
    civilStatus: '',
    referredBy: '',
    currentAddress: '',
    contactNumber: '',
    alternateContactNumber: '',
    emailAddress: '',
    alternateEmailAddress: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const sexOptions = ['Male', 'Female'];
  const civilStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  const referredByOptions = ['Friend', 'Family', 'Online', 'Advertisement', 'Other'];

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
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Enrollment Form</Text>
            <Text style={styles.requiredText}>Items with (*) are required fields</Text>

            {/* First Row - First Name and Middle Name */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>First Name*</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Middle Name*</Text>
                <TextInput
                  style={styles.input}
                  value={formData.middleName}
                  onChangeText={(value) => updateFormData('middleName', value)}
                />
              </View>
            </View>

            {/* Second Row - Last Name and Extensions */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Last Name*</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Extensions</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jr., Sr., III"
                  placeholderTextColor="#999"
                  value={formData.extensions}
                  onChangeText={(value) => updateFormData('extensions', value)}
                />
              </View>
            </View>

            {/* Third Row - Honorific, Sex, Birth Date */}
            <View style={styles.row}>
              <View style={styles.thirdWidth}>
                <Text style={styles.label}>Honorific*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mr., Ms."
                  placeholderTextColor="#999"
                  value={formData.honorific}
                  onChangeText={(value) => updateFormData('honorific', value)}
                />
              </View>
              <View style={styles.thirdWidth}>
                <Text style={styles.label}>Sex*</Text>
                <Dropdown
                  placeholder="M/F"
                  value={formData.sex}
                  onValueChange={(value) => updateFormData('sex', value)}
                  options={sexOptions}
                />
              </View>
              <View style={styles.thirdWidth}>
                <Text style={styles.label}>Birth date*</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="MM / DD / YYYY"
                    placeholderTextColor="#999"
                    value={formData.birthDate}
                    onChangeText={(value) => updateFormData('birthDate', value)}
                  />
                  <Icon name="calendar-today" size={16} color="#666" />
                </View>
              </View>
            </View>

            {/* Fourth Row - Civil Status and Referred By */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Civil Status*</Text>
                <Dropdown
                  placeholder="Select"
                  value={formData.civilStatus}
                  onValueChange={(value) => updateFormData('civilStatus', value)}
                  options={civilStatusOptions}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Referred By*</Text>
                <Dropdown
                  placeholder="Family"
                  value={formData.referredBy}
                  onValueChange={(value) => updateFormData('referredBy', value)}
                  options={referredByOptions}
                />
              </View>
            </View>

            {/* Current Address */}
            <View style={styles.fullWidth}>
              <Text style={styles.label}>Current Address*</Text>
              <TextInput
                style={styles.input}
                placeholder="Street, Barangay, City, Province, Zip Code"
                placeholderTextColor="#999"
                value={formData.currentAddress}
                onChangeText={(value) => updateFormData('currentAddress', value)}
              />
            </View>

            {/* Contact Numbers */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Contact Number*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+63 9xxxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.contactNumber}
                  onChangeText={(value) => updateFormData('contactNumber', value)}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Alternate Contact No.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+63 9xxxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.alternateContactNumber}
                  onChangeText={(value) => updateFormData('alternateContactNumber', value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email Addresses */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                  placeholderTextColor="#999"
                  value={formData.emailAddress}
                  onChangeText={(value) => updateFormData('emailAddress', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Alternate Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#999"
                  value={formData.alternateEmailAddress}
                  onChangeText={(value) => updateFormData('alternateEmailAddress', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/home')}
        >
          <Icon name="home" size={24} color={currentRoute === '/home' ? "#de0000" : "#666"} />
          <Text style={[
            styles.navText,
            currentRoute === '/home' && styles.activeNavText
          ]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/enrollment')}
        >
          <Icon name="school" size={24} color={currentRoute === '/enrollment' ? "#de0000" : "#666"} />
          <Text style={[
            styles.navText,
            currentRoute === '/enrollment' && styles.activeNavText
          ]}>Enrollment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="grade" size={24} color="#666" />
          <Text style={styles.navText}>Grades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="payment" size={24} color="#666" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="description" size={24} color="#666" />
          <Text style={styles.navText}>Documents</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


