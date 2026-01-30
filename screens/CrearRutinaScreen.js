import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  ScrollView,
  Animated,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function CrearRutinaScreen({ navigation }) {
  const { crearRutina, user, ejerciciosDisponibles } = useApp();
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [nivel, setNivel] = useState('Intermedio');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Cardio');
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const niveles = ['Principiante', 'Intermedio', 'Avanzado'];
  const categorias = Object.keys(ejerciciosDisponibles || {});

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

  const calcularDuracion = () => {
    const totalSegundos = ejerciciosSeleccionados.reduce((acc, ej) => acc + ej.duracion, 0);
    return Math.ceil(totalSegundos / 60);
  };

  const calcularCalorias = () => {
    return ejerciciosSeleccionados.reduce((acc, ej) => acc + ej.calorias, 0);
  };

  const agregarEjercicio = (ejercicio) => {
    const ejercicioConOrden = {
      ...ejercicio,
      orden: ejerciciosSeleccionados.length,
      key: `${ejercicio.id}_${Date.now()}`,
    };
    setEjerciciosSeleccionados([...ejerciciosSeleccionados, ejercicioConOrden]);
  };

  const eliminarEjercicio = (key) => {
    setEjerciciosSeleccionados(ejerciciosSeleccionados.filter(ej => ej.key !== key));
  };

  const moverEjercicio = (index, direction) => {
    const newList = [...ejerciciosSeleccionados];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newList.length) {
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
      setEjerciciosSeleccionados(newList);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la rutina');
      return;
    }
    if (ejerciciosSeleccionados.length === 0) {
      Alert.alert('Error', 'Agrega al menos un ejercicio');
      return;
    }

    const nuevaRutina = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || `Rutina personalizada de ${nombre}`,
      nivel,
      duracion: `${calcularDuracion()} min`,
      calorias: `${calcularCalorias()}-${calcularCalorias() + 50}`,
      ejercicios: ejerciciosSeleccionados,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      icono: 'barbell',
    };

    try {
      await crearRutina(nuevaRutina);
      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la rutina');
    }
  };

  const EjercicioItem = ({ ejercicio, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={[styles.ejercicioItem, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.ejercicioOrden}>
          <Text style={styles.ordenText}>{index + 1}</Text>
        </View>
        <View style={styles.ejercicioInfo}>
          <Text style={styles.ejercicioNombre}>{ejercicio.nombre}</Text>
          <Text style={styles.ejercicioMeta}>
            {ejercicio.duracion}s · {ejercicio.musculo} · {ejercicio.calorias} cal
          </Text>
        </View>
        <View style={styles.ejercicioActions}>
          <Pressable 
            style={styles.moveButton}
            onPress={() => moverEjercicio(index, -1)}
            disabled={index === 0}
          >
            <Text style={[styles.moveIcon, index === 0 && styles.moveIconDisabled]}>↑</Text>
          </Pressable>
          <Pressable 
            style={styles.moveButton}
            onPress={() => moverEjercicio(index, 1)}
            disabled={index === ejerciciosSeleccionados.length - 1}
          >
            <Text style={[styles.moveIcon, index === ejerciciosSeleccionados.length - 1 && styles.moveIconDisabled]}>↓</Text>
          </Pressable>
          <Pressable 
            style={styles.deleteButton}
            onPress={() => eliminarEjercicio(ejercicio.key)}
          >
            <Text style={styles.deleteIcon}>×</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Crear Rutina</Text>
        <Pressable 
          style={styles.saveButton}
          onPress={handleGuardar}
        >
          <Text style={styles.saveText}>Guardar</Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info básica */}
        <Animated.View style={[
          styles.section,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de la rutina</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Mi rutina de cardio"
              placeholderTextColor="#8E8E93"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe tu rutina..."
              placeholderTextColor="#8E8E93"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nivel de dificultad</Text>
            <View style={styles.nivelSelector}>
              {niveles.map((n) => (
                <Pressable
                  key={n}
                  style={[
                    styles.nivelButton,
                    nivel === n && styles.nivelButtonActive
                  ]}
                  onPress={() => setNivel(n)}
                >
                  <Text style={[
                    styles.nivelText,
                    nivel === n && styles.nivelTextActive
                  ]}>{n}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Stats Preview */}
        {ejerciciosSeleccionados.length > 0 && (
          <View style={styles.statsPreview}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{calcularDuracion()}</Text>
              <Text style={styles.statLabel}>minutos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{ejerciciosSeleccionados.length}</Text>
              <Text style={styles.statLabel}>ejercicios</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{calcularCalorias()}</Text>
              <Text style={styles.statLabel}>calorías</Text>
            </View>
          </View>
        )}

        {/* Ejercicios seleccionados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ejercicios</Text>
            <Pressable 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Añadir</Text>
            </Pressable>
          </View>

          {ejerciciosSeleccionados.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>Sin ejercicios</Text>
              <Text style={styles.emptyText}>
                Pulsa "Añadir" para agregar ejercicios a tu rutina
              </Text>
            </View>
          ) : (
            <View style={styles.ejerciciosList}>
              {ejerciciosSeleccionados.map((ejercicio, index) => (
                <EjercicioItem key={ejercicio.key} ejercicio={ejercicio} index={index} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal para añadir ejercicios */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Ejercicio</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            {/* Categorías */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriasScroll}
            >
              {categorias.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoriaChip,
                    categoriaSeleccionada === cat && styles.categoriaChipActive
                  ]}
                  onPress={() => setCategoriaSeleccionada(cat)}
                >
                  <Text style={[
                    styles.categoriaChipText,
                    categoriaSeleccionada === cat && styles.categoriaChipTextActive
                  ]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Lista de ejercicios */}
            <ScrollView style={styles.modalScroll}>
              {ejerciciosDisponibles[categoriaSeleccionada].map((ejercicio) => (
                <Pressable
                  key={ejercicio.id}
                  style={styles.ejercicioOption}
                  onPress={() => agregarEjercicio(ejercicio)}
                >
                  <View style={styles.ejercicioOptionIcon}>
                    <Ionicons name={ejercicio.icono} size={24} color="#D4FF00" />
                  </View>
                  <View style={styles.ejercicioOptionInfo}>
                    <Text style={styles.ejercicioOptionNombre}>{ejercicio.nombre}</Text>
                    <Text style={styles.ejercicioOptionMeta}>
                      {ejercicio.duracion}s · {ejercicio.musculo} · {ejercicio.calorias} cal
                    </Text>
                  </View>
                  <View style={styles.addIconContainer}>
                    <Text style={styles.addIconText}>+</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable 
              style={styles.modalDoneButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalDoneText}>
                Listo ({ejerciciosSeleccionados.length} ejercicios)
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal de éxito */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#D4FF00" />
            </View>
            <Text style={styles.successTitle}>¡Rutina creada!</Text>
            <Text style={styles.successMessage}>Tu rutina ha sido guardada exitosamente</Text>
            <Pressable 
              style={styles.successButton}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.getParent()?.navigate('Explorar');
              }}
            >
              <Text style={styles.successButtonText}>Ver mis rutinas</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#D4FF00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  nivelSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  nivelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  nivelButtonActive: {
    backgroundColor: 'rgba(212, 255, 0, 0.2)',
    borderColor: '#D4FF00',
  },
  nivelText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  nivelTextActive: {
    color: '#D4FF00',
  },
  statsPreview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 255, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(212, 255, 0, 0.3)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4FF00',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4FF00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ejerciciosList: {
    gap: 10,
  },
  ejercicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  ejercicioOrden: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4FF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ordenText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  ejercicioInfo: {
    flex: 1,
  },
  ejercicioNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ejercicioMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  ejercicioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moveButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  moveIconDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
    color: '#E74C3C',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  categoriasScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  categoriaChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaChipActive: {
    backgroundColor: '#D4FF00',
    borderColor: '#D4FF00',
    shadowColor: '#D4FF00',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  categoriaChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'capitalize',
  },
  categoriaChipTextActive: {
    color: '#000000',
  },
  modalScroll: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  ejercicioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  ejercicioOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  ejercicioIconText: {
    fontSize: 22,
  },
  ejercicioOptionInfo: {
    flex: 1,
  },
  ejercicioOptionNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ejercicioOptionMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 255, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    fontSize: 20,
    color: '#D4FF00',
    fontWeight: '600',
  },
  modalDoneButton: {
    backgroundColor: '#D4FF00',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#D4FF00',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
