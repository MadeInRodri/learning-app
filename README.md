# Learning App (CodeQuest)

## Integrantes del grupo

- **(MR230247)** Rodrigo Alexis Mejía Rivas
- **(FC230433)** Leonardo Enrique Flores Coto
- **(FM230331)** Bryan Josué Fuentes Molina
- **(PD230540)** Andre Emanuel Preza Deras
- **(MM230272)** Joaquín Eduardo Morán Mejía

## Descripción del Proyecto

El proyecto consiste en el desarrollo de una aplicación multiplataforma (móvil y web) orientada al aprendizaje interactivo de lenguajes de programación. Inspirada en modelos de gamificación, la plataforma ofrece rutas de aprendizaje estructuradas, un sistema de retención mediante rachas diarias y evaluaciones al final de cada sesión.

El valor diferenciador de la aplicación radica en la integración de un tutor virtual inteligente impulsado por la API de Gemini, el cual actúa de forma contextual a la lección actual del usuario.

## Características Principales

- **Rutas de Aprendizaje:** Cursos divididos por lenguajes de programación (Python, JS, React, PHP) y estructurados en módulos.
- **Teoría en Markdown:** Lecciones teóricas renderizadas dinámicamente con soporte para bloques de código embebido.
- **Quizzes Interactivos:** Pruebas de opción múltiple al final de cada lección con retroalimentación inmediata sobre respuestas correctas o incorrectas.
- **Gamificación Profunda:**
  - Sistema de rachas, puntos de experiencia (XP) y niveles.
  - Misiones diarias.
  - Insignias y logros coleccionables.
- **Diseño Minimalista:** Interfaz en modo oscuro inspirada en la paleta de colores de Visual Studio Code y GitHub, con retroalimentación visual basada en colores de estado.

## Stack Tecnológico

### Frontend

- **React Native & Expo:** Desarrollo híbrido y empaquetado del proyecto.
- **Expo Router:** Enrutamiento basado en archivos para la navegación principal, pestañas (Tabs) y modales.
- **TypeScript:** Tipado estático para mayor escalabilidad.
- **Tailwind CSS (NativeWind):** Estilización rápida y responsiva para vistas móviles y web.
- **Zustand & MMKV:** Gestión de estado global y almacenamiento local ultrarrápido para caché de cursos y sesión.
- **React Hook Form:** Manejo y validación de formularios de autenticación.

### Backend & Almacenamiento

- **Firebase (Firestore):** Base de datos documental utilizada para inyectar todo el contenido estático estructurado (rutas, lecciones teóricas en Markdown y quizzes).
- **Node.js & MySQL:** API REST relacional encargada de gestionar la seguridad (JWT), usuarios, estadísticas, estado de rachas, misiones diarias y tokens IA.

## Instalación y Configuración Local

1. Clonar el repositorio.
2. Instalar las dependencias del frontend:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (\`.env\`) para la conexión con Firebase, Laravel y la API de Gemini.
4. Levantar el entorno de desarrollo (con limpieza de caché para cargar estilos y dependencias nativas):
   ```bash
   npx expo start -c
   ```
