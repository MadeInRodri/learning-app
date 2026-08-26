import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <View className="flex-1 items-center justify-center bg-[#0d1117] p-4">
      {/* Contenedor Principal (Max-width simula la web responsiva) */}
      <View className="w-full max-w-sm border rounded-xl border-blue-500/50 p-6">
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold text-white text-center mb-2">
            ¡Crea tu perfil de desarrollador!
          </Text>
          <Text className="text-gray-400 text-center">
            Únete a miles de estudiantes.
          </Text>
        </View>

        {/* Formulario */}
        <View className="gap-4">
          {/* Input: Usuario */}
          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase">
              Nombre de usuario
            </Text>
            <View
              className={`flex-row items-center bg-[#0d1117] border rounded-lg px-3 py-3 ${
                focusedInput === "username"
                  ? "border-blue-500"
                  : "border-gray-700"
              }`}
            >
              <MaterialIcons
                name="alternate-email"
                size={20}
                color="#9ca3af"
                className="mr-2"
              />
              <TextInput
                className="flex-1 text-white ml-2 outline-none"
                placeholder="usuario"
                placeholderTextColor="#6b7280"
                onFocus={() => setFocusedInput("username")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

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

          {/* Botón Principal */}
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="w-full mt-4 bg-green-500 active:bg-green-600 rounded-lg py-3 flex-row items-center justify-center"
          >
            <Text className="text-white font-bold mr-2 text-base">
              Crear cuenta y ganar +50 XP
            </Text>
            <MaterialIcons name="rocket-launch" size={18} color="white" />
          </Pressable>
        </View>

        {/* Footer Link */}
        <View className="mt-6 items-center">
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-blue-400 hover:text-blue-300 font-medium">
              ¿Ya tienes cuenta? Inicia sesión.
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
