import "../../global.css";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import UserProvider from "@/contexts/UserContext";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Stack>
          <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
          <Stack.Screen
            name="(dashboard)"
            options={{ headerShown: false, title: "Home" }}
          />
        </Stack>
      </UserProvider>
    </QueryClientProvider>
  );
}
