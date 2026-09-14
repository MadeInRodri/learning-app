// src/app/lesson/quiz.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function QuizScreen() {
  // Estado para la opción seleccionada
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Datos simulados (quemados) extraídos de la lección "Aprendiendo lo básico"[cite: 3]
  const currentQuestion = {
    id: "q1",
    pregunta:
      "¿Qué palabra reservada se usa para declarar una variable cuyo valor NO va a cambiar?",
    opciones: [
      { texto: "let", es_correcta: false },
      { texto: "const", es_correcta: true },
      { texto: "var", es_correcta: false },
      { texto: "static", es_correcta: false },
    ],
    explicacion:
      "¡Correcto! 'const' se usa para valores constantes. 'let' permite reasignación y 'var' está obsoleto.",
  };

  return (
    <View className="flex-1 bg-[#0d1117]">
      {/* Header (No usamos el layout global aquí porque la UI del Quiz es inmersiva) */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-[#424754]/30 bg-[#0a0e14]">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-[#262a31] items-center justify-center border border-[#424754]">
            <Text className="text-gray-400 text-xs font-mono font-bold">
              MR
            </Text>
          </View>
          <Text className="text-white font-bold text-base">MadeInRodri</Text>
        </View>
        <Pressable
          onPress={() => router.back()} // Botón para salir del quiz
          className="w-10 h-10 rounded-full items-center justify-center active:bg-[#262a31] transition-colors"
        >
          <MaterialIcons name="close" size={24} color="#c2c6d6" />
        </Pressable>
      </View>

      {/* Main Content Canvas (Scrollable) */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Progress Track */}
        <View className="w-full h-1 bg-[#262a31]">
          <View className="h-full bg-[#ffb95f] w-[25%]" />
        </View>

        {/* Subtitle */}
        <View className="px-4 py-3 border-b border-[#424754]/30 bg-[#0a0e14]">
          <Text className="font-mono text-xs text-[#ffb95f] uppercase tracking-widest font-bold">
            Aprendiendo JS - Lección 1
          </Text>
        </View>

        {/* Quiz Question Area */}
        <View className="px-4 py-8 flex-1">
          <Text className="text-[24px] font-bold text-[#dfe2eb] tracking-tight mb-8 leading-9">
            {currentQuestion.pregunta}
          </Text>

          {/* Options */}
          <View className="flex flex-col gap-4">
            {currentQuestion.opciones.map((opcion, index) => {
              const isSelected = selectedOption === index;

              // Letras dinámicas (A, B, C, D)
              const letters = ["A", "B", "C", "D"];

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedOption(index)}
                  className={`w-full p-4 rounded-xl flex-row items-center border ${
                    isSelected
                      ? "bg-[#1c2026] border-[#adc6ff]"
                      : "bg-[#181c22] border-[#424754] active:bg-[#262a31]"
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border mr-4 ${
                      isSelected
                        ? "bg-[#4d8eff] border-transparent"
                        : "bg-[#262a31] border-[#424754]/50"
                    }`}
                  >
                    <Text
                      className={`font-mono text-xs font-bold ${
                        isSelected ? "text-[#00285d]" : "text-[#c2c6d6]"
                      }`}
                    >
                      {letters[index]}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 text-base ${
                      isSelected ? "text-[#dfe2eb] font-bold" : "text-[#c2c6d6]"
                    }`}
                  >
                    {opcion.texto}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Custom Bottom Action Bar */}
      <View className="absolute bottom-0 w-full p-4 bg-[#10141a] border-t border-[#424754]/50 flex-row gap-4 items-center z-50">
        {/* Left: Primary Action */}
        <Pressable
          className={`flex-1 py-4 rounded-xl flex-row items-center justify-center ${
            selectedOption !== null
              ? "bg-[#adc6ff] active:bg-[#4d8eff]"
              : "bg-[#1c2026] opacity-50"
          }`}
          disabled={selectedOption === null}
          onPress={() => console.log("Opción elegida:", selectedOption)}
        >
          <Text
            className={`font-bold text-base ${
              selectedOption !== null ? "text-[#002e6a]" : "text-[#8c909f]"
            }`}
          >
            Enviar
          </Text>
        </Pressable>

        {/* Right: Secondary/IA Action */}
        <Pressable
          className="bg-[#262a31] active:bg-[#31353c] border border-[#424754] py-4 px-5 rounded-xl flex-row items-center justify-center"
          onPress={() => console.log("Llamando a la IA...")}
        >
          <MaterialIcons name="auto-awesome" size={20} color="#adc6ff" />
          <Text className="text-[#adc6ff] font-bold ml-2">IA</Text>
        </Pressable>
      </View>
    </View>
  );
}
