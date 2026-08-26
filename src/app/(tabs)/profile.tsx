import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";

export default function ProfileScreen() {
  // Objeto simulado con las estadísticas del usuario
  const userStats = {
    name: "MadeInRodri",
    email: "rodrigo@gmail.com",
    level: 1,
    progress: "25%", // Porcentaje para la barra de nivel
    streak: 1,
    lastCourse: "Python",
    testsPassed: 3,
    coursesFinished: 0,
    score: 320,
  };

  return (
    // Usamos ScrollView y un padding inferior (pb-24) para que el contenido no quede tapado por los Tabs
    <ScrollView className="flex-1 bg-[#0d1117] px-4 pt-10">
      <View className="w-full max-w-sm mx-auto pb-24">
        {/* Título */}
        <Text className="text-2xl font-bold text-white text-center mb-10">
          Tu perfil
        </Text>

        {/* Cabecera del Perfil (Avatar + Info) */}
        <View className="flex-row items-center mb-10">
          {/* Avatar Placeholder */}
          <View className="w-20 h-20 rounded-full border-2 border-gray-700 bg-[#161b22] items-center justify-center mr-5 shadow-lg">
            <Text className="text-gray-400 font-mono text-xl font-bold tracking-widest">
              MR
            </Text>
          </View>

          {/* Info de Usuario */}
          <View className="flex-1">
            <Text className="text-xl font-bold text-white mb-1">
              {userStats.name}
            </Text>
            <Text className="text-sm text-gray-400 mb-3">
              {userStats.email}
            </Text>

            {/* Barra de Nivel */}
            <View className="w-32">
              <Text className="text-xs font-mono text-gray-400 mb-1">
                Lvl {userStats.level}
              </Text>
              <View className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: userStats.progress as any }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Tarjeta de Estadísticas Detalladas */}
        <View className="bg-[#181c22] border border-gray-800 rounded-xl p-5 mb-8 shadow-md">
          <View className="flex-row justify-between items-center border-b border-gray-800 pb-3 mb-3">
            <Text className="text-gray-400">Racha actual</Text>
            <Text className="text-white font-bold">{userStats.streak} día</Text>
          </View>

          <View className="flex-row justify-between items-center border-b border-gray-800 pb-3 mb-3">
            <Text className="text-gray-400">Último curso visitado</Text>
            <Text className="text-white font-bold">{userStats.lastCourse}</Text>
          </View>

          <View className="flex-row justify-between items-center border-b border-gray-800 pb-3 mb-3">
            <Text className="text-gray-400">Test aprobados</Text>
            <Text className="text-white font-bold">
              {userStats.testsPassed}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-gray-400">Cursos finalizados</Text>
            <Text className="text-white font-bold">
              {userStats.coursesFinished}
            </Text>
          </View>

          {/* Badge de Puntaje Actual */}
          <View className="items-end">
            <View className="border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 rounded">
              <Text className="text-blue-400 font-mono text-xs font-semibold tracking-wide">
                Puntaje actual: {userStats.score}
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de Acción (Gamificados con bordes de neón) */}
        <View className="gap-4">
          <Pressable className="w-full py-4 border border-orange-400/80 rounded-lg items-center justify-center active:bg-orange-400/10 transition-colors">
            <Text className="text-orange-400 font-bold">
              Ver puntaje global
            </Text>
          </Pressable>

          {/* Este botón ya te redirecciona a la pantalla modal de logros */}
          <Pressable
            onPress={() => router.push("/achievements" as any)}
            className="w-full py-4 border border-purple-500/80 rounded-lg items-center justify-center active:bg-purple-500/10 transition-colors"
          >
            <Text className="text-purple-400 font-bold">Ver logros</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
