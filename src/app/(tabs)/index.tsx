// import { View, Text, Pressable } from "react-native";
// import { router } from "expo-router";

// export default function LearnScreen() {
//   // ARREGLO DE PRUEBA
//   const languages = [
//     { id: "python", name: "Python" },
//     { id: "js", name: "JS" },
//     { id: "react", name: "React" },
//     { id: "php", name: "PHP" },
//   ];

//   return (
//     <View className="flex-1 bg-[#0d1117] items-center">
//       <View className="w-full max-w-md px-4 pt-10">
//         {/* Títulos */}
//         <View className="items-center mb-10">
//           <Text className="text-2xl font-bold text-white mb-2 tracking-tight">
//             Lenguajes disponibles
//           </Text>
//           <Text className="text-gray-400 text-sm">
//             Selecciona tu ruta de aprendizaje
//           </Text>
//         </View>

//         {/* Grid */}
//         <View className="flex-row flex-wrap justify-between">
//           {languages.map((lang) => (
//             <Pressable
//               key={lang.id}
//               // Navegación a la pantalla de ruta (NO LISTO)
//               onPress={() => router.push("/(tabs)/path" as any)}
//               className="w-[47%] aspect-square bg-[#181c22] border border-gray-800 rounded-xl items-center justify-center mb-4 active:bg-gray-800 active:scale-95 transition-transform"
//             >
//               <Text className="text-white text-xl font-bold mb-3">
//                 {lang.name}
//               </Text>
//               <View className="w-8 h-1 rounded-full bg-gray-600" />
//             </Pressable>
//           ))}
//         </View>
//       </View>
//     </View>
//   );
// }

import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useLanguageStore } from "../../store/languageStore";

export default function LearnScreen() {
  const { languages, isFetching, fetchLanguages } = useLanguageStore();

  useEffect(() => {
    fetchLanguages();
  }, []);

  return (
    <View className="flex-1 bg-[#0d1117] items-center">
      <View className="w-full max-w-md px-4 pt-10">
        <View className="items-center mb-10">
          <Text className="text-2xl font-bold text-white mb-2 tracking-tight">
            Lenguajes disponibles
          </Text>
          <Text className="text-gray-400 text-sm">
            Selecciona tu ruta de aprendizaje
          </Text>
        </View>

        {/* Si no hay caché y está cargando, mostramos un spinner */}
        {isFetching && languages.length === 0 ? (
          <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {languages.map((lang) => (
              <Pressable
                key={lang.id}
                // Pasamos el ID del lenguaje como parámetro en la ruta
                onPress={() =>
                  router.push(`/(tabs)/path?lang=${lang.id}` as any)
                }
                className="w-[47%] aspect-square bg-[#181c22] border border-gray-800 rounded-xl items-center justify-center mb-4 active:bg-gray-800 active:scale-95 transition-transform"
              >
                <Text className="text-white text-xl font-bold mb-3">
                  {lang.language}
                </Text>
                <View className="w-8 h-1 rounded-full bg-gray-600" />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
