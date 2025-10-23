import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useSegments } from "expo-router";
import { styles } from "./ProfileScreen.styles";
import { BottomNavigation } from "../../components/BottomNavigation";
import { useAuthStore } from "@/src/stores/authStore";

export const ProfileScreen = (): React.JSX.Element => {
  const { logout } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = "/" + (segments[segments.length - 1] || "");

  const isEnrollmentActive =
    currentRoute === "/enrollment" ||
    currentRoute === "/enrollment-status" ||
    currentRoute === "/schedule";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/sprachins-logo-3.png")}
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
      <View style={styles.mainContent}>
        <View style={styles.profileContainer}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <View style={styles.profilePictureContainer}>
                <Icon name="person" size={60} color="#333" />
              </View>
              <TouchableOpacity style={styles.editProfileButton}>
                <Icon name="edit" size={16} color="#666" />
                <Text style={styles.editProfileText}>Edit Profile Picture</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.changePasswordButton}>
                <Text style={styles.changePasswordText}>Change Password</Text>
              </TouchableOpacity>
            </View>

            {/* Name Section */}
            <View style={styles.nameSection}>
              <Text style={styles.studentName}>Polano Dolor</Text>
              <View style={styles.nameLine} />
            </View>

            {/* Personal Details Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Personal Details</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Student ID:</Text>
                    <Text style={styles.detailValue}>3213562</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Course:</Text>
                    <Text style={styles.detailValue}>A1</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>
                      polanodolor@gmail.com
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Birthday:</Text>
                    <Text style={styles.detailValue}>11/12/1997</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone Number:</Text>
                    <Text style={styles.detailValue}>09123456789</Text>
                  </View>
                  <View style={styles.detailItem} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => logout(true)}
              >
                <Icon name="logout" size={24} color="white" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        enrollmentActive={isEnrollmentActive}
        paymentActive={false}
      />
    </SafeAreaView>
  );
};
