import { useAiQuizStore } from "@/store/aiQuizStore";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/authStore";
import { calculateLevelInfo, useGamificationStore } from "../store/gamificationStore";

export default function GamifiedHeader() {
  const activeUser = useAuthStore((state) => state.activeUser);
  const [isOpeningBoss, setIsOpeningBoss] = useState(false);




  const { checkWeekQuiz } = useGamificationStore();
  const { startAiQuiz } = useAiQuizStore();
  const handleTriggerAiQuiz = async () => {
    //Tiempo de espera maximo de 3 minutos
    //El boton se tiene que desactivar
    try {
      Toast.show({
        type: "info",
        text1: "Analizando progreso...",
        text2: "La IA está generando tu reto personalizado.",
      });
      
      // 1. Llamamos a la API falsa
      const response = await checkWeekQuiz();

      if (response) {
        // 2. Cargamos la data en el store temporal
        startAiQuiz(response);

        // 3. Ocultamos el toast de carga y redirigimos a la vista express
        Toast.hide();
        router.push("/lesson/ai-quiz" as any);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error de conexión",
        text2: "No se pudo contactar a la IA.",
      });
    }
  };

  useEffect(() => {
    if (!isOpeningBoss) return;
    const timeout = setTimeout(() => setIsOpeningBoss(false), 60_000);
    return () => clearTimeout(timeout);
  }, [isOpeningBoss]);

  const { level, currentXP, maxXP, progress } = calculateLevelInfo(
    activeUser?.xpTotales
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
              <View style={styles.batteryBody}>
                {renderEnergySegments()}
              </View>
            </View>

            {/* Textos de batería */}
            <View style={styles.energyTextContainer}>
              <Text style={styles.labelSmall}>ENERGÍA</Text>
              <Text style={styles.valueTextAccent}>
                {currentEnergy} <Text style={styles.valueMuted}>/ {maxEnergy}</Text>
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
                  <MaterialIcons name="local-fire-department" size={20} color="#E76F00" />
                </View>
                <View style={[styles.streakBadge, styles.badgeActive]}>
                  <MaterialIcons name="check" size={10} color="#adc6ff" />
                </View>
              </>
            ) : (
              <>
                <View style={[styles.streakCircle, styles.streakCircleInactive]}>
                  <MaterialIcons name="local-fire-department" size={20} color="#6b7280" />
                  <View style={styles.overlayCenter}>
                    <MaterialIcons name="close" size={18} color="#f85149" />
                  </View>
                </View>
                <View style={[styles.streakBadge, styles.badgeInactive]}>
                  <MaterialIcons name="priority-high" size={10} color="#f85149" />
                </View>
              </>
            )}
          </View>

          <Text style={[styles.labelSmall, streak.isActive ? styles.textOrange : styles.textRed]}>
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
        disabled={isOpeningBoss}
        onPress={() => handleTriggerAiQuiz()}
        style={({ pressed }) => [
          styles.bossButton,
          pressed && !isOpeningBoss && styles.bossButtonPressed,
          isOpeningBoss && styles.bossButtonDisabled,
        ]}
      >

        <Text style={styles.bossButtonText}>
          {isOpeningBoss ? "Abriendo portales infernales..." : "Generar Boss semanal"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Contenedor Principal ---
  container: { // Fondo oscuro profesional
    backgroundColor: '#161920',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D323F',
    paddingVertical: 14,
    paddingHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 40,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 32,
    right: 32,
    height: 2,
    backgroundColor: '#3b82f6',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // --- Utilidades de Layout de Columnas ---
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelColumn: {
    alignItems: 'stretch', // Para que la barra de progreso ocupe el ancho
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: '#2D323F',
  },
  padRight: { paddingRight: 8 },
  padLeft: { paddingLeft: 12 },
  padHorizontal: { paddingHorizontal: 8 },
  bossButton: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bossButtonPressed: { backgroundColor: '#2563eb' },
  bossButtonDisabled: { backgroundColor: '#30363d' },
  bossButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },

  // --- Tipografía Global ---
  labelSmall: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    fontFamily: 'monospace', // Manteniendo tu estilo mono
    marginTop: 4,
  },
  valueTextAccent: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#adc6ff',
    fontFamily: 'monospace',
  },
  valueMuted: {
    fontWeight: 'normal',
    color: '#6B7280',
  },
  textOrange: { color: '#E76F00' },
  textRed: { color: '#f85149' },

  // --- Componentes Columna Energía ---
  energyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryIconContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  batteryTip: {
    width: 10,
    height: 4,
    backgroundColor: '#adc6ff',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  batteryBody: {
    width: 20,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#adc6ff',
    backgroundColor: '#0d1117',
    padding: 2,
    justifyContent: 'flex-end',
  },
  energySegment: {
    width: '100%',
    height: 6,
    borderRadius: 1,
    marginBottom: 2,
  },
  energyActive: { backgroundColor: '#adc6ff' },
  energyInactive: { backgroundColor: '#30363d' },
  energyTextContainer: {
    justifyContent: 'center',
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#243044',
    borderWidth: 1,
    borderColor: '#adc6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 9,
    color: '#adc6ff',
    fontFamily: 'monospace',
    marginLeft: 4,
  },

  // --- Componentes Columna Racha ---
  streakIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  streakCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCircleActive: {
    backgroundColor: '#332719',
    borderColor: '#E76F00',
  },
  streakCircleInactive: {
    backgroundColor: '#1b1517',
    borderColor: '#f85149',
  },
  overlayCenter: {

    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1E222B',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { borderColor: '#3b82f6' },
  badgeInactive: { borderColor: '#f85149' },

  // --- Componentes Columna Nivel ---
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#adc6ff',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#0d1117',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 1,
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  xpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#9CA3AF',
  },
  xpValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#adc6ff',
  },
});