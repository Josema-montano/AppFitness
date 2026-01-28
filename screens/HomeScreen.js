import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  Image,
  Animated,
  Dimensions,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// Datos por defecto (fallback)
const defaultWorkouts = [
  { 
    nombre: 'Yoga Restaurativo de Cuerpo Inferior', 
    duracion: '12 min', 
    nivel: 'Principiante',
    categoria: 'Flexibilidad',
    trainer: 'José Maria Montaño',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
  },
  { 
    nombre: 'HIIT Explosivo', 
    duracion: '20 min', 
    nivel: 'Avanzado',
    categoria: 'Cardio',
    trainer: 'Jorge Aguilera',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400',
  },
];

const defaultTopPicks = [
  {
    nombre: 'Estabilidad y Fuerza',
    duracion: '34 min',
    nivel: 'Avanzado',
    categoria: 'Flexibilidad',
    trainer: 'Vladimir Lisarazu',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  },
];

const defaultBrowseCategories = [
  {
    nombre: 'Por Grupo Muscular',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
  },
  {
    nombre: 'Por Tipo de Entrenamiento',
    image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800',
  },
];

export default function HomeScreen({ navigation }) {
  const { 
    toggleFavorito, 
    isFavorito, 
    logout, 
    user, 
    rutinasDestacadas, 
    topPicks: topPicksFromDB, 
    browseCategoriesDB,
    rutinasDB,
    dataLoaded,
    isAdmin 
  } = useApp();
  const [selectedTab, setSelectedTab] = useState('Para Ti');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    const doLogout = () => {
      setMenuVisible(false);
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
  
  const tabs = ['Para Ti', 'Explorar', 'Colecciones'];
  
  // Usar datos de Firebase si están disponibles, si no usar valores por defecto
  const workouts = dataLoaded && rutinasDestacadas.length > 0 ? rutinasDestacadas : defaultWorkouts;
  const topPicks = dataLoaded && topPicksFromDB.length > 0 ? topPicksFromDB : defaultTopPicks;
  const browseCategories = dataLoaded && browseCategoriesDB.length > 0 ? browseCategoriesDB : defaultBrowseCategories;
  
  // Obtener TODAS las rutinas de la base de datos (aplanadas desde objeto por categoría)
  const todasLasRutinas = dataLoaded && rutinasDB && Object.keys(rutinasDB).length > 0
    ? Object.values(rutinasDB).flat()
    : [...defaultWorkouts, ...defaultTopPicks];

  // Función para filtrar entrenamientos
  const filterWorkouts = (workoutsList, query) => {
    if (!query.trim()) return workoutsList;
    
    const lowercaseQuery = query.toLowerCase().trim();
    return workoutsList.filter(workout => 
      workout.nombre?.toLowerCase().includes(lowercaseQuery) ||
      workout.categoria?.toLowerCase().includes(lowercaseQuery) ||
      workout.trainer?.toLowerCase().includes(lowercaseQuery) ||
      workout.nivel?.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Obtener entrenamientos filtrados
  const filteredWorkouts = filterWorkouts(workouts, searchQuery);
  const filteredTopPicks = filterWorkouts(topPicks, searchQuery);
  const filteredTodasRutinas = filterWorkouts(todasLasRutinas, searchQuery);
  
  // Combinar todos los entrenamientos para mostrar en búsqueda
  const allWorkouts = todasLasRutinas;
  const filteredAllWorkouts = filterWorkouts(allWorkouts, searchQuery);

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const WorkoutCard = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardFade = useRef(new Animated.Value(0)).current;
    const heartAnim = useRef(new Animated.Value(1)).current;
    const [esFav, setEsFav] = useState(isFavorito(item));

    useEffect(() => {
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    const handleToggleFav = () => {
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      const rutina = {
        ...item,
        descripcion: `Entrenamiento de ${item.categoria} diseñado para maximizar tus resultados.`,
        calorias: item.categoria === 'Cardio' ? '200-300' : item.categoria === 'Fuerza' ? '150-250' : '80-150',
        icono: '�'
      };
      toggleFavorito(rutina);
      setEsFav(!esFav);
    };

    return (
      <AnimatedPressable
        style={[
          styles.workoutCard,
          { 
            opacity: cardFade,
            transform: [{ scale: scaleAnim }]
          }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate('Detalle', { 
          rutina: { 
            ...item, 
            descripcion: `Entrenamiento de ${item.categoria} diseñado para maximizar tus resultados.`,
            calorias: item.categoria === 'Cardio' ? '200-300' : item.categoria === 'Fuerza' ? '150-250' : '80-150',
            icono: 'diamond' 
          } 
        })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <Text style={styles.workoutTitle} numberOfLines={2}>
            {item.nombre}
          </Text>
          <Text style={styles.workoutInfo}>{item.duracion} · {item.nivel}</Text>
          {item.trainer && (
            <Pressable onPress={() => navigation.navigate('Trainer', { trainerName: item.trainer })}>
              <Text style={styles.trainerTextLink}>con {item.trainer}</Text>
            </Pressable>
          )}
        </View>
        <Pressable 
          style={[styles.bookmarkIcon, esFav && styles.bookmarkIconActive]} 
          onPress={handleToggleFav}
        >
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <Ionicons 
              name={esFav ? "heart" : "heart-outline"} 
              size={18} 
              color={"#FFFFFF"} 
            />
          </Animated.View>
        </Pressable>
      </AnimatedPressable>
    );
  };

  const BrowseCard = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <AnimatedPressable
        style={[styles.browseCard, { transform: [{ scale: scaleAnim }] }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate('Categoria', { categoria: item.nombre })}
      >
        <Image source={{ uri: item.image }} style={styles.browseImage} />
        <View style={styles.browseOverlay} />
        <Text style={styles.browseTitle}>{item.nombre}</Text>
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menú</Text>
              <Pressable onPress={() => setMenuVisible(false)} style={styles.menuCloseBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            
            <View style={styles.menuUserInfo}>
              <View style={styles.menuAvatar}>
                <Ionicons name="person" size={24} color="#D4FF00" />
              </View>
              <View>
                <Text style={styles.menuUserName}>{user?.nombre || 'Usuario'}</Text>
                <Text style={styles.menuUserEmail}>{user?.email || ''}</Text>
              </View>
            </View>
            
            <View style={styles.menuDivider} />
            
            <Pressable 
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('CrearRutina');
              }}
            >
              <Ionicons name="add-circle" size={22} color="#D4FF00" />
              <Text style={styles.menuOptionText}>Crear Nueva Rutina</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </Pressable>
            
            <Pressable 
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                navigation.getParent()?.navigate('Favoritos');
              }}
            >
              <Ionicons name="heart" size={22} color="#FF6B6B" />
              <Text style={styles.menuOptionText}>Mis Favoritos</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </Pressable>
            
            <Pressable 
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                navigation.getParent()?.navigate('Perfil');
              }}
            >
              <Ionicons name="person" size={22} color="#4ECDC4" />
              <Text style={styles.menuOptionText}>Mi Perfil</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </Pressable>
            
            <Pressable 
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Contacto');
              }}
            >
              <Ionicons name="help-circle" size={22} color="#A78BFA" />
              <Text style={styles.menuOptionText}>Ayuda y Soporte</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </Pressable>
            
            {isAdmin && (
              <Pressable 
                style={styles.menuOption}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Admin');
                }}
              >
                <Ionicons name="server" size={22} color="#D4FF00" />
                <Text style={styles.menuOptionText}>Administrar DB</Text>
                <Ionicons name="chevron-forward" size={18} color="#666" />
              </Pressable>
            )}
            
            <View style={styles.menuDivider} />
            
            <Pressable style={styles.menuLogoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out" size={22} color="#FF4444" />
              <Text style={styles.menuLogoutText}>Cerrar Sesión</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[
          styles.headerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={styles.topBar}>
            <Pressable 
              style={styles.profileContainer}
              onPress={() => navigation.getParent()?.navigate('Perfil')}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100' }}
                style={styles.profileImage}
              />
            </Pressable>
            <View style={styles.rightIcons}>
              <Pressable style={styles.iconButton} onPress={() => setMenuVisible(true)}>
                <Ionicons name="menu" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => navigation.navigate('CrearRutina')}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
          
          <Text style={styles.header}>Entrenamientos</Text>
          
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedTab(tab)}
                style={styles.tabItem}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive
                ]}>
                  {tab}
                </Text>
                {selectedTab === tab && <View style={styles.tabIndicator} />}
              </Pressable>
            ))}
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar entrenamientos, entrenadores..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearching(true)}
              onBlur={() => setIsSearching(false)}
            />
            {searchQuery.length > 0 && (
              <Pressable 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearIcon}>×</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Search Results - Solo mostrar cuando hay búsqueda */}
        {searchQuery.trim().length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              RESULTADOS ({filteredAllWorkouts.length})
            </Text>
            {filteredAllWorkouts.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {filteredAllWorkouts.map((item, index) => (
                  <WorkoutCard key={`search-${index}`} item={item} index={index} />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsTitle}>Sin resultados</Text>
                <Text style={styles.noResultsText}>
                  Intenta con otros términos como "cardio", "yoga" o un entrenador específico
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Browse Categories */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              {browseCategories.map((item, index) => (
                <BrowseCard key={index} item={item} index={index} />
              ))}
            </Animated.View>

            {/* Top Picks Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>SELECCIONADO PARA TI</Text>
                <Text style={styles.sectionSubtitle}>Basado en tu actividad</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {filteredTopPicks.map((item, index) => (
                  <WorkoutCard key={index} item={item} index={index} />
                ))}
              </ScrollView>
            </View>

            {/* New Workouts Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>LO MÁS NUEVO</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {filteredWorkouts.map((item, index) => (
                  <WorkoutCard key={index} item={item} index={index} />
                ))}
              </ScrollView>
            </View>

            {/* Todas las Rutinas Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>TODAS LAS RUTINAS</Text>
                <Text style={styles.sectionSubtitle}>{filteredTodasRutinas.length} rutinas disponibles</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {filteredTodasRutinas.map((item, index) => (
                  <WorkoutCard key={`all-${item.id || index}`} item={item} index={index} />
                ))}
              </ScrollView>
            </View>

            {/* Featured Collection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>COLECCIÓN DESTACADA</Text>
              <Pressable 
                style={styles.featuredCard}
                onPress={() => navigation.navigate('Detalle', { 
                  rutina: {
                    nombre: 'Abdominales Más Fuertes',
                    duracion: '30 min',
                    nivel: 'Intermedio',
                    trainer: 'Vladimir Lisarazu',
                    descripcion: 'Lleva tus entrenamientos de abdominales más allá. Combina ejercicios que fortalecen tu core.',
                    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
                    calorias: '150-220',
                    icono: 'star'
                  }
                })}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800' }}
                  style={styles.featuredImage}
                />
                <View style={styles.featuredOverlay} />
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredBadge}>8 ENTRENAMIENTOS · TODOS LOS NIVELES</Text>
                  <Text style={styles.featuredTitle}>ABDOMINALES{'\n'}MÁS FUERTES</Text>
                  <Text style={styles.featuredDescription}>
                    Lleva tus entrenamientos de abdominales más allá. Combina ejercicios que fortalecen tu core.
                  </Text>
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>Comenzar: Fortalece tu Core</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </>
        )}

        {/* Contact Button */}
        <Pressable
          style={({ pressed }) => [
            styles.contactButton,
            pressed && styles.contactPressed,
          ]}
          onPress={() => navigation.navigate('Contacto')}
        >
          <Text style={styles.contactText}>Contacto y Soporte</Text>
        </Pressable>
      </ScrollView>

      {/* Botón flotante del Chatbot */}
      <Pressable
        style={styles.chatbotFab}
        onPress={() => navigation.navigate('Chatbot')}
      >
        <View style={styles.chatbotFabInner}>
          <Ionicons name="chatbubbles" size={26} color="#000000" />
        </View>
        <View style={styles.chatbotBadge}>
          <Ionicons name="sparkles" size={10} color="#FFFFFF" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  profileContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  header: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 25,
    letterSpacing: -0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabItem: {
    marginRight: 28,
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#D4FF00',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#D4FF00',
    borderRadius: 1.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 18,
    color: '#8E8E93',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  clearButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 12,
  },
  section: {
    marginTop: 25,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  workoutCard: {
    width: 200,
    height: 260,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  bookmarkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bookmarkIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  bookmarkText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 6,
  },
  workoutInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  trainerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  trainerTextLink: {
    fontSize: 11,
    color: '#D4FF00',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  browseCard: {
    marginHorizontal: 20,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  browseImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  browseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  browseTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  featuredCard: {
    marginHorizontal: 20,
    height: 420,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  featuredImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  featuredBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  contactButton: {
    marginHorizontal: 20,
    marginTop: 35,
    backgroundColor: '#D4FF00',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  contactPressed: {
    backgroundColor: '#b8e600',
  },
  contactText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  noResults: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212,255,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuUserEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 15,
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 10,
  },
  menuLogoutText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
  },
  // Chatbot FAB Button
  chatbotFab: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    zIndex: 1000,
  },
  chatbotFabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4FF00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4FF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  chatbotBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
});
