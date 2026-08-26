import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Configuración del Header Superior
        headerStyle: {
          backgroundColor: "#0d1117",
          borderBottomWidth: 1,
          borderBottomColor: "#1e1e1e",
        },
        headerTitleAlign: "center",
        headerTitle: () => (
          <Text className="text-white font-bold text-lg">MadeInRodri</Text>
        ),
        headerLeft: () => (
          <View className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 items-center justify-center ml-4">
            <Text className="text-gray-400 text-xs font-mono font-bold">
              MR
            </Text>
          </View>
        ),
        headerRight: () => (
          <MaterialIcons
            name="settings"
            size={24}
            color="#9ca3af"
            style={{ marginRight: 16 }}
          />
        ),

        // Configuración de la Barra Inferior (Bottom Tabs)
        tabBarStyle: {
          backgroundColor: "#181c22",
          borderTopColor: "#424754",
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: "#adc6ff", // Azul claro activo de Canva
        tabBarInactiveTintColor: "#c2c6d6",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Aprender",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="school" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="path"
        options={{
          title: "Ruta",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="alt-route" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progreso",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-tree" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
