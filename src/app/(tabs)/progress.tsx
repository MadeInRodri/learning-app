import React from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProgressScreen() {
  // Objeto dinámico simulando los datos de misiones desde la BD o estado
  const missions = [
    {
      id: "1",
      title: "Responde 3 preguntas",
      current: 1,
      total: 3,
      xp: 10,
      icon: "bolt", // Rayo
      state: "in-progress",
    },
    {
      id: "2",
      title: "Completa 1 lección de noche",
      current: 0,
      total: 1,
      xp: 50,
      icon: "nights-stay", // Luna
      state: "locked",
    },
    {
      id: "3",
      title: "Participa en el foro",
      current: 1,
      total: 1,
      xp: 20,
      icon: "forum", // Chat
      state: "completed",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-[#0d1117] px-4 pt-10"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="w-full max-w-sm mx-auto">
        {/* Título de la pantalla */}
        <Text className="text-2xl font-bold text-white text-center mb-8 tracking-tight">
          Misiones Diarias
        </Text>

        {/* Lista de Misiones */}
        <View className="gap-5">
          {missions.map((mission) => {
            // Variables de estilo por defecto (Estado: locked)
            let borderLeftColor = "border-l-gray-700";
            let iconColor = "#6b7280"; // text-gray-500
            let progressBg = "bg-gray-800";
            let progressFill = "bg-gray-600";
            let xpColor = "text-yellow-600";
            let countBg = "bg-[#21262d]";
            let countColor = "text-gray-500";
            let titleColor = "text-white";
            let titleStyle = ""; // Para el tachado

            // Estilos dinámicos para completado
            if (mission.state === "completed") {
              borderLeftColor = "border-l-emerald-500";
              iconColor = "#10b981"; // emerald-500
              progressBg = "bg-emerald-900/30";
              progressFill = "bg-emerald-500";
              countColor = "text-emerald-400";
              xpColor = "text-gray-500"; // Se apaga la recompensa si ya se cobró
              titleColor = "text-gray-500";
              titleStyle = "line-through";
            }
            // Estilos dinámicos para en progreso
            else if (mission.state === "in-progress") {
              borderLeftColor = "border-l-blue-500";
              iconColor = "#3b82f6"; // blue-500
              progressBg = "bg-gray-800";
              progressFill = "bg-blue-500";
              countBg = "bg-blue-900/20";
              countColor = "text-blue-400";
              xpColor = "text-blue-400"; // Usamos azul como en tu diseño de Canva
            }

            // Cálculo del porcentaje para la barra
            const progressPercentage = Math.round(
              (mission.current / mission.total) * 100,
            );

            return (
              <View
                key={mission.id}
                className={`bg-[#161b22] border border-gray-800 border-l-4 ${borderLeftColor} rounded p-4`}
              >
                {/* Cabecera de la Misión */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1 pr-2">
                    <MaterialIcons
                      name={mission.icon as any}
                      size={22}
                      color={iconColor}
                    />
                    <Text
                      className={`font-medium ml-3 text-base ${titleColor} ${titleStyle}`}
                    >
                      {mission.title}
                    </Text>
                  </View>

                  {/* Contador o Check */}
                  {mission.state === "completed" ? (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#10b981"
                    />
                  ) : (
                    <View className={`px-2 py-1 rounded ${countBg}`}>
                      <Text
                        className={`font-mono text-xs font-bold ${countColor}`}
                      >
                        {mission.current}/{mission.total}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Barra de Progreso Interna */}
                <View
                  className={`w-full h-1 rounded-full mb-3 overflow-hidden ${progressBg}`}
                >
                  <View
                    className={`h-full rounded-full ${progressFill}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </View>

                {/* Recompensa XP */}
                <View className="items-end">
                  <Text className={`font-mono text-xs font-bold ${xpColor}`}>
                    +{mission.xp} XP
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
