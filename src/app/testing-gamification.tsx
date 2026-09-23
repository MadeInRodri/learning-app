import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import GamifiedHeader from "../components/GamifiedHeader";
import { useGamificationStore } from "../store/gamificationStore";

import Toast from "react-native-toast-message";

export default function TestGamificationScreen() {
  const { addXP, useEnergy, addEnergy, incrementStreak, breakStreak } =
    useGamificationStore();

  const handleUseEnergy = () => {
    const success = useEnergy(5);
    if (!success) {
      Toast.show({
        type: "error",
        text1: "Energía Insuficiente ⚡",
        text2: "No tienes suficiente energía para esta acción.",
        position: "top",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "-5 Energía",
        text2: "Acción realizada con éxito.",
        position: "top",
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0d1117]"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Encabezado Real */}
      <View className="pt-10 pb-4">
        <Text className="text-white text-center font-bold text-lg mb-2 font-mono">
          Entorno de Pruebas
        </Text>
        <GamifiedHeader />
      </View>

      {/* Panel de Control */}
      <View className="px-4 mt-6">
        <Text className="text-gray-400 font-mono text-xs uppercase mb-4 tracking-widest border-b border-[#30363d] pb-2">
          Panel de Transacciones
        </Text>

        {/* Controles de Experiencia */}
        <View className="mb-6">
          <Text className="text-[#adc6ff] font-bold mb-2">
            ⭐ Experiencia (XP)
          </Text>
          <Pressable
            onPress={() => addXP(45)}
            className="bg-[#181c22] border border-[#30363d] p-4 rounded-xl flex-row items-center justify-between active:bg-[#30363d]"
          >
            <Text className="text-white font-medium">Ganar +45 XP</Text>
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              color="#adc6ff"
            />
          </Pressable>
        </View>

        {/* Controles de Energía */}
        <View className="mb-6 space-y-3">
          <Text className="text-emerald-400 font-bold mb-2 mt-2">
            ⚡ Energía
          </Text>
          <Pressable
            onPress={handleUseEnergy}
            className="bg-[#181c22] border border-[#f85149]/50 p-4 rounded-xl flex-row items-center justify-between active:bg-[#f85149]/20 mb-2"
          >
            <Text className="text-[#f85149] font-medium">
              Gastar -5 Energía
            </Text>
            <MaterialIcons
              name="remove-circle-outline"
              size={20}
              color="#f85149"
            />
          </Pressable>

          <Pressable
            onPress={() => addEnergy(5)}
            className="bg-[#181c22] border border-emerald-500/50 p-4 rounded-xl flex-row items-center justify-between active:bg-emerald-500/20"
          >
            <Text className="text-emerald-400 font-medium">
              Recuperar +5 Energía
            </Text>
            <MaterialIcons
              name="battery-charging-full"
              size={20}
              color="#10b981"
            />
          </Pressable>
        </View>

        {/* Controles de Racha */}
        <View className="mb-6 space-y-3">
          <Text className="text-orange-400 font-bold mb-2 mt-2">
            🔥 Racha Diaria
          </Text>
          <Pressable
            onPress={incrementStreak}
            className="bg-[#181c22] border border-orange-500/50 p-4 rounded-xl flex-row items-center justify-between active:bg-orange-500/20 mb-2"
          >
            <Text className="text-orange-400 font-medium">
              Sumar 1 Día de Racha
            </Text>
            <MaterialIcons
              name="local-fire-department"
              size={20}
              color="#f97316"
            />
          </Pressable>

          <Pressable
            onPress={breakStreak}
            className="bg-[#181c22] border border-gray-600 p-4 rounded-xl flex-row items-center justify-between active:bg-gray-800"
          >
            <Text className="text-gray-400 font-medium">Romper Racha</Text>
            <MaterialIcons name="heart-broken" size={20} color="#9ca3af" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
