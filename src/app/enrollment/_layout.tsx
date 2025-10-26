import { Stack } from "expo-router";

export default function EnrollmentLayout() {
  return (
    <Stack options={{ headerShown: false }} header={() => null}>
      <Stack.Screen name="faefaefaef" options={{ headerShown: false }} />
      <Stack.Screen name="status" options={{ headerShown: false }} />
    </Stack>
  );
}
