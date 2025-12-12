import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { styles } from "./LedgerScreen.styles";
import { AppLayout } from "../../components/common";
import { useLedgerStore } from "../../stores/ledgerStore";
import { useAuthStore } from "../../stores/authStore";
import { generateLedgerPdfHtml } from "../../utils/ledgerPdfTemplate";

interface LedgerItemProps {
  date: string;
  time: string;
  orNumber: string;
  debit: string;
  credit: string;
  balance: string;
  type: string;
  remarks: string;
}

const LedgerItem: React.FC<LedgerItemProps> = ({
  date,
  time,
  orNumber,
  debit,
  credit,
  balance,
  type,
  remarks,
}) => {
  return (
    <View style={styles.ledgerRow}>
      <Text style={styles.dateText} numberOfLines={1}>
        {date}
      </Text>
      <Text style={styles.timeText} numberOfLines={1}>
        {time}
      </Text>
      <Text style={styles.orNumberText} numberOfLines={2}>
        {orNumber}
      </Text>
      <Text style={styles.debitText} numberOfLines={1}>
        {debit}
      </Text>
      <Text style={styles.creditText} numberOfLines={1}>
        {credit}
      </Text>
      <Text style={styles.balanceText} numberOfLines={1}>
        {balance}
      </Text>
      <Text style={styles.typeText} numberOfLines={2}>
        {type}
      </Text>
      <Text style={styles.remarksText} numberOfLines={2}>
        {remarks}
      </Text>
    </View>
  );
};

export const LedgerScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { ledgerEntries, isLoading, error, fetchLedger } = useLedgerStore();
  const { user, getUserFullName } = useAuthStore();
  const [isPdfLoading, setIsPdfLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Fetch ledger data when component mounts
    fetchLedger();
  }, []);

  // Show error alert if there's an error
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK" }]);
    }
  }, [error]);

  const formatDateTime = (dateString: string) => {
    try {
      // Handle database format "2025-11-21 19:36:13.272" - treat as local time
      // Replace space with T but don't add Z (which would make it UTC)
      const normalizedDate = dateString.replace(" ", "T");
      const dt = new Date(normalizedDate);
      if (isNaN(dt.getTime())) return { date: "", time: "" };

      const date = dt.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      });

      const time = dt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return { date, time };
    } catch (err) {
      return { date: "", time: "" };
    }
  };

  const formatFeeType = (feeType: string) => {
    if (!feeType) return "";
    return feeType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatAmount = (amount: number | string | null | undefined) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === 0 ||
      amount === "0" ||
      amount === "0.00"
    ) {
      return "";
    }
    return typeof amount === "number" ? amount.toFixed(2) : amount;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLedger();
    setRefreshing(false);
  };

  // Export PDF functionality
  const handleExportPdf = async () => {
    try {
      if (ledgerEntries.length === 0) {
        Alert.alert("No Data", "There are no transactions to export.", [
          { text: "OK" },
        ]);
        return;
      }

      setIsPdfLoading(true);

      // Load logo asset and convert to base64 data URI
      let logoUri: string | undefined;
      try {
        const asset = Asset.fromModule(
          require("../../../public/sprachins-logo-3.png")
        );
        await asset.downloadAsync();
        const localUri = asset.localUri || asset.uri;

        if (localUri) {
          // Read the file as base64
          const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          // Create data URI
          logoUri = `data:image/png;base64,${base64}`;
        }
      } catch (logoError) {
        console.warn("Failed to load logo:", logoError);
        // Continue without logo
      }

      // Prepare ledger entries for PDF
      const pdfEntries = ledgerEntries.map((entry) => {
        const { date, time } = formatDateTime(entry.date);
        return {
          date,
          time,
          orNumber: entry.orNumber || "",
          debit: formatAmount(entry.debit),
          credit: formatAmount(entry.credit),
          balance: entry.balance?.toString() || "0.00",
          type: formatFeeType(entry.type),
          remarks: entry.remarks || "",
        };
      });

      const studentName = user?.lastName
        ? `${user.lastName}, ${user.firstName}`
        : getUserFullName();

      const studentId = user?.userId || user?.id || "N/A";
      const printedAt = new Date().toLocaleString();

      const htmlContent = generateLedgerPdfHtml({
        studentName,
        studentId,
        ledgerEntries: pdfEntries,
        printedAt,
        logoUri,
      });

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Share or save PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Student Ledger PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Success", "PDF generated successfully!");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Alert.alert("Error", "Failed to export PDF. Please try again.");
    } finally {
      setIsPdfLoading(false);
    }
  };

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#8B0E07"]}
            tintColor="#8B0E07"
          />
        }
      >
        <View style={styles.ledgerContainer}>
          {/* Ledger Card */}
          <View style={styles.ledgerCard}>
            {/* Student Info and Print Button */}
            <View style={styles.ledgerHeader}>
              <Text style={styles.studentName}>
                {getUserFullName().toUpperCase() || "STUDENT NAME"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.printButton,
                  (isLoading || isPdfLoading || ledgerEntries.length === 0) &&
                    styles.printButtonDisabled,
                ]}
                onPress={handleExportPdf}
                disabled={
                  isLoading || isPdfLoading || ledgerEntries.length === 0
                }
                activeOpacity={0.7}
              >
                {isPdfLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.printButtonText}>
                      Exporting...
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="picture-as-pdf" size={16} color="white" />
                    <Text style={styles.printButtonText}>Export PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B0E07" />
                <Text style={styles.loadingText}>Loading ledger...</Text>
              </View>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={48} color="#8B0E07" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchLedger()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State */}
            {!isLoading && !error && ledgerEntries.length === 0 && (
              <View style={styles.emptyContainer}>
                <Icon name="receipt-long" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            )}

            {/* Horizontal Scrollable Table */}
            {!isLoading && !error && ledgerEntries.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.tableScrollContainer}
                contentContainerStyle={styles.tableScrollContent}
              >
                <View>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text
                      style={[styles.tableHeaderText, styles.tableHeaderDate]}
                    >
                      Date
                    </Text>
                    <Text
                      style={[styles.tableHeaderText, styles.tableHeaderTime]}
                    >
                      Time
                    </Text>
                    <Text
                      style={[
                        styles.tableHeaderText,
                        styles.tableHeaderOrNumber,
                      ]}
                    >
                      O.R. No.
                    </Text>
                    <Text
                      style={[styles.tableHeaderText, styles.tableHeaderDebit]}
                    >
                      Debit
                    </Text>
                    <Text
                      style={[styles.tableHeaderText, styles.tableHeaderCredit]}
                    >
                      Credit
                    </Text>
                    <Text
                      style={[
                        styles.tableHeaderText,
                        styles.tableHeaderBalance,
                      ]}
                    >
                      Balance
                    </Text>
                    <Text
                      style={[styles.tableHeaderText, styles.tableHeaderType]}
                    >
                      Type
                    </Text>
                    <Text
                      style={[
                        styles.tableHeaderText,
                        styles.tableHeaderRemarks,
                      ]}
                    >
                      Remarks
                    </Text>
                  </View>

                  {/* Ledger List */}
                  <View style={styles.ledgerList}>
                    {ledgerEntries.map((entry, index) => {
                      const { date, time } = formatDateTime(entry.date);
                      const orNumber = entry.orNumber || "";
                      const debit = formatAmount(entry.debit);
                      const credit = formatAmount(entry.credit);
                      const balance = entry.balance?.toString() || "0.00";
                      const type = formatFeeType(entry.type);
                      const remarks = entry.remarks || "";

                      return (
                        <LedgerItem
                          key={index}
                          date={date}
                          time={time}
                          orNumber={orNumber}
                          debit={debit}
                          credit={credit}
                          balance={balance}
                          type={type}
                          remarks={remarks}
                        />
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};
