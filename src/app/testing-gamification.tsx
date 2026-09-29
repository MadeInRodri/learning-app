//VISTA DEPRECADA, NO SE USA PARA NADA
import { ScrollView, Text, View } from "react-native";

export default function TestGamificationScreen() {
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
