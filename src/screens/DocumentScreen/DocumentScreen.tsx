import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles } from './DocumentScreen.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';

interface DocumentProps {
  id: string;
  fee: string;
  name: string;
  actionType: 'Request' | 'Download';
  description: string;
}

const DocumentItem: React.FC<DocumentProps> = ({
  fee,
  name,
  actionType,
  description,
}) => {
  const getActionButton = () => {
    if (actionType === 'Request') {
      return (
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={styles.downloadButton}>
          <Icon name="download" size={16} color="white" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.documentRow}>
      <Text style={styles.feeText}>{fee}</Text>
      <Text style={styles.nameText}>{name}</Text>
      <View style={styles.actionContainer}>
        {getActionButton()}
      </View>
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
  );
};

export const DocumentScreen = (): React.JSX.Element => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const documents: DocumentProps[] = [
    {
      id: '1',
      fee: 'PHP 150',
      name: 'Transcript of Records',
      actionType: 'Request',
      description: 'Free for 1st request',
    },
    {
      id: '2',
      fee: 'FREE',
      name: 'Excuse Letter',
      actionType: 'Download',
      description: '',
    },
    {
      id: '3',
      fee: 'FREE',
      name: 'Examination Results',
      actionType: 'Request',
      description: '',
    },
    {
      id: '4',
      fee: 'PHP 3000',
      name: 'Certification of Fluency',
      actionType: 'Request',
      description: '',
    },
    {
      id: '5',
      fee: 'FREE',
      name: 'Student Manual 2024',
      actionType: 'Download',
      description: '',
    },
    {
      id: '6',
      fee: 'FREE',
      name: 'Courses Catalog',
      actionType: 'Download',
      description: '',
    },
    {
      id: '7',
      fee: 'FREE',
      name: 'A1 - B2 Prospectus',
      actionType: 'Download',
      description: '',
    },
  ];

  const isDocumentsActive = true;

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
        {/* Decorative Elements */}
        <View style={styles.decorativeTop} />
        <View style={styles.decorativeBottom} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.documentsContainer}>
            {/* Documents Card */}
            <View style={styles.documentsCard}>
              {/* Header Section */}
              <View style={styles.documentsHeader}>
                <Icon name="description" size={24} color="#333" />
                <Text style={styles.documentsTitle}>Documents</Text>
              </View>

              {/* Search Section */}
              <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search documents"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity style={styles.searchButton}>
                    <Icon name="search" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.seeRequestsButton}>
                  <Icon name="assignment" size={16} color="white" />
                  <Text style={styles.seeRequestsText}>See Requests</Text>
                </TouchableOpacity>
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>FEE</Text>
                <Text style={styles.tableHeaderText}>NAME</Text>
                <Text style={styles.tableHeaderText}>ACTIONS</Text>
                <Text style={styles.tableHeaderText}>DESCRIPTION</Text>
              </View>

              {/* Documents List */}
              <View style={styles.documentsList}>
                {documents.map((document) => (
                  <DocumentItem
                    key={document.id}
                    {...document}
                  />
                ))}
              </View>

              {/* Version Info */}
              <View style={styles.versionInfo}>
                <Text style={styles.versionText}>Latest Version</Text>
                <Text style={styles.versionDate}>4/16/2024</Text>
              </View>
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
        <TouchableOpacity style={styles.navItem}>
          <Icon name="payment" size={24} color="#666" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="description" size={24} color="#de0000" />
          <Text style={[styles.navText, styles.activeNavText]}>Documents</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};