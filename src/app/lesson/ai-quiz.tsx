import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAiQuizStore } from "../../store/aiQuizStore";

export default function AiQuizScreen() {
  const {
    activeAiQuiz,
    currentIndex,
    earnedXP,
    isFinished,
    evaluateAnswer,
    nextAiQuestion,
    quitAiQuiz,
    finishAiQuiz,
  } = useAiQuizStore();

  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  if (!activeAiQuiz) {
    return (
      <View className="flex-1 bg-[#0d1117] items-center justify-center">
        <Text className="text-gray-400">Generando reto IA...</Text>
      </View>
    );
  }

  // --- VISTA DE FELICITACIONES ---
  if (isFinished) {
    return (
      <View
        key="finished-view"
        className="flex-1 bg-[#0d1117] items-center justify-center px-4"
      >
        <View className="items-center mb-10">
          <View className="w-32 h-32 bg-purple-500/20 rounded-full items-center justify-center mb-6 border-4 border-purple-500 shadow-lg shadow-purple-500/50">
            <MaterialIcons name="auto-awesome" size={64} color="#a855f7" />
          </View>
          <Text className="text-3xl font-bold text-white mb-2 text-center tracking-tight">
            ¡Reto Superado!
          </Text>
          <Text className="text-gray-400 text-center text-base mb-6">
            Concepto reforzado: {activeAiQuiz.weekConcept}
          </Text>

          <View className="bg-[#181c22] border border-gray-800 rounded-xl px-6 py-4 flex-row items-center">
            <MaterialIcons name="bolt" size={24} color="#a855f7" />
            <Text className="text-purple-400 font-bold text-lg ml-2">
              +{earnedXP} XP Recuperada
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="w-full max-w-sm bg-purple-600 active:bg-purple-700 rounded-xl py-4 flex-row items-center justify-center shadow-lg shadow-purple-500/30"
        >
          <Text className="text-white font-bold text-base mr-2">
            Volver al Dashboard
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </Pressable>
      </View>
    );
  }

  // --- VISTA DEL QUIZ ---
  const currentTopic = activeAiQuiz.topics[currentIndex];
  const isLastQuestion = currentIndex === activeAiQuiz.topics.length - 1;

  const handleExitAttempt = () => {
    Toast.show({
      type: "error",
      text1: "¡Oportunidad Única!",
      text2: "Si sales ahora, perderás la XP de este reto sorpresa.",
      position: "top",
    });

    Alert.alert(
      "¿Abandonar Reto IA?",
      "Este cuestionario está diseñado específicamente para tus áreas de mejora. Solo puedes intentarlo una vez.",
      [
        { text: "Continuar Reto", style: "cancel" },
        {
          text: "Abandonar",
          style: "destructive",
          onPress: () => {
            quitAiQuiz();
            router.back();
          },
        },
      ],
    );
  };

  const handleEvaluate = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentTopic.correctAnswer;
    evaluateAnswer(isCorrect, 25);
    setIsAnswered(true);
  };

  const handleNext = () => {
    // Liberamos el hilo principal un instante para que el Pressable termine su acción
    setTimeout(() => {
      if (isLastQuestion) {
        finishAiQuiz();
      } else {
        setSelectedOption(null);
        setIsAnswered(false);
        nextAiQuestion();
      }
    }, 50);
  };

  const handleMainAction = () => {
    if (!isAnswered) {
      if (selectedOption === null) return; // Reemplaza la propiedad 'disabled'
      handleEvaluate();
    } else {
      handleNext();
    }
  };

  return (
    <View key="quiz-view" className="flex-1 bg-[#0d1117]">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-purple-500/30 bg-[#0a0e14]">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="auto-awesome" size={20} color="#a855f7" />
          <Text className="text-purple-400 font-bold text-base">
            Flash Quiz IA
          </Text>
        </View>
        <Pressable
          onPress={handleExitAttempt}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-[#262a31]"
        >
          <MaterialIcons name="close" size={24} color="#f85149" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="w-full h-1 bg-[#262a31]">
          <View
            className="h-full bg-purple-500 shadow-md shadow-purple-500/50"
            style={{
              width: `${((currentIndex + 1) / activeAiQuiz.topics.length) * 100}%`,
            }}
          />
        </View>

        <View className="px-4 py-8 flex-1">
          <Text className="text-sm font-mono text-purple-400 mb-2 font-bold uppercase tracking-widest">
            {activeAiQuiz.message}
          </Text>

          <Text className="text-[22px] font-bold text-[#dfe2eb] tracking-tight mb-6 leading-8">
            {currentTopic.question}
          </Text>

          {activeAiQuiz.contentType === "code" && currentTopic.code && (
            <View className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 mb-6">
              <Text className="font-mono text-[#c2c6d6] leading-6">
                {currentTopic.code}
              </Text>
            </View>
          )}

          <View className="flex flex-col gap-4">
            {currentTopic.options.map((opcion) => {
              const isSelected = selectedOption === opcion.id;
              const isCorrect = opcion.id === currentTopic.correctAnswer;

              let cardBg = isSelected
                ? "bg-[#1c2026] border-purple-400"
                : "bg-[#181c22] border-[#424754]";
              let letterBg = isSelected ? "bg-purple-500" : "bg-[#262a31]";
              let letterText = isSelected
                ? "text-purple-950"
                : "text-[#c2c6d6]";

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
                  cardBg = "bg-[#181c22] border-[#424754] opacity-40";
                }
              }

              return (
                <Pressable
                  key={opcion.id}
                  onPress={() => !isAnswered && setSelectedOption(opcion.id)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl flex-row items-center border ${cardBg}`}
                >
                  <View
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border border-transparent mr-4 ${letterBg}`}
                  >
                    <Text
                      className={`font-mono text-xs font-bold ${letterText}`}
                    >
                      {opcion.id}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 text-base ${
                      isSelected ? "text-white font-bold" : "text-[#c2c6d6]"
                    }`}
                  >
                    {opcion.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isAnswered && (
            <View className="mt-8 p-4 rounded-lg bg-purple-900/10 border-l-4 border-purple-500">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="psychology" size={20} color="#a855f7" />
                <Text className="text-purple-400 font-bold ml-2">
                  Análisis de la IA
                </Text>
              </View>
              <Text className="text-[#c2c6d6] text-base leading-6">
                {currentTopic.explanation}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTONERA ESTÁTICA */}
      <View className="absolute bottom-0 w-full p-4 bg-[#10141a] border-t border-[#424754]/50 z-50">
        <Pressable
          onPress={handleMainAction}
          className="w-full py-4 rounded-xl flex-row items-center justify-center bg-purple-600 active:bg-purple-700"
        >
          <Text className="font-bold text-base text-white">
            {!isAnswered
              ? "Evaluar"
              : isLastQuestion
                ? "Completar Reto"
                : "Siguiente"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
