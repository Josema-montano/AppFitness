// Configuración del Chatbot con IA
// IMPORTANTE: Antes de usar el chatbot, necesitas obtener una API key de OpenAI
// 1. Ve a https://platform.openai.com/
// 2. Crea una cuenta o inicia sesión
// 3. Ve a API Keys y crea una nueva key
// 4. Reemplaza 'TU_API_KEY_AQUI' con tu key real

export const CHATBOT_CONFIG = {
  // API Key de OpenAI - ¡NUNCA compartas esta key públicamente!
  // Configura tu API key en una variable de entorno o reemplaza aquí
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'TU_API_KEY_AQUI',
  
  // Modelo a usar (puedes cambiar a 'gpt-4' para respuestas más avanzadas)
  MODEL: 'gpt-3.5-turbo',
  
  // Número máximo de tokens en la respuesta
  MAX_TOKENS: 500,
  
  // Temperatura (0 = más determinístico, 1 = más creativo)
  TEMPERATURE: 0.7,
  
  // URL de la API de OpenAI
  API_URL: 'https://api.openai.com/v1/chat/completions'
};

// Alternativa gratuita: Si no tienes API key de OpenAI,
// el chatbot funcionará en modo offline con respuestas predefinidas
// que aún son útiles para recomendar rutinas.
