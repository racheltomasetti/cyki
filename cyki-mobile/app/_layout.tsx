import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";

export default function AppLayout() {
  // Get current date in the format "Mar 23"
  const currentDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#002AFF",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
      }}
      initialRouteName="calendar"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          href: null,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "calendar",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="calendar-today" size={24} color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: currentDate,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="insights" size={24} color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "notes",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="note-add" size={24} color={color} />
          ),
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
