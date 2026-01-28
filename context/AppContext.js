import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { 
  getEjercicios, 
  getRutinas, 
  getRutinasDestacadas,
  getTopPicks,
  getTrainers,
  getCategorias,
  getBrowseCategories,
  guardarFavorito,
  getFavoritos,
  eliminarFavorito,
  guardarRutinaPersonalizada,
  getMisRutinas as getMisRutinasFromDB,
  eliminarRutinaPersonalizada
} from '../services/fitnessService';

const AppContext = createContext();

// Ejercicios por defecto (fallback si no hay conexión)
const ejerciciosDefault = {
  'Cardio': [
    { id: 'c1', nombre: 'Saltos de Tijera', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness', calorias: 8 },
    { id: 'c2', nombre: 'Rodillas Altas', duracion: 30, musculo: 'Piernas', icono: 'walk', calorias: 7 },
    { id: 'c3', nombre: 'Burpees', duracion: 30, musculo: 'Cuerpo Completo', icono: 'barbell', calorias: 12 },
  ],
  'Fuerza': [
    { id: 'f1', nombre: 'Flexiones', duracion: 30, musculo: 'Pecho', icono: 'diamond', calorias: 6 },
    { id: 'f2', nombre: 'Sentadillas', duracion: 40, musculo: 'Piernas', icono: 'trending-down', calorias: 8 },
  ],
  'Flexibilidad': [
    { id: 'fl1', nombre: 'Estiramiento de Cuádriceps', duracion: 30, musculo: 'Piernas', icono: 'body', calorias: 2 },
  ],
  'Core': [
    { id: 'co1', nombre: 'Abdominales Crunch', duracion: 30, musculo: 'Abdominales', icono: 'ellipse', calorias: 5 },
  ],
};

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'admin@fitnessapp.com',
  'admin@admin.com',
  // Agregar más emails de administradores aquí
];

export const AppProvider = ({ children }) => {
  // Estado de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('usuario'); // 'admin' o 'usuario'
  const [isLoading, setIsLoading] = useState(true);
  
  // Rutinas favoritas
  const [favoritos, setFavoritos] = useState([]);
  
  // Rutinas personalizadas creadas por el usuario
  const [misRutinas, setMisRutinas] = useState([]);
  
  // Datos cargados desde Firebase
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState(ejerciciosDefault);
  const [rutinasDB, setRutinasDB] = useState({});
  const [rutinasDestacadas, setRutinasDestacadas] = useState([]);
  const [topPicks, setTopPicksData] = useState([]);
  const [trainersDB, setTrainersDB] = useState({});
  const [categoriasDB, setCategoriasDB] = useState({});
  const [browseCategoriesDB, setBrowseCategoriesDB] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar datos desde Firebase
  const loadFirebaseData = useCallback(async () => {
    try {
      console.log('📡 Cargando datos desde Firebase...');
      
      const [
        ejerciciosData,
        rutinasData,
        destacadasData,
        topPicksData,
        trainersData,
        categoriasData,
        browseCategoriesData
      ] = await Promise.all([
        getEjercicios(),
        getRutinas(),
        getRutinasDestacadas(),
        getTopPicks(),
        getTrainers(),
        getCategorias(),
        getBrowseCategories()
      ]);
      
      if (Object.keys(ejerciciosData).length > 0) {
        setEjerciciosDisponibles(ejerciciosData);
      }
      if (Object.keys(rutinasData).length > 0) {
        setRutinasDB(rutinasData);
      }
      if (destacadasData.length > 0) {
        setRutinasDestacadas(destacadasData);
      }
      if (topPicksData.length > 0) {
        setTopPicksData(topPicksData);
      }
      if (Object.keys(trainersData).length > 0) {
        setTrainersDB(trainersData);
      }
      if (Object.keys(categoriasData).length > 0) {
        setCategoriasDB(categoriasData);
      }
      if (browseCategoriesData.length > 0) {
        setBrowseCategoriesDB(browseCategoriesData);
      }
      
      setDataLoaded(true);
      console.log('✅ Datos cargados desde Firebase');
    } catch (error) {
      console.error('❌ Error cargando datos desde Firebase:', error);
      setDataLoaded(true); // Marcar como cargado para usar datos por defecto
    }
  }, []);

  // Cargar datos de Firebase al iniciar
  useEffect(() => {
    loadFirebaseData();
  }, [loadFirebaseData]);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado - cargar datos del usuario desde Firestore
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          
          // Determinar el rol del usuario
          const isAdminEmail = ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase());
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // El rol puede estar guardado en Firestore o determinarse por email
            const role = userData.rol || (isAdminEmail ? 'admin' : 'usuario');
            setUserRole(role);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              nombre: userData.nombre || firebaseUser.displayName || firebaseUser.email.split('@')[0],
              avatar: userData.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100',
              nivel: userData.nivel || 'Principiante',
              entrenamientosCompletados: userData.entrenamientosCompletados || 0,
              caloriasQuemadas: userData.caloriasQuemadas || 0,
              minutosActivo: userData.minutosActivo || 0,
              fechaRegistro: userData.fechaRegistro || new Date().toISOString(),
              rol: role,
            });
          } else {
            // El usuario existe en Auth pero no en Firestore (crear documento)
            const role = isAdminEmail ? 'admin' : 'usuario';
            setUserRole(role);
            
            const newUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              nombre: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100',
              nivel: 'Principiante',
              entrenamientosCompletados: 0,
              caloriasQuemadas: 0,
              minutosActivo: 0,
              fechaRegistro: new Date().toISOString(),
              rol: role,
            };
            await setDoc(doc(db, 'usuarios', firebaseUser.uid), newUserData);
            setUser(newUserData);
          }
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error cargando datos del usuario:', error);
          // Usar datos básicos si falla Firestore
          const role = ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase()) ? 'admin' : 'usuario';
          setUserRole(role);
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100',
            nivel: 'Principiante',
            entrenamientosCompletados: 0,
            caloriasQuemadas: 0,
            minutosActivo: 0,
            fechaRegistro: new Date().toISOString(),
            rol: role,
          });
          setIsLoggedIn(true);
        }
      } else {
        // Usuario no autenticado
        setUser(null);
        setUserRole('usuario');
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedFavoritos = await AsyncStorage.getItem('favoritos');
      const storedMisRutinas = await AsyncStorage.getItem('misRutinas');
      
      if (storedFavoritos) {
        setFavoritos(JSON.parse(storedFavoritos));
      }
      if (storedMisRutinas) {
        setMisRutinas(JSON.parse(storedMisRutinas));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  // Login con Firebase
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // El estado se actualiza automáticamente por onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña';
          break;
        default:
          errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  };

  // Registro con Firebase
  const register = async (email, password, nombre) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Actualizar el perfil con el nombre
      await updateProfile(firebaseUser, {
        displayName: nombre
      });
      
      // Determinar el rol (admin si el email está en la lista)
      const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'usuario';
      
      // Crear documento del usuario en Firestore
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        nombre: nombre,
        avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100',
        nivel: 'Principiante',
        entrenamientosCompletados: 0,
        caloriasQuemadas: 0,
        minutosActivo: 0,
        fechaRegistro: new Date().toISOString(),
        rol: role,
      };
      
      await setDoc(doc(db, 'usuarios', firebaseUser.uid), userData);
      
      return firebaseUser;
    } catch (error) {
      let errorMessage = 'Error al registrarse';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        default:
          errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  };

  // Logout con Firebase
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // El estado se actualiza automáticamente por onAuthStateChanged
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }, []);

  // Agregar/quitar de favoritos
  const toggleFavorito = async (rutina) => {
    let newFavoritos;
    const exists = favoritos.find(f => f.id === rutina.id || f.nombre === rutina.nombre);
    
    if (exists) {
      newFavoritos = favoritos.filter(f => f.id !== rutina.id && f.nombre !== rutina.nombre);
    } else {
      const rutinaConId = {
        ...rutina,
        id: rutina.id || `fav_${Date.now()}`,
        fechaAgregado: new Date().toISOString(),
      };
      newFavoritos = [...favoritos, rutinaConId];
    }
    
    setFavoritos(newFavoritos);
    await AsyncStorage.setItem('favoritos', JSON.stringify(newFavoritos));
  };

  // Verificar si es favorito
  const isFavorito = (rutina) => {
    return favoritos.some(f => f.id === rutina.id || f.nombre === rutina.nombre);
  };

  // Crear nueva rutina personalizada
  const crearRutina = async (rutina) => {
    const nuevaRutina = {
      ...rutina,
      id: `custom_${Date.now()}`,
      fechaCreacion: new Date().toISOString(),
      esPersonalizada: true,
      trainer: user?.nombre || 'Tú',
    };
    
    const newMisRutinas = [...misRutinas, nuevaRutina];
    setMisRutinas(newMisRutinas);
    await AsyncStorage.setItem('misRutinas', JSON.stringify(newMisRutinas));
    return nuevaRutina;
  };

  // Eliminar rutina personalizada
  const eliminarRutinaLocal = async (rutinaId) => {
    const newMisRutinas = misRutinas.filter(r => r.id !== rutinaId);
    setMisRutinas(newMisRutinas);
    await AsyncStorage.setItem('misRutinas', JSON.stringify(newMisRutinas));
    
    // También eliminar de Firebase si el usuario está logueado
    if (user?.id) {
      try {
        await eliminarRutinaPersonalizada(user.id, rutinaId);
      } catch (error) {
        console.error('Error eliminando rutina de Firebase:', error);
      }
    }
  };

  // Actualizar stats del usuario
  const updateUserStats = async (stats) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      entrenamientosCompletados: user.entrenamientosCompletados + (stats.entrenamientos || 0),
      caloriasQuemadas: user.caloriasQuemadas + (stats.calorias || 0),
      minutosActivo: user.minutosActivo + (stats.minutos || 0),
    };
    
    setUser(updatedUser);
    
    // Actualizar en Firestore
    try {
      await setDoc(doc(db, 'usuarios', user.id), updatedUser, { merge: true });
    } catch (error) {
      console.error('Error actualizando stats:', error);
    }
  };

  // Cargar favoritos y rutinas del usuario desde Firebase
  const loadUserDataFromFirebase = useCallback(async (userId) => {
    try {
      const [favoritosData, misRutinasData] = await Promise.all([
        getFavoritos(userId),
        getMisRutinasFromDB(userId)
      ]);
      
      if (favoritosData.length > 0) {
        setFavoritos(favoritosData);
        await AsyncStorage.setItem('favoritos', JSON.stringify(favoritosData));
      }
      
      if (misRutinasData.length > 0) {
        setMisRutinas(misRutinasData);
        await AsyncStorage.setItem('misRutinas', JSON.stringify(misRutinasData));
      }
    } catch (error) {
      console.error('Error cargando datos del usuario desde Firebase:', error);
    }
  }, []);

  // Recargar datos desde Firebase
  const reloadData = useCallback(async () => {
    await loadFirebaseData();
    if (user?.id) {
      await loadUserDataFromFirebase(user.id);
    }
  }, [loadFirebaseData, loadUserDataFromFirebase, user?.id]);

  // Función helper para verificar si es admin
  const isAdmin = userRole === 'admin';

  return (
    <AppContext.Provider value={{
      // Auth
      isLoggedIn,
      isLoading,
      user,
      userRole,
      isAdmin,
      login,
      register,
      logout,
      
      // Favoritos
      favoritos,
      toggleFavorito,
      isFavorito,
      
      // Mis Rutinas
      misRutinas,
      crearRutina,
      eliminarRutina: eliminarRutinaLocal,
      
      // Stats
      updateUserStats,
      
      // Data desde Firebase
      ejerciciosDisponibles,
      rutinasDB,
      rutinasDestacadas,
      topPicks,
      trainersDB,
      categoriasDB,
      browseCategoriesDB,
      dataLoaded,
      
      // Recargar datos
      reloadData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;