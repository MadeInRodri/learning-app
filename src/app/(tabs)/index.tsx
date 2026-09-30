import GamifiedHeader from "@/components/GamifiedHeader";
import { db } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";
import { useCourseStore } from "@/store/courseStore";
import { useProgressStore } from "@/store/progressStore";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useLanguageStore } from "../../store/languageStore";

export default function LearnScreen() {
  const { languages, isFetching, fetchLanguages } = useLanguageStore();
  const activeUser = useAuthStore((state) => state.activeUser);
  const progress = useProgressStore(
    (state) => state.progressCache[activeUser?.id ?? -1],
  );
  const [pathTotals, setPathTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (!languages.length) return;
    let cancelled = false;

    Promise.all(
      languages.map(async ({ id }) => [
        id,
        (await getDocs(collection(db, "languages", id, "paths"))).size,
      ] as const),
    )
      .then((totals) => {
        if (!cancelled) setPathTotals(Object.fromEntries(totals));
      })
      .catch((error) => console.error("Error cargando rutas:", error));

    return () => {
      cancelled = true;
    };
  }, [languages]);

  const handleSelectLanguage = (id: string, language: string) => {
    useCourseStore.getState().setActiveCourse(id, language);
    router.push("/(tabs)/path" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrapper}>
          <GamifiedHeader />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>
            Lenguajes disponibles
          </Text>
          <Text style={styles.subtitle}>
            Selecciona tu ruta de aprendizaje
          </Text>
        </View>

        {isFetching && languages.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {languages.map((lang) => {
              const completedPaths = progress?.completedPaths.filter((path) =>
                path.startsWith(`${lang.id}-`),
              ).length ?? 0;
              const courseProgress = pathTotals[lang.id]
                ? Math.min(100, Math.round((completedPaths / pathTotals[lang.id]) * 100))
                : 0;

              return (
                <Pressable
                  key={lang.id}
                  onPress={() => handleSelectLanguage(lang.id, lang.language)}
                  style={styles.card}
                >
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {lang.language.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.actionIcon}>
                    <MaterialIcons name="arrow-forward" size={16} color="#6B7280" />
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {lang.language}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    {courseProgress}% de modulos completados
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, { width: `${courseProgress}%` }]} />
                  </View>
                </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 24,
  },
  titleSection: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  loaderContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  gridContainer: {
    width: '100%',
    maxWidth: 500,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    
  },
  
  card: {
    width: '40%',
    aspectRatio: 0.95,
    backgroundColor: '#1E222B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D323F',
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  cardPressed: {
    backgroundColor: '#262B36',
    borderColor: '#3b82f6',
    transform: [{ scale: 0.96 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B2A42',
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#161920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    marginTop: 12,
  },
  cardTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#6B7280',
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardFooter: {
    marginTop: 12,
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#2D323F',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
});