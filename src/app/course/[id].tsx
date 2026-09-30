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
    <View key="course-view" className="flex-1 bg-[#0d1117]">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800 bg-[#0d1117]">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#181c22] border border-gray-700 items-center justify-center active:bg-gray-700 "
        >
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>

        <Text className="text-white font-bold text-lg">
          Ruta de Aprendizaje
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", paddingBottom: 32 }}
      >
        <View className="w-full max-w-md px-4 pt-8">
          <View className="items-center mb-10">
            <Text className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
              {activeCourseName} - Nivel {pathId}
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              Continúa tu ruta de aprendizaje
            </Text>
          </View>

          {isFetching && modules.length === 0 ? (
            <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
          ) : (
            <View className="relative w-full py-4">
              {/* 1. Línea Central Vertical con z-0 */}
              <View className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gray-700 -translate-x-[1px] z-0" />

              {modules.map((mod, index) => {
                const isLeft = index % 2 === 0;
                const isQuiz = mod.type === "quiz";
                const isActiveQuiz =
                  isQuiz &&
                  activeQuiz?.languageId === activeCourseId &&
                  activeQuiz?.pathId === pathId;

                let cardStyle = "border-gray-800";
                let dotStyle = "border-gray-700 bg-[#161b22]";
                let titleStyle = "text-gray-500";
                let subtitleStyle = "text-gray-600";
                let iconColor = "#6b7280";
                let iconName: any = "lock";

                if (mod.state === "completed") {
                  cardStyle = isLeft
                    ? "border-emerald-500 border-r-4"
                    : "border-emerald-500 border-l-4";
                  dotStyle = "border-emerald-500 bg-[#161b22]";
                  titleStyle = "text-white";
                  subtitleStyle = "text-gray-400";
                  iconColor = "#10b981";
                  iconName = "check";
                } else if (mod.state === "in-progress") {
                  cardStyle = isLeft
                    ? "border-blue-400 border-r-4"
                    : "border-blue-400 border-l-4";
                  dotStyle =
                    "border-blue-400 bg-blue-900";
                  titleStyle = "text-blue-400";
                  subtitleStyle = "text-gray-400";
                  iconColor = "#60a5fa";
                  iconName = "play-arrow";
                } else if (isQuiz) {
                  cardStyle =
                    "border-gray-700 border-dashed bg-[#1c2026]";
                  dotStyle = "border-gray-700 border-dashed bg-[#1c2026]";
                  iconName = "emoji-events";
                }

                const baseCardClasses = `p-4 bg-[#161b22] rounded-xl border ${mod.state !== "locked" ? "active:scale-95" : ""
                  }`;

                return (
                  <View
                    key={mod.id}
                    className="flex-row w-full mb-8 relative items-center z-10"
                  >
                    <View
                      className={`absolute left-1/2 w-8 h-8 rounded-full border-2 items-center justify-center z-20 -translate-x-4 ${dotStyle}`}
                    >
                      <MaterialIcons
                        name={iconName}
                        size={16}
                        color={iconColor}
                      />
                    </View>

                    <Pressable
                      className={`w-1/2 ${isLeft ? "mr-auto pr-8" : "ml-auto pl-8"}`}
                      onPress={() => handleModulePress(mod)}
                    >
                      <View className={`${baseCardClasses} ${cardStyle}`}>
                        <View className="flex-row items-center justify-between">
                          <Text
                            className={`flex-1 text-base font-bold mb-1 ${titleStyle}`}
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
                        <Text className={`text-xs ${subtitleStyle}`}>
                          {mod.subtitle}
                        </Text>
                        {isActiveQuiz && (
                          <Text className="mt-1 text-[9px] font-bold tracking-wider text-amber-400">
                            EXAMEN EN CURSO
                          </Text>
                        )}
                        <View className="mt-3 flex-row flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-700 pt-2">
                          <View className="flex-row items-center">
                            <MaterialIcons
                              name="bolt"
                              size={14}
                              color="#fbbf24"
                            />
                            <Text className="ml-1 text-[10px] font-semibold text-amber-300">
                              -20 energía
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <MaterialIcons
                              name={isQuiz ? "star" : "auto-awesome"}
                              size={14}
                              color={isQuiz ? "#facc15" : "#60a5fa"}
                            />
                            <Text
                              className={`ml-1 text-[10px] font-semibold ${isQuiz ? "text-yellow-300" : "text-blue-300"}`}
                            >
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

      <View
        className="border-t border-gray-800 bg-[#0d1117] px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom + 50, 12), }}
      >
        <View className="w-full max-w-md self-center rounded-2xl border border-blue-400 bg-[#161b22] px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="mr-3 flex-1">
              <Text numberOfLines={1} className="text-sm font-bold text-white">
                {activeCourseName}
              </Text>
              <Text className="text-xs text-gray-400">Nivel {pathId}</Text>
            </View>
            <Text className="text-xs font-semibold text-blue-300">
              {summary.completed}/{modules.length} módulos
            </Text>
          </View>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-base font-bold text-white">Progreso</Text>
            <Text className="text-xl font-extrabold text-blue-300">
              {progressPercent}%
            </Text>
          </View>
          <View className="mt-1 h-2 overflow-hidden rounded-full bg-gray-700">
            <View
              className="h-full rounded-full bg-blue-400"
              style={{ width: `${progressPercent}%` }}
            />
          </View>

          <View className="mt-3 flex-row border-t border-gray-700 pt-2" >
            <View className="flex-1 ">
              <Text className="ml-1 text-sm font-bold text-indigo-300 mb-2">Recursos por Obtener:</Text>
              <View className="w-[90%]  flex flex-row justify-around">
                <View className="flex-1 items-center">
                  <View className="flex-row items-center">
                    <MaterialIcons name="auto-awesome" size={15} color="#60a5fa" />
                    <Text className="ml-1 text-sm font-bold text-blue-300">
                      {summary.xp} XP
                    </Text>
                  </View>
                  <Text className="text-[10px] text-gray-400">XP</Text>
                </View>
                <View className="flex-1 items-center">
                  <View className="flex-row items-center">
                    <MaterialIcons name="star" size={15} color="#facc15" />
                    <Text className="ml-1 text-sm font-bold text-yellow-300">
                      {summary.stars}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-gray-400">estrellas</Text>
                </View>
              </View>

            </View>
            <View className="flex-1 items-center justify-center border-l-2 border-indigo-300">
              <View className="flex-row items-center">
                <MaterialIcons name="quiz" size={15} color="#a78bfa" />
                <Text className="ml-1 text-sm font-bold text-purple-300">
                  {summary.quizzes}
                </Text>
              </View>
              <Text className="text-[10px] text-gray-400">exámenes pendientes</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
