import { useAiQuizStore } from "@/store/aiQuizStore";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/authStore";
import {
  calculateLevelInfo,
  useGamificationStore,
} from "../store/gamificationStore";

const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
const TIMER_KEY = "@boss_quiz_last_triggered";

export default function GamifiedHeader() {
  const activeUser = useAuthStore((state) => state.activeUser);
  const [isOpeningBoss, setIsOpeningBoss] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { checkWeekQuiz } = useGamificationStore();
  const { startAiQuiz } = useAiQuizStore();

  useEffect(() => {
    const initializeTimer = async () => {
      try {
        const lastTriggerStr = await AsyncStorage.getItem(TIMER_KEY);
        if (lastTriggerStr) {
          const lastTriggerDate = parseInt(lastTriggerStr, 10);
          const elapsed = Date.now() - lastTriggerDate;

          // Si aún no pasan los 5 minutos, calculamos el tiempo restante
          if (elapsed < COOLDOWN_DURATION) {
            setTimeLeft(COOLDOWN_DURATION - elapsed);
          }
        }
      } catch (error) {
        console.error("Error leyendo el timer del boss:", error);
      }
    };
    initializeTimer();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0; // Termina la cuenta
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
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTriggerAiQuiz = async () => {
    if (timeLeft > 0 || isOpeningBoss) return;

    // Bloqueamos la UI de inmediato y guardamos la hora actual
    setIsOpeningBoss(true);
    const now = Date.now();
    await AsyncStorage.setItem(TIMER_KEY, now.toString());
    setTimeLeft(COOLDOWN_DURATION);

    try {
      Toast.show({
        type: "info",
        text1: "Analizando progreso...",
        text2: "La IA está generando tu reto personalizado.",
      });

      // Llamamos a la API
      const response = await checkWeekQuiz();

      if (response) {
        // Cargamos la data en el store temporal
        startAiQuiz(response);

        // Ocultamos el toast y redirigimos
        Toast.hide();
        router.push("/lesson/ai-quiz" as any);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error de conexión",
        text2: "No se pudo contactar a la IA.",
      });
    } finally {
      setIsOpeningBoss(false);
    }
  };

  const isLocked = timeLeft > 0;

  const { level, currentXP, maxXP, progress } = calculateLevelInfo(
    activeUser?.xpTotales,
  );

  const currentEnergy = activeUser?.energiaBalance || 0;
  const maxEnergy = 50;
  const energyPercentage = Math.round((currentEnergy / maxEnergy) * 100);

  // MOCK de Racha
  const streak = { isActive: true };

  const renderEnergySegments = () => {
    const segments = 3;
    const segmentsActive = Math.ceil((currentEnergy / maxEnergy) * segments);

    return Array.from({ length: segments }).map((_, index) => {
      const isActive = segments - index <= segmentsActive;
      return (
        <View
          key={index}
          style={[
            styles.energySegment,
            isActive ? styles.energyActive : styles.energyInactive,
          ]}
        />
      );
    });
  };

  if (!activeUser) return null;

  return (
    <View style={styles.container}>
      {/* Acento superior decorativo */}
      <View style={styles.topAccent} />

      <View style={styles.gridContainer}>
        {/* --- COLUMNA IZQUIERDA: ENERGÍA --- */}
        <View style={[styles.column, styles.borderRight, styles.padRight]}>
          <View style={styles.energyInfoRow}>
            {/* Dibujo de la batería */}
            <View style={styles.batteryIconContainer}>
              <View style={styles.batteryTip} />
              <View style={styles.batteryBody}>{renderEnergySegments()}</View>
            </View>

            {/* Textos de batería */}
            <View style={styles.energyTextContainer}>
              <Text style={styles.labelSmall}>ENERGÍA</Text>
              <Text style={styles.valueTextAccent}>
                {currentEnergy}{" "}
                <Text style={styles.valueMuted}>/ {maxEnergy}</Text>
              </Text>
            </View>
          </View>

          {/* Badge de porcentaje */}
          <View style={styles.percentageBadge}>
            <MaterialIcons name="bolt" size={10} color="#adc6ff" />
            <Text style={styles.percentageText}>{energyPercentage}% listo</Text>
          </View>
        </View>

        {/* --- COLUMNA CENTRAL: RACHA --- */}
        <View style={[styles.column, styles.borderRight, styles.padHorizontal]}>
          <View style={styles.streakIconContainer}>
            {streak.isActive ? (
              <>
                <View style={[styles.streakCircle, styles.streakCircleActive]}>
                  <MaterialIcons
                    name="local-fire-department"
                    size={20}
                    color="#E76F00"
                  />
                </View>
                <View style={[styles.streakBadge, styles.badgeActive]}>
                  <MaterialIcons name="check" size={10} color="#adc6ff" />
                </View>
              </>
            ) : (
              <>
                <View
                  style={[styles.streakCircle, styles.streakCircleInactive]}
                >
                  <MaterialIcons
                    name="local-fire-department"
                    size={20}
                    color="#6b7280"
                  />
                  <View style={styles.overlayCenter}>
                    <MaterialIcons name="close" size={18} color="#f85149" />
                  </View>
                </View>
                <View style={[styles.streakBadge, styles.badgeInactive]}>
                  <MaterialIcons
                    name="priority-high"
                    size={10}
                    color="#f85149"
                  />
                </View>
              </>
            )}
          </View>

          <Text
            style={[
              styles.labelSmall,
              streak.isActive ? styles.textOrange : styles.textRed,
            ]}
          >
            {streak.isActive ? "RACHA ACTIVA" : "RACHA PERDIDA"}
          </Text>
        </View>

        {/* --- COLUMNA DERECHA: NIVEL Y XP --- */}
        <View style={[styles.column, styles.padLeft, styles.levelColumn]}>
          <View style={styles.levelHeader}>
            <MaterialIcons name="military-tech" size={14} color="#adc6ff" />
            <Text style={styles.levelTitle}>Lvl {level}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.xpFooterRow}>
            <Text style={styles.xpLabel}>XP</Text>
            <Text style={styles.xpValue}>
              {currentXP} / {maxXP}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isLocked || isOpeningBoss}
        onPress={handleTriggerAiQuiz}
        style={({ pressed }) => [
          styles.bossButton,
          pressed && !isLocked && styles.bossButtonPressed,
          (isLocked || isOpeningBoss) && styles.bossButtonDisabled,
        ]}
      >
        {/* Agregamos íconos intimidantes que cambian según el estado */}
        {isLocked ? (
          <MaterialIcons name="hourglass-empty" size={18} color="#6b7280" />
        ) : isOpeningBoss ? (
          <MaterialIcons name="hourglass-top" size={18} color="#f87171" />
        ) : (
          <MaterialIcons name="dangerous" size={20} color="#ef4444" />
        )}

        <Text style={styles.bossButtonText}>
          {isLocked
            ? `PREPARATE (${formatTime(timeLeft)})`
            : isOpeningBoss
              ? "INVOCANDO..."
              : "Generar Portal..."}
        </Text>

        {!isLocked && !isOpeningBoss && (
           <MaterialIcons name="dangerous" size={20} color="#ef4444" />
           
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Contenedor Principal ---
  container: {
    // Fondo oscuro profesional
    backgroundColor: "#161920",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D323F",
    paddingVertical: 14,
    paddingHorizontal: 12,
    position: "relative",
    overflow: "hidden",
    marginBottom: 40,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 32,
    right: 32,
    height: 2,
    backgroundColor: "#3b82f6",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  gridContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // --- Utilidades de Layout de Columnas ---
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  levelColumn: {
    alignItems: "stretch", // Para que la barra de progreso ocupe el ancho
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: "#2D323F",
  },
  padRight: { paddingRight: 8 },
  padLeft: { paddingLeft: 12 },
  padHorizontal: { paddingHorizontal: 8 },

  // =============================================
  // --- DISEÑO INTIMIDANTE Y ÚNICO DEL BOTÓN ---
  // =============================================
  bossButton: {
    minHeight: 50, // Más alto para dar sensación de importancia
    marginTop: 18,
    paddingHorizontal: 16,
    borderRadius: 4, // Bordes más afilados (menos redondeados)
    backgroundColor: "#080000", // Negro casi absoluto (abismal)
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    // --- Bordes Únicos ---
    borderWidth: 2,
    borderColor: "#b91c1c", // Rojo sangre profundo

    // --- Sombra/Resplandor (Glow) para iOS ---
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,

    // --- Elevación para Android (efecto similar a glow) ---
    elevation: 8,
  },
  bossButtonPressed: {
    backgroundColor: "#1c1917", // Se aclara ligeramente como piedra caliente
    borderColor: "#ef4444", // Borde rojo brillante en ignición
    shadowRadius: 12, // Resplandor intensificado
  },
  bossButtonDisabled: {
    backgroundColor: "#121212", // Gris muy oscuro, apagado
    borderColor: "#44403c", // Borde color piedra fría/ceniza
    opacity: 0.7,
    elevation: 0, // Sin resplandor
    shadowOpacity: 0,
  },
  bossButtonText: {
    // --- Texto Único ---
    color: "#f87171", // Rojo claro/rosado, como brasas incandescentes
    fontWeight: "900", // Grosor máximo
    fontSize: 15,
    textAlign: "center",
    textTransform: "uppercase", // Agresivo y ruidoso
    letterSpacing: 1.5, // Espaciado runico
    fontFamily: "monospace",

    // --- Efecto de quemado en texto ---
    textShadowColor: "#7f1d1d",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // =============================================

  // --- Tipografía Global ---
  labelSmall: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    fontFamily: "monospace", // Manteniendo tu estilo mono
    marginTop: 4,
  },
  valueTextAccent: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#adc6ff",
    fontFamily: "monospace",
  },
  valueMuted: {
    fontWeight: "normal",
    color: "#6B7280",
  },
  textOrange: { color: "#E76F00" },
  textRed: { color: "#f85149" },

  // --- Componentes Columna Energía ---
  energyInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  batteryIconContainer: {
    alignItems: "center",
    marginRight: 8,
  },
  batteryTip: {
    width: 10,
    height: 4,
    backgroundColor: "#adc6ff",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  batteryBody: {
    width: 20,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#adc6ff",
    backgroundColor: "#0d1117",
    padding: 2,
    justifyContent: "flex-end",
  },
  energySegment: {
    width: "100%",
    height: 6,
    borderRadius: 1,
    marginBottom: 2,
  },
  energyActive: { backgroundColor: "#adc6ff" },
  energyInactive: { backgroundColor: "#30363d" },
  energyTextContainer: {
    justifyContent: "center",
  },
  percentageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#243044",
    borderWidth: 1,
    borderColor: "#adc6ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 9,
    color: "#adc6ff",
    fontFamily: "monospace",
    marginLeft: 4,
  },

  // --- Componentes Columna Racha ---
  streakIconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  streakCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  streakCircleActive: {
    backgroundColor: "#332719",
    borderColor: "#E76F00",
  },
  streakCircleInactive: {
    backgroundColor: "#1b1517",
    borderColor: "#f85149",
  },
  overlayCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  streakBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1E222B",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: { borderColor: "#3b82f6" },
  badgeInactive: { borderColor: "#f85149" },

  // --- Componentes Columna Nivel ---
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  levelTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#adc6ff",
    fontFamily: "monospace",
    marginLeft: 4,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#0d1117",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#30363d",
    padding: 1,
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },
  xpFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpLabel: {
    fontSize: 9,
    fontFamily: "monospace",
    color: "#9CA3AF",
  },
  xpValue: {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "600",
    color: "#adc6ff",
  },
});