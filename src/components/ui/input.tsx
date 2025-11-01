import * as React from "react";
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from "react-native";

export interface InputProps extends TextInputProps {
  style?: ViewStyle;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  input: {
    height: 36,
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 16,
    color: "#000000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

export { Input };
