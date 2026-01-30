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
import { useRef, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getRutinasByTrainer } from '../services/fitnessService';

const { width } = Dimensions.get('window');

// Datos por defecto de trainers (fallback)
const trainersDataDefault = {
  'José Maria Montaño': {
    nombre: 'José Maria Montaño',
    especialidad: 'Yoga & Flexibilidad',
    imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    bio: 'Instructor certificado con más de 10 años de experiencia en yoga y meditación. Especialista en técnicas de respiración y flexibilidad.',
    seguidores: '125K',
    entrenamientos: 24,
    rating: 4.9,
    rutinas: [
      { nombre: 'Yoga Restaurativo', duracion: '12 min', nivel: 'Principiante', descripcion: 'Secuencia suave para relajar', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', calorias: '60-100' },
    ]
  },
  'Jorge Aguilera': {
    nombre: 'Jorge Aguilera',
    especialidad: 'HIIT & Cardio',
    imagen: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400',
    bio: 'Entrenador personal certificado especializado en entrenamientos de alta intensidad.',
    seguidores: '89K',
    entrenamientos: 18,
    rating: 4.8,
    rutinas: [
      { nombre: 'HIIT Explosivo', duracion: '20 min', nivel: 'Avanzado', descripcion: 'Intervalos de alta intensidad', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400', calorias: '250-350' },
    ]
  },
  'Vladimir Lisarazu': {
    nombre: 'Vladimir Lisarazu',
    especialidad: 'Fuerza & Musculación',
    imagen: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    bio: 'Coach de fuerza y acondicionamiento físico. Especialista en hipertrofia y entrenamiento funcional.',
    seguidores: '156K',
    entrenamientos: 32,
    rating: 4.9,
    rutinas: [
      { nombre: 'Fuerza Total', duracion: '30 min', nivel: 'Intermedio', descripcion: 'Entrenamiento completo de fuerza', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400', calorias: '200-280' },
    ]
  }
};

export default function TrainerScreen({ route, navigation }) {
  const { trainerName } = route.params;
  const { trainersDB, dataLoaded } = useApp();
  const [trainerRutinas, setTrainerRutinas] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Usar datos de Firebase si están disponibles
  const trainersData = dataLoaded && Object.keys(trainersDB).length > 0 ? trainersDB : trainersDataDefault;
  const trainer = trainersData[trainerName] || trainersDataDefault['José Maria Montaño'];
  
  // Cargar rutinas del trainer desde Firebase
  useEffect(() => {
    const loadTrainerRutinas = async () => {
      try {
        const rutinas = await getRutinasByTrainer(trainerName);
        if (rutinas.length > 0) {
          setTrainerRutinas(rutinas);
        } else if (trainer.rutinas) {
          setTrainerRutinas(trainer.rutinas);
        }
      } catch (error) {
        console.error('Error cargando rutinas del trainer:', error);
        if (trainer.rutinas) {
          setTrainerRutinas(trainer.rutinas);
        }
      }
    };
    
    loadTrainerRutinas();
  }, [trainerName, trainer]);
  
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

    useEffect(() => {
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <AnimatedPressable
        style={[styles.workoutCard, { opacity: cardFade }]}
        onPressIn={() => {
          Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }).start();
        }}
        onPress={() => navigation.navigate('Detalle', { 
          rutina: { 
            ...item, 
            trainer: trainer.nombre,
            icono: 'diamond' 
          } 
        })}
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
            <Text style={styles.metaText}>
              <Ionicons name="time" size={14} color="#666" /> {item.duracion}
            </Text>
            <Text style={styles.metaText}>
              <Ionicons name="star" size={14} color="#666" /> {item.calorias} cal
            </Text>
          </View>
        </View>
        <View style={styles.playButton}>
          <Ionicons name="play" size={16} color="#fff" />
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.heroHeader}>
        <Image source={{ uri: trainer.imagen }} style={styles.heroImage} />
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
          
          <View style={styles.trainerInfo}>
            <Image source={{ uri: trainer.imagen }} style={styles.trainerAvatar} />
            <Text style={styles.trainerName}>{trainer.nombre}</Text>
            <Text style={styles.trainerSpecialty}>{trainer.especialidad}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{trainer.seguidores}</Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{trainer.entrenamientos}</Text>
                <Text style={styles.statLabel}>Clases</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>☆ {trainer.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bioSection}>
          <Text style={styles.bioTitle}>Sobre {trainer.nombre.split(' ')[0]}</Text>
          <Text style={styles.bioText}>{trainer.bio}</Text>
          
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.followButton, isFollowing && styles.followButtonActive]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </Text>
            </Pressable>
            <Pressable style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Compartir</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entrenamientos</Text>
          <Text style={styles.sectionSubtitle}>{trainerRutinas.length} clases disponibles</Text>
          
          {trainerRutinas.map((rutina, index) => (
            <WorkoutCard key={index} item={rutina} index={index} />
          ))}
        </View>

        <View style={styles.certsSection}>
          <Text style={styles.sectionTitle}>Certificaciones</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.certsScroll}
          >
            {[
              { text: 'Certified Personal Trainer', icon: 'certificate' },
              { text: 'HIIT Specialist', icon: 'diamond' },
              { text: 'Yoga Alliance', icon: 'star' },
              { text: 'Strength Coach', icon: 'ellipse' }
            ].map((cert, index) => (
              <View key={index} style={styles.certBadge}>
                <View style={styles.certContent}>
                  <Ionicons name={cert.icon} size={16} color="#fff" />
                  <Text style={styles.certText}>{cert.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
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
    height: 320,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  trainerInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  trainerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#D4FF00',
  },
  trainerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  trainerSpecialty: {
    fontSize: 14,
    color: '#D4FF00',
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bioSection: {
    padding: 20,
    backgroundColor: '#1C1C1E',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#D4FF00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: 'rgba(212, 255, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#D4FF00',
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  followButtonTextActive: {
    color: '#D4FF00',
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    marginBottom: 16,
  },
  workoutCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#D4FF00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    right: 16,
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 2,
  },
  certsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  certsScroll: {
    paddingTop: 12,
    gap: 10,
  },
  certBadge: {
    backgroundColor: 'rgba(212, 255, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 255, 0, 0.3)',
  },
  certContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certText: {
    fontSize: 13,
    color: '#D4FF00',
    fontWeight: '500',
  },
});
