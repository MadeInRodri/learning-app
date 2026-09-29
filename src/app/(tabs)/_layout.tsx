import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useAuthStore } from "../../store/authStore"; // Ajusta la ruta si es necesario

export default function TabsLayout() {
  // 1. Extraemos el usuario activo de Zustand
  const activeUser = useAuthStore((state) => state.activeUser);

  // 2. Generamos las iniciales dinámicas (las primeras 2 letras en mayúscula)
  const initials = activeUser?.nombre
    ? activeUser.nombre.substring(0, 2).toUpperCase()
    : "US";

  return (
    <Tabs
      screenOptions={{
        // HEADER
        headerStyle: {
          backgroundColor: "#0d1117",
          borderBottomWidth: 1,
          borderBottomColor: "#1e1e1e",
        },
        headerTitleAlign: "center",
        headerTitle: () => (
          // 3. Mostramos el username real o un fallback
          <Text className="text-white font-bold text-lg">
            {activeUser?.nombre || "Desarrollador"}
          </Text>
        ),
        headerLeft: () => (
          <View className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 items-center justify-center ml-4">
            <Text className="text-gray-400 text-xs font-mono font-bold">
              {initials}
            </Text>
          </View>
        ),

        // EL FOOTER, LOS TABS
        tabBarStyle: {
          backgroundColor: "#181c22",
          borderTopColor: "#424754",
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: "#adc6ff",
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
