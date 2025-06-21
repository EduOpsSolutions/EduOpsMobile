import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import { EyeIcon, LockIcon, UserIcon } from "lucide-react-native";
import { styles } from "./LoginScreen.styles";
import { useRouter } from "expo-router";

export const LoginScreen = (): React.JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.headerLogo}
          source={require("../../../assets/images/sprachins-logo-3.png")}
          resizeMode="contain"
        />
      </View>

      <View style={styles.main}>
        <View style={styles.card}>
          {/* Welcome text */}
          <Text style={styles.welcomeText}>WELCOME TO</Text>

          {/* Logo */}
          <Image
            style={styles.logo}
            source={require("../../../assets/images/sprachins-logo-3.png")}
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
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Sign up section */}
          <View style={styles.signupWrapper}>
            <Text style={styles.signupText}>Don&apos;t have an account?</Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By using this service, you understood and agree to our{" "}
            <Text style={styles.termsLink}>Terms</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
};
