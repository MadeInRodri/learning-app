// Misiones, es estático, no funciona

import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function ProgressScreen() {
  // SIMULACIÓN
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
      style={{"flex":1,"backgroundColor":"#0d1117","paddingHorizontal":16,"paddingTop":40}}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={{"width":"100%","maxWidth":384,"marginHorizontal":"auto"}}>
        {/* Título de la pantalla */}
        <Text style={{"fontSize":24,"fontWeight":"700","color":"#ffffff","textAlign":"center","marginBottom":32,"letterSpacing":-0.25}}>
          Misiones Diarias
        </Text>

        {/* Lista de Misiones */}
        <View style={{"gap":20}}>
          {missions.map((mission) => {
            // Variables de estilo por defecto (Estado: locked)
            let borderLeftColor = "#374151";
            let iconColor = "#6b7280"; // text-gray-500
            let progressBg = "#1f2937";
            let progressFill = "#4b5563";
            let xpColor = "#ca8a04";
            let countBg = "#21262d";
            let countColor = "#6b7280";
            let titleColor = "#ffffff";
            let titleStrike = false;

            // Estilos dinámicos para completado
            if (mission.state === "completed") {
              borderLeftColor = "#10b981";
              iconColor = "#10b981"; // emerald-500
              progressBg = "#064e3b";
              progressFill = "#10b981";
              countColor = "text-emerald-400";
              xpColor = "#6b7280";
              titleColor = "#6b7280";
              titleStrike = true;
            }
            // Estilos dinámicos para en progreso
            else if (mission.state === "in-progress") {
              borderLeftColor = "#3b82f6";
              iconColor = "#3b82f6"; // blue-500
              progressBg = "#1f2937";
              progressFill = "#3b82f6";
              countBg = "#1e3a8a";
              countColor = "#60a5fa";
              xpColor = "#60a5fa";
            }

            // Cálculo del porcentaje para la barra
            const progressPercentage = Math.round(
              (mission.current / mission.total) * 100,
            );

            return (
              <View
                key={mission.id}
                style={{ backgroundColor: "#161b22", borderWidth: 1, borderColor: "#1f2937", borderLeftWidth: 4, borderLeftColor, borderRadius: 4, padding: 16 }}
              >
                {/* Cabecera de la Misión */}
                <View style={{"flexDirection":"row","alignItems":"center","justifyContent":"space-between","marginBottom":12}}>
                  <View style={{"flexDirection":"row","alignItems":"center","flex":1,"paddingRight":8}}>
                    <MaterialIcons
                      name={mission.icon as any}
                      size={22}
                      color={iconColor}
                    />
                    <Text
                      style={{ fontWeight: "500", marginLeft: 12, fontSize: 16, color: titleColor, textDecorationLine: titleStrike ? "line-through" : "none" }}
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
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: countBg }}>
                      <Text style={{ fontFamily: "monospace", fontSize: 12, fontWeight: "700", color: countColor }}>
                        {mission.current}/{mission.total}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Barra de Progreso Interna */}
                <View
                  style={{ width: "100%", height: 4, borderRadius: 9999, marginBottom: 12, overflow: "hidden", backgroundColor: progressBg }}
                >
                  <View
                    style={{ height: "100%", borderRadius: 9999, backgroundColor: progressFill }}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </View>

                {/* Recompensa XP */}
                <View style={{"alignItems":"flex-end"}}>
                  <Text style={{ fontFamily: "monospace", fontSize: 12, fontWeight: "700", color: xpColor }}>
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
