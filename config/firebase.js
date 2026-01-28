import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔥 TU NUEVA CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCKwDdXi78260aXyy-AcXxT-5qRr-WHQ1E",
  authDomain: "proyectofinal-b7c38.firebaseapp.com",
  projectId: "proyectofinal-b7c38",
  storageBucket: "proyectofinal-b7c38.firebasestorage.app",
  messagingSenderId: "878964343114",
  appId: "1:878964343114:web:1e1fb4cf2ee166f93941b3"
  // measurementId NO se usa en Expo
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Inicializar Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
