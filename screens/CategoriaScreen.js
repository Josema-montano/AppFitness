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

const { width } = Dimensions.get('window');

// Datos por defecto (fallback)
const categoriasDataDefault = {
  'Por Grupo Muscular': {
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
          { nombre: 'Press de Banca', duracion: '25 min', nivel: 'Intermedio', trainer: 'Vladimir Lisarazu', descripcion: 'Desarrolla tu pecho', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', calorias: '150-200' },
        ]
      },
    ]
  },
  'Por Tipo de Entrenamiento': {
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
        ]
      },
    ]
  }
};

export default function CategoriaScreen({ route, navigation }) {
  const { categoria } = route.params;
  const { categoriasDB, dataLoaded } = useApp();
  
  // Usar datos de Firebase si están disponibles
  const categoriasData = dataLoaded && Object.keys(categoriasDB).length > 0 ? categoriasDB : categoriasDataDefault;
  const categoriaData = categoriasData[categoria] || categoriasDataDefault['Por Grupo Muscular'];
  
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  
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

  const SubcategoryCard = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ opacity: cardFade }}>
        <Pressable
          style={[
            styles.subcatCard,
            selectedSubcat === item.nombre && styles.subcatCardSelected
          ]}
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
          onPress={() => setSelectedSubcat(selectedSubcat === item.nombre ? null : item.nombre)}
        >
          <Image source={{ uri: item.imagen }} style={styles.subcatImage} />
          <View style={styles.subcatOverlay} />
          <View style={styles.subcatContent}>
            <Ionicons name={item.icono} size={24} color="#D4FF00" />
            <Text style={styles.subcatName}>{item.nombre}</Text>
            <Text style={styles.subcatCount}>{item.entrenamientos} entrenamientos</Text>
          </View>
          <Ionicons name={selectedSubcat === item.nombre ? "chevron-down" : "chevron-forward"} size={16} color="#666" />
        </Pressable>
        
        {/* Rutinas de la subcategoría */}
        {selectedSubcat === item.nombre && (
          <View style={styles.rutinasContainer}>
            {item.rutinas.map((rutina, idx) => (
              <Pressable
                key={idx}
                style={styles.rutinaCard}
                onPress={() => navigation.navigate('Detalle', { 
                  rutina: { ...rutina, icono: item.icono } 
                })}
              >
                <Image source={{ uri: rutina.image }} style={styles.rutinaImage} />
                <View style={styles.rutinaInfo}>
                  <Text style={styles.rutinaNombre}>{rutina.nombre}</Text>
                  <Text style={styles.rutinaDesc}>{rutina.descripcion}</Text>
                  <View style={styles.rutinaMeta}>
                    <Text style={styles.rutinaMetaText}>
                      <Ionicons name="time" size={12} color="#666" /> {rutina.duracion}
                    </Text>
                    <Text style={styles.rutinaMetaText}>
                      <Ionicons name="star" size={12} color="#666" /> {rutina.calorias} cal
                    </Text>
                  </View>
                  <Text style={styles.rutinaTrainer}>con {rutina.trainer}</Text>
                </View>
                <View style={styles.rutinaPlayBtn}>
                  <Ionicons name="play" size={12} color="#fff" />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <Image source={{ uri: categoriaData.imagen }} style={styles.heroImage} />
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
            <Text style={styles.heroTitle}>{categoriaData.titulo}</Text>
            <Text style={styles.heroSubtitle}>{categoriaData.subtitulo}</Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subcategorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona una opción</Text>
          <Text style={styles.sectionSubtitle}>
            {categoriaData.subcategorias.length} categorías disponibles
          </Text>
          
          {categoriaData.subcategorias.map((subcat, index) => (
            <SubcategoryCard key={index} item={subcat} index={index} />
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
    height: 200,
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
  heroTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    marginBottom: 20,
  },
  subcatCard: {
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcatCardSelected: {
    borderWidth: 2,
    borderColor: '#D4FF00',
  },
  subcatImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  subcatOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  subcatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    flex: 1,
  },
  subcatIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  subcatName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  subcatCount: {
    fontSize: 12,
    color: '#D4FF00',
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    paddingRight: 16,
  },
  rutinasContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 16,
    marginTop: -4,
    padding: 12,
  },
  rutinaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rutinaImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  rutinaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rutinaNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rutinaDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  rutinaMeta: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  rutinaMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  rutinaTrainer: {
    fontSize: 11,
    color: '#D4FF00',
    marginTop: 4,
  },
  rutinaPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rutinaPlayIcon: {
    fontSize: 12,
    color: '#000000',
    marginLeft: 2,
  },
});
