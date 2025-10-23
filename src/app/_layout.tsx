import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack options={{ headerShown: false }} header={() => null} />;
}
