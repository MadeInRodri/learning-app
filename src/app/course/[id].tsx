import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/courseStore";
import { useModuleStore } from "../../store/moduleStore";
import { useQuizStore } from "../../store/quizStore";

export default function CourseScreen() {
  const { id: pathId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const activeCourseId = useCourseStore((state) => state.activeCourseId);
  const activeCourseName = useCourseStore((state) => state.activeCourseName);
  const modules = useModuleStore((state) => state.modules);
  const isFetching = useModuleStore((state) => state.isFetching);
  const fetchModules = useModuleStore((state) => state.fetchModules);
  const cancelFetchModules = useModuleStore(
    (state) => state.cancelFetchModules,
  );
  const setActiveModule = useModuleStore((state) => state.setActiveModule);
  const activeQuiz = useQuizStore((state) => state.activeQuiz);
  const forceStartQuiz = useQuizStore((state) => state.forceStartQuiz);
  const updateGamificationStats = useAuthStore(
    (state) => state.updateGamificationStats,
  );
  const claimReward = useGamificationStore((state) => state.claimReward);

  useEffect(() => {
    if (pathId) fetchModules(pathId);
    return cancelFetchModules;
  }, [pathId, fetchModules, cancelFetchModules]);

  const summary = modules.reduce(
    (totals, mod) => {
      if (mod.state === "completed") totals.completed += 1;
      else if (mod.type === "quiz") {
        totals.quizzes += 1;
        totals.stars += 5;
      } else totals.xp += 100;
      return totals;
    },
    { completed: 0, xp: 0, stars: 0, quizzes: 0 },
  );
  const progressPercent = modules.length
    ? Math.round((summary.completed / modules.length) * 100)
    : 0;

  const handleModulePress = async (mod: any) => {
    //Acciones dependiendo de si ta bloqueado o no
    console.log("hola")
    if (mod.state === "locked") {
      
      Toast.show({
        type: "error",
        text1: "Módulo bloqueado 🔒",
        text2: "Completa las lecciones anteriores para acceder.",
      });
      return;
    }
   
    Toast.hide();
    setActiveModule(mod.id);

    if (mod.type === "quiz") {
      // Creamos una sub-función para manejar la entrada y el cobro de energía
      // Solo para el quiz, cobra antes de entrar para evitar trampa
      const enterQuiz = async () => {
        const activeUser = useAuthStore.getState().activeUser;
        if ((activeUser?.energiaBalance || 0) < 20) {
          Toast.show({
            type: "error",
            text1: "Energía Insuficiente ⚡",
            text2: "Necesitas al menos 20 de energía para el examen final.",
          });
          return;
        }

        // Cobramos la energía antes de entrar
        await claimReward("ENERGY", "quiz_attempt", "LESS_ENERGY");
        updateGamificationStats(0, -20);

        // Forzamos el inicio limpio para evitar cruces
        forceStartQuiz(activeCourseId!, pathId);
        setTimeout(() => {
          router.push({ pathname: "/lesson/quiz", params: { pathId } } as any);
        }, 50);
      };

      // Verificamos si hay un quiz abandonado
      if (
        activeQuiz &&
        (activeQuiz.languageId !== activeCourseId ||
          activeQuiz.pathId !== pathId)
      ) {
        // Por si ya han empezado uno
        Toast.show({
          type: "error",
          text1: "Quiz en progreso ⚠️",
          text2: "Toca esta alerta para reiniciar y descartar el anterior.",
          visibilityTime: 5000,
          onPress: () => {
            forceStartQuiz(activeCourseId!, pathId);
            Toast.hide();
            // Navegación directa
            router.push({
              pathname: "/lesson/quiz",
              params: { pathId },
            } as any);
          },
        });
        return;
      }

      // Si no hay conflictos, intentamos entrar directamente
      await enterQuiz();
    } else {
      setTimeout(() => {
        router.push({ pathname: "/lesson/markdown", params: { pathId } } as any);
      }, 50);
    }
  };
  return (
    // Asignamos un Key estático para evitar que el router pierda el contexto
    // No sé si hará algo
    <View key="course-view" style={{"flex":1,"backgroundColor":"#0d1117"}}>
      <View style={{"flexDirection":"row","alignItems":"center","justifyContent":"space-between","paddingHorizontal":16,"paddingTop":48,"paddingBottom":16,"borderBottomWidth":1,"borderColor":"#1f2937","backgroundColor":"#0d1117"}}>
        <Pressable
          onPress={() => router.back()}
          style={{"width":40,"height":40,"borderRadius":9999,"backgroundColor":"#181c22","borderWidth":1,"borderColor":"#374151","alignItems":"center","justifyContent":"center"}}
        >
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>

        <Text style={{"color":"#ffffff","fontWeight":"700","fontSize":18}}>
          Ruta de Aprendizaje
        </Text>
        <View style={{"width":40,"height":40}} />
      </View>

      <ScrollView
        style={{"flex":1}}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 32 }}
      >
        <View style={{"width":"100%","maxWidth":448,"paddingHorizontal":16,"paddingTop":32}}>
          <View style={{"alignItems":"center","marginBottom":40}}>
            <Text style={{"fontSize":24,"fontWeight":"700","color":"#ffffff","marginBottom":8,"textAlign":"center","letterSpacing":-0.25}}>
              {activeCourseName} - Nivel {pathId}
            </Text>
            <Text style={{"color":"#9ca3af","fontSize":14,"textAlign":"center"}}>
              Continúa tu ruta de aprendizaje
            </Text>
          </View>

          {isFetching && modules.length === 0 ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{"marginTop":40}} />
          ) : (
            <View style={{"position":"relative","width":"100%","paddingVertical":16}}>
              {/* 1. Línea Central Vertical con z-0 */}
              <View 
                pointerEvents="none"
              style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, backgroundColor: "#374151", transform: [{ translateX: -1 }], zIndex: 0 }} />

              {modules.map((mod, index) => {
                const isLeft = index % 2 === 0;
                const isQuiz = mod.type === "quiz";
                const isActiveQuiz =
                  isQuiz &&
                  activeQuiz?.languageId === activeCourseId &&
                  activeQuiz?.pathId === pathId;

                let cardStyle: ViewStyle = { borderColor: "#1f2937" };
                let dotStyle: ViewStyle = { borderColor: "#374151", backgroundColor: "#161b22" };
                let titleStyle: TextStyle = { color: "#6b7280" };
                let subtitleStyle: TextStyle = { color: "#4b5563" };
                let iconColor = "#6b7280";
                let iconName: any = "lock";

                if (mod.state === "completed") {
                  cardStyle = { borderColor: "#10b981", borderRightWidth: isLeft ? 4 : undefined, borderLeftWidth: isLeft ? undefined : 4 };
                  dotStyle = { borderColor: "#10b981", backgroundColor: "#161b22" };
                  titleStyle = { color: "#ffffff" };
                  subtitleStyle = { color: "#9ca3af" };
                  iconColor = "#10b981";
                  iconName = "check";
                } else if (mod.state === "in-progress") {
                  cardStyle = { borderColor: "#60a5fa", borderRightWidth: isLeft ? 4 : undefined, borderLeftWidth: isLeft ? undefined : 4 };
                  dotStyle = { borderColor: "#60a5fa", backgroundColor: "#1e3a8a" };
                  titleStyle = { color: "#60a5fa" };
                  subtitleStyle = { color: "#9ca3af" };
                  iconColor = "#60a5fa";
                  iconName = "play-arrow";
                } else if (isQuiz) {
                  cardStyle = { borderColor: "#374151", borderStyle: "dashed", backgroundColor: "#1c2026" };
                  dotStyle = { borderColor: "#374151", borderStyle: "dashed", backgroundColor: "#1c2026" };
                  iconName = "emoji-events";
                }

                return (
                  <View
                    key={mod.id}
                    style={{"flexDirection":"row","width":"100%","marginBottom":32,"position":"relative","alignItems":"center","zIndex":10}}
                    
                  >
                    <View style={[{ position: "absolute", left: "50%", width: 32, height: 32, borderRadius: 9999, borderWidth: 2, alignItems: "center", justifyContent: "center", zIndex: 20, transform: [{ translateX: -16 }] }, dotStyle]}>
                      <MaterialIcons
                        name={iconName}
                        size={16}
                        color={iconColor}
                      />
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        { width: "50%", zIndex: 100, marginRight: isLeft ? "auto" : undefined, marginLeft: isLeft ? undefined : "auto", paddingRight: isLeft ? 32 : undefined, paddingLeft: isLeft ? undefined : 32 },
                        pressed && mod.state !== "locked" ? { transform: [{ scale: 0.95 }] } : undefined,
                      ]}
                      onPress={() => handleModulePress(mod)}
                    >
                      <View style={[{ padding: 16, backgroundColor: "#161b22", borderRadius: 12, borderWidth: 1 }, cardStyle]}>
                        <View style={{"flexDirection":"row","alignItems":"center","justifyContent":"space-between"}}>
                          <Text
                            style={[{ flex: 1, fontSize: 16, fontWeight: "700", marginBottom: 4 }, titleStyle]}
                          >
                            {mod.title}
                          </Text>
                          {isActiveQuiz && (
                            <MaterialIcons
                              name="play-circle-filled"
                              size={16}
                              color="#fbbf24"
                            />
                          )}
                        </View>
                        <Text style={[{ fontSize: 12 }, subtitleStyle]}>
                          {mod.subtitle}
                        </Text>
                        {isActiveQuiz && (
                            <Text style={{ marginTop: 4, fontSize: 9, fontWeight: "700", letterSpacing: 1, color: isQuiz ? "#fcd34d" : "#93c5fd" }}>
                            EXAMEN EN CURSO
                          </Text>
                        )}
                        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center", borderTopWidth: 1, borderColor: "#374151", paddingTop: 8 }}>
                          <View style={{"flexDirection":"row","alignItems":"center"}}>
                            <MaterialIcons
                              name="bolt"
                              size={14}
                              color="#fbbf24"
                            />
                            <Text style={{ marginLeft: 4, fontSize: 10, fontWeight: "600", color: "#fcd34d" }}>
                              -20 energía
                            </Text>
                          </View>
                          <View style={{"flexDirection":"row","alignItems":"center"}}>
                            <MaterialIcons
                              name={isQuiz ? "star" : "auto-awesome"}
                              size={14}
                              color={isQuiz ? "#facc15" : "#60a5fa"}
                            />
                            <Text style={{ marginLeft: 4, fontSize: 10, fontWeight: "600", color: isQuiz ? "#fcd34d" : "#93c5fd" }}>
                              {isQuiz ? "+5 estrellas" : "+100 XP"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderColor: "#1f2937", backgroundColor: "#0d1117", paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom + 50, 12) }}>
        <View style={{"width":"100%","maxWidth":448,"alignSelf":"center","borderRadius":16,"borderWidth":1,"borderColor":"#60a5fa","backgroundColor":"#161b22","paddingHorizontal":16,"paddingVertical":12}}>
          <View style={{"flexDirection":"row","alignItems":"center","justifyContent":"space-between"}}>
            <View style={{"marginRight":12,"flex":1}}>
              <Text numberOfLines={1} style={{"fontSize":14,"fontWeight":"700","color":"#ffffff"}}>
                {activeCourseName}
              </Text>
              <Text style={{"fontSize":12,"color":"#9ca3af"}}>Nivel {pathId}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#93c5fd" }}>
              {summary.completed}/{modules.length} módulos
            </Text>
          </View>

          <View style={{"marginTop":8,"flexDirection":"row","alignItems":"center","justifyContent":"space-between"}}>
            <Text style={{"fontSize":16,"fontWeight":"700","color":"#ffffff"}}>Progreso</Text>
            <Text style={{ fontSize: 20, color: "#a5b4fc" }}>
              {progressPercent}%
            </Text>
          </View>
          <View style={{ marginTop: 4, height: 8, overflow: "hidden", borderRadius: 9999, backgroundColor: "#374151" }}>
            <View
              style={{ height: "100%", borderRadius: 9999, backgroundColor: "#60a5fa", width: `${progressPercent}%` }}
            />
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", borderTopWidth: 1, borderColor: "#374151", paddingTop: 8 }} >
            <View style={{"flex":1}}>
              <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: "800", marginBottom: 8, color: "#93c5fd" }}>Recursos por Obtener:</Text>
              <View style={{ width: "90%", flexDirection: "row", justifyContent: "space-around" }}>
                <View style={{"flex":1,"alignItems":"center"}}>
                  <View style={{"flexDirection":"row","alignItems":"center"}}>
                    <MaterialIcons name="auto-awesome" size={15} color="#60a5fa" />
                    <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: "700", color: "#d8b4fe" }}>
                      {summary.xp} XP
                    </Text>
                  </View>
                  <Text style={{"fontSize":10,"color":"#9ca3af"}}>XP</Text>
                </View>
                <View style={{"flex":1,"alignItems":"center"}}>
                  <View style={{"flexDirection":"row","alignItems":"center"}}>
                    <MaterialIcons name="star" size={15} color="#facc15" />
                    <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: "700", color: "#fde047" }}>
                      {summary.stars}
                    </Text>
                  </View>
                  <Text style={{"fontSize":10,"color":"#9ca3af"}}>estrellas</Text>
                </View>
              </View>

            </View>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", borderLeftWidth: 2, borderColor: "#a5b4fc" }}>
              <View style={{"flexDirection":"row","alignItems":"center"}}>
                <MaterialIcons name="quiz" size={15} color="#a78bfa" />
                <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: "700", color: "#d8b4fe" }}>
                  {summary.quizzes}
                </Text>
              </View>
              <Text style={{"fontSize":10,"color":"#9ca3af"}}>exámenes pendientes</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
