import EnergyTimerButton from "@/components/EnergyTimerButton";
import { api } from "@/config/api";
import { useAuthStore } from "@/store/authStore";
import { calculateLevelInfo } from "@/store/gamificationStore";
import { TokenStorage } from "@/store/tokenStore";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const { activeUser, logout } = useAuthStore();

  // Desestructuramos el nivel y el progreso en tiempo real usando la XP del backend
  const { level, currentXP, maxXP, progress } = calculateLevelInfo(
    activeUser?.xpTotales,
  );

  const handleLogout = async () => {
    try {
      if (activeUser?.id) {
        const refreshToken = await TokenStorage.getRefreshToken();

        await api.get("/logout", {
          params: { id: activeUser.id },
          headers: { "x-refresh-token": refreshToken },
        });
      }
    } catch (error) {
      console.error("Error cerrando sesión en backend", error);
    } finally {
      // Independientemente de si el backend falla, matamos la sesión local
      await TokenStorage.clearTokens();
      logout();
      router.replace("/(auth)/login" as any);
    }
  };

  // Previene crasheos si la vista se renderiza un microsegundo antes de redirigir al login
  if (!activeUser) return null;

  return (
    <ScrollView className="flex-1 bg-[#0d1117] px-4 pt-10">
      <View className="w-full max-w-sm mx-auto pb-24">
        <Text className="text-2xl font-bold text-white text-center mb-10">
          Tu perfil
        </Text>

        {/* Cabecera del Perfil */}
        <View className="flex-row items-center mb-10">
          <View className="w-20 h-20 rounded-full border-2 border-gray-700 bg-[#161b22] items-center justify-center mr-5 shadow-lg">
            <Text className="text-gray-400 font-mono text-xl font-bold uppercase tracking-widest">
              {activeUser.nombre.substring(0, 2)}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-white mb-1">
              {activeUser.nombre}
            </Text>
            <Text className="text-sm text-gray-400 mb-3">
              {activeUser.email}
            </Text>

            {/* Barra de Nivel Algorítmica */}
            <View className="w-full">
              <Text className="text-xs font-mono text-gray-400 mb-1">
                Lvl {level}{" "}
                <Text className="text-gray-600">
                  ({currentXP}/{maxXP} XP)
                </Text>
              </Text>
              <View className="w-40 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Tarjeta de Estadísticas (Valores devueltos por la API) */}
        <View className="bg-[#181c22] border border-gray-800 rounded-xl p-5 mb-8 shadow-md">
          <View className="flex-row justify-between items-center border-b border-gray-800 pb-3 mb-3">
            <Text className="text-gray-400">Energía Máxima</Text>
            <Text className="text-emerald-400 font-bold">
              {activeUser.energiaBalance} ⚡
            </Text>
          </View>

          <View className="flex-row justify-between items-center border-b border-gray-800 pb-3 mb-3">
            <Text className="text-gray-400">Estrellas Acumuladas</Text>
            <Text className="text-yellow-400 font-bold">
              {activeUser.estrellasBalance} ⭐
            </Text>
          </View>

          {/* Oculto por si las móscas */}

          {/* <View className="flex-row justify-between items-center border-b border-gray-800 pb-3 mb-3">
            <Text className="text-gray-400">Ayudas de IA Restantes</Text>
            <Text className="text-purple-400 font-bold">
              {activeUser.aiPistaBalance} 🤖
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-gray-400">Protectores de Racha</Text>
            <Text className="text-blue-400 font-bold">
              {activeUser.protectorRachaBalance} 🛡️
            </Text>
          </View> */}

          <View className="items-end">
            <View className="border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 rounded">
              <Text className="text-orange-400 font-mono text-xs font-semibold tracking-wide">
                EXPERIENCIA TOTAL: {activeUser.xpTotales} XP
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de Acción */}
        <View className="gap-4">
          {/* <Pressable
            onPress={() => router.push("/testing-gamification" as any)}
            className="w-full py-4 border border-orange-400/80 rounded-lg items-center justify-center active:bg-orange-400/10 transition-colors"
          >
            <Text className="text-orange-400 font-bold">Testing API</Text>
          </Pressable> */}
          <EnergyTimerButton></EnergyTimerButton>

          <Pressable
            onPress={() => router.push("/achievements" as any)}
            className="w-full py-4 border border-purple-500/80 rounded-lg items-center justify-center active:bg-purple-500/10 "
          >
            <Text className="text-purple-400 font-bold">
              Catálogo de recompensas
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            className="w-full py-4 border border-red-500 rounded-lg items-center justify-center active:bg-red-500/10 "
          >
            <Text className="text-red-500 font-bold">Cerrar Sesión</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
