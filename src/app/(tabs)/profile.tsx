import EnergyTimerButton from "@/components/EnergyTimerButton";
import { api } from "@/config/api";
import { useAuthStore } from "@/store/authStore";
import { calculateLevelInfo } from "@/store/gamificationStore";
import { TokenStorage } from "@/store/tokenStore";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const { activeUser, logout } = useAuthStore();

  // Desestructuramos el nivel y el progreso en tiempo real usando la XP del backend
  const { level, currentXP, maxXP, progress } = calculateLevelInfo(
    activeUser?.xpTotales,
  );

  const handleLogout = async () => {
    try {
      if (activeUser?.id) {
        const refreshToken = await TokenStorage.getRefreshToken();

        await api.get("/logout", {
          params: { id: activeUser.id },
          headers: { "x-refresh-token": refreshToken },
        });
      }
    } catch (error) {
      console.error("Error cerrando sesión en backend", error);
    } finally {
      // Independientemente de si el backend falla, matamos la sesión local
      await TokenStorage.clearTokens();
      logout();
      router.replace("/(auth)/login" as any);
    }
  };

  // Previene crasheos si la vista se renderiza un microsegundo antes de redirigir al login
  if (!activeUser) return null;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#0d1117",
        paddingHorizontal: 16,
        paddingTop: 40,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 384,
          marginHorizontal: "auto",
          paddingBottom: 96,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Tu perfil
        </Text>

        {/* Cabecera del Perfil */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 9999,
              borderWidth: 2,
              borderColor: "#374151",
              backgroundColor: "#161b22",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <Text
              style={{
                color: "#9ca3af",
                fontFamily: "monospace",
                fontSize: 20,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              {activeUser.nombre.substring(0, 2)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: 4,
              }}
            >
              {activeUser.nombre}
            </Text>
            <Text style={{ fontSize: 14, color: "#9ca3af", marginBottom: 12 }}>
              {activeUser.email}
            </Text>

            {/* Barra de Nivel Algorítmica */}
            <View style={{ width: "100%" }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#9ca3af",
                  marginBottom: 4,
                }}
              >
                Lvl {level}{" "}
                <Text style={{ color: "#4b5563" }}>
                  ({currentXP}/{maxXP} XP)
                </Text>
              </Text>
              <View
                style={{
                  width: 160,
                  height: 6,
                  backgroundColor: "#1f2937",
                  borderRadius: 9999,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    backgroundColor: "#fb923c",
                    borderRadius: 9999,
                  }}
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Tarjeta de Estadísticas (Valores devueltos por la API) */}
        <View
          style={{
            backgroundColor: "#181c22",
            borderWidth: 1,
            borderColor: "#1f2937",
            borderRadius: 12,
            padding: 20,
            marginBottom: 32,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#1f2937",
              paddingBottom: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#9ca3af" }}>Energía Máxima</Text>
            <Text style={{ color: "#34d399", fontWeight: "700" }}>
              {activeUser.energiaBalance} ⚡
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#1f2937",
              paddingBottom: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#9ca3af" }}>Estrellas Acumuladas</Text>
            <Text style={{ color: "#facc15", fontWeight: "700" }}>
              {activeUser.estrellasBalance} ⭐
            </Text>
          </View>

          {/* Oculto por si las móscas */}

          {/* <View style={{"flexDirection":"row","justifyContent":"space-between","alignItems":"center","borderBottomWidth":1,"borderColor":"#1f2937","paddingBottom":12,"marginBottom":12}}>
            <Text style={{"color":"#9ca3af"}}>Ayudas de IA Restantes</Text>
            <Text style={{"color":"#c084fc","fontWeight":"700"}}>
              {activeUser.aiPistaBalance} 🤖
            </Text>
          </View>

          <View style={{"flexDirection":"row","justifyContent":"space-between","alignItems":"center","marginBottom":20}}>
            <Text style={{"color":"#9ca3af"}}>Protectores de Racha</Text>
            <Text style={{"color":"#60a5fa","fontWeight":"700"}}>
              {activeUser.protectorRachaBalance} 🛡️
            </Text>
          </View> */}

          <View style={{ alignItems: "flex-end" }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#f97316",
                backgroundColor: "#f97316",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                EXPERIENCIA TOTAL: {activeUser.xpTotales} XP
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={{ gap: 16 }}>
          {/* <Pressable
            onPress={() => router.push("/testing-gamification" as any)}
            style={{"width":"100%","paddingVertical":16,"borderWidth":1,"borderColor":"#fb923c","borderRadius":8,"alignItems":"center","justifyContent":"center"}}
          >
            <Text style={{"color":"#fb923c","fontWeight":"700"}}>Testing API</Text>
          </Pressable> */}
          <EnergyTimerButton></EnergyTimerButton>

          <Pressable
            onPress={() => router.push("/achievements" as any)}
            style={{
              width: "100%",
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: "#a855f7",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#c084fc", fontWeight: "700" }}>
              Catálogo de recompensas
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={{
              width: "100%",
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: "#ef4444",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#ef4444", fontWeight: "700" }}>
              Cerrar Sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
