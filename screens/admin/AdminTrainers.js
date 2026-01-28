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

export default function AdminTrainers({ navigation }) {
  const { reloadData } = useApp();
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    imagen: '',
    bio: '',
    seguidores: '',
    entrenamientos: '',
    rating: '',
  });

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'trainers'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrainers(data);
    } catch (error) {
      console.log('Error loading trainers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (trainer) => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Eliminar Trainer',
        `¿Eliminar "${trainer.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => deleteTrainer(trainer.id) }
        ]
      );
    } else if (window.confirm(`¿Eliminar "${trainer.nombre}"?`)) {
      deleteTrainer(trainer.id);
    }
  };

  const deleteTrainer = async (id) => {
    try {
      await deleteDoc(doc(db, 'trainers', id));
      setTrainers(prev => prev.filter(t => t.id !== id));
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openModal = (trainer = null) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        nombre: trainer.nombre || '',
        especialidad: trainer.especialidad || '',
        imagen: trainer.imagen || '',
        bio: trainer.bio || '',
        seguidores: trainer.seguidores || '',
        entrenamientos: String(trainer.entrenamientos || ''),
        rating: String(trainer.rating || ''),
      });
    } else {
      setEditingTrainer(null);
      setFormData({
        nombre: '',
        especialidad: '',
        imagen: '',
        bio: '',
        seguidores: '',
        entrenamientos: '',
        rating: '',
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
      const trainerData = {
        nombre: formData.nombre,
        especialidad: formData.especialidad,
        imagen: formData.imagen,
        bio: formData.bio,
        seguidores: formData.seguidores,
        entrenamientos: parseInt(formData.entrenamientos) || 0,
        rating: parseFloat(formData.rating) || 0,
      };

      if (editingTrainer) {
        await updateDoc(doc(db, 'trainers', editingTrainer.id), trainerData);
        setTrainers(prev => prev.map(t => t.id === editingTrainer.id ? { ...t, ...trainerData } : t));
      } else {
        const newId = `trainer${Date.now()}`;
        await setDoc(doc(db, 'trainers', newId), { id: newId, ...trainerData });
        setTrainers(prev => [...prev, { id: newId, ...trainerData }]);
      }

      setModalVisible(false);
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filteredTrainers = trainers.filter(t => 
    t.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.especialidad?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Trainers</Text>
        <Pressable onPress={() => openModal()} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#D4FF00" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar trainers..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#D4FF00" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>{filteredTrainers.length} trainers</Text>
          
          {filteredTrainers.map((trainer) => (
            <View key={trainer.id} style={styles.itemCard}>
              {trainer.imagen ? (
                <Image source={{ uri: trainer.imagen }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color="#666" />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{trainer.nombre}</Text>
                <Text style={styles.itemMeta}>{trainer.especialidad}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.statText}>{trainer.rating}</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="people" size={12} color="#A78BFA" />
                    <Text style={styles.statText}>{trainer.seguidores}</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="barbell" size={12} color="#4ECDC4" />
                    <Text style={styles.statText}>{trainer.entrenamientos}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Pressable onPress={() => openModal(trainer)} style={styles.editBtn}>
                  <Ionicons name="pencil" size={18} color="#4ECDC4" />
                </Pressable>
                <Pressable onPress={() => handleDelete(trainer)} style={styles.deleteBtn}>
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
                {editingTrainer ? 'Editar Trainer' : 'Nuevo Trainer'}
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
                placeholder="Nombre del trainer"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Especialidad</Text>
              <TextInput
                style={styles.input}
                value={formData.especialidad}
                onChangeText={(text) => setFormData(prev => ({ ...prev, especialidad: text }))}
                placeholder="ej: Yoga & Flexibilidad"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.imagen}
                onChangeText={(text) => setFormData(prev => ({ ...prev, imagen: text }))}
                placeholder="https://..."
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Biografía</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Descripción del trainer"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Seguidores</Text>
              <TextInput
                style={styles.input}
                value={formData.seguidores}
                onChangeText={(text) => setFormData(prev => ({ ...prev, seguidores: text }))}
                placeholder="ej: 125K"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Entrenamientos</Text>
              <TextInput
                style={styles.input}
                value={formData.entrenamientos}
                onChangeText={(text) => setFormData(prev => ({ ...prev, entrenamientos: text }))}
                placeholder="Número de entrenamientos"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Rating</Text>
              <TextInput
                style={styles.input}
                value={formData.rating}
                onChangeText={(text) => setFormData(prev => ({ ...prev, rating: text }))}
                placeholder="ej: 4.9"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
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
    color: '#D4FF00',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#0a0a0a',
    borderRadius: 6,
  },
  statText: {
    fontSize: 11,
    color: '#888',
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
    height: 100,
    textAlignVertical: 'top',
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
