// src/app/_layout.tsx
import "../../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  //AQUI MANDO A TRAER EL STATE DESDE ZUSTAND
  const isLogged = useAuthStore((state) => state.isLogged);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    //PA QUE CARGUE BIEN LAS RUTAS
    setTimeout(() => setIsReady(true), 100);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLogged && !inAuthGroup) {
      //SI NO ESTÁ LOGEADO, AL LOGIN
      router.replace("/(auth)/login" as any);
    } else if (isLogged && inAuthGroup) {
      //SI ESTÁ LOGEADO, A TABS
      router.replace("/(tabs)" as any);
    }
  }, [isLogged, segments, isReady]);

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
