import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCourseStore } from "../../store/courseStore";
import { useModuleStore } from "../../store/moduleStore";
import { useQuizStore } from "../../store/quizStore";

export default function QuizScreen() {
  const { activeCourseId } = useCourseStore();
  const { modules, activeModuleId } = useModuleStore();

  const {
    activeQuiz,
    checkAndStartQuiz,
    forceStartQuiz,
    recordFailure,
    addXP,
    nextQuestion,
    finishQuiz,
    userXP,
  } = useQuizStore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0); // Para mostrar cuánta XP ganó en esta sesión

  // Extraemos el quiz real de la caché del módulo seleccionado
  const quizModule = useMemo(() => {
    return modules.find((m) => m.id === activeModuleId);
  }, [modules, activeModuleId]);

  // Aseguramos que el contenido sea un array (nuestras preguntas)
  const quizData = Array.isArray(quizModule?.content) ? quizModule.content : [];

  // Usaremos un pathId fijo por ahora, pero en el futuro puedes leerlo del courseStore
  const currentPathId = "1";

  useEffect(() => {
    if (!activeCourseId || quizData.length === 0) return;

    // Simplemente usamos checkAndStartQuiz para inicializarlo en 0
    // en caso de que haya entrado limpiamente sin conflictos.
    checkAndStartQuiz(activeCourseId, currentPathId);
  }, [activeCourseId, currentPathId, quizData]);

  // Pantalla de carga o error si no hay datos
  if (quizData.length === 0) {
    return (
      <View className="flex-1 bg-[#0d1117] items-center justify-center">
        <Text className="text-gray-400">Cargando cuestionario...</Text>
      </View>
    );
  }

  // --- VISTA DE FELICITACIONES (FIN DEL QUIZ) ---
  if (quizFinished) {
    return (
      <View className="flex-1 bg-[#0d1117] items-center justify-center px-4">
        <View className="items-center mb-10">
          <View className="w-32 h-32 bg-yellow-500/20 rounded-full items-center justify-center mb-6 border-4 border-yellow-500 shadow-lg shadow-yellow-500/50">
            <MaterialIcons name="emoji-events" size={64} color="#eab308" />
          </View>
          <Text className="text-3xl font-bold text-white mb-2 tracking-tight text-center">
            ¡Módulo Completado!
          </Text>
          <Text className="text-gray-400 text-center text-base mb-6">
            Has demostrado tu conocimiento.
          </Text>

          <View className="bg-[#181c22] border border-gray-800 rounded-xl px-6 py-4 flex-row items-center">
            <MaterialIcons name="bolt" size={24} color="#3b82f6" />
            <Text className="text-blue-400 font-bold text-lg ml-2">
              +{earnedXP} XP Ganada
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            // TODO: Aquí podrías disparar la petición al backend para actualizar el nivel del usuario
            router.back();
          }}
          className="w-full max-w-sm bg-blue-600 active:bg-blue-700 rounded-xl py-4 flex-row items-center justify-center shadow-lg shadow-blue-500/30"
        >
          <Text className="text-white font-bold text-base mr-2">
            Volver a la ruta
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
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
    } else {
      recordFailure(
        activeCourseId!,
        currentPathId,
        currentQuestion["id-question"] || currentIndex,
      );
    }

    setIsAnswered(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz();
      setQuizFinished(true); // Cambiamos a la vista de felicitaciones
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      nextQuestion();
    }
  };

  return (
    <View className="flex-1 bg-[#0d1117]">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-[#424754]/30 bg-[#0a0e14]">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-[#262a31] items-center justify-center border border-[#424754]">
            <Text className="text-gray-400 text-xs font-mono font-bold">
              MR
            </Text>
          </View>
          <Text className="text-white font-bold text-base">XP: {userXP}</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-[#262a31]"
        >
          <MaterialIcons name="close" size={24} color="#c2c6d6" />
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

          {/* Explicación (Aparece tras responder) */}
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
            disabled={selectedOption === null}
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
            className="w-full py-4 rounded-xl flex-row items-center justify-center bg-emerald-500 active:bg-emerald-600"
            onPress={handleNext}
          >
            <Text className="font-bold text-base text-emerald-950">
              {isLastQuestion ? "Finalizar" : "Siguiente"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
