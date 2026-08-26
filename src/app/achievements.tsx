import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AchievementsScreen() {
  // Objeto dinámico de logros
  const achievements = [
    {
      id: "1",
      title: "Hello World",
      icon: "code",
      color: "green",
      isUnlocked: true,
    },
    {
      id: "2",
      title: "Cazador de Bugs",
      icon: "bug-report",
      color: "purple",
      isUnlocked: true,
    },
    {
      id: "3",
      title: "Pionero",
      icon: "workspace-premium",
      color: "gold",
      isUnlocked: true,
    },

    {
      id: "4",
      title: "Maestro Jedi",
      icon: "lock",
      color: "locked",
      isUnlocked: false,
    },
    {
      id: "5",
      title: "Arquitecto",
      icon: "lock",
      color: "locked",
      isUnlocked: false,
    },
  ];

  // Cálculos para el resumen de actividad
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <View className="flex-1 bg-[#0d1117]">
      {/* Header Modal (Botón Cerrar) */}
      <View className="flex-row items-center justify-end px-4 pt-10 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#181c22] border border-gray-700 items-center justify-center active:bg-gray-700 transition-colors"
        >
          <MaterialIcons name="close" size={24} color="#9ca3af" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-sm px-4">
          {/* Título de la sección */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-white mb-2 tracking-tight">
              Tus Logros
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              Celebra tu progreso y habilidades técnicas.
            </Text>
          </View>

          {/* Cuadrícula de Insignias (Grid de 3 columnas) */}
          <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-8 mb-12">
            {achievements.map((ach) => {
              // Lógica dinámica de estilos según el color/estado
              let borderClass = "border-gray-800";
              let shadowClass = "";
              let iconColor = "#6b7280"; // gray-500
              let textOpacity = "opacity-50";

              if (ach.isUnlocked) {
                textOpacity = "opacity-100";
                switch (ach.color) {
                  case "green":
                    borderClass = "border-emerald-500";
                    shadowClass = "shadow-lg shadow-emerald-500/40";
                    iconColor = "#10b981";
                    break;
                  case "purple":
                    borderClass = "border-purple-500";
                    shadowClass = "shadow-lg shadow-purple-500/40";
                    iconColor = "#a855f7";
                    break;
                  case "gold":
                    borderClass = "border-yellow-500";
                    shadowClass = "shadow-lg shadow-yellow-500/40";
                    iconColor = "#eab308";
                    break;
                }
              }

              return (
                <View
                  key={ach.id}
                  className={`items-center w-[25%] ${!ach.isUnlocked ? "opacity-50" : ""}`}
                >
                  {/* Círculo de la Medalla */}
                  <View
                    className={`w-[72px] h-[72px] rounded-2xl border-2 bg-[#161b22] items-center justify-center mb-2 ${borderClass} ${shadowClass}`}
                  >
                    <MaterialIcons
                      name={ach.icon as any}
                      size={32}
                      color={iconColor}
                    />
                  </View>
                  {/* Título de la Medalla */}
                  <Text
                    className={`font-mono text-[10px] text-center text-gray-300 leading-tight ${textOpacity}`}
                  >
                    {ach.title}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Resumen de Actividad */}
          <View className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-md">
            <Text className="text-white font-bold mb-4 text-base">
              Resumen de Actividad
            </Text>

            <View className="flex-row justify-between items-end border-b border-gray-800 pb-2 mb-3">
              <Text className="text-gray-400 text-sm">
                Logros Desbloqueados
              </Text>
              <Text className="text-blue-400 font-bold text-lg">
                {unlockedCount}/{totalCount}
              </Text>
            </View>

            {/* Barra de progreso de logros */}
            <View className="w-full h-1.5 bg-[#0d1117] rounded-full overflow-hidden mt-1">
              <View
                className="h-full bg-orange-400 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
