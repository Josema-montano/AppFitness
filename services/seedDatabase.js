import { collection, doc, setDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== FUNCIÓN PARA LIMPIAR BASE DE DATOS ====================
export const limpiarBaseDeDatos = async () => {
  const colecciones = ['ejercicios', 'rutinas', 'trainers', 'categorias', 'browseCategories'];
  
  for (const nombreColeccion of colecciones) {
    const snapshot = await getDocs(collection(db, nombreColeccion));
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((documento) => {
      batch.delete(documento.ref);
    });
    
    await batch.commit();
    console.log(`✓ Colección '${nombreColeccion}' limpiada`);
  }
  
  console.log('=== Base de datos limpiada completamente ===');
};

// ==================== DATOS DE EJERCICIOS ====================
const ejerciciosData = [
  // Cardio
  { id: 'c1', nombre: 'Saltos de Tijera', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness', calorias: 8, categoria: 'Cardio', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnR3ejJkMWRkOW9wNHcwZDN3dm43YzJkOXdpeGEzNjMxcXJzdWk0ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ckMk3RKUK29lziaspI/giphy.gif' },
  { id: 'c2', nombre: 'Rodillas Altas', duracion: 30, musculo: 'Piernas', icono: 'walk', calorias: 7, categoria: 'Cardio', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODFlb3JvZmlqNmhtam16NGxpZmdmODhhNDV6b3ljazZhZm92ZDVnYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/62aGqZoUJYtPsl0Hb0/giphy.gif' },
  { id: 'c3', nombre: 'Burpees', duracion: 30, musculo: 'Cuerpo Completo', icono: 'barbell', calorias: 12, categoria: 'Cardio', gif: 'https://media.giphy.com/media/23hPPMRgPxbNBlPQe3/giphy.gif' },
  { id: 'c4', nombre: 'Escaladores', duracion: 30, musculo: 'Core', icono: 'trending-up', calorias: 10, categoria: 'Cardio', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExanowOGdyaGM3ZDZ2ZGRzeXY0M25tYWZpemtxNDhzNDZ0NnJzaDU3ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bWYc47O3jSef6/giphy.gif' },
  { id: 'c5', nombre: 'Skipping', duracion: 30, musculo: 'Piernas', icono: 'walk', calorias: 9, categoria: 'Cardio', gif: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExenRma3RpNjl4NHc4cTZlMng1NGF6MXU1emJnZHA1Z200ZnB6b2NudSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Jmal4FUrHggfITICnv/giphy.gif' },
  { id: 'c6', nombre: 'Jumping Jacks', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness', calorias: 8, categoria: 'Cardio', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnR3ejJkMWRkOW9wNHcwZDN3dm43YzJkOXdpeGEzNjMxcXJzdWk0ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ckMk3RKUK29lziaspI/giphy.gif' },
  // Fuerza
  { id: 'f1', nombre: 'Flexiones', duracion: 30, musculo: 'Pecho', icono: 'diamond', calorias: 6, categoria: 'Fuerza', gif: 'https://media.giphy.com/media/7YCC7NnFexWRFiYrFu/giphy.gif' },
  { id: 'f2', nombre: 'Sentadillas', duracion: 40, musculo: 'Piernas', icono: 'trending-down', calorias: 8, categoria: 'Fuerza ', gif: 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif' },
  { id: 'f3', nombre: 'Zancadas', duracion: 30, musculo: 'Piernas', icono: 'walk', calorias: 7, categoria: 'Fuerza', gif: 'https://media.giphy.com/media/3oz8xM1ZynfjCABAEo/giphy.gif' },
  { id: 'f4', nombre: 'Plancha', duracion: 45, musculo: 'Core', icono: 'remove', calorias: 5, categoria: 'Fuerza', gif: 'https://media.giphy.com/media/xT8qBff8cRRFf7k2u4/giphy.gif' },
  { id: 'f5', nombre: 'Fondos de Tríceps', duracion: 30, musculo: 'Brazos', icono: 'diamond', calorias: 5, categoria: 'Fuerza', gif: 'https://media.giphy.com/media/3oriO6qJiXajN0TyDu/giphy.gif' },
  { id: 'f6', nombre: 'Peso Muerto', duracion: 40, musculo: 'Espalda', icono: 'barbell', calorias: 9, categoria: 'Fuerza', gif: 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif' },
  { id: 'f7', nombre: 'Press de Hombros', duracion: 30, musculo: 'Hombros', icono: 'push', calorias: 6, categoria: 'Fuerza', gif: 'https://media.giphy.com/media/3o7TKFVl5Ls3DLmjBK/giphy.gif' },
  { id: 'f8', nombre: 'Dominadas', duracion: 30, musculo: 'Espalda', icono: 'arrow-up', calorias: 8, categoria: 'Fuerza', gif: 'https://media.giphy.com/media/xT8qB7Yqj5fmLLV1W8/giphy.gif' },
  // Flexibilidad
  { id: 'fl1', nombre: 'Estiramiento de Cuádriceps', duracion: 30, musculo: 'Piernas', icono: 'body', calorias: 2, categoria: 'Flexibilidad', gif: 'https://media.giphy.com/media/l3q2Ip7FrmPVDBulG/giphy.gif' },
  { id: 'fl2', nombre: 'Estiramiento de Isquiotibiales', duracion: 30, musculo: 'Piernas', icono: 'body', calorias: 2, categoria: 'Flexibilidad', gif: 'https://media.giphy.com/media/xT8qBvgKeMvMGSJNgA/giphy.gif' },
  { id: 'fl3', nombre: 'Postura del Niño', duracion: 45, musculo: 'Espalda', icono: 'flower', calorias: 1, categoria: 'Flexibilidad', gif: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif' },
  { id: 'fl4', nombre: 'Gato-Vaca', duracion: 30, musculo: 'Espalda', icono: 'git-branch', calorias: 2, categoria: 'Flexibilidad', gif: 'https://media.giphy.com/media/3oKIPavRPgJYaNI97W/giphy.gif' },
  { id: 'fl5', nombre: 'Mariposa', duracion: 30, musculo: 'Cadera', icono: 'leaf', calorias: 1, categoria: 'Flexibilidad', gif: 'https://media.giphy.com/media/xULW8MYvpNOfMXfDH2/giphy.gif' },
  { id: 'fl6', nombre: 'Torsión Espinal', duracion: 30, musculo: 'Core', icono: 'sync', calorias: 2, categoria: 'Flexibilidad', gif: 'https://media.giphy.com/media/3oKIPjHCmuXqdVvak0/giphy.gif' },
  // Core
  { id: 'co1', nombre: 'Abdominales Crunch', duracion: 30, musculo: 'Abdominales', icono: 'ellipse', calorias: 5, categoria: 'Core', gif: 'https://media.giphy.com/media/5t9IcXiBCyw60XPpGu/giphy.gif' },
  { id: 'co2', nombre: 'Plancha Lateral', duracion: 30, musculo: 'Oblicuos', icono: 'triangle', calorias: 4, categoria: 'Core', gif: 'https://media.giphy.com/media/3o6wrvdHFbwBrUFenu/giphy.gif' },
  { id: 'co3', nombre: 'Bicicleta', duracion: 30, musculo: 'Abdominales', icono: 'bicycle', calorias: 6, categoria: 'Core', gif: 'https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif' },
  { id: 'co4', nombre: 'Elevación de Piernas', duracion: 30, musculo: 'Abdominales', icono: 'trending-up', calorias: 5, categoria: 'Core', gif: 'https://media.giphy.com/media/3oKIPtjElfqwMOTbH2/giphy.gif' },
  { id: 'co5', nombre: 'Russian Twist', duracion: 30, musculo: 'Oblicuos', icono: 'refresh', calorias: 5, categoria: 'Core', gif: 'https://media.giphy.com/media/xULW8v7LtZrgcaGvC0/giphy.gif' },
  { id: 'co6', nombre: 'Dead Bug', duracion: 30, musculo: 'Core', icono: 'bug', calorias: 4, categoria: 'Core', gif: 'https://media.giphy.com/media/xT8qBit7YomT80d0M8/giphy.gif' },
];

// ==================== DATOS DE TRAINERS ====================
const trainersData = [
  {
    id: 'trainer1',
    nombre: 'José Maria Montaño',
    especialidad: 'Yoga & Flexibilidad',
    imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    bio: 'Instructor certificado con más de 10 años de experiencia en yoga y meditación. Especialista en técnicas de respiración y flexibilidad.',
    seguidores: '125K',
    entrenamientos: 24,
    rating: 4.9,
  },
  {
    id: 'trainer2',
    nombre: 'Jorge Aguilera',
    especialidad: 'HIIT & Cardio',
    imagen: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400',
    bio: 'Entrenador personal certificado especializado en entrenamientos de alta intensidad. Ex atleta profesional con pasión por transformar vidas.',
    seguidores: '89K',
    entrenamientos: 18,
    rating: 4.8,
  },
  {
    id: 'trainer3',
    nombre: 'Vladimir Lisarazu',
    especialidad: 'Fuerza & Musculación',
    imagen: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    bio: 'Coach de fuerza y acondicionamiento físico. Especialista en hipertrofia y entrenamiento funcional. Ayuda a construir cuerpos fuertes.',
    seguidores: '156K',
    entrenamientos: 32,
    rating: 4.9,
  },
];

// ==================== DATOS DE RUTINAS CON EJERCICIOS ====================
const rutinasData = [
  // Cardio
  { 
    id: 'r1',
    nombre: 'Entrenamiento HIIT', 
    duracion: '20 min', 
    nivel: 'Avanzado',
    categoria: 'Cardio',
    trainer: 'Jorge Aguilera',
    descripcion: 'Intervalos de alta intensidad para quemar grasa',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400',
    calorias: '250-350',
    destacada: true,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Saltos de Tijera', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnR3ejJkMWRkOW9wNHcwZDN3dm43YzJkOXdpeGEzNjMxcXJzdWk0ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ckMk3RKUK29lziaspI/giphy.gif' },
        { nombre: 'Rodillas Altas', duracion: 30, musculo: 'Piernas', icono: 'walk', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODFlb3JvZmlqNmhtam16NGxpZmdmODhhNDV6b3ljazZhZm92ZDVnYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/62aGqZoUJYtPsl0Hb0/giphy.gif' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Burpees', duracion: 40, musculo: 'Cuerpo Completo', icono: 'barbell', gif: 'https://media.giphy.com/media/23hPPMRgPxbNBlPQe3/giphy.gif' },
        { nombre: 'Escaladores', duracion: 40, musculo: 'Core', icono: 'trending-up', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExanowOGdyaGM3ZDZ2ZGRzeXY0M25tYWZpemtxNDhzNDZ0NnJzaDU3ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bWYc47O3jSef6/giphy.gif' },
        { nombre: 'Jumping Jacks', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnR3ejJkMWRkOW9wNHcwZDN3dm43YzJkOXdpeGEzNjMxcXJzdWk0ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ckMk3RKUK29lziaspI/giphy.gif' },
        { nombre: 'Sentadillas con Salto', duracion: 30, musculo: 'Piernas', icono: 'trending-up', gif: 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif' },
        { nombre: 'Flexiones Explosivas', duracion: 30, musculo: 'Pecho', icono: 'diamond', gif: 'https://media.giphy.com/media/7YCC7NnFexWRFiYrFu/giphy.gif' },
        { nombre: 'Sprints en el Sitio', duracion: 40, musculo: 'Piernas', icono: 'walk', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODFlb3JvZmlqNmhtam16NGxpZmdmODhhNDV6b3ljazZhZm92ZDVnYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/62aGqZoUJYtPsl0Hb0/giphy.gif' },
      ],
      'Enfriamiento': [
        { nombre: 'Estiramiento de Cuádriceps', duracion: 30, musculo: 'Piernas', icono: 'body', gif: 'https://media.giphy.com/media/l3q2Ip7FrmPVDBulG/giphy.gif' },
        { nombre: 'Respiración Profunda', duracion: 60, musculo: 'Mente', icono: 'leaf', gif: 'https://media.giphy.com/media/krP2NRkLqnKEg/giphy.gif' },
      ],
    },
  },
  { 
    id: 'r2',
    nombre: 'Running Indoor', 
    duracion: '30 min', 
    nivel: 'Intermedio',
    categoria: 'Cardio',
    trainer: 'Jorge Aguilera',
    descripcion: 'Mejora tu resistencia cardiovascular',
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400',
    calorias: '200-300',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Caminata en el Sitio', duracion: 60, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Círculos de Tobillos', duracion: 30, musculo: 'Tobillos', icono: 'refresh' },
        { nombre: 'Rodillas Altas Suaves', duracion: 30, musculo: 'Piernas', icono: 'walk' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Trote Suave', duracion: 120, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Carrera Moderada', duracion: 180, musculo: 'Piernas', icono: 'fitness' },
        { nombre: 'Sprints Cortos', duracion: 60, musculo: 'Piernas', icono: 'flash' },
        { nombre: 'Trote de Recuperación', duracion: 90, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Carrera Rápida', duracion: 120, musculo: 'Piernas', icono: 'fitness' },
        { nombre: 'Skipping', duracion: 60, musculo: 'Piernas', icono: 'trending-up' },
      ],
      'Enfriamiento': [
        { nombre: 'Caminata de Recuperación', duracion: 120, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Estiramiento de Gemelos', duracion: 45, musculo: 'Piernas', icono: 'body' },
        { nombre: 'Estiramiento de Isquiotibiales', duracion: 45, musculo: 'Piernas', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r3',
    nombre: 'Ciclo Potencia', 
    duracion: '25 min', 
    nivel: 'Principiante',
    categoria: 'Cardio',
    trainer: 'Vladimir Lisarazu',
    descripcion: 'Ciclismo indoor para todos los niveles',
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400',
    calorias: '180-250',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Pedaleo Suave', duracion: 120, musculo: 'Piernas', icono: 'bicycle' },
        { nombre: 'Movilidad de Cadera', duracion: 30, musculo: 'Cadera', icono: 'sync' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Pedaleo Moderado', duracion: 180, musculo: 'Piernas', icono: 'bicycle' },
        { nombre: 'Sprint en Bici', duracion: 45, musculo: 'Piernas', icono: 'flash' },
        { nombre: 'Pedaleo con Resistencia', duracion: 120, musculo: 'Piernas', icono: 'bicycle' },
        { nombre: 'Subida Simulada', duracion: 90, musculo: 'Piernas', icono: 'trending-up' },
        { nombre: 'Intervalos de Potencia', duracion: 60, musculo: 'Piernas', icono: 'bicycle' },
      ],
      'Enfriamiento': [
        { nombre: 'Pedaleo de Recuperación', duracion: 120, musculo: 'Piernas', icono: 'bicycle' },
        { nombre: 'Estiramiento de Cuádriceps', duracion: 45, musculo: 'Piernas', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r4',
    nombre: 'Cardio Dance', 
    duracion: '30 min', 
    nivel: 'Principiante',
    categoria: 'Cardio',
    trainer: 'José Maria Montaño',
    descripcion: 'Baila y quema calorías divirtiéndote',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    calorias: '220-320',
    destacada: true,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Marcha con Ritmo', duracion: 60, musculo: 'Cuerpo Completo', icono: 'musical-notes' },
        { nombre: 'Movimientos de Brazos', duracion: 30, musculo: 'Brazos', icono: 'hand-left' },
        { nombre: 'Pasos Laterales Básicos', duracion: 30, musculo: 'Piernas', icono: 'footsteps' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Coreografía Básica 1', duracion: 120, musculo: 'Cuerpo Completo', icono: 'musical-notes' },
        { nombre: 'Pasos de Salsa', duracion: 90, musculo: 'Piernas', icono: 'footsteps' },
        { nombre: 'Movimientos de Cadera', duracion: 60, musculo: 'Core', icono: 'sync' },
        { nombre: 'Coreografía Básica 2', duracion: 120, musculo: 'Cuerpo Completo', icono: 'musical-notes' },
        { nombre: 'Pasos de Merengue', duracion: 90, musculo: 'Piernas', icono: 'footsteps' },
        { nombre: 'Saltos con Ritmo', duracion: 60, musculo: 'Piernas', icono: 'fitness' },
      ],
      'Enfriamiento': [
        { nombre: 'Baile Suave', duracion: 60, musculo: 'Cuerpo Completo', icono: 'musical-notes' },
        { nombre: 'Estiramientos con Música', duracion: 60, musculo: 'Cuerpo Completo', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r5',
    nombre: 'Remo Intenso', 
    duracion: '20 min', 
    nivel: 'Intermedio',
    categoria: 'Cardio',
    trainer: 'Jorge Aguilera',
    descripcion: 'Entrenamiento completo de cuerpo',
    image: 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400',
    calorias: '200-280',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Remo Suave', duracion: 60, musculo: 'Cuerpo Completo', icono: 'boat' },
        { nombre: 'Movilidad de Hombros', duracion: 30, musculo: 'Hombros', icono: 'refresh' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Remo Moderado', duracion: 120, musculo: 'Espalda', icono: 'boat' },
        { nombre: 'Remo Potente', duracion: 60, musculo: 'Espalda', icono: 'boat' },
        { nombre: 'Intervalos de Remo', duracion: 90, musculo: 'Cuerpo Completo', icono: 'flash' },
        { nombre: 'Remo con Resistencia', duracion: 90, musculo: 'Espalda', icono: 'boat' },
        { nombre: 'Sprint de Remo', duracion: 45, musculo: 'Cuerpo Completo', icono: 'flash' },
      ],
      'Enfriamiento': [
        { nombre: 'Remo de Recuperación', duracion: 60, musculo: 'Cuerpo Completo', icono: 'boat' },
        { nombre: 'Estiramiento de Espalda', duracion: 45, musculo: 'Espalda', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r6',
    nombre: 'Agilidad Explosiva', 
    duracion: '28 min', 
    nivel: 'Intermedio',
    categoria: 'Cardio',
    trainer: 'José Maria Montaño',
    descripcion: 'Mejora tu agilidad y velocidad',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400',
    calorias: '200-280',
    destacada: false,
    topPick: true,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Saltos de Tijera', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness' },
        { nombre: 'Skipping Suave', duracion: 30, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Movilidad Articular', duracion: 30, musculo: 'Articulaciones', icono: 'sync' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Escalera de Agilidad', duracion: 60, musculo: 'Piernas', icono: 'footsteps' },
        { nombre: 'Cambios de Dirección', duracion: 45, musculo: 'Piernas', icono: 'git-branch' },
        { nombre: 'Saltos Laterales', duracion: 40, musculo: 'Piernas', icono: 'arrow-forward' },
        { nombre: 'Sprint Corto', duracion: 30, musculo: 'Piernas', icono: 'flash' },
        { nombre: 'Desplazamientos Laterales', duracion: 45, musculo: 'Piernas', icono: 'swap-horizontal' },
        { nombre: 'Saltos con Giro', duracion: 40, musculo: 'Cuerpo Completo', icono: 'refresh' },
      ],
      'Enfriamiento': [
        { nombre: 'Caminata de Recuperación', duracion: 60, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Estiramientos Dinámicos', duracion: 60, musculo: 'Cuerpo Completo', icono: 'body' },
      ],
    }
  },
  // Fuerza
  { 
    id: 'r7',
    nombre: 'Tren Superior Potente', 
    duracion: '30 min', 
    nivel: 'Intermedio',
    categoria: 'Fuerza',
    trainer: 'Vladimir Lisarazu',
    descripcion: 'Fortalece brazos, pecho y espalda',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    calorias: '150-220',
    destacada: true,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Círculos de Brazos', duracion: 30, musculo: 'Hombros', icono: 'refresh' },
        { nombre: 'Rotación de Hombros', duracion: 30, musculo: 'Hombros', icono: 'sync' },
        { nombre: 'Flexiones de Pared', duracion: 30, musculo: 'Pecho', icono: 'diamond' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Flexiones Clásicas', duracion: 45, musculo: 'Pecho', icono: 'diamond' },
        { nombre: 'Press de Hombros', duracion: 40, musculo: 'Hombros', icono: 'arrow-up' },
        { nombre: 'Remo con Mancuernas', duracion: 45, musculo: 'Espalda', icono: 'barbell' },
        { nombre: 'Curl de Bíceps', duracion: 40, musculo: 'Bíceps', icono: 'barbell' },
        { nombre: 'Extensión de Tríceps', duracion: 40, musculo: 'Tríceps', icono: 'diamond' },
        { nombre: 'Flexiones Diamante', duracion: 30, musculo: 'Tríceps', icono: 'diamond' },
        { nombre: 'Elevaciones Laterales', duracion: 35, musculo: 'Hombros', icono: 'arrow-up' },
      ],
      'Enfriamiento': [
        { nombre: 'Estiramiento de Pecho', duracion: 30, musculo: 'Pecho', icono: 'body' },
        { nombre: 'Estiramiento de Tríceps', duracion: 30, musculo: 'Tríceps', icono: 'body' },
        { nombre: 'Estiramiento de Espalda', duracion: 30, musculo: 'Espalda', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r8',
    nombre: 'Core de Acero', 
    duracion: '20 min', 
    nivel: 'Principiante',
    categoria: 'Fuerza',
    trainer: 'Jorge Aguilera',
    descripcion: 'Abdominales y core definido',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    calorias: '120-180',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Rotación de Tronco', duracion: 30, musculo: 'Core', icono: 'sync' },
        { nombre: 'Gato-Vaca', duracion: 30, musculo: 'Espalda', icono: 'git-branch' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Abdominales Crunch', duracion: 40, musculo: 'Abdominales', icono: 'ellipse' },
        { nombre: 'Plancha Frontal', duracion: 45, musculo: 'Core', icono: 'remove' },
        { nombre: 'Plancha Lateral Derecha', duracion: 30, musculo: 'Oblicuos', icono: 'triangle' },
        { nombre: 'Plancha Lateral Izquierda', duracion: 30, musculo: 'Oblicuos', icono: 'triangle' },
        { nombre: 'Bicicleta', duracion: 40, musculo: 'Abdominales', icono: 'bicycle' },
        { nombre: 'Elevación de Piernas', duracion: 35, musculo: 'Abdominales', icono: 'trending-up' },
        { nombre: 'Russian Twist', duracion: 40, musculo: 'Oblicuos', icono: 'refresh' },
      ],
      'Enfriamiento': [
        { nombre: 'Postura del Niño', duracion: 45, musculo: 'Espalda', icono: 'flower' },
        { nombre: 'Torsión Espinal', duracion: 30, musculo: 'Core', icono: 'sync' },
      ],
    }
  },
  { 
    id: 'r9',
    nombre: 'Full Body Power', 
    duracion: '40 min', 
    nivel: 'Avanzado',
    categoria: 'Fuerza',
    trainer: 'Vladimir Lisarazu',
    descripcion: 'Entrenamiento completo de fuerza',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    calorias: '250-350',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Saltos de Tijera', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness' },
        { nombre: 'Sentadillas sin Peso', duracion: 30, musculo: 'Piernas', icono: 'trending-down' },
        { nombre: 'Flexiones de Pared', duracion: 30, musculo: 'Pecho', icono: 'diamond' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Sentadillas con Peso', duracion: 45, musculo: 'Piernas', icono: 'barbell' },
        { nombre: 'Peso Muerto', duracion: 45, musculo: 'Espalda', icono: 'barbell' },
        { nombre: 'Press de Pecho', duracion: 40, musculo: 'Pecho', icono: 'barbell' },
        { nombre: 'Remo con Barra', duracion: 40, musculo: 'Espalda', icono: 'barbell' },
        { nombre: 'Zancadas con Peso', duracion: 40, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Press Militar', duracion: 35, musculo: 'Hombros', icono: 'arrow-up' },
        { nombre: 'Dominadas', duracion: 30, musculo: 'Espalda', icono: 'arrow-up' },
        { nombre: 'Flexiones con Peso', duracion: 30, musculo: 'Pecho', icono: 'diamond' },
      ],
      'Enfriamiento': [
        { nombre: 'Estiramiento Completo', duracion: 60, musculo: 'Cuerpo Completo', icono: 'body' },
        { nombre: 'Respiración Profunda', duracion: 45, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r10',
    nombre: 'Piernas de Titanio', 
    duracion: '30 min', 
    nivel: 'Intermedio',
    categoria: 'Fuerza',
    trainer: 'Vladimir Lisarazu',
    descripcion: 'Cuádriceps, glúteos y pantorrillas',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    calorias: '180-260',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Caminata en el Sitio', duracion: 30, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Círculos de Rodilla', duracion: 30, musculo: 'Rodillas', icono: 'refresh' },
        { nombre: 'Sentadillas Ligeras', duracion: 30, musculo: 'Piernas', icono: 'trending-down' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Sentadillas Profundas', duracion: 45, musculo: 'Cuádriceps', icono: 'trending-down' },
        { nombre: 'Zancadas Frontales', duracion: 40, musculo: 'Cuádriceps', icono: 'walk' },
        { nombre: 'Zancadas Laterales', duracion: 40, musculo: 'Aductores', icono: 'swap-horizontal' },
        { nombre: 'Puente de Glúteos', duracion: 40, musculo: 'Glúteos', icono: 'diamond' },
        { nombre: 'Elevación de Talones', duracion: 35, musculo: 'Pantorrillas', icono: 'trending-up' },
        { nombre: 'Sentadilla Sumo', duracion: 40, musculo: 'Glúteos', icono: 'trending-down' },
        { nombre: 'Step Ups', duracion: 40, musculo: 'Cuádriceps', icono: 'trending-up' },
      ],
      'Enfriamiento': [
        { nombre: 'Estiramiento de Cuádriceps', duracion: 30, musculo: 'Cuádriceps', icono: 'body' },
        { nombre: 'Estiramiento de Isquiotibiales', duracion: 30, musculo: 'Isquiotibiales', icono: 'body' },
        { nombre: 'Estiramiento de Glúteos', duracion: 30, musculo: 'Glúteos', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r11',
    nombre: 'Funcional Express', 
    duracion: '25 min', 
    nivel: 'Principiante',
    categoria: 'Fuerza',
    trainer: 'Jorge Aguilera',
    descripcion: 'Movimientos funcionales del día a día',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',
    calorias: '140-200',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Marcha en el Sitio', duracion: 30, musculo: 'Cuerpo Completo', icono: 'walk' },
        { nombre: 'Rotaciones de Tronco', duracion: 30, musculo: 'Core', icono: 'sync' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Sentadilla a Silla', duracion: 40, musculo: 'Piernas', icono: 'trending-down' },
        { nombre: 'Levantamiento de Objetos', duracion: 35, musculo: 'Espalda', icono: 'arrow-up' },
        { nombre: 'Empujes de Pared', duracion: 30, musculo: 'Pecho', icono: 'diamond' },
        { nombre: 'Subir Escalones', duracion: 45, musculo: 'Piernas', icono: 'trending-up' },
        { nombre: 'Alcances Cruzados', duracion: 35, musculo: 'Core', icono: 'git-branch' },
        { nombre: 'Levantarse del Suelo', duracion: 40, musculo: 'Cuerpo Completo', icono: 'arrow-up' },
      ],
      'Enfriamiento': [
        { nombre: 'Estiramientos Suaves', duracion: 45, musculo: 'Cuerpo Completo', icono: 'body' },
        { nombre: 'Respiración Consciente', duracion: 45, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r12',
    nombre: 'Estabilidad y Fuerza', 
    duracion: '34 min', 
    nivel: 'Avanzado',
    categoria: 'Fuerza',
    trainer: 'Vladimir Lisarazu',
    descripcion: 'Balance y potencia muscular',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    calorias: '180-260',
    destacada: false,
    topPick: true,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Balance en Una Pierna', duracion: 30, musculo: 'Piernas', icono: 'body' },
        { nombre: 'Movilidad de Cadera', duracion: 30, musculo: 'Cadera', icono: 'sync' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Sentadilla Búlgara', duracion: 45, musculo: 'Piernas', icono: 'trending-down' },
        { nombre: 'Plancha con Elevación', duracion: 40, musculo: 'Core', icono: 'remove' },
        { nombre: 'Peso Muerto Una Pierna', duracion: 40, musculo: 'Isquiotibiales', icono: 'barbell' },
        { nombre: 'Remo Unilateral', duracion: 35, musculo: 'Espalda', icono: 'barbell' },
        { nombre: 'Press con Balance', duracion: 35, musculo: 'Pecho', icono: 'diamond' },
        { nombre: 'Zancada con Rotación', duracion: 40, musculo: 'Core', icono: 'sync' },
        { nombre: 'Plancha Inestable', duracion: 45, musculo: 'Core', icono: 'remove' },
      ],
      'Enfriamiento': [
        { nombre: 'Estiramiento de Cadera', duracion: 30, musculo: 'Cadera', icono: 'body' },
        { nombre: 'Postura del Árbol', duracion: 45, musculo: 'Balance', icono: 'flower' },
      ],
    }
  },
  // Flexibilidad
  { 
    id: 'r13',
    nombre: 'Yoga Flow', 
    duracion: '30 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Secuencias fluidas para flexibilidad',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    calorias: '80-120',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Respiración Ujjayi', duracion: 60, musculo: 'Mente', icono: 'leaf' },
        { nombre: 'Gato-Vaca', duracion: 45, musculo: 'Espalda', icono: 'git-branch' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Saludo al Sol A', duracion: 120, musculo: 'Cuerpo Completo', icono: 'sunny' },
        { nombre: 'Perro Boca Abajo', duracion: 60, musculo: 'Espalda', icono: 'flower' },
        { nombre: 'Guerrero I', duracion: 45, musculo: 'Piernas', icono: 'body' },
        { nombre: 'Guerrero II', duracion: 45, musculo: 'Piernas', icono: 'body' },
        { nombre: 'Triángulo', duracion: 45, musculo: 'Costados', icono: 'triangle' },
        { nombre: 'Perro Boca Arriba', duracion: 45, musculo: 'Espalda', icono: 'flower' },
      ],
      'Enfriamiento': [
        { nombre: 'Postura del Niño', duracion: 60, musculo: 'Espalda', icono: 'flower' },
        { nombre: 'Savasana', duracion: 120, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r14',
    nombre: 'Estiramientos Profundos', 
    duracion: '20 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Mejora tu rango de movimiento',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    calorias: '60-100',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Rotaciones de Cuello', duracion: 30, musculo: 'Cuello', icono: 'refresh' },
        { nombre: 'Círculos de Hombros', duracion: 30, musculo: 'Hombros', icono: 'sync' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Estiramiento de Cuádriceps', duracion: 45, musculo: 'Cuádriceps', icono: 'body' },
        { nombre: 'Estiramiento de Isquiotibiales', duracion: 45, musculo: 'Isquiotibiales', icono: 'body' },
        { nombre: 'Mariposa', duracion: 60, musculo: 'Cadera', icono: 'leaf' },
        { nombre: 'Estiramiento de Cadera', duracion: 45, musculo: 'Cadera', icono: 'body' },
        { nombre: 'Torsión Espinal', duracion: 45, musculo: 'Espalda', icono: 'sync' },
        { nombre: 'Estiramiento de Hombros', duracion: 40, musculo: 'Hombros', icono: 'body' },
      ],
      'Enfriamiento': [
        { nombre: 'Postura del Niño', duracion: 60, musculo: 'Espalda', icono: 'flower' },
        { nombre: 'Respiración Profunda', duracion: 60, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r15',
    nombre: 'Recuperación Activa', 
    duracion: '15 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Post-entrenamiento perfecto',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400',
    calorias: '50-80',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Respiración Consciente', duracion: 45, musculo: 'Mente', icono: 'leaf' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Foam Rolling Piernas', duracion: 60, musculo: 'Piernas', icono: 'ellipse' },
        { nombre: 'Foam Rolling Espalda', duracion: 60, musculo: 'Espalda', icono: 'ellipse' },
        { nombre: 'Estiramiento Suave de Cadera', duracion: 45, musculo: 'Cadera', icono: 'body' },
        { nombre: 'Estiramiento de Pantorrillas', duracion: 40, musculo: 'Pantorrillas', icono: 'body' },
        { nombre: 'Movilidad de Tobillos', duracion: 30, musculo: 'Tobillos', icono: 'sync' },
      ],
      'Enfriamiento': [
        { nombre: 'Postura del Niño', duracion: 45, musculo: 'Espalda', icono: 'flower' },
        { nombre: 'Savasana', duracion: 90, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r16',
    nombre: 'Power Yoga', 
    duracion: '45 min', 
    nivel: 'Avanzado',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Yoga dinámico y desafiante',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    calorias: '150-220',
    destacada: true,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Respiración Kapalabhati', duracion: 60, musculo: 'Core', icono: 'leaf' },
        { nombre: 'Gato-Vaca Dinámico', duracion: 45, musculo: 'Espalda', icono: 'git-branch' },
        { nombre: 'Saludo al Sol A', duracion: 120, musculo: 'Cuerpo Completo', icono: 'sunny' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Saludo al Sol B', duracion: 180, musculo: 'Cuerpo Completo', icono: 'sunny' },
        { nombre: 'Chaturanga Flow', duracion: 60, musculo: 'Brazos', icono: 'remove' },
        { nombre: 'Guerrero III', duracion: 45, musculo: 'Balance', icono: 'body' },
        { nombre: 'Media Luna', duracion: 45, musculo: 'Balance', icono: 'moon' },
        { nombre: 'Cuervo', duracion: 30, musculo: 'Brazos', icono: 'body' },
        { nombre: 'Plancha Lateral Yoga', duracion: 45, musculo: 'Core', icono: 'triangle' },
        { nombre: 'Puente con Elevación', duracion: 45, musculo: 'Espalda', icono: 'trending-up' },
      ],
      'Enfriamiento': [
        { nombre: 'Paloma', duracion: 60, musculo: 'Cadera', icono: 'body' },
        { nombre: 'Torsión Reclinada', duracion: 45, musculo: 'Espalda', icono: 'sync' },
        { nombre: 'Savasana', duracion: 180, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r17',
    nombre: 'Meditación y Estiramiento', 
    duracion: '25 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Mente y cuerpo en armonía',
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400',
    calorias: '40-70',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Meditación Sentada', duracion: 180, musculo: 'Mente', icono: 'leaf' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Estiramiento de Cuello', duracion: 45, musculo: 'Cuello', icono: 'body' },
        { nombre: 'Estiramiento de Hombros', duracion: 45, musculo: 'Hombros', icono: 'body' },
        { nombre: 'Gato-Vaca Consciente', duracion: 60, musculo: 'Espalda', icono: 'git-branch' },
        { nombre: 'Mariposa Meditativa', duracion: 60, musculo: 'Cadera', icono: 'leaf' },
        { nombre: 'Torsión Suave', duracion: 45, musculo: 'Espalda', icono: 'sync' },
      ],
      'Enfriamiento': [
        { nombre: 'Postura del Niño', duracion: 90, musculo: 'Espalda', icono: 'flower' },
        { nombre: 'Meditación Final', duracion: 180, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r18',
    nombre: 'Yoga Restaurativo de Cuerpo Inferior', 
    duracion: '12 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Restaura y relaja tu cuerpo inferior',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    calorias: '40-60',
    destacada: true,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Respiración Diafragmática', duracion: 60, musculo: 'Mente', icono: 'leaf' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Piernas en la Pared', duracion: 90, musculo: 'Piernas', icono: 'body' },
        { nombre: 'Mariposa Reclinada', duracion: 90, musculo: 'Cadera', icono: 'leaf' },
        { nombre: 'Rodilla al Pecho', duracion: 60, musculo: 'Cadera', icono: 'body' },
        { nombre: 'Figura Cuatro Reclinada', duracion: 60, musculo: 'Glúteos', icono: 'body' },
      ],
      'Enfriamiento': [
        { nombre: 'Savasana', duracion: 120, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  // Rutinas adicionales de Trainers
  { 
    id: 'r19',
    nombre: 'HIIT Explosivo', 
    duracion: '20 min', 
    nivel: 'Avanzado',
    categoria: 'Cardio',
    trainer: 'Jorge Aguilera',
    descripcion: 'Intervalos de alta intensidad',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400',
    calorias: '250-350',
    destacada: true,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Jumping Jacks', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness' },
        { nombre: 'Rodillas Altas', duracion: 30, musculo: 'Piernas', icono: 'walk' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Burpees Explosivos', duracion: 45, musculo: 'Cuerpo Completo', icono: 'barbell' },
        { nombre: 'Saltos al Cajón', duracion: 40, musculo: 'Piernas', icono: 'trending-up' },
        { nombre: 'Flexiones con Palmada', duracion: 30, musculo: 'Pecho', icono: 'diamond' },
        { nombre: 'Sentadilla con Salto', duracion: 40, musculo: 'Piernas', icono: 'trending-up' },
        { nombre: 'Escaladores Rápidos', duracion: 40, musculo: 'Core', icono: 'trending-up' },
        { nombre: 'Sprints en el Sitio', duracion: 45, musculo: 'Piernas', icono: 'flash' },
      ],
      'Enfriamiento': [
        { nombre: 'Caminata de Recuperación', duracion: 60, musculo: 'Piernas', icono: 'walk' },
        { nombre: 'Estiramiento Rápido', duracion: 60, musculo: 'Cuerpo Completo', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r20',
    nombre: 'Tabata Extremo', 
    duracion: '15 min', 
    nivel: 'Avanzado',
    categoria: 'Cardio',
    trainer: 'Jorge Aguilera',
    descripcion: '20 segundos de trabajo, 10 de descanso',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400',
    calorias: '200-280',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Saltos Suaves', duracion: 30, musculo: 'Piernas', icono: 'fitness' },
        { nombre: 'Movilidad Articular', duracion: 30, musculo: 'Articulaciones', icono: 'sync' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Tabata: Burpees', duracion: 20, musculo: 'Cuerpo Completo', icono: 'barbell' },
        { nombre: 'Descanso', duracion: 10, musculo: 'Recuperación', icono: 'pause' },
        { nombre: 'Tabata: Escaladores', duracion: 20, musculo: 'Core', icono: 'trending-up' },
        { nombre: 'Descanso', duracion: 10, musculo: 'Recuperación', icono: 'pause' },
        { nombre: 'Tabata: Sentadillas Salto', duracion: 20, musculo: 'Piernas', icono: 'trending-up' },
        { nombre: 'Descanso', duracion: 10, musculo: 'Recuperación', icono: 'pause' },
        { nombre: 'Tabata: Flexiones', duracion: 20, musculo: 'Pecho', icono: 'diamond' },
        { nombre: 'Descanso', duracion: 10, musculo: 'Recuperación', icono: 'pause' },
      ],
      'Enfriamiento': [
        { nombre: 'Respiración de Recuperación', duracion: 60, musculo: 'Mente', icono: 'leaf' },
        { nombre: 'Estiramientos', duracion: 60, musculo: 'Cuerpo Completo', icono: 'body' },
      ],
    }
  },
  { 
    id: 'r21',
    nombre: 'Yoga Restaurativo', 
    duracion: '12 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Secuencia suave para relajar cuerpo y mente',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    calorias: '60-100',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Respiración 4-7-8', duracion: 60, musculo: 'Mente', icono: 'leaf' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Postura del Niño Extendida', duracion: 90, musculo: 'Espalda', icono: 'flower' },
        { nombre: 'Torsión Suave Reclinada', duracion: 60, musculo: 'Espalda', icono: 'sync' },
        { nombre: 'Piernas en la Pared', duracion: 90, musculo: 'Piernas', icono: 'body' },
        { nombre: 'Mariposa Reclinada', duracion: 60, musculo: 'Cadera', icono: 'leaf' },
      ],
      'Enfriamiento': [
        { nombre: 'Savasana con Manta', duracion: 120, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
  { 
    id: 'r22',
    nombre: 'Meditación Guiada', 
    duracion: '15 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    descripcion: 'Encuentra tu paz interior',
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400',
    calorias: '30-50',
    destacada: false,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Postura Cómoda', duracion: 60, musculo: 'Mente', icono: 'body' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Escaneo Corporal', duracion: 180, musculo: 'Mente', icono: 'leaf' },
        { nombre: 'Meditación de Respiración', duracion: 180, musculo: 'Mente', icono: 'leaf' },
        { nombre: 'Visualización Guiada', duracion: 180, musculo: 'Mente', icono: 'eye' },
      ],
      'Enfriamiento': [
        { nombre: 'Regreso Consciente', duracion: 60, musculo: 'Mente', icono: 'leaf' },
        { nombre: 'Gratitud Final', duracion: 60, musculo: 'Mente', icono: 'heart' },
      ],
    }
  },
  { 
    id: 'r23',
    nombre: 'Fuerza Total', 
    duracion: '30 min', 
    nivel: 'Intermedio',
    categoria: 'Fuerza',
    trainer: 'Vladimir Lisarazu',
    descripcion: 'Entrenamiento completo de fuerza',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    calorias: '200-280',
    destacada: true,
    topPick: false,
    ejercicios: {
      'Calentamiento': [
        { nombre: 'Rotación de Brazos', duracion: 30, musculo: 'Hombros', icono: 'refresh' },
        { nombre: 'Sentadillas sin Peso', duracion: 30, musculo: 'Piernas', icono: 'trending-down' },
        { nombre: 'Flexiones de Rodillas', duracion: 30, musculo: 'Pecho', icono: 'diamond' },
      ],
      'Entrenamiento Principal': [
        { nombre: 'Sentadillas con Peso', duracion: 45, musculo: 'Piernas', icono: 'barbell' },
        { nombre: 'Press de Pecho', duracion: 40, musculo: 'Pecho', icono: 'barbell' },
        { nombre: 'Remo con Barra', duracion: 40, musculo: 'Espalda', icono: 'barbell' },
        { nombre: 'Press de Hombros', duracion: 35, musculo: 'Hombros', icono: 'arrow-up' },
        { nombre: 'Curl de Bíceps', duracion: 30, musculo: 'Bíceps', icono: 'barbell' },
        { nombre: 'Extensión de Tríceps', duracion: 30, musculo: 'Tríceps', icono: 'diamond' },
        { nombre: 'Plancha con Peso', duracion: 45, musculo: 'Core', icono: 'remove' },
      ],
      'Enfriamiento': [
        { nombre: 'Estiramiento de Pecho', duracion: 30, musculo: 'Pecho', icono: 'body' },
        { nombre: 'Estiramiento de Espalda', duracion: 30, musculo: 'Espalda', icono: 'body' },
        { nombre: 'Respiración Profunda', duracion: 45, musculo: 'Mente', icono: 'leaf' },
      ],
    }
  },
];

// ==================== DATOS DE CATEGORÍAS (Browse Categories) ====================
const browseCategoriesData = [
  {
    id: 'bc1',
    nombre: 'Por Grupo Muscular',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
  },
  {
    id: 'bc2',
    nombre: 'Por Tipo de Entrenamiento',
    image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800',
  },
];

// ==================== DATOS DE SUBCATEGORÍAS ====================
const categoriasData = [
  // Por Grupo Muscular
  {
    id: 'cat1',
    nombre: 'Por Grupo Muscular',
    titulo: 'Por Grupo Muscular',
    subtitulo: 'Entrena músculos específicos',
    imagen: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
    subcategorias: [
      { 
        nombre: 'Pecho', 
        icono: 'diamond',
        imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
        entrenamientos: 8,
        rutinas: [
          { nombre: 'Press de Banca', duracion: '25 min', nivel: 'Intermedio', trainer: 'Vladimir Lisarazu', descripcion: 'Desarrolla tu pecho con técnica perfecta', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', calorias: '150-200' },
          { nombre: 'Flexiones Variadas', duracion: '15 min', nivel: 'Principiante', trainer: 'Jorge Aguilera', descripcion: 'Múltiples variaciones de flexiones', image: 'https://images.unsplash.com/photo-1598971639058-a2e87c3bb994?w=400', calorias: '100-150' },
        ]
      },
      { 
        nombre: 'Espalda', 
        icono: 'arrow-back',
        imagen: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400',
        entrenamientos: 10,
        rutinas: [
          { nombre: 'Dominadas Power', duracion: '20 min', nivel: 'Avanzado', trainer: 'Vladimir Lisarazu', descripcion: 'Domina las dominadas', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400', calorias: '120-180' },
          { nombre: 'Remo con Mancuernas', duracion: '25 min', nivel: 'Intermedio', trainer: 'Jorge Aguilera', descripcion: 'Fortalece tu espalda', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', calorias: '140-200' },
        ]
      },
      { 
        nombre: 'Piernas', 
        icono: 'body',
        imagen: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
        entrenamientos: 12,
        rutinas: [
          { nombre: 'Sentadillas Perfectas', duracion: '30 min', nivel: 'Intermedio', trainer: 'Vladimir Lisarazu', descripcion: 'Técnica perfecta de sentadillas', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400', calorias: '180-250' },
          { nombre: 'Piernas de Acero', duracion: '35 min', nivel: 'Avanzado', trainer: 'Jorge Aguilera', descripcion: 'Entrenamiento intenso de piernas', image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400', calorias: '200-280' },
        ]
      },
      { 
        nombre: 'Brazos', 
        icono: 'barbell',
        imagen: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
        entrenamientos: 9,
        rutinas: [
          { nombre: 'Bíceps & Tríceps', duracion: '25 min', nivel: 'Intermedio', trainer: 'Vladimir Lisarazu', descripcion: 'Brazos definidos', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400', calorias: '120-170' },
          { nombre: 'Arms Blaster', duracion: '20 min', nivel: 'Avanzado', trainer: 'Jorge Aguilera', descripcion: 'Destruye tus brazos', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400', calorias: '100-150' },
        ]
      },
      { 
        nombre: 'Abdominales', 
        icono: 'ellipse',
        imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
        entrenamientos: 15,
        rutinas: [
          { nombre: 'Six Pack Express', duracion: '15 min', nivel: 'Principiante', trainer: 'José Maria Montaño', descripcion: 'Abdominales marcados', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', calorias: '80-120' },
          { nombre: 'Core Destroyer', duracion: '25 min', nivel: 'Avanzado', trainer: 'Jorge Aguilera', descripcion: 'Entrenamiento intenso de core', image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400', calorias: '150-200' },
        ]
      },
      { 
        nombre: 'Glúteos', 
        icono: 'heart',
        imagen: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
        entrenamientos: 7,
        rutinas: [
          { nombre: 'Glúteos de Acero', duracion: '20 min', nivel: 'Intermedio', trainer: 'José Maria Montaño', descripcion: 'Tonifica y fortalece', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400', calorias: '130-180' },
          { nombre: 'Booty Builder', duracion: '30 min', nivel: 'Avanzado', trainer: 'Jorge Aguilera', descripcion: 'Construye glúteos perfectos', image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400', calorias: '160-220' },
        ]
      },
    ]
  },
  // Por Tipo de Entrenamiento
  {
    id: 'cat2',
    nombre: 'Por Tipo de Entrenamiento',
    titulo: 'Por Tipo de Entrenamiento',
    subtitulo: 'Elige tu estilo',
    imagen: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800',
    subcategorias: [
      { 
        nombre: 'HIIT', 
        icono: 'flash',
        imagen: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400',
        entrenamientos: 14,
        rutinas: [
          { nombre: 'HIIT Explosivo', duracion: '20 min', nivel: 'Avanzado', trainer: 'Jorge Aguilera', descripcion: 'Intervalos de alta intensidad', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400', calorias: '250-350' },
          { nombre: 'Tabata Fire', duracion: '15 min', nivel: 'Intermedio', trainer: 'Vladimir Lisarazu', descripcion: 'Protocolo Tabata clásico', image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400', calorias: '200-280' },
        ]
      },
      { 
        nombre: 'Yoga', 
        icono: 'body',
        imagen: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        entrenamientos: 18,
        rutinas: [
          { nombre: 'Yoga Flow', duracion: '30 min', nivel: 'Principiante', trainer: 'José Maria Montaño', descripcion: 'Secuencias fluidas', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', calorias: '80-120' },
          { nombre: 'Power Yoga', duracion: '45 min', nivel: 'Avanzado', trainer: 'José Maria Montaño', descripcion: 'Yoga dinámico', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400', calorias: '150-220' },
        ]
      },
      { 
        nombre: 'Cardio', 
        icono: 'heart',
        imagen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
        entrenamientos: 20,
        rutinas: [
          { nombre: 'Cardio Dance', duracion: '30 min', nivel: 'Principiante', trainer: 'José Maria Montaño', descripcion: 'Baila y quema calorías', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400', calorias: '220-320' },
          { nombre: 'Running Indoor', duracion: '25 min', nivel: 'Intermedio', trainer: 'Jorge Aguilera', descripcion: 'Mejora tu resistencia', image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400', calorias: '200-300' },
        ]
      },
      { 
        nombre: 'Fuerza', 
        icono: 'barbell',
        imagen: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
        entrenamientos: 22,
        rutinas: [
          { nombre: 'Full Body Power', duracion: '40 min', nivel: 'Avanzado', trainer: 'Vladimir Lisarazu', descripcion: 'Fuerza total', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', calorias: '250-350' },
          { nombre: 'Fuerza Funcional', duracion: '30 min', nivel: 'Intermedio', trainer: 'Vladimir Lisarazu', descripcion: 'Movimientos del día a día', image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400', calorias: '180-250' },
        ]
      },
      { 
        nombre: 'Pilates', 
        icono: 'git-branch',
        imagen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
        entrenamientos: 11,
        rutinas: [
          { nombre: 'Mat Pilates', duracion: '35 min', nivel: 'Principiante', trainer: 'José Maria Montaño', descripcion: 'Pilates en colchoneta', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400', calorias: '100-150' },
          { nombre: 'Power Pilates', duracion: '40 min', nivel: 'Intermedio', trainer: 'José Maria Montaño', descripcion: 'Pilates intenso', image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400', calorias: '130-180' },
        ]
      },
      { 
        nombre: 'Estiramientos', 
        icono: 'flower',
        imagen: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        entrenamientos: 16,
        rutinas: [
          { nombre: 'Stretching Completo', duracion: '20 min', nivel: 'Principiante', trainer: 'José Maria Montaño', descripcion: 'Estira todo el cuerpo', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', calorias: '50-80' },
          { nombre: 'Recuperación Activa', duracion: '15 min', nivel: 'Principiante', trainer: 'José Maria Montaño', descripcion: 'Post-entrenamiento', image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400', calorias: '40-60' },
        ]
      },
    ]
  },
];

// ==================== FUNCIÓN PRINCIPAL PARA POBLAR ====================
export const poblarBaseDeDatos = async () => {
  try {
    console.log('🚀 Iniciando población de la base de datos...');
    
    // Verificar si ya hay datos
    const ejerciciosRef = collection(db, 'ejercicios');
    const existingData = await getDocs(ejerciciosRef);
    
    if (!existingData.empty) {
      console.log('⚠️ La base de datos ya tiene datos. ¿Deseas sobrescribir?');
      // Continuar de todos modos para sobrescribir
    }
    
    // Poblar ejercicios
    console.log('📝 Poblando ejercicios...');
    for (const ejercicio of ejerciciosData) {
      await setDoc(doc(db, 'ejercicios', ejercicio.id), ejercicio);
    }
    console.log(`✅ ${ejerciciosData.length} ejercicios agregados`);
    
    // Poblar trainers
    console.log('👥 Poblando trainers...');
    for (const trainer of trainersData) {
      await setDoc(doc(db, 'trainers', trainer.id), trainer);
    }
    console.log(`✅ ${trainersData.length} trainers agregados`);
    
    // Poblar rutinas
    console.log('🏋️ Poblando rutinas...');
    for (const rutina of rutinasData) {
      await setDoc(doc(db, 'rutinas', rutina.id), rutina);
    }
    console.log(`✅ ${rutinasData.length} rutinas agregadas`);
    
    // Poblar browse categories
    console.log('📂 Poblando browse categories...');
    for (const category of browseCategoriesData) {
      await setDoc(doc(db, 'browseCategories', category.id), category);
    }
    console.log(`✅ ${browseCategoriesData.length} browse categories agregadas`);
    
    // Poblar categorías
    console.log('🗂️ Poblando categorías...');
    for (const categoria of categoriasData) {
      await setDoc(doc(db, 'categorias', categoria.id), categoria);
    }
    console.log(`✅ ${categoriasData.length} categorías agregadas`);
    
    console.log('🎉 ¡Base de datos poblada exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    throw error;
  }
};

export { ejerciciosData, trainersData, rutinasData, browseCategoriesData, categoriasData };
