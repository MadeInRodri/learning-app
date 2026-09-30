import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Toast from "react-native-toast-message";

import { useAiQuizStore } from "../../store/aiQuizStore";
import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";
import { useModuleStore } from "../../store/moduleStore";
import { useProgressStore } from "../../store/progressStore";
import { useQuizStore } from "../../store/quizStore";

export default function QuizScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();
  const { activeCourseId, activeCourseName } = useCourseStore();
  const { modules, activeModuleId, completeModule } = useModuleStore();
  const { completeExam, passModule } = useProgressStore();
  const { updateGamificationStats, activeUser } = useAuthStore();
  const { startAiQuiz } = useAiQuizStore();

  const {
    activeQuiz,
    checkAndStartQuiz,
    recordFailure,
    addXP,
    nextQuestion,
    finishQuiz,
    userXP,
  } = useQuizStore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Estados del quiz
  const [earnedXP, setEarnedXP] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [failedTopicsTexts, setFailedTopicsTexts] = useState<string[]>([]);
  const [isPassed, setIsPassed] = useState(false);

  // Para las iniciales del encabezado, solo visual
  const initials = activeUser?.nombre
    ? activeUser.nombre.substring(0, 2).toUpperCase()
    : "US";

  const quizModule = useMemo(() => {
    return modules.find((m) => m.id === activeModuleId);
  }, [modules, activeModuleId]);

  //Traemos la data del quiz
  const quizData = Array.isArray(quizModule?.content) ? quizModule.content : [];
  const currentPathId = pathId || "1";

  useEffect(() => {
    if (!activeCourseId || quizData.length === 0) return;
    checkAndStartQuiz(activeCourseId, currentPathId);
  }, [activeCourseId, currentPathId, quizData]);

  if (quizData.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0d1117",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#9ca3af" }}>Cargando cuestionario...</Text>
      </View>
    );
  }

  // --- VISTA DE RESULTADOS (FIN DEL QUIZ) ---
  // Mantenemos tu estructura intacta de return temprano que funcionaba
  if (quizFinished) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0d1117",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 128,
              height: 128,
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              borderWidth: 4,
              backgroundColor: isPassed ? "#eab308" : "#ef4444",
              borderColor: isPassed ? "#eab308" : "#ef4444",
            }}
          >
            <MaterialIcons
              name={isPassed ? "emoji-events" : "sentiment-dissatisfied"}
              size={64}
              color={isPassed ? "#fff" : "#fff"}
            />
          </View>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: 8,
              letterSpacing: -0.25,
              textAlign: "center",
            }}
          >
            {isPassed ? "¡Módulo Completado!" : "¡Examen Fallido!"}
          </Text>
          <Text
            style={{
              color: "#9ca3af",
              textAlign: "center",
              fontSize: 16,
              marginBottom: 24,
            }}
          >
            {isPassed
              ? "Has demostrado tu conocimiento."
              : `Obtuviste un ${Math.round((correctAnswersCount / quizData.length) * 100)}%. Necesitas al menos 60% para aprobar.`}
          </Text>

          {isPassed && (
            <View
              style={{
                backgroundColor: "#181c22",
                borderWidth: 1,
                borderColor: "#1f2937",
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="bolt" size={24} color="#3b82f6" />
              <Text
                style={{
                  color: "#60a5fa",
                  fontWeight: "700",
                  fontSize: 18,
                  marginLeft: 8,
                }}
              >
                +{earnedXP} XP Ganada
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() =>
            setTimeout(() => {
              router.back();
            }, 50)
          }
          style={({ pressed }) => ({
            width: "100%",
            maxWidth: 384,
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isPassed
              ? pressed
                ? "#1d4ed8"
                : "#2563eb"
              : pressed
                ? "#b91c1c"
                : "#dc2626",
          })}
        >
          <Text
            style={{
              color: "#ffffff",
              fontWeight: "700",
              fontSize: 16,
              marginRight: 8,
            }}
          >
            {isPassed ? "Volver a la ruta" : "Regresar y estudiar"}
          </Text>
          <MaterialIcons
            name={isPassed ? "arrow-forward" : "replay"}
            size={20}
            color="white"
          />
        </Pressable>
      </View>
    );
  }

  // --- VISTA INTERACTIVA DEL QUIZ ---
  const currentIndex = activeQuiz?.currentIndex || 0;
  const currentQuestion = quizData[currentIndex];
  const isLastQuestion = currentIndex === quizData.length - 1;

  const handleEvaluate = () => {
    if (selectedOption === null) return;

    const isCorrect = currentQuestion.opciones[selectedOption].es_correcta;

    if (isCorrect) {
      addXP(10);
      setEarnedXP((prev) => prev + 10);
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      recordFailure(
        activeCourseId!,
        currentPathId,
        currentQuestion["id-question"] || currentIndex,
      );
      setFailedTopicsTexts((prev) => [...prev, currentQuestion.pregunta]);
    }

    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setIsProcessing(true);

      const totalQuestions = quizData.length;
      const finalPercentage =
        totalQuestions > 0 ? correctAnswersCount / totalQuestions : 0;
      const passed = finalPercentage >= 0.6;

      setIsPassed(passed);

      try {
        // 1. SIEMPRE enviamos el resultado del examen (aprobado o reprobado) para el historial
        const aiQuizPayload = await completeExam(
          activeCourseId!,
          currentPathId,
          activeModuleId!,
          modules.length,
          {
            percentage: Number(finalPercentage.toFixed(2)),
            titleExam: quizModule?.title || "Examen de Módulo",
            totalErrors: failedTopicsTexts.length,
            topicsHasError:
              failedTopicsTexts.length > 0
                ? JSON.stringify(failedTopicsTexts)
                : "[]",
            hasErrors: failedTopicsTexts.length > 0,
          },
        );

        // 2. SOLO SI APROBÓ, llamamos a passModule para abrir el siguiente nivel y damos XP
        if (passed) {
          await passModule(
            activeCourseId!,
            currentPathId, // <-- Corregido
            activeModuleId!,
            quizModule?.title || "Examen de Módulo",
            modules.length,
            activeCourseName, // <-- Corregido
          );
          completeModule(activeModuleId!);
          updateGamificationStats(earnedXP, 0);
        }

        finishQuiz();

        // 3. Verificamos el Reto IA
        if (
          aiQuizPayload &&
          aiQuizPayload.topics &&
          aiQuizPayload.topics.length > 0
        ) {
          startAiQuiz(aiQuizPayload);
          Toast.show({
            type: "info",
            text1: "¡Reto Sorpresa Detectado! 🤖",
            text2: "La IA ha analizado tus respuestas...",
          });
          router.replace("/lesson/ai-quiz" as any);
        } else {
          setQuizFinished(true);
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error guardando resultados",
          text2: "Revisa tu conexión e intenta de nuevo.",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      nextQuestion();
    }
  };

  if (quizFinished) {
    return (
      <View
        key="finished-view"
        style={{
          flex: 1,
          backgroundColor: "#0d1117",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 128,
              height: 128,
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              borderWidth: 4,
              backgroundColor: isPassed ? "#eab308" : "#ef4444",
              borderColor: isPassed ? "#eab308" : "#ef4444",
            }}
          >
            <MaterialIcons
              name={isPassed ? "emoji-events" : "sentiment-dissatisfied"}
              size={64}
              color={isPassed ? "#eab308" : "#ef4444"}
            />
          </View>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: 8,
              letterSpacing: -0.25,
              textAlign: "center",
            }}
          >
            {isPassed ? "¡Módulo Completado!" : "¡Examen Fallido!"}
          </Text>
          <Text
            style={{
              color: "#9ca3af",
              textAlign: "center",
              fontSize: 16,
              marginBottom: 24,
              paddingHorizontal: 16,
            }}
          >
            {isPassed
              ? "Has demostrado tu conocimiento y desbloqueado la siguiente lección."
              : `Obtuviste un ${Math.round((correctAnswersCount / quizData.length) * 100)}%. Necesitas al menos un 60% para aprobar.`}
          </Text>

          {isPassed && (
            <View
              style={{
                backgroundColor: "#181c22",
                borderWidth: 1,
                borderColor: "#1f2937",
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="bolt" size={24} color="#3b82f6" />
              <Text
                style={{
                  color: "#60a5fa",
                  fontWeight: "700",
                  fontSize: 18,
                  marginLeft: 8,
                }}
              >
                +{earnedXP} XP Ganada
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() =>
            setTimeout(() => {
              router.back();
            }, 50)
          }
          style={({ pressed }) => ({
            width: "100%",
            maxWidth: 384,
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isPassed
              ? pressed
                ? "#1d4ed8"
                : "#2563eb"
              : pressed
                ? "#b91c1c"
                : "#dc2626",
          })}
        >
          <Text
            style={{
              color: "#ffffff",
              fontWeight: "700",
              fontSize: 16,
              marginRight: 8,
            }}
          >
            {isPassed ? "Volver a la ruta" : "Regresar y estudiar"}
          </Text>
          <MaterialIcons
            name={isPassed ? "arrow-forward" : "replay"}
            size={20}
            color="white"
          />
        </Pressable>
      </View>
    );
  }

  // --- VISTA INTERACTIVA DEL QUIZ ---
  return (
    <View key="quiz-view" style={{ flex: 1, backgroundColor: "#0d1117" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 48,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderColor: "#1f2937",
          backgroundColor: "#0a0e14",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              backgroundColor: "#1e3a8a",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#3b82f6",
            }}
          >
            <Text
              style={{
                color: "#60a5fa",
                fontSize: 14,
                fontFamily: "monospace",
                fontWeight: "700",
              }}
            >
              {initials}
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 2,
              }}
            >
              Experiencia
            </Text>
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "700",
                fontSize: 16,
                lineHeight: 14,
              }}
            >
              {userXP} XP
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            setTimeout(() => {
              router.back();
            }, 50)
          }
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            backgroundColor: "#161b22",
            borderWidth: 1,
            borderColor: "#1f2937",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="close" size={20} color="#9ca3af" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ width: "100%", height: 4, backgroundColor: "#262a31" }}>
          <View
            style={{
              height: "100%",
              backgroundColor: "#ffb95f",
              width: `${((currentIndex + 1) / quizData.length) * 100}%`,
            }}
          />
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: "#424754",
            backgroundColor: "#0a0e14",
          }}
        >
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#ffb95f",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontWeight: "700",
            }}
          >
            Pregunta {currentIndex + 1} de {quizData.length}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingVertical: 32, flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#dfe2eb",
              letterSpacing: -0.25,
              marginBottom: 32,
              lineHeight: 36,
            }}
          >
            {currentQuestion.pregunta}
          </Text>

          <View style={{ flexDirection: "column", gap: 16 }}>
            {currentQuestion.opciones.map((opcion: any, index: number) => {
              const isSelected = selectedOption === index;
              const isCorrect = opcion.es_correcta;

              let cardBg: ViewStyle = isSelected
                ? { backgroundColor: "#1c2026", borderColor: "#adc6ff" }
                : { backgroundColor: "#181c22", borderColor: "#424754" };
              let letterBg: ViewStyle = isSelected
                ? { backgroundColor: "#4d8eff" }
                : { backgroundColor: "#262a31" };
              let letterText: TextStyle = isSelected
                ? { color: "#00285d" }
                : { color: "#c2c6d6" };

              if (isAnswered) {
                if (isCorrect) {
                  cardBg = {
                    backgroundColor: "#064e3b",
                    borderColor: "#10b981",
                  };
                  letterBg = { backgroundColor: "#10b981" };
                  letterText = { color: "#022c22" };
                } else if (isSelected && !isCorrect) {
                  cardBg = {
                    backgroundColor: "#7f1d1d",
                    borderColor: "#ef4444",
                  };
                  letterBg = { backgroundColor: "#ef4444" };
                  letterText = { color: "#7f1d1d" };
                } else {
                  cardBg = {
                    backgroundColor: "#181c22",
                    borderColor: "#424754",
                  };
                }
              }

              return (
                <Pressable
                  key={index}
                  onPress={() => !isAnswered && setSelectedOption(index)}
                  disabled={isAnswered}
                  style={[
                    {
                      width: "100%",
                      padding: 16,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                    },
                    cardBg,
                  ]}
                >
                  <View
                    style={[
                      {
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 16,
                      },
                      letterBg,
                    ]}
                  >
                    <Text
                      style={[
                        {
                          fontFamily: "monospace",
                          fontSize: 12,
                          fontWeight: "700",
                        },
                        letterText,
                      ]}
                    >
                      {["A", "B", "C", "D"][index]}
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: isSelected ? "#dfe2eb" : "#c2c6d6",
                      fontWeight: isSelected ? "700" : "400",
                    }}
                  >
                    {opcion.texto}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isAnswered && (
            <View
              style={{
                marginTop: 32,
                padding: 16,
                borderRadius: 8,
                backgroundColor: "#161b22",
                borderLeftWidth: 4,
                borderColor: "#3b82f6",
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: 16, lineHeight: 24 }}>
                {currentQuestion.explicacion}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: 16,
          backgroundColor: "#10141a",
          borderTopWidth: 1,
          borderColor: "#424754",
          marginBottom: 48,
        }}
      >
        {!isAnswered ? (
          <Pressable
            style={({ pressed }) => ({
              width: "100%",
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                selectedOption !== null
                  ? pressed
                    ? "#4d8eff"
                    : "#adc6ff"
                  : "#1c2026",
            })}
            disabled={selectedOption === null || isProcessing}
            onPress={handleEvaluate}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 16,
                color: selectedOption !== null ? "#002e6a" : "#8c909f",
              }}
            >
              Evaluar
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={{
              width: "100%",
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#10b981",
            }}
            disabled={isProcessing}
            onPress={handleNext}
          >
            {isProcessing ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={{ fontWeight: "700", fontSize: 16 }}>
                {isLastQuestion ? "Finalizar" : "Siguiente"}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
