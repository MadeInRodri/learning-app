import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { ToastConfig } from "react-native-toast-message";

export const customToastConfig: ToastConfig = {
  success: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-[#181c22] border border-[#30363d] border-l-4 border-l-emerald-500 rounded-xl shadow-lg w-[90%] p-4"
    >
      <MaterialIcons name="check-circle" size={24} color="#10b981" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-sm font-mono">{text1}</Text>
        {text2 && <Text className="text-gray-400 text-xs mt-0.5">{text2}</Text>}
      </View>
    </Pressable>
  ),

  error: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-[#181c22] border border-[#30363d] border-l-4 border-l-[#f85149] rounded-xl shadow-lg w-[90%] p-4 active:opacity-70 transition-opacity"
    >
      <MaterialIcons name="error-outline" size={24} color="#f85149" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-sm font-mono">{text1}</Text>
        {text2 && <Text className="text-gray-400 text-xs mt-0.5">{text2}</Text>}
      </View>
    </Pressable>
  ),

  info: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-[#181c22] border border-[#30363d] border-l-4 border-l-[#3b82f6] rounded-xl shadow-lg w-[90%] p-4"
    >
      <MaterialIcons name="info-outline" size={24} color="#3b82f6" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-sm font-mono">{text1}</Text>
        {text2 && <Text className="text-gray-400 text-xs mt-0.5">{text2}</Text>}
      </View>
    </Pressable>
  ),
};
