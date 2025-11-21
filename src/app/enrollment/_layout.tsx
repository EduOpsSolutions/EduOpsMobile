import { Stack } from "expo-router";

export default function EnrollmentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="form" options={{ headerShown: false }} />
      <Stack.Screen name="status" options={{ headerShown: false }} />
    </Stack>
  );
}
