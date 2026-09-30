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
    <View style={{"flex":1,"alignItems":"center","justifyContent":"center","backgroundColor":"#0d1117","padding":16}}>
      <View style={{"width":"100%","maxWidth":384,"borderRadius":12,"padding":8}}>
        <View style={{"alignItems":"center","marginBottom":24}}>
          <View style={{"width":64,"height":64,"backgroundColor":"#3b82f6","borderRadius":16,"alignItems":"center","justifyContent":"center","marginBottom":16,"borderWidth":1,"borderColor":"#3b82f6"}}>
            <MaterialIcons name="code" size={32} color="#3b82f6" />
          </View>

          <Text style={{"fontSize":24,"fontWeight":"700","color":"#ffffff","textAlign":"center","marginBottom":8}}>
            ¡Crea tu perfil de desarrollador!
          </Text>
          <Text style={{"color":"#9ca3af","textAlign":"center"}}>
            Únete a miles de estudiantes.
          </Text>
        </View>

        <View style={{"gap":16}}>
          <View>
            <Text style={{"fontSize":12,"fontWeight":"600","color":"#9ca3af","marginBottom":4,"marginLeft":4,"textTransform":"uppercase"}}>
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
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#0d1117", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, borderColor: errors.username ? "#ef4444" : focusedInput === "username" ? "#3b82f6" : "#374151" }}
                >
                  <MaterialIcons
                    name="alternate-email"
                    size={20}
                    color={errors.username ? "#ef4444" : "#9ca3af"}
                    style={{"marginRight":8}}
                  />
                  <TextInput
                    style={{"flex":1,"color":"#ffffff","marginLeft":8}}
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
              <Text style={{"color":"#ef4444","fontSize":12,"marginTop":4,"marginLeft":4}}>
                {errors.username.message}
              </Text>
            )}
          </View>

          <View>
            <Text style={{"fontSize":12,"fontWeight":"600","color":"#9ca3af","marginBottom":4,"marginLeft":4,"textTransform":"uppercase"}}>
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
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#0d1117", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, borderColor: errors.email ? "#ef4444" : focusedInput === "email" ? "#3b82f6" : "#374151" }}
                >
                  <MaterialIcons
                    name="mail-outline"
                    size={20}
                    color={errors.email ? "#ef4444" : "#9ca3af"}
                    style={{"marginRight":8}}
                  />
                  <TextInput
                    style={{"flex":1,"color":"#ffffff","marginLeft":8}}
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
              <Text style={{"color":"#ef4444","fontSize":12,"marginTop":4,"marginLeft":4}}>
                {errors.email.message}
              </Text>
            )}
          </View>

          <View>
            <Text style={{"fontSize":12,"fontWeight":"600","color":"#9ca3af","marginBottom":4,"marginLeft":4,"textTransform":"uppercase"}}>
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
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#0d1117", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, borderColor: errors.password ? "#ef4444" : focusedInput === "password" ? "#3b82f6" : "#374151" }}
                >
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color={errors.password ? "#ef4444" : "#9ca3af"}
                    style={{"marginRight":8}}
                  />
                  <TextInput
                    style={{"flex":1,"color":"#ffffff","marginLeft":8}}
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
              <Text style={{"color":"#ef4444","fontSize":12,"marginTop":4,"marginLeft":4}}>
                {errors.password.message}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            style={{"width":"100%","marginTop":16,"backgroundColor":"#22c55e","borderRadius":8,"paddingVertical":12,"flexDirection":"row","alignItems":"center","justifyContent":"center"}}
          >
            <Text style={{"color":"#ffffff","fontWeight":"700","marginRight":8,"fontSize":16}}>
              Crear cuenta y ganar +50 XP
            </Text>
            <MaterialIcons name="rocket-launch" size={18} color="white" />
          </Pressable>
        </View>

        <View style={{"marginTop":24,"alignItems":"center"}}>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={{"color":"#60a5fa","fontWeight":"500"}}>
                ¿Ya tienes cuenta? Inicia sesión.
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
