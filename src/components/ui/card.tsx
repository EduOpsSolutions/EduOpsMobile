import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card = React.forwardRef<View, CardProps>(({ style, children }, ref) => (
  <View ref={ref} style={[styles.card, style]}>
    {children}
  </View>
));
Card.displayName = "Card";

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ style, children }, ref) => (
    <View ref={ref} style={[styles.header, style]}>
      {children}
    </View>
  )
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ style, children }, ref) => (
    <Text ref={ref} style={[styles.title, style]}>
      {children}
    </Text>
  )
);
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ style, children }, ref) => (
    <Text ref={ref} style={[styles.description, style]}>
      {children}
    </Text>
  )
);
CardDescription.displayName = "CardDescription";

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const CardContent = React.forwardRef<View, CardContentProps>(
  ({ style, children }, ref) => (
    <View ref={ref} style={[styles.content, style]}>
      {children}
    </View>
  )
);
CardContent.displayName = "CardContent";

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ style, children }, ref) => (
    <View ref={ref} style={[styles.footer, style]}>
      {children}
    </View>
  )
);
CardFooter.displayName = "CardFooter";

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "column",
    gap: 6,
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    letterSpacing: -0.3,
    color: "#000000",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    paddingTop: 0,
  },
});

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
