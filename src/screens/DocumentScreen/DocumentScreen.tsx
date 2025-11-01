import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './DocumentScreen.styles';
import { AppLayout } from '../../components/common';

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
      <Text style={styles.feeText} numberOfLines={1} ellipsizeMode="tail">
        {fee}
      </Text>
      <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      <View style={styles.actionContainer}>{getActionButton()}</View>
      <Text
        style={styles.descriptionText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {description}
      </Text>
    </View>
  );
};

export const DocumentScreen = (): React.JSX.Element => {
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

  return (
    <AppLayout
      showNotifications={false}
      enrollmentActive={false}
      paymentActive={false}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
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
              <Text style={[styles.tableHeaderText, styles.tableHeaderFee]}>
                FEE
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderName]}>
                NAME
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderActions]}>
                ACTIONS
              </Text>
              <Text style={styles.tableHeaderDescription}>DESCRIPTION</Text>
            </View>

            {/* Documents List */}
            <ScrollView
              style={styles.documentsList}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {documents.map((document) => (
                <DocumentItem key={document.id} {...document} />
              ))}
            </ScrollView>

            {/* Version Info */}
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>Latest Version</Text>
              <Text style={styles.versionDate}>4/16/2024</Text>
            </View>
          </View>
        </View>
      </View>
    </AppLayout>
  );
};
