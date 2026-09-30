// Logros, es estático, no funciona

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

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
    <View style={{"flex":1,"backgroundColor":"#0d1117"}}>
      {/* Header Modal (Botón Cerrar) */}
      <View style={{"flexDirection":"row","alignItems":"center","justifyContent":"flex-end","paddingHorizontal":16,"paddingTop":40,"paddingBottom":8}}>
        <Pressable
          onPress={() => router.back()}
          style={{"width":40,"height":40,"borderRadius":9999,"backgroundColor":"#181c22","borderWidth":1,"borderColor":"#374151","alignItems":"center","justifyContent":"center"}}
        >
          <MaterialIcons name="close" size={24} color="#9ca3af" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{"width":"100%","maxWidth":384,"paddingHorizontal":16}}>
          {/* Título de la sección */}
          <View style={{"alignItems":"center","marginBottom":40}}>
            <Text style={{"fontSize":30,"fontWeight":"700","color":"#ffffff","marginBottom":8,"letterSpacing":-0.25}}>
              Tus Logros
            </Text>
            <Text style={{"color":"#9ca3af","fontSize":14,"textAlign":"center"}}>
              Celebra tu progreso y habilidades técnicas.
            </Text>
          </View>

          {/* Cuadrícula de Insignias (Grid de 3 columnas) */}
          <View style={{"flexDirection":"row","flexWrap":"wrap","justifyContent":"center","marginBottom":48}}>
            {achievements.map((ach) => {
              // Lógica dinámica de estilos según el color/estado
              let borderColor = "#1f2937";
              let iconColor = "#6b7280"; // gray-500
              if (ach.isUnlocked) {
                switch (ach.color) {
                  case "green":
                    borderColor = "#10b981";
                    iconColor = "#10b981";
                    break;
                  case "purple":
                    borderColor = "#a855f7";
                    iconColor = "#a855f7";
                    break;
                  case "gold":
                    borderColor = "#eab308";
                    iconColor = "#eab308";
                    break;
                }
              }

              return (
                <View
                  key={ach.id}
                  style={{"alignItems":"center","width":"25%"}}
                >
                  {/* Círculo de la Medalla */}
                  <View
                    style={[{ width: 72, height: 72, borderRadius: 16, borderWidth: 2, backgroundColor: "#161b22", alignItems: "center", justifyContent: "center", marginBottom: 8 }, { borderColor }]}
                  >
                    <MaterialIcons
                      name={ach.icon as any}
                      size={32}
                      color={iconColor}
                    />
                  </View>
                  {/* Título de la Medalla */}
                  <Text
                    style={{"fontFamily":"monospace","fontSize":10,"textAlign":"center","color":"#d1d5db","lineHeight":16}}
                  >
                    {ach.title}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Resumen de Actividad */}
          <View style={{"backgroundColor":"#161b22","borderWidth":1,"borderColor":"#1f2937","borderRadius":12,"padding":20}}>
            <Text style={{"color":"#ffffff","fontWeight":"700","marginBottom":16,"fontSize":16}}>
              Resumen de Actividad
            </Text>

            <View style={{"flexDirection":"row","justifyContent":"space-between","alignItems":"flex-end","borderBottomWidth":1,"borderColor":"#1f2937","paddingBottom":8,"marginBottom":12}}>
              <Text style={{"color":"#9ca3af","fontSize":14}}>
                Logros Desbloqueados
              </Text>
              <Text style={{"color":"#60a5fa","fontWeight":"700","fontSize":18}}>
                {unlockedCount}/{totalCount}
              </Text>
            </View>

            {/* Barra de progreso de logros */}
            <View style={{"width":"100%","height":6,"backgroundColor":"#0d1117","borderRadius":9999,"overflow":"hidden","marginTop":4}}>
              <View
                style={{"height":"100%","backgroundColor":"#fb923c","borderRadius":9999}}
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
