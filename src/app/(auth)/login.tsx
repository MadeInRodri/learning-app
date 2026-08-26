import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <View className="flex-1 items-center justify-center bg-[#0d1117] p-4">
      <View className="w-full max-w-sm rounded-2xl p-6 border border-blue-500/50">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-blue-500/20 rounded-2xl items-center justify-center mb-4 border border-blue-500/50">
            <MaterialIcons name="code" size={32} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-white text-center mb-2">
            ¡Qué bueno verte de nuevo!
          </Text>
          <Text className="text-gray-400 text-center font-medium">
            Tu racha te está esperando.
          </Text>
        </View>

        {/* Formulario */}
        <View className="gap-4">
          {/* Input: Correo */}
          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase">
              Correo electrónico
            </Text>
            <View
              className={`flex-row items-center bg-[#0d1117] border rounded-lg px-3 py-3 ${
                focusedInput === "email" ? "border-blue-500" : "border-gray-700"
              }`}
            >
              <MaterialIcons
                name="mail-outline"
                size={20}
                color="#9ca3af"
                className="mr-2"
              />
              <TextInput
                className="flex-1 text-white ml-2 outline-none"
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Input: Contraseña */}
          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase">
              Contraseña
            </Text>
            <View
              className={`flex-row items-center bg-[#0d1117] border rounded-lg px-3 py-3 ${
                focusedInput === "password"
                  ? "border-blue-500"
                  : "border-gray-700"
              }`}
            >
              <MaterialIcons
                name="lock-outline"
                size={20}
                color="#9ca3af"
                className="mr-2"
              />
              <TextInput
                className="flex-1 text-white ml-2 outline-none"
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                secureTextEntry
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Enlace de recuperación */}
          <Pressable className="self-end mt-1">
            <Text className="text-gray-500 text-xs font-medium">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          {/* Botón Principal */}
          <Pressable
            onPress={() => router.replace("/(tabs)" as any)}
            className="w-full mt-2 bg-blue-600 active:bg-blue-700 rounded-lg py-3 items-center justify-center"
          >
            <Text className="text-white font-bold text-base">Entrar</Text>
          </Pressable>
        </View>

        {/* Footer Link */}
        <View className="mt-6 items-center">
          <Pressable onPress={() => router.replace("/(auth)/register" as any)}>
            <Text className="text-green-400 hover:text-green-300 font-medium">
              ¿Nuevo por aquí? Comienza tu aventura.
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
