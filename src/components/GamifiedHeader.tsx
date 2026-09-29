import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { calculateLevelInfo } from "../store/gamificationStore";

export default function GamifiedHeader() {
  // Obtenemos el usuario activo desde el store que guarda el payload del backend
  const activeUser = useAuthStore((state) => state.activeUser);

  // Calculamos nivel, progreso y límites usando la XP total
  const { level, currentXP, maxXP, progress } = calculateLevelInfo(
    activeUser?.xpTotales,
  );

  // Obtenemos la energía, límite 50
  const currentEnergy = activeUser?.energiaBalance || 0;
  const maxEnergy = 50;
  const energyPercentage = Math.round((currentEnergy / maxEnergy) * 100);

  // 4. Racha MOCK (Pendiente de que el backend lo envíe en el login)
  const streak = { isActive: true };

  const renderEnergySegments = () => {
    const segments = 3;
    const segmentsActive = Math.ceil((currentEnergy / maxEnergy) * segments);

    return Array.from({ length: segments }).map((_, index) => {
      const isActive = segments - index <= segmentsActive;
      return (
        <View
          key={index}
          className={`w-full h-1.5 rounded-[1px] mb-[2px] ${
            isActive ? "bg-[#adc6ff]" : "bg-[#30363d]/50"
          }`}
        />
      );
    });
  };

  // Previene errores de renderizado si el usuario aún no carga
  if (!activeUser) return null;

  return (
    <View className="relative bg-[#181c22] rounded-2xl border border-[#30363d] p-3.5 shadow-lg mx-2 mb-5">
      <View className="absolute top-0 inset-x-8 h-[1px] bg-blue-500/60" />

      <View className="flex-row items-center justify-between">
        {/* IZQUIERDA: Energía */}
        <View className="flex-1 items-center justify-center border-r border-[#30363d]/60 pr-2">
          <View className="flex-row items-center gap-2 mb-1.5">
            <View className="items-center">
              <View className="w-2.5 h-1 bg-[#adc6ff]/50 rounded-t-sm" />
              <View className="w-5 h-9 rounded-[4px] border border-[#adc6ff]/60 bg-[#0d1117] p-[2px] justify-end">
                {renderEnergySegments()}
              </View>
            </View>
            <View>
              <Text className="text-[10px] uppercase font-mono font-medium text-gray-400">
                ENERGÍA
              </Text>
              <Text className="text-xs font-mono font-bold text-[#adc6ff]">
                {currentEnergy}{" "}
                <Text className="text-gray-500 font-normal">/ {maxEnergy}</Text>
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#adc6ff]/10 border border-[#adc6ff]/25">
            <MaterialIcons name="bolt" size={10} color="#adc6ff" />
            <Text className="text-[9px] font-mono text-[#adc6ff]">
              {energyPercentage}% listo
            </Text>
          </View>
        </View>

        {/* CENTRO: Racha */}
        <View className="flex-1 items-center justify-center border-r border-[#30363d]/60 px-2">
          <View className="relative mb-1">
            {streak.isActive ? (
              <>
                <View className="w-8 h-8 rounded-full bg-[#2a1711] border border-orange-500/50 items-center justify-center">
                  <MaterialIcons
                    name="local-fire-department"
                    size={20}
                    color="#fb923c"
                  />
                </View>
                <View className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#0d1117] border border-[#3b82f6] items-center justify-center">
                  <MaterialIcons name="check" size={8} color="#adc6ff" />
                </View>
              </>
            ) : (
              <>
                <View className="w-8 h-8 rounded-full bg-[#1b1517] border border-[#f85149]/40 items-center justify-center">
                  <MaterialIcons
                    name="local-fire-department"
                    size={20}
                    color="#6b7280"
                  />
                  <View className="absolute inset-0 items-center justify-center">
                    <MaterialIcons name="close" size={18} color="#f85149" />
                  </View>
                </View>
                <View className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#0d1117] border border-[#f85149]/60 items-center justify-center">
                  <MaterialIcons
                    name="priority-high"
                    size={8}
                    color="#f85149"
                  />
                </View>
              </>
            )}
          </View>
          <View className="items-center mt-1">
            <Text
              className={`text-[9px] uppercase font-mono font-medium ${
                streak.isActive ? "text-orange-400" : "text-[#f85149]"
              }`}
            >
              {streak.isActive ? "RACHA ACTIVA" : "RACHA PERDIDA"}
            </Text>
          </View>
        </View>

        {/* DERECHA: Nivel y Experiencia */}
        <View className="flex-1 justify-center pl-2">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="military-tech" size={13} color="#adc6ff" />
              <Text className="text-xs font-bold text-[#adc6ff] font-mono">
                Lvl {level}
              </Text>
            </View>
          </View>

          <View className="w-full h-2 rounded-full bg-[#0d1117] border border-[#30363d] p-[1px] mb-1">
            <View
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-[9px] font-mono text-gray-500">XP</Text>
            <Text className="text-[9px] text-[#adc6ff] font-medium font-mono">
              {currentXP} / {maxXP}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
