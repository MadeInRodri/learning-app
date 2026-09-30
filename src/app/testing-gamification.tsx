//VISTA DEPRECADA, NO SE USA PARA NADA
import { fetchMockAiQuiz } from "@/services/mockAiQuizApi";
import { useAiQuizStore } from "@/store/aiQuizStore";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function TestGamificationScreen() {

  const {startAiQuiz} = useAiQuizStore();

  const handleTriggerAiQuiz = async () => {
    try {
      Toast.show({
        type: "info",
        text1: "Analizando progreso...",
        text2: "La IA está generando tu reto personalizado.",
      });

      // 1. Llamamos a la API falsa
      const response = await fetchMockAiQuiz();

      if (!response.error) {
        // 2. Cargamos la data en el store temporal
        startAiQuiz(response.payload);

        // 3. Ocultamos el toast de carga y redirigimos a la vista express
        Toast.hide();
        router.push("/lesson/ai-quiz" as any);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error de conexión",
        text2: "No se pudo contactar a la IA.",
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0d1117]"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Panel de Control */}
      <View className="px-4 mt-6">
        <Text className="text-gray-400 font-mono text-xs uppercase mb-4 tracking-widest border-b border-[#30363d] pb-2">
          Panel de Transacciones
        </Text>
      </View>
    </ScrollView>
  );
}



