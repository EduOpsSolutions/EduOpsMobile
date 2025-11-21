import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#de0000"
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="grades" options={{ headerShown: false }} />
        <Stack.Screen name="document" options={{ headerShown: false }} />
        <Stack.Screen name="paymentform" options={{ headerShown: false }} />
        <Stack.Screen name="assessment" options={{ headerShown: false }} />
        <Stack.Screen name="ledger" options={{ headerShown: false }} />
        <Stack.Screen name="studyload" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
