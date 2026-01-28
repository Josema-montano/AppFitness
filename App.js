import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { AppProvider, useApp } from './context/AppContext';
import HomeScreen from './screens/HomeScreen';
import RutinasScreen from './screens/RutinasScreen';
import DetalleRutinaScreen from './screens/DetalleRutinaScreen';
import ContactoScreen from './screens/ContactoScreen';
import TrainerScreen from './screens/TrainerScreen';
import CategoriaScreen from './screens/CategoriaScreen';
import LoginScreen from './screens/LoginScreen';
import CrearRutinaScreen from './screens/CrearRutinaScreen';
import AdminScreen from './screens/AdminScreen';
// Admin Screens
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminRutinas from './screens/admin/AdminRutinas';
import AdminEjercicios from './screens/admin/AdminEjercicios';
import AdminTrainers from './screens/admin/AdminTrainers';
import AdminCategorias from './screens/admin/AdminCategorias';
import ChatbotScreen from './screens/ChatbotScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Componente de icono personalizado para los tabs
const TabIcon = ({ iconName, focused, label }) => (
  <View style={styles.tabIconContainer}>
    <Ionicons 
      name={iconName} 
      size={24} 
      color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
    />
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

// Stack Navigator principal
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Rutinas" component={RutinasScreen} />
      <Stack.Screen name="Detalle" component={DetalleRutinaScreen} />
      <Stack.Screen name="Contacto" component={ContactoScreen} />
      <Stack.Screen name="Trainer" component={TrainerScreen} />
      <Stack.Screen name="Categoria" component={CategoriaScreen} />
      <Stack.Screen name="CrearRutina" component={CrearRutinaScreen} />
      <Stack.Screen name="Admin" component={AdminDashboard} />
      <Stack.Screen name="AdminRutinas" component={AdminRutinas} />
      <Stack.Screen name="AdminEjercicios" component={AdminEjercicios} />
      <Stack.Screen name="AdminTrainers" component={AdminTrainers} />
      <Stack.Screen name="AdminCategorias" component={AdminCategorias} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
    </Stack.Navigator>
  );
}

// Pantalla de Explorar mejorada
function DiscoverScreen({ navigation }) {
  const { misRutinas } = useApp();
  
  const categorias = [
    { nombre: 'Cardio', icono: 'heart', color: '#FF6B6B' },
    { nombre: 'Fuerza', icono: 'barbell', color: '#4ECDC4' },
    { nombre: 'Flexibilidad', icono: 'body', color: '#A78BFA' },
    { nombre: 'HIIT', icono: 'flash', color: '#F59E0B' },
    { nombre: 'Yoga', icono: 'flower', color: '#10B981' },
    { nombre: 'Core', icono: 'ellipse', color: '#EC4899' },
  ];

  return (
    <View style={styles.discoverContainer}>
      <View style={styles.discoverHeader}>
        <Text style={styles.discoverTitle}>Explorar</Text>
        <Text style={styles.discoverSubtitle}>Descubre entrenamientos</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.discoverScroll}>
        <Text style={styles.discoverSectionTitle}>CATEGORÍAS</Text>
        <View style={styles.categoriesGrid}>
          {categorias.map((cat, index) => (
            <Pressable 
              key={index} 
              style={[styles.categoryCard, { backgroundColor: cat.color + '20' }]}
              onPress={() => navigation.navigate('Inicio', { 
                screen: 'Rutinas', 
                params: { categoria: cat.nombre } 
              })}
            >
              <Ionicons name={cat.icono} size={36} color="#FFFFFF" />
              <Text style={styles.categoryName}>{cat.nombre}</Text>
            </Pressable>
          ))}
        </View>

        {misRutinas.length > 0 && (
          <>
            <Text style={styles.discoverSectionTitle}>MIS RUTINAS CREADAS</Text>
            {misRutinas.map((rutina, index) => (
              <Pressable 
                key={index}
                style={styles.myRoutineCard}
                onPress={() => navigation.navigate('Inicio', {
                  screen: 'Detalle',
                  params: { rutina }
                })}
              >
                <View style={styles.myRoutineIcon}>
                  <Ionicons name="barbell" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.myRoutineInfo}>
                  <Text style={styles.myRoutineName}>{rutina.nombre}</Text>
                  <Text style={styles.myRoutineMeta}>
                    {rutina.duracion} · {rutina.ejercicios?.length || 0} ejercicios
                  </Text>
                </View>
                <Text style={styles.myRoutineArrow}>›</Text>
              </Pressable>
            ))}
          </>
        )}

        <Pressable 
          style={styles.createRoutineButton}
          onPress={() => navigation.navigate('Inicio', { screen: 'CrearRutina' })}
        >
          <Ionicons name="add" size={24} color="#000000" />
          <Text style={styles.createRoutineText}>Crear nueva rutina</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function FavoritesScreen({ navigation }) {
  const { favoritos, toggleFavorito, misRutinas } = useApp();

  const allFavorites = [...favoritos];

  if (allFavorites.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="heart" size={48} color="#ccc" />
        <Text style={styles.placeholderTitle}>Sin Favoritos</Text>
        <Text style={styles.placeholderText}>
          Guarda tus entrenamientos favoritos para acceder rápidamente
        </Text>
        <Pressable 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Inicio')}
        >
          <Text style={styles.exploreButtonText}>Explorar entrenamientos</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.favoritesContainer}>
      <View style={styles.favoritesHeader}>
        <Text style={styles.favoritesTitle}>Favoritos</Text>
        <Text style={styles.favoritesCount}>{allFavorites.length} guardados</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.favoritesScroll}>
        {allFavorites.map((rutina, index) => (
          <Pressable 
            key={rutina.id || index}
            style={styles.favoriteCard}
            onPress={() => navigation.navigate('Inicio', {
              screen: 'Detalle',
              params: { rutina }
            })}
          >
            <Image 
              source={{ uri: rutina.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' }}
              style={styles.favoriteImage}
            />
            <View style={styles.favoriteOverlay} />
            <Pressable 
              style={styles.favoriteHeart}
              onPress={() => toggleFavorito(rutina)}
            >
              <Ionicons name="heart" size={16} color="#e63946" />
            </Pressable>
            <View style={styles.favoriteContent}>
              <Text style={styles.favoriteName}>{rutina.nombre}</Text>
              <Text style={styles.favoriteMeta}>
                {rutina.duracion} · {rutina.nivel} · {rutina.trainer || 'Personalizada'}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function ProfileScreen({ navigation }) {
  const { user, logout, misRutinas, favoritos, isAdmin } = useApp();

  const handleLogout = () => {
    const doLogout = () => {
      logout();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que deseas salir?')) {
        doLogout();
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro que deseas salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: doLogout }
        ]
      );
    }
  };

  return (
    <View style={styles.profileContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.profileScroll}>
    
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarLarge}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200' }} 
              style={styles.profileAvatarImage}
            />
          </View>
          <Text style={styles.profileName}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          <View style={styles.profileBadge}>
            <Ionicons name="star" size={14} color="#D4FF00" />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.profileStatsContainer}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatNumber}>{user?.entrenamientosCompletados || 0}</Text>
            <Text style={styles.profileStatText}>Entrenamientos</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatNumber}>{misRutinas.length}</Text>
            <Text style={styles.profileStatText}>Mis Rutinas</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatNumber}>{favoritos.length}</Text>
            <Text style={styles.profileStatText}>Favoritos</Text>
          </View>
        </View>

        {/* Opciones */}
        <View style={styles.profileOptions}>
          <Pressable 
            style={styles.profileOption}
            onPress={() => navigation.navigate('Inicio', { screen: 'CrearRutina' })}
          >
            <Text style={styles.profileOptionIcon}>➕</Text>
            <Text style={styles.profileOptionText}>Crear nueva rutina</Text>
            <Text style={styles.profileOptionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.profileOption}>
            <Ionicons name="stats-chart" size={20} color="#666" />
            <Text style={styles.profileOptionText}>Estadísticas</Text>
            <Text style={styles.profileOptionArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.profileOption}>
            <Ionicons name="settings" size={20} color="#666" />
            <Text style={styles.profileOptionText}>Configuración</Text>
            <Text style={styles.profileOptionArrow}>›</Text>
          </Pressable>
          
          <Pressable 
            style={styles.profileOption}
            onPress={() => navigation.navigate('Inicio', { screen: 'Contacto' })}
          >
            <Text style={styles.profileOptionIcon}>💬</Text>
            <Text style={styles.profileOptionText}>Ayuda y soporte</Text>
            <Text style={styles.profileOptionArrow}>›</Text>
          </Pressable>

          {isAdmin && (
            <Pressable 
              style={[styles.profileOption, styles.adminOption]}
              onPress={() => navigation.navigate('Inicio', { screen: 'Admin' })}
            >
              <Ionicons name="shield-checkmark" size={20} color="#D4FF00" />
              <Text style={[styles.profileOptionText, { color: '#D4FF00' }]}>Panel de Administrador</Text>
              <Text style={styles.profileOptionArrow}>›</Text>
            </Pressable>
          )}
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Navegación principal con tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#D4FF00',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={MainStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home" focused={focused} label="Inicio" />
          ),
        }}
      />
      <Tab.Screen 
        name="Explorar" 
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="search" focused={focused} label="Explorar" />
          ),
        }}
      />
      <Tab.Screen 
        name="Favoritos" 
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "heart" : "heart-outline"} focused={focused} label="Favoritos" />
          ),
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName={focused ? "person" : "person-outline"} focused={focused} label="Perfil" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Admin Stack - Navegación para administradores
function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminRutinas" component={AdminRutinas} />
      <Stack.Screen name="AdminEjercicios" component={AdminEjercicios} />
      <Stack.Screen name="AdminTrainers" component={AdminTrainers} />
      <Stack.Screen name="AdminCategorias" component={AdminCategorias} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      {/* Permitir acceso a la app normal desde admin */}
      <Stack.Screen name="MainApp" component={MainTabs} />
    </Stack.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { isLoggedIn, isLoading, isAdmin } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4FF00" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <AuthStack />;
  }

  // Si es admin, mostrar AdminStack, sino MainTabs
  return isAdmin ? <AdminStack /> : <MainTabs />;
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1C1C1E',
    borderTopWidth: 0,
    height: 85,
    paddingTop: 10,
    paddingBottom: 25,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
  },
  tabLabelFocused: {
    color: '#D4FF00',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: '#D4FF00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 24,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  // Discover Screen
  discoverContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  discoverHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  discoverTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  discoverSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  discoverScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  discoverSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  categoryCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  myRoutineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  myRoutineIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 255, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  myRoutineIconText: {
    fontSize: 22,
  },
  myRoutineInfo: {
    flex: 1,
  },
  myRoutineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  myRoutineMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  myRoutineArrow: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.3)',
  },
  createRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4FF00',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    gap: 8,
  },
  createRoutineIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  createRoutineText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  // Favorites Screen
  favoritesContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  favoritesHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  favoritesTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  favoritesCount: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  favoritesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  favoriteCard: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  favoriteImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  favoriteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  favoriteHeart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteHeartText: {
    fontSize: 18,
  },
  favoriteContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  favoriteMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  // Profile Screen
  profileContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  profileScroll: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D4FF00',
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  profileBadge: {
    backgroundColor: 'rgba(212, 255, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  profileBadgeText: {
    fontSize: 13,
    color: '#D4FF00',
    fontWeight: '600',
  },
  profileStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4FF00',
  },
  profileStatText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  profileOptions: {
    marginHorizontal: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  profileOptionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  profileOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  profileOptionArrow: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.3)',
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#D4FF00',
  },
  profileAvatarText: {
    fontSize: 48,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 30,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4FF00',
  },
  profileStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
});
