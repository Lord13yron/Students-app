import { Tabs, useGlobalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import MoneyModal from "@/components/MoneyModal";

const DashboardLayout = () => {
  const router = useRouter();
  const [moneyModalVisible, setMoneyModalVisible] = useState(false);
  const { id } = useGlobalSearchParams<{ id?: string }>();
  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarStyle: {
            paddingTop: 10,
            height: 90,
            backgroundColor: "#F6EEFF",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <Ionicons size={24} name={focused ? "home" : "home-outline"} />
            ),
          }}
        />
        <Tabs.Screen
          name="students"
          options={{
            title: "Students",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "people" : "people-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Reports",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "bar-chart" : "bar-chart-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "settings" : "settings-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="students/[id]"
          options={{
            href: null,
            title: "Student",
            headerLeft: () => (
              <Pressable
                onPress={() => router.navigate("/students")}
                className="pl-4"
              >
                <Ionicons name="chevron-back" size={24} />
              </Pressable>
            ),
          }}
        />
      </Tabs>
      <Pressable
        onPress={() => setMoneyModalVisible(true)}
        className="absolute flex-row items-center gap-2 rounded-full bottom-28 right-6 bg-primary px-5 py-4"
      >
        <Ionicons name="add" size={28} color="white" />
        <Text className="text-white">Add Transaction</Text>
      </Pressable>
      {moneyModalVisible && (
        <MoneyModal
          visible={moneyModalVisible}
          onCancel={() => setMoneyModalVisible(false)}
          setMoneyModalVisible={setMoneyModalVisible}
          initialStudentId={typeof id === "string" ? id : undefined}
        />
      )}
    </View>
  );
};

export default DashboardLayout;
