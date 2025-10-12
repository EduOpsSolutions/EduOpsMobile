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
import { useRouter, useSegments } from 'expo-router';
import { styles } from './GradesScreen.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';

interface GradeItemProps {
  courseName: string;
  status: 'NO GRADE' | 'PASS' | 'FAIL';
}

const GradeItem: React.FC<GradeItemProps> = ({ courseName, status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'PASS':
        return styles.passStatus;
      case 'FAIL':
        return styles.failStatus;
      default:
        return styles.noGradeStatus;
    }
  };

  return (
    <View style={styles.gradeRow}>
      <Text style={styles.courseName}>{courseName}</Text>
      <Text style={[styles.status, getStatusStyle()]}>{status}</Text>
      <TouchableOpacity style={styles.detailsButton}>
        <Icon name="description" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

export const GradesScreen = (): React.JSX.Element => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = '/' + (segments[segments.length - 1] || '');

  const grades: GradeItemProps[] = [
    { courseName: 'B1 Allgemein Course', status: 'NO GRADE' },
    { courseName: 'A2 German Basic Course', status: 'PASS' },
    { courseName: 'A1 German Basic Course', status: 'FAIL' },
    { courseName: 'A1 German Basic Course', status: 'PASS' },
  ];

  const isGradesActive = true;

  const isEnrollmentActive =
    currentRoute === '/enrollment' ||
    currentRoute === '/enrollment-status' ||
    currentRoute === '/schedule';

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
            >
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.gradesContainer}>
            {/* Grades Card */}
            <View style={styles.gradesCard}>
              {/* Header Section */}
              <View style={styles.gradesHeader}>
                <Icon name="school" size={24} color="#333" />
                <Text style={styles.gradesTitle}>View Grades</Text>
              </View>

              {/* Student Info */}
              <Text style={styles.studentInfo}>DOLOR, POLANO I.</Text>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Course Name</Text>
                <Text style={styles.tableHeaderText}>Status</Text>
                <Text style={styles.tableHeaderText}>Details</Text>
              </View>

              {/* Grades List */}
              <View style={styles.gradesList}>
                {grades.map((grade, index) => (
                  <GradeItem
                    key={index}
                    courseName={grade.courseName}
                    status={grade.status}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

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