import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import { getToken } from '../utils/jwt';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { clearProfilePictureCache } from '../components/UserAvatar';

interface ProfileState {
  profileImage: string | null;
  profileImagePreview: string | null;
  uploadingImage: boolean;
  hasChanges: boolean;
  resetKey: number;

  setProfileImage: (imageUri: string, previewUrl: string) => void;
  removeProfileImage: () => void;
  cancelChanges: () => void;
  saveProfilePicture: (user: any, setUser: (user: any) => void) => Promise<void>;
  uploadProfilePicture: (
    imageUri: string,
    user: any,
    setUser: (user: any) => void
  ) => Promise<void>;
  removeProfilePictureFromServer: (user: any, setUser: (user: any) => void) => Promise<void>;
  resetState: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profileImage: null,
  profileImagePreview: null,
  uploadingImage: false,
  hasChanges: false,
  resetKey: 0,

  setProfileImage: (imageUri: string, previewUrl: string) => {
    set({
      profileImage: imageUri,
      profileImagePreview: previewUrl,
      hasChanges: true,
    });
  },

  removeProfileImage: () => {
    set({
      profileImage: null,
      profileImagePreview: null,
      hasChanges: true,
    });
  },

  cancelChanges: () => {
    set((state) => ({
      profileImage: null,
      profileImagePreview: null,
      hasChanges: false,
      resetKey: state.resetKey + 1,
    }));
  },

  saveProfilePicture: async (user: any, setUser: (user: any) => void) => {
    const { profileImage, profileImagePreview } = get();

    return new Promise((resolve, reject) => {
      Alert.alert(
        'Save Profile Picture',
        'Are you sure you want to save these changes?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('Cancelled')),
          },
          {
            text: 'Save',
            onPress: async () => {
              try {
                if (profileImage) {
                  await get().uploadProfilePicture(profileImage, user, setUser);
                } else if (profileImagePreview === null && user.profilePicLink) {
                  await get().removeProfilePictureFromServer(user, setUser);
                }
                resolve();
              } catch (error) {
                reject(error);
              }
            },
          },
        ]
      );
    });
  },

  uploadProfilePicture: async (
    imageUri: string,
    user: any,
    setUser: (user: any) => void
  ) => {
    if (!imageUri) return;

    set({ uploadingImage: true });

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Get file info to determine file type
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Extract filename and determine mime type
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const fileType = filename.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg';
      if (fileType === 'png') {
        mimeType = 'image/png';
      } else if (fileType === 'jpg' || fileType === 'jpeg') {
        mimeType = 'image/jpeg';
      }

      // Append file to FormData
      formData.append('profilePic', {
        uri: imageUri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await axiosInstance.post(
        '/users/update-profile-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data && response.data.data.profilePicLink) {
        const updatedUser = {
          ...user,
          profilePicLink: response.data.data.profilePicLink,
        };
        setUser(updatedUser);

        // Clear cache and let it reload with new image
        await clearProfilePictureCache(user.id);

        set({
          profileImage: null,
          profileImagePreview: null,
          hasChanges: false,
        });

        Alert.alert('Success', 'Profile picture has been saved successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          error.message ||
          'Failed to save profile picture.'
      );
      throw error;
    } finally {
      set({ uploadingImage: false });
    }
  },

  removeProfilePictureFromServer: async (user: any, setUser: (user: any) => void) => {
    set({ uploadingImage: true });

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.delete('/users/remove-profile-picture', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update user with the response data
      const updatedUser = {
        ...user,
        profilePicLink: response.data.data.profilePicLink,
      };
      setUser(updatedUser);

      // Clear profile picture cache
      await clearProfilePictureCache(user.id);

      // Clear local states
      set({
        profileImage: null,
        profileImagePreview: null,
        hasChanges: false,
      });

      Alert.alert('Success', 'Profile picture has been removed successfully!');
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          error.message ||
          'Failed to remove profile picture.'
      );
      throw error;
    } finally {
      set({ uploadingImage: false });
    }
  },

  resetState: () => {
    set({
      profileImage: null,
      profileImagePreview: null,
      uploadingImage: false,
      hasChanges: false,
      resetKey: 0,
    });
  },
}));

export default useProfileStore;
