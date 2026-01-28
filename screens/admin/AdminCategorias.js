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

export default function AdminCategorias({ navigation }) {
  const { reloadData } = useApp();
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    titulo: '',
    subtitulo: '',
    imagen: '',
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'categorias'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategorias(data);
    } catch (error) {
      console.log('Error loading categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (categoria) => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Eliminar Categoría',
        `¿Eliminar "${categoria.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => deleteCategoria(categoria.id) }
        ]
      );
    } else if (window.confirm(`¿Eliminar "${categoria.nombre}"?`)) {
      deleteCategoria(categoria.id);
    }
  };

  const deleteCategoria = async (id) => {
    try {
      await deleteDoc(doc(db, 'categorias', id));
      setCategorias(prev => prev.filter(c => c.id !== id));
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre || '',
        titulo: categoria.titulo || '',
        subtitulo: categoria.subtitulo || '',
        imagen: categoria.imagen || '',
      });
    } else {
      setEditingCategoria(null);
      setFormData({
        nombre: '',
        titulo: '',
        subtitulo: '',
        imagen: '',
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
      const categoriaData = {
        nombre: formData.nombre,
        titulo: formData.titulo || formData.nombre,
        subtitulo: formData.subtitulo,
        imagen: formData.imagen,
        subcategorias: editingCategoria?.subcategorias || [],
      };

      if (editingCategoria) {
        await updateDoc(doc(db, 'categorias', editingCategoria.id), categoriaData);
        setCategorias(prev => prev.map(c => c.id === editingCategoria.id ? { ...c, ...categoriaData } : c));
      } else {
        const newId = `cat${Date.now()}`;
        await setDoc(doc(db, 'categorias', newId), { id: newId, ...categoriaData });
        setCategorias(prev => [...prev, { id: newId, ...categoriaData }]);
      }

      setModalVisible(false);
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Categorías</Text>
        <Pressable onPress={() => openModal()} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#D4FF00" />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#D4FF00" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>{categorias.length} categorías</Text>
          
          {categorias.map((categoria) => (
            <View key={categoria.id} style={styles.itemCard}>
              {categoria.imagen ? (
                <Image source={{ uri: categoria.imagen }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                  <Ionicons name="folder" size={24} color="#666" />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{categoria.nombre}</Text>
                <Text style={styles.itemMeta}>{categoria.subtitulo}</Text>
                <View style={styles.subcatCount}>
                  <Ionicons name="layers" size={12} color="#D4FF00" />
                  <Text style={styles.subcatText}>
                    {categoria.subcategorias?.length || 0} subcategorías
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Pressable onPress={() => openModal(categoria)} style={styles.editBtn}>
                  <Ionicons name="pencil" size={18} color="#4ECDC4" />
                </Pressable>
                <Pressable onPress={() => handleDelete(categoria)} style={styles.deleteBtn}>
                  <Ionicons name="trash" size={18} color="#FF6B6B" />
                </Pressable>
              </View>
            </View>
          ))}

          {/* Sección de Browse Categories */}
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <BrowseCategoriesSection reloadData={reloadData} />

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
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
                placeholder="Nombre de la categoría"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.input}
                value={formData.titulo}
                onChangeText={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
                placeholder="Título a mostrar"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Subtítulo</Text>
              <TextInput
                style={styles.input}
                value={formData.subtitulo}
                onChangeText={(text) => setFormData(prev => ({ ...prev, subtitulo: text }))}
                placeholder="Descripción breve"
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

// Componente para gestionar Browse Categories
function BrowseCategoriesSection({ reloadData }) {
  const [browseCategories, setBrowseCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBrowseCategories();
  }, []);

  const loadBrowseCategories = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'browseCategories'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrowseCategories(data);
    } catch (error) {
      console.log('Error loading browse categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (item) => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Eliminar',
        `¿Eliminar "${item.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => deleteItem(item.id) }
        ]
      );
    } else if (window.confirm(`¿Eliminar "${item.nombre}"?`)) {
      deleteItem(item.id);
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'browseCategories', id));
      setBrowseCategories(prev => prev.filter(c => c.id !== id));
      await reloadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return <ActivityIndicator color="#D4FF00" size="small" style={{ marginTop: 20 }} />;
  }

  return (
    <>
      {browseCategories.map((item) => (
        <View key={item.id} style={styles.browseItem}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.browseImage} />
          ) : (
            <View style={[styles.browseImage, styles.imagePlaceholder]}>
              <Ionicons name="images" size={20} color="#666" />
            </View>
          )}
          <Text style={styles.browseName}>{item.nombre}</Text>
          <Pressable onPress={() => handleDelete(item)} style={styles.deleteBtn}>
            <Ionicons name="trash" size={16} color="#FF6B6B" />
          </Pressable>
        </View>
      ))}
    </>
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
  content: {
    flex: 1,
    padding: 20,
  },
  countText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  imagePlaceholder: {
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
    color: '#888',
    marginTop: 2,
  },
  subcatCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  subcatText: {
    fontSize: 12,
    color: '#D4FF00',
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
  browseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  browseImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  browseName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 12,
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
