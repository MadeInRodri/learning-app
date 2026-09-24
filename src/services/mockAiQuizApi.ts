import { AIQuizData } from "../store/aiQuizStore";

export interface ApiResponse<T> {
  status: number;
  error: boolean;
  jwt?: string;
  refresh_token?: string;
  message: string;
  payload: T;
}

export const fetchMockAiQuiz = async (): Promise<ApiResponse<AIQuizData>> => {
  // Simulación de latencia de red (1 segundo)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    status: 200,
    error: false,
    message: "Reto IA generado exitosamente.",
    payload: {
      contentType: "quizz",
      weekConcept: "Mutabilidad y Alcance de Variables",
      message: "Misión IA: Refuerza tus fallos recientes",
      rewardType: "XP",
      topics: [
        {
          id: 1,
          question:
            "Si declaras un array con 'const', ¿puedes agregarle nuevos elementos con .push()?",
          code: null,
          options: [
            { id: "A", description: "No, porque es una constante." },
            {
              id: "B",
              description: "Sí, 'const' no congela el interior del array.",
            },
            { id: "C", description: "Solo si usas 'let' en su lugar." },
            { id: "D", description: "Arrojará un TypeError." },
          ],
          correctAnswer: "B",
          explanation:
            "Con 'const' no puedes reasignar la variable entera, pero si es un Array o un Objeto, sus propiedades internas sí pueden modificarse.",
        },
        {
          id: 2,
          question: "¿Qué valor imprimirá este console.log?",
          code: "let x = 10;\nif (true) {\n  let x = 20;\n}\nconsole.log(x);",
          options: [
            { id: "A", description: "20" },
            { id: "B", description: "undefined" },
            { id: "C", description: "10" },
            { id: "D", description: "ReferenceError" },
          ],
          correctAnswer: "C",
          explanation:
            "La variable 'let' tiene un alcance de bloque. El 'x' dentro del if es independiente del 'x' exterior.",
        },
        {
          id: 3,
          question:
            "¿Cuál de estas opciones NO es un tipo de dato primitivo en JavaScript?",
          code: null,
          options: [
            { id: "A", description: "String" },
            { id: "B", description: "Boolean" },
            { id: "C", description: "Array" },
            { id: "D", description: "Number" },
          ],
          correctAnswer: "C",
          explanation:
            "Los Arrays y los Objetos son tipos de datos estructurales, no primitivos.",
        },
        {
          id: 4,
          question:
            "¿Qué ocurre si intentas acceder a una variable declarada con 'let' antes de su inicialización?",
          code: "console.log(edad);\nlet edad = 25;",
          options: [
            { id: "A", description: "Imprime 'undefined'." },
            { id: "B", description: "Lanza un ReferenceError." },
            { id: "C", description: "Imprime 'null'." },
            { id: "D", description: "Ignora la línea y continúa." },
          ],
          correctAnswer: "B",
          explanation:
            "A diferencia de 'var', las variables 'let' están en la 'Zona Muerta Temporal' hasta que la línea de inicialización se ejecuta.",
        },
      ],
    },
  };
};
