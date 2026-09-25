import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useCourseStore } from "../../store/courseStore";

export default function PathScreen() {
  const { activeCourseId, activeCourseName, lessons, isFetching, fetchPath } =
    useCourseStore();

  useEffect(() => {
    if (activeCourseId && lessons.length === 0) {
      fetchPath();
    }
  }, [activeCourseId]);

  // Pantalla de Restricción
  if (!activeCourseId) {
    return (
      <View className="flex-1 bg-[#0d1117] items-center justify-center px-4">
        <MaterialIcons
          name="alt-route"
          size={64}
          color="#374151"
          className="mb-4"
        />
        <Text className="text-xl font-bold text-white text-center mb-2">
          Aún no tienes una ruta
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          Ve a la pestaña Aprender y selecciona un lenguaje.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)" as any)}
          className="bg-blue-600 active:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
        >
          <Text className="text-white font-bold">Explorar lenguajes</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#0d1117]"
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    >
      <View className="w-full max-w-sm px-4 pt-10">
        {/* Título Dinámico */}
        <Text className="text-2xl font-bold text-white text-center mb-8 tracking-tight">
          Aprendiendo {activeCourseName}
        </Text>

        {isFetching ? (
          <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
        ) : (
          <View className="items-center w-full">
            {lessons.map((lesson, index) => {
              let borderCard = "border-gray-800";
              let borderCircle = "border-gray-700";
              let bgCircle = "bg-gray-800/50";
              let textTitle = "text-gray-500";
              let textNumber = "text-gray-500";
              let iconName: any = "lock";
              let iconColor = "#ef4444";

              if (lesson.state === "completed") {
                borderCard = "border-gray-700";
                borderCircle = "border-gray-600";
                bgCircle = "bg-gray-800";
                textTitle = "text-white";
                textNumber = "text-gray-400";
                iconName = "check-circle";
                iconColor = "#9ca3af";
              } else if (lesson.state === "in-progress") {
                borderCard = "border-blue-500";
                borderCircle = "border-blue-500";
                bgCircle = "bg-blue-500/20";
                textTitle = "text-blue-400";
                textNumber = "text-blue-500";
                iconName = "play-circle-filled";
                iconColor = "#3b82f6";
              }

              return (
                <View key={lesson.id} className="w-full items-center">
                  <Pressable
                    onPress={() => {
                      if (lesson.state !== "locked") {
                        // Enviamos el ID real de la ruta seleccionada
                        router.push(`/course/${lesson.id}` as any);
                      }
                    }}
                    className={`w-full flex-row items-center justify-between p-4 rounded-xl bg-[#181c22] border-2 ${borderCard} ${
                      lesson.state === "locked"
                        ? "opacity-70"
                        : "active:scale-95 transition-transform"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-10 h-10 rounded-full border-2 ${borderCircle} ${bgCircle} items-center justify-center mr-4`}
                      >
                        <Text
                          className={`font-mono text-xs font-bold ${textNumber}`}
                        >
                          {lesson.number}
                        </Text>
                      </View>
                      <Text className={`text-base font-bold ${textTitle}`}>
                        {lesson.title}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={iconName}
                      size={24}
                      color={iconColor}
                    />
                  </Pressable>

                  {index < lessons.length - 1 && (
                    <View className="w-[2px] h-8 bg-gray-700" />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
