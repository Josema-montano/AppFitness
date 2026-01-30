import { getRutinas, getCategorias, getTrainers } from './fitnessService';
import { CHATBOT_CONFIG } from '../config/chatbotConfig';

// Configuración de la API de OpenAI
const OPENAI_API_KEY = CHATBOT_CONFIG.OPENAI_API_KEY;
const OPENAI_API_URL = CHATBOT_CONFIG.API_URL;

// Cache de datos para el chatbot
let rutinasCache = null;
let categoriasCache = null;
let trainersCache = null;

// Cargar datos de rutinas para el contexto del chatbot
const cargarDatosRutinas = async () => {
  try {
    if (!rutinasCache) {
      rutinasCache = await getRutinas();
    }
    if (!categoriasCache) {
      categoriasCache = await getCategorias();
    }
    if (!trainersCache) {
      trainersCache = await getTrainers();
    }
    return { rutinas: rutinasCache, categorias: categoriasCache, trainers: trainersCache };
  } catch (error) {
    console.error('Error cargando datos para el chatbot:', error);
    return { rutinas: {}, categorias: {}, trainers: {} };
  }
};

// Formatear rutinas para el contexto del chatbot
const formatearRutinasParaContexto = (rutinas) => {
  let texto = 'RUTINAS DISPONIBLES EN LA APP:\n\n';
  
  Object.entries(rutinas).forEach(([categoria, listaRutinas]) => {
    texto += `📂 CATEGORÍA: ${categoria}\n`;
    listaRutinas.forEach(rutina => {
      texto += `  - "${rutina.nombre}" (ID: ${rutina.id})\n`;
      texto += `    • Nivel: ${rutina.nivel || 'No especificado'}\n`;
      texto += `    • Duración: ${rutina.duracion || 'No especificada'}\n`;
      texto += `    • Trainer: ${rutina.trainer || 'Sin trainer asignado'}\n`;
      texto += `    • Calorías: ${rutina.calorias || 'No especificadas'}\n`;
      if (rutina.descripcion) {
        texto += `    • Descripción: ${rutina.descripcion}\n`;
      }
      texto += '\n';
    });
  });
  
  return texto;
};

// Sistema de prompt para el chatbot
const generarSystemPrompt = (rutinasTexto) => {
  return `Eres FitBot, un asistente experto en fitness y entrenamiento personal para la aplicación FitnessApp. 
Tu objetivo es ayudar a los usuarios a encontrar las rutinas de ejercicio perfectas según sus necesidades, objetivos y nivel de experiencia.

INFORMACIÓN IMPORTANTE SOBRE TI:
- Eres amigable, motivador y profesional
- Conoces todas las rutinas disponibles en la aplicación
- Puedes recomendar rutinas basándote en:
  * Objetivos del usuario (perder peso, ganar músculo, mejorar flexibilidad, etc.)
  * Nivel de experiencia (principiante, intermedio, avanzado)
  * Tiempo disponible
  * Preferencias de tipo de ejercicio
  * Partes del cuerpo que quieren trabajar

REGLAS:
1. Siempre responde en español
2. Sé conciso pero informativo
3. Cuando recomiendes rutinas, usa EXACTAMENTE los nombres que aparecen en la lista
4. Si el usuario no especifica sus necesidades, hazle preguntas para entender mejor qué busca
5. Motiva al usuario y ofrece consejos de fitness cuando sea apropiado
6. Si no hay rutinas que coincidan exactamente, sugiere las más cercanas
7. Usa emojis de forma moderada para hacer la conversación más amigable

CATEGORÍAS DISPONIBLES:
- Cardio: Para quemar calorías y mejorar resistencia cardiovascular
- Fuerza: Para ganar músculo y aumentar la fuerza
- Flexibilidad: Para mejorar el rango de movimiento y prevenir lesiones
- HIIT: Entrenamiento de alta intensidad para quemar grasa rápidamente
- Yoga: Para equilibrio mental y físico, flexibilidad y relajación
- Core: Para fortalecer el abdomen y la zona media del cuerpo

${rutinasTexto}

Cuando el usuario pida recomendaciones, analiza sus necesidades y recomienda las rutinas más apropiadas de la lista anterior.
Si mencionas una rutina, incluye su nombre exacto para que el usuario pueda buscarla en la app.`;
};

// Mensajes predefinidos para respuestas offline o de fallback
const respuestasFallback = {
  saludo: '¡Hola! 👋 Soy FitBot, tu asistente de fitness. ¿En qué puedo ayudarte hoy? Puedo recomendarte rutinas basadas en tus objetivos, nivel de experiencia o el tiempo que tengas disponible.',
  error: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
  sinConexion: 'Parece que no tengo conexión en este momento. Por favor, verifica tu conexión a internet e intenta de nuevo.',
  ayuda: `Puedo ayudarte con:
  
🎯 **Recomendaciones personalizadas**: Dime tus objetivos y te sugiero rutinas
💪 **Por categoría**: Cardio, Fuerza, HIIT, Yoga, Flexibilidad, Core
⏱️ **Por tiempo**: Rutinas cortas, medianas o largas
📈 **Por nivel**: Principiante, Intermedio, Avanzado

Solo dime qué necesitas y te ayudo a encontrar la rutina perfecta para ti.`
};

// Función principal para enviar mensaje al chatbot
export const enviarMensajeAlChatbot = async (mensaje, historialConversacion = []) => {
  try {
    // Cargar datos de rutinas
    const { rutinas, categorias, trainers } = await cargarDatosRutinas();
    const rutinasTexto = formatearRutinasParaContexto(rutinas);
    
    // Construir mensajes para la API
    const mensajes = [
      { role: 'system', content: generarSystemPrompt(rutinasTexto) },
      ...historialConversacion.map(msg => ({
        role: msg.esUsuario ? 'user' : 'assistant',
        content: msg.texto
      })),
      { role: 'user', content: mensaje }
    ];

    // Llamar a la API de OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: CHATBOT_CONFIG.MODEL,
        messages: mensajes,
        max_tokens: CHATBOT_CONFIG.MAX_TOKENS,
        temperature: CHATBOT_CONFIG.TEMPERATURE
      })
    });

    if (!response.ok) {
      // Manejar error 429 (límite de solicitudes excedido)
      if (response.status === 429) {
        console.log('Límite de API excedido, usando respuestas locales...');
        const respuestaLocal = await generarRespuestaLocalConRutinas(mensaje);
        respuestaLocal.respuesta = '⚠️ *Estoy en modo offline por alta demanda*\n\n' + respuestaLocal.respuesta;
        return respuestaLocal;
      }
      throw new Error(`Error de API: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        exito: true,
        respuesta: data.choices[0].message.content,
        rutinasRelacionadas: extraerRutinasDelTexto(data.choices[0].message.content, rutinas)
      };
    } else {
      throw new Error('Respuesta vacía de la API');
    }
  } catch (error) {
    console.error('Error en chatbot:', error);
    
    // Intentar respuesta local si hay error - pero incluir rutinas recomendadas
    const respuestaLocal = await generarRespuestaLocalConRutinas(mensaje);
    return respuestaLocal;
  }
};

// Generar respuesta local cuando no hay conexión - CON rutinas recomendadas
const generarRespuestaLocalConRutinas = async (mensaje) => {
  const mensajeLower = mensaje.toLowerCase();
  
  // Cargar rutinas de Firebase para poder recomendarlas
  let rutinasParaRecomendar = [];
  try {
    const { rutinas } = await cargarDatosRutinas();
    const todasLasRutinas = Object.values(rutinas).flat();
    
    // Filtrar rutinas según el mensaje del usuario
    if (mensajeLower.includes('cardio') || mensajeLower.includes('correr') || mensajeLower.includes('resistencia')) {
      rutinasParaRecomendar = todasLasRutinas.filter(r => 
        r.categoria?.toLowerCase() === 'cardio' || 
        r.nombre?.toLowerCase().includes('cardio')
      ).slice(0, 4);
    } 
    else if (mensajeLower.includes('fuerza') || mensajeLower.includes('músculo') || mensajeLower.includes('musculo') || mensajeLower.includes('pesas')) {
      rutinasParaRecomendar = todasLasRutinas.filter(r => 
        r.categoria?.toLowerCase() === 'fuerza' || 
        r.nombre?.toLowerCase().includes('fuerza')
      ).slice(0, 4);
    }
    else if (mensajeLower.includes('adelgazar') || mensajeLower.includes('perder peso') || mensajeLower.includes('bajar') || mensajeLower.includes('quemar')) {
      rutinasParaRecomendar = todasLasRutinas.filter(r => 
        r.categoria?.toLowerCase() === 'hiit' || 
        r.categoria?.toLowerCase() === 'cardio' ||
        r.nombre?.toLowerCase().includes('hiit') ||
        r.nombre?.toLowerCase().includes('quemar')
      ).slice(0, 4);
    }
    else if (mensajeLower.includes('yoga') || mensajeLower.includes('relajar') || mensajeLower.includes('estrés') || mensajeLower.includes('flexibilidad')) {
      rutinasParaRecomendar = todasLasRutinas.filter(r => 
        r.categoria?.toLowerCase() === 'yoga' || 
        r.categoria?.toLowerCase() === 'flexibilidad' ||
        r.nombre?.toLowerCase().includes('yoga') ||
        r.nombre?.toLowerCase().includes('estira')
      ).slice(0, 4);
    }
    else if (mensajeLower.includes('principiante') || mensajeLower.includes('empezar') || mensajeLower.includes('inicio') || mensajeLower.includes('fácil')) {
      rutinasParaRecomendar = todasLasRutinas.filter(r => 
        r.nivel?.toLowerCase() === 'principiante' ||
        r.nivel?.toLowerCase() === 'fácil'
      ).slice(0, 4);
    }
    else if (mensajeLower.includes('hiit') || mensajeLower.includes('intenso') || mensajeLower.includes('rápido')) {
      rutinasParaRecomendar = todasLasRutinas.filter(r => 
        r.categoria?.toLowerCase() === 'hiit' ||
        r.nombre?.toLowerCase().includes('hiit')
      ).slice(0, 4);
    }
    else if (mensajeLower.includes('core') || mensajeLower.includes('abdomen') || mensajeLower.includes('abdominales')) {
      rutinasParaRecomendar = todasLasRutinas.filter(r => 
        r.categoria?.toLowerCase() === 'core' ||
        r.nombre?.toLowerCase().includes('abdomen') ||
        r.nombre?.toLowerCase().includes('core')
      ).slice(0, 4);
    }
    else if (mensajeLower.includes('recomienda') || mensajeLower.includes('sugieres') || mensajeLower.includes('rutina')) {
      // Si pregunta por recomendaciones generales, mostrar algunas destacadas
      rutinasParaRecomendar = todasLasRutinas.filter(r => r.destacada || r.topPick).slice(0, 4);
      if (rutinasParaRecomendar.length === 0) {
        rutinasParaRecomendar = todasLasRutinas.slice(0, 4);
      }
    }
  } catch (e) {
    console.log('No se pudieron cargar rutinas para recomendación local');
  }
  
  // Generar texto de respuesta
  let respuestaTexto = '';
  
  if (mensajeLower.includes('hola') || mensajeLower.includes('buenos') || mensajeLower.includes('hey')) {
    respuestaTexto = respuestasFallback.saludo;
  }
  else if (mensajeLower.includes('ayuda') || mensajeLower.includes('help') || mensajeLower.includes('qué puedes')) {
    respuestaTexto = respuestasFallback.ayuda;
  }
  else if (mensajeLower.includes('cardio') || mensajeLower.includes('correr')) {
    respuestaTexto = '🏃 ¡Excelente elección! El **cardio** es perfecto para mejorar tu resistencia y quemar calorías. Aquí te dejo algunas rutinas de cardio que te pueden interesar:';
  }
  else if (mensajeLower.includes('fuerza') || mensajeLower.includes('músculo') || mensajeLower.includes('musculo')) {
    respuestaTexto = '💪 Para **ganar fuerza y músculo**, estas rutinas son ideales. Trabajan los principales grupos musculares:';
  }
  else if (mensajeLower.includes('adelgazar') || mensajeLower.includes('perder peso') || mensajeLower.includes('bajar') || mensajeLower.includes('quemar')) {
    respuestaTexto = '🔥 Para **perder peso**, te recomiendo estas rutinas de HIIT y Cardio. Son las más efectivas para quemar calorías:';
  }
  else if (mensajeLower.includes('yoga') || mensajeLower.includes('relajar') || mensajeLower.includes('estrés')) {
    respuestaTexto = '🧘 El **Yoga** es perfecto para relajarse y mejorar la flexibilidad. Estas rutinas te ayudarán a desconectar:';
  }
  else if (mensajeLower.includes('principiante') || mensajeLower.includes('empezar') || mensajeLower.includes('inicio')) {
    respuestaTexto = '👋 ¡Bienvenido al mundo del fitness! Estas rutinas son perfectas para principiantes:';
  }
  else if (mensajeLower.includes('hiit') || mensajeLower.includes('intenso')) {
    respuestaTexto = '⚡ Las rutinas **HIIT** son entrenamientos de alta intensidad perfectos para quemar grasa. Aquí tienes algunas opciones:';
  }
  else if (mensajeLower.includes('core') || mensajeLower.includes('abdomen')) {
    respuestaTexto = '🎯 Para fortalecer el **core** y abdomen, estas rutinas son excelentes:';
  }
  else if (rutinasParaRecomendar.length > 0) {
    respuestaTexto = '🏋️ Basándome en lo que buscas, te recomiendo estas rutinas:';
  }
  else {
    respuestaTexto = '¿Podrías darme más detalles sobre lo que buscas? Por ejemplo:\n\n• ¿Cuál es tu objetivo? (perder peso, ganar músculo, flexibilidad)\n• ¿Cuánto tiempo tienes para entrenar?\n• ¿Cuál es tu nivel de experiencia?';
  }
  
  return {
    exito: true,
    respuesta: respuestaTexto,
    rutinasRelacionadas: rutinasParaRecomendar
  };
};

// Extraer rutinas mencionadas en la respuesta
const extraerRutinasDelTexto = (texto, rutinas) => {
  const rutinasEncontradas = [];
  
  Object.values(rutinas).forEach(listaRutinas => {
    listaRutinas.forEach(rutina => {
      if (texto.toLowerCase().includes(rutina.nombre.toLowerCase())) {
        rutinasEncontradas.push(rutina);
      }
    });
  });
  
  return rutinasEncontradas;
};

// Refrescar cache de datos
export const refrescarCacheChatbot = async () => {
  rutinasCache = null;
  categoriasCache = null;
  trainersCache = null;
  await cargarDatosRutinas();
};

// Obtener sugerencias rápidas para el usuario
export const obtenerSugerenciasRapidas = () => {
  return [
    '¿Qué rutina me recomiendas para perder peso?',
    'Quiero ganar músculo, ¿qué me sugieres?',
    'Tengo 20 minutos, ¿qué puedo hacer?',
    'Soy principiante, ¿por dónde empiezo?',
    '¿Cuáles son las mejores rutinas de HIIT?',
    'Necesito una rutina para relajarme'
  ];
};

// Mensaje de bienvenida del chatbot
export const obtenerMensajeBienvenida = () => {
  return {
    id: 'welcome',
    texto: `¡Hola! 👋 Soy **FitBot**, tu asistente personal de fitness.

Estoy aquí para ayudarte a encontrar la rutina perfecta según tus necesidades. Puedo recomendarte entrenamientos basados en:

🎯 Tus objetivos (perder peso, ganar músculo, flexibilidad...)
⏱️ El tiempo que tengas disponible
💪 Tu nivel de experiencia
🏋️ El tipo de ejercicio que prefieras

¿En qué puedo ayudarte hoy?`,
    esUsuario: false,
    timestamp: new Date().toISOString()
  };
};
