import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack options={{ headerShown: false }} header={() => null}>
      <Stack.Screen name="enrollment/index" options={{ headerShown: false }} />
      <Stack.Screen name="enrollment/status" options={{ headerShown: false }} />
      <Stack.Screen name="enrollment/form" options={{ headerShown: false }} />
      {/* <Stack.Screen
        name="enrollment/_layout"
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="grades" options={{ headerShown: false }} />
      <Stack.Screen name="document" options={{ headerShown: false }} />
      <Stack.Screen name="paymentform" options={{ headerShown: false }} />
      <Stack.Screen name="assessment" options={{ headerShown: false }} />
      <Stack.Screen name="ledger" options={{ headerShown: false }} />
      <Stack.Screen name="studyload" options={{ headerShown: false }} />
    </Stack>
  );
}
