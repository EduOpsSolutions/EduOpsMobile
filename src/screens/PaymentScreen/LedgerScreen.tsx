import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles } from './LedgerScreen.styles';
import { EnrollmentDropdown } from '../../../components/EnrollmentDropdown';
import { PaymentDropdown } from '../../../components/PaymentDropdown';
import { UserAvatar } from '../../components/UserAvatar';

interface LedgerItemProps {
  date: string;
  time: string;
  paymentMethod: string;
  balance: number;
  type: string;
  remarks: string;
}

const LedgerItem: React.FC<LedgerItemProps> = ({
  date,
  time,
  paymentMethod,
  balance,
  type,
  remarks,
}) => {
  return (
    <View style={styles.ledgerRow}>
      <Text style={styles.dateText}>{date}</Text>
      <Text style={styles.timeText}>{time}</Text>
      <Text style={styles.paymentMethodText}>{paymentMethod}</Text>
      <Text style={styles.balanceText}>{balance}</Text>
      <Text style={styles.typeText}>{type}</Text>
      <Text style={styles.remarksText}>{remarks}</Text>
    </View>
  );
};

export const LedgerScreen = (): React.JSX.Element => {
  const router = useRouter();

  const ledgerData: LedgerItemProps[] = [
    {
      date: '4/3/24',
      time: '6:29:23AM',
      paymentMethod: 'MAYA',
      balance: 0,
      type: 'Internet Fees: 30',
      remarks: 'OK',
    },
  ];

  const isLedgerActive = true;
  const isPaymentActive = true;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            <UserAvatar
              size={40}
              onPress={() => router.replace('/profile')}
              style={styles.profileButton}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ledgerContainer}>
            {/* Ledger Card */}
            <View style={styles.ledgerCard}>
              {/* Student Info and Print Button */}
              <View style={styles.ledgerHeader}>
                <Text style={styles.studentName}>DOLOR, POLANO I.</Text>
                <TouchableOpacity style={styles.printButton}>
                  <Text style={styles.printButtonText}>Print Ledger</Text>
                </TouchableOpacity>
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Date</Text>
                <Text style={styles.tableHeaderText}>Time</Text>
                <Text style={styles.tableHeaderText}>Payment Method</Text>
                <Text style={styles.tableHeaderText}>Balance</Text>
                <Text style={styles.tableHeaderText}>Type</Text>
                <Text style={styles.tableHeaderText}>Remarks</Text>
              </View>

              {/* Ledger List */}
              <View style={styles.ledgerList}>
                {ledgerData.map((item, index) => (
                  <LedgerItem
                    key={index}
                    date={item.date}
                    time={item.time}
                    paymentMethod={item.paymentMethod}
                    balance={item.balance}
                    type={item.type}
                    remarks={item.remarks}
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
