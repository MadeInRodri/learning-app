// import React from "react";
// import { View, Text, Pressable, ScrollView } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import { router } from "expo-router";

// export default function PathScreen() {
//   // PA SIMULAR
//   const lessons = [
//     {
//       id: "1",
//       number: "01",
//       title: "Aprendiendo lo básico",
//       state: "completed",
//     },
//     { id: "2", number: "02", title: "Funciones en JS", state: "in-progress" },
//     { id: "3", number: "03", title: "Librerías", state: "locked" },
//     { id: "4", number: "04", title: "Proyectos Avanzados", state: "locked" },
//   ];

//   return (
//     <ScrollView
//       className="flex-1 bg-[#0d1117]"
//       contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
//     >
//       <View className="w-full max-w-sm px-4 pt-10">
//         {/* Título */}
//         <Text className="text-2xl font-bold text-white text-center mb-8 tracking-tight">
//           Aprendiendo JS
//         </Text>

//         {/* Árbol de Progreso*/}
//         <View className="items-center w-full">
//           {lessons.map((lesson, index) => {
//             // Variables por defecto (Estado: locked)
//             let borderCard = "border-gray-800";
//             let borderCircle = "border-gray-700";
//             let bgCircle = "bg-gray-800/50";
//             let textTitle = "text-gray-500";
//             let textNumber = "text-gray-500";
//             let iconName: any = "lock";
//             let iconColor = "#ef4444"; // red-500

//             // Estilos dinámicos para completado
//             if (lesson.state === "completed") {
//               borderCard = "border-gray-700";
//               borderCircle = "border-gray-600";
//               bgCircle = "bg-gray-800";
//               textTitle = "text-white";
//               textNumber = "text-gray-400";
//               iconName = "check-circle";
//               iconColor = "#9ca3af";
//             }
//             // Estilos dinámicos para en progreso [cite: 338, 393]
//             else if (lesson.state === "in-progress") {
//               borderCard = "border-blue-500";
//               borderCircle = "border-blue-500";
//               bgCircle = "bg-blue-500/20";
//               textTitle = "text-blue-400";
//               textNumber = "text-blue-500";
//               iconName = "play-circle-filled";
//               iconColor = "#3b82f6";
//             }

//             return (
//               <View key={lesson.id} className="w-full items-center">
//                 {/* Tarjeta del Nivel */}
//                 <Pressable
//                   onPress={() => {
//                     // Solo navegamos si no está bloqueada
//                     if (lesson.state !== "locked") {
//                       // Por ahora navegamos al interior de la lección
//                       router.push("/course/1" as any);
//                     }
//                   }}
//                   className={`w-full flex-row items-center justify-between p-4 rounded-xl bg-[#181c22] border-2 ${borderCard} ${
//                     lesson.state === "locked"
//                       ? "opacity-70"
//                       : "active:scale-95 transition-transform"
//                   }`}
//                 >
//                   <View className="flex-row items-center">
//                     {/* Círculo con el número */}
//                     <View
//                       className={`w-10 h-10 rounded-full border-2 ${borderCircle} ${bgCircle} items-center justify-center mr-4`}
//                     >
//                       <Text
//                         className={`font-mono text-xs font-bold ${textNumber}`}
//                       >
//                         {lesson.number}
//                       </Text>
//                     </View>

//                     {/* Título de la Lección */}
//                     <Text className={`text-base font-bold ${textTitle}`}>
//                       {lesson.title}
//                     </Text>
//                   </View>

//                   {/* Ícono de Estado */}
//                   <MaterialIcons name={iconName} size={24} color={iconColor} />
//                 </Pressable>

//                 {/* Línea conectora  */}
//                 {index < lessons.length - 1 && (
//                   <View className="w-[2px] h-8 bg-gray-700" />
//                 )}
//               </View>
//             );
//           })}
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

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
