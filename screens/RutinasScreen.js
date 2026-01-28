import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  Image,
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const trainers = ['José Maria Montaño', 'Jorge Aguilera', 'Vladimir Lisarazu'];
const getTrainer = (index) => trainers[index % 3];

// Datos por defecto (fallback)
const rutinasDataDefault = {
  Cardio: [
    { 
      nombre: 'Entrenamiento HIIT', 
      duracion: '20 min', 
      nivel: 'Avanzado',
      trainer: 'Jorge Aguilera',
      descripcion: 'Intervalos de alta intensidad para quemar grasa',
      image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400',
      calorias: '250-350'
    },
  ],
  Fuerza: [
    { 
      nombre: 'Tren Superior Potente', 
      duracion: '30 min', 
      nivel: 'Intermedio',
      trainer: 'Vladimir Lisarazu',
      descripcion: 'Fortalece brazos, pecho y espalda',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
      calorias: '150-220'
    },
  ],
  Flexibilidad: [
    { 
      nombre: 'Yoga Flow', 
      duracion: '30 min', 
      nivel: 'Principiante',
      trainer: 'José Maria Montaño',
      descripcion: 'Secuencias fluidas para flexibilidad',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      calorias: '80-120'
    },
  ],
};

export default function RutinasScreen({ route, navigation }) {
  const { categoria } = route.params;
  const { rutinasDB, dataLoaded } = useApp();
  
  // Usar datos de Firebase si están disponibles, si no usar valores por defecto
  const rutinasData = dataLoaded && Object.keys(rutinasDB).length > 0 ? rutinasDB : rutinasDataDefault;
  const rutinas = rutinasData[categoria] || [];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const WorkoutCard = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

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
        style={[
          styles.workoutCard,
          { 
            opacity: cardFade,
            transform: [
              { scale: scaleAnim },
              { translateY: cardSlide }
            ]
          }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate('Detalle', { rutina: { ...item, icono: 'diamond' } })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardOverlay} />
        
        <View style={styles.cardBadge}>
          <Text style={styles.badgeText}>{item.nivel}</Text>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardDescription}>{item.descripcion}</Text>
          
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.metaText}>{item.duracion}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#666" />
              <Text style={styles.metaText}>{item.calorias} cal</Text>
            </View>
          </View>
          
          <Text style={styles.trainerText}>con {item.trainer}</Text>
        </View>
        
        <View style={styles.playButton}>
          <Ionicons name="play" size={16} color="#fff" />
        </View>
      </AnimatedPressable>
    );
  };

  const TrainerLink = ({ trainerName }) => (
    <Pressable onPress={() => navigation.navigate('Trainer', { trainerName })}>
      <Text style={styles.trainerTextLink}>con {trainerName}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.heroHeader}>
        <Image 
          source={{ uri: rutinas[0]?.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }} 
          style={styles.heroImage} 
        />
        <View style={styles.heroOverlay} />
        <Animated.View style={[
          styles.heroContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <Pressable 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroCategory}>{categoria.toUpperCase()}</Text>
            <Text style={styles.heroTitle}>
              {categoria === 'Cardio' ? 'Quema Calorías' : 
               categoria === 'Fuerza' ? 'Gana Músculo' : 
               'Encuentra tu Paz'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {rutinas.length} entrenamientos disponibles
            </Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {rutinas.length > 0 && (
          <Animated.View style={[
            styles.section,
            { opacity: fadeAnim }
          ]}>
            <Text style={styles.sectionLabel}>DESTACADO</Text>
            <Pressable 
              style={styles.featuredCard}
              onPress={() => navigation.navigate('Detalle', { rutina: { ...rutinas[0], icono: 'diamond' } })}
            >
              <Image source={{ uri: rutinas[0].image }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay} />
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>NUEVO</Text>
                </View>
                <Text style={styles.featuredTitle}>{rutinas[0].nombre}</Text>
                <Text style={styles.featuredMeta}>
                  {rutinas[0].duracion} · {rutinas[0].nivel} · {rutinas[0].calorias} cal
                </Text>
                <View style={styles.featuredButton}>
                  <Text style={styles.featuredButtonText}>Comenzar Entrenamiento</Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TODOS LOS ENTRENAMIENTOS</Text>
          {rutinas.map((item, index) => (
            <WorkoutCard key={index} item={item} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroHeader: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  heroTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  heroCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4FF00',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  featuredCard: {
    marginHorizontal: 20,
    height: 200,
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  featuredContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    backgroundColor: '#D4FF00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  featuredButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  workoutCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
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
  cardBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trainerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  trainerTextLink: {
    fontSize: 12,
    color: '#D4FF00',
    textDecorationLine: 'underline',
  },
  playButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 3,
  },
});
