//CLEAN
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

// Instancia de la API configurada con los interceptores
import { api } from "../../config/api";

type FormData = {
  username: string;
  email: string;
  password: string;
};

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { username: "", email: "", password: "" },
  });

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      // Data que se va a enviar
      const payload = {
        name: data.username,
        email: data.email,
        password: data.password,
      };

      // Hacemos el post
      const response = await api.post("/registro", payload);

      // Notificamos el éxito y limpiamos el formulario
      Toast.show({
        type: "success",
        text1: "¡Cuenta creada con éxito!",
        text2: "Ya puedes iniciar sesión para comenzar.",
      });

      reset();

      // 4. Redirigimos al login
      router.replace("/(auth)/login" as any);
    } catch (error) {
      // Manejo de errores devueltos por el backend
      if (axios.isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: "Error en el registro",
          text2:
            error.response?.data?.message ||
            "Verifica tus datos e intenta de nuevo.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error inesperado",
          text2: "Ocurrió un problema de conexión.",
        });
      }
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#0d1117] p-4">
      <View className="w-full max-w-sm rounded-xl  p-2">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mb-4 border border-blue-500">
            <MaterialIcons name="code" size={32} color="#3b82f6" />
          </View>

          <Text className="text-2xl font-bold text-white text-center mb-2">
            ¡Crea tu perfil de desarrollador!
          </Text>
          <Text className="text-gray-400 text-center">
            Únete a miles de estudiantes.
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase">
              Nombre de usuario
            </Text>
            <Controller
              control={control}
              name="username"
              rules={{
                required: "Debe agregar un nombre de usuario",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              }}
              render={({ field: { onChange, value } }) => (
                <View
                  className={`flex-row items-center bg-[#0d1117] border rounded-lg px-3 py-3 ${
                    errors.username
                      ? "border-red-500"
                      : focusedInput === "username"
                        ? "border-blue-500"
                        : "border-gray-700"
                  }`}
                >
                  <MaterialIcons
                    name="alternate-email"
                    size={20}
                    color={errors.username ? "#ef4444" : "#9ca3af"}
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-white ml-2 outline-none"
                    placeholder="usuario"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedInput("username")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              )}
            />
            {errors.username && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.username.message}
              </Text>
            )}
          </View>

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
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            className="w-full mt-4 bg-green-500 active:bg-green-600 rounded-lg py-3 flex-row items-center justify-center"
          >
            <Text className="text-white font-bold mr-2 text-base">
              Crear cuenta y ganar +50 XP
            </Text>
            <MaterialIcons name="rocket-launch" size={18} color="white" />
          </Pressable>
        </View>

        <View className="mt-6 items-center">
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-blue-400 font-medium">
                ¿Ya tienes cuenta? Inicia sesión.
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
