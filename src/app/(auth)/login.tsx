//CLEAN
import { api } from "@/config/api";
import { useAuthStore } from "@/store/authStore";
import { TokenStorage } from "@/store/tokenStore";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

//Data que se envía
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

  // Ahora login espera recibir el payload del usuario
  const login = useAuthStore((state) => state.login);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const mySubmit = async (data: FormData) => {
    try {
      // Petición POST al backend
      const response = await api.post("/login", data);

      // Extraer todo del JSON que devuelve la API
      const { jwt, refresh_token, payload } = response.data;

      // Guardar los tokens de forma encriptada en el teléfono
      await TokenStorage.saveTokens(jwt, refresh_token);

      // Inyectar la información gamificada al estado global
      login(payload);

      reset();

      Toast.show({
        type: "success",
        text1: "¡Bienvenido de vuelta!",
        text2: `Tus ${payload.xpTotales} XP te están esperando, ${payload.nombre}.`,
      });

      // 5. Mandar a la pantalla principal
      router.replace("/(tabs)" as any);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: "Error de acceso",
          text2: error.response?.data?.message || "Credenciales incorrectas.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error inesperado",
          text2: "No pudimos conectar con el servidor.",
        });
      }
    }
  };
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d1117",
        padding: 16,
      }}
    >
      <View
        style={{ width: "100%", maxWidth: 384, borderRadius: 16, padding: 8 }}
      >
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          {/* <View style={{"width":64,"height":64,"backgroundColor":"#3b82f6","borderRadius":16,"alignItems":"center","justifyContent":"center","marginBottom":16,"borderWidth":1,"borderColor":"#3b82f6"}}>
            <MaterialIcons name="code" size={32} color="#3b82f6" />
          </View> */}
          <View
            style={{
              width: 150,
              height: 150,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              overflow: "hidden",
            }}
          >
            <Image
              source={require("../../../assets/images/code-inventors-logo.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            ¡Qué bueno verte de nuevo!
          </Text>
          <Text
            style={{ color: "#9ca3af", textAlign: "center", fontWeight: "500" }}
          >
            Tu racha te está esperando.
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#9ca3af",
                marginBottom: 4,
                marginLeft: 4,
                textTransform: "uppercase",
              }}
            >
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
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#0d1117",
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderColor: errors.email
                      ? "#ef4444"
                      : focusedInput === "email"
                        ? "#3b82f6"
                        : "#374151",
                  }}
                >
                  <MaterialIcons
                    name="mail-outline"
                    size={20}
                    color={errors.email ? "#ef4444" : "#9ca3af"}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={{ flex: 1, color: "#ffffff", marginLeft: 8 }}
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
              <Text
                style={{
                  color: "#ef4444",
                  fontSize: 12,
                  marginTop: 4,
                  marginLeft: 4,
                }}
              >
                {errors.email.message}
              </Text>
            )}
          </View>

          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#9ca3af",
                marginBottom: 4,
                marginLeft: 4,
                textTransform: "uppercase",
              }}
            >
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
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#0d1117",
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderColor: errors.password
                      ? "#ef4444"
                      : focusedInput === "password"
                        ? "#3b82f6"
                        : "#374151",
                  }}
                >
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color={errors.password ? "#ef4444" : "#9ca3af"}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={{ flex: 1, color: "#ffffff", marginLeft: 8 }}
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
              <Text
                style={{
                  color: "#ef4444",
                  fontSize: 12,
                  marginTop: 4,
                  marginLeft: 4,
                }}
              >
                {errors.password.message}
              </Text>
            )}
          </View>

          <Pressable style={{ alignSelf: "flex-end", marginTop: 4 }}>
            <Text style={{ color: "#6b7280", fontSize: 12, fontWeight: "500" }}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit(mySubmit)}
            style={{
              width: "100%",
              marginTop: 8,
              backgroundColor: "#2563eb",
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>
              Entrar
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 24, alignItems: "center" }}>
          <Link href="/register" asChild>
            <Text style={{ color: "#4ade80", fontWeight: "500" }}>
              ¿Nuevo por aquí? Comienza tu aventura.
            </Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
