import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image,
  Animated,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import React, { useRef, useEffect, useState, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

// Datos de ejercicios por defecto (fallback)
const ejerciciosDataDefault = {
  'Calentamiento': [
    { nombre: 'Saltos de Tijera', duracion: 30, musculo: 'Cuerpo Completo', icono: 'fitness' },
    { nombre: 'Círculos de Brazos', duracion: 30, musculo: 'Hombros', icono: 'refresh' },
    { nombre: 'Rodillas Altas', duracion: 30, musculo: 'Piernas', icono: 'walk' },
    { nombre: 'Rotación de Cadera', duracion: 20, musculo: 'Core', icono: 'sync' },
  ],
  'Entrenamiento Principal': [
    { nombre: 'Giros Abdominales', duracion: 30, musculo: 'Abdominales', icono: 'ellipse' },
    { nombre: 'Sentadillas', duracion: 40, musculo: 'Piernas', icono: 'trending-down' },
    { nombre: 'Quemadores de Cadera', duracion: 20, musculo: 'Glúteos', icono: 'diamond' },
    { nombre: 'Pasos Laterales', duracion: 20, musculo: 'Piernas', icono: 'footsteps' },
    { nombre: 'Escaladores', duracion: 40, musculo: 'Core', icono: 'trending-up' },
    { nombre: 'Burpees', duracion: 30, musculo: 'Cuerpo Completo', icono: 'barbell' },
    { nombre: 'Plancha', duracion: 45, musculo: 'Core', icono: 'remove' },
    { nombre: 'Zancadas', duracion: 30, musculo: 'Piernas', icono: 'walk' },
    { nombre: 'Flexiones', duracion: 30, musculo: 'Pecho', icono: 'diamond' },
  ],
  'Enfriamiento': [
    { nombre: 'Estiramiento de Cuádriceps', duracion: 30, musculo: 'Piernas', icono: 'body' },
    { nombre: 'Estiramiento de Isquiotibiales', duracion: 30, musculo: 'Piernas', icono: 'body' },
    { nombre: 'Postura del Niño', duracion: 45, musculo: 'Espalda', icono: 'flower' },
    { nombre: 'Respiración Profunda', duracion: 60, musculo: 'Mente', icono: 'leaf' },
  ],
};

// Función para obtener los ejercicios de una rutina
const getEjerciciosDeRutina = (rutina) => {
  // Si la rutina tiene ejercicios con estructura de secciones
  if (rutina.ejercicios && typeof rutina.ejercicios === 'object' && !Array.isArray(rutina.ejercicios)) {
    return rutina.ejercicios;
  }
  // Si la rutina tiene ejercicios como array plano
  if (Array.isArray(rutina.ejercicios) && rutina.ejercicios.length > 0) {
    return { 'Entrenamiento': rutina.ejercicios };
  }
  // Fallback a datos por defecto
  return ejerciciosDataDefault;
};

// Función para aplanar los ejercicios en un array
const flattenEjercicios = (ejerciciosObj) => {
  if (Array.isArray(ejerciciosObj)) {
    return ejerciciosObj;
  }
  return Object.values(ejerciciosObj).flat();
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `0:${secs.toString().padStart(2, '0')}`;
};

const ExerciseCard = memo(({ item, index, isActive }) => {
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.exerciseCard,
        isActive && styles.exerciseCardActive,
        {
          opacity: cardOpacity,
          transform: [{ scale: cardScale }]
        }
      ]}
    >
      <View style={styles.exerciseLeft}>
        <Text style={[styles.exerciseDuration, isActive && styles.exerciseDurationActive]}>
          {formatDuration(item.duracion)}
        </Text>
      </View>
      
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, isActive && styles.exerciseNameActive]}>
          {item.nombre}
        </Text>
        <Text style={[styles.exerciseMuscle, isActive && styles.exerciseMuscleActive]}>
          {item.musculo}
        </Text>
      </View>
      
      <View style={[styles.exerciseIcon, isActive && styles.exerciseIconActive]}>
        <Ionicons 
          name={item.icono} 
          size={20} 
          color={isActive ? '#000000' : '#666666'} 
        />
      </View>
    </Animated.View>
  );
});

export default function DetalleRutinaScreen({ route, navigation }) {
  const { rutina } = route.params;
  const { toggleFavorito, isFavorito, updateUserStats } = useApp();
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [esFavorito, setEsFavorito] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const timerInterval = useRef(null);

  // Obtener ejercicios de la rutina (de Firebase o fallback)
  const ejerciciosData = getEjerciciosDeRutina(rutina);
  const allExercises = flattenEjercicios(ejerciciosData);
  const totalExercises = allExercises.length;

  useEffect(() => {
    setEsFavorito(isFavorito(rutina));
  }, [rutina]);

  const handleToggleFavorito = () => {
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
    
    toggleFavorito(rutina);
    setEsFavorito(!esFavorito);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (!isRunning) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    return () => {
      pulseAnimation.stop();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerInterval.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (currentExerciseIndex < totalExercises - 1) {
              setCurrentExerciseIndex(i => i + 1);
              setCompletedExercises(c => c + 1);
              return allExercises[currentExerciseIndex + 1]?.duracion || 30;
            } else {
              setIsRunning(false);
              setCompletedExercises(totalExercises);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isRunning, currentExerciseIndex]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!isRunning && timeRemaining === 60) {
      setTimeRemaining(allExercises[0]?.duracion || 30);
    }
    setIsRunning(!isRunning);
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(i => i - 1);
      setTimeRemaining(allExercises[currentExerciseIndex - 1]?.duracion || 30);
      if (completedExercises > 0) {
        setCompletedExercises(c => c - 1);
      }
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCompletedExercises(c => c + 1);
      setCurrentExerciseIndex(i => i + 1);
      setTimeRemaining(allExercises[currentExerciseIndex + 1]?.duracion || 30);
    }
  };

  let globalIndex = 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: rutina.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }} 
          style={styles.heroImage} 
        />
        <View style={styles.heroOverlay} />
        <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
          <View style={styles.heroTopBar}>
            <Pressable 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
            
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <Pressable 
                style={[styles.favoriteButton, esFavorito && styles.favoriteButtonActive]}
                onPress={handleToggleFavorito}
              >
                <Ionicons 
                  name={esFavorito ? "heart" : "heart-outline"} 
                  size={20} 
                  color={"#FFFFFF"} 
                />
              </Pressable>
            </Animated.View>
          </View>
          
          <View style={styles.videoInfo}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <View style={styles.videoControls}>
              <Pressable style={styles.controlButton} onPress={handlePrevious}>
                <Ionicons name="play-skip-back" size={18} color="#FFFFFF" />
              </Pressable>
              <Animated.View style={[
                styles.playButtonLarge, 
                { transform: [{ scale: isRunning ? 1 : pulseAnim }] }
              ]}>
                <Pressable style={styles.playButtonInner} onPress={handlePlayPause}>
                  <Ionicons 
                    name={isRunning ? "pause" : "play"} 
                    size={24} 
                    color="#000000" 
                    style={{ marginLeft: isRunning ? 0 : 2 }}
                  />
                </Pressable>
              </Animated.View>
              <Pressable style={styles.controlButton} onPress={handleNext}>
                <Ionicons name="play-skip-forward" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
            {isRunning && (
              <Text style={styles.currentExerciseLabel}>
                {allExercises[currentExerciseIndex]?.nombre}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[
          styles.workoutHeader,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <Text style={styles.workoutTitle}>{rutina.nombre}</Text>
          <Pressable onPress={() => navigation.navigate('Trainer', { trainerName: rutina.trainer })}>
            <Text style={styles.workoutTrainerLink}>con {rutina.trainer}</Text>
          </Pressable>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{rutina.duracion}</Text>
              <Text style={styles.statLabel}>Duración</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{rutina.nivel}</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="flame" size={18} color="#FF6B35" />
                <Text style={[styles.statValue, { marginLeft: 4, marginBottom: 0 }]}>Alto</Text>
              </View>
              <Text style={styles.statLabel}>Intensidad</Text>
            </View>
          </View>
          
          <Text style={styles.workoutDescription}>
            {rutina.descripcion || 'Un entrenamiento diseñado para maximizar tus resultados. Sigue las instrucciones y da lo mejor de ti.'}
          </Text>
        </Animated.View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tu Progreso</Text>
            <Text style={styles.progressCount}>{completedExercises}/{totalExercises} ejercicios</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedExercises / totalExercises) * 100}%` }]} />
          </View>
        </View>

        {Object.keys(ejerciciosData).map((seccion, sectionIndex) => (
          <View key={sectionIndex} style={styles.exerciseSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{seccion}</Text>
              <Text style={styles.sectionCount}>{ejerciciosData[seccion].length} ejercicios</Text>
            </View>
            
            {ejerciciosData[seccion].map((ejercicio, index) => {
              const isActive = globalIndex === currentExerciseIndex && isRunning;
              const cardElement = (
                <ExerciseCard 
                  key={index} 
                  item={ejercicio} 
                  index={index}
                  isActive={isActive}
                />
              );
              globalIndex++;
              return cardElement;
            })}
          </View>
        ))}

        <View style={styles.equipmentSection}>
          <Text style={styles.sectionTitle}>Equipamiento Necesario</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.equipmentScroll}
          >
            {[
              { icono: 'fitness', nombre: 'Colchoneta' },
              { icono: 'water', nombre: 'Agua' },
              { icono: 'musical-notes', nombre: 'Música' },
              { icono: 'timer', nombre: 'Cronómetro' },
            ].map((item, index) => (
              <View key={index} style={styles.equipmentItem}>
                <Ionicons name={item.icono} size={36} color="#000000" />
                <Text style={styles.equipmentName}>{item.nombre}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Consejos del Entrenador</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Mantén la Hidratación</Text>
              <Text style={styles.tipText}>
                Bebe agua antes, durante y después del entrenamiento para un rendimiento óptimo.
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="play" size={24} color="#007AFF" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Escucha a tu Cuerpo</Text>
              <Text style={styles.tipText}>
                Si sientes dolor, detente. Es mejor descansar que lesionarse.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.moreFromTrainer}>
          <View style={styles.moreHeader}>
            <Text style={styles.sectionTitle}>Más de {rutina.trainer?.split(' ')[0] || 'este entrenador'}</Text>
            <Pressable onPress={() => navigation.navigate('Trainer', { trainerName: rutina.trainer })}>
              <Text style={styles.viewAllText}>Ver todos →</Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moreWorkoutsScroll}
          >
            {[
              { nombre: 'Cardio Extremo', duracion: '20 min', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400' },
              { nombre: 'Core Power', duracion: '15 min', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
              { nombre: 'Full Body', duracion: '30 min', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
            ].map((item, index) => (
              <Pressable 
                key={index} 
                style={styles.miniWorkoutCard}
                onPress={() => navigation.push('Detalle', { 
                  rutina: { 
                    ...item, 
                    trainer: rutina.trainer, 
                    nivel: 'Intermedio',
                    descripcion: 'Otro gran entrenamiento de tu instructor favorito.',
                    calorias: '150-250',
                    icono: 'diamond'
                  } 
                })}
              >
                <Image source={{ uri: item.image }} style={styles.miniCardImage} />
                <View style={styles.miniCardOverlay} />
                <View style={styles.miniCardContent}>
                  <Text style={styles.miniCardTitle}>{item.nombre}</Text>
                  <Text style={styles.miniCardDuration}>{item.duracion}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.bottomCTA}>
        <Pressable 
          style={[styles.startWorkoutButton, isRunning && styles.startWorkoutButtonActive]}
          onPress={handlePlayPause}
        >
          <Text style={styles.startWorkoutText}>
            {isRunning ? 'Pausar Entrenamiento' : 'Comenzar Entrenamiento'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroSection: {
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
    paddingTop: 44,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(231, 76, 60, 0.6)',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 16,
  },
  currentExerciseLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(212, 255, 0, 0.25)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4FF00',
    overflow: 'hidden',
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D4FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconLarge: {
    fontSize: 28,
    color: '#000000',
    marginLeft: 2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25,
  },
  scrollContent: {
    paddingTop: 25,
    paddingBottom: 100,
  },
  workoutHeader: {
    paddingHorizontal: 24,
    marginBottom: 25,
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  workoutTrainer: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 20,
  },
  workoutTrainerLink: {
    fontSize: 15,
    color: '#007AFF',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  workoutDescription: {
    fontSize: 15,
    color: '#636366',
    lineHeight: 24,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  progressCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4FF00',
    borderRadius: 4,
  },
  exerciseSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    color: '#8E8E93',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 10,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
  },
  exerciseCardActive: {
    backgroundColor: '#D4FF00',
  },
  exerciseLeft: {
    width: 50,
    marginRight: 15,
  },
  exerciseDuration: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  exerciseDurationActive: {
    color: '#000000',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  exerciseNameActive: {
    color: '#000000',
  },
  exerciseMuscle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  exerciseMuscleActive: {
    color: 'rgba(0,0,0,0.6)',
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseIconActive: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  exerciseIconText: {
    fontSize: 20,
  },
  equipmentSection: {
    marginBottom: 25,
    paddingLeft: 24,
  },
  equipmentScroll: {
    paddingRight: 24,
    gap: 12,
    marginTop: 15,
  },
  equipmentItem: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 16,
  },
  equipmentIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  tipsSection: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#636366',
    lineHeight: 20,
  },
  moreFromTrainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  moreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  moreWorkoutsScroll: {
    gap: 12,
  },
  miniWorkoutCard: {
    width: 150,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  miniCardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  miniCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  miniCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  miniCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  miniCardDuration: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  startWorkoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  startWorkoutButtonActive: {
    backgroundColor: '#E74C3C',
  },
  startWorkoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
