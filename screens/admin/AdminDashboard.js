import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { poblarBaseDeDatos, limpiarBaseDeDatos } from '../../services/seedDatabase';
import { useApp } from '../../context/AppContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function AdminDashboard({ navigation }) {
  const { reloadData, rutinasDB, trainersDB, ejerciciosDisponibles, logout, user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [stats, setStats] = useState({
    rutinas: 0,
    ejercicios: 0,
    trainers: 0,
    categorias: 0,
    usuarios: 0
  });

  useEffect(() => {
    loadStats();
  }, [rutinasDB, trainersDB, ejerciciosDisponibles]);

  const loadStats = async () => {
    try {
      // Contar rutinas
      const rutinasSnap = await getDocs(collection(db, 'rutinas'));
      const ejerciciosSnap = await getDocs(collection(db, 'ejercicios'));
      const trainersSnap = await getDocs(collection(db, 'trainers'));
      const categoriasSnap = await getDocs(collection(db, 'categorias'));
      
      setStats({
        rutinas: rutinasSnap.size,
        ejercicios: ejerciciosSnap.size,
        trainers: trainersSnap.size,
        categorias: categoriasSnap.size,
        usuarios: 0
      });
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const handleReloadData = async () => {
    setIsReloading(true);
    try {
      await reloadData();
      await loadStats();
      setResultado({ success: true, message: '¡Datos recargados!' });
    } catch (error) {
      setResultado({ success: false, message: error.message });
    } finally {
      setIsReloading(false);
    }
  };

  const handleLimpiarDB = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        '⚠️ Limpiar Base de Datos',
        '¿Estás seguro? Esta acción no se puede deshacer.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Borrar Todo', style: 'destructive', onPress: ejecutarLimpieza }
        ]
      );
    } else if (window.confirm('⚠️ ¿Borrar TODOS los datos?')) {
      ejecutarLimpieza();
    }
  };

  const ejecutarLimpieza = async () => {
    setIsDeleting(true);
    try {
      await limpiarBaseDeDatos();
      await loadStats();
      setResultado({ success: true, message: '¡DB limpiada!' });
    } catch (error) {
      setResultado({ success: false, message: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePoblarDB = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Poblar Base de Datos',
        '¿Cargar datos iniciales?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Poblar', onPress: ejecutarPoblacion }
        ]
      );
    } else if (window.confirm('¿Poblar la base de datos?')) {
      ejecutarPoblacion();
    }
  };

  const ejecutarPoblacion = async () => {
    setIsLoading(true);
    try {
      await poblarBaseDeDatos();
      await loadStats();
      setResultado({ success: true, message: '¡DB poblada!' });
    } catch (error) {
      setResultado({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { 
      title: 'Gestionar Rutinas', 
      icon: 'barbell', 
      color: '#4ECDC4',
      count: stats.rutinas,
      screen: 'AdminRutinas'
    },
    { 
      title: 'Gestionar Ejercicios', 
      icon: 'fitness', 
      color: '#FF6B6B',
      count: stats.ejercicios,
      screen: 'AdminEjercicios'
    },
    { 
      title: 'Gestionar Trainers', 
      icon: 'people', 
      color: '#A78BFA',
      count: stats.trainers,
      screen: 'AdminTrainers'
    },
    { 
      title: 'Gestionar Categorías', 
      icon: 'folder', 
      color: '#F59E0B',
      count: stats.categorias,
      screen: 'AdminCategorias'
    },
  ];

  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro que deseas salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: logout }
        ]
      );
    } else if (window.confirm('¿Cerrar sesión?')) {
      logout();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={24} color="#D4FF00" />
          <Text style={styles.headerTitle}>Panel de Admin</Text>
        </View>
        <Pressable onPress={handleReloadData} style={styles.refreshBtn}>
          {isReloading ? (
            <ActivityIndicator color="#D4FF00" size="small" />
          ) : (
            <Ionicons name="refresh" size={24} color="#D4FF00" />
          )}
        </Pressable>
      </View>

      {/* User Info Bar */}
      <View style={styles.userBar}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={36} color="#D4FF00" />
          <View style={styles.userText}>
            <Text style={styles.userName}>{user?.nombre || 'Administrador'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>ADMIN</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#4ECDC420' }]}>
            <Ionicons name="barbell" size={24} color="#4ECDC4" />
            <Text style={styles.statNumber}>{stats.rutinas}</Text>
            <Text style={styles.statLabel}>Rutinas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF6B6B20' }]}>
            <Ionicons name="fitness" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{stats.ejercicios}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#A78BFA20' }]}>
            <Ionicons name="people" size={24} color="#A78BFA" />
            <Text style={styles.statNumber}>{stats.trainers}</Text>
            <Text style={styles.statLabel}>Trainers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="folder" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.categorias}</Text>
            <Text style={styles.statLabel}>Categorías</Text>
          </View>
        </View>

        {/* Menu Items */}
        <Text style={styles.sectionTitle}>Gestión de Contenido</Text>
        {menuItems.map((item, index) => (
          <Pressable 
            key={index} 
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuCount}>{item.count} elementos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        ))}

        {/* Database Actions */}
        <Text style={styles.sectionTitle}>Acciones de Base de Datos</Text>
        <View style={styles.actionsContainer}>
          <Pressable 
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={handleLimpiarDB}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="trash" size={20} color="#fff" />
            )}
            <Text style={styles.actionBtnTextLight}>Limpiar DB</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={handlePoblarDB}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Ionicons name="cloud-upload" size={20} color="#000" />
            )}
            <Text style={styles.actionBtnText}>Poblar DB</Text>
          </Pressable>
        </View>

        {resultado && (
          <View style={[styles.resultado, resultado.success ? styles.resultadoSuccess : styles.resultadoError]}>
            <Ionicons 
              name={resultado.success ? "checkmark-circle" : "alert-circle"} 
              size={18} 
              color={resultado.success ? "#4CAF50" : "#f44336"} 
            />
            <Text style={[styles.resultadoText, { color: resultado.success ? "#4CAF50" : "#f44336" }]}>
              {resultado.message}
            </Text>
          </View>
        )}

        {/* Acceso a la app */}
        <Text style={styles.sectionTitle}>Acceso Rápido</Text>
        <Pressable 
          style={styles.appAccessBtn}
          onPress={() => navigation.navigate('MainApp')}
        >
          <Ionicons name="apps" size={24} color="#D4FF00" />
          <View style={styles.appAccessInfo}>
            <Text style={styles.appAccessTitle}>Ver Aplicación</Text>
            <Text style={styles.appAccessSubtitle}>Acceder como usuario normal</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#111',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userText: {
    gap: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
  },
  roleBadge: {
    backgroundColor: '#D4FF00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  menuCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  actionBtnDanger: {
    backgroundColor: '#dc3545',
  },
  actionBtnPrimary: {
    backgroundColor: '#D4FF00',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  actionBtnTextLight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  resultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  resultadoSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  resultadoError: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  resultadoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  appAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D4FF0030',
  },
  appAccessInfo: {
    flex: 1,
    marginLeft: 14,
  },
  appAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4FF00',
  },
  appAccessSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B20',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
