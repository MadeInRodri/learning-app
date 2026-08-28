import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router, Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";

type FormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: "", password: "" },
  });

  const login = useAuthStore((state) => state.login);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const mySubmit = (data: FormData) => {
    //AQUÍ TENES LA DATA
    console.log("¡Datos capturados con éxito!", data);
    reset();

    // TODO: Aquí irá la llamada fetch al backend

    //YA DE AQUÍ TE VAS AL MENÚ PRINCIPAL
    login();
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#0d1117] p-4">
      <View className="w-full max-w-sm rounded-2xl p-2 ">
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

        <View className="gap-4">
          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase">
              Correo electrónico
            </Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Ingresa un correo válido",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View
                  className={`flex-row items-center bg-[#0d1117] border rounded-lg px-3 py-3 ${
                    errors.email
                      ? "border-red-500"
                      : focusedInput === "email"
                        ? "border-blue-500"
                        : "border-gray-700"
                  }`}
                >
                  <MaterialIcons
                    name="mail-outline"
                    size={20}
                    color={errors.email ? "#ef4444" : "#9ca3af"}
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-white ml-2 outline-none"
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#6b7280"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              )}
            />
            {/* Renderizado dinámico del error */}
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase">
              Contraseña
            </Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "Debe tener al menos 6 caracteres",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View
                  className={`flex-row items-center bg-[#0d1117] border rounded-lg px-3 py-3 ${
                    errors.password
                      ? "border-red-500"
                      : focusedInput === "password"
                        ? "border-blue-500"
                        : "border-gray-700"
                  }`}
                >
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color={errors.password ? "#ef4444" : "#9ca3af"}
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-white ml-2 outline-none"
                    placeholder="••••••••"
                    placeholderTextColor="#6b7280"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              )}
            />
            {/* Renderizado dinámico del error */}
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          <Pressable className="self-end mt-1">
            <Text className="text-gray-500 text-xs font-medium">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit(mySubmit)}
            className="w-full mt-2 bg-blue-600 active:bg-blue-700 rounded-lg py-3 items-center justify-center"
          >
            <Text className="text-white font-bold text-base">Entrar</Text>
          </Pressable>
        </View>

        <View className="mt-6 items-center">
          <Link href="/register" asChild>
            <Text className="text-green-400 hover:text-green-300 font-medium">
              ¿Nuevo por aquí? Comienza tu aventura.
            </Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
