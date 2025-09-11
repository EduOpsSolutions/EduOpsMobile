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
import { styles } from './AssessmentScreen.styles';
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

export const AssessmentScreen = (): React.JSX.Element => {
  const router = useRouter();
  
  const [searchData, setSearchData] = useState({
    course: '',
    batch: '',
    year: '',
  });

  const updateSearchData = (field: string, value: string) => {
    setSearchData(prev => ({...prev, [field]: value}));
  };

  const courseOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const batchOptions = ['Batch 1', 'Batch 2', 'Batch 3', 'Batch 4'];
  const yearOptions = ['2024', '2023', '2022', '2021'];

  const handleSearch = () => {
    // Add search logic here
    console.log('Search data:', searchData);
  };

  const handleProceedToPayment = () => {
    // Navigate to payment screen
    router.push('/paymentform');
  };

  const fees: FeeItemProps[] = [
    { description: 'INTERNET FEE', amount: '50.00' },
  ];

    const isTuitionActive = true;
    const isPaymentActive = true;

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
          <View style={styles.assessmentContainer}>
            {/* Search Section */}
            <View style={styles.searchCard}>
              {/* Search Header */}
              <View style={styles.searchHeader}>
                <Icon name="search" size={20} color="#333" />
                <Text style={styles.searchTitle}>SEARCH TUITION FEE ASSESSMENT</Text>
              </View>

              {/* Search Form */}
              <View style={styles.searchForm}>
                <View style={styles.searchRow}>
                  <View style={styles.searchField}>
                    <Text style={styles.searchLabel}>Course</Text>
                    <TextInput
                      style={styles.searchInput}
                      value={searchData.course}
                      onChangeText={(value) => updateSearchData('course', value)}
                      placeholder=""
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.searchField}>
                    <Text style={styles.searchLabel}>Batch</Text>
                    <Dropdown
                      placeholder="Select Batch"
                      value={searchData.batch}
                      onValueChange={(value) => updateSearchData('batch', value)}
                      options={batchOptions}
                    />
                  </View>
                </View>
                <View style={styles.searchRow}>
                  <View style={styles.searchField}>
                    <Text style={styles.searchLabel}>Year</Text>
                    <Dropdown
                      placeholder="Select Year"
                      value={searchData.year}
                      onValueChange={(value) => updateSearchData('year', value)}
                      options={yearOptions}
                    />
                  </View>
                  <View style={styles.searchButtonContainer}>
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                      <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Assessment Results */}
            <View style={styles.resultsCard}>
              {/* Course Info */}
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>A1: Batch 1 | 2024</Text>
                <View style={styles.courseActions}>
                  <TouchableOpacity style={styles.historyButton}>
                    <Text style={styles.historyButtonText}>Transaction History</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ledgerButton}>
                    <Text style={styles.ledgerButtonText}>Ledger</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Student Name */}
              <Text style={styles.studentName}>DOLOR, POLANO I.</Text>

              {/* Fees Section */}
              <View style={styles.feesSection}>
                <View style={styles.feesHeader}>
                  <Text style={styles.feesHeaderText}>Description</Text>
                  <Text style={styles.feesHeaderText}>Amount</Text>
                </View>
                
                <View style={styles.feesList}>
                  {fees.map((fee, index) => (
                    <FeeItem
                      key={index}
                      description={fee.description}
                      amount={fee.amount}
                    />
                  ))}
                </View>
              </View>

              {/* Summary Section */}
              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Net Assessment</Text>
                  <Text style={styles.summaryAmount}>50.00</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Payments</Text>
                  <Text style={styles.summaryAmount}>50.00</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Remaining Balance</Text>
                  <Text style={styles.summaryAmount}>0</Text>
                </View>
              </View>

              {/* Proceed Button */}
              <TouchableOpacity 
                style={styles.proceedButton} 
                onPress={handleProceedToPayment}
              >
                <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
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