import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles } from './LedgerScreen.styles';
import { AppLayout } from '../../components/common';

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
    </AppLayout>
  );
};
