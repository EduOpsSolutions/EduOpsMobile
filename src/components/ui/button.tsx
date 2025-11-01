import * as React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";

export interface ButtonProps {
  onPress?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      onPress,
      variant = "default",
      size = "default",
      disabled = false,
      loading = false,
      children,
      style,
      textStyle,
    },
    ref
  ) => {
    const buttonStyles = [
      styles.base,
      styles[`variant_${variant}`],
      styles[`size_${size}`],
      disabled && styles.disabled,
      style,
    ];

    const textStyles = [
      styles.text,
      styles[`text_${variant}`],
      styles[`textSize_${size}`],
      disabled && styles.textDisabled,
      textStyle,
    ];

    return (
      <TouchableOpacity
        ref={ref}
        style={buttonStyles}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "default" ? "#fff" : "#000"}
            size="small"
          />
        ) : (
          <Text style={textStyles}>{children}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  // Variants
  variant_default: {
    backgroundColor: "#dc2626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  variant_destructive: {
    backgroundColor: "#ef4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  variant_outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  variant_secondary: {
    backgroundColor: "#f3f4f6",
  },
  variant_ghost: {
    backgroundColor: "transparent",
  },
  variant_link: {
    backgroundColor: "transparent",
  },
  // Sizes
  size_default: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  size_sm: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  size_lg: {
    height: 40,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  size_icon: {
    height: 36,
    width: 36,
  },
  // Text styles
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
  text_default: {
    color: "#ffffff",
  },
  text_destructive: {
    color: "#ffffff",
  },
  text_outline: {
    color: "#000000",
  },
  text_secondary: {
    color: "#000000",
  },
  text_ghost: {
    color: "#000000",
  },
  text_link: {
    color: "#dc2626",
    textDecorationLine: "underline",
  },
  textSize_default: {
    fontSize: 14,
  },
  textSize_sm: {
    fontSize: 12,
  },
  textSize_lg: {
    fontSize: 14,
  },
  textSize_icon: {
    fontSize: 14,
  },
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.5,
  },
});

export { Button };
