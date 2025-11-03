import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import { useSegments } from 'expo-router';
import { styles } from './ProfileScreen.styles';
import { AppLayout } from '../../components/common';
import { useAuthStore } from '@/src/stores/authStore';
import { useProfileStore } from '@/src/stores/profileStore';
import { ImageUploadField } from '@/src/components/form/ImageUploadField';
import { ChangePasswordModal } from '@/src/components/modals';

export const ProfileScreen = (): React.JSX.Element => {
  const { user, logout, getUserFullName, getBirthday, setUser } =
    useAuthStore();
  const segments = useSegments();
  const currentRoute = '/' + (segments[segments.length - 1] || '');
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);

  const {
    profileImagePreview,
    uploadingImage,
    hasChanges,
    resetKey,
    setProfileImage,
    removeProfileImage,
    cancelChanges,
    saveProfilePicture,
    resetState,
  } = useProfileStore();

  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  const isEnrollmentActive =
    currentRoute === '/enrollment' ||
    currentRoute === '/enrollment-status' ||
    currentRoute === '/schedule';

  const handleImageChange = (imageUri: string, previewUrl: string) => {
    setProfileImage(imageUri, previewUrl);
  };

  const handleImageRemove = () => {
    removeProfileImage();
  };

  const handleSaveProfilePicture = async () => {
    try {
      await saveProfilePicture(user, setUser);
    } catch (error) {
      console.error('Error saving profile picture:', error);
    }
  };

  const handleCancelChanges = () => {
    cancelChanges();
  };

  const handleCopyStudentId = async () => {
    if (user?.userId) {
      try {
        await Clipboard.setStringAsync(user.userId);
        Alert.alert('Copied!', 'Student ID copied to clipboard', [
          { text: 'OK' },
        ]);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        Alert.alert('Error', 'Failed to copy Student ID');
      }
    }
  };

  if (!user) {
    return (
      <AppLayout
        showNotifications={true}
        enrollmentActive={false}
        paymentActive={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#de0000" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      showNotifications={false}
      enrollmentActive={isEnrollmentActive}
      paymentActive={false}
    >
      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <ImageUploadField
                key={resetKey}
                currentImage={
                  profileImagePreview ||
                  user.profilePicLink ||
                  getUserFullName()
                }
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                disabled={uploadingImage}
              />

              {hasChanges && !uploadingImage && (
                <View style={styles.changesPendingContainer}>
                  <View style={styles.changesPendingIndicator} />
                  <Text style={styles.changesPendingText}>Changes Pending</Text>
                </View>
              )}

              {uploadingImage && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="#de0000" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}

              {hasChanges && (
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      uploadingImage && styles.buttonDisabled,
                    ]}
                    onPress={handleSaveProfilePicture}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.saveButtonText}>Saving...</Text>
                      </>
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      uploadingImage && styles.buttonDisabled,
                    ]}
                    onPress={handleCancelChanges}
                    disabled={uploadingImage}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={() => setChangePasswordModalVisible(true)}
              >
                <Icon name="lock" size={16} color="white" />
                <Text style={styles.changePasswordText}>Change Password</Text>
              </TouchableOpacity>
            </View>

            {/* Role and Status Section */}
            <View style={styles.roleStatusSection}>
              {user.role && (
                <View style={styles.roleBadge}>
                  <Icon name="person" size={16} color="#de0000" />
                  <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
              )}
              {user.status && (
                <View
                  style={[
                    styles.statusBadge,
                    user.status.toLowerCase() === 'active'
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.statusIndicator,
                      user.status.toLowerCase() === 'active'
                        ? styles.statusIndicatorActive
                        : styles.statusIndicatorInactive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      user.status.toLowerCase() === 'active'
                        ? styles.statusTextActive
                        : styles.statusTextInactive,
                    ]}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* Name Section */}
            <View style={styles.nameSection}>
              <Text style={styles.studentName}>{getUserFullName()}</Text>
              <View style={styles.nameLine} />
            </View>

            {/* Personal Details Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.viewOnlyBadge}>
                <Text style={styles.viewOnlyText}>View Only</Text>
              </View>

              <View style={styles.detailsGrid}>
                {user.userId && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Student ID:</Text>
                      <View style={styles.studentIdContainer}>
                        <Text style={styles.detailValue}>{user.userId}</Text>
                        <TouchableOpacity
                          style={styles.copyButton}
                          onPress={handleCopyStudentId}
                        >
                          <Icon name="content-copy" size={18} color="#de0000" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>First Name:</Text>
                    <Text style={styles.detailValue}>{user.firstName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Name:</Text>
                    <Text style={styles.detailValue}>{user.lastName}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                </View>

                {user.phoneNumber && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Phone Number:</Text>
                      <Text style={styles.detailValue}>{user.phoneNumber}</Text>
                    </View>
                  </View>
                )}

                {user.course && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Course:</Text>
                      <Text style={styles.detailValue}>{user.course}</Text>
                    </View>
                  </View>
                )}

                {getBirthday() && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Birthday:</Text>
                      <Text style={styles.detailValue}>{getBirthday()}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Information Panel */}
              <View style={styles.infoPanel}>
                <Icon name="info" size={20} color="#0066cc" />
                <View style={styles.infoPanelContent}>
                  <Text style={styles.infoPanelTitle}>
                    Profile Information:
                  </Text>
                  <Text style={styles.infoPanelText}>
                    • Personal information can only be updated by system
                    administrators
                  </Text>
                  <Text style={styles.infoPanelText}>
                    • Contact your administrator if any information needs to be
                    changed
                  </Text>
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
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
      />
    </AppLayout>
  );
};
