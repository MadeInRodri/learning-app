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
      style={{"flex":1,"backgroundColor":"#0d1117"}}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Panel de Control */}
      <View style={{"paddingHorizontal":16,"marginTop":24}}>
        <Text style={{"color":"#9ca3af","fontFamily":"monospace","fontSize":12,"textTransform":"uppercase","marginBottom":16,"letterSpacing":1.5,"borderBottomWidth":1,"borderColor":"#30363d","paddingBottom":8}}>
          Panel de Transacciones
        </Text>
      </View>
    </ScrollView>
  );
}



