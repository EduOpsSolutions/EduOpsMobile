import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EyeIcon, Fullscreen, LockIcon, UserIcon } from 'lucide-react-native';
import { styles } from './LoginScreen.styles';
import { RelativePathString, useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { TrackEnrollmentModal } from '../../components/modals';
import { cn } from '../../utils/cn';

export const LoginScreen = (): React.JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const router = useRouter();

  // Get login function and loading state from auth store
  const { login, isLoading, error, user } = useAuthStore();

  // Handle login
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Incorrect Input', 'Please enter both email and password');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Incorrect Input', 'Please enter a valid email address');
      return;
    }

    try {
      // Call login function from store
      await login(email, password);

      // On success, navigate based on user role
      const currentUser = useAuthStore.getState().user;

      if (currentUser) {
        // Navigate based on role
        if (currentUser.role === 'student') {
          router.replace('/home');
        } else if (currentUser.role === 'admin') {
          router.replace('/home'); // Change to admin home when available
        } else if (currentUser.role === 'teacher') {
          router.replace('/home'); // Change to teacher home when available
        } else {
          router.replace('/home');
        }
      }
    } catch (error: any) {
      // Error is already handled in the store, just show alert
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.headerLogo}
          source={require('../../../assets/images/sprachins-logo-3.png')}
          resizeMode="contain"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.main}>
            <View style={styles.card}>
              {/* Welcome text */}
              <Text style={styles.welcomeText}>WELCOME TO</Text>

              {/* Logo */}
              <Image
                style={styles.logo}
                source={require('../../../assets/images/sprachins-logo-3.png')}
                resizeMode="contain"
              />

              {/* Email input */}
              <View style={styles.inputWrapper}>
                <UserIcon size={24} color="#6d6d6d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6d6d6d"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>

              {/* Password input */}
              <View style={styles.inputWrapper}>
                <LockIcon size={24} color="#6d6d6d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#6d6d6d"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <EyeIcon size={20} color="#6d6d6d" />
                </TouchableOpacity>
              </View>

              {/* Forgot password */}
              <TouchableOpacity style={styles.forgotWrapper}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login button */}
              <View style={styles.loginButtonWrapper}>
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && { opacity: 0.6 }]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fffdf2" />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.enrollButtonWrapper}>
                <Text style={styles.enrollButtonText}>
                  Don't have an account?
                </Text>
                {/* Sign Up / Enroll button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && { opacity: 0.6 }]}
                  onPress={() =>
                    router.replace(
                      '/enrollment/form' as any as RelativePathString
                    )
                  }
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>Sign Up / Enroll</Text>
                </TouchableOpacity>
              </View>

              {/* Track Enrollment Section */}
              <View style={styles.trackButtonWrapper}>
                <Text style={styles.trackLabelText}>Already enrolled?</Text>
                <TouchableOpacity
                  style={[styles.trackButton, isLoading && { opacity: 0.6 }]}
                  onPress={() => setTrackModalOpen(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.trackButtonText}>Track Enrollment</Text>
                </TouchableOpacity>
              </View>

              {/* Terms and Privacy */}
              <Text style={styles.termsText}>
                By using this service, you understood and agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Track Enrollment Modal */}
      <TrackEnrollmentModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />
    </SafeAreaView>
  );
};
