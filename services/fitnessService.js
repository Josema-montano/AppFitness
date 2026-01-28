import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== EJERCICIOS ====================
export const getEjercicios = async () => {
  try {
    const ejerciciosRef = collection(db, 'ejercicios');
    const snapshot = await getDocs(ejerciciosRef);
    
    const ejerciciosPorCategoria = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const categoria = data.categoria;
      
      if (!ejerciciosPorCategoria[categoria]) {
        ejerciciosPorCategoria[categoria] = [];
      }
      
      ejerciciosPorCategoria[categoria].push({
        id: doc.id,
        ...data
      });
    });
    
    return ejerciciosPorCategoria;
  } catch (error) {
    console.error('Error obteniendo ejercicios:', error);
    throw error;
  }
};

export const getEjerciciosPorCategoria = async (categoria) => {
  try {
    const ejerciciosRef = collection(db, 'ejercicios');
    const q = query(ejerciciosRef, where('categoria', '==', categoria));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo ejercicios por categoría:', error);
    throw error;
  }
};

// ==================== RUTINAS ====================
export const getRutinas = async () => {
  try {
    const rutinasRef = collection(db, 'rutinas');
    const snapshot = await getDocs(rutinasRef);
    
    const rutinasPorCategoria = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const categoria = data.categoria;
      
      if (!rutinasPorCategoria[categoria]) {
        rutinasPorCategoria[categoria] = [];
      }
      
      rutinasPorCategoria[categoria].push({
        id: doc.id,
        ...data
      });
    });
    
    return rutinasPorCategoria;
  } catch (error) {
    console.error('Error obteniendo rutinas:', error);
    throw error;
  }
};

export const getRutinasPorCategoria = async (categoria) => {
  try {
    const rutinasRef = collection(db, 'rutinas');
    const q = query(rutinasRef, where('categoria', '==', categoria));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo rutinas por categoría:', error);
    throw error;
  }
};

export const getRutinasDestacadas = async () => {
  try {
    const rutinasRef = collection(db, 'rutinas');
    const q = query(rutinasRef, where('destacada', '==', true));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo rutinas destacadas:', error);
    throw error;
  }
};

export const getTopPicks = async () => {
  try {
    const rutinasRef = collection(db, 'rutinas');
    const q = query(rutinasRef, where('topPick', '==', true));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo top picks:', error);
    throw error;
  }
};

// ==================== TRAINERS ====================
export const getTrainers = async () => {
  try {
    const trainersRef = collection(db, 'trainers');
    const snapshot = await getDocs(trainersRef);
    
    const trainersMap = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      trainersMap[data.nombre] = {
        id: doc.id,
        ...data
      };
    });
    
    return trainersMap;
  } catch (error) {
    console.error('Error obteniendo trainers:', error);
    throw error;
  }
};

export const getTrainerByName = async (nombre) => {
  try {
    const trainersRef = collection(db, 'trainers');
    const q = query(trainersRef, where('nombre', '==', nombre));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error obteniendo trainer:', error);
    throw error;
  }
};

export const getRutinasByTrainer = async (trainerNombre) => {
  try {
    const rutinasRef = collection(db, 'rutinas');
    const q = query(rutinasRef, where('trainer', '==', trainerNombre));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo rutinas del trainer:', error);
    throw error;
  }
};

// ==================== CATEGORÍAS ====================
export const getCategorias = async () => {
  try {
    const categoriasRef = collection(db, 'categorias');
    const snapshot = await getDocs(categoriasRef);
    
    const categoriasMap = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      categoriasMap[data.nombre] = {
        id: doc.id,
        ...data
      };
    });
    
    return categoriasMap;
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw error;
  }
};

export const getCategoriaByNombre = async (nombre) => {
  try {
    const categoriasRef = collection(db, 'categorias');
    const q = query(categoriasRef, where('nombre', '==', nombre));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    throw error;
  }
};

// ==================== BROWSE CATEGORIES ====================
export const getBrowseCategories = async () => {
  try {
    const browseCategoriesRef = collection(db, 'browseCategories');
    const snapshot = await getDocs(browseCategoriesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo browse categories:', error);
    throw error;
  }
};

// ==================== RUTINAS PERSONALIZADAS DEL USUARIO ====================
export const guardarRutinaPersonalizada = async (userId, rutina) => {
  try {
    const rutinaRef = doc(collection(db, 'usuarios', userId, 'misRutinas'));
    const rutinaData = {
      ...rutina,
      id: rutinaRef.id,
      fechaCreacion: new Date().toISOString(),
      esPersonalizada: true
    };
    
    await setDoc(rutinaRef, rutinaData);
    return rutinaData;
  } catch (error) {
    console.error('Error guardando rutina personalizada:', error);
    throw error;
  }
};

export const getMisRutinas = async (userId) => {
  try {
    const misRutinasRef = collection(db, 'usuarios', userId, 'misRutinas');
    const snapshot = await getDocs(misRutinasRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo mis rutinas:', error);
    throw error;
  }
};

export const eliminarRutinaPersonalizada = async (userId, rutinaId) => {
  try {
    await deleteDoc(doc(db, 'usuarios', userId, 'misRutinas', rutinaId));
  } catch (error) {
    console.error('Error eliminando rutina personalizada:', error);
    throw error;
  }
};

// ==================== FAVORITOS DEL USUARIO ====================
export const guardarFavorito = async (userId, rutina) => {
  try {
    const favoritoRef = doc(db, 'usuarios', userId, 'favoritos', rutina.id || rutina.nombre.replace(/\s+/g, '_'));
    await setDoc(favoritoRef, {
      ...rutina,
      fechaAgregado: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error guardando favorito:', error);
    throw error;
  }
};

export const getFavoritos = async (userId) => {
  try {
    const favoritosRef = collection(db, 'usuarios', userId, 'favoritos');
    const snapshot = await getDocs(favoritosRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    throw error;
  }
};

export const eliminarFavorito = async (userId, rutinaId) => {
  try {
    await deleteDoc(doc(db, 'usuarios', userId, 'favoritos', rutinaId));
  } catch (error) {
    console.error('Error eliminando favorito:', error);
    throw error;
  }
};

// ==================== STATS DEL USUARIO ====================
export const actualizarEstadisticas = async (userId, stats) => {
  try {
    const userRef = doc(db, 'usuarios', userId);
    await updateDoc(userRef, stats);
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    throw error;
  }
};
