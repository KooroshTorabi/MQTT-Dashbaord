import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0B1220" },
        headerTintColor: "#F9FAFB",
        tabBarStyle: { backgroundColor: "#0B1220", borderTopColor: "#1F2937" },
        tabBarActiveTintColor: "#38BDF8",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: "Publish",
          tabBarIcon: ({ color }) => <Text style={{ color }}>📤</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
