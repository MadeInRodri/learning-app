// src/app/_layout.tsx
import "../../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Simularemos que el usuario NO está logueado por defecto
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Pequeño timeout para asegurar que el router montó las rutas
    setTimeout(() => setIsReady(true), 100);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Verificamos si el usuario intenta acceder a una ruta de autenticación
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Si NO está logueado y NO está en la pantalla de login/registro, lo mandamos al login
      router.replace("/(auth)/register" as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Si SÍ está logueado y está en la pantalla de login, lo mandamos a los tabs
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, segments, isReady]);

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
