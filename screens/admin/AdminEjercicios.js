import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Modal
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useApp } from '../../context/AppContext';

export default function AdminEjercicios({ navigation }) {
  const { reloadData } = useApp();
  const [ejercicios, setEjercicios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEjercicio, setEditingEjercicio] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    duracion: '30',
    musculo: '',
    icono: 'fitness',
    calorias: '',
    categoria: 'Cardio',
  });

  useEffect(() => {
    loadEjercicios();
  }, []);

  const loadEjercicios = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'ejercicios'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEjercicios(data);
    } catch (error) {
      console.log('Error loading ejercicios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (ejercicio) => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Eliminar Ejercicio',
        `¿Eliminar "${ejercicio.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => deleteEjercicio(ejercicio.id) }
        ]
      );
    } else if (window.confirm(`¿Eliminar "${ejercicio.nombre}"?`)) {
      deleteEjercicio(ejercicio.id);
    }
  };

  const deleteEjercicio = async (id) => {
    try {
      await deleteDoc(doc(db, 'ejercicios', id));
      setEjercicios(prev => prev.filter(e => e.id !== id));
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openModal = (ejercicio = null) => {
    if (ejercicio) {
      setEditingEjercicio(ejercicio);
      setFormData({
        nombre: ejercicio.nombre || '',
        duracion: String(ejercicio.duracion || 30),
        musculo: ejercicio.musculo || '',
        icono: ejercicio.icono || 'fitness',
        calorias: String(ejercicio.calorias || ''),
        categoria: ejercicio.categoria || 'Cardio',
      });
    } else {
      setEditingEjercicio(null);
      setFormData({
        nombre: '',
        duracion: '30',
        musculo: '',
        icono: 'fitness',
        calorias: '',
        categoria: 'Cardio',
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      const ejercicioData = {
        nombre: formData.nombre,
        duracion: parseInt(formData.duracion) || 30,
        musculo: formData.musculo,
        icono: formData.icono,
        calorias: parseInt(formData.calorias) || 0,
        categoria: formData.categoria,
      };

      if (editingEjercicio) {
        await updateDoc(doc(db, 'ejercicios', editingEjercicio.id), ejercicioData);
        setEjercicios(prev => prev.map(e => e.id === editingEjercicio.id ? { ...e, ...ejercicioData } : e));
      } else {
        const newId = `e${Date.now()}`;
        await setDoc(doc(db, 'ejercicios', newId), { id: newId, ...ejercicioData });
        setEjercicios(prev => [...prev, { id: newId, ...ejercicioData }]);
      }

      setModalVisible(false);
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filteredEjercicios = ejercicios.filter(e => 
    e.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.musculo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorias = ['Cardio', 'Fuerza', 'Flexibilidad', 'Core'];
  const iconos = ['fitness', 'barbell', 'walk', 'body', 'flash', 'diamond', 'flame', 'bicycle'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Ejercicios</Text>
        <Pressable onPress={() => openModal()} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#D4FF00" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicios..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#D4FF00" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>{filteredEjercicios.length} ejercicios</Text>
          
          {filteredEjercicios.map((ejercicio) => (
            <View key={ejercicio.id} style={styles.itemCard}>
              <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(ejercicio.categoria) + '20' }]}>
                <Ionicons name={ejercicio.icono || 'fitness'} size={24} color={getCategoryColor(ejercicio.categoria)} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{ejercicio.nombre}</Text>
                <Text style={styles.itemMeta}>
                  {ejercicio.duracion}s • {ejercicio.musculo} • {ejercicio.calorias} cal
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(ejercicio.categoria) + '20' }]}>
                  <Text style={[styles.categoryText, { color: getCategoryColor(ejercicio.categoria) }]}>
                    {ejercicio.categoria}
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Pressable onPress={() => openModal(ejercicio)} style={styles.editBtn}>
                  <Ionicons name="pencil" size={18} color="#4ECDC4" />
                </Pressable>
                <Pressable onPress={() => handleDelete(ejercicio)} style={styles.deleteBtn}>
                  <Ionicons name="trash" size={18} color="#FF6B6B" />
                </Pressable>
              </View>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Modal para crear/editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEjercicio ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                placeholder="Nombre del ejercicio"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Duración (segundos)</Text>
              <TextInput
                style={styles.input}
                value={formData.duracion}
                onChangeText={(text) => setFormData(prev => ({ ...prev, duracion: text }))}
                placeholder="30"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Músculo</Text>
              <TextInput
                style={styles.input}
                value={formData.musculo}
                onChangeText={(text) => setFormData(prev => ({ ...prev, musculo: text }))}
                placeholder="ej: Piernas, Core, Pecho..."
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Calorías</Text>
              <TextInput
                style={styles.input}
                value={formData.calorias}
                onChangeText={(text) => setFormData(prev => ({ ...prev, calorias: text }))}
                placeholder="Calorías quemadas"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Categoría</Text>
              <View style={styles.optionsRow}>
                {categorias.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.optionBtn, formData.categoria === cat && styles.optionBtnActive]}
                    onPress={() => setFormData(prev => ({ ...prev, categoria: cat }))}
                  >
                    <Text style={[styles.optionText, formData.categoria === cat && styles.optionTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Icono</Text>
              <View style={styles.optionsRow}>
                {iconos.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[styles.iconOption, formData.icono === icon && styles.iconOptionActive]}
                    onPress={() => setFormData(prev => ({ ...prev, icono: icon }))}
                  >
                    <Ionicons name={icon} size={20} color={formData.icono === icon ? '#000' : '#888'} />
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getCategoryColor = (category) => {
  const colors = {
    'Cardio': '#FF6B6B',
    'Fuerza': '#4ECDC4',
    'Flexibilidad': '#A78BFA',
    'Core': '#F59E0B',
  };
  return colors[category] || '#888';
};

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
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backBtn: {
    padding: 4,
  },
  addBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    margin: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  countText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  itemMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#4ECDC420',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FF6B6B20',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionBtnActive: {
    backgroundColor: '#D4FF00',
    borderColor: '#D4FF00',
  },
  optionText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#000',
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: {
    backgroundColor: '#D4FF00',
    borderColor: '#D4FF00',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#D4FF00',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
