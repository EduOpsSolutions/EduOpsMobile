import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useSegments } from "expo-router";
import { styles } from './EnrollmentStatusScreen.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';

interface StepProps {
  title: string;
  isCompleted: boolean;
  isActive?: boolean;
}

const StepIndicator: React.FC<StepProps> = ({title, isCompleted, isActive = false}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={[
        styles.stepCircle,
        isCompleted && styles.completedCircle,
        isActive && styles.activeCircle
      ]}>
        {isCompleted && (
          <Icon name="check" size={20} color="white" />
        )}
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
    </View>
  );
};

export const EnrollmentStatusScreen = (): React.JSX.Element => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = '/' + (segments[segments.length - 1] || '');

  const steps = [
    { title: 'Enrollment Form', isCompleted: true },
    { title: 'Payment Form', isCompleted: false },
    { title: 'Verification', isCompleted: false },
    { title: 'Revisions', isCompleted: false },
    { title: 'Complete', isCompleted: false },
  ];

  const isEnrollmentActive = currentRoute === '/enrollment' || currentRoute === '/enrollment-status' || currentRoute === '/schedule';

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
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            {/* Status Header */}
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>Enrollment Status: </Text>
              <Text style={styles.statusValue}>Pending</Text>
            </View>

            {/* Steps Grid */}
            <View style={styles.stepsGrid}>
              <View style={styles.stepsRow}>
                <StepIndicator 
                  title={steps[0].title} 
                  isCompleted={steps[0].isCompleted} 
                />
                <StepIndicator 
                  title={steps[1].title} 
                  isCompleted={steps[1].isCompleted} 
                />
                <StepIndicator 
                  title={steps[2].title} 
                  isCompleted={steps[2].isCompleted} 
                />
              </View>
              <View style={styles.stepsRow}>
                <StepIndicator 
                  title={steps[3].title} 
                  isCompleted={steps[3].isCompleted} 
                />
                <StepIndicator 
                  title={steps[4].title} 
                  isCompleted={steps[4].isCompleted} 
                />
                <View style={styles.emptyStep} />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Click here to proceed to payment</Text>
            </TouchableOpacity>

            {/* Contact Information */}
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>For enrollment concerns please contact:</Text>
              <Text style={styles.contactNumber}>(049) 372-3632/33</Text>
              <Text style={styles.contactEmail}>sprachins@sprachins.edu.ph</Text>
            </View>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Upload Proof of Payment</Text>
              <View style={styles.uploadContainer}>
                <TouchableOpacity style={styles.uploadButton}>
                  <Text style={styles.uploadButtonText}>Choose</Text>
                </TouchableOpacity>
                <Text style={styles.uploadText}>No file chosen</Text>
              </View>
            </View>
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
        <EnrollmentDropdown isActive={isEnrollmentActive} />
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/grades')}
        >
          <Icon name="grade" size={24} color={currentRoute === '/grades' ? "#de0000" : "#666"} />
          <Text style={[
            styles.navText,
            currentRoute === '/grades' && styles.activeNavText
          ]}>Grades</Text>
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