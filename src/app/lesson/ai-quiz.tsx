import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
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
      <View
        style={{
          flex: 1,
          backgroundColor: "#0d1117",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#9ca3af" }}>Generando reto IA...</Text>
      </View>
    );
  }

  // --- VISTA DE FELICITACIONES ---
  if (isFinished) {
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
              backgroundColor: "#a855f7",
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              borderWidth: 4,
              borderColor: "#a855f7",
            }}
          >
            <MaterialIcons name="auto-awesome" size={64} color="#fff" />
          </View>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: 8,
              textAlign: "center",
              letterSpacing: -0.25,
            }}
          >
            ¡Reto Superado!
          </Text>
          <Text
            style={{
              color: "#9ca3af",
              textAlign: "center",
              fontSize: 16,
              marginBottom: 24,
            }}
          >
            Concepto reforzado: {activeAiQuiz.weekConcept}
          </Text>

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
            <MaterialIcons name="bolt" size={24} color="#a855f7" />
            <Text
              style={{
                color: "#c084fc",
                fontWeight: "700",
                fontSize: 18,
                marginLeft: 8,
              }}
            >
              +{earnedXP} XP Recuperada
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.back()}
          style={{
            width: "100%",
            maxWidth: 384,
            backgroundColor: "#9333ea",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              fontWeight: "700",
              fontSize: 16,
              marginRight: 8,
            }}
          >
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
    <View key="quiz-view" style={{ flex: 1, backgroundColor: "#0d1117" }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 48,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderColor: "#a855f7",
          backgroundColor: "#0a0e14",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialIcons name="auto-awesome" size={20} color="#a855f7" />
          <Text style={{ color: "#c084fc", fontWeight: "700", fontSize: 16 }}>
            Flash Quiz IA
          </Text>
        </View>
        <Pressable
          onPress={handleExitAttempt}
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="close" size={24} color="#f85149" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={{ width: "100%", height: 4, backgroundColor: "#262a31" }}>
          <View
            style={{
              height: "100%",
              backgroundColor: "#a855f7",
              width: `${((currentIndex + 1) / activeAiQuiz.topics.length) * 100}%`,
            }}
          />
        </View>

        <View style={{ paddingHorizontal: 16, paddingVertical: 32, flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "monospace",
              color: "#c084fc",
              marginBottom: 8,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            {activeAiQuiz.message}
          </Text>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#dfe2eb",
              letterSpacing: -0.25,
              marginBottom: 24,
              lineHeight: 32,
            }}
          >
            {currentTopic.question}
          </Text>

          {activeAiQuiz.contentType === "code" && currentTopic.code && (
            <View
              style={{
                backgroundColor: "#161b22",
                borderWidth: 1,
                borderColor: "#30363d",
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: "monospace",
                  color: "#c2c6d6",
                  lineHeight: 24,
                }}
              >
                {currentTopic.code}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "column", gap: 16 }}>
            {currentTopic.options.map((opcion) => {
              const isSelected = selectedOption === opcion.id;
              const isCorrect = opcion.id === currentTopic.correctAnswer;

              let cardBg: ViewStyle = isSelected
                ? { backgroundColor: "#1c2026", borderColor: "#c084fc" }
                : { backgroundColor: "#181c22", borderColor: "#424754" };
              let letterBg: ViewStyle = isSelected
                ? { backgroundColor: "#a855f7" }
                : { backgroundColor: "#262a31" };
              let letterText: TextStyle = isSelected
                ? { color: "#581c87" }
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
                  key={opcion.id}
                  onPress={() => !isAnswered && setSelectedOption(opcion.id)}
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
                      {opcion.id}
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: isSelected ? "#ffffff" : "#c2c6d6",
                      fontWeight: isSelected ? "700" : "400",
                    }}
                  >
                    {opcion.description}
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
                backgroundColor: "#581c87",
                borderLeftWidth: 4,
                borderColor: "#a855f7",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <MaterialIcons name="psychology" size={20} color="#a855f7" />
                <Text
                  style={{ color: "#c084fc", fontWeight: "700", marginLeft: 8 }}
                >
                  Análisis de la IA
                </Text>
              </View>
              <Text style={{ color: "#c2c6d6", fontSize: 16, lineHeight: 24 }}>
                {currentTopic.explanation}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTONERA ESTÁTICA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: 16,
          backgroundColor: "#10141a",
          borderTopWidth: 1,
          borderColor: "#424754",
          zIndex: 50,
        }}
      >
        <Pressable
          onPress={handleMainAction}
          style={{
            width: "100%",
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#9333ea",
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16, color: "#ffffff" }}>
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
