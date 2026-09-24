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

import GamifiedHeader from "@/components/GamifiedHeader";
import { useCourseStore } from "@/store/courseStore";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useLanguageStore } from "../../store/languageStore";

export default function LearnScreen() {
  const { languages, isFetching, fetchLanguages } = useLanguageStore();

  useEffect(() => {
    fetchLanguages();
  }, []);

  // -- course---

  //CUANDO SE REGISTRE UN CURSO POR PRIMERA VEZ
  //await api.get(`/course/${idCourse}/register`, {params: { id:5}});

  //PARA CUANDO PASE UN MODULO
  //await api.post(`/course/${idCourse}/pass_module`)
  // en el body me mandaras:
  // percentage -->Avance del curso hasta este momento, userId, passedModule --> El nombre del modulo pasado, courseTitle
  // VAS A RECIBIR EL QUIZ DE LA IA, PUEDE QUE SI Y PUEDE QUE NO

  //PARA CUANDO COMPLETES UN EXAMEN
  //await api.post(`/course/${idCourse}/exam_complete`, {params: { id:5}})
  // En el body me mandaras: 
  // const {percentage, titleExam, totalErrors -->Cantidad de errores numericamente, topicsHasError --> Un array de strings donde encadenes el ENUNCIADO del error, hasErrors --> Booleano para identificar si hubo un error.}

  //PARA CUANDO FINALICE UN CURSO
  //courseRoutes.post("/:course/finish", authMiddleware, CourseController.finishCourse); es esta la ruta pero creo que esta deprecado, pq esto ya lo hacen las demas rutas xd.


  // --- GAMIFICATION ---- 

  //PARA OBTENER LAS RECOMPENSAS QUE TENGO EN MI BACKEND
  //await api.get("/game/rewards_catalogo"); y ya

  //PARA REGISTRAR RACHA
  //await api.get("/game/strike", {params: {id: 5, date: "FECHA EN FORMATO CORRECTO. VER BACKEND PARA SABER EL FORMATO. new Date()"}})


  //PARA REGISTRAR UNA RECOMPENSA EN CATALOGO!!!!!!!!! OJO! EN CATALOGO!!!
  //await api.post("/game/reward", {params: {id: 5, type: "AQUI ME TIENES QUE PASAR EL TIPO: SI ES STAR, ENERGY, XP, AI_HINT, ETC"}})
  // Y en el body me mandaras
  //const { source --> De que fuente nació, nameReward --> Un nombre de los que tengo en mi backend -> NAME REWARD} 

  //PARA VER SI EXISTE UN WEEK QUIZ
  //await api.get("/game/week_quiz", {params: { id:5}})
  //OJO A ESTA EXPLICACION: ANOTAR

  return (
    <View className="flex-1 bg-[#0d1117] items-center">
      <View className="w-full max-w-md px-4 pt-10">
        <GamifiedHeader></GamifiedHeader>
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
                onPress={() => {
                  useCourseStore
                    .getState()
                    .setActiveCourse(lang.id, lang.language);
                  router.push("/(tabs)/path" as any);
                }}
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
