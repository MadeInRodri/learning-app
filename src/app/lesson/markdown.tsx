import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Markdown from "react-native-markdown-display";

// EL MARKDOWN PA PROBAR
const lessonContent = `
# Introducción a JavaScript

¡Bienvenido a tu primera lección! Hoy aprenderemos sobre las **variables** y los **tipos de datos** fundamentales.

## 1. ¿Qué es una variable?
Imagina que una variable es una "caja" donde puedes guardar información para usarla después. En JavaScript moderno, utilizamos dos palabras clave principales:

* \`let\`: Para valores que van a cambiar en el futuro.
* \`const\`: Para valores que serán constantes y no cambiarán.
* ~~\`var\`~~: (Una forma antigua, ¡trata de no usarla!).

## 2. Ejemplo en código

Mira cómo declaramos un par de variables:

\`\`\`javascript
// Declaramos la edad y el nombre
let edad = 25;
const nombre = "MadeInRodri";

// Como usamos 'let', podemos actualizar la edad:
edad = 26; 

// Si intentamos reasignar 'nombre', JS nos dará un error.
\`\`\`

> **Nota:** ¡Siempre es buena práctica usar \`const\` por defecto a menos que sepas que el valor va a cambiar!
`;

export default function MarkdownLessonScreen() {
  return (
    <View className="flex-1 bg-[#0d1117]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800 bg-[#0d1117]">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#181c22] border border-gray-700 items-center justify-center active:bg-gray-700 transition-colors"
        >
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>
        <Text className="text-white font-bold text-lg">Teoría</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="w-full max-w-md mx-auto pt-6 pb-24">
          {/* 2. Componente que renderiza el Markdown */}
          <Markdown style={markdownStyles}>{lessonContent}</Markdown>

          {/* Botón de Continuar */}
          <Pressable
            onPress={() => router.push("/lesson/quiz" as any)}
            className="w-full mt-8 bg-blue-600 active:bg-blue-700 rounded-lg py-4 flex-row items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <Text className="text-white font-bold mr-2 text-base">
              ¡Entendido! Ir al Quiz
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: "#dfe2eb",
    fontSize: 16,
    lineHeight: 26,
  },
  heading1: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 16,
  },
  heading2: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 16,
  },
  strong: {
    color: "#adc6ff",
    fontWeight: "bold",
  },
  list_item: {
    marginBottom: 8,
  },
  // Estilo para el código en línea `let`
  code_inline: {
    backgroundColor: "#1e1e1e",
    color: "#ffb786",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: "monospace",
    overflow: "hidden",
  },
  // Estilo para el bloque de código grande ```javascript
  fence: {
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    fontFamily: "monospace",
    color: "#c2c6d6",
  },
  blockquote: {
    backgroundColor: "#161b22",
    borderLeftColor: "#3b82f6",
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 16,
    borderRadius: 4,
  },
});
