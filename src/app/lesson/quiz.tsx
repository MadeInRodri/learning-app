import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
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
  const { modules, activeModuleId } = useModuleStore();
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
      <View className="flex-1 bg-[#0d1117] items-center justify-center">
        <Text className="text-gray-400">Cargando cuestionario...</Text>
      </View>
    );
  }

  // --- VISTA DE RESULTADOS (FIN DEL QUIZ) ---
  // Mantenemos tu estructura intacta de return temprano que funcionaba
  if (quizFinished) {
    return (
      <View className="flex-1 bg-[#0d1117] items-center justify-center px-4">
        <View className="items-center mb-10">
          <View
            className={`w-32 h-32 rounded-full items-center justify-center mb-6 border-4 shadow-lg ${
              isPassed
                ? "bg-yellow-500/20 border-yellow-500 shadow-yellow-500/50"
                : "bg-red-500/20 border-red-500 shadow-red-500/50"
            }`}
          >
            <MaterialIcons
              name={isPassed ? "emoji-events" : "sentiment-dissatisfied"}
              size={64}
              color={isPassed ? "#eab308" : "#ef4444"}
            />
          </View>
          <Text className="text-3xl font-bold text-white mb-2 tracking-tight text-center">
            {isPassed ? "¡Módulo Completado!" : "¡Examen Fallido!"}
          </Text>
          <Text className="text-gray-400 text-center text-base mb-6">
            {isPassed
              ? "Has demostrado tu conocimiento."
              : `Obtuviste un ${Math.round((correctAnswersCount / quizData.length) * 100)}%. Necesitas al menos 60% para aprobar.`}
          </Text>

          {isPassed && (
            <View className="bg-[#181c22] border border-gray-800 rounded-xl px-6 py-4 flex-row items-center">
              <MaterialIcons name="bolt" size={24} color="#3b82f6" />
              <Text className="text-blue-400 font-bold text-lg ml-2">
                +{earnedXP} XP Ganada
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => router.back()}
          className={`w-full max-w-sm rounded-xl py-4 flex-row items-center justify-center shadow-lg ${
            isPassed
              ? "bg-blue-600 active:bg-blue-700 shadow-blue-500/30"
              : "bg-red-600 active:bg-red-700 shadow-red-500/30"
          }`}
        >
          <Text className="text-white font-bold text-base mr-2">
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
        className="flex-1 bg-[#0d1117] items-center justify-center px-4"
      >
        <View className="items-center mb-10">
          <View
            className={`w-32 h-32 rounded-full items-center justify-center mb-6 border-4 shadow-lg ${
              isPassed
                ? "bg-yellow-500/20 border-yellow-500 shadow-yellow-500/50"
                : "bg-red-500/20 border-red-500 shadow-red-500/50"
            }`}
          >
            <MaterialIcons
              name={isPassed ? "emoji-events" : "sentiment-dissatisfied"}
              size={64}
              color={isPassed ? "#eab308" : "#ef4444"}
            />
          </View>
          <Text className="text-3xl font-bold text-white mb-2 tracking-tight text-center">
            {isPassed ? "¡Módulo Completado!" : "¡Examen Fallido!"}
          </Text>
          <Text className="text-gray-400 text-center text-base mb-6 px-4">
            {isPassed
              ? "Has demostrado tu conocimiento y desbloqueado la siguiente lección."
              : `Obtuviste un ${Math.round((correctAnswersCount / quizData.length) * 100)}%. Necesitas al menos un 60% para aprobar.`}
          </Text>

          {isPassed && (
            <View className="bg-[#181c22] border border-gray-800 rounded-xl px-6 py-4 flex-row items-center">
              <MaterialIcons name="bolt" size={24} color="#3b82f6" />
              <Text className="text-blue-400 font-bold text-lg ml-2">
                +{earnedXP} XP Ganada
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => router.back()}
          className={`w-full max-w-sm rounded-xl py-4 flex-row items-center justify-center shadow-lg ${
            isPassed
              ? "bg-blue-600 active:bg-blue-700 shadow-blue-500/30"
              : "bg-red-600 active:bg-red-700 shadow-red-500/30"
          }`}
        >
          <Text className="text-white font-bold text-base mr-2">
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
    <View key="quiz-view" className="flex-1 bg-[#0d1117]">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800 bg-[#0a0e14]">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-blue-900/20 items-center justify-center border border-blue-500/30">
            <Text className="text-blue-400 text-sm font-mono font-bold">
              {initials}
            </Text>
          </View>
          <View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">
              Experiencia
            </Text>
            <Text className="text-white font-bold text-base leading-none">
              {userXP} XP
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#161b22] border border-gray-800 items-center justify-center active:bg-[#262a31]"
        >
          <MaterialIcons name="close" size={20} color="#9ca3af" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="w-full h-1 bg-[#262a31]">
          <View
            className="h-full bg-[#ffb95f]"
            style={{
              width: `${((currentIndex + 1) / quizData.length) * 100}%`,
            }}
          />
        </View>

        <View className="px-4 py-3 border-b border-[#424754]/30 bg-[#0a0e14]">
          <Text className="font-mono text-xs text-[#ffb95f] uppercase tracking-widest font-bold">
            Pregunta {currentIndex + 1} de {quizData.length}
          </Text>
        </View>

        <View className="px-4 py-8 flex-1">
          <Text className="text-[24px] font-bold text-[#dfe2eb] tracking-tight mb-8 leading-9">
            {currentQuestion.pregunta}
          </Text>

          <View className="flex flex-col gap-4">
            {currentQuestion.opciones.map((opcion: any, index: number) => {
              const isSelected = selectedOption === index;
              const isCorrect = opcion.es_correcta;

              let cardBg = isSelected
                ? "bg-[#1c2026] border-[#adc6ff]"
                : "bg-[#181c22] border-[#424754]";
              let letterBg = isSelected ? "bg-[#4d8eff]" : "bg-[#262a31]";
              let letterText = isSelected ? "text-[#00285d]" : "text-[#c2c6d6]";

              if (isAnswered) {
                if (isCorrect) {
                  cardBg = "bg-emerald-900/20 border-emerald-500";
                  letterBg = "bg-emerald-500";
                  letterText = "text-emerald-900";
                } else if (isSelected && !isCorrect) {
                  cardBg = "bg-red-900/20 border-red-500";
                  letterBg = "bg-red-500";
                  letterText = "text-red-900";
                } else {
                  cardBg = "bg-[#181c22] border-[#424754] opacity-50";
                }
              }

              return (
                <Pressable
                  key={index}
                  onPress={() => !isAnswered && setSelectedOption(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl flex-row items-center border ${cardBg}`}
                >
                  <View
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border border-transparent mr-4 ${letterBg}`}
                  >
                    <Text
                      className={`font-mono text-xs font-bold ${letterText}`}
                    >
                      {["A", "B", "C", "D"][index]}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 text-base ${isSelected ? "text-[#dfe2eb] font-bold" : "text-[#c2c6d6]"}`}
                  >
                    {opcion.texto}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isAnswered && (
            <View className="mt-8 p-4 rounded-lg bg-[#161b22] border-l-4 border-blue-500">
              <Text className="text-white text-base leading-6">
                {currentQuestion.explicacion}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full p-4 bg-[#10141a] border-t border-[#424754]/50">
        {!isAnswered ? (
          <Pressable
            className={`w-full py-4 rounded-xl flex-row items-center justify-center ${
              selectedOption !== null
                ? "bg-[#adc6ff] active:bg-[#4d8eff]"
                : "bg-[#1c2026] opacity-50"
            }`}
            disabled={selectedOption === null || isProcessing}
            onPress={handleEvaluate}
          >
            <Text
              className={`font-bold text-base ${selectedOption !== null ? "text-[#002e6a]" : "text-[#8c909f]"}`}
            >
              Evaluar
            </Text>
          </Pressable>
        ) : (
          <Pressable
            className={`w-full py-4 rounded-xl flex-row items-center justify-center bg-emerald-500 active:bg-emerald-600 ${isProcessing ? "opacity-80" : ""}`}
            disabled={isProcessing}
            onPress={handleNext}
          >
            {isProcessing ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text className="font-bold text-base text-emerald-950">
                {isLastQuestion ? "Finalizar" : "Siguiente"}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
