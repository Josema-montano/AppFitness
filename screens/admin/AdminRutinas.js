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
  Modal,
  Image
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useApp } from '../../context/AppContext';

export default function AdminRutinas({ navigation }) {
  const { reloadData } = useApp();
  const [rutinas, setRutinas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRutina, setEditingRutina] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    duracion: '',
    nivel: 'Principiante',
    categoria: 'Cardio',
    trainer: '',
    descripcion: '',
    image: '',
    calorias: '',
  });

  useEffect(() => {
    loadRutinas();
  }, []);

  const loadRutinas = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'rutinas'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRutinas(data);
    } catch (error) {
      console.log('Error loading rutinas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (rutina) => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Eliminar Rutina',
        `¿Eliminar "${rutina.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => deleteRutina(rutina.id) }
        ]
      );
    } else if (window.confirm(`¿Eliminar "${rutina.nombre}"?`)) {
      deleteRutina(rutina.id);
    }
  };

  const deleteRutina = async (id) => {
    try {
      await deleteDoc(doc(db, 'rutinas', id));
      setRutinas(prev => prev.filter(r => r.id !== id));
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openModal = (rutina = null) => {
    if (rutina) {
      setEditingRutina(rutina);
      setFormData({
        nombre: rutina.nombre || '',
        duracion: rutina.duracion || '',
        nivel: rutina.nivel || 'Principiante',
        categoria: rutina.categoria || 'Cardio',
        trainer: rutina.trainer || '',
        descripcion: rutina.descripcion || '',
        image: rutina.image || '',
        calorias: rutina.calorias || '',
      });
    } else {
      setEditingRutina(null);
      setFormData({
        nombre: '',
        duracion: '',
        nivel: 'Principiante',
        categoria: 'Cardio',
        trainer: '',
        descripcion: '',
        image: '',
        calorias: '',
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
      const rutinaData = {
        ...formData,
        destacada: false,
        topPick: false,
      };

      if (editingRutina) {
        await updateDoc(doc(db, 'rutinas', editingRutina.id), rutinaData);
        setRutinas(prev => prev.map(r => r.id === editingRutina.id ? { ...r, ...rutinaData } : r));
      } else {
        const newId = `r${Date.now()}`;
        await setDoc(doc(db, 'rutinas', newId), { id: newId, ...rutinaData });
        setRutinas(prev => [...prev, { id: newId, ...rutinaData }]);
      }

      setModalVisible(false);
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filteredRutinas = rutinas.filter(r => 
    r.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const niveles = ['Principiante', 'Intermedio', 'Avanzado'];
  const categorias = ['Cardio', 'Fuerza', 'Flexibilidad', 'HIIT', 'Core', 'Yoga'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Rutinas</Text>
        <Pressable onPress={() => openModal()} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#D4FF00" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rutinas..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#D4FF00" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>{filteredRutinas.length} rutinas</Text>
          
          {filteredRutinas.map((rutina) => (
            <View key={rutina.id} style={styles.itemCard}>
              {rutina.image && (
                <Image source={{ uri: rutina.image }} style={styles.itemImage} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{rutina.nombre}</Text>
                <Text style={styles.itemMeta}>
                  {rutina.duracion} • {rutina.nivel} • {rutina.categoria}
                </Text>
                <Text style={styles.itemTrainer}>{rutina.trainer}</Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable onPress={() => openModal(rutina)} style={styles.editBtn}>
                  <Ionicons name="pencil" size={18} color="#4ECDC4" />
                </Pressable>
                <Pressable onPress={() => handleDelete(rutina)} style={styles.deleteBtn}>
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
                {editingRutina ? 'Editar Rutina' : 'Nueva Rutina'}
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
                placeholder="Nombre de la rutina"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Duración</Text>
              <TextInput
                style={styles.input}
                value={formData.duracion}
                onChangeText={(text) => setFormData(prev => ({ ...prev, duracion: text }))}
                placeholder="ej: 30 min"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Nivel</Text>
              <View style={styles.optionsRow}>
                {niveles.map((nivel) => (
                  <Pressable
                    key={nivel}
                    style={[styles.optionBtn, formData.nivel === nivel && styles.optionBtnActive]}
                    onPress={() => setFormData(prev => ({ ...prev, nivel }))}
                  >
                    <Text style={[styles.optionText, formData.nivel === nivel && styles.optionTextActive]}>
                      {nivel}
                    </Text>
                  </Pressable>
                ))}
              </View>

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

              <Text style={styles.inputLabel}>Trainer</Text>
              <TextInput
                style={styles.input}
                value={formData.trainer}
                onChangeText={(text) => setFormData(prev => ({ ...prev, trainer: text }))}
                placeholder="Nombre del trainer"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
                placeholder="Descripción de la rutina"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => setFormData(prev => ({ ...prev, image: text }))}
                placeholder="https://..."
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Calorías</Text>
              <TextInput
                style={styles.input}
                value={formData.calorias}
                onChangeText={(text) => setFormData(prev => ({ ...prev, calorias: text }))}
                placeholder="ej: 150-200"
                placeholderTextColor="#666"
              />

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
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
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
  itemTrainer: {
    fontSize: 12,
    color: '#D4FF00',
    marginTop: 2,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
