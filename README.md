# AppFitness

AppFitness es una aplicación móvil para la gestión de rutinas de ejercicio, entrenadores y administración de usuarios, con integración de chatbot IA para recomendaciones personalizadas.

## Características principales
- Registro e inicio de sesión de usuarios
- Visualización y creación de rutinas de ejercicio
- Administración de categorías, rutinas, ejercicios y entrenadores (panel admin)
- Chatbot con IA (OpenAI) para sugerencias de rutinas
- Soporte para modo offline con respuestas predefinidas

## Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/Josema-montano/AppFitness.git
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tu API Key de OpenAI:
   - Abre `config/chatbotConfig.js`
   - Reemplaza `'TU_API_KEY_AQUI'` por tu clave real de OpenAI

4. (Opcional) Configura Firebase en `config/firebase.js` si usas autenticación o base de datos en la nube.

5. Ejecuta la app:
   ```bash
   npm start
   ```

## Manual de usuario

### Inicio de sesión y registro
- Abre la app y selecciona "Iniciar sesión" o "Registrarse".
- Ingresa tus datos y accede a la pantalla principal.

### Navegación principal
- **Home:** Acceso rápido a rutinas destacadas y chatbot.
- **Rutinas:** Explora, filtra y visualiza rutinas de ejercicio.
- **Crear Rutina:** Crea tus propias rutinas personalizadas.
- **Chatbot:** Haz preguntas sobre ejercicios o pide recomendaciones.
- **Contacto:** Información de contacto y soporte.

### Panel de administración
- Accede como administrador para gestionar categorías, rutinas, ejercicios y entrenadores.
- Usa las pantallas bajo `screens/admin/` para cada módulo de administración.

### Chatbot IA
- Ve a la pantalla de Chatbot.
- Escribe tu pregunta o pide una rutina personalizada.
- Si tienes una API Key válida de OpenAI, recibirás respuestas inteligentes.
- Si no tienes API Key, el chatbot responderá con mensajes predefinidos.

## Contribución
¡Las contribuciones son bienvenidas! Haz un fork, crea una rama y envía tu pull request.

## Licencia
Este proyecto está bajo la licencia MIT.

---

**Desarrollado por Josema Montaño y colaboradores.**
