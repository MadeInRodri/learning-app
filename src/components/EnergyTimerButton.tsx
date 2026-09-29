import { useGamificationStore } from "@/store/gamificationStore";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/authStore";

// 1 minuto expresados en milisegundos, se puede cambiar
const COOLDOWN_DURATION = 1 * 60 * 1000;
const MAX_ENERGY = 50; // Límite máximo de energía

export default function EnergyTimerButton() {
  const { claimReward } = useGamificationStore();

  // Extraemos al activeUser para poder leer su ID único
  const { activeUser, updateGamificationStats } = useAuthStore();

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Creamos una llave dinámica basada en el ID del usuario actual
  const timerKey = activeUser ? `@energy_last_claim_${activeUser.id}` : null;

  useEffect(() => {
    const initializeTimer = async () => {
      // Si no hay usuario activo o llave, detenemos la inicialización
      if (!timerKey) return;

      try {
        // Leemos específicamente el tiempo guardado de este usuario
        const lastClaimStr = await AsyncStorage.getItem(timerKey);

        if (lastClaimStr) {
          const lastClaimDate = parseInt(lastClaimStr, 10);
          const now = Date.now();
          const elapsed = now - lastClaimDate;

          if (elapsed < COOLDOWN_DURATION) {
            setTimeLeft(COOLDOWN_DURATION - elapsed);
          } else {
            setTimeLeft(0);
          }
        } else {
          // Si nunca ha reclamado, el tiempo es 0
          setTimeLeft(0);
        }
      } catch (error) {
        console.error("Error leyendo timer de energía:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeTimer();
  }, [timerKey]); // El useEffect se vuelve a ejecutar si el usuario cambia de cuenta

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleClaimEnergy = async () => {
    // Validamos que exista un timerKey válido
    if (timeLeft > 0 || isProcessing || !timerKey) return;

    // Validación del límite de energía
    const currentEnergy = activeUser?.energiaBalance || 0;
    if (currentEnergy >= MAX_ENERGY) {
      Toast.show({
        type: "info",
        text1: "Energía al máximo ⚡",
        text2: `Ya tienes el máximo de ${MAX_ENERGY} puntos. ¡Ve a aprender!`,
      });
      return;
    }

    setIsProcessing(true);

    //Mandamos a la API pa que de energía
    try {
      const success = await claimReward(
        "ENERGY",
        "daily_timer",
        "LITTLE_BUNDLE_ENERGY",
      );

      if (success) {
        updateGamificationStats(0, 10);

        // Guardamos el tiempo de reclamo usando su llave única
        const now = Date.now();
        await AsyncStorage.setItem(timerKey, now.toString());
        setTimeLeft(COOLDOWN_DURATION);

        Toast.show({
          type: "success",
          text1: "¡Energía Recargada! ⚡",
          text2: "Has recibido +10 de Energía. Vuelve más tarde por más.",
        });
      } else {
        throw new Error("Petición rechazada");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error obteniendo energía",
        text2: "Hubo un problema de conexión. Intenta de nuevo.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isInitializing) {
    return (
      <View className="w-full bg-[#181c22] border border-[#30363d] rounded-xl py-4 flex-row items-center justify-center">
        <ActivityIndicator color="#10b981" />
      </View>
    );
  }

  const isLocked = timeLeft > 0;

  return (
    <Pressable
      onPress={handleClaimEnergy}
      disabled={isLocked || isProcessing}
      className={`w-full rounded-xl py-4 px-6 flex-row items-center justify-between border-2  ${
        isLocked
          ? "bg-[#181c22] border-gray-800 opacity-80"
          : "bg-emerald-600/10 border-emerald-500 active:bg-emerald-600/20"
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            isLocked
              ? "bg-gray-800"
              : "bg-emerald-500 shadow-lg shadow-emerald-500/50"
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <MaterialIcons
              name={isLocked ? "hourglass-empty" : "bolt"}
              size={24}
              color={isLocked ? "#6b7280" : "white"}
            />
          )}
        </View>
        <View>
          <Text
            className={`font-bold text-base ${isLocked ? "text-gray-500" : "text-emerald-400"}`}
          >
            Recarga Rápida
          </Text>
          <Text
            className={`text-xs ${isLocked ? "text-gray-600" : "text-emerald-500/70"}`}
          >
            +10 de Energía
          </Text>
        </View>
      </View>

      <View
        className={`px-3 py-1.5 rounded-md ${isLocked ? "bg-gray-800" : "bg-emerald-500"}`}
      >
        <Text
          className={`font-mono font-bold ${isLocked ? "text-gray-400" : "text-white"}`}
        >
          {isLocked ? formatTime(timeLeft) : "RECLAMAR"}
        </Text>
      </View>
    </Pressable>
  );
}
