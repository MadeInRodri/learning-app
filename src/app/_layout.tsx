// // src/app/_layout.tsx
// import "../../global.css";
// import { Stack, useRouter, useSegments } from "expo-router";
// import { useEffect, useState } from "react";
// import { useAuthStore } from "@/store/authStore";

// export default function RootLayout() {
//   const router = useRouter();
//   const segments = useSegments();

//   //AQUI MANDO A TRAER EL STATE DESDE ZUSTAND
//   const isLogged = useAuthStore((state) => state.isLogged);
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     //PA QUE CARGUE BIEN LAS RUTAS
//     setTimeout(() => setIsReady(true), 100);
//   }, []);

//   useEffect(() => {
//     if (!isReady) return;

//     const inAuthGroup = segments[0] === "(auth)";

//     if (!isLogged && !inAuthGroup) {
//       //SI NO ESTÁ LOGEADO, AL LOGIN
//       router.replace("/(auth)/login" as any);
//     } else if (isLogged && inAuthGroup) {
//       //SI ESTÁ LOGEADO, A TABS
//       router.replace("/(tabs)" as any);
//     }
//   }, [isLogged, segments, isReady]);

//   return (
//     <Stack
//       screenOptions={{
//         headerShown: false,
//         contentStyle: { backgroundColor: "#0d1117" },
//       }}
//     >
//       <Stack.Screen name="(auth)" />
//       <Stack.Screen name="(tabs)" />
//       <Stack.Screen name="course/[id]" />
//       <Stack.Screen name="lesson/markdown" />
//       <Stack.Screen name="lesson/quiz" />
//       <Stack.Screen name="achievements" options={{ presentation: "modal" }} />
//     </Stack>
//   );
// }

// src/app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../../global.css";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isLogged = useAuthStore((state) => state.isLogged);

  // Estado para saber si Zustand ya cargó los datos de la caché
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Escuchamos cuando termine de hidratar la memoria local
    useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    setIsHydrated(useAuthStore.persist.hasHydrated());
  }, []);

  useEffect(() => {
    // Si aún está cargando la caché, no hacemos redirecciones
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLogged && !inAuthGroup) {
      // SI NO ESTÁ LOGEADO, AL LOGIN
      router.replace("/(auth)/login" as any);
    } else if (isLogged && inAuthGroup) {
      // SI ESTÁ LOGEADO, A TABS
      router.replace("/(tabs)" as any);
    }
  }, [isLogged, segments, isHydrated]);

  // Pantalla de carga con nuestro tema oscuro
  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0d1117]">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0d1117" },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="lesson/markdown" />
      <Stack.Screen name="lesson/quiz" />
      <Stack.Screen name="achievements" options={{ presentation: "modal" }} />
    </Stack>
  );
}
