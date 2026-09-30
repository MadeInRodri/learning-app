import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useCourseStore } from "../../store/courseStore";

export default function PathScreen() {
  const { activeCourseId, activeCourseName, lessons, isFetching, fetchPath } =
    useCourseStore();

  // 1. Hook optimizado: evitamos que se dispare sin control
  useFocusEffect(
    useCallback(() => {
      if (activeCourseId) {
        fetchPath();
      }
    }, [activeCourseId]), // <-- Asegúrate de que fetchPath esté memoizado en tu store de Zustand
  );

  if (!activeCourseId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0d1117",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <MaterialIcons
          name="alt-route"
          size={64}
          color="#374151"
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Aún no tienes una ruta
        </Text>
        <Text
          style={{ color: "#9ca3af", textAlign: "center", marginBottom: 24 }}
        >
          Ve a la pestaña Aprender y selecciona un lenguaje.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)" as any)}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#1d4ed8" : "#2563eb",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            },
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>
            Explorar lenguajes
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0d1117" }}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      // 2. FUNDAMENTAL: Evita que el ScrollView cancele los toques simples
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          width: "100%",
          maxWidth: 384,
          paddingHorizontal: 16,
          paddingTop: 40,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 32,
            letterSpacing: -0.25,
          }}
        >
          Aprendiendo {activeCourseName}
        </Text>

        {isFetching && lessons.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#3b82f6"
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={{ alignItems: "center", width: "100%" }}>
            {lessons.map((lesson, index) => {
              let borderCard: ViewStyle = { borderColor: "#1f2937" };
              let borderCircle: ViewStyle = { borderColor: "#374151" };
              let bgCircle: ViewStyle = { backgroundColor: "#1f2937" };
              let textTitle: TextStyle = { color: "#6b7280" };
              let textNumber: TextStyle = { color: "#6b7280" };
              let iconName: any = "lock";
              let iconColor = "#ef4444";

              if (lesson.state === "completed") {
                borderCard = { borderColor: "#374151" };
                borderCircle = { borderColor: "#4b5563" };
                bgCircle = { backgroundColor: "#1f2937" };
                textTitle = { color: "#ffffff" };
                textNumber = { color: "#9ca3af" };
                iconName = "check-circle";
                iconColor = "#9ca3af";
              } else if (lesson.state === "in-progress") {
                borderCard = { borderColor: "#3b82f6" };
                borderCircle = { borderColor: "#3b82f6" };
                bgCircle = { backgroundColor: "#3b82f6" };
                textTitle = { color: "#60a5fa" };
                textNumber = { color: "#fff" };
                iconName = "play-circle-filled";
                iconColor = "#3b82f6";
              }

              return (
                <View
                  key={lesson.id}
                  style={{ width: "100%", alignItems: "center" }}
                >
                  <Pressable
                    onPress={() => {
                      if (lesson.state !== "locked") {
                        // 3. Ya no necesitas el setTimeout molesto
                        router.push(`/course/${lesson.id}` as any);
                      }
                    }}
                    style={({ pressed }) => [
                      {
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: "#181c22",
                        borderWidth: 2,
                      },
                      borderCard,
                      pressed && lesson.state !== "locked"
                        ? { transform: [{ scale: 0.95 }] }
                        : undefined,
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={[
                          {
                            width: 40,
                            height: 40,
                            borderRadius: 9999,
                            borderWidth: 2,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 16,
                          },
                          borderCircle,
                          bgCircle,
                        ]}
                      >
                        <Text
                          style={[
                            {
                              fontFamily: "monospace",
                              fontSize: 12,
                              fontWeight: "700",
                            },
                            textNumber,
                          ]}
                        >
                          {lesson.number}
                        </Text>
                      </View>
                      <Text
                        style={[{ fontSize: 16, fontWeight: "700" }, textTitle]}
                      >
                        {lesson.title}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={iconName}
                      size={24}
                      color={iconColor}
                    />
                  </Pressable>

                  {index < lessons.length - 1 && (
                    <View
                      style={{
                        width: 2,
                        height: 32,
                        backgroundColor: "#374151",
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
